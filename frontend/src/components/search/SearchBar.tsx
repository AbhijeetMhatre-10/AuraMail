import React, { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  onSearch,
  placeholder = 'Search emails, senders, keywords...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <div className={`relative flex items-center w-full max-w-lg ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-9 pl-9.5 pr-20 rounded-xl bg-slate-900/90 border border-slate-750 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 text-slate-500 hover:text-slate-300 p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&smart=true`)}
        title="Smart Natural Language Search"
        className="absolute right-1.5 flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-2 py-1 rounded-lg transition-colors"
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Smart</span>
      </button>
    </div>
  );
}
