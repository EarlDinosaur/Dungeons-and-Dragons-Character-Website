'use client';

import { useState } from 'react';
import { Sparkles, Plus, Trash2, BookOpen, Wand2, RefreshCw, X, Check, Dices } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CharacterState, CharacterSpellItem } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface SpellbookPanelVesperProps {
  character: CharacterState;
}

const SPELL_SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
];

export default function SpellbookPanelVesper({ character }: SpellbookPanelVesperProps) {
  const { addSpell, deleteSpell, useVesperSpellSlot, restoreVesperSpellSlot, setVesperSpellSlotMax, showToastNotification } = useCharacter();

  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [spellForm, setSpellForm] = useState<Omit<CharacterSpellItem, 'id'>>({
    name: '',
    level: 1,
    school: 'Evocation',
    castingTime: '1 Action',
    range: '60 ft',
    components: 'V, S',
    duration: 'Instantaneous',
    description: '',
    damageDice: '',
  });

  const [activeRoll, setActiveRoll] = useState<{
    spellName: string;
    d20: number;
    totalHit: number;
    damageDice: string;
    isCrit: boolean;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleCreateSpell = () => {
    if (!spellForm.name.trim()) return;
    addSpell(spellForm);
    setIsAddModalOpen(false);
    setSpellForm({
      name: '',
      level: 1,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '60 ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: '',
      damageDice: '',
    });
  };

  const rollSpellCheck = (spellName: string, damageDice?: string) => {
    setIsRolling(true);
    setActiveRoll(null);
    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const atkBonus = character.spellcasting?.spellAttackBonus || 7;
      const totalHit = d20 + atkBonus;
      const isCrit = d20 === 20;

      setActiveRoll({
        spellName,
        d20,
        totalHit,
        damageDice: damageDice || '',
        isCrit,
      });
      setIsRolling(false);
    }, 400);
  };

  const slots = character.spellcasting?.slots || {};
  const spells = character.spellcasting?.spells || [];

  const filteredSpells = filterLevel === 'all'
    ? spells
    : spells.filter((s) => s.level === filterLevel);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* d20 Roll Animation Modal Overlay */}
      {(isRolling || activeRoll) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-[family-name:var(--font-body)]">
          <div className="w-full max-w-md p-6 border-2 border-[var(--color-arcane-500)] bg-[var(--color-surface-dark)] text-center relative overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <button
              onClick={() => {
                setIsRolling(false);
                setActiveRoll(null);
              }}
              className="absolute top-3 right-3 text-[var(--color-parchment-dim)] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Roll Result"
            >
              <X size={20} />
            </button>

            {isRolling ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <Dices size={44} className="text-[var(--color-arcane-400)] animate-spin mb-2" />
                <p className="text-sm font-bold text-[var(--color-parchment)] font-[family-name:var(--font-heading)]">
                  Weaving Eldritch Magic...
                </p>
              </div>
            ) : activeRoll ? (
              <div className="space-y-4 font-[family-name:var(--font-mono)]">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-gold-400)] font-bold block mb-1">
                    Spell Cast Result — {activeRoll.spellName}
                  </span>

                  <div className="flex items-center justify-center gap-6 mt-2">
                    <div>
                      <span className="text-4xl font-extrabold text-[var(--color-parchment)]">
                        {activeRoll.totalHit}
                      </span>
                      <span className="block text-[10px] text-[var(--color-parchment-dim)] mt-1">
                        Spell Attack (d20: {activeRoll.d20} + {character.spellcasting?.spellAttackBonus || 7})
                      </span>
                    </div>

                    {activeRoll.damageDice && (
                      <div className="border-l border-[var(--color-border)] pl-6">
                        <span className="text-2xl font-bold text-[var(--color-arcane-300)]">
                          {activeRoll.damageDice}
                        </span>
                        <span className="block text-[10px] text-[var(--color-parchment-dim)] mt-1">
                          Damage Dice
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {activeRoll.isCrit && (
                  <div className="p-3 bg-purple-950/80 border border-purple-400 rounded-xl text-purple-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <Sparkles size={16} /> 🌟 ELDRITCH CRITICAL (Natural 20)!
                  </div>
                )}

                <button
                  onClick={() => setActiveRoll(null)}
                  className="w-full py-2.5 bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-400)] text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(255,215,0,0.4)]"
                >
                  Dismiss Result
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {/* Spellcasting Header & DC Summary */}
      <SpotlightCard className="p-5 border-2 border-[var(--color-arcane-500)]/40" spotlightColor="rgba(168, 85, 247, 0.08)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="text-[var(--color-arcane-400)]" size={20} />
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-arcane-300)]">
                Grimoire &amp; Spellcasting Tracker
              </h2>
            </div>
            <p className="text-xs text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
              Manage spell slots (Cantrips–9th Level) and add custom spells to your grimoire.
            </p>
          </div>

          <div className="flex items-center gap-4 text-center font-[family-name:var(--font-mono)]">
            <div className="glass-card px-3 py-1.5 min-w-[70px]">
              <span className="text-[10px] text-[var(--color-parchment-dim)] block uppercase font-bold">Save DC</span>
              <span className="text-xl font-bold text-[var(--color-arcane-400)]">
                {character.spellcasting?.spellSaveDC || 15}
              </span>
            </div>

            <div className="glass-card px-3 py-1.5 min-w-[70px]">
              <span className="text-[10px] text-[var(--color-parchment-dim)] block uppercase font-bold">Attack Bonus</span>
              <span className="text-xl font-bold text-[var(--color-gold-400)]">
                +{character.spellcasting?.spellAttackBonus || 7}
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* SPELL SLOT TRACKER (Levels 1–9) */}
      <div>
        <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 uppercase tracking-wider flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles size={15} />
            Spell Slot Tracker (Levels 1–9)
          </span>
          <span className="text-[10px] font-normal text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
            (Edit Max field to set total slots)
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const slot = slots[lvl] || { max: 0, used: 0 };
            const available = Math.max(0, slot.max - slot.used);

            return (
              <div
                key={lvl}
                className={`glass-card p-3 flex flex-col items-center justify-between text-center transition-all ${
                  slot.max > 0 ? 'border-[rgba(168,85,247,0.3)] hover:border-[var(--color-arcane-400)]' : 'opacity-60'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[10px] uppercase font-bold font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)] mb-1">
                  <span>Lvl {lvl}</span>
                  <div className="flex items-center gap-1" title="Edit Max Spell Slots">
                    <span className="text-[9px] text-[var(--color-parchment-dim)]">Max:</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={slot.max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setVesperSpellSlotMax(lvl, isNaN(val) ? 0 : val);
                      }}
                      className="w-9 bg-black/50 border border-purple-500/40 rounded px-1 text-center text-xs font-bold text-[var(--color-arcane-300)] focus:outline-none focus:border-[var(--color-gold-400)]"
                    />
                  </div>
                </div>

                <div className="my-2">
                  <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-arcane-300)]">
                    {available} <span className="text-xs text-[var(--color-parchment-dim)]">/ {slot.max}</span>
                  </span>
                </div>

                {slot.max > 0 ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => useVesperSpellSlot(lvl)}
                      disabled={available <= 0}
                      className="px-2 py-1 bg-purple-900/50 hover:bg-purple-800 border border-purple-500/40 rounded text-[10px] font-bold text-white disabled:opacity-30 cursor-pointer"
                      title="Expend Spell Slot"
                    >
                      Cast (-1)
                    </button>
                    <button
                      onClick={() => restoreVesperSpellSlot(lvl)}
                      disabled={slot.used <= 0}
                      className="p-1 bg-white/5 hover:bg-white/15 rounded text-[10px] text-[var(--color-parchment-dim)] disabled:opacity-30 cursor-pointer"
                      title="Restore Slot"
                    >
                      <RefreshCw size={10} />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-[var(--color-parchment-dim)] italic">No slots</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SPELLBOOK LIST & FILTERS */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] uppercase tracking-wider flex items-center gap-2 flex-1">
            <BookOpen size={15} />
            Known Spells ({spells.length})
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Levels</option>
              <option value={0}>Cantrips (Level 0)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-gold btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} /> Add Spell
            </button>
          </div>
        </div>

        {filteredSpells.length === 0 ? (
          <div className="glass-card p-8 text-center text-xs text-[var(--color-parchment-dim)]">
            <Wand2 size={24} className="mx-auto mb-2 opacity-40 text-[var(--color-gold-400)]" />
            No spells found. Click &ldquo;Add Spell&rdquo; to populate your grimoire.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSpells.map((spell) => (
              <SpotlightCard key={spell.id} className="p-4 relative group" spotlightColor="rgba(168, 85, 247, 0.08)">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-heading)] bg-[rgba(168,85,247,0.2)] text-[var(--color-arcane-300)] px-2 py-0.5 rounded border border-[rgba(168,85,247,0.3)]">
                        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                      </span>
                      <h4 className="font-[family-name:var(--font-heading)] font-semibold text-sm text-[var(--color-parchment)]">
                        {spell.name}
                      </h4>
                    </div>

                    <p className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)] mt-1">
                      {spell.school} &bull; {spell.castingTime} &bull; {spell.range}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => rollSpellCheck(spell.name, spell.damageDice)}
                      className="btn btn-ghost btn-sm text-xs flex items-center gap-1"
                    >
                      <Dices size={12} /> Cast
                    </button>
                    <button
                      onClick={() => deleteSpell(spell.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg"
                      title="Delete Spell"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-parchment-muted)] mb-2 line-clamp-3">
                  {spell.description}
                </p>

                <div className="flex flex-wrap gap-2 text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
                  <span>Components: {spell.components}</span>
                  <span>&bull;</span>
                  <span>Duration: {spell.duration}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

      {/* ADD SPELL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-500)] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <BookOpen className="text-[var(--color-gold-400)]" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                Add Spell to Grimoire
              </h2>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Spell Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Misty Step, Shield, Fireball"
                  value={spellForm.name}
                  onChange={(e) => setSpellForm({ ...spellForm, name: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Spell Level
                  </label>
                  <select
                    value={spellForm.level}
                    onChange={(e) => setSpellForm({ ...spellForm, level: Number(e.target.value) })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  >
                    <option value={0}>Cantrip (Level 0)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Magic School
                  </label>
                  <select
                    value={spellForm.school}
                    onChange={(e) => setSpellForm({ ...spellForm, school: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  >
                    {SPELL_SCHOOLS.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Casting Time
                  </label>
                  <input
                    type="text"
                    placeholder="1 Action, 1 Bonus Action"
                    value={spellForm.castingTime}
                    onChange={(e) => setSpellForm({ ...spellForm, castingTime: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Range
                  </label>
                  <input
                    type="text"
                    placeholder="Self, 60 ft, Touch"
                    value={spellForm.range}
                    onChange={(e) => setSpellForm({ ...spellForm, range: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Components
                  </label>
                  <input
                    type="text"
                    placeholder="V, S, M"
                    value={spellForm.components}
                    onChange={(e) => setSpellForm({ ...spellForm, components: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Damage / Healing Dice
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3d6, 8d6"
                    value={spellForm.damageDice || ''}
                    onChange={(e) => setSpellForm({ ...spellForm, damageDice: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Spell Description &amp; Mechanics
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the spell effects, saving throw DC, or additional damage..."
                  value={spellForm.description}
                  onChange={(e) => setSpellForm({ ...spellForm, description: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,215,0,0.15)]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--color-parchment-dim)] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpell}
                className="btn btn-gold btn-sm text-xs flex items-center gap-1.5"
              >
                <Check size={14} /> Add Spell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
