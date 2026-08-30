import React from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isPending = isFetching > 0 || isMutating > 0;

  let message = 'Syncing mailbox...';
  if (isMutating > 0) {
    message = 'Applying changes...';
  } else if (isFetching > 0) {
    message = 'Updating messages...';
  }

  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-indigo-200 text-xs font-medium backdrop-blur-xl shadow-2xl shadow-indigo-950/50 pointer-events-none"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>

          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
