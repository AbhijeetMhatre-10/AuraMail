import React, { useState } from 'react';
import { AITone } from '../../types';
import { aiApi } from '../../services/api/ai.api';
import { ToneSelector } from '../ai/ToneSelector';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { Sparkles, Check, CornerDownLeft, Wand2 } from 'lucide-react';

export interface ReplyGeneratorProps {
  emailId?: string;
  originalSender?: string;
  originalSubject?: string;
  originalBody?: string;
  onApplyReply: (replyBody: string, subject?: string) => void;
  onClose?: () => void;
}

export function ReplyGenerator({
  emailId,
  originalSender = '',
  originalSubject = '',
  originalBody = '',
  onApplyReply,
  onClose,
}: ReplyGeneratorProps) {
  const { success, error } = useToast();
  const [tone, setTone] = useState<AITone>('Professional');
  const [userInstructions, setUserInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ body: string; subject: string } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.generateReply({
        emailId,
        originalSender,
        originalSubject,
        originalBody,
        tone,
        userInstructions: userInstructions || undefined,
      });

      setGeneratedDraft({
        body: res.body,
        subject: res.subject,
      });
      success(`Draft generated in ${tone} tone`);
    } catch (err: any) {
      error('Failed to generate AI reply', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedDraft) {
      onApplyReply(generatedDraft.body, generatedDraft.subject);
      if (onClose) onClose();
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Generate AI Reply Draft</h4>
        </div>
        <span className="text-[11px] text-slate-400">Context-Aware</span>
      </div>

      {/* Tone selection */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Desired Tone</label>
        <ToneSelector selectedTone={tone} onSelectTone={setTone} disabled={isLoading} />
      </div>

      {/* Custom directions */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
          Custom Context or Directives (Optional)
        </label>
        <Input
          placeholder="e.g. Accept the meeting on Tuesday, request the updated PDF, decline politely..."
          value={userInstructions}
          onChange={(e) => setUserInstructions(e.target.value)}
          disabled={isLoading}
          className="text-xs"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="ai" size="sm" isLoading={isLoading} onClick={handleGenerate}>
          <Sparkles className="w-4 h-4 mr-1.5" />
          Generate Reply Draft
        </Button>
      </div>

      {/* Preview Output */}
      {generatedDraft && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Generated Draft Preview</span>
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {tone}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {generatedDraft.body}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleApply}>
              <Check className="w-4 h-4 mr-1.5" />
              Use This Draft
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
