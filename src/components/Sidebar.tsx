import React from 'react';
import { useTracera } from '../context/TraceraContext';
import { ActiveNavTab } from '../types';
import {
  LayoutDashboard,
  Video,
  Car,
  GitFork,
  BarChart3,
  ShieldAlert,
  Server,
  Cpu,
  Wifi
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cameras,
    vehicles,
    unresolvedAlertsCount
  } = useTracera();

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'cameras',
      label: 'Cameras',
      icon: Video,
      badge: `${cameras.length}`,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: `${vehicles.length}`,
      badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
    },
    {
      id: 'trajectories',
      label: 'Trajectories',
      icon: GitFork,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: ShieldAlert,
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    }
  ];

  return (
    <aside className="w-16 lg:w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-20">
      {/* Navigation items */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-slate-500 hidden lg:block">
          Operations Core
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="hidden lg:inline">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`hidden lg:inline text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Telemetry Box */}
      <div className="p-3 border-t border-slate-800/80 hidden lg:block">
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Inference Engine
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              OPTIMAL
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              Node Stream
            </span>
            <span className="text-slate-300">5 RTSP/HLS</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
              Telemetry Sync
            </span>
            <span className="text-slate-300">12 ms</span>
          </div>
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Spatial Model: Carto OSM</span>
            <span className="text-cyan-500/80">Leaflet v1.9</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
