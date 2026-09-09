'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Search, Plus,
  Trash2, Save, Clock, Scroll, Eye, Target, HelpCircle,
  Users, Sparkles, Moon, Sun, Flame, Crown, Heart, Leaf, Shield
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CharacterState, JournalEntry, CampaignMystery } from '@/lib/types';
import { getCharacterStory, type CharacterStoryData } from '@/lib/character-stories';
import { cn } from '@/lib/utils';

interface DossierProps {
  character: CharacterState;
  onNotesChange: (notes: string) => void;
  onJournalChange: (journal: JournalEntry[]) => void;
  onMysteriesChange: (mysteries: CampaignMystery[]) => void;
}

export default function Dossier({
  character,
  onNotesChange,
  onJournalChange,
  onMysteriesChange,
}: DossierProps) {
  // Resolve dynamic story & chapters matching the active character
  const story: CharacterStoryData = useMemo(() => {
    return getCharacterStory(character.id || character.name, character);
  }, [character]);

  const hasNpcs = story.npcs && story.npcs.length > 0;

  // Initialize expanded chapters (open the first one by default)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (story.chapters && story.chapters[0]) {
      initial.add(story.chapters[0].id);
    }
    return initial;
  });

  // Reset expanded section if character changes
  useEffect(() => {
    if (story.chapters && story.chapters[0]) {
      setExpandedSections(new Set([story.chapters[0].id]));
    }
  }, [character.name, character.id, story.chapters]);

  const [activeSubTab, setActiveSubTab] = useState<'backstory' | 'npcs' | 'mysteries' | 'journal'>('backstory');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryCategory, setNewEntryCategory] = useState<JournalEntry['category']>('note');
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSection = (key: string) => {
    const next = new Set(expandedSections);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedSections(next);
  };

  // Auto-save player notes with debounce
  const handleNotesChange = useCallback((value: string) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      onNotesChange(value);
    }, 500);
  }, [onNotesChange]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const mysteries = character.dossier?.mysteries || [];
  const journal = character.dossier?.journal || [];

  const addJournalEntry = () => {
    if (!newEntryTitle.trim()) return;
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      title: newEntryTitle,
      content: newEntryContent,
      timestamp: new Date().toISOString(),
      category: newEntryCategory,
    };
    onJournalChange([entry, ...journal]);
    setNewEntryTitle('');
    setNewEntryContent('');
  };

  const deleteJournalEntry = (id: string) => {
    onJournalChange(journal.filter((e) => e.id !== id));
  };

  const addClue = (mysteryId: string, clue: string) => {
    if (!clue.trim()) return;
    onMysteriesChange(
      mysteries.map((m) =>
        m.id === mysteryId ? { ...m, clues: [...m.clues, clue] } : m
      )
    );
  };

  const toggleMysteryResolved = (mysteryId: string) => {
    onMysteriesChange(
      mysteries.map((m) =>
        m.id === mysteryId ? { ...m, resolved: !m.resolved } : m
      )
    );
  };

  const categoryColors: Record<string, string> = {
    quest: 'var(--color-gold-400)',
    target: 'var(--color-crimson-400)',
    note: 'var(--color-parchment-muted)',
    session: 'var(--color-arcane-400)',
  };

  // Helper to render dynamic chapter icon
  const renderIcon = (iconName?: string) => {
    const size = 15;
    switch (iconName) {
      case 'Moon':
        return <Moon size={size} className="text-indigo-400" />;
      case 'Sun':
        return <Sun size={size} className="text-amber-400" />;
      case 'Flame':
        return <Flame size={size} className="text-red-400" />;
      case 'Crown':
        return <Crown size={size} className="text-amber-300" />;
      case 'Sparkles':
        return <Sparkles size={size} className="text-amber-300" />;
      case 'Heart':
        return <Heart size={size} className="text-rose-400" />;
      case 'Target':
        return <Target size={size} className="text-red-400" />;
      case 'Search':
        return <Search size={size} className="text-amber-400" />;
      case 'Eye':
        return <Eye size={size} className="text-amber-400" />;
      case 'Users':
        return <Users size={size} className="text-amber-300" />;
      case 'Leaf':
        return <Leaf size={size} className="text-emerald-400" />;
      case 'Shield':
        return <Shield size={size} className="text-amber-400" />;
      default:
        return <Scroll size={size} className="text-[var(--color-gold-400)]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex flex-wrap gap-1.5 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-1.5">
        <button
          onClick={() => setActiveSubTab('backstory')}
          className={cn(
            'flex-1 min-w-[120px] py-2 px-3 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeSubTab === 'backstory'
              ? 'bg-[rgba(255,215,0,0.12)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.25)] font-bold shadow-xs'
              : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment-muted)]'
          )}
          id="dossier-tab-backstory"
        >
          <BookOpen size={13} />
          Story &amp; Lore
        </button>

        {hasNpcs && (
          <button
            onClick={() => setActiveSubTab('npcs')}
            className={cn(
              'flex-1 min-w-[120px] py-2 px-3 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeSubTab === 'npcs'
                ? 'bg-[rgba(255,215,0,0.12)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.25)] font-bold shadow-xs'
                : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment-muted)]'
            )}
            id="dossier-tab-npcs"
          >
            <Users size={13} />
            Allies &amp; Bonds ({story.npcs.length})
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('mysteries')}
          className={cn(
            'flex-1 min-w-[120px] py-2 px-3 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeSubTab === 'mysteries'
              ? 'bg-[rgba(255,215,0,0.12)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.25)] font-bold shadow-xs'
              : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment-muted)]'
          )}
          id="dossier-tab-mysteries"
        >
          <HelpCircle size={13} />
          Mysteries ({mysteries.length})
        </button>

        <button
          onClick={() => setActiveSubTab('journal')}
          className={cn(
            'flex-1 min-w-[120px] py-2 px-3 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeSubTab === 'journal'
              ? 'bg-[rgba(255,215,0,0.12)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.25)] font-bold shadow-xs'
              : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment-muted)]'
          )}
          id="dossier-tab-journal"
        >
          <Scroll size={13} />
          Journal &amp; Notes
        </button>
      </div>

      {/* ================= 1. BACKSTORY & LORE TAB ================= */}
      {activeSubTab === 'backstory' && (
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-xl font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2.5">
              <BookOpen size={20} />
              {story.title}
            </h2>
            {story.subtitle && (
              <p className="text-xs text-[var(--color-parchment-dim)] font-mono mt-1">
                {story.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {story.chapters.map((chapter) => {
              const isExpanded = expandedSections.has(chapter.id);

              return (
                <div
                  key={chapter.id}
                  className="parchment overflow-hidden rounded-xl border border-white/5 bg-[#12141c]/70 hover:border-[var(--color-gold-500)]/30 transition-colors"
                >
                  <button
                    onClick={() => toggleSection(chapter.id)}
                    className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                    id={`backstory-${chapter.id}`}
                  >
                    <span className="p-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0">
                      {renderIcon(chapter.icon)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-parchment)] block">
                        {chapter.title}
                      </span>
                      {chapter.subtitle && (
                        <span className="text-[11px] text-[var(--color-parchment-dim)] font-mono block truncate">
                          {chapter.subtitle}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 p-1 text-[var(--color-parchment-dim)]">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 animate-fade-in-up">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(196,182,156,0.2)] to-transparent mb-3.5" />
                      <p className="text-sm leading-relaxed text-[var(--color-parchment-muted)] font-[family-name:var(--font-body)] whitespace-pre-line">
                        {chapter.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 2. ALLIES, BONDS & NPCS TAB ================= */}
      {activeSubTab === 'npcs' && hasNpcs && (
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-xl font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2.5">
              <Users size={20} />
              Allies, Rivals &amp; Connected Bonds
            </h2>
            <p className="text-xs text-[var(--color-parchment-dim)] font-mono mt-1">
              Key figures bound to {character.name}&apos;s destiny across the realms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {story.npcs.map((npc, idx) => (
              <SpotlightCard
                key={idx}
                className="p-5 border border-white/10 bg-[#121524]/80 rounded-2xl flex flex-col justify-between space-y-3"
                spotlightColor="rgba(255, 215, 0, 0.05)"
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                      {renderIcon(npc.icon || 'Users')}
                    </span>
                    <div>
                      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                        {npc.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[var(--color-gold-400)] block">
                        {npc.role}
                      </span>
                    </div>
                  </div>

                  {npc.relationship && (
                    <div className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 inline-block">
                      {npc.relationship}
                    </div>
                  )}

                  <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed pt-1">
                    {npc.description}
                  </p>
                </div>

                {npc.status && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-parchment-dim)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-400)]" />
                    Status: <strong className="text-zinc-200">{npc.status}</strong>
                  </div>
                )}
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. MYSTERIES TAB ================= */}
      {activeSubTab === 'mysteries' && (
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-xl font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2.5">
              <HelpCircle size={20} />
              Campaign Mysteries &amp; Omens
            </h2>
            <p className="text-xs text-[var(--color-parchment-dim)] font-mono mt-1">
              Active quests, prophetic omens, and clues uncovered during the journey.
            </p>
          </div>

          {mysteries.length === 0 ? (
            <div className="text-center py-10 parchment rounded-2xl text-[var(--color-parchment-dim)]">
              <HelpCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active mysteries documented for {character.name}.</p>
              <p className="text-xs text-zinc-500 mt-1">Clues and omens will appear here as the campaign unfolds.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mysteries.map((mystery) => (
                <SpotlightCard
                  key={mystery.id}
                  className={cn(
                    'mystery-card p-4 rounded-xl border border-white/10 bg-[#121524]/80 transition-opacity',
                    mystery.resolved && 'opacity-50'
                  )}
                  spotlightColor="rgba(255, 215, 0, 0.04)"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className={cn(
                      'font-[family-name:var(--font-heading)] font-semibold text-base',
                      mystery.resolved ? 'line-through text-[var(--color-parchment-dim)]' : 'text-[var(--color-gold-400)]'
                    )}>
                      {mystery.title}
                    </h3>
                    <button
                      onClick={() => toggleMysteryResolved(mystery.id)}
                      className={cn(
                        'text-[10px] font-[family-name:var(--font-mono)] px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 font-bold',
                        mystery.resolved
                          ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-vitality)] border border-emerald-500/30'
                          : 'bg-[rgba(255,215,0,0.08)] text-[var(--color-gold-400)] border border-amber-500/30 hover:bg-[rgba(255,215,0,0.15)]'
                      )}
                    >
                      {mystery.resolved ? 'RESOLVED' : 'ACTIVE'}
                    </button>
                  </div>

                  <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed mb-3">
                    {mystery.description}
                  </p>

                  {/* Clues */}
                  {mystery.clues && mystery.clues.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                        Discovered Clues:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {mystery.clues.map((clue, i) => (
                          <li key={i} className="text-[11px] text-[var(--color-parchment-dim)] flex items-start gap-2">
                            <span className="text-[var(--color-gold-500)]">•</span>
                            {clue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add clue input */}
                  {!mystery.resolved && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                      <input
                        type="text"
                        placeholder="Add discovered clue (press Enter)..."
                        className="!text-xs !py-1 flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-zinc-200 focus:outline-none focus:border-amber-400/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            addClue(mystery.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        id={`clue-input-${mystery.id}`}
                      />
                    </div>
                  )}
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 4. JOURNAL & NOTES TAB ================= */}
      {activeSubTab === 'journal' && (
        <div className="space-y-5">
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-xl font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2.5">
              <Scroll size={20} />
              Campaign Journal &amp; Notes
            </h2>
            <p className="text-xs text-[var(--color-parchment-dim)] font-mono mt-1">
              Personal reflections, session logs, and player tactical notes.
            </p>
          </div>

          {/* Player Notes (auto-saving textarea) */}
          <div className="parchment p-4 rounded-xl border border-white/5 bg-[#12141c]/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)] flex items-center gap-1.5">
                <BookOpen size={13} />
                Quick Notes ({character.name})
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[var(--color-vitality)] font-mono">
                <Save size={10} />
                Auto-saving
              </div>
            </div>
            <textarea
              ref={notesRef}
              defaultValue={character.dossier?.playerNotes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`Jot down personal notes, target info, spell observations for ${character.name}...`}
              className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-[var(--color-parchment-muted)] min-h-[110px] resize-y focus:outline-none focus:border-amber-400/40 leading-relaxed font-mono"
              id="player-notes"
            />
          </div>

          {/* New Entry Form */}
          <div className="glass-card p-4 rounded-xl border border-white/10 bg-[#121524]/80 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)]">
              New Journal Entry
            </h3>
            <div className="grid grid-cols-[1fr,auto] gap-2">
              <input
                type="text"
                placeholder="Entry title (e.g., Encounter with the Sharran Envoy)..."
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                className="!text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400/40"
                id="journal-title"
              />
              <select
                value={newEntryCategory}
                onChange={(e) => setNewEntryCategory(e.target.value as JournalEntry['category'])}
                className="!text-xs !w-auto bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300"
                id="journal-category"
              >
                <option value="quest">Quest</option>
                <option value="target">Target</option>
                <option value="session">Session</option>
                <option value="note">Note</option>
              </select>
            </div>
            <textarea
              placeholder="Record adventure notes, dialogue, discoveries..."
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-zinc-200 min-h-[70px] resize-y focus:outline-none focus:border-amber-400/40"
              id="journal-content"
            />
            <button
              onClick={addJournalEntry}
              disabled={!newEntryTitle.trim()}
              className="btn btn-gold btn-sm w-full disabled:opacity-30 flex items-center justify-center gap-1.5 cursor-pointer"
              id="add-journal-entry"
            >
              <Plus size={14} />
              Add Entry
            </button>
          </div>

          {/* Journal Entries List */}
          <div className="space-y-2">
            {journal.map((entry) => (
              <div key={entry.id} className="glass-card p-3 rounded-xl border border-white/5 bg-[#121524]/60 group animate-fade-in-up">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColors[entry.category] || 'var(--color-gold-400)' }}
                    />
                    <h4 className="text-sm font-[family-name:var(--font-heading)] font-semibold text-[var(--color-parchment)]">
                      {entry.title}
                    </h4>
                    <span
                      className="text-[10px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 rounded"
                      style={{
                        color: categoryColors[entry.category] || 'var(--color-gold-400)',
                        backgroundColor: `${categoryColors[entry.category] || '#ffd700'}15`,
                      }}
                    >
                      {entry.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--color-parchment-dim)] flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {entry.timestamp.includes('T') ? new Date(entry.timestamp).toLocaleDateString() : entry.timestamp}
                    </span>
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-parchment-dim)] hover:text-[var(--color-crimson-500)] transition-all cursor-pointer"
                      aria-label={`Delete entry: ${entry.title}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {entry.content && (
                  <p className="text-xs text-[var(--color-parchment-dim)] pl-4 whitespace-pre-line leading-relaxed mt-1">
                    {entry.content}
                  </p>
                )}
              </div>
            ))}

            {journal.length === 0 && (
              <div className="text-center py-8 text-[var(--color-parchment-dim)]">
                <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No journal entries recorded yet.</p>
                <p className="text-xs text-zinc-500 mt-0.5">Record key moments above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
