import React from 'react';
import { Sparkles, CheckCircle, MessageSquare, Copy, CornerDownLeft } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useCompose } from '../../context/ComposeContext';
import { Button } from '../ui/Button';

export interface AISummaryCardProps {
  summary: string;
  keyPoints?: string[];
  suggestedQuickReplies?: string[];
  emailId?: string;
  senderEmail?: string;
  subject?: string;
}

export function AISummaryCard({
  summary,
  keyPoints = [],
  suggestedQuickReplies = [],
  emailId,
  senderEmail,
  subject,
}: AISummaryCardProps) {
  const { success } = useToast();
  const { openCompose } = useCompose();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    success('Copied summary to clipboard');
  };

  const handleUseReply = (replyText: string) => {
    openCompose({
      to: senderEmail ? [senderEmail] : [],
      subject: subject ? (subject.startsWith('Re:') ? subject : `Re: ${subject}`) : '',
      body: replyText,
      inReplyToEmailId: emailId,
      isReply: true,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-4.5 backdrop-blur-xl shadow-xl shadow-indigo-950/30">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/15">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Gemini AI Summary
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Advisory
              </span>
            </h4>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          title="Copy summary"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>
      </div>

      {/* Summary Text */}
      <div className="mt-3.5">
        <p className="text-sm leading-relaxed text-slate-200">{summary}</p>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Key Takeaways</p>
          <ul className="space-y-1.5">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Quick Replies */}
      {suggestedQuickReplies.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            Quick AI Replies
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleUseReply(reply)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:text-white"
              >
                <span>{reply}</span>
                <CornerDownLeft className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
