'use client';

import React, { useState } from 'react';
import {
  Users,
  Swords,
  Scroll,
  BookOpen,
  CloudSun,
  Dices,
  ChevronDown,
  Sparkles,
  Sliders,
  Shield,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Skull,
  Store,
} from 'lucide-react';
import type { PartyMemberHUDState, AtmosphereState, Combatant } from '@/lib/dm-types';
import type { CustomNPC } from '@/lib/npc-types';
import { useCharacter } from '@/app/providers';
import DMPartyRosterView from './DMPartyRosterView';
import DMCombatEngine from './DMCombatEngine';
import DMCampaignChronicle from './DMCampaignChronicle';
import DMRulesReference from './DMRulesReference';
import DMAtmosphereBar from './DMAtmosphereBar';
import DMNPCCodex from './DMNPCCodex';
import DMShopManager from './DMShopManager';

export type DMWorkspaceTab = 'roster' | 'combat' | 'npcs' | 'shops' | 'chronicle' | 'rules';

interface DMDashboardGridProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, hp: number, tempHp?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  onToggleInspiration: (charId: string) => void;
  onTriggerRest: (charId: string, type: 'short' | 'long') => void;
  onBulkRest?: (type: 'short' | 'long') => void;
  onInspectCharacter?: (charId: string) => void;
  onBackToMenu?: () => void;
  customHeaderActions?: React.ReactNode;
}

