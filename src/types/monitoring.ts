
export interface Zone {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  color: string;
  vehicleCount: number;
}

export interface VehicleDetection {
  id: string;
  type: 'car' | 'truck' | 'motorcycle' | 'bus';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  speed: number;
  timestamp: string;
}

export interface CameraConfig {
  id: string;
  name: string;
  rtspUrl: string;
  dateAdded: string;
}
