import { apiClient } from './client';
import { EmailItem, ThreadConversation } from '../../types';

export interface ListEmailsParams {
  folder?: 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';
  category?: string;
  priority?: string;
  unreadOnly?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export const emailsApi = {
  getEmails: async (params: ListEmailsParams = {}) => {
    const query = new URLSearchParams();
    if (params.folder) query.set('folder', params.folder);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient<EmailItem[]>(`/emails${qs}`);
    return {
      emails: res.data || [],
      meta: res.meta || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  getEmail: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}`);
    return res.data;
  },

  getThread: async (threadId: string) => {
    const res = await apiClient<ThreadConversation>(`/threads/${threadId}`);
    return res.data;
  },

  markRead: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/read`, { method: 'POST' });
    return res.data;
  },

  markUnread: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/unread`, { method: 'POST' });
    return res.data;
  },

  starEmail: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/star`, { method: 'POST' });
    return res.data;
  },

  unstarEmail: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/star`, { method: 'DELETE' });
    return res.data;
  },

  archiveEmail: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/archive`, { method: 'POST' });
    return res.data;
  },

  unarchiveEmail: async (id: string) => {
    const res = await apiClient<EmailItem>(`/emails/${id}/unarchive`, { method: 'POST' });
    return res.data;
  },

  deleteEmail: async (id: string) => {
    const res = await apiClient<{ message: string; email: EmailItem }>(`/emails/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  sendEmail: async (payload: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }) => {
    const res = await apiClient<EmailItem>('/emails/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  replyEmail: async (
    id: string,
    payload: { body: string; isHtml?: boolean; replyAll?: boolean }
  ) => {
    const endpoint = payload.replyAll ? `/emails/${id}/reply-all` : `/emails/${id}/reply`;
    const res = await apiClient<EmailItem>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
