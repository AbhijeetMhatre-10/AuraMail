import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailsApi } from '../services/api/emails.api';
import { EmailListItem } from '../components/email/EmailListItem';
import { ThreadView } from '../components/email/ThreadView';
import { EmailListSkeleton } from '../components/common/LoadingSkeletons';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PanelResizer } from '../components/ui/PanelResizer';
import { useToast } from '../components/ui/Toast';
import { Star, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { EmailItem } from '../types';

const DEFAULT_LIST_WIDTH = 380;
const MIN_LIST_WIDTH = 280;
const MAX_LIST_WIDTH = 650;

export function StarredPage() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const [listWidth, setListWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('auramail_list_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_LIST_WIDTH && parsed <= MAX_LIST_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_LIST_WIDTH;
  });

  const handleListResize = (deltaX: number) => {
    setListWidth((prev) => Math.max(MIN_LIST_WIDTH, Math.min(MAX_LIST_WIDTH, prev + deltaX)));
  };

  const handleListResizeEnd = () => {
    try {
      localStorage.setItem('auramail_list_width', listWidth.toString());
    } catch {}
  };

  const { data, isLoading, isError, error: queryError, refetch, isFetching } = useQuery({
    queryKey: ['emails', 'starred'],
    queryFn: () => emailsApi.getEmails({ folder: 'starred' }),
  });

  const { data: activeThread, isLoading: isThreadLoading, refetch: refetchThread } = useQuery({
    queryKey: ['thread', selectedEmailId],
    queryFn: () => (selectedEmailId ? emailsApi.getThread(selectedEmailId) : null),
    enabled: Boolean(selectedEmailId),
  });

  const starMutation = useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) =>
      isStarred ? emailsApi.unstarEmail(id) : emailsApi.starEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => emailsApi.archiveEmail(id),
    onSuccess: (_, archivedId) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      if (selectedEmailId === archivedId) {
        setSelectedEmailId(null);
      }
      success('Email archived');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailsApi.deleteEmail(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      if (selectedEmailId === deletedId) {
        setSelectedEmailId(null);
      }
      success('Email moved to Trash');
    },
  });

  const readMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      isRead ? emailsApi.markUnread(id) : emailsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
    },
  });

  const emails = data?.emails || [];

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden bg-slate-950">
      {/* Left List Pane */}
      <div
        style={{
          width: selectedEmailId ? `${listWidth}px` : undefined,
        }}
        className={`flex flex-col h-full bg-slate-950 overflow-hidden shrink-0 ${
          selectedEmailId
            ? 'hidden lg:flex transition-[width] duration-75 ease-out'
            : 'flex-1 w-full'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-bold text-white">Starred Messages</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {emails.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850/80">
          {isLoading ? (
            <EmailListSkeleton count={8} />
          ) : isError ? (
            <ErrorState
              message={(queryError as any)?.message || 'Failed to load starred emails.'}
              onRetry={refetch}
            />
          ) : emails.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No starred messages"
              description="Star important emails to quickly access and track them here."
            />
          ) : (
            emails.map((email) => (
              <EmailListItem
                key={email.id || email._id}
                email={email}
                isSelected={selectedEmailId === (email.id || email._id || email.threadId)}
                onSelect={() => setSelectedEmailId(email.id || email._id || email.threadId || null)}
                onStarToggle={(e) => {
                  e.stopPropagation();
                  starMutation.mutate({ id: email.id || email._id!, isStarred: email.isStarred });
                }}
                onArchive={(e) => {
                  e.stopPropagation();
                  archiveMutation.mutate(email.id || email._id!);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(email.id || email._id!);
                }}
                onReadToggle={(e) => {
                  e.stopPropagation();
                  readMutation.mutate({ id: email.id || email._id!, isRead: email.isRead });
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Resizer Splitter */}
      {selectedEmailId && (
        <PanelResizer
          onResize={handleListResize}
          onResizeEnd={handleListResizeEnd}
          className="hidden lg:flex"
        />
      )}

      {/* Right Reading Pane */}
      <div
        className={`flex-1 flex flex-col h-full bg-slate-950 overflow-hidden min-w-[320px] ${
          !selectedEmailId ? 'hidden lg:flex' : 'flex w-full'
        }`}
      >
        {selectedEmailId ? (
          isThreadLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <div className="h-12 w-12 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Loading conversation...</p>
              <p className="text-xs text-slate-500 mt-1">Retrieving message details & Gemini AI insights</p>
            </div>
          ) : activeThread ? (
            <ThreadView
              thread={activeThread}
              onBack={() => setSelectedEmailId(null)}
              onThreadUpdated={() => {
                refetchThread();
                queryClient.invalidateQueries({ queryKey: ['emails'] });
                queryClient.invalidateQueries({ queryKey: ['activity'] });
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <Mail className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Unable to load this conversation</p>
              <button
                type="button"
                onClick={() => refetchThread()}
                className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-colors"
              >
                Reload Thread
              </button>
            </div>
          )
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 select-none">
            <Mail className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm text-slate-400 font-medium">Select a starred email to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
