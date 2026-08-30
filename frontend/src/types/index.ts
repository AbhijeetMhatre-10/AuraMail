export type AICategory =
  | 'Work'
  | 'Personal'
  | 'Finance'
  | 'Updates'
  | 'Promotions'
  | 'Urgent'
  | 'Spam'
  | 'General';

export type AIPriority = 'urgent' | 'high' | 'medium' | 'low';
export type AIRiskLevel = 'none' | 'low' | 'medium' | 'high';
export type AITone = 'Professional' | 'Friendly' | 'Formal' | 'Concise';

export interface EmailAddress {
  name: string;
  email: string;
  raw?: string;
}

export interface AIAnalysisData {
  _id?: string;
  summary: string;
  category: AICategory;
  categoryConfidence?: number;
  priority: AIPriority;
  priorityScore: number; // 0 - 100
  priorityReason?: string;
  importance: 'high' | 'normal' | 'low';
  spamRisk: AIRiskLevel;
  phishingRisk: AIRiskLevel;
  spamPhishingReasons: string[];
  actionItems: string[];
  deadlines: {
    description: string;
    dueDate?: string;
  }[];
  keyEntities: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  explanation?: string;
  suggestedQuickReplies?: string[];
  generatedSubject?: string;
  analyzedAt?: string;
}

export interface EmailItem {
  _id?: string;
  id?: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  threadId?: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  receivedAt: string | Date;
  labels?: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isSent: boolean;
  isTrash?: boolean;
  hasAttachments?: boolean;
  aiAnalysis?: AIAnalysisData;
}

export interface ThreadConversation {
  id: string;
  subject: string;
  messages: EmailItem[];
  metadata?: {
    messageCount: number;
    lastMessageDate: string;
  };
}

export interface UserProfile {
  _id?: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  isDemoUser?: boolean;
  preferences?: {
    defaultTone: AITone;
    autoSummarize: boolean;
    autoCategorize: boolean;
    theme: 'dark' | 'light' | 'system';
  };
}

export interface ConnectedAccountInfo {
  email: string;
  provider: string;
  isConnected: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string;
  isDemo?: boolean;
}

export interface EmailActivityItem {
  _id?: string;
  id?: string;
  action: string;
  title: string;
  details?: Record<string, any>;
  timestamp: string | Date;
}

export interface SmartSearchResult {
  naturalQuery: string;
  interpretation: string;
  strategy: {
    gmailQuery?: string;
    keywords?: string[];
    category?: string;
    priority?: string;
    unreadOnly?: boolean;
  };
  results: EmailItem[];
  count: number;
  source?: string;
}
