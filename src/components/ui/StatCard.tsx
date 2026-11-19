import React from 'react';
import { cn, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changePeriod?: string;
  icon?: React.ElementType;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'green' | 'red' | 'blue' | 'amber' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon: Icon,
  subtitle,
  badgeText,
  badgeVariant = 'green',
  trend,
  className,
}) => {
  const isPositive = change !== undefined ? change > 0 : trend === 'up';
  const isNegative = change !== undefined ? change < 0 : trend === 'down';

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 relative overflow-hidden group',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-100">
          {value}
        </div>

        {badgeText && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded border',
            badgeVariant === 'green' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            badgeVariant === 'red' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            badgeVariant === 'blue' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            badgeVariant === 'amber' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            badgeVariant === 'purple' && 'bg-purple-500/10 text-purple-500 border-purple-500/20'
          )}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        {change !== undefined && (
          <div className="flex items-center gap-1 font-medium">
            {isPositive && (
              <span className="flex items-center text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {formatPercent(change)}
              </span>
            )}
            {isNegative && (
              <span className="flex items-center text-rose-400">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {formatPercent(change)}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="flex items-center text-slate-400">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                0.00%
              </span>
            )}
            <span className="text-slate-500 font-sans ml-1">{changePeriod}</span>
          </div>
        )}

        {subtitle && !change && (
          <span className="text-slate-400 truncate">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
