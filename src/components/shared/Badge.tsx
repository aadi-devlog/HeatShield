import React from 'react';
import type { RiskLevel } from '../../types';

const BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW:       'badge-low',
  MODERATE:  'badge-moderate',
  HIGH:      'badge-high',
  VERY_HIGH: 'badge-very-high',
  CRITICAL:  'badge-critical',
};

const BADGE_LABELS: Record<RiskLevel, string> = {
  LOW:       'LOW RISK',
  MODERATE:  'MODERATE',
  HIGH:      'HIGH RISK',
  VERY_HIGH: 'VERY HIGH',
  CRITICAL:  'CRITICAL',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={BADGE_CLASSES[level]}>
      {BADGE_LABELS[level]}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO' }) {
  const cls = {
    CRITICAL: 'badge-critical',
    HIGH:     'badge-very-high',
    MODERATE: 'badge-moderate',
    INFO:     'badge-low',
  }[severity];
  return <span className={cls}>{severity}</span>;
}

export function ModeBadge({ mode }: { mode: 'live' | 'demo' }) {
  if (mode === 'demo') {
    return (
      <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-3 py-1 rounded-full tracking-wider">
        DEMO MODE · SIMULATED DATA
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      LIVE · FORTYGUARD
    </span>
  );
}
