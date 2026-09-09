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
    } else {
      onAddNPC(payload);
    }

    setIsModalOpen(false);
  };

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

  const calcMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* 1. Top Control Bar */}
      <div className="p-3 bg-[#0d0f17] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users size={16} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] flex items-center gap-2">
              NPC Codex &amp; Bestiary
            </h2>
            <p className="text-[10px] text-zinc-400">
              Create and manage friendly allies, quest givers, monsters &amp; bosses
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>Create Custom NPC</span>
        </button>
      </div>

      {/* 2. Category Filter & Search Bar */}
      <div className="p-3 bg-[#08090d] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All NPCs ({npcs.length})
          </button>
          {(['friendly', 'quest', 'neutral', 'enemy', 'boss'] as NPCCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = npcs.filter((n) => n.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-xs'
                    : `${meta.bg} ${meta.text} ${meta.border} hover:border-zinc-500`
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="text-[10px] px-1 rounded bg-black/40">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, title, type..."
            className="w-full pl-8 pr-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 3. NPC Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredNPCs.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <Users size={32} className="mx-auto text-zinc-600 opacity-60" />
            <p className="text-xs">No NPCs found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredNPCs.map((npc) => {
              const meta = CATEGORY_META[npc.category];

              return (
                <div
                  key={npc.id}
                  className="rounded-2xl bg-[#0d0f17] border border-zinc-800/90 shadow-md p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors gap-3"
                >
                  {/* Card Header: Category Badge + Name + Title + Quick Actions */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                        {npc.cr && <span className="ml-1 opacity-80">&bull; CR {npc.cr}</span>}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Send to Combat Button (For enemies/bosses or anyone) */}
                        {onSendToCombat && (
                          <button
                            onClick={() => onSendToCombat(npc)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Spawn directly into Tactical Combat Engine"
                          >
                            <Swords size={12} />
                            <span>Send to Combat</span>
                          </button>
                        )}

                        {/* Player Visibility Toggle */}
                        <button
                          onClick={() => onToggleVisibility(npc.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            npc.sharedWithPlayers
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                          }`}
                          title={
                            npc.sharedWithPlayers
                              ? 'Visible to players in lore archive. Click to hide.'
                              : 'Hidden from players (DM Only). Click to reveal.'
                          }
                        >
                          {npc.sharedWithPlayers ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>

                        <button
                          onClick={() => openEditModal(npc)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 cursor-pointer transition-colors"
                          title="Edit NPC"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => onDeleteNPC(npc.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 cursor-pointer transition-colors"
                          title="Delete NPC"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* NPC Name & Subtitle */}
                    <div className="mb-2">
                      <h3 className="text-sm font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                        {npc.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        {npc.title ? `${npc.title} • ` : ''}
                        {npc.creatureType}
                        {npc.alignment ? ` • ${npc.alignment}` : ''}
                      </p>
                    </div>

                    {/* Core Stats Row: AC, HP, Speed, Initiative */}
                    <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                      <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <span className="text-[9px] uppercase text-zinc-500 block">Armor Class</span>
                        <span className="font-bold text-amber-300 text-xs flex items-center justify-center gap-1">
                          <Shield size={11} /> {npc.ac}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <span className="text-[9px] uppercase text-zinc-500 block">Hit Points</span>
                        <span className="font-bold text-red-400 text-xs flex items-center justify-center gap-1">
                          <Heart size={11} /> {npc.maxHP}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <span className="text-[9px] uppercase text-zinc-500 block">Speed</span>
                        <span className="font-bold text-zinc-200 text-xs">{npc.speed}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <span className="text-[9px] uppercase text-zinc-500 block">Initiative</span>
                        <span className="font-bold text-amber-400 text-xs">
                          {npc.initiativeBonus >= 0 ? `+${npc.initiativeBonus}` : npc.initiativeBonus}
                        </span>
                      </div>
                    </div>

                    {/* Ability Scores Row */}
                    <div className="grid grid-cols-6 gap-1 mb-3 text-center text-[10px]">
                      {[
                        { label: 'STR', val: npc.stats.str },
                        { label: 'DEX', val: npc.stats.dex },
                        { label: 'CON', val: npc.stats.con },
                        { label: 'INT', val: npc.stats.int },
                        { label: 'WIS', val: npc.stats.wis },
                        { label: 'CHA', val: npc.stats.cha },
                      ].map((s) => (
                        <div key={s.label} className="p-1 rounded bg-zinc-950 border border-zinc-800/80">
                          <span className="text-zinc-500 font-bold block">{s.label}</span>
                          <span className="font-bold text-zinc-200">{s.val}</span>
                          <span className="text-amber-400 block text-[9px]">({calcMod(s.val)})</span>
                        </div>
                      ))}
                    </div>

                    {/* Quest Hook / Personality */}
                    {npc.questDescription && (
                      <div className="mb-2 p-2 rounded-lg bg-purple-950/20 border border-purple-800/40 text-[11px]">
                        <span className="font-bold text-purple-300 block mb-0.5">⚡ Quest Directive:</span>
                        <p className="text-zinc-300">{npc.questDescription}</p>
                      </div>
                    )}

                    {npc.personality && (
                      <div className="mb-2 text-[11px] text-zinc-400">
                        <span className="font-bold text-zinc-300">Demeanor: </span>
                        {npc.personality}
                      </div>
                    )}

                    {npc.location && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-2">
                        <MapPin size={11} className="text-amber-400" />
                        <span>Found at: {npc.location}</span>
                      </div>
                    )}

                    {/* Moveset Actions */}
                    {npc.actions && npc.actions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          Moveset &amp; Abilities:
                        </span>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {npc.actions.map((act) => (
                            <div
                              key={act.id}
                              className="p-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800/70 text-[11px]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-zinc-200">
                                  {act.name}
                                  {act.type !== 'action' && (
                                    <span className="ml-1 text-[9px] text-zinc-500 uppercase font-mono">
                                      [{act.type.replace('_', ' ')}]
                                    </span>
                                  )}
                                </span>
                                {act.toHit !== undefined && (
                                  <span className="text-amber-400 font-bold text-[10px]">
                                    +{act.toHit} to hit &bull; {act.damageFormula} {act.damageType}
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-400 text-[10px] mt-0.5 leading-snug">
                                {act.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Create / Edit NPC Modal */}
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
                        className="p-1 text-zinc-500 hover:text-red-400"
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
