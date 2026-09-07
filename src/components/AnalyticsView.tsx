import React, { useState } from 'react';
import { useTracera } from '../context/TraceraContext';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Car,
  Compass,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { cameras, vehicles, routeSegments, detections } = useTracera();
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'density' | 'speed'>('volume');

  // Compute total volume
  const totalVehiclesDetected = cameras.reduce((acc, c) => acc + c.vehicleCount, 0);
  const maxCameraCount = Math.max(...cameras.map(c => c.vehicleCount), 1);

  // Vehicle classification distribution
  const typeCounts = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {});

  const typeEntries = Object.entries(typeCounts) as [string, number][];
  const totalTypedVehicles = vehicles.length || 1;

  // Most used routes sorted by volume
  const sortedRoutes = [...routeSegments].sort((a, b) => b.vehicleVolumePerHour - a.vehicleVolumePerHour);
  const maxRouteVolume = Math.max(...sortedRoutes.map(r => r.vehicleVolumePerHour), 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Urban Traffic Flow & Arterial Density Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated multi-camera throughput, congestion dynamics, and corridor transit metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sample Interval: 1s Rolling Window</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>NETWORK VOLUME</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {totalVehiclesDetected} <span className="text-xs font-normal text-slate-400">Total Passes</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            +14.8% vs last hour
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>NETWORK DENSITY</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-300">
            68.4% <span className="text-xs font-normal text-slate-400">Capacity</span>
          </div>
          <div className="text-[11px] text-yellow-500 font-mono">
            Downtown Central: Moderate Congestion
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AVG CORRIDOR TRANSIT</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            4.1 <span className="text-xs font-normal text-slate-400">Minutes</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Across 5 Connected Arterials
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>OPTICAL MATCH RATE</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            96.8% <span className="text-xs font-normal text-slate-400">Confidence</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Continuous LPR & Re-ID Lock
          </div>
        </div>
      </div>

      {/* Row 2: Vehicle Count per Camera & Vehicle Classification Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Vehicle Count per Camera (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Vehicle Count per Camera Sensor
              </h3>
              <p className="text-xs text-slate-400">
                Live vehicle throughput monitored per node.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              5 Cameras Active
            </span>
          </div>

          {/* Interactive Bar Chart */}
          <div className="space-y-3.5 pt-2">
            {cameras.map(cam => {
              const pct = Math.round((cam.vehicleCount / maxCameraCount) * 100);
              return (
                <div key={cam.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{cam.id}</span>
                      <span className="text-slate-300 font-sans">{cam.locationName}</span>
                    </div>
                    <span className="font-bold text-cyan-300">{cam.vehicleCount} vehicles</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Vehicle Classification Mix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Vehicle Type Classification
            </h3>
            <p className="text-xs text-slate-400">
              AI classified fleet profile across city grid.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {typeEntries.map(([type, count]) => {
              const pct = Math.round((count / totalTypedVehicles) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{type}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Most-Used Routes & Average Travel Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Most-Used Routes (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Most-Used Road Segments (Hourly Volume)
              </h3>
              <p className="text-xs text-slate-400">
                Key arterial connections between cameras ranked by flow rate.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {sortedRoutes.map(route => {
              const pct = Math.round((route.vehicleVolumePerHour / maxRouteVolume) * 100);
              const badgeClass =
                route.congestionLevel === 'Heavy'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : route.congestionLevel === 'Moderate'
                  ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800';

              return (
                <div key={route.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{route.fromCamera}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-cyan-400">{route.toCamera}</span>
                      <span className="text-slate-400 font-sans hidden sm:inline">
                        ({route.fromName} ➔ {route.toName})
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badgeClass}`}>
                      {route.congestionLevel}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                    <span>Flow: <strong className="text-slate-200">{route.vehicleVolumePerHour} vph</strong></span>
                    <span>Distance: <strong className="text-slate-200">{route.distanceKm} km</strong></span>
                    <span>Travel Time: <strong className="text-cyan-400">{route.avgTravelTimeMin} min</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average Travel Time Corridor Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Inter-Camera Transit Times
            </h3>
            <p className="text-xs text-slate-400">
              Empirical travel duration between monitored intersections.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {routeSegments.map(seg => (
              <div
                key={seg.id}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{seg.fromCamera}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="text-cyan-400 font-bold">{seg.toCamera}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{seg.distanceKm} km</span>
                  <span className="font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {seg.avgTravelTimeMin} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
