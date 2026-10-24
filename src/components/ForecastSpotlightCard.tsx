import React, { useState } from 'react';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, ShieldCheck, ChevronRight, Layers, Info } from 'lucide-react';
import { RegionPredictionSummary, ForecastHorizon, DeforestationPredictionPatch } from '../types/geospatial';

interface ForecastSpotlightCardProps {
  summary: RegionPredictionSummary;
  selectedHorizon: ForecastHorizon;
  onSelectHorizon: (hz: ForecastHorizon) => void;
  onSelectPatch?: (patch: DeforestationPredictionPatch) => void;
  className?: string;
}

export const ForecastSpotlightCard: React.FC<ForecastSpotlightCardProps> = ({
  summary,
  selectedHorizon,
  onSelectHorizon,
  onSelectPatch,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'factors'>('overview');

  const horizonLabels: Record<ForecastHorizon, string> = {
    '1year': '1-Year Outlook',
    '3year': '3-Year Frontier',
    '5year': '5-Year Trajectory'
  };

  return (
    <div className={`bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Top Banner / Flagship Spotlight Tag */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
            FLAGSHIP CAPABILITY • AI DEFORESTATION FORECAST
          </span>
        </div>
        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300 font-semibold">
          Scientific Spatial Autoregression
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Title & Horizon Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950">
              Future Loss Vulnerability Forecast
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Target Year: <strong className="text-slate-900">{summary.yearTarget}</strong> for {summary.regionName.split(' (')[0]}
            </p>
          </div>

          {/* Horizon Selection Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-mono text-xs">
            {(['1year', '3year', '5year'] as ForecastHorizon[]).map((hz) => (
              <button
                key={hz}
                onClick={() => onSelectHorizon(hz)}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                  selectedHorizon === hz
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hz === '1year' ? '1 Year' : hz === '3year' ? '3 Years' : '5 Years'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Main Forecast Callout Metric Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          {/* Metric 1 */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-amber-900/80 block">
              Expected Loss
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-amber-950 tracking-tight font-serif">
                {summary.totalProjectedLossHa}
              </span>
              <span className="text-xs font-bold text-amber-800">HA</span>
            </div>
            <span className="text-[10px] text-amber-700 block mt-1 font-sans font-medium">
              Across {summary.patches.length} frontier zones
            </span>
          </div>

          {/* Metric 2 */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Clearing Rate
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-serif">
                ~{summary.projectedAnnualRateHa}
              </span>
              <span className="text-xs font-bold text-slate-500">HA/YR</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-sans font-medium">
              Annual rate
            </span>
          </div>

          {/* Metric 3 */}
          <div className="bg-red-50/70 border border-red-200/80 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-red-900/80 block">
              Risk Level
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-red-950 tracking-tight font-serif">
                {summary.overallRiskScore}%
              </span>
              <span className="text-xs font-bold text-red-700 uppercase">
                {summary.overallRiskScore >= 80 ? 'Critical' : 'Elevated'}
              </span>
            </div>
            <span className="text-[10px] text-red-700 block mt-1 font-sans font-medium">
              High road correlation
            </span>
          </div>
        </div>

        {/* Key Model Factors */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Road Access</span>
              <span className="font-bold text-slate-900">{summary.patches[0]?.environmentalFactors.proximityToRoadKm || 0.4} km</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Terrain Slope</span>
              <span className="font-bold text-slate-900">{summary.patches[0]?.environmentalFactors.slopeDegrees || 4.2}°</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Canopy Baseline</span>
              <span className="font-bold text-slate-900">{summary.patches[0]?.environmentalFactors.canopyDensityPct || 82}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Key Vector</span>
              <span className="font-bold text-slate-900 truncate block">{summary.patches[0]?.primaryDriver.split(' & ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Interactive Patches Selector */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-800 uppercase text-[11px]">
              Predicted Expansion Patches on Map ({summary.patches.length})
            </span>
            <span className="text-slate-500 text-[11px]">Click a patch to focus map</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {summary.patches.slice(0, 3).map((patch, idx) => (
              <button
                key={patch.id}
                onClick={() => onSelectPatch && onSelectPatch(patch)}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all text-xs font-mono space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{patch.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    patch.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {patch.riskScore}%
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>{patch.projectedLossHa} ha</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
