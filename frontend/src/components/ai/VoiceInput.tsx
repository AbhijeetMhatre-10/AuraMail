import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { aiApi } from '../../services/api/ai.api';

export interface VoiceInputProps {
  onTranscriptComplete: (data: { text: string; subject?: string }) => void;
  onCancel?: () => void;
}

export function VoiceInput({ onTranscriptComplete, onCancel }: VoiceInputProps) {
  const { error, success } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + ' ';
      }
      setTranscript(current.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        error('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (event.error !== 'no-speech') {
        error(`Voice error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!isSupported) {
      error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const handlePolishAndApply = async () => {
    if (!transcript.trim()) {
      error('Please speak or type a draft first.');
      return;
    }

    setIsPolishing(true);
    try {
      const res = await aiApi.voicePolish(transcript);
      onTranscriptComplete({
        text: res.body || transcript,
        subject: res.subject || undefined,
      });
      success('AI cleaned up voice draft and generated subject line!');
    } catch (err: any) {
      // Apply raw transcript if polish fails
      onTranscriptComplete({ text: transcript });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyRaw = () => {
    if (!transcript.trim()) {
      error('Transcript is empty.');
      return;
    }
    onTranscriptComplete({ text: transcript });
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
        <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-300">
          Browser Web Speech API is not supported in this environment. You can type directly into the compose editor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Voice-to-Email</h4>
        </div>
        <span className="text-[11px] text-slate-400">Speak naturally</span>
      </div>

      {/* Record button & waveform indicator */}
      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all ${
            isRecording
              ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/40 ring-4 ring-rose-500/30 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          }`}
        >
          {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <p className="text-xs font-medium text-slate-300">
          {isRecording ? 'Listening... click to stop recording' : 'Click to start speaking'}
        </p>
      </div>

      {/* Transcript Textarea for review & edits */}
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Spoken Transcript (Editable)
        </label>
        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak to see live transcript here, or type/edit text..."
          className="w-full rounded-xl border border-slate-750 bg-slate-950/80 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleApplyRaw}
            disabled={!transcript.trim() || isPolishing}
          >
            Apply Raw Text
          </Button>

          <Button
            variant="ai"
            size="sm"
            isLoading={isPolishing}
            onClick={handlePolishAndApply}
            disabled={!transcript.trim()}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Polish & Generate Subject
          </Button>
        </div>
      </div>
    </div>
  );
}
