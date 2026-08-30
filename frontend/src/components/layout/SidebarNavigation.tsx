import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompose } from '../../context/ComposeContext';
import { Avatar } from '../ui/Avatar';
import {
  Inbox,
  Star,
  Send,
  Archive,
  Sparkles,
  Activity,
  Settings,
  Plus,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarNavigationProps {
  onItemClick?: () => void;
  unreadCount?: number;
}

export function SidebarNavigation({ onItemClick, unreadCount = 0 }: SidebarNavigationProps) {
  const { user, account, isDemo, logout } = useAuth();
  const { openCompose } = useCompose();
  const navigate = useNavigate();

  const navItems = [
    { to: '/inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
    { to: '/starred', label: 'Starred', icon: Star },
    { to: '/sent', label: 'Sent', icon: Send },
    { to: '/archive', label: 'Archive', icon: Archive },
    { to: '/search?smart=true', label: 'Smart Search', icon: Sparkles, highlight: true },
    { to: '/activity', label: 'Activity Log', icon: Activity },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4.5 border-b border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            AuraMail
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Intelligent Email</p>
        </div>
      </div>

      {/* Primary Compose Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => {
            openCompose();
            onItemClick?.();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Compose</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, count, highlight }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                highlight && !window.location.pathname.includes('search') && 'text-purple-300 hover:text-purple-200'
              )
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{label}</span>
            </div>

            {count !== undefined && count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/40">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mode Status Pill & User Card */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {isDemo ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mode Active
            </span>
            <span className="opacity-75">Isolated</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Gmail Connected
            </span>
            <span className="opacity-75">Live</span>
          </div>
        )}

        {/* User profile & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-750">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name} email={user?.email} src={user?.picture} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