export default function DMDashboardGrid({
  partyMembers,
  onUpdatePartyHP,
  onTogglePartyCondition,
  onToggleInspiration,
  onTriggerRest,
  onBulkRest,
  onInspectCharacter,
  onBackToMenu,
  customHeaderActions,
}: DMDashboardGridProps) {
  const {
    dmNotes,
    addDMNote,
    updateDMNote,
    deleteDMNote,
    toggleNoteVisibility,
    customNPCs,
    addCustomNPC,
    updateCustomNPC,
    deleteCustomNPC,
    toggleNPCPlayerVisibility,
    campaignShops,
    addShop,
    updateShop,
    deleteShop,
    addShopItem,
    updateShopItem,
    deleteShopItem,
  } = useCharacter();

  // Active Workspace Tab (Default to Party Roster)
  const [activeTab, setActiveTab] = useState<DMWorkspaceTab>('roster');

  // Combat queue for sending NPCs directly into encounter
  const [queuedCombatants, setQueuedCombatants] = useState<Combatant[]>([]);

  const handleSendNPCToCombat = (npc: CustomNPC) => {
    const initBonus = npc.initiativeBonus ?? Math.floor((npc.stats.dex - 10) / 2);
    const rolledInit = Math.floor(Math.random() * 20) + 1 + initBonus;
    const newCombatant: Combatant = {
      id: `npc-${npc.id}-${Date.now()}`,
      name: npc.name,
      isPlayer: false,
      avatarUrl: npc.portraitUrl,
      initiative: rolledInit,
      initiativeModifier: initBonus,
      ac: npc.ac,
      currentHP: npc.hp,
      maxHP: npc.maxHP,
      tempHP: 0,
      conditions: [],
      crOrLevel: npc.cr ? `CR ${npc.cr}` : (npc.category === 'boss' ? 'Boss' : 'NPC'),
      notes: `${npc.creatureType}${npc.alignment ? ` • ${npc.alignment}` : ''}`,
    };

    setQueuedCombatants((prev) => [...prev, newCombatant]);
    setActiveTab('combat');
  };

  // Atmosphere & Secret Dice Drawer/Panel State
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [atmosphere, setAtmosphere] = useState<AtmosphereState>({
    sessionNumber: 12,
    inGameDay: 48,
    timeOfDay: 'Dusk',
    weather: 'Dense Fog',
    locationName: 'The Sunken Crypts of Ashenford',
  });

  // Bulk Rest Dropdown
  const [isRestMenuOpen, setIsRestMenuOpen] = useState<boolean>(false);

  const TABS: Array<{
    id: DMWorkspaceTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'roster',
      label: 'Party Roster',
      icon: Users,
      badge: partyMembers.length,
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    },
    {
      id: 'combat',
      label: 'Combat',
      icon: Swords,
    },
    {
      id: 'npcs',
      label: 'NPCs & Monsters',
      icon: Skull,
      badge: customNPCs.length,
      badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    },
    {
      id: 'shops',
      label: 'Shops & Markets',
      icon: Store,
      badge: campaignShops.length,
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    },
    {
      id: 'chronicle',
      label: 'Chronicle',
      icon: Scroll,
      badge: dmNotes.length,
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    },
    {
      id: 'rules',
      label: 'Rules SRD',
      icon: BookOpen,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-[#07080b] text-zinc-200">
      {/* 1. Primary DM Command Header Bar */}
      <header className="px-4 py-2.5 bg-[#08090d]/95 border-b border-amber-500/20 backdrop-blur-md sticky top-0 z-40 shadow-lg">
        <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-xs font-mono font-medium transition-colors cursor-pointer shadow-xs shrink-0"
                title="Return to Hero Vault"
              >
                <span>&larr;</span>
                <span className="hidden sm:inline">Guildhall</span>
              </button>
            )}

            <div className="flex items-center gap-2 pr-2 border-r border-zinc-800/80 shrink-0">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xs">
                <Shield size={15} />
              </div>
              <div>
                <h1 className="text-xs font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider whitespace-nowrap">
                  DM Sanctum
                </h1>
                <p className="text-[9px] text-zinc-400 font-mono hidden xl:block whitespace-nowrap">
                  Session {atmosphere.sessionNumber} &bull; Day {atmosphere.inGameDay}
                </p>
              </div>
            </div>

            {/* Focused Workspace Switcher Tabs */}
            <nav className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/90 font-mono text-xs shadow-inner shrink-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/15 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border border-transparent'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-amber-400' : 'text-zinc-500'} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                          isActive
                            ? 'bg-amber-500/30 text-amber-200 border-amber-400/50 font-bold'
                            : tab.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Tools Toggle, Rest Actions & Injected Page Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Atmosphere & Secret Dice Drawer Toggle */}
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                isToolsOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-bold'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Toggle Environment Atmosphere & Quick Secret Dice Roller"
            >
              <Dices size={13} className="text-amber-400" />
              <span className="font-bold">Tools</span>
              <span className="hidden 2xl:inline text-zinc-400 text-[10px]">
                {atmosphere.timeOfDay} &bull; {atmosphere.weather}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 transition-transform ${
                  isToolsOpen ? 'rotate-180' : ''
                }`}
              >
                &darr;
              </span>
            </button>

            {/* Quick Bulk Rest Trigger */}
            {onBulkRest && (
              <div className="relative">
                <button
                  onClick={() => setIsRestMenuOpen(!isRestMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-xs font-mono font-medium transition-colors cursor-pointer"
                  title="Trigger Party Rest"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Rest</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform text-zinc-500 ${isRestMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isRestMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsRestMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0d0f17] border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-30 font-mono text-xs space-y-1">
                      <button
                        onClick={() => {
                          onBulkRest('short');
                          setIsRestMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 cursor-pointer transition-colors text-left"
                      >
                        <span className="font-bold">Party Short Rest</span>
                        <span className="text-[10px] text-zinc-500">1 Hr</span>
                      </button>
                      <button
                        onClick={() => {
                          onBulkRest('long');
                          setIsRestMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-amber-500/10 text-zinc-300 hover:text-amber-400 cursor-pointer transition-colors text-left"
                      >
                        <span className="font-bold">Party Long Rest</span>
                        <span className="text-[10px] text-zinc-500">8 Hr</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Injected Actions (Sync Status, Change Passcode, Lock Sanctum) */}
            {customHeaderActions}
          </div>
        </div>

        {/* Collapsible Atmosphere & Quick Secret Dice Drawer */}
        {isToolsOpen && (
          <div className="w-full max-w-[1720px] mx-auto mt-2.5 pt-2.5 border-t border-zinc-800/80 animate-fade-in">
            <div className="relative">
              <DMAtmosphereBar
                atmosphere={atmosphere}
                onUpdateAtmosphere={(updates) => setAtmosphere((prev) => ({ ...prev, ...updates }))}
              />
              <button
                onClick={() => setIsToolsOpen(false)}
                className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Collapse Tools"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Workspace: Render Only the Active Tab for Neat, Spacious Layout */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-5 flex flex-col min-h-0">
        {/* WORKSPACE 1: PARTY ROSTER (Matrix Table & Sleek Cards) */}
        {activeTab === 'roster' && (
          <DMPartyRosterView
            partyMembers={partyMembers}
            onUpdatePartyHP={onUpdatePartyHP}
            onTogglePartyCondition={onTogglePartyCondition}
            onToggleInspiration={onToggleInspiration}
            onTriggerRest={onTriggerRest}
            onInspectCharacter={onInspectCharacter}
          />
        )}

        {/* WORKSPACE 2: TACTICAL COMBAT ENGINE */}
        {activeTab === 'combat' && (
          <div className="flex-1 rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md p-4 sm:p-5 flex flex-col min-h-0">
            <DMCombatEngine
              partyMembers={partyMembers}
              onUpdatePartyHP={onUpdatePartyHP}
              onTogglePartyCondition={onTogglePartyCondition}
              externalCombatants={queuedCombatants}
              onClearExternalCombatants={() => setQueuedCombatants([])}
            />
          </div>
        )}

        {/* WORKSPACE 3: NPC & MONSTER CODEX */}
        {activeTab === 'npcs' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMNPCCodex
              npcs={customNPCs}
              onAddNPC={addCustomNPC}
              onUpdateNPC={updateCustomNPC}
              onDeleteNPC={deleteCustomNPC}
              onToggleVisibility={toggleNPCPlayerVisibility}
              onSendToCombat={handleSendNPCToCombat}
            />
          </div>
        )}

        {/* WORKSPACE 4: CAMPAIGN SHOPS & MERCHANTS */}
        {activeTab === 'shops' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMShopManager
              shops={campaignShops}
              onAddShop={addShop}
              onUpdateShop={updateShop}
              onDeleteShop={deleteShop}
              onAddItem={addShopItem}
              onUpdateItem={updateShopItem}
              onDeleteItem={deleteShopItem}
            />
          </div>
        )}

        {/* WORKSPACE 5: CAMPAIGN CHRONICLE & LINKED CHARACTER DISPATCHES */}
        {activeTab === 'chronicle' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMCampaignChronicle
              notes={dmNotes}
              partyMembers={partyMembers}
              onAddNote={addDMNote}
              onUpdateNote={updateDMNote}
              onDeleteNote={deleteDMNote}
              onToggleVisibility={toggleNoteVisibility}
            />
          </div>
        )}

        {/* WORKSPACE 6: 5E RULES & CONDITIONS REFERENCE */}
        {activeTab === 'rules' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMRulesReference />
          </div>
        )}
      </main>
    </div>
  );
}
