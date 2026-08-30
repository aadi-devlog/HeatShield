import React from 'react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
} from 'recharts';
import type { RiskScore, HeatRiskExplanation } from '../../types';
import { RiskBadge } from '../shared/Badge';
import { HelpCircle } from 'lucide-react';

interface Props {
  riskScore: RiskScore;
  explanation: HeatRiskExplanation | null;
  showExplainer: boolean;
  onToggleExplainer: () => void;
}

const RISK_COLOR_MAP: Record<string, string> = {
  LOW:       '#22c55e',
  MODERATE:  '#eab308',
  HIGH:      '#f97316',
  VERY_HIGH: '#ef4444',
  CRITICAL:  '#dc2626',
};

export function HeatRiskGauge({ riskScore, explanation, showExplainer, onToggleExplainer }: Props) {
  const color = RISK_COLOR_MAP[riskScore.level] ?? '#f97316';
  const isCritical = riskScore.level === 'CRITICAL';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title mb-1">Heat Risk Score</div>
          <div className="text-xs text-gray-500">Prototype Decision-Support · Not medically validated</div>
        </div>
        <button
          onClick={onToggleExplainer}
          className="btn-ghost flex items-center gap-1.5 text-xs"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Why?
        </button>
      </div>

      {/* Gauge */}
      <div className="relative h-40 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={160}>
          <RadialBarChart
            cx="50%"
            cy="75%"
            innerRadius="60%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            data={[{ value: riskScore.score, fill: color }]}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: '#1e2638' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center score */}
        <div className="absolute bottom-4 text-center">
          <div
            className={`text-5xl font-bold tracking-tight ${isCritical ? 'risk-critical-pulse' : ''}`}
            style={{ color }}
          >
            {riskScore.score}
          </div>
          <div className="text-xs text-gray-500 mt-1">/ 100</div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-2">
        <RiskBadge level={riskScore.level} />
      </div>

      {/* Explainer panel */}
      {showExplainer && explanation && (
        <div className="mt-4 pt-4 border-t border-surface-600 animate-fade-in">
          <div className="text-xs font-semibold text-gray-300 mb-3">Score Breakdown</div>
          <div className="space-y-2">
            {explanation.factors.map(factor => (
              <div key={factor.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-mono">{factor.value}</span>
                    <span className="text-shield-400 font-semibold w-6 text-right">+{factor.contribution}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(factor.contribution / explanation.score) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">{factor.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-600 italic">{explanation.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
