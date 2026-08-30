import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { emailsApi } from '../services/api/emails.api';
import { ThreadView } from '../components/email/ThreadView';
import { ThreadSkeleton } from '../components/common/LoadingSkeletons';
import { ErrorState } from '../components/common/ErrorState';

export function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: thread,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['thread', id],
    queryFn: () => emailsApi.getThread(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <ThreadSkeleton />;
  }

  if (isError || !thread) {
    return (
      <ErrorState
        title="Email conversation not found"
        message={(error as any)?.message || 'Could not load message details.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ThreadView
      thread={thread}
      onBack={() => navigate('/inbox')}
      onThreadUpdated={() => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['emails'] });
      }}
    />
  );
}
