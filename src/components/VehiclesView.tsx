import React, { useState, useMemo } from 'react';
import { useTracera } from '../context/TraceraContext';
import { Vehicle, VehicleType } from '../types';
import {
  Search,
  Car,
  Filter,
  ShieldAlert,
  Clock,
  Gauge,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar
} from 'lucide-react';

export const VehiclesView: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    setActiveTab,
    cameras
  } = useTracera();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);

  const vehicleTypes: string[] = ['ALL', 'Sedan', 'SUV', 'Truck', 'EV', 'Van', 'Motorcycle'];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedTypeFilter === 'ALL' || v.type === selectedTypeFilter;
      const matchesWatchlist = !watchlistOnly || v.isWatchlist;

      return matchesSearch && matchesType && matchesWatchlist;
    });
  }, [vehicles, searchQuery, selectedTypeFilter, watchlistOnly]);

  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  const formatRelativeTime = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID (e.g. TR-001), license plate, type, or color..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Watchlist Toggle */}
          <button
            onClick={() => setWatchlistOnly(!watchlistOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer border ${
              watchlistOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Watchlist Targets</span>
          </button>

          {/* Vehicle Type Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {vehicleTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                className={`px-2 py-1 rounded transition text-[11px] font-medium cursor-pointer ${
                  selectedTypeFilter === t
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content: Vehicle List + Vehicle Journey Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Vehicle List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Tracked Vehicle Registry ({filteredVehicles.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Click vehicle to inspect multi-camera route
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[680px] overflow-y-auto">
            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No vehicles match the active query.
              </div>
            ) : (
              filteredVehicles.map(vehicle => {
                const isSelected = activeVehicle?.id === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-3.5 transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 pl-3'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Header line: ID, Plate, Watchlist, Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-cyan-300">
                          {vehicle.id}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-200 font-semibold">
                          {vehicle.licensePlate}
                        </span>
                        <span className="text-xs text-slate-400">
                          {vehicle.color} {vehicle.type}
                        </span>

                        {vehicle.isWatchlist && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            WATCHLIST
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {formatRelativeTime(vehicle.lastSeen)}
                      </span>
                    </div>

                    {/* Multi-Camera Route Path Sequence (Requested Example: TR-001 → CAM-01 → CAM-02 → CAM-03 → CAM-05) */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-slate-400">Route:</span>
                      {vehicle.routePath.map((camId, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                            {camId}
                          </span>
                          {idx < vehicle.routePath.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Bottom Metadata bar */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <div className="flex items-center gap-3">
                        <span>Detections: <strong className="text-slate-200">{vehicle.detections.length}</strong></span>
                        <span>Avg Speed: <strong className="text-slate-200">{vehicle.averageSpeedKmh} km/h</strong></span>
                        <span>Current Node: <strong className="text-cyan-400">{vehicle.currentCameraId}</strong></span>
                      </div>
                      <span className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Vehicle Multi-Camera Detections Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          {activeVehicle ? (
            <div className="flex flex-col h-full">
              {/* Header Details */}
              <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-cyan-300">
                        {activeVehicle.id}
                      </span>
                      <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-bold">
                        {activeVehicle.licensePlate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeVehicle.color} • {activeVehicle.type} • Last logged at {activeVehicle.currentCameraId}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      setSelectedVehicleId(activeVehicle.id);
                      setActiveTab('dashboard');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track on Map</span>
                  </button>
                </div>

                {activeVehicle.isWatchlist && activeVehicle.watchlistReason && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-300">WATCHLIST DISPATCH WARNING:</span>{' '}
                      {activeVehicle.watchlistReason}
                    </div>
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-slate-500 text-[10px]">TOTAL HOPS</div>
                    <div className="font-bold text-slate-200">{activeVehicle.routePath.length} Cameras</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">AVG VELOCITY</div>
                    <div className="font-bold text-cyan-300">{activeVehicle.averageSpeedKmh} km/h</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">FIRST SIGHTING</div>
                    <div className="font-bold text-slate-300">{formatRelativeTime(activeVehicle.firstSeen)}</div>
                  </div>
                </div>
              </div>

              {/* Chronological Detections List Across Cameras */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Detection Timeline ({activeVehicle.detections.length} logs)
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">Most Recent First</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeVehicle.detections.map((det, idx) => (
                    <div key={det.id} className="relative bg-slate-950 p-3 rounded-lg border border-slate-800/90 shadow-sm hover:border-slate-700 transition">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[21px] top-3.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        idx === 0 ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                      }`} />

                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                            {det.cameraId}
                          </span>
                          <span className="text-xs font-medium text-slate-200">
                            {det.cameraName}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400">
                          {formatTimestamp(det.timestamp)}
                        </span>
                      </div>

                      {/* Optical AI Detection Telemetry */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-2 rounded border border-slate-800/80 mt-2">
                        <div>
                          <span className="text-slate-500 text-[10px]">AI CONFIDENCE:</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{ width: `${det.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-emerald-400 font-bold text-[11px]">
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px]">RADAR SPEED:</span>
                          <div className="font-bold text-slate-200 mt-0.5">
                            {det.speedKmh} km/h
                          </div>
                        </div>
                      </div>

                      {det.boundingBox && (
                        <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                          <span>BBOX: [{det.boundingBox.x}%, {det.boundingBox.y}%, {det.boundingBox.w}x{det.boundingBox.h}]</span>
                          <span className="text-cyan-500/80">Optical Plate Match</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a vehicle to view its multi-camera detection timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
