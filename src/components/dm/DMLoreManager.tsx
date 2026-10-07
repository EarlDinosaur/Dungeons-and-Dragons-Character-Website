'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Scroll,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Feather,
  Check,
  AlertCircle,
  HelpCircle,
  Flame,
  Moon,
  Sun,
  Crown,
  Target,
  Search,
  Heart,
  Leaf,
  Shield,
  Skull,
  Swords,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';
import type { BackstoryChapter, CharacterNPC, CharacterState } from '@/lib/types';
import {
  getCharacterStory,
  getDefaultCharacterStory,
  type CharacterStoryData,
} from '@/lib/character-stories';

const AVAILABLE_ICONS = [
  { name: 'Scroll', label: 'Scroll', icon: Scroll },
  { name: 'BookOpen', label: 'Tome', icon: BookOpen },
  { name: 'Flame', label: 'Flame', icon: Flame },
  { name: 'Moon', label: 'Moon', icon: Moon },
  { name: 'Sun', label: 'Sun', icon: Sun },
  { name: 'Crown', label: 'Crown', icon: Crown },
  { name: 'Eye', label: 'Eye', icon: Eye },
  { name: 'Sparkles', label: 'Astral', icon: Sparkles },
  { name: 'Target', label: 'Target', icon: Target },
  { name: 'Search', label: 'Search', icon: Search },
  { name: 'Users', label: 'Bonds', icon: Users },
  { name: 'Heart', label: 'Heart', icon: Heart },
  { name: 'Leaf', label: 'Nature', icon: Leaf },
  { name: 'Shield', label: 'Shield', icon: Shield },
  { name: 'Skull', label: 'Skull', icon: Skull },
  { name: 'Swords', label: 'Blades', icon: Swords },
  { name: 'Feather', label: 'Quill', icon: Feather },
] as const;

interface DMLoreManagerProps {
  initialCharacterId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function DMLoreManager({
  initialCharacterId,
  onClose,
  isModal = false,
}: DMLoreManagerProps) {
  const {
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customCharacters,
    customThemes,
    getPortraitUrl,
    characterLore,
    updateCharacterLore,
    resetCharacterLoreToDefault,
  } = useCharacter();

  // 1. Build List of Editable Characters
  const heroList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      className: string;
      portrait: string;
      isCustom: boolean;
      color: string;
    }> = [
      {
        id: 'vesper',
        name: character.name || 'Earl (Vesper Ashwood)',
        className: `${character.race || 'Human'} ${character.class || 'Rogue'} (${character.subclass || 'Assassin'})`,
        portrait: getPortraitUrl('vesper'),
        isCustom: false,
        color: '#e11d48',
      },
      {
        id: 'aria',
        name: aria?.name || 'Aria Sil’aveth',
        className: `${aria?.race || 'Half-Elf'} ${aria?.characterClass || 'Sorcerer'} (${aria?.subclass || 'Lunar'})`,
        portrait: getPortraitUrl('aria'),
        isCustom: false,
        color: '#8b5cf6',
      },
      {
        id: 'cyrus',
        name: cyrus?.name || 'Cyrus Hyacinthus',
        className: `${cyrus?.race || 'Aasimar'} ${cyrus?.characterClass || 'Oracle'} (${cyrus?.subclass || 'Solar'})`,
        portrait: getPortraitUrl('cyrus'),
        isCustom: false,
        color: '#eab308',
      },
      {
        id: 'wynel',
        name: wynel?.name || "Wyn'el",
        className: `${wynel?.race || 'High Elf'} ${wynel?.characterClass || 'Warlock'} (${wynel?.subclass || 'Archfey'})`,
        portrait: getPortraitUrl('wynel'),
        isCustom: false,
        color: '#ec4899',
      },
      {
        id: 'kastoriel',
        name: kastoriel?.name || 'Kastoriel',
        className: `${kastoriel?.race || 'Half-Elf'} ${kastoriel?.characterClass || 'Druid'} (${kastoriel?.subclass || 'Stars'})`,
        portrait: getPortraitUrl('kastoriel'),
        isCustom: false,
        color: '#14b8a6',
      },
    ];

