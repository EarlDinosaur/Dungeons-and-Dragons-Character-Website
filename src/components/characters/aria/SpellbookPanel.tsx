'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Flame, ShieldAlert, Dices, Moon, Eye, CheckSquare, Square } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { AriaState, SpellItem } from '@/lib/aria-engine';
import { useCharacter } from '@/app/providers';

interface SpellbookPanelProps {
  aria: AriaState;
  onUseSlot: (level: number) => void;
  onRestoreSlot: (level: number) => void;
}

export default function SpellbookPanel({
  aria,
  onUseSlot,
  onRestoreSlot,
}: SpellbookPanelProps) {
  const { showToastNotification } = useCharacter();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const slotData = aria.spellcasting.slots[lvl as 1 | 2 | 3 | 4 | 5];
            const max = slotData?.max || 0;
            const used = slotData?.used || 0;
            const available = max - used;

            return (
              <div key={lvl} className="p-3 rounded-lg bg-[#0d1026] border border-[#262b57] text-center">
                <div className="text-xs font-bold text-[#cfd4ee] font-[family-name:var(--font-heading)] mb-1">
                  Level {lvl}
                </div>
                <div className="text-lg font-bold text-[#a992e8] font-[family-name:var(--font-mono)] mb-2">
                  {available} / {max}
                </div>

                <div className="flex justify-center gap-1">
                  {Array.from({ length: max }, (_, i) => {
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        onClick={() => (isUsed ? onRestoreSlot(lvl) : onUseSlot(lvl))}
                        className="text-[#a992e8] hover:text-white transition-colors"
                      >
                        {isUsed ? <Square size={14} className="opacity-40" /> : <CheckSquare size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SpotlightCard>

      {/* Spell Filter Navigation */}
      <div className="flex flex-wrap items-center gap-2">
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

        {[0, 1, 2, 3, 4, 5].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevelFilter(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold transition-all ${
              selectedLevelFilter === lvl
                ? 'bg-[#a992e8] text-black shadow-[0_0_10px_rgba(169,146,232,0.5)]'
                : 'bg-[#14183a] text-[#cfd4ee] border border-[#343a72] hover:border-[#a992e8]'
            }`}
          >
            {lvl === 0 ? 'Cantrips' : `Level ${lvl}`}
          </button>
        ))}
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

                <button
                  onClick={() => handleCastSpell(spell)}
                  className="px-3 py-1.5 bg-[#a992e8] hover:bg-[#8f76d6] text-black font-bold text-xs rounded-lg font-[family-name:var(--font-mono)] transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_10px_rgba(169,146,232,0.4)]"
                >
                  <Wand2 size={12} /> Cast
                </button>
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
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
