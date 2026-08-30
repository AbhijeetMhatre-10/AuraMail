import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Filter, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { SmartSearchResult } from '../../types';

export interface SmartSearchPanelProps {
  onExecuteSmartSearch: (naturalQuery: string) => void;
  isLoading?: boolean;
  searchResult?: SmartSearchResult | null;
}

export function SmartSearchPanel({ onExecuteSmartSearch, isLoading, searchResult }: SmartSearchPanelProps) {
  const [query, setQuery] = useState('');

  const samplePrompts = [
    'Find unread emails with deadlines this week',
    'Show receipts and invoices from Stripe',
    'Emails from Sarah about the Q3 board meeting',
    'Find security warnings and phishing alerts',
    'Design feedback from David Chen in Figma',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onExecuteSmartSearch(query.trim());
    }
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    onExecuteSmartSearch(sample);
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Gemini: e.g. 'Show unread urgent emails from my manager about budgets'..."
            className="flex-1 bg-transparent px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none py-1.5"
          />
          <Button variant="ai" size="sm" type="submit" isLoading={isLoading} disabled={!query.trim()}>
            <span>Search Intent</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </form>

      {/* Suggested Natural Language Query Chips */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
          Try Natural Language Queries:
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-200 border border-slate-750 hover:border-indigo-500/40 transition-all text-left"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* AI Strategy Breakdown Banner */}
      {searchResult && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini Interpretation:</span>
          </div>
          <p className="text-sm text-slate-200">{searchResult.interpretation}</p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-500/20 text-xs">
            {searchResult.strategy.category && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Category: {searchResult.strategy.category}
              </span>
            )}
            {searchResult.strategy.priority && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Priority: {searchResult.strategy.priority}
              </span>
            )}
            {searchResult.strategy.unreadOnly && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unread Only
              </span>
            )}
            <span className="text-slate-400 ml-auto font-medium">
              Found {searchResult.count} matching message{searchResult.count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
