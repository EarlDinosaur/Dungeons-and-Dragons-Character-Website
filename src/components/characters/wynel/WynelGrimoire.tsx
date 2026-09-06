'use client';

import React, { useState } from 'react';
import { BookOpen, Scroll, Plus, Edit3, Trash2, CheckCircle2, Crown, HelpCircle, Save, Flame, Sparkles } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { WynelState } from '@/lib/wynel-engine';
import type { JournalEntry, CampaignMystery } from '@/lib/types';

interface WynelGrimoireProps {
  wynel: WynelState;
  onNotesChange: (notes: string) => void;
  onJournalChange: (entries: JournalEntry[]) => void;
  onMysteriesChange: (mysteries: CampaignMystery[]) => void;
}

export default function WynelGrimoire({
  wynel,
  onNotesChange,
  onJournalChange,
  onMysteriesChange,
}: WynelGrimoireProps) {
  const [activeTab, setActiveTab] = useState<'lore' | 'notes' | 'mysteries' | 'journal'>('lore');
  const [notesDraft, setNotesDraft] = useState(wynel.notes || '');
  const [isAddingJournal, setIsAddingJournal] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');

  const handleSaveNotes = () => {
    onNotesChange(notesDraft);
  };

  const handleToggleMystery = (id: string) => {
    const updated = (wynel.mysteries || []).map((m) =>
      m.id === id ? { ...m, resolved: !m.resolved } : m
    );
    onMysteriesChange(updated);
  };

  const handleAddJournalEntry = () => {
    if (!newJournalTitle.trim() || !newJournalContent.trim()) return;
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      title: newJournalTitle,
      content: newJournalContent,
      timestamp: `Session ${(wynel.journal || []).length + 1}`,
      category: 'session',
    };
    onJournalChange([...(wynel.journal || []), newEntry]);
    setNewJournalTitle('');
    setNewJournalContent('');
    setIsAddingJournal(false);
  };

  const handleDeleteJournalEntry = (id: string) => {
    onJournalChange((wynel.journal || []).filter((j) => j.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-950/90 border border-red-900/40 text-xs font-mono">
        <button
          onClick={() => setActiveTab('lore')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'lore'
              ? 'bg-red-600 text-white font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Crown size={13} className="text-amber-300" />
          House Aeluin Lore
        </button>
        <button
          onClick={() => setActiveTab('mysteries')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'mysteries'
              ? 'bg-red-600 text-white font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HelpCircle size={13} className="text-rose-400" />
          House Mysteries ({(wynel.mysteries || []).length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-red-600 text-white font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Edit3 size={13} className="text-red-400" />
          Prince’s Notes
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-red-600 text-white font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scroll size={13} className="text-amber-400" />
          Campaign Journal ({(wynel.journal || []).length})
        </button>
      </div>

      {/* 1. LORE SECTION */}
      {activeTab === 'lore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono uppercase tracking-widest font-bold">
              <Crown size={15} className="text-amber-400" /> The Fall of House Aeluin
            </div>
            <h3 className="text-xl font-bold text-rose-100 font-serif">
              An Empire Dismantled from Within
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-red-950/60">
              House Aeluin once governed the Silver Canopy of the Elven Borderlands. Known for centuries of diplomacy,
              art, and celestial-fey alliance, the house fell in a single bloody twilight when the royal seneschal
              orchestrated a poisoned banquet. Wyn&apos;el, then second in line to the throne, watched his elder kin perish
              before escaping into the border mist.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              &ldquo;The crown may be shattered into iron shards, but my blood still carries the mandate of the High Canopy.&rdquo;
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono uppercase tracking-widest font-bold">
              <Flame size={15} className="text-red-400" /> The Mother’s Final Gift
            </div>
            <h3 className="text-xl font-bold text-rose-100 font-serif">
              The Crimson Heart-Tattoo (Pact of the Tome)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-red-950/60">
              Rather than letting the ancestral magical grimoire fall into the hands of the coup conspirators,
              Wyn&apos;el&apos;s mother enacted a forbidden sealing rite. She set the parchment ablaze with scarlet fire,
              channeling the book&apos;s astral essence directly into Wyn&apos;el&apos;s chest. It burned permanently into his skin as
              The Crimson Heart-Tattoo — a living grimoire that pulses with Scarlet Witch inspired chaos magic whenever
              danger threatens.
            </p>
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-[11px] font-mono text-rose-200">
              <strong>Pact Boon:</strong> Grants access to Guidance, Vicious Mockery, and Spare the Dying, plus ritual mastery.
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* 2. HOUSE MYSTERIES SECTION */}
      {activeTab === 'mysteries' && (
        <div className="space-y-4">
          {(wynel.mysteries || []).map((mystery) => (
            <div
              key={mystery.id}
              className="p-5 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-lg flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-rose-100 font-serif">{mystery.title}</h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                      mystery.resolved
                        ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950 border-red-500/40 text-rose-300'
                    }`}
                  >
                    {mystery.resolved ? 'Resolved' : 'Active Investigation'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{mystery.description}</p>
                {mystery.clues.length > 0 && (
                  <div className="pt-2 border-t border-zinc-900">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Discovered Clues:</span>
                    <ul className="text-xs font-mono text-rose-200/90 list-disc list-inside space-y-1">
                      {mystery.clues.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleToggleMystery(mystery.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  mystery.resolved
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700'
                    : 'bg-red-950 hover:bg-red-900 text-rose-200 border border-red-500/50 shadow-md'
                }`}
              >
                <CheckCircle2 size={14} className={mystery.resolved ? 'text-emerald-400' : 'text-rose-400'} />
                {mystery.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. NOTES SECTION */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest text-rose-300 font-bold flex items-center gap-2">
              <Edit3 size={15} className="text-red-400" />
              Exiled Prince’s Private Dossier Notes
            </h3>
            <button
              onClick={handleSaveNotes}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Save size={13} />
              Save Notes
            </button>
          </div>

          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={10}
            placeholder="Write secret court alliances, names of betrayers, tattoo incantations, or party reminders..."
            className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-red-500/80 rounded-2xl p-4 text-xs font-mono text-zinc-200 leading-relaxed outline-none transition-colors"
          />
        </div>
      )}

      {/* 4. CAMPAIGN JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono uppercase tracking-widest text-rose-300 font-bold">
              Session Chronicle Entries
            </h3>
            <button
              onClick={() => setIsAddingJournal(!isAddingJournal)}
              className="px-3.5 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-rose-200 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} /> Add Journal Entry
            </button>
          </div>

          {isAddingJournal && (
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-red-500/50 shadow-xl space-y-3">
              <input
                type="text"
                value={newJournalTitle}
                onChange={(e) => setNewJournalTitle(e.target.value)}
                placeholder="Entry Title (e.g., Encounter at the Gloaming Crossing)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200"
              />
              <textarea
                value={newJournalContent}
                onChange={(e) => setNewJournalContent(e.target.value)}
                rows={4}
                placeholder="What occurred during the session? What pact secrets were uncovered?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingJournal(false)}
                  className="px-3 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddJournalEntry}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </div>
          )}

          {(wynel.journal || []).map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-rose-100 font-serif">{entry.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {entry.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteJournalEntry(entry.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                  title="Delete entry"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-zinc-900">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
