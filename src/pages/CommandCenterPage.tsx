import React from 'react';
import {
  AlertTriangle, Building2, Users, Activity, TrendingUp, Zap, CheckCircle, Clock,
} from 'lucide-react';
import type { AppState } from '../types';
import { RiskBadge } from '../components/shared/Badge';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { EnvironmentalPanel } from '../components/dashboard/EnvironmentalPanel';
import { DataProvenance } from '../components/shared/DataProvenance';
import { RISK_THRESHOLDS } from '../services/heatRiskEngine';

interface Props {
  state: AppState;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'text-gray-100',
  urgent = false,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  subtext?: string;
  color?: string;
  urgent?: boolean;
}) {
  return (
    <div className={`card-sm ${urgent ? 'border-red-800/50 bg-red-900/10' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${urgent ? 'text-red-400' : 'text-shield-400'}`} />
        <span className="metric-label">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
}

export function CommandCenterPage({ state }: Props) {
  const { environmental, facility, beforeAfter, alerts, provenance, mode, loading, error, hourlyForecast } = state;

  const activeAlerts = alerts.filter((a: any) => a.status === 'ACTIVE').length;
  const riskScore = facility?.currentRisk?.score ?? 0;
  const riskLevel = facility?.currentRisk?.level ?? 'LOW';
  const riskColor = RISK_THRESHOLDS[riskLevel]?.color ?? '#22c55e';

  if (loading && !environmental) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-shield-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-400 text-sm">
            {mode === 'live' ? 'Connecting to FortyGuard API…' : 'Loading…'}
          </div>
          {mode === 'live' && (
            <div className="text-gray-600 text-xs mt-1">
              POST /v1/env_params → polling /v1/status/…
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Error banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-400 mb-1">FortyGuard API Notice</div>
            <div className="text-xs text-red-300">{error}</div>
          </div>
        </div>
      )}

      {/* Hero: What problem, who uses it, what FortyGuard provides */}
      <div className="card bg-gradient-to-r from-surface-800 to-surface-700 border-surface-500">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs text-shield-400 font-semibold uppercase tracking-wider mb-1">
              FortyGuard Heat Intelligence → Industrial Operational Decision
            </div>
            <h1 className="text-2xl font-bold text-gray-100">Phoenix Logistics Hub</h1>
            <p className="text-gray-400 text-sm mt-1">
              Outdoor loading &amp; dispatch operations · 47 personnel at risk
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: riskColor }}>
                {riskScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">Risk Score</div>
            </div>
            <div>
              {facility && <RiskBadge level={riskLevel} />}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={String(activeAlerts)}
          subtext={`${alerts.length} total alerts`}
          color={activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}
          urgent={activeAlerts > 0}
        />
        <StatCard
          icon={Building2}
          label="Facilities at Risk"
          value="1"
          subtext="Phoenix Logistics Hub"
          color="text-orange-400"
        />
        <StatCard
          icon={Users}
          label="Workers Exposed"
          value="47"
          subtext="Outdoor operations"
          color="text-yellow-400"
        />
        <StatCard
          icon={TrendingUp}
          label="High-Risk Window"
          value="13:00–16:00"
          subtext={beforeAfter ? `${beforeAfter.current.totalHighRiskMinutes} min exposure` : ''}
          color="text-red-400"
        />
      </div>

      {/* Decision summary banner */}
      {beforeAfter && (
        <div className="card bg-gradient-to-r from-green-900/10 to-surface-800 border-green-700/30">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">HeatShield AI Decision</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="md:col-span-2">
              <div className="text-gray-300 font-medium mb-1">Current Risk</div>
              <div className="text-gray-400 text-xs">
                {beforeAfter.current.totalHighRiskMinutes} min high-risk exposure in planned window (13:00–16:00)
              </div>
            </div>
            <div>
              <div className="text-gray-300 font-medium mb-1">Recommendation</div>
              <div className="text-gray-400 text-xs">Move to 10:00–12:00 morning window</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">{beforeAfter.minutesSaved} min saved</div>
              <div className="text-gray-500 text-xs">high-risk exposure eliminated</div>
            </div>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {hourlyForecast.length > 0 && (
            <ForecastChart hourlyData={hourlyForecast} mode={mode} />
          )}
          <AlertsFeed alerts={alerts} compact />
        </div>
        <div className="space-y-6">
          {environmental && <EnvironmentalPanel env={environmental} mode={mode} />}
          {provenance && <DataProvenance provenance={provenance} />}
        </div>
      </div>
    </div>
  );
}
