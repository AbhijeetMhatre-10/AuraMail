import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Bot,
  Flame,
  Lock,
  AlertCircle,
} from 'lucide-react';

export function LoginPage() {
  const { loginWithGoogle, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState(searchParams.get('error') || '');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed to start. Please check your connection and configuration.');
      setIsGoogleLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Gemini Executive Summaries',
      desc: 'Instant high-level overviews and key takeaways from dense email threads.',
    },
    {
      icon: Bot,
      title: 'Context-Aware AI Drafting',
      desc: 'Generate intelligent responses tailored in Professional, Friendly, Formal, or Concise tones.',
    },
    {
      icon: Flame,
      title: 'Smart Prioritization & Security',
      desc: 'Automatic priority scoring and advisory spam & phishing threat detection.',
    },
    {
      icon: Zap,
      title: 'Voice-to-Email & Natural Search',
      desc: 'Speak your draft or find emails using natural language intent.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic ambient gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* Brand Icon */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          AuraMail Assistant
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          Intelligent AI email workspace powered by Google Gemini and Gmail.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Authentication Notice</p>
              <p className="mt-0.5 opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          {/* Live Google OAuth */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Sign in with Google
            </h3>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 p-3.5 text-sm font-semibold text-white transition-all shadow-md hover:border-indigo-500/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Requires Google OAuth credentials configured on the server
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-750/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <f.icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{f.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OAuth tokens are encrypted with AES-256-GCM and stored exclusively on the server.</span>
        </p>
      </div>
    </div>
  );
}
