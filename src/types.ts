/**
 * FLOWSHIELD - India-Wide Flood Prediction & Early Warning System
 * Type definitions
 */

export type RiskLevel = 'SAFE' | 'WARNING' | 'HIGH RISK' | 'CRITICAL';

export interface DataPoint {
  id: string;
  locationName: string;
  state: string;
  latitude: number;
  longitude: number;
  rainfall: number;      // mm (CHIRPS daily precipitation)
  elevation: number;     // m MSL (SRTM 30m DEM)
  slope: number;         // degrees (SRTM-derived slope)
  flood: number;         // 1 = observed flooded area (Sentinel-1 SAR), 0 = non-flooded area
  riskLevel: RiskLevel;  // Derived based on hydrological model & rainfall-terrain dynamics
  riskScore: number;     // 0 to 100
  drainageBasin?: string;
  timestamp?: string;
  isDemo?: boolean;
}

export type MapLayerType = 'risk' | 'rainfall' | 'elevation' | 'slope' | 'flood';

export interface FilterState {
  date: string;
  rainfallPeriod: '24h' | '48h' | '72h' | '7d';
  minRainfall: number;
  maxElevation: number;
  riskLevels: Record<RiskLevel, boolean>;
  activeLayer: MapLayerType;
  searchQuery: string;
  selectedState: string;
}

export interface DatasetSummary {
  totalLocations: number;
  avgRainfall: number;
  maxRainfall: number;
  maxRainfallLocation: string;
  minRainfall: number;
  avgElevation: number;
  avgSlope: number;
  floodedCount: number;
  floodedPercentage: number;
  riskCounts: Record<RiskLevel, number>;
  sourceName: string;
  isDemo: boolean;
  uploadDate?: string;
  fileName?: string;
}

export interface EarlyWarningAlert {
  id: string;
  locationName: string;
  state: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  rainfall: number;
  elevation: number;
  slope: number;
  reason: string;
  recommendedAction: string;
  alertLevel: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
}

export interface PredictionInput {
  rainfall: number;
  elevation: number;
  slope: number;
}

export interface PredictionResult {
  predictedClass?: number; // 0 or 1
  predictedRisk: RiskLevel;
  confidenceScore: number;
  isHeuristic: boolean;
  statusMessage: string;
  contributingFactors: {
    factor: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  }[];
}
