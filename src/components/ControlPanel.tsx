import React from 'react';
import { 
  Filter, 
  Calendar, 
  Clock, 
  Layers, 
  Upload, 
  Play, 
  RotateCcw, 
  Sliders, 
  Search, 
  FileSpreadsheet,
  Download,
  AlertOctagon,
  MapPin
} from 'lucide-react';
import { FilterState, MapLayerType, RiskLevel, DatasetSummary } from '../types';

interface ControlPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  summary: DatasetSummary;
  onOpenUpload: () => void;
  onResetFilters: () => void;
  onRunPrediction: () => void;
  onDownloadSample: () => void;
  statesList: string[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  filters,
  onFilterChange,
  summary,
  onOpenUpload,
  onResetFilters,
  onRunPrediction,
  onDownloadSample,
  statesList
}) => {
  const handleLayerChange = (layer: MapLayerType) => {
    onFilterChange({ ...filters, activeLayer: layer });
  };

  const handlePeriodChange = (period: FilterState['rainfallPeriod']) => {
    onFilterChange({ ...filters, rainfallPeriod: period });
  };

  const handleRiskToggle = (level: RiskLevel) => {
    onFilterChange({
      ...filters,
      riskLevels: {
        ...filters.riskLevels,
        [level]: !filters.riskLevels[level]
      }
    });
  };

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-5 text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="font-bold text-white font-mono text-sm flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>CONTROL PANEL</span>
        </span>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset all filters to default"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Date Selector & Rainfall Period */}
      <div className="space-y-2">
        <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Observation Date</span>
        </label>
        <input
          id="filter-date-input"
          type="date"
          value={filters.date}
          onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
        />

        <div className="pt-1">
          <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Rainfall Accumulation Window</span>
          </label>
          <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
            {(['24h', '48h', '72h', '7d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`py-1 rounded border transition-colors cursor-pointer text-center ${
                  filters.rainfallPeriod === period
                    ? 'bg-cyan-600 text-white border-cyan-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Map Layer Selector */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Map Visual Layer</span>
        </label>
        <div className="space-y-1 font-mono text-xs">
          {[
            { id: 'risk', label: 'Flood Risk (Categorical)', badge: 'Default', color: 'text-cyan-400' },
            { id: 'rainfall', label: 'CHIRPS Rainfall (mm)', badge: 'Precip', color: 'text-blue-400' },
            { id: 'elevation', label: 'SRTM Elevation (m)', badge: 'Terrain', color: 'text-emerald-400' },
            { id: 'slope', label: 'Slope Gradient (°)', badge: 'Incline', color: 'text-amber-400' },
            { id: 'flood', label: 'Sentinel-1 SAR Ground Truth', badge: 'Satellite', color: 'text-red-400' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer.id as MapLayerType)}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                filters.activeLayer === layer.id
                  ? 'bg-cyan-950/70 text-white border-cyan-500/60 font-semibold'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>{layer.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 ${layer.color}`}>
                {layer.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Risk Threshold Controls */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="font-bold text-slate-300 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Risk Categories Filter</span>
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
          {[
            { level: 'SAFE', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
            { level: 'WARNING', color: 'bg-amber-950 text-amber-300 border-amber-800' },
            { level: 'HIGH RISK', color: 'bg-orange-950 text-orange-300 border-orange-800' },
            { level: 'CRITICAL', color: 'bg-red-950 text-red-300 border-red-800' }
          ].map(({ level, color }) => {
            const active = filters.riskLevels[level as RiskLevel];
            return (
              <button
                key={level}
                onClick={() => handleRiskToggle(level as RiskLevel)}
                className={`px-2 py-1 rounded border text-center transition-all cursor-pointer ${
                  active ? `${color} font-bold ring-1 ring-white/20` : 'bg-slate-950/40 text-slate-600 border-slate-800/60 opacity-50'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Minimum Rainfall Filter Slider */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between font-mono">
          <label className="text-slate-300 font-bold">Rainfall Threshold</label>
          <span className="text-cyan-300 font-bold">&gt; {filters.minRainfall} mm</span>
        </div>
        <input
          id="filter-min-rainfall-slider"
          type="range"
          min="0"
          max="200"
          step="5"
          value={filters.minRainfall}
          onChange={(e) => onFilterChange({ ...filters, minRainfall: parseInt(e.target.value, 10) })}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 mm</span>
          <span>100 mm</span>
          <span>200 mm</span>
        </div>
      </div>

      {/* 5. Geographic Search & State Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Search Station / State</span>
        </label>
        <div className="relative">
          <input
            id="filter-search-query"
            type="text"
            placeholder="e.g. Majuli, Patna, Assam..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
          />
        </div>

        {statesList.length > 1 && (
          <select
            id="filter-state-select"
            value={filters.selectedState}
            onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none"
          >
            <option value="">All States / Territories ({statesList.length})</option>
            {statesList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        )}
      </div>

      {/* 6. Dataset Upload Option */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dataset Import (.CSV)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {summary.isDemo ? 'Demo Mode' : 'Custom'}
          </span>
        </div>

        <button
          id="btn-sidebar-upload-csv"
          onClick={onOpenUpload}
          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 font-mono font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Real CSV</span>
        </button>

        <div className="text-[10px] text-slate-500 font-mono leading-tight">
          Expected: <code className="text-slate-400">latitude, longitude, rainfall, elevation, slope, [flood]</code>
        </div>
      </div>

      {/* 7. "Run Prediction" Button */}
      <div className="pt-2">
        <button
          id="btn-sidebar-run-prediction"
          onClick={onRunPrediction}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Prediction</span>
        </button>
      </div>
    </div>
  );
};
