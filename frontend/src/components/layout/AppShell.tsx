import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNavigation } from './SidebarNavigation';
import { Header } from './Header';
import { ComposeModal } from '../compose/ComposeModal';
import { PanelResizer } from '../ui/PanelResizer';
import { GlobalLoadingIndicator } from '../common/GlobalLoadingIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const DEFAULT_SIDEBAR_WIDTH = 260;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 380;

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('auramail_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const handleSidebarResize = (deltaX: number) => {
    setSidebarWidth((prev) => {
      const next = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, prev + deltaX));
      return next;
    });
  };

  const handleSidebarResizeEnd = () => {
    try {
      localStorage.setItem('auramail_sidebar_width', sidebarWidth.toString());
    } catch {}
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Desktop Sidebar (User-Resizable Left Panel) */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="hidden md:flex shrink-0 h-full flex-col z-20 transition-[width] duration-75 ease-out"
      >
        <SidebarNavigation />
      </aside>

      {/* Resizer Splitter between Sidebar & Main Content */}
      <PanelResizer
        onResize={handleSidebarResize}
        onResizeEnd={handleSidebarResizeEnd}
        className="hidden md:flex"
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              className="relative w-72 max-w-[85vw] bg-slate-900 h-full z-10 shadow-2xl flex flex-col"
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarNavigation onItemClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 flex overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* Global Compose Modal */}
      <ComposeModal />

      {/* Real-time Global Pending / Loading Indicator */}
      <GlobalLoadingIndicator />
    </div>
  );
}
