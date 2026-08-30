import React from 'react';
import { AlertTriangle, Clock, MapPin, Activity, CheckCircle } from 'lucide-react';
import type { Alert, AppMode } from '../types';
import { SeverityBadge } from '../components/shared/Badge';

interface Props {
  alerts: Alert[];
  mode: AppMode;
}

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MODERATE: 2, INFO: 3 };

export function AlertsPage({ alerts, mode }: Props) {
  const sorted = [...alerts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  const activeAlerts  = sorted.filter(a => a.status === 'ACTIVE');
  const resolvedAlerts = sorted.filter(a => a.status !== 'ACTIVE');

  const AlertCard = ({ alert }: { alert: Alert }) => {
    const ts = new Date(alert.timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const borderColor = ({
      CRITICAL: 'border-red-800/60 bg-red-900/10',
      HIGH:     'border-orange-800/50 bg-orange-900/10',
      MODERATE: 'border-yellow-800/40 bg-yellow-900/10',
      INFO:     'border-surface-600 bg-surface-700/50',
    } as Record<string, string>)[alert.severity];

    return (
      <div className={`rounded-xl border p-4 ${borderColor} animate-slide-in`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-gray-100">{alert.title}</h3>
              <SeverityBadge severity={alert.severity} />
              <span className={`text-xs font-medium ${
                alert.status === 'ACTIVE' ? 'text-red-400' :
                alert.status === 'ACKNOWLEDGED' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {alert.status}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {ts}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-0.5">
              <MapPin className="w-3 h-3" />Location
            </div>
            <div className="text-gray-300">{alert.location}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-0.5">
              <Activity className="w-3 h-3" />Affected Operation
            </div>
            <div className="text-gray-300">{alert.affectedOperation}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-500 mb-0.5">Trigger Condition</div>
            <div className="text-gray-400">{alert.trigger}</div>
          </div>
        </div>

        <div className="bg-surface-700 border border-surface-600 rounded-lg p-3 text-xs">
          <div className="text-shield-400 font-semibold mb-1">HeatShield Recommendation</div>
          <div className="text-gray-300">{alert.recommendation}</div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            Risk Score: <span className="font-mono text-gray-400 ml-1">{alert.riskScore}/100</span>
          </div>
          {mode === 'demo' && (
            <span className="text-amber-600">Simulated Alert</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Alert Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeAlerts.length} active · {resolvedAlerts.length} resolved · Phoenix Logistics Hub
          </p>
        </div>
        {mode === 'demo' && (
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
            DEMO MODE · SIMULATED DATA
          </span>
        )}
      </div>

      {activeAlerts.length > 0 && (
        <div>
          <div className="section-title mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Active Alerts ({activeAlerts.length})
          </div>
          <div className="space-y-3">
            {activeAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div>
          <div className="section-title mb-3 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            Acknowledged / Resolved ({resolvedAlerts.length})
          </div>
          <div className="space-y-3 opacity-70">
            {resolvedAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}
