'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Maximize2,
  Minimize2,
  Plus,
  X,
  Sparkles,
  Shield,
  Heart,
  Swords,
  BookOpen,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Move,
  Tag,
  RotateCcw,
  Sliders,
  FileText,
  Activity,
} from 'lucide-react';
import type {
  GridWidgetConfig,
  LayoutPresetId,
  PartyMemberHUDState,
  ScratchpadNote,
} from '@/lib/dm-types';
import DMPartyHUDCard from './DMPartyHUDCard';

const DEFAULT_PRESETS: Record<LayoutPresetId, GridWidgetConfig[]> = {
  combat: [
    { id: 'w-party', type: 'party_hud', title: 'Party Status HUD', colSpan: 3, rowSpan: 2, order: 0 },
    { id: 'w-initiative', type: 'initiative_tracker', title: 'Combat Initiative & Turns', colSpan: 1, rowSpan: 2, order: 1 },
    { id: 'w-combat', type: 'combat_actions', title: 'Quick Actions & Saves', colSpan: 2, rowSpan: 1, order: 2 },
    { id: 'w-dice', type: 'dice_roller', title: 'DM Dice & Checks', colSpan: 2, rowSpan: 1, order: 3 },
  ],
  social: [
    { id: 'w-party', type: 'party_hud', title: 'Party Passive Senses & Lore', colSpan: 2, rowSpan: 2, order: 0 },
    { id: 'w-notes', type: 'scratchpad', title: 'Contextual Session Log', colSpan: 2, rowSpan: 2, order: 1 },
    { id: 'w-compendium', type: 'rule_compendium', title: 'NPC & Location Compendium', colSpan: 4, rowSpan: 1, order: 2 },
  ],
  prep: [
    { id: 'w-notes', type: 'scratchpad', title: 'DM Campaign Ledger', colSpan: 2, rowSpan: 2, order: 0 },
    { id: 'w-compendium', type: 'rule_compendium', title: 'SRD Rules & Monster Vault', colSpan: 2, rowSpan: 2, order: 1 },
    { id: 'w-progression', type: 'progression_overrides', title: 'XP & Milestone Engine', colSpan: 4, rowSpan: 1, order: 2 },
  ],
  custom: [
    { id: 'w-party', type: 'party_hud', title: 'Party HUD', colSpan: 2, rowSpan: 2, order: 0 },
    { id: 'w-initiative', type: 'initiative_tracker', title: 'Initiative', colSpan: 2, rowSpan: 1, order: 1 },
    { id: 'w-notes', type: 'scratchpad', title: 'Scratchpad', colSpan: 2, rowSpan: 1, order: 2 },
  ],
};

