import { Camera, Vehicle, Alert, RouteStats } from '../types';

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'CAM-01',
    locationName: 'North Gate Tollway',
    lat: 37.7885,
    lng: -122.4120,
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080',
    bitrate: '4.8 Mbps',
    vehicleCount: 28,
    laneCount: 4,
    direction: 'Southbound / Northbound'
  },
  {
    id: 'CAM-02',
    name: 'CAM-02',
    locationName: 'Downtown Central Junction',
    lat: 37.7810,
    lng: -122.4180,
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080',
    bitrate: '5.2 Mbps',
    vehicleCount: 45,
    laneCount: 6,
    direction: 'Interchange Multi-Direction'
  },
  {
    id: 'CAM-03',
    name: 'CAM-03',
    locationName: 'Metro Financial Boulevard',
    lat: 37.7750,
    lng: -122.4080,
    status: 'ONLINE',
    fps: 29,
    resolution: '1920x1080',
    bitrate: '4.6 Mbps',
    vehicleCount: 34,
    laneCount: 4,
    direction: 'East-West Corridor'
  },
  {
    id: 'CAM-04',
    name: 'CAM-04',
    locationName: 'Harbor Industrial Expressway',
    lat: 37.7690,
    lng: -122.4230,
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080',
    bitrate: '5.0 Mbps',
    vehicleCount: 19,
    laneCount: 4,
    direction: 'Southwest Freight Access'
  },
  {
    id: 'CAM-05',
    name: 'CAM-05',
    locationName: 'Eastside Tech Corridor',
    lat: 37.7840,
    lng: -122.3980,
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080',
    bitrate: '5.4 Mbps',
    vehicleCount: 39,
    laneCount: 4,
    direction: 'Bayside Arterial'
  }
];

