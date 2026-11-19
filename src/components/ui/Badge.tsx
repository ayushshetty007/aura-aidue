import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className
}) => {
  const variantStyles = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
