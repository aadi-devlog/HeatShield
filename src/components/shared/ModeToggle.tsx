import React from 'react';
import { Wifi, FlaskConical } from 'lucide-react';
import type { AppMode } from '../../types';

interface Props {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  loading?: boolean;
}

export function ModeToggle({ mode, onModeChange, loading }: Props) {
  return (
    <div className="flex items-center gap-1 bg-surface-700 rounded-lg p-1">
      <button
        onClick={() => onModeChange('live')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'live'
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <Wifi className="w-3 h-3" />
        Live
      </button>
      <button
        onClick={() => onModeChange('demo')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'demo'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <FlaskConical className="w-3 h-3" />
        Demo
      </button>
    </div>
  );
}
