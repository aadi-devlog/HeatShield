// src/services/simulationEngine.ts
// Controls the "Simulate Heat Escalation" demo feature.
// Escalation bumps heat values, re-calculates risk, fires alerts, and updates recommendations.
// Clearly identified as simulation — not FortyGuard live data.

import type { AppState } from '../types';
import { getMockHourlyReadings, getMockCurrentReading, ESCALATION_ALERT, MOCK_FACILITY, MOCK_ALERTS } from '../data/mockData';
import { computeRisk, explainRisk } from './heatRiskEngine';
import { computeBeforeAfter } from './recommendationEngine';
import { scoreToLevel, RISK_THRESHOLDS } from './heatRiskEngine';

export function applyEscalation(prevState: AppState): Partial<AppState> {
  const escalatedEnv = getMockCurrentReading(true);
  const hour = new Date().getHours();
  const riskResult = computeRisk(escalatedEnv, hour, true);
  const explanation = explainRisk(escalatedEnv, hour);
  const hourlyReadings = getMockHourlyReadings(true);
  const beforeAfter = computeBeforeAfter(hourlyReadings, true);

  const existingEscAlert = prevState.alerts.find(a => a.id === 'alert-escalation');
  const alerts = existingEscAlert
    ? prevState.alerts
    : [{ ...ESCALATION_ALERT, timestamp: new Date().toISOString() }, ...prevState.alerts];

  const facility = prevState.facility
    ? { ...prevState.facility, currentRisk: riskResult }
    : { ...MOCK_FACILITY, currentRisk: riskResult };

  return {
    environmental: escalatedEnv,
    hourlyForecast: hourlyReadings,
    facility,
    riskExplanation: explanation,
    beforeAfter,
    alerts,
    escalationActive: true,
    provenance: {
      source: 'HeatShield Simulation Engine',
      mode: prevState.mode,
      lastUpdated: new Date().toISOString(),
      fortyguardCapability: 'Escalation Simulation (Demo)',
      endpoint: 'N/A — Simulated',
    },
  };
}

export function resetEscalation(prevState: AppState): Partial<AppState> {
  const normalEnv = getMockCurrentReading(false);
  const hour = new Date().getHours();
  const riskResult = computeRisk(normalEnv, hour, false);
  const explanation = explainRisk(normalEnv, hour);
  const hourlyReadings = getMockHourlyReadings(false);
  const beforeAfter = computeBeforeAfter(hourlyReadings, false);

  return {
    environmental: normalEnv,
    hourlyForecast: hourlyReadings,
    facility: { ...MOCK_FACILITY, currentRisk: riskResult },
    riskExplanation: explanation,
    beforeAfter,
    alerts: MOCK_ALERTS,
    escalationActive: false,
    provenance: {
      source: prevState.mode === 'live' ? 'FortyGuard API' : 'HeatShield Demo',
      mode: prevState.mode,
      lastUpdated: new Date().toISOString(),
      fortyguardCapability: prevState.mode === 'live' ? 'Environmental Parameters (env_params)' : 'Demo Mode',
    },
  };
}
