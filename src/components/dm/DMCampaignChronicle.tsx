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
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Calendar,
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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<DMNoteCategory>('quest');
  const [formTarget, setFormTarget] = useState<string>('all');
  const [formIsPlayerVisible, setFormIsPlayerVisible] = useState<boolean>(true);
  const [formTags, setFormTags] = useState<string>('');

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

  const selectedNote = useMemo(() => {
    if (selectedNoteId) {
      const match = notes.find((n) => n.id === selectedNoteId);
      if (match) return match;
    }
    return filteredNotes[0] || notes[0] || null;
  }, [notes, filteredNotes, selectedNoteId]);

  const handleOpenCreate = (prefillTarget?: string) => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('quest');
    setFormTarget(prefillTarget || 'all');
    setFormIsPlayerVisible(true);
    setFormTags('');
    setIsCreatingNew(true);
    setIsEditing(false);
    setShowMobileDetail(true);
  };

  const handleOpenEdit = (note: DMNote) => {
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormTarget(note.targetCharacterId);
    setFormIsPlayerVisible(note.isPlayerVisible);
    setFormTags(note.tags.join(', '));
    setIsEditing(true);
    setIsCreatingNew(false);
    setShowMobileDetail(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    if (isEditing && selectedNote) {
      onUpdateNote(selectedNote.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        targetCharacterId: formTarget,
        isPlayerVisible: formIsPlayerVisible,
        tags: parsedTags,
      });
      setIsEditing(false);
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
      setIsCreatingNew(false);
    }
  };

  const getTargetName = (targetId: string) => {
    if (targetId === 'all') return 'All Party (Public)';
    const member = partyMembers.find(
      (m) =>
        m.id.toLowerCase() === targetId.toLowerCase() ||
        m.name.toLowerCase().includes(targetId.toLowerCase())
    );
    return member ? member.name : targetId.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-[#07080b] text-zinc-200 font-mono text-xs overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-3 bg-[#0c0d14] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Scroll size={16} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] flex items-center gap-2">
              Campaign Chronicle &amp; Character Dispatches
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                {notes.length} dispatches
              </span>
            </h2>
            <p className="text-[10px] text-zinc-400">
              Split-pane secret lore, player handouts, vision dispatches &amp; quest directive reader
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus size={13} />
          <span>New Dispatch</span>
        </button>
      </div>

      {/* 2. Split-Pane Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT COLUMN: Dispatch Directory & Filter Center */}
        <div
          className={`w-full lg:w-88 xl:w-96 flex flex-col border-r border-zinc-800 bg-[#090a10] shrink-0 ${
            showMobileDetail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Filters Bar */}
          <div className="p-2.5 border-b border-zinc-800/80 bg-[#0c0d14]/70 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lore, keywords, #tags..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/80"
              />
            </div>

            {/* Target Character Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <button
                onClick={() => setTargetFilter('all_filter')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 border ${
                  targetFilter === 'all_filter'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                All ({notes.length})
              </button>
              <button
                onClick={() => setTargetFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 border ${
                  targetFilter === 'all'
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Party
              </button>
              {partyMembers.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setTargetFilter(pm.id)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1 border ${
                    targetFilter === pm.id
                      ? 'bg-purple-600 text-white font-bold border-purple-400'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: pm.primaryColor || '#a855f7' }}
                  />
                  <span>{pm.name.split(' ')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setTargetFilter('dm_only')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1 border ${
                  targetFilter === 'dm_only'
                    ? 'bg-red-950 text-red-200 font-bold border-red-700'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Lock size={10} />
                <span>DM Only</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-thin">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-1.5 py-0.2 rounded transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === 'all'
                    ? 'text-amber-400 font-bold underline'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                All Types
              </button>
              {(Object.keys(CATEGORY_META) as DMNoteCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-1.5 py-0.2 rounded transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                      isActive
                        ? `${meta.text} font-bold underline`
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Scannable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-1.5 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Scroll size={28} className="mx-auto text-zinc-600 opacity-60" />
                <p className="text-xs">No dispatches match the active filters.</p>
                <button
                  onClick={() => handleOpenCreate()}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Draft Note
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const meta = CATEGORY_META[note.category] || CATEGORY_META.quest;
                const isSelected = selectedNote?.id === note.id && !isCreatingNew;

                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setIsCreatingNew(false);
                      setIsEditing(false);
                      setShowMobileDetail(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 border ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.08)]'
                        : 'bg-[#0d0e16]/60 border-transparent hover:bg-zinc-900/60 hover:border-zinc-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs shrink-0">{meta.icon}</span>
                        <span
                          className={`font-bold truncate text-xs font-[family-name:var(--font-heading)] ${
                            note.resolved
                              ? 'line-through text-zinc-500'
                              : isSelected
                              ? 'text-purple-300'
                              : 'text-zinc-200'
                          }`}
                        >
                          {note.title}
                        </span>

                        {note.pinned && (
                          <Pin size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                        )}

                        {note.isPlayerVisible ? (
                          <span title="Visible to players">
                            <Eye size={10} className="text-emerald-400 shrink-0" />
                          </span>
                        ) : (
                          <span title="DM Eyes Only">
                            <Lock size={10} className="text-red-400 shrink-0" />
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-1 mb-1 font-sans">
                        {note.content}
                      </p>

                      <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
                          {getTargetName(note.targetCharacterId).split(' ')[0]}
                        </span>

                        {note.tags && note.tags.length > 0 && (
                          <span className="text-purple-400 truncate">
                            {note.tags[0]}
                            {note.tags.length > 1 && ` +${note.tags.length - 1}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-transform ${
                        isSelected ? 'text-purple-400 translate-x-0.5' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Dispatch Reader & Editor Pane */}
        <div
          className={`flex-1 flex flex-col bg-[#07080b] min-w-0 overflow-y-auto ${
            showMobileDetail ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {isCreatingNew || isEditing ? (
            /* EDITOR PANE */
            <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-3xl mx-auto w-full">
              {/* Back Button (for mobile & portrait tablets) */}
              <div className="lg:hidden">
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setIsEditing(false);
                    setShowMobileDetail(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors active:scale-95 mb-2"
                >
                  <ArrowLeft size={13} />
                  <span>&larr; Cancel and Return to Chronicle</span>
                </button>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-[#0d0f17] border border-amber-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 size={14} />
                    <span>{isEditing ? 'Edit Dispatch Note' : 'Draft New Campaign Dispatch'}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setIsEditing(false);
                    }}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSaveNote} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                        Dispatch Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="E.g., The Midnight Prophecy / Catacomb Map"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as DMNoteCategory)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 capitalize cursor-pointer"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                        Target Recipient
                      </label>
                      <select
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="all">👥 All Party (Public Knowledge)</option>
                        {partyMembers.map((pm) => (
                          <option key={pm.id} value={pm.id}>
                            👤 {pm.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={formIsPlayerVisible}
                          onChange={(e) => setFormIsPlayerVisible(e.target.checked)}
                          className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs select-none">
                          Make Visible to Players on their Character Sheet
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                      Dispatch Text (Markdown &amp; Rich Notes) *
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Write the lore description, whisper, mysterious riddle, or tactical orders..."
                      className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-400 resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="#prophecy, #clue, #docks, #boss"
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-sm"
                    >
                      {isEditing ? 'Save Dispatch' : 'Publish Dispatch'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedNote ? (
            /* DISPATCH READER PANE */
            <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-4xl mx-auto w-full">
              {/* Back to Dispatches Button (for mobile & portrait tablets) */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors active:scale-95 mb-2"
                >
                  <ArrowLeft size={13} />
                  <span>&larr; Back to Dispatches</span>
                </button>
              </div>

              {/* Reader Header & Quick Controls */}
              <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        CATEGORY_META[selectedNote.category]?.bg || CATEGORY_META.quest.bg
                      } ${CATEGORY_META[selectedNote.category]?.text || CATEGORY_META.quest.text} ${
                        CATEGORY_META[selectedNote.category]?.border || CATEGORY_META.quest.border
                      }`}
                    >
                      <span>{CATEGORY_META[selectedNote.category]?.icon || '⚡'}</span>
                      <span>{CATEGORY_META[selectedNote.category]?.label || 'Dispatch'}</span>
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-purple-950/60 text-purple-200 border-purple-800/60">
                      🎯 Recipient: {getTargetName(selectedNote.targetCharacterId)}
                    </span>

                    <button
                      onClick={() =>
                        onUpdateNote(selectedNote.id, {
                          resolved: !selectedNote.resolved,
                        })
                      }
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                        selectedNote.resolved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {selectedNote.resolved ? '✓ Completed / Resolved' : 'Mark as Resolved'}
                    </button>
                  </div>

                  <h3
                    className={`text-lg md:text-xl font-bold font-[family-name:var(--font-heading)] ${
                      selectedNote.resolved ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {selectedNote.title}
                  </h3>
                </div>

                {/* Tactical Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateNote(selectedNote.id, { pinned: !selectedNote.pinned })
                    }
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      selectedNote.pinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                    title={selectedNote.pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin size={14} className={selectedNote.pinned ? 'fill-amber-400' : ''} />
                  </button>

                  <button
                    onClick={() => onToggleVisibility(selectedNote.id)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      selectedNote.isPlayerVisible
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                    title={
                      selectedNote.isPlayerVisible
                        ? 'Visible to players. Click to hide.'
                        : 'Hidden from players (DM Eyes Only). Click to reveal.'
                    }
                  >
                    {selectedNote.isPlayerVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(selectedNote)}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 cursor-pointer transition-colors"
                    title="Edit Dispatch"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete dispatch "${selectedNote.title}"?`)) {
                        onDeleteNote(selectedNote.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 cursor-pointer transition-colors"
                    title="Delete Dispatch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Parchment Dispatch Body */}
              <div className="p-5 md:p-6 rounded-2xl bg-[#0c0d15] border border-purple-500/30 shadow-2xl space-y-4">
                <div className="text-zinc-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans font-normal">
                  {selectedNote.content}
                </div>

                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-1.5">
                    {selectedNote.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-zinc-950 text-purple-300 border border-purple-500/30 text-[10px] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Player Synchronization Status */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Synchronized with character sheet of:{' '}
                    <strong className="text-zinc-200">
                      {getTargetName(selectedNote.targetCharacterId)}
                    </strong>
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {selectedNote.isPlayerVisible ? 'Published to Player' : 'Staged (DM Only)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
              <Scroll size={36} className="text-zinc-600 opacity-60" />
              <p className="text-sm font-bold text-zinc-300">No Dispatch Selected</p>
              <p className="text-xs max-w-sm">
                Choose a campaign note from the directory or draft a new secret dispatch for your players.
              </p>
              <button
                onClick={() => handleOpenCreate()}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-sm"
              >
                + New Dispatch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
