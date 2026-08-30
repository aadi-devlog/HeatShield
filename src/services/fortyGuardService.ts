// src/services/fortyGuardService.ts
// Official FortyGuard API integration via Vercel Serverless Function.
// API Key is ONLY configured server-side (FORTYGUARD_API_KEY).
// Pattern: Frontend calls /api/fortyguard -> Vercel handles async polling -> returns final data.

import axios, { AxiosError } from 'axios';
import type { EnvParamsResult, HeatmapResult, FortyGuardTaskResult } from '../types';
import { cacheService } from './cacheService';

// We call the local or Vercel deployed endpoint
const PROXY_URL = '/api/fortyguard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
  return `${namespace}:${JSON.stringify(params)}`;
}

// ─── Task Submission ──────────────────────────────────────────────────────────

async function submitAndPoll<T>(endpoint: string, payload: T): Promise<{ activityId: string; data: any }> {
  try {
    const res = await axios.post(PROXY_URL, {
      endpoint,
      payload
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.data;

  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const msg = (err.response?.data as { error?: string; details?: any })?.error ?? err.message;
      if (status === 401 || status === 403) throw new Error('Backend Authorization Failed (check Vercel API key)');
      if (status === 429) throw new Error('Rate limit exceeded — please wait and retry');
      throw new Error(`Server Proxy error ${status}: ${msg}`);
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

    let activityId: string = 'unknown';
    try {
      const response = await submitAndPoll('env_params', payload);
      activityId = response.activityId;
      
      const raw: any = response.data?.result ?? {};
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

    let activityId: string = 'unknown';
    try {
      const response = await submitAndPoll('heatmap', payload);
      activityId = response.activityId;
      
      const raw: any = response.data ?? {};

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