    // Add custom heroes
    for (const [id, c] of Object.entries(customCharacters || {})) {
      const theme = customThemes[c.name] || { primary: '#6366f1', portraitUrl: '' };
      list.push({
        id,
        name: c.name,
        className: `${c.race || 'Mortal'} ${c.class || 'Adventurer'} (${c.subclass || 'Hero'})`,
        portrait: theme.portraitUrl || getPortraitUrl(c.name),
        isCustom: true,
        color: theme.primary || '#6366f1',
      });
    }

    return list;
  }, [character, aria, cyrus, wynel, kastoriel, customCharacters, customThemes, getPortraitUrl]);

  // Selected Character
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialCharacterId || heroList[0]?.id || 'vesper'
  );

  // Active View Tab: 'edit' or 'preview'
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Working copy of the lore for the selected character
  const [loreForm, setLoreForm] = useState<CharacterStoryData>(() => {
    return getCharacterStory(selectedCharId, undefined, characterLore);
  });

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Synchronize when switching selected hero
  useEffect(() => {
    const currentStory = getCharacterStory(selectedCharId, undefined, characterLore);
    setLoreForm(JSON.parse(JSON.stringify(currentStory)));
    setHasUnsavedChanges(false);
    if (currentStory.chapters && currentStory.chapters[0]) {
      setExpandedChapters(new Set([currentStory.chapters[0].id]));
    } else {
      setExpandedChapters(new Set());
    }
  }, [selectedCharId, characterLore]);

  const activeHero = useMemo(() => {
    return heroList.find((h) => h.id === selectedCharId) || heroList[0];
  }, [heroList, selectedCharId]);

  const hasCustomOverride = !!characterLore[selectedCharId];

  // Helper to toggle chapter expansion
  const toggleChapterExpanded = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // Update Top-level field
  const handleFieldChange = (field: 'title' | 'subtitle' | 'dmSecretLore', value: string) => {
    setLoreForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Toggle DM Secret visibility to player
  const handleToggleSecretRevealed = () => {
    setLoreForm((prev) => ({ ...prev, dmSecretRevealed: !prev.dmSecretRevealed }));
    setHasUnsavedChanges(true);
  };

  // Chapter Handlers
  const handleAddChapter = () => {
    const newId = `ch-${Date.now()}`;
    const newChapter: BackstoryChapter = {
      id: newId,
      title: `Chapter ${loreForm.chapters.length + 1}: New Chronicle`,
      subtitle: 'A pivotal turning point in their destiny',
      icon: 'Scroll',
      content: 'Write the narrative of this chronicle here...',
    };

    setLoreForm((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
    setExpandedChapters((prev) => new Set([...prev, newId]));
    setHasUnsavedChanges(true);
  };

  const handleUpdateChapter = (
    chapterId: string,
    field: keyof BackstoryChapter,
    value: string
  ) => {
    setLoreForm((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, [field]: value } : ch
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (loreForm.chapters.length <= 1) {
      if (!confirm('This is the only chapter. Are you sure you want to delete it?')) return;
    }
    setLoreForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((ch) => ch.id !== chapterId),
    }));
    setHasUnsavedChanges(true);
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= loreForm.chapters.length) return;

    setLoreForm((prev) => {
      const list = [...prev.chapters];
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, chapters: list };
    });
    setHasUnsavedChanges(true);
  };

  // NPC Handlers
  const handleAddNPC = () => {
    const newNPC: CharacterNPC = {
      name: 'New Ally / Contact',
      role: 'Informant & Ally',
      relationship: 'Trusted bond forged in adversity',
      description: 'Describe their appearance, role in the campaign, and secret connection...',
      status: 'Alive & Active',
      icon: 'Users',
    };

    setLoreForm((prev) => ({
      ...prev,
      npcs: [...prev.npcs, newNPC],
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateNPC = (index: number, field: keyof CharacterNPC, value: string) => {
    setLoreForm((prev) => {
      const nextNpcs = [...prev.npcs];
      nextNpcs[index] = { ...nextNpcs[index], [field]: value };
      return { ...prev, npcs: nextNpcs };
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteNPC = (index: number) => {
    setLoreForm((prev) => ({
      ...prev,
      npcs: prev.npcs.filter((_, idx) => idx !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Save Handler
  const handleSave = () => {
    updateCharacterLore(selectedCharId, loreForm);
    setHasUnsavedChanges(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Reset to Default Canon Handler
  const handleResetCanon = () => {
    if (
      confirm(
        `Reset ${activeHero.name}'s story and allies to canonical campaign defaults? All custom changes for this character will be overwritten.`
      )
    ) {
      resetCharacterLoreToDefault(selectedCharId);
      const defaultStory = getDefaultCharacterStory(selectedCharId);
      setLoreForm(defaultStory);
      setHasUnsavedChanges(false);
    }
  };

  // Render Icon Component
  const renderIcon = (iconName?: string, size = 15) => {
    const item = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = item ? item.icon : Scroll;
    return <IconComp size={size} />;
  };

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#07090e] text-zinc-200 font-mono text-xs select-text ${
        isModal ? 'p-4 sm:p-6 rounded-2xl border border-amber-500/30 shadow-2xl' : ''
      }`}
    >
      {/* 1. Header & Character Switcher Ribbon */}
      <div className="border-b border-zinc-800/80 pb-3 mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-amber-500/40 text-amber-400 shadow-md">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-zinc-100 uppercase tracking-wide">
                  Dungeon Master Lore &amp; Dossier Codex
                </h2>
                {hasCustomOverride ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    Custom DM Lore Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700 text-[10px]">
                    Default Canon Lore
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Edit backstories, chronicles, allies, and secret revelations for campaign heroes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Feather size={12} />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye size={12} />
                <span>Player Preview</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Save size={14} />
              <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Lore'}</span>
            </button>

            {/* Restore Default Canon */}
            <button
              type="button"
              onClick={handleResetCanon}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset this hero to default canon lore"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Canon</span>
            </button>

            {/* Modal Close Button */}
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 cursor-pointer ml-1"
                title="Close Lore Manager"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {heroList.map((hero) => {
            const isSelected = hero.id === selectedCharId;
            const hasCustom = !!characterLore[hero.id];
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (!confirm('You have unsaved changes. Switch character anyway?')) return;
                  }
                  setSelectedCharId(hero.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                    : 'bg-zinc-950/70 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.portrait}
                  alt={hero.name}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                />
                <span className="text-xs">{hero.name}</span>
                {hasCustom && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Bar */}
      {saveSuccessNotice && (
        <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            <span>
              Lore chronicles for <strong>{activeHero.name}</strong> saved and synchronized
              instantly to player dossier!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessNotice(false)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. Main Content Area */}
      {viewMode === 'edit' ? (
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* A. Epic Story Header */}
          <section className="bg-zinc-950/90 rounded-2xl border border-zinc-800/90 p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={14} /> Story Title &amp; Epigraph
              </span>
              <span className="text-[10px] text-zinc-500">
                Shown prominently at top of the player&apos;s Lore dossier tab
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Chronicle Title
                </label>
                <input
                  type="text"
                  value={loreForm.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. The Story of Vesper Ashwood"
                  className="w-full px-3 py-2 rounded-xl bg-black/70 border border-zinc-700/80 text-sm font-semibold text-amber-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Subtitle / Heroic Epigraph
                </label>
                <input
                  type="text"
                  value={loreForm.subtitle}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  placeholder="e.g. Assassin of the Shadow Guild & Bearer of The Orphan's Tithe"
                  className="w-full px-3 py-2 rounded-xl bg-black/70 border border-zinc-700/80 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                />
              </div>
            </div>
          </section>

          {/* B. Backstory Chapters */}
          <section className="bg-zinc-950/90 rounded-2xl border border-zinc-800/90 p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scroll size={15} /> Backstory Chapters ({loreForm.chapters.length})
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Chronological chapters recounting the hero&apos;s origin, trials, and defining
                  moments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChapter}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Add Story Chapter</span>
              </button>
            </div>

            {/* Chapter Accordion List */}
            <div className="space-y-3">
              {loreForm.chapters.map((chapter, idx) => {
                const isExpanded = expandedChapters.has(chapter.id);
                return (
                  <div
                    key={chapter.id}
                    className="rounded-xl border border-zinc-800 bg-black/40 overflow-hidden transition-all hover:border-zinc-700"
                  >
                    {/* Chapter Header Bar */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900/60 gap-3">
                      <button
                        type="button"
                        onClick={() => toggleChapterExpanded(chapter.id)}
                        className="flex-1 flex items-center gap-2.5 text-left cursor-pointer min-w-0"
                      >
                        <span className="p-1 rounded-lg bg-black/50 border border-zinc-700 text-amber-400 shrink-0">
                          {renderIcon(chapter.icon)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-zinc-200 text-xs truncate">
                            {idx + 1}. {chapter.title || 'Untitled Chapter'}
                          </div>
                          {chapter.subtitle && (
                            <div className="text-[10px] text-zinc-400 truncate">
                              {chapter.subtitle}
                            </div>
                          )}
                        </div>
                        <span className="text-zinc-500 ml-2">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </button>

                      {/* Move & Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(idx, 'down')}
                          disabled={idx === loreForm.chapters.length - 1}
                          className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer ml-1"
                          title="Delete Chapter"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Editing Body */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-[#0a0d13]/90 border-t border-zinc-800/80 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 space-y-2">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                                Chapter Title
                              </label>
                              <input
                                type="text"
                                value={chapter.title}
                                onChange={(e) =>
                                  handleUpdateChapter(chapter.id, 'title', e.target.value)
                                }
                                placeholder="Chapter Name..."
                                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                                Subtitle / Scene Hook
                              </label>
                              <input
                                type="text"
                                value={chapter.subtitle || ''}
                                onChange={(e) =>
                                  handleUpdateChapter(chapter.id, 'subtitle', e.target.value)
                                }
                                placeholder="Short context or memorable quote..."
                                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          {/* Icon Selector */}
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                              Chapter Emblem
                            </label>
                            <div className="grid grid-cols-5 gap-1 bg-black/50 p-1.5 rounded-lg border border-zinc-800">
                              {AVAILABLE_ICONS.map((ic) => {
                                const IconComp = ic.icon;
                                const isSelected = (chapter.icon || 'Scroll') === ic.name;
                                return (
                                  <button
                                    key={ic.name}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateChapter(chapter.id, 'icon', ic.name)
                                    }
                                    className={`p-1.5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/60'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                    title={ic.label}
                                  >
                                    <IconComp size={13} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Chapter Textarea */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                              Narrative Backstory Content
                            </label>
                            <span className="text-[9px] text-zinc-500">
                              {chapter.content.length} chars &bull;{' '}
                              {chapter.content.split(/\s+/).filter(Boolean).length} words
                            </span>
                          </div>
                          <textarea
                            value={chapter.content}
                            onChange={(e) =>
                              handleUpdateChapter(chapter.id, 'content', e.target.value)
                            }
                            rows={6}
                            placeholder="Write the backstory chapter narrative..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-zinc-700/90 text-zinc-200 text-xs leading-relaxed focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-y font-sans"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* C. Allies, Rivals & Connected NPCs */}
          <section className="bg-zinc-950/90 rounded-2xl border border-zinc-800/90 p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={15} /> Allies, Rivals &amp; Connected Bonds ({loreForm.npcs.length})
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Mentors, handlers, family, archenemies, and companions tied to this hero.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNPC}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Add Connected NPC</span>
              </button>
            </div>

            {loreForm.npcs.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500">
                No connected NPCs registered for this hero yet. Click &quot;Add Connected NPC&quot;
                above.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {loreForm.npcs.map((npc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 hover:border-zinc-700 space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase text-zinc-400 block mb-0.5">
                            Name
                          </label>
                          <input
                            type="text"
                            value={npc.name}
                            onChange={(e) => handleUpdateNPC(idx, 'name', e.target.value)}
                            placeholder="e.g. Father Malachi"
                            className="w-full px-2 py-1 rounded bg-black border border-zinc-700 text-xs font-bold text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-zinc-400 block mb-0.5">
                            Role / Title
                          </label>
                          <input
                            type="text"
                            value={npc.role}
                            onChange={(e) => handleUpdateNPC(idx, 'role', e.target.value)}
                            placeholder="e.g. Former Mentor"
                            className="w-full px-2 py-1 rounded bg-black border border-zinc-700 text-xs text-zinc-300 focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteNPC(idx)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer shrink-0 mt-3"
                        title="Delete NPC"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase text-zinc-400 block mb-0.5">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={npc.relationship || ''}
                          onChange={(e) => handleUpdateNPC(idx, 'relationship', e.target.value)}
                          placeholder="e.g. Sworn Nemesis"
                          className="w-full px-2 py-1 rounded bg-black border border-zinc-700 text-xs text-zinc-300 focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase text-zinc-400 block mb-0.5">
                          Status &amp; Whereabouts
                        </label>
                        <input
                          type="text"
                          value={npc.status || ''}
                          onChange={(e) => handleUpdateNPC(idx, 'status', e.target.value)}
                          placeholder="e.g. Active in the Undercity"
                          className="w-full px-2 py-1 rounded bg-black border border-zinc-700 text-xs text-zinc-300 focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase text-zinc-400 block mb-0.5">
                        Description &amp; Lore Details
                      </label>
                      <textarea
                        value={npc.description}
                        onChange={(e) => handleUpdateNPC(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Key background history and dynamic with player..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-zinc-700 text-xs text-zinc-300 focus:border-amber-400 resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* D. Dungeon Master Secret Revelations */}
          <section className="bg-gradient-to-br from-purple-950/20 via-zinc-950/90 to-black rounded-2xl border border-purple-500/40 p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <Sparkles size={14} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Dungeon Master Secret Revelations &amp; Whispers
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Prophecies, hidden lineages, or dark truths that you can choose to reveal to the
                    player.
                  </p>
                </div>
              </div>

              {/* Reveal Toggle */}
              <button
                type="button"
                onClick={handleToggleSecretRevealed}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  loreForm.dmSecretRevealed
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {loreForm.dmSecretRevealed ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>
                  {loreForm.dmSecretRevealed
                    ? 'Revealed to Player on Dossier'
                    : 'Hidden (DM Eyes Only)'}
                </span>
              </button>
            </div>

            <textarea
              value={loreForm.dmSecretLore || ''}
              onChange={(e) => handleFieldChange('dmSecretLore', e.target.value)}
              rows={4}
              placeholder="e.g. Confidential: The Orphan's Tithe dagger was originally forged not by mortals, but by a splinter cell of the Raven Queen's inquisitors..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-purple-900/60 text-purple-100 text-xs leading-relaxed focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 resize-y"
            />
          </section>
        </div>
      ) : (
        /* ====================================================================
           PLAYER PREVIEW MODE
           ==================================================================== */
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-amber-400 shrink-0" />
              <span>
                Player Perspective Live Preview for <strong>{activeHero.name}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className="text-amber-300 hover:text-amber-100 underline cursor-pointer"
            >
              Return to Editor
            </button>
          </div>

          {/* Simulated Parchment Dossier */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1017]/95 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="pb-4 border-b border-white/10">
              <h2 className="text-2xl font-[family-name:var(--font-heading)] text-amber-300 flex items-center gap-2.5">
                <BookOpen size={24} />
                {loreForm.title}
              </h2>
              {loreForm.subtitle && (
                <p className="text-xs text-amber-200/80 font-mono mt-1">{loreForm.subtitle}</p>
              )}
            </div>

            {/* DM Revelation Banner (if revealed) */}
            {loreForm.dmSecretRevealed && loreForm.dmSecretLore && (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 shadow-md space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-xs">
                  <Sparkles size={14} className="text-purple-400" />
                  Dungeon Master Revelation
                </div>
                <p className="text-xs text-purple-100 leading-relaxed whitespace-pre-line italic font-sans">
                  {loreForm.dmSecretLore}
                </p>
              </div>
            )}

            {/* Chapters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                Chapters of Destiny
              </h3>
              {loreForm.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="rounded-xl border border-white/5 bg-[#12141c]/70 p-4 space-y-2 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-amber-400 shrink-0">
                      {renderIcon(ch.icon, 16)}
                    </span>
                    <div>
                      <div className="font-[family-name:var(--font-heading)] font-semibold text-sm text-zinc-100">
                        {ch.title}
                      </div>
                      {ch.subtitle && (
                        <div className="text-[11px] text-zinc-400 font-mono">{ch.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {ch.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Allies & Bonds */}
            {loreForm.npcs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                  Allies, Rivals &amp; Connected Bonds ({loreForm.npcs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {loreForm.npcs.map((npc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1.5 hover:border-amber-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 text-xs">{npc.name}</span>
                        {npc.status && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {npc.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {npc.role}
                        {npc.relationship ? ` &bull; ${npc.relationship}` : ''}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {npc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
