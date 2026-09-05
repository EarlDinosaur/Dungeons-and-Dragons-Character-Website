'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Flame, Dices, Eye, CheckSquare, Square, RefreshCw, Sun, ShieldAlert } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CyrusState, OracleSpell } from '@/lib/cyrus-engine';
import { useCharacter } from '@/app/providers';

interface CyrusSpellbookPanelProps {
  cyrus: CyrusState;
  onUseSlot: (level: number) => void;
  onRestoreSlot: (level: number) => void;
  onLongRest: () => void;
}

export default function CyrusSpellbookPanel({
  cyrus,
  onUseSlot,
  onRestoreSlot,
  onLongRest,
}: CyrusSpellbookPanelProps) {
  const { showToastNotification } = useCharacter();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all' | 'solar'>('all');
  const [activeRoll, setActiveRoll] = useState<{
    spellName: string;
    d20: number;
    totalHit: number;
    damageDice: string;
    damageTotal: number;
    isCrit: boolean;
    blisteringBonus: number;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const spells = cyrus.spellcasting.spells || [];

  // Filter spells
  const filteredSpells = spells.filter((s) => {
    if (selectedLevelFilter === 'all') return true;
    if (selectedLevelFilter === 'solar') {
      return ['fire-bolt', 'sacred-flame', 'faerie-fire', 'guiding-bolt', 'flaming-sphere', 'light'].includes(s.id);
    }
    return s.level === selectedLevelFilter;
  });

  // d20 Roll Simulator with Blistering Caress (+3 CHA) bonus
  const handleCastSpell = (spell: OracleSpell) => {
    setIsRolling(true);
    setActiveRoll(null);

    showToastNotification(
      `Cast ${spell.name}!`,
      spell.level > 0 ? `Expended Level ${spell.level} Oracle slot. DC ${cyrus.spellcasting.spellSaveDC}` : `Cast cantrip ${spell.name}.`,
      'spell'
    );

    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const totalHit = d20 + cyrus.spellcasting.spellAttackBonus;
      const isCrit = d20 === 20;

      // Blistering Caress gives +CHA mod (+3) bonus damage to 1st level+ spells and Fire Bolt
      const blisteringBonus = (spell.level > 0 || spell.id === 'fire-bolt') ? 3 : 0;

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
          damageTotal += bonus + blisteringBonus;
        } else {
          damageTotal = blisteringBonus;
        }
      }

      setActiveRoll({
        spellName: spell.name,
        d20,
        totalHit,
        damageDice: spell.damageDice || '',
        damageTotal,
        isCrit,
        blisteringBonus,
      });
      setIsRolling(false);

      // Auto deduct spell slot if level > 0
      if (spell.level > 0) {
        onUseSlot(spell.level);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ====================================================================
         1. SPELL SLOT TRACKER & ORACLE SPELLCASTING DC
         ==================================================================== */}
      <SpotlightCard className="p-6 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#daa520]/25">
          <div className="flex items-center gap-2">
            <Sun size={22} className="text-[#daa520]" />
            <div>
              <h2 className="text-xl font-bold text-amber-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Solar Oracle Spell Slots
              </h2>
              <p className="text-xs text-[#b89d5e] font-mono">
                Click slot square to toggle spent / available status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-amber-200/80 font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-[#daa520]/30">
              Spell DC: <strong className="text-[#daa520] text-sm">{cyrus.spellcasting.spellSaveDC}</strong> &bull; Attack: <strong className="text-amber-300 text-sm">+{cyrus.spellcasting.spellAttackBonus}</strong>
            </div>

            <button
              onClick={onLongRest}
              className="flex items-center gap-1.5 bg-[#daa520]/20 hover:bg-[#daa520]/40 text-amber-100 border border-[#daa520]/50 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow"
              title="Rest to restore all spell slots"
            >
              <RefreshCw size={13} className="text-[#daa520]" /> Rest Slots
            </button>
          </div>
        </div>

        {/* Level 1 & Level 2 Spell Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((lvl) => {
            const slotData = cyrus.spellcasting.slots[lvl as 1 | 2];
            const max = slotData?.max || (lvl === 1 ? 4 : 2);
            const used = slotData?.used || 0;
            const available = Math.max(0, max - used);

            return (
              <div
                key={`slot-lvl-${lvl}`}
                className="p-4 rounded-xl bg-black/60 border border-[#daa520]/30 flex items-center justify-between shadow-inner"
              >
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#b89d5e] block">
                    Level {lvl} Spell Slots
                  </span>
                  <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-amber-100">
                    {available} / {max} <span className="text-xs text-amber-200/60 font-mono font-normal">Available</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: max }, (_, i) => {
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        onClick={() => (isUsed ? onRestoreSlot(lvl) : onUseSlot(lvl))}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isUsed
                            ? 'bg-black/80 border-gray-800 text-gray-600'
                            : 'bg-[rgba(218,165,32,0.2)] border-[#daa520] text-[#daa520] shadow-[0_0_10px_rgba(218,165,32,0.4)]'
                        }`}
                        title={isUsed ? `Click to restore Level ${lvl} slot` : `Click to expend Level ${lvl} slot`}
                      >
                        {isUsed ? <Square size={18} className="opacity-40" /> : <CheckSquare size={18} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Blistering Caress Feature Banner */}
        <div className="mt-4 p-3 rounded-xl bg-[rgba(218,165,32,0.08)] border border-[#daa520]/20 flex items-center gap-3 text-xs font-mono text-amber-200">
          <Flame size={16} className="text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300">Blistering Caress Passive:</strong> All 1st+ level spells &amp; Fire Bolt deal <strong className="text-[#daa520]">+3 extra damage</strong> (Charisma modifier).
          </span>
        </div>
      </SpotlightCard>

      {/* ====================================================================
         2. SPELL FILTER NAVIGATION
         ==================================================================== */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedLevelFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            selectedLevelFilter === 'all'
              ? 'bg-[#daa520] text-black shadow-[0_0_12px_rgba(218,165,32,0.5)]'
              : 'bg-black/60 text-amber-200 border border-[#daa520]/30 hover:border-[#daa520]'
          }`}
        >
          All Spells ({spells.length})
        </button>

        <button
          onClick={() => setSelectedLevelFilter('solar')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
            selectedLevelFilter === 'solar'
              ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : 'bg-black/60 text-amber-300 border border-amber-500/40 hover:border-amber-400'
          }`}
        >
          <Sun size={13} /> Solar Domain Spells
        </button>

        {[0, 1, 2].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevelFilter(lvl)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedLevelFilter === lvl
                ? 'bg-[#daa520] text-black shadow-[0_0_12px_rgba(218,165,32,0.5)]'
                : 'bg-black/60 text-amber-200 border border-[#daa520]/30 hover:border-[#daa520]'
            }`}
          >
            {lvl === 0 ? 'Cantrips' : `Level ${lvl}`}
          </button>
        ))}
      </div>

      {/* ====================================================================
         3. D20 ROLL ANIMATION BANNER
         ==================================================================== */}
      {(isRolling || activeRoll) && (
        <SpotlightCard className="p-6 border-2 border-[#daa520] bg-[linear-gradient(135deg,rgba(35,28,10,0.98)_0%,rgba(18,14,6,0.98)_100%)] text-center relative overflow-hidden shadow-[0_0_40px_rgba(218,165,32,0.3)]">
          {isRolling ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <Dices size={42} className="text-[#daa520] animate-spin mb-2" />
              <p className="text-sm font-bold text-amber-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Channeling Divine Sunfire of Apollo...
              </p>
            </div>
          ) : activeRoll ? (
            <div className="space-y-3 font-mono">
              <div className="text-xs uppercase tracking-widest text-[#daa520] font-bold">
                Spell Attack Result — {activeRoll.spellName}
              </div>

              <div className="flex items-center justify-center gap-6">
                <div>
                  <span className="text-4xl font-extrabold font-['Cormorant_Garamond',serif] text-amber-100">
                    {activeRoll.totalHit}
                  </span>
                  <span className="block text-[10px] text-amber-200/60">
                    To Hit (d20: {activeRoll.d20} + {cyrus.spellcasting.spellAttackBonus})
                  </span>
                </div>

                {activeRoll.damageDice && (
                  <div className="border-l border-[#daa520]/30 pl-6">
                    <span className="text-4xl font-extrabold font-['Cormorant_Garamond',serif] text-[#daa520]">
                      {activeRoll.damageTotal}
                    </span>
                    <span className="block text-[10px] text-amber-200/60">
                      Damage ({activeRoll.damageDice} {activeRoll.blisteringBonus > 0 && `+ ${activeRoll.blisteringBonus} Blistering`})
                    </span>
                  </div>
                )}
              </div>

              {activeRoll.isCrit && (
                <span className="inline-block text-xs font-bold text-amber-300 bg-[rgba(255,215,0,0.2)] px-4 py-1 rounded-full border border-amber-400 shadow-md">
                  ☀️ CRITICAL DIVINE STRIKE! Double Damage Dice Applied!
                </span>
              )}
            </div>
          ) : null}
        </SpotlightCard>
      )}

      {/* ====================================================================
         4. SPELL CATALOG GRID
         ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSpells.map((spell) => {
          const isSolar = ['fire-bolt', 'sacred-flame', 'faerie-fire', 'guiding-bolt', 'flaming-sphere', 'light'].includes(spell.id);

          return (
            <SpotlightCard
              key={spell.id}
              className={`p-5 border transition-all rounded-2xl flex flex-col justify-between ${
                isSolar
                  ? 'border-[#daa520]/60 bg-[linear-gradient(135deg,rgba(28,23,10,0.95)_0%,rgba(16,13,6,0.98)_100%)] shadow-[0_0_18px_rgba(218,165,32,0.18)] hover:border-[#daa520]'
                  : 'border-white/10 bg-black/50 hover:border-amber-500/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-amber-100 font-['Cormorant_Garamond',serif]">
                        {spell.name}
                      </h3>

                      {isSolar && (
                        <span className="text-[9px] bg-[rgba(218,165,32,0.2)] text-[#daa520] border border-[#daa520]/40 px-2 py-0.5 rounded-full font-bold font-mono flex items-center gap-1">
                          <Sun size={10} /> Solar Domain
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-amber-200/60 font-mono">
                      {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} &bull; {spell.school}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCastSpell(spell)}
                    className="px-3.5 py-1.5 bg-[#daa520] hover:bg-amber-400 text-black font-bold text-xs rounded-xl font-mono transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_12px_rgba(218,165,32,0.4)]"
                  >
                    <Wand2 size={13} /> Cast Spell
                  </button>
                </div>

                <p className="text-xs text-amber-100/80 leading-relaxed mb-3">
                  {spell.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-amber-200/60 font-mono pt-2.5 border-t border-white/10">
                <span>Cast: <strong className="text-amber-200">{spell.castingTime}</strong></span>
                <span>Range: <strong className="text-amber-200">{spell.range}</strong></span>
                {spell.damageDice && (
                  <span className="text-[#daa520] font-bold">Dice: {spell.damageDice}</span>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
