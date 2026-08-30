import React from 'react';
import { Inbox, Sparkles, Search, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full max-w-md mx-auto select-none">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 shadow-xl mb-4">
        <Icon className="w-8 h-8 text-indigo-400/80" />
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      {description && <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
