import React, { useState } from 'react';
import { CandidateAlert, AlertSeverity } from '../types/geospatial';
import { Search, Filter, ShieldAlert, ArrowUpDown, ChevronRight, Download } from 'lucide-react';

interface AlertListProps {
  alerts: CandidateAlert[];
  selectedAlert: CandidateAlert | null;
  onSelectAlert: (alert: CandidateAlert) => void;
  onExportCsv: () => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  selectedAlert,
  onSelectAlert,
  onExportCsv
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'area' | 'score' | 'delta'>('area');

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.regionName.toLowerCase().includes(search.toLowerCase()) ||
      a.driverHypothesis.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'area') return b.affectedAreaHa - a.affectedAreaHa;
    if (sortBy === 'score') return b.screeningScore - a.screeningScore;
    if (sortBy === 'delta') return a.ndviDelta - b.ndviDelta; // more negative first
    return 0;
  });

  const getSeverityStyle = (s: string) => {
    switch (s) {
      case 'critical':
        return 'text-verdant-red bg-verdant-red/10 border-verdant-red/30';
      case 'high':
        return 'text-verdant-amber bg-verdant-amber/10 border-verdant-amber/30';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
    }
  };

  return (
    <div className="bg-verdant-panel rounded-2xl border border-verdant-border p-4 lg:p-6 space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Candidate Alerts Register</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-verdant-surface border border-verdant-border text-verdant-lime">
              {sorted.length} Records
            </span>
          </div>
          <p className="text-xs text-verdant-textMuted mt-0.5">
            Georeferenced candidate forest loss polygons detected across comparison window.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-verdant-border text-xs font-mono text-verdant-textMuted hover:text-white hover:bg-verdant-surface transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-verdant-lime" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-verdant-surface border border-verdant-border text-xs font-mono">
          <Search className="w-4 h-4 text-verdant-textDim" />
          <input
            type="text"
            placeholder="Search by ID, region, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-verdant-textDim"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-verdant-surface p-1 rounded-xl border border-verdant-border text-xs font-mono">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              severityFilter === 'all' ? 'bg-verdant-panel text-white' : 'text-verdant-textDim hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              severityFilter === 'critical' ? 'bg-verdant-red/20 text-verdant-red' : 'text-verdant-textDim'
            }`}
          >
            Crit
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              severityFilter === 'high' ? 'bg-verdant-amber/20 text-verdant-amber' : 'text-verdant-textDim'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setSeverityFilter('moderate')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              severityFilter === 'moderate' ? 'bg-yellow-400/20 text-yellow-400' : 'text-verdant-textDim'
            }`}
          >
            Mod
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-verdant-surface border border-verdant-border text-xs font-mono">
          <span className="text-verdant-textDim flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-white outline-none cursor-pointer"
          >
            <option value="area" className="bg-verdant-panel">Area (Largest)</option>
            <option value="score" className="bg-verdant-panel">Screening Score</option>
            <option value="delta" className="bg-verdant-panel">dNDVI Decline</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto rounded-xl border border-verdant-border">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-verdant-surface/80 border-b border-verdant-border text-verdant-textDim font-mono text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4">Alert ID & Region</th>
              <th className="py-3 px-3">Driver Hypothesis</th>
              <th className="py-3 px-3">Area (ha)</th>
              <th className="py-3 px-3">dNDVI</th>
              <th className="py-3 px-3">Screening Score</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-verdant-border/60">
            {sorted.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-verdant-lime/10 border-l-2 border-verdant-lime'
                      : 'hover:bg-verdant-surface/60'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-white">{alert.id}</div>
                    <div className="text-[11px] text-verdant-textDim">
                      {alert.regionName} • {alert.country}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-verdant-text font-medium">{alert.driverHypothesis}</span>
                    <span className="text-[10px] font-mono text-verdant-textDim block">
                      {alert.laterDate}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-verdant-lime">
                    {alert.affectedAreaHa} ha
                  </td>

                  <td className="py-3 px-3 font-mono text-verdant-red font-semibold">
                    {alert.ndviDelta.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <span className="text-white font-medium">{alert.screeningScore}</span>
                    <span className="text-verdant-textDim text-[10px]">/100</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getSeverityStyle(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[11px] text-verdant-lime">
                    <span className="inline-flex items-center gap-1 hover:underline">
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
