// src/services/fortyGuardService.ts
// Official FortyGuard API integration.
// API Key: read from import.meta.env.VITE_FORTYGUARD_API_KEY (set in .env, never committed).
// Pattern: POST endpoint → activity_id → poll GET /v1/status/{id} → Completed → normalize.

import axios, { AxiosError } from 'axios';
import type { EnvParamsResult, HeatmapResult, FortyGuardTaskResult } from '../types';
import { cacheService } from './cacheService';

const BASE_URL = 'https://api.fortyguard.com/v1';
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 120_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_FORTYGUARD_API_KEY as string | undefined;
  if (!key) throw new Error('FortyGuard API key not configured. Check .env file.');
  return key;
}

function buildHeaders() {
  return {
    'api-key': getApiKey(),
    'Content-Type': 'application/json',
  };
}

function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
  return `${namespace}:${JSON.stringify(params)}`;
}

// ─── Polling ─────────────────────────────────────────────────────────────────

interface StatusResponse {
  error: boolean;
  status_code: number;
  message: string;
  data?: {
    activity_id: string;
    status: string;
    result?: any;
    map_data?: any;
    stats_data?: any;
  };
}

async function pollTaskStatus(activityId: string): Promise<StatusResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise(res => setTimeout(res, POLL_INTERVAL_MS));

    const res = await axios.get<StatusResponse>(
      `${BASE_URL}/status/${activityId}`,
      { headers: buildHeaders() }
    );

    const statusObj = res.data?.data;
    const normalized = (statusObj?.status || res.data?.message || '').toLowerCase();
    
    if (normalized === 'completed') return res.data;
    if (normalized === 'failed') {
      throw new Error(`FortyGuard task ${activityId} failed: ${res.data.message ?? 'unknown error'}`);
    }
    // Processing — keep polling
  }

  throw new Error(`FortyGuard task ${activityId} timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

// ─── Task Submission ──────────────────────────────────────────────────────────

interface ActivityResponse {
  data: { activity_id: string };
}

async function submitTask<T>(endpoint: string, payload: T): Promise<string> {
  try {
    const res = await axios.post<ActivityResponse>(
      `${BASE_URL}/${endpoint}`,
      payload,
      { headers: buildHeaders() }
    );
    const activityId = res.data?.data?.activity_id;
    if (!activityId) throw new Error(`FortyGuard ${endpoint}: no activity_id in response`);
    return activityId;

  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const msg = (err.response?.data as { message?: string })?.message ?? err.message;
      if (status === 401) throw new Error('FortyGuard: Invalid or missing API key (401)');
      if (status === 403) throw new Error('FortyGuard: Access forbidden — check API key permissions (403)');
      if (status === 422) throw new Error(`FortyGuard: Invalid request payload (422): ${msg}`);
      if (status === 429) throw new Error('FortyGuard: Rate limit exceeded (429) — please wait and retry');
      throw new Error(`FortyGuard API error ${status}: ${msg}`);
    }
    throw err;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch environmental parameters for Phoenix Logistics Hub.
 * filter_type=2: range of hours (startTime → endTime on start_date)
 */
export async function fetchEnvParams(
  lat: number,
  lng: number,
  date: string,
  startTime: string,
  endTime: string,
): Promise<FortyGuardTaskResult> {
  const cacheKey = buildCacheKey('env_params', { lat, lng, date, startTime, endTime });

  const cached = cacheService.get<FortyGuardTaskResult>(cacheKey);
  if (cached) return cached;

  return cacheService.dedup<FortyGuardTaskResult>(cacheKey, async () => {
    const requestedAt = new Date().toISOString();

    const payload = {
      latitude: lat,
      longitude: lng,
      temperature: 35, // Required by API
      date_time: {
        start_date: date,
        start_time: startTime,
        end_time: endTime,
        filter_type: 2 as const,
      },
      analysis: [
        'heat_index_celsius',
        'wet_bulb_temperature_celsius',
        'relative_humidity_percent',
      ],
    };

    let activityId: string;
    try {
      activityId = await submitTask('env_params', payload);
    } catch (err) {
      return {
        activityId: 'unknown',
        status: 'failed' as const,
        error: err instanceof Error ? err.message : String(err),
        requestedAt,
      };
    }

    try {
      const statusData = await pollTaskStatus(activityId);
      const raw = statusData.data?.result ?? {};
      const metadata = raw.metadata ?? {};
      const loc = raw.locations?.[0] ?? {};
      const params = loc.parameters ?? {};

      const envResult: EnvParamsResult = {
        type: 'env_params',
        latitude: lat,
        longitude: lng,
        timezone: metadata.timezone,
        timestamps: metadata.timestamps ?? [],
        heat_index_celsius: params.heat_index_celsius ?? [],
        wet_bulb_temperature_celsius: params.wet_bulb_temperature_celsius ?? [],
        relative_humidity_percent: params.relative_humidity_percent ?? [],
        apparent_temperature_celsius: params.apparent_temperature_celsius ?? [],
        temperature_celsius: Array(metadata.timestamps?.length || 0).fill(loc.temperature || 35),
      };

      const result: FortyGuardTaskResult = {
        activityId,
        status: 'completed',
        data: envResult,
        requestedAt,
        completedAt: new Date().toISOString(),
      };

      cacheService.set(cacheKey, result, 10 * 60 * 1000);
      return result;

    } catch (err) {
      return {
        activityId,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : String(err),
        requestedAt,
      };
    }
  });
}

/**
 * Generate a heatmap for Phoenix Logistics Hub polygon.
 * filter_type=1: single hour snapshot.
 */
export async function fetchHeatmap(
  polygonAoi: GeoJSON.FeatureCollection,
  date: string,
  startTime: string,
): Promise<FortyGuardTaskResult> {
  const cacheKey = buildCacheKey('heatmap', { date, startTime });

  const cached = cacheService.get<FortyGuardTaskResult>(cacheKey);
  if (cached) return cached;

  return cacheService.dedup<FortyGuardTaskResult>(cacheKey, async () => {
    const requestedAt = new Date().toISOString();

    const payload = {
      polygon_aoi: polygonAoi,
      date_time: {
        start_date: date,
        start_time: startTime,
        filter_type: 1 as const,
      },
      granularity: 100,
    };

    let activityId: string;
    try {
      activityId = await submitTask('heatmap', payload);
    } catch (err) {
      return {
        activityId: 'unknown',
        status: 'failed' as const,
        error: err instanceof Error ? err.message : String(err),
        requestedAt,
      };
    }

    try {
      const statusData = await pollTaskStatus(activityId);
      const raw = statusData.data ?? {};

      const result: FortyGuardTaskResult = {
        activityId,
        status: 'completed',
        data: {
          type: 'heatmap',
          map_data: raw.map_data as GeoJSON.FeatureCollection | undefined,
          stats_data: raw.stats_data as HeatmapResult['stats_data'],
        },
        requestedAt,
        completedAt: new Date().toISOString(),
      };

      cacheService.set(cacheKey, result, 10 * 60 * 1000);
      return result;

    } catch (err) {
      return {
        activityId,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : String(err),
        requestedAt,
      };
    }
  });
}
