import { apiClient } from './client';
import { UserProfile, ConnectedAccountInfo } from '../../types';

export const authApi = {
  getGoogleAuthUrl: async (state?: string) => {
    const params = state ? `?state=${encodeURIComponent(state)}` : '';
    const res = await apiClient<{ url: string }>(`/auth/google/start${params}`);
    return res.data.url;
  },

  demoLogin: async () => {
    const res = await apiClient<{ token: string; user: UserProfile; isDemo: boolean }>(
      '/auth/demo-login',
      { method: 'POST' }
    );
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient<{
      user: UserProfile;
      account: ConnectedAccountInfo | null;
      isDemo: boolean;
    }>('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient<{ message: string }>('/auth/logout', { method: 'POST' });
    return res.data;
  },
};
