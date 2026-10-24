import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositiveChange: boolean; // positive in context of forest loss or measurement
    label: string;
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  highlight = false
}) => {
  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-verdant-panel border-verdant-lime/40 shadow-glow-lime/10'
          : 'bg-verdant-panel/80 border-verdant-border hover:border-verdant-borderLight'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-verdant-textDim">
          {label}
        </span>
        {Icon && <Icon className={`w-4 h-4 ${highlight ? 'text-verdant-lime' : 'text-verdant-textMuted'}`} />}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-verdant-lime">
            {unit}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 pt-2 border-t border-verdant-border/60 flex items-center justify-between text-[11px] font-mono">
          {subtext && <span className="text-verdant-textDim">{subtext}</span>}
          {trend && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                trend.isPositiveChange
                  ? 'text-verdant-emerald bg-verdant-emerald/10'
                  : 'text-verdant-red bg-verdant-red/10'
              }`}
            >
              {trend.value} {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
