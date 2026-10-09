'use client';

import React, { useEffect, useState } from 'react';
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
  Package,
} from 'lucide-react';
import type { PartyMemberHUDState, AtmosphereState, Combatant } from '@/lib/dm-types';
import type { CustomNPC } from '@/lib/npc-types';
import { useCharacter } from '@/app/providers';
import DMPartyRosterView from './DMPartyRosterView';
import DMCombatEngine from './DMCombatEngine';
import DMCampaignChronicle from './DMCampaignChronicle';
import DMRulesReference from './DMRulesReference';
import DMNPCCodex from './DMNPCCodex';
import DMShopManager from './DMShopManager';
import DMPartyInventoryManager from './DMPartyInventoryManager';
import DMLoreManager from './DMLoreManager';
import DMLoreEditorModal from './DMLoreEditorModal';
import DMPartyVitalsDock from './DMPartyVitalsDock';
import DMSlideOverTools from './DMSlideOverTools';
import { npcToCombatant } from '@/lib/dm-combat';

export type DMWorkspaceTab = 'roster' | 'combat' | 'npcs' | 'shops' | 'chronicle' | 'lore' | 'rules';

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

  // Party Inventory & Equipment Manager Modal State
  const [inventoryCharId, setInventoryCharId] = useState<string | null>(null);

  // Quick Character Lore Editor Modal State
  const [loreModalCharId, setLoreModalCharId] = useState<string | null>(null);

  // Combat queue for sending NPCs directly into encounter
  const [queuedCombatants, setQueuedCombatants] = useState<Combatant[]>([]);

  const handleSendNPCToCombat = (npc: CustomNPC) => {
    const newCombatant = npcToCombatant(npc);
    setQueuedCombatants((prev) => [...prev, newCombatant]);
    setActiveTab('combat');
  };

  // Atmosphere & Secret Dice Drawer State
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

  // Keyboard shortcuts: 'D' for tools drawer, '1'-'7' for tabs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isInput) return;

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsToolsOpen((prev) => !prev);
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabIndex = parseInt(e.key, 10) - 1;
        const tabIds: DMWorkspaceTab[] = ['roster', 'combat', 'npcs', 'shops', 'chronicle', 'lore', 'rules'];
        if (tabIds[tabIndex]) {
          e.preventDefault();
          setActiveTab(tabIds[tabIndex]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const TABS: Array<{
    id: DMWorkspaceTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
      {
        id: 'roster',
        label: 'Party Roster',
        shortLabel: 'Party',
        icon: Users,
        badge: partyMembers.length,
        badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      },
      {
        id: 'combat',
        label: 'Tactical Combat',
        shortLabel: 'Combat',
        icon: Swords,
      },
      {
        id: 'npcs',
        label: 'NPCs & Monsters',
        shortLabel: 'NPCs',
        icon: Skull,
        badge: customNPCs.length,
        badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
      },
      {
        id: 'shops',
        label: 'Shops & Markets',
        shortLabel: 'Shops',
        icon: Store,
        badge: campaignShops.length,
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      },
      {
        id: 'chronicle',
        label: 'Campaign Chronicle',
        shortLabel: 'Notes',
        icon: Scroll,
        badge: dmNotes.length,
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
      },
      {
        id: 'lore',
        label: 'Character Lore',
        shortLabel: 'Lore',
        icon: BookOpen,
        badge: partyMembers.length,
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      },
      {
        id: 'rules',
        label: 'Rules SRD',
        shortLabel: 'Rules',
        icon: Scroll,
      },
    ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-[#07080b] text-zinc-200">
      {/* 1. Refactored 2-Tier Command Header */}
      <header className="bg-[#08090d]/95 border-b border-amber-500/20 backdrop-blur-md sticky top-0 z-40 shadow-lg font-mono">
        {/* Tier 1: Brand, Status, Quick Tools & Actions */}
        <div className="px-3 sm:px-5 py-2 border-b border-zinc-800/60">
          <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
            {/* Left: Navigation & Campaign Status */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {onBackToMenu && (
                <button
                  onClick={onBackToMenu}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0"
                  title="Return to Guildhall"
                >
                  <span>&larr;</span>
                  <span className="hidden sm:inline">Guildhall</span>
                </button>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xs">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <h1 className="hidden sm:inline text-xs font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider whitespace-nowrap">
                    DM Sanctum
                  </h1>
                </div>
              </div>

              {/* Status capsule - shown on xl desktop to preserve space for controls on tablets & mobile */}
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 truncate">
                <span className="text-amber-300 font-bold">Session {atmosphere.sessionNumber}</span>
                <span className="text-zinc-600">&bull;</span>
                <span>Day {atmosphere.inGameDay}</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-300 truncate">{atmosphere.timeOfDay}, {atmosphere.weather}</span>
              </div>
            </div>

            {/* Right: Quick Tools, Rest, Custom Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Quick Party Gear & Inventory Manager */}
              <button
                onClick={() => setInventoryCharId(partyMembers[0]?.id || 'vesper')}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                title="Inspect and edit equipment and inventory for party members"
              >
                <Package size={13} className="text-amber-400" />
                <span className="hidden md:inline">Gear</span>
              </button>

              {/* Secret Dice & Atmosphere Slide-Over Drawer Toggle */}
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${isToolsOpen
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                title="Toggle Secret Dice Roller & Atmosphere (Hotkey: D)"
              >
                <Dices size={13} className={isToolsOpen ? 'text-black' : 'text-amber-400'} />
                <span className="hidden sm:inline font-bold">Tools</span>
                <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 border border-white/10 opacity-75">
                  D
                </kbd>
              </button>

              {/* Quick Bulk Rest Trigger */}
              {onBulkRest && (
                <div className="relative">
                  <button
                    onClick={() => setIsRestMenuOpen(!isRestMenuOpen)}
                    className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                    title="Trigger Party Rest"
                  >
                    <Sparkles size={12} className="text-amber-400" />
                    <span className="hidden sm:inline">Rest</span>
                    <ChevronDown
                      size={11}
                      className={`transition-transform text-zinc-500 ${isRestMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isRestMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsRestMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0d0f17] border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 font-mono text-xs space-y-1 animate-pop-in">
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
        </div>

        {/* Tier 2: Symmetrical Workspace Navigation Bar */}
        <div className="px-3 sm:px-5 py-1.5 overflow-x-auto no-scrollbar bg-black/40">
          <div className="w-full max-w-[1720px] mx-auto flex items-center gap-1">
            <nav className="flex items-center gap-1 font-mono text-xs w-full">
              {TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${isActive
                        ? 'bg-amber-500 text-black border border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                      }`}
                  >
                    <Icon size={13} className={isActive ? 'text-black' : 'text-zinc-400'} />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full border ${isActive
                            ? 'bg-black/30 text-black border-black/30 font-bold'
                            : tab.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                    <span className="hidden xl:inline text-[9px] opacity-40">
                      ({idx + 1})
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Persistent Party Vitals Mini-Dock (visible across all tabs for instant HP/AC/senses access) */}
      <DMPartyVitalsDock
        partyMembers={partyMembers}
        onUpdatePartyHP={onUpdatePartyHP}
        onTogglePartyCondition={onTogglePartyCondition}
        onToggleInspiration={onToggleInspiration}
      />

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
            onOpenLoreEditor={(charId) => setLoreModalCharId(charId)}
            onOpenInventory={(charId) => setInventoryCharId(charId)}
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
              customNPCs={customNPCs}
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

        {/* WORKSPACE 6: CHARACTER LORE & DOSSIERS CODEX */}
        {activeTab === 'lore' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMLoreManager />
          </div>
        )}

        {/* WORKSPACE 7: 5E RULES & CONDITIONS REFERENCE */}
        {activeTab === 'rules' && (
          <div className="flex-1 min-h-[640px] h-[calc(100vh-9.5rem)] rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md overflow-hidden">
            <DMRulesReference />
          </div>
        )}
      </main>

      {/* 3. DM Party Inventory & Equipment Modal */}
      {inventoryCharId && (
        <DMPartyInventoryManager
          initialCharacterId={inventoryCharId}
          onClose={() => setInventoryCharId(null)}
        />
      )}

      {/* 4. DM Character Lore & Dossier Modal */}
      {loreModalCharId && (
        <DMLoreEditorModal
          isOpen={true}
          initialCharacterId={loreModalCharId}
          onClose={() => setLoreModalCharId(null)}
        />
      )}

      {/* 5. Secret Dice & Atmosphere Slide-Over Drawer */}
      <DMSlideOverTools
        open={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        atmosphere={atmosphere}
        onUpdateAtmosphere={(updates) => setAtmosphere((prev) => ({ ...prev, ...updates }))}
      />
    </div>
  );
}
