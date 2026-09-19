import React from 'react';
import { 
  MapPin, 
  CloudRain, 
  Waves, 
  Mountain, 
  AlertOctagon, 
  Droplets 
} from 'lucide-react';
import { DatasetSummary } from '../types';

interface StatsCardsProps {
  summary: DatasetSummary;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ summary }) => {
  const highRiskTotal = summary.riskCounts['CRITICAL'] + summary.riskCounts['HIGH RISK'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Monitored Locations */}
      <div 
        id="stat-card-total-locations"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-cyan-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total Locations</span>
          <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 group-hover:scale-110 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {summary.totalLocations}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
            <span>Monitored grid cells</span>
          </div>
        </div>
      </div>

      {/* 2. Flooded Locations (Sentinel-1 SAR) */}
      <div 
        id="stat-card-flooded-locations"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-red-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Flooded (SAR)</span>
          <div className="p-1.5 rounded-lg bg-red-950/60 text-red-400 group-hover:scale-110 transition-transform">
            <Waves className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-red-400 tracking-tight">
              {summary.floodedCount}
            </span>
            <span className="text-xs font-mono text-red-300/80">
              ({summary.floodedPercentage}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
            <span>Sentinel-1 SAR Ground Truth</span>
          </div>
        </div>
      </div>

      {/* 3. High Risk & Critical Zones */}
      <div 
        id="stat-card-high-risk-locations"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-amber-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">High Risk / Critical</span>
          <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 group-hover:scale-110 transition-transform">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {highRiskTotal}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({summary.riskCounts['CRITICAL']} Crit / {summary.riskCounts['HIGH RISK']} High)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Immediate watch zones</span>
          </div>
        </div>
      </div>

      {/* 4. Average Rainfall (CHIRPS) */}
      <div 
        id="stat-card-avg-rainfall"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-blue-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Avg Rainfall</span>
          <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 group-hover:scale-110 transition-transform">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {summary.avgRainfall}
            </span>
            <span className="text-xs font-mono text-blue-300 font-semibold">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
            <span>CHIRPS daily precipitation</span>
          </div>
        </div>
      </div>

      {/* 5. Maximum Rainfall */}
      <div 
        id="stat-card-max-rainfall"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-cyan-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Peak Rainfall</span>
          <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 group-hover:scale-110 transition-transform">
            <Droplets className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              {summary.maxRainfall}
            </span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={summary.maxRainfallLocation}>
            At {summary.maxRainfallLocation}
          </div>
        </div>
      </div>

      {/* 6. Average Elevation (SRTM) */}
      <div 
        id="stat-card-avg-elevation"
        className="bg-[#0B1530] border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between shadow-md hover:border-emerald-500/40 transition-all group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Avg Elevation</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 group-hover:scale-110 transition-transform">
            <Mountain className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {summary.avgElevation}
            </span>
            <span className="text-xs font-mono text-emerald-300 font-semibold">m MSL</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>SRTM 30m Digital Elevation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
