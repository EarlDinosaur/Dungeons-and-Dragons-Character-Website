'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Dices, RotateCcw, Edit2, Check, X, Shield, Sparkles, Flame } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import { formatModifier } from '@/lib/character-engine';
import type { CharacterState, AbilityName, SkillName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCharacter } from '@/app/providers';

interface StatBlockProps {
  character: CharacterState;
}

const ABILITY_COLORS: Record<string, string> = {
  STR: 'rgba(239, 68, 68, 0.15)',
  DEX: 'rgba(34, 197, 94, 0.15)',
  CON: 'rgba(249, 115, 22, 0.15)',
  INT: 'rgba(59, 130, 246, 0.15)',
  WIS: 'rgba(168, 85, 247, 0.15)',
  CHA: 'rgba(236, 72, 153, 0.15)',
};

const ABILITY_BORDER_COLORS: Record<string, string> = {
  STR: 'rgba(239, 68, 68, 0.3)',
  DEX: 'rgba(34, 197, 94, 0.3)',
  CON: 'rgba(249, 115, 22, 0.3)',
  INT: 'rgba(59, 130, 246, 0.3)',
  WIS: 'rgba(168, 85, 247, 0.3)',
  CHA: 'rgba(236, 72, 153, 0.3)',
};

export default function StatBlock({ character }: StatBlockProps) {
  const { updateAbilityBaseScore, toggleSkillProficiency } = useCharacter();
  const statsRef = useRef<HTMLDivElement>(null);

  // Edit Mode for Base Ability Scores
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [draftScores, setDraftScores] = useState<Record<AbilityName, number>>({
    STR: character.abilityScores.STR.base,
    DEX: character.abilityScores.DEX.base,
    CON: character.abilityScores.CON.base,
    INT: character.abilityScores.INT.base,
    WIS: character.abilityScores.WIS.base,
    CHA: character.abilityScores.CHA.base,
  });

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

  useEffect(() => {
    if (statsRef.current) {
      const cards = statsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.4)' }
      );
    }
  }, [character.level]);

  const handleStartEditScores = () => {
    setDraftScores({
      STR: character.abilityScores.STR.base,
      DEX: character.abilityScores.DEX.base,
      CON: character.abilityScores.CON.base,
      INT: character.abilityScores.INT.base,
      WIS: character.abilityScores.WIS.base,
      CHA: character.abilityScores.CHA.base,
    });
    setIsEditingScores(true);
  };

  const handleSaveScores = () => {
    for (const name of Object.keys(draftScores) as AbilityName[]) {
      if (draftScores[name] !== character.abilityScores[name].base) {
        updateAbilityBaseScore(name, draftScores[name]);
      }
    }
    setIsEditingScores(false);
  };

  const abilities = Object.values(character.abilityScores);

  return (
    <div className="space-y-6">
      {/* ============== D20 INTERACTIVE ROLLER CENTERED SCREEN MODAL ============== */}
      {(isRolling || activeCheckRoll) && (
        <div
          onClick={() => { if (!isRolling) setActiveCheckRoll(null); }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-6 border-2 border-[var(--color-gold-400)] bg-[var(--color-surface)] text-center relative max-w-md w-full shadow-2xl rounded-2xl animate-scale-up"
          >
            <button
              onClick={() => setActiveCheckRoll(null)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Close Roll Result"
            >
              <X size={20} />
            </button>

            {isRolling ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <Dices size={44} className="text-[var(--color-gold-400)] animate-spin" />
                <span className="text-sm font-bold text-[var(--color-parchment)] font-[family-name:var(--font-heading)] uppercase tracking-wider">
                  Rolling d20 check for {character.name}...
                </span>
              </div>
            ) : activeCheckRoll ? (
              <div className="space-y-4 font-[family-name:var(--font-mono)]">
                <div className="border-b border-[rgba(255,215,0,0.2)] pb-3">
                  <span className="text-xs text-[var(--color-parchment-dim)] uppercase tracking-widest block font-bold font-[family-name:var(--font-heading)] mb-1">
                    {activeCheckRoll.label} Check Result
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-extrabold font-[family-name:var(--font-heading)] text-[var(--color-gold-bright)] text-glow-gold">
                      {activeCheckRoll.total}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-parchment-muted)] mt-2">
                    (d20 Roll: <strong>{activeCheckRoll.d20}</strong> {activeCheckRoll.modifier >= 0 ? `+ Modifier: ${activeCheckRoll.modifier}` : `- Modifier: ${Math.abs(activeCheckRoll.modifier)}`})
                  </p>
                </div>

                {activeCheckRoll.isNat20 && (
                  <div className="p-3 bg-amber-950/80 border border-[var(--color-gold-400)] rounded-xl text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                    <Sparkles size={16} /> NATURAL 20! CRITICAL SUCCESS!
                  </div>
                )}
                {activeCheckRoll.isNat1 && (
                  <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    ⚠️ NATURAL 1! CRITICAL FAIL!
                  </div>
                )}

                <button
                  onClick={() => setActiveCheckRoll(null)}
                  className="btn btn-gold btn-sm w-full text-xs py-2 mt-2 font-bold cursor-pointer"
                >
                  Dismiss Result
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ============== 1. ABILITY SCORES & CHECKS CARD ============== */}
      <SpotlightCard className="p-5 glass-card border-2 border-[var(--color-crimson-500)]/40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.12)_0%,transparent_70%),linear-gradient(145deg,rgba(26,14,18,0.98)_0%,rgba(12,6,8,0.99)_100%)] shadow-[0_12px_40px_rgba(220,38,38,0.2)] rounded-2xl relative overflow-hidden">
        {/* Corner Filigrees */}
        <span className="medieval-corner tl text-[var(--color-crimson-400)]/60">❖</span>
        <span className="medieval-corner tr text-[var(--color-crimson-400)]/60">❖</span>
        <span className="medieval-corner bl text-[var(--color-crimson-400)]/60">❖</span>
        <span className="medieval-corner br text-[var(--color-crimson-400)]/60">❖</span>

        {/* Inner Hairline Border */}
        <div className="absolute inset-[5px] border border-[var(--color-crimson-500)]/20 rounded-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-crimson-500)]/25">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[var(--color-crimson-400)]" />
              <h3 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Ability Scores &amp; Checks
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {!isEditingScores ? (
                <button
                  onClick={handleStartEditScores}
                  className="text-xs font-mono text-[var(--color-gold-400)] bg-black/60 hover:bg-[#1e0a0e] border border-[var(--color-crimson-500)]/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Edit2 size={12} /> Edit Scores
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveScores}
                    className="btn btn-gold btn-sm text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingScores(false)}
                    className="p-1 text-[var(--color-parchment-dim)] hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div ref={statsRef} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {abilities.map((ability) => {
              const isKeyStat = ability.name === 'DEX' || ability.name === 'INT';
              return (
                <div
                  key={ability.name}
                  className={`stat-card relative p-3 rounded-xl text-center border transition-all ${
                    isKeyStat
                      ? 'bg-[rgba(220,38,38,0.14)] border-[var(--color-crimson-500)]/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                      : 'bg-black/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-crimson-300)] mb-1 font-bold">
                    {ability.name}
                  </span>

                  <button
                    onClick={() => !isEditingScores && rollCheck(`${ability.label} (${ability.name}) Check`, ability.modifier)}
                    className="text-3xl font-bold font-['Cormorant_Garamond',serif] text-rose-100 block leading-none hover:scale-110 transition-transform cursor-pointer w-full my-1"
                    title="Click to roll ability check"
                  >
                    {formatModifier(ability.modifier)}
                  </button>

                  {isEditingScores ? (
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={draftScores[ability.name]}
                      onChange={(e) =>
                        setDraftScores({
                          ...draftScores,
                          [ability.name]: Math.max(1, Math.min(30, Number(e.target.value))),
                        })
                      }
                      className="w-12 bg-black/90 border border-red-500 rounded text-xs font-mono text-rose-200 text-center mt-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-400 mx-auto"
                    />
                  ) : (
                    <span className="text-[11px] font-mono text-rose-200/60 mt-1 block font-bold">
                      {ability.total}
                    </span>
                  )}

                  {ability.saveProficient && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-crimson-600)] border border-red-400 rounded-full flex items-center justify-center shadow-md" title="Saving Throw Proficiency">
                      <Shield size={9} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SpotlightCard>

      {/* ============== 2. SAVING THROWS CARD ============== */}
      <SpotlightCard className="p-5 glass-card border border-[var(--color-crimson-500)]/30 bg-[linear-gradient(135deg,rgba(22,14,16,0.95)_0%,rgba(12,8,10,0.98)_100%)] shadow-md rounded-2xl relative overflow-hidden">
        {/* Corner Filigrees */}
        <span className="medieval-corner tl text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner tr text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner bl text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner br text-[var(--color-crimson-400)]/40">❖</span>

        {/* Inner Hairline Border */}
        <div className="absolute inset-[5px] border border-[var(--color-crimson-500)]/15 rounded-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-crimson-500)]/20">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[var(--color-crimson-400)]" />
              <h3 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Saving Throws
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-300/70">
              Click to roll Saving Throw
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {abilities.map((ability) => (
              <button
                key={`save-${ability.name}`}
                onClick={() => rollCheck(`${ability.label} Saving Throw`, ability.saveBonus)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer hover:-translate-y-0.5 active:scale-95 shadow-sm',
                  ability.saveProficient
                    ? 'bg-[rgba(220,38,38,0.18)] border border-[var(--color-crimson-500)]/60 hover:border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                    : 'bg-black/40 border border-white/5 hover:bg-black/60 hover:border-white/15'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold border transition-colors',
                    ability.saveProficient ? 'bg-[var(--color-crimson-500)] border-red-300 text-white shadow-[0_0_8px_#dc2626]' : 'bg-transparent border-stone-600'
                  )}>
                    {ability.saveProficient && '✓'}
                  </div>
                  <span className={cn(
                    'text-xs font-serif',
                    ability.saveProficient ? 'text-rose-100 font-bold' : 'text-[var(--color-parchment-muted)]'
                  )}>
                    {ability.label}
                  </span>
                </div>
                <span className={cn(
                  'font-mono text-sm font-bold',
                  ability.saveProficient ? 'text-amber-300' : 'text-[var(--color-parchment-dim)]'
                )}>
                  {formatModifier(ability.saveBonus)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SpotlightCard>

      {/* ============== 3. PROFICIENCIES & SKILLS CARD ============== */}
      <SpotlightCard className="p-5 glass-card border border-[var(--color-crimson-500)]/30 bg-[linear-gradient(135deg,rgba(22,14,16,0.95)_0%,rgba(12,8,10,0.98)_100%)] shadow-md rounded-2xl relative overflow-hidden">
        {/* Corner Filigrees */}
        <span className="medieval-corner tl text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner tr text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner bl text-[var(--color-crimson-400)]/40">❖</span>
        <span className="medieval-corner br text-[var(--color-crimson-400)]/40">❖</span>

        {/* Inner Hairline Border */}
        <div className="absolute inset-[5px] border border-[var(--color-crimson-500)]/15 rounded-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-crimson-500)]/20">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
                Skills &amp; Masteries
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-300/70">
              Tap dot to toggle &bull; Tap name to roll check
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {character.skills.map((skill) => (
              <div
                key={skill.name}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs text-left',
                  skill.expertise
                    ? 'bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.4)] hover:border-[var(--color-arcane-400)] shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                    : skill.proficient
                    ? 'bg-[rgba(220,38,38,0.12)] border border-[var(--color-crimson-500)]/40 hover:border-red-400'
                    : 'bg-black/30 border border-white/5 hover:bg-black/50 hover:border-white/10'
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Proficiency toggle button */}
                  <button
                    onClick={() => toggleSkillProficiency(skill.name)}
                    className="flex items-center gap-0.5 p-1 rounded hover:bg-white/10 cursor-pointer"
                    title="Toggle None -> Proficient -> Expertise"
                  >
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full border transition-colors flex items-center justify-center text-[8px] font-bold',
                      skill.expertise
                        ? 'bg-[var(--color-arcane-500)] border-[var(--color-arcane-400)] text-white shadow-[0_0_8px_#a855f7]'
                        : skill.proficient
                        ? 'bg-[var(--color-crimson-500)] border-red-400 text-white shadow-[0_0_8px_#dc2626]'
                        : 'border-stone-600 bg-transparent'
                    )}>
                      {skill.expertise ? '★' : skill.proficient ? '✓' : ''}
                    </div>
                  </button>

                  <button
                    onClick={() => rollCheck(`${skill.name} Skill Check`, skill.bonus)}
                    className="flex items-center gap-2 text-left truncate cursor-pointer flex-1 group"
                  >
                    <span className={cn(
                      'truncate font-serif text-xs group-hover:text-amber-200 transition-colors',
                      skill.expertise
                        ? 'text-purple-200 font-bold'
                        : skill.proficient
                        ? 'text-rose-100 font-bold'
                        : 'text-[var(--color-parchment-muted)]'
                    )}>
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      ({skill.ability})
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => rollCheck(`${skill.name} Skill Check`, skill.bonus)}
                  className={cn(
                    'font-mono font-bold text-xs cursor-pointer ml-2 px-2 py-0.5 rounded',
                    skill.expertise
                      ? 'text-purple-300 bg-purple-950/60 border border-purple-800'
                      : skill.proficient
                      ? 'text-amber-300 bg-red-950/60 border border-red-900'
                      : 'text-[var(--color-parchment-dim)]'
                  )}
                >
                  {formatModifier(skill.bonus)}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-crimson-500)]/20 text-[10px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-crimson-500)]" />
              Proficient (✓)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-arcane-500)]" />
              Expertise (★)
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Passive Perception */}
      <div className="glass-card p-3 flex items-center justify-between">
        <span className="text-sm text-[var(--color-parchment-muted)]">Passive Perception</span>
        <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-gold-400)]">
          {character.passivePerception}
        </span>
      </div>
    </div>
  );
}

