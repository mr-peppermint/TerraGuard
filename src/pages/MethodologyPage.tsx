import React from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { ScrollReveal } from '../components/ScrollReveal';
import { useValidation } from '../data/validationData';
import { ShieldCheck, AlertTriangle, Layers, BookOpen, ExternalLink } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const { study: VALIDATION_STUDY, measured } = useValidation();
  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col text-verdant-textPrimary">
      <SiteHeader theme="light" />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16 space-y-20 flex-1 w-full">
        {/* Header */}
        <div className="space-y-4 border-b border-verdant-border pb-10">
          <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
            Scientific Framework
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-verdant-textPrimary">
            How VERDANT detects change.
          </h1>
          <p className="text-base sm:text-lg text-verdant-textSecondary font-medium leading-relaxed">
            A transparent 6-stage pipeline built on Copernicus Sentinel-2 MSI surface reflectance physics, designed to provide explainable screening evidence without black-box opacity.
          </p>
        </div>

        {/* Vertical Editorial Flow */}
        <div className="space-y-16">
          {/* Step 1: Satellite Observation */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-verdant-forest block">
              Stage 01
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary">
              Satellite Observation
            </h2>
            <p className="text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
              We ingest Level-2A Bottom-Of-Atmosphere (BOA) surface reflectance tiles collected by the European Space Agency’s twin Sentinel-2 satellites. At a 10-meter native spatial resolution, the sensor records sunlight reflected across 13 distinct spectral bands from visible blue to shortwave infrared.
            </p>
            <div className="bg-[#EAE5DA] p-4 text-xs font-mono font-semibold text-verdant-textPrimary space-y-1 border border-verdant-border">
              <div>Primary Bands: Band 4 (Red 665nm) & Band 8 (NIR 842nm)</div>
              <div>Ground Sampling Distance: 10m x 10m per pixel (0.01 ha)</div>
            </div>
          </ScrollReveal>

          {/* Step 2: Cloud Masking */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-verdant-forest block">
              Stage 02
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary">
              Cloud & Shadow Masking
            </h2>
            <p className="text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
              Tropical forest regions experience persistent cloud cover. We apply the 20-meter Scene Classification Layer (SCL) to systematically mask out cloud bodies (classes 8 and 9), cloud shadows (class 3), and thin cirrus haze (class 10). Pixel compositing selects median clear-sky observations across multi-pass windows.
            </p>
          </ScrollReveal>

          {/* Step 3: Vegetation Analysis (NDVI) */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-verdant-forest block">
              Stage 03
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary">
              Vegetation Index Calculation
            </h2>
            <p className="text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
              Healthy leaves absorb red light for photosynthesis while vigorously scattering near-infrared radiation from their internal cellular mesophyll. We calculate the Normalized Difference Vegetation Index (NDVI):
            </p>
            <div className="p-6 bg-verdant-dark text-verdant-darkText font-mono font-bold text-center text-base sm:text-lg border border-verdant-borderDark shadow-sm">
              NDVI = (NIR - Red) / (NIR + Red)
            </div>
            <p className="text-xs sm:text-sm text-verdant-textSecondary font-medium leading-relaxed">
              Dense tropical canopy typically scores between +0.70 and +0.85, whereas bare mineral soil, mining pits, or asphalt drop to between +0.10 and +0.25.
            </p>
          </ScrollReveal>

          {/* Step 4: Change Detection */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-olive">
              Stage 04
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              Bi-Temporal Differential
            </h2>
            <p className="text-sm text-verdant-textSecondary leading-relaxed">
              Rather than attempting to classify a single image, we compute the differential matrix:
            </p>
            <div className="p-4 bg-[#EBE7DD] font-mono text-xs text-verdant-textPrimary text-center">
              dNDVI = NDVI_monitoring - NDVI_baseline
            </div>
            <p className="text-xs text-verdant-textSecondary leading-relaxed">
              Pixels showing a negative delta exceeding -0.20 are flagged as candidate disturbance areas.
            </p>
          </ScrollReveal>

          {/* Step 5: Candidate Alert Generation */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-olive">
              Stage 05
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              Candidate Alert Generation
            </h2>
            <p className="text-sm text-verdant-textSecondary leading-relaxed">
              Individual noisy pixels are eliminated using a 3x3 spatial morphological filter. Contiguous clusters exceeding 0.5 hectares are vectorized into GeoJSON polygons with geodesic ellipsoidal area metrics.
            </p>
          </ScrollReveal>

          {/* Step 6: Validation & Review */}
          <ScrollReveal className="space-y-4 border-l-2 border-verdant-border pl-6 relative">
            <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-olive">
              Stage 06
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              Validation & Human Review
            </h2>
            <p className="text-sm text-verdant-textSecondary leading-relaxed">
              Every flagged event is strictly categorized as a candidate alert rather than confirmed deforestation. We assign an explainable screening score (0–100) and present explicit alternative hypotheses for ground verification.
            </p>
          </ScrollReveal>
        </div>

        {/* Section on False Positives */}
        <section className="space-y-6 border-t border-verdant-border pt-16">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-alertHigh block">
              Critical Scientific Warning
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              Sources of False Positives
            </h2>
          </div>

          <p className="text-sm text-verdant-textSecondary leading-relaxed">
            Never classify every negative NDVI change as deforestation. A wide variety of non-destructive natural and cultural processes produce sharp reductions in canopy greenness:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-[#EBE7DD] border border-verdant-border space-y-2">
              <h3 className="font-serif text-lg font-medium">Seasonal Deciduous Phenology</h3>
              <p className="text-xs text-verdant-textSecondary leading-relaxed">
                Species such as Shorea robusta (Sal) and Teak naturally shed foliage during dry pre-monsoon heat, causing seasonal NDVI drops that recover immediately upon rain arrival.
              </p>
            </div>

            <div className="p-6 bg-[#EBE7DD] border border-verdant-border space-y-2">
              <h3 className="font-serif text-lg font-medium">Agricultural Harvests & Shifting Plots</h3>
              <p className="text-xs text-verdant-textSecondary leading-relaxed">
                Rotational cropping and post-monsoon harvesting on reserve fringe land create rapid bare-ground transitions that are cultural cycles rather than permanent deforestation.
              </p>
            </div>

            <div className="p-6 bg-[#EBE7DD] border border-verdant-border space-y-2">
              <h3 className="font-serif text-lg font-medium">Understory Controlled Burns</h3>
              <p className="text-xs text-verdant-textSecondary leading-relaxed">
                Ground fire lines maintained by Forest Departments consume dry leaf litter, causing transient drops in near-infrared reflectance without damaging mature tree crowns.
              </p>
            </div>

            <div className="p-6 bg-[#EBE7DD] border border-verdant-border space-y-2">
              <h3 className="font-serif text-lg font-medium">Topographic & Cloud Shadows</h3>
              <p className="text-xs text-verdant-textSecondary leading-relaxed">
                Steep western escarpments observed at low solar elevation angles attenuate illumination, mimicking canopy loss if sun azimuth corrections are omitted.
              </p>
            </div>
          </div>
        </section>

        {/* Independent Holdout Validation Study Section */}
        <section className="space-y-6 border-t border-verdant-border pt-16">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary block">
              Independent Assessment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-verdant-textPrimary">
              Out-of-Sample Holdout Validation
            </h2>
          </div>

          <p className="text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
            Algorithms calibrated on one ecosystem often overfit and fail elsewhere, so the threshold is tuned on one area and evaluated on a different, held-out area against Hansen Global Forest Change labels (30 m, yearly - coarse and noisy). {measured ? 'These numbers are measured:' : 'The numbers below are PLACEHOLDERS until backend/heldout_validation.py is run:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs pt-2">
            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-1 shadow-sm">
              <span className="text-[10px] text-verdant-textSecondary font-bold uppercase block">Precision</span>
              <span className="font-serif text-3xl text-verdant-textPrimary font-bold block">
                {(VALIDATION_STUDY.precision * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-verdant-textSecondary font-semibold block font-sans">
                True loss vs flagged
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-1 shadow-sm">
              <span className="text-[10px] text-verdant-textSecondary font-bold uppercase block">Recall</span>
              <span className="font-serif text-3xl text-verdant-textPrimary font-bold block">
                {(VALIDATION_STUDY.recall * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-verdant-textSecondary font-semibold block font-sans">
                Loss patches detected
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-1 shadow-sm">
              <span className="text-[10px] text-verdant-textSecondary font-bold uppercase block">F1 Score</span>
              <span className="font-serif text-3xl text-verdant-forest font-bold block">
                {(VALIDATION_STUDY.f1Score * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-verdant-textSecondary font-semibold block font-sans">
                Harmonic balance
              </span>
            </div>

            <div className="p-5 border border-verdant-border bg-[#EAE5DA] space-y-1 shadow-sm">
              <span className="text-[10px] text-verdant-textSecondary font-bold uppercase block">False Alarm</span>
              <span className="font-serif text-3xl text-verdant-alertHigh font-bold block">
                {(VALIDATION_STUDY.falseAlarmRate * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-verdant-textSecondary font-semibold block font-sans">
                Phenology & cloud edge
              </span>
            </div>
          </div>
        </section>

        {/* Data Attribution & Terms */}
        <section className="border-t border-verdant-border pt-12 space-y-3 text-xs text-verdant-textSecondary leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-widest text-verdant-textPrimary block">
            Data Attribution & Provider Terms
          </span>
          <p>
            Copernicus Sentinel data [2024] retrieved from European Space Agency (ESA) via Copernicus Data Space Ecosystem. Topographic basemaps courtesy of OpenStreetMap contributors. High-resolution reference validation imagery provided under NICFI PlanetScope program.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};
