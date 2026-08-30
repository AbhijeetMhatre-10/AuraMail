import React, { useState } from 'react';
import { EmailItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { AISummaryCard } from '../ai/AISummaryCard';
import { ExplainEmailPanel } from '../ai/ExplainEmailPanel';
import { PriorityBadge } from '../ai/PriorityBadge';
import { CategoryBadge } from '../ai/CategoryBadge';
import { useCompose } from '../../context/ComposeContext';
import { useToast } from '../ui/Toast';
import { aiApi } from '../../services/api/ai.api';
import { formatEmailDate, formatRelativeTime } from '../../lib/utils';
import DOMPurify from 'dompurify';
import {
  Reply,
  ReplyAll,
  Star,
  Trash2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmailMessageProps {
  email: EmailItem;
  isLatest?: boolean;
  onStarToggle?: () => void;
  onDelete?: () => void;
}

export function EmailMessage({ email, isLatest = true, onStarToggle, onDelete }: EmailMessageProps) {
  const { openCompose } = useCompose();
  const { success, error } = useToast();

  const [isExpanded, setIsExpanded] = useState(isLatest);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(email.aiAnalysis ? {
    summary: email.aiAnalysis.summary,
    keyPoints: email.aiAnalysis.actionItems,
    suggestedQuickReplies: email.aiAnalysis.suggestedQuickReplies,
  } : null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [showExplain, setShowExplain] = useState(false);
  const [explainData, setExplainData] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleSummarize = async () => {
    if (summaryData) {
      setShowSummary(!showSummary);
      return;
    }

    setIsSummarizing(true);
    setShowSummary(true);
    try {
      const res = await aiApi.summarize(email.id || email._id!);
      setSummaryData(res);
      success('AI summary generated');
    } catch (err: any) {
      error('Failed to summarize', err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExplain = async () => {
    if (explainData) {
      setShowExplain(!showExplain);
      return;
    }

    setIsExplaining(true);
    setShowExplain(true);
    try {
      const res = await aiApi.explain(email.id || email._id!);
      setExplainData(res);
      success('Email explained in plain English');
    } catch (err: any) {
      error('Failed to explain email', err.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleReply = (replyAll = false) => {
    openCompose({
      to: [email.from.email],
      cc: replyAll && email.cc ? email.cc.map((c) => c.email) : undefined,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      inReplyToEmailId: email.id || email._id,
      threadId: email.threadId || email.gmailThreadId,
      isReply: true,
      replyAll,
    });
  };

  // Sanitize HTML safely
  const sanitizedHtml = DOMPurify.sanitize(email.bodyHtml || email.bodyText.replace(/\n/g, '<br/>'), {
    USE_PROFILES: { html: true },
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden transition-all">
      {/* Message Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/40 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={email.from.name || email.from.email}
            email={email.from.email}
            size="md"
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">{email.from.name || email.from.email}</span>
              <span className="text-xs text-slate-400 truncate hidden sm:inline">&lt;{email.from.email}&gt;</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">
              to {email.to.map((t) => t.name || t.email).join(', ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="text-xs text-slate-400" title={formatEmailDate(email.receivedAt)}>
            {formatRelativeTime(email.receivedAt)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStarToggle?.();
            }}
            className={cn('text-slate-500 hover:text-amber-400 transition-colors', email.isStarred && 'text-amber-400')}
          >
            <Star className={cn('w-4 h-4', email.isStarred && 'fill-amber-400')} />
          </button>

          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Message Content */}
      {isExpanded && (
        <div className="px-4 pb-5 pt-1 space-y-4 border-t border-slate-800/60">
          {/* AI Quick Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <button
              type="button"
              onClick={handleSummarize}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                showSummary
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showSummary ? 'Hide Summary' : 'AI Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleExplain}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                showExplain
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>{showExplain ? 'Hide Explanation' : 'Explain Email'}</span>
            </button>
          </div>

          {/* AI Summary Card Drawer */}
          {showSummary && (
            <AISummaryCard
              summary={summaryData?.summary || 'Generating summary...'}
              keyPoints={summaryData?.keyPoints}
              suggestedQuickReplies={summaryData?.suggestedQuickReplies}
              emailId={email.id || email._id}
              senderEmail={email.from.email}
              subject={email.subject}
            />
          )}

          {/* Explain This Email Drawer */}
          {showExplain && (
            <ExplainEmailPanel explanation={explainData} isLoading={isExplaining} />
          )}

          {/* Rendered HTML Email Body */}
          <div
            className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 font-sans"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {/* Action Buttons: Reply, Reply All, Delete */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReply(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Reply className="w-3.5 h-3.5 text-slate-400" />
                <span>Reply</span>
              </button>

              <button
                type="button"
                onClick={() => handleReply(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <ReplyAll className="w-3.5 h-3.5 text-slate-400" />
                <span>Reply All</span>
              </button>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
