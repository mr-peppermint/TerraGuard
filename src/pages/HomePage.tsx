import React from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { ScrollReveal } from '../components/ScrollReveal';
import { ArrowRight, Compass, Eye, Sliders, CheckCircle2 } from 'lucide-react';
import { DEMO_REGIONS } from '../data/demoRegions';

export const HomePage: React.FC = () => {
  const featuredRegion = DEMO_REGIONS[0]; // Hasdeo Arand

  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col">
      <SiteHeader theme="light" />

      {/* Hero Section */}
      <section className="relative bg-verdant-dark text-verdant-darkText overflow-hidden py-24 lg:py-36 border-b border-verdant-borderDark">
        {/* High-Visibility Atmospheric Earth & Forest Canopy Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105 transition-transform duration-1000 opacity-80"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(12, 13, 10, 0.96) 0%, rgba(12, 13, 10, 0.82) 42%, rgba(12, 13, 10, 0.25) 85%, rgba(12, 13, 10, 0.4) 100%), url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2400&q=85')`
          }}
        />

        {/* Ambient Subtle Green Glow Accent */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-verdant-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="w-2 h-2 rounded-full bg-verdant-lime animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-sand">
                Continuous Sentinel-2 Remote Sensing
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              The changing forest, seen from above.
            </h1>

            <p className="text-base sm:text-lg text-verdant-beige font-medium leading-relaxed max-w-2xl">
              Satellite intelligence for understanding forest loss, monitoring change and protecting landscapes at a quiet, human pace.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/explore"
                className="px-7 py-3.5 rounded-full bg-verdant-bg text-verdant-dark font-bold text-xs tracking-wider uppercase hover:bg-[#c4f03c] transition-all flex items-center gap-2 group shadow-xl"
              >
                <span>Launch Planetary Explorer</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/methodology"
                className="px-7 py-3.5 rounded-full border border-verdant-borderDark bg-[#0c0d0a]/60 backdrop-blur-md text-verdant-beige hover:text-white hover:border-white/50 transition-colors text-xs font-bold tracking-wider uppercase"
              >
                Our Method
              </Link>
            </div>
          </div>
        </div>

        
      </section>

      {/* Editorial Section 1: Observing Forest Change */}
      <section className="py-24 px-6 lg:px-12 border-b border-verdant-border">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline">
            <div className="lg:col-span-4">
              <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
                Perspective
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-verdant-textPrimary font-bold mt-3 leading-snug">
                Quiet observation across continental scales.
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-6 text-verdant-textSecondary text-sm sm:text-base font-medium leading-relaxed">
              <p>
                Forest clearings for linear roads, open-cast mines, agricultural expansion, and infrastructure frequently begin quietly at the periphery of protected reserves. By the time ground surveys take place, critical wildlife corridors and ancient Sal or Dipterocarp canopies have fractured.
              </p>
              <p>
                TerraGuard analyzes multi-spectral optical imagery from the European Space Agency’s twin Sentinel-2 satellites. By comparing calibrated surface-reflectance composites between dry and wet seasons, we isolate physical changes in leaf chlorophyll absorption and canopy moisture, separating seasonal rhythms from genuine disturbance.
              </p>
            </div>
          </div>

          {/* Large Photographic / Satellite Artwork with Caption */}
          <ScrollReveal className="space-y-3">
            <div className="relative aspect-[21/9] w-full rounded-none overflow-hidden bg-verdant-dark">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2400&q=80"
                alt="Dense tropical tree canopy viewed from satellite orbit"
                className="w-full h-full object-cover grayscale-[30%] contrast-110 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verdant-dark/60 via-transparent to-transparent" />
            </div>
            
          </ScrollReveal>
        </div>
      </section>

      {/* Principles Section: Observe, Compare, Understand */}
      <section className="py-24 px-6 lg:px-12 bg-verdant-bg border-b border-verdant-border">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-verdant-textPrimary font-bold mt-3">
              A scientific workflow for environmental truth.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ScrollReveal delayMs={0} className="space-y-4 border-t border-verdant-border pt-6">
              <span className="text-[11px] font-mono font-bold text-verdant-forest uppercase tracking-wider block">01 / Observe</span>
              <h3 className="font-serif text-2xl text-verdant-textPrimary font-bold">
                Continuous orbital passes
              </h3>
              <p className="text-sm text-verdant-textSecondary font-medium leading-relaxed">
                Sentinel-2 revisits every terrestrial forest patch every five days. We filter through atmospheric cloud cover and haze using 20m Scene Classification masks.
              </p>
            </ScrollReveal>

            <ScrollReveal delayMs={100} className="space-y-4 border-t border-verdant-border pt-6">
              <span className="text-[11px] font-mono font-bold text-verdant-forest uppercase tracking-wider block">02 / Compare</span>
              <h3 className="font-serif text-2xl text-verdant-textPrimary font-bold">
                Bi-temporal differential
              </h3>
              <p className="text-sm text-verdant-textSecondary font-medium leading-relaxed">
                Rather than relying on single snapshots, we synthesize median cloud-free baseline composites and compare them against recent monitoring windows using Normalized Difference Vegetation Index (NDVI) shifts.
              </p>
            </ScrollReveal>

            <ScrollReveal delayMs={200} className="space-y-4 border-t border-verdant-border pt-6">
              <span className="text-[11px] font-mono font-bold text-verdant-forest uppercase tracking-wider block">03 / Understand</span>
              <h3 className="font-serif text-2xl text-verdant-textPrimary font-bold">
                Transparent verification
              </h3>
              <p className="text-sm text-verdant-textSecondary font-medium leading-relaxed">
                Every detected change is treated as a candidate alert requiring human verification. We evaluate alternative hypotheses including dry-season leaf senescence, agricultural harvests, and cloud shadow artifacts.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Region Section */}
      <section className="py-24 px-6 lg:px-12 bg-[#EBE7DD] border-b border-verdant-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
                Featured Investigation Region
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-verdant-textPrimary font-bold mt-2">
                {featuredRegion.name}
              </h2>
              
            </div>

            <Link
              to="/explore"
              className="text-xs uppercase tracking-wider font-mono font-bold text-verdant-textPrimary hover:underline flex items-center gap-1.5"
            >
              <span>Inspect on Map</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-verdant-bg p-8 border border-verdant-border shadow-sm">
            <div className="lg:col-span-7 space-y-4 text-sm text-verdant-textSecondary font-medium leading-relaxed">
              <p className="font-serif text-2xl text-verdant-textPrimary font-bold leading-snug">
                One of central India's most ecologically intact contiguous Sal forest canopies, facing progressive fragmentation from coal block allocations.
              </p>
              <p>
                {featuredRegion.threatSummary}
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs font-mono text-verdant-textPrimary">
                <div>
                  <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Active Candidates</span>
                  <span className="font-bold text-lg">{featuredRegion.activeAlertsCount} Hotspots</span>
                </div>
                <div className="w-[1px] h-6 bg-verdant-border" />
                <div>
                  <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Estimated Area</span>
                  <span className="font-bold text-lg">{featuredRegion.totalLossHa} ha</span>
                </div>
                <div className="w-[1px] h-6 bg-verdant-border" />
                <div>
                  <span className="text-verdant-textSecondary block text-[10px] font-bold uppercase">Canopy Baseline</span>
                  <span className="font-bold text-lg">{featuredRegion.baselineCanopyCoverPercent}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 aspect-[4/3] bg-verdant-surface overflow-hidden border border-verdant-border relative rounded-xl shadow-md">
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
                alt="Forest corridor in Hasdeo Arand"
                className="w-full h-full object-cover contrast-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow">
                <span>Hasdeo Arand Basin</span>
                <span>Sentinel-2 Optical Pass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Editorial Callout */}
      <section className="py-20 px-6 lg:px-12 bg-verdant-bg">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-verdant-textPrimary font-normal">
            Ready to inspect satellite observations?
          </h2>
          <p className="text-sm text-verdant-textSecondary max-w-xl mx-auto leading-relaxed">
            Navigate the interactive global map, compare seasonal multi-spectral acquisitions, or browse our peer-referenced methodology.
          </p>
          <div className="pt-2 flex justify-center items-center gap-4">
            <Link
              to="/explore"
              className="px-6 py-2.5 rounded-full bg-verdant-dark text-verdant-bg text-xs uppercase tracking-wider font-medium hover:bg-verdant-darkSecondary transition-colors"
            >
              Open Global Explorer
            </Link>
            <Link
              to="/alerts"
              className="px-6 py-2.5 rounded-full border border-verdant-border text-verdant-textPrimary text-xs uppercase tracking-wider font-medium hover:bg-[#EBE7DD] transition-colors"
            >
              View Alerts
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};
