'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Search, Plus,
  Trash2, Save, Clock, Scroll, Eye, Target, HelpCircle
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import GlowButton from '../../ui/GlowButton';
import type { CharacterState, JournalEntry, CampaignMystery } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DossierProps {
  character: CharacterState;
  onNotesChange: (notes: string) => void;
  onJournalChange: (journal: JournalEntry[]) => void;
  onMysteriesChange: (mysteries: CampaignMystery[]) => void;
}

const BACKSTORY_SECTIONS = [
  { key: 'orphanageMassacre', title: 'The Orphanage Massacre', icon: <Scroll size={14} /> },
  { key: 'fatherMalachi', title: 'Father Malachi', icon: <Eye size={14} /> },
  { key: 'apprenticeApothecary', title: 'The Apothecary Cover', icon: <Target size={14} /> },
  { key: 'guildScoutVincent', title: 'Guild Scout Vincent', icon: <Search size={14} /> },
  { key: 'bossDexter', title: 'Boss Dexter', icon: <Scroll size={14} /> },
] as const;

export default function Dossier({
  character,
  onNotesChange,
  onJournalChange,
  onMysteriesChange,
}: DossierProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSubTab, setActiveSubTab] = useState<'backstory' | 'mysteries' | 'journal'>('backstory');
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

  const addJournalEntry = () => {
    if (!newEntryTitle.trim()) return;
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      title: newEntryTitle,
      content: newEntryContent,
      timestamp: new Date().toISOString(),
      category: newEntryCategory,
    };
    onJournalChange([entry, ...character.dossier.journal]);
    setNewEntryTitle('');
    setNewEntryContent('');
  };

  const deleteJournalEntry = (id: string) => {
    onJournalChange(character.dossier.journal.filter((e) => e.id !== id));
  };

  const addClue = (mysteryId: string, clue: string) => {
    if (!clue.trim()) return;
    onMysteriesChange(
      character.dossier.mysteries.map((m) =>
        m.id === mysteryId ? { ...m, clues: [...m.clues, clue] } : m
      )
    );
  };

  const toggleMysteryResolved = (mysteryId: string) => {
    onMysteriesChange(
      character.dossier.mysteries.map((m) =>
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

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 bg-[rgba(255,255,255,0.02)] rounded-lg p-1">
        {(['backstory', 'mysteries', 'journal'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              'flex-1 py-2 px-3 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider rounded-md transition-all',
              activeSubTab === tab
                ? 'bg-[rgba(255,215,0,0.1)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.15)]'
                : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment-muted)]'
            )}
            id={`dossier-tab-${tab}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Backstory Tab */}
      {activeSubTab === 'backstory' && (
        <div className="space-y-2">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2">
            <BookOpen size={18} />
            The Story of Vesper Ashwood
          </h2>

          {BACKSTORY_SECTIONS.map(({ key, title, icon }) => {
            const isExpanded = expandedSections.has(key);
            const content = character.dossier.backstory[key as keyof typeof character.dossier.backstory];

            return (
              <div key={key} className="parchment overflow-hidden">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  id={`backstory-${key}`}
                >
                  <span className="text-[var(--color-gold-400)]">{icon}</span>
                  <span className="flex-1 font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-parchment)]">
                    {title}
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-[var(--color-parchment-dim)]" />
                  ) : (
                    <ChevronRight size={14} className="text-[var(--color-parchment-dim)]" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in-up">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(196,182,156,0.15)] to-transparent mb-3" />
                    <p className="text-sm leading-relaxed text-[var(--color-parchment-muted)] font-[family-name:var(--font-body)] whitespace-pre-line">
                      {content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mysteries Tab */}
      {activeSubTab === 'mysteries' && (
        <div className="space-y-3">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2">
            <HelpCircle size={18} />
            Campaign Mysteries
          </h2>

          {character.dossier.mysteries.map((mystery) => (
            <SpotlightCard
              key={mystery.id}
              className={cn('mystery-card p-4', mystery.resolved && 'opacity-50')}
              spotlightColor="rgba(255, 215, 0, 0.04)"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={cn(
                  'font-[family-name:var(--font-heading)] font-semibold',
                  mystery.resolved ? 'line-through text-[var(--color-parchment-dim)]' : 'text-[var(--color-gold-400)]'
                )}>
                  {mystery.title}
                </h3>
                <button
                  onClick={() => toggleMysteryResolved(mystery.id)}
                  className={cn(
                    'text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded transition-all',
                    mystery.resolved
                      ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-vitality)]'
                      : 'bg-[rgba(255,215,0,0.08)] text-[var(--color-gold-400)]'
                  )}
                >
                  {mystery.resolved ? 'RESOLVED' : 'ACTIVE'}
                </button>
              </div>

              <p className="text-xs text-[var(--color-parchment-muted)] leading-relaxed mb-3">
                {mystery.description}
              </p>

              {/* Clues */}
              {mystery.clues.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                    Discovered Clues
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

              {/* Add clue */}
              {!mystery.resolved && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a clue..."
                    className="!text-xs !py-1"
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

      {/* Journal Tab */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2">
            <BookOpen size={18} />
            Campaign Journal
          </h2>

          {/* Player Notes (auto-saving textarea) */}
          <div className="parchment p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)]">
                Quick Notes
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[var(--color-vitality)]">
                <Save size={10} />
                Auto-saving
              </div>
            </div>
            <textarea
              ref={notesRef}
              defaultValue={character.dossier.playerNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Jot down notes, active quests, target info..."
              className="!bg-transparent !border-none !text-sm !text-[var(--color-parchment-muted)] !min-h-[100px] !resize-y focus:!shadow-none"
              id="player-notes"
            />
          </div>

          {/* New Entry Form */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)]">
              New Journal Entry
            </h3>
            <div className="grid grid-cols-[1fr,auto] gap-2">
              <input
                type="text"
                placeholder="Entry title..."
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                className="!text-sm"
                id="journal-title"
              />
              <select
                value={newEntryCategory}
                onChange={(e) => setNewEntryCategory(e.target.value as JournalEntry['category'])}
                className="!text-xs !w-auto"
                id="journal-category"
              >
                <option value="quest">Quest</option>
                <option value="target">Target</option>
                <option value="session">Session</option>
                <option value="note">Note</option>
              </select>
            </div>
            <textarea
              placeholder="Entry content..."
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              className="!text-sm !min-h-[60px]"
              id="journal-content"
            />
            <button
              onClick={addJournalEntry}
              disabled={!newEntryTitle.trim()}
              className="btn btn-gold btn-sm w-full disabled:opacity-30"
              id="add-journal-entry"
            >
              <Plus size={14} />
              Add Entry
            </button>
          </div>

          {/* Journal Entries */}
          <div className="space-y-2">
            {character.dossier.journal.map((entry) => (
              <div key={entry.id} className="glass-card p-3 group animate-fade-in-up">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColors[entry.category] }}
                    />
                    <h4 className="text-sm font-[family-name:var(--font-heading)] font-semibold text-[var(--color-parchment)]">
                      {entry.title}
                    </h4>
                    <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 rounded"
                          style={{
                            color: categoryColors[entry.category],
                            backgroundColor: `${categoryColors[entry.category]}15`,
                          }}>
                      {entry.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--color-parchment-dim)] flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-parchment-dim)] hover:text-[var(--color-crimson-500)] transition-all"
                      aria-label={`Delete entry: ${entry.title}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {entry.content && (
                  <p className="text-xs text-[var(--color-parchment-dim)] pl-4 whitespace-pre-line">
                    {entry.content}
                  </p>
                )}
              </div>
            ))}

            {character.dossier.journal.length === 0 && (
              <div className="text-center py-8 text-[var(--color-parchment-dim)]">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No journal entries yet.</p>
                <p className="text-xs">Record your adventures above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
