import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DataPoint, MapLayerType, RiskLevel } from '../types';
import { 
  Maximize2, 
  Layers, 
  Compass, 
  Info, 
  MapPin, 
  CloudRain, 
  Mountain, 
  Activity, 
  Waves,
  Eye
} from 'lucide-react';

interface IndiaMapProps {
  dataPoints: DataPoint[];
  selectedPoint: DataPoint | null;
  onSelectPoint: (point: DataPoint | null) => void;
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  isDemoData: boolean;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  dataPoints,
  selectedPoint,
  onSelectPoint,
  activeLayer,
  onChangeLayer,
  isDemoData
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTile, setActiveTile] = useState<'dark' | 'streets'>('dark');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Risk Color Mapping
  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case 'CRITICAL': return '#EF4444'; // Red
      case 'HIGH RISK': return '#F97316'; // Orange
      case 'WARNING': return '#F59E0B'; // Amber
      case 'SAFE': return '#10B981'; // Emerald
      default: return '#64748B';
    }
  };

  // Color according to selected layer
  const getMarkerColor = (point: DataPoint, layer: MapLayerType): { fill: string; stroke: string; radius: number } => {
    if (layer === 'risk') {
      const color = getRiskColor(point.riskLevel);
      const radius = point.riskLevel === 'CRITICAL' ? 10 : point.riskLevel === 'HIGH RISK' ? 8.5 : 7;
      return { fill: color, stroke: '#FFFFFF', radius };
    }

    if (layer === 'rainfall') {
      // 0 - 300 mm scale
      const r = point.rainfall;
      let fill = '#38BDF8';
      let radius = 6;
      if (r > 200) { fill = '#1D4ED8'; radius = 11; }
      else if (r > 150) { fill = '#2563EB'; radius = 9.5; }
      else if (r > 100) { fill = '#0284C7'; radius = 8; }
      else if (r > 50) { fill = '#38BDF8'; radius = 6.5; }
      else { fill = '#93C5FD'; radius = 5; }
      return { fill, stroke: '#FFFFFF', radius };
    }

    if (layer === 'elevation') {
      // Elevation scale: low (river plain) vs high
      const e = point.elevation;
      let fill = '#065F46';
      if (e < 20) fill = '#DC2626'; // Deep sea/coastal basin
      else if (e < 60) fill = '#F59E0B'; // Low-lying river plains
      else if (e < 200) fill = '#10B981'; // Plains
      else if (e < 800) fill = '#0284C7'; // Plateaus
      else fill = '#8B5CF6'; // Highlands
      return { fill, stroke: '#FFFFFF', radius: 7 };
    }

    if (layer === 'slope') {
      const s = point.slope;
      let fill = '#EF4444'; // Flat plains stagnation
      if (s <= 0.8) fill = '#DC2626';
      else if (s <= 2.0) fill = '#F59E0B';
      else if (s <= 5.0) fill = '#3B82F6';
      else fill = '#10B981'; // Steep slope
      return { fill, stroke: '#FFFFFF', radius: 7 };
    }

    if (layer === 'flood') {
      // Sentinel-1 SAR Ground Truth
      const isFlooded = point.flood === 1;
      return {
        fill: isFlooded ? '#EF4444' : '#475569',
        stroke: isFlooded ? '#FECACA' : '#94A3B8',
        radius: isFlooded ? 10 : 5.5
      };
    }

    return { fill: '#38BDF8', stroke: '#FFFFFF', radius: 7 };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Bounding box for India and surrounding basins
      const southWest = L.latLng(6.5, 66.0);
      const northEast = L.latLng(37.5, 99.0);
      const bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(mapContainerRef.current, {
        center: [22.8, 80.5], // Center of India
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        maxBounds: bounds,
        maxBoundsViscosity: 0.8,
        zoomControl: false,
        attributionControl: false
      });

      // Add zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '<span class="text-[10px] text-slate-500 font-mono">FLOWSHIELD • CartoDB / OSM</span>'
      }).addTo(map);

      // CartoDB Dark Matter tile layer
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      });

      darkTiles.addTo(map);
      tileLayerRef.current = darkTiles;

      // Layer group for marker points
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Mouse move coordinates tracker
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4))
        });
      });

      map.on('mouseout', () => {
        setCursorCoords(null);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Do not destroy on every render, cleanup on unmount
    };
  }, []);

  // Switch Tile layers
  const switchTiles = (type: 'dark' | 'streets') => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (type === 'dark') {
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      });
      darkTiles.addTo(mapInstanceRef.current);
      tileLayerRef.current = darkTiles;
    } else {
      const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
      streetTiles.addTo(mapInstanceRef.current);
      tileLayerRef.current = streetTiles;
    }
    setActiveTile(type);
  };

  // Render Markers when dataPoints or activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    dataPoints.forEach((point) => {
      const { fill, stroke, radius } = getMarkerColor(point, activeLayer);
      const isSelected = selectedPoint?.id === point.id;

      const circle = L.circleMarker([point.latitude, point.longitude], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: fill,
        color: isSelected ? '#38BDF8' : stroke,
        weight: isSelected ? 3 : 1.5,
        opacity: 0.95,
        fillOpacity: point.riskLevel === 'CRITICAL' ? 0.95 : 0.85,
        className: point.riskLevel === 'CRITICAL' ? 'pulse-critical' : ''
      });

      // Custom Popup HTML conforming strictly to specifications
      const riskBadgeClass =
        point.riskLevel === 'CRITICAL'
          ? 'bg-red-500/20 text-red-400 border-red-500/40'
          : point.riskLevel === 'HIGH RISK'
          ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
          : point.riskLevel === 'WARNING'
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

      const popupContent = `
        <div class="p-3.5 min-w-[260px] text-slate-100 font-sans">
          <div class="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2.5">
            <div>
              <div class="font-bold text-sm text-white flex items-center gap-1.5">
                <span>${point.locationName}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                ${point.latitude.toFixed(3)}°N, ${point.longitude.toFixed(3)}°E • ${point.state}
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${riskBadgeClass}">
              ${point.riskLevel}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700/50">
              <div class="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Rainfall (CHIRPS)</span>
              </div>
              <div class="text-sm font-bold text-cyan-300 mt-0.5">
                ${point.rainfall.toFixed(1)} <span class="text-[10px] font-normal text-slate-400">mm</span>
              </div>
            </div>

            <div class="bg-slate-800/80 p-2 rounded border border-slate-700/50">
              <div class="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Elevation (SRTM)</span>
              </div>
              <div class="text-sm font-bold text-emerald-300 mt-0.5">
                ${Math.round(point.elevation)} <span class="text-[10px] font-normal text-slate-400">m MSL</span>
              </div>
            </div>

            <div class="bg-slate-800/80 p-2 rounded border border-slate-700/50">
              <div class="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Slope Gradient</span>
              </div>
              <div class="text-sm font-bold text-amber-300 mt-0.5">
                ${point.slope.toFixed(1)}° <span class="text-[10px] font-normal text-slate-400">incline</span>
              </div>
            </div>

            <div class="bg-slate-800/80 p-2 rounded border border-slate-700/50">
              <div class="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Sentinel-1 SAR</span>
              </div>
              <div class="text-xs font-bold ${point.flood === 1 ? 'text-red-400' : 'text-slate-300'} mt-1">
                ${point.flood === 1 ? 'FLOOD OBSERVED' : 'NON-FLOODED'}
              </div>
            </div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
            Click point to open full hydrology and early warning details.
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, { maxWidth: 320 });

      circle.on('click', () => {
        onSelectPoint(point);
      });

      markersLayerRef.current?.addLayer(circle);
    });
  }, [dataPoints, activeLayer, selectedPoint]);

  // Fit Bounds helper
  const fitBoundsToData = () => {
    if (!mapInstanceRef.current || dataPoints.length === 0) return;
    const latLngs = dataPoints.map((p) => L.latLng(p.latitude, pointLng(p.longitude)));
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  };

  function pointLng(lng: number) {
    return lng;
  }

  // Pan to selected point if provided
  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPoint.latitude, selectedPoint.longitude], 8, {
        duration: 1.2
      });
    }
  }, [selectedPoint]);

  return (
    <div className="relative w-full bg-[#070D1E] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control Bar */}
      <div className="bg-[#0B1530] px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Layer Selector */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Map Layer:</span>
          </span>

          <div className="inline-flex bg-slate-900/90 p-1 rounded-lg border border-slate-700/70 text-xs">
            <button
              id="layer-btn-risk"
              onClick={() => onChangeLayer('risk')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeLayer === 'risk'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flood Risk
            </button>
            <button
              id="layer-btn-rainfall"
              onClick={() => onChangeLayer('rainfall')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeLayer === 'rainfall'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rainfall (CHIRPS)
            </button>
            <button
              id="layer-btn-elevation"
              onClick={() => onChangeLayer('elevation')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeLayer === 'elevation'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Elevation (SRTM)
            </button>
            <button
              id="layer-btn-slope"
              onClick={() => onChangeLayer('slope')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeLayer === 'slope'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Slope
            </button>
            <button
              id="layer-btn-flood"
              onClick={() => onChangeLayer('flood')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeLayer === 'flood'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sentinel-1 SAR
            </button>
          </div>
        </div>

        {/* View Mode & Fit Bounds */}
        <div className="flex items-center gap-2">
          {/* Tile Switch */}
          <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60 text-[11px] font-mono">
            <button
              onClick={() => switchTiles('dark')}
              className={`px-2 py-1 rounded cursor-pointer ${
                activeTile === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => switchTiles('streets')}
              className={`px-2 py-1 rounded cursor-pointer ${
                activeTile === 'streets' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Streets
            </button>
          </div>

          <button
            onClick={fitBoundsToData}
            title="Fit India bounds"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit Bounds</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top-left Disclaimer & Legend Overlay */}
        <div className="absolute top-3 left-3 z-[1000] max-w-xs pointer-events-auto">
          <div className="bg-[#0B1530]/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/70 shadow-xl text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
              <span className="font-bold text-white font-mono flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>RISK CLASSIFICATION</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {dataPoints.length} STNS
              </span>
            </div>

            {/* Legend items */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-300">SAFE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-300">WARNING</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                <span className="text-slate-300">HIGH RISK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                <span className="text-red-300 font-bold">CRITICAL</span>
              </div>
            </div>

            {/* Scientific Validation Disclaimer Notice */}
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Risk categories derived via hydromorphic rule-base & rainfall thresholds.
                <span className="text-slate-300"> Formal validation awaits trained ML model integration.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Station Quick Summary Drawer on Map */}
        {selectedPoint && (
          <div className="absolute bottom-10 left-3 right-3 sm:right-auto sm:max-w-md z-[1000] pointer-events-auto">
            <div className="bg-[#0F172A]/95 backdrop-blur-md p-4 rounded-xl border border-cyan-500/50 shadow-2xl text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{selectedPoint.locationName}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    {selectedPoint.state} • {selectedPoint.drainageBasin || 'Basin'} ({selectedPoint.latitude.toFixed(3)}°N, {selectedPoint.longitude.toFixed(3)}°E)
                  </div>
                </div>
                <button
                  onClick={() => onSelectPoint(null)}
                  className="text-slate-400 hover:text-white text-base px-1 leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                <div className="bg-slate-800/80 p-1.5 rounded text-center">
                  <div className="text-[9px] text-slate-400">CHIRPS Rain</div>
                  <div className="font-bold text-cyan-300">{selectedPoint.rainfall}mm</div>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded text-center">
                  <div className="text-[9px] text-slate-400">SRTM Elev</div>
                  <div className="font-bold text-emerald-300">{Math.round(selectedPoint.elevation)}m</div>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded text-center">
                  <div className="text-[9px] text-slate-400">Slope</div>
                  <div className="font-bold text-amber-300">{selectedPoint.slope}°</div>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded text-center">
                  <div className="text-[9px] text-slate-400">SAR Flood</div>
                  <div className={`font-bold ${selectedPoint.flood === 1 ? 'text-red-400' : 'text-slate-300'}`}>
                    {selectedPoint.flood === 1 ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Coordinate Status Bar */}
        <div className="absolute bottom-2 left-3 z-[1000] bg-[#070D1E]/90 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>CURSOR:</span>
            {cursorCoords ? (
              <span className="text-cyan-300 font-semibold">
                {cursorCoords.lat}° N, {cursorCoords.lng}° E
              </span>
            ) : (
              <span className="text-slate-500">Hover over map</span>
            )}
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-slate-400">
            DATUM: WGS-84 / EPSG:4326
          </div>
        </div>
      </div>
    </div>
  );
};
