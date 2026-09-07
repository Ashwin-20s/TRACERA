import React, { useState, useMemo } from 'react';
import { useTracera } from '../context/TraceraContext';
import { AlertSeverity, AlertStatus } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Car,
  Video,
  Filter,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    updateAlertStatus,
    setSelectedVehicleId,
    setSelectedCameraId,
    setActiveTab,
    triggerManualDetection
  } = useTracera();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchSev = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchStat = statusFilter === 'ALL' || alert.status === statusFilter;
      return matchSev && matchStat;
    });
  }, [alerts, severityFilter, statusFilter]);

  const unresolvedCount = alerts.filter(a => a.status === 'new').length;

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            NOTICE
          </span>
        );
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            ACTION REQUIRED
          </span>
        );
      case 'reviewed':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            UNDER REVIEW
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Simulation trigger */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Dispatch & Automated Anomaly Incident Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time optical trigger alerts: watchlist matches, corridor deviations, and low-confidence plate reads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400">
            Unresolved: <strong className="text-rose-400 font-bold">{unresolvedCount}</strong>
          </div>

          <button
            onClick={() => triggerManualDetection('CAM-02')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Simulated Incident</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">Severity:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'critical', 'warning', 'info'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">Status:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'new', 'reviewed', 'resolved'].map(stat => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition cursor-pointer ${
                  statusFilter === stat
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {stat === 'new' ? 'New (Unresolved)' : stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/80 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
            No incidents found matching the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition ${
                alert.status === 'new'
                  ? alert.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-950/30'
                    : 'bg-slate-900/90 border-slate-700'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {getSeverityBadge(alert.severity)}
                  <span className="font-mono text-xs text-slate-400">{alert.id}</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {alert.title}
                  </span>
                  {getStatusBadge(alert.status)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description & Context */}
              <div className="py-3 text-xs text-slate-300 leading-relaxed">
                {alert.description}
              </div>

              {/* Bottom Metadata & Dispatch Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
                  {alert.vehicleId && (
                    <button
                      onClick={() => {
                        setSelectedVehicleId(alert.vehicleId!);
                        setActiveTab('vehicles');
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>{alert.vehicleId} [{alert.licensePlate}]</span>
                    </button>
                  )}

                  {alert.cameraId && (
                    <button
                      onClick={() => {
                        setSelectedCameraId(alert.cameraId!);
                        setActiveTab('cameras');
                      }}
                      className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alert.cameraId} ({alert.cameraName})</span>
                    </button>
                  )}

                  {alert.confidence && (
                    <span>
                      Confidence: <strong className="text-slate-200">{(alert.confidence * 100).toFixed(1)}%</strong>
                    </span>
                  )}

                  {alert.reviewedBy && (
                    <span className="text-slate-500">
                      Actioned by: <span className="text-slate-300">{alert.reviewedBy}</span>
                    </span>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2">
                  {alert.status === 'new' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'reviewed')}
                      className="px-3 py-1.5 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-600/40 text-xs font-semibold transition cursor-pointer"
                    >
                      Mark Reviewed
                    </button>
                  )}

                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {alert.vehicleId && (
                    <button
                      onClick={() => {
                        setSelectedVehicleId(alert.vehicleId!);
                        setActiveTab('trajectories');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Map Route</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
