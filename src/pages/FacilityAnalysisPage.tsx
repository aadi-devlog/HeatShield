import React from 'react';
import { Building2, Users, MapPin, Activity, Clock, Thermometer } from 'lucide-react';
import type { Facility, EnvironmentalReading, HeatRiskExplanation, BeforeAfter as BeforeAfterType, AppMode } from '../types';
import { HeatRiskGauge } from '../components/facility/HeatRiskGauge';
import { EnvironmentalPanel } from '../components/dashboard/EnvironmentalPanel';
import { BeforeAfterPanel } from '../components/decisions/BeforeAfterPanel';
import { DataProvenance } from '../components/shared/DataProvenance';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import type { DataProvenance as DataProvenanceType, HourlyReading } from '../types';
import { useState } from 'react';

interface Props {
  facility: Facility | null;
  env: EnvironmentalReading | null;
  hourlyForecast: HourlyReading[];
  explanation: HeatRiskExplanation | null;
  beforeAfter: BeforeAfterType | null;
  provenance: DataProvenanceType | null;
  mode: AppMode;
  loading: boolean;
}

export function FacilityAnalysisPage({
  facility, env, hourlyForecast, explanation, beforeAfter, provenance, mode, loading
}: Props) {
  const [showExplainer, setShowExplainer] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-shield-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-400 text-sm">
            {mode === 'live' ? 'Fetching FortyGuard environmental data…' : 'Loading…'}
          </div>
        </div>
      </div>
    );
  }

  if (!facility || !env) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No facility data available
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Facility Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-shield-700/30 border border-shield-700/50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-shield-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{facility.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <MapPin className="w-3 h-3" />
                {facility.location}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {facility.workerCount} personnel
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {facility.operations.length} operations
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Active Operations</div>
            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
              {facility.operations.map((op: string) => (
                <span key={op} className="bg-surface-700 text-gray-300 text-xs px-2 py-0.5 rounded">
                  {op}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {facility.currentRisk && (
            <HeatRiskGauge
              riskScore={facility.currentRisk}
              explanation={explanation}
              showExplainer={showExplainer}
              onToggleExplainer={() => setShowExplainer(v => !v)}
            />
          )}
          {env && <EnvironmentalPanel env={env} mode={mode} />}
          {provenance && <DataProvenance provenance={provenance} />}
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-6">
          {hourlyForecast.length > 0 && (
            <ForecastChart hourlyData={hourlyForecast} mode={mode} />
          )}
          {beforeAfter && <BeforeAfterPanel beforeAfter={beforeAfter} />}
        </div>
      </div>
    </div>
  );
}
