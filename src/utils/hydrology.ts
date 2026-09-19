import { DataPoint, RiskLevel, DatasetSummary, EarlyWarningAlert, PredictionInput, PredictionResult } from '../types';

/**
 * Hydrological Risk Computation
 * Combines precipitation volume (CHIRPS), terrain elevation (SRTM),
 * and surface gradient slope (SRTM-derived) to determine flood hazard index.
 * 
 * Hydrological rationale:
 * 1. Low elevation (< 100m) + Flat slope (< 2.5°) = High water pooling potential
 * 2. Heavy rainfall (> 100mm) creates severe runoff overload
 * 3. Sentinel-1 SAR flood ground-truth (flood=1) confirms historical inundation
 */
export function calculateRisk(
  rainfall: number,
  elevation: number,
  slope: number,
  floodGroundTruth?: number
): { riskLevel: RiskLevel; riskScore: number; reason: string } {
  // Normalize factors (0-100)
  // 1. Rainfall factor: 0mm -> 0, 200mm+ -> 100
  const rainFactor = Math.min(100, (rainfall / 200) * 100);

  // 2. Elevation vulnerability factor: < 20m -> 100, 500m+ -> 10, > 1500m -> 0
  let elevFactor = 0;
  if (elevation <= 25) elevFactor = 100;
  else if (elevation <= 75) elevFactor = 85;
  else if (elevation <= 150) elevFactor = 70;
  else if (elevation <= 300) elevFactor = 45;
  else if (elevation <= 800) elevFactor = 20;
  else elevFactor = 5;

  // 3. Slope vulnerability factor: Flat plains (< 1.5°) stagnate water -> 100
  // Moderate slopes (1.5° - 5°) drain slowly -> 60
  // Steep slopes (> 10°) shed water quickly (except for flash flood / landslide ravines) -> 20
  let slopeFactor = 0;
  if (slope <= 1.0) slopeFactor = 100;
  else if (slope <= 2.5) slopeFactor = 80;
  else if (slope <= 5.0) slopeFactor = 55;
  else if (slope <= 10.0) slopeFactor = 30;
  else slopeFactor = 15;

  // Weighted composite score (Rainfall 50%, Slope 25%, Elevation 25%)
  let compositeScore = (rainFactor * 0.50) + (elevFactor * 0.25) + (slopeFactor * 0.25);

  // Sentinel-1 SAR observation boost if ground-truth flood is active
  if (floodGroundTruth === 1) {
    compositeScore = Math.min(100, compositeScore * 1.25 + 15);
  }

  const riskScore = Math.round(compositeScore);

  let riskLevel: RiskLevel = 'SAFE';
  let reason = 'Precipitation well within natural river channel capacity and terrain exhibits adequate drainage gradient.';

  if (riskScore >= 75 || (rainfall > 160 && slope < 2.5)) {
    riskLevel = 'CRITICAL';
    reason = `Severe inundation crisis: Torrential rainfall (${rainfall.toFixed(1)} mm) on low flat terrain (elev: ${Math.round(elevation)}m, slope: ${slope.toFixed(1)}°) severely exceeds basin conveyance capacity.`;
  } else if (riskScore >= 55 || (rainfall > 100 && slope < 4)) {
    riskLevel = 'HIGH RISK';
    reason = `High flood vulnerability: High rainfall (${rainfall.toFixed(1)} mm) over gentle gradient (${slope.toFixed(1)}°) promotes surface pooling and riverbank spillover.`;
  } else if (riskScore >= 35 || rainfall > 50) {
    riskLevel = 'WARNING';
    reason = `Moderate watch: Sustained precipitation (${rainfall.toFixed(1)} mm) warrants close observation of local river levels and soil saturation.`;
  } else {
    riskLevel = 'SAFE';
  }

  return { riskLevel, riskScore, reason };
}

/**
 * Computes summary analytics across a dataset
 */
export function computeDatasetSummary(
  points: DataPoint[],
  sourceName: string = 'Demo Baseline',
  isDemo: boolean = true
): DatasetSummary {
  if (points.length === 0) {
    return {
      totalLocations: 0,
      avgRainfall: 0,
      maxRainfall: 0,
      maxRainfallLocation: 'N/A',
      minRainfall: 0,
      avgElevation: 0,
      avgSlope: 0,
      floodedCount: 0,
      floodedPercentage: 0,
      riskCounts: { SAFE: 0, WARNING: 0, 'HIGH RISK': 0, CRITICAL: 0 },
      sourceName,
      isDemo
    };
  }

  let totalRain = 0;
  let maxRain = -Infinity;
  let minRain = Infinity;
  let maxRainLoc = '';
  let totalElev = 0;
  let totalSlope = 0;
  let floodedCount = 0;

  const riskCounts: Record<RiskLevel, number> = {
    SAFE: 0,
    WARNING: 0,
    'HIGH RISK': 0,
    CRITICAL: 0
  };

  points.forEach((p) => {
    totalRain += p.rainfall;
    if (p.rainfall > maxRain) {
      maxRain = p.rainfall;
      maxRainLoc = p.locationName || `${p.latitude.toFixed(2)}°N, ${p.longitude.toFixed(2)}°E`;
    }
    if (p.rainfall < minRain) {
      minRain = p.rainfall;
    }
    totalElev += p.elevation;
    totalSlope += p.slope;
    if (p.flood === 1) {
      floodedCount++;
    }
    riskCounts[p.riskLevel] = (riskCounts[p.riskLevel] || 0) + 1;
  });

  const total = points.length;

  return {
    totalLocations: total,
    avgRainfall: Number((totalRain / total).toFixed(1)),
    maxRainfall: Number(maxRain.toFixed(1)),
    maxRainfallLocation: maxRainLoc,
    minRainfall: Number((minRain === Infinity ? 0 : minRain).toFixed(1)),
    avgElevation: Math.round(totalElev / total),
    avgSlope: Number((totalSlope / total).toFixed(1)),
    floodedCount,
    floodedPercentage: Number(((floodedCount / total) * 100).toFixed(1)),
    riskCounts,
    sourceName,
    isDemo
  };
}

