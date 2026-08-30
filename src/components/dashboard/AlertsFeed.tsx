import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import type { Alert } from '../../types';
import { SeverityBadge } from '../shared/Badge';

interface Props {
  alerts: Alert[];
  compact?: boolean;
}

const SEVERITY_ICONS = {
  CRITICAL: AlertTriangle,
  HIGH:     AlertCircle,
  MODERATE: AlertCircle,
  INFO:     Info,
};

const SEVERITY_COLORS = {
  CRITICAL: 'text-red-400',
  HIGH:     'text-orange-400',
  MODERATE: 'text-yellow-400',
  INFO:     'text-blue-400',
};

const STATUS_COLORS = {
  ACTIVE:       'text-red-400',
  ACKNOWLEDGED: 'text-yellow-400',
  RESOLVED:     'text-green-400',
};

export function AlertsFeed({ alerts, compact = false }: Props) {
  const displayAlerts = compact ? alerts.slice(0, 3) : alerts;
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="section-title">Active Alerts</span>
          {activeCount > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="flex items-center gap-2 text-green-400 text-sm py-2">
          <CheckCircle2 className="w-4 h-4" />
          No active alerts
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map(alert => {
            const Icon = SEVERITY_ICONS[alert.severity];
            const iconColor = SEVERITY_COLORS[alert.severity];
            const statusColor = STATUS_COLORS[alert.status];

            const timestamp = new Date(alert.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={alert.id}
                className={`rounded-lg p-3 border animate-fade-in ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-900/10 border-red-800/40'
                    : alert.severity === 'HIGH'
                    ? 'bg-orange-900/10 border-orange-800/40'
                    : alert.severity === 'MODERATE'
                    ? 'bg-yellow-900/10 border-yellow-800/40'
                    : 'bg-surface-700 border-surface-600'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-100 truncate">{alert.title}</span>
                      <SeverityBadge severity={alert.severity} />
                    </div>

                    {!compact && (
                      <>
                        <div className="text-xs text-gray-400 mb-1">{alert.location}</div>
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="text-gray-600">Trigger: </span>{alert.trigger}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="text-gray-600">Operation: </span>{alert.affectedOperation}
                        </div>
                        <div className="bg-surface-700 rounded p-2 text-xs text-gray-300 mb-2">
                          <span className="text-shield-400 font-semibold">↑ Action: </span>
                          {alert.recommendation}
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{timestamp}</span>
                      <span className={`font-semibold ${statusColor}`}>{alert.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
