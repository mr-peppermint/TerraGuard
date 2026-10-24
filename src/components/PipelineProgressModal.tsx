import React from 'react';
import { DetectionStepEvent } from '../services/detectionService';
import { AnalysisRunResult, CandidateAlert } from '../types/geospatial';
import { Satellite, CheckCircle2, AlertCircle, Loader2, Play, Sparkles } from 'lucide-react';

interface PipelineProgressModalProps {
  isOpen: boolean;
  currentStep: DetectionStepEvent | null;
  completedSteps: DetectionStepEvent[];
  isFinished: boolean;
  result: AnalysisRunResult | null;
  alertsDetected: CandidateAlert[];
  onClose: () => void;
  onViewResults: () => void;
}

export const PipelineProgressModal: React.FC<PipelineProgressModalProps> = ({
  isOpen,
  currentStep,
  completedSteps,
  isFinished,
  result,
  alertsDetected,
  onClose,
  onViewResults
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-verdant-panel border border-verdant-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-verdant-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-lime">
              <Satellite className={`w-5 h-5 ${!isFinished ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Sentinel-2 Change Detection Engine
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-verdant-surface border border-verdant-border text-verdant-lime">
                  10-Step Workflow
                </span>
              </div>
              <p className="text-xs font-mono text-verdant-textDim mt-0.5">
                {isFinished ? 'Pipeline execution finished successfully' : 'Processing multi-spectral reflectance tensors...'}
              </p>
            </div>
          </div>

          {isFinished && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-textMuted hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Step Progress Stream */}
        <div className="p-6 max-h-[380px] overflow-y-auto space-y-3 font-mono text-xs">
          {completedSteps.map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-verdant-surface/80 border border-verdant-border"
            >
              <div className="mt-0.5">
                {s.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-verdant-lime" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-verdant-amber" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">
                    Step {s.step}: {s.title}
                  </span>
                  <span className="text-[10px] text-verdant-textDim">{s.durationMs}ms</span>
                </div>
                <p className="text-[11px] text-verdant-textMuted mt-0.5 font-sans">
                  {s.description}
                </p>
              </div>
            </div>
          ))}

          {/* Current Running Step */}
          {currentStep && !isFinished && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-verdant-lime/10 border border-verdant-lime/40 animate-pulse">
              <Loader2 className="w-4 h-4 text-verdant-lime animate-spin mt-0.5" />
              <div className="flex-1">
                <span className="text-verdant-lime font-bold">
                  Step {currentStep.step}: {currentStep.title}
                </span>
                <p className="text-[11px] text-verdant-text font-sans mt-0.5">
                  {currentStep.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Result Summary Bar when finished */}
        {isFinished && result && (
          <div className="p-5 border-t border-verdant-border bg-verdant-surface/60 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="bg-verdant-panel p-2.5 rounded-xl border border-verdant-border">
                <span className="text-verdant-textDim text-[10px] uppercase block">Detections</span>
                <span className="text-lg font-bold text-verdant-lime block mt-0.5">
                  {alertsDetected.length} alerts
                </span>
              </div>
              <div className="bg-verdant-panel p-2.5 rounded-xl border border-verdant-border">
                <span className="text-verdant-textDim text-[10px] uppercase block">Affected Area</span>
                <span className="text-lg font-bold text-white block mt-0.5">
                  {result.totalLossAreaHa} ha
                </span>
              </div>
              <div className="bg-verdant-panel p-2.5 rounded-xl border border-verdant-border">
                <span className="text-verdant-textDim text-[10px] uppercase block">Data Mode</span>
                <span className="text-[11px] font-bold text-verdant-amber block mt-1">
                  {result.dataSourceLabel.includes('Live') ? 'Live S2' : 'Precomputed S2'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full border border-verdant-border text-xs font-mono text-verdant-textMuted hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={onViewResults}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold text-xs shadow-glow-lime transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Candidates on Map</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