interface DMDashboardGridProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, hp: number, tempHp?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  onToggleInspiration: (charId: string) => void;
  onTriggerRest: (charId: string, type: 'short' | 'long') => void;
  onBulkRest?: (type: 'short' | 'long') => void;
  onInspectCharacter?: (charId: string) => void;
  onBackToMenu?: () => void;
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
}: DMDashboardGridProps) {
  // Preset & Widget State
  const [activePreset, setActivePreset] = useState<LayoutPresetId>('combat');
  const [widgets, setWidgets] = useState<GridWidgetConfig[]>(DEFAULT_PRESETS.combat);

  // Side Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'notes' | 'compendium' | 'logs'>('notes');

  // Scratchpad Note State with [[Entity]] and #tag tracking
  const [scratchText, setScratchText] = useState<string>(
    '#clue The shadows around [[Vesper Ashwood]] pulse with necromantic resonance.\n@spell Misty Step was cast to evade the city watch.'
  );
  const [searchFilter, setSearchFilter] = useState('');

  // Switch Presets
  const handleSelectPreset = (preset: LayoutPresetId) => {
    setActivePreset(preset);
    setWidgets(DEFAULT_PRESETS[preset]);
  };

  // Reorder & Resize Helpers
  const handleToggleColSpan = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w;
        const nextSpan = w.colSpan >= 4 ? 1 : w.colSpan + 1;
        return { ...w, colSpan: nextSpan };
      })
    );
  };

  const handleToggleMinimize = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleAddWidget = (type: GridWidgetConfig['type']) => {
    const newWidget: GridWidgetConfig = {
      id: `w-${type}-${Date.now()}`,
      type,
      title: type.replace('_', ' ').toUpperCase(),
      colSpan: 2,
      rowSpan: 1,
      order: widgets.length,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  // Auto-linked Preview Generator for Scratchpad
  const parsedEntitiesAndTags = useMemo(() => {
    const entityMatches = Array.from(scratchText.matchAll(/\[\[(.*?)\]\]/g)).map((m) => m[1]);
    const spellMatches = Array.from(scratchText.matchAll(/@([a-zA-Z0-9_-]+)/g)).map((m) => m[1]);
    const tagMatches = Array.from(scratchText.matchAll(/#([a-zA-Z0-9_-]+)/g)).map((m) => m[1]);
    return {
      entities: Array.from(new Set(entityMatches)),
      spells: Array.from(new Set(spellMatches)),
      tags: Array.from(new Set(tagMatches)),
    };
  }, [scratchText]);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col bg-[#07080b] text-zinc-200">
      {/* 1. DM Control Bar & Preset Navigation */}
      <header className="p-3 bg-[#0a0c12]/95 border-b border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 text-xs font-mono font-medium transition-colors cursor-pointer shadow-xs"
            >
              <span>&larr;</span>
              <span>Guildhall</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sliders size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider">
                DM Tactical Command
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono">Live Campaign Orchestrator</p>
            </div>
          </div>

          {/* Layout Preset Chips */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono overflow-x-auto">
            {(['combat', 'social', 'prep', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize font-medium ${
                  activePreset === preset
                    ? 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Global DM Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onBulkRest && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onBulkRest('short')}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Trigger Short Rest for all party members"
              >
                Party SR
              </button>
              <button
                onClick={() => onBulkRest('long')}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Trigger Long Rest for all party members"
              >
                Party LR
              </button>
            </div>
          )}

          {/* Add Widget Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer">
              <Plus size={13} />
              <span>Add Widget</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#0e1017] border border-zinc-800 rounded-lg shadow-xl p-1 hidden group-hover:block z-30 text-xs font-mono">
              <button
                onClick={() => handleAddWidget('party_hud')}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer"
              >
                Party HUD
              </button>
              <button
                onClick={() => handleAddWidget('initiative_tracker')}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer"
              >
                Initiative Tracker
              </button>
              <button
                onClick={() => handleAddWidget('scratchpad')}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer"
              >
                Scratchpad
              </button>
            </div>
          </div>

          {/* Toggle Collapsible Drawer */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
              isDrawerOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <FileText size={13} />
            <span>Notes</span>
            {isDrawerOpen ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modular Grid Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
            {widgets.map((widget) => {
              const colClass =
                widget.colSpan === 4
                  ? 'md:col-span-2 lg:col-span-4'
                  : widget.colSpan === 3
                  ? 'md:col-span-2 lg:col-span-3'
                  : widget.colSpan === 2
                  ? 'md:col-span-2'
                  : 'col-span-1';

              return (
                <section
                  key={widget.id}
                  className={`${colClass} flex flex-col rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md transition-all`}
                >
                  {/* Panel Title Bar */}
                  <div className="p-3 bg-[#0d0f17] border-b border-zinc-800/80 rounded-t-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Move size={13} className="text-zinc-600 cursor-grab" />
                      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        {widget.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500">
                      {/* Resize Width */}
                      <button
                        onClick={() => handleToggleColSpan(widget.id)}
                        className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                        title={`Current span: ${widget.colSpan}/4 columns. Click to expand.`}
                      >
                        <Maximize2 size={12} />
                      </button>

                      {/* Minimize Content */}
                      <button
                        onClick={() => handleToggleMinimize(widget.id)}
                        className="p-1 hover:text-zinc-300 transition-colors cursor-pointer"
                        title={widget.minimized ? 'Expand panel' : 'Minimize panel'}
                      >
                        <Minimize2 size={12} />
                      </button>

                      {/* Close Widget */}
                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="p-1 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove widget"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Panel Body Content */}
                  {!widget.minimized && (
                    <div className="p-3 flex-1">
                      {/* WIDGET 1: PARTY STATUS HUD */}
                      {widget.type === 'party_hud' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {partyMembers.map((member) => (
                            <DMPartyHUDCard
                              key={member.id}
                              member={member}
                              onUpdateHP={onUpdatePartyHP}
                              onToggleCondition={onTogglePartyCondition}
                              onToggleInspiration={onToggleInspiration}
                              onTriggerRest={onTriggerRest}
                              onInspectSheet={onInspectCharacter}
                            />
                          ))}
                        </div>
                      )}

                      {/* WIDGET 2: INITIATIVE TRACKER */}
                      {widget.type === 'initiative_tracker' && (
                        <div className="space-y-2 font-mono text-xs">
                          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase pb-1 border-b border-zinc-800">
                            <span>Combatant</span>
                            <span>Init &bull; HP</span>
                          </div>
                          {partyMembers.map((pm) => (
                            <div
                              key={pm.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/40 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pm.primaryColor }} />
                                <span className="font-bold text-zinc-200">{pm.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-bold">
                                  {pm.initiativeBonus >= 0 ? `+${pm.initiativeBonus}` : pm.initiativeBonus}
                                </span>
                                <span className="text-zinc-400">
                                  {pm.currentHP}/{pm.maxHP}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* WIDGET 3: CONTEXTUAL SCRATCHPAD */}
                      {widget.type === 'scratchpad' && (
                        <div className="space-y-2 font-mono text-xs">
                          <textarea
                            value={scratchText}
                            onChange={(e) => setScratchText(e.target.value)}
                            rows={6}
                            placeholder="Write live session notes with [[Character]] and #tags..."
                            className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400 leading-relaxed resize-y"
                          />
                        </div>
                      )}

                      {/* WIDGET 4: GENERIC / COMPENDIUM PLACEHOLDER */}
                      {widget.type === 'rule_compendium' && (
                        <div className="p-3 text-center text-zinc-500 font-mono text-xs">
                          <Search size={18} className="mx-auto mb-1 text-zinc-600" />
                          <p>SRD 5.1 Compendium &amp; Monster Search active in side drawer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </main>

        {/* 3. Collapsible Side Drawer (Slide-in on mobile, fixed-width on desktop) */}
        {isDrawerOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            />

            <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 md:relative md:inset-auto md:z-30 bg-[#0a0c12] border-l border-zinc-800/80 flex flex-col shadow-2xl animate-fade-in">
              {/* Drawer Top Bar with Mobile Close */}
              <div className="flex items-center justify-between border-b border-zinc-800 text-xs font-mono">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => setDrawerTab('notes')}
                    className={`flex-1 py-2.5 text-center font-bold border-b-2 cursor-pointer transition-colors ${
                      drawerTab === 'notes'
                        ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Scratchpad
                  </button>
                  <button
                    onClick={() => setDrawerTab('compendium')}
                    className={`flex-1 py-2.5 text-center font-bold border-b-2 cursor-pointer transition-colors ${
                      drawerTab === 'compendium'
                        ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    SRD Ref
                  </button>
                  <button
                    onClick={() => setDrawerTab('logs')}
                    className={`flex-1 py-2.5 text-center font-bold border-b-2 cursor-pointer transition-colors ${
                      drawerTab === 'logs'
                        ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Sync Logs
                  </button>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="md:hidden p-2 text-zinc-400 hover:text-white cursor-pointer"
                  title="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {drawerTab === 'notes' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Active Session Markdown
                      </span>
                      <textarea
                        value={scratchText}
                        onChange={(e) => setScratchText(e.target.value)}
                        rows={8}
                        className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none focus:border-amber-400"
                      />
                    </div>

                    {/* Auto-Discovered Entity Cards */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Auto-Linked Entities ([[Name]], @Spell, #Tags)
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {parsedEntitiesAndTags.entities.map((ent) => (
                          <span
                            key={ent}
                            className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1"
                          >
                            <BookOpen size={10} /> {ent}
                          </span>
                        ))}

                        {parsedEntitiesAndTags.spells.map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-800/60 text-sky-300 text-[10px] font-mono font-bold flex items-center gap-1"
                          >
                            <Sparkles size={10} /> @{sp}
                          </span>
                        ))}

                        {parsedEntitiesAndTags.tags.map((tg) => (
                          <span
                            key={tg}
                            className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1"
                          >
                            <Tag size={10} /> #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'compendium' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search SRD spells, monsters, rules..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white focus:border-amber-400"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
                      <strong className="text-zinc-200 block mb-1">Misty Step</strong>
                      <p className="text-[11px] text-zinc-500">2nd-level Conjuration &bull; Bonus Action &bull; Self (30 ft)</p>
                    </div>
                  </div>
                )}

                {drawerTab === 'logs' && (
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                      <span className="text-zinc-500">[17:42:01]</span>{' '}
                      <span className="text-amber-400">DM Override:</span> Applied 12 Damage to Cyrus
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                      <span className="text-zinc-500">[17:43:15]</span>{' '}
                      <span className="text-purple-400">Player Cast:</span> Aria cast Misty Step
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
