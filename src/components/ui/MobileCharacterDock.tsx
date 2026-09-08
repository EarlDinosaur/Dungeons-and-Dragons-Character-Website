'use client';

import React from 'react';
import { LayoutGrid, ChevronLeft, ChevronRight, Dices } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { useCharacterTabs } from './TabNavigation';

interface MobileCharacterDockProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenTabSelector: () => void;
  onOpenDiceRoller: () => void;
}

export default function MobileCharacterDock({
  activeTab,
  onTabChange,
  onOpenTabSelector,
  onOpenDiceRoller,
}: MobileCharacterDockProps) {
  const { tabs, isVesper, isCyrus, isWynel, isAria } = useCharacterTabs();

  // Find index of current active tab
  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const currentTab = tabs[currentIndex] || tabs[0];

  const handlePrevTab = () => {
    if (tabs.length === 0) return;
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    onTabChange(tabs[prevIndex].id);
  };

  const handleNextTab = () => {
    if (tabs.length === 0) return;
    const nextIndex = (currentIndex + 1) % tabs.length;
    onTabChange(tabs[nextIndex].id);
  };

  // Thematic gradient for primary floating buttons
  const getButtonGradient = () => {
    if (isVesper) return 'from-red-600 to-red-800 border-red-400/40 shadow-[0_4px_20px_rgba(220,38,38,0.5)]';
    if (isWynel) return 'from-rose-600 to-red-900 border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.5)]';
    if (isCyrus) return 'from-amber-600 to-amber-800 border-amber-400/40 shadow-[0_4px_20px_rgba(245,158,11,0.5)]';
    if (isAria) return 'from-purple-600 to-indigo-900 border-purple-400/40 shadow-[0_4px_20px_rgba(168,85,247,0.5)]';
    return 'from-red-600 to-red-800 border-red-400/40 shadow-[0_4px_20px_rgba(220,38,38,0.5)]';
  };

  return (
    <aside
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-4 left-0 right-0 z-40 px-4 md:hidden pointer-events-none"
    >
      <div className="max-w-md mx-auto flex items-end justify-between gap-3">
        {/* LEFT ACTION: SLEEK CIRCULAR D20 DICE ROLLER BUTTON */}
        <div className="pointer-events-auto">
          <button
            onClick={onOpenDiceRoller}
            className={`w-13 h-13 rounded-full bg-gradient-to-br ${getButtonGradient()} border-2 text-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group relative`}
            title="Roll Dice"
            aria-label="Roll Dice"
          >
            <Dices size={24} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
            </span>
          </button>
        </div>

        {/* RIGHT ACTION GROUP: TABS MENU & CHEVRONS */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a0b10]/95 backdrop-blur-md border border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
          {/* Active Tab Mini-Pill */}
          <div className="hidden min-[360px]:flex items-center px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-amber-300 font-bold max-w-[110px] truncate">
            <span className="truncate">{currentTab?.label || 'Stats'}</span>
          </div>

          {/* PREVIOUS TAB BUTTON */}
          <button
            onClick={handlePrevTab}
            className="w-10 h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            title="Previous Tab"
            aria-label="Previous Tab"
          >
            <ChevronLeft size={18} />
          </button>

          {/* 3X3 GRID BUTTON (OPENS TAB SELECTOR MODAL) */}
          <button
            onClick={onOpenTabSelector}
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${getButtonGradient()} border text-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all relative`}
            title="Open Tab Navigation Menu"
            aria-label="Open Navigation Tabs Menu"
          >
            <LayoutGrid size={20} className="text-white drop-shadow-md" />
          </button>

          {/* NEXT TAB BUTTON */}
          <button
            onClick={handleNextTab}
            className="w-10 h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            title="Next Tab"
            aria-label="Next Tab"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
