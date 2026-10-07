'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Swords,
  Shield,
  Heart,
  Plus,
  Search,
  Zap,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  Skull,
  Scroll,
  MapPin,
  Flame,
  Info,
  ChevronRight,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import type { CustomNPC, NPCAction, NPCCategory } from '@/lib/npc-types';

interface DMNPCCodexProps {
  npcs: CustomNPC[];
  onAddNPC: (npc: Omit<CustomNPC, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNPC: (id: string, updates: Partial<CustomNPC>) => void;
  onDeleteNPC: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onSendToCombat?: (npc: CustomNPC) => void;
}

const CATEGORY_META: Record<
  NPCCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  friendly: {
    label: 'Friendly Ally',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-500/50',
    icon: '🤝',
  },
  quest: {
    label: 'Quest Giver',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-500/50',
    icon: '📜',
  },
  neutral: {
    label: 'Neutral Contact',
    bg: 'bg-zinc-900/60',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
    icon: '⚖️',
  },
  enemy: {
    label: 'Hostile Monster',
    bg: 'bg-orange-950/40',
    text: 'text-orange-300',
    border: 'border-orange-500/50',
    icon: '⚔️',
  },
  boss: {
    label: 'Campaign Boss',
    bg: 'bg-red-950/50',
    text: 'text-red-300',
    border: 'border-red-500/60',
    icon: '👑',
  },
};

