import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Camera, Vehicle, CameraId } from '../types';
import { useTracera } from '../context/TraceraContext';
import {
  Compass,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Car,
  Video,
  Info,
  Maximize2
} from 'lucide-react';

interface InteractiveMapProps {
  selectedVehicle?: Vehicle | null;
  onCameraClick?: (camera: Camera) => void;
  className?: string;
  focusCamera?: Camera | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedVehicle: propVehicle,
  onCameraClick,
  className = 'h-[540px]',
  focusCamera
}) => {
  const {
    cameras,
    vehicles,
    selectedVehicle: contextVehicle,
    setSelectedVehicleId,
    setSelectedCameraId,
    routeSegments,
    demoMode,
    setActiveTab
  } = useTracera();

  const vehicleToTrack = propVehicle || contextVehicle;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const cameraMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const roadNetworkLayerRef = useRef<L.LayerGroup | null>(null);
  const trajectoryLayerRef = useRef<L.LayerGroup | null>(null);
  const animatedVehicleMarkerRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [activeRoadLayer, setActiveRoadLayer] = useState<boolean>(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center of imaginary city road grid
    const centerLat = 37.7785;
    const centerLng = -122.4110;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High contrast CartoDB Dark Matter tile layer for traffic control ops
    const darkTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }
    );
    darkTiles.addTo(map);

    const roadsLayer = L.layerGroup().addTo(map);
    const cameraLayer = L.layerGroup().addTo(map);
    const trajectoryLayer = L.layerGroup().addTo(map);

    roadNetworkLayerRef.current = roadsLayer;
    cameraMarkersLayerRef.current = cameraLayer;
    trajectoryLayerRef.current = trajectoryLayer;
    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw Connecting Road Network
  useEffect(() => {
    const layer = roadNetworkLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!activeRoadLayer) return;

    routeSegments.forEach(route => {
      // Background glow line
      L.polyline(route.coordinates, {
        color: '#1e293b',
        weight: 8,
        opacity: 0.8
      }).addTo(layer);

      // Congestion-coded road segment
      const roadColor =
        route.congestionLevel === 'Heavy'
          ? '#f97316'
          : route.congestionLevel === 'Moderate'
          ? '#eab308'
          : '#06b6d4';

      const line = L.polyline(route.coordinates, {
        color: roadColor,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6'
      }).addTo(layer);

      line.bindTooltip(
        `<div class="font-mono text-xs text-slate-100">
          <span class="font-semibold">${route.fromCamera} ➔ ${route.toCamera}</span><br/>
          <span class="text-[10px] text-slate-400">${route.distanceKm} km • Avg ${route.avgTravelTimeMin}m • ${route.congestionLevel} Traffic</span>
        </div>`,
        { sticky: true, className: 'leaflet-dark-tooltip' }
      );
    });
  }, [routeSegments, activeRoadLayer]);

  // Draw 5 Camera Markers
  useEffect(() => {
    const layer = cameraMarkersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    cameras.forEach(cam => {
      // Custom HTML DivIcon for CCTV cameras
      const isOnline = cam.status === 'ONLINE';
      const customIcon = L.divIcon({
        className: 'camera-div-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full ${
              isOnline ? 'bg-slate-900 border-2 border-cyan-400 shadow-lg shadow-cyan-500/40' : 'bg-slate-900 border-2 border-slate-600'
            } flex items-center justify-center transition-transform transform hover:scale-115">
              <div class="w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}"></div>
            </div>
            <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-cyan-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-800/80 shadow">
              ${cam.id}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon }).addTo(layer);

      // Popup Content
      const popupHtml = `
        <div class="p-2 min-w-[210px] font-sans text-slate-200">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span class="font-mono font-bold text-cyan-400 text-xs">${cam.id}</span>
            <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
              isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }">${cam.status}</span>
          </div>
          <div class="text-xs font-semibold text-white mb-1">${cam.locationName}</div>
          <div class="text-[11px] text-slate-400 mb-2">${cam.direction}</div>
          <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-slate-900 p-1.5 rounded mb-2.5 border border-slate-800">
            <div>CARS: <span class="text-cyan-300 font-bold">${cam.vehicleCount}</span></div>
            <div>RES: <span class="text-slate-300">${cam.resolution}</span></div>
            <div>FPS: <span class="text-slate-300">${cam.fps}</span></div>
            <div>RATE: <span class="text-slate-300">${cam.bitrate}</span></div>
          </div>
          <button id="popup-btn-${cam.id}" class="w-full text-center py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer transition">
            Inspect CCTV Feed
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'leaflet-dark-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${cam.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedCameraId(cam.id);
            setActiveTab('cameras');
          };
        }
      });

      marker.on('click', () => {
        if (onCameraClick) onCameraClick(cam);
      });
    });
  }, [cameras, onCameraClick, setSelectedCameraId, setActiveTab]);

  // Focus on single camera if prop changes
  useEffect(() => {
    if (focusCamera && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([focusCamera.lat, focusCamera.lng], 16, {
        duration: 1.2
      });
    }
  }, [focusCamera]);

  // Build Vehicle Trajectory Route Coordinates
  const getTrajectoryCoordinates = useCallback((routePath: CameraId[]): [number, number][] => {
    if (!routePath || routePath.length === 0) return [];
    const coords: [number, number][] = [];

    for (let i = 0; i < routePath.length; i++) {
      const currentCamId = routePath[i];
      const currentCam = cameras.find(c => c.id === currentCamId);
      if (!currentCam) continue;

      if (i === 0) {
        coords.push([currentCam.lat, currentCam.lng]);
      } else {
        const prevCamId = routePath[i - 1];
        // Find if direct road segment exists
        const seg = routeSegments.find(
          r =>
            (r.fromCamera === prevCamId && r.toCamera === currentCamId) ||
            (r.fromCamera === currentCamId && r.toCamera === prevCamId)
        );

        if (seg) {
          const segCoords = seg.fromCamera === prevCamId ? seg.coordinates : [...seg.coordinates].reverse();
          // avoid duplicating the start coordinate
          for (let k = 1; k < segCoords.length; k++) {
            coords.push(segCoords[k]);
          }
        } else {
          // Direct fallback line
          coords.push([currentCam.lat, currentCam.lng]);
        }
      }
    }
    return coords;
  }, [cameras, routeSegments]);

  // Draw Vehicle Trajectory and animate vehicle marker
  useEffect(() => {
    const layer = trajectoryLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    if (animatedVehicleMarkerRef.current) {
      animatedVehicleMarkerRef.current.remove();
      animatedVehicleMarkerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!vehicleToTrack || !vehicleToTrack.routePath || vehicleToTrack.routePath.length === 0) {
      return;
    }

    const fullTrajectory = getTrajectoryCoordinates(vehicleToTrack.routePath);
    if (fullTrajectory.length < 2) return;

    // Glowing outer trajectory polyline
    L.polyline(fullTrajectory, {
      color: vehicleToTrack.isWatchlist ? '#e11d48' : '#06b6d4',
      weight: 9,
      opacity: 0.35
    }).addTo(layer);

    // Inner sharp trajectory polyline
    L.polyline(fullTrajectory, {
      color: vehicleToTrack.isWatchlist ? '#f43f5e' : '#38bdf8',
      weight: 4,
      opacity: 0.95,
      dashArray: '8, 6'
    }).addTo(layer);

    // Waypoint Step Markers on each camera node of the trajectory
    vehicleToTrack.routePath.forEach((camId, index) => {
      const cam = cameras.find(c => c.id === camId);
      if (!cam) return;

      const stepIcon = L.divIcon({
        className: 'trajectory-step-icon',
        html: `
          <div class="w-6 h-6 rounded-full bg-slate-900 border-2 ${
            vehicleToTrack.isWatchlist ? 'border-rose-500 text-rose-300' : 'border-cyan-400 text-cyan-300'
          } flex items-center justify-center font-mono text-[11px] font-bold shadow-lg shadow-cyan-900/50">
            ${index + 1}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([cam.lat, cam.lng], { icon: stepIcon, zIndexOffset: 200 })
        .addTo(layer)
        .bindTooltip(
          `Step ${index + 1}: ${camId} (${cam.locationName})`,
          { className: 'leaflet-dark-tooltip', direction: 'top' }
        );
    });

    // Animate Vehicle Marker along the trajectory
    const vehicleIcon = L.divIcon({
      className: 'animated-vehicle-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full ${
            vehicleToTrack.isWatchlist
              ? 'bg-rose-500/30 border-2 border-rose-500 text-rose-200'
              : 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-200'
          } flex items-center justify-center shadow-xl backdrop-blur-xs animate-pulse">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
            </svg>
          </div>
          <div class="absolute -top-6 bg-slate-950/95 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
            vehicleToTrack.isWatchlist ? 'border-rose-500 text-rose-300' : 'border-cyan-400 text-cyan-300'
          } whitespace-nowrap shadow-md">
            ${vehicleToTrack.id} • ${vehicleToTrack.licensePlate}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const startPos = fullTrajectory[0];
    const animatedMarker = L.marker(startPos, {
      icon: vehicleIcon,
      zIndexOffset: 500
    }).addTo(map);
    animatedVehicleMarkerRef.current = animatedMarker;

    // Trajectory interpolation animation
    let currentSegmentIndex = 0;
    let segProgress = 0;
    const speedFactor = 0.007;

    const animate = () => {
      if (!isPlayingAnimation || !mapInstanceRef.current) return;

      if (currentSegmentIndex >= fullTrajectory.length - 1) {
        // Loop back after reaching destination
        currentSegmentIndex = 0;
        segProgress = 0;
      }

      const p1 = fullTrajectory[currentSegmentIndex];
      const p2 = fullTrajectory[currentSegmentIndex + 1];

      if (p1 && p2) {
        segProgress += speedFactor;
        if (segProgress >= 1) {
          segProgress = 0;
          currentSegmentIndex++;
        }

        const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
        const lng = p1[1] + (p2[1] - p1[1]) * segProgress;

        animatedMarker.setLatLng([lat, lng]);

        const overallProgress = (currentSegmentIndex + segProgress) / (fullTrajectory.length - 1);
        setAnimationProgress(overallProgress);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlayingAnimation) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Auto-fit bounds if first time rendering trajectory
    const bounds = L.latLngBounds(fullTrajectory);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animatedMarker.remove();
    };
  }, [vehicleToTrack, getTrajectoryCoordinates, cameras, isPlayingAnimation]);

  const resetAnimation = () => {
    setAnimationProgress(0);
    setIsPlayingAnimation(true);
  };

  return (
    <div className={`relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden ${className}`}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header HUD: Active Trajectory details */}
      {vehicleToTrack && (
        <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-xl max-w-sm sm:max-w-md">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${vehicleToTrack.isWatchlist ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
              <span className="font-mono font-bold text-sm text-cyan-300">{vehicleToTrack.id}</span>
              <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                {vehicleToTrack.licensePlate}
              </span>
              <span className="text-xs text-slate-400">({vehicleToTrack.type})</span>
            </div>

            <button
              onClick={() => {
                setSelectedVehicleId(vehicleToTrack.id);
                setActiveTab('trajectories');
              }}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Analyze
            </button>
          </div>

          {/* Route path breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 flex-wrap">
            {vehicleToTrack.routePath.map((camId, idx) => (
              <React.Fragment key={idx}>
                <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px]">
                  {camId}
                </span>
                {idx < vehicleToTrack.routePath.length - 1 && (
                  <span className="text-slate-500">➔</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Animation playback controller */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title={isPlayingAnimation ? 'Pause vehicle route playback' : 'Play vehicle route playback'}
              >
                {isPlayingAnimation ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={resetAnimation}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <span className="font-mono text-[11px] text-cyan-400">
                {Math.round(animationProgress * 100)}% Transit
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-400">
              Avg {vehicleToTrack.averageSpeedKmh} km/h
            </span>
          </div>
        </div>
      )}

      {/* Floating Right Map Controls: Camera Jump Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-semibold">
          Jump to Camera
        </span>
        <div className="flex flex-col gap-1">
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([cam.lat, cam.lng], 16, { duration: 1.0 });
                }
              }}
              className="text-left px-2 py-1 rounded text-xs font-mono bg-slate-950/70 hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-300 border border-slate-800/80 transition flex items-center justify-between gap-2"
            >
              <span>{cam.id}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveRoadLayer(!activeRoadLayer)}
          className={`mt-1 text-center py-1 px-2 rounded text-[11px] font-mono border transition ${
            activeRoadLayer
              ? 'bg-slate-800 text-cyan-300 border-cyan-800'
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
          title="Toggle connecting road network layer"
        >
          {activeRoadLayer ? 'Roads: Visible' : 'Roads: Hidden'}
        </button>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-4 shadow-lg hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950" />
          <span>Camera Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400" />
          <span>Low Traffic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-yellow-400" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-orange-500" />
          <span>Heavy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 border-b-2 border-dashed border-cyan-400" />
          <span>Trajectory</span>
        </div>
      </div>
    </div>
  );
};
