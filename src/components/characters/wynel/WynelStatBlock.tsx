'use client';

import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Flame,
  Sparkles,
  Swords,
  Dices,
  RotateCcw,
  Edit3,
  Check,
  CheckSquare,
  Square,
  X,
  Heart,
  Crown,
  Settings,
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { WynelState } from '@/lib/wynel-engine';
import { getProficiencyBonus } from '@/lib/wynel-engine';
import { getModifier } from '@/lib/character-engine';
import { useCharacter } from '@/app/providers';

interface WynelStatBlockProps {
  wynel: WynelState;
}

const SKILL_LIST: { name: import('@/lib/types').SkillName; ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' }[] = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
];

const ABILITY_LABELS: Record<string, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export default function WynelStatBlock({ wynel }: WynelStatBlockProps) {
  const { updateAbilityBaseScore, toggleSkillProficiency, setCombatOverrides } = useCharacter();
  const prof = getProficiencyBonus(wynel.level);

  // Ability Scores Edit State
  const [isEditingScores, setIsEditingScores] = useState(false);

  // Combat Stats Override Modal State
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [draftAC, setDraftAC] = useState<number>(wynel.combat.ac);
  const [draftInit, setDraftInit] = useState<number>(wynel.combat.initiative);
  const [draftSpeed, setDraftSpeed] = useState<number>(wynel.combat.speed);
  const [draftProf, setDraftProf] = useState<number>(prof);

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
    }, 350);
  };

  const abilities = (['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((ab) => ({
    abbr: ab,
    label: ABILITY_LABELS[ab],
    score: wynel.abilityScores[ab],
    mod: getModifier(wynel.abilityScores[ab]),
    isSaveProf: wynel.savingThrowProficiencies.includes(ab),
  }));

  const openStatsModal = () => {
    setDraftAC(wynel.combat.ac);
    setDraftInit(wynel.combat.initiative);
    setDraftSpeed(wynel.combat.speed);
    setDraftProf(prof);
    setIsStatsModalOpen(true);
  };

  const handleSaveStats = () => {
    setCombatOverrides({
      ac: draftAC,
      initiative: draftInit,
      speed: draftSpeed,
      proficiencyBonus: draftProf,
    });
    setIsStatsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ============== D20 INTERACTIVE ROLLER MODAL OVERLAY ============== */}
      {(isRolling || activeCheckRoll) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 border-2 border-red-500 bg-[linear-gradient(135deg,rgba(38,10,18,0.98)_0%,rgba(16,4,8,0.98)_100%)] text-center relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <button
              onClick={() => {
                setIsRolling(false);
                setActiveCheckRoll(null);
              }}
              className="absolute top-3 right-3 text-rose-300/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Roll Result"
            >
              <X size={20} />
            </button>

            {isRolling ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <Dices size={44} className="text-red-500 animate-spin" />
                <span className="text-sm font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                  Channeling Scarlet Chaos Magic...
                </span>
              </div>
            ) : activeCheckRoll ? (
              <div className="space-y-4 font-mono">
                <div className="border-b border-red-500/30 pb-3">
                  <span className="text-xs text-rose-400 uppercase tracking-widest block font-bold font-['Cormorant_Garamond',serif] mb-1">
                    {activeCheckRoll.label} Result
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-6xl font-extrabold font-['Cormorant_Garamond',serif] text-rose-100">
                      {activeCheckRoll.total}
                    </span>
                  </div>
                  <p className="text-xs text-rose-300/70 mt-2">
                    (d20 Roll: <strong>{activeCheckRoll.d20}</strong> {activeCheckRoll.modifier >= 0 ? `+ Modifier: ${activeCheckRoll.modifier}` : `- Modifier: ${Math.abs(activeCheckRoll.modifier)}`})
                  </p>
                </div>

                {activeCheckRoll.isNat20 && (
                  <div className="p-3 bg-red-950/90 border border-amber-400 rounded-xl text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                    ✨ CHAOS SURGE (Natural 20)! CRITICAL SUCCESS!
                  </div>
                )}
                {activeCheckRoll.isNat1 && (
                  <div className="p-3 bg-red-950/90 border border-red-600 rounded-xl text-red-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    ⚠️ NATURAL 1! CHAOS BACKLASH!
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => rollCheck(activeCheckRoll.label, activeCheckRoll.modifier)}
                    className="flex-1 py-2.5 bg-red-950 hover:bg-red-900 text-rose-100 font-bold text-xs rounded-xl font-mono border border-red-500/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Reroll
                  </button>
                  <button
                    onClick={() => setActiveCheckRoll(null)}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl font-mono transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ============== 1. ABILITY SCORES & CHECKS CARD ============== */}
      <SpotlightCard className="p-5 glass-card border border-red-500/40 bg-[linear-gradient(135deg,rgba(35,10,18,0.96)_0%,rgba(16,4,8,0.98)_100%)] shadow-[0_12px_40px_rgba(239,68,68,0.2)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-500/25">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-red-400" />
            <h3 className="text-lg font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Ability Scores &amp; Checks
            </h3>
          </div>
          <button
            onClick={() => setIsEditingScores(!isEditingScores)}
            className="text-[10px] font-mono text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer bg-black/60 px-2.5 py-1 rounded-lg border border-red-500/40 transition-colors shadow-xs"
          >
            {isEditingScores ? <Check size={12} className="text-emerald-400" /> : <Edit3 size={12} className="text-red-400" />}
            {isEditingScores ? 'Done Editing' : 'Edit Scores'}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {abilities.map((ab) => (
            <div
              key={ab.abbr}
              className={`relative p-3 rounded-2xl text-center border transition-all ${
                ab.abbr === 'CHA' || ab.abbr === 'DEX'
                  ? 'bg-[rgba(239,68,68,0.14)] border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : 'bg-black/50 border-red-950/60 hover:border-red-900/60'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase tracking-widest text-rose-300/80 mb-1 font-bold">
                {ab.abbr}
              </span>

              <button
                onClick={() => rollCheck(`${ab.label} (${ab.abbr}) Check`, ab.mod)}
                className="text-3xl font-bold font-['Cormorant_Garamond',serif] text-rose-100 block leading-none hover:scale-110 transition-transform cursor-pointer w-full my-1"
                title="Click to roll ability check"
              >
                {ab.mod >= 0 ? `+${ab.mod}` : ab.mod}
              </button>

              {isEditingScores ? (
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={ab.score}
                  onChange={(e) => updateAbilityBaseScore(ab.abbr, Number(e.target.value))}
                  className="w-12 bg-black/90 border border-red-500 rounded text-xs font-mono text-rose-200 text-center mt-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              ) : (
                <span className="text-[11px] font-mono text-rose-300/60 mt-1 block">
                  {ab.score}
                </span>
              )}

              {ab.isSaveProf && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center shadow-md"
                  title="Proficient in Saving Throw"
                >
                  <Shield size={9} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* ============== 2. COMBAT STATS VITALS (EDITABLE!) ============== */}
      <SpotlightCard className="p-5 glass-card border border-red-500/40 bg-[linear-gradient(135deg,rgba(35,10,18,0.96)_0%,rgba(16,4,8,0.98)_100%)] shadow-[0_12px_40px_rgba(239,68,68,0.15)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-500/25">
          <div className="flex items-center gap-2">
            <Swords size={18} className="text-red-400" />
            <h3 className="text-lg font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Combat Vitals &amp; Spell DC
            </h3>
          </div>
          <button
            onClick={openStatsModal}
            className="text-[10px] font-mono text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer bg-black/60 px-2.5 py-1 rounded-lg border border-red-500/40 transition-colors shadow-xs"
          >
            <Settings size={12} className="text-red-400" /> Edit Combat Stats
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
          {/* Armor Class */}
          <div
            onClick={openStatsModal}
            className="p-3 rounded-2xl bg-black/50 border border-red-900/40 hover:border-red-500/60 transition-all cursor-pointer group shadow-md"
            title="Click to edit AC"
          >
            <span className="block text-[10px] tracking-wider text-rose-400/80 uppercase">AC ✏️</span>
            <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-rose-100">
              {wynel.combat.ac}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              {wynel.pactEngine.armorOfShadowsActive ? 'Mage Armor' : 'Base'}
            </span>
          </div>

          {/* Initiative */}
          <div
            onClick={() => rollCheck('Initiative Check', wynel.combat.initiative)}
            className="p-3 rounded-2xl bg-black/50 border border-red-900/40 hover:border-red-500/60 transition-all cursor-pointer group shadow-md"
            title="Click to roll initiative check"
          >
            <span className="block text-[10px] tracking-wider text-rose-400/80 uppercase">INIT 🎲</span>
            <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-rose-200">
              {wynel.combat.initiative >= 0 ? `+${wynel.combat.initiative}` : wynel.combat.initiative}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Click to Roll</span>
          </div>

          {/* Speed */}
          <div
            onClick={openStatsModal}
            className="p-3 rounded-2xl bg-black/50 border border-red-900/40 hover:border-red-500/60 transition-all cursor-pointer group shadow-md"
            title="Click to edit Speed"
          >
            <span className="block text-[10px] tracking-wider text-rose-400/80 uppercase">SPEED ✏️</span>
            <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-rose-200">
              {wynel.combat.speed}&apos;
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Walking</span>
          </div>

          {/* Spell Save DC & Attack */}
          <div className="p-3 rounded-2xl bg-[rgba(239,68,68,0.12)] border border-red-500/40 shadow-md">
            <span className="block text-[10px] tracking-wider text-rose-300 uppercase font-bold">SPELL DC / ATK</span>
            <span className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-rose-100">
              {wynel.spellcasting.spellSaveDC}
            </span>
            <span className="text-[10px] text-rose-300/80 block mt-0.5">
              Attack: +{wynel.spellcasting.spellAttackBonus}
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* ============== 3. SAVING THROWS CARD ============== */}
      <SpotlightCard className="p-5 glass-card border border-red-500/40 bg-[linear-gradient(135deg,rgba(35,10,18,0.96)_0%,rgba(16,4,8,0.98)_100%)] shadow-[0_12px_40px_rgba(239,68,68,0.15)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-500/25">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            <h3 className="text-lg font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Saving Throws
            </h3>
          </div>
          <span className="text-[10px] font-mono text-rose-300/70">Click to roll Saving Throw</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {abilities.map((ab) => {
            const saveBonus = ab.mod + (ab.isSaveProf ? prof : 0);
            return (
              <button
                key={`save-${ab.abbr}`}
                onClick={() => rollCheck(`${ab.label} Saving Throw`, saveBonus)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                  ab.isSaveProf
                    ? 'bg-[rgba(239,68,68,0.18)] border-red-500/50 text-rose-100 font-bold hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-black/40 border-red-950/40 text-rose-200/50 hover:border-red-500/30'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {ab.isSaveProf && <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" />}
                  {ab.label}
                </span>
                <span className={`font-bold ${ab.isSaveProf ? 'text-red-400' : 'text-rose-200/50'}`}>
                  {saveBonus >= 0 ? `+${saveBonus}` : saveBonus}
                </span>
              </button>
            );
          })}
        </div>
      </SpotlightCard>

      {/* ============== 4. SKILLS MATRIX & NOBLE TRAITS ============== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Column */}
        <SpotlightCard className="p-5 glass-card border border-red-500/40 bg-[linear-gradient(135deg,rgba(35,10,18,0.96)_0%,rgba(16,4,8,0.98)_100%)] shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-500/25">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-red-400" />
              <h3 className="text-sm font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Skills &amp; Proficiencies
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Checkbox toggles proficiency</span>
          </div>

          <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
            {SKILL_LIST.map((sk) => {
              const mod = getModifier(wynel.abilityScores[sk.ability]);
              const isProf = wynel.skillProficiencies.includes(sk.name);
              const bonus = mod + (isProf ? prof : 0);

              return (
                <div
                  key={sk.name}
                  onClick={() => rollCheck(`${sk.name} (${sk.ability}) Check`, bonus)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                    isProf
                      ? 'bg-[rgba(239,68,68,0.15)] border-red-500/40 text-rose-100 hover:bg-red-950/60 font-semibold'
                      : 'bg-black/30 border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkillProficiency(sk.name);
                      }}
                      className="p-0.5 text-red-400 hover:text-rose-200 cursor-pointer"
                      title={isProf ? 'Remove proficiency' : 'Add proficiency'}
                    >
                      {isProf ? (
                        <CheckSquare size={14} className="text-red-400" />
                      ) : (
                        <Square size={14} className="text-zinc-600" />
                      )}
                    </button>
                    <span>{sk.name}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">({sk.ability})</span>
                  </div>

                  <span className={`font-bold font-mono ${isProf ? 'text-red-400' : 'text-zinc-500'}`}>
                    {bonus >= 0 ? `+${bonus}` : bonus}
                  </span>
                </div>
              );
            })}
          </div>
        </SpotlightCard>

        {/* Features, Senses & Languages Column */}
        <SpotlightCard className="p-5 glass-card border border-red-500/40 bg-[linear-gradient(135deg,rgba(35,10,18,0.96)_0%,rgba(16,4,8,0.98)_100%)] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-500/25">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Racial &amp; Noble Traits
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Half-Elf Noble</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-red-900/30">
              <div className="font-bold text-rose-200 font-serif mb-1 flex items-center gap-1.5">
                <Eye size={13} className="text-red-400" /> Darkvision (60 ft)
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-red-900/30">
              <div className="font-bold text-rose-200 font-serif mb-1 flex items-center gap-1.5">
                <Heart size={13} className="text-rose-400" /> Fey Ancestry
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Advantage on saving throws against being charmed, and magic cannot put you to sleep.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-red-900/30">
              <div className="font-bold text-rose-200 font-serif mb-1 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" /> Skill Versatility &amp; Position of Privilege
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                High-society noble peerage recognizes your House Aeluin bloodline. You can secure audiences with noble courts, guildmasters, and regional rulers.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-red-900/30 text-[11px] font-mono text-zinc-400 space-y-1">
            <div><strong className="text-rose-200">Languages:</strong> Common, Elven, Sylvan</div>
            <div><strong className="text-rose-200">Armor Proficiencies:</strong> Light Armor (Mage Armor at will)</div>
            <div><strong className="text-rose-200">Weapon Proficiencies:</strong> Simple Weapons, Rapiers</div>
          </div>
        </SpotlightCard>
      </div>

      {/* ============== 5. COMBAT STATS OVERRIDE MODAL ============== */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#19060b] border-2 border-red-500 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.4)] relative font-['Spectral',serif]">
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-rose-300/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-500/30">
              <Edit3 className="text-red-400" size={20} />
              <h2 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif]">
                Wyn’el Combat Stats Overrides
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1 font-bold">
                  Armor Class (AC)
                </label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-black/70 border border-red-500/40 rounded-xl p-2.5 text-white font-bold text-lg text-center focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1 font-bold">
                  Initiative Bonus
                </label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-black/70 border border-red-500/40 rounded-xl p-2.5 text-white font-bold text-lg text-center focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1 font-bold">
                  Speed (ft)
                </label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-black/70 border border-red-500/40 rounded-xl p-2.5 text-white font-bold text-lg text-center focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1 font-bold">
                  Proficiency Bonus
                </label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-black/70 border border-red-500/40 rounded-xl p-2.5 text-white font-bold text-lg text-center focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-red-500/30">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-rose-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Check size={14} /> Save Overrides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
