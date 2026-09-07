import React, { useState } from 'react';
import { useTracera } from '../context/TraceraContext';
import { CCTVPlayer } from './CCTVPlayer';
import { Camera } from '../types';
import {
  Video,
  Grid3X3,
  Columns2,
  Sparkles,
  Upload,
  Info,
  Zap,
  Radio
} from 'lucide-react';

interface CCTVGridProps {
  onFocusMap?: (camera: Camera) => void;
}

export const CCTVGrid: React.FC<CCTVGridProps> = ({ onFocusMap }) => {
  const { cameras, triggerManualDetection, demoMode, toggleDemoMode } = useTracera();
  const [layout, setLayout] = useState<'grid' | 'split'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'custom' | 'simulated'>('all');

  const filteredCameras = cameras.filter(cam => {
    if (selectedFilter === 'custom') return !!cam.uploadedVideoUrl;
    if (selectedFilter === 'simulated') return !cam.uploadedVideoUrl;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            CCTV Live Surveillance Array (5 Cameras)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-node optical sensors covering Metro Arterial & Expressway network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded transition ${
                selectedFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (5)
            </button>
            <button
              onClick={() => setSelectedFilter('custom')}
              className={`px-2.5 py-1 rounded transition ${
                selectedFilter === 'custom'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Video
            </button>
            <button
              onClick={() => setSelectedFilter('simulated')}
              className={`px-2.5 py-1 rounded transition ${
                selectedFilter === 'simulated'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Simulated
            </button>
          </div>

          {/* Trigger detection across all */}
          <button
            onClick={() => triggerManualDetection()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Simulate Detections</span>
          </button>
        </div>
      </div>

      {/* Helpful Hint Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900 p-3 rounded-lg border border-cyan-900/40 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-medium text-cyan-200">
            Local Video Upload & Autonomous AI Synthesis
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Hover over any camera panel and click <strong className="text-slate-200">Upload Video</strong> or drag & drop a local <code className="text-cyan-300">.mp4</code> or <code className="text-cyan-300">.webm</code> file to run real footage with native scrub controls. When empty, TRACERA executes automated traffic simulation with synthetic bounding boxes and license plate classifications.
          </p>
        </div>
      </div>

      {/* 5 Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCameras.map(camera => (
          <CCTVPlayer
            key={camera.id}
            camera={camera}
            onFocusMap={onFocusMap}
          />
        ))}
      </div>
    </div>
  );
};
