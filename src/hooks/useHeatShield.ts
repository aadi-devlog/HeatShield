// src/hooks/useHeatShield.ts
// Main application hook — orchestrates FortyGuard API, risk engine, and state.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, AppMode, EnvironmentalReading, HourlyReading } from '../types';
import { fetchEnvParams } from '../services/fortyGuardService';
import { computeRisk, explainRisk, enrichHourlyWithRisk, scoreToLevel } from '../services/heatRiskEngine';
import { computeBeforeAfter } from '../services/recommendationEngine';
import { applyEscalation, resetEscalation } from '../services/simulationEngine';
import {
  getMockHourlyReadings,
  getMockCurrentReading,
  MOCK_FACILITY,
  MOCK_ALERTS,
  TODAY,
} from '../data/mockData';
import type { EnvParamsResult } from '../types';

// Phoenix Logistics Hub
const PHX_LAT  = 33.4484;
const PHX_LNG  = -112.0740;
const DAY_START = '06:00';
const DAY_END   = '20:00';

function buildInitialState(mode: AppMode): AppState {
  const env = getMockCurrentReading();
  const hour = new Date().getHours();
  const risk = computeRisk(env, hour);
  const explanation = explainRisk(env, hour);
  const hourly = getMockHourlyReadings();
  const beforeAfter = computeBeforeAfter(hourly);

  return {
    mode,
    loading: false,
    error: null,
    environmental: env,
    hourlyForecast: hourly,
    facility: { ...MOCK_FACILITY, currentRisk: risk },
    riskExplanation: explanation,
    beforeAfter,
    alerts: MOCK_ALERTS,
    provenance: {
      source: mode === 'live' ? 'FortyGuard API (loading…)' : 'HeatShield Demo Dataset',
      mode,
      lastUpdated: new Date().toISOString(),
      fortyguardCapability: mode === 'live' ? 'Environmental Parameters' : 'Demo Simulation',
    },
    escalationActive: false,
  };
}

function normalizeEnvParamsToHourly(result: EnvParamsResult): { current: EnvironmentalReading | null; hourly: HourlyReading[] } {
  const { timestamps, heat_index_celsius, wet_bulb_temperature_celsius, relative_humidity_percent } = result;

  if (!timestamps.length) return { current: null, hourly: [] };

  const hourlyRaw = timestamps.map((ts, i) => {
    const dt = new Date(ts);
    const hour = dt.getHours();
    const hi = heat_index_celsius[i] ?? heat_index_celsius[0] ?? 40;
    const wb = wet_bulb_temperature_celsius[i] ?? wet_bulb_temperature_celsius[0] ?? 26;
    const rh = relative_humidity_percent[i] ?? relative_humidity_percent[0] ?? 25;
    // FortyGuard returns heat_index; we use it as temperature proxy if temp not available
    return {
      hour,
      temperature_celsius: hi - 2, // Approximate — heat index slightly above air temp
      heat_index_celsius: hi,
      wet_bulb_celsius: wb,
      relative_humidity_percent: rh,
      timestamp: ts,
      source: 'fortyguard_live' as const,
    };
  });

  const enriched = enrichHourlyWithRisk(hourlyRaw);

  // Pick current hour reading or the closest available
  const nowHour = new Date().getHours();
  const currentRaw = enriched.find(r => r.hour === nowHour) ?? enriched[Math.floor(enriched.length / 2)];
  const current: EnvironmentalReading = {
    temperature_celsius: currentRaw.temperature_celsius,
    heat_index_celsius: currentRaw.heat_index_celsius,
    wet_bulb_celsius: currentRaw.wet_bulb_celsius,
    relative_humidity_percent: currentRaw.relative_humidity_percent,
    timestamp: currentRaw.timestamp,
    source: 'fortyguard_live',
  };

  return { current, hourly: enriched };
}

export function useHeatShield() {
  const [state, setState] = useState<AppState>(() => buildInitialState('live'));
  const fetchingRef = useRef(false);

  const loadLiveData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchEnvParams(PHX_LAT, PHX_LNG, TODAY, DAY_START, DAY_END);

      if (result.status === 'failed') {
        // Fall back to demo data on API failure, clearly indicate error
        setState(prev => ({
          ...prev,
          loading: false,
          error: `FortyGuard API: ${result.error ?? 'Request failed'}. Showing demo data.`,
          provenance: {
            source: 'Demo Fallback (API error)',
            mode: 'live',
            lastUpdated: new Date().toISOString(),
            fortyguardCapability: 'env_params (failed)',
          },
        }));
        return;
      }

      const envData = result.data as EnvParamsResult;
      const { current, hourly } = normalizeEnvParamsToHourly(envData);

      if (!current || !hourly.length) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'FortyGuard returned empty data. Verify location and date parameters.',
        }));
        return;
      }

      const hour = new Date().getHours();
      const risk = computeRisk(current, hour);
      const explanation = explainRisk(current, hour);
      const beforeAfter = computeBeforeAfter(hourly);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        environmental: current,
        hourlyForecast: hourly,
        facility: { ...MOCK_FACILITY, currentRisk: risk },
        riskExplanation: explanation,
        beforeAfter,
        provenance: {
          source: 'FortyGuard API',
          mode: 'live',
          lastUpdated: new Date().toISOString(),
          fortyguardCapability: 'Environmental Parameters (env_params)',
          activityId: result.activityId,
          endpoint: 'POST /v1/env_params → GET /v1/status/{id}',
        },
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const loadDemoData = useCallback(() => {
    const env = getMockCurrentReading();
    const hour = new Date().getHours();
    const risk = computeRisk(env, hour);
    const explanation = explainRisk(env, hour);
    const hourly = getMockHourlyReadings();
    const beforeAfter = computeBeforeAfter(hourly);

    setState(prev => ({
      ...prev,
      mode: 'demo',
      loading: false,
      error: null,
      environmental: env,
      hourlyForecast: hourly,
      facility: { ...MOCK_FACILITY, currentRisk: risk },
      riskExplanation: explanation,
      beforeAfter,
      alerts: MOCK_ALERTS,
      escalationActive: false,
      provenance: {
        source: 'HeatShield Demo Dataset',
        mode: 'demo',
        lastUpdated: new Date().toISOString(),
        fortyguardCapability: 'Demo Mode — Simulated Data',
      },
    }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setState(prev => ({ ...prev, mode }));
    if (mode === 'live') {
      loadLiveData();
    } else {
      loadDemoData();
    }
  }, [loadLiveData, loadDemoData]);

  const triggerEscalation = useCallback(() => {
    setState(prev => ({
      ...prev,
      ...applyEscalation(prev),
    }));
  }, []);

  const resetEscalationState = useCallback(() => {
    setState(prev => ({
      ...prev,
      ...resetEscalation(prev),
    }));
    if (state.mode === 'live') {
      loadLiveData();
    }
  }, [state.mode, loadLiveData]);

  const refreshData = useCallback(() => {
    if (state.mode === 'live') {
      loadLiveData();
    } else {
      loadDemoData();
    }
  }, [state.mode, loadLiveData, loadDemoData]);

  // Load on mount
  useEffect(() => {
    loadLiveData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    setMode,
    triggerEscalation,
    resetEscalation: resetEscalationState,
    refreshData,
  };
}
