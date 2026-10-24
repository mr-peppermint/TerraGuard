import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ForestRegion, CandidateAlert, DetectionSettings } from '../types/geospatial';
import { Sliders, Eye, Calendar, Sparkles, AlertTriangle, Layers, Info, CheckCircle2, Play } from 'lucide-react';

interface ComparisonViewerProps {
  region: ForestRegion;
  alerts: CandidateAlert[];
  settings: DetectionSettings;
  onUpdateSettings: (settings: Partial<DetectionSettings>) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export type SpectralViewMode = 'natural' | 'infrared' | 'loss-heatmap';

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  region,
  alerts,
  settings,
  onUpdateSettings,
  onRunAnalysis,
  isAnalyzing
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<SpectralViewMode>('loss-heatmap');
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const [probeData, setProbeData] = useState<{ ndviT1: number; ndviT2: number; delta: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasBeforeRef = useRef<HTMLCanvasElement>(null);
  const canvasAfterRef = useRef<HTMLCanvasElement>(null);

  // Compute representative before/after dates from settings
  const dateBefore = settings.earlierDate;
  const dateAfter = settings.laterDate;

  // Handle slider drag
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, handleMove]);

  // Render high-precision synthetic Sentinel-2 spectral composites for this region
  useEffect(() => {
    const canvasBefore = canvasBeforeRef.current;
    const canvasAfter = canvasAfterRef.current;
    if (!canvasBefore || !canvasAfter) return;

    const ctxBefore = canvasBefore.getContext('2d');
    const ctxAfter = canvasAfter.getContext('2d');
    if (!ctxBefore || !ctxAfter) return;

    const width = (canvasBefore.width = canvasAfter.width = 1000);
    const height = (canvasBefore.height = canvasAfter.height = 640);

    // Baseline Render (T1)
    renderScene(ctxBefore, width, height, 'before', viewMode, region, alerts);

    // Monitoring Render (T2)
    renderScene(ctxAfter, width, height, 'after', viewMode, region, alerts);
  }, [region, alerts, viewMode]);

  // Handle probe cursor
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorCoords({ x, y });

    // Approximate probe data based on distance to disturbance center
    const normX = x / rect.width;
    const normY = y / rect.height;

    // Check if within alert hotspot center (around 0.55, 0.45)
    const distToHotspot = Math.hypot(normX - 0.56, normY - 0.44);
    if (distToHotspot < 0.18) {
      const ndviT1 = 0.76 - distToHotspot * 0.1;
      const ndviT2 = 0.22 + distToHotspot * 0.3;
      setProbeData({
        ndviT1: Number(ndviT1.toFixed(2)),
        ndviT2: Number(ndviT2.toFixed(2)),
        delta: Number((ndviT2 - ndviT1).toFixed(2))
      });
    } else {
      setProbeData({
        ndviT1: 0.78,
        ndviT2: 0.75,
        delta: -0.03
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-verdant-panel p-4 lg:p-6 rounded-2xl border border-verdant-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-verdant-lime tracking-widest">
              CHANGE DETECTION LAB
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verdant-surface border border-verdant-border text-verdant-textMuted">
              10m Native Ground Resolution
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white mt-1">
            Bi-Temporal Sentinel-2 MSI Canopy Differential
          </h2>
          <p className="text-xs text-verdant-textMuted mt-0.5">
            Compare baseline pre-clearing composite with current observation window to isolate rapid canopy loss.
          </p>
        </div>

        {/* Spectral View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-verdant-surface p-1 rounded-full border border-verdant-border">
          <button
            onClick={() => setViewMode('natural')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'natural'
                ? 'bg-verdant-panel text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            True Color (RGB)
          </button>
          <button
            onClick={() => setViewMode('infrared')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'infrared'
                ? 'bg-verdant-panel text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            Infrared (B08-B04)
          </button>
          <button
            onClick={() => setViewMode('loss-heatmap')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'loss-heatmap'
                ? 'bg-verdant-lime text-black font-semibold shadow-glow-lime'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            dNDVI Loss Heatmap
          </button>
        </div>
      </div>

      {/* Date Selectors & Radiometric Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Baseline Date Selector */}
        <div className="bg-verdant-panel p-3.5 rounded-xl border border-verdant-border">
          <label className="text-[10px] font-mono uppercase text-verdant-textDim block mb-1">
            T1 Baseline Observation
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-verdant-lime" />
            <input
              type="date"
              value={dateBefore}
              onChange={(e) => onUpdateSettings({ earlierDate: e.target.value })}
              className="bg-transparent text-white font-mono text-xs outline-none border-b border-verdant-border focus:border-verdant-lime"
            />
          </div>
          <span className="text-[10px] font-mono text-verdant-textDim mt-1 block">
            Median composite (3 clear passes)
          </span>
        </div>

        {/* Monitoring Date Selector */}
        <div className="bg-verdant-panel p-3.5 rounded-xl border border-verdant-border">
          <label className="text-[10px] font-mono uppercase text-verdant-textDim block mb-1">
            T2 Monitoring Window
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-verdant-amber" />
            <input
              type="date"
              value={dateAfter}
              onChange={(e) => onUpdateSettings({ laterDate: e.target.value })}
              className="bg-transparent text-white font-mono text-xs outline-none border-b border-verdant-border focus:border-verdant-amber"
            />
          </div>
          <span className="text-[10px] font-mono text-verdant-textDim mt-1 block">
            Most recent cloud-free acquisition
          </span>
        </div>

        {/* dNDVI Sensitivity Slider */}
        <div className="bg-verdant-panel p-3.5 rounded-xl border border-verdant-border">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase text-verdant-textDim">
              dNDVI Threshold
            </label>
            <span className="text-xs font-mono text-verdant-lime font-bold">
              {settings.ndviThreshold}
            </span>
          </div>
          <input
            type="range"
            min="-0.40"
            max="-0.10"
            step="0.02"
            value={settings.ndviThreshold}
            onChange={(e) => onUpdateSettings({ ndviThreshold: parseFloat(e.target.value) })}
            className="w-full accent-verdant-lime cursor-pointer h-1 bg-verdant-surface rounded"
          />
          <span className="text-[10px] font-mono text-verdant-textDim block mt-1">
            More negative = stricter filtering
          </span>
        </div>

        {/* Cloud Mask Toggle & Re-run */}
        <div className="bg-verdant-panel p-3.5 rounded-xl border border-verdant-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-verdant-textDim block">
              SCL Cloud Masking
            </span>
            <span className="text-xs font-mono text-verdant-emerald flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active (20m Mask)
            </span>
          </div>

          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold text-xs tracking-wide shadow-glow-lime transition-all disabled:opacity-50"
          >
            {isAnalyzing ? 'Processing...' : 'Run Pipeline'}
          </button>
        </div>
      </div>

      {/* Main Interactive Comparison Split Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={() => setCursorCoords(null)}
        className="relative w-full h-[480px] lg:h-[560px] rounded-2xl overflow-hidden border border-verdant-border bg-black select-none cursor-crosshair group shadow-2xl"
      >
        {/* Layer 1: "After" (Monitoring) Image Canvas - Full Width */}
        <canvas
          ref={canvasAfterRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Layer 2: "Before" (Baseline) Image Canvas - Clipped by Slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <canvas
            ref={canvasBeforeRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Split Divider Bar */}
        <div
          className="absolute top-0 bottom-0 z-20 w-[2px] bg-white cursor-ew-resize shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        >
          {/* Draggable Circular Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-verdant-panel border-2 border-white flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform">
            <Sliders className="w-4 h-4 text-verdant-lime rotate-90" />
          </div>
        </div>

        {/* Before Label (Top Left) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-verdant-panel/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-verdant-border text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-verdant-emerald" />
          <span className="text-white font-medium">BASELINE: {dateBefore}</span>
          <span className="text-verdant-textDim">| Intact Canopy</span>
        </div>

        {/* After Label (Top Right) */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-2 bg-verdant-panel/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-verdant-border text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-verdant-red animate-pulse" />
          <span className="text-white font-medium">MONITORING: {dateAfter}</span>
          <span className="text-verdant-textDim">| Detected Disturbance</span>
        </div>

        {/* Live Cursor NDVI Probe Box */}
        {cursorCoords && probeData && (
          <div
            className="absolute z-30 pointer-events-none bg-verdant-panel/95 backdrop-blur-md p-2.5 rounded-xl border border-verdant-borderLight shadow-2xl text-[11px] font-mono"
            style={{
              left: `${Math.min(cursorCoords.x + 16, (containerRef.current?.clientWidth || 800) - 180)}px`,
              top: `${Math.min(cursorCoords.y + 16, (containerRef.current?.clientHeight || 500) - 120)}px`
            }}
          >
            <div className="text-verdant-textDim uppercase tracking-wider text-[9px] mb-1">
              Sentinel-2 Pixel Probe (10m)
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-verdant-textMuted">T1 Baseline:</span>
              <span className="text-verdant-emerald font-bold">{probeData.ndviT1}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-verdant-textMuted">T2 Current:</span>
              <span className="text-white font-bold">{probeData.ndviT2}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-verdant-border pt-1 mt-1">
              <span className="text-verdant-textDim">dNDVI:</span>
              <span
                className={`font-bold ${
                  probeData.delta <= settings.ndviThreshold ? 'text-verdant-red' : 'text-verdant-lime'
                }`}
              >
                {probeData.delta > 0 ? `+${probeData.delta}` : probeData.delta}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-verdant-panel/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-verdant-border text-[11px] font-mono text-verdant-textMuted">
          <span>Drag slider horizontally to inspect canopy differential</span>
          <span>•</span>
          <span className="text-verdant-lime">Tile {region.sentinelTileId}</span>
        </div>
      </div>
    </div>
  );
};

// Canvas rendering helper for realistic Sentinel-2 spectral imagery
function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeframe: 'before' | 'after',
  mode: SpectralViewMode,
  region: ForestRegion,
  alerts: CandidateAlert[]
) {
  // Clear
  ctx.fillStyle = '#0a0d0b';
  ctx.fillRect(0, 0, w, h);

  // Background Forest Canopy Texture
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w / 1.4);

  if (mode === 'natural') {
    // Natural Color: deep olive-green canopy with slight topographic texture
    gradient.addColorStop(0, '#1c2e1f');
    gradient.addColorStop(0.5, '#16281a');
    gradient.addColorStop(1, '#0f1c12');
  } else if (mode === 'infrared') {
    // False Color Infrared (CIR): High NIR reflectance renders photosynthesizing canopy as deep crimson/red
    gradient.addColorStop(0, '#66141c');
    gradient.addColorStop(0.5, '#4f0f15');
    gradient.addColorStop(1, '#33080c');
  } else {
    // dNDVI Heatmap: Baseline canopy intact is deep dark green
    gradient.addColorStop(0, '#0c2214');
    gradient.addColorStop(0.5, '#091c10');
    gradient.addColorStop(1, '#05120a');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Add terrain ridges / topographic elevation contours
  ctx.strokeStyle = mode === 'infrared' ? 'rgba(255, 100, 100, 0.08)' : 'rgba(213, 255, 79, 0.06)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 100 + i * 80);
    ctx.bezierCurveTo(
      w * 0.25, 60 + i * 80 + Math.sin(i) * 30,
      w * 0.75, 140 + i * 80 - Math.cos(i) * 30,
      w, 90 + i * 80
    );
    ctx.stroke();
  }

  // If "Before", forest is continuous and intact, maybe a few historic narrow tracks
  if (timeframe === 'before') {
    // Intact primary canopy with subtle natural river corridor
    ctx.strokeStyle = mode === 'infrared' ? '#081820' : '#142b33';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, 0);
    ctx.bezierCurveTo(w * 0.2, h * 0.4, w * 0.35, h * 0.6, w * 0.45, h);
    ctx.stroke();
    return;
  }

  // If "After", render candidate clearings, mining pits, or access tracks
  const clearingCenters = [
    { x: w * 0.56, y: h * 0.44, rx: 110, ry: 75, angle: 0.3 },
    { x: w * 0.38, y: h * 0.62, rx: 65, ry: 45, angle: -0.2 },
    { x: w * 0.72, y: h * 0.32, rx: 50, ry: 35, angle: 0.6 }
  ];

  clearingCenters.forEach(({ x, y, rx, ry, angle }, idx) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (mode === 'natural') {
      // Natural bare soil / open overburden / clay yellow-brown
      const pitGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
      pitGrad.addColorStop(0, '#8c6b45');
      pitGrad.addColorStop(0.7, '#634b30');
      pitGrad.addColorStop(1, '#3b2f21');
      ctx.fillStyle = pitGrad;
    } else if (mode === 'infrared') {
      // CIR: Bare soil appears light cyan / grey-blue due to low NIR and high SWIR/Red
      const pitGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
      pitGrad.addColorStop(0, '#8ec5d6');
      pitGrad.addColorStop(0.7, '#598594');
      pitGrad.addColorStop(1, '#2c4550');
      ctx.fillStyle = pitGrad;
    } else {
      // dNDVI Heatmap: Collapse of canopy glows intense red / orange loss heatmap
      const heatGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, rx);
      heatGrad.addColorStop(0, '#ef4444');
      heatGrad.addColorStop(0.5, '#f59e0b');
      heatGrad.addColorStop(0.85, 'rgba(234, 179, 8, 0.4)');
      heatGrad.addColorStop(1, 'rgba(234, 179, 8, 0.0)');
      ctx.fillStyle = heatGrad;
    }

    // Irregular jagged perimeter
    ctx.beginPath();
    const steps = 16;
    for (let s = 0; s <= steps; s++) {
      const theta = (s / steps) * Math.PI * 2;
      const noise = 1 + Math.sin(theta * 4 + idx) * 0.15;
      const px = Math.cos(theta) * rx * noise;
      const py = Math.sin(theta) * ry * noise;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Delineation contour outline
    if (mode === 'loss-heatmap') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Render linear haulage / access logging road cleaving through
  ctx.save();
  ctx.strokeStyle = mode === 'loss-heatmap' ? '#ef4444' : mode === 'infrared' ? '#8ec5d6' : '#634b30';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.85);
  ctx.lineTo(w * 0.38, h * 0.62);
  ctx.lineTo(w * 0.56, h * 0.44);
  ctx.lineTo(w * 0.72, h * 0.32);
  ctx.stroke();
  ctx.restore();
}
