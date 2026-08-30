import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../services/api/activity.api';
import { EmailActivityItem } from '../types';
import { formatEmailDate, formatRelativeTime } from '../lib/utils';
import {
  Activity,
  Sparkles,
  Send,
  Reply,
  Star,
  Archive,
  Trash2,
  Mail,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function ActivityPage() {
  const { data: activities, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityApi.getActivity(60),
  });

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'ai_summarize':
      case 'ai_reply':
      case 'ai_classify':
      case 'ai_rewrite':
      case 'ai_explain':
      case 'ai_smart_search':
        return { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' };
      case 'send':
      case 'reply':
      case 'reply_all':
        return { icon: Send, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
      case 'star':
      case 'unstar':
        return { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
      case 'archive':
        return { icon: Archive, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' };
      case 'delete':
        return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };
      default:
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' };
    }
  };

  const list = activities || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Activity & AI Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit trail of all email events, syncs, and Gemini AI operations.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={(error as any)?.message || 'Failed to load activity'} onRetry={refetch} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity recorded yet"
          description="Actions performed in your mailbox and Gemini AI operations will be logged here."
        />
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {list.map((act) => {
            const config = getActionConfig(act.action);
            const Icon = config.icon;

            return (
              <div key={act.id || act._id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-[35px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-md ${config.bg}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>

                {/* Content Card */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/80 p-4 backdrop-blur-md shadow-md transition-all group-hover:border-slate-700/80">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-semibold text-slate-100">{act.title}</p>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>

                  {act.details && Object.keys(act.details).length > 0 && (
                    <div className="mt-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {Object.entries(act.details).map(([key, val]) => (
                        <div key={key} className="flex items-start gap-1">
                          <span className="font-medium text-slate-300 capitalize">{key}:</span>
                          <span className="truncate text-slate-400">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
