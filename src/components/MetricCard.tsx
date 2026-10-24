import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black font-mono">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-600 font-mono">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
