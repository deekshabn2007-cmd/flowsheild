import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  FileText, 
  Loader2,
  HelpCircle,
  Table
} from 'lucide-react';
import { parseFloodCSV, generateSampleCSVString, downloadCSV } from '../utils/csvParser';
import { DataPoint } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (points: DataPoint[], fileName: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [previewPoints, setPreviewPoints] = useState<DataPoint[]>([]);
  const [allParsedPoints, setAllParsedPoints] = useState<DataPoint[]>([]);
  const [detectedCols, setDetectedCols] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setParseErrors(['Selected file is not a valid CSV. Please upload a .csv file.']);
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setParseErrors([]);
    setParseWarnings([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const result = parseFloodCSV(content, file.name);

        setIsProcessing(false);
        setDetectedCols(result.detectedColumns);

        if (!result.success) {
          setParseErrors(result.errors);
          setParseWarnings(result.warnings);
          setPreviewPoints([]);
          setAllParsedPoints([]);
        } else {
          setParseErrors([]);
          setParseWarnings(result.warnings);
          setAllParsedPoints(result.data);
          setPreviewPoints(result.data.slice(0, 5));
        }
      } catch (err: any) {
        setIsProcessing(false);
        setParseErrors([`File read error: ${err.message || 'Unknown parsing failure'}`]);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setParseErrors(['Failed to read file from disk.']);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (allParsedPoints.length > 0) {
      onDatasetLoaded(allParsedPoints, fileName);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateSampleCSVString();
    downloadCSV(csvContent, 'flowshield_real_data_template.csv');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B1530] border border-cyan-500/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Import Real Earth Engine / Satellite CSV
              </h3>
              <p className="text-xs text-slate-400">
                Seamlessly import CHIRPS rainfall, SRTM elevation & slope, and Sentinel-1 flood ground-truth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs font-mono">
          {/* Expected Columns Box */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                Expected CSV Columns Schema
              </span>
              <button
                onClick={downloadTemplate}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] underline cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample Template (.CSV)</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                latitude*
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                longitude*
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                rainfall*
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                elevation*
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                slope*
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                flood (optional 0 or 1)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                location (optional)
              </span>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-cyan-400 animate-bounce" />
              <div className="text-sm font-bold text-white">
                Drag and drop your Earth Engine CSV here
              </div>
              <p className="text-slate-400 text-xs">
                or click to browse from your computer
              </p>
            </div>
          </div>

          {/* Loading state */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-cyan-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Parsing and validating geospatial coordinates...</span>
            </div>
          )}

          {/* Errors Display */}
          {parseErrors.length > 0 && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3.5 space-y-1.5 text-red-300 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>CSV Validation Errors:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-300/90 font-sans">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings Display */}
          {parseWarnings.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 space-y-1 text-amber-300 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>Parsing Warnings:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/80 font-sans">
                {parseWarnings.slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table if successfully parsed */}
          {previewPoints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully Parsed {allParsedPoints.length} Valid Records ({fileName})</span>
                </span>
                <span className="text-slate-400">Showing First 5 Rows</span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Location</th>
                      <th className="p-2">Lat / Lng</th>
                      <th className="p-2">Rainfall</th>
                      <th className="p-2">Elevation</th>
                      <th className="p-2">Slope</th>
                      <th className="p-2">Flood (SAR)</th>
                      <th className="p-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                    {previewPoints.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="p-2 text-white font-bold truncate max-w-[120px]">{p.locationName}</td>
                        <td className="p-2 text-slate-300">{p.latitude.toFixed(2)}, {p.longitude.toFixed(2)}</td>
                        <td className="p-2 text-cyan-300 font-bold">{p.rainfall} mm</td>
                        <td className="p-2 text-emerald-300">{Math.round(p.elevation)} m</td>
                        <td className="p-2 text-amber-300">{p.slope}°</td>
                        <td className="p-2 text-slate-300">{p.flood === 1 ? '1 (Flooded)' : '0 (Dry)'}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            p.riskLevel === 'CRITICAL' ? 'text-red-400 bg-red-950' :
                            p.riskLevel === 'HIGH RISK' ? 'text-orange-400 bg-orange-950' :
                            p.riskLevel === 'WARNING' ? 'text-amber-400 bg-amber-950' : 'text-emerald-400 bg-emerald-950'
                          }`}>
                            {p.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sample Template</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={allParsedPoints.length === 0}
              onClick={handleApply}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                allParsedPoints.length > 0
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Apply Dataset ({allParsedPoints.length} Stations)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
