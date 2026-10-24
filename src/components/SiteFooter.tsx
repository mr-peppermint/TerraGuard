import React from 'react';
import { Link } from 'react-router-dom';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-verdant-border bg-verdant-bg py-16 px-6 lg:px-12 text-verdant-textSecondary text-xs font-medium">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl tracking-tight text-verdant-textPrimary font-bold">
                Terragaurd
              </span>
              <span className="block text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary mt-0.5">
                Forest Intelligence
              </span>
            </Link>
            <p className="text-xs font-medium leading-relaxed text-verdant-textSecondary max-w-sm">
              Satellite intelligence for understanding forest loss, monitoring canopy shifts, and investigating potential deforestation at a deliberate, human pace.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-verdant-textPrimary block">
              Navigation
            </span>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link to="/explore" className="hover:text-verdant-textPrimary transition-colors">
                  Global Explorer
                </Link>
              </li>
              <li>
                <Link to="/change-detection" className="hover:text-verdant-textPrimary transition-colors">
                  Change Detection Lab
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-verdant-textPrimary transition-colors">
                  Candidate Alerts Index
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-verdant-textPrimary transition-colors">
                  Remote Sensing Method
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-verdant-textPrimary transition-colors">
                  About & Principles
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical & Sensor Details */}
          <div className="md:col-span-4 space-y-3 font-mono text-[11px]">
            <span className="text-[10px] font-bold tracking-widest uppercase text-verdant-textPrimary block font-sans">
              Observation Baseline
            </span>
            <p className="text-verdant-textSecondary leading-relaxed font-semibold">
              Derived from European Space Agency (ESA) Copernicus Sentinel-2 MSI Level-2A surface reflectance data.
            </p>
            <div className="pt-2 text-[10px] text-verdant-textSecondary space-y-0.5 font-semibold">
              <div>Resolution: 10m native pixel (B04 Red, B08 NIR)</div>
              <div>Projection: WGS 84 / Geographic (EPSG:4326)</div>
            </div>
          </div>
        </div>

        {/* Bottom fine line */}
        <div className="pt-8 border-t border-verdant-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono font-semibold">
          <div>
            &copy; {new Date().getFullYear()} Terragaurd. Contains modified Copernicus Sentinel data.
          </div>
          <div className="text-verdant-textSecondary flex items-center gap-4 font-sans text-xs font-bold">
            <span>Quiet, verifiable forest science</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
