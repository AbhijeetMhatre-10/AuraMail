import { apiClient } from './client';
import { EmailItem, SmartSearchResult } from '../../types';

export const searchApi = {
  search: async (q: string, category?: string, priority?: string, unreadOnly?: boolean) => {
    const params = new URLSearchParams({ q });
    if (category) params.set('category', category);
    if (priority) params.set('priority', priority);
    if (unreadOnly) params.set('unreadOnly', 'true');

    const res = await apiClient<{
      query: string;
      results: EmailItem[];
      count: number;
      strategy: string;
    }>(`/search?${params.toString()}`);
    return res.data;
  },

  smartSearch: async (q: string) => {
    const params = new URLSearchParams({ q });
    const res = await apiClient<SmartSearchResult>(`/search/smart?${params.toString()}`);
    return res.data;
  },
};
