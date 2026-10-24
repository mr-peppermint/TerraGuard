import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass } from 'lucide-react';

interface SiteHeaderProps {
  theme?: 'light' | 'dark';
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ theme = 'light' }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark' || location.pathname === '/explore';

  const navLinks = [
    { label: 'About', path: '/about' },
    { label: 'Explore', path: '/explore' },
    { label: 'Change Lab', path: '/change-detection' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Methodology', path: '/methodology' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isDark
          ? 'bg-verdant-dark/95 border-verdant-borderDark text-verdant-darkText backdrop-blur-md'
          : 'bg-verdant-bg/95 border-verdant-border text-verdant-textPrimary backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-baseline gap-2.5 group">
          <span className="font-serif text-2xl tracking-tight font-bold group-hover:opacity-85 transition-opacity">
            TerraGuard
          </span>
          <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-verdant-textSecondary">
            Forest Intelligence
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs tracking-wider font-semibold transition-colors py-1 ${
                  isActive
                    ? isDark ? 'text-white border-b-2 border-white' : 'text-verdant-textPrimary border-b-2 border-verdant-textPrimary font-bold'
                    : isDark ? 'text-verdant-beige/80 hover:text-white' : 'text-verdant-textSecondary hover:text-verdant-textPrimary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Action */}
        <div className="hidden sm:flex items-center gap-3">

          <Link
            to="/explore"
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-verdant-bg text-verdant-dark hover:bg-verdant-beige'
                : 'bg-verdant-dark text-verdant-bg hover:bg-verdant-darkSecondary'
            }`}
          >
            <Compass className="w-4 h-4 stroke-[2.2]" />
            <span>Open Explorer</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-verdant-textSecondary hover:text-verdant-textPrimary"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-6 border-b space-y-4 ${
            isDark ? 'bg-verdant-dark border-verdant-borderDark' : 'bg-verdant-bg border-verdant-border'
          }`}
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm tracking-wider py-1 text-verdant-textPrimary hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-verdant-border">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2 rounded-full bg-verdant-dark text-verdant-bg text-xs uppercase tracking-wider font-medium"
            >
              Open Explorer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
