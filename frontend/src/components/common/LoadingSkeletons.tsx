import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function EmailListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-800/60">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3 animate-pulse">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
          <Skeleton className="h-3 w-12 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Skeleton className="h-6 w-1/2 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
