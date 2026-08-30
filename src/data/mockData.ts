// src/data/mockData.ts
// Phoenix Logistics Hub — Complete demo dataset for Demo Mode
// Data is clearly labeled as simulated — never presented as live FortyGuard data.

import type { EnvironmentalReading, HourlyReading, Alert, Facility } from '../types';
import { scoreToLevel, calculateRiskScore, RISK_THRESHOLDS } from '../services/heatRiskEngine';

// Phoenix Logistics Hub coordinates
export const PHOENIX_FACILITY = {
  lat: 33.4484,
  lng: -112.0740,
  // ~2km x 1.5km bounding box around Phoenix industrial area
  polygon: [
    [-112.085, 33.455],
    [-112.063, 33.455],
    [-112.063, 33.441],
    [-112.085, 33.441],
    [-112.085, 33.455],
  ] as [number, number][],
};

// Today's date for demo requests
export const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// GeoJSON polygon for FortyGuard API requests
export const PHOENIX_POLYGON_AOI: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [PHOENIX_FACILITY.polygon.map(([lng, lat]) => [lng, lat])],
    },
    properties: { name: 'Phoenix Logistics Hub AOI' },
  }],
};

// Phoenix summer typical hourly readings (July/August heat)
const HOURLY_BASE: Omit<HourlyReading, 'riskScore' | 'riskLevel' | 'source' | 'timestamp'>[] = [
  { hour: 6,  temperature_celsius: 34.2, heat_index_celsius: 36.1, wet_bulb_celsius: 22.8, relative_humidity_percent: 28 },
  { hour: 7,  temperature_celsius: 35.8, heat_index_celsius: 37.9, wet_bulb_celsius: 23.5, relative_humidity_percent: 27 },
  { hour: 8,  temperature_celsius: 37.5, heat_index_celsius: 40.2, wet_bulb_celsius: 24.3, relative_humidity_percent: 25 },
  { hour: 9,  temperature_celsius: 39.1, heat_index_celsius: 42.8, wet_bulb_celsius: 25.1, relative_humidity_percent: 24 },
  { hour: 10, temperature_celsius: 40.6, heat_index_celsius: 44.5, wet_bulb_celsius: 25.9, relative_humidity_percent: 23 },
  { hour: 11, temperature_celsius: 41.9, heat_index_celsius: 46.3, wet_bulb_celsius: 26.4, relative_humidity_percent: 22 },
  { hour: 12, temperature_celsius: 43.1, heat_index_celsius: 48.1, wet_bulb_celsius: 27.2, relative_humidity_percent: 21 },
  { hour: 13, temperature_celsius: 44.2, heat_index_celsius: 50.0, wet_bulb_celsius: 27.9, relative_humidity_percent: 20 },
  { hour: 14, temperature_celsius: 44.8, heat_index_celsius: 51.4, wet_bulb_celsius: 28.3, relative_humidity_percent: 20 },
  { hour: 15, temperature_celsius: 44.5, heat_index_celsius: 51.0, wet_bulb_celsius: 28.1, relative_humidity_percent: 21 },
  { hour: 16, temperature_celsius: 43.6, heat_index_celsius: 49.7, wet_bulb_celsius: 27.6, relative_humidity_percent: 22 },
  { hour: 17, temperature_celsius: 42.1, heat_index_celsius: 47.5, wet_bulb_celsius: 26.9, relative_humidity_percent: 23 },
  { hour: 18, temperature_celsius: 40.3, heat_index_celsius: 44.8, wet_bulb_celsius: 26.1, relative_humidity_percent: 25 },
  { hour: 19, temperature_celsius: 38.4, heat_index_celsius: 42.2, wet_bulb_celsius: 25.3, relative_humidity_percent: 27 },
  { hour: 20, temperature_celsius: 36.8, heat_index_celsius: 39.9, wet_bulb_celsius: 24.5, relative_humidity_percent: 29 },
];

function buildHourlyReading(
  base: typeof HOURLY_BASE[number],
  escalated = false,
): HourlyReading {
  const hiBoost = escalated ? 4 : 0;
  const score = calculateRiskScore({
    heat_index_celsius: base.heat_index_celsius + hiBoost,
    wet_bulb_celsius: base.wet_bulb_celsius + (escalated ? 2 : 0),
    relative_humidity_percent: base.relative_humidity_percent + (escalated ? 8 : 0),
    hour: base.hour,
  });
  const today = new Date();
  today.setHours(base.hour, 0, 0, 0);
  return {
    hour: base.hour,
    temperature_celsius: base.temperature_celsius + hiBoost,
    heat_index_celsius: base.heat_index_celsius + hiBoost,
    wet_bulb_celsius: base.wet_bulb_celsius + (escalated ? 2 : 0),
    relative_humidity_percent: base.relative_humidity_percent + (escalated ? 8 : 0),
    timestamp: today.toISOString(),
    source: 'demo',
    riskScore: score,
    riskLevel: scoreToLevel(score),
  };
}

