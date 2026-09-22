import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { HourlyReading, AppMode } from '../../types';
import { TrendingUp } from 'lucide-react';

interface Props {
  hourlyData: HourlyReading[];
  mode: AppMode;
}

const RISK_COLORS: Record<string, string> = {
  LOW:       '#22c55e',
  MODERATE:  '#eab308',
  HIGH:      '#f97316',
  VERY_HIGH: '#ef4444',
  CRITICAL:  '#dc2626',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as HourlyReading;
  if (!d) return null;
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-semibold text-gray-200 mb-2">{`${label}:00`}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Heat Index</span>
          <span className="font-mono text-orange-400">{d.heat_index_celsius.toFixed(1)}°C</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Wet Bulb</span>
          <span className="font-mono text-blue-400">{d.wet_bulb_celsius.toFixed(1)}°C</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Humidity</span>
          <span className="font-mono text-gray-300">{d.relative_humidity_percent.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-surface-600">
          <span className="text-gray-400">Risk Score</span>
          <span className="font-bold" style={{ color: RISK_COLORS[d.riskLevel] }}>
            {d.riskScore}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ForecastChart({ hourlyData, mode }: Props) {
  const chartData = hourlyData.map(r => ({
    ...r,
    hour: r.hour,
    label: `${r.hour}`,
  }));

  const currentHour = new Date().getHours();

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-shield-400 shrink-0" />
          <span className="section-title">Heat Risk Trend · Today</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {mode === 'demo' && <span className="text-amber-500">Simulated</span>}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            Heat Index
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Wet Bulb
          </div>
        </div>
      </div>

      {/* Risk zone annotations */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 text-xs">
        {[
          { label: 'CURRENT PLAN 13–16h', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
          { label: 'RECOMMENDED 10–12h', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
        ].map(z => (
          <div key={z.label} className={`px-2 py-1 rounded border text-xs font-semibold whitespace-nowrap text-center sm:text-left ${z.color}`}>
            {z.label}
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="wbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}h`}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}°`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Safe window: 10–12 */}
          <ReferenceLine x="10" stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine x="12" stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />

          {/* Risk window: 13–16 */}
          <ReferenceLine x="13" stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine x="16" stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />

          {/* Current time */}
          <ReferenceLine x={String(currentHour)} stroke="#ffffff" strokeOpacity={0.3} />

          <Area
            type="monotone"
            dataKey="heat_index_celsius"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#heatGrad)"
            dot={false}
            name="Heat Index"
          />
          <Area
            type="monotone"
            dataKey="wet_bulb_celsius"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#wbGrad)"
            dot={false}
            name="Wet Bulb"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
