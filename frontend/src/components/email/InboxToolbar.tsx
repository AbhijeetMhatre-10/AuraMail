import React from 'react';
import { AICategory, AIPriority } from '../../types';
import { RefreshCw, Filter, CheckCheck, Flame, Briefcase, DollarSign, Bell, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface InboxToolbarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  unreadOnly: boolean;
  onToggleUnreadOnly: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCount?: number;
}

export function InboxToolbar({
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  unreadOnly,
  onToggleUnreadOnly,
  onRefresh,
  isRefreshing,
  totalCount,
}: InboxToolbarProps) {
  const categories: { id: string; label: string; icon?: any }[] = [
    { id: 'all', label: 'All Mail' },
    { id: 'Urgent', label: 'Urgent', icon: Flame },
    { id: 'Work', label: 'Work', icon: Briefcase },
    { id: 'Finance', label: 'Finance', icon: DollarSign },
    { id: 'Updates', label: 'Updates', icon: Bell },
    { id: 'Personal', label: 'Personal', icon: User },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map(({ id, label, icon: Icon }) => {
          const isSelected = selectedCategory.toLowerCase() === id.toLowerCase();
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all select-none ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {Icon && <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Priority, Unread Toggle, Refresh */}
      <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
        {/* Unread Only Button */}
        <button
          type="button"
          onClick={onToggleUnreadOnly}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
            unreadOnly
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-slate-700/60'
          }`}
        >
          <span>Unread</span>
        </button>

        {/* Refresh Sync Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Synchronize Mailbox"
          className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}
