import { apiClient } from './client';
import { EmailActivityItem, ConnectedAccountInfo } from '../../types';

export const activityApi = {
  getActivity: async (limit = 50) => {
    const res = await apiClient<EmailActivityItem[]>(`/activity?limit=${limit}`);
    return res.data || [];
  },

  getAccount: async () => {
    const res = await apiClient<ConnectedAccountInfo | null>('/account');
    return res.data;
  },

  syncAccount: async () => {
    const res = await apiClient<{ syncedCount: number; newCount: number; message?: string }>('/account/sync', {
      method: 'POST',
    });
    return res.data;
  },

  disconnectAccount: async () => {
    const res = await apiClient<{ success: boolean; message: string }>('/account', {
      method: 'DELETE',
    });
    return res.data;
  },
};
