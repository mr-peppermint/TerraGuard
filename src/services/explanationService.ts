import { CandidateAlert } from '../types/geospatial';

export interface AlertExplanation {
  headline: string;
  spectralEvidence: string;
  uncertaintyAnalysis: string;
  hypothesizedDriver: string;
  alternativeRisks: string[];
  recommendedAction: string;
  generatedBy: 'Deterministic Rule Engine' | 'Gemini Remote Sensing AI' | 'Custom LLM';
  isAiGenerated: boolean;
}

class ExplanationService {
  private userApiKey: string = '';

  public setApiKey(key: string) {
    this.userApiKey = key;
  }

  public getApiKey(): string {
    return this.userApiKey;
  }

  /**
   * Generates explanation for a specific candidate alert.
   * If an API key is provided, queries the model with strict ground truth injection.
   * Otherwise, generates a deterministic, scientifically rigorous explanation based on Sentinel-2 band physics.
   */
  public async explainAlert(alert: CandidateAlert): Promise<AlertExplanation> {
    if (this.userApiKey && this.userApiKey.trim().length > 10) {
      try {
        return await this.callGeminiApi(alert, this.userApiKey.trim());
      } catch (err) {
        console.warn('AI API call failed or timed out, falling back to deterministic explanation:', err);
      }
    }

    // High-precision deterministic remote-sensing rule engine
    return this.generateDeterministicExplanation(alert);
  }

  private generateDeterministicExplanation(alert: CandidateAlert): AlertExplanation {
    const ndviDropPercent = Math.abs(Math.round(((alert.ndviEarlier - alert.ndviLater) / alert.ndviEarlier) * 100));
    const isSevere = alert.severity === 'critical';
    const isModerate = alert.severity === 'moderate' || alert.severity === 'high';

    const redIncrease = ((alert.spectralAfter.b04_red - alert.spectralBefore.b04_red) / alert.spectralBefore.b04_red) * 100;
    const nirDrop = ((alert.spectralBefore.b08_nir - alert.spectralAfter.b08_nir) / alert.spectralBefore.b08_nir) * 100;

    let spectralDetail = `Sentinel-2 MSI Level-2A surface reflectance data exhibits a ${ndviDropPercent}% decline in NDVI (from ${alert.ndviEarlier.toFixed(2)} down to ${alert.ndviLater.toFixed(2)}). Specifically, Band 4 (Red at 665nm) absorption decreased by +${redIncrease.toFixed(0)}%, reflecting loss of chlorophyll photosynthetic absorption, while Band 8 (NIR at 842nm) canopy spongy mesophyll scattering diminished by -${nirDrop.toFixed(0)}%.`;

    if (alert.spectralAfter.b11_swir1 && alert.spectralBefore.b11_swir1) {
      const swirIncrease = ((alert.spectralAfter.b11_swir1 - alert.spectralBefore.b11_swir1) / alert.spectralBefore.b11_swir1) * 100;
      spectralDetail += ` Shortwave Infrared Band 11 (1610nm) rose by +${swirIncrease.toFixed(0)}%, which is characteristic of exposed desiccated bare mineral soil and rock overburden rather than dry leaf litter.`;
    }

    let uncertainty = `The screening score for this alert is ${alert.screeningScore}/100. This is an explainable heuristic screening metric, not a calibrated statistical probability. Valid pixel coverage across both Sentinel-2 acquisitions is ${alert.validPixelPercentage.toFixed(1)}%, with average scene cloud contamination at ${alert.cloudCoverPercent.toFixed(1)}%.`;

    if (alert.cloudCoverPercent > 10) {
      uncertainty += ` Caution: Scene cloud contamination is elevated (${alert.cloudCoverPercent.toFixed(1)}%), which increases the risk of residual cloud edge and cloud shadow false positives.`;
    } else {
      uncertainty += ` Cloud contamination is minimal, yielding high radiometric confidence in the pixel delta.`;
    }

    return {
      headline: `${alert.severity.toUpperCase()} ALERT: ${alert.affectedAreaHa} ha candidate loss in ${alert.regionName}`,
      spectralEvidence: spectralDetail,
      uncertaintyAnalysis: uncertainty,
      hypothesizedDriver: alert.driverHypothesis,
      alternativeRisks: alert.alternativeExplanations,
      recommendedAction: alert.recommendedVerification,
      generatedBy: 'Deterministic Rule Engine',
      isAiGenerated: false
    };
  }

  private async callGeminiApi(alert: CandidateAlert, apiKey: string): Promise<AlertExplanation> {
    const prompt = `You are a Senior Remote Sensing Scientist analyzing a forest change alert from Sentinel-2 satellite imagery.
DO NOT fabricate coordinates, dates, or numbers. Only use the provided exact measurements.

ALERT DATA:
- ID: ${alert.id}
- Region: ${alert.regionName}, ${alert.country}
- Coordinates: [${alert.coordinates[0]}, ${alert.coordinates[1]}]
- Timeframe: Baseline ${alert.earlierDate} -> Monitoring ${alert.laterDate}
- Estimated Area: ${alert.affectedAreaHa} hectares
- Baseline NDVI: ${alert.ndviEarlier} -> Current NDVI: ${alert.ndviLater} (Delta: ${alert.ndviDelta})
- Red Band (B04): ${alert.spectralBefore.b04_red} -> ${alert.spectralAfter.b04_red}
- NIR Band (B08): ${alert.spectralBefore.b08_nir} -> ${alert.spectralAfter.b08_nir}
- SWIR1 Band (B11): ${alert.spectralBefore.b11_swir1} -> ${alert.spectralAfter.b11_swir1}
- Valid Pixel Coverage: ${alert.validPixelPercentage}%
- Cloud Cover: ${alert.cloudCoverPercent}%
- Heuristic Screening Score: ${alert.screeningScore}/100 (screening score, not probability)
- Hypothesized Driver: ${alert.driverHypothesis}

Format your response as valid JSON with these exact keys:
{
  "headline": "concise title with area and severity",
  "spectralEvidence": "scientific explanation of the band changes and what they physically indicate",
  "uncertaintyAnalysis": "rigorous discussion of cloud mask reliability, temporal limits, and heuristic score meaning",
  "hypothesizedDriver": "${alert.driverHypothesis}",
  "alternativeRisks": ["list of 2-3 alternative explanations such as phenology, fire, agriculture"],
  "recommendedAction": "concrete next step for ground or satellite verification"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      headline: parsed.headline || `${alert.affectedAreaHa} ha disturbance in ${alert.regionName}`,
      spectralEvidence: parsed.spectralEvidence,
      uncertaintyAnalysis: parsed.uncertaintyAnalysis,
      hypothesizedDriver: parsed.hypothesizedDriver || alert.driverHypothesis,
      alternativeRisks: parsed.alternativeRisks || alert.alternativeExplanations,
      recommendedAction: parsed.recommendedAction || alert.recommendedVerification,
      generatedBy: 'Gemini Remote Sensing AI',
      isAiGenerated: true
    };
  }
}

export const explanationService = new ExplanationService();
