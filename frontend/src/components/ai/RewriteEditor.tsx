import React, { useState } from 'react';
import { AITone } from '../../types';
import { aiApi } from '../../services/api/ai.api';
import { ToneSelector } from './ToneSelector';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { Sparkles, Check, ArrowRight, RefreshCw, Wand2 } from 'lucide-react';

export interface RewriteEditorProps {
  currentText: string;
  onApplyRewrite: (newText: string) => void;
  onCancel?: () => void;
}

export function RewriteEditor({ currentText, onApplyRewrite, onCancel }: RewriteEditorProps) {
  const { success, error } = useToast();
  const [tone, setTone] = useState<AITone>('Professional');
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);

  const handleRewrite = async () => {
    if (!currentText.trim()) {
      error('Please enter some text in your email draft before rewriting.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await aiApi.rewrite({
        text: currentText,
        tone,
        instruction: instruction || undefined,
      });
      setRewrittenText(res.rewrittenText);
      setImprovements(res.improvements || []);
      success(`Draft rewritten in ${tone} tone`);
    } catch (err: any) {
      error('Rewrite failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (rewrittenText) {
      onApplyRewrite(rewrittenText);
      success('Applied AI rewritten text to draft');
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
            <Wand2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">AI Polish & Rewrite</h4>
        </div>
        <span className="text-[11px] text-slate-400">Powered by Gemini</span>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Target Tone</label>
        <ToneSelector selectedTone={tone} onSelectTone={setTone} disabled={isLoading} />
      </div>

      {/* Optional custom instruction */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
          Custom Polish Instruction (Optional)
        </label>
        <Input
          placeholder="e.g. Make it more concise, emphasize tomorrow's deadline, fix all punctuation..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isLoading}
          className="text-xs"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ai"
          size="sm"
          isLoading={isLoading}
          onClick={handleRewrite}
          className="w-full sm:w-auto"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Rewrite with Gemini
        </Button>
      </div>

      {/* Rewritten Output Comparison Preview */}
      {rewrittenText && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Improved Draft Preview
            </span>
            <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {tone} Tone
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
            {rewrittenText}
          </div>

          {improvements.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Enhancements Applied:</p>
              <div className="flex flex-wrap gap-1.5">
                {improvements.map((imp, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-indigo-200 border border-slate-700">
                    {imp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleApply}>
              <Check className="w-4 h-4 mr-1.5" />
              Apply to Compose Body
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
