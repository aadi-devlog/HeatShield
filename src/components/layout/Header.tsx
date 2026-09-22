import React from 'react';
import { Shield, RefreshCw, Flame, Menu, X } from 'lucide-react';
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
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  mode, onModeChange, loading, onRefresh, onEscalate, onResetEscalation, escalationActive, isSidebarOpen, onToggleSidebar
}: Props) {
  return (
    <header className="bg-surface-800 border-b border-surface-600 px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center justify-between w-full sm:w-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 bg-shield-600 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm md:text-base font-bold text-white tracking-tight truncate">HeatShield AI</div>
            <div className="text-[10px] md:text-xs text-gray-500 truncate hidden sm:block">Industrial Heat Risk Intelligence</div>
          </div>
        </div>
        
        {/* Mobile controls top right */}
        <div className="flex items-center gap-2 sm:hidden">
           <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-ghost p-1.5"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Center badges - hidden on mobile */}
      <div className="hidden lg:flex items-center gap-3">
        <ModeBadge mode={mode} />
        {escalationActive && (
          <span className="bg-red-700/20 border border-red-700/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
            ⚠ ESCALATION ACTIVE
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <div className="flex-1 sm:flex-none">
          <ModeToggle mode={mode} onModeChange={onModeChange} loading={loading} />
        </div>

        {escalationActive ? (
          <button
            onClick={onResetEscalation}
            className="btn-secondary text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            Reset
          </button>
        ) : (
          <button
            onClick={onEscalate}
            className="flex items-center justify-center gap-1.5 bg-red-900/40 hover:bg-red-800/50 border border-red-800/50 text-red-400 font-semibold px-3 py-1.5 rounded-lg transition-colors text-xs whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Simulate</span> Escalation
          </button>
        )}

        {/* Desktop refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-ghost hidden sm:flex"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
