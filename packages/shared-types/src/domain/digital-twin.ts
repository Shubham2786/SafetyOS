/**
 * Digital Twin 2D/3D Domain Types
 */

export interface SpatialCoordinates {
  x: number;
  y: number;
  z?: number;
}

export interface DigitalTwinZone {
  id: string;
  name: string;
  code: string;
  boundaries2D: Array<[number, number]>;
  boundingVolume3D?: {
    min: SpatialCoordinates;
    max: SpatialCoordinates;
  };
  currentRiskScore: number;
  activeWorkersCount: number;
  activePermitsCount: number;
  cameraIds: string[];
}

export interface TelemetryEntity {
  id: string;
  entityType: 'WORKER' | 'ASSET' | 'AGV' | 'SENSOR' | 'DRONE';
  name: string;
  location: SpatialCoordinates;
  speed?: number;
  heading?: number;
  status: 'NORMAL' | 'WARNING' | 'ALERT' | 'OFFLINE';
  lastPingAt: string;
}