export const ROAD_SEGMENTS: RouteStats[] = [
  {
    id: 'R1-2',
    fromCamera: 'CAM-01',
    toCamera: 'CAM-02',
    fromName: 'North Gate Tollway',
    toName: 'Downtown Central Junction',
    distanceKm: 1.4,
    avgTravelTimeMin: 3.2,
    vehicleVolumePerHour: 340,
    congestionLevel: 'Moderate',
    coordinates: [
      [37.7885, -122.4120],
      [37.7850, -122.4155],
      [37.7810, -122.4180]
    ]
  },
  {
    id: 'R2-3',
    fromCamera: 'CAM-02',
    toCamera: 'CAM-03',
    fromName: 'Downtown Central Junction',
    toName: 'Metro Financial Boulevard',
    distanceKm: 1.8,
    avgTravelTimeMin: 4.5,
    vehicleVolumePerHour: 420,
    congestionLevel: 'Heavy',
    coordinates: [
      [37.7810, -122.4180],
      [37.7780, -122.4130],
      [37.7750, -122.4080]
    ]
  },
  {
    id: 'R3-4',
    fromCamera: 'CAM-03',
    toCamera: 'CAM-04',
    fromName: 'Metro Financial Boulevard',
    toName: 'Harbor Industrial Expressway',
    distanceKm: 2.1,
    avgTravelTimeMin: 3.8,
    vehicleVolumePerHour: 210,
    congestionLevel: 'Low',
    coordinates: [
      [37.7750, -122.4080],
      [37.7715, -122.4160],
      [37.7690, -122.4230]
    ]
  },
  {
    id: 'R2-5',
    fromCamera: 'CAM-02',
    toCamera: 'CAM-05',
    fromName: 'Downtown Central Junction',
    toName: 'Eastside Tech Corridor',
    distanceKm: 2.3,
    avgTravelTimeMin: 5.1,
    vehicleVolumePerHour: 380,
    congestionLevel: 'Moderate',
    coordinates: [
      [37.7810, -122.4180],
      [37.7825, -122.4070],
      [37.7840, -122.3980]
    ]
  },
  {
    id: 'R5-3',
    fromCamera: 'CAM-05',
    toCamera: 'CAM-03',
    fromName: 'Eastside Tech Corridor',
    toName: 'Metro Financial Boulevard',
    distanceKm: 1.6,
    avgTravelTimeMin: 3.5,
    vehicleVolumePerHour: 290,
    congestionLevel: 'Low',
    coordinates: [
      [37.7840, -122.3980],
      [37.7790, -122.4030],
      [37.7750, -122.4080]
    ]
  },
  {
    id: 'R1-5',
    fromCamera: 'CAM-01',
    toCamera: 'CAM-05',
    fromName: 'North Gate Tollway',
    toName: 'Eastside Tech Corridor',
    distanceKm: 1.9,
    avgTravelTimeMin: 3.9,
    vehicleVolumePerHour: 260,
    congestionLevel: 'Low',
    coordinates: [
      [37.7885, -122.4120],
      [37.7870, -122.4035],
      [37.7840, -122.3980]
    ]
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'TR-001',
    licensePlate: '7XYZ912',
    type: 'Sedan',
    color: 'Obsidian Black',
    firstSeen: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    currentCameraId: 'CAM-05',
    isWatchlist: false,
    routePath: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-05'],
    averageSpeedKmh: 54,
    detections: [
      {
        id: 'det-001-1',
        vehicleId: 'TR-001',
        licensePlate: '7XYZ912',
        vehicleType: 'Sedan',
        color: 'Obsidian Black',
        cameraId: 'CAM-01',
        cameraName: 'North Gate Tollway',
        timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
        confidence: 0.982,
        speedKmh: 68,
        boundingBox: { x: 22, y: 35, w: 26, h: 22 }
      },
      {
        id: 'det-001-2',
        vehicleId: 'TR-001',
        licensePlate: '7XYZ912',
        vehicleType: 'Sedan',
        color: 'Obsidian Black',
        cameraId: 'CAM-02',
        cameraName: 'Downtown Central Junction',
        timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
        confidence: 0.974,
        speedKmh: 46,
        boundingBox: { x: 44, y: 40, w: 28, h: 24 }
      },
      {
        id: 'det-001-3',
        vehicleId: 'TR-001',
        licensePlate: '7XYZ912',
        vehicleType: 'Sedan',
        color: 'Obsidian Black',
        cameraId: 'CAM-03',
        cameraName: 'Metro Financial Boulevard',
        timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        confidence: 0.965,
        speedKmh: 52,
        boundingBox: { x: 30, y: 38, w: 25, h: 21 }
      },
      {
        id: 'det-001-4',
        vehicleId: 'TR-001',
        licensePlate: '7XYZ912',
        vehicleType: 'Sedan',
        color: 'Obsidian Black',
        cameraId: 'CAM-05',
        cameraName: 'Eastside Tech Corridor',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        confidence: 0.991,
        speedKmh: 51,
        boundingBox: { x: 55, y: 32, w: 27, h: 23 }
      }
    ]
  },
  {
    id: 'TR-007',
    licensePlate: '4WCH808',
    type: 'SUV',
    color: 'Midnight Crimson',
    firstSeen: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    currentCameraId: 'CAM-02',
    isWatchlist: true,
    watchlistReason: 'Flagged by Regional Dispatch: Stolen Vehicle Report #ST-8902',
    routePath: ['CAM-04', 'CAM-03', 'CAM-02'],
    averageSpeedKmh: 72,
    detections: [
      {
        id: 'det-007-1',
        vehicleId: 'TR-007',
        licensePlate: '4WCH808',
        vehicleType: 'SUV',
        color: 'Midnight Crimson',
        cameraId: 'CAM-04',
        cameraName: 'Harbor Industrial Expressway',
        timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        confidence: 0.941,
        speedKmh: 78,
        isWatchlist: true,
        boundingBox: { x: 35, y: 45, w: 30, h: 26 }
      },
      {
        id: 'det-007-2',
        vehicleId: 'TR-007',
        licensePlate: '4WCH808',
        vehicleType: 'SUV',
        color: 'Midnight Crimson',
        cameraId: 'CAM-03',
        cameraName: 'Metro Financial Boulevard',
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        confidence: 0.958,
        speedKmh: 69,
        isWatchlist: true,
        boundingBox: { x: 48, y: 30, w: 29, h: 25 }
      },
      {
        id: 'det-007-3',
        vehicleId: 'TR-007',
        licensePlate: '4WCH808',
        vehicleType: 'SUV',
        color: 'Midnight Crimson',
        cameraId: 'CAM-02',
        cameraName: 'Downtown Central Junction',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        confidence: 0.984,
        speedKmh: 68,
        isWatchlist: true,
        boundingBox: { x: 20, y: 36, w: 31, h: 27 }
      }
    ]
  },
  {
    id: 'TR-042',
    licensePlate: '9EVX440',
    type: 'EV',
    color: 'Pearl White',
    firstSeen: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    currentCameraId: 'CAM-04',
    isWatchlist: false,
    routePath: ['CAM-01', 'CAM-05', 'CAM-03', 'CAM-04'],
    averageSpeedKmh: 48,
    detections: [
      {
        id: 'det-042-1',
        vehicleId: 'TR-042',
        licensePlate: '9EVX440',
        vehicleType: 'EV',
        color: 'Pearl White',
        cameraId: 'CAM-01',
        cameraName: 'North Gate Tollway',
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        confidence: 0.976,
        speedKmh: 62,
        boundingBox: { x: 40, y: 38, w: 24, h: 20 }
      },
      {
        id: 'det-042-2',
        vehicleId: 'TR-042',
        licensePlate: '9EVX440',
        vehicleType: 'EV',
        color: 'Pearl White',
        cameraId: 'CAM-05',
        cameraName: 'Eastside Tech Corridor',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        confidence: 0.968,
        speedKmh: 45,
        boundingBox: { x: 18, y: 42, w: 25, h: 21 }
      },
      {
        id: 'det-042-3',
        vehicleId: 'TR-042',
        licensePlate: '9EVX440',
        vehicleType: 'EV',
        color: 'Pearl White',
        cameraId: 'CAM-03',
        cameraName: 'Metro Financial Boulevard',
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        confidence: 0.952,
        speedKmh: 42,
        boundingBox: { x: 50, y: 40, w: 26, h: 22 }
      },
      {
        id: 'det-042-4',
        vehicleId: 'TR-042',
        licensePlate: '9EVX440',
        vehicleType: 'EV',
        color: 'Pearl White',
        cameraId: 'CAM-04',
        cameraName: 'Harbor Industrial Expressway',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        confidence: 0.963,
        speedKmh: 44,
        boundingBox: { x: 30, y: 32, w: 25, h: 21 }
      }
    ]
  },
  {
    id: 'TR-088',
    licensePlate: '3TKF105',
    type: 'Truck',
    color: 'Industrial Navy',
    firstSeen: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    currentCameraId: 'CAM-04',
    isWatchlist: false,
    routePath: ['CAM-02', 'CAM-03', 'CAM-04'],
    averageSpeedKmh: 38,
    detections: [
      {
        id: 'det-088-1',
        vehicleId: 'TR-088',
        licensePlate: '3TKF105',
        vehicleType: 'Truck',
        color: 'Industrial Navy',
        cameraId: 'CAM-02',
        cameraName: 'Downtown Central Junction',
        timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
        confidence: 0.945,
        speedKmh: 36,
        boundingBox: { x: 35, y: 25, w: 36, h: 32 }
      },
      {
        id: 'det-088-2',
        vehicleId: 'TR-088',
        licensePlate: '3TKF105',
        vehicleType: 'Truck',
        color: 'Industrial Navy',
        cameraId: 'CAM-03',
        cameraName: 'Metro Financial Boulevard',
        timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        confidence: 0.932,
        speedKmh: 39,
        boundingBox: { x: 22, y: 28, w: 35, h: 31 }
      },
      {
        id: 'det-088-3',
        vehicleId: 'TR-088',
        licensePlate: '3TKF105',
        vehicleType: 'Truck',
        color: 'Industrial Navy',
        cameraId: 'CAM-04',
        cameraName: 'Harbor Industrial Expressway',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        confidence: 0.961,
        speedKmh: 40,
        boundingBox: { x: 45, y: 26, w: 37, h: 33 }
      }
    ]
  },
  {
    id: 'TR-104',
    licensePlate: '6VNM772',
    type: 'Van',
    color: 'Silver Metallic',
    firstSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    currentCameraId: 'CAM-01',
    isWatchlist: false,
    routePath: ['CAM-05', 'CAM-01'],
    averageSpeedKmh: 58,
    detections: [
      {
        id: 'det-104-1',
        vehicleId: 'TR-104',
        licensePlate: '6VNM772',
        vehicleType: 'Van',
        color: 'Silver Metallic',
        cameraId: 'CAM-05',
        cameraName: 'Eastside Tech Corridor',
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        confidence: 0.971,
        speedKmh: 57,
        boundingBox: { x: 28, y: 35, w: 29, h: 25 }
      },
      {
        id: 'det-104-2',
        vehicleId: 'TR-104',
        licensePlate: '6VNM772',
        vehicleType: 'Van',
        color: 'Silver Metallic',
        cameraId: 'CAM-01',
        cameraName: 'North Gate Tollway',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        confidence: 0.985,
        speedKmh: 59,
        boundingBox: { x: 42, y: 36, w: 28, h: 24 }
      }
    ]
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-1091',
    title: 'Watchlist Vehicle Detected',
    description: 'Target vehicle TR-007 (Plate: 4WCH808) flagged as stolen detected passing CAM-02 at 68 km/h.',
    severity: 'critical',
    status: 'new',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    cameraId: 'CAM-02',
    cameraName: 'Downtown Central Junction',
    vehicleId: 'TR-007',
    licensePlate: '4WCH808',
    confidence: 0.984
  },
  {
    id: 'ALT-1090',
    title: 'Unusual Route / Rapid Hop',
    description: 'Vehicle TR-001 completed 4 camera segments in under 22 minutes via congested Metro Boulevard.',
    severity: 'warning',
    status: 'new',
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    cameraId: 'CAM-05',
    cameraName: 'Eastside Tech Corridor',
    vehicleId: 'TR-001',
    licensePlate: '7XYZ912',
    confidence: 0.965
  },
  {
    id: 'ALT-1089',
    title: 'Low-Confidence Plate Match',
    description: 'Plate optical confidence fell below 65% due to rain/motion blur at CAM-04 sensor #2.',
    severity: 'info',
    status: 'reviewed',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    cameraId: 'CAM-04',
    cameraName: 'Harbor Industrial Expressway',
    vehicleId: 'TR-088',
    licensePlate: '3TKF105',
    confidence: 0.638,
    reviewedBy: 'Officer Chen (Badge #409)'
  },
  {
    id: 'ALT-1088',
    title: 'Speed Threshold Violation',
    description: 'Vehicle detected traveling at 88 km/h in a designated 50 km/h perimeter construction zone.',
    severity: 'warning',
    status: 'resolved',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    cameraId: 'CAM-01',
    cameraName: 'North Gate Tollway',
    vehicleId: 'TR-019',
    licensePlate: '2KPL901',
    confidence: 0.942,
    reviewedBy: 'Automated Dispatch'
  }
];

