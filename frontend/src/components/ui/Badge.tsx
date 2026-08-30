import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'ai';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/80',
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    secondary: 'bg-slate-750 text-slate-200 border-slate-650',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    destructive: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    outline: 'bg-transparent text-slate-400 border-slate-700',
    ai: 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/10',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
