import React from 'react';
import { Database } from 'lucide-react';
import type { DataProvenance as DataProvenanceType } from '../../types';

interface Props {
  provenance: DataProvenanceType;
}

export function DataProvenance({ provenance }: Props) {
  const formattedTime = new Date(provenance.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="card-sm border-surface-500">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-3.5 h-3.5 text-shield-400" />
        <span className="section-title text-xs">Data Provenance</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Source</div>
          <div className="text-gray-200 font-medium">{provenance.source}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Mode</div>
          <div className={`font-semibold ${provenance.mode === 'live' ? 'text-green-400' : 'text-amber-400'}`}>
            {provenance.mode === 'live' ? '⬤ Live' : '⬤ Demo'}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Last Updated</div>
          <div className="text-gray-300 font-mono">{formattedTime}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">FortyGuard Capability</div>
          <div className="text-shield-300 font-medium">{provenance.fortyguardCapability}</div>
        </div>
        {provenance.activityId && provenance.activityId !== 'unknown' && (
          <div className="col-span-2">
            <div className="text-gray-500 mb-0.5">Task ID</div>
            <div className="text-gray-400 font-mono text-xs truncate">{provenance.activityId}</div>
          </div>
        )}
        {provenance.endpoint && (
          <div className="col-span-2">
            <div className="text-gray-500 mb-0.5">Endpoint</div>
            <div className="text-gray-400 font-mono text-xs">{provenance.endpoint}</div>
          </div>
        )}
      </div>
    </div>
  );
}
