import React, { createContext, useContext, useState } from 'react';

export interface ComposeDraft {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
  inReplyToEmailId?: string;
  threadId?: string;
  replyAll?: boolean;
  isReply?: boolean;
}

interface ComposeContextType {
  isOpen: boolean;
  draft: ComposeDraft;
  openCompose: (initialData?: Partial<ComposeDraft>) => void;
  closeCompose: () => void;
  updateDraft: (updates: Partial<ComposeDraft>) => void;
  resetDraft: () => void;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

export const ComposeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
  });

  const openCompose = (initialData?: Partial<ComposeDraft>) => {
    if (initialData) {
      setDraft((prev) => ({ ...prev, ...initialData }));
    }
    setIsOpen(true);
  };

  const closeCompose = () => {
    setIsOpen(false);
  };

  const updateDraft = (updates: Partial<ComposeDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    setDraft({
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
    });
  };

  return (
    <ComposeContext.Provider
      value={{
        isOpen,
        draft,
        openCompose,
        closeCompose,
        updateDraft,
        resetDraft,
      }}
    >
      {children}
    </ComposeContext.Provider>
  );
};

export function useCompose() {
  const context = useContext(ComposeContext);
  if (!context) {
    throw new Error('useCompose must be used within a ComposeProvider');
  }
  return context;
}
