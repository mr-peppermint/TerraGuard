import React from 'react';
import { Satellite, Play, ShieldAlert, Sparkles, Layers, Sliders, BarChart3, Database } from 'lucide-react';
import { satelliteService } from '../services/satelliteService';

export type ActiveTab = 'explorer' | 'comparison' | 'alerts' | 'analytics';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onOpenSettings: () => void;
  onOpenValidation: () => void;
  alertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onRunAnalysis,
  isAnalyzing,
  onOpenSettings,
  onOpenValidation,
  alertsCount
}) => {
  const providerStatus = satelliteService.getProviderStatus();

  return (
    <header className="sticky top-0 z-40 bg-[#050605]/90 backdrop-blur-md border-b border-verdant-border px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-lime shadow-glow-lime/20">
            <Satellite className="w-5 h-5 text-verdant-lime" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">VERDANT</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-verdant-lime bg-verdant-lime/10 px-1.5 py-0.5 rounded border border-verdant-lime/30">
                S2-MSI
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-verdant-textDim -mt-0.5">
              FOREST INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-verdant-panel p-1 rounded-full border border-verdant-border">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'explorer'
                ? 'bg-verdant-surface text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-verdant-lime" />
            Explorer
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-verdant-surface text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-verdant-lime" />
            Change Lab
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'alerts'
                ? 'bg-verdant-surface text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-verdant-amber" />
            Alerts
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-verdant-card text-verdant-text">
              {alertsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-verdant-surface text-white border border-verdant-borderLight shadow-sm'
                : 'text-verdant-textMuted hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-verdant-lime" />
            Analytics & Validation
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Provider Status Pill */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-verdant-border bg-verdant-panel hover:border-verdant-borderLight transition-colors"
            title="Configure Copernicus Data Space API or LLM Key"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                providerStatus.mode === 'live' ? 'bg-verdant-emerald animate-pulse' : 'bg-verdant-amber'
              }`}
            />
            <span className="text-verdant-textMuted">{providerStatus.label}</span>
            <Database className="w-3 h-3 text-verdant-textDim ml-0.5" />
          </button>

          {/* Validation Modal Trigger */}
          <button
            onClick={onOpenValidation}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border border-verdant-border bg-verdant-surface hover:text-white text-verdant-textMuted transition-colors"
          >
            <Sparkles className="w-3 h-3 text-verdant-lime" />
            <span>F1: 86.9%</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold text-xs tracking-wide shadow-glow-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2.5 pt-2 border-t border-verdant-border">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-2.5 py-1 rounded-full text-xs ${
            activeTab === 'explorer' ? 'bg-verdant-surface text-verdant-lime' : 'text-verdant-textMuted'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-2.5 py-1 rounded-full text-xs ${
            activeTab === 'comparison' ? 'bg-verdant-surface text-verdant-lime' : 'text-verdant-textMuted'
          }`}
        >
          Change Lab
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-2.5 py-1 rounded-full text-xs ${
            activeTab === 'alerts' ? 'bg-verdant-surface text-verdant-amber' : 'text-verdant-textMuted'
          }`}
        >
          Alerts ({alertsCount})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 rounded-full text-xs ${
            activeTab === 'analytics' ? 'bg-verdant-surface text-verdant-lime' : 'text-verdant-textMuted'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
