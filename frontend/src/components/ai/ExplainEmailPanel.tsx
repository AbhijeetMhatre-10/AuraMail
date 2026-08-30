import React from 'react';
import { HelpCircle, Lightbulb, UserCheck, ArrowRightCircle, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ExplainEmailResult {
  overview: string;
  senderIntent: string;
  keyRequests: string[];
  deadlineOrTimeSensitivity: string;
  jargonOrTerms: { term: string; explanation: string }[];
  suggestedNextSteps: string[];
}

export interface ExplainEmailPanelProps {
  explanation?: ExplainEmailResult | null;
  isLoading?: boolean;
  onExplainAgain?: () => void;
}

export function ExplainEmailPanel({ explanation, isLoading, onExplainAgain }: ExplainEmailPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-indigo-500/20 rounded-md" />
        <div className="h-16 bg-slate-800/60 rounded-xl" />
        <div className="h-20 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900/90 p-5 backdrop-blur-xl shadow-xl shadow-indigo-950/20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Explain This Email</h4>
            <p className="text-[11px] text-indigo-300">Plain English breakdown by Gemini</p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What this actually means</p>
        <p className="text-sm leading-relaxed text-slate-100 bg-slate-800/50 p-3 rounded-xl border border-slate-750">
          {explanation.overview}
        </p>
      </div>

      {/* Sender Intent */}
      {explanation.senderIntent && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            Sender's Goal / Intent
          </p>
          <p className="text-xs text-slate-300 bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-xl">
            {explanation.senderIntent}
          </p>
        </div>
      )}

      {/* Jargon / Terms decoded */}
      {explanation.jargonOrTerms && explanation.jargonOrTerms.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Jargon / Terms Decoded
          </p>
          <div className="space-y-1.5">
            {explanation.jargonOrTerms.map((j, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-750 text-xs">
                <span className="font-semibold text-cyan-300">{j.term}: </span>
                <span className="text-slate-300">{j.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Next Steps */}
      {explanation.suggestedNextSteps && explanation.suggestedNextSteps.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-400" />
            Recommended Next Actions
          </p>
          <ul className="space-y-1">
            {explanation.suggestedNextSteps.map((step, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="font-bold text-emerald-400">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
