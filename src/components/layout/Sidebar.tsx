import React from 'react';
import { LayoutDashboard, Building2, Bell, Shield, X } from 'lucide-react';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  activeAlerts: number;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: 'command',  icon: LayoutDashboard, label: 'Command Center' },
  { id: 'facility', icon: Building2,       label: 'Facility Analysis' },
  { id: 'alerts',   icon: Bell,            label: 'Alerts' },
];

export function Sidebar({ activePage, onNavigate, activeAlerts, isOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[50] md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-[60] md:z-40 w-64 md:w-56 bg-surface-800 border-r border-surface-600 flex flex-col py-4 px-3 flex-shrink-0 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } overflow-y-auto`}
      >
        {/* Mobile Header inside Sidebar */}
        <div className="flex md:hidden items-center justify-between px-3 mb-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-shield-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Menu</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                activePage === item.id
                  ? 'bg-shield-700/30 text-shield-300 border border-shield-700/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
              }`}
            >
              <item.icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
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
          <div className="text-sm md:text-xs text-shield-400 font-semibold">FortyGuard API</div>
          <div className="text-xs text-gray-500 mt-1">Hackathon '26</div>
          <div className="text-xs text-gray-600">Track 3: Industrial</div>
        </div>
      </aside>
    </>
  );
}
