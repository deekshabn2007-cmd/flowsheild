import React, { useState } from 'react';
import { DataPoint, DatasetSummary } from '../types';
import { CloudRain, Droplets, TrendingUp, BarChart3, Filter } from 'lucide-react';

interface RainfallAnalysisProps {
  dataPoints: DataPoint[];
  summary: DatasetSummary;
  onSelectPoint?: (point: DataPoint) => void;
}

export const RainfallAnalysis: React.FC<RainfallAnalysisProps> = ({
  dataPoints,
  summary,
  onSelectPoint
}) => {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  // Compute Rainfall Histogram Bins
  const bins = [
    { label: '0–50 mm', min: 0, max: 50, color: '#38BDF8', desc: 'Light / Normal' },
    { label: '50–100 mm', min: 50, max: 100, color: '#0284C7', desc: 'Moderate' },
    { label: '100–150 mm', min: 100, max: 150, color: '#2563EB', desc: 'Heavy' },
    { label: '150–200 mm', min: 150, max: 200, color: '#F97316', desc: 'Very Heavy' },
    { label: '200+ mm', min: 200, max: 1000, color: '#EF4444', desc: 'Extremely Heavy' }
  ];

  const binData = bins.map((bin) => {
    const pointsInBin = dataPoints.filter((p) => {
      if (bin.max === 1000) return p.rainfall >= bin.min;
      return p.rainfall >= bin.min && p.rainfall < bin.max;
    });
    return {
      ...bin,
      count: pointsInBin.length,
      points: pointsInBin
    };
  });

  const maxCount = Math.max(...binData.map((b) => b.count), 1);

  // Top rainfall hotspots
  const topRainfallPoints = [...dataPoints]
    .sort((a, b) => b.rainfall - a.rainfall)
    .slice(0, 8);

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <span>Rainfall Distribution & Precipitation Analysis (CHIRPS Daily)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Satellite infrared precipitation with gauge adjustments across monitored stations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
            SOURCE: CHIRPS GEE 0.05° RES
          </span>
        </div>
      </div>

      {/* Key Metrics Sub-grid (Min, Max, Avg) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Minimum Rainfall</div>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-0.5">
              {summary.minRainfall} <span className="text-xs text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Basin low baseline</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Average Rainfall</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
              {summary.avgRainfall} <span className="text-xs text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">National monitored mean</div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/60 text-cyan-400">
            <CloudRain className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Maximum Rainfall</div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-0.5">
              {summary.maxRainfall} <span className="text-xs text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5" title={summary.maxRainfallLocation}>
              {summary.maxRainfallLocation}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-950/60 text-red-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Histogram / Frequency Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Rainfall Intensity Frequency Distribution</span>
          </span>
          <span className="font-mono text-[11px]">Total: {dataPoints.length} stations</span>
        </div>

        {/* SVG Histogram */}
        <div className="space-y-2 pt-2">
          {binData.map((bin) => {
            const percentage = ((bin.count / (dataPoints.length || 1)) * 100).toFixed(1);
            const isSelected = selectedBin === bin.label;

            return (
              <div 
                key={bin.label}
                onClick={() => setSelectedBin(isSelected ? null : bin.label)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected ? 'bg-slate-800/90 border-cyan-500/60 ring-1 ring-cyan-400/30' : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white w-24">{bin.label}</span>
                    <span className="text-[11px] text-slate-400">({bin.desc})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{bin.count} stations</span>
                    <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${(bin.count / maxCount) * 100}%`,
                      backgroundColor: bin.color
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Precipitation Hotspots Ranking */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
            Critical High-Precipitation Stations
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Ranked by CHIRPS 24h mm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topRainfallPoints.map((point, index) => (
            <div
              key={point.id}
              onClick={() => onSelectPoint?.(point)}
              className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{point.locationName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {point.state} • Elev {Math.round(point.elevation)}m • Slope {point.slope}°
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-bold font-mono text-cyan-400">
                  {point.rainfall.toFixed(1)} <span className="text-[10px]">mm</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  point.riskLevel === 'CRITICAL'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : point.riskLevel === 'HIGH RISK'
                    ? 'bg-orange-950 text-orange-300 border border-orange-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {point.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
