import { apiClient } from './client';
import { AITone } from '../../types';

export const aiApi = {
  summarize: async (emailId: string) => {
    const res = await apiClient<{
      summary: string;
      keyPoints: string[];
      suggestedQuickReplies: string[];
    }>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  generateReply: async (params: {
    emailId?: string;
    originalSender?: string;
    originalSubject?: string;
    originalBody?: string;
    tone?: AITone;
    userInstructions?: string;
  }) => {
    const res = await apiClient<{
      subject: string;
      body: string;
      tone: string;
    }>('/ai/reply', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  classify: async (emailId: string) => {
    const res = await apiClient<{
      category: string;
      confidence: number;
      reason: string;
    }>('/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  analyze: async (emailId: string) => {
    const res = await apiClient<{
      priority: any;
      classification: any;
      security: any;
      explanation: any;
    }>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  priority: async (emailId: string) => {
    const res = await apiClient<{
      priority: string;
      priorityScore: number;
      importance: string;
      reason: string;
      actionItems: string[];
      deadlines: { description: string; dueDate?: string }[];
    }>('/ai/priority', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  spamPhishing: async (emailId: string) => {
    const res = await apiClient<{
      spamRisk: string;
      phishingRisk: string;
      isSafe: boolean;
      score: number;
      reasons: string[];
      recommendedAction: string;
    }>('/ai/spam-phishing', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  generateSubject: async (body: string, currentSubject?: string) => {
    const res = await apiClient<{ subjects: string[] }>('/ai/subject', {
      method: 'POST',
      body: JSON.stringify({ body, currentSubject }),
    });
    return res.data.subjects;
  },

  rewrite: async (params: {
    text: string;
    tone: AITone;
    instruction?: string;
  }) => {
    const res = await apiClient<{
      rewrittenText: string;
      tone: string;
      improvements: string[];
    }>('/ai/rewrite', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  explain: async (emailId: string) => {
    const res = await apiClient<{
      overview: string;
      senderIntent: string;
      keyRequests: string[];
      deadlineOrTimeSensitivity: string;
      jargonOrTerms: { term: string; explanation: string }[];
      suggestedNextSteps: string[];
    }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ emailId }),
    });
    return res.data;
  },

  voicePolish: async (transcript: string) => {
    const res = await apiClient<{
      subject: string;
      body: string;
    }>('/ai/voice-polish', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient<any[]>('/ai/history');
    return res.data;
  },
};
