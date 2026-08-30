import React from 'react';
import { SearchBar } from '../search/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Menu, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user, isDemo } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 gap-3 z-20 shrink-0">
      {/* Mobile Hamburger Menu */}
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Universal Search Bar */}
      <div className="flex-1 flex items-center justify-center max-w-xl">
        <SearchBar placeholder="Search messages or ask Gemini..." />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {isDemo ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Demo Mode
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Sync
          </span>
        )}

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-400 transition-all cursor-pointer"
        >
          <Avatar
            name={user?.name}
            email={user?.email}
            src={user?.picture}
            size="sm"
          />
        </button>
      </div>
    </header>
  );
}
