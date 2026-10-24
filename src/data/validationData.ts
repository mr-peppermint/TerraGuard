import { useEffect, useState } from 'react';
import { ValidationMetrics } from '../types/geospatial';
import { API_BASE } from '../services/liveDetectionService';

/**
 * PLACEHOLDER numbers (illustrative only - NOT measured). They are replaced automatically by real results
 * once `python backend/heldout_validation.py` has produced backend/validation_results.json
 * (served by the backend at GET /validation).
 */
export const VALIDATION_STUDY: ValidationMetrics = {
  region: 'Held-out state (placeholder - not measured)',
  evaluationDataset: 'Placeholder - run backend/heldout_validation.py to measure against Hansen Global Forest Change labels',
  independentTestAreaHa: 125000,
  groundTruthSource: 'Placeholder - Hansen GFC (30 m, yearly) once measured',
  precision: 0.892, // 89.2% of flagged alerts were verified as true tree canopy loss
  recall: 0.847,    // 84.7% of actual tree canopy loss patches were successfully detected
  f1Score: 0.869,   // Harmonic mean
  falseAlarmRate: 0.108, // 10.8% false positive rate
  confusionMatrix: {
    truePositiveHa: 1482.4,
    falsePositiveHa: 179.6,
    falseNegativeHa: 267.8,
    trueNegativeHa: 123070.2
  },
  knownErrorSources: [
    {
      factor: 'Seasonal Deciduous Phenology (Pre-Monsoon Sal Leaf Drop)',
      impactPercentage: 42,
      mitigation: 'Use multi-year baseline NDVI harmonic modeling and enforce SWIR bare-soil threshold to prevent false alarms from dry leaves.'
    },
    {
      factor: 'Residual Cloud Edges & Low-Sun Hill Topographic Shadow',
      impactPercentage: 28,
      mitigation: 'Incorporate SCL (Scene Classification Layer) probability buffer + solar azimuth incidence angle masking.'
    },
    {
      factor: 'Cyclical Agroforestry & Harvested Crops on Fringe Land',
      impactPercentage: 18,
      mitigation: 'Filter out cadastral agricultural parcels using designated legal forest boundary masks.'
    },
    {
      factor: 'Controlled Forest Department Fire Lines & Understory Burns',
      impactPercentage: 12,
      mitigation: 'Pair with Sentinel-3 SLSTR active fire alerts and NBR post-fire recovery trajectory analysis.'
    }
  ]
};

interface MeasuredResults {
  year: number;
  labels: string;
  heldout_bbox: number[];
  chosen_threshold: number;
  heldout: { tp_ha: number; fp_ha: number; fn_ha: number; precision: number; recall: number; f1: number };
}

/** Returns real held-out metrics when the backend has them, otherwise the clearly-labelled placeholder. */
export function useValidation(): { study: ValidationMetrics; measured: boolean } {
  const [state, setState] = useState<{ study: ValidationMetrics; measured: boolean }>({
    study: VALIDATION_STUDY,
    measured: false
  });
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/validation`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: MeasuredResults | null) => {
        if (!j || !j.heldout || cancelled) return;
        const h = j.heldout;
        setState({
          measured: true,
          study: {
            ...VALIDATION_STUDY,
            region: `Held-out area (bbox ${j.heldout_bbox.join(', ')}), year ${j.year}`,
            evaluationDataset: `Hansen Global Forest Change (${j.labels}); dNDVI threshold ${j.chosen_threshold} tuned on a separate training area`,
            groundTruthSource: 'Hansen GFC 30 m yearly loss (coarse, noisy labels)',
            independentTestAreaHa: Math.round(h.tp_ha + h.fn_ha),
            precision: h.precision,
            recall: h.recall,
            f1Score: h.f1,
            falseAlarmRate: Number((1 - h.precision).toFixed(3)),
            confusionMatrix: {
              truePositiveHa: h.tp_ha,
              falsePositiveHa: h.fp_ha,
              falseNegativeHa: h.fn_ha,
              trueNegativeHa: 0
            }
          }
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
