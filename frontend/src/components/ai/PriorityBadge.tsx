import React from 'react';
import { AIPriority } from '../../types';
import { AlertTriangle, Clock, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PriorityBadgeProps {
  priority?: AIPriority;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export function PriorityBadge({ priority = 'medium', score, showScore = false, className }: PriorityBadgeProps) {
  const configs = {
    urgent: {
      label: 'Urgent',
      icon: AlertTriangle,
      styles: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    },
    high: {
      label: 'High',
      icon: ArrowUpRight,
      styles: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
    },
    medium: {
      label: 'Medium',
      icon: Clock,
      styles: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    low: {
      label: 'Low',
      icon: Minus,
      styles: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  };

  const config = configs[priority] || configs.medium;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border select-none transition-all',
        config.styles,
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono text-[10px]">({score})</span>
      )}
    </span>
  );
}
