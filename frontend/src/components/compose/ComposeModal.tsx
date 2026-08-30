import React, { useState, useEffect } from 'react';
import { useCompose } from '../../context/ComposeContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { emailsApi } from '../../services/api/emails.api';
import { aiApi } from '../../services/api/ai.api';
import { RewriteEditor } from '../ai/RewriteEditor';
import { VoiceInput } from '../ai/VoiceInput';
import { ReplyGenerator } from './ReplyGenerator';
import {
  Send,
  Sparkles,
  Mic,
  Wand2,
  Paperclip,
  ChevronDown,
  X,
  Bot,
  Lightbulb,
} from 'lucide-react';

export function ComposeModal() {
  const { isOpen, closeCompose, draft, updateDraft, resetDraft } = useCompose();
  const { success, error } = useToast();

  const [toInput, setToInput] = useState('');
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Active AI tool overlay panels
  const [activeAITool, setActiveAITool] = useState<'rewrite' | 'voice' | 'reply' | null>(null);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setToRecipients(draft.to || []);
      setCcRecipients(draft.cc || []);
      setShowCc(Boolean(draft.cc && draft.cc.length > 0));
      setSubject(draft.subject || '');
      setBody(draft.body || '');
      setActiveAITool(null);
      setSubjectSuggestions([]);
    }
  }, [isOpen, draft]);

  const handleAddRecipient = (val: string, type: 'to' | 'cc' = 'to') => {
    const trimmed = val.trim().replace(/,$/, '');
    if (!trimmed) return;
    if (type === 'to') {
      if (!toRecipients.includes(trimmed)) setToRecipients([...toRecipients, trimmed]);
      setToInput('');
    } else {
      if (!ccRecipients.includes(trimmed)) setCcRecipients([...ccRecipients, trimmed]);
    }
  };

  const handleRemoveRecipient = (email: string, type: 'to' | 'cc' = 'to') => {
    if (type === 'to') setToRecipients(toRecipients.filter((r) => r !== email));
    else setCcRecipients(ccRecipients.filter((r) => r !== email));
  };

  const handleGenerateSubjects = async () => {
    if (!body.trim()) {
      error('Please write some content first to generate subject suggestions.');
      return;
    }

    setIsGeneratingSubject(true);
    try {
      const suggestions = await aiApi.generateSubject(body, subject);
      setSubjectSuggestions(suggestions);
      success('AI generated subject line options');
    } catch (err: any) {
      error('Failed to generate subjects', err.message);
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  const handleSend = async () => {
    // Collect recipients
    const allTo = [...toRecipients];
    if (toInput.trim() && !allTo.includes(toInput.trim())) {
      allTo.push(toInput.trim());
    }

    if (allTo.length === 0) {
      error('Please enter at least one recipient in the To field.');
      return;
    }
    if (!subject.trim()) {
      error('Please add a subject line.');
      return;
    }
    if (!body.trim()) {
      error('Please write an email message body.');
      return;
    }

    setIsSending(true);
    try {
      if (draft.isReply && draft.inReplyToEmailId) {
        await emailsApi.replyEmail(draft.inReplyToEmailId, {
          body,
          replyAll: draft.replyAll,
        });
        success('Reply sent successfully!');
      } else {
        await emailsApi.sendEmail({
          to: allTo,
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          subject,
          body,
        });
        success('Email sent successfully!');
      }

      resetDraft();
      closeCompose();
    } catch (err: any) {
      error('Failed to send email', err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeCompose}
      title={
        <div className="flex items-center gap-2">
          <span>{draft.isReply ? 'Reply to Email' : 'New Message'}</span>
          <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            Draft
          </span>
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-3.5">
        {/* Recipient Rows */}
        <div className="space-y-2">
          {/* TO Field */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-900/90 px-3 py-1.5 focus-within:border-indigo-500">
            <span className="text-xs font-semibold text-slate-400 w-8 shrink-0">To:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
              {toRecipients.map((rec) => (
                <span
                  key={rec}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200 border border-indigo-500/30"
                >
                  <span>{rec}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-white"
                    onClick={() => handleRemoveRecipient(rec, 'to')}
                  />
                </span>
              ))}
              <input
                type="text"
                placeholder={toRecipients.length === 0 ? 'Enter email recipient(s)...' : ''}
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddRecipient(toInput, 'to');
                  }
                }}
                onBlur={() => handleAddRecipient(toInput, 'to')}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none min-w-[120px] py-1"
              />
            </div>
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-xs text-slate-400 hover:text-slate-200 font-medium px-1.5 py-0.5"
              >
                Cc
              </button>
            )}
          </div>

          {/* CC Field */}
          {showCc && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-900/90 px-3 py-1.5 focus-within:border-indigo-500">
              <span className="text-xs font-semibold text-slate-400 w-8 shrink-0">Cc:</span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {ccRecipients.map((rec) => (
                  <span
                    key={rec}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700"
                  >
                    <span>{rec}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white"
                      onClick={() => handleRemoveRecipient(rec, 'cc')}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Enter CC recipients..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddRecipient((e.target as HTMLInputElement).value, 'cc');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  onBlur={(e) => {
                    handleAddRecipient(e.target.value, 'cc');
                    e.target.value = '';
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none min-w-[120px] py-1"
                />
              </div>
            </div>
          )}

          {/* Subject Field & AI Subject Suggester */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-900/90 px-3 py-1.5 focus-within:border-indigo-500">
              <span className="text-xs font-semibold text-slate-400 w-8 shrink-0">Subject:</span>
              <input
                type="text"
                placeholder="Subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none py-1"
              />
              <button
                type="button"
                onClick={handleGenerateSubjects}
                disabled={isGeneratingSubject}
                title="Generate AI subject lines"
                className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-100 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI Subjects</span>
              </button>
            </div>

            {/* Subject Suggestions Chips */}
            {subjectSuggestions.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                    Suggested Subject Lines
                  </span>
                  <X
                    className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer"
                    onClick={() => setSubjectSuggestions([])}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {subjectSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSubject(sug);
                        setSubjectSuggestions([]);
                        success('Subject updated');
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 text-slate-200 border border-purple-500/20 hover:border-purple-500/50 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Action Tool Overlay Panels */}
        {activeAITool === 'rewrite' && (
          <RewriteEditor
            currentText={body}
            onApplyRewrite={(newText) => {
              setBody(newText);
              setActiveAITool(null);
            }}
            onCancel={() => setActiveAITool(null)}
          />
        )}

        {activeAITool === 'voice' && (
          <VoiceInput
            onTranscriptComplete={({ text, subject: voiceSubject }) => {
              setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
              if (voiceSubject && !subject) setSubject(voiceSubject);
              setActiveAITool(null);
            }}
            onCancel={() => setActiveAITool(null)}
          />
        )}

        {activeAITool === 'reply' && (
          <ReplyGenerator
            originalBody={draft.body}
            originalSender={draft.to?.[0]}
            originalSubject={draft.subject}
            onApplyReply={(replyText, replySubject) => {
              setBody(replyText);
              if (replySubject && !subject) setSubject(replySubject);
              setActiveAITool(null);
            }}
            onClose={() => setActiveAITool(null)}
          />
        )}

        {/* Message Body Editor */}
        <div>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email message here, or use Gemini AI tools above to draft..."
            className="w-full rounded-xl border border-slate-750 bg-slate-900/90 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y font-sans leading-relaxed shadow-inner"
          />
        </div>

        {/* Toolbar & Send Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
          {/* AI Helper Tools Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveAITool(activeAITool === 'rewrite' ? null : 'rewrite')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                activeAITool === 'rewrite'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Polish / Tone</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAITool(activeAITool === 'voice' ? null : 'voice')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                activeAITool === 'voice'
                  ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>Voice-to-Email</span>
            </button>

            {draft.isReply && (
              <button
                type="button"
                onClick={() => setActiveAITool(activeAITool === 'reply' ? null : 'reply')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  activeAITool === 'reply'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Draft Reply</span>
              </button>
            )}
          </div>

          {/* Primary Send & Cancel */}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={closeCompose} disabled={isSending}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isSending}
              onClick={handleSend}
              className="px-5 shadow-indigo-600/30"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>Send Message</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
