'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Crown,
  Shield,
  ArrowRight,
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
  Pin,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import GlowButton from '../ui/GlowButton';
import SyncStatusBadge from '../ui/SyncStatusBadge';
import { useCharacter } from '@/app/providers';
import type { DMNote } from '@/lib/dm-types';

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
    kastoriel,
    navigateToCharacter,
    showToastNotification,
    getPortraitUrl,
    openMediaPicker,
    customMembers,
    setCustomMembers: saveCustomMembers,
    dmNotes,
    addDMNote,
    updateDMNote,
    deleteDMNote,
    customNPCs,
  } = useCharacter();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<CustomMember> | null>(null);

  // Quest Editing State (Synchronized with DM Chronicle)
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Partial<DMNote> | null>(null);

  // Open modal to add or edit custom member
  const handleOpenMemberModal = (member?: CustomMember) => {
    if (member) {
      setEditingMember(member);
    } else {
      setEditingMember({
        id: `custom-${Date.now()}`,
        name: `Adventurer #${customMembers.length + 6}`,
        playerName: 'Guild Friend',
        race: 'Human',
        characterClass: 'Fighter',
        level: 10,
        currentHP: 85,
        maxHP: 85,
        ac: 16,
        role: 'Core Member',
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

  // Helper to format target companion name for quests
  const getTargetName = (targetId: string) => {
    switch (targetId.toLowerCase()) {
      case 'all':
        return 'All Party';
      case 'vesper':
      case 'earl':
        return character.name || 'Earl';
      case 'aria':
        return aria.name || 'Aria';
      case 'cyrus':
        return cyrus.name || 'Cyrus';
      case 'wynel':
        return wynel.name || "Wyn'el";
      case 'kastoriel':
        return kastoriel.name || 'Kastoriel';
      default: {
        const found = customMembers.find(
          (m) => m.id === targetId || m.name.toLowerCase() === targetId.toLowerCase()
        );
        return found ? found.name : targetId;
      }
    }
  };

  // Tavern Quests Synchronized with DM Campaign Chronicle
  // Strictly filter out hidden notes (isPlayerVisible !== true), secrets, and hero-specific personal directives
  const dmQuests = useMemo(() => {
    return (dmNotes || []).filter(
      (note) =>
        note.isPlayerVisible === true &&
        note.category !== 'secret' &&
        (!note.targetCharacterId || note.targetCharacterId.toLowerCase() === 'all') &&
        (note.category === 'quest' || (note.tags && note.tags.some((t) => t.toLowerCase().includes('quest'))))
    );
  }, [dmNotes]);

  const [questSortMode, setQuestSortMode] = useState<'priority' | 'newest' | 'alphabetical'>('priority');

  // Sorted Quests based on user selection
  const sortedQuests = useMemo(() => {
    const list = [...dmQuests];
    if (questSortMode === 'alphabetical') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (questSortMode === 'newest') {
      return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    // Default: Priority (Active pinned first, then unpinned, resolved at bottom)
    return list.sort((a, b) => {
      if (a.resolved && !b.resolved) return 1;
      if (!a.resolved && b.resolved) return -1;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [dmQuests, questSortMode]);

  // Campaign Lore Archive NPCs visible to players
  const playerVisibleNPCs = useMemo(() => {
    return (customNPCs || []).filter((npc) => npc.sharedWithPlayers);
  }, [customNPCs]);

  const [tavernNpcSearch, setTavernNpcSearch] = useState('');
  const [tavernNpcSort, setTavernNpcSort] = useState<'name' | 'role' | 'location' | 'category'>('name');

  const filteredTavernNPCs = useMemo(() => {
    let list = playerVisibleNPCs;
    if (tavernNpcSearch.trim()) {
      const q = tavernNpcSearch.toLowerCase();
      list = list.filter(
        (npc) =>
          npc.name.toLowerCase().includes(q) ||
          (npc.title && npc.title.toLowerCase().includes(q)) ||
          (npc.affiliation && npc.affiliation.toLowerCase().includes(q)) ||
          (npc.location && npc.location.toLowerCase().includes(q)) ||
          (npc.personality && npc.personality.toLowerCase().includes(q)) ||
          (npc.questDescription && npc.questDescription.toLowerCase().includes(q)) ||
          (npc.notes && npc.notes.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (tavernNpcSort === 'role') return (a.title || '').localeCompare(b.title || '');
      if (tavernNpcSort === 'location') return (a.location || '').localeCompare(b.location || '');
      if (tavernNpcSort === 'category') return (a.category || '').localeCompare(b.category || '');
      return a.name.localeCompare(b.name);
    });
  }, [playerVisibleNPCs, tavernNpcSearch, tavernNpcSort]);

  const handleOpenQuestModal = (quest?: DMNote) => {
    if (quest) {
      setEditingQuest({
        ...quest,
        tags: quest.tags || [],
      });
    } else {
      setEditingQuest({
        title: '',
        content: '',
        category: 'quest',
        targetCharacterId: 'all',
        isPlayerVisible: true,
        pinned: false,
        resolved: false,
        tags: ['#quest', '#bounty'],
        author: 'Dungeon Master',
      });
    }
    setIsQuestModalOpen(true);
  };

  const handleSaveQuest = () => {
    if (!editingQuest || !editingQuest.title?.trim()) return;

    if (editingQuest.id) {
      updateDMNote(editingQuest.id, {
        title: editingQuest.title.trim(),
        content: editingQuest.content?.trim() || '',
        category: 'quest',
        targetCharacterId: editingQuest.targetCharacterId || 'all',
        isPlayerVisible: editingQuest.isPlayerVisible ?? true,
        pinned: editingQuest.pinned ?? false,
        resolved: editingQuest.resolved ?? false,
        tags: editingQuest.tags || [],
        author: editingQuest.author || 'Dungeon Master',
      });
      showToastNotification('Tavern Quest Board', `Updated quest: ${editingQuest.title}`, 'quest');
    } else {
      addDMNote({
        title: editingQuest.title.trim(),
        content: editingQuest.content?.trim() || '',
        category: 'quest',
        targetCharacterId: editingQuest.targetCharacterId || 'all',
        isPlayerVisible: true,
        pinned: editingQuest.pinned ?? false,
        resolved: editingQuest.resolved ?? false,
        tags: editingQuest.tags || ['#quest'],
        author: editingQuest.author || 'Dungeon Master',
      });
      showToastNotification('Tavern Quest Board', `Posted new quest: ${editingQuest.title}`, 'quest');
    }

    setIsQuestModalOpen(false);
    setEditingQuest(null);
  };

  const handleDeleteQuest = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove quest "${title}" from the tavern board? This also removes it from the DM campaign chronicle.`)) {
      deleteDMNote(id);
      showToastNotification('Tavern Quest Board', `Removed quest: ${title}`, 'quest');
    }
  };

  const handleToggleQuestResolved = (quest: DMNote) => {
    const nextResolved = !quest.resolved;
    updateDMNote(quest.id, { resolved: nextResolved });
    showToastNotification(
      'Quest Status Updated',
      `Marked "${quest.title}" as ${nextResolved ? 'RESOLVED' : 'ACTIVE'}`,
      'quest'
    );
  };

  const handleToggleQuestPinned = (quest: DMNote) => {
    updateDMNote(quest.id, { pinned: !quest.pinned });
  };

  // Total party size calculation
  const totalMembersCount = 5 + customMembers.length; // Earl + Aria + Cyrus + Wyn'el + Kastoriel + Custom

  return (
    <div className="space-y-10 animate-fade-in-up py-2 w-full max-w-[1720px] mx-auto font-['Spectral',serif]">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#d9b872]/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#d9b872] font-['Cormorant_Garamond',serif] flex items-center gap-2 uppercase tracking-wide sm:tracking-wider text-glow-gold leading-tight">
              <Crown size={20} className="text-amber-400 shrink-0" />
              <span className="sm:hidden">Guild Hero Roster</span>
              <span className="hidden sm:inline">Guild Hero Roster Board</span>
            </h2>
            <p className="text-[11px] sm:text-xs font-mono text-[var(--color-parchment-dim)] leading-snug mt-1">
              5 Core Companions{customMembers.length > 0 ? ` + ${customMembers.length} Allies` : ''} &bull;{' '}
              <span className="sm:hidden">Tap hero to inspect sheet</span>
              <span className="hidden sm:inline">Click to open character sheet</span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
            <SyncStatusBadge subtle={true} />

            <button
              onClick={() => openMediaPicker()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[rgba(218,165,32,0.15)] hover:bg-[rgba(218,165,32,0.3)] text-amber-100 border border-[#d9b872]/60 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:-translate-y-0.5 active:scale-95 min-h-[38px] cursor-pointer"
            >
              <Camera size={14} className="text-amber-300 shrink-0" />
              <span className="sm:hidden">Wallpapers</span>
              <span className="hidden sm:inline">Customize Wallpapers &amp; Portraits</span>
            </button>

            <button
              onClick={() => handleOpenMemberModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#8b5a2b]/80 hover:bg-[#8b5a2b] text-amber-100 border border-[#d9b872]/50 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:-translate-y-0.5 min-h-[38px] cursor-pointer"
            >
              <UserPlus size={14} className="text-amber-300 shrink-0" />
              <span className="sm:hidden">Add Hero</span>
              <span className="hidden sm:inline">Add Party Member Slot</span>
            </button>
          </div>
        </div>

        {/* Responsive Hero Roster Grid: 1 col on mobile, 2 on tablet, 3 on laptop, 4 on desktop, 5 on wide monitors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1700px]:grid-cols-5 gap-5 sm:gap-6">
          {/* ================================================================
             ROSTER CARD 1: EARL (VESPER ASHWOOD)
             ================================================================ */}
          <div className="medieval-card p-5 border-2 border-[var(--color-crimson-500)]/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(26,16,18,0.98)_0%,rgba(14,8,10,0.99)_100%)] relative group hover:border-[var(--color-crimson-400)] shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(220,38,38,0.18)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner tr text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner bl text-[var(--color-crimson-400)]/70">❖</span>
            <span className="medieval-corner br text-[var(--color-crimson-400)]/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-[var(--color-crimson-500)]/20 rounded-xl pointer-events-none group-hover:border-[var(--color-crimson-400)]/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-red-950/90 via-[rgba(220,38,38,0.25)] to-red-950/90 border-b border-[var(--color-crimson-500)]/40 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[var(--color-crimson-300)] flex items-center gap-1.5 truncate">
                <span>⚜</span> Shadow Guild Oath
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-gold-400)] font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-amber-500/20">
                Silent Blade
              </span>
            </div>

            <div className="space-y-3.5 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[var(--color-crimson-500)]/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-[var(--color-crimson-400)] transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('vesper')}
                      alt="Earl (Vesper Ashwood)"
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-red-700 via-red-800 to-red-950 border border-red-400 text-[11px] text-amber-200">
                    🗡️
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Earl
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-[var(--color-crimson-500)]/50 text-rose-200 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {character.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                    <span className="text-rose-300">Human</span>
                    <span className="text-rose-500/50">&bull;</span>
                    <span className="text-rose-200">Rogue Assassin</span>
                  </div>

                  <p className="text-xs text-[var(--color-gold-400)] italic font-serif truncate" title="Vesper Ashwood">
                    &ldquo;Vesper Ashwood&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[var(--color-crimson-500)] text-xs text-[var(--color-parchment-muted)] leading-relaxed italic min-h-[62px] flex items-center">
                &ldquo;Deadly assassin of the Ashen Pact, wielding the soul-stealing vestige dagger Orphan&apos;s Tithe.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-[var(--color-crimson-500)]/30 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-rose-400 text-xs sm:text-sm">{character.combat.currentHP}/{character.combat.maxHP}</span>
                </div>
                <div className="border-x border-[var(--color-crimson-500)]/20">
                  <span className="block text-[8.5px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[var(--color-gold-400)] text-xs sm:text-sm">{character.ac}</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-bold">Sneak Atk</span>
                  <span className="font-black text-amber-200 text-xs sm:text-sm">5d6</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('vesper')}
              className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 2: ARIA SIL'AVETH
             ================================================================ */}
          <div className="medieval-card p-5 border-2 border-[#a992e8]/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(169,146,232,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(20,18,34,0.98)_0%,rgba(12,10,22,0.99)_100%)] relative group hover:border-[#a992e8] shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(169,146,232,0.2)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-[#a992e8]/70">❖</span>
            <span className="medieval-corner tr text-[#a992e8]/70">❖</span>
            <span className="medieval-corner bl text-[#a992e8]/70">❖</span>
            <span className="medieval-corner br text-[#a992e8]/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-[#a992e8]/20 rounded-xl pointer-events-none group-hover:border-[#a992e8]/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-[#171b3f]/90 via-[rgba(169,146,232,0.25)] to-[#171b3f]/90 border-b border-[#a992e8]/40 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[#c7c2e6] flex items-center gap-1.5 truncate">
                <span>🌙</span> Silver Moon Conclave
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#d9b872] font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-purple-500/20">
                Astral Weaver
              </span>
            </div>

            <div className="space-y-3.5 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#a992e8]/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-[#a992e8] transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('aria')}
                      alt="Aria Sil'aveth"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-indigo-800 via-purple-900 to-[#0d1026] border border-[#a992e8] text-[11px] text-[#d9b872]">
                    🌙
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Aria Sil&apos;aveth
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#171b3f]/80 border border-[#a992e8]/50 text-[#c7c2e6] uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {aria.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                    <span className="text-purple-300">High Elf</span>
                    <span className="text-purple-500/50">&bull;</span>
                    <span className="text-[#a992e8]">Sorcerer Lunar</span>
                  </div>

                  <p className="text-xs text-[#d9b872] italic font-serif truncate" title={aria.subline}>
                    &ldquo;{aria.subline}&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[#a992e8] text-xs text-[#cfd4ee] leading-relaxed italic min-h-[62px] flex items-center">
                &ldquo;High elven lunar sorceress who channels cosmic starfire and moon tides to manipulate magic.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-[#a992e8]/30 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-[#9aa1cc] uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-[#c9707a] text-xs sm:text-sm">{aria.combat.currentHP}/{aria.combat.maxHP}</span>
                </div>
                <div className="border-x border-[#a992e8]/20">
                  <span className="block text-[8.5px] text-[#9aa1cc] uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[#d9b872] text-xs sm:text-sm">{aria.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-[#9aa1cc] uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-[#a992e8] text-xs sm:text-sm">{aria.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('aria')}
              className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 3: CYRUS HYACINTHUS
             ================================================================ */}
          <div className="medieval-card p-5 border-2 border-amber-500/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.14)_0%,transparent_70%),linear-gradient(145deg,rgba(30,22,12,0.98)_0%,rgba(18,14,8,0.99)_100%)] relative group hover:border-amber-400 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(218,165,32,0.2)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-amber-400/70">❖</span>
            <span className="medieval-corner tr text-amber-400/70">❖</span>
            <span className="medieval-corner bl text-amber-400/70">❖</span>
            <span className="medieval-corner br text-amber-400/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-amber-500/20 rounded-xl pointer-events-none group-hover:border-amber-400/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-amber-950/90 via-[rgba(218,165,32,0.25)] to-amber-950/90 border-b border-amber-500/40 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-amber-300 flex items-center gap-1.5 truncate">
                <span>☀️</span> Temple of Apollo
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#d9b872] font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-amber-500/20">
                Solar Oracle
              </span>
            </div>

            <div className="space-y-3.5 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-amber-400 transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('cyrus')}
                      alt="Cyrus Hyacinthus"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border border-amber-300 text-[11px] text-amber-100">
                    ☀️
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Cyrus Hyacinthus
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {cyrus.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                    <span className="text-amber-200">Aasimar</span>
                    <span className="text-amber-500/50">&bull;</span>
                    <span className="text-amber-300">Light Cleric</span>
                  </div>

                  <p className="text-xs text-amber-200/90 italic font-serif truncate" title={cyrus.subline}>
                    &ldquo;{cyrus.subline}&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-amber-500 text-xs text-amber-100/90 leading-relaxed italic min-h-[62px] flex items-center">
                &ldquo;Solar oracle of Apollo blessed with radiant wings, divine sunfire, and prophetic foresight.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-amber-500/30 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-amber-200/60 uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-amber-400 text-xs sm:text-sm">{cyrus.combat.currentHP}/{cyrus.combat.maxHP}</span>
                </div>
                <div className="border-x border-amber-500/20">
                  <span className="block text-[8.5px] text-amber-200/60 uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-[var(--color-gold-400)] text-xs sm:text-sm">{cyrus.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-amber-200/60 uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-amber-300 text-xs sm:text-sm">{cyrus.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('cyrus')}
              className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 4: WYN'EL AELUIN
             ================================================================ */}
          <div className="medieval-card p-5 border-2 border-pink-500/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(236,72,153,0.18)_0%,transparent_70%),linear-gradient(145deg,rgba(38,10,25,0.98)_0%,rgba(20,4,14,0.99)_100%)] relative group hover:border-pink-400 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(236,72,153,0.22)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-pink-400/70">❖</span>
            <span className="medieval-corner tr text-pink-400/70">❖</span>
            <span className="medieval-corner bl text-pink-400/70">❖</span>
            <span className="medieval-corner br text-pink-400/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-pink-500/20 rounded-xl pointer-events-none group-hover:border-pink-400/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-pink-950/90 via-[rgba(236,72,153,0.25)] to-pink-950/90 border-b border-pink-500/40 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-pink-300 flex items-center gap-1.5 truncate">
                <span>👑</span> House Aeluin Crown
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-pink-200 font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-pink-500/30">
                Archfey Exile
              </span>
            </div>

            <div className="space-y-3.5 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-pink-500/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-pink-400 transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('wynel')}
                      alt="Wyn'el Aeluin"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-pink-600 via-rose-700 to-pink-950 border border-pink-400 text-[11px] text-pink-100">
                    👑
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-pink-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Wyn’el Aeluin
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-500/50 text-pink-300 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {wynel.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                    <span className="text-pink-200">Half-Elf</span>
                    <span className="text-pink-500/50">&bull;</span>
                    <span className="text-pink-300">Archfey Warlock</span>
                  </div>

                  <p className="text-xs text-pink-300/80 italic font-serif truncate" title="Prince of House Aeluin">
                    &ldquo;Prince of House Aeluin&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-pink-500 text-xs text-pink-100/90 leading-relaxed italic min-h-[62px] flex items-center">
                &ldquo;Exiled noble prince bound to the Crimson Heart-Tattoo, wielding scarlet chaos magic and eldritch secrets.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-pink-500/30 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-pink-200/60 uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-pink-400 text-xs sm:text-sm">{wynel.combat.currentHP}/{wynel.combat.maxHP}</span>
                </div>
                <div className="border-x border-pink-500/20">
                  <span className="block text-[8.5px] text-pink-200/60 uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-pink-300 text-xs sm:text-sm">{wynel.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-pink-200/60 uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-pink-300 text-xs sm:text-sm">{wynel.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('wynel')}
              className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-pink-200 hover:text-pink-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-pink-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARD 5: KASTORIEL, THE GROUNDED STAR
             ================================================================ */}
          <div className="medieval-card p-5 border-2 border-teal-500/60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(20,184,166,0.18)_0%,transparent_70%),linear-gradient(145deg,rgba(8,24,28,0.98)_0%,rgba(4,14,18,0.99)_100%)] relative group hover:border-teal-400 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(20,184,166,0.22)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Corner Filigree Glyphs */}
            <span className="medieval-corner tl text-teal-400/70">❖</span>
            <span className="medieval-corner tr text-teal-400/70">❖</span>
            <span className="medieval-corner bl text-teal-400/70">❖</span>
            <span className="medieval-corner br text-teal-400/70">❖</span>

            {/* Inner Hairline Filigree Border */}
            <div className="absolute inset-[5px] border border-teal-500/20 rounded-xl pointer-events-none group-hover:border-teal-400/40 transition-colors" />

            {/* Heraldic Top Ribbon Banner */}
            <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-teal-950/90 via-[rgba(20,184,166,0.25)] to-teal-950/90 border-b border-teal-500/40 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-teal-300 flex items-center gap-1.5 truncate">
                <span>⭐</span> Starlight Coven
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-teal-200 font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-teal-500/30">
                The Grounded Star
              </span>
            </div>

            <div className="space-y-3.5 relative z-10">
              {/* Header & Portrait Block */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-teal-400/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-teal-400 transition-all duration-300 relative">
                    <img
                      src={getPortraitUrl('kastoriel')}
                      alt="Kastoriel, The Grounded Star"
                      className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Embossed Wax Seal Stamp */}
                  <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-950 border border-teal-300 text-[11px] text-teal-100">
                    ⭐
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-teal-100 font-['Cormorant_Garamond',serif] leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      Kastoriel
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/50 text-teal-300 uppercase tracking-wider shrink-0 shadow-inner">
                      Lv {kastoriel.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                    <span className="text-teal-200">Half-Elf</span>
                    <span className="text-teal-500/50">&bull;</span>
                    <span className="text-teal-300">Stars Druid</span>
                  </div>

                  <p className="text-xs text-teal-200/90 italic font-serif truncate" title="The Grounded Star">
                    &ldquo;The Grounded Star&rdquo;
                  </p>
                </div>
              </div>

              {/* Aged Parchment Lore Fragment */}
              <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-teal-500 text-xs text-teal-100/90 leading-relaxed italic min-h-[62px] flex items-center">
                &ldquo;Exiled star druid bound to the blade Pendulum, guiding celestial constellations to track and protect his twin Poluxien.&rdquo;
              </div>

              {/* Clean 3-Col Medieval Stat Plaque */}
              <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-teal-500/30 text-center font-mono">
                <div>
                  <span className="block text-[8.5px] text-teal-200/60 uppercase tracking-wider font-bold">Vitality</span>
                  <span className="font-black text-teal-400 text-xs sm:text-sm">{kastoriel.combat.currentHP}/{kastoriel.combat.maxHP}</span>
                </div>
                <div className="border-x border-teal-500/20">
                  <span className="block text-[8.5px] text-teal-200/60 uppercase tracking-wider font-bold">Armor</span>
                  <span className="font-black text-teal-300 text-xs sm:text-sm">{kastoriel.combat.ac}</span>
                </div>
                <div>
                  <span className="block text-[8.5px] text-teal-200/60 uppercase tracking-wider font-bold">Spell DC</span>
                  <span className="font-black text-teal-300 text-xs sm:text-sm">{kastoriel.spellcasting.spellSaveDC}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToCharacter('kastoriel')}
              className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-teal-200 hover:text-teal-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              <span>📜 Inspect Hero Sheet</span>
              <ArrowRight size={14} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ================================================================
             ROSTER CARDS 3..N: CUSTOM GUILD MEMBERS
             ================================================================ */}
          {customMembers.map((member) => (
            <div
              key={member.id}
              className="medieval-card p-5 border-2 border-[#d9b872]/40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.1)_0%,transparent_70%),linear-gradient(145deg,rgba(24,20,16,0.98)_0%,rgba(14,11,8,0.99)_100%)] relative group hover:border-[#d9b872] shadow-[0_16px_45px_rgba(0,0,0,0.85)] transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Corner Filigree Glyphs */}
              <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
              <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
              <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
              <span className="medieval-corner br text-[#d9b872]/70">❖</span>

              {/* Inner Hairline Filigree Border */}
              <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none group-hover:border-[#d9b872]/40 transition-colors" />

              {/* Heraldic Top Ribbon Banner */}
              <div className="relative z-10 -mx-5 -mt-5 mb-4 px-4 py-1.5 bg-gradient-to-r from-[#2a1e12]/90 via-[rgba(218,165,32,0.2)] to-[#2a1e12]/90 border-b border-[#d9b872]/30 flex items-center justify-between gap-2 shadow-xs">
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[#d9b872] flex items-center gap-1.5 truncate">
                  <span>🛡️</span> Ashen Pact Companion
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-200/80 font-semibold shrink-0 px-2 py-0.5 rounded bg-black/40 border border-[#d9b872]/20">
                  {member.role || 'Guild Initiate'}
                </span>
              </div>

              <div className="space-y-3.5 relative z-10">
                {/* Header & Portrait Block */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-black/80 border-2 border-[#d9b872]/60 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                      {member.avatar.startsWith('http') || member.avatar.startsWith('/') ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.avatar}</span>
                      )}
                    </div>
                    {/* Embossed Wax Seal Stamp */}
                    <div className="medieval-wax-seal absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-700 via-amber-800 to-[#1e150b] border border-[#d9b872] text-[11px] text-amber-100">
                      🛡️
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-['Cormorant_Garamond',serif] leading-tight truncate">
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

                    <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono font-semibold">
                      <span className="text-amber-200">{member.race}</span>
                      <span className="text-amber-500/50">&bull;</span>
                      <span className="text-amber-300">{member.characterClass}</span>
                    </div>

                    <p className="text-xs text-[var(--color-parchment-muted)] italic font-serif truncate">
                      Played by {member.playerName}
                    </p>
                  </div>
                </div>

                {member.notes && (
                  <div className="medieval-parchment-scroll p-3 rounded-xl border-l-[3px] border-l-[#d9b872] text-xs text-[var(--color-parchment-muted)] leading-relaxed italic min-h-[62px] flex items-center line-clamp-2">
                    &ldquo;{member.notes}&rdquo;
                  </div>
                )}

                {/* Quick Stats Plaque */}
                <div className="medieval-stat-plaque grid grid-cols-3 gap-1.5 p-2.5 rounded-xl border border-[#d9b872]/20 text-center font-mono">
                  <div>
                    <span className="block text-[8.5px] text-gray-400 uppercase tracking-wider font-bold">Vitality</span>
                    <span className="font-black text-emerald-400 text-xs sm:text-sm">{member.currentHP}/{member.maxHP}</span>
                  </div>
                  <div className="border-x border-[#d9b872]/20">
                    <span className="block text-[8.5px] text-gray-400 uppercase tracking-wider font-bold">Armor</span>
                    <span className="font-black text-amber-300 text-xs sm:text-sm">{member.ac}</span>
                  </div>
                  <div>
                    <span className="block text-[8.5px] text-gray-400 uppercase tracking-wider font-bold">Rank</span>
                    <span className="font-black text-amber-100 text-xs sm:text-sm">Lv {member.level}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenMemberModal(member)}
                className="medieval-writ-btn w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
              >
                <Edit3 size={13} /> Edit Companion Sheet
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
         3. EDITABLE ACTIVE QUEST BOARD (SYNCED WITH DM CHRONICLE)
         ==================================================================== */}
      <div>
        {/* EDITABLE ACTIVE QUEST BOARD */}
        <div className="medieval-card p-6 border-2 border-[#d9b872]/50 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.12)_0%,transparent_70%),linear-gradient(145deg,rgba(22,18,14,0.98)_0%,rgba(14,12,10,0.99)_100%)] shadow-[0_16px_45px_rgba(0,0,0,0.85)] rounded-2xl relative overflow-hidden">
          {/* Corner Filigrees */}
          <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
          <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner br text-[#d9b872]/70">❖</span>

          {/* Inner Hairline Border */}
          <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-[#d9b872]/30">
              <div className="flex items-center gap-2.5">
                <BookOpen size={20} className="text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wide sm:tracking-wider leading-tight">
                    <span className="sm:hidden">Tavern Quest Board</span>
                    <span className="hidden sm:inline">Tavern Quest Board &amp; DM Chronicle</span>
                  </h3>
                  <p className="text-[11px] font-mono text-[var(--color-parchment-dim)] leading-snug mt-0.5">
                    Synchronized with DM Chronicle &bull; {sortedQuests.filter(q => !q.resolved).length} Active Bounties, {sortedQuests.filter(q => q.resolved).length} Resolved
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                {/* Quest Sort Selector */}
                <div className="flex items-center gap-1.5 bg-black/60 border border-[#d9b872]/40 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown size={13} className="text-amber-400 shrink-0" />
                  <select
                    value={questSortMode}
                    onChange={(e) => setQuestSortMode(e.target.value as any)}
                    className="bg-transparent text-amber-200 text-xs font-mono focus:outline-none cursor-pointer"
                    title="Sort quest scrolls"
                  >
                    <option value="priority" className="bg-[#181310] text-amber-200">Sort: Priority (Pinned First)</option>
                    <option value="newest" className="bg-[#181310] text-amber-200">Sort: Newest</option>
                    <option value="alphabetical" className="bg-[#181310] text-amber-200">Sort: Title (A-Z)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleOpenQuestModal()}
                  className="medieval-writ-btn flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-200 transition-all cursor-pointer"
                >
                  <Plus size={13} className="text-amber-300 shrink-0" />
                  <span className="sm:hidden">Post Quest</span>
                  <span className="hidden sm:inline">Post New Quest Scroll</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
              {sortedQuests.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-parchment-muted)] italic bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <p>No active quests pinned to the board.</p>
                  <p className="text-[10px] text-zinc-500">Click &ldquo;Post New Quest Scroll&rdquo; or create a quest in the DM Sanctum to pin directives here.</p>
                </div>
              ) : (
                sortedQuests.map((quest) => {
                  const targetLabel = getTargetName(quest.targetCharacterId || 'all');
                  const isAllParty = !quest.targetCharacterId || quest.targetCharacterId === 'all';

                  return (
                    <div
                      key={quest.id}
                      className={`p-4 rounded-xl border transition-all text-xs relative ${quest.resolved
                        ? 'bg-black/40 border-stone-800 opacity-60'
                        : quest.pinned
                        ? 'medieval-parchment-scroll border-[#d9b872] shadow-[0_0_15px_rgba(218,165,32,0.18)] ring-1 ring-[#d9b872]/40'
                        : 'medieval-parchment-scroll border-[#d9b872]/40 hover:border-[#d9b872] shadow-md'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <button
                            onClick={() => handleToggleQuestPinned(quest)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              quest.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-amber-400'
                            }`}
                            title={quest.pinned ? 'Unpin from top' : 'Pin to top of board'}
                          >
                            <Pin size={14} className={quest.pinned ? 'fill-amber-400' : ''} />
                          </button>

                          <h4
                            className={`font-bold text-base font-['Cormorant_Garamond',serif] ${quest.resolved ? 'text-gray-400 line-through' : 'text-amber-200'
                              }`}
                          >
                            {quest.title}
                          </h4>

                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider border font-bold ${quest.resolved
                              ? 'bg-zinc-900 text-zinc-400 border-zinc-700'
                              : quest.pinned
                              ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                              }`}
                          >
                            {quest.resolved ? '✓ RESOLVED' : quest.pinned ? '★ PRIORITY BOUNTY' : 'ACTIVE BOUNTY'}
                          </span>

                          {/* Recipient Target Pill */}
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                              isAllParty
                                ? 'bg-zinc-950/80 text-amber-300/90 border-[#d9b872]/30'
                                : 'bg-purple-950/70 text-purple-200 border-purple-800/60'
                            }`}
                          >
                            🎯 {targetLabel}
                          </span>

                          {/* Author Pill */}
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950/60 text-zinc-400 border border-zinc-800">
                            👑 {quest.author || 'Dungeon Master'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleQuestResolved(quest)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${quest.resolved
                              ? 'text-zinc-500 hover:text-amber-300'
                              : 'text-amber-400 hover:text-emerald-400'
                              }`}
                            title={quest.resolved ? 'Reactivate Quest' : 'Mark Quest Resolved'}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenQuestModal(quest)}
                            className="text-gray-400 hover:text-amber-300 p-1.5 transition-colors cursor-pointer"
                            title="Edit Quest Scroll"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuest(quest.id, quest.title)}
                            className="text-gray-400 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                            title="Remove Quest Scroll"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed italic mb-2 whitespace-pre-wrap">
                        &ldquo;{quest.content}&rdquo;
                      </p>

                      {quest.tags && quest.tags.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#d9b872]/20 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-mono text-amber-300/80 uppercase font-bold mr-1">
                            📜 Directives &amp; Clues:
                          </span>
                          {quest.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-black/60 border border-[#d9b872]/25 text-amber-200 text-[10px] font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
         4. CAMPAIGN LORE ARCHIVE • KNOWN PERSONAS & ALLIES
         ==================================================================== */}
      <div>
        <div className="medieval-card p-6 border-2 border-[#d9b872]/50 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,165,32,0.1)_0%,transparent_70%),linear-gradient(145deg,rgba(22,18,14,0.98)_0%,rgba(14,12,10,0.99)_100%)] shadow-[0_16px_45px_rgba(0,0,0,0.85)] rounded-2xl relative overflow-hidden">
          {/* Corner Filigrees */}
          <span className="medieval-corner tl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner tr text-[#d9b872]/70">❖</span>
          <span className="medieval-corner bl text-[#d9b872]/70">❖</span>
          <span className="medieval-corner br text-[#d9b872]/70">❖</span>

          {/* Inner Hairline Border */}
          <div className="absolute inset-[5px] border border-[#d9b872]/20 rounded-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#d9b872]/30">
              <div className="flex items-center gap-2.5">
                <Users size={20} className="text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wide sm:tracking-wider leading-tight">
                    <span>Campaign Lore Archive &bull; Known Personas</span>
                  </h3>
                  <p className="text-[11px] font-mono text-[var(--color-parchment-dim)] leading-snug mt-0.5">
                    Shared Campaign Codex &bull; {playerVisibleNPCs.length} Revealed Personas Recorded by Dungeon Master
                  </p>
                </div>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={tavernNpcSearch}
                    onChange={(e) => setTavernNpcSearch(e.target.value)}
                    placeholder="Search lore archive..."
                    className="pl-8 pr-2.5 py-1 bg-black/60 border border-[#d9b872]/40 rounded-xl text-xs font-mono text-amber-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#d9b872] w-40 sm:w-48"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-black/60 border border-[#d9b872]/40 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown size={13} className="text-amber-400 shrink-0" />
                  <select
                    value={tavernNpcSort}
                    onChange={(e) => setTavernNpcSort(e.target.value as any)}
                    className="bg-transparent text-amber-200 text-xs font-mono focus:outline-none cursor-pointer"
                    title="Sort campaign lore personas"
                  >
                    <option value="name" className="bg-[#181310] text-amber-200">Sort: Name (A-Z)</option>
                    <option value="role" className="bg-[#181310] text-amber-200">Sort: Role / Title</option>
                    <option value="location" className="bg-[#181310] text-amber-200">Sort: Location</option>
                    <option value="category" className="bg-[#181310] text-amber-200">Sort: Category</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Cards */}
            {filteredTavernNPCs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-parchment-muted)] italic bg-black/40 rounded-xl border border-white/5 space-y-1">
                {playerVisibleNPCs.length === 0 ? (
                  <>
                    <p className="text-amber-200/90 font-serif text-sm">No personas currently revealed in the Lore Archive.</p>
                    <p className="text-[11px] text-zinc-500">
                      The Dungeon Master can share NPCs created in the DM Sanctum Codex by toggling &ldquo;Share this NPC with players&rdquo;.
                    </p>
                  </>
                ) : (
                  <p>No personas matched &ldquo;{tavernNpcSearch}&rdquo;.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTavernNPCs.map((npc) => {
                  const categoryColor =
                    npc.category === 'friendly'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : npc.category === 'quest'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                      : npc.category === 'enemy' || npc.category === 'boss'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/50';

                  return (
                    <div
                      key={npc.id}
                      className="medieval-card p-4 border border-[#d9b872]/40 bg-black/60 rounded-xl flex flex-col justify-between space-y-3 hover:border-[#d9b872] transition-colors"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Portrait & Identity */}
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-[#d9b872]/60 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                            {npc.portraitUrl ? (
                              <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">👤</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-amber-200 font-['Cormorant_Garamond',serif] leading-tight truncate">
                              {npc.name}
                            </h4>
                            {npc.title && (
                              <p className="text-xs text-amber-300/80 italic font-serif truncate">
                                {npc.title}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {npc.category && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase font-bold border ${categoryColor}`}>
                                  {npc.category}
                                </span>
                              )}
                              {npc.creatureType && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                                  {npc.creatureType}
                                </span>
                              )}
                              {npc.alignment && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                                  {npc.alignment}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location & Faction Tags */}
                        {(npc.location || npc.affiliation) && (
                          <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-zinc-400 pt-0.5">
                            {npc.location && (
                              <span className="flex items-center gap-1 text-amber-200/90">
                                <MapPin size={11} className="text-amber-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{npc.location}</span>
                              </span>
                            )}
                            {npc.affiliation && (
                              <span className="text-purple-300/90 truncate max-w-[140px]">
                                ⚑ {npc.affiliation}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Description or Personality */}
                        {(npc.personality || npc.questDescription) && (
                          <p className="text-[11px] text-[var(--color-parchment-muted)] italic leading-relaxed line-clamp-3">
                            {npc.personality || npc.questDescription}
                          </p>
                        )}

                        {/* Notes */}
                        {npc.notes && (
                          <div className="medieval-parchment-scroll p-2 rounded-lg border-l-2 border-l-[#d9b872] text-[10px] text-zinc-300/90 italic leading-relaxed line-clamp-2">
                            &ldquo;{npc.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Combat Stats if available */}
                      {(npc.ac || npc.hp || npc.cr) && (
                        <div className="pt-2 border-t border-[#d9b872]/20 flex items-center justify-around text-center font-mono text-[10px]">
                          <div>
                            <span className="text-zinc-500 block text-[8px] uppercase">AC</span>
                            <span className="font-bold text-amber-300">{npc.ac || 10}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[8px] uppercase">HP</span>
                            <span className="font-bold text-emerald-400">{npc.maxHP || npc.hp || 10}</span>
                          </div>
                          {npc.cr && (
                            <div>
                              <span className="text-zinc-500 block text-[8px] uppercase">CR</span>
                              <span className="font-bold text-purple-300">{npc.cr}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
         MODAL 2: ADD / EDIT ACTIVE QUEST SCROLL (SYNCED WITH DM)
         ==================================================================== */}
      {isQuestModalOpen && editingQuest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181310] border-2 border-[#d9b872] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(217,184,114,0.3)] space-y-4 animate-fade-in-up font-['Spectral',serif]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d9b872]/30">
              <h3 className="text-xl font-bold text-amber-200 font-['Cormorant_Garamond',serif] flex items-center gap-2">
                <Scroll size={18} className="text-amber-400" />
                {editingQuest.id ? 'Edit DM Quest Scroll' : 'Post New Tavern Quest Scroll'}
              </h3>
              <button onClick={() => setIsQuestModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
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
                  placeholder="e.g. Bounty: The Ashen Inquisitors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Recipient / Target</label>
                  <select
                    value={editingQuest.targetCharacterId || 'all'}
                    onChange={(e) => setEditingQuest({ ...editingQuest, targetCharacterId: e.target.value })}
                    className="w-full bg-[#120e0a] border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                  >
                    <option value="all">All Party (Public Tavern Board)</option>
                    <option value="vesper">Earl (Vesper)</option>
                    <option value="aria">Aria</option>
                    <option value="cyrus">Cyrus</option>
                    <option value="wynel">Wyn&apos;el</option>
                    <option value="kastoriel">Kastoriel</option>
                    {customMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-300/90 mb-1 font-bold">Author / Issuer</label>
                  <input
                    type="text"
                    value={editingQuest.author || 'Dungeon Master'}
                    onChange={(e) => setEditingQuest({ ...editingQuest, author: e.target.value })}
                    className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                    placeholder="e.g. Dungeon Master"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Quest Objectives &amp; Bounty Details *</label>
                <textarea
                  rows={4}
                  value={editingQuest.content || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, content: e.target.value })}
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872] leading-relaxed"
                  placeholder="Describe the quest lore, directives, bounties, and targets..."
                />
              </div>

              <div>
                <label className="block text-amber-300/90 mb-1 font-bold">Directives &amp; Clues (Comma Separated)</label>
                <input
                  type="text"
                  value={editingQuest.tags ? editingQuest.tags.join(', ') : ''}
                  onChange={(e) =>
                    setEditingQuest({
                      ...editingQuest,
                      tags: e.target.value
                        .split(',')
                        .map((c) => c.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-black/70 border border-[#d9b872]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#d9b872]"
                  placeholder="e.g. #bounty, #catacombs, #ashen_pact"
                />
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quest-pinned-check"
                    checked={editingQuest.pinned || false}
                    onChange={(e) => setEditingQuest({ ...editingQuest, pinned: e.target.checked })}
                    className="rounded border-[#d9b872] text-[#8b5a2b] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="quest-pinned-check" className="text-amber-200 cursor-pointer font-bold">
                    📌 Pin to Top of Board
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quest-resolved-check"
                    checked={editingQuest.resolved || false}
                    onChange={(e) => setEditingQuest({ ...editingQuest, resolved: e.target.checked })}
                    className="rounded border-[#d9b872] text-[#8b5a2b] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="quest-resolved-check" className="text-amber-200 cursor-pointer font-bold">
                    ✓ Mark as Resolved / Completed
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsQuestModalOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuest}
                className="px-4 py-1.5 bg-[#8b5a2b] hover:bg-[#a66d35] text-amber-100 border border-[#d9b872] rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow cursor-pointer"
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
