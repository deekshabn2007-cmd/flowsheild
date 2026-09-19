import React from 'react';
import { DatasetSummary } from '../types';
import { 
  Database, 
  CloudRain, 
  Mountain, 
  Satellite, 
  Globe2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

interface DataSourcePanelProps {
  summary: DatasetSummary;
  onOpenUpload: () => void;
  onDownloadSample: () => void;
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({
  summary,
  onOpenUpload,
  onDownloadSample
}) => {
  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>DATA SOURCES & PIPELINE PROVENANCE</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real satellite observation sources and Google Earth Engine feature extraction
          </p>
        </div>

        {/* Uploaded vs Demo Indicator */}
        <div className="flex items-center gap-2">
          {summary.isDemo ? (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>CURRENT SOURCE: DEMO DATA (SYNTHESIZED GEO-CALIBRATED BASELINE)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-cyan-950/50 border border-cyan-500/50 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>CURRENT SOURCE: USER-UPLOADED CSV ({summary.fileName || 'custom.csv'})</span>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Lineage Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-400">DATASET STATUS:</div>
          <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>{summary.sourceName}</span>
            <span className="text-slate-400 font-normal">({summary.totalLocations} stations active)</span>
          </div>
          <div className="text-xs text-slate-400">
            {summary.isDemo 
              ? 'Currently viewing the pre-calibrated baseline of Indian river basins. You can import your exported Earth Engine CSV at any time.'
              : `Custom user dataset loaded with ${summary.totalLocations} records. All map layers, charts, and statistics reflect your uploaded CSV.`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shadow-md"
          >
            Upload Real CSV
          </button>
          <button
            onClick={onDownloadSample}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            Download CSV Schema
          </button>
        </div>
      </div>

      {/* The 4 Core Primary Sources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CHIRPS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-blue-950 text-blue-400">
                <CloudRain className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                DAILY PRECIP
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">CHIRPS</h4>
              <p className="text-xs text-cyan-300 font-medium mt-0.5">Daily Rainfall</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Climate Hazards Group InfraRed Precipitation with Station data. Merges 0.05° resolution satellite imagery with in-situ station data to track precipitation.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Output feature: <code className="text-cyan-300">rainfall (mm)</code>
          </div>
        </div>

        {/* 2. SRTM Elevation */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                <Mountain className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                30m TOPOGRAPHY
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">SRTM</h4>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">Elevation & Terrain</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shuttle Radar Topography Mission (SRTM) 1-arcsecond global digital elevation model. Provides baseline height above Mean Sea Level (MSL).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Output feature: <code className="text-emerald-300">elevation (m)</code>
          </div>
        </div>

        {/* 3. SRTM Slope */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-amber-950 text-amber-400">
                <Mountain className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800">
                DERIVED GRADIENT
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">SRTM-derived Slope</h4>
              <p className="text-xs text-amber-300 font-medium mt-0.5">Surface Gradient & Steepness</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculated rate of change in elevation in degrees (°). Critical for identifying water accumulation in flat floodplains versus rapid runoff on steep gradients.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Output feature: <code className="text-amber-300">slope (degrees)</code>
          </div>
        </div>

        {/* 4. Sentinel-1 SAR */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-purple-950 text-purple-400">
                <Satellite className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800">
                SAR RADAR
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">Sentinel-1</h4>
              <p className="text-xs text-purple-300 font-medium mt-0.5">SAR Flood Observations</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              C-band Synthetic Aperture Radar (SAR) penetrating cloud cover and rain storms to detect specular reflection of standing inundation waters.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Target variable: <code className="text-red-400">flood (1 or 0)</code>
          </div>
        </div>
      </div>

      {/* 5. Google Earth Engine Processing */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs">
        <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white font-mono">Google Earth Engine (GEE) Satellite Data Processing</h4>
          <p className="text-slate-400 mt-1 leading-relaxed">
            All satellite collections are ingested and aligned spatially in Google Earth Engine. GEE carries out temporal aggregation, cloud masking, DEM slope convolution, and co-registration of Sentinel-1 radar scenes, exporting the standardized CSV schema consumed directly by FLOWSHIELD.
          </p>
        </div>
      </div>
    </div>
  );
};
