import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { ForestRegion, CandidateAlert } from '../types/geospatial';
import { Maximize2, RotateCcw, Satellite, Search, Layers, Eye, ShieldAlert, Compass, Loader2 } from 'lucide-react';
import { googleMapsService } from '../services/googleMapsService';

interface ExplorerMapProps {
  selectedRegion: ForestRegion;
  onSelectRegion: (region: ForestRegion) => void;
  regions: ForestRegion[];
  alerts: CandidateAlert[];
  selectedAlert: CandidateAlert | null;
  onSelectAlert: (alert: CandidateAlert | null) => void;
}

export const ExplorerMap: React.FC<ExplorerMapProps> = ({
  selectedRegion,
  onSelectRegion,
  regions,
  alerts,
  selectedAlert,
  onSelectAlert
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobeView, setIsGlobeView] = useState(false);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const match = regions.find(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        onSelectRegion(match);
        onSelectAlert(null);
        return;
      }

      setIsSearchingGoogle(true);
      try {
        const liveRegion = await googleMapsService.searchLocation(searchQuery);
        if (liveRegion) {
          onSelectRegion(liveRegion);
          onSelectAlert(null);
        }
      } finally {
        setIsSearchingGoogle(false);
      }
    }
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // High performance dark style with customizable raster satellite toggle
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-dark': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          },
          'satellite-tiles': {
            type: 'raster',
            tiles: googleMapsService.getSatelliteTileUrls(),
            tileSize: 256,
            attribution: googleMapsService.getAttribution()
          }
        },
        layers: [
          {
            id: 'base-dark-layer',
            type: 'raster',
            source: 'osm-dark',
            minzoom: 0,
            maxzoom: 20,
            layout: { visibility: 'visible' },
            paint: {
              'raster-brightness-max': 0.35,
              'raster-contrast': 0.25,
              'raster-saturation': -0.7
            }
          },
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 20,
            layout: { visibility: 'none' },
            paint: { 'raster-opacity': 0.88 }
          }
        ]
      },
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 30,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    map.on('load', () => {
      // Add alerts GeoJSON source
      map.addSource('candidate-alerts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Polygon Fill Layer
      map.addLayer({
        id: 'alerts-fill',
        type: 'fill',
        source: 'candidate-alerts',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'critical', '#ef4444',
            'high', '#f59e0b',
            'moderate', '#eab308',
            'low', '#38bdf8',
            '#D5FF4F'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.75,
            0.45
          ]
        }
      });

      // Polygon Outline Layer
      map.addLayer({
        id: 'alerts-outline',
        type: 'line',
        source: 'candidate-alerts',
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'critical', '#ff6b6b',
            'high', '#fbbf24',
            'moderate', '#fef08a',
            'low', '#7dd3fc',
            '#D5FF4F'
          ],
          'line-width': 2,
          'line-dasharray': [2, 1]
        }
      });

      // Severity Center Marker Layer
      map.addLayer({
        id: 'alerts-points',
        type: 'circle',
        source: 'candidate-alerts',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'critical', '#ef4444',
            'high', '#f59e0b',
            'moderate', '#eab308',
            'low', '#38bdf8',
            '#D5FF4F'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Click interaction
      map.on('click', 'alerts-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const alertId = e.features[0].properties?.id;
        const found = alerts.find((a) => a.id === alertId);
        if (found) {
          onSelectAlert(found);
          map.flyTo({
            center: found.coordinates,
            zoom: 13.5,
            pitch: 45,
            speed: 1.2
          });
        }
      });

      map.on('mouseenter', 'alerts-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'alerts-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source whenever alerts change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('candidate-alerts') as GeoJSONSource | undefined;
    if (!source) return;

    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: alerts.map((alert) => ({
        type: 'Feature' as const,
        id: alert.id,
        geometry: alert.geometry,
        properties: {
          id: alert.id,
          regionName: alert.regionName,
          severity: alert.severity,
          affectedAreaHa: alert.affectedAreaHa,
          ndviDelta: alert.ndviDelta,
          screeningScore: alert.screeningScore,
          driverHypothesis: alert.driverHypothesis
        }
      }))
    };

    source.setData(featureCollection);
  }, [alerts, mapLoaded]);

  // Handle fly-to when selectedRegion changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.flyTo({
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 35,
      bearing: 0,
      speed: 1.4,
      essential: true
    });
  }, [selectedRegion, mapLoaded]);

  // Handle fly-to when an individual alert is selected
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedAlert) return;
    mapRef.current.flyTo({
      center: selectedAlert.coordinates,
      zoom: 14.2,
      pitch: 50,
      bearing: 15,
      speed: 1.5,
      essential: true
    });
  }, [selectedAlert, mapLoaded]);

  // Toggle basemap layers
  const toggleBasemap = useCallback(
    (mode: 'satellite' | 'dark') => {
      if (!mapRef.current || !mapLoaded) return;
      setBasemapMode(mode);
      if (mode === 'satellite') {
        mapRef.current.setLayoutProperty('satellite-layer', 'visibility', 'visible');
        mapRef.current.setLayoutProperty('base-dark-layer', 'visibility', 'none');
      } else {
        mapRef.current.setLayoutProperty('base-dark-layer', 'visibility', 'visible');
        mapRef.current.setLayoutProperty('satellite-layer', 'visibility', 'none');
      }
    },
    [mapLoaded]
  );

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 0,
      bearing: 0,
      speed: 1.2
    });
    onSelectAlert(null);
  }, [selectedRegion, onSelectAlert]);

  const toggleGlobe = useCallback(() => {
    if (!mapRef.current) return;
    const next = !isGlobeView;
    setIsGlobeView(next);
    if (next) {
      mapRef.current.flyTo({
        center: selectedRegion.center,
        zoom: 2.5,
        pitch: 10,
        bearing: 0,
        speed: 1.0
      });
    } else {
      mapRef.current.flyTo({
        center: selectedRegion.center,
        zoom: selectedRegion.zoom,
        pitch: 35,
        speed: 1.2
      });
    }
  }, [isGlobeView, selectedRegion]);

  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full min-h-[560px] lg:min-h-[640px] rounded-2xl overflow-hidden border border-verdant-border bg-verdant-bg shadow-2xl">
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Region Selector Pill Carousel / Dropdown */}
        <div className="pointer-events-auto flex items-center gap-2 bg-verdant-panel/90 backdrop-blur-md p-1.5 rounded-full border border-verdant-border shadow-lg">
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-verdant-textMuted border-r border-verdant-border">
            {isSearchingGoogle ? (
              <Loader2 className="w-3.5 h-3.5 text-verdant-lime animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-verdant-lime" />
            )}
            <input
              type="text"
              placeholder="Search Google Maps or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-transparent border-none outline-none text-white text-xs w-36 focus:w-48 transition-all placeholder:text-verdant-textDim"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-md no-scrollbar">
            {filteredRegions.map((region) => {
              const isSelected = region.id === selectedRegion.id;
              return (
                <button
                  key={region.id}
                  onClick={() => {
                    onSelectRegion(region);
                    onSelectAlert(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-verdant-lime text-black font-semibold shadow-glow-lime'
                      : 'text-verdant-textMuted hover:text-white hover:bg-verdant-surface'
                  }`}
                >
                  {region.name.split(' (')[0]}
                  <span className={`ml-1 text-[10px] ${isSelected ? 'text-black/70' : 'text-verdant-textDim'}`}>
                    ({region.country})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Map View Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-verdant-panel/90 backdrop-blur-md p-1 rounded-full border border-verdant-border shadow-lg">
          {/* Basemap Toggle */}
          <button
            onClick={() => toggleBasemap(basemapMode === 'satellite' ? 'dark' : 'satellite')}
            className={`p-2 rounded-full transition-all text-xs flex items-center gap-1.5 ${
              basemapMode === 'satellite'
                ? 'bg-verdant-surface text-verdant-lime border border-verdant-borderLight'
                : 'text-verdant-textMuted hover:text-white'
            }`}
            title="Toggle Satellite / Dark Basemap"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono hidden sm:inline">
              {basemapMode === 'satellite' ? 'Imagery' : 'Vector Dark'}
            </span>
          </button>

          {/* Globe View Toggle */}
          <button
            onClick={toggleGlobe}
            className={`p-2 rounded-full transition-all text-xs flex items-center gap-1.5 ${
              isGlobeView
                ? 'bg-verdant-surface text-verdant-lime border border-verdant-borderLight'
                : 'text-verdant-textMuted hover:text-white'
            }`}
            title="Toggle Global Zoom Overview"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono hidden sm:inline">
              {isGlobeView ? 'Global' : 'Regional'}
            </span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetView}
            className="p-2 rounded-full text-verdant-textMuted hover:text-white hover:bg-verdant-surface transition-colors"
            title="Reset Regional View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Sentinel Metadata */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-verdant-panel/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-verdant-border shadow-xl">
        {/* Severity Legend */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-verdant-textDim">
            Severity
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-verdant-red shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-verdant-textMuted">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-verdant-amber" />
              <span className="text-verdant-textMuted">High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-verdant-textMuted">Mod</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-verdant-textMuted">Watch</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-4 bg-verdant-border" />

        {/* Current Active Region Tile Info */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-verdant-textDim">
          <span>TILE: <span className="text-verdant-lime">{selectedRegion.sentinelTileId}</span></span>
          <span>•</span>
          <span>CANDIDATES: <span className="text-white font-medium">{alerts.length}</span></span>
        </div>
      </div>

      {/* Selected Alert Banner if active */}
      {selectedAlert && (
        <div className="absolute top-20 right-4 z-10 pointer-events-auto max-w-sm bg-verdant-panel/95 backdrop-blur-lg p-3.5 rounded-2xl border border-verdant-lime/40 shadow-glow-lime/20 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-verdant-red animate-ping" />
              <span className="text-xs font-mono font-bold text-white">{selectedAlert.id}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-verdant-red/20 text-verdant-red border border-verdant-red/40">
                {selectedAlert.severity}
              </span>
            </div>
            <button
              onClick={() => onSelectAlert(null)}
              className="text-verdant-textDim hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 text-xs text-verdant-textMuted">
            <p className="font-semibold text-white">{selectedAlert.driverHypothesis}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px] bg-verdant-surface p-2 rounded-lg border border-verdant-border">
              <div>
                <span className="text-verdant-textDim block">Area:</span>
                <span className="text-verdant-lime font-bold">{selectedAlert.affectedAreaHa} ha</span>
              </div>
              <div>
                <span className="text-verdant-textDim block">dNDVI:</span>
                <span className="text-verdant-red font-bold">{selectedAlert.ndviDelta.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-verdant-textDim block">Screening:</span>
                <span className="text-white">{selectedAlert.screeningScore}/100</span>
              </div>
              <div>
                <span className="text-verdant-textDim block">Cloud:</span>
                <span className="text-white">{selectedAlert.cloudCoverPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
