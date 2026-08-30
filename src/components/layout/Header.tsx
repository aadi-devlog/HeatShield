import React from 'react';
import { Shield, RefreshCw, Flame } from 'lucide-react';
import type { AppMode } from '../../types';
import { ModeToggle } from '../shared/ModeToggle';
import { ModeBadge } from '../shared/Badge';

interface Props {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  loading: boolean;
  onRefresh: () => void;
  onEscalate: () => void;
  onResetEscalation: () => void;
  escalationActive: boolean;
}

export function Header({
  mode, onModeChange, loading, onRefresh, onEscalate, onResetEscalation, escalationActive
}: Props) {
  return (
    <header className="bg-surface-800 border-b border-surface-600 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-shield-600 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-tight">HeatShield AI</div>
          <div className="text-xs text-gray-500">Industrial Heat Risk Intelligence · Phoenix Logistics Hub</div>
        </div>
      </div>

      {/* Center badges */}
      <div className="hidden md:flex items-center gap-3">
        <ModeBadge mode={mode} />
        {escalationActive && (
          <span className="bg-red-700/20 border border-red-700/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            ⚠ ESCALATION ACTIVE
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <ModeToggle mode={mode} onModeChange={onModeChange} loading={loading} />

        {escalationActive ? (
          <button
            onClick={onResetEscalation}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            Reset
          </button>
        ) : (
          <button
            onClick={onEscalate}
            className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800/50 border border-red-800/50 text-red-400 font-semibold px-3 py-1.5 rounded-lg transition-colors text-xs"
          >
            <Flame className="w-3.5 h-3.5" />
            Simulate Escalation
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-ghost"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
