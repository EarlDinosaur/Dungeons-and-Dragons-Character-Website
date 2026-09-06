'use client';

import { useState } from 'react';
import { Shield, Eye, Flame, Sparkles, Star, Swords, Dices, RotateCcw, Edit3, Check, CheckSquare, Square } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CyrusState } from '@/lib/cyrus-engine';
import { getProficiencyBonus } from '@/lib/cyrus-engine';
import { getModifier } from '@/lib/character-engine';
import { useCharacter } from '@/app/providers';

interface CyrusStatBlockProps {
  cyrus: CyrusState;
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

export default function CyrusStatBlock({ cyrus }: CyrusStatBlockProps) {
  const { updateAbilityBaseScore, toggleSkillProficiency } = useCharacter();
  const prof = getProficiencyBonus(cyrus.level);

  const [isEditingScores, setIsEditingScores] = useState(false);

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

  const abilities = (['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((ab) => ({
    abbr: ab,
    label: ABILITY_LABELS[ab],
    score: cyrus.abilityScores[ab],
    mod: getModifier(cyrus.abilityScores[ab]),
    isSaveProf: cyrus.savingThrowProficiencies.includes(ab),
  }));

  const currentSkills = cyrus.skills && cyrus.skills.length > 0
    ? cyrus.skills
    : SKILL_LIST.map((s) => ({
        name: s.name,
        ability: s.ability,
        proficient: cyrus.skillProficiencies.includes(s.name),
        expertise: false,
      }));

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ============== D20 INTERACTIVE ROLLER FEEDBACK CARD ============== */}
      {(isRolling || activeCheckRoll) && (
        <SpotlightCard className="p-5 border-2 border-[#daa520] bg-[linear-gradient(135deg,rgba(35,28,10,0.98)_0%,rgba(18,14,6,0.98)_100%)] text-center relative overflow-hidden shadow-[0_0_30px_rgba(218,165,32,0.3)] animate-fade-in-up">
          {isRolling ? (
            <div className="py-4 flex items-center justify-center gap-3">
              <Dices size={30} className="text-[#daa520] animate-spin" />
              <span className="text-sm font-bold text-amber-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Consulting the Solar Oracles of Apollo...
              </span>
            </div>
          ) : activeCheckRoll ? (
            <div className="flex items-center justify-between gap-4 font-mono">
              <div className="text-left">
                <span className="text-[10px] text-[#b89d5e] uppercase tracking-widest block font-bold">
                  {activeCheckRoll.label} Check Result
                </span>
                <span className="text-3xl font-extrabold font-['Cormorant_Garamond',serif] text-amber-100">
                  {activeCheckRoll.total}
                </span>
                <span className="text-[11px] text-amber-200/60 ml-2">
                  (d20: {activeCheckRoll.d20} {activeCheckRoll.modifier >= 0 ? `+ ${activeCheckRoll.modifier}` : `- ${Math.abs(activeCheckRoll.modifier)}`})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeCheckRoll.isNat20 && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400">
                    🌟 NATURAL 20!
                  </span>
                )}
                {activeCheckRoll.isNat1 && (
                  <span className="text-xs font-bold text-red-300 bg-red-950/80 px-3 py-1 rounded-full border border-red-500">
                    ⚠️ NATURAL 1!
                  </span>
                )}

                <button
                  onClick={() => setActiveCheckRoll(null)}
                  className="p-1.5 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Roll Result"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          ) : null}
        </SpotlightCard>
      )}

      {/* ============== ABILITY SCORES ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#daa520]/25">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-[#daa520]" />
            <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Ability Scores &amp; Checks
            </h3>
          </div>
          <button
            onClick={() => setIsEditingScores(!isEditingScores)}
            className="text-[10px] font-mono text-[#daa520] hover:text-white flex items-center gap-1 cursor-pointer bg-black/60 px-2 py-0.5 rounded border border-[#daa520]/30"
          >
            {isEditingScores ? <Check size={12} /> : <Edit3 size={12} />}
            {isEditingScores ? 'Done' : 'Edit Scores'}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {abilities.map((ab) => (
            <div
              key={ab.abbr}
              className={`relative p-3 rounded-xl text-center border transition-all ${
                ab.abbr === 'CHA' || ab.abbr === 'WIS'
                  ? 'bg-[rgba(218,165,32,0.12)] border-[#daa520]/40 shadow-[0_0_15px_rgba(218,165,32,0.15)]'
                  : 'bg-black/50 border-white/10'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#b89d5e] mb-1">
                {ab.abbr}
              </span>

              <button
                onClick={() => rollCheck(`${ab.label} (${ab.abbr})`, ab.mod)}
                className="text-3xl font-bold font-['Cormorant_Garamond',serif] text-amber-100 block leading-none hover:scale-110 transition-transform cursor-pointer w-full"
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
                  className="w-12 bg-black/80 border border-[#daa520] rounded text-xs font-mono text-amber-200 text-center mt-1 focus:outline-none"
                />
              ) : (
                <span className="text-[11px] font-mono text-amber-200/60 mt-1 block">
                  {ab.score}
                </span>
              )}

              {ab.isSaveProf && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#daa520] rounded-full flex items-center justify-center shadow-md" title="Save Proficiency">
                  <Shield size={9} className="text-black" />
                </div>
              )}
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* ============== SAVING THROWS ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#daa520]/25">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#daa520]" />
            <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Saving Throws
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#b89d5e]">Click to roll Saving Throw</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {abilities.map((ab) => {
            const saveBonus = ab.mod + (ab.isSaveProf ? prof : 0);
            return (
              <button
                key={`save-${ab.abbr}`}
                onClick={() => rollCheck(`${ab.label} Saving Throw`, saveBonus)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all hover:-translate-y-0.5 ${
                  ab.isSaveProf
                    ? 'bg-[rgba(218,165,32,0.10)] border-[#daa520]/30 text-amber-200 hover:border-[#daa520]'
                    : 'bg-black/40 border-white/5 text-amber-200/50 hover:border-amber-400/30'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {ab.isSaveProf && <span className="w-2 h-2 bg-[#daa520] rounded-full" />}
                  {ab.label}
                </span>
                <span className={`font-bold ${ab.isSaveProf ? 'text-[#daa520]' : 'text-amber-200/50'}`}>
                  {saveBonus >= 0 ? `+${saveBonus}` : saveBonus}
                </span>
              </button>
            );
          })}
        </div>
      </SpotlightCard>

      {/* ============== SKILLS (Interactive Proficiency / Expertise Toggle) ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#daa520]/25">
          <Eye size={18} className="text-[#daa520]" />
          <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
            Skills
          </h3>
          <span className="text-[10px] font-mono text-[#b89d5e] ml-auto">
            Click dot to toggle proficiency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
          {currentSkills.map((sk) => {
            const isProf = sk.proficient;
            const isExp = sk.expertise;
            const mod = getModifier(cyrus.abilityScores[sk.ability as keyof typeof cyrus.abilityScores] || 10);
            const bonus = mod + (isExp ? prof * 2 : isProf ? prof : 0);

            return (
              <div
                key={sk.name}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all ${
                  isProf
                    ? 'bg-[rgba(218,165,32,0.08)] border-[#daa520]/20 text-amber-200 hover:border-[#daa520]'
                    : 'bg-transparent border-transparent text-amber-200/40 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSkillProficiency(sk.name)}
                    className="text-[#daa520] hover:scale-125 transition-transform cursor-pointer"
                    title="Click to cycle: Unproficient -> Proficient -> Expertise"
                  >
                    {isExp ? (
                      <span className="text-xs">⭐</span>
                    ) : isProf ? (
                      <CheckSquare size={13} className="text-[#daa520]" />
                    ) : (
                      <Square size={13} className="text-amber-200/30" />
                    )}
                  </button>
                  <span className={isProf ? 'text-amber-100 font-semibold' : 'text-amber-200/40'}>
                    {sk.name}
                    <span className="text-[9px] text-amber-200/30 ml-1">({sk.ability})</span>
                  </span>
                  {isExp && (
                    <span className="text-[9px] bg-[#daa520]/20 text-[#daa520] px-1 rounded font-mono font-bold">
                      EXP
                    </span>
                  )}
                </div>

                <button
                  onClick={() => rollCheck(`${sk.name} Skill`, bonus)}
                  className={`font-bold hover:text-white cursor-pointer ${isProf ? 'text-[#daa520]' : 'text-amber-200/40'}`}
                >
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </button>
              </div>
            );
          })}
        </div>
      </SpotlightCard>

      {/* ============== ATTACKS ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#daa520]/25">
          <Swords size={18} className="text-[#daa520]" />
          <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
            Attacks &amp; Weapons
          </h3>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Walking Cane (Quarterstaff)', mod: -1, atk: '+1', dmg: '1d6-1 Bludgeoning', type: 'melee' },
            { name: 'Dagger', mod: -1, atk: '+1', dmg: '1d4-1 Piercing', type: 'melee' },
            { name: 'Fire Bolt', mod: 5, atk: '+5', dmg: '1d10+3 Fire', type: 'spell' },
            { name: 'Sacred Flame', mod: 5, atk: 'DC13', dmg: '1d8 Radiant', type: 'spell' },
          ].map((weapon) => (
            <div
              key={weapon.name}
              onClick={() => rollCheck(`${weapon.name} Attack`, weapon.mod)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/50 border border-white/5 hover:border-[#daa520]/50 cursor-pointer transition-all text-xs font-mono group"
            >
              <div className="flex items-center gap-2">
                {weapon.type === 'spell' ? (
                  <Sparkles size={13} className="text-[#daa520]" />
                ) : (
                  <Swords size={13} className="text-amber-200/60" />
                )}
                <span className="text-amber-200 font-semibold group-hover:text-amber-300">{weapon.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#daa520] font-bold">{weapon.atk}</span>
                <span className="text-amber-200/70">{weapon.dmg}</span>
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* ============== FEATURES & TRAITS ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#daa520]/25">
          <Flame size={18} className="text-[#daa520]" />
          <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
            Features &amp; Traits
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cyrus.features.map((feature) => (
            <div
              key={feature.name}
              className={`p-3 rounded-xl border text-xs ${
                feature.name === 'Radiant Soul' || feature.name === 'Epiphany'
                  ? 'bg-[rgba(218,165,32,0.10)] border-[#daa520]/35 shadow-[0_0_10px_rgba(218,165,32,0.1)]'
                  : feature.name === 'Oracle Curse: Lame'
                    ? 'bg-[rgba(200,80,80,0.08)] border-red-900/30'
                    : 'bg-black/40 border-white/5'
              }`}
            >
              <h4 className="font-bold text-amber-200 text-sm font-['Cormorant_Garamond',serif] mb-1 flex items-center gap-1.5">
                {feature.name === 'Radiant Soul' && <span>✨</span>}
                {feature.name === 'Oracle Curse: Lame' && <span>🦯</span>}
                {feature.name === 'Healing Hands' && <span>🤲</span>}
                {feature.name === 'Epiphany' && <span>👁️</span>}
                {feature.name === 'Celestial Resistance' && <span>🛡️</span>}
                {feature.name === 'Darkvision' && <span>👀</span>}
                {feature.name === 'Blistering Caress' && <span>🔥</span>}
                {feature.name === 'Light Bearer' && <span>💡</span>}
                {feature.name === 'Court Functionary' && <span>🏛️</span>}
                {feature.name}
              </h4>
              <p className="text-amber-200/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
}
