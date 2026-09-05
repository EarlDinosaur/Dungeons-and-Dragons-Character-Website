'use client';

import { useState } from 'react';
import { Shield, Sparkles, CheckSquare, Square, Eye, Award, Moon, Dices, RotateCcw } from 'lucide-react';
import type { AriaState } from '@/lib/aria-engine';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { getModifier } from '@/lib/character-engine';
import { getProficiencyBonus } from '@/lib/aria-engine';

interface AriaStatBlockProps {
  aria: AriaState;
}

export default function AriaStatBlock({ aria }: AriaStatBlockProps) {
  const prof = getProficiencyBonus(aria.level);

  // Active D20 Roller State
  const [activeCheckRoll, setActiveCheckRoll] = useState<{
    label: string;
    d20: number;
    modifier: number;
    total: number;
    isNat20: boolean;
    isNat1: boolean;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollCheck = (label: string, modifier: number) => {
    setIsRolling(true);
    setActiveCheckRoll(null);
    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + modifier;
      setActiveCheckRoll({
        label,
        d20,
        modifier,
        total,
        isNat20: d20 === 20,
        isNat1: d20 === 1,
      });
      setIsRolling(false);
    }, 400);
  };

  const abilities: Array<{ name: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'; label: string; score: number }> = [
    { name: 'STR', label: 'STRENGTH', score: aria.abilityScores.STR },
    { name: 'DEX', label: 'DEXTERITY', score: aria.abilityScores.DEX },
    { name: 'CON', label: 'CONSTITUTION', score: aria.abilityScores.CON },
    { name: 'INT', label: 'INTELLIGENCE', score: aria.abilityScores.INT },
    { name: 'WIS', label: 'WISDOM', score: aria.abilityScores.WIS },
    { name: 'CHA', label: 'CHARISMA', score: aria.abilityScores.CHA },
  ];

  const skills: Array<{ name: string; ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'; isProf: boolean; isExp: boolean }> = [
    { name: 'Acrobatics', ability: 'DEX', isProf: false, isExp: false },
    { name: 'Animal Handling', ability: 'WIS', isProf: false, isExp: false },
    { name: 'Arcana', ability: 'INT', isProf: true, isExp: true },
    { name: 'Athletics', ability: 'STR', isProf: false, isExp: false },
    { name: 'Deception', ability: 'CHA', isProf: false, isExp: false },
    { name: 'History', ability: 'INT', isProf: true, isExp: false },
    { name: 'Insight', ability: 'WIS', isProf: true, isExp: false },
    { name: 'Intimidation', ability: 'CHA', isProf: false, isExp: false },
    { name: 'Investigation', ability: 'INT', isProf: false, isExp: false },
    { name: 'Medicine', ability: 'WIS', isProf: false, isExp: false },
    { name: 'Nature', ability: 'INT', isProf: false, isExp: false },
    { name: 'Perception', ability: 'WIS', isProf: false, isExp: false },
    { name: 'Performance', ability: 'CHA', isProf: false, isExp: false },
    { name: 'Persuasion', ability: 'CHA', isProf: true, isExp: false },
    { name: 'Religion', ability: 'INT', isProf: false, isExp: false },
    { name: 'Sleight of Hand', ability: 'DEX', isProf: false, isExp: false },
    { name: 'Stealth', ability: 'DEX', isProf: false, isExp: false },
    { name: 'Survival', ability: 'WIS', isProf: false, isExp: false },
  ];

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ============== D20 INTERACTIVE ROLLER FEEDBACK CARD ============== */}
      {(isRolling || activeCheckRoll) && (
        <SpotlightCard className="p-5 border-2 border-[#a992e8] bg-gradient-to-b from-[#171b3f] to-[#14183a] text-center relative overflow-hidden shadow-[0_0_30px_rgba(169,146,232,0.3)] animate-fade-in-up">
          {isRolling ? (
            <div className="py-4 flex items-center justify-center gap-3">
              <Dices size={30} className="text-[#a992e8] animate-spin" />
              <span className="text-sm font-bold text-[#e8e6ff] font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Channeling Starlight &amp; Rolling d20 for Aria...
              </span>
            </div>
          ) : activeCheckRoll ? (
            <div className="flex items-center justify-between gap-4 font-mono">
              <div className="text-left">
                <span className="text-[10px] text-[#9aa1cc] uppercase tracking-widest block font-bold">
                  {activeCheckRoll.label} Check Result
                </span>
                <span className="text-3xl font-extrabold font-['Cormorant_Garamond',serif] text-[#d9b872]">
                  {activeCheckRoll.total}
                </span>
                <span className="text-[11px] text-[#cfd4ee] ml-2">
                  (d20: {activeCheckRoll.d20} {activeCheckRoll.modifier >= 0 ? `+ ${activeCheckRoll.modifier}` : `- ${Math.abs(activeCheckRoll.modifier)}`})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeCheckRoll.isNat20 && (
                  <span className="text-xs font-bold text-[#d9b872] bg-[#1d2249] px-3 py-1 rounded-full border border-[#d9b872] shadow-[0_0_12px_rgba(217,184,114,0.5)]">
                    🌕 LUNAR CRITICAL (Natural 20)!
                  </span>
                )}
                {activeCheckRoll.isNat1 && (
                  <span className="text-xs font-bold text-red-300 bg-red-950/80 px-3 py-1 rounded-full border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    🌑 ECLIPSE FAIL (Natural 1)!
                  </span>
                )}

                <button
                  onClick={() => setActiveCheckRoll(null)}
                  className="p-1.5 rounded-lg text-[#9aa1cc] hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Roll Result"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          ) : null}
        </SpotlightCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMN 1: ABILITY SCORES & SAVING THROWS */}
        <div className="space-y-6">
          {/* Ability Scores */}
          <div className="p-5 rounded-xl border border-[#262b57] bg-gradient-to-b from-[#171b3f] to-[#14183a]">
            <div className="text-xs uppercase tracking-widest text-[#a992e8] font-semibold mb-4 flex items-center justify-between pb-2 border-b border-[#262b57]">
              <span className="flex items-center gap-2"><Sparkles size={14} /> Ability Scores</span>
              <span className="text-[10px] text-[#9aa1cc] font-mono">Click to roll</span>
            </div>

            <div className="space-y-3">
              {abilities.map((ab) => {
                const mod = getModifier(ab.score);
                const fmtMod = mod >= 0 ? `+${mod}` : `${mod}`;
                return (
                  <button
                    key={ab.name}
                    onClick={() => rollCheck(`${ab.label} (${ab.name})`, mod)}
                    className="w-full p-2.5 rounded-lg border border-[#262b57] bg-[#0d1026] hover:border-[#a992e8]/60 hover:bg-[#171b3f] transition-all flex items-center justify-between group cursor-pointer text-left active:scale-95"
                  >
                    <div>
                      <span className="text-[10px] tracking-wider text-[#9aa1cc] uppercase block font-semibold group-hover:text-[#a992e8]">
                        {ab.label}
                      </span>
                      <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff]">
                        {ab.score}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded bg-[#171b3f] border border-[#343a72] text-lg font-bold font-['Cormorant_Garamond',serif] text-[#d9b872] group-hover:scale-110 transition-transform">
                      {fmtMod}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saving Throws */}
          <div className="p-5 rounded-xl border border-[#262b57] bg-gradient-to-b from-[#171b3f] to-[#14183a]">
            <div className="text-xs uppercase tracking-widest text-[#a992e8] font-semibold mb-4 flex items-center justify-between pb-2 border-b border-[#262b57]">
              <span className="flex items-center gap-2"><Shield size={14} /> Saving Throws</span>
              <span className="text-[10px] text-[#9aa1cc] font-mono">Click to roll</span>
            </div>

            <div className="space-y-2">
              {abilities.map((ab) => {
                const isProf = aria.savingThrowProficiencies.includes(ab.name);
                const mod = getModifier(ab.score) + (isProf ? prof : 0);
                const fmtMod = mod >= 0 ? `+${mod}` : `${mod}`;

                return (
                  <button
                    key={ab.name}
                    onClick={() => rollCheck(`${ab.label} Saving Throw`, mod)}
                    className="w-full flex items-center justify-between py-1.5 px-2 rounded text-sm border border-transparent hover:border-[#a992e8]/40 hover:bg-[#1d2249]/60 transition-all cursor-pointer text-left active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <span className={isProf ? 'text-[#a992e8]' : 'text-[#262b57]'}>
                        {isProf ? <CheckSquare size={14} /> : <Square size={14} />}
                      </span>
                      <span className={isProf ? 'text-[#e8e6ff] font-semibold' : 'text-[#cfd4ee]'}>
                        {ab.name}
                      </span>
                    </div>

                    <span className={`font-['Cormorant_Garamond',serif] font-bold text-base ${isProf ? 'text-[#d9b872]' : 'text-[#9aa1cc]'}`}>
                      {fmtMod}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: SKILLS LIST */}
        <div className="p-5 rounded-xl border border-[#262b57] bg-gradient-to-b from-[#171b3f] to-[#14183a] space-y-4">
          <div className="text-xs uppercase tracking-widest text-[#a992e8] font-semibold flex items-center justify-between pb-2 border-b border-[#262b57]">
            <span className="flex items-center gap-2"><Award size={14} /> Proficiencies &amp; Skills</span>
            <span className="text-[10px] text-[#9aa1cc] font-mono">Click to roll</span>
          </div>

          <div className="space-y-1.5">
            {skills.map((sk) => {
              const baseMod = getModifier(aria.abilityScores[sk.ability]);
              const totalBonus = baseMod + (sk.isExp ? prof * 2 : sk.isProf ? prof : 0);
              const fmtBonus = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

              return (
                <button
                  key={sk.name}
                  onClick={() => rollCheck(`${sk.name} Skill`, totalBonus)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-all text-xs cursor-pointer text-left active:scale-95 ${
                    sk.isProf ? 'bg-[rgba(169,146,232,0.08)] border border-[#a992e8]/20 hover:border-[#a992e8]/60 hover:bg-[rgba(169,146,232,0.18)]' : 'border border-transparent hover:bg-[#1d2249]/60 hover:border-[#a992e8]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={sk.isProf ? 'text-[#d9b872]' : 'text-[#262b57]'}>
                      {sk.isProf ? <CheckSquare size={13} /> : <Square size={13} />}
                    </span>
                    <span className={sk.isProf ? 'text-[#e8e6ff] font-semibold' : 'text-[#cfd4ee]'}>
                      {sk.name}
                    </span>
                    {sk.isExp && (
                      <span className="text-[9px] bg-[#d9b872]/20 text-[#d9b872] px-1 rounded font-mono font-bold">
                        EXP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#9aa1cc] font-mono uppercase">{sk.ability}</span>
                    <span className={`font-['Cormorant_Garamond',serif] font-bold text-sm ${sk.isProf ? 'text-[#d9b872]' : 'text-[#9aa1cc]'}`}>
                      {fmtBonus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: PASSIVE SENSES & LUNAR FEATURES */}
        <div className="space-y-6">
          {/* Passive Perception */}
          <div className="p-5 rounded-xl border border-[#262b57] bg-gradient-to-b from-[#171b3f] to-[#14183a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0d1026] border border-[#a992e8]/30 flex items-center justify-center text-[#a992e8]">
                <Eye size={18} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#9aa1cc] block">Passive Perception</span>
                <span className="text-xs text-[#cfd4ee]">WIS (Perception)</span>
              </div>
            </div>
            <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff]">11</span>
          </div>

          {/* Sorcerer Traits Summary */}
          <div className="p-5 rounded-xl border border-[#262b57] bg-gradient-to-b from-[#171b3f] to-[#14183a] space-y-4">
            <div className="text-xs uppercase tracking-widest text-[#a992e8] font-semibold pb-2 border-b border-[#262b57] flex items-center gap-2">
              <Moon size={14} /> Sorcerer Features
            </div>

            <div className="space-y-3 text-xs text-[#cfd4ee] leading-relaxed">
              <div className="p-3 rounded bg-[#0d1026] border border-[#262b57]">
                <h4 className="font-bold text-[#d9b872] font-['Cormorant_Garamond',serif] text-sm mb-1">
                  Lunar Embodiment
                </h4>
                <p className="text-[11px] text-[#9aa1cc]">
                  You learn additional spells associated with the Full Moon, New Moon, and Crescent Moon. You can change your active phase after a long rest.
                </p>
              </div>

              <div className="p-3 rounded bg-[#0d1026] border border-[#262b57]">
                <h4 className="font-bold text-[#a992e8] font-['Cormorant_Garamond',serif] text-sm mb-1">
                  Innate Sorcery
                </h4>
                <p className="text-[11px] text-[#9aa1cc]">
                  As a bonus action, unleash magic for 1 minute: +1 Spell Save DC (DC 18) &amp; Advantage on Sorcerer spell attack rolls (2 uses/long rest).
                </p>
              </div>

              <div className="p-3 rounded bg-[#0d1026] border border-[#262b57]">
                <h4 className="font-bold text-[#e8e6ff] font-['Cormorant_Garamond',serif] text-sm mb-1">
                  Metamagic
                </h4>
                <p className="text-[11px] text-[#9aa1cc]">
                  Modify your spells on the fly using Sorcery Points: Quickened Spell, Twinned Spell, and Subtle Spell.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
