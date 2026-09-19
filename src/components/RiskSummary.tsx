import React from 'react';
import { RiskLevel, DatasetSummary } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface RiskSummaryProps {
  summary: DatasetSummary;
  selectedRiskFilter: Record<RiskLevel, boolean>;
  onToggleRiskFilter: (risk: RiskLevel) => void;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  summary,
  selectedRiskFilter,
  onToggleRiskFilter
}) => {
  const total = summary.totalLocations || 1;

  const categories: {
    level: RiskLevel;
    count: number;
    color: string;
    bgBadge: string;
    border: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      level: 'SAFE',
      count: summary.riskCounts['SAFE'] || 0,
      color: 'text-emerald-400',
      bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500/30',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      description: 'Precipitation within drainage capacity; adequate terrain gradient'
    },
    {
      level: 'WARNING',
      count: summary.riskCounts['WARNING'] || 0,
      color: 'text-amber-400',
      bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/30',
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      description: 'Elevated precipitation or slow drainage; warrants active monitoring'
    },
    {
      level: 'HIGH RISK',
      count: summary.riskCounts['HIGH RISK'] || 0,
      color: 'text-orange-400',
      bgBadge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      description: 'Heavy precipitation over low-slope floodplain; riverbank overflow likely'
    },
    {
      level: 'CRITICAL',
      count: summary.riskCounts['CRITICAL'] || 0,
      color: 'text-red-400',
      bgBadge: 'bg-red-500/10 text-red-300 border-red-500/30',
      border: 'border-red-500/30',
      icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
      description: 'Extreme inundation hazard; severe rainfall on flat alluvial basin'
    }
  ];

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Flood Risk Summary & Vulnerability Distribution</span>
          </h3>
          <p className="text-xs text-slate-400">
            Categorization across {summary.totalLocations} monitored geographic stations
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          Click category to filter map
        </span>
      </div>

      {/* Progress bar visual distribution */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Distribution Bar</span>
          <span>100% Monitored Area</span>
        </div>
        <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${((summary.riskCounts['SAFE'] || 0) / total) * 100}%` }}
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
            title={`Safe: ${summary.riskCounts['SAFE']} (${(((summary.riskCounts['SAFE'] || 0) / total) * 100).toFixed(1)}%)`}
          />
          <div
            style={{ width: `${((summary.riskCounts['WARNING'] || 0) / total) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Warning: ${summary.riskCounts['WARNING']} (${(((summary.riskCounts['WARNING'] || 0) / total) * 100).toFixed(1)}%)`}
          />
          <div
            style={{ width: `${((summary.riskCounts['HIGH RISK'] || 0) / total) * 100}%` }}
            className="bg-orange-500 h-full transition-all duration-500"
            title={`High Risk: ${summary.riskCounts['HIGH RISK']} (${(((summary.riskCounts['HIGH RISK'] || 0) / total) * 100).toFixed(1)}%)`}
          />
          <div
            style={{ width: `${((summary.riskCounts['CRITICAL'] || 0) / total) * 100}%` }}
            className="bg-red-500 h-full rounded-r-full transition-all duration-500"
            title={`Critical: ${summary.riskCounts['CRITICAL']} (${(((summary.riskCounts['CRITICAL'] || 0) / total) * 100).toFixed(1)}%)`}
          />
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {categories.map((cat) => {
          const percentage = ((cat.count / total) * 100).toFixed(1);
          const isSelected = selectedRiskFilter[cat.level];

          return (
            <div
              key={cat.level}
              onClick={() => onToggleRiskFilter(cat.level)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? `bg-slate-900/90 ${cat.border} ring-1 ring-cyan-400/40 shadow-lg`
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span className={`text-xs font-bold font-mono ${cat.color}`}>
                    {cat.level}
                  </span>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${cat.bgBadge}`}>
                  {percentage}%
                </span>
              </div>

              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-white">
                  {cat.count}
                  <span className="text-xs text-slate-400 font-normal ml-1">stations</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Map Filter</span>
                <span className={isSelected ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                  {isSelected ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Validation Disclaimer Callout */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Methodological Note: </span>
          Current risk categories are computed from empirical hydrological rule matrices linking precipitation, elevation, and terrain slope.
          They serve as an engineering baseline for monitoring. Scientific calibration will be established once the full machine learning classification model is trained and linked.
        </div>
      </div>
    </div>
  );
};
