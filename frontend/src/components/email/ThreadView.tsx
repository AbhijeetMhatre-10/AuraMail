import React, { useState } from 'react';
import { EmailItem, ThreadConversation } from '../../types';
import { EmailMessage } from './EmailMessage';
import { AIInsightPanel } from '../ai/AIInsightPanel';
import { useCompose } from '../../context/ComposeContext';
import { useToast } from '../ui/Toast';
import { emailsApi } from '../../services/api/emails.api';
import { aiApi } from '../../services/api/ai.api';
import {
  ArrowLeft,
  Star,
  Archive,
  ArchiveRestore,
  Trash2,
  Mail,
  Reply,
  Sparkles,
  Send,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ThreadViewProps {
  thread: ThreadConversation;
  onBack: () => void;
  onThreadUpdated?: () => void;
}

export function ThreadView({ thread, onBack, onThreadUpdated }: ThreadViewProps) {
  const { openCompose } = useCompose();
  const { success, error } = useToast();
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isSendingQuickReply, setIsSendingQuickReply] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);

  const messages = thread.messages || [];
  const latestMessage = messages[messages.length - 1];
  const latestAnalysis = latestMessage?.aiAnalysis;

  const handleRunAIAnalysis = async () => {
    if (!latestMessage) return;
    const emailId = latestMessage.id || latestMessage._id;
    if (!emailId) return;

    setIsAnalyzing(true);
    try {
      await aiApi.analyze(emailId);
      success('Gemini 3.7 Flash analysis generated!');
      onThreadUpdated?.();
    } catch (err: any) {
      error('AI Analysis failed', err.message || 'Could not reach Gemini API');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStarToggle = async () => {
    if (!latestMessage) return;
    try {
      if (latestMessage.isStarred) {
        await emailsApi.unstarEmail(latestMessage.id || latestMessage._id!);
        success('Unstarred conversation');
      } else {
        await emailsApi.starEmail(latestMessage.id || latestMessage._id!);
        success('Starred conversation');
      }
      onThreadUpdated?.();
    } catch (err: any) {
      error('Failed to update star', err.message);
    }
  };

  const handleArchive = async () => {
    if (!latestMessage) return;
    try {
      if (latestMessage.isArchived) {
        await emailsApi.unarchiveEmail(latestMessage.id || latestMessage._id!);
        success('Unarchived conversation (moved to All Mail / Inbox)');
      } else {
        await emailsApi.archiveEmail(latestMessage.id || latestMessage._id!);
        success('Archived conversation');
      }
      onThreadUpdated?.();
      onBack();
    } catch (err: any) {
      error(latestMessage.isArchived ? 'Failed to unarchive' : 'Failed to archive', err.message);
    }
  };

  const handleDelete = async () => {
    if (!latestMessage) return;
    try {
      await emailsApi.deleteEmail(latestMessage.id || latestMessage._id!);
      success('Moved to Trash');
      onBack();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleSendQuickReply = async () => {
    if (!quickReplyText.trim() || !latestMessage) return;

    setIsSendingQuickReply(true);
    try {
      await emailsApi.replyEmail(latestMessage.id || latestMessage._id!, {
        body: quickReplyText,
      });
      setQuickReplyText('');
      success('Reply sent!');
      onThreadUpdated?.();
    } catch (err: any) {
      error('Failed to send reply', err.message);
    } finally {
      setIsSendingQuickReply(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            title="Back to inbox"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-slate-100 truncate">
            {thread.subject || '(No Subject)'}
          </h2>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowInsights(!showInsights);
              setMobileInsightsOpen(!mobileInsightsOpen);
            }}
            className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showInsights
                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle AI Insights"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>

          <button
            type="button"
            onClick={handleStarToggle}
            className={`p-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 transition-colors ${
              latestMessage?.isStarred ? 'text-amber-400' : 'text-slate-400'
            }`}
            title="Star"
          >
            <Star className={`w-4 h-4 ${latestMessage?.isStarred ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleArchive}
            className={`p-1.5 rounded-xl border transition-colors ${
              latestMessage?.isArchived
                ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/60'
                : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-100'
            }`}
            title={latestMessage?.isArchived ? 'Unarchive (Move to All Mail / Inbox)' : 'Archive'}
          >
            {latestMessage?.isArchived ? (
              <ArchiveRestore className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Messages Feed + AI Insights Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Main Column: Messages list & quick reply */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => (
            <EmailMessage
              key={msg.id || msg._id || index}
              email={msg}
              isLatest={index === messages.length - 1}
              onStarToggle={handleStarToggle}
            />
          ))}

          {/* Quick Reply Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-xl shadow-xl mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Reply className="w-3.5 h-3.5 text-indigo-400" />
                Quick Reply
              </span>

              <button
                type="button"
                onClick={() =>
                  openCompose({
                    to: latestMessage ? [latestMessage.from.email] : [],
                    subject: thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`,
                    inReplyToEmailId: latestMessage?.id || latestMessage?._id,
                    threadId: thread.id,
                    isReply: true,
                  })
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Open Full Composer &rarr;
              </button>
            </div>

            <textarea
              rows={3}
              value={quickReplyText}
              onChange={(e) => setQuickReplyText(e.target.value)}
              placeholder={`Reply to ${latestMessage?.from.name || 'sender'}...`}
              className="w-full rounded-xl border border-slate-750 bg-slate-950/80 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none resize-y"
            />

            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[11px] text-slate-500">Press Send or open full composer for AI tools</span>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSendingQuickReply}
                onClick={handleSendQuickReply}
                disabled={!quickReplyText.trim()}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send Reply
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights Sidebar (Always visible on desktop when showInsights is true) */}
        {showInsights && (
          <aside className="w-80 lg:w-96 border-l border-slate-800 bg-slate-900/60 p-4 sm:p-5 overflow-y-auto shrink-0 hidden md:block backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Gemini AI Brief
              </h3>
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{isAnalyzing ? 'Analyzing...' : latestAnalysis ? 'Re-Analyze' : 'Analyze'}</span>
              </button>
            </div>

            <AIInsightPanel
              analysis={latestAnalysis}
              isLoading={isAnalyzing}
              onAnalyze={handleRunAIAnalysis}
            />
          </aside>
        )}
      </div>

      {/* Mobile Drawer for AI Insights */}
      {mobileInsightsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden">
          <div
            onClick={() => setMobileInsightsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative mt-auto w-full max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 z-10 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Gemini AI Brief
              </h3>
              <button
                type="button"
                onClick={() => setMobileInsightsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pb-4">
              <AIInsightPanel
                analysis={latestAnalysis}
                isLoading={isAnalyzing}
                onAnalyze={handleRunAIAnalysis}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
