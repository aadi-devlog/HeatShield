import React from 'react';
import { LayoutDashboard, Building2, Bell } from 'lucide-react';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  activeAlerts: number;
}

const NAV_ITEMS = [
  { id: 'command',  icon: LayoutDashboard, label: 'Command Center' },
  { id: 'facility', icon: Building2,       label: 'Facility Analysis' },
  { id: 'alerts',   icon: Bell,            label: 'Alerts' },
];

export function Sidebar({ activePage, onNavigate, activeAlerts }: Props) {
  return (
    <aside className="w-56 bg-surface-800 border-r border-surface-600 flex flex-col py-4 px-3 flex-shrink-0">
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              activePage === item.id
                ? 'bg-shield-700/30 text-shield-300 border border-shield-700/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
            {item.id === 'alerts' && activeAlerts > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeAlerts > 9 ? '9+' : activeAlerts}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-4 px-3 py-3 bg-surface-700/50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">Powered by</div>
        <div className="text-xs text-shield-400 font-semibold">FortyGuard API</div>
        <div className="text-xs text-gray-500 mt-1">Hackathon '26</div>
        <div className="text-xs text-gray-600">Track 3: Industrial</div>
      </div>
    </aside>
  );
}