export function getMockHourlyReadings(escalated = false): HourlyReading[] {
  return HOURLY_BASE.map(b => buildHourlyReading(b, escalated));
}

export function getMockCurrentReading(escalated = false): EnvironmentalReading {
  const hour = new Date().getHours();
  const base = HOURLY_BASE.find(b => b.hour === hour) ?? HOURLY_BASE[8]; // default 14:00
  const hiBoost = escalated ? 4 : 0;
  return {
    temperature_celsius: base.temperature_celsius + hiBoost,
    heat_index_celsius: base.heat_index_celsius + hiBoost,
    wet_bulb_celsius: base.wet_bulb_celsius + (escalated ? 2 : 0),
    relative_humidity_percent: base.relative_humidity_percent + (escalated ? 8 : 0),
    timestamp: new Date().toISOString(),
    source: 'demo',
  };
}

export const MOCK_FACILITY: Facility = {
  id: 'phx-hub-01',
  name: 'Phoenix Logistics Hub',
  location: 'Phoenix, Arizona · 33.4484°N, 112.0740°W',
  lat: PHOENIX_FACILITY.lat,
  lng: PHOENIX_FACILITY.lng,
  polygon: PHOENIX_FACILITY.polygon,
  currentRisk: {
    score: 74,
    level: 'VERY_HIGH',
    label: 'Very High Risk',
    color: '#ef4444',
    bgColor: 'bg-red-500/10 border-red-500/30',
  },
  operations: ['Outdoor Loading', 'Truck Dispatch', 'Pallet Staging', 'Yard Management'],
  workerCount: 47,
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    severity: 'CRITICAL',
    title: 'Heat Index Exceeds Safe Work Threshold',
    location: 'Phoenix Logistics Hub — Loading Dock A',
    trigger: 'Heat Index > 50°C (FortyGuard observation)',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    affectedOperation: 'Outdoor Loading Operations',
    recommendation: 'Reschedule to 10:00–12:00 window. Mandatory cooling breaks every 45 min.',
    status: 'ACTIVE',
    riskScore: 87,
  },
  {
    id: 'alert-002',
    severity: 'HIGH',
    title: 'Peak Heat Window Approaching: 13:00–16:00',
    location: 'Phoenix Logistics Hub — Dispatch Yard',
    trigger: 'Forecast heat index > 48°C during planned operation window',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    affectedOperation: 'Truck Dispatch & Pallet Staging',
    recommendation: 'Move dispatch operations to 10:00–12:00. Pre-position hydration stations.',
    status: 'ACTIVE',
    riskScore: 74,
  },
  {
    id: 'alert-003',
    severity: 'MODERATE',
    title: 'Humidity Spike Reducing Cooling Capacity',
    location: 'Phoenix Logistics Hub — All Outdoor Areas',
    trigger: 'Relative humidity increase to 35%+ limiting evaporative cooling',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    affectedOperation: 'All Outdoor Operations',
    recommendation: 'Increase rest-to-work ratio. Provide misting stations at staging areas.',
    status: 'ACKNOWLEDGED',
    riskScore: 58,
  },
  {
    id: 'alert-004',
    severity: 'INFO',
    title: 'Morning Operating Window Identified',
    location: 'Phoenix Logistics Hub',
    trigger: 'Heat risk score < 35 forecast for 10:00–12:00',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    affectedOperation: 'Schedule Optimization',
    recommendation: 'Consolidate outdoor activities into 10:00–12:00 safe window.',
    status: 'RESOLVED',
    riskScore: 32,
  },
];

// Escalated alerts (added during heat escalation demo)
export const ESCALATION_ALERT: Alert = {
  id: 'alert-escalation',
  severity: 'CRITICAL',
  title: '⚠ HEAT EMERGENCY: Conditions Escalated',
  location: 'Phoenix Logistics Hub — All Zones',
  trigger: 'Simulated heat escalation — heat index exceeded 55°C',
  timestamp: new Date().toISOString(),
  affectedOperation: 'ALL OUTDOOR OPERATIONS',
  recommendation: 'IMMEDIATE HALT. Activate emergency cooling protocol. All personnel to shaded rest areas.',
  status: 'ACTIVE',
  riskScore: 95,
};
