import React from 'react';
import { CandidateAlert, ForestRegion } from '../types/geospatial';
import { useValidation } from '../data/validationData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { Download, ShieldCheck, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface AnalyticsPanelProps {
  alerts: CandidateAlert[];
  regions: ForestRegion[];
  onExportCsv: () => void;
  onOpenValidation: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = (props) => {
  const { study: VALIDATION_STUDY, measured } = useValidation();
  return <AnalyticsPanelInner {...props} VALIDATION_STUDY={VALIDATION_STUDY} measured={measured} />;
};

const AnalyticsPanelInner: React.FC<AnalyticsPanelProps & { VALIDATION_STUDY: ReturnType<typeof useValidation>['study']; measured: boolean }> = ({
  VALIDATION_STUDY,
  measured,
  alerts,
  regions,
  onExportCsv,
  onOpenValidation
}) => {
  // Aggregate area by region
  const regionData = regions.map((r) => {
    const regionAlerts = alerts.filter((a) => a.regionId === r.id);
    const totalHa = regionAlerts.reduce((sum, a) => sum + a.affectedAreaHa, 0);
    return {
      name: r.name.split(' (')[0],
      areaHa: Number(totalHa.toFixed(1)),
      count: regionAlerts.length
    };
  });

  // Severity breakdown
  const severityCounts = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    moderate: alerts.filter((a) => a.severity === 'moderate').length,
    low: alerts.filter((a) => a.severity === 'low').length,
  };

  const severityPieData = [
    { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
    { name: 'High', value: severityCounts.high, color: '#f59e0b' },
    { name: 'Moderate', value: severityCounts.moderate, color: '#eab308' },
    { name: 'Watch', value: severityCounts.low, color: '#38bdf8' }
  ].filter(d => d.value > 0);

  // Temporal trajectory simulation across 2024
  const trajectoryData = [
    { month: 'Jan', lossHa: 42.1 },
    { month: 'Mar', lossHa: 78.4 },
    { month: 'May', lossHa: 135.2 },
    { month: 'Jul', lossHa: 210.8 },
    { month: 'Sep', lossHa: 384.6 },
    { month: 'Nov', lossHa: 586.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-verdant-panel p-6 rounded-2xl border border-verdant-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-verdant-lime tracking-widest">
              GEOSPATIAL INTELLIGENCE & AUDIT
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verdant-surface border border-verdant-border text-verdant-textMuted">
              Sentinel-2 MSI Level-2A
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Canopy Loss Analytics & Model Validation
          </h2>
          <p className="text-xs text-verdant-textMuted mt-0.5">
            Transparent metrics distinguishing screening detections from ground-validated reference truth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenValidation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-verdant-surface border border-verdant-border text-xs font-mono text-white hover:border-verdant-lime transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-verdant-lime" />
            <span>Validation Study</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-verdant-lime hover:bg-verdant-limeHover active:scale-95 text-black font-semibold text-xs transition-all shadow-glow-lime"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Grid of Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Loss by Region */}
        <div className="lg:col-span-2 bg-verdant-panel p-6 rounded-2xl border border-verdant-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Estimated Potentially Affected Area by Region</h3>
              <p className="text-[11px] font-mono text-verdant-textDim mt-0.5">
                Total sum of candidate polygons (hectares)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2622" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0e0c',
                    borderColor: '#1f2622',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#D5FF4F' }}
                />
                <Bar dataKey="areaHa" fill="#D5FF4F" radius={[6, 6, 0, 0]} name="Area (ha)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution */}
        <div className="bg-verdant-panel p-6 rounded-2xl border border-verdant-border space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Alert Severity Distribution</h3>
            <p className="text-[11px] font-mono text-verdant-textDim mt-0.5">
              Breakdown by screening urgency
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0e0c',
                    borderColor: '#1f2622',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {severityPieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-verdant-textMuted">{d.name}:</span>
                <span className="text-white font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Benchmark Summary Card */}
      <div className="bg-gradient-to-r from-verdant-panel to-verdant-surface p-6 rounded-2xl border border-verdant-borderLight space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-verdant-lime/20 border border-verdant-lime/40 flex items-center justify-center text-verdant-lime">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Out-of-Sample Reference Validation Performance
              </h3>
              <p className="text-xs text-verdant-textMuted">
                {measured ? 'Measured on a held-out area against Hansen GFC labels.' : 'PLACEHOLDER numbers - not measured yet (run backend/heldout_validation.py).'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-verdant-lime/10 text-verdant-lime border border-verdant-lime/30">
            F1 Score: {(VALIDATION_STUDY.f1Score * 100).toFixed(1)}%
          </span>
        </div>

        {/* Metric Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-verdant-bg/70 p-3 rounded-xl border border-verdant-border">
            <span className="text-verdant-textDim text-[10px] uppercase block">Precision</span>
            <span className="text-xl font-bold text-verdant-lime font-sans mt-0.5 block">
              {(VALIDATION_STUDY.precision * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-verdant-textDim">True loss vs flagged</span>
          </div>

          <div className="bg-verdant-bg/70 p-3 rounded-xl border border-verdant-border">
            <span className="text-verdant-textDim text-[10px] uppercase block">Recall (Sensitivity)</span>
            <span className="text-xl font-bold text-white font-sans mt-0.5 block">
              {(VALIDATION_STUDY.recall * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-verdant-textDim">Actual loss detected</span>
          </div>

          <div className="bg-verdant-bg/70 p-3 rounded-xl border border-verdant-border">
            <span className="text-verdant-textDim text-[10px] uppercase block">False Alarm Rate</span>
            <span className="text-xl font-bold text-verdant-amber font-sans mt-0.5 block">
              {(VALIDATION_STUDY.falseAlarmRate * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-verdant-textDim">Seasonal & cloud edge</span>
          </div>

          <div className="bg-verdant-bg/70 p-3 rounded-xl border border-verdant-border">
            <span className="text-verdant-textDim text-[10px] uppercase block">Test Area Size</span>
            <span className="text-xl font-bold text-white font-sans mt-0.5 block">
              125,000 <span className="text-xs font-mono text-verdant-textDim">ha</span>
            </span>
            <span className="text-[10px] text-verdant-textDim">Holdout Deciduous Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
