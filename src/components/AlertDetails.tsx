import React, { useState } from 'react';
import { CandidateAlert } from '../types/geospatial';
import { explanationService, AlertExplanation } from '../services/explanationService';
import { 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Layers, 
  ExternalLink, 
  Download, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  Compass,
  Satellite
} from 'lucide-react';

interface AlertDetailsProps {
  alert: CandidateAlert;
  onClose: () => void;
  onUpdateStatus?: (alertId: string, newStatus: any) => void;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onClose,
  onUpdateStatus
}) => {
  const [explanation, setExplanation] = useState<AlertExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'breakdown' | 'alternatives'>('evidence');

  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      const res = await explanationService.explainAlert(alert);
      setExplanation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-verdant-red/20 text-verdant-red border-verdant-red/40';
      case 'high':
        return 'bg-verdant-amber/20 text-verdant-amber border-verdant-amber/40';
      case 'moderate':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40';
      default:
        return 'bg-sky-400/20 text-sky-400 border-sky-400/40';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-verdant-panel/95 backdrop-blur-xl border-l border-verdant-border shadow-2xl flex flex-col overflow-hidden animate-slide-left">
      {/* Header Bar */}
      <div className="p-6 border-b border-verdant-border flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-white">{alert.id}</span>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}>
              {alert.severity}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verdant-surface text-verdant-textMuted border border-verdant-border">
              {alert.status}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mt-1">
            {alert.driverHypothesis}
          </h3>
          <p className="text-xs text-verdant-textMuted flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-verdant-lime" />
            {alert.regionName}, {alert.country} ({alert.coordinates[1].toFixed(4)}°N, {alert.coordinates[0].toFixed(4)}°E)
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-textMuted hover:text-white hover:bg-verdant-card transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-6 border-b border-verdant-border bg-verdant-surface/40 text-xs font-mono">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'evidence'
              ? 'border-verdant-lime text-verdant-lime'
              : 'border-transparent text-verdant-textDim hover:text-white'
          }`}
        >
          Spectral Evidence
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'breakdown'
              ? 'border-verdant-lime text-verdant-lime'
              : 'border-transparent text-verdant-textDim hover:text-white'
          }`}
        >
          Screening Score ({alert.screeningScore}/100)
        </button>
        <button
          onClick={() => setActiveTab('alternatives')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'alternatives'
              ? 'border-verdant-lime text-verdant-lime'
              : 'border-transparent text-verdant-textDim hover:text-white'
          }`}
        >
          False Positive Check
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-verdant-surface p-3 rounded-xl border border-verdant-border">
                <span className="text-[10px] font-mono uppercase text-verdant-textDim block">Affected Area</span>
                <span className="text-xl font-extrabold text-verdant-lime font-sans mt-0.5 block">
                  {alert.affectedAreaHa} <span className="text-xs font-mono text-white/70">ha</span>
                </span>
                <span className="text-[9px] font-mono text-verdant-textDim">WGS84 Geodesic</span>
              </div>

              <div className="bg-verdant-surface p-3 rounded-xl border border-verdant-border">
                <span className="text-[10px] font-mono uppercase text-verdant-textDim block">dNDVI Delta</span>
                <span className="text-xl font-extrabold text-verdant-red font-sans mt-0.5 block">
                  {alert.ndviDelta.toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-verdant-textDim">
                  {alert.ndviEarlier} → {alert.ndviLater}
                </span>
              </div>

              <div className="bg-verdant-surface p-3 rounded-xl border border-verdant-border">
                <span className="text-[10px] font-mono uppercase text-verdant-textDim block">Valid Pixels</span>
                <span className="text-xl font-extrabold text-white font-sans mt-0.5 block">
                  {alert.validPixelPercentage}%
                </span>
                <span className="text-[9px] font-mono text-verdant-emerald">SCL Mask Cleared</span>
              </div>

              <div className="bg-verdant-surface p-3 rounded-xl border border-verdant-border">
                <span className="text-[10px] font-mono uppercase text-verdant-textDim block">Scene Cloud</span>
                <span className="text-xl font-extrabold text-white font-sans mt-0.5 block">
                  {alert.cloudCoverPercent}%
                </span>
                <span className="text-[9px] font-mono text-verdant-textDim">Sentinel-2 Tile</span>
              </div>
            </div>

            {/* Observation Dates */}
            <div className="bg-verdant-surface p-4 rounded-xl border border-verdant-border flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-verdant-textDim uppercase text-[10px] block">Baseline Acquisition (T1)</span>
                <span className="text-white font-medium flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-verdant-lime" />
                  {alert.earlierDate}
                </span>
              </div>
              <div className="text-center text-verdant-textDim font-sans">→</div>
              <div>
                <span className="text-verdant-textDim uppercase text-[10px] block">Monitoring Acquisition (T2)</span>
                <span className="text-white font-medium flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-verdant-amber" />
                  {alert.laterDate}
                </span>
              </div>
            </div>

            {/* Spectral Band Reflectance Profile Comparison */}
            <div className="bg-verdant-surface p-4 rounded-xl border border-verdant-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Surface Reflectance Profile (BOA L2A)
                </span>
                <span className="text-[10px] font-mono text-verdant-textDim">Values: 0.00 – 1.00</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {/* Band 4 Red */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-verdant-textMuted">Band 4 (Red 665nm — Chlorophyll Absorption)</span>
                    <span className="text-white">
                      {alert.spectralBefore.b04_red} → <span className="text-verdant-red font-bold">{alert.spectralAfter.b04_red}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden flex">
                    <div
                      className="bg-verdant-emerald h-full transition-all"
                      style={{ width: `${alert.spectralBefore.b04_red * 200}%` }}
                    />
                    <div
                      className="bg-verdant-red h-full transition-all"
                      style={{ width: `${(alert.spectralAfter.b04_red - alert.spectralBefore.b04_red) * 200}%` }}
                    />
                  </div>
                </div>

                {/* Band 8 NIR */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-verdant-textMuted">Band 8 (NIR 842nm — Mesophyll Canopy Scattering)</span>
                    <span className="text-white">
                      {alert.spectralBefore.b08_nir} → <span className="text-verdant-amber font-bold">{alert.spectralAfter.b08_nir}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                    <div
                      className="bg-verdant-lime h-full transition-all"
                      style={{ width: `${alert.spectralAfter.b08_nir * 150}%` }}
                    />
                  </div>
                </div>

                {/* Band 11 SWIR */}
                {alert.spectralBefore.b11_swir1 && alert.spectralAfter.b11_swir1 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-verdant-textMuted">Band 11 (SWIR 1610nm — Soil Moisture & Bare Ground)</span>
                      <span className="text-white">
                        {alert.spectralBefore.b11_swir1} → <span className="text-sky-400 font-bold">{alert.spectralAfter.b11_swir1}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full transition-all"
                        style={{ width: `${alert.spectralAfter.b11_swir1 * 180}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI / Scientific Explanation Box */}
            <div className="bg-verdant-panel p-5 rounded-2xl border border-verdant-lime/30 shadow-glow-lime/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-verdant-lime" />
                  <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    Scientific Interpretation
                  </span>
                </div>

                <button
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="px-3 py-1 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {isExplaining ? 'Interpreting...' : explanation ? 'Regenerate' : 'Explain this alert'}
                </button>
              </div>

              {explanation ? (
                <div className="mt-4 space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-verdant-textDim font-mono uppercase text-[10px] block">
                      Spectral Diagnosis ({explanation.generatedBy}):
                    </span>
                    <p className="text-white mt-1">{explanation.spectralEvidence}</p>
                  </div>

                  <div className="pt-2 border-t border-verdant-border">
                    <span className="text-verdant-textDim font-mono uppercase text-[10px] block">
                      Uncertainty & Screening Context:
                    </span>
                    <p className="text-verdant-textMuted mt-1">{explanation.uncertaintyAnalysis}</p>
                  </div>

                  <div className="pt-2 border-t border-verdant-border">
                    <span className="text-verdant-textDim font-mono uppercase text-[10px] block">
                      Recommended Verification:
                    </span>
                    <p className="text-verdant-lime mt-1 font-mono text-[11px]">{explanation.recommendedAction}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-verdant-textMuted">
                  Click <strong className="text-white font-medium">Explain this alert</strong> to generate a deterministic remote-sensing diagnosis or optional Gemini interpretation using multi-spectral reflectance physics.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            <div className="bg-verdant-surface p-4 rounded-xl border border-verdant-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-verdant-textDim">
                  Explainable Screening Score
                </span>
                <span className="text-2xl font-extrabold text-verdant-lime font-mono">
                  {alert.screeningScore}/100
                </span>
              </div>
              <p className="text-[11px] text-verdant-textMuted mt-1.5">
                <strong>Important Notice:</strong> This score is a heuristic screening priority index based on 5 remote-sensing factors. It is <em>not</em> a calibrated probability of deforestation.
              </p>
            </div>

            {/* Heuristic Breakdown Bars */}
            <div className="space-y-3 bg-verdant-surface p-4 rounded-xl border border-verdant-border text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-verdant-textMuted">NDVI Drop Magnitude:</span>
                  <span className="text-white font-bold">{alert.heuristicBreakdown.ndviMagnitude} / 30 pts</span>
                </div>
                <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                  <div
                    className="bg-verdant-lime h-full"
                    style={{ width: `${(alert.heuristicBreakdown.ndviMagnitude / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-verdant-textMuted">Temporal Consistency (Multi-Pass):</span>
                  <span className="text-white font-bold">{alert.heuristicBreakdown.temporalConsistency} / 25 pts</span>
                </div>
                <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                  <div
                    className="bg-verdant-lime h-full"
                    style={{ width: `${(alert.heuristicBreakdown.temporalConsistency / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-verdant-textMuted">Spatial Patch Contiguity:</span>
                  <span className="text-white font-bold">{alert.heuristicBreakdown.patchContiguity} / 20 pts</span>
                </div>
                <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                  <div
                    className="bg-verdant-lime h-full"
                    style={{ width: `${(alert.heuristicBreakdown.patchContiguity / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-verdant-textMuted">Spectral Distinctness (SWIR rise):</span>
                  <span className="text-white font-bold">{alert.heuristicBreakdown.spectralDistinctness} / 15 pts</span>
                </div>
                <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                  <div
                    className="bg-verdant-lime h-full"
                    style={{ width: `${(alert.heuristicBreakdown.spectralDistinctness / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-verdant-textMuted">Cloud Shadow Risk Penalty:</span>
                  <span className="text-verdant-red font-bold">{alert.heuristicBreakdown.cloudShadowRiskPenalty} pts</span>
                </div>
                <div className="w-full h-1.5 bg-verdant-panel rounded-full overflow-hidden">
                  <div
                    className="bg-verdant-red h-full"
                    style={{ width: `${Math.abs(alert.heuristicBreakdown.cloudShadowRiskPenalty) * 5}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-4">
            <div className="bg-verdant-surface p-4 rounded-xl border border-verdant-border">
              <div className="flex items-center gap-2 text-verdant-amber mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-mono uppercase font-bold">
                  Potential False Positive Checklist
                </span>
              </div>
              <p className="text-xs text-verdant-textMuted">
                Never classify every negative NDVI delta as permanent deforestation. Consider these alternative hypotheses before field deployment:
              </p>

              <ul className="mt-3 space-y-2">
                {alert.alternativeExplanations.map((alt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-verdant-text">
                    <span className="text-verdant-amber font-mono font-bold">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-verdant-panel p-4 rounded-xl border border-verdant-border">
              <span className="text-[10px] font-mono uppercase text-verdant-textDim block">
                Recommended Next Verification Step:
              </span>
              <p className="text-xs text-verdant-lime font-mono mt-1 leading-relaxed">
                {alert.recommendedVerification}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-verdant-border bg-verdant-surface/80 flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-verdant-textDim">
          Status: <strong className="text-white">{alert.status}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Export this single alert GeoJSON
              const blob = new Blob([JSON.stringify(alert, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${alert.id}-evidence.geojson`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-verdant-border text-xs font-mono text-verdant-textMuted hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-verdant-lime" />
            Export GeoJSON
          </button>
        </div>
      </div>
    </div>
  );
};
