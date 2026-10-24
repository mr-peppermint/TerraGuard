import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { DEMO_ALERTS } from '../data/demoAlerts';
import { DEMO_REGIONS } from '../data/demoRegions';
import { CandidateAlert } from '../types/geospatial';
import { googleMapsService } from '../services/googleMapsService';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

export const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const alert = DEMO_ALERTS.find((a) => a.id === id) || DEMO_ALERTS[0];
  const region = DEMO_REGIONS.find((r) => r.id === alert.regionId) || DEMO_REGIONS[0];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

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
          'google-satellite': {
            type: 'raster',
            tiles: googleMapsService.getSatelliteTileUrls(),
            tileSize: 256,
            attribution: googleMapsService.getAttribution()
          }
        },
        layers: [
          {
            id: 'base-satellite-layer',
            type: 'raster',
            source: 'google-satellite',
            minzoom: 0,
            maxzoom: 20,
            paint: { 'raster-opacity': 0.95 }
          }
        ]
      },
      center: alert.coordinates,
      zoom: 13.5,
      pitch: 30,
      attributionControl: false
    });

    map.on('load', () => {
      // Add polygon feature
      map.addSource('alert-polygon', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: alert.geometry,
          properties: {}
        }
      });

      map.addLayer({
        id: 'alert-polygon-fill',
        type: 'fill',
        source: 'alert-polygon',
        paint: {
          'fill-color': '#A66952', // warm rust
          'fill-opacity': 0.65
        }
      });

      map.addLayer({
        id: 'alert-polygon-line',
        type: 'line',
        source: 'alert-polygon',
        paint: {
          'line-color': '#F3F0E8',
          'line-width': 1.5,
          'line-dasharray': [3, 2]
        }
      });

      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [alert]);

  const handleExportGeoJSON = () => {
    const blob = new Blob([JSON.stringify(alert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${alert.id}-geospatial-evidence.geojson`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col text-verdant-textPrimary">
      <SiteHeader theme="light" />

      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-16 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/alerts"
            className="text-xs font-mono text-verdant-textSecondary hover:text-verdant-textPrimary flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Candidate Register</span>
          </Link>

          <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-verdant-border text-verdant-textSecondary">
            {alert.status}
          </span>
        </div>

        {/* Header Title Section */}
        <div className="space-y-4 border-b border-verdant-border pb-10">
          <div className="flex items-center gap-3 text-xs font-mono font-semibold text-verdant-textSecondary">
            <span>{alert.id}</span>
            <span>•</span>
            <span>MGRS Tile {alert.sentinelTileId}</span>
            <span>•</span>
            <span>Sentinel-2 MSI Level-2A</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-verdant-textPrimary">
            {alert.driverHypothesis}
          </h1>

          <p className="text-base sm:text-lg text-verdant-textSecondary font-medium leading-relaxed max-w-3xl">
            Candidate forest canopy disturbance identified in {alert.regionName}, {alert.country}. Requires field survey or high-resolution optical inspection before legal confirmation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-8 font-mono text-xs">
            <div>
              <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Coordinates</span>
              <span className="font-bold text-sm text-verdant-textPrimary">{alert.coordinates[1].toFixed(4)}°N, {alert.coordinates[0].toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Affected Area</span>
              <span className="font-bold text-sm text-verdant-textPrimary">{alert.affectedAreaHa} hectares</span>
            </div>
            <div>
              <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Observation Period</span>
              <span className="font-bold text-sm text-verdant-textPrimary">{alert.earlierDate} → {alert.laterDate}</span>
            </div>
            <div>
              <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Screening Score</span>
              <span className="font-bold text-sm text-verdant-textPrimary">{alert.screeningScore}/100</span>
            </div>
          </div>
        </div>

        {/* Section 1: Observation & Map */}
        <section className="space-y-6">
          <div>
            <span className="text-[10px] font-mono tracking-ultra uppercase text-verdant-textSecondary block">
              Section 01
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-verdant-textPrimary mt-1">
              Observation
            </h2>
          </div>

          <p className="text-sm text-verdant-textSecondary leading-relaxed">
            Bi-temporal Sentinel-2 MSI surface-reflectance composites show a continuous cluster of pixels exhibiting rapid vegetation index degradation. The spatial geometry traces an irregular clearing boundary encompassing approximately {alert.affectedAreaHa} hectares.
          </p>

          {/* Map showing Affected Polygon */}
          <div className="relative aspect-[16/9] w-full bg-verdant-dark border border-verdant-border overflow-hidden">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute top-4 left-4 pointer-events-none bg-verdant-dark/90 backdrop-blur-md px-3 py-1 border border-verdant-borderDark text-[11px] font-mono text-verdant-darkText">
              <span>WGS84 Georeferenced Polygon Delineation</span>
            </div>
          </div>
        </section>

        {/* Section 2: Evidence & Multi-Spectral Profile */}
        <section className="space-y-6 border-t border-verdant-border pt-12">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
              Section 02
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary mt-1">
              Evidence & AI Predictive Trajectory
            </h2>
          </div>

          <p className="text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
            Canopy reflectance was evaluated across calibrated optical and shortwave infrared bands. The transition reveals a precipitous drop in the red-edge and near-infrared plateau, accompanied by a steep increase in mineral soil reflectance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-2 shadow-sm rounded-xl">
              <span className="text-[10px] uppercase font-bold text-verdant-textSecondary block">Band 4 (Red 665nm)</span>
              <div className="font-serif text-2xl font-bold text-verdant-textPrimary">
                {alert.spectralBefore.b04_red} → <span className="text-verdant-alertHigh">{alert.spectralAfter.b04_red}</span>
              </div>
              <span className="text-[11px] text-verdant-textSecondary block font-sans font-medium">
                Chlorophyll absorption loss.
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-2 shadow-sm rounded-xl">
              <span className="text-[10px] uppercase font-bold text-verdant-textSecondary block">Band 8 (NIR 842nm)</span>
              <div className="font-serif text-2xl font-bold text-verdant-textPrimary">
                {alert.spectralBefore.b08_nir} → <span className="text-verdant-alertHigh">{alert.spectralAfter.b08_nir}</span>
              </div>
              <span className="text-[11px] text-verdant-textSecondary block font-sans font-medium">
                Spongy mesophyll scattering loss.
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-2 shadow-sm rounded-xl">
              <span className="text-[10px] uppercase font-bold text-verdant-textSecondary block">Delta NDVI</span>
              <div className="font-serif text-2xl font-bold text-verdant-alertHigh">
                {alert.ndviDelta.toFixed(2)}
              </div>
              <span className="text-[11px] text-verdant-textSecondary block font-sans font-medium">
                {alert.ndviEarlier} down to {alert.ndviLater}.
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-verdant-bg space-y-2 shadow-sm rounded-xl">
              <span className="text-[10px] uppercase font-bold text-verdant-alertHigh block flex items-center gap-1">
                <span>🤖 3-Yr Expansion Risk</span>
              </span>
              <div className="font-serif text-2xl font-bold text-verdant-textPrimary">
                +{(alert.affectedAreaHa * 0.48).toFixed(1)} ha
              </div>
              <span className="text-[11px] text-verdant-textSecondary block font-sans font-medium">
                87% model perimeter confidence.
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Interpretation */}
        <section className="space-y-6 border-t border-verdant-border pt-12">
          <div>
            <span className="text-[10px] font-mono tracking-ultra uppercase text-verdant-textSecondary block">
              Section 03
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-verdant-textPrimary mt-1">
              Interpretation
            </h2>
          </div>

          <div className="space-y-4 text-sm text-verdant-textSecondary leading-relaxed">
            <p>
              The multi-spectral profile confirms that the observed change is consistent with physical vegetation clearing rather than temporary weather variations. Shortwave Infrared (Band 11) reflectance elevated to {alert.spectralAfter.b11_swir1}, typical of exposed soil and gravel sub-surface layers.
            </p>
            <p>
              The spatial configuration indicates {alert.driverHypothesis.toLowerCase()}, cleaving through what was previously contiguous crown cover.
            </p>
          </div>
        </section>

        {/* Section 4: Uncertainty & Verification Checklist */}
        <section className="space-y-6 border-t border-verdant-border pt-12">
          <div>
            <span className="text-[10px] font-mono tracking-ultra uppercase text-verdant-textSecondary block">
              Section 04
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-verdant-textPrimary mt-1">
              Uncertainty & Human Verification
            </h2>
          </div>

          <div className="bg-[#EBE7DD] p-8 border border-verdant-border space-y-6">
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-verdant-textPrimary font-medium">
                Alternative Hypotheses to Rule Out
              </h3>
              <p className="text-xs text-verdant-textSecondary leading-relaxed">
                Before deploying enforcement rangers or filing formal legal complaints, remote analysts must systematically evaluate whether this spectral drop could arise from non-destructive phenomena:
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-verdant-textPrimary">
              {alert.alternativeExplanations.map((alt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-verdant-sand font-bold">•</span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-verdant-border space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-textSecondary block">
                Recommended Next Verification Step
              </span>
              <p className="text-xs font-mono text-verdant-textPrimary leading-relaxed">
                {alert.recommendedVerification}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleExportGeoJSON}
              className="px-4 py-2 rounded-full border border-verdant-border text-xs font-mono text-verdant-textSecondary hover:text-verdant-textPrimary hover:bg-[#EBE7DD] transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Alert GeoJSON</span>
            </button>

            <Link
              to="/explore"
              className="text-xs uppercase tracking-wider font-mono text-verdant-textPrimary hover:underline flex items-center gap-1.5"
            >
              <span>View Landscape in Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};
