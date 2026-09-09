'use client';

import React, { useState, useMemo } from 'react';
import {
  Scroll,
  Plus,
  Search,
  Eye,
  EyeOff,
  Pin,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Users,
  Lock,
  Tag,
  BookOpen,
  Compass,
  AlertCircle,
  HelpCircle,
  FileText,
  Send,
} from 'lucide-react';
import type { DMNote, DMNoteCategory } from '@/lib/dm-types';

interface DMCampaignChronicleProps {
  notes: DMNote[];
  partyMembers: Array<{ id: string; name: string; primaryColor?: string }>;
  onAddNote: (note: Omit<DMNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<DMNote>) => void;
  onDeleteNote: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const CATEGORY_META: Record<
  DMNoteCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  quest: {
    label: 'Quest Directive',
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

export default function DMCampaignChronicle({
  notes,
  partyMembers,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onToggleVisibility,
}: DMCampaignChronicleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<string>('all_filter');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<DMNoteCategory>('quest');
  const [formTarget, setFormTarget] = useState<string>('all');
  const [formIsPlayerVisible, setFormIsPlayerVisible] = useState<boolean>(true);
  const [formTags, setFormTags] = useState<string>('');

  const handleOpenCreate = (prefillTarget?: string) => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('quest');
    setFormTarget(prefillTarget || 'all');
    setFormIsPlayerVisible(true);
    setFormTags('');
    setEditingId(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (note: DMNote) => {
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormTarget(note.targetCharacterId);
    setFormIsPlayerVisible(note.isPlayerVisible);
    setFormTags(note.tags.join(', '));
    setEditingId(note.id);
    setIsCreating(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    if (editingId) {
      onUpdateNote(editingId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        targetCharacterId: formTarget,
        isPlayerVisible: formIsPlayerVisible,
        tags: parsedTags,
      });
    } else {
      onAddNote({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        targetCharacterId: formTarget,
        isPlayerVisible: formIsPlayerVisible,
        pinned: false,
        tags: parsedTags,
        author: 'Dungeon Master',
      });
    }

    setIsCreating(false);
    setEditingId(null);
  };

  // Filter and sort notes (pinned first, then latest)
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (targetFilter === 'dm_only') {
          if (n.isPlayerVisible) return false;
        } else if (targetFilter !== 'all_filter') {
          if (n.targetCharacterId.toLowerCase() !== targetFilter.toLowerCase()) return false;
        }

        if (categoryFilter !== 'all') {
          if (n.category !== categoryFilter) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = n.title.toLowerCase().includes(q);
          const matchesContent = n.content.toLowerCase().includes(q);
          const matchesTags = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesContent && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [notes, targetFilter, categoryFilter, searchQuery]);

  const getTargetName = (targetId: string) => {
    if (targetId === 'all') return 'All Party (Public)';
    const member = partyMembers.find(
      (m) => m.id.toLowerCase() === targetId.toLowerCase() || m.name.toLowerCase().includes(targetId.toLowerCase())
    );
    return member ? member.name : targetId.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* 1. Header Toolbar */}
      <div className="p-3 bg-[#0d0f17] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Scroll size={15} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)]">
              Campaign Chronicle &amp; Character Dispatches
            </h3>
            <p className="text-[10px] text-zinc-400">
              Create secrets, visions &amp; quest handouts linked directly to player sheets
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={13} />
          <span>New Note</span>
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div className="p-3 bg-[#08090d] border-b border-zinc-800/80 space-y-2">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, lore keywords, #tags..."
              className="w-full pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Clear */}
          {(searchQuery || targetFilter !== 'all_filter' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTargetFilter('all_filter');
                setCategoryFilter('all');
              }}
              className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white rounded bg-zinc-900 border border-zinc-800"
            >
              Reset
            </button>
          )}
        </div>

        {/* Target Character Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
          <span className="text-[10px] text-zinc-500 uppercase shrink-0 mr-1">Target:</span>
          <button
            onClick={() => setTargetFilter('all_filter')}
            className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ${
              targetFilter === 'all_filter'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All ({notes.length})
          </button>
          <button
            onClick={() => setTargetFilter('all')}
            className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ${
              targetFilter === 'all'
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Party-wide
          </button>
          {partyMembers.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setTargetFilter(pm.id)}
              className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                targetFilter === pm.id
                  ? 'bg-purple-600 text-white font-bold border-purple-400'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pm.primaryColor || '#a855f7' }} />
              <span>{pm.name.split(' ')[0]}</span>
            </button>
          ))}
          <button
            onClick={() => setTargetFilter('dm_only')}
            className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              targetFilter === 'dm_only'
                ? 'bg-red-900 text-red-100 font-bold border-red-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Lock size={10} />
            <span>DM Only</span>
          </button>
        </div>
      </div>

      {/* 3. Create / Edit Note Slide-out or Modal Form */}
      {isCreating && (
        <div className="p-3.5 bg-zinc-950/95 border-b border-amber-500/40 animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Edit3 size={13} />
              <span>{editingId ? 'Edit Chronicle Note' : 'Draft New Campaign Note'}</span>
            </h4>
            <button
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="E.g., The Midnight Prophecy / Catacomb Map"
                  required
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as DMNoteCategory)}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="quest">⚡ Quest Directive</option>
                  <option value="secret">🔮 Secret Vision</option>
                  <option value="lore">📜 Ancient Lore</option>
                  <option value="handout">✉️ DM Handout</option>
                  <option value="clue">🔍 Mystery Clue</option>
                  <option value="combat">⚔️ Tactical Intel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Target Hero / Recipient</label>
                <select
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="all">👥 All Party (Public to everyone)</option>
                  {partyMembers.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      👤 {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Player Visibility</label>
                <button
                  type="button"
                  onClick={() => setFormIsPlayerVisible(!formIsPlayerVisible)}
                  className={`w-full px-3 py-1.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    formIsPlayerVisible
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900/80'
                      : 'bg-red-950/60 text-red-300 border-red-800/70 hover:bg-red-900/80'
                  }`}
                >
                  {formIsPlayerVisible ? (
                    <>
                      <Eye size={13} />
                      <span>Shared to Player (Visible on Sheet)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={13} />
                      <span>DM Eyes Only (Confidential)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Note Content (Markdown supported)</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                placeholder="Write the lore, vision, dream, secret whisper or quest instructions..."
                required
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs font-mono leading-relaxed focus:border-amber-400 focus:outline-none resize-y"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="#boss, #clue, #docks, #prophecy"
                className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs border border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check size={13} />
                <span>{editingId ? 'Update Entry' : 'Publish Note'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Notes List Grid */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono space-y-2">
            <Scroll size={28} className="mx-auto text-zinc-600 opacity-60" />
            <p className="text-xs">No campaign notes match the active filter.</p>
            <button
              onClick={() => handleOpenCreate()}
              className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-xs cursor-pointer inline-flex items-center gap-1"
            >
              <Plus size={12} /> Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNotes.map((note) => {
              const meta = CATEGORY_META[note.category] || CATEGORY_META.quest;
              const isPartyWide = note.targetCharacterId === 'all';

              return (
                <div
                  key={note.id}
                  className={`flex flex-col rounded-xl border p-3 bg-[#0d0f17]/90 transition-all ${
                    note.pinned
                      ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Bar: Target & Category & Pin */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      {/* Category Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>

                      {/* Recipient Target Pill */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPartyWide
                            ? 'bg-zinc-900 text-amber-300 border-zinc-700'
                            : 'bg-purple-950/60 text-purple-200 border-purple-800/60'
                        }`}
                      >
                        🎯 {getTargetName(note.targetCharacterId)}
                      </span>
                    </div>

                    {/* Quick Pin Toggle */}
                    <button
                      onClick={() => onUpdateNote(note.id, { pinned: !note.pinned })}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        note.pinned
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                      title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin size={13} className={note.pinned ? 'fill-amber-400' : ''} />
                    </button>
                  </div>

                  {/* Note Title */}
                  <h4 className="font-bold text-zinc-100 text-xs mb-1.5 font-[family-name:var(--font-heading)] flex items-center gap-1.5">
                    <span>{note.title}</span>
                  </h4>

                  {/* Content Body */}
                  <div className="text-zinc-300 text-[11px] leading-relaxed mb-3 whitespace-pre-wrap flex-1">
                    {note.content}
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-400 border border-zinc-800/80 text-[9px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Footer: Visibility Switch & Action Buttons */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                    <button
                      onClick={() => onToggleVisibility(note.id)}
                      className={`px-2 py-0.8 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                        note.isPlayerVisible
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                      title="Click to toggle visibility on player character sheet"
                    >
                      {note.isPlayerVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{note.isPlayerVisible ? 'Visible on Sheet' : 'DM Eyes Only'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 rounded text-zinc-500 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete chronicle note "${note.title}"?`)) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
