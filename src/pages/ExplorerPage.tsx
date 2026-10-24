import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import maplibregl, { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { SiteHeader } from '../components/SiteHeader';
import { GeospatialLossLedger } from '../components/GeospatialLossLedger';
import { DEMO_REGIONS } from '../data/demoRegions';
import { DEMO_ALERTS } from '../data/demoAlerts';
import { 
  ForestRegion, 
  CandidateAlert 
} from '../types/geospatial';
import { 
  Search, 
  RotateCcw, 
  Satellite, 
  ChevronLeft, 
  ChevronRight,
  Sliders,
  ArrowRight,
  Calendar,
  Columns,
  TrendingUp,
  MapPin,
  X,
  Loader2,
  Radio
} from 'lucide-react';
import { googleMapsService } from '../services/googleMapsService';
import {
  BackendState,
  LiveMeta,
  checkBackend,
  featuresToAlerts,
  registerWatch,
  removeWatch,
  runRecentScan,
  subscribeStream
} from '../services/liveDetectionService';

export const ExplorerPage: React.FC = () => {
  // Navigation & Region state
  const [selectedRegion, setSelectedRegion] = useState<ForestRegion>(DEMO_REGIONS[0]);
  const [selectedAlert, setSelectedAlert] = useState<CandidateAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Panels
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  const [showLedgerDrawer, setShowLedgerDrawer] = useState(false);

  const [basemapMode, setBasemapMode] = useState<'dark' | 'satellite'>('dark');

  // Date Pickers (Bi-temporal Observation Windows)
  const [dateEarlier, setDateEarlier] = useState('2024-01-14');
  const [dateLater, setDateLater] = useState('2024-11-20');


  // Split-Slider State for Split Screen View
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Dynamic Regions & Live Alerts
  const [regionsList, setRegionsList] = useState<ForestRegion[]>(DEMO_REGIONS);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [liveAlertsMap, setLiveAlertsMap] = useState<Record<string, CandidateAlert[]>>({});

  // Live monitor (real Sentinel-2 analysis through the FastAPI + Earth Engine backend)
  const [backendState, setBackendState] = useState<BackendState>('checking');
  const [backendDetail, setBackendDetail] = useState<string | undefined>();
  const [liveDays, setLiveDays] = useState<5 | 10 | 15>(10);
  const [isScanning, setIsScanning] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveMetaMap, setLiveMetaMap] = useState<Record<string, LiveMeta>>({});
  const [autoMonitor, setAutoMonitor] = useState(false);
  const [streamConnected, setStreamConnected] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const regionsRef = useRef<ForestRegion[]>(DEMO_REGIONS);

  // Filter alerts for the selected region
  const regionAlerts = liveAlertsMap[selectedRegion.id] || DEMO_ALERTS.filter((a) => a.regionId === selectedRegion.id);
  const regionAlertsRef = useRef(regionAlerts);
  regionAlertsRef.current = regionAlerts;


  regionsRef.current = regionsList;
  const liveMeta = liveMetaMap[selectedRegion.id];

  // Poll backend health so the badge always tells the truth
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const r = await checkBackend();
      if (!cancelled) {
        setBackendState(r.state);
        setBackendDetail(r.detail);
      }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const applyLiveResult = useCallback((region: ForestRegion, alerts: CandidateAlert[], meta: LiveMeta) => {
    setLiveAlertsMap((prev) => ({ ...prev, [region.id]: alerts }));
    setLiveMetaMap((prev) => ({ ...prev, [region.id]: meta }));
    if (meta.status === 'ok') {
      setDateEarlier(meta.baseline_seasonal.end);
      setDateLater(meta.monitoring.latest_scene || meta.monitoring.end);
    }
  }, []);

  const runLiveScan = useCallback(async () => {
    setIsScanning(true);
    setLiveError(null);
    try {
      const { alerts, meta } = await runRecentScan(selectedRegion, liveDays);
      applyLiveResult(selectedRegion, alerts, meta);
      setSelectedAlert(null);
    } catch (e) {
      setLiveError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [selectedRegion, liveDays, applyLiveResult]);

  // Auto-monitor: backend re-scans on a schedule (or when Spark sees a new scene) and pushes results here
  useEffect(() => {
    if (!autoMonitor) return;
    registerWatch(selectedRegion, liveDays).catch(() => setLiveError('Could not register region for monitoring'));
    const stop = subscribeStream(
      (ev) => {
        if (ev.type === 'scan' && ev.region_id && ev.meta && ev.feature_collection) {
          const region = regionsRef.current.find((r) => r.id === ev.region_id);
          if (!region) return;
          applyLiveResult(region, featuresToAlerts(ev.feature_collection, ev.meta, region), ev.meta);
          setLiveToast(
            `New ${ev.reason === 'spark' ? 'Spark-triggered' : 'scheduled'} scan: ${ev.meta.candidates_total ?? 0} candidate patch(es)`
          );
          setTimeout(() => setLiveToast(null), 6000);
        } else if (ev.type === 'error') {
          setLiveError(ev.message || 'Monitor error');
        }
      },
      setStreamConnected
    );
    return () => {
      stop();
      setStreamConnected(false);
      removeWatch(selectedRegion.id);
    };
  }, [autoMonitor, selectedRegion, liveDays, applyLiveResult]);

  // Handle Dragging in Split-Screen Mode
  const handleSplitMove = useCallback((clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (rawX / rect.width) * 100));
    setSplitPosition(percentage);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSplit(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit) handleSplitMove(e.clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDraggingSplit, handleSplitMove]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
            id: 'base-map-layer',
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
            paint: { 'raster-opacity': 0.85 }
          }
        ]
      },
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 20,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    map.on('load', () => {
      // 1. Add Candidate Alerts Source
      map.addSource('candidate-alerts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Alerts Fill Layer (Earth tones: Crimson, terracotta, ochre)
      map.addLayer({
        id: 'alerts-fill',
        type: 'fill',
        source: 'candidate-alerts',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'critical', '#8A3B31',
            'high', '#A66952',
            'moderate', '#B89D6E',
            'low', '#8C9276',
            '#B89D6E'
          ],
          'fill-opacity': 0.55
        }
      });

      // Alerts Outline Layer
      map.addLayer({
        id: 'alerts-outline',
        type: 'line',
        source: 'candidate-alerts',
        paint: {
          'line-color': '#F3F0E8',
          'line-width': 1.5,
          'line-dasharray': [3, 2]
        }
      });

      // Alerts Point Marker Layer
      map.addLayer({
        id: 'alerts-points',
        type: 'circle',
        source: 'candidate-alerts',
        paint: {
          'circle-radius': 5,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'critical', '#8A3B31',
            'high', '#A66952',
            'moderate', '#B89D6E',
            'low', '#8C9276',
            '#B89D6E'
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#F3F0E8'
        }
      });


      // 3. User Interactivity: Click on Candidate Alert
      map.on('click', 'alerts-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const alertId = e.features[0].properties?.id;
        const found = regionAlertsRef.current.find((a) => a.id === alertId) || DEMO_ALERTS.find((a) => a.id === alertId);
        if (found) {
          setSelectedAlert(found);
          map.flyTo({
            center: found.coordinates,
            zoom: 13.8,
            pitch: 35,
            speed: 1.2
          });
        }
      });


      // Cursor Pointers
      map.on('mouseenter', 'alerts-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'alerts-fill', () => { map.getCanvas().style.cursor = ''; });


      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Alerts GeoJSON Data to Map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('candidate-alerts') as GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: 'FeatureCollection',
      features: regionAlerts.map((alert) => ({
        type: 'Feature',
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
    });
  }, [regionAlerts, mapLoaded]);


  // Fly to region when selected
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.flyTo({
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 20,
      bearing: 0,
      speed: 1.2,
      essential: true
    });
  }, [selectedRegion, mapLoaded]);

  // Basemap switcher
  const toggleBasemap = (mode: 'dark' | 'satellite') => {
    if (!mapRef.current || !mapLoaded) return;
    setBasemapMode(mode);
    if (mode === 'satellite') {
      mapRef.current.setLayoutProperty('satellite-layer', 'visibility', 'visible');
      mapRef.current.setLayoutProperty('base-map-layer', 'visibility', 'none');
    } else {
      mapRef.current.setLayoutProperty('base-map-layer', 'visibility', 'visible');
      mapRef.current.setLayoutProperty('satellite-layer', 'visibility', 'none');
    }
  };

  const handleReset = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: selectedRegion.center,
      zoom: selectedRegion.zoom,
      pitch: 0,
      bearing: 0,
      speed: 1.2
    });
    setSelectedAlert(null);
  };

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const match = regionsList.find(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        setSelectedRegion(match);
        setSelectedAlert(null);
        return;
      }

      setIsSearchingGoogle(true);
      try {
        const liveRegion = await googleMapsService.searchLocation(searchQuery);
        if (liveRegion) {
          const generated = googleMapsService.generateAlertsForCoordinates(
            liveRegion,
            dateEarlier,
            dateLater
          );
          setLiveAlertsMap((prev) => ({ ...prev, [liveRegion.id]: generated }));
          setRegionsList((prev) => [liveRegion, ...prev.filter((r) => r.id !== liveRegion.id)]);
          setSelectedRegion(liveRegion);
          setSelectedAlert(null);
        }
      } finally {
        setIsSearchingGoogle(false);
      }
    }
  };

  const filteredRegions = regionsList.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-verdant-dark text-verdant-darkText overflow-hidden select-none">
      {/* Top Header */}
      <SiteHeader theme="dark" />

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* LEFT / PRIMARY SECTION: The Interactive Map with Full Viewport Capability */}
        <div 
          ref={splitContainerRef}
          className="relative h-full overflow-hidden transition-all duration-300"
          style={{ width: splitScreenMode ? `${splitPosition}%` : '100%' }}
        >
          {/* Map canvas */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Floating Top Bar Cluster (Search + Region Selector + Date Pickers) */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Search Box */}
            <div className="flex items-center gap-2 bg-[#0c0d0a]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-verdant-borderDark text-xs text-verdant-darkText shadow-xl">
              {isSearchingGoogle ? (
                <Loader2 className="w-3.5 h-3.5 text-verdant-sand animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 text-verdant-sand" />
              )}
              <input
                type="text"
                placeholder="Search Maps"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="bg-transparent border-none outline-none text-white text-xs w-44 sm:w-56 placeholder:text-verdant-textSecondary"
              />
            </div>

            {/* Quick Region Dropdown */}
            <div className="bg-[#0c0d0a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-verdant-borderDark text-xs shadow-xl flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-verdant-sand" />
              <select
                value={selectedRegion.id}
                onChange={(e) => {
                  const reg = regionsList.find((r) => r.id === e.target.value);
                  if (reg) {
                    setSelectedRegion(reg);
                    setSelectedAlert(null);
                  }
                }}
                className="bg-transparent text-white font-mono text-xs outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate"
              >
                {regionsList.map((r) => (
                  <option key={r.id} value={r.id} className="bg-verdant-dark text-white font-sans">
                    {r.name.split(' (')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Observation Dates (Bi-temporal Window Selector) */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#0c0d0a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-verdant-borderDark text-xs shadow-xl font-mono">
              <Calendar className="w-3.5 h-3.5 text-verdant-sand" />
              <input
                type="date"
                value={dateEarlier}
                onChange={(e) => setDateEarlier(e.target.value)}
                className="bg-transparent text-verdant-beige text-[11px] outline-none cursor-pointer w-30"
              />
              <span className="text-verdant-textSecondary">→</span>
              <input
                type="date"
                value={dateLater}
                onChange={(e) => setDateLater(e.target.value)}
                className="bg-transparent text-white text-[11px] outline-none cursor-pointer w-30"
              />
            </div>

            {/* Toggle Region Drawer Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-[#0c0d0a]/90 backdrop-blur-md border border-verdant-borderDark text-verdant-sand hover:text-white transition-colors shadow-xl"
              title={sidebarOpen ? 'Collapse regions list' : 'Expand regions list'}
            >
              {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Top Right Controls (Basemap Switcher + Split Screen Toggle + Ledger Overlay) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 pointer-events-auto">
            {/* Split Screen Mode Toggle */}
      

            {/* Geospatial Loss Ledger Drawer Trigger */}


            {/* Basemap switch */}
            <button
              onClick={() => toggleBasemap(basemapMode === 'dark' ? 'satellite' : 'dark')}
              className="px-3 py-1.5 rounded-full text-xs font-mono bg-[#0c0d0a]/90 border border-verdant-borderDark text-verdant-beige hover:text-white transition-colors flex items-center gap-1.5 shadow-xl"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{basemapMode === 'satellite' ? 'Satellite' : 'Dark Map'}</span>
            </button>

            {/* Reset View */}
            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-[#0c0d0a]/90 border border-verdant-borderDark text-verdant-beige hover:text-white transition-colors shadow-xl"
              title="Reset regional view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>


          {/* Live Monitor panel (real Sentinel-2 data via backend) */}
          <div className="absolute top-16 right-4 z-20 w-72 pointer-events-auto bg-[#0c0d0a]/95 backdrop-blur-md border border-verdant-borderDark p-3.5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-sand flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Live monitor
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  liveMeta
                    ? 'text-emerald-300 border-emerald-500/50 bg-emerald-500/10'
                    : 'text-amber-300 border-amber-500/50 bg-amber-500/10'
                }`}
              >
                {liveMeta ? 'LIVE DATA' : 'DEMO DATA'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-verdant-beige" title={backendDetail}>
              <span
                className={`w-2 h-2 rounded-full ${
                  backendState === 'live'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendState === 'no-ee'
                    ? 'bg-amber-400'
                    : backendState === 'offline'
                    ? 'bg-red-400'
                    : 'bg-gray-500'
                }`}
              />
              {backendState === 'live' && 'Backend + Earth Engine connected'}
              {backendState === 'no-ee' && 'Backend up, Earth Engine not signed in'}
              {backendState === 'offline' && 'Backend offline (showing demo data)'}
              {backendState === 'checking' && 'Checking backend…'}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-verdant-textSecondary block mb-1">
                Monitoring window
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {([5, 10, 15] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setLiveDays(d)}
                    className={`py-1.5 text-xs font-mono font-bold border transition-colors ${
                      liveDays === d
                        ? 'bg-verdant-sand text-black border-verdant-sand'
                        : 'text-verdant-beige border-verdant-borderDark hover:text-white'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runLiveScan}
              disabled={isScanning || backendState !== 'live'}
              className="w-full py-2 text-xs font-mono font-bold uppercase tracking-wider bg-verdant-bg text-verdant-dark hover:bg-verdant-beige disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Sentinel-2…
                </>
              ) : (
                `Scan last ${liveDays} days`
              )}
            </button>

            <label
              className={`flex items-center gap-2 text-[11px] font-mono ${
                backendState === 'live' ? 'text-verdant-beige cursor-pointer' : 'text-verdant-textSecondary opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={autoMonitor}
                disabled={backendState !== 'live'}
                onChange={(e) => setAutoMonitor(e.target.checked)}
                className="accent-[#A89679]"
              />
              Auto-monitor new satellite passes
              {autoMonitor && (
                <span className={streamConnected ? 'text-emerald-300' : 'text-amber-300'}>
                  {streamConnected ? '● streaming' : '○ connecting'}
                </span>
              )}
            </label>

            {liveError && <p className="text-[11px] text-red-300 font-mono leading-snug">{liveError}</p>}

            {liveMeta && (
              <div className="pt-2 border-t border-verdant-borderDark space-y-1 text-[11px] font-mono text-verdant-textSecondary">
                {liveMeta.status === 'ok' ? (
                  <>
                    <p>
                      Latest pass: <strong className="text-white">{liveMeta.monitoring.latest_scene}</strong> ·{' '}
                      {liveMeta.monitoring.scenes} scene(s)
                    </p>
                    <p>
                      Window: {liveMeta.monitoring.start} → {liveMeta.monitoring.end}
                      {liveMeta.widened && <span className="text-amber-300"> (widened: clouds)</span>}
                    </p>
                    <p>
                      Clear pixels: {liveMeta.monitoring.valid_pixel_percent ?? '–'}% · Baseline: same season last year
                    </p>
                    <p className="text-verdant-sand font-bold">
                      {liveMeta.candidates_total ?? 0} candidate patch(es) · {liveMeta.total_loss_ha ?? 0} ha
                    </p>
                    {liveMeta.warning && <p className="text-amber-300">{liveMeta.warning}</p>}
                  </>
                ) : (
                  <p className="text-amber-300">{liveMeta.message}</p>
                )}
              </div>
            )}
          </div>

          {liveToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-emerald-900/90 border border-emerald-500/50 text-emerald-100 text-xs font-mono shadow-xl">
              {liveToast}
            </div>
          )}

          {/* Collapsible Left Regions Sidebar */}
          {sidebarOpen && (
            <div className="absolute top-28 left-4 z-20 w-80 max-h-[calc(100vh-210px)] bg-[#0c0d0a]/95 backdrop-blur-md border border-verdant-borderDark p-4 space-y-4 overflow-y-auto no-scrollbar shadow-2xl">
              <div className="flex items-center justify-between border-b border-verdant-borderDark pb-2.5">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-sand">
                  Corridors ({filteredRegions.length})
                </span>
                
              </div>

              <div className="space-y-1">
                {filteredRegions.map((region) => {
                  const isSelected = region.id === selectedRegion.id;
                  return (
                    <button
                      key={region.id}
                      onClick={() => {
                        setSelectedRegion(region);
                        setSelectedAlert(null);
                      }}
                      className={`w-full text-left p-3 transition-colors border-l-2 ${
                        isSelected
                          ? 'bg-verdant-darkSecondary border-verdant-sand text-white font-semibold'
                          : 'border-transparent text-verdant-beige/80 hover:text-white hover:bg-verdant-darkSecondary/50 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base font-bold">{region.name.split(' (')[0]}</span>
                        <span className="text-[10px] font-mono font-semibold text-verdant-textSecondary">
                          {region.country}
                        </span>
                      </div>
                      <div className="text-[11px] text-verdant-textSecondary mt-1 line-clamp-1 font-medium">
                        {region.primaryRisk}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono font-bold text-verdant-sand">
                        <span>{region.activeAlertsCount} alerts</span>
                        <span>•</span>
                        <span>{region.totalLossHa} ha</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Region Floating Footer Card (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-20 pointer-events-auto bg-[#0c0d0a]/95 backdrop-blur-md p-4 sm:p-5 border border-verdant-borderDark max-w-sm sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-sand block">
                  Target Landscape
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-bold mt-0.5 truncate">
                  {selectedRegion.name}
                </h3>
                <p className="text-xs font-mono font-semibold text-verdant-textSecondary mt-0.5">
                  {selectedRegion.center[1].toFixed(4)}°N, {selectedRegion.center[0].toFixed(4)}°E • Tile {selectedRegion.sentinelTileId}
                </p>
              </div>

              <Link
                to="/change-detection"
                className="px-4 py-2 rounded-full bg-verdant-bg text-verdant-dark text-xs uppercase tracking-wider font-bold hover:bg-verdant-beige transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Change Lab</span>
              </Link>
            </div>

            <div className="mt-3 pt-3 border-t border-verdant-borderDark/80 flex items-center justify-between text-[11px] font-mono font-semibold text-verdant-textSecondary">
              <span>Canopy: <strong className="text-white">{selectedRegion.baselineCanopyCoverPercent}%</strong></span>
              <span>Detections: <strong className="text-verdant-sand">{regionAlerts.length} candidate patches</strong></span>
            </div>
          </div>

          {/* Selected Candidate Alert Slide-out Panel (Bottom Right) */}
          {selectedAlert && (
            <div className="absolute bottom-6 right-6 z-30 pointer-events-auto w-80 sm:w-96 bg-[#0c0d0a]/95 backdrop-blur-md border border-verdant-borderDark p-5 shadow-2xl animate-fade-rise">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-verdant-sand">
                    Candidate Disturbance
                  </span>
                  <h4 className="font-mono text-sm font-bold text-white mt-0.5">
                    {selectedAlert.id}
                  </h4>
                </div>

                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-verdant-textSecondary hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-verdant-textSecondary font-medium">
                <p className="text-white font-serif text-base font-bold">
                  {selectedAlert.driverHypothesis}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-verdant-borderDark font-mono text-[11px]">
                  <div>
                    <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Estimated Area</span>
                    <span className="text-white font-bold text-sm">{selectedAlert.affectedAreaHa} ha</span>
                  </div>
                  <div>
                    <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">dNDVI Decline</span>
                    <span className="text-verdant-alertHigh font-bold text-sm">{selectedAlert.ndviDelta.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Observation Date</span>
                    <span className="text-verdant-beige font-semibold">{selectedAlert.laterDate}</span>
                  </div>
                  <div>
                    <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Screening Score</span>
                    <span className="text-verdant-sand font-bold text-sm">{selectedAlert.screeningScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-verdant-borderDark flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-verdant-textSecondary">
                  Requires ground verification
                </span>

                <Link
                  to={`/alerts/${selectedAlert.id}`}
                  className="text-xs uppercase tracking-wider font-mono font-bold text-verdant-sand hover:underline flex items-center gap-1"
                >
                  <span>Full Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT / SPLIT-SCREEN COMPARISON VIEW (When Split Mode is active) */}
        {splitScreenMode && (
          <div 
            className="relative h-full bg-[#11120f] border-l border-verdant-borderDark flex flex-col overflow-y-auto no-scrollbar shadow-2xl"
            style={{ width: `${100 - splitPosition}%` }}
          >
            {/* Split Screen Header */}
            <div className="sticky top-0 z-10 bg-[#0c0d0a]/95 backdrop-blur-md border-b border-verdant-borderDark p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-verdant-sand font-bold">
                  Side-by-Side Satellite Lab
                </span>
                <h4 className="font-serif text-sm font-bold text-white mt-0.5">
                  {selectedRegion.name.split(' (')[0]} • Spectral Differential
                </h4>
              </div>

              <button
                onClick={() => setSplitScreenMode(false)}
                className="p-1.5 rounded-full hover:bg-verdant-darkSecondary text-verdant-textSecondary hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Screen Body Content */}
            <div className="p-4 space-y-6 flex-1">
              {/* Mini Change Lab Viewer directly in Split-Screen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-verdant-textSecondary">
                  <span>Baseline ({dateEarlier})</span>
                  <span>Monitoring ({dateLater})</span>
                </div>

                <div className="h-64 w-full bg-[#171815] rounded-xl border border-verdant-borderDark relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#232f24] to-[#3e4a36] opacity-80" />
                  
                  {/* Overlay disturbance patches */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-16 rounded-full bg-verdant-alertHigh/60 border border-verdant-beige/50 blur-[1px] animate-pulse" />
                  </div>

                  <div className="relative z-10 text-center font-mono text-xs text-white bg-black/60 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                    <span className="block font-bold">dNDVI Vegetative Loss: -0.42</span>
                    <span className="text-[10px] text-verdant-sand">SWIR exposed bare soil signature</span>
                  </div>
                </div>
              </div>

              {/* Quick Regional Stats */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-[#171815] p-3 rounded-lg border border-verdant-borderDark">
                  <span className="text-[10px] uppercase text-verdant-textSecondary block">Total Loss Area</span>
                  <span className="text-lg font-bold text-white">{selectedRegion.totalLossHa} ha</span>
                </div>
                <div className="bg-[#171815] p-3 rounded-lg border border-verdant-borderDark">
                  <span className="text-[10px] uppercase text-verdant-textSecondary block">Active Alerts</span>
                  <span className="text-lg font-bold text-verdant-sand">{regionAlerts.length} candidate</span>
                </div>
              </div>

              {/* Mini Ledger within split screen */}
              <div className="border-t border-verdant-borderDark pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-verdant-sand font-bold block mb-2">
                  Observed Loss in this corridor
                </span>
                <div className="space-y-2">
                  {regionAlerts.slice(0, 4).map((al) => (
                    <div
                      key={al.id}
                      onClick={() => setSelectedAlert(al)}
                      className="p-2.5 rounded-lg bg-[#171815] hover:bg-verdant-darkSecondary border border-verdant-borderDark/60 cursor-pointer flex items-center justify-between text-xs font-mono transition-colors"
                    >
                      <div>
                        <span className="text-white font-bold block">{al.id}</span>
                        <span className="text-[10px] text-verdant-textSecondary">{al.driverHypothesis}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-verdant-sand font-bold">{al.affectedAreaHa} ha</span>
                        <span className="text-[10px] text-verdant-alertHigh block">{al.ndviDelta.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM / OVERLAY DRAWER: Geospatial Loss Analytics & Evidence Ledger (Full Screen / Collapsible) */}
        {showLedgerDrawer && (
          <div className="absolute inset-x-0 bottom-0 top-16 z-40 bg-[#070806]/98 backdrop-blur-xl border-t border-verdant-borderDark p-4 sm:p-8 overflow-y-auto space-y-6 shadow-2xl animate-fade-rise">
            <div className="flex items-center justify-between border-b border-verdant-borderDark pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-verdant-sand tracking-widest font-bold">
                  TERRAGUARD PLANETARY OBSERVATORY
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-0.5">
                  Full Analytics Dashboard
                </h2>
              </div>

              <button
                onClick={() => setShowLedgerDrawer(false)}
                className="p-2 rounded-full bg-verdant-darkSecondary text-verdant-beige hover:text-white border border-verdant-borderDark transition-colors"
                title="Close ledger drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The exact Geospatial Loss Analytics & Evidence Ledger matching user screenshot */}
            <GeospatialLossLedger
              alerts={DEMO_ALERTS}
              regions={DEMO_REGIONS}
              currentRegionName={selectedRegion.name}
            />
          </div>
        )}

      </div>
    </div>
  );
};
