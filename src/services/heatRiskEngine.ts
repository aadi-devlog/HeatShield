// src/services/heatRiskEngine.ts
// HeatShield Prototype Decision-Support Risk Engine
// Score 0–100 based on FortyGuard environmental data + operational context.
// DISCLAIMER: This is a prototype decision-support score, not a medically validated standard.

import type {
  RiskLevel,
  RiskScore,
  HeatRiskExplanation,
  EnvironmentalReading,
  HourlyReading,
} from '../types';

// ─── Risk Thresholds ──────────────────────────────────────────────────────────

export const RISK_THRESHOLDS: Record<RiskLevel, { min: number; max: number; label: string; color: string; bgColor: string }> = {
  LOW:       { min: 0,  max: 29,  label: 'Low Risk',       color: '#22c55e', bgColor: 'bg-green-500/10 border-green-500/30' },
  MODERATE:  { min: 30, max: 49,  label: 'Moderate Risk',  color: '#eab308', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  HIGH:      { min: 50, max: 69,  label: 'High Risk',      color: '#f97316', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  VERY_HIGH: { min: 70, max: 84,  label: 'Very High Risk', color: '#ef4444', bgColor: 'bg-red-500/10 border-red-500/30' },
  CRITICAL:  { min: 85, max: 100, label: 'Critical Risk',  color: '#dc2626', bgColor: 'bg-red-700/10 border-red-700/30' },
};

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'VERY_HIGH';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'MODERATE';
  return 'LOW';
}

export function getRiskScore(level: RiskLevel): RiskScore {
  const t = RISK_THRESHOLDS[level];
  return { score: (t.min + t.max) / 2, level, label: t.label, color: t.color, bgColor: t.bgColor };
}

// ─── Scoring Factors ──────────────────────────────────────────────────────────

interface ScoringInput {
  heat_index_celsius: number;
  wet_bulb_celsius: number;
  relative_humidity_percent: number;
  hour?: number;         // 0–23, for time-of-day penalty
  isEscalated?: boolean; // Demo escalation bump
}

/**
 * Core scoring function.
 * Weights (must sum to 100):
 *   Heat Index: 40 pts
 *   Wet Bulb:   30 pts
 *   Humidity:   20 pts
 *   Time of Day: 10 pts
 */
export function calculateRiskScore(input: ScoringInput): number {
  const { heat_index_celsius: hi, wet_bulb_celsius: wb, relative_humidity_percent: rh, hour = 12, isEscalated = false } = input;

  // Heat Index contribution (0–40)
  // NIOSH: >40°C critical, <27°C low
  const hiScore = Math.min(40, Math.max(0,
    hi < 27 ? (hi - 20) * (10 / 7) :
    hi < 33 ? 10 + (hi - 27) * (15 / 6) :
    hi < 40 ? 25 + (hi - 33) * (10 / 7) :
    35 + (hi - 40) * 1.25
  ));

  // Wet Bulb contribution (0–30)
  // WBGT thresholds: >28°C high-risk outdoor work
  const wbScore = Math.min(30, Math.max(0,
    wb < 22 ? (wb - 15) * (8 / 7) :
    wb < 26 ? 8 + (wb - 22) * (12 / 4) :
    wb < 30 ? 20 + (wb - 26) * (8 / 4) :
    28 + (wb - 30) * 1.0
  ));

  // Relative Humidity contribution (0–20)
  const rhScore = Math.min(20, Math.max(0, (rh - 20) * (20 / 80)));

  // Time-of-day contribution (0–10)
  // Peak: 13:00–16:00 (afternoon solar loading)
  const todScore = (() => {
    if (hour >= 13 && hour <= 16) return 10;
    if (hour >= 11 && hour <= 18) return 6;
    if (hour >= 9  && hour <= 20) return 3;
    return 0;
  })();

  const raw = hiScore + wbScore + rhScore + todScore;
  const escalationBump = isEscalated ? 15 : 0;

  return Math.min(100, Math.round(raw + escalationBump));
}

/**
 * Compute risk score from a full EnvironmentalReading
 */
export function computeRisk(env: EnvironmentalReading, hour?: number, isEscalated = false): RiskScore {
  const score = calculateRiskScore({
    heat_index_celsius: env.heat_index_celsius,
    wet_bulb_celsius: env.wet_bulb_celsius,
    relative_humidity_percent: env.relative_humidity_percent,
    hour,
    isEscalated,
  });
  const level = scoreToLevel(score);
  const threshold = RISK_THRESHOLDS[level];
  return { score, level, label: threshold.label, color: threshold.color, bgColor: threshold.bgColor };
}

/**
 * Build explainability breakdown for the "Why?" panel.
 * Values exactly match the calculateRiskScore computation.
 */
export function explainRisk(env: EnvironmentalReading, hour = 12): HeatRiskExplanation {
  const hi = env.heat_index_celsius;
  const wb = env.wet_bulb_celsius;
  const rh = env.relative_humidity_percent;

  const hiScore = Math.min(40, Math.max(0,
    hi < 27 ? (hi - 20) * (10 / 7) :
    hi < 33 ? 10 + (hi - 27) * (15 / 6) :
    hi < 40 ? 25 + (hi - 33) * (10 / 7) :
    35 + (hi - 40) * 1.25
  ));

  const wbScore = Math.min(30, Math.max(0,
    wb < 22 ? (wb - 15) * (8 / 7) :
    wb < 26 ? 8 + (wb - 22) * (12 / 4) :
    wb < 30 ? 20 + (wb - 26) * (8 / 4) :
    28 + (wb - 30) * 1.0
  ));

  const rhScore = Math.min(20, Math.max(0, (rh - 20) * (20 / 80)));

  const todScore = (() => {
    if (hour >= 13 && hour <= 16) return 10;
    if (hour >= 11 && hour <= 18) return 6;
    if (hour >= 9  && hour <= 20) return 3;
    return 0;
  })();

  const total = Math.min(100, Math.round(hiScore + wbScore + rhScore + todScore));
  const level = scoreToLevel(total);

  const factors = [
    {
      name: 'Heat Index',
      value: `${hi.toFixed(1)}°C`,
      contribution: Math.round(hiScore),
      description: `Apparent "feels like" temperature. Values above 40°C indicate dangerous outdoor conditions for physical labor.`,
    },
    {
      name: 'Wet-Bulb Temperature',
      value: `${wb.toFixed(1)}°C`,
      contribution: Math.round(wbScore),
      description: `Accounts for humidity's impact on body cooling. Above 28°C, evaporative cooling becomes critically impaired.`,
    },
    {
      name: 'Relative Humidity',
      value: `${rh.toFixed(0)}%`,
      contribution: Math.round(rhScore),
      description: `High humidity prevents sweat evaporation, compounding heat stress during outdoor physical activity.`,
    },
    {
      name: 'Time of Day',
      value: `${hour}:00`,
      contribution: Math.round(todScore),
      description: `Peak solar loading occurs 13:00–16:00 in Phoenix, significantly amplifying surface heat exposure.`,
    },
  ];

  const dominantFactor = [...factors].sort((a, b) => b.contribution - a.contribution)[0].name;

  return {
    score: total,
    level,
    factors,
    dominantFactor,
    disclaimer: 'Prototype Decision-Support Risk Score — not a medically validated standard.',
  };
}

/**
 * Calculate high-risk exposure minutes for an operational window.
 * A "minute" counts as high-risk if the hour's risk score ≥ 50 (HIGH threshold).
 */
export function calculateHighRiskMinutes(
  hourlyData: HourlyReading[],
  startHour: number,
  endHour: number,
): number {
  let minutes = 0;
  for (let h = startHour; h < endHour; h++) {
    const reading = hourlyData.find(r => r.hour === h);
    if (reading && reading.riskScore >= 50) {
      minutes += 60;
    } else if (reading && reading.riskScore >= 30) {
      minutes += 20; // Partial exposure during moderate risk
    }
  }
  return minutes;
}

/**
 * Compute risk score for each hour in the hourly dataset.
 */
export function enrichHourlyWithRisk(
  readings: Omit<HourlyReading, 'riskScore' | 'riskLevel'>[],
  isEscalated = false,
): HourlyReading[] {
  return readings.map(r => {
    const score = calculateRiskScore({
      heat_index_celsius: r.heat_index_celsius,
      wet_bulb_celsius: r.wet_bulb_celsius,
      relative_humidity_percent: r.relative_humidity_percent,
      hour: r.hour,
      isEscalated,
    });
    return { ...r, riskScore: score, riskLevel: scoreToLevel(score) };
  });
}
