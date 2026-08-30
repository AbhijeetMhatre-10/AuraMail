import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailsApi } from '../services/api/emails.api';
import { aiApi } from '../services/api/ai.api';
import { useToast } from '../components/ui/Toast';
import { RewriteEditor } from '../components/ai/RewriteEditor';
import { VoiceInput } from '../components/ai/VoiceInput';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Send,
  Sparkles,
  Mic,
  Wand2,
  X,
  Lightbulb,
  ArrowLeft,
} from 'lucide-react';

export function ComposePage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [toInput, setToInput] = useState('');
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [activeAITool, setActiveAITool] = useState<'rewrite' | 'voice' | null>(null);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);

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

  const handleGenerateSubjects = async () => {
    if (!body.trim()) {
      error('Please write some email body text first.');
      return;
    }

    setIsGeneratingSubject(true);
    try {
      const suggestions = await aiApi.generateSubject(body, subject);
      setSubjectSuggestions(suggestions);
      success('AI generated subject lines');
    } catch (err: any) {
      error('Subject generation failed', err.message);
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  const handleSend = async () => {
    const allTo = [...toRecipients];
    if (toInput.trim() && !allTo.includes(toInput.trim())) {
      allTo.push(toInput.trim());
    }

    if (allTo.length === 0) {
      error('Please add at least one recipient.');
      return;
    }
    if (!subject.trim()) {
      error('Please enter a subject.');
      return;
    }
    if (!body.trim()) {
      error('Please write a message body.');
      return;
    }

    setIsSending(true);
    try {
      await emailsApi.sendEmail({
        to: allTo,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        subject,
        body,
      });
      success('Email sent successfully!');
      navigate('/inbox');
    } catch (err: any) {
      error('Failed to send email', err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Compose New Message</h2>
            <p className="text-xs text-slate-400">Craft clear correspondence with Gemini AI assistance</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4">
        {/* Recipient Fields */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-950/80 px-3.5 py-2">
            <span className="text-xs font-semibold text-slate-400 w-12 shrink-0">To:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
              {toRecipients.map((rec) => (
                <span
                  key={rec}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200 border border-indigo-500/30"
                >
                  <span>{rec}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-white"
                    onClick={() => setToRecipients(toRecipients.filter((r) => r !== rec))}
                  />
                </span>
              ))}
              <input
                type="text"
                placeholder={toRecipients.length === 0 ? 'Recipient email address...' : ''}
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddRecipient(toInput, 'to');
                  }
                }}
                onBlur={() => handleAddRecipient(toInput, 'to')}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none min-w-[120px]"
              />
            </div>
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cc
              </button>
            )}
          </div>

          {/* CC Field */}
          {showCc && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-950/80 px-3.5 py-2">
              <span className="text-xs font-semibold text-slate-400 w-12 shrink-0">Cc:</span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {ccRecipients.map((rec) => (
                  <span
                    key={rec}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700"
                  >
                    <span>{rec}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white"
                      onClick={() => setCcRecipients(ccRecipients.filter((r) => r !== rec))}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="CC email addresses..."
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
                  className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none min-w-[120px]"
                />
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-750 bg-slate-950/80 px-3.5 py-2">
              <span className="text-xs font-semibold text-slate-400 w-12 shrink-0">Subject:</span>
              <input
                type="text"
                placeholder="Email subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateSubjects}
                disabled={isGeneratingSubject}
                className="flex items-center gap-1 text-xs font-medium text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI Subjects</span>
              </button>
            </div>

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
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 text-slate-200 border border-purple-500/20 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Overlay Panels */}
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

        {/* Body Editor */}
        <div>
          <textarea
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message body here..."
            className="w-full rounded-2xl border border-slate-750 bg-slate-950/90 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={activeAITool === 'rewrite' ? 'ai' : 'secondary'}
              size="sm"
              onClick={() => setActiveAITool(activeAITool === 'rewrite' ? null : 'rewrite')}
            >
              <Wand2 className="w-3.5 h-3.5 mr-1 text-purple-400" />
              <span>AI Polish / Tone</span>
            </Button>

            <Button
              variant={activeAITool === 'voice' ? 'ai' : 'secondary'}
              size="sm"
              onClick={() => setActiveAITool(activeAITool === 'voice' ? null : 'voice')}
            >
              <Mic className="w-3.5 h-3.5 mr-1 text-rose-400" />
              <span>Voice-to-Email</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/inbox')}>
              Discard
            </Button>
            <Button variant="primary" size="md" isLoading={isSending} onClick={handleSend}>
              <Send className="w-4 h-4 mr-1.5" />
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
