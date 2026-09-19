import Papa from 'papaparse';
import { DataPoint } from '../types';
import { calculateRisk } from './hydrology';

export interface ParseResult {
  success: boolean;
  data: DataPoint[];
  errors: string[];
  warnings: string[];
  totalRowsParsed: number;
  validRowsCount: number;
  detectedColumns: string[];
}

/**
 * Normalizes column header names to find matched fields
 */
function findColumn(headers: string[], candidates: string[]): string | undefined {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const candidate of candidates) {
    const target = clean(candidate);
    const found = headers.find((h) => clean(h) === target);
    if (found) return found;
  }
  return undefined;
}

/**
 * Parses an uploaded CSV file containing Earth Engine / Sentinel-1 data
 */
export function parseFloodCSV(fileContent: string, fileName: string = 'uploaded.csv'): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.slice(0, 5).forEach((err) => {
      errors.push(`Line ${err.row}: ${err.message}`);
    });
  }

  const rows = parsed.data as Record<string, string>[];
  if (!rows || rows.length === 0) {
    return {
      success: false,
      data: [],
      errors: ['The uploaded CSV file is empty or could not be read.'],
      warnings: [],
      totalRowsParsed: 0,
      validRowsCount: 0,
      detectedColumns: []
    };
  }

  const headers = Object.keys(rows[0] || {});

  // Find matching column names
  const latCol = findColumn(headers, ['latitude', 'lat', 'y', 'lat_dd']);
  const lngCol = findColumn(headers, ['longitude', 'long', 'lng', 'lon', 'x', 'lon_dd']);
  const rainCol = findColumn(headers, ['rainfall', 'rain', 'precipitation', 'chirps_rain', 'chirps', 'rainfall_mm']);
  const elevCol = findColumn(headers, ['elevation', 'elev', 'altitude', 'srtm_elevation', 'srtm', 'elevation_m']);
  const slopeCol = findColumn(headers, ['slope', 'slope_deg', 'slope_degrees', 'srtm_slope']);
  const floodCol = findColumn(headers, ['flood', 'flooded', 'flood_observed', 'sentinel1_flood', 'target', 'is_flooded', 'flood_flag']);
  const nameCol = findColumn(headers, ['location', 'locationname', 'name', 'district', 'city', 'station', 'site']);
  const stateCol = findColumn(headers, ['state', 'province', 'region']);

  // Required core features from pipeline: latitude, longitude, rainfall, elevation, slope
  const missingCore: string[] = [];
  if (!latCol) missingCore.push('latitude');
  if (!lngCol) missingCore.push('longitude');
  if (!rainCol) missingCore.push('rainfall');
  if (!elevCol) missingCore.push('elevation');
  if (!slopeCol) missingCore.push('slope');

  if (missingCore.length > 0) {
    return {
      success: false,
      data: [],
      errors: [
        `Missing required column(s): ${missingCore.join(', ')}.`,
        `Expected headers: latitude, longitude, rainfall, elevation, slope (and optional: flood).`,
        `Found headers: ${headers.join(', ')}`
      ],
      warnings: [],
      totalRowsParsed: rows.length,
      validRowsCount: 0,
      detectedColumns: headers
    };
  }

  if (!floodCol) {
    warnings.push('Column "flood" was not found in CSV. Values default to 0 (non-flooded).');
  }

  const validPoints: DataPoint[] = [];
  let skippedRows = 0;

  rows.forEach((row, index) => {
    const latStr = row[latCol!];
    const lngStr = row[lngCol!];
    const rainStr = row[rainCol!];
    const elevStr = row[elevCol!];
    const slopeStr = row[slopeCol!];
    const floodStr = floodCol ? row[floodCol] : '0';

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const rain = parseFloat(rainStr);
    const elev = parseFloat(elevStr);
    const slope = parseFloat(slopeStr);
    const flood = floodStr !== undefined && floodStr !== '' ? parseInt(floodStr, 10) : 0;

    // Validate coordinates and numbers
    if (isNaN(lat) || isNaN(lng) || isNaN(rain) || isNaN(elev) || isNaN(slope)) {
      skippedRows++;
      if (skippedRows <= 3) {
        warnings.push(`Row ${index + 2}: Non-numeric value encountered in required fields, skipped.`);
      }
      return;
    }

    // Basic geographic sanity check for India bounding box (~6° to 38° N, 67° to 98° E)
    if (lat < 0 || lat > 45 || lng < 60 || lng > 105) {
      if (warnings.length < 8) {
        warnings.push(`Row ${index + 2}: Coordinates (${lat}, ${lng}) fall outside standard Indian territory.`);
      }
    }

    const locationName = nameCol && row[nameCol]?.trim()
      ? row[nameCol].trim()
      : `Station ${index + 1} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;

    const state = stateCol && row[stateCol]?.trim()
      ? row[stateCol].trim()
      : 'India';

    const cleanRain = Math.max(0, rain);
    const cleanSlope = Math.max(0, slope);
    const cleanFlood = flood === 1 ? 1 : 0;

    const { riskLevel, riskScore } = calculateRisk(cleanRain, elev, cleanSlope, cleanFlood);

    validPoints.push({
      id: `UP-${index + 1}`,
      locationName,
      state,
      latitude: lat,
      longitude: lng,
      rainfall: Number(cleanRain.toFixed(1)),
      elevation: Math.round(elev),
      slope: Number(cleanSlope.toFixed(1)),
      flood: cleanFlood,
      riskLevel,
      riskScore,
      drainageBasin: 'Regional Catchment',
      timestamp: new Date().toISOString(),
      isDemo: false
    });
  });

  if (skippedRows > 3) {
    warnings.push(`Total skipped rows due to invalid data: ${skippedRows}`);
  }

  if (validPoints.length === 0) {
    return {
      success: false,
      data: [],
      errors: ['No valid data records could be extracted from the CSV file.'],
      warnings,
      totalRowsParsed: rows.length,
      validRowsCount: 0,
      detectedColumns: headers
    };
  }

  return {
    success: true,
    data: validPoints,
    errors,
    warnings,
    totalRowsParsed: rows.length,
    validRowsCount: validPoints.length,
    detectedColumns: headers
  };
}

/**
 * Generates sample CSV string for users to test or download
 */
export function generateSampleCSVString(): string {
  const headers = ['latitude', 'longitude', 'rainfall', 'elevation', 'slope', 'flood', 'location', 'state'];
  const sampleRows = [
    ['26.9600', '94.2100', '218.4', '84', '0.4', '1', 'Majuli Island', 'Assam'],
    ['26.5800', '93.1700', '195.2', '67', '0.6', '1', 'Kaziranga Buffer', 'Assam'],
    ['26.1200', '86.6000', '188.6', '48', '0.3', '1', 'Supaul Kosi Basin', 'Bihar'],
    ['25.6100', '85.1400', '142.1', '53', '0.7', '1', 'Patna Ganga Plain', 'Bihar'],
    ['20.5000', '86.4200', '185.3', '12', '0.3', '1', 'Kendrapara Delta', 'Odisha'],
    ['17.6700', '80.8900', '198.5', '49', '0.9', '1', 'Bhadrachalam Ghat', 'Telangana'],
    ['9.4900', '76.3300', '242.0', '-1', '0.2', '1', 'Kuttanad Lowlands', 'Kerala'],
    ['19.0700', '72.8700', '204.2', '8', '0.6', '1', 'Mumbai Coastal Plain', 'Maharashtra'],
    ['21.7000', '72.9900', '168.2', '16', '0.5', '1', 'Bharuch Narmada', 'Gujarat'],
    ['30.9200', '74.6100', '132.5', '198', '0.5', '1', 'Firozpur Sutlej', 'Punjab'],
    ['25.3100', '82.9700', '88.5', '79', '0.9', '0', 'Varanasi', 'Uttar Pradesh'],
    ['31.1000', '77.1700', '72.0', '2206', '24.5', '0', 'Shimla Highlands', 'Himachal Pradesh'],
    ['26.2300', '73.0200', '16.0', '231', '2.2', '0', 'Jodhpur Arid Zone', 'Rajasthan'],
    ['34.1500', '77.5700', '8.5', '3524', '12.0', '0', 'Leh Indus Valley', 'Ladakh']
  ];

  const csvLines = [headers.join(',')];
  sampleRows.forEach((r) => csvLines.push(r.join(',')));
  return csvLines.join('\n');
}

/**
 * Downloads a string as a CSV file in browser
 */
export function downloadCSV(csvContent: string, fileName: string = 'flowshield_dataset.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data points to CSV
 */
export function exportDataPointsToCSV(points: DataPoint[]): string {
  const headers = ['latitude', 'longitude', 'rainfall', 'elevation', 'slope', 'flood', 'riskLevel', 'riskScore', 'location', 'state'];
  const rows = points.map((p) => [
    p.latitude.toFixed(4),
    p.longitude.toFixed(4),
    p.rainfall.toFixed(1),
    p.elevation.toString(),
    p.slope.toFixed(1),
    p.flood.toString(),
    p.riskLevel,
    p.riskScore.toString(),
    `"${p.locationName.replace(/"/g, '""')}"`,
    `"${p.state.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
