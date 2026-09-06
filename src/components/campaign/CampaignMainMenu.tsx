'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Shield,
  ArrowRight,
  Coins,
  BookOpen,
  Sparkles,
  Scroll,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  UserPlus,
  CheckCircle2,
  Flame,
  Star,
  MapPin,
  HelpCircle,
  Clock,
  Camera,
} from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import GlowButton from '../ui/GlowButton';
import { useCharacter } from '@/app/providers';
import type { CampaignMystery } from '@/lib/types';

// Storage key for custom party members added by the user's gaming group
const CUSTOM_ROSTER_KEY = 'dnd_tavern_custom_roster';

export interface CustomMember {
  id: string;
  name: string;
  playerName: string;
  race: string;
  characterClass: string;
  level: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  role: 'Core Member' | 'Guest Companion';
  avatar: string; // Emoji or image URL
  notes: string;
}

export default function CampaignMainMenu() {
  const {
    character,
    aria,
    cyrus,
    wynel,
    navigateToCharacter,
    setMysteries,
    showToastNotification,
    getPortraitUrl,
    openMediaPicker,
    customMembers,
    setCustomMembers: saveCustomMembers,
  } = useCharacter();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<CustomMember> | null>(null);

  // Quest Editing State
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Partial<CampaignMystery> | null>(null);

  // Open modal to add or edit custom member
  const handleOpenMemberModal = (member?: CustomMember, slotIndex?: number) => {
    if (member) {
      setEditingMember(member);
    } else {
      setEditingMember({
        id: `custom-${Date.now()}`,
        name: `Adventurer #${(slotIndex ?? customMembers.length) + 3}`,
        playerName: 'Guild Friend',
        race: 'Human',
        characterClass: 'Fighter',
        level: 10,
        currentHP: 85,
        maxHP: 85,
        ac: 16,
        role: slotIndex === 4 || slotIndex === 5 ? 'Guest Companion' : 'Core Member',
        avatar: '⚔️',
        notes: 'A brave companion in The Ashen Pact campaign.',
      });
    }
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = () => {
    if (!editingMember || !editingMember.name) return;

    const newMember: CustomMember = {
      id: editingMember.id || `custom-${Date.now()}`,
      name: editingMember.name || 'Unnamed Hero',
      playerName: editingMember.playerName || 'Player',
      race: editingMember.race || 'Human',
      characterClass: editingMember.characterClass || 'Adventurer',
      level: editingMember.level || 1,
      currentHP: editingMember.currentHP || 20,
      maxHP: editingMember.maxHP || 20,
      ac: editingMember.ac || 14,
      role: editingMember.role || 'Core Member',
      avatar: editingMember.avatar || '🛡️',
      notes: editingMember.notes || '',
    };

    const exists = customMembers.some((m) => m.id === newMember.id);
    let updated: CustomMember[];
    if (exists) {
      updated = customMembers.map((m) => (m.id === newMember.id ? newMember : m));
    } else {
      updated = [...customMembers, newMember];
    }

    saveCustomMembers(updated);
    showToastNotification('Guild Roster', `Saved party member: ${newMember.name}`, 'level');
    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this guild member from the board?')) {
      const updated = customMembers.filter((m) => m.id !== id);
      saveCustomMembers(updated);
    }
  };

  // Quest Management Functions
  const mysteries = character.dossier.mysteries || [];

  const handleOpenQuestModal = (quest?: CampaignMystery) => {
    if (quest) {
      setEditingQuest(quest);
    } else {
      setEditingQuest({
        id: `quest-${Date.now()}`,
        title: 'New Guild Notice / Mystery',
        description: 'Describe the active quest objectives, clues, and bounty reward...',
        clues: [],
        resolved: false,
      });
    }
    setIsQuestModalOpen(true);
  };

  const handleSaveQuest = () => {
    if (!editingQuest || !editingQuest.title) return;

    const newQuest: CampaignMystery = {
      id: editingQuest.id || `quest-${Date.now()}`,
      title: editingQuest.title || 'Untitled Quest',
      description: editingQuest.description || '',
      clues: editingQuest.clues || [],
      resolved: editingQuest.resolved || false,
    };

    const exists = mysteries.some((q) => q.id === newQuest.id);
    let updated: CampaignMystery[];
    if (exists) {
      updated = mysteries.map((q) => (q.id === newQuest.id ? newQuest : q));
    } else {
      updated = [newQuest, ...mysteries];
    }

    setMysteries(updated);
    showToastNotification('Tavern Quest Board', `Posted quest: ${newQuest.title}`, 'quest');
    setIsQuestModalOpen(false);
    setEditingQuest(null);
  };

  const handleDeleteQuest = (id: string) => {
    if (confirm('Are you sure you want to remove this quest scroll from the board?')) {
      const updated = mysteries.filter((q) => q.id !== id);
      setMysteries(updated);
    }
  };

  const handleToggleQuestResolved = (quest: CampaignMystery) => {
    const updated = mysteries.map((q) => (q.id === quest.id ? { ...q, resolved: !q.resolved } : q));
    setMysteries(updated);
    showToastNotification('Quest Status Updated', `Marked "${quest.title}" as ${!quest.resolved ? 'RESOLVED' : 'ACTIVE'}`, 'quest');
  };

  // Total party size calculation
  const totalMembersCount = 4 + customMembers.length; // Earl + Aria + Cyrus + Wyn'el + Custom

  // Total treasury
  const partyGold = character.currency.gp + aria.currency.gp + (cyrus?.currency?.gp || 0) + (wynel?.currency?.gp || 0);
  const partyPlatinum = character.currency.pp + aria.currency.pp + (cyrus?.currency?.pp || 0) + (wynel?.currency?.pp || 0);

  // We want to render 6 core slots + 1 guest slot = total 7 slots on the tavern board
  // Slots 0, 1, 2, 3 are Earl, Aria, Cyrus & Wyn'el. Slots 4..6 are custom or unassigned wooden pegs.
  const emptySlotsCount = Math.max(0, 3 - customMembers.length); // 3 available slots to reach 7 total party members

  return (
    <div className="space-y-10 animate-fade-in-up py-2 max-w-6xl mx-auto font-['Spectral',serif]">
      {/* ====================================================================
         1. FANTASY TAVERN GUILDHALL BANNER & NOTICE BOARD HEADER
         ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#d9b872]/60 shadow-[0_16px_50px_rgba(0,0,0,0.85)] bg-[linear-gradient(135deg,rgba(28,21,16,0.96)_0%,rgba(18,13,10,0.98)_100%)] p-6 sm:p-8">
        {/* Carved Wood & Gold Top Rail */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8b5a2b] via-[#d9b872] to-[#8b5a2b] shadow-md" />

        {/* Tavern Wax Seal Stamp */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(217,184,114,0.12)] border border-[#d9b872]/40 text-[#d9b872] text-xs font-mono font-bold uppercase tracking-widest shadow-inner">
              <Scroll size={14} className="text-[#d9b872]" /> 🍺 Fantasy Tavern Guildhall &bull; Campaign Hub
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-glow-gold tracking-wider font-['Cormorant_Garamond',serif] uppercase text-amber-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              The Ashen Pact
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-parchment-muted)] italic max-w-2xl">
              &ldquo;Where shadow and starlight converge. Six adventurers bound by fate, blood, and the celestial weave.&rdquo;
            </p>
          </div>

          {/* Quick Campaign Stats Badge Bar */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 text-xs font-mono">
            <div className="bg-black/70 text-[var(--color-parchment)] px-4 py-2 rounded-xl border border-[#d9b872]/30 flex items-center gap-2 shadow-md">
              <Users size={15} className="text-[#d9b872]" />
              <span>
                <strong className="text-amber-200 text-sm">{totalMembersCount}</strong> Guild Members (6 Core + Guest)
              </span>
            </div>

            <div className="bg-black/70 text-[#d9b872] px-4 py-2 rounded-xl border border-[#d9b872]/30 flex items-center gap-2 shadow-md">
              <Coins size={15} className="text-amber-400" />
              <span>
                Treasury: <strong className="text-amber-200">{partyGold} GP</strong> ({partyPlatinum} PP)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
         2. PARTY HERO ROSTER BOARD (FANTASY TAVERN BOARD - NO TEXT OVERLAPS!)
         ==================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#d9b872]/30">
          <div>
            <h2 className="text-2xl font-bold text-[#d9b872] font-['Cormorant_Garamond',serif] flex items-center gap-2 uppercase tracking-wider text-glow-gold">
              <Crown size={22} className="text-amber-400" /> Guild Hero Roster Board
            </h2>
            <p className="text-xs font-mono text-[var(--color-parchment-dim)]">
              6 Party Members + Occasional Guest Companion &bull; Click to open sheet or edit slot
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openMediaPicker()}
              className="flex items-center gap-1.5 bg-[rgba(218,165,32,0.15)] hover:bg-[rgba(218,165,32,0.3)] text-amber-100 border border-[#d9b872]/60 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:-translate-y-0.5 active:scale-95 min-h-[38px]"
            >
              <Camera size={14} className="text-amber-300" />
              Customize Wallpapers &amp; Portraits
            </button>

            <button
              onClick={() => handleOpenMemberModal()}
              className="flex items-center gap-1.5 bg-[#8b5a2b]/80 hover:bg-[#8b5a2b] text-amber-100 border border-[#d9b872]/50 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:-translate-y-0.5 min-h-[38px]"
            >
              <UserPlus size={14} className="text-amber-300" />
              Add Party Member Slot
            </button>
          </div>
        </div>

        {/* 6-8 Player Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ================================================================
             ROSTER CARD 1: EARL (VESPER ASHWOOD)
             ================================================================ */}
          <div className="medieval-card p-6 border-2 border-[var(--color-crimson-500)]/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(26,16,18,0.98)_0%,rgba(14,8,10,0.99)_100%)] relative group hover:border-[var(--color-crimson-400)] shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(220,38,38,0.18)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner tr text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner bl text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner br text-[var(--color-crimson-400)]/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-[var(--color-crimson-500)]/20 rounded-xl pointer-events-none group-hover:border-[var(--color-crimson-400)]/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-6 -mt-6 mb-4 px-6 py-1.5 bg-gradient-to-r from-red-950/90 via-[rgba(220,38,38,0.25)] to-red-950/90 border-b border-[var(--color-crimson-500)]/40 flex items-center justify-between shadow-xs">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--color-crimson-300)] flex items-center gap-1.5">
                <span>⚜</span> Shadow Guild Oath
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-gold-400)] font-semibold">
                Silent Blade
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-[var(--color-crimson-500)]/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-[var(--color-crimson-400)] transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('vesper')}
                      alt="Earl (Vesper Ashwood)"
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-700 via-red-800 to-red-950 border border-red-400 text-xs text-amber-200">
                    🗡️
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Earl
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-[var(--color-crimson-500)]/50 text-rose-200 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {character.level}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[var(--color-crimson-400)] font-semibold flex items-center gap-1">
                    <Flame size={12} className="text-[var(--color-crimson-500)]" /> Human &bull; Rogue Assassin
                  </p>

                  <p className="text-xs text-[var(--color-gold-400)] italic font-serif">
                    &ldquo;Vesper Ashwood&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[var(--color-crimson-500)] text-xs text-[var(--color-parchment-muted)] leading-relaxed italic">
                &ldquo;Deadly assassin of the Ashen Pact, wielding the soul-stealing vestige dagger Orphan&apos;s Tithe.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-[var(--color-crimson-500)]/30 text-center font-mono text-xs">
                <div>
                  <span className="block text-[9px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-rose-400 text-sm">{character.combat.currentHP}/{character.combat.maxHP}</span>
                </div>
                <div className="border-x border-[var(--color-crimson-500)]/20">
                  <span className="block text-[9px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[var(--color-gold-400)] text-sm">{character.ac}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Sneak Atk</span>
                  <span className="font-black text-amber-200 text-sm">5d6</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('vesper')}
              className="medieval-writ-btn w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 2: ARIA SIL'AVETH
             ================================================================ */}
          <div className="medieval-card p-6 border-2 border-[#a992e8]/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(169,146,232,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(20,18,34,0.98)_0%,rgba(12,10,22,0.99)_100%)] relative group hover:border-[#a992e8] shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(169,146,232,0.2)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-[#a992e8]/70">❖</span>
            <span className="medieval-corner tr text-[#a992e8]/70">❖</span>
            <span className="medieval-corner bl text-[#a992e8]/70">❖</span>
            <span className="medieval-corner br text-[#a992e8]/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-[#a992e8]/20 rounded-xl pointer-events-none group-hover:border-[#a992e8]/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-6 -mt-6 mb-4 px-6 py-1.5 bg-gradient-to-r from-[#171b3f]/90 via-[rgba(169,146,232,0.25)] to-[#171b3f]/90 border-b border-[#a992e8]/40 flex items-center justify-between shadow-xs">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#c7c2e6] flex items-center gap-1.5">
                <span>🌙</span> Silver Moon Conclave
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#d9b872] font-semibold">
                Astral Weaver
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-[#a992e8]/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-[#a992e8] transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('aria')}
                      alt="Aria Sil'aveth"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-indigo-800 via-purple-900 to-[#0d1026] border border-[#a992e8] text-xs text-[#d9b872]">
                    🌙
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Aria Sil&apos;aveth
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#171b3f]/80 border border-[#a992e8]/50 text-[#c7c2e6] uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {aria.level}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[#a992e8] font-semibold flex items-center gap-1">
                    <Sparkles size={12} className="text-[#a992e8]" /> High Elf &bull; Sorcerer Lunar
                  </p>

                  <p className="text-xs text-[#d9b872] italic font-serif">
                    &ldquo;{aria.subline}&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[#a992e8] text-xs text-[#cfd4ee] leading-relaxed italic">
                &ldquo;High elven lunar sorceress who channels cosmic starfire and moon tides to manipulate magic.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-[#a992e8]/30 text-center font-mono text-xs">
                <div>
                  <span className="block text-[9px] text-[#9aa1cc] uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-[#c9707a] text-sm">{aria.combat.currentHP}/{aria.combat.maxHP}</span>
                </div>
                <div className="border-x border-[#a992e8]/20">
                  <span className="block text-[9px] text-[#9aa1cc] uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[#d9b872] text-sm">{aria.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#9aa1cc] uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-[#a992e8] text-sm">{aria.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('aria')}
              className="medieval-writ-btn w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 3: CYRUS HYACINTHUS
             ================================================================ */}
          <div className="medieval-card p-6 border-2 border-amber-500/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(30,22,12,0.98)_0%,rgba(18,14,8,0.99)_100%)] relative group hover:border-amber-400 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(218,165,32,0.2)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-amber-400/70">❖</span>
            <span className="medieval-corner tr text-amber-400/70">❖</span>
            <span className="medieval-corner bl text-amber-400/70">❖</span>
            <span className="medieval-corner br text-amber-400/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-amber-500/20 rounded-xl pointer-events-none group-hover:border-amber-400/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-6 -mt-6 mb-4 px-6 py-1.5 bg-gradient-to-r from-amber-950/90 via-[rgba(218,165,32,0.25)] to-amber-950/90 border-b border-amber-500/40 flex items-center justify-between shadow-xs">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-300 flex items-center gap-1.5">
                <span>☀️</span> Temple of Apollo
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#d9b872] font-semibold">
                Solar Oracle
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-amber-400 transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('cyrus')}
                      alt="Cyrus Hyacinthus"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border border-amber-300 text-xs text-amber-100">
                    ☀️
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Cyrus Hyacinthus
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {cyrus.level}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" /> Aasimar &bull; Light Cleric
                  </p>

                  <p className="text-xs text-amber-200/90 italic font-serif">
                    &ldquo;{cyrus.subline}&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-amber-500 text-xs text-amber-100/90 leading-relaxed italic">
                &ldquo;Solar oracle of Apollo blessed with radiant wings, divine sunfire, and prophetic foresight.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-amber-500/30 text-center font-mono text-xs">
                <div>
                  <span className="block text-[9px] text-amber-200/60 uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-amber-400 text-sm">{cyrus.combat.currentHP}/{cyrus.combat.maxHP}</span>
                </div>
                <div className="border-x border-amber-500/20">
                  <span className="block text-[9px] text-amber-200/60 uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[var(--color-gold-400)] text-sm">{cyrus.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-amber-200/60 uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-amber-300 text-sm">{cyrus.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('cyrus')}
              className="medieval-writ-btn w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 4: WYN'EL AELUIN
             ================================================================ */}
          <div className="medieval-card p-6 border-2 border-red-500/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16)_0%,transparent_70%),linear-gradient(145deg,rgba(38,10,18,0.98)_0%,rgba(18,4,8,0.99)_100%)] relative group hover:border-red-400 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(239,68,68,0.25)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-red-400/70">❖</span>
            <span className="medieval-corner tr text-red-400/70">❖</span>
            <span className="medieval-corner bl text-red-400/70">❖</span>
            <span className="medieval-corner br text-red-400/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-red-500/20 rounded-xl pointer-events-none group-hover:border-red-400/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-6 -mt-6 mb-4 px-6 py-1.5 bg-gradient-to-r from-red-950/90 via-[rgba(239,68,68,0.25)] to-red-950/90 border-b border-red-500/40 flex items-center justify-between shadow-xs">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-rose-300 flex items-center gap-1.5">
                <span>👑</span> House Aeluin Crown
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-semibold">
                Archfey Exile
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-red-500/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-red-400 transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('wynel')}
                      alt="Wyn'el Aeluin"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-rose-700 via-red-800 to-red-950 border border-red-400 text-xs text-amber-200">
                    👑
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-black text-rose-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Wyn’el Aeluin
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-rose-300 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {wynel.level}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-red-300 font-semibold flex items-center gap-1">
                    <Flame size={12} className="text-red-400" /> Half-Elf &bull; Archfey Warlock
                  </p>

                  <p className="text-xs text-rose-300/80 italic font-serif">
                    &ldquo;Prince of House Aeluin&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-red-500 text-xs text-rose-100/90 leading-relaxed italic">
                &ldquo;Exiled noble prince bound to the Crimson Heart-Tattoo, wielding scarlet chaos magic and eldritch secrets.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-red-500/30 text-center font-mono text-xs">
                <div>
                  <span className="block text-[9px] text-rose-200/60 uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-red-400 text-sm">{wynel.combat.currentHP}/{wynel.combat.maxHP}</span>
                </div>
                <div className="border-x border-red-500/20">
                  <span className="block text-[9px] text-rose-200/60 uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[var(--color-gold-400)] text-sm">{wynel.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-rose-200/60 uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-rose-300 text-sm">{wynel.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('wynel')}
              className="medieval-writ-btn w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARDS 3..N: CUSTOM GUILD MEMBERS
             ================================================================ */}
          {customMembers.map((member) => (
            <div
              key={member.id}
              className="medieval-card p-6 border-2 border-[#d9b872]/40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.1)_0%,transparent_70%),linear-gradient(145deg,rgba(24,20,16,0.98)_0%,rgba(14,11,8,0.99)_100%)] relative group hover:border-[#d9b872] shadow-[0_16px_45px_rgba(0,0,0,0.85)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Corner Filigree Glyphs */}
              <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
              <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
              <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
              <span className="medieval-corner br text-[#d9b872]/70">❖</span>

              {/* Inner Hairline Filigree Border */}
              <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none group-hover:border-[#d9b872]/40 transition-colors" />

              {/* Heraldic Top Ribbon Banner */}
              <div className="relative z-10 -mx-6 -mt-6 mb-4 px-6 py-1.5 bg-gradient-to-r from-[#2a1e12]/90 via-[rgba(218,165,32,0.2)] to-[#2a1e12]/90 border-b border-[#d9b872]/30 flex items-center justify-between shadow-xs">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#d9b872] flex items-center gap-1.5">
                  <span>🛡️</span> Ashen Pact Companion
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-200/80 font-semibold">
                  {member.role || 'Guild Initiate'}
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                {/* Header & Portrait Block */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-black/80 border-2 border-[#d9b872]/60 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                      {member.avatar.startsWith('http') || member.avatar.startsWith('/') ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.avatar}</span>
                      )}
                    </div>
                    {/* Embossed Wax Seal Stamp */}
                    <div className="medieval-wax-seal absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-700 via-amber-800 to-[#1e150b] border border-[#d9b872] text-xs text-amber-100">
                      🛡️
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenMemberModal(member)}
                          className="text-gray-400 hover:text-amber-300 p-1 transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-gray-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-mono text-[#d9b872] font-semibold">
                      {member.race} &bull; {member.characterClass}
                    </p>

                    <p className="text-xs text-[var(--color-parchment-muted)] italic font-serif">
                      Played by {member.playerName}
                    </p>
                  </div>
                </div>

                {member.notes && (
                  <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[#d9b872] text-xs text-[var(--color-parchment-muted)] leading-relaxed italic line-clamp-2">
                    &ldquo;{member.notes}&rdquo;
                  </div>
                )}

                {/* Quick Stats Plaque */}
                <div className="medieval-stat-plaque grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-[#d9b872]/20 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Vitality</span>
                    <span className="font-black text-emerald-400 text-sm">{member.currentHP}/{member.maxHP}</span>
                  </div>
                  <div className="border-x border-[#d9b872]/20">
                    <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Armor</span>
                    <span className="font-black text-amber-300 text-sm">{member.ac}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Rank</span>
                    <span className="font-black text-amber-100 text-sm">Lv {member.level}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenMemberModal(member)}
                className="medieval-writ-btn w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
              >
                <Edit3 size={13} /> Edit Companion Sheet
              </button>
            </div>
          ))}

          {/* ================================================================
             EMPTY UNASSIGNED TAVERN PEGS / GUILD SEATS (UP TO 6+1 MEMBERS)
             ================================================================ */}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => {
            const slotNum = customMembers.length + idx + 5;
            const isGuestSlot = slotNum >= 7;

            return (
              <div
                key={`empty-slot-${idx}`}
                onClick={() => handleOpenMemberModal(undefined, idx)}
                className="p-6 border-2 border-dashed border-[#d9b872]/30 hover:border-[#d9b872] bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.06)_0%,transparent_70%),linear-gradient(145deg,rgba(18,14,10,0.85)_0%,rgba(10,8,6,0.95)_100%)] hover:bg-[linear-gradient(145deg,rgba(28,22,16,0.95)_0%,rgba(16,12,8,0.98)_100%)] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group min-h-[260px] shadow-lg relative overflow-hidden"
              >
                {/* Corner Filigree Glyphs */}
                <span className="medieval-corner tl text-[#d9b872]/40">❖</span>
                <span className="medieval-corner tr text-[#d9b872]/40">❖</span>
                <span className="medieval-corner bl text-[#d9b872]/40">❖</span>
                <span className="medieval-corner br text-[#d9b872]/40">❖</span>

                <div className="w-14 h-14 rounded-full bg-black/70 border border-[#d9b872]/40 flex items-center justify-center text-[#d9b872] text-2xl mb-3 group-hover:scale-110 group-hover:border-[#d9b872] transition-transform shadow-inner">
                  {isGuestSlot ? '🍺' : '⚔️'}
                </div>

                <h4 className="text-xl font-bold text-[#d9b872] font-['Cormorant_Garamond',serif] uppercase tracking-wider mb-1">
                  {isGuestSlot ? `Guest Companion Seat` : `Guild Seat #${slotNum}`}
                </h4>

                <p className="text-xs text-[var(--color-parchment-muted)] max-w-[200px] mb-4 italic">
                  {isGuestSlot
                    ? 'Reserved for visiting allies & guest adventurers.'
                    : `Unassigned hero slot. Click to recruit party member #${slotNum}.`}
                </p>

                <span className="medieval-writ-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono text-amber-200">
                  <Plus size={13} /> {isGuestSlot ? 'Recruit Guest Adventurer' : 'Recruit Party Member'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
         3. GUILD TREASURY & EDITABLE ACTIVE QUEST BOARD
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treasury Card */}
        <div className="medieval-card p-6 border-2 border-[#d9b872]/50 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.12)_0%,transparent_70%),linear-gradient(145deg,rgba(22,18,14,0.98)_0%,rgba(14,12,10,0.99)_100%)] shadow-[0_16px_45px_rgba(0,0,0,0.85)] flex flex-col justify-between rounded-2xl relative overflow-hidden">
          {/* Corner Filigrees */}
          <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
          <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner br text-[#d9b872]/70">❖</span>

          {/* Inner Hairline Border */}
          <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d9b872]/30">
              <Coins size={22} className="text-amber-400" />
              <h3 className="text-xl font-black text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Guild Treasury &amp; Vault
              </h3>
            </div>

            <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed mb-4 italic">
              Shared coffers of The Ashen Pact stored securely within the enchanted tavern vault.
            </p>

            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="medieval-stat-plaque p-4 rounded-xl border border-[#d9b872]/30 shadow-inner">
                <span className="block text-[10px] text-amber-200/60 uppercase tracking-widest font-bold">Gold (GP)</span>
                <span className="text-2xl font-black text-amber-300 font-['Cormorant_Garamond',serif]">{partyGold} GP</span>
              </div>
              <div className="medieval-stat-plaque p-4 rounded-xl border border-[#d9b872]/30 shadow-inner">
                <span className="block text-[10px] text-indigo-200/60 uppercase tracking-widest font-bold">Platinum (PP)</span>
                <span className="text-2xl font-black text-indigo-200 font-['Cormorant_Garamond',serif]">{partyPlatinum} PP</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 p-3 rounded-xl bg-[rgba(217,184,114,0.08)] border border-[#d9b872]/30 text-xs text-amber-200/90 italic flex items-center gap-2">
            <Shield size={16} className="text-amber-400 shrink-0" />
            <span>Vault sealed by Ashen Pact ancient oath wards.</span>
          </div>
        </div>

        {/* EDITABLE ACTIVE QUEST BOARD */}
        <div className="medieval-card p-6 border-2 border-[#d9b872]/50 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.12)_0%,transparent_70%),linear-gradient(145deg,rgba(22,18,14,0.98)_0%,rgba(14,12,10,0.99)_100%)] shadow-[0_16px_45px_rgba(0,0,0,0.85)] lg:col-span-2 rounded-2xl relative overflow-hidden">
          {/* Corner Filigrees */}
          <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
          <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner br text-[#d9b872]/70">❖</span>

          {/* Inner Hairline Border */}
          <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-[#d9b872]/30">
              <div className="flex items-center gap-2">
                <BookOpen size={22} className="text-amber-400" />
                <h3 className="text-xl font-black text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                  Active Tavern Quest Mysteries
                </h3>
              </div>

              <button
                onClick={() => handleOpenQuestModal()}
                className="medieval-writ-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-200 transition-all cursor-pointer"
              >
                <Plus size={13} className="text-amber-300" />
                Post New Quest Scroll
              </button>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {mysteries.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-parchment-muted)] italic bg-black/40 rounded-xl border border-white/5">
                  No active quests pinned to the board. Click &ldquo;Post New Quest Scroll&rdquo; to add campaign bounties!
                </div>
              ) : (
                mysteries.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-xl border transition-all text-xs relative ${
                      quest.resolved
                        ? 'bg-black/40 border-stone-800 opacity-60'
                        : 'medieval-parchment-scroll border-[#d9b872]/40 hover:border-[#d9b872] shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">📌</span>
                        <h4
                          className={`font-bold text-base font-['Cormorant_Garamond',serif] ${
                            quest.resolved ? 'text-gray-400 line-through' : 'text-amber-200'
                          }`}
                        >
                          {quest.title}
                        </h4>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider border font-bold ${
                            quest.resolved
                              ? 'bg-zinc-900 text-zinc-400 border-zinc-700'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          {quest.resolved ? 'RESOLVED' : 'ACTIVE BOUNTY'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleQuestResolved(quest)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            quest.resolved
                              ? 'text-zinc-500 hover:text-amber-300'
                              : 'text-amber-400 hover:text-emerald-400'
                          }`}
                          title={quest.resolved ? 'Reactivate Quest' : 'Mark Quest Resolved'}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenQuestModal(quest)}
                          className="text-gray-400 hover:text-amber-300 p-1 transition-colors cursor-pointer"
                          title="Edit Quest Scroll"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="text-gray-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Remove Quest Scroll"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed italic mb-2">
                      &ldquo;{quest.description}&rdquo;
                    </p>

                    {quest.clues && quest.clues.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#d9b872]/20 space-y-1">
                        <span className="text-[10px] font-mono text-amber-300/80 uppercase font-bold block">
                          📜 Clues &amp; Objectives:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[var(--color-parchment)] font-serif">
                          {quest.clues.map((clue, cIdx) => (
                            <li key={cIdx}>{clue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ====================================================================
         MODAL 1: ADD / EDIT CUSTOM PARTY MEMBER
         ==================================================================== */}
      {isMemberModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181310] border-2 border-[#d9b872] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(217,184,114,0.3)] space-y-4 animate-fade-in-up font-['Spectral',serif]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d9b872]/30">
              <h3 className="text-xl font-bold text-amber-200 font-['Cormorant_Garamond',serif] flex items-center gap-2">
                <UserPlus size={18} className="text-amber-400" />
                {editingMember.id && customMembers.some((m) => m.id === editingMember.id)
                  ? 'Edit Guild Member'
                  : 'Add Party Member to Tavern Board'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Character Name *</label>
                  <input
                    type="text"
                    value={editingMember.name || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                    placeholder="e.g. Thorin Oakenshield"
                  />
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Player Name *</label>
                  <input
                    type="text"
                    value={editingMember.playerName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, playerName: e.target.value })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Race</label>
                  <input
                    type="text"
                    value={editingMember.race || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, race: e.target.value })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                    placeholder="e.g. Dwarf"
                  />
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Class</label>
                  <input
                    type="text"
                    value={editingMember.characterClass || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, characterClass: e.target.value })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                    placeholder="e.g. Paladin"
                  />
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Level</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingMember.level || 1}
                    onChange={(e) => setEditingMember({ ...editingMember, level: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Max HP</label>
                  <input
                    type="number"
                    value={editingMember.maxHP || 20}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setEditingMember({ ...editingMember, maxHP: val, currentHP: val });
                    }}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Armor Class (AC)</label>
                  <input
                    type="number"
                    value={editingMember.ac || 14}
                    onChange={(e) => setEditingMember({ ...editingMember, ac: parseInt(e.target.value, 10) || 10 })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Role Type</label>
                  <select
                    value={editingMember.role || 'Core Member'}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value as 'Core Member' | 'Guest Companion' })
                    }
                    className="w-full bg-[#181310] border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="Core Member">Core Member (6 Core)</option>
                    <option value="Guest Companion">Guest Companion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Avatar Icon / Image URL</label>
                <input
                  type="text"
                  value={editingMember.avatar || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, avatar: e.target.value })}
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  placeholder="Emoji (🛡️, 🧙‍♂️) or Image URL"
                />
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Short Notes / Bio</label>
                <textarea
                  rows={2}
                  value={editingMember.notes || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  placeholder="Backstory snippet or signature feat..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="px-4 py-1.5 bg-[#8b5a2b] hover:bg-[#a66d35] text-amber-100 border border-[#d9b872] rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow"
              >
                <Save size={13} /> Save Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
         MODAL 2: ADD / EDIT ACTIVE QUEST SCROLL
         ==================================================================== */}
      {isQuestModalOpen && editingQuest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181310] border-2 border-[#d9b872] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(217,184,114,0.3)] space-y-4 animate-fade-in-up font-['Spectral',serif]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d9b872]/30">
              <h3 className="text-xl font-bold text-amber-200 font-['Cormorant_Garamond',serif] flex items-center gap-2">
                <Scroll size={18} className="text-amber-400" />
                {editingQuest.id && mysteries.some((q) => q.id === editingQuest.id)
                  ? 'Edit Active Quest Scroll'
                  : 'Post New Quest Scroll'}
              </h3>
              <button onClick={() => setIsQuestModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Quest Title *</label>
                <input
                  type="text"
                  value={editingQuest.title || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                  placeholder="e.g. The Rusted Manacle Mystery"
                />
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Quest Description / Story *</label>
                <textarea
                  rows={4}
                  value={editingQuest.description || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872] leading-relaxed"
                  placeholder="Enter full quest overview, rumors, and objectives..."
                />
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Discovered Clues (Comma Separated)</label>
                <input
                  type="text"
                  value={editingQuest.clues ? editingQuest.clues.join(', ') : ''}
                  onChange={(e) =>
                    setEditingQuest({
                      ...editingQuest,
                      clues: e.target.value
                        .split(',')
                        .map((c) => c.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none"
                  placeholder="e.g. Corroded iron mark, Orphanage ruins, Eclipse scar"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="quest-resolved-check"
                  checked={editingQuest.resolved || false}
                  onChange={(e) => setEditingQuest({ ...editingQuest, resolved: e.target.checked })}
                  className="rounded border-[#d9b872] text-[#8b5a2b] focus:ring-0"
                />
                <label htmlFor="quest-resolved-check" className="text-amber-200 cursor-pointer font-bold">
                  Mark as Resolved / Completed Quest
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsQuestModalOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuest}
                className="px-4 py-1.5 bg-[#8b5a2b] hover:bg-[#a66d35] text-amber-100 border border-[#d9b872] rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow"
              >
                <Save size={13} /> Save Quest Scroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
