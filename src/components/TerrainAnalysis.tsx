import React, { useState } from 'react';
import { DataPoint, DatasetSummary, RiskLevel } from '../types';
import { Mountain, Compass, HelpCircle, Eye, Info } from 'lucide-react';

interface TerrainAnalysisProps {
  dataPoints: DataPoint[];
  summary: DatasetSummary;
  onSelectPoint?: (point: DataPoint) => void;
}

export const TerrainAnalysis: React.FC<TerrainAnalysisProps> = ({
  dataPoints,
  summary,
  onSelectPoint
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [activeTab, setActiveTab] = useState<'elevation' | 'slope'>('elevation');

  // Color mapping by risk level
  const getPointColor = (level: RiskLevel): string => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH RISK': return '#F97316';
      case 'WARNING': return '#F59E0B';
      case 'SAFE': return '#10B981';
      default: return '#38BDF8';
    }
  };

  // Dimensions for SVG scatter plot
  const svgWidth = 640;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 60 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max values for scaling
  const maxRain = Math.max(...dataPoints.map((p) => p.rainfall), 280);
  const maxElev = Math.max(...dataPoints.map((p) => p.elevation), 1600);
  const maxSlope = Math.max(...dataPoints.map((p) => p.slope), 25);

  // Scales
  const getRainY = (rain: number) => {
    const norm = rain / (maxRain * 1.05);
    return padding.top + plotHeight - norm * plotHeight;
  };

  const getElevX = (elev: number) => {
    const clamped = Math.max(0, elev);
    const norm = clamped / (maxElev * 1.05);
    return padding.left + norm * plotWidth;
  };

  const getSlopeX = (slope: number) => {
    const norm = slope / (maxSlope * 1.05);
    return padding.left + norm * plotWidth;
  };

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mountain className="w-5 h-5 text-emerald-400" />
            <span>Terrain Analysis & Hydromorphic Scatter Correlation</span>
          </h3>
          <p className="text-xs text-slate-400">
            SRTM 30m Digital Elevation Model & Sobel gradient slope versus precipitation
          </p>
        </div>

        {/* Scatter Plot Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-700/80 text-xs font-mono">
          <button
            onClick={() => setActiveTab('elevation')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'elevation'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rainfall vs Elevation
          </button>
          <button
            onClick={() => setActiveTab('slope')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'slope'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rainfall vs Slope
          </button>
        </div>
      </div>

      {/* Terrain Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Avg Elevation</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {summary.avgElevation} <span className="text-xs text-slate-400">m MSL</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">SRTM 30m DEM</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Avg Slope</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {summary.avgSlope}° <span className="text-xs text-slate-400">incline</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Surface gradient</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Lowland Basin</div>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">
            &lt; 50m <span className="text-xs text-slate-400">elev</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Primary flood trap</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Flat Plains Stagnation</div>
          <div className="text-xl font-bold font-mono text-orange-400 mt-1">
            &lt; 1.0° <span className="text-xs text-slate-400">slope</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Slow hydraulic head</div>
        </div>
      </div>

      {/* Interactive Scatter Plot Container */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono uppercase tracking-wider">
              {activeTab === 'elevation' ? 'Scatter Plot: Rainfall (mm) vs Elevation (m)' : 'Scatter Plot: Rainfall (mm) vs Slope (degrees)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">Legend:</span>
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Safe</span>
            <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Warning</span>
            <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span>High</span>
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500"></span>Critical</span>
          </div>
        </div>

        {/* SVG Scatter Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px] select-none"
          >
            {/* Background Grid */}
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              fill="#060C1D"
              stroke="#1E293B"
              strokeWidth="1"
            />

            {/* Inundation Danger Box Highlighting */}
            {activeTab === 'elevation' ? (
              <g>
                <rect
                  x={padding.left}
                  y={getRainY(maxRain)}
                  width={getElevX(120) - padding.left}
                  height={getRainY(120) - getRainY(maxRain)}
                  fill="rgba(239, 68, 68, 0.08)"
                  stroke="rgba(239, 68, 68, 0.3)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left + 8}
                  y={padding.top + 16}
                  fill="#F87171"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  HIGH HAZARD INUNDATION TRAP (Elev &lt; 120m, Rain &gt; 120mm)
                </text>
              </g>
            ) : (
              <g>
                <rect
                  x={padding.left}
                  y={getRainY(maxRain)}
                  width={getSlopeX(2.0) - padding.left}
                  height={getRainY(120) - getRainY(maxRain)}
                  fill="rgba(239, 68, 68, 0.08)"
                  stroke="rgba(239, 68, 68, 0.3)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left + 8}
                  y={padding.top + 16}
                  fill="#F87171"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  STAGNATING WATERLOG TRAP (Slope &lt; 2°, Rain &gt; 120mm)
                </text>
              </g>
            )}

            {/* Horizontal Grid Lines (Rainfall) */}
            {[50, 100, 150, 200, 250].map((r) => {
              if (r > maxRain) return null;
              const y = getRainY(r);
              return (
                <g key={r}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + plotWidth}
                    y2={y}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    {r}mm
                  </text>
                </g>
              );
            })}

            {/* Vertical Grid Lines */}
            {activeTab === 'elevation'
              ? [200, 500, 1000, 1500].map((e) => {
                  if (e > maxElev) return null;
                  const x = getElevX(e);
                  return (
                    <g key={e}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + plotHeight}
                        stroke="#1E293B"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={x}
                        y={padding.top + plotHeight + 14}
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                      >
                        {e}m
                      </text>
                    </g>
                  );
                })
              : [2, 5, 10, 15, 20].map((s) => {
                  if (s > maxSlope) return null;
                  const x = getSlopeX(s);
                  return (
                    <g key={s}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + plotHeight}
                        stroke="#1E293B"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={x}
                        y={padding.top + plotHeight + 14}
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                      >
                        {s}°
                      </text>
                    </g>
                  );
                })}

            {/* Scatter Points */}
            {dataPoints.map((point) => {
              const cx = activeTab === 'elevation' ? getElevX(point.elevation) : getSlopeX(point.slope);
              const cy = getRainY(point.rainfall);
              const color = getPointColor(point.riskLevel);
              const isHovered = hoveredPoint?.id === point.id;

              return (
                <circle
                  key={point.id}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : point.riskLevel === 'CRITICAL' ? 5.5 : 4}
                  fill={color}
                  stroke={isHovered ? '#FFFFFF' : '#0B1530'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onSelectPoint?.(point)}
                />
              );
            })}

            {/* Axis Titles */}
            <text
              x={padding.left + plotWidth / 2}
              y={svgHeight - 10}
              fill="#94A3B8"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
              textAnchor="middle"
            >
              {activeTab === 'elevation' ? '→ Terrain Elevation (m MSL - SRTM 30m)' : '→ Surface Slope Incline (degrees)'}
            </text>

            <text
              transform={`rotate(-90)`}
              x={-(padding.top + plotHeight / 2)}
              y={18}
              fill="#94A3B8"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
              textAnchor="middle"
            >
              → Daily Rainfall (mm - CHIRPS)
            </text>
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-[#0F172A]/95 backdrop-blur-md p-3 rounded-lg border border-cyan-500/60 shadow-xl text-xs font-mono text-white pointer-events-none max-w-xs animate-fadeIn">
              <div className="font-bold text-cyan-300 truncate">{hoveredPoint.locationName}</div>
              <div className="text-[10px] text-slate-400">{hoveredPoint.state}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[11px]">
                <div>Rainfall: <span className="font-bold text-white">{hoveredPoint.rainfall}mm</span></div>
                <div>Elevation: <span className="font-bold text-white">{Math.round(hoveredPoint.elevation)}m</span></div>
                <div>Slope: <span className="font-bold text-white">{hoveredPoint.slope}°</span></div>
                <div>Risk: <span className="font-bold" style={{ color: getPointColor(hoveredPoint.riskLevel) }}>{hoveredPoint.riskLevel}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hydromorphic Mechanics Commentary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-white font-mono flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Rainfall vs Elevation Dynamic</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            In alluvial river corridors (e.g. Brahmaputra in Assam, Kosi/Ganga in Bihar), elevations frequently dip below 60m MSL.
            When intense CHIRPS precipitation (&gt;150mm) collides with minimal gravity head, riverbanks burst and inundate vast deltas for weeks.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-white font-mono flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Rainfall vs Slope Dynamic</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Slopes &lt; 1.5° retard gravity conveyance and cause surface water accumulation. Conversely, in steep Western Ghats or Himalayan foothills (&gt; 12° slope), rainfall produces rapid torrential flash-flows down to lower plains.
          </p>
        </div>
      </div>
    </div>
  );
};
