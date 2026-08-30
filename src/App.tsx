import React, { useState } from 'react';
import { useHeatShield } from './hooks/useHeatShield';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { FacilityAnalysisPage } from './pages/FacilityAnalysisPage';
import { AlertsPage } from './pages/AlertsPage';

export default function App() {
  const [activePage, setActivePage] = useState('command');
  const {
    state,
    setMode,
    triggerEscalation,
    resetEscalation,
    refreshData,
  } = useHeatShield();

  const activeAlerts = state.alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <Header
        mode={state.mode}
        onModeChange={setMode}
        loading={state.loading}
        onRefresh={refreshData}
        onEscalate={triggerEscalation}
        onResetEscalation={resetEscalation}
        escalationActive={state.escalationActive}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          activeAlerts={activeAlerts}
        />

        <main className="flex-1 overflow-y-auto">
          {activePage === 'command' && (
            <CommandCenterPage state={state} />
          )}
          {activePage === 'facility' && (
            <FacilityAnalysisPage
              facility={state.facility}
              env={state.environmental}
              hourlyForecast={state.hourlyForecast}
              explanation={state.riskExplanation}
              beforeAfter={state.beforeAfter}
              provenance={state.provenance}
              mode={state.mode}
              loading={state.loading}
            />
          )}
          {activePage === 'alerts' && (
            <AlertsPage alerts={state.alerts} mode={state.mode} />
          )}
        </main>
      </div>
    </div>
  );
}