export default function DMNPCCodex({
  npcs,
  onAddNPC,
  onUpdateNPC,
  onDeleteNPC,
  onToggleVisibility,
  onSendToCombat,
}: DMNPCCodexProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(npcs[0]?.id || null);
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNPCId, setEditingNPCId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NPCCategory>('friendly');
  const [formCreatureType, setFormCreatureType] = useState('Humanoid');
  const [formAlignment, setFormAlignment] = useState('Neutral');
  const [formCR, setFormCR] = useState('1');
  const [formAC, setFormAC] = useState(14);
  const [formHP, setFormHP] = useState(30);
  const [formSpeed, setFormSpeed] = useState('30 ft.');
  const [formInitiative, setFormInitiative] = useState(1);
  const [formStr, setFormStr] = useState(14);
  const [formDex, setFormDex] = useState(12);
  const [formCon, setFormCon] = useState(14);
  const [formInt, setFormInt] = useState(10);
  const [formWis, setFormWis] = useState(12);
  const [formCha, setFormCha] = useState(10);
  const [formLocation, setFormLocation] = useState('');
  const [formAffiliation, setFormAffiliation] = useState('');
  const [formPersonality, setFormPersonality] = useState('');
  const [formQuest, setFormQuest] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formShared, setFormShared] = useState(false);
  const [formActions, setFormActions] = useState<NPCAction[]>([]);

  // Action Builder Inside Modal
  const [actionName, setActionName] = useState('');
  const [actionType, setActionType] = useState<NPCAction['type']>('action');
  const [attackType, setAttackType] = useState<NPCAction['attackType']>('melee');
  const [toHit, setToHit] = useState<number>(5);
  const [reachRange, setReachRange] = useState('5 ft.');
  const [damageFormula, setDamageFormula] = useState('1d8 + 3');
  const [damageType, setDamageType] = useState('slashing');
  const [actionDesc, setActionDesc] = useState('');

  const filteredNPCs = useMemo(() => {
    return npcs.filter((npc) => {
      if (activeCategory !== 'all' && npc.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          npc.name.toLowerCase().includes(q) ||
          (npc.title && npc.title.toLowerCase().includes(q)) ||
          npc.creatureType.toLowerCase().includes(q) ||
          (npc.location && npc.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [npcs, activeCategory, searchQuery]);

  // Ensure an NPC is selected if possible
  const selectedNPC = useMemo(() => {
    if (selectedNPCId) {
      const match = npcs.find((n) => n.id === selectedNPCId);
      if (match) return match;
    }
    return filteredNPCs[0] || npcs[0] || null;
  }, [npcs, filteredNPCs, selectedNPCId]);

  const openCreateModal = () => {
    setEditingNPCId(null);
    setFormName('');
    setFormTitle('');
    setFormCategory('friendly');
    setFormCreatureType('Humanoid');
    setFormAlignment('Neutral Good');
    setFormCR('1');
    setFormAC(14);
    setFormHP(30);
    setFormSpeed('30 ft.');
    setFormInitiative(1);
    setFormStr(14);
    setFormDex(12);
    setFormCon(14);
    setFormInt(10);
    setFormWis(12);
    setFormCha(10);
    setFormLocation('');
    setFormAffiliation('');
    setFormPersonality('');
    setFormQuest('');
    setFormNotes('');
    setFormShared(false);
    setFormActions([
      {
        id: `act-${Date.now()}`,
        name: 'Strike',
        type: 'action',
        attackType: 'melee',
        toHit: 4,
        reachRange: '5 ft.',
        damageFormula: '1d6 + 2',
        damageType: 'bludgeoning',
        description: 'Standard weapon attack.',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (npc: CustomNPC) => {
    setEditingNPCId(npc.id);
    setFormName(npc.name);
    setFormTitle(npc.title || '');
    setFormCategory(npc.category);
    setFormCreatureType(npc.creatureType);
    setFormAlignment(npc.alignment || 'Neutral');
    setFormCR(npc.cr || '1');
    setFormAC(npc.ac);
    setFormHP(npc.maxHP);
    setFormSpeed(npc.speed);
    setFormInitiative(npc.initiativeBonus);
    setFormStr(npc.stats.str);
    setFormDex(npc.stats.dex);
    setFormCon(npc.stats.con);
    setFormInt(npc.stats.int);
    setFormWis(npc.stats.wis);
    setFormCha(npc.stats.cha);
    setFormLocation(npc.location || '');
    setFormAffiliation(npc.affiliation || '');
    setFormPersonality(npc.personality || '');
    setFormQuest(npc.questDescription || '');
    setFormNotes(npc.notes || '');
    setFormShared(!!npc.sharedWithPlayers);
    setFormActions(npc.actions || []);
    setIsModalOpen(true);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionName.trim()) return;

    const newAction: NPCAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: actionName.trim(),
      type: actionType,
      attackType,
      toHit: attackType !== 'ability' ? toHit : undefined,
      reachRange,
      damageFormula,
      damageType,
      description: actionDesc.trim() || 'No description provided.',
    };

    setFormActions((prev) => [...prev, newAction]);
    setActionName('');
    setActionDesc('');
  };

  const handleRemoveAction = (actionId: string) => {
    setFormActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  const handleSaveNPC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      title: formTitle.trim() || undefined,
      category: formCategory,
      creatureType: formCreatureType.trim() || 'Humanoid',
      alignment: formAlignment.trim() || undefined,
      cr: formCR.trim() || '1',
      ac: formAC,
      hp: formHP,
      maxHP: formHP,
      speed: formSpeed.trim() || '30 ft.',
      initiativeBonus: formInitiative,
      stats: {
        str: formStr,
        dex: formDex,
        con: formCon,
        int: formInt,
        wis: formWis,
        cha: formCha,
      },
      actions: formActions,
      location: formLocation.trim() || undefined,
      affiliation: formAffiliation.trim() || undefined,
      personality: formPersonality.trim() || undefined,
      questDescription: formQuest.trim() || undefined,
      notes: formNotes.trim() || undefined,
      sharedWithPlayers: formShared,
    };

    if (editingNPCId) {
      onUpdateNPC(editingNPCId, payload);
      setSelectedNPCId(editingNPCId);
    } else {
      onAddNPC(payload);
    }

    setIsModalOpen(false);
  };

  const calcMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#07080b] text-zinc-200 font-mono text-xs overflow-hidden">
      {/* 1. Header Command Bar */}
      <div className="p-3 bg-[#0c0d14] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Users size={16} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] flex items-center gap-2">
              NPC Codex &amp; Bestiary
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                {npcs.length} entries
              </span>
            </h2>
            <p className="text-[10px] text-zinc-400">
              Split-pane tactical inspector for allies, quest contacts, monsters &amp; bosses
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>Create Custom NPC</span>
        </button>
      </div>

      {/* 2. Main Master-Detail Split Pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT MASTER PANE: Directory List */}
        <div
          className={`w-full lg:w-88 xl:w-96 flex flex-col border-r border-zinc-800 bg-[#090a10] shrink-0 ${
            showMobileDetail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search & Filter Section */}
          <div className="p-2.5 border-b border-zinc-800/80 space-y-2 bg-[#0c0d14]/70">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, creature type, location..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/80"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                All ({npcs.length})
              </button>
              {(['friendly', 'quest', 'neutral', 'enemy', 'boss'] as NPCCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const count = npcs.filter((n) => n.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 border ${
                      isActive
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : `${meta.bg} ${meta.text} ${meta.border} hover:border-zinc-500`
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NPC Scannable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-1.5 space-y-1">
            {filteredNPCs.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Users size={28} className="mx-auto text-zinc-600 opacity-60" />
                <p className="text-xs">No NPCs match your filter criteria.</p>
              </div>
            ) : (
              filteredNPCs.map((npc) => {
                const meta = CATEGORY_META[npc.category];
                const isSelected = selectedNPC?.id === npc.id;

                return (
                  <button
                    key={npc.id}
                    onClick={() => {
                      setSelectedNPCId(npc.id);
                      setShowMobileDetail(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                        : 'bg-[#0d0e16]/60 border-transparent hover:bg-zinc-900/60 hover:border-zinc-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm shrink-0">{meta.icon}</span>
                        <span
                          className={`font-bold truncate text-xs font-[family-name:var(--font-heading)] ${
                            isSelected ? 'text-amber-300' : 'text-zinc-200'
                          }`}
                        >
                          {npc.name}
                        </span>
                        {npc.sharedWithPlayers ? (
                          <span title="Visible to players">
                            <Eye size={11} className="text-emerald-400 shrink-0" />
                          </span>
                        ) : (
                          <span title="DM only">
                            <EyeOff size={11} className="text-zinc-600 shrink-0" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="truncate">{npc.creatureType}</span>
                        {npc.cr && (
                          <span className="shrink-0 px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold">
                            CR {npc.cr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 mt-1 text-[10px]">
                        <span className="text-amber-300 flex items-center gap-0.5">
                          <Shield size={10} /> AC {npc.ac}
                        </span>
                        <span className="text-red-400 flex items-center gap-0.5">
                          <Heart size={10} /> {npc.maxHP} HP
                        </span>
                        {npc.location && (
                          <span className="text-zinc-500 truncate flex items-center gap-0.5">
                            <MapPin size={9} /> {npc.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT DETAIL PANE: 5e Illuminated Statblock Inspector */}
        <div
          className={`flex-1 flex flex-col bg-[#07080b] min-w-0 overflow-y-auto ${
            showMobileDetail ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedNPC ? (
            <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-4xl mx-auto w-full">
              {/* Back to List Button (for mobile & portrait tablets) */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors active:scale-95"
                >
                  <ArrowLeft size={13} />
                  <span>&larr; Back to NPC Directory</span>
                </button>
              </div>

              {/* Inspector Header & Tactical Action Bar */}
              <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        CATEGORY_META[selectedNPC.category].bg
                      } ${CATEGORY_META[selectedNPC.category].text} ${
                        CATEGORY_META[selectedNPC.category].border
                      }`}
                    >
                      <span>{CATEGORY_META[selectedNPC.category].icon}</span>
                      <span>{CATEGORY_META[selectedNPC.category].label}</span>
                      {selectedNPC.cr && <span>&bull; CR {selectedNPC.cr}</span>}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        selectedNPC.sharedWithPlayers
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {selectedNPC.sharedWithPlayers ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{selectedNPC.sharedWithPlayers ? 'Visible in Player Lore' : 'DM Eyes Only'}</span>
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                    {selectedNPC.name}
                  </h3>

                  <p className="text-xs text-zinc-400">
                    {selectedNPC.title ? `${selectedNPC.title} • ` : ''}
                    <span className="italic">{selectedNPC.creatureType}</span>
                    {selectedNPC.alignment ? ` • ${selectedNPC.alignment}` : ''}
                  </p>
                </div>

                {/* Tactical Command Bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {onSendToCombat && (
                    <button
                      onClick={() => onSendToCombat(selectedNPC)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 border border-red-700/80 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Instantly roll initiative and spawn into Tactical Combat"
                    >
                      <Swords size={13} className="text-red-400" />
                      <span>Send to Combat</span>
                    </button>
                  )}

                  <button
                    onClick={() => onToggleVisibility(selectedNPC.id)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      selectedNPC.sharedWithPlayers
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title={
                      selectedNPC.sharedWithPlayers
                        ? 'Visible to players. Click to hide.'
                        : 'Hidden from players. Click to reveal.'
                    }
                  >
                    {selectedNPC.sharedWithPlayers ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={() => openEditModal(selectedNPC)}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 cursor-pointer transition-colors"
                    title="Edit NPC Statblock"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedNPC.name}?`)) {
                        onDeleteNPC(selectedNPC.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 cursor-pointer transition-colors"
                    title="Delete NPC"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 5e Statblock Card */}
              <div className="p-4 md:p-5 rounded-2xl bg-[#0c0d15] border border-amber-500/30 shadow-2xl space-y-4">
                {/* Core Vitals Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Armor Class</span>
                    <span className="font-bold text-amber-300 text-sm flex items-center justify-center gap-1">
                      <Shield size={13} /> {selectedNPC.ac}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Hit Points</span>
                    <span className="font-bold text-red-400 text-sm flex items-center justify-center gap-1">
                      <Heart size={13} /> {selectedNPC.maxHP}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Speed</span>
                    <span className="font-bold text-zinc-200 text-sm">{selectedNPC.speed}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Initiative</span>
                    <span className="font-bold text-amber-400 text-sm flex items-center justify-center gap-1">
                      <Zap size={13} />
                      {selectedNPC.initiativeBonus >= 0
                        ? `+${selectedNPC.initiativeBonus}`
                        : selectedNPC.initiativeBonus}
                    </span>
                  </div>
                </div>

                {/* 6 Ability Scores Diamonds */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                    Ability Attributes
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: 'STR', val: selectedNPC.stats.str },
                      { label: 'DEX', val: selectedNPC.stats.dex },
                      { label: 'CON', val: selectedNPC.stats.con },
                      { label: 'INT', val: selectedNPC.stats.int },
                      { label: 'WIS', val: selectedNPC.stats.wis },
                      { label: 'CHA', val: selectedNPC.stats.cha },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-800/90 text-center relative overflow-hidden group hover:border-amber-500/40 transition-colors"
                      >
                        <span className="text-[9px] font-bold text-zinc-500 uppercase block">{s.label}</span>
                        <span className="text-sm font-bold text-zinc-100 block">{s.val}</span>
                        <span className="text-[10px] font-bold text-amber-400 block">{calcMod(s.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roleplay Context: Location, Personality & Quest Directive */}
                {(selectedNPC.location || selectedNPC.personality || selectedNPC.questDescription || selectedNPC.affiliation) && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    {selectedNPC.questDescription && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] space-y-1">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                          <Sparkles size={12} />
                          Quest Directive &amp; Secret Plot:
                        </span>
                        <p className="text-zinc-200 leading-relaxed font-sans">{selectedNPC.questDescription}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {selectedNPC.personality && (
                        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="font-bold text-zinc-400 block text-[10px] uppercase mb-0.5">
                            Demeanor &amp; Personality:
                          </span>
                          <p className="text-zinc-300 font-sans">{selectedNPC.personality}</p>
                        </div>
                      )}

                      {selectedNPC.location && (
                        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-2">
                          <MapPin size={14} className="text-amber-400 shrink-0" />
                          <div>
                            <span className="font-bold text-zinc-400 block text-[10px] uppercase">Encounter Location:</span>
                            <span className="text-zinc-200">{selectedNPC.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Moveset & Action Abilities */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Swords size={12} />
                      Combat Moveset &amp; Special Traits:
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {selectedNPC.actions?.length || 0} registered actions
                    </span>
                  </div>

                  {!selectedNPC.actions || selectedNPC.actions.length === 0 ? (
                    <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 text-center text-zinc-500 text-xs">
                      No combat actions configured for this creature.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNPC.actions.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-[11px] space-y-1 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-100 text-xs">{act.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                                {act.type.replace('_', ' ')}
                              </span>
                            </div>

                            {act.toHit !== undefined && (
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-amber-400 font-bold">
                                  +{act.toHit} to hit
                                </span>
                                <span className="text-zinc-500">&bull;</span>
                                <span className="text-red-400 font-bold">
                                  {act.damageFormula} {act.damageType}
                                </span>
                                {act.reachRange && (
                                  <>
                                    <span className="text-zinc-500">&bull;</span>
                                    <span className="text-zinc-400">{act.reachRange}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <p className="text-zinc-300 font-sans text-xs leading-relaxed pt-0.5">
                            {act.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DM Secret Notes */}
                {selectedNPC.notes && (
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] space-y-1">
                    <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                      DM Master Notes:
                    </span>
                    <p className="text-zinc-300 font-sans whitespace-pre-wrap">{selectedNPC.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
              <Users size={36} className="text-zinc-600 opacity-60" />
              <p className="text-sm font-bold text-zinc-300">No NPC Selected</p>
              <p className="text-xs max-w-sm">
                Choose an entity from the roster on the left or create a brand new custom creature.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-sm"
              >
                + Create NPC
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Create / Edit NPC Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-xs font-mono">
            {/* Modal Header */}
            <div className="p-3 bg-[#0a0c12] border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} />
                {editingNPCId ? 'Edit Custom NPC' : 'Create Custom NPC & Moveset'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveNPC} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">NPC Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="E.g., Valena Ravenscroft"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NPCCategory)}
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 capitalize cursor-pointer"
                  >
                    <option value="friendly">🤝 Friendly Ally</option>
                    <option value="quest">📜 Quest Giver</option>
                    <option value="neutral">⚖️ Neutral Contact</option>
                    <option value="enemy">⚔️ Hostile Enemy</option>
                    <option value="boss">👑 Campaign Boss</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="E.g., High Priestess"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Creature Type</label>
                  <input
                    type="text"
                    value={formCreatureType}
                    onChange={(e) => setFormCreatureType(e.target.value)}
                    placeholder="E.g., Humanoid, Undead, Fiend"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Challenge Rating (CR)</label>
                  <input
                    type="text"
                    value={formCR}
                    onChange={(e) => setFormCR(e.target.value)}
                    placeholder="E.g., 3, 1/2, 8"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-center"
                  />
                </div>
              </div>

              {/* Combat Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">AC</label>
                  <input
                    type="number"
                    min={1}
                    value={formAC}
                    onChange={(e) => setFormAC(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Max HP</label>
                  <input
                    type="number"
                    min={1}
                    value={formHP}
                    onChange={(e) => setFormHP(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Speed</label>
                  <input
                    type="text"
                    value={formSpeed}
                    onChange={(e) => setFormSpeed(e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Init Bonus</label>
                  <input
                    type="number"
                    value={formInitiative}
                    onChange={(e) => setFormInitiative(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
              </div>

              {/* Ability Scores */}
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-400 block">Ability Scores</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    { label: 'STR', val: formStr, set: setFormStr },
                    { label: 'DEX', val: formDex, set: setFormDex },
                    { label: 'CON', val: formCon, set: setFormCon },
                    { label: 'INT', val: formInt, set: setFormInt },
                    { label: 'WIS', val: formWis, set: setFormWis },
                    { label: 'CHA', val: formCha, set: setFormCha },
                  ].map((s) => (
                    <div key={s.label} className="p-1 rounded bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[9px] text-zinc-500 font-bold block">{s.label}</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={s.val}
                        onChange={(e) => s.set(parseInt(e.target.value, 10) || 10)}
                        className="w-full bg-transparent text-center font-bold text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Roleplay, Location & Quest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Location / Where Found</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="E.g., The Sunken Spire"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Demeanor / Personality</label>
                  <input
                    type="text"
                    value={formPersonality}
                    onChange={(e) => setFormPersonality(e.target.value)}
                    placeholder="E.g., Whispers, suspicious, stoic"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Quest Directive / Secret Notes</label>
                <textarea
                  rows={2}
                  value={formQuest}
                  onChange={(e) => setFormQuest(e.target.value)}
                  placeholder="E.g., Asks the party to retrieve the Star-Iron in exchange for 500 GP."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              {/* Move Set & Actions Editor */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Moveset &amp; Abilities Builder:
                </span>

                {/* Existing actions in form */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {formActions.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-1.5 rounded bg-zinc-950 border border-zinc-800"
                    >
                      <div>
                        <span className="font-bold text-zinc-200">{act.name}</span>
                        <span className="text-[10px] text-amber-400 ml-2">
                          {act.toHit !== undefined ? `+${act.toHit} to hit • ${act.damageFormula}` : `[${act.type}]`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(act.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sub-form to add an action */}
                <div className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={actionName}
                      onChange={(e) => setActionName(e.target.value)}
                      placeholder="Ability / Attack Name"
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white"
                    />
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as any)}
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white"
                    >
                      <option value="action">Action</option>
                      <option value="bonus_action">Bonus Action</option>
                      <option value="reaction">Reaction</option>
                      <option value="trait">Passive Trait</option>
                      <option value="legendary">Legendary</option>
                    </select>
                    <input
                      type="number"
                      value={toHit}
                      onChange={(e) => setToHit(parseInt(e.target.value, 10) || 0)}
                      placeholder="To Hit (+)"
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-center"
                    />
                    <input
                      type="text"
                      value={damageFormula}
                      onChange={(e) => setDamageFormula(e.target.value)}
                      placeholder="Dmg (e.g. 2d6+3)"
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={actionDesc}
                      onChange={(e) => setActionDesc(e.target.value)}
                      placeholder="Description / Effect / Save DC"
                      className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAction}
                      className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold shrink-0 cursor-pointer"
                    >
                      + Add Action
                    </button>
                  </div>
                </div>
              </div>

              {/* Player Visibility Checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <input
                  type="checkbox"
                  id="sharedWithPlayersCheck"
                  checked={formShared}
                  onChange={(e) => setFormShared(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="sharedWithPlayersCheck"
                  className="text-zinc-300 text-xs cursor-pointer select-none"
                >
                  Share this NPC with players (visible in campaign lore archive)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer shadow-xs"
                >
                  {editingNPCId ? 'Save Changes' : 'Create NPC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
