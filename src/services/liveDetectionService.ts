/**
 * Live detection client - talks to the FastAPI backend, which runs the real
 * Sentinel-2 analysis on Google Earth Engine (last N days vs same-season baseline).
 * No fake data is produced here: if the backend or Earth Engine is unavailable we say so.
 */
import { CandidateAlert, ForestRegion } from '../types/geospatial';

export const API_BASE: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type BackendState = 'checking' | 'offline' | 'no-ee' | 'live';

export interface WindowInfo {
  start: string;
  end: string;
  scenes: number;
  latest_scene?: string | null;
  mean_cloud_percent?: number | null;
  valid_pixel_percent?: number | null;
  tiles?: string[];
}

export interface LiveMeta {
  status: 'ok' | 'no_scenes' | 'no_baseline';
  message?: string;
  warning?: string;
  source: string;
  monitoring: WindowInfo;
  baseline_seasonal: WindowInfo;
  baseline_recent?: WindowInfo | null;
  requested_days?: number;
  window_days?: number;
  widened?: boolean;
  candidates_total?: number;
  total_loss_ha?: number;
  candidates_returned?: number;
  new_scene_since_last_scan?: boolean;
  computed_at: string;
}

export interface LiveScanResult {
  alerts: CandidateAlert[];
  meta: LiveMeta;
}

async function timedFetch(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function checkBackend(): Promise<{ state: BackendState; detail?: string }> {
  try {
    const res = await timedFetch(`${API_BASE}/health`);
    if (!res.ok) return { state: 'offline', detail: `HTTP ${res.status}` };
    const h = await res.json();
    return h.earth_engine
      ? { state: 'live' }
      : { state: 'no-ee', detail: h.earth_engine_error || 'Earth Engine not authenticated' };
  } catch {
    return { state: 'offline' };
  }
}

/** Scan box: the region bounds, capped to ~22 km around the centre so one scan stays fast. */
export function scanGeometry(region: ForestRegion, halfDeg = 0.1) {
  const [cx, cy] = region.center;
  const [[bMinX, bMinY], [bMaxX, bMaxY]] = region.bounds;
  const minX = Math.max(bMinX, cx - halfDeg);
  const maxX = Math.min(bMaxX, cx + halfDeg);
  const minY = Math.max(bMinY, cy - halfDeg);
  const maxY = Math.min(bMaxY, cy + halfDeg);
  const [x0, x1] = minX < maxX ? [minX, maxX] : [cx - halfDeg, cx + halfDeg];
  const [y0, y1] = minY < maxY ? [minY, maxY] : [cy - halfDeg, cy + halfDeg];
  return {
    type: 'Polygon',
    coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]
  };
}

function centroid(geometry: any): [number, number] {
  let ring: any = geometry.coordinates;
  while (Array.isArray(ring[0]) && Array.isArray(ring[0][0])) ring = ring[0];
  const n = ring.length || 1;
  return [
    ring.reduce((s: number, p: number[]) => s + p[0], 0) / n,
    ring.reduce((s: number, p: number[]) => s + p[1], 0) / n
  ];
}

export function featuresToAlerts(fc: any, meta: LiveMeta, region: ForestRegion): CandidateAlert[] {
  const laterDate = meta.monitoring.latest_scene || meta.monitoring.end;
  return (fc.features || []).map((f: any, i: number): CandidateAlert => {
    const p = f.properties;
    const b = p.breakdown;
    const bb = p.bands_before;
    const ba = p.bands_after;
    return {
      id: `LIVE-${region.id.slice(0, 12).toUpperCase()}-${laterDate}-${String(i + 1).padStart(2, '0')}`,
      regionId: region.id,
      regionName: region.name,
      country: region.country,
      coordinates: centroid(f.geometry),
      geometry: f.geometry,
      earlierDate: meta.baseline_seasonal.end,
      laterDate,
      affectedAreaHa: p.area_ha,
      ndviEarlier: p.ndvi_before,
      ndviLater: p.ndvi_after,
      ndviDelta: p.dndvi,
      nbrDelta: p.dnbr,
      validPixelPercentage: meta.monitoring.valid_pixel_percent ?? 0,
      cloudCoverPercent: meta.monitoring.mean_cloud_percent ?? 0,
      severity: p.severity,
      screeningScore: p.score,
      heuristicBreakdown: {
        ndviMagnitude: b.ndviMagnitude,
        temporalConsistency: b.temporalConsistency,
        patchContiguity: b.patchContiguity,
        spectralDistinctness: b.spectralDistinctness,
        cloudShadowRiskPenalty: b.cloudShadowRiskPenalty,
        finalScore: b.finalScore
      },
      status: 'Candidate — needs verification',
      driverHypothesis: 'Undetermined — needs field verification',
      alternativeExplanations: [
        'Harvest or fallow clearing on forest-edge farmland',
        'Seasonal leaf-fall not fully removed by the same-season baseline',
        'Residual cloud shadow, haze or river-channel change'
      ],
      recommendedVerification: 'Check against high-resolution imagery or a field visit before acting',
      sentinelTileId: meta.monitoring.tiles?.[0] || region.sentinelTileId,
      spectralBefore: { b02_blue: bb.b2, b03_green: bb.b3, b04_red: bb.b4, b08_nir: bb.b8, ndvi: p.ndvi_before },
      spectralAfter: { b02_blue: ba.b2, b03_green: ba.b3, b04_red: ba.b4, b08_nir: ba.b8, ndvi: p.ndvi_after }
    };
  });
}

export async function runRecentScan(
  region: ForestRegion,
  days: number,
  opts: { ndviThreshold?: number; minPatchHa?: number } = {}
): Promise<LiveScanResult> {
  let res: Response;
  try {
    res = await timedFetch(
      `${API_BASE}/detect/recent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_id: region.id,
          geometry: scanGeometry(region),
          days,
          ndvi_threshold: opts.ndviThreshold ?? -0.2,
          min_patch_ha: opts.minPatchHa ?? 0.3
        })
      },
      300000 // Earth Engine can take a minute on a cold start
    );
  } catch {
    throw new Error('Backend not reachable. Start it with: cd backend && uvicorn app:app --port 8000');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Backend error (HTTP ${res.status})`);
  }
  const fc = await res.json();
  const meta: LiveMeta = fc.meta;
  return { alerts: featuresToAlerts(fc, meta, region), meta };
}

export async function registerWatch(region: ForestRegion, days: number) {
  await timedFetch(`${API_BASE}/watch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region_id: region.id, geometry: scanGeometry(region), days })
  });
}

export async function removeWatch(regionId: string) {
  await timedFetch(`${API_BASE}/watch/${encodeURIComponent(regionId)}`, { method: 'DELETE' }).catch(() => undefined);
}

export interface StreamEvent {
  type: 'hello' | 'scan' | 'error';
  reason?: string;
  region_id?: string;
  feature_collection?: any;
  meta?: LiveMeta;
  message?: string;
}

/** Server-Sent Events subscription. Returns an unsubscribe function. */
export function subscribeStream(
  onEvent: (e: StreamEvent) => void,
  onConnection: (connected: boolean) => void
): () => void {
  const es = new EventSource(`${API_BASE}/alerts/stream`);
  es.onopen = () => onConnection(true);
  es.onerror = () => onConnection(false);
  es.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data));
    } catch {
      /* ignore malformed frames */
    }
  };
  return () => es.close();
}
