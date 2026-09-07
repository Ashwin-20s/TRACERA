import React, { useState } from 'react';
import { useTracera } from '../context/TraceraContext';
import { InteractiveMap } from './InteractiveMap';
import { CCTVPlayer } from './CCTVPlayer';
import {
  Video,
  ShieldAlert,
  Car,
  Activity,
  ArrowRight,
  Compass,
  Zap,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Radio
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    cameras,
    vehicles,
    detections,
    alerts,
    selectedVehicle,
    setSelectedVehicleId,
    setSelectedCameraId,
    setActiveTab,
    triggerManualDetection,
    unresolvedAlertsCount
  } = useTracera();

  // Selected camera to display on the dashboard mini-wall
  const [activeCamId, setActiveCamId] = useState<'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04' | 'CAM-05'>('CAM-02');
  const activeCamera = cameras.find(c => c.id === activeCamId) || cameras[1] || cameras[0];

  const recentDetections = detections.slice(0, 10);
  const criticalAlerts = alerts.filter(a => a.status === 'new').slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Cameras */}
        <div
          onClick={() => setActiveTab('cameras')}
          className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CCTV STREAMS</span>
            <Video className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
            5/5 ONLINE
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Full 1080p 30FPS grid coverage
          </div>
        </div>

        {/* Tracked Vehicles */}
        <div
          onClick={() => setActiveTab('vehicles')}
          className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE VEHICLES</span>
            <Car className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {vehicles.length} Targets
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Spatial Re-ID cross-matching
          </div>
        </div>

        {/* Total Detections */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>OPTICAL DETECTIONS</span>
            <Activity className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {detections.length} Passes
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            96.8% Average Confidence
          </div>
        </div>

        {/* Alerts */}
        <div
          onClick={() => setActiveTab('alerts')}
          className={`p-3.5 rounded-xl border transition cursor-pointer group shadow-sm ${
            unresolvedAlertsCount > 0
              ? 'bg-rose-950/30 border-rose-800/80 hover:bg-rose-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={unresolvedAlertsCount > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              DISPATCH ALERTS
            </span>
            <ShieldAlert
              className={`w-4 h-4 ${
                unresolvedAlertsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}
            />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              unresolvedAlertsCount > 0 ? 'text-rose-300' : 'text-slate-300'
            }`}
          >
            {unresolvedAlertsCount} Unresolved
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {unresolvedAlertsCount > 0 ? 'Immediate action advised' : 'System nominal'}
          </div>
        </div>
      </div>

      {/* Main Operations Split: Left = Interactive Map (7 cols), Right = Live Camera & Real-Time Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Map View */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-md">
          <div className="px-4 py-3 bg-slate-950/85 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">
                City Grid Surveillance Matrix
              </span>
              <span className="text-slate-400 hidden sm:inline font-mono text-[11px]">
                (5 Optical Nodes • Connected Roads)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedVehicle && (
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  Tracking: {selectedVehicle.id} [{selectedVehicle.licensePlate}]
                </span>
              )}
              <button
                onClick={() => setActiveTab('trajectories')}
                className="text-slate-400 hover:text-cyan-300 transition text-[11px] font-mono flex items-center gap-1"
                title="Open detailed trajectory view"
              >
                <span>Corridor View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[460px]">
            <InteractiveMap selectedVehicle={selectedVehicle} className="h-full min-h-[460px]" />
          </div>
        </div>

        {/* Right: Live CCTV Switcher Panel & Real-Time Detection Feed */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active CCTV Camera Feed Panel */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-md flex flex-col">
            <div className="px-3.5 py-2.5 bg-slate-950/85 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                Live CCTV Feed Inspector
              </span>

              {/* Quick camera switcher buttons */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {(['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05'] as const).map(id => (
                  <button
                    key={id}
                    onClick={() => setActiveCamId(id)}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      activeCamId === id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                    }`}
                  >
                    {id.replace('CAM-', 'C')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2">
              <CCTVPlayer camera={activeCamera} compact={true} />
            </div>
          </div>

          {/* Real-Time Detection Activity Stream */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-md flex-1 flex flex-col">
            <div className="px-3.5 py-2.5 bg-slate-950/85 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-slate-200">
                  Live AI Detection Ticker
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerManualDetection()}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Simulate</span>
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
                >
                  All Vehicles
                </button>
              </div>
            </div>

            <div className="p-2 divide-y divide-slate-800/60 overflow-y-auto max-h-[220px]">
              {recentDetections.map(det => (
                <div
                  key={det.id}
                  onClick={() => {
                    setSelectedVehicleId(det.vehicleId);
                    setActiveTab('vehicles');
                  }}
                  className="py-2 px-2 hover:bg-slate-800/40 rounded transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">
                      {det.vehicleId}
                    </span>
                    <span className="font-mono text-[11px] bg-slate-950 text-slate-200 px-1.5 py-0.5 rounded border border-slate-800">
                      {det.licensePlate}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {det.color} {det.vehicleType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-cyan-400 font-semibold">{det.cameraId}</span>
                    <span className="text-emerald-400 font-bold">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-500">
                      {new Date(det.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Alerts & Watchlist Quick Triage */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-slate-200">
              High-Priority Dispatch Alerts
            </span>
          </div>

          <button
            onClick={() => setActiveTab('alerts')}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({alerts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {criticalAlerts.length === 0 ? (
            <div className="col-span-3 text-center text-slate-500 py-3 text-xs">
              No critical unresolved alerts.
            </div>
          ) : (
            criticalAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-rose-400 font-bold">{alert.severity.toUpperCase()}</span>
                    <span className="text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">{alert.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  {alert.vehicleId && (
                    <button
                      onClick={() => {
                        setSelectedVehicleId(alert.vehicleId!);
                        setActiveTab('vehicles');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    >
                      {alert.vehicleId} [{alert.licensePlate}]
                    </button>
                  )}
                  {alert.cameraId && (
                    <span className="text-slate-400">{alert.cameraId}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
