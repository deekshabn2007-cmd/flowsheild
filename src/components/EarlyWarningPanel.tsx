import React, { useState } from 'react';
import { EarlyWarningAlert, RiskLevel } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  MapPin, 
  CloudRain, 
  Mountain, 
  Radio, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface EarlyWarningPanelProps {
  alerts: EarlyWarningAlert[];
  onSelectAlertLocation: (alert: EarlyWarningAlert) => void;
}

export const EarlyWarningPanel: React.FC<EarlyWarningPanelProps> = ({
  alerts,
  onSelectAlertLocation
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'RED' | 'ORANGE'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterLevel === 'RED') return a.alertLevel === 'RED';
    if (filterLevel === 'ORANGE') return a.alertLevel === 'ORANGE';
    return true;
  });

  const redCount = alerts.filter((a) => a.alertLevel === 'RED').length;
  const orangeCount = alerts.filter((a) => a.alertLevel === 'ORANGE').length;

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Early Warning & Elevated Flood Risk Alert Panel
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated threshold identification based on CHIRPS precipitation, SRTM elevation, and terrain slope
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              filterLevel === 'ALL'
                ? 'bg-slate-700 text-white border-slate-600 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterLevel('RED')}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              filterLevel === 'RED'
                ? 'bg-red-950 text-red-300 border-red-800 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-red-400'
            }`}
          >
            Red Alert ({redCount})
          </button>
          <button
            onClick={() => setFilterLevel('ORANGE')}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              filterLevel === 'ORANGE'
                ? 'bg-orange-950 text-orange-300 border-orange-800 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-orange-400'
            }`}
          >
            Orange Alert ({orangeCount})
          </button>
        </div>
      </div>

      {/* Official Protocol Advisory Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-300">Operational Notice: </span>
          Early warning entries are derived deterministically from hydrological thresholds and satellite indicators.
          In operational crisis management, cross-validate with official Central Water Commission (CWC) flood forecasting bulletins and IMD radar advisories.
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs font-mono">
            No active high-risk alerts matching the current filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isRed = alert.alertLevel === 'RED';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRed
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/80'
                    : 'bg-orange-950/15 border-orange-500/40 hover:border-orange-500/80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                      isRed ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    }`}>
                      {alert.riskLevel}
                    </span>
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{alert.locationName}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({alert.state})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      CHIRPS: <strong>{alert.rainfall.toFixed(1)} mm</strong>
                    </span>
                    <span className="text-xs font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      SRTM: <strong>{Math.round(alert.elevation)}m</strong>
                    </span>
                    <span className="text-xs font-mono text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      Slope: <strong>{alert.slope.toFixed(1)}°</strong>
                    </span>

                    <button
                      onClick={() => onSelectAlertLocation(alert)}
                      className="px-2.5 py-0.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Locate</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Grid details: Reason and Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Physical / Hydrological Rationale
                    </div>
                    <div className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      {alert.reason}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Recommended Monitoring & Mitigation Status
                    </div>
                    <div className="text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 font-mono text-[11px]">
                      {alert.recommendedAction}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
