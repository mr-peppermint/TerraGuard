import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { GeospatialLossLedger } from '../components/GeospatialLossLedger';
import { DEMO_REGIONS } from '../data/demoRegions';
import { DEMO_ALERTS } from '../data/demoAlerts';
import { 
  ForestRegion, 
  CandidateAlert,
  ForecastHorizon,
  RegionPredictionSummary
} from '../types/geospatial';
import { generateDeforestationPredictions } from '../services/predictionService';
import { 
  Sliders, 
  Calendar, 
  ArrowRight, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  Download,
  Activity,
  Maximize2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const ChangeDetectionPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<ForestRegion>(DEMO_REGIONS[0]);
  const [dateEarlier, setDateEarlier] = useState('2024-01-14');
  const [dateLater, setDateLater] = useState('2024-11-20');
  const [layerMode, setLayerMode] = useState<'natural' | 'ndvi'>('ndvi');
  const [sliderPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>('3year');

  const predictionSummary = useMemo<RegionPredictionSummary>(() => {
    return generateDeforestationPredictions(selectedRegion, forecastHorizon);
  }, [selectedRegion, forecastHorizon]);


  const containerRef = useRef<HTMLDivElement>(null);
  const canvasBeforeRef = useRef<HTMLCanvasElement>(null);
  const canvasAfterRef = useRef<HTMLCanvasElement>(null);

  const regionAlerts = DEMO_ALERTS.filter((a) => a.regionId === selectedRegion.id);
  const totalAreaHa = regionAlerts.reduce((sum, a) => sum + a.affectedAreaHa, 0).toFixed(1);


  // Slider drag handler
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
    setSplitPosition(percentage);
  }, []);

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

  // Render high-precision Sentinel-2 simulation on Canvas
  useEffect(() => {
    const before = canvasBeforeRef.current;
    const after = canvasAfterRef.current;
    if (!before || !after) return;

    const ctxBefore = before.getContext('2d');
    const ctxAfter = after.getContext('2d');
    if (!ctxBefore || !ctxAfter) return;

    const w = (before.width = after.width = 1200);
    const h = (before.height = after.height = 700);

    drawScene(ctxBefore, w, h, 'before', layerMode);
    drawScene(ctxAfter, w, h, 'after', layerMode);
  }, [selectedRegion, layerMode]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
    }, 750);
  };

  // NDVI Distribution Spectrum simulation data
  const ndviHistogramData = [
    { bin: '0.0 - 0.2 (Bare/Loss)', baseline: 4, monitoring: 38 },
    { bin: '0.2 - 0.4 (Sparse)', baseline: 11, monitoring: 26 },
    { bin: '0.4 - 0.6 (Moderate)', baseline: 28, monitoring: 19 },
    { bin: '0.6 - 0.8 (Dense Canopy)', baseline: 46, monitoring: 14 },
    { bin: '0.8 - 1.0 (Intact Prime)', baseline: 11, monitoring: 3 },
  ];

  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col text-verdant-textPrimary">
      <SiteHeader theme="light" />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10 flex-1 w-full">
        {/* Workspace Title & Context */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-verdant-border pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
                Change Lab & Bi-Temporal Diagnostics
              </span>
              <span className="text-[10px] font-mono bg-verdant-cardBg px-2 py-0.5 rounded border border-verdant-border text-verdant-sand font-bold">
                Sentinel-2 L2A BOA
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-verdant-textPrimary">
              Spectral change detection & predictive analytics.
            </h1>
            <p className="text-sm sm:text-base text-verdant-textSecondary font-medium max-w-2xl leading-relaxed">
              Interactively split-compare dual Sentinel-2 observation windows, measure physical vegetative canopy degradation (dNDVI), and model future deforestation risk vectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-verdant-textSecondary">
              Forecast Horizon:
            </span>
            <div className="flex items-center gap-1 bg-[#EBE7DD] p-1 rounded-full border border-verdant-border font-mono text-xs">
              {(['1year', '3year', '5year'] as ForecastHorizon[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setForecastHorizon(hz)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    forecastHorizon === hz
                      ? 'bg-verdant-dark text-verdant-bg font-bold'
                      : 'text-verdant-textSecondary hover:text-verdant-textPrimary'
                  }`}
                >
                  {hz === '1year' ? '1 Year' : hz === '3year' ? '3 Years' : '5 Years'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Control Bar */}
        <div className="border border-verdant-border bg-verdant-cardBg/60 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-sm">
          {/* Region Selector */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-mono tracking-widest uppercase text-verdant-textSecondary block font-bold">
              Monitoring Region
            </label>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const reg = DEMO_REGIONS.find((r) => r.id === e.target.value);
                if (reg) setSelectedRegion(reg);
              }}
              className="w-full bg-transparent border-b border-verdant-border py-1 text-sm font-serif font-bold outline-none cursor-pointer focus:border-verdant-textPrimary"
            >
              {DEMO_REGIONS.map((r) => (
                <option key={r.id} value={r.id} className="font-sans font-medium">
                  {r.name} ({r.country})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selectors */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-mono tracking-widest uppercase text-verdant-textSecondary block font-bold">
                Baseline (T1)
              </label>
              <div className="flex items-center gap-2 border-b border-verdant-border py-1">
                <Calendar className="w-3.5 h-3.5 text-verdant-textSecondary" />
                <input
                  type="date"
                  value={dateEarlier}
                  onChange={(e) => setDateEarlier(e.target.value)}
                  className="bg-transparent font-mono text-xs outline-none w-full font-bold"
                />
              </div>
            </div>

            <div className="text-verdant-textSecondary font-serif pt-4 font-bold">→</div>

            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-mono tracking-widest uppercase text-verdant-textSecondary block font-bold">
                Monitoring (T2)
              </label>
              <div className="flex items-center gap-2 border-b border-verdant-border py-1">
                <Calendar className="w-3.5 h-3.5 text-verdant-textSecondary" />
                <input
                  type="date"
                  value={dateLater}
                  onChange={(e) => setDateLater(e.target.value)}
                  className="bg-transparent font-mono text-xs outline-none w-full font-bold"
                />
              </div>
            </div>
          </div>

          {/* Layer Mode & Analyze CTA */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3">
            {/* Layer selector */}
            <div className="flex items-center gap-1 border border-verdant-border rounded-full p-1 bg-verdant-bg text-xs">
              <button
                onClick={() => setLayerMode('natural')}
                className={`px-3 py-1 rounded-full transition-colors font-bold ${
                  layerMode === 'natural' ? 'bg-verdant-dark text-verdant-bg' : 'text-verdant-textSecondary hover:text-verdant-textPrimary'
                }`}
              >
                True Color
              </button>
              <button
                onClick={() => setLayerMode('ndvi')}
                className={`px-3 py-1 rounded-full transition-colors font-bold ${
                  layerMode === 'ndvi' ? 'bg-verdant-dark text-verdant-bg' : 'text-verdant-textSecondary hover:text-verdant-textPrimary'
                }`}
              >
                NDVI Loss
              </button>
            </div>

            {/* Run button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-5 py-2 rounded-full bg-verdant-dark text-verdant-bg text-xs font-bold uppercase tracking-wider hover:bg-verdant-darkSecondary transition-colors disabled:opacity-50 shadow-md"
            >
              {isAnalyzing ? 'Processing...' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        {/* Large Before-and-After Satellite Split-Screen Viewer */}
        <div className="space-y-3">
          <div
            ref={containerRef}
            className="relative w-full h-[480px] lg:h-[580px] bg-verdant-dark overflow-hidden border border-verdant-border select-none cursor-ew-resize rounded-2xl shadow-xl"
          >
            {/* Monitoring Image (Full Width Behind) */}
            <canvas
              ref={canvasAfterRef}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Baseline Image (Clipped) */}
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

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-[0_0_12px_rgba(0,0,0,0.8)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-verdant-bg border-2 border-verdant-border shadow-2xl flex items-center justify-center text-verdant-dark pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
                onMouseDown={() => setIsDragging(true)}
              >
                <Sliders className="w-4 h-4 rotate-90 stroke-[2.5]" />
              </div>
            </div>

            {/* Earlier Badge (Top Left) */}
            <div className="absolute top-4 left-4 pointer-events-none bg-verdant-dark/90 backdrop-blur-md px-3.5 py-1.5 border border-verdant-borderDark text-[11px] font-mono text-verdant-darkText rounded-md shadow-lg">
              <span>Baseline: {dateEarlier}</span>
              <span className="text-verdant-textSecondary ml-2">| Intact canopy</span>
            </div>

            {/* Later Badge (Top Right) */}
            <div className="absolute top-4 right-4 pointer-events-none bg-verdant-dark/90 backdrop-blur-md px-3.5 py-1.5 border border-verdant-borderDark text-[11px] font-mono text-verdant-darkText rounded-md shadow-lg">
              <span>Monitoring: {dateLater}</span>
              <span className="text-verdant-alertHigh ml-2 font-bold">| Disturbance detected</span>
            </div>
          </div>

          {/* Sub-viewer Caption & Quality Metrics */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-verdant-textSecondary pt-1">
            <span>Sentinel-2 MSI Level-2A BOA Reflectance • Tile {selectedRegion.sentinelTileId}</span>
            <div className="flex items-center gap-4">
              <span>Cloud Quality: 2.1% (SCL Masked)</span>
              <span>•</span>
              <span>Valid Pixels: 97.4%</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Highly Defined Analytics & Spectral Histograms */}
        <div className="space-y-6 pt-6 border-t border-verdant-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary block">
                Spectral Differential Analytics
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-verdant-textPrimary">
                Canopy Radiometry & Multi-Year Projection
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-verdant-cardBg border border-verdant-border font-bold">
                {selectedRegion.name.split(' (')[0]}
              </span>
            </div>
          </div>

          {/* Spectral Frequency Histogram + Prediction Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Histogram: NDVI Spectrum Shift */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Canopy Density Shift
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribution of vegetation before vs after clearing
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ndviHistogramData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="bin" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="baseline" fill="#0D9488" radius={[4, 4, 0, 0]} name="Baseline (%)" />
                    <Bar dataKey="monitoring" fill="#EA580C" radius={[4, 4, 0, 0]} name="Monitoring (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#0D9488]" />
                    <span>Before (Intact)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#EA580C]" />
                    <span>After (Cleared)</span>
                  </div>
                </div>
                <span className="font-bold text-red-600">-44% Canopy Drop</span>
              </div>
            </div>

            {/* AI Multi-Year Deforestation Projection Graph */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{forecastHorizon === '1year' ? '1-Yr' : forecastHorizon === '3year' ? '3-Yr' : '5-Yr'} Forecast</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Target: {predictionSummary?.yearTarget}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Predicted Forest Loss Trend
                </h3>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictionSummary?.yearlyProgression || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clPredWhiteGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="ha" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeLossHa"
                      stroke="#EA580C"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#clPredWhiteGrad)"
                      name="Loss (ha)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Annual Rate</span>
                  <span className="text-sm font-bold text-slate-900 font-sans">
                    ~{predictionSummary?.projectedAnnualRateHa} ha/yr
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Expected Risk</span>
                  <span className="text-sm font-bold text-red-600 font-sans">
                    {predictionSummary?.totalProjectedLossHa} ha
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Full Screen Geospatial Loss Analytics & Evidence Ledger (The screenshot reference) */}
        <div className="space-y-4 pt-6 border-t border-verdant-border">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary block">
              Auditable Evidence Matrix
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary">
              Portfolio Disturbance Ledger
            </h2>
          </div>

          <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-sm">
            <GeospatialLossLedger
              alerts={DEMO_ALERTS}
              regions={DEMO_REGIONS}
              currentRegionName={selectedRegion.name}
              prediction={predictionSummary}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

// Canvas drawing helper for synthetic multi-spectral comparison
function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeframe: 'before' | 'after',
  mode: 'natural' | 'ndvi'
) {
  ctx.fillStyle = '#171815';
  ctx.fillRect(0, 0, w, h);

  // Background Forest Canopy
  const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w / 1.3);
  if (mode === 'natural') {
    grad.addColorStop(0, '#2d3b2e');
    grad.addColorStop(0.6, '#232f24');
    grad.addColorStop(1, '#19221a');
  } else {
    grad.addColorStop(0, '#3e4a36');
    grad.addColorStop(0.6, '#2e3828');
    grad.addColorStop(1, '#1e261a');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Gentle topographic contour lines
  ctx.strokeStyle = 'rgba(216, 206, 187, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 120 + i * 90);
    ctx.bezierCurveTo(w * 0.3, 80 + i * 90, w * 0.7, 160 + i * 90, w, 110 + i * 90);
    ctx.stroke();
  }

  if (timeframe === 'before') {
    ctx.strokeStyle = '#1a2928';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 0);
    ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.35, h * 0.6, w * 0.45, h);
    ctx.stroke();
    return;
  }

  // If "after", draw disturbance patches
  const clearings = [
    { x: w * 0.58, y: h * 0.46, rx: 110, ry: 75 },
    { x: w * 0.42, y: h * 0.64, rx: 70, ry: 45 }
  ];

  clearings.forEach(({ x, y, rx, ry }) => {
    ctx.save();
    ctx.translate(x, y);

    if (mode === 'natural') {
      ctx.fillStyle = '#6e5842'; // bare soil clay
    } else {
      ctx.fillStyle = '#9E5840'; // terracotta / warm rust
    }

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (mode === 'ndvi') {
      ctx.strokeStyle = '#D5CBB8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    }
    ctx.restore();
  });
}