/**
 * Generate Early Warning Alerts for critical and high-risk zones
 */
export function generateEarlyWarnings(points: DataPoint[]): EarlyWarningAlert[] {
  const highRiskPoints = points.filter(
    (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH RISK'
  );

  // Sort by risk score descending, then rainfall descending
  highRiskPoints.sort((a, b) => b.riskScore - a.riskScore || b.rainfall - a.rainfall);

  return highRiskPoints.map((p) => {
    const isCritical = p.riskLevel === 'CRITICAL';
    let action = '';
    let alertLevel: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' = 'YELLOW';

    if (isCritical) {
      alertLevel = 'RED';
      action = 'IMMEDIATE RED ALERT: Issue evacuation warnings for low-lying settlements; deploy State Disaster Response Force (SDRF) to vulnerable embankments; continuous barrage gate discharge monitoring.';
    } else {
      alertLevel = 'ORANGE';
      action = 'ORANGE ALERT: Mobilize emergency response teams; inspect drainage culverts & river dykes; advise agricultural and riverside workers to move to higher ground.';
    }

    const terrainContext =
      p.slope < 1.5
        ? `Ultra-flat alluvial floodplain (${p.slope.toFixed(1)}° gradient) creates high water stagnation risk`
        : `Moderate slope (${p.slope.toFixed(1)}°) with high runoff volume`;

    const reason = `${p.rainfall.toFixed(1)} mm rainfall observed. Elevation: ${Math.round(p.elevation)}m MSL. ${terrainContext}. Observed SAR flood signal: ${p.flood === 1 ? 'POSITIVE INUNDATION' : 'NEGATIVE/ABSENT'}.`;

    return {
      id: p.id,
      locationName: p.locationName,
      state: p.state,
      latitude: p.latitude,
      longitude: p.longitude,
      riskLevel: p.riskLevel,
      rainfall: p.rainfall,
      elevation: p.elevation,
      slope: p.slope,
      reason,
      recommendedAction: action,
      alertLevel
    };
  });
}

/**
 * Model Prediction Evaluator
 * Note: Clearly labeled as heuristic baseline since ML model is not yet loaded!
 */
export function predictFloodRisk(input: PredictionInput): PredictionResult {
  const { rainfall, elevation, slope } = input;
  const { riskLevel, riskScore, reason } = calculateRisk(rainfall, elevation, slope, 0);

  const factors: PredictionResult['contributingFactors'] = [];

  // Rainfall factor
  if (rainfall > 120) {
    factors.push({
      factor: 'Precipitation Intensity (CHIRPS)',
      impact: 'HIGH',
      description: `Rainfall of ${rainfall} mm significantly exceeds channel capacity, creating high overland flow.`
    });
  } else if (rainfall > 60) {
    factors.push({
      factor: 'Precipitation Volume',
      impact: 'MEDIUM',
      description: `Rainfall of ${rainfall} mm represents substantial moisture input.`
    });
  } else {
    factors.push({
      factor: 'Precipitation Volume',
      impact: 'LOW',
      description: `Rainfall of ${rainfall} mm is within standard seasonal catchment thresholds.`
    });
  }

  // Elevation factor
  if (elevation < 50) {
    factors.push({
      factor: 'Terrain Elevation (SRTM)',
      impact: 'HIGH',
      description: `Low-lying altitude (${elevation}m) places the area in the primary flood accumulator basin.`
    });
  } else if (elevation < 200) {
    factors.push({
      factor: 'Terrain Elevation (SRTM)',
      impact: 'MEDIUM',
      description: `Moderate plain elevation (${elevation}m) offers partial natural gravity head.`
    });
  } else {
    factors.push({
      factor: 'Terrain Elevation (SRTM)',
      impact: 'LOW',
      description: `Elevated topography (${elevation}m) allows water to disperse downstream.`
    });
  }

  // Slope factor
  if (slope < 1.5) {
    factors.push({
      factor: 'Surface Slope Gradient',
      impact: 'HIGH',
      description: `Flat slope (${slope}°) provides negligible gravitational runoff velocity, resulting in waterlogging.`
    });
  } else if (slope < 4.0) {
    factors.push({
      factor: 'Surface Slope Gradient',
      impact: 'MEDIUM',
      description: `Gentle slope (${slope}°) moderately retards drainage.`
    });
  } else {
    factors.push({
      factor: 'Surface Slope Gradient',
      impact: 'LOW',
      description: `Steep slope (${slope}°) enables rapid hydraulic drainage.`
    });
  }

  return {
    predictedClass: riskScore > 60 ? 1 : 0,
    predictedRisk: riskLevel,
    confidenceScore: riskScore,
    isHeuristic: true,
    statusMessage: 'Calculated via empirical hydrological vulnerability engine. Production ML Random Forest model requires trained weights.',
    contributingFactors: factors
  };
}
