import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Detection } from '../types';
import { useTracera } from '../context/TraceraContext';
import {
  Play,
  Pause,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CCTVPlayerProps {
  camera: Camera;
  compact?: boolean;
  onFocusMap?: (camera: Camera) => void;
  onSelectCamera?: (camera: Camera) => void;
}

export const CCTVPlayer: React.FC<CCTVPlayerProps> = ({
  camera,
  compact = false,
  onFocusMap,
  onSelectCamera
}) => {
  const {
    updateCameraVideo,
    clearCameraVideo,
    detections,
    triggerManualDetection,
    setSelectedVehicleId,
    setActiveTab
  } = useTracera();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeBoxes, setActiveBoxes] = useState<Array<{
    id: string;
    vId: string;
    plate: string;
    type: string;
    conf: number;
    speed: number;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  }>>([]);

  // Filter latest detections for this camera
  const cameraDetections = detections.filter(d => d.cameraId === camera.id);
  const latestDetection = cameraDetections[0] || null;

  // Handle local video file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload an MP4 or WebM video file.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    updateCameraVideo(camera.id, objectUrl, file.name);
    setIsPlaying(true);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Video playback controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Simulated CCTV stream animation on HTML5 canvas when no video uploaded
  useEffect(() => {
    if (camera.uploadedVideoUrl) return; // Skip canvas loop if real video is loaded

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Simulated traffic particles
    const laneCount = camera.laneCount || 4;
    const simulatedCars = Array.from({ length: 4 }, (_, i) => ({
      lane: i % laneCount,
      y: (i * 0.25) + 0.1,
      speed: 0.003 + (i * 0.0012),
      plate: `7TR${100 + i * 14}`,
      type: ['Sedan', 'SUV', 'Truck', 'EV'][i % 4],
      vId: `TR-00${i + 1}`,
      color: ['#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'][i % 4],
      conf: 0.94 + (i * 0.015)
    }));

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark road canvas background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw asphalt road surface with perspective lines
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h);
      ctx.lineTo(w * 0.35, h * 0.25);
      ctx.lineTo(w * 0.65, h * 0.25);
      ctx.lineTo(w * 0.9, h);
      ctx.closePath();
      ctx.fill();

      // Road shoulder lines
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h);
      ctx.lineTo(w * 0.35, h * 0.25);
      ctx.moveTo(w * 0.9, h);
      ctx.lineTo(w * 0.65, h * 0.25);
      ctx.stroke();

      // Dashed lane divider lines
      ctx.strokeStyle = '#4b5563';
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -frame * 1.5;
      for (let l = 1; l < laneCount; l++) {
        const ratio = l / laneCount;
        const bottomX = w * 0.1 + (w * 0.8) * ratio;
        const topX = w * 0.35 + (w * 0.3) * ratio;
        ctx.beginPath();
        ctx.moveTo(bottomX, h);
        ctx.lineTo(topX, h * 0.25);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Horizon line & background structure
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h * 0.25);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(0, 0, w, h * 0.25);

      // Simulated moving cars
      simulatedCars.forEach(car => {
        car.y += car.speed;
        if (car.y > 0.95) car.y = 0.28;

        const scale = 0.3 + car.y * 0.7; // perspective scaling
        const laneW = (w * 0.8) / laneCount;
        const xCenter = w * 0.15 + (car.lane + 0.5) * laneW;
        const carW = 44 * scale;
        const carH = 26 * scale;
        const carX = xCenter - carW / 2;
        const carY = car.y * h;

        // Vehicle body shadow & shape
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(carX - 2, carY + 2, carW + 4, carH + 4);

        ctx.fillStyle = car.color;
        ctx.fillRect(carX, carY, carW, carH);

        // Headlights / taillights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(carX + 2, carY + carH - 2, 4 * scale, 2);
        ctx.fillRect(carX + carW - 6 * scale, carY + carH - 2, 4 * scale, 2);

        // AI Bounding Box (YOLO-style)
        const pad = 4 * scale;
        const bx = carX - pad;
        const by = carY - pad;
        const bw = carW + pad * 2;
        const bh = carH + pad * 2;

        ctx.strokeStyle = '#06b6d4'; // cyan detection box
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner accents
        const cornerLen = 5 * scale;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        // Top Left
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerLen);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerLen, by);
        // Bottom Right
        ctx.moveTo(bx + bw, by + bh - cornerLen);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw - cornerLen, by + bh);
        ctx.stroke();

        // Label pill (ID + Plate + Confidence)
        if (scale > 0.5) {
          const label = `${car.vId} [${car.plate}] ${(car.conf * 100).toFixed(0)}%`;
          ctx.font = '9px "JetBrains Mono", monospace';
          const textW = ctx.measureText(label).width + 6;
          ctx.fillStyle = 'rgba(8, 145, 178, 0.85)';
          ctx.fillRect(bx, by - 14, textW, 13);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, bx + 3, by - 4);
        }
      });

      // Radar scanning line effect
      const scanY = (frame * 1.8) % h;
      const grad = ctx.createLinearGradient(0, scanY - 15, 0, scanY);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 15, w, 15);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // CCTV On-Screen Display (OSD)
      const now = new Date();
      const timecode = `${camera.id} • ${now.toISOString().replace('T', ' ').slice(0, 19)} • ${camera.fps}FPS`;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(6, 6, ctx.measureText(timecode).width + 24, 18);

      // Red recording dot
      if (Math.floor(frame / 25) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(14, 15, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(timecode, 24, 18);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [camera.uploadedVideoUrl, camera.id, camera.fps, camera.laneCount]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-lg transition-all ${
        isExpanded ? 'fixed inset-4 z-50 bg-slate-950 border-cyan-500/50 shadow-2xl' : ''
      }`}
    >
      {/* Panel Header */}
      <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/60">
            {camera.id}
          </span>
          <span className="font-medium text-slate-200 truncate max-w-[140px] sm:max-w-[200px]" title={camera.locationName}>
            {camera.locationName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Online status indicator */}
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {camera.status}
          </span>

          {/* Vehicle Count */}
          <span className="font-mono text-slate-300 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded">
            {camera.vehicleCount} cars
          </span>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
            title={isExpanded ? 'Minimize View' : 'Maximize Video'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video / Canvas Area */}
      <div
        className="relative bg-black flex-1 min-h-[190px] aspect-video flex items-center justify-center overflow-hidden group"
        onDragOver={e => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
      >
        {camera.uploadedVideoUrl ? (
          <>
            <video
              ref={videoRef}
              src={camera.uploadedVideoUrl}
              className="w-full h-full object-cover"
              loop
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />

            {/* Overlay detection bounding boxes on top of uploaded video */}
            {latestDetection && (
              <div
                className="absolute border-2 border-cyan-400 pointer-events-none rounded transition-all duration-300 animate-pulse"
                style={{
                  left: `${latestDetection.boundingBox?.x || 30}%`,
                  top: `${latestDetection.boundingBox?.y || 35}%`,
                  width: `${latestDetection.boundingBox?.w || 25}%`,
                  height: `${latestDetection.boundingBox?.h || 22}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-cyan-900/90 text-white font-mono text-[10px] px-1.5 py-0.5 rounded border border-cyan-400 whitespace-nowrap shadow">
                  {latestDetection.vehicleId} [{latestDetection.licensePlate}] {(latestDetection.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </>
        ) : (
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            className="w-full h-full object-cover select-none"
          />
        )}

        {/* Drag & drop highlight overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-cyan-950/85 border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center gap-2 z-20 backdrop-blur-xs">
            <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
            <span className="text-sm font-semibold text-cyan-200">Drop MP4/WebM to mount feed</span>
          </div>
        )}

        {/* Top-Right Feed HUD badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 pointer-events-none">
          {camera.uploadedVideoUrl ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
              LOCAL VIDEO: {camera.uploadedFileName}
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 border border-cyan-800/60">
              AI SYNTHESIS FEED
            </span>
          )}
        </div>

        {/* Upload Button Overlay (visible on hover) */}
        <div className="absolute bottom-12 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-xs cursor-pointer"
            title="Upload local MP4 or WebM video file"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Video</span>
          </button>
          {camera.uploadedVideoUrl && (
            <button
              onClick={() => clearCameraVideo(camera.id)}
              className="px-2 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs flex items-center gap-1 shadow-lg backdrop-blur-xs cursor-pointer"
              title="Reset to simulated camera feed"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={onFileInputChange}
        />
      </div>

      {/* Video Control Bar (Shown for uploaded videos) */}
      {camera.uploadedVideoUrl ? (
        <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <span className="font-mono text-[11px] text-slate-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>

          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <span className="font-mono text-[11px] text-slate-500 w-12">
            {formatTime(duration)}
          </span>

          <button
            onClick={toggleMute}
            className="p-1 rounded text-slate-400 hover:text-slate-200"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        /* Status bar when in simulated mode */
        <div className="bg-slate-950/80 px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>RES: {camera.resolution}</span>
            <span>BITRATE: {camera.bitrate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerManualDetection(camera.id)}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              title="Simulate detection on this camera"
            >
              <Zap className="w-3 h-3" />
              <span>Detect</span>
            </button>

            {onFocusMap && (
              <button
                onClick={() => onFocusMap(camera)}
                className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer ml-1"
                title="View on Map"
              >
                <Compass className="w-3 h-3" />
                <span>Map</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Latest Detection Ticker for this camera */}
      {latestDetection && !compact && (
        <div
          onClick={() => {
            setSelectedVehicleId(latestDetection.vehicleId);
            setActiveTab('vehicles');
          }}
          className="bg-slate-950 px-3 py-1.5 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono hover:bg-slate-900 cursor-pointer transition"
          title="Click to track this vehicle"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-400">LAST SEEN:</span>
            <span className="text-cyan-300 font-semibold">{latestDetection.vehicleId}</span>
            <span className="text-slate-300">[{latestDetection.licensePlate}]</span>
            <span className="text-slate-400">({latestDetection.vehicleType})</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-emerald-400 font-semibold">
              {(latestDetection.confidence * 100).toFixed(1)}%
            </span>
            <span className="text-slate-500">
              {Math.max(1, Math.floor((Date.now() - new Date(latestDetection.timestamp).getTime()) / 1000))}s ago
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
