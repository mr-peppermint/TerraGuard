import React from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { ScrollReveal } from '../components/ScrollReveal';
import { ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col text-verdant-textPrimary">
      <SiteHeader theme="light" />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16 space-y-20 flex-1 w-full">
        {/* Editorial Heading */}
        <div className="space-y-4 border-b border-verdant-border pb-10">
          <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
            About TerraGuard
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-verdant-textPrimary">
            Independent environmental intelligence.
          </h1>
          <p className="text-base sm:text-lg text-verdant-textSecondary font-medium leading-relaxed max-w-2xl">
            A quiet, scientific platform designed to make satellite remote sensing accessible, verifiable, and transparent for landscape preservation.
          </p>
        </div>

        {/* Narrative Section 1 */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline">
            <div className="md:col-span-4">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary">
                The Problem
              </span>
              <h2 className="font-serif text-2xl font-bold text-verdant-textPrimary mt-2">
                Unseen fragmentation.
              </h2>
            </div>
            <div className="md:col-span-8 space-y-4 text-sm sm:text-base text-verdant-textSecondary font-medium leading-relaxed">
              <p>
                Forest clearings rarely start with clear-cutting an entire district. They begin with exploratory roads, artisanal pits, unpermitted mining haul tracks, and gradual peripheral incursions. On the ground, dense vegetation conceals changes occurring only hundreds of meters beyond patrolled roads.
              </p>
              <p>
                By the time official state inventories are published—often years after the initial disturbance—the primary canopy has collapsed, and critical wildlife corridors are permanently fractured.
              </p>
            </div>
          </div>
        </section>

        {/* Striking Image with Generous Whitespace */}
        <ScrollReveal className="space-y-3">
          <div className="relative aspect-[16/9] w-full bg-verdant-dark overflow-hidden border border-verdant-border">
            <img
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80"
              alt="Misty temperate rainforest canopy"
              className="w-full h-full object-cover contrast-105 opacity-90"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-verdant-textSecondary pt-1">
            <span>Primary Continuous Crown Cover</span>
            <span>Western Ghats Montane Shola Forest</span>
          </div>
        </ScrollReveal>

        {/* Narrative Section 2: The Philosophy */}
        <section className="space-y-8 border-t border-verdant-border pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline">
            <div className="md:col-span-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-textSecondary">
                Our Philosophy
              </span>
              <h2 className="font-serif text-2xl text-verdant-textPrimary font-normal mt-2">
                Quiet, explainable science.
              </h2>
            </div>
            <div className="md:col-span-8 space-y-4 text-sm sm:text-base text-verdant-textSecondary leading-relaxed">
              <p>
                Most modern geospatial software presents overwhelming dashboards: dozens of neon charts, flashing alerts, and uncalibrated artificial intelligence scores that cannot be audited.
              </p>
              <p>
                VERDANT was built with an opposite philosophy. We believe conservationists, journalists, and researchers need calm, editorial clarity. Every candidate alert is anchored in physical reflectance bands (Red, NIR, SWIR), accompanied by cloud-quality indicators, and explicitly separated from legal confirmation until verified by human observers.
              </p>
              <p>
                We do not invent confidence numbers. We present the spectral facts as recorded by the satellite, leaving human expertise at the center of environmental action.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-verdant-border pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-normal text-verdant-textPrimary">
              Explore the monitoring landscapes
            </h3>
            <p className="text-xs text-verdant-textSecondary mt-0.5">
              Navigate interactive Sentinel-2 observations across India, Brazil, Indonesia, and Ghana.
            </p>
          </div>

          <Link
            to="/explore"
            className="px-6 py-2.5 rounded-full bg-verdant-dark text-verdant-bg text-xs uppercase tracking-wider font-medium hover:bg-verdant-darkSecondary transition-colors flex items-center gap-1.5"
          >
            <span>Open Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};
