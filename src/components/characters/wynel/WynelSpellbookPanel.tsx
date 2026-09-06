'use client';

import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Flame,
  Dices,
  RotateCcw,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Check,
  CheckSquare,
  Square,
  Clock,
  Crosshair,
  Shield,
  Heart,
  BookOpen,
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { WynelState, WarlockSpell } from '@/lib/wynel-engine';
import { useCharacter } from '@/app/providers';

interface WynelSpellbookPanelProps {
  wynel: WynelState;
  onUsePactSlot: () => void;
  onRestorePactSlot: () => void;
  onShortRest: () => void;
  onLongRest?: () => void;
}

const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export default function WynelSpellbookPanel({
  wynel,
  onUsePactSlot,
  onRestorePactSlot,
  onShortRest,
  onLongRest,
}: WynelSpellbookPanelProps) {
  const { pactEngine, spellcasting } = wynel;
  const { showToastNotification, setWynelPactSlotMax, addSpell, deleteSpell } = useCharacter();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'chaos' | 'tome' | number>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [spellForm, setSpellForm] = useState<Omit<WarlockSpell, 'id'>>({
    name: '',
    level: 2,
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
    diceRolls: number[];
    damageTotal: number;
    isCrit: boolean;
    isNat1: boolean;
    agonizingBonus: number;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const spells = spellcasting.spells || [];
  const availableSlots = Math.max(0, pactEngine.slotsMax - pactEngine.slotsUsed);

  // Filter spells
  const filteredSpells = spells.filter((s) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'chaos') {
      return [
        'eldritch-blast',
        'faerie-fire',
        'phantasmal-force',
        'hellish-rebuke',
        'sleep',
        'misty-step',
        'hold-person',
      ].includes(s.id);
    }
    if (selectedFilter === 'tome') {
      return !!s.isTomeCantrip;
    }
    return s.level === selectedFilter;
  });

  const handleCreateSpell = () => {
    if (!spellForm.name.trim()) return;
    addSpell(spellForm as any);
    setIsAddModalOpen(false);
    setSpellForm({
      name: '',
      level: 2,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '60 ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: '',
      damageDice: '',
    });
  };

  // Full-featured d20 Roll Simulator with Agonizing Blast (+3 CHA) bonus
  const handleCastSpell = (spell: WarlockSpell) => {
    setIsRolling(true);
    setActiveRoll(null);

    const isCantrip = spell.level === 0;

    showToastNotification(
      `Cast ${spell.name}!`,
      !isCantrip
        ? `Expended 1 Pact Slot (Level ${pactEngine.slotLevel}). DC ${spellcasting.spellSaveDC}.`
        : `Cast cantrip ${spell.name}.`,
      'spell'
    );

    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const totalHit = d20 + spellcasting.spellAttackBonus;
      const isCrit = d20 === 20;
      const isNat1 = d20 === 1;

      // Agonizing Blast adds CHA modifier (+3) to Eldritch Blast damage on a hit
      const isEldritch = spell.id === 'eldritch-blast' || spell.name.toLowerCase().includes('eldritch blast');
      const agonizingBonus = isEldritch ? 3 : 0;

      let damageTotal = 0;
      const diceRolls: number[] = [];
      const dicePattern = spell.damageDice || (isEldritch ? '1d10' : '');

      if (dicePattern) {
        const match = dicePattern.match(/(\d+)d(\d+)(\+(\d+))?/);
        if (match) {
          const numDice = parseInt(match[1], 10) * (isCrit ? 2 : 1);
          const dieSize = parseInt(match[2], 10);
          const flatBonus = match[4] ? parseInt(match[4], 10) : 0;

          for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * dieSize) + 1;
            diceRolls.push(roll);
            damageTotal += roll;
          }
          damageTotal += flatBonus + agonizingBonus;
        } else {
          damageTotal = agonizingBonus;
        }
      }

      setActiveRoll({
        spellName: spell.name,
        d20,
        totalHit,
        damageDice: dicePattern,
        diceRolls,
        damageTotal,
        isCrit,
        isNat1,
        agonizingBonus,
      });
      setIsRolling(false);

      // Auto deduct pact slot if leveled spell and slot is available
      if (!isCantrip && pactEngine.slotsUsed < pactEngine.slotsMax) {
        onUsePactSlot();
      }
    }, 500);
  };

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ====================================================================
         1. PACT MAGIC SLOT TRACKER & CHAOS DC HEADER
         ==================================================================== */}
      <SpotlightCard className="p-6 glass-card border border-red-900/50 bg-[linear-gradient(135deg,rgba(26,6,12,0.95)_0%,rgba(13,4,7,0.98)_100%)] shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-950 border border-red-500/50 text-rose-400 shadow-inner">
              <Flame size={24} className="text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider flex items-center gap-2">
                Scarlet Pact Magic &amp; Grimoire
              </h2>
              <p className="text-xs text-rose-300/70 font-mono">
                Pact Magic slots recharge on Short or Long Rest &bull; All warlock spells cast at Level {pactEngine.slotLevel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="text-xs text-rose-200/90 font-mono bg-black/70 px-3 py-1.5 rounded-xl border border-red-800/40">
              Spell DC: <strong className="text-red-400 text-sm">{spellcasting.spellSaveDC}</strong> &bull; Attack: <strong className="text-rose-300 text-sm">+{spellcasting.spellAttackBonus}</strong>
            </div>

            <button
              onClick={onShortRest}
              className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 text-rose-200 border border-red-700/50 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow cursor-pointer"
              title="Short Rest: Refresh all Pact Magic slots and Fey Presence"
            >
              <RotateCcw size={13} />
              <span>Short Rest</span>
            </button>

            {onLongRest && (
              <button
                onClick={onLongRest}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow cursor-pointer"
                title="Long Rest: Refresh all slots, HP, and features"
              >
                <RefreshCw size={13} />
                <span>Long Rest</span>
              </button>
            )}
          </div>
        </div>

        {/* Pact Slots Counter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/50 border border-red-950">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold block mb-1">
                Pact Magic Slots (Level {pactEngine.slotLevel})
              </span>
              <div className="flex items-center gap-2">
                {Array.from({ length: pactEngine.slotsMax }).map((_, index) => {
                  const isUsed = index < pactEngine.slotsUsed;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isUsed) {
                          onRestorePactSlot();
                        } else {
                          onUsePactSlot();
                        }
                      }}
                      className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                      title={isUsed ? 'Pact slot spent (click to restore)' : 'Pact slot available (click to expend)'}
                    >
                      {isUsed ? (
                        <CheckSquare size={26} className="text-zinc-600 hover:text-zinc-400" />
                      ) : (
                        <Square size={26} className="text-red-500 fill-red-950/80 hover:text-red-400" />
                      )}
                    </button>
                  );
                })}

                <span className="text-xs font-mono text-rose-200/80 ml-2 font-bold">
                  {availableSlots} / {pactEngine.slotsMax} Available
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-rose-300/70">
            <span>Max Slots:</span>
            <button
              onClick={() => setWynelPactSlotMax(Math.max(1, pactEngine.slotsMax - 1))}
              className="w-6 h-6 rounded bg-red-950/80 hover:bg-red-900 border border-red-700/50 flex items-center justify-center text-rose-200 cursor-pointer"
              title="Decrease max slots"
            >
              -
            </button>
            <span className="font-bold text-rose-100">{pactEngine.slotsMax}</span>
            <button
              onClick={() => setWynelPactSlotMax(pactEngine.slotsMax + 1)}
              className="w-6 h-6 rounded bg-red-950/80 hover:bg-red-900 border border-red-700/50 flex items-center justify-center text-rose-200 cursor-pointer"
              title="Increase max slots"
            >
              +
            </button>
          </div>
        </div>
      </SpotlightCard>

      {/* ====================================================================
         2. FILTER BAR & "+ ADD SPELL" BUTTON
         ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-red-900/40">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-black/60 text-rose-200/80 border border-red-900/40 hover:border-red-600'
            }`}
          >
            All Spells ({spells.length})
          </button>

          <button
            onClick={() => setSelectedFilter('chaos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              selectedFilter === 'chaos'
                ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                : 'bg-black/60 text-rose-300 border border-red-800/40 hover:border-red-500'
            }`}
          >
            <Flame size={13} className="text-red-400" /> Chaos &amp; Patron
          </button>

          <button
            onClick={() => setSelectedFilter('tome')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              selectedFilter === 'tome'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-black/60 text-rose-300 border border-rose-800/40 hover:border-rose-400'
            }`}
          >
            <BookOpen size={13} className="text-rose-400" /> Tome Cantrips
          </button>

          <button
            onClick={() => setSelectedFilter(0)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === 0
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-black/60 text-rose-200/80 border border-red-900/40 hover:border-red-600'
            }`}
          >
            Cantrips
          </button>

          <button
            onClick={() => setSelectedFilter(2)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === 2
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-black/60 text-rose-200/80 border border-red-900/40 hover:border-red-600'
            }`}
          >
            Pact Spells (Lv {pactEngine.slotLevel})
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl font-mono transition-all flex items-center gap-1.5 shadow-[0_0_14px_rgba(239,68,68,0.4)] cursor-pointer shrink-0"
        >
          <Plus size={14} /> Add Spell
        </button>
      </div>

      {/* ====================================================================
         3. D20 ROLL ANIMATION MODAL OVERLAY
         ==================================================================== */}
      {(isRolling || activeRoll) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md p-6 border-2 border-red-500 bg-[linear-gradient(135deg,rgba(35,10,16,0.98)_0%,rgba(18,5,8,0.98)_100%)] text-center relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <button
              onClick={() => {
                setIsRolling(false);
                setActiveRoll(null);
              }}
              className="absolute top-3 right-3 text-rose-300/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Roll Result"
            >
              <X size={20} />
            </button>

            {isRolling ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <Dices size={44} className="text-red-400 animate-spin mb-2" />
                <p className="text-sm font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                  Weaving Scarlet Chaos Hex...
                </p>
              </div>
            ) : activeRoll ? (
              <div className="space-y-4 font-mono">
                <div className="border-b border-red-900/40 pb-3">
                  <span className="text-xs uppercase tracking-widest text-red-400 font-bold block mb-1">
                    Chaos Spell Result — {activeRoll.spellName}
                  </span>

                  <div className="flex items-center justify-center gap-6 mt-2">
                    <div>
                      <span
                        className={`text-4xl font-extrabold font-['Cormorant_Garamond',serif] ${
                          activeRoll.isCrit
                            ? 'text-amber-300 animate-bounce'
                            : activeRoll.isNat1
                            ? 'text-red-500'
                            : 'text-rose-100'
                        }`}
                      >
                        {activeRoll.totalHit}
                      </span>
                      <span className="block text-[10px] text-rose-200/60 mt-1">
                        To Hit (d20: {activeRoll.d20} + {spellcasting.spellAttackBonus})
                      </span>
                    </div>

                    {activeRoll.damageDice && (
                      <div className="border-l border-red-900/40 pl-6">
                        <span className="text-4xl font-extrabold font-['Cormorant_Garamond',serif] text-red-400">
                          {activeRoll.damageTotal}
                        </span>
                        <span className="block text-[10px] text-rose-200/60 mt-1">
                          Damage ({activeRoll.damageDice}
                          {activeRoll.agonizingBonus > 0 && ` + ${activeRoll.agonizingBonus} Agonizing Blast`})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {activeRoll.diceRolls.length > 0 && (
                  <div className="text-[11px] text-rose-200/70">
                    Dice Rolls: [{activeRoll.diceRolls.join(', ')}]
                    {activeRoll.agonizingBonus > 0 && ` + ${activeRoll.agonizingBonus} (CHA Mod)`}
                  </div>
                )}

                {activeRoll.isCrit && (
                  <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-rose-200 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    ⚡ CRITICAL CHAOS SURGE! Double Damage Dice Applied!
                  </div>
                )}

                {activeRoll.isNat1 && (
                  <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-red-400 font-bold text-xs flex items-center justify-center gap-2">
                    💀 CRITICAL MISS! The chaos energy dissipated harmlessly.
                  </div>
                )}

                <button
                  onClick={() => setActiveRoll(null)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl font-mono transition-all cursor-pointer shadow-[0_0_14px_rgba(239,68,68,0.4)]"
                >
                  Dismiss Result
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ====================================================================
         4. SPELL CATALOG GRID
         ==================================================================== */}
      {filteredSpells.length === 0 ? (
        <div className="p-8 text-center text-xs text-rose-200/60 bg-black/60 border border-red-900/30 rounded-2xl font-mono">
          <Wand2 size={24} className="mx-auto mb-2 opacity-40 text-red-400" />
          No spells found for this filter. Click &ldquo;Add Spell&rdquo; to expand Wyn&apos;el&apos;s grimoire.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSpells.map((spell) => {
            const isCantrip = spell.level === 0;
            const canCast = isCantrip || availableSlots > 0;

            return (
              <SpotlightCard
                key={spell.id}
                className={`p-5 rounded-2xl bg-zinc-950/90 border transition-all flex flex-col justify-between ${
                  spell.isTomeCantrip
                    ? 'border-rose-600/50 hover:border-rose-400 shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
                    : 'border-red-900/40 hover:border-red-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-rose-100 font-['Cormorant_Garamond',serif] flex items-center gap-1.5">
                        {spell.name}
                      </h3>
                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="text-red-400 font-bold uppercase">
                          {isCantrip
                            ? spell.isTomeCantrip
                              ? 'Tome Cantrip'
                              : 'Cantrip'
                            : `Level ${pactEngine.slotLevel} Pact Spell`}
                        </span>
                        <span>&bull;</span>
                        <span>{spell.school}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {spell.castingTime}
                      </span>
                      {/* Delete button for custom spells or custom additions */}
                      <button
                        onClick={() => deleteSpell(spell.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Remove spell from grimoire"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Crosshair size={11} className="text-red-400" /> {spell.range}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-zinc-500" /> {spell.duration}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-zinc-900 mb-4">
                    {spell.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Comp: {spell.components}
                  </span>

                  <div className="flex items-center gap-2">
                    {spell.damageDice && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800/50 text-rose-300">
                        {spell.damageDice}
                      </span>
                    )}

                    <button
                      onClick={() => handleCastSpell(spell)}
                      disabled={!canCast}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        !canCast
                          ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                          : isCantrip
                          ? 'bg-red-950 hover:bg-red-900 text-rose-200 border border-red-500/40 shadow-sm'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      }`}
                    >
                      <Flame size={13} />
                      {isCantrip ? 'Cast Cantrip' : `Cast (-1 Pact Slot)`}
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* ====================================================================
         5. "+ ADD SPELL" MODAL
         ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 border-2 border-red-600 bg-[linear-gradient(135deg,rgba(28,8,14,0.98)_0%,rgba(14,4,7,0.98)_100%)] relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-rose-300/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-900/40">
              <Flame className="text-red-400" size={22} />
              <h2 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Inscribe Spell to Wyn&apos;el&apos;s Grimoire
              </h2>
            </div>

            <div className="space-y-3 text-xs mb-6 font-mono text-rose-100">
              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Spell Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chaos Orb, Crown of Madness, Hunger of Hadar"
                  value={spellForm.name}
                  onChange={(e) => setSpellForm({ ...spellForm, name: e.target.value })}
                  className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 font-semibold focus:border-red-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Spell Level
                  </label>
                  <select
                    value={spellForm.level}
                    onChange={(e) => setSpellForm({ ...spellForm, level: Number(e.target.value) })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  >
                    <option value={0}>Cantrip (Level 0)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl} {lvl === pactEngine.slotLevel && '(Pact Slot Level)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Magic School
                  </label>
                  <select
                    value={spellForm.school}
                    onChange={(e) => setSpellForm({ ...spellForm, school: e.target.value })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  >
                    {SPELL_SCHOOLS.map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Casting Time
                  </label>
                  <input
                    type="text"
                    placeholder="1 Action, 1 Bonus Action"
                    value={spellForm.castingTime}
                    onChange={(e) => setSpellForm({ ...spellForm, castingTime: e.target.value })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Range
                  </label>
                  <input
                    type="text"
                    placeholder="Self, 60 ft, Touch, 120 ft"
                    value={spellForm.range}
                    onChange={(e) => setSpellForm({ ...spellForm, range: e.target.value })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Components
                  </label>
                  <input
                    type="text"
                    placeholder="V, S, M"
                    value={spellForm.components}
                    onChange={(e) => setSpellForm({ ...spellForm, components: e.target.value })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                    Damage / Effect Dice
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1d10, 3d10, 2d8+3"
                    value={spellForm.damageDice || ''}
                    onChange={(e) => setSpellForm({ ...spellForm, damageDice: e.target.value })}
                    className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Spell Description &amp; Mechanics
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe reality-warping chaos effects, saving throw DC details, or damage types..."
                  value={spellForm.description}
                  onChange={(e) => setSpellForm({ ...spellForm, description: e.target.value })}
                  className="w-full bg-black/80 border border-red-900/40 rounded-xl p-2.5 text-rose-100 focus:border-red-400 focus:outline-none font-[family-name:var(--font-sans)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-red-900/40">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-rose-200/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpell}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_14px_rgba(239,68,68,0.4)]"
              >
                <Check size={14} /> Inscribe Spell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
