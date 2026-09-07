import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  CameraId,
  Vehicle,
  Detection,
  Alert,
  AlertStatus,
  ActiveNavTab,
} from '../types';
import {
  INITIAL_CAMERAS,
  INITIAL_VEHICLES,
  INITIAL_ALERTS,
  VEHICLE_POOL,
  ROAD_SEGMENTS
} from '../data/mockData';

interface TraceraContextType {
  cameras: Camera[];
  vehicles: Vehicle[];
  detections: Detection[];
  alerts: Alert[];
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  selectedCameraId: CameraId | null;
  setSelectedCameraId: (id: CameraId | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  toggleDemoMode: () => void;
  demoSpeed: number;
  setDemoSpeed: (speed: number) => void;
  updateCameraVideo: (cameraId: CameraId, url: string, fileName: string) => void;
  clearCameraVideo: (cameraId: CameraId) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus, reviewedBy?: string) => void;
  triggerManualDetection: (customCameraId?: CameraId) => void;
  selectedVehicle: Vehicle | null;
  selectedCamera: Camera | null;
  totalActiveDetections: number;
  unresolvedAlertsCount: number;
  routeSegments: typeof ROAD_SEGMENTS;
}

const TraceraContext = createContext<TraceraContextType | undefined>(undefined);

export const TraceraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [detections, setDetections] = useState<Detection[]>(() => {
    // Flatten initial detections from vehicles
    const all = INITIAL_VEHICLES.flatMap(v => v.detections);
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedCameraId, setSelectedCameraId] = useState<CameraId | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('TR-001');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [demoSpeed, setDemoSpeed] = useState<number>(1);

  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => !prev);
  }, []);

  const updateCameraVideo = useCallback((cameraId: CameraId, url: string, fileName: string) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === cameraId
          ? { ...cam, uploadedVideoUrl: url, uploadedFileName: fileName }
          : cam
      )
    );
  }, []);

  const clearCameraVideo = useCallback((cameraId: CameraId) => {
    setCameras(prev =>
      prev.map(cam => {
        if (cam.id === cameraId) {
          if (cam.uploadedVideoUrl && cam.uploadedVideoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(cam.uploadedVideoUrl);
          }
          return { ...cam, uploadedVideoUrl: undefined, uploadedFileName: undefined };
        }
        return cam;
      })
    );
  }, []);

  const updateAlertStatus = useCallback((alertId: string, status: AlertStatus, reviewedBy?: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status,
              reviewedBy: reviewedBy || (status === 'reviewed' ? 'Traffic Operations' : a.reviewedBy)
            }
          : a
      )
    );
  }, []);

  // Generate a realistic vehicle detection
  const generateDetection = useCallback((targetCameraId?: CameraId) => {
    const cameraIds: CameraId[] = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05'];
    const chosenCamId = targetCameraId || cameraIds[Math.floor(Math.random() * cameraIds.length)];
    const chosenCam = cameras.find(c => c.id === chosenCamId) || cameras[0];

    // Pick vehicle: 70% chance pick existing vehicle, 30% from pool
    const pickPool = Math.random() > 0.3 && vehicles.length > 0;
    const poolItem = VEHICLE_POOL[Math.floor(Math.random() * VEHICLE_POOL.length)];
    const existingVehicle = pickPool
      ? vehicles[Math.floor(Math.random() * vehicles.length)]
      : null;

    const vId = existingVehicle ? existingVehicle.id : poolItem.id;
    const vPlate = existingVehicle ? existingVehicle.licensePlate : poolItem.plate;
    const vType = existingVehicle ? existingVehicle.type : poolItem.type;
    const vColor = existingVehicle ? existingVehicle.color : poolItem.color;
    const isWatch = existingVehicle ? existingVehicle.isWatchlist : poolItem.watchlist;
    const watchReason = existingVehicle ? existingVehicle.watchlistReason : poolItem.reason;

    // Confidence between 0.72 and 0.99
    const isLowConfidence = Math.random() < 0.08;
    const confidence = isLowConfidence
      ? parseFloat((0.58 + Math.random() * 0.12).toFixed(3))
      : parseFloat((0.89 + Math.random() * 0.10).toFixed(3));

    const speed = Math.floor(35 + Math.random() * 45); // 35 - 80 km/h
    const now = new Date().toISOString();

    const newDetection: Detection = {
      id: `det-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vehicleId: vId,
      licensePlate: vPlate,
      vehicleType: vType,
      color: vColor,
      cameraId: chosenCamId,
      cameraName: chosenCam.locationName,
      timestamp: now,
      confidence,
      speedKmh: speed,
      isWatchlist: isWatch,
      boundingBox: {
        x: Math.floor(15 + Math.random() * 55),
        y: Math.floor(25 + Math.random() * 40),
        w: Math.floor(22 + Math.random() * 12),
        h: Math.floor(18 + Math.random() * 10)
      }
    };

    // Update Detections
    setDetections(prev => [newDetection, ...prev.slice(0, 75)]);

    // Update Camera Vehicle count
    setCameras(prev =>
      prev.map(c => (c.id === chosenCamId ? { ...c, vehicleCount: c.vehicleCount + 1 } : c))
    );

    // Update Vehicles
    setVehicles(prev => {
      const idx = prev.findIndex(v => v.id === vId);
      if (idx >= 0) {
        const current = prev[idx];
        const newRoute = current.routePath[current.routePath.length - 1] === chosenCamId
          ? current.routePath
          : [...current.routePath, chosenCamId];

        const updated: Vehicle = {
          ...current,
          lastSeen: now,
          currentCameraId: chosenCamId,
          routePath: newRoute,
          averageSpeedKmh: Math.round((current.averageSpeedKmh + speed) / 2),
          detections: [newDetection, ...current.detections]
        };
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      } else {
        const newVehicle: Vehicle = {
          id: vId,
          licensePlate: vPlate,
          type: vType,
          color: vColor,
          firstSeen: now,
          lastSeen: now,
          currentCameraId: chosenCamId,
          isWatchlist: isWatch,
          watchlistReason: watchReason,
          routePath: [chosenCamId],
          averageSpeedKmh: speed,
          detections: [newDetection]
        };
        return [newVehicle, ...prev];
      }
    });

    // Check for alerts:
    if (isWatch) {
      const alertId = `ALT-${Date.now().toString().slice(-4)}`;
      const newAlert: Alert = {
        id: alertId,
        title: 'Watchlist Target Intercepted',
        description: `Target ${vId} [${vPlate}] identified at ${chosenCam.name} (${chosenCam.locationName}). Reason: ${watchReason || 'Monitored target'}.`,
        severity: 'critical',
        status: 'new',
        timestamp: now,
        cameraId: chosenCamId,
        cameraName: chosenCam.locationName,
        vehicleId: vId,
        licensePlate: vPlate,
        confidence
      };
      setAlerts(prev => [newAlert, ...prev]);
    } else if (isLowConfidence) {
      const alertId = `ALT-${Date.now().toString().slice(-4)}`;
      const newAlert: Alert = {
        id: alertId,
        title: 'Low-Confidence Plate Classification',
        description: `Plate OCR returned ${(confidence * 100).toFixed(1)}% confidence for ${vPlate} at ${chosenCam.name}. Optical verification recommended.`,
        severity: 'info',
        status: 'new',
        timestamp: now,
        cameraId: chosenCamId,
        cameraName: chosenCam.locationName,
        vehicleId: vId,
        licensePlate: vPlate,
        confidence
      };
      setAlerts(prev => [newAlert, ...prev]);
    } else if (speed > 75 && Math.random() < 0.25) {
      const alertId = `ALT-${Date.now().toString().slice(-4)}`;
      const newAlert: Alert = {
        id: alertId,
        title: 'Excessive Velocity Alert',
        description: `Vehicle ${vId} clocked at ${speed} km/h (Limit: 60 km/h) passing ${chosenCam.name} sensor ring.`,
        severity: 'warning',
        status: 'new',
        timestamp: now,
        cameraId: chosenCamId,
        cameraName: chosenCam.locationName,
        vehicleId: vId,
        licensePlate: vPlate,
        confidence
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  }, [cameras, vehicles]);

  const triggerManualDetection = useCallback((customCameraId?: CameraId) => {
    generateDetection(customCameraId);
  }, [generateDetection]);

  // Demo Mode interval timer
  useEffect(() => {
    if (!demoMode) return;
    const intervalMs = Math.max(1200, 3800 / demoSpeed);
    const timer = setInterval(() => {
      generateDetection();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [demoMode, demoSpeed, generateDetection]);

  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [selectedVehicleId, vehicles]);

  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find(c => c.id === selectedCameraId) || null;
  }, [selectedCameraId, cameras]);

  const totalActiveDetections = detections.length;
  const unresolvedAlertsCount = alerts.filter(a => a.status === 'new').length;

  return (
    <TraceraContext.Provider
      value={{
        cameras,
        vehicles,
        detections,
        alerts,
        activeTab,
        setActiveTab,
        selectedCameraId,
        setSelectedCameraId,
        selectedVehicleId,
        setSelectedVehicleId,
        demoMode,
        setDemoMode,
        toggleDemoMode,
        demoSpeed,
        setDemoSpeed,
        updateCameraVideo,
        clearCameraVideo,
        updateAlertStatus,
        triggerManualDetection,
        selectedVehicle,
        selectedCamera,
        totalActiveDetections,
        unresolvedAlertsCount,
        routeSegments: ROAD_SEGMENTS
      }}
    >
      {children}
    </TraceraContext.Provider>
  );
};

export const useTracera = () => {
  const context = useContext(TraceraContext);
  if (!context) {
    throw new Error('useTracera must be used within a TraceraProvider');
  }
  return context;
};
