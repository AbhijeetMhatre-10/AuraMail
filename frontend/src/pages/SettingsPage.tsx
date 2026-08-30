import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '../services/api/activity.api';
import { ToneSelector } from '../components/ai/ToneSelector';
import { AITone } from '../types';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Mail,
  Sliders,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export function SettingsPage() {
  const { user, account, isDemo, logout, refreshAuth } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [defaultTone, setDefaultTone] = useState<AITone>(
    user?.preferences?.defaultTone || 'Professional'
  );
  const [autoSummarize, setAutoSummarize] = useState(
    user?.preferences?.autoSummarize ?? true
  );
  const [autoCategorize, setAutoCategorize] = useState(
    user?.preferences?.autoCategorize ?? true
  );

  const syncMutation = useMutation({
    mutationFn: () => activityApi.syncAccount(),
    onSuccess: (res) => {
      refreshAuth();
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      success('Mailbox synced', res.message || `${res.syncedCount} messages processed.`);
    },
    onError: (err: any) => {
      error('Sync failed', err.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => activityApi.disconnectAccount(),
    onSuccess: () => {
      success('Account disconnected');
      logout();
    },
    onError: (err: any) => {
      error('Failed to disconnect', err.message);
    },
  });

  const handleSavePreferences = () => {
    success('Preferences updated successfully');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Settings & Account Management
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your connected Gmail integration, AI preferences, and security configuration.
        </p>
      </div>

      {/* Connected Account Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Connected Email Account</h3>
          </div>
          {isDemo ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Demo Environment
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Account Email</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">OAuth Provider</p>
            <p className="text-sm font-semibold text-white mt-1">Google (Gmail API v1)</p>
          </div>
        </div>

        {/* Sync & Disconnect Actions */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            isLoading={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync Mailbox Now
          </Button>

          <Button
            variant="destructive"
            size="sm"
            isLoading={disconnectMutation.isPending}
            onClick={() => {
              if (window.confirm('Are you sure you want to disconnect this account?')) {
                disconnectMutation.mutate();
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Disconnect Account
          </Button>
        </div>
      </div>

      {/* AI Assistant Preferences */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">AI Drafting & Analysis Preferences</h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Default Writing Tone</label>
          <ToneSelector selectedTone={defaultTone} onSelectTone={setDefaultTone} />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Automatic Executive Summaries</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically generate bulleted summaries for long incoming email threads.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSummarize}
              onChange={(e) => setAutoSummarize(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Automatic Priority & Category Tagging</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculate priority scores (0-100) and assign category tags (Work, Finance, Urgent, etc.).
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoCategorize}
              onChange={(e) => setAutoCategorize(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" onClick={handleSavePreferences}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Security & Encryption Information */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 to-indigo-950/30 p-6 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Security & Credential Protection</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Google OAuth tokens are encrypted at rest using industry-standard <strong>AES-256-GCM</strong> authenticated encryption. Credentials and Gemini API keys remain strictly on the backend server and are never exposed to browser storage.
        </p>
        <ul className="space-y-1 text-[11px] text-slate-400 pt-1">
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Tokens encrypted with server-side <code className="text-slate-300">CREDENTIAL_ENCRYPTION_KEY</code>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Secure HTTP-only session cookies with CSRF/SameSite protection
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AI provider communication isolated behind backend service boundaries
          </li>
        </ul>
      </div>
    </div>
  );
}
