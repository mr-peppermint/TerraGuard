import React, { useState } from 'react';
import { satelliteService, SentinelCredentials } from '../services/satelliteService';
import { explanationService } from '../services/explanationService';
import { googleMapsService } from '../services/googleMapsService';
import { Database, Key, CheckCircle, ExternalLink, Shield, MapPin } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated
}) => {
  const currentCreds = satelliteService.getCredentials();
  const [clientId, setClientId] = useState(currentCreds.clientId || '');
  const [clientSecret, setClientSecret] = useState(currentCreds.clientSecret || '');
  const [copernicusToken, setCopernicusToken] = useState(currentCreds.copernicusToken || '');
  const [googleMapsKey, setGoogleMapsKey] = useState(googleMapsService.getApiKey() || '');
  const [aiApiKey, setAiApiKey] = useState(explanationService.getApiKey() || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    satelliteService.setCredentials({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      copernicusToken: copernicusToken.trim()
    });

    googleMapsService.setApiKey(googleMapsKey.trim());
    explanationService.setApiKey(aiApiKey.trim());

    setSavedSuccess(true);
    onCredentialsUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const isLive = satelliteService.isLiveConfigured();
  const isGoogleMapsLive = googleMapsService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-verdant-panel border border-verdant-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-verdant-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-lime">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Satellite & AI Configuration</h3>
              <p className="text-xs font-mono text-verdant-textDim">
                Live Sentinel-2 Data Access & Optional Gemini Key
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-verdant-surface border border-verdant-border flex items-center justify-center text-verdant-textMuted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {/* Status Banner */}
          <div className="p-3.5 rounded-xl bg-verdant-surface border border-verdant-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-verdant-textDim block">Current Mode</span>
              <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isGoogleMapsLive ? 'bg-verdant-emerald animate-pulse' : 'bg-verdant-amber'
                  }`}
                />
                {isGoogleMapsLive ? 'Google Maps Satellite API Active' : 'Fallback / Demo Basemap'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-verdant-textDim">
              {isGoogleMapsLive ? 'Live High-Res Imagery' : 'Static Fallback'}
            </span>
          </div>

          {/* Google Maps Platform API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono uppercase text-verdant-textDim text-[10px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-verdant-lime" />
                Google Maps Platform API Key (Satellite & Geocoding)
              </label>
              <span className="text-[10px] font-mono text-verdant-textDim">
                {isGoogleMapsLive ? 'Active (from .env)' : 'Optional'}
              </span>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={googleMapsKey}
              onChange={(e) => setGoogleMapsKey(e.target.value)}
              className="w-full bg-verdant-surface border border-verdant-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-verdant-lime outline-none"
            />
            <p className="text-[10px] text-verdant-textDim">
              Powers real-time Google Maps satellite/hybrid tiles and worldwide forest search.
            </p>
          </div>

          {/* Sentinel Hub / Copernicus API credentials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono uppercase text-verdant-textDim text-[10px]">
                Copernicus Data Space / Sentinel Hub Client ID
              </label>
              <a
                href="https://dataspace.copernicus.eu/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-verdant-lime hover:underline flex items-center gap-1"
              >
                Register free <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              placeholder="e.g. 8f4a2b91-..."
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-verdant-surface border border-verdant-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-verdant-lime outline-none"
            />

            <label className="font-mono uppercase text-verdant-textDim text-[10px] block">
              Sentinel Hub Client Secret
            </label>
            <input
              type="password"
              placeholder="Client secret key"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full bg-verdant-surface border border-verdant-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-verdant-lime outline-none"
            />
          </div>

          {/* Optional Gemini AI API Key */}
          <div className="pt-3 border-t border-verdant-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono uppercase text-verdant-textDim text-[10px] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-verdant-lime" />
                Optional Gemini API Key (for LLM Explanation)
              </label>
              <span className="text-[10px] font-mono text-verdant-textDim">Works without key</span>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              className="w-full bg-verdant-surface border border-verdant-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-verdant-lime outline-none"
            />
            <p className="text-[10px] text-verdant-textDim">
              If left blank, the application will use the built-in deterministic remote-sensing rule engine.
            </p>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 text-[10px] font-mono text-verdant-textDim pt-2">
            <Shield className="w-3.5 h-3.5 text-verdant-lime shrink-0 mt-0.5" />
            <span>Credentials are kept in browser memory and are never transmitted to external servers.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-verdant-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full border border-verdant-border text-verdant-textMuted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold shadow-glow-lime transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
