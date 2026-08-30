import React from 'react';
import { AIAnalysisData } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CheckSquare,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AIInsightPanelProps {
  analysis?: AIAnalysisData;
  isLoading?: boolean;
  onAnalyze?: () => void;
}

export function AIInsightPanel({ analysis, isLoading, onAnalyze }: AIInsightPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <div className="h-4 w-32 bg-indigo-500/20 rounded-md" />
        </div>
        <div className="h-16 bg-slate-850/80 rounded-xl" />
        <div className="h-20 bg-slate-850/80 rounded-xl" />
        <div className="h-12 bg-slate-850/80 rounded-xl" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-950/20 p-6 text-center space-y-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Gemini 3.7 Flash Intelligence</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Extract executive summaries, priority scores, action items, and detect spam & security threats.
          </p>
        </div>
        {onAnalyze && (
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Gemini Analysis</span>
          </button>
        )}
      </div>
    );
  }

  const isHighRisk = analysis.spamRisk === 'high' || analysis.phishingRisk === 'high';
  const isMediumRisk = analysis.spamRisk === 'medium' || analysis.phishingRisk === 'medium';

  return (
    <div className="space-y-4">
      {/* Security Advisory Warning if risk detected */}
      {isHighRisk && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-rose-300">Security Warning: High Risk Detected</h5>
              <p className="text-xs text-rose-200/90 mt-1">
                Gemini detected potential phishing or credential harvesting tactics. Do not click links or enter passwords.
              </p>
              {analysis.spamPhishingReasons.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {analysis.spamPhishingReasons.map((r, i) => (
                    <li key={i} className="text-xs text-rose-300/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Intelligence Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4.5 backdrop-blur-xl shadow-xl space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CategoryBadge category={analysis.category} />
            <PriorityBadge priority={analysis.priority} score={analysis.priorityScore} showScore />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px]',
                isHighRisk
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : isMediumRisk
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              )}
            >
              {isHighRisk ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {isHighRisk ? 'Security Risk' : 'Legitimate'}
            </span>
          </div>
        </div>

        {/* Priority Score Meter */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Priority Score
            </span>
            <span className="font-mono text-xs font-bold text-slate-200">{analysis.priorityScore}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                analysis.priorityScore >= 80
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : analysis.priorityScore >= 50
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-slate-600'
              )}
              style={{ width: `${Math.max(5, analysis.priorityScore)}%` }}
            />
          </div>
          {analysis.priorityReason && (
            <p className="mt-1.5 text-xs text-slate-400">{analysis.priorityReason}</p>
          )}
        </div>

        {/* Deadlines Section */}
        {analysis.deadlines && analysis.deadlines.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Deadlines & Timeframes
            </p>
            <div className="space-y-1.5">
              {analysis.deadlines.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="text-amber-200 font-medium">{d.description}</span>
                  {d.dueDate && (
                    <span className="font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                      {d.dueDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {analysis.actionItems && analysis.actionItems.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Action Items
            </p>
            <div className="space-y-1.5">
              {analysis.actionItems.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-750 text-xs text-slate-200 hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Key Entities */}
        {analysis.keyEntities && analysis.keyEntities.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-400" />
              Entities Mentioned
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyEntities.map((entity, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
