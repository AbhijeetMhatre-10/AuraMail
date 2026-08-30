import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full max-w-md mx-auto">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-400 shadow-xl mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      <p className="mt-1.5 text-xs text-rose-300/90 leading-relaxed bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 w-full mt-3">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
