import React, { useState } from 'react';
import { TraceraProvider, useTracera } from './context/TraceraContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CCTVGrid } from './components/CCTVGrid';
import { VehiclesView } from './components/VehiclesView';
import { TrajectoriesView } from './components/TrajectoriesView';
import { AnalyticsView } from './components/AnalyticsView';
import { AlertsView } from './components/AlertsView';
import { Camera } from './types';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedCameraId } = useTracera();
  const [focusCamera, setFocusCamera] = useState<Camera | null>(null);

  const handleFocusMap = (camera: Camera) => {
    setFocusCamera(camera);
    setSelectedCameraId(camera.id);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'cameras' && <CCTVGrid onFocusMap={handleFocusMap} />}
        {activeTab === 'vehicles' && <VehiclesView />}
        {activeTab === 'trajectories' && <TrajectoriesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'alerts' && <AlertsView />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <TraceraProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </TraceraProvider>
  );
}
