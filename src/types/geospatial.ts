export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'low';

export type AlertStatus = 
  | 'Candidate — needs verification'
  | 'Under Active Investigation'
  | 'Verified Canopy Loss'
  | 'Flagged False Positive (Seasonal/Agri)';

export type DisturbanceDriver = 
  | 'Mining expansion & overburden dumping'
  | 'Linear infrastructure & road incision'
  | 'Agricultural encroachment'
  | 'Commercial selective logging'
  | 'Seasonal phenological dry-down'
  | 'Fire burn scar'
  | 'Undetermined — needs field verification';

export interface SpectralBands {
  b02_blue: number;   // 490 nm
  b03_green: number;  // 560 nm
  b04_red: number;    // 665 nm
  b08_nir: number;    // 842 nm
  b11_swir1?: number; // 1610 nm
  b12_swir2?: number; // 2190 nm
  ndvi: number;       // (NIR - Red) / (NIR + Red)
  nbr?: number;       // (NIR - SWIR2) / (NIR + SWIR2)
}

export interface HeuristicBreakdown {
  ndviMagnitude: number;      // 0 - 30 pts (based on drop >= 0.25)
  temporalConsistency: number;// 0 - 25 pts (sustained over consecutive passes)
  patchContiguity: number;    // 0 - 20 pts (compactness & spatial clustering)
  spectralDistinctness: number;// 0 - 15 pts (SWIR rise confirming bare soil)
  cloudShadowRiskPenalty: number; // -0 to -20 pts (proximity to SCL shadow flag)
  finalScore: number;         // 0 - 100 screening score
}

export interface CandidateAlert {
  id: string;
  regionId: string;
  regionName: string;
  country: string;
  coordinates: [number, number]; // [lng, lat]
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  earlierDate: string;
  laterDate: string;
  affectedAreaHa: number;
  ndviEarlier: number;
  ndviLater: number;
  ndviDelta: number; // ndviLater - ndviEarlier (negative indicates loss)
  nbrDelta?: number;
  validPixelPercentage: number;
  cloudCoverPercent: number;
  severity: AlertSeverity;
  screeningScore: number; // Explicitly labeled heuristic screening score (0-100), not calibrated probability
  heuristicBreakdown: HeuristicBreakdown;
  status: AlertStatus;
  driverHypothesis: DisturbanceDriver;
  alternativeExplanations: string[];
  recommendedVerification: string;
  sentinelTileId: string;
  spectralBefore: SpectralBands;
  spectralAfter: SpectralBands;
  visualThumbnails?: {
    beforeUrl: string;
    afterUrl: string;
    deltaHeatmapUrl: string;
  };
}

export interface ForestRegion {
  id: string;
  name: string;
  country: string;
  continent: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  bounds: [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]
  totalMonitoredAreaHa: number;
  baselineCanopyCoverPercent: number;
  threatSummary: string;
  ecosystemType: string;
  primaryRisk: string;
  sentinelTileId: string;
  cloudSeasonality: string;
  activeAlertsCount: number;
  totalLossHa: number;
}

export interface DetectionSettings {
  earlierDate: string;
  laterDate: string;
  ndviThreshold: number; // e.g. -0.20
  minPatchSizeHa: number; // e.g. 0.5 ha (5 Sentinel pixels)
  maxCloudCover: number; // e.g. 20%
  useSclMask: boolean;
  enableNbrConfirmation: boolean;
}

export interface AnalysisRunResult {
  runId: string;
  regionId: string;
  regionName: string;
  executedAt: string;
  earlierWindow: { start: string; end: string; compositeDate: string };
  laterWindow: { start: string; end: string; compositeDate: string };
  scenesAnalyzed: number;
  validPixelPercent: number;
  meanCloudCover: number;
  candidatesDetectedCount: number;
  totalLossAreaHa: number;
  isLiveSatellite: boolean;
  dataSourceLabel: string;
  detectionStepsLog: {
    step: number;
    title: string;
    description: string;
    durationMs: number;
    status: 'completed' | 'warning' | 'skipped';
  }[];
}

export interface ValidationMetrics {
  region: string;
  evaluationDataset: string;
  independentTestAreaHa: number;
  groundTruthSource: string;
  precision: number;
  recall: number;
  f1Score: number;
  falseAlarmRate: number;
  confusionMatrix: {
    truePositiveHa: number;
    falsePositiveHa: number;
    falseNegativeHa: number;
    trueNegativeHa: number;
  };
  knownErrorSources: {
    factor: string;
    impactPercentage: number;
    mitigation: string;
  }[];
}

export type ForecastHorizon = '1year' | '3year' | '5year';

export interface DeforestationPredictionPatch {
  id: string;
  horizon: ForecastHorizon;
  yearTarget: number;
  riskScore: number; // 0-100% relative likelihood
  riskLevel: 'high' | 'critical' | 'moderate' | 'elevated';
  projectedLossHa: number;
  coordinates: [number, number]; // [lng, lat]
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  primaryDriver: DisturbanceDriver;
  environmentalFactors: {
    proximityToRoadKm: number;
    elevationMeters: number;
    slopeDegrees: number;
    historicalLossTrendPct: number;
    canopyDensityPct: number;
  };
  aiConfidenceScore: number;
  aiRationale: string;
}

export interface RegionPredictionSummary {
  regionId: string;
  regionName: string;
  center: [number, number];
  horizon: ForecastHorizon;
  yearTarget: number;
  totalProjectedLossHa: number;
  projectedAnnualRateHa: number;
  highRiskAreaHa: number;
  overallRiskScore: number;
  driversBreakdown: {
    driver: string;
    lossHa: number;
    pct: number;
  }[];
  yearlyProgression: {
    year: number;
    lossHa: number;
    cumulativeLossHa: number;
  }[];
  aiAgentAnalysis: string;
  patches: DeforestationPredictionPatch[];
}
