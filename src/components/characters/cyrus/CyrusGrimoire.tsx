'use client';

import { useState } from 'react';
import { BookOpen, Scroll, Sparkles, Flame, Eye, Users, MapPin, Edit3, Save, X } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CyrusState } from '@/lib/cyrus-engine';

interface CyrusGrimoireProps {
  cyrus: CyrusState;
  onNotesChange: (notes: string) => void;
}

export default function CyrusGrimoire({ cyrus, onNotesChange }: CyrusGrimoireProps) {
  const [activeSection, setActiveSection] = useState<'spells' | 'lore' | 'npcs'>('spells');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesBuffer, setNotesBuffer] = useState(cyrus.notes);

  const cantrips = cyrus.spellcasting.spells.filter((s) => s.level === 0);
  const level1Spells = cyrus.spellcasting.spells.filter((s) => s.level === 1);
  const level2Spells = cyrus.spellcasting.spells.filter((s) => s.level === 2);

  const handleSaveNotes = () => {
    onNotesChange(notesBuffer);
    setIsEditingNotes(false);
  };

  const npcDossier = [
    {
      name: 'King Zephyr Apollos',
      role: 'King of Helios',
      relationship: 'Closest friend, confidant, and unspoken love',
      description: 'Childhood friend turned ruler. Suffers from a mysterious illness with no known cure. Cyrus was sent to find an artifact to save him.',
      icon: '👑',
    },
    {
      name: 'Rhea Hyacinthus',
      role: 'Mother — Court Herbalist',
      relationship: 'Family (Mother)',
      description: 'Court herbalist and apothecary of Helios. Taught Cyrus about plants and healing.',
      icon: '🌿',
    },
    {
      name: 'Marcellus Hyacinthus',
      role: 'Father — Diplomat',
      relationship: 'Family (Father)',
      description: 'A diplomat of Helios, serving the Apollos dynasty for generations.',
      icon: '📜',
    },
    {
      name: 'Octavia Hyacinthus',
      role: 'Elder Sister — Diplomat',
      relationship: 'Family (Sister)',
      description: 'Followed in their father\'s footsteps as a diplomat for the kingdom.',
      icon: '🏛️',
    },
    {
      name: 'Cassius Hyacinthus',
      role: 'Older Brother — Herbalist',
      relationship: 'Family (Brother)',
      description: 'Practices medicine and herbology like their mother.',
      icon: '⚕️',
    },
    {
      name: 'Queen Raedra',
      role: 'Queen — Determined Protector',
      relationship: 'Bond: Sworn to protect her',
      description: 'Cyrus is bound to protect the queen. Determined to uphold his family\'s oath.',
      icon: '♛',
    },
  ];

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* Section Selector */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-[#0d0a06] p-1.5 rounded-xl border border-[#daa520]/25 shadow-inner">
        {[
          { id: 'spells' as const, label: 'Solar Spellbook', icon: <Sparkles size={14} /> },
          { id: 'lore' as const, label: 'Helios Dossier', icon: <Scroll size={14} /> },
          { id: 'npcs' as const, label: 'NPC Bonds', icon: <Users size={14} /> },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeSection === section.id
                ? 'bg-[#daa520] text-black shadow-[0_0_12px_rgba(218,165,32,0.4)]'
                : 'text-amber-200/60 hover:text-amber-200 hover:bg-black/40'
            }`}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      {/* ============== SPELLBOOK ============== */}
      {activeSection === 'spells' && (
        <div className="space-y-5">
          {/* Cantrips */}
          <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#daa520]/25">
              <Flame size={16} className="text-[#daa520]" />
              <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Cantrips <span className="text-[10px] text-[#b89d5e] font-mono ml-2">{cantrips.length} known</span>
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cantrips.map((spell) => (
                <SpellCard key={spell.id} spell={spell} />
              ))}
            </div>
          </SpotlightCard>

          {/* Level 1 */}
          {level1Spells.length > 0 && (
            <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#daa520]/25">
                <Sparkles size={16} className="text-[#daa520]" />
                <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                  1st Level Spells
                  <span className="text-[10px] text-[#b89d5e] font-mono ml-2">
                    Slots: {cyrus.spellcasting.slots[1].max - cyrus.spellcasting.slots[1].used}/{cyrus.spellcasting.slots[1].max}
                  </span>
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {level1Spells.map((spell) => (
                  <SpellCard key={spell.id} spell={spell} />
                ))}
              </div>
            </SpotlightCard>
          )}

          {/* Level 2 */}
          {level2Spells.length > 0 && (
            <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#daa520]/25">
                <Eye size={16} className="text-[#daa520]" />
                <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                  2nd Level Spells
                  <span className="text-[10px] text-[#b89d5e] font-mono ml-2">
                    Slots: {cyrus.spellcasting.slots[2].max - cyrus.spellcasting.slots[2].used}/{cyrus.spellcasting.slots[2].max}
                  </span>
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {level2Spells.map((spell) => (
                  <SpellCard key={spell.id} spell={spell} />
                ))}
              </div>
            </SpotlightCard>
          )}
        </div>
      )}

      {/* ============== HELIOS DOSSIER ============== */}
      {activeSection === 'lore' && (
        <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#daa520]/25">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#daa520]" />
              <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Helios Dossier &amp; Notes
              </h3>
            </div>
            {isEditingNotes ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-xs font-mono font-bold bg-[#daa520] text-black px-2.5 py-1 rounded-lg border border-[#ffd700] shadow-md hover:bg-[#ffd700] transition-all"
                >
                  <Save size={12} /> Save
                </button>
                <button
                  onClick={() => { setNotesBuffer(cyrus.notes); setIsEditingNotes(false); }}
                  className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white bg-black/50 px-2.5 py-1 rounded-lg border border-gray-700 transition-colors"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNotesBuffer(cyrus.notes); setIsEditingNotes(true); }}
                className="flex items-center gap-1 text-xs font-mono text-[#daa520] hover:text-[#ffd700] bg-black/40 px-2.5 py-1 rounded-lg border border-[#daa520]/30 transition-colors"
              >
                <Edit3 size={12} /> Edit Notes
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notesBuffer}
              onChange={(e) => setNotesBuffer(e.target.value)}
              className="w-full min-h-[300px] bg-black/60 border border-[#daa520]/30 rounded-xl p-4 text-xs text-amber-200 font-mono leading-relaxed focus:outline-none focus:border-[#daa520] resize-y"
              placeholder="Write your campaign notes, backstory details, and lore here..."
            />
          ) : (
            <div className="prose prose-invert max-w-none text-sm text-amber-200/70 leading-relaxed whitespace-pre-line">
              {cyrus.notes}
            </div>
          )}

          {/* Journal Entries */}
          {cyrus.journal.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#daa520]/15 space-y-3">
              <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider flex items-center gap-2">
                <Scroll size={14} className="text-[#daa520]" /> Journal Entries
              </h4>
              {cyrus.journal.map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-bold text-amber-200">{entry.title}</h5>
                    <span className="text-[10px] font-mono text-[#b89d5e]">{entry.timestamp}</span>
                  </div>
                  <p className="text-xs text-amber-200/60 italic leading-relaxed">{entry.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mysteries */}
          {cyrus.mysteries.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#daa520]/15 space-y-3">
              <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider flex items-center gap-2">
                <Eye size={14} className="text-[#daa520]" /> Active Mysteries
              </h4>
              {cyrus.mysteries.map((mystery) => (
                <div key={mystery.id} className="p-3 rounded-xl bg-black/40 border border-[#daa520]/15">
                  <h5 className="text-sm font-bold text-amber-200 mb-1">{mystery.title}</h5>
                  <p className="text-xs text-amber-200/60 mb-2">{mystery.description}</p>
                  {mystery.clues.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#daa520] uppercase font-bold">Clues:</span>
                      {mystery.clues.map((clue, i) => (
                        <div key={i} className="text-[11px] text-amber-200/50 italic flex items-center gap-1.5">
                          <span className="text-[#daa520]">&bull;</span> {clue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      )}

      {/* ============== NPC BONDS ============== */}
      {activeSection === 'npcs' && (
        <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#daa520]/25">
            <Users size={18} className="text-[#daa520]" />
            <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              NPC Bonds &amp; Relationships
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {npcDossier.map((npc) => (
              <div
                key={npc.name}
                className={`p-3.5 rounded-xl border text-xs ${
                  npc.name === 'King Zephyr Apollos'
                    ? 'bg-[rgba(218,165,32,0.10)] border-[#daa520]/35 shadow-[0_0_10px_rgba(218,165,32,0.1)]'
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-xl">{npc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-amber-200 text-sm font-['Cormorant_Garamond',serif]">{npc.name}</h4>
                    <p className="text-[10px] font-mono text-[#daa520] uppercase">{npc.role}</p>
                  </div>
                </div>
                <p className="text-amber-200/50 leading-relaxed mb-1">
                  <strong className="text-amber-200/70">Bond:</strong> {npc.relationship}
                </p>
                <p className="text-amber-200/40 italic leading-relaxed">{npc.description}</p>
              </div>
            ))}
          </div>

          {/* Personality Summary */}
          <div className="mt-5 pt-4 border-t border-[#daa520]/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] mb-2">Personality Traits</h4>
              <ul className="space-y-1 text-xs text-amber-200/60">
                <li>• Quiet and observant</li>
                <li>• Dry sense of humor around trusted friends</li>
                <li>• Naturally looks after others</li>
                <li>• Curious and enjoys uncovering hidden truths</li>
                <li>• Polite and composed under pressure</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] mb-2">Ideals</h4>
              <ul className="space-y-1 text-xs text-amber-200/60">
                <li>• <strong className="text-amber-200/80">Duty</strong> — Responsibilities must be seen through</li>
                <li>• <strong className="text-amber-200/80">Truth</strong> — Ignorance is more dangerous than painful truth</li>
                <li>• <strong className="text-amber-200/80">Loyalty</strong> — Trust should not be abandoned lightly</li>
                <li>• <strong className="text-amber-200/80">Knowledge</strong> — The unknown is worth pursuing</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] mb-2">Flaws</h4>
              <ul className="space-y-1 text-xs text-amber-200/60">
                <li>• Overthinks important decisions</li>
                <li>• Hides his fears</li>
                <li>• Puts duty before feelings</li>
                <li>• Crippled leg</li>
              </ul>
            </div>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}

