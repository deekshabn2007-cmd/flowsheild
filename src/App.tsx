import React, { useState, useMemo } from 'react';
import { DataPoint, FilterState, MapLayerType, RiskLevel, DatasetSummary } from './types';
import { getDemoDataset } from './data/demoData';
import { computeDatasetSummary, generateEarlyWarnings } from './utils/hydrology';
import { generateSampleCSVString, downloadCSV, exportDataPointsToCSV } from './utils/csvParser';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { IndiaMap } from './components/IndiaMap';
import { ControlPanel } from './components/ControlPanel';
import { RiskSummary } from './components/RiskSummary';
import { RainfallAnalysis } from './components/RainfallAnalysis';
import { TerrainAnalysis } from './components/TerrainAnalysis';
import { PredictionSection } from './components/PredictionSection';
import { EarlyWarningPanel } from './components/EarlyWarningPanel';
import { DataSourcePanel } from './components/DataSourcePanel';
import { AboutPipeline } from './components/AboutPipeline';
import { LocationDetailsModal } from './components/LocationDetailsModal';
import { UploadModal } from './components/UploadModal';
import { 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Cpu, 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // Master dataset state
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => getDemoDataset());
  const [datasetMeta, setDatasetMeta] = useState<{ sourceName: string; isDemo: boolean; fileName?: string }>({
    sourceName: 'Demo Baseline (60+ Monitored River Basins)',
    isDemo: true
  });

  // Selected station for detailed inspection
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<string>('map');

  // Upload modal visibility
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter State
  const initialFilters: FilterState = {
    date: '2026-09-19',
    rainfallPeriod: '24h',
    minRainfall: 0,
    maxElevation: 4000,
    riskLevels: {
      SAFE: true,
      WARNING: true,
      'HIGH RISK': true,
      CRITICAL: true
    },
    activeLayer: 'risk',
    searchQuery: '',
    selectedState: ''
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Distinct states list for dropdown
  const statesList = useMemo(() => {
    const set = new Set<string>();
    dataPoints.forEach((p) => {
      if (p.state) set.add(p.state);
    });
    return Array.from(set).sort();
  }, [dataPoints]);

  // Filtered dataset points
  const filteredPoints = useMemo(() => {
    return dataPoints.filter((p) => {
      // 1. Risk level filter
      if (!filters.riskLevels[p.riskLevel]) return false;

      // 2. Minimum rainfall filter
      if (p.rainfall < filters.minRainfall) return false;

      // 3. State filter
      if (filters.selectedState && p.state !== filters.selectedState) return false;

      // 4. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = p.locationName.toLowerCase().includes(q);
        const matchState = p.state.toLowerCase().includes(q);
        const matchBasin = p.drainageBasin?.toLowerCase().includes(q);
        if (!matchName && !matchState && !matchBasin) return false;
      }

      return true;
    });
  }, [dataPoints, filters]);

  // Dataset Summary Statistics
  const summary: DatasetSummary = useMemo(() => {
    return computeDatasetSummary(filteredPoints, datasetMeta.sourceName, datasetMeta.isDemo);
  }, [filteredPoints, datasetMeta]);

  // Early Warning Alerts
  const earlyWarnings = useMemo(() => {
    return generateEarlyWarnings(filteredPoints);
  }, [filteredPoints]);

  // Handlers
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSelectedPoint(null);
    showToast('Filters reset to default settings.');
  };

  const handleDownloadSample = () => {
    const sampleCSV = generateSampleCSVString();
    downloadCSV(sampleCSV, 'flowshield_real_data_schema_template.csv');
    showToast('Downloaded real Earth Engine CSV schema template.');
  };

  const handleExportCurrentCSV = () => {
    const csvContent = exportDataPointsToCSV(filteredPoints);
    downloadCSV(csvContent, `flowshield_export_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exported ${filteredPoints.length} stations to CSV.`);
  };

  const handleDatasetLoaded = (points: DataPoint[], fileName: string) => {
    setDataPoints(points);
    setDatasetMeta({
      sourceName: `User Dataset (${fileName})`,
      isDemo: false,
      fileName
    });
    // Reset filters to show full uploaded data
    setFilters(initialFilters);
    setSelectedPoint(null);
    showToast(`Successfully loaded ${points.length} stations from "${fileName}".`);
  };

  const handleToggleRiskFilter = (level: RiskLevel) => {
    setFilters({
      ...filters,
      riskLevels: {
        ...filters.riskLevels,
        [level]: !filters.riskLevels[level]
      }
    });
  };

  const handleRunPrediction = () => {
    setActiveTab('prediction');
    showToast('Switched to Machine Learning Prediction Interface.');
  };

  const handleSelectAlertLocation = (alert: any) => {
    const match = dataPoints.find((p) => p.id === alert.id);
    if (match) {
      setSelectedPoint(match);
      setActiveTab('map');
      showToast(`Panned to ${match.locationName} (${match.state}).`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] border border-cyan-500/70 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetFilters={handleResetFilters}
        onDownloadSample={handleDownloadSample}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* FIRST SCREEN: Top Hero Identity & Immediate Key Stats */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1530]/80 border border-slate-800/80 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  FLOW<span className="text-cyan-400">SHIELD</span>
                </h2>
                <span className="text-xs font-mono text-slate-400">|</span>
                <span className="text-sm font-semibold text-slate-200">
                  India-Wide Flood Prediction & Early Warning System
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Satellite data pipeline: CHIRPS Rainfall (GEE) • SRTM Elevation & Slope • Sentinel-1 SAR Flood Inundation
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCurrentCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
                title="Export active filtered data to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            </div>
          </div>

          {/* Key Statistics Cards */}
          <StatsCards summary={summary} />
        </div>

        {/* TAB 1: OVERVIEW & INDIA FLOOD RISK MAP (Default & primary requested layout) */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Split layout: Sidebar Control Panel + Large India Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Sidebar Control Panel (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <ControlPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  summary={summary}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onResetFilters={handleResetFilters}
                  onRunPrediction={handleRunPrediction}
                  onDownloadSample={handleDownloadSample}
                  statesList={statesList}
                />
              </div>

              {/* Large India Flood Risk Map (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <IndiaMap
                  dataPoints={filteredPoints}
                  selectedPoint={selectedPoint}
                  onSelectPoint={setSelectedPoint}
                  activeLayer={filters.activeLayer}
                  onChangeLayer={(layer: MapLayerType) => setFilters({ ...filters, activeLayer: layer })}
                  isDemoData={datasetMeta.isDemo}
                />
              </div>
            </div>

            {/* Flood Risk Summary Distribution */}
            <RiskSummary
              summary={summary}
              selectedRiskFilter={filters.riskLevels}
              onToggleRiskFilter={handleToggleRiskFilter}
            />

            {/* Rainfall Analysis Chart */}
            <RainfallAnalysis
              dataPoints={filteredPoints}
              summary={summary}
              onSelectPoint={setSelectedPoint}
            />

            {/* Terrain Analysis Scatter Plots */}
            <TerrainAnalysis
              dataPoints={filteredPoints}
              summary={summary}
              onSelectPoint={setSelectedPoint}
            />

            {/* Early Warning Alert Panel */}
            <EarlyWarningPanel
              alerts={earlyWarnings}
              onSelectAlertLocation={handleSelectAlertLocation}
            />

            {/* Data Source & Attribution Panel */}
            <DataSourcePanel
              summary={summary}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDownloadSample={handleDownloadSample}
            />

            {/* About FLOWSHIELD & 8-Step Pipeline */}
            <AboutPipeline />
          </div>
        )}

        {/* TAB 2: RAINFALL & TERRAIN ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <RainfallAnalysis
              dataPoints={filteredPoints}
              summary={summary}
              onSelectPoint={setSelectedPoint}
            />
            <TerrainAnalysis
              dataPoints={filteredPoints}
              summary={summary}
              onSelectPoint={setSelectedPoint}
            />
          </div>
        )}

        {/* TAB 3: EARLY WARNING ALERTS */}
        {activeTab === 'warning' && (
          <div className="space-y-6">
            <EarlyWarningPanel
              alerts={earlyWarnings}
              onSelectAlertLocation={handleSelectAlertLocation}
            />
            <RiskSummary
              summary={summary}
              selectedRiskFilter={filters.riskLevels}
              onToggleRiskFilter={handleToggleRiskFilter}
            />
          </div>
        )}

        {/* TAB 4: FLOOD PREDICTION (MACHINE LEARNING MODEL & ARCHITECTURE) */}
        {activeTab === 'prediction' && (
          <div className="space-y-6">
            <PredictionSection />
          </div>
        )}

        {/* TAB 5: DATA SOURCES & PIPELINE */}
        {activeTab === 'datasources' && (
          <div className="space-y-6">
            <DataSourcePanel
              summary={summary}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDownloadSample={handleDownloadSample}
            />
            <AboutPipeline />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#050914] border-t border-slate-800/80 py-6 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FLOWSHIELD</span>
            <span>•</span>
            <span>India-Wide Flood Prediction & Early Warning System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>CHIRPS (GEE)</span>
            <span>•</span>
            <span>SRTM 30m</span>
            <span>•</span>
            <span>Sentinel-1 SAR</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">Hackathon Edition</span>
          </div>
        </div>
      </footer>

      {/* Location Details Modal */}
      <LocationDetailsModal
        point={selectedPoint}
        onClose={() => setSelectedPoint(null)}
      />

      {/* Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />
    </div>
  );
}
