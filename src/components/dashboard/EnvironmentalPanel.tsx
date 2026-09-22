import React from 'react';
import { Thermometer, Droplets, Wind, Eye, MapPin } from 'lucide-react';
import type { EnvironmentalReading, AppMode } from '../../types';

interface Props {
  env: EnvironmentalReading;
  mode: AppMode;
}

function EnvMetric({ icon: Icon, label, value, unit, color = 'text-gray-200' }: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-surface-700 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-shield-400" />
      </div>
      <div>
        <div className="metric-label">{label}</div>
        <div className={`text-lg font-bold ${color}`}>
          {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function EnvironmentalPanel({ env, mode }: Props) {
  const timestamp = new Date(env.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const hiColor =
    env.heat_index_celsius >= 50 ? 'text-red-400' :
    env.heat_index_celsius >= 40 ? 'text-orange-400' :
    env.heat_index_celsius >= 35 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-shield-400 shrink-0" />
          <span className="section-title">Environmental Conditions</span>
        </div>
        <div className="text-xs text-gray-500">
          {mode === 'demo' ? (
            <span className="text-amber-500">Simulated · {timestamp}</span>
          ) : (
            <span className="text-green-500">FortyGuard · {timestamp}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <EnvMetric
          icon={Thermometer}
          label="Heat Index"
          value={env.heat_index_celsius.toFixed(1)}
          unit="°C"
          color={hiColor}
        />
        <EnvMetric
          icon={Wind}
          label="Wet-Bulb Temp"
          value={env.wet_bulb_celsius.toFixed(1)}
          unit="°C"
          color="text-blue-400"
        />
        <EnvMetric
          icon={Droplets}
          label="Humidity"
          value={env.relative_humidity_percent.toFixed(0)}
          unit="%"
        />
        <EnvMetric
          icon={Eye}
          label="Air Temp"
          value={env.temperature_celsius.toFixed(1)}
          unit="°C"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-surface-600">
        <div className="text-xs text-gray-600">
          {mode === 'live'
            ? '↑ FortyGuard Environmental Parameters · Phoenix, AZ · 2m above ground'
            : '↑ Simulated Phoenix summer conditions · Demo Mode'}
        </div>
      </div>
    </div>
  );
}
