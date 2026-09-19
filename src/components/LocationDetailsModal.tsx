import React from 'react';
import { DataPoint } from '../types';
import { 
  MapPin, 
  CloudRain, 
  Mountain, 
  Compass, 
  Waves, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface LocationDetailsModalProps {
  point: DataPoint | null;
  onClose: () => void;
}

export const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  point,
  onClose
}) => {
  if (!point) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'HIGH RISK':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'WARNING':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'SAFE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B1530] border border-cyan-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-mono">
                {point.locationName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {point.state} • {point.drainageBasin || 'Regional Basin'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Coordinates Bar */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">GEODETIC POSITION:</span>
            <span className="text-cyan-300 font-bold">
              {point.latitude.toFixed(4)}° N, {point.longitude.toFixed(4)}° E
            </span>
          </div>

          {/* Key Parameters 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Rainfall */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>Precipitation (CHIRPS)</span>
              </div>
              <div className="text-xl font-bold text-white">
                {point.rainfall.toFixed(1)} <span className="text-xs font-normal text-cyan-300">mm</span>
              </div>
              <div className="text-[10px] text-slate-500">24-hour satellite aggregate</div>
            </div>

            {/* 2. Elevation */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-emerald-400" />
                <span>Elevation (SRTM)</span>
              </div>
              <div className="text-xl font-bold text-white">
                {Math.round(point.elevation)} <span className="text-xs font-normal text-emerald-300">m MSL</span>
              </div>
              <div className="text-[10px] text-slate-500">1-arcsecond DEM</div>
            </div>

            {/* 3. Slope */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Slope Gradient</span>
              </div>
              <div className="text-xl font-bold text-white">
                {point.slope.toFixed(1)} <span className="text-xs font-normal text-amber-300">degrees</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {point.slope < 1.0 ? 'Flat terrain (slow drainage)' : 'Moderate/steep gradient'}
              </div>
            </div>

            {/* 4. Flood Observation */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-red-400" />
                <span>Sentinel-1 SAR</span>
              </div>
              <div className={`text-sm font-bold ${point.flood === 1 ? 'text-red-400' : 'text-slate-300'}`}>
                {point.flood === 1 ? 'OBSERVED INUNDATION (1)' : 'NON-FLOODED (0)'}
              </div>
              <div className="text-[10px] text-slate-500">Ground truth radar mask</div>
            </div>
          </div>

          {/* Computed Risk Level Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">ASSESSED HAZARD STATUS:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getRiskBadge(point.riskLevel)}`}>
                {point.riskLevel} ({point.riskScore}/100)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {point.riskLevel === 'CRITICAL'
                ? `Critical emergency status: Intense precipitation of ${point.rainfall} mm combined with low terrain (${Math.round(point.elevation)}m) and flat slope (${point.slope}°) creates severe accumulation trap.`
                : point.riskLevel === 'HIGH RISK'
                ? `High vulnerability zone: Rainfall of ${point.rainfall} mm exceeds natural channel capacity on a gentle ${point.slope}° gradient.`
                : point.riskLevel === 'WARNING'
                ? `Moderate watch: Sustained rainfall of ${point.rainfall} mm warrants continued monitoring of river stage levels.`
                : 'Safe status: Precipitation is within standard runoff conveyance and soil moisture absorption limits.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
