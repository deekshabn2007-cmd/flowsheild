import React from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Upload, 
  FileText, 
  RotateCcw, 
  Layers, 
  TrendingUp, 
  Cpu, 
  AlertTriangle, 
  Database,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { DatasetSummary } from '../types';

interface HeaderProps {
  summary: DatasetSummary;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onResetFilters: () => void;
  onDownloadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onResetFilters,
  onDownloadSample
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-800/80 text-white">
      {/* Top emergency status bar */}
      <div className="bg-[#050914] px-4 py-1 border-b border-slate-800/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-mono">SYS-STATUS:</span>
            <span className="text-emerald-400 font-medium font-mono">OPERATIONAL (EARTH ENGINE LINK ACTIVE)</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 font-mono border-l border-slate-800 pl-4">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>GEO-BOUNDS:</span>
            <span className="text-slate-300">8°4'N–37°6'N, 68°7'E–97°25'E</span>
            <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded text-[10px] ml-1 font-bold">
              INDIA COVERAGE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {summary.isDemo ? (
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>DATASET: DEMO DATA (SYNTHESIZED GEO-CALIBRATED BASELINE)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 px-2.5 py-0.5 rounded text-[11px] font-mono">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>DATASET: USER CSV ({summary.fileName || 'custom.csv'}) — {summary.totalLocations} STATIONS</span>
            </div>
          )}

          <span className="hidden sm:inline text-slate-500 font-mono">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
            PIPELINE: CHIRPS • SRTM • SENTINEL-1
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('map')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <ShieldAlert className="w-6 h-6 text-white" />
            <Radio className="w-3.5 h-3.5 absolute -top-1 -right-1 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white font-mono flex items-center gap-1">
                FLOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">SHIELD</span>
              </h1>
              <span className="bg-blue-900/60 text-blue-300 border border-blue-700/60 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider">
                v2.4-HACKATHON
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              India-Wide Flood Prediction & Early Warning System
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="header-upload-csv-btn"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm shadow-cyan-900/50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <button
            id="header-sample-csv-btn"
            onClick={onDownloadSample}
            title="Download real CSV schema template"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Schema Template</span>
          </button>

          <button
            id="header-reset-filters-btn"
            onClick={onResetFilters}
            title="Reset active filters"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
        <button
          id="nav-tab-map"
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>India Flood Map & Risk</span>
        </button>

        <button
          id="nav-tab-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Rainfall & Terrain Analysis</span>
        </button>

        <button
          id="nav-tab-warning"
          onClick={() => setActiveTab('warning')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'warning'
              ? 'border-amber-400 text-amber-400 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Early Warning Alerts</span>
          {summary.riskCounts['CRITICAL'] > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {summary.riskCounts['CRITICAL']}
            </span>
          )}
        </button>

        <button
          id="nav-tab-prediction"
          onClick={() => setActiveTab('prediction')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'prediction'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Flood Prediction (ML Model)</span>
        </button>

        <button
          id="nav-tab-datasources"
          onClick={() => setActiveTab('datasources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'datasources'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Sources & Pipeline</span>
        </button>
      </div>
    </header>
  );
};
