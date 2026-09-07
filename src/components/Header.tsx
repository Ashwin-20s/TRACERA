import React, { useState, useEffect } from 'react';
import { useTracera } from '../context/TraceraContext';
import {
  Video,
  ShieldAlert,
  Car,
  Activity,
  Play,
  Pause,
  Zap,
  Radio,
  Sliders
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    cameras,
    vehicles,
    totalActiveDetections,
    unresolvedAlertsCount,
    demoMode,
    toggleDemoMode,
    demoSpeed,
    setDemoSpeed,
    triggerManualDetection,
    setActiveTab
  } = useTracera();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      setCurrentTime(`${dateStr} • ${timeStr} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCamerasCount = cameras.filter(c => c.status === 'ONLINE').length;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">
              TRACERA
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 tracking-wider">
              CCTV AI Core v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Multi-Camera Autonomous Vehicle Tracking & Spatial Intelligence
          </p>
        </div>
      </div>

      {/* Center Telemetry Badges */}
      <div className="hidden xl:flex items-center gap-4">
        {/* Cameras Status */}
        <button
          onClick={() => setActiveTab('cameras')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Video className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Cameras:</span>
          <span className="text-xs font-mono font-semibold text-emerald-400">
            {activeCamerasCount}/5 ONLINE
          </span>
        </button>

        {/* Vehicles Detected */}
        <button
          onClick={() => setActiveTab('vehicles')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
        >
          <Car className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">Tracked:</span>
          <span className="text-xs font-mono font-semibold text-cyan-300">
            {vehicles.length} Targets
          </span>
        </button>

        {/* Total Detections */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400">Events:</span>
          <span className="text-xs font-mono font-semibold text-indigo-300">
            {totalActiveDetections}
          </span>
        </div>

        {/* Alerts Pill */}
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
            unresolvedAlertsCount > 0
              ? 'bg-rose-950/40 border-rose-800/80 hover:bg-rose-900/40'
              : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <ShieldAlert
            className={`w-4 h-4 ${
              unresolvedAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'
            }`}
          />
          <span className="text-xs text-slate-400">Alerts:</span>
          <span
            className={`text-xs font-mono font-semibold ${
              unresolvedAlertsCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            {unresolvedAlertsCount} Unresolved
          </span>
        </button>
      </div>

      {/* Right Controls: Clock & Demo Controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex flex-col items-end text-right mr-1">
          <span className="text-xs font-mono text-slate-300 tracking-wide font-medium">
            {currentTime}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
              LIVE NETWORK
            </span>
          </div>
        </div>

        {/* Quick Manual Detection Trigger */}
        <button
          id="btn-quick-detect"
          onClick={() => triggerManualDetection()}
          title="Force an immediate AI vehicle detection event"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Simulate Pass</span>
        </button>

        {/* Demo Mode Toggle */}
        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
          <button
            id="btn-toggle-demo"
            onClick={toggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              demoMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={demoMode ? 'Pause automated vehicle telemetry' : 'Resume demo simulation'}
          >
            {demoMode ? (
              <>
                <Pause className="w-3 h-3 text-cyan-400" />
                <span>Demo Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-400" />
                <span>Demo Paused</span>
              </>
            )}
          </button>

          {/* Speed Selector */}
          {demoMode && (
            <div className="flex items-center px-1 border-l border-slate-800 gap-1">
              <button
                onClick={() => setDemoSpeed(demoSpeed === 1 ? 2 : demoSpeed === 2 ? 3 : 1)}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-800/80 text-slate-300 hover:text-cyan-300"
                title="Change simulation pace"
              >
                {demoSpeed}x
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
