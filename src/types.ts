export type CameraId = 'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04' | 'CAM-05';

export type VehicleType = 'Sedan' | 'SUV' | 'Truck' | 'Van' | 'EV' | 'Motorcycle' | 'Bus';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'new' | 'reviewed' | 'resolved';

export interface Camera {
  id: CameraId;
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  fps: number;
  resolution: string;
  bitrate: string;
  vehicleCount: number;
  uploadedVideoUrl?: string;
  uploadedFileName?: string;
  laneCount: number;
  direction: string;
}

export interface Detection {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleType: VehicleType;
  color: string;
  cameraId: CameraId;
  cameraName: string;
  timestamp: string; // ISO string
  confidence: number; // 0.0 - 1.0 (e.g. 0.96)
  speedKmh: number;
  boundingBox?: {
    x: number; // percentage 0-100
    y: number;
    w: number;
    h: number;
  };
  isWatchlist?: boolean;
}

export interface Vehicle {
  id: string; // e.g. TR-001
  licensePlate: string;
  type: VehicleType;
  color: string;
  firstSeen: string;
  lastSeen: string;
  currentCameraId: CameraId;
  isWatchlist: boolean;
  watchlistReason?: string;
  detections: Detection[];
  routePath: CameraId[];
  averageSpeedKmh: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  cameraId?: CameraId;
  cameraName?: string;
  vehicleId?: string;
  licensePlate?: string;
  confidence?: number;
  reviewedBy?: string;
}

export interface RouteStats {
  id: string;
  fromCamera: CameraId;
  toCamera: CameraId;
  fromName: string;
  toName: string;
  distanceKm: number;
  avgTravelTimeMin: number;
  vehicleVolumePerHour: number;
  congestionLevel: 'Low' | 'Moderate' | 'Heavy';
  coordinates: [number, number][];
}

export type ActiveNavTab = 'dashboard' | 'cameras' | 'vehicles' | 'trajectories' | 'analytics' | 'alerts';
