import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailsApi } from '../services/api/emails.api';
import { activityApi } from '../services/api/activity.api';
import { EmailItem, ThreadConversation } from '../types';
import { InboxToolbar } from '../components/email/InboxToolbar';
import { EmailListItem } from '../components/email/EmailListItem';
import { ThreadView } from '../components/email/ThreadView';
import { EmailListSkeleton } from '../components/common/LoadingSkeletons';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PanelResizer } from '../components/ui/PanelResizer';
import { useToast } from '../components/ui/Toast';
import { Inbox, Sparkles, Mail } from 'lucide-react';

const DEFAULT_LIST_WIDTH = 380;
const MIN_LIST_WIDTH = 280;
const MAX_LIST_WIDTH = 650;

export function InboxPage() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
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
    setListWidth((prev) => {
      const next = Math.max(MIN_LIST_WIDTH, Math.min(MAX_LIST_WIDTH, prev + deltaX));
      return next;
    });
  };

  const handleListResizeEnd = () => {
    try {
      localStorage.setItem('auramail_list_width', listWidth.toString());
    } catch {}
  };

  // Fetch Inbox emails
  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['emails', 'inbox', category, priority, unreadOnly],
    queryFn: () =>
      emailsApi.getEmails({
        folder: 'inbox',
        category,
        priority,
        unreadOnly,
      }),
  });

  // Fetch thread conversation for selected email
  const {
    data: activeThread,
    isLoading: isThreadLoading,
    refetch: refetchThread,
  } = useQuery({
    queryKey: ['thread', selectedEmailId],
    queryFn: async () => {
      if (!selectedEmailId) return null;
      return emailsApi.getThread(selectedEmailId);
    },
    enabled: Boolean(selectedEmailId),
  });

  // Sync Mailbox Mutation
  const syncMutation = useMutation({
    mutationFn: () => activityApi.syncAccount(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      success(res.message || `Synced ${res.syncedCount} messages`);
    },
    onError: (err: any) => {
      error('Sync failed', err.message);
    },
  });

  // Action Mutations with complete state synchronization
  const starMutation = useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) =>
      isStarred ? emailsApi.unstarEmail(id) : emailsApi.starEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
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

  const archiveMutation = useMutation({
    mutationFn: (id: string) => emailsApi.archiveEmail(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['thread'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      if (selectedEmailId === deletedId) {
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

  const emails = data?.emails || [];

  const handleSelectEmail = (email: EmailItem) => {
    setSelectedEmailId(email.id || email._id || email.threadId || null);
    if (!email.isRead) {
      readMutation.mutate({ id: email.id || email._id!, isRead: false });
    }
  };

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden bg-slate-950">
      {/* Left Pane: Inbox List (User-Resizable on Desktop) */}
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
        <InboxToolbar
          selectedCategory={category}
          onSelectCategory={setCategory}
          selectedPriority={priority}
          onSelectPriority={setPriority}
          unreadOnly={unreadOnly}
          onToggleUnreadOnly={() => setUnreadOnly(!unreadOnly)}
          onRefresh={() => syncMutation.mutate()}
          isRefreshing={syncMutation.isPending || isFetching}
          totalCount={data?.meta?.total}
        />

        {/* Email List Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850/80">
          {isLoading ? (
            <EmailListSkeleton count={10} />
          ) : isError ? (
            <ErrorState
              title="Failed to load inbox"
              message={(queryError as any)?.message || 'Could not fetch messages.'}
              onRetry={refetch}
            />
          ) : emails.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Your inbox is empty"
              description="No messages match your active filters. Click sync to check for new mail."
              actionLabel="Refresh Inbox"
              onAction={() => syncMutation.mutate()}
            />
          ) : (
            emails.map((email) => (
              <EmailListItem
                key={email.id || email._id}
                email={email}
                isSelected={selectedEmailId === (email.id || email._id || email.threadId)}
                onSelect={() => handleSelectEmail(email)}
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

      {/* Resizer Splitter between Email List and Reading Pane */}
      {selectedEmailId && (
        <PanelResizer
          onResize={handleListResize}
          onResizeEnd={handleListResizeEnd}
          className="hidden lg:flex"
        />
      )}

      {/* Right Pane: Reading & Conversation View */}
      <div
        className={`flex-1 flex flex-col h-full bg-slate-950 overflow-hidden min-w-[320px] ${
          !selectedEmailId ? 'hidden lg:flex' : 'flex w-full'
        }`}
      >
        {selectedEmailId && activeThread ? (
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
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 select-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-600 shadow-inner mb-4">
              <Mail className="w-8 h-8 text-indigo-500/40" />
            </div>
            <h3 className="text-base font-bold text-slate-300">Select an email to read</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Choose a message from the list to view thread details, AI summaries, urgency scores, and generate intelligent replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
