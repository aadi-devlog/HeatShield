import React from 'react';
import { ArrowDown, ArrowRight, Clock, TrendingDown, CheckCircle, Info } from 'lucide-react';
import type { BeforeAfter as BeforeAfterType } from '../../types';
import { RiskBadge } from '../shared/Badge';
import { RISK_THRESHOLDS } from '../../services/heatRiskEngine';

interface Props {
  beforeAfter: BeforeAfterType;
}

function PlanCard({
  label,
  timeWindow,
  description,
  riskScore,
  riskLevel,
  highRiskMinutes,
  isRecommended = false,
}: {
  label: string;
  timeWindow: string;
  description: string;
  riskScore: number;
  riskLevel: string;
  highRiskMinutes: number;
  isRecommended?: boolean;
}) {
  const color = RISK_THRESHOLDS[riskLevel as keyof typeof RISK_THRESHOLDS]?.color ?? '#f97316';
  return (
    <div className={`rounded-xl border p-4 ${
      isRecommended
        ? 'bg-green-900/10 border-green-700/40'
        : 'bg-red-900/10 border-red-800/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
        <RiskBadge level={riskLevel as any} />
      </div>

      <div className="text-2xl font-bold text-gray-100 mb-1">{timeWindow}</div>
      <div className="text-xs text-gray-500 mb-3">{description}</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="metric-label mb-1">Risk Score</div>
          <div className="text-2xl font-bold" style={{ color }}>{riskScore}</div>
        </div>
        <div>
          <div className="metric-label mb-1">High-Risk Exposure</div>
          <div className="text-2xl font-bold text-red-400">{highRiskMinutes} min</div>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterPanel({ beforeAfter }: Props) {
  const { current, recommended, minutesSaved, riskReduction, recommendation, dataDisclaimer } = beforeAfter;

  const currentWindow = `${current.startHour}:00–${current.endHour}:00`;
  const recWindow = `${recommended.startHour}:00–${recommended.endHour}:00`;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingDown className="w-4 h-4 text-green-400" />
        <span className="section-title">Operational Decision: Before vs. After</span>
      </div>

      {/* Before / After layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-5">
        {/* Current Plan */}
        <PlanCard
          label="Current Plan"
          timeWindow={currentWindow}
          description={current.description}
          riskScore={current.avgRiskScore}
          riskLevel={current.riskLevel}
          highRiskMinutes={current.totalHighRiskMinutes}
        />

        {/* Arrow + recommendation */}
        <div className="flex flex-col items-center gap-3 text-center">
          <ArrowRight className="w-8 h-8 text-shield-400 hidden md:block" />
          <ArrowDown className="w-8 h-8 text-shield-400 md:hidden" />
          <div className="bg-shield-900/40 border border-shield-700/40 rounded-xl p-3 w-full">
            <div className="text-xs font-bold text-shield-300 mb-2">HeatShield Recommendation</div>
            <div className="text-xs text-gray-400 leading-relaxed">{recommendation.action}</div>
          </div>
        </div>

        {/* Recommended Plan */}
        <PlanCard
          label="Optimized Plan"
          timeWindow={recWindow}
          description={recommended.description}
          riskScore={recommended.avgRiskScore}
          riskLevel={recommended.riskLevel}
          highRiskMinutes={recommended.totalHighRiskMinutes}
          isRecommended
        />
      </div>

      {/* Impact summary */}
      <div className="bg-green-900/10 border border-green-700/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-green-400">Measurable Impact</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="metric-label">Exposure Reduction</div>
            <div className="text-3xl font-bold text-green-400">{minutesSaved} min</div>
            <div className="text-xs text-gray-500">fewer high-risk minutes</div>
          </div>
          <div>
            <div className="metric-label">Risk Score Drop</div>
            <div className="text-3xl font-bold text-green-400">-{riskReduction}</div>
            <div className="text-xs text-gray-500">points reduction</div>
          </div>
          <div>
            <div className="metric-label">Operation Window</div>
            <div className="text-2xl font-bold text-gray-200">{currentWindow} → {recWindow}</div>
            <div className="text-xs text-gray-500">shift earlier by 3h</div>
          </div>
        </div>
      </div>

      {/* AI Decision answers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {[
          { label: 'What is Happening?', text: recommendation.situation, color: 'text-orange-400' },
          { label: 'Why Does it Matter?', text: recommendation.whyItMatters, color: 'text-red-400' },
          { label: 'What Should We Do?', text: recommendation.action, color: 'text-shield-400' },
          { label: 'Expected Impact', text: recommendation.expectedImpact, color: 'text-green-400' },
        ].map(item => (
          <div key={item.label} className="bg-surface-700 rounded-lg p-3">
            <div className={`text-xs font-semibold mb-1.5 ${item.color}`}>{item.label}</div>
            <div className="text-xs text-gray-300 leading-relaxed">{item.text}</div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-gray-600">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>{dataDisclaimer}</span>
      </div>
    </div>
  );
}
