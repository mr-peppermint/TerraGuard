import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { DEMO_ALERTS } from '../data/demoAlerts';
import { DEMO_REGIONS } from '../data/demoRegions';
import { CandidateAlert } from '../types/geospatial';
import { Search, Download, ArrowRight, Filter, MapPin } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAlerts = DEMO_ALERTS.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.regionName.toLowerCase().includes(search.toLowerCase()) ||
      a.driverHypothesis.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = selectedRegionFilter === 'all' || a.regionId === selectedRegionFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleExportCsv = () => {
    const headers = [
      'alert_id',
      'region_name',
      'country',
      'latitude',
      'longitude',
      'baseline_date',
      'monitoring_date',
      'affected_area_ha',
      'ndvi_delta',
      'screening_score',
      'driver_hypothesis',
      'status'
    ];

    const rows = DEMO_ALERTS.map((a) => [
      a.id,
      `"${a.regionName}"`,
      a.country,
      a.coordinates[1],
      a.coordinates[0],
      a.earlierDate,
      a.laterDate,
      a.affectedAreaHa,
      a.ndviDelta,
      a.screeningScore,
      `"${a.driverHypothesis}"`,
      `"${a.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verdant-alerts-index-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-verdant-bg flex flex-col text-verdant-textPrimary">
      <SiteHeader theme="light" />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-10 flex-1 w-full">
        {/* Page Title & Context */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-verdant-border pb-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold tracking-ultra uppercase text-verdant-textSecondary block">
              Candidate Register
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-verdant-textPrimary">
              Forest disturbance alerts.
            </h1>
            <p className="text-sm sm:text-base text-verdant-textSecondary font-medium max-w-xl leading-relaxed">
              Georeferenced candidate canopy change events flagged by Sentinel-2 bi-temporal differential analysis.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 rounded-full border border-verdant-border text-xs font-mono font-bold text-verdant-textPrimary hover:bg-[#EBE7DD] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Minimal Unobtrusive Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs">
          {/* Search */}
          <div className="sm:col-span-5 flex items-center gap-2 border-b border-verdant-border py-1.5">
            <Search className="w-3.5 h-3.5 text-verdant-textSecondary" />
            <input
              type="text"
              placeholder="Filter by alert ID, landscape, or driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-verdant-textSecondary"
            />
          </div>

          {/* Region filter */}
          <div className="sm:col-span-4 flex items-center gap-2 border-b border-verdant-border py-1.5">
            <span className="text-[10px] font-mono uppercase text-verdant-textSecondary">Region:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer w-full"
            >
              <option value="all">All Monitoring Landscapes</option>
              {DEMO_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="sm:col-span-3 flex items-center gap-2 border-b border-verdant-border py-1.5">
            <span className="text-[10px] font-mono uppercase text-verdant-textSecondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer w-full"
            >
              <option value="all">All Candidate Records</option>
              <option value="Candidate — needs verification">Candidate — needs verification</option>
              <option value="Under Active Investigation">Under Investigation</option>
            </select>
          </div>
        </div>

        {/* Clean Minimal Table */}
        <div className="overflow-x-auto border-t border-verdant-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-verdant-border text-[11px] font-mono font-bold tracking-widest uppercase text-verdant-textSecondary">
                <th className="py-4">Alert ID</th>
                <th className="py-4">Landscape & Country</th>
                <th className="py-4">Observation Window</th>
                <th className="py-4">Area (ha)</th>
                <th className="py-4">Screening Score</th>
                <th className="py-4">3-Yr Risk Forecast</th>
                <th className="py-4">Review Status</th>
                <th className="py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-verdant-border font-medium">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                  className="hover:bg-[#EBE7DD]/80 cursor-pointer transition-colors group"
                >
                  <td className="py-4 font-mono font-bold text-verdant-textPrimary group-hover:text-black">
                    {alert.id}
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-verdant-textPrimary block">{alert.regionName}</span>
                    <span className="text-[11px] text-verdant-textSecondary font-semibold">{alert.country}</span>
                  </td>
                  <td className="py-4 font-mono text-verdant-textSecondary text-[11px]">
                    {alert.earlierDate} → {alert.laterDate}
                  </td>
                  <td className="py-4 font-mono font-bold text-verdant-textPrimary">
                    {alert.affectedAreaHa} ha
                  </td>
                  <td className="py-4">
                    <span className="font-mono font-bold text-verdant-textPrimary">
                      {alert.screeningScore}/100
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-verdant-alertHigh bg-verdant-alertHigh/10 border border-verdant-alertHigh/30 px-2 py-0.5 rounded-full">
                      <span>↑ +{(alert.affectedAreaHa * 0.45).toFixed(0)} ha expansion</span>
                    </span>
                  </td>
                  <td className="py-4 font-mono text-[11px]">
                    <span className="text-verdant-sand font-bold">Candidate</span>
                  </td>
                  <td className="py-4 text-right">
                    <ArrowRight className="w-4 h-4 ml-auto text-verdant-textSecondary group-hover:text-verdant-textPrimary transition-transform group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="py-16 text-center text-xs text-verdant-textSecondary font-mono">
            No candidate alerts matching the selected filters.
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};
