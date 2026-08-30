import React from 'react';
import { AICategory } from '../../types';
import { Briefcase, User, DollarSign, Bell, Tag, Flame, ShieldAlert, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CategoryBadgeProps {
  category?: AICategory;
  className?: string;
  onClick?: () => void;
}

export function CategoryBadge({ category = 'General', className, onClick }: CategoryBadgeProps) {
  const configs: Record<AICategory, { label: string; icon: any; styles: string }> = {
    Work: {
      label: 'Work',
      icon: Briefcase,
      styles: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    Personal: {
      label: 'Personal',
      icon: User,
      styles: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    Finance: {
      label: 'Finance',
      icon: DollarSign,
      styles: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    Updates: {
      label: 'Updates',
      icon: Bell,
      styles: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    Promotions: {
      label: 'Promos',
      icon: Tag,
      styles: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    },
    Urgent: {
      label: 'Urgent',
      icon: Flame,
      styles: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    },
    Spam: {
      label: 'Spam',
      icon: ShieldAlert,
      styles: 'bg-red-950/60 text-red-400 border-red-800/60',
    },
    General: {
      label: 'General',
      icon: Mail,
      styles: 'bg-slate-800 text-slate-300 border-slate-700',
    },
  };

  const config = configs[category] || configs.General;
  const Icon = config.icon;

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border select-none transition-all',
        config.styles,
        onClick && 'cursor-pointer hover:brightness-125',
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