// Individual Spell Card sub-component
function SpellCard({ spell }: { spell: CyrusState['spellcasting']['spells'][number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-3 rounded-xl border cursor-pointer transition-all ${
        expanded
          ? 'bg-[rgba(218,165,32,0.08)] border-[#daa520]/30'
          : 'bg-black/30 border-white/5 hover:border-[#daa520]/20'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif] flex items-center gap-1.5">
          {spell.level === 0 ? (
            <Flame size={12} className="text-amber-400" />
          ) : (
            <Sparkles size={12} className="text-[#daa520]" />
          )}
          {spell.name}
        </h5>
        <div className="flex items-center gap-2">
          {spell.damageDice && (
            <span className="text-[10px] font-mono text-red-300 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/30">
              {spell.damageDice}
            </span>
          )}
          <span className="text-[10px] font-mono text-[#b89d5e]">
            {spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/5 text-xs text-amber-200/60 space-y-1 animate-fade-in-up">
          <div className="grid grid-cols-2 gap-x-4 text-[10px] font-mono">
            <span><strong className="text-amber-200/80">School:</strong> {spell.school}</span>
            <span><strong className="text-amber-200/80">Cast:</strong> {spell.castingTime}</span>
            <span><strong className="text-amber-200/80">Range:</strong> {spell.range}</span>
            <span><strong className="text-amber-200/80">Comp:</strong> {spell.components}</span>
            <span><strong className="text-amber-200/80">Duration:</strong> {spell.duration}</span>
          </div>
          <p className="leading-relaxed italic pt-1">{spell.description}</p>
        </div>
      )}
    </div>
  );
}
