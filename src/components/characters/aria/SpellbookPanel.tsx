'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Dices, Moon, CheckSquare, Square, Plus, Trash2, X, Check, BookOpen } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { AriaState, SpellItem, LunarPhase } from '@/lib/aria-engine';
import { useCharacter } from '@/app/providers';

interface SpellbookPanelProps {
  aria: AriaState;
  onUseSlot: (level: number) => void;
  onRestoreSlot: (level: number) => void;
}

const SPELL_SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
];

export default function SpellbookPanel({
  aria,
  onUseSlot,
  onRestoreSlot,
}: SpellbookPanelProps) {
  const { showToastNotification, setAriaSpellSlotMax, addSpell, deleteSpell } = useCharacter();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [spellForm, setSpellForm] = useState<Omit<SpellItem, 'id'>>({
    name: '',
    level: 1,
    school: 'Evocation',
    castingTime: '1 Action',
    range: '60 ft',
    components: 'V, S',
    duration: 'Instantaneous',
    description: '',
    damageDice: '',
    phaseAffinity: undefined,
  });

  const [activeRoll, setActiveRoll] = useState<{
    spellName: string;
    d20: number;
    totalHit: number;
    damageDice: string;
    damageTotal: number;
    isCrit: boolean;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const activePhase = aria.lunarEngine.currentPhase;

  // Filter spells
  const filteredSpells = selectedLevelFilter === 'all'
    ? aria.spellcasting.spells
    : aria.spellcasting.spells.filter((s) => s.level === selectedLevelFilter);

  const handleCreateSpell = () => {
    if (!spellForm.name.trim()) return;
    addSpell(spellForm as any);
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
      phaseAffinity: undefined,
    });
  };

  // d20 Roll Simulator
  const handleCastSpell = (spell: SpellItem) => {
    setIsRolling(true);
    setActiveRoll(null);

    showToastNotification(
      `Cast ${spell.name}!`,
      spell.level > 0 ? `Expended Level ${spell.level} spell slot. DC ${aria.spellcasting.spellSaveDC}` : `Cast cantrip ${spell.name}.`,
      'spell'
    );

    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const totalHit = d20 + aria.spellcasting.spellAttackBonus;
      const isCrit = d20 === 20;

      let damageTotal = 0;
      if (spell.damageDice) {
        const match = spell.damageDice.match(/(\d+)d(\d+)(\+(\d+))?/);
        if (match) {
          const numDice = parseInt(match[1], 10) * (isCrit ? 2 : 1);
          const dieSize = parseInt(match[2], 10);
          const bonus = match[4] ? parseInt(match[4], 10) : 0;
          for (let i = 0; i < numDice; i++) {
            damageTotal += Math.floor(Math.random() * dieSize) + 1;
          }
          damageTotal += bonus;
        }
      }

      setActiveRoll({
        spellName: spell.name,
        d20,
        totalHit,
        damageDice: spell.damageDice || '',
        damageTotal,
        isCrit,
      });
      setIsRolling(false);

      // Auto deduct spell slot if level > 0
      if (spell.level > 0) {
        onUseSlot(spell.level);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Spell Slot Tracker Header */}
      <SpotlightCard className="p-6 border-[#343a72] bg-[#14183a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wand2 size={20} className="text-[#a992e8]" />
            <h2 className="text-xl font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
              Spell Slots
            </h2>
          </div>
          <span className="text-xs text-[#9aa1cc] font-[family-name:var(--font-mono)]">
            Spell Save DC: <strong className="text-[#a992e8] text-sm">{aria.spellcasting.spellSaveDC}</strong> | Spell Attack: <strong className="text-[#d9b872] text-sm">+{aria.spellcasting.spellAttackBonus}</strong>
          </span>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const slotData = (aria.spellcasting.slots as any)[lvl];
            const max = slotData?.max || 0;
            const used = slotData?.used || 0;
            const available = Math.max(0, max - used);

            return (
              <div
                key={lvl}
                className={`p-3 rounded-lg bg-[#0d1026] border flex flex-col items-center justify-between text-center transition-all ${
                  max > 0 ? 'border-[#343a72] hover:border-[#a992e8]' : 'border-[#262b57]/60 opacity-50 hover:opacity-100'
                }`}
              >
                <div className="w-full flex items-center justify-between text-xs font-bold text-[#cfd4ee] font-[family-name:var(--font-heading)] mb-1">
                  <span>Level {lvl}</span>
                  <div className="flex items-center gap-1" title="Edit Max Slots">
                    <span className="text-[9px] text-[#9aa1cc]">Max:</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setAriaSpellSlotMax(lvl, isNaN(val) ? 0 : val);
                      }}
                      className="w-8 bg-black/60 border border-[#343a72] rounded px-1 text-center text-xs font-bold text-[#a992e8] focus:outline-none focus:border-[#a992e8]"
                    />
                  </div>
                </div>
                <div className="text-lg font-bold text-[#a992e8] font-[family-name:var(--font-mono)] mb-2">
                  {available} / {max}
                </div>

                {max > 0 ? (
                  <div className="flex justify-center flex-wrap gap-1">
                    {Array.from({ length: max }, (_, i) => {
                      const isUsed = i < used;
                      return (
                        <button
                          key={i}
                          onClick={() => (isUsed ? onRestoreSlot(lvl) : onUseSlot(lvl))}
                          className="text-[#a992e8] hover:text-white transition-colors cursor-pointer"
                        >
                          {isUsed ? <Square size={14} className="opacity-40" /> : <CheckSquare size={14} />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#9aa1cc] italic">No slots</span>
                )}
              </div>
            );
          })}
        </div>
      </SpotlightCard>

      {/* Spell Filter Navigation & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedLevelFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold transition-all ${
              selectedLevelFilter === 'all'
                ? 'bg-[#a992e8] text-black shadow-[0_0_10px_rgba(169,146,232,0.5)]'
                : 'bg-[#14183a] text-[#cfd4ee] border border-[#343a72] hover:border-[#a992e8]'
            }`}
          >
            All Spells ({aria.spellcasting.spells.length})
          </button>

          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold transition-all ${
                selectedLevelFilter === lvl
                  ? 'bg-[#a992e8] text-black shadow-[0_0_10px_rgba(169,146,232,0.5)]'
                  : 'bg-[#14183a] text-[#cfd4ee] border border-[#343a72] hover:border-[#a992e8]'
              }`}
            >
              {lvl === 0 ? 'Cantrips' : `Lvl ${lvl}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#a992e8] hover:bg-[#8f76d6] text-black font-bold text-xs rounded-lg font-[family-name:var(--font-mono)] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(169,146,232,0.4)] cursor-pointer shrink-0"
        >
          <Plus size={14} /> Add Spell
        </button>
      </div>

      {/* d20 Roll Animation Banner */}
      {(isRolling || activeRoll) && (
        <SpotlightCard className="p-6 border-[#a992e8] bg-gradient-to-r from-[#171b3f] via-[#1d2249] to-[#0d1026] text-center relative overflow-hidden">
          {isRolling ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <Dices size={40} className="text-[#a992e8] animate-spin mb-2" />
              <p className="text-sm font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                Weaving Astral Starlight...
              </p>
            </div>
          ) : activeRoll ? (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-[#d9b872] font-bold">
                Spell Attack Result — {activeRoll.spellName}
              </div>

              <div className="flex items-center justify-center gap-6">
                <div>
                  <span className="text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[#e8e6ff]">
                    {activeRoll.totalHit}
                  </span>
                  <span className="block text-[10px] text-[#9aa1cc]">
                    (d20: {activeRoll.d20} + {aria.spellcasting.spellAttackBonus})
                  </span>
                </div>

                {activeRoll.damageDice && (
                  <div className="border-l border-[#343a72] pl-6">
                    <span className="text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[#a992e8]">
                      {activeRoll.damageTotal}
                    </span>
                    <span className="block text-[10px] text-[#9aa1cc]">
                      Damage ({activeRoll.damageDice})
                    </span>
                  </div>
                )}
              </div>

              {activeRoll.isCrit && (
                <span className="inline-block text-xs font-bold text-[#ffd700] bg-[rgba(255,215,0,0.2)] px-3 py-1 rounded-full border border-[#ffd700]">
                  🌟 CRITICAL HIT! Double Damage Dice Applied!
                </span>
              )}
            </div>
          ) : null}
        </SpotlightCard>
      )}

      {/* Spell Catalog Grid */}
      {filteredSpells.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#9aa1cc] bg-[#14183a] border border-[#262b57] rounded-xl">
          <Wand2 size={24} className="mx-auto mb-2 opacity-40 text-[#a992e8]" />
          No spells found for this filter. Click &ldquo;Add Spell&rdquo; to populate Aria&apos;s grimoire.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSpells.map((spell) => {
            const isPhaseMatch = spell.phaseAffinity === activePhase;

            return (
              <SpotlightCard
                key={spell.id}
                className={`p-4 border transition-all ${
                  isPhaseMatch
                    ? 'border-[#a992e8] bg-gradient-to-b from-[#1d2249] to-[#14183a] shadow-[0_0_15px_rgba(169,146,232,0.2)]'
                    : 'border-[#262b57] bg-[#14183a]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                        {spell.name}
                      </h3>

                      {isPhaseMatch && (
                        <span className="text-[9px] bg-[rgba(169,146,232,0.2)] text-[#a992e8] border border-[#a992e8]/40 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Moon size={10} /> Active Boon
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-[#9aa1cc] font-[family-name:var(--font-mono)]">
                      {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCastSpell(spell)}
                      className="px-3 py-1.5 bg-[#a992e8] hover:bg-[#8f76d6] text-black font-bold text-xs rounded-lg font-[family-name:var(--font-mono)] transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(169,146,232,0.4)] cursor-pointer"
                    >
                      <Wand2 size={12} /> Cast
                    </button>
                    <button
                      onClick={() => deleteSpell(spell.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Spell"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#cfd4ee] leading-relaxed mb-3">
                  {spell.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#9aa1cc] font-[family-name:var(--font-mono)] pt-2 border-t border-[#343a72]">
                  <span>Time: <strong className="text-[#cfd4ee]">{spell.castingTime}</strong></span>
                  <span>Range: <strong className="text-[#cfd4ee]">{spell.range}</strong></span>
                  {spell.damageDice && (
                    <span className="text-[#a992e8] font-bold">Dice: {spell.damageDice}</span>
                  )}
                  {spell.phaseAffinity && (
                    <span className="text-[#d9b872] uppercase">Phase: {spell.phaseAffinity}</span>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* ADD SPELL MODAL FOR ARIA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#14183a] border-2 border-[#a992e8] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#9aa1cc] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#343a72]">
              <BookOpen className="text-[#a992e8]" size={20} />
              <h2 className="text-xl font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                Add Spell to Aria&apos;s Grimoire
              </h2>
            </div>

            <div className="space-y-3 text-xs mb-6 font-[family-name:var(--font-mono)]">
              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Spell Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Moonlight Beam, Starlight Shield, Counterspell"
                  value={spellForm.name}
                  onChange={(e) => setSpellForm({ ...spellForm, name: e.target.value })}
                  className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] font-semibold focus:border-[#a992e8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Spell Level
                  </label>
                  <select
                    value={spellForm.level}
                    onChange={(e) => setSpellForm({ ...spellForm, level: Number(e.target.value) })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  >
                    <option value={0}>Cantrip (Level 0)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Magic School
                  </label>
                  <select
                    value={spellForm.school}
                    onChange={(e) => setSpellForm({ ...spellForm, school: e.target.value })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  >
                    {SPELL_SCHOOLS.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Casting Time
                  </label>
                  <input
                    type="text"
                    placeholder="1 Action, 1 Bonus Action"
                    value={spellForm.castingTime}
                    onChange={(e) => setSpellForm({ ...spellForm, castingTime: e.target.value })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Range
                  </label>
                  <input
                    type="text"
                    placeholder="Self, 60 ft, Touch"
                    value={spellForm.range}
                    onChange={(e) => setSpellForm({ ...spellForm, range: e.target.value })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Components
                  </label>
                  <input
                    type="text"
                    placeholder="V, S, M"
                    value={spellForm.components}
                    onChange={(e) => setSpellForm({ ...spellForm, components: e.target.value })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                    Damage / Healing Dice
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3d6, 8d6"
                    value={spellForm.damageDice || ''}
                    onChange={(e) => setSpellForm({ ...spellForm, damageDice: e.target.value })}
                    className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Lunar Phase Boon (Optional)
                </label>
                <select
                  value={spellForm.phaseAffinity || ''}
                  onChange={(e) => setSpellForm({ ...spellForm, phaseAffinity: (e.target.value as LunarPhase) || undefined })}
                  className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                >
                  <option value="">None (Standard Spell)</option>
                  <option value="full">Full Moon (Empowered Radiance)</option>
                  <option value="new">New Moon (Umbral Veil)</option>
                  <option value="crescent">Crescent Moon (Starlight Speed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Spell Description &amp; Mechanics
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe spell effects, saving throw details, or extra damage..."
                  value={spellForm.description}
                  onChange={(e) => setSpellForm({ ...spellForm, description: e.target.value })}
                  className="w-full bg-[#0d1026] border border-[#262b57] rounded-lg p-2.5 text-[#e8e6ff] focus:border-[#a992e8] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#343a72]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#9aa1cc] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpell}
                className="px-4 py-2 bg-[#a992e8] hover:bg-[#8f76d6] text-black font-bold text-xs rounded-xl font-[family-name:var(--font-mono)] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(169,146,232,0.4)]"
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

