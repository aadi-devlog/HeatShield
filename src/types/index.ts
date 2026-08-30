// src/types/index.ts

export type AppMode = 'live' | 'demo';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

export interface RiskScore {
  score: number;
  level: RiskLevel;
  label: string;
  color: string;
  bgColor: string;
}

export interface EnvironmentalReading {
  temperature_celsius: number;
  heat_index_celsius: number;
  wet_bulb_celsius: number;
  relative_humidity_percent: number;
  apparent_temperature_celsius?: number;
  precipitation_mm?: number;
  cloud_cover_octas?: number;
  timestamp: string;
  source: 'fortyguard_live' | 'fortyguard_cache' | 'demo';
}

export interface HourlyReading extends EnvironmentalReading {
  hour: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface HeatRiskExplanation {
  score: number;
  level: RiskLevel;
  factors: {
    name: string;
    value: string;
    contribution: number;
    description: string;
  }[];
  dominantFactor: string;
  disclaimer: string;
}

export interface OperationalRecommendation {
  situation: string;         // WHAT IS HAPPENING
  whyItMatters: string;      // WHY IT MATTERS
  action: string;            // WHAT SHOULD WE DO
  expectedImpact: string;    // EXPECTED IMPACT
  priority: 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OperationalPlan {
  label: string;
  startHour: number;
  endHour: number;
  description: string;
  totalHighRiskMinutes: number;
  avgRiskScore: number;
  riskLevel: RiskLevel;
}

export interface BeforeAfter {
  current: OperationalPlan;
  recommended: OperationalPlan;
  recommendation: OperationalRecommendation;
  minutesSaved: number;
  riskReduction: number;
  dataDisclaimer: string;
}

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  title: string;
  location: string;
  trigger: string;
  timestamp: string;
  affectedOperation: string;
  recommendation: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  riskScore: number;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
  currentRisk: RiskScore;
  operations: string[];
  workerCount: number;
}

export interface FortyGuardTaskResult {
  activityId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data?: EnvParamsResult | HeatmapResult;
  error?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface EnvParamsResult {
  type: 'env_params';
  latitude: number;
  longitude: number;
  timezone?: string;
  timestamps: string[];
  heat_index_celsius: (number | null)[];
  wet_bulb_temperature_celsius: (number | null)[];
  relative_humidity_percent: (number | null)[];
  apparent_temperature_celsius: (number | null)[];
  temperature_celsius?: (number | null)[];
}

export interface HeatmapResult {
  type: 'heatmap';
  map_data?: GeoJSON.FeatureCollection;
  stats_data?: {
    Minimum: number;
    Maximum: number;
    Mean: number;
    Standard_deviation: number;
  };
}

export interface DataProvenance {
  source: string;
  mode: AppMode;
  lastUpdated: string;
  fortyguardCapability: string;
  activityId?: string;
  endpoint?: string;
}

export interface AppState {
  mode: AppMode;
  loading: boolean;
  error: string | null;
  environmental: EnvironmentalReading | null;
  hourlyForecast: HourlyReading[];
  facility: Facility | null;
  riskExplanation: HeatRiskExplanation | null;
  beforeAfter: BeforeAfter | null;
  alerts: Alert[];
  provenance: DataProvenance | null;
  escalationActive: boolean;
}
