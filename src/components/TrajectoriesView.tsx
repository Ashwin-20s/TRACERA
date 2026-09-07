import React, { useState, useMemo } from 'react';
import { useTracera } from '../context/TraceraContext';
import { InteractiveMap } from './InteractiveMap';
import {
  GitFork,
  Car,
  Clock,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Layers,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

export const TrajectoriesView: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    cameras,
    routeSegments
  } = useTracera();

  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  // Compute hops and estimated distances
  const trajectoryHops = useMemo(() => {
    if (!currentVehicle || !currentVehicle.routePath) return [];

    let totalDist = 0;
    return currentVehicle.routePath.map((camId, idx) => {
      const cam = cameras.find(c => c.id === camId);
      const detection = currentVehicle.detections.find(d => d.cameraId === camId);

      let stepDist = 0;
      let estTime = 0;
      if (idx > 0) {
        const prevCam = currentVehicle.routePath[idx - 1];
        const seg = routeSegments.find(
          r =>
            (r.fromCamera === prevCam && r.toCamera === camId) ||
            (r.fromCamera === camId && r.toCamera === prevCam)
        );
        stepDist = seg ? seg.distanceKm : 1.5;
        estTime = seg ? seg.avgTravelTimeMin : 3.5;
        totalDist += stepDist;
      }

      return {
        stepNumber: idx + 1,
        cameraId: camId,
        cameraName: cam?.locationName || camId,
        detection,
        stepDist,
        estTime,
        totalDist: parseFloat(totalDist.toFixed(1))
      };
    });
  }, [currentVehicle, cameras, routeSegments]);

  return (
    <div className="space-y-4">
      {/* Header and Vehicle Quick Select */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            Vehicle Trajectory & Corridor Reconstruction
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spatial-temporal path tracking across optical surveillance nodes.
          </p>
        </div>

        {/* Vehicle Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full lg:max-w-xl">
          {filteredVehicles.map(v => {
            const isSelected = v.id === currentVehicle?.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Car className="w-3 h-3 text-cyan-400" />
                <span className="font-bold">{v.id}</span>
                <span className="text-[11px] text-slate-400">[{v.licensePlate}]</span>
                {v.isWatchlist && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Map with Trajectory + Trajectory Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {currentVehicle?.id}
              </span>
              <span className="text-slate-400">
                Spatial Trajectory Map ({currentVehicle?.routePath.length} Nodes)
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kinematic Interpolation Active
            </div>
          </div>

          <div className="flex-1 min-h-[480px]">
            <InteractiveMap selectedVehicle={currentVehicle} className="h-full min-h-[480px]" />
          </div>
        </div>

        {/* Right Column: Node-by-Node Corridor Flow (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Corridor Waypoint Sequence
              </span>
              <span className="font-mono text-xs text-cyan-400 font-bold">
                {currentVehicle?.averageSpeedKmh} km/h Mean Velocity
              </span>
            </div>

            {/* Path Formula Display */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 flex-wrap font-mono text-xs text-slate-200">
              <span className="text-cyan-400 font-bold">{currentVehicle?.id}</span>
              <span className="text-slate-500">➔</span>
              {currentVehicle?.routePath.map((camId, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    {camId}
                  </span>
                  {idx < (currentVehicle?.routePath.length || 0) - 1 && (
                    <span className="text-slate-500">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stepper Details */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {trajectoryHops.map((hop, idx) => (
              <div
                key={hop.stepNumber}
                className="relative bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shadow">
                      {hop.stepNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-400">
                          {hop.cameraId}
                        </span>
                        <span className="text-xs font-medium text-slate-200">
                          {hop.cameraName}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Cumulative Distance: <strong className="text-slate-200">{hop.totalDist} km</strong>
                        {hop.stepDist > 0 && ` (+${hop.stepDist} km from previous)`}
                      </div>
                    </div>
                  </div>

                  {hop.detection && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {(hop.detection.confidence * 100).toFixed(1)}% match
                    </span>
                  )}
                </div>

                {hop.detection && (
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px]">TIME AT NODE:</span>
                      <div className="text-slate-300 font-semibold mt-0.5">
                        {new Date(hop.detection.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">CORRIDOR SPEED:</span>
                      <div className="text-cyan-300 font-semibold mt-0.5">
                        {hop.detection.speedKmh} km/h
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
