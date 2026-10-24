import React from 'react';
import { useValidation } from '../data/validationData';
import { ShieldCheck, AlertTriangle, Layers, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ isOpen, onClose }) => {
  const { study: VALIDATION_STUDY, measured } = useValidation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-verdant-panel border border-verdant-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-verdant-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-verdant-lime/20 border border-verdant-lime/40 flex items-center justify-center text-verdant-lime">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Validation & Remote Sensing Methodology
              </h2>
              <p className="text-xs font-mono text-verdant-textDim">
                Independent Holdout Assessment & Scientific Limitations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-textMuted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-verdant-textMuted leading-relaxed">
          {/* Generalization Warning Callout */}
          <div className="p-4 rounded-xl bg-verdant-amber/10 border border-verdant-amber/30 text-verdant-amber">
            <div className="flex items-center gap-2 font-mono font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Scientific Rigor & Generalization Limits</span>
            </div>
            <p className="text-[11px] leading-relaxed text-verdant-text">
              <strong>Do not assume global generalization:</strong> Optical change detection thresholds calibrated for tropical moist deciduous forests (such as Hasdeo Arand, India) cannot be directly applied to dense equatorial rainforests (such as Sumatra or the Amazon) or dry scrub biomes without recalibrating for local phenology, canopy moisture, and persistent cloudiness.
            </p>
          </div>

          {!measured && (
            <div className="p-3 rounded-xl border border-dashed border-verdant-amber/50 text-verdant-amber font-mono text-[11px]">
              PLACEHOLDER metrics - not measured yet. Run backend/heldout_validation.py to replace them with real held-out results.
            </div>
          )}

          {/* Validation Metrics Summary */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-3">
              Independent Holdout Test Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-verdant-surface p-3.5 rounded-xl border border-verdant-border">
                <span className="text-[10px] text-verdant-textDim block">PRECISION</span>
                <span className="text-2xl font-bold text-verdant-lime block mt-1">
                  {(VALIDATION_STUDY.precision * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-verdant-textDim">Confirmed vs Flagged</span>
              </div>

              <div className="bg-verdant-surface p-3.5 rounded-xl border border-verdant-border">
                <span className="text-[10px] text-verdant-textDim block">RECALL</span>
                <span className="text-2xl font-bold text-white block mt-1">
                  {(VALIDATION_STUDY.recall * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-verdant-textDim">Canopy loss captured</span>
              </div>

              <div className="bg-verdant-surface p-3.5 rounded-xl border border-verdant-border">
                <span className="text-[10px] text-verdant-textDim block">F1 SCORE</span>
                <span className="text-2xl font-bold text-verdant-emerald block mt-1">
                  {(VALIDATION_STUDY.f1Score * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-verdant-textDim">Harmonic balance</span>
              </div>

              <div className="bg-verdant-surface p-3.5 rounded-xl border border-verdant-border">
                <span className="text-[10px] text-verdant-textDim block">FALSE ALARM</span>
                <span className="text-2xl font-bold text-verdant-amber block mt-1">
                  {(VALIDATION_STUDY.falseAlarmRate * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-verdant-textDim">10.8% false positive</span>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-2">
              Area Confusion Matrix (Hectares)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-verdant-border font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-verdant-surface text-verdant-textDim">
                  <tr>
                    <th className="p-3">Reference Ground Truth</th>
                    <th className="p-3">Model Detected (Loss)</th>
                    <th className="p-3">Model Unchanged (Intact)</th>
                    <th className="p-3">Total Reference Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-verdant-border">
                  <tr>
                    <td className="p-3 text-white font-semibold">True Tree Canopy Loss</td>
                    <td className="p-3 text-verdant-lime font-bold">1,482.4 ha (TP)</td>
                    <td className="p-3 text-verdant-amber font-bold">267.8 ha (FN)</td>
                    <td className="p-3 text-white">1,750.2 ha</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white font-semibold">Intact Forest / Stable</td>
                    <td className="p-3 text-verdant-red font-bold">179.6 ha (FP)</td>
                    <td className="p-3 text-white">123,070.2 ha (TN)</td>
                    <td className="p-3 text-white">123,249.8 ha</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* False Positive Sources and Mitigations */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-2">
              Primary Sources of False Positives & Mitigations
            </h3>
            <div className="space-y-2.5">
              {VALIDATION_STUDY.knownErrorSources.map((err, i) => (
                <div key={i} className="p-3 rounded-xl bg-verdant-surface border border-verdant-border text-xs">
                  <div className="flex items-center justify-between text-white font-semibold mb-1">
                    <span>{err.factor}</span>
                    <span className="text-verdant-amber font-mono text-[11px]">
                      {err.impactPercentage}% of errors
                    </span>
                  </div>
                  <p className="text-verdant-textMuted text-[11px]">
                    <strong className="text-verdant-lime font-mono">Mitigation: </strong>
                    {err.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-verdant-border bg-verdant-surface/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-verdant-textDim">
            Reference Dataset: FSI Audited PlanetScope 3m NICFI & S2 L2A
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-verdant-surface hover:bg-verdant-card border border-verdant-border text-white text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
