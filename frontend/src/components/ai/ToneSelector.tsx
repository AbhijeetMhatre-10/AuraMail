import React from 'react';
import { AITone } from '../../types';
import { Briefcase, Smile, Award, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToneSelectorProps {
  selectedTone: AITone;
  onSelectTone: (tone: AITone) => void;
  disabled?: boolean;
}

export function ToneSelector({ selectedTone, onSelectTone, disabled = false }: ToneSelectorProps) {
  const tones: { tone: AITone; label: string; icon: any; desc: string }[] = [
    { tone: 'Professional', label: 'Professional', icon: Briefcase, desc: 'Clear, polite, workplace standard' },
    { tone: 'Friendly', label: 'Friendly', icon: Smile, desc: 'Warm, approachable, empathetic' },
    { tone: 'Formal', label: 'Formal', icon: Award, desc: 'Authoritative, respectful, executive' },
    { tone: 'Concise', label: 'Concise', icon: Zap, desc: 'Ultra-direct, punchy, minimal fluff' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {tones.map(({ tone, label, icon: Icon, desc }) => {
        const isSelected = selectedTone === tone;
        return (
          <button
            key={tone}
            type="button"
            disabled={disabled}
            onClick={() => onSelectTone(tone)}
            className={cn(
              'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all select-none',
              isSelected
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            )}
          >
            <div className="flex items-center gap-1.5 font-medium text-xs">
              <Icon className={cn('w-3.5 h-3.5', isSelected ? 'text-indigo-400' : 'text-slate-400')} />
              <span className={isSelected ? 'text-indigo-200 font-semibold' : 'text-slate-300'}>{label}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}
