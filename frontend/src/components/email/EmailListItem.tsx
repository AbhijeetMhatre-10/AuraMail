import React from 'react';
import { EmailItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge } from '../ai/PriorityBadge';
import { CategoryBadge } from '../ai/CategoryBadge';
import { formatEmailDate } from '../../lib/utils';
import { Star, Archive, ArchiveRestore, Trash2, Mail, MailOpen, Paperclip } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmailListItemProps {
  email: EmailItem;
  isSelected?: boolean;
  onSelect: () => void;
  onStarToggle: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReadToggle: (e: React.MouseEvent) => void;
}

export function EmailListItem({
  email,
  isSelected = false,
  onSelect,
  onStarToggle,
  onArchive,
  onDelete,
  onReadToggle,
}: EmailListItemProps) {
  const analysis = email.aiAnalysis;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-3.5 px-4 py-3 border-b border-slate-800/80 cursor-pointer transition-all duration-150 select-none hover:bg-slate-800/50',
        !email.isRead ? 'bg-indigo-950/20 font-semibold' : 'bg-transparent',
        isSelected && 'bg-indigo-900/30 border-l-4 border-l-indigo-500'
      )}
    >
      {/* Unread indicator dot */}
      <div className="w-2 flex justify-center shrink-0">
        {!email.isRead && (
          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
        )}
      </div>

      {/* Star button */}
      <button
        type="button"
        onClick={onStarToggle}
        className={cn(
          'text-slate-500 hover:text-amber-400 transition-colors shrink-0',
          email.isStarred && 'text-amber-400'
        )}
      >
        <Star className={cn('w-4 h-4', email.isStarred && 'fill-amber-400')} />
      </button>

      {/* Sender Avatar */}
      <Avatar
        name={email.from.name || email.from.email}
        email={email.from.email}
        size="sm"
        className="shrink-0"
      />

      {/* Main Content (Sender, Subject, Snippet) */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-xs truncate max-w-[160px] sm:max-w-[200px]', !email.isRead ? 'text-white font-bold' : 'text-slate-200')}>
            {email.from.name || email.from.email}
          </span>

          {/* AI Category and Priority badges if present */}
          {analysis?.category && analysis.category !== 'General' && (
            <CategoryBadge category={analysis.category} className="hidden sm:inline-flex" />
          )}
          {analysis?.priority && (analysis.priority === 'urgent' || analysis.priority === 'high') && (
            <PriorityBadge priority={analysis.priority} className="hidden md:inline-flex" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={cn('truncate max-w-[240px] sm:max-w-[300px]', !email.isRead ? 'text-slate-100 font-semibold' : 'text-slate-300')}>
            {email.subject || '(No Subject)'}
          </span>
          <span className="text-slate-500 text-[11px] font-normal truncate hidden lg:inline">
            — {email.snippet || email.bodyText?.slice(0, 80)}
          </span>
        </div>
      </div>

      {/* Has attachments icon */}
      {email.hasAttachments && (
        <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
      )}

      {/* Timestamp */}
      <div className="text-[11px] text-slate-400 shrink-0 text-right min-w-[55px]">
        {formatEmailDate(email.receivedAt)}
      </div>

      {/* Hover Quick Actions Bar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 px-1.5 py-1 rounded-xl shadow-lg backdrop-blur-md z-10">
        <button
          type="button"
          onClick={onReadToggle}
          title={email.isRead ? 'Mark as unread' : 'Mark as read'}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {email.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onArchive}
          title={email.isArchived ? 'Unarchive (Move to All Mail / Inbox)' : 'Archive'}
          className={cn(
            'p-1 rounded-lg transition-colors',
            email.isArchived
              ? 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/60'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          )}
        >
          {email.isArchived ? (
            <ArchiveRestore className="w-3.5 h-3.5" />
          ) : (
            <Archive className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Delete (Move to Trash)"
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
