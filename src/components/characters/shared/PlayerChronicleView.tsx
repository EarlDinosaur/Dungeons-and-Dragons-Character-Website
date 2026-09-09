'use client';

import React, { useState, useMemo } from 'react';
import {
  Scroll,
  Search,
  Sparkles,
  Lock,
  Eye,
  Tag,
  Compass,
  FileText,
  Clock,
  Shield,
  Award,
  BookOpen,
  Feather,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';
import type { DMNote, DMNoteCategory } from '@/lib/dm-types';

interface PlayerChronicleViewProps {
  characterId: string;
  characterName: string;
  primaryColor?: string;
}

const CATEGORY_META: Record<
  DMNoteCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  quest: {
    label: 'Campaign Quest',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: '⚡',
  },
  secret: {
    label: 'Secret Vision',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: '🔮',
  },
  lore: {
    label: 'Ancient Lore',
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    icon: '📜',
  },
  handout: {
    label: 'DM Handout',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    icon: '✉️',
  },
  clue: {
    label: 'Mystery Clue',
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    icon: '🔍',
  },
  combat: {
    label: 'Tactical Intel',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    icon: '⚔️',
  },
};

export default function PlayerChronicleView({
  characterId,
  characterName,
  primaryColor = '#f59e0b',
}: PlayerChronicleViewProps) {
  const { dmNotes } = useCharacter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'personal' | 'party' | 'quest' | 'secret'>('all');

  // Filter notes shared to this player
  const playerNotes = useMemo(() => {
    const cleanId = characterId.toLowerCase();
    return (dmNotes || []).filter((note) => {
      // Must be marked visible by the DM
      if (!note.isPlayerVisible) return false;

      // Must be addressed to all party or specifically to this character
      const target = note.targetCharacterId.toLowerCase();
      const isTargetMatch = target === 'all' || target === cleanId || cleanId.includes(target);
      if (!isTargetMatch) return false;

      // Filter tabs
      if (activeFilter === 'personal') {
        if (target === 'all') return false;
      } else if (activeFilter === 'party') {
        if (target !== 'all') return false;
      } else if (activeFilter === 'quest') {
        if (note.category !== 'quest') return false;
      } else if (activeFilter === 'secret') {
        if (note.category !== 'secret') return false;
      }

      // Search keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesTags = note.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }

      return true;
    });
  }, [dmNotes, characterId, activeFilter, searchQuery]);

  const personalNotesCount = useMemo(() => {
    const cleanId = characterId.toLowerCase();
    return (dmNotes || []).filter(
      (n) => n.isPlayerVisible && n.targetCharacterId.toLowerCase() === cleanId
    ).length;
  }, [dmNotes, characterId]);

  const partyNotesCount = useMemo(() => {
    return (dmNotes || []).filter(
      (n) => n.isPlayerVisible && n.targetCharacterId.toLowerCase() === 'all'
    ).length;
  }, [dmNotes]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0d0f17]/90 p-6 shadow-2xl backdrop-blur-md">
        {/* Subtle Decorative Aura */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl border border-amber-500/40 bg-zinc-950 text-amber-400 shadow-md"
              style={{ borderColor: `${primaryColor}66` }}
            >
              <Feather size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider">
                  Dungeon Master Chronicle &amp; Lore
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Decrees, dream visions, whispered secrets, and handouts revealed by the Dungeon Master for{' '}
                <span className="text-zinc-200 font-bold">{characterName}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500">Total Notes: </span>
              <span className="font-bold text-amber-400">{playerNotes.length}</span>
            </div>
            {personalNotesCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/80 text-purple-200">
                <span className="text-purple-400">Personal: </span>
                <span className="font-bold text-white">{personalNotesCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All Transcripts ({playerNotes.length})
            </button>
            <button
              onClick={() => setActiveFilter('personal')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'personal'
                  ? 'bg-purple-600 text-white font-bold border-purple-400'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>🔮 Personal Whispers</span>
              <span className="text-[10px] opacity-75">({personalNotesCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('party')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'party'
                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>👥 Party Directives</span>
              <span className="text-[10px] opacity-75">({partyNotesCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('quest')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeFilter === 'quest'
                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              ⚡ Quests
            </button>
            <button
              onClick={() => setActiveFilter('secret')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeFilter === 'secret'
                  ? 'bg-purple-600 text-white font-bold border-purple-400'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              🔮 Visions
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lore, keywords..."
              className="w-full pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 2. Notes Content Grid */}
      {playerNotes.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#090b10]/60 p-8 space-y-3 font-mono">
          <Scroll size={36} className="mx-auto text-zinc-600 opacity-60" />
          <h3 className="text-zinc-300 font-bold text-sm">The Sanctum Awaits</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            The Dungeon Master has not shared any chronicle dispatches or secret visions for this filter yet. Check back
            as your adventure unfolds!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playerNotes.map((note) => {
            const meta = CATEGORY_META[note.category] || CATEGORY_META.quest;
            const isPersonal = note.targetCharacterId.toLowerCase() !== 'all';

            return (
              <div
                key={note.id}
                className={`relative flex flex-col rounded-2xl border p-5 bg-[#0a0c13]/95 transition-all shadow-xl hover:border-zinc-700 ${
                  isPersonal
                    ? 'border-purple-500/40 bg-gradient-to-b from-[#0e0c1a] to-[#0a0c13]'
                    : 'border-zinc-800/90'
                }`}
              >
                {/* Header: Badges & Recipient */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.8 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 shadow-xs ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>

                    {isPersonal ? (
                      <span className="px-2.5 py-0.8 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <span>🔮</span>
                        <span>Private to {characterName}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.8 rounded-full text-[10px] font-mono font-bold bg-zinc-900 text-amber-300 border border-zinc-700/80 flex items-center gap-1">
                        <span>👥</span>
                        <span>Party Directive</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-zinc-100 mb-2 font-[family-name:var(--font-heading)] leading-snug">
                  {note.title}
                </h3>

                {/* Content */}
                <div className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-serif flex-1 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/90 shadow-inner">
                  {note.content}
                </div>

                {/* Tags & DM Seal */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <div className="flex flex-wrap gap-1">
                    {note.tags &&
                      note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center gap-1 text-zinc-500 italic shrink-0">
                    <span>— Transcribed by Dungeon Master</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
