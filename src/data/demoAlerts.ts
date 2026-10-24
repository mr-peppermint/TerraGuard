import { CandidateAlert } from '../types/geospatial';

export const DEMO_ALERTS: CandidateAlert[] = [
  // --- HASDEO ARAND, INDIA ---
  {
    id: 'ALT-IND-HSD-01',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.812, 22.825],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.802, 22.818],
        [82.822, 22.820],
        [82.828, 22.832],
        [82.814, 22.835],
        [82.804, 22.827],
        [82.802, 22.818]
      ]]
    },
    earlierDate: '2024-01-14',
    laterDate: '2024-11-20',
    affectedAreaHa: 114.6,
    ndviEarlier: 0.74,
    ndviLater: 0.22,
    ndviDelta: -0.52,
    nbrDelta: -0.48,
    validPixelPercentage: 97.4,
    cloudCoverPercent: 2.1,
    severity: 'critical',
    screeningScore: 94,
    heuristicBreakdown: {
      ndviMagnitude: 29,
      temporalConsistency: 24,
      patchContiguity: 19,
      spectralDistinctness: 14,
      cloudShadowRiskPenalty: 0,
      finalScore: 94
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Mining expansion & overburden dumping',
    alternativeExplanations: [
      'Seasonal leaf-drop of deciduous Sal tree canopy during extreme pre-monsoon heat',
      'Recent controlled ground fire line cleared by State Forest Department',
      'Temporary seasonal agricultural patch cleared after Kharif harvest'
    ],
    recommendedVerification: 'Dispatch drone reconnaissance or cross-reference Sentinel-1 SAR backscatter (descending orbit) to rule out dry-season phenological leaf senescence.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.038,
      b03_green: 0.065,
      b04_red: 0.048,
      b08_nir: 0.321,
      b11_swir1: 0.142,
      b12_swir2: 0.071,
      ndvi: 0.74,
      nbr: 0.64
    },
    spectralAfter: {
      b02_blue: 0.089,
      b03_green: 0.124,
      b04_red: 0.165,
      b08_nir: 0.258,
      b11_swir1: 0.298,
      b12_swir2: 0.245,
      ndvi: 0.22,
      nbr: 0.16
    }
  },
  {
    id: 'ALT-IND-HSD-02',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.785, 22.801],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.778, 22.796],
        [82.794, 22.798],
        [82.796, 22.808],
        [82.786, 22.809],
        [82.777, 22.803],
        [82.778, 22.796]
      ]]
    },
    earlierDate: '2024-01-14',
    laterDate: '2024-11-20',
    affectedAreaHa: 68.3,
    ndviEarlier: 0.71,
    ndviLater: 0.29,
    ndviDelta: -0.42,
    nbrDelta: -0.37,
    validPixelPercentage: 94.2,
    cloudCoverPercent: 4.8,
    severity: 'critical',
    screeningScore: 88,
    heuristicBreakdown: {
      ndviMagnitude: 27,
      temporalConsistency: 22,
      patchContiguity: 17,
      spectralDistinctness: 13,
      cloudShadowRiskPenalty: -1,
      finalScore: 88
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Linear infrastructure & road incision',
    alternativeExplanations: [
      'Forest road maintenance boundary widening',
      'Transmission line right-of-way vegetation clearing'
    ],
    recommendedVerification: 'Inspect 3m PlanetScope high-resolution monthly basemap to verify road corridor geometry.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.041,
      b03_green: 0.068,
      b04_red: 0.052,
      b08_nir: 0.306,
      b11_swir1: 0.149,
      b12_swir2: 0.076,
      ndvi: 0.71,
      nbr: 0.60
    },
    spectralAfter: {
      b02_blue: 0.078,
      b03_green: 0.110,
      b04_red: 0.148,
      b08_nir: 0.268,
      b11_swir1: 0.272,
      b12_swir2: 0.210,
      ndvi: 0.29,
      nbr: 0.23
    }
  },
  {
    id: 'ALT-IND-HSD-03',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.845, 22.842],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.839, 22.836],
        [82.853, 22.838],
        [82.857, 22.849],
        [82.846, 22.851],
        [82.838, 22.844],
        [82.839, 22.836]
      ]]
    },
    earlierDate: '2024-02-18',
    laterDate: '2024-11-20',
    affectedAreaHa: 47.2,
    ndviEarlier: 0.68,
    ndviLater: 0.34,
    ndviDelta: -0.34,
    nbrDelta: -0.29,
    validPixelPercentage: 91.0,
    cloudCoverPercent: 7.2,
    severity: 'high',
    screeningScore: 78,
    heuristicBreakdown: {
      ndviMagnitude: 23,
      temporalConsistency: 20,
      patchContiguity: 16,
      spectralDistinctness: 11,
      cloudShadowRiskPenalty: -2,
      finalScore: 78
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Mining expansion & overburden dumping',
    alternativeExplanations: [
      'Seasonal dry-down in stream gulley vegetation',
      'Localized fuel-wood felling by adjoining hamlet'
    ],
    recommendedVerification: 'Check spectral SWIR/NIR ratio consistency across consecutive Sentinel-2 orbits to verify soil exposure.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.043,
      b03_green: 0.071,
      b04_red: 0.058,
      b08_nir: 0.304,
      b11_swir1: 0.155,
      b12_swir2: 0.082,
      ndvi: 0.68,
      nbr: 0.58
    },
    spectralAfter: {
      b02_blue: 0.069,
      b03_green: 0.098,
      b04_red: 0.132,
      b08_nir: 0.268,
      b11_swir1: 0.248,
      b12_swir2: 0.186,
      ndvi: 0.34,
      nbr: 0.28
    }
  },
  {
    id: 'ALT-IND-HSD-04',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.828, 22.788],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.822, 22.783],
        [82.836, 22.785],
        [82.838, 22.794],
        [82.827, 22.795],
        [82.821, 22.790],
        [82.822, 22.783]
      ]]
    },
    earlierDate: '2024-03-05',
    laterDate: '2024-11-20',
    affectedAreaHa: 38.1,
    ndviEarlier: 0.66,
    ndviLater: 0.36,
    ndviDelta: -0.30,
    nbrDelta: -0.26,
    validPixelPercentage: 89.5,
    cloudCoverPercent: 8.5,
    severity: 'moderate',
    screeningScore: 68,
    heuristicBreakdown: {
      ndviMagnitude: 20,
      temporalConsistency: 17,
      patchContiguity: 15,
      spectralDistinctness: 10,
      cloudShadowRiskPenalty: -4,
      finalScore: 68
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Agricultural encroachment',
    alternativeExplanations: [
      'Slash-and-burn shifting cultivation cycle (Bewar/Podu)',
      'Delayed monsoon green-up in fringe forest'
    ],
    recommendedVerification: 'Check historical 5-year NDVI profile to assess if this area exhibits cyclical annual cultivation.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.045,
      b03_green: 0.074,
      b04_red: 0.062,
      b08_nir: 0.303,
      b11_swir1: 0.160,
      b12_swir2: 0.089,
      ndvi: 0.66,
      nbr: 0.55
    },
    spectralAfter: {
      b02_blue: 0.065,
      b03_green: 0.092,
      b04_red: 0.122,
      b08_nir: 0.259,
      b11_swir1: 0.231,
      b12_swir2: 0.170,
      ndvi: 0.36,
      nbr: 0.31
    }
  },
  {
    id: 'ALT-IND-HSD-05',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.765, 22.848],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.758, 22.842],
        [82.773, 22.845],
        [82.775, 22.855],
        [82.763, 22.857],
        [82.756, 22.850],
        [82.758, 22.842]
      ]]
    },
    earlierDate: '2024-02-18',
    laterDate: '2024-11-20',
    affectedAreaHa: 41.5,
    ndviEarlier: 0.70,
    ndviLater: 0.33,
    ndviDelta: -0.37,
    nbrDelta: -0.32,
    validPixelPercentage: 92.8,
    cloudCoverPercent: 5.5,
    severity: 'high',
    screeningScore: 76,
    heuristicBreakdown: {
      ndviMagnitude: 24,
      temporalConsistency: 19,
      patchContiguity: 15,
      spectralDistinctness: 11,
      cloudShadowRiskPenalty: -3,
      finalScore: 76
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Commercial selective logging',
    alternativeExplanations: [
      'Bamboo flowering dieback phenomenon common in central India',
      'Selective thinning by forest management'
    ],
    recommendedVerification: 'Examine texture analysis (GLCM variance) and canopy height model from GEDI LiDAR shots.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.040,
      b03_green: 0.067,
      b04_red: 0.054,
      b08_nir: 0.306,
      b11_swir1: 0.150,
      b12_swir2: 0.078,
      ndvi: 0.70,
      nbr: 0.59
    },
    spectralAfter: {
      b02_blue: 0.068,
      b03_green: 0.096,
      b04_red: 0.130,
      b08_nir: 0.258,
      b11_swir1: 0.245,
      b12_swir2: 0.180,
      ndvi: 0.33,
      nbr: 0.29
    }
  },
  {
    id: 'ALT-IND-HSD-06',
    regionId: 'hasdeo-arand',
    regionName: 'Hasdeo Arand Forest Reserve',
    country: 'India',
    coordinates: [82.858, 22.812],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [82.852, 22.807],
        [82.866, 22.809],
        [82.869, 22.818],
        [82.859, 22.819],
        [82.850, 22.814],
        [82.852, 22.807]
      ]]
    },
    earlierDate: '2024-03-05',
    laterDate: '2024-11-20',
    affectedAreaHa: 33.1,
    ndviEarlier: 0.65,
    ndviLater: 0.39,
    ndviDelta: -0.26,
    nbrDelta: -0.21,
    validPixelPercentage: 86.0,
    cloudCoverPercent: 11.2,
    severity: 'low',
    screeningScore: 56,
    heuristicBreakdown: {
      ndviMagnitude: 17,
      temporalConsistency: 14,
      patchContiguity: 13,
      spectralDistinctness: 8,
      cloudShadowRiskPenalty: -6,
      finalScore: 56
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Seasonal phenological dry-down',
    alternativeExplanations: [
      'High cloud shadow contamination in later Sentinel-2 pass (SCL flag 3)',
      'Normal leaf senescence in mixed deciduous stand'
    ],
    recommendedVerification: 'Filter with SCL shadow mask and recompute with next clear cloudless acquisition.',
    sentinelTileId: '44QMD',
    spectralBefore: {
      b02_blue: 0.046,
      b03_green: 0.076,
      b04_red: 0.065,
      b08_nir: 0.306,
      b11_swir1: 0.165,
      b12_swir2: 0.092,
      ndvi: 0.65,
      nbr: 0.54
    },
    spectralAfter: {
      b02_blue: 0.060,
      b03_green: 0.086,
      b04_red: 0.114,
      b08_nir: 0.260,
      b11_swir1: 0.215,
      b12_swir2: 0.154,
      ndvi: 0.39,
      nbr: 0.36
    }
  },

  // --- WESTERN GHATS, INDIA ---
  {
    id: 'ALT-IND-WG-01',
    regionId: 'western-ghats',
    regionName: 'Western Ghats (Nilgiri - Wayanad Corridor)',
    country: 'India',
    coordinates: [76.462, 11.632],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.455, 11.626],
        [76.471, 11.628],
        [76.474, 11.638],
        [76.463, 11.640],
        [76.453, 11.634],
        [76.455, 11.626]
      ]]
    },
    earlierDate: '2024-01-22',
    laterDate: '2024-11-15',
    affectedAreaHa: 52.4,
    ndviEarlier: 0.81,
    ndviLater: 0.31,
    ndviDelta: -0.50,
    nbrDelta: -0.45,
    validPixelPercentage: 96.1,
    cloudCoverPercent: 3.4,
    severity: 'critical',
    screeningScore: 91,
    heuristicBreakdown: {
      ndviMagnitude: 28,
      temporalConsistency: 23,
      patchContiguity: 18,
      spectralDistinctness: 13,
      cloudShadowRiskPenalty: -1,
      finalScore: 91
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Linear infrastructure & road incision',
    alternativeExplanations: [
      'Hill slope landslide or debris flow triggered during monsoon cloud burst',
      'Tea estate replanting cycle (pruning and uprooting of old bushes)'
    ],
    recommendedVerification: 'Check slope aspect and elevation using SRTM 30m DEM; verify if disturbance traces known ghat highway corridor.',
    sentinelTileId: '43PDR',
    spectralBefore: {
      b02_blue: 0.032,
      b03_green: 0.058,
      b04_red: 0.039,
      b08_nir: 0.371,
      b11_swir1: 0.128,
      b12_swir2: 0.059,
      ndvi: 0.81,
      nbr: 0.72
    },
    spectralAfter: {
      b02_blue: 0.082,
      b03_green: 0.118,
      b04_red: 0.155,
      b08_nir: 0.294,
      b11_swir1: 0.285,
      b12_swir2: 0.220,
      ndvi: 0.31,
      nbr: 0.24
    }
  },
  {
    id: 'ALT-IND-WG-02',
    regionId: 'western-ghats',
    regionName: 'Western Ghats (Nilgiri - Wayanad Corridor)',
    country: 'India',
    coordinates: [76.438, 11.595],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.430, 11.589],
        [76.446, 11.591],
        [76.449, 11.602],
        [76.436, 11.604],
        [76.429, 11.597],
        [76.430, 11.589]
      ]]
    },
    earlierDate: '2024-01-22',
    laterDate: '2024-11-15',
    affectedAreaHa: 41.2,
    ndviEarlier: 0.78,
    ndviLater: 0.38,
    ndviDelta: -0.40,
    nbrDelta: -0.34,
    validPixelPercentage: 93.0,
    cloudCoverPercent: 5.1,
    severity: 'high',
    screeningScore: 82,
    heuristicBreakdown: {
      ndviMagnitude: 25,
      temporalConsistency: 21,
      patchContiguity: 16,
      spectralDistinctness: 12,
      cloudShadowRiskPenalty: -2,
      finalScore: 82
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Agricultural encroachment',
    alternativeExplanations: [
      'Cardamom understory plantation clearing under dense evergreen canopy',
      'Silver Oak shade-tree pruning in coffee plantations'
    ],
    recommendedVerification: 'Assess shortwave infrared reflectance (Sentinel-2 Band 11/12) to detect exposed soil signature versus bare pruned branches.',
    sentinelTileId: '43PDR',
    spectralBefore: {
      b02_blue: 0.035,
      b03_green: 0.062,
      b04_red: 0.044,
      b08_nir: 0.356,
      b11_swir1: 0.134,
      b12_swir2: 0.065,
      ndvi: 0.78,
      nbr: 0.69
    },
    spectralAfter: {
      b02_blue: 0.071,
      b03_green: 0.102,
      b04_red: 0.138,
      b08_nir: 0.307,
      b11_swir1: 0.252,
      b12_swir2: 0.190,
      ndvi: 0.38,
      nbr: 0.32
    }
  },
  {
    id: 'ALT-IND-WG-03',
    regionId: 'western-ghats',
    regionName: 'Western Ghats (Nilgiri - Wayanad Corridor)',
    country: 'India',
    coordinates: [76.485, 11.650],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.479, 11.644],
        [76.493, 11.646],
        [76.495, 11.656],
        [76.484, 11.658],
        [76.477, 11.652],
        [76.479, 11.644]
      ]]
    },
    earlierDate: '2024-02-12',
    laterDate: '2024-11-15',
    affectedAreaHa: 36.8,
    ndviEarlier: 0.75,
    ndviLater: 0.42,
    ndviDelta: -0.33,
    nbrDelta: -0.28,
    validPixelPercentage: 88.5,
    cloudCoverPercent: 9.2,
    severity: 'moderate',
    screeningScore: 71,
    heuristicBreakdown: {
      ndviMagnitude: 21,
      temporalConsistency: 18,
      patchContiguity: 15,
      spectralDistinctness: 10,
      cloudShadowRiskPenalty: -3,
      finalScore: 71
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Commercial selective logging',
    alternativeExplanations: [
      'Invasive Senna spectabilis eradication operation by Kerala Forest Department',
      'Windthrow patch along exposed ridge line'
    ],
    recommendedVerification: 'Cross-reference with state invasive weed management spatial boundary maps.',
    sentinelTileId: '43PDR',
    spectralBefore: {
      b02_blue: 0.037,
      b03_green: 0.065,
      b04_red: 0.049,
      b08_nir: 0.343,
      b11_swir1: 0.141,
      b12_swir2: 0.072,
      ndvi: 0.75,
      nbr: 0.65
    },
    spectralAfter: {
      b02_blue: 0.063,
      b03_green: 0.092,
      b04_red: 0.124,
      b08_nir: 0.303,
      b11_swir1: 0.228,
      b12_swir2: 0.168,
      ndvi: 0.42,
      nbr: 0.38
    }
  },
  {
    id: 'ALT-IND-WG-04',
    regionId: 'western-ghats',
    regionName: 'Western Ghats (Nilgiri - Wayanad Corridor)',
    country: 'India',
    coordinates: [76.512, 11.605],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.505, 11.599],
        [76.520, 11.601],
        [76.523, 11.611],
        [76.512, 11.613],
        [76.504, 11.607],
        [76.505, 11.599]
      ]]
    },
    earlierDate: '2024-02-12',
    laterDate: '2024-11-15',
    affectedAreaHa: 29.5,
    ndviEarlier: 0.76,
    ndviLater: 0.44,
    ndviDelta: -0.32,
    nbrDelta: -0.27,
    validPixelPercentage: 90.0,
    cloudCoverPercent: 7.8,
    severity: 'moderate',
    screeningScore: 69,
    heuristicBreakdown: {
      ndviMagnitude: 21,
      temporalConsistency: 17,
      patchContiguity: 14,
      spectralDistinctness: 10,
      cloudShadowRiskPenalty: -3,
      finalScore: 69
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Agricultural encroachment',
    alternativeExplanations: [
      'Terraced farming crop rotation',
      'Shola grassland seasonal browning'
    ],
    recommendedVerification: 'Review seasonal time series over past 24 months to isolate periodic vegetation cycles.',
    sentinelTileId: '43PDR',
    spectralBefore: {
      b02_blue: 0.036,
      b03_green: 0.064,
      b04_red: 0.047,
      b08_nir: 0.345,
      b11_swir1: 0.138,
      b12_swir2: 0.069,
      ndvi: 0.76,
      nbr: 0.66
    },
    spectralAfter: {
      b02_blue: 0.062,
      b03_green: 0.090,
      b04_red: 0.120,
      b08_nir: 0.308,
      b11_swir1: 0.222,
      b12_swir2: 0.162,
      ndvi: 0.44,
      nbr: 0.40
    }
  },
  {
    id: 'ALT-IND-WG-05',
    regionId: 'western-ghats',
    regionName: 'Western Ghats (Nilgiri - Wayanad Corridor)',
    country: 'India',
    coordinates: [76.425, 11.662],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.419, 11.657],
        [76.433, 11.659],
        [76.435, 11.668],
        [76.424, 11.670],
        [76.418, 11.664],
        [76.419, 11.657]
      ]]
    },
    earlierDate: '2024-03-01',
    laterDate: '2024-11-15',
    affectedAreaHa: 24.3,
    ndviEarlier: 0.72,
    ndviLater: 0.48,
    ndviDelta: -0.24,
    nbrDelta: -0.19,
    validPixelPercentage: 85.0,
    cloudCoverPercent: 12.0,
    severity: 'low',
    screeningScore: 54,
    heuristicBreakdown: {
      ndviMagnitude: 16,
      temporalConsistency: 13,
      patchContiguity: 12,
      spectralDistinctness: 8,
      cloudShadowRiskPenalty: -5,
      finalScore: 54
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Seasonal phenological dry-down',
    alternativeExplanations: [
      'Topographic shadow caused by steep western escarpment at low solar zenith',
      'Thin cirrus cloud masking artifact'
    ],
    recommendedVerification: 'Apply topographic illumination correction (C-correction model) using solar azimuth metadata.',
    sentinelTileId: '43PDR',
    spectralBefore: {
      b02_blue: 0.039,
      b03_green: 0.068,
      b04_red: 0.052,
      b08_nir: 0.320,
      b11_swir1: 0.145,
      b12_swir2: 0.075,
      ndvi: 0.72,
      nbr: 0.62
    },
    spectralAfter: {
      b02_blue: 0.055,
      b03_green: 0.081,
      b04_red: 0.108,
      b08_nir: 0.307,
      b11_swir1: 0.198,
      b12_swir2: 0.145,
      ndvi: 0.48,
      nbr: 0.44
    }
  },

  // --- RONDONIA / BRAZIL (AMAZON) ---
  {
    id: 'ALT-BRA-RON-01',
    regionId: 'rondonia-amazon',
    regionName: 'Jamari National Forest / Rondônia',
    country: 'Brazil',
    coordinates: [-63.155, -9.192],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-63.170, -9.180],
        [-63.140, -9.182],
        [-63.138, -9.205],
        [-63.168, -9.208],
        [-63.175, -9.195],
        [-63.170, -9.180]
      ]]
    },
    earlierDate: '2024-06-15',
    laterDate: '2024-10-10',
    affectedAreaHa: 245.8,
    ndviEarlier: 0.84,
    ndviLater: 0.18,
    ndviDelta: -0.66,
    nbrDelta: -0.62,
    validPixelPercentage: 99.1,
    cloudCoverPercent: 0.9,
    severity: 'critical',
    screeningScore: 98,
    heuristicBreakdown: {
      ndviMagnitude: 30,
      temporalConsistency: 25,
      patchContiguity: 20,
      spectralDistinctness: 15,
      cloudShadowRiskPenalty: 0,
      finalScore: 98
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Mining expansion & overburden dumping',
    alternativeExplanations: [
      'Large commercial pasture conversion following legal permit',
      'Wildfire scar along forest edge'
    ],
    recommendedVerification: 'Cross-check against IBAMA / CAR federal land registry cadastre to confirm legal concession boundary.',
    sentinelTileId: '20LMR',
    spectralBefore: {
      b02_blue: 0.028,
      b03_green: 0.052,
      b04_red: 0.033,
      b08_nir: 0.380,
      b11_swir1: 0.118,
      b12_swir2: 0.051,
      ndvi: 0.84,
      nbr: 0.76
    },
    spectralAfter: {
      b02_blue: 0.098,
      b03_green: 0.138,
      b04_red: 0.185,
      b08_nir: 0.266,
      b11_swir1: 0.332,
      b12_swir2: 0.285,
      ndvi: 0.18,
      nbr: 0.08
    }
  },
  {
    id: 'ALT-BRA-RON-02',
    regionId: 'rondonia-amazon',
    regionName: 'Jamari National Forest / Rondônia',
    country: 'Brazil',
    coordinates: [-63.115, -9.145],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-63.125, -9.138],
        [-63.102, -9.140],
        [-63.105, -9.155],
        [-63.128, -9.158],
        [-63.130, -9.146],
        [-63.125, -9.138]
      ]]
    },
    earlierDate: '2024-06-15',
    laterDate: '2024-10-10',
    affectedAreaHa: 162.3,
    ndviEarlier: 0.82,
    ndviLater: 0.24,
    ndviDelta: -0.58,
    nbrDelta: -0.54,
    validPixelPercentage: 98.4,
    cloudCoverPercent: 1.2,
    severity: 'critical',
    screeningScore: 93,
    heuristicBreakdown: {
      ndviMagnitude: 29,
      temporalConsistency: 24,
      patchContiguity: 19,
      spectralDistinctness: 14,
      cloudShadowRiskPenalty: 0,
      finalScore: 93
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Linear infrastructure & road incision',
    alternativeExplanations: [
      'Secondary track clearing for timber extraction',
      'Buffer zone fire break creation'
    ],
    recommendedVerification: 'Check PRODES deforestation polygons to verify official Brazilian space agency (INPE) classification.',
    sentinelTileId: '20LMR',
    spectralBefore: {
      b02_blue: 0.030,
      b03_green: 0.055,
      b04_red: 0.036,
      b08_nir: 0.364,
      b11_swir1: 0.122,
      b12_swir2: 0.055,
      ndvi: 0.82,
      nbr: 0.74
    },
    spectralAfter: {
      b02_blue: 0.088,
      b03_green: 0.126,
      b04_red: 0.170,
      b08_nir: 0.278,
      b11_swir1: 0.310,
      b12_swir2: 0.260,
      ndvi: 0.24,
      nbr: 0.14
    }
  },

  // --- BUKIT TIGAPULUH, INDONESIA ---
  {
    id: 'ALT-IDN-BKT-01',
    regionId: 'bukit-tigapuluh',
    regionName: 'Bukit Tigapuluh National Park Buffer',
    country: 'Indonesia',
    coordinates: [102.592, -0.915],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [102.580, -0.905],
        [102.605, -0.908],
        [102.608, -0.928],
        [102.582, -0.930],
        [102.576, -0.918],
        [102.580, -0.905]
      ]]
    },
    earlierDate: '2024-03-20',
    laterDate: '2024-10-25',
    affectedAreaHa: 154.2,
    ndviEarlier: 0.83,
    ndviLater: 0.25,
    ndviDelta: -0.58,
    nbrDelta: -0.52,
    validPixelPercentage: 92.4,
    cloudCoverPercent: 6.8,
    severity: 'critical',
    screeningScore: 92,
    heuristicBreakdown: {
      ndviMagnitude: 29,
      temporalConsistency: 23,
      patchContiguity: 19,
      spectralDistinctness: 14,
      cloudShadowRiskPenalty: -2,
      finalScore: 92
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Agricultural encroachment',
    alternativeExplanations: [
      'Plantation replanting clearcut (oil palm rotation every 25 years)',
      'Equatorial convective cloud shadow artifact'
    ],
    recommendedVerification: 'Verify with Sentinel-1 SAR Dual-Pol (VH/VV) time series to confirm trunk removal irrespective of cloud cover.',
    sentinelTileId: '48MVT',
    spectralBefore: {
      b02_blue: 0.031,
      b03_green: 0.056,
      b04_red: 0.038,
      b08_nir: 0.408,
      b11_swir1: 0.125,
      b12_swir2: 0.054,
      ndvi: 0.83,
      nbr: 0.77
    },
    spectralAfter: {
      b02_blue: 0.082,
      b03_green: 0.120,
      b04_red: 0.165,
      b08_nir: 0.275,
      b11_swir1: 0.298,
      b12_swir2: 0.240,
      ndvi: 0.25,
      nbr: 0.17
    }
  },

  // --- ATEWA RANGE, GHANA ---
  {
    id: 'ALT-GHA-ATW-01',
    regionId: 'atewa-ghana',
    regionName: 'Atewa Range Forest Reserve',
    country: 'Ghana',
    coordinates: [-0.602, 6.231],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-0.610, 6.222],
        [-0.592, 6.225],
        [-0.594, 6.240],
        [-0.612, 6.242],
        [-0.616, 6.230],
        [-0.610, 6.222]
      ]]
    },
    earlierDate: '2024-01-10',
    laterDate: '2024-11-05',
    affectedAreaHa: 48.7,
    ndviEarlier: 0.79,
    ndviLater: 0.21,
    ndviDelta: -0.58,
    nbrDelta: -0.53,
    validPixelPercentage: 95.0,
    cloudCoverPercent: 4.2,
    severity: 'critical',
    screeningScore: 90,
    heuristicBreakdown: {
      ndviMagnitude: 28,
      temporalConsistency: 23,
      patchContiguity: 18,
      spectralDistinctness: 13,
      cloudShadowRiskPenalty: -1,
      finalScore: 90
    },
    status: 'Candidate — needs verification',
    driverHypothesis: 'Mining expansion & overburden dumping',
    alternativeExplanations: [
      'Riparian seasonal gravel bar shifting during flood retreat',
      'Artisanal farm plot clearing under cocoa shade trees'
    ],
    recommendedVerification: 'Check MNDWI (Modified Normalized Difference Water Index) to detect flooded alluvial pits characteristic of Galamsey mining.',
    sentinelTileId: '30NZN',
    spectralBefore: {
      b02_blue: 0.034,
      b03_green: 0.060,
      b04_red: 0.042,
      b08_nir: 0.358,
      b11_swir1: 0.132,
      b12_swir2: 0.062,
      ndvi: 0.79,
      nbr: 0.70
    },
    spectralAfter: {
      b02_blue: 0.092,
      b03_green: 0.130,
      b04_red: 0.178,
      b08_nir: 0.272,
      b11_swir1: 0.315,
      b12_swir2: 0.262,
      ndvi: 0.21,
      nbr: 0.11
    }
  }
];
