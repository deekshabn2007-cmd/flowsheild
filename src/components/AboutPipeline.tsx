import React from 'react';
import { 
  ShieldAlert, 
  ArrowDown, 
  CloudRain, 
  Mountain, 
  Compass, 
  Satellite, 
  FileSpreadsheet, 
  Cpu, 
  Activity, 
  BellRing,
  CheckCircle2
} from 'lucide-react';

export const AboutPipeline: React.FC = () => {
  const steps = [
    {
      title: 'CHIRPS rainfall',
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      tag: '0.05° Daily Precipitation',
      desc: 'Retrieves daily gridded rainfall across India via Google Earth Engine catalog.'
    },
    {
      title: 'SRTM elevation',
      icon: <Mountain className="w-5 h-5 text-emerald-400" />,
      tag: '30m Topography DEM',
      desc: 'Extracts bare-earth digital elevation above Mean Sea Level (MSL) to pinpoint low basins.'
    },
    {
      title: 'Slope calculation',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      tag: 'Gradient in Degrees (°)',
      desc: 'Derives surface incline to differentiate flat pooling plains (<1.5°) from rapid runoff terrains.'
    },
    {
      title: 'Sentinel-1 flood observations',
      icon: <Satellite className="w-5 h-5 text-purple-400" />,
      tag: 'C-band SAR Ground Truth',
      desc: 'Identifies observed inundated water bodies during cloud-covered monsoon cycles (flood=1 or 0).'
    },
    {
      title: 'Feature dataset',
      icon: <FileSpreadsheet className="w-5 h-5 text-cyan-400" />,
      tag: 'Consolidated CSV Schema',
      desc: 'Integrates [latitude, longitude, rainfall, elevation, slope, flood] into unified tabular records.'
    },
    {
      title: 'Machine learning model',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      tag: 'Random Forest Classifier',
      desc: 'Non-linear tree ensemble trained to map geospatial features to flood occurrence probability.'
    },
    {
      title: 'Flood risk prediction',
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      tag: 'Hazard Scoring Engine',
      desc: 'Categorizes risk tiers: SAFE, WARNING, HIGH RISK, and CRITICAL based on calibrated thresholds.'
    },
    {
      title: 'Early warning dashboard',
      icon: <BellRing className="w-5 h-5 text-red-400" />,
      tag: 'FLOWSHIELD Command Portal',
      desc: 'Displays interactive maps, scatter diagnostics, and emergency alerts for civil defense action.'
    }
  ];

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-bold text-white font-mono tracking-wide">
            ABOUT FLOWSHIELD & END-TO-END PIPELINE
          </h3>
        </div>
        <p className="text-sm text-cyan-300 font-medium mt-1">
          FLOWSHIELD combines rainfall, terrain and satellite-derived flood observations to support flood-risk monitoring across India.
        </p>
      </div>

      {/* Mission Narrative */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
        <p>
          Floods are among the most devastating recurrent natural hazards across India, recurrently impacting the Brahmaputra valley in Assam, the Kosi and Ganga floodplains of Bihar and Uttar Pradesh, the Mahanadi delta in Odisha, and coastal Kerala and Maharashtra.
        </p>
        <p>
          Traditional river gauge systems suffer from latency and sparse spatial coverage. <strong>FLOWSHIELD</strong> pioneers an end-to-end architecture bridging planetary-scale Earth observation data (Google Earth Engine) with physical hydromorphology and machine learning to deliver proactive, explainable flood susceptibility insights.
        </p>
      </div>

      {/* Structured Pipeline Diagram */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between">
          <span>End-to-End Processing Pipeline</span>
          <span className="text-[11px] text-slate-500 font-mono">8 Sequential Stages</span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-600 before:to-red-500">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Dot marker */}
              <div className="absolute -left-6 sm:-left-8 top-3 w-3 h-3 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

              <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 font-bold">0{idx + 1}.</span>
                      <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 text-cyan-300 border border-slate-800 shrink-0 self-start sm:self-center">
                  {step.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