export const VEHICLE_POOL = [
  { id: 'TR-001', plate: '7XYZ912', type: 'Sedan' as const, color: 'Obsidian Black', watchlist: false },
  { id: 'TR-007', plate: '4WCH808', type: 'SUV' as const, color: 'Midnight Crimson', watchlist: true, reason: 'Stolen Vehicle Report #ST-8902' },
  { id: 'TR-042', plate: '9EVX440', type: 'EV' as const, color: 'Pearl White', watchlist: false },
  { id: 'TR-088', plate: '3TKF105', type: 'Truck' as const, color: 'Industrial Navy', watchlist: false },
  { id: 'TR-104', plate: '6VNM772', type: 'Van' as const, color: 'Silver Metallic', watchlist: false },
  { id: 'TR-155', plate: '5BTR311', type: 'Motorcycle' as const, color: 'Electric Yellow', watchlist: false },
  { id: 'TR-209', plate: '8MBS402', type: 'Bus' as const, color: 'Transit Teal', watchlist: false },
  { id: 'TR-334', plate: '1QAZ889', type: 'Sedan' as const, color: 'Graphite Gray', watchlist: false },
  { id: 'TR-512', plate: '2LOM771', type: 'SUV' as const, color: 'Deep Sapphire', watchlist: false },
  { id: 'TR-990', plate: '9POL003', type: 'EV' as const, color: 'Emerald Green', watchlist: true, reason: 'Suspected Evading Tollway Checkpoint' },
];
