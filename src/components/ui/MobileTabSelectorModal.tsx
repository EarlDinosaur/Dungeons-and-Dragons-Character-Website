'use client';

import React, { useEffect } from 'react';
import { X, Check, ArrowLeft, Swords } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { useCharacterTabs } from './TabNavigation';
import { useCharacter } from '@/app/providers';

interface MobileTabSelectorModalProps {
  isOpen: boolean;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onClose: () => void;
}

export default function MobileTabSelectorModal({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
}: MobileTabSelectorModalProps) {
  const { tabs, character, aria, cyrus, wynel, kastoriel, isVesper, isAria, isCyrus, isWynel, isKastoriel } = useCharacterTabs();
  const { navigateToMenu, navigateToDM } = useCharacter();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const charName = isVesper
    ? (character?.name || 'Vesper Ashwood')
    : isAria
    ? (aria?.name || 'Aria')
    : isCyrus
    ? (cyrus?.name || 'Cyrus')
    : isWynel
    ? (wynel?.name || 'Wynel')
    : isKastoriel
    ? (kastoriel?.name || 'Kastoriel')
    : (character?.name || 'Hero');

  const charLevel = isVesper
    ? character?.level || 1
    : isAria
    ? aria?.level || 1
    : isCyrus
    ? cyrus?.level || 1
    : isWynel
    ? wynel?.level || 1
    : isKastoriel
    ? kastoriel?.level || 1
    : character?.level || 1;

  const charClass = isVesper
    ? character?.class || 'Rogue'
    : isAria
    ? aria?.characterClass || 'Sorcerer'
    : isCyrus
    ? cyrus?.characterClass || 'Oracle'
    : isWynel
    ? wynel?.characterClass || 'Warlock'
    : isKastoriel
    ? kastoriel?.characterClass || 'Druid'
    : character?.class || 'Adventurer';

  const handleSelect = (tabId: TabId) => {
    onTabChange(tabId);
    onClose();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Character Sheet Navigation Menu"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#0b0d14]/95 border border-zinc-800 p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-md animate-scale-up max-h-[85vh] overflow-y-auto space-y-4"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              Character Navigation
            </span>
            <h2 className="text-base font-bold font-[family-name:var(--font-heading)] text-amber-300">
              {charName}
            </h2>
            <span className="text-[11px] font-mono text-zinc-400">
              Level {charLevel} {charClass}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Menu"
            aria-label="Close Navigation Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* TAB OPTIONS (D&D BEYOND 2-COLUMN GRID) */}
        <div className="grid grid-cols-2 gap-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                className={`w-full p-3 rounded-xl border flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer relative group ${
                  isActive
                    ? 'bg-gradient-to-br from-red-950/70 to-zinc-900 border-red-500/80 text-amber-300 shadow-[0_0_15px_rgba(220,38,38,0.25)] ring-1 ring-red-500/40'
                    : 'bg-[#12141e]/70 hover:bg-[#181c2b] border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800/60 text-zinc-400 group-hover:text-amber-300'}`}>
                    <Icon size={18} />
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/60">
                      <Check size={10} />
                      ACTIVE
                    </span>
                  )}
                </div>

                <span className="font-[family-name:var(--font-heading)] uppercase text-xs font-bold tracking-wider truncate w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* GLOBAL DESTINATIONS */}
        <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              navigateToMenu();
            }}
            className="py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>Guildhall</span>
          </button>
          <button
            onClick={() => {
              onClose();
              navigateToDM();
            }}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 text-amber-300 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer shadow-xs"
          >
            <Swords size={13} className="text-amber-400" />
            <span>DM Console</span>
          </button>
        </div>

        {/* DISMISS BUTTON */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white font-[family-name:var(--font-heading)] uppercase text-xs font-bold tracking-wider transition-colors cursor-pointer border border-zinc-800/80"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
}
