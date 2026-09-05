'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Dices, RotateCcw } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import { formatModifier } from '@/lib/character-engine';
import type { CharacterState } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  const statsRef = useRef<HTMLDivElement>(null);

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

  const abilities = Object.values(character.abilityScores);

  return (
    <div className="space-y-6">
      {/* ============== D20 INTERACTIVE ROLLER FEEDBACK CARD ============== */}
      {(isRolling || activeCheckRoll) && (
        <SpotlightCard className="p-5 border-2 border-[var(--color-crimson-500)] bg-[linear-gradient(135deg,rgba(30,10,12,0.98)_0%,rgba(15,5,6,0.98)_100%)] text-center relative overflow-hidden shadow-[0_0_30px_rgba(200,40,40,0.3)] animate-fade-in-up">
          {isRolling ? (
            <div className="py-4 flex items-center justify-center gap-3">
              <Dices size={30} className="text-[var(--color-crimson-400)] animate-spin" />
              <span className="text-sm font-bold text-[var(--color-parchment)] font-[family-name:var(--font-heading)] uppercase tracking-wider">
                Rolling d20 check for Vesper Ashwood...
              </span>
            </div>
          ) : activeCheckRoll ? (
            <div className="flex items-center justify-between gap-4 font-[family-name:var(--font-mono)]">
              <div className="text-left">
                <span className="text-[10px] text-[var(--color-parchment-dim)] uppercase tracking-widest block font-bold">
                  {activeCheckRoll.label} Check Result
                </span>
                <span className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[var(--color-gold-bright)] text-glow-gold">
                  {activeCheckRoll.total}
                </span>
                <span className="text-[11px] text-[var(--color-parchment-muted)] ml-2">
                  (d20: {activeCheckRoll.d20} {activeCheckRoll.modifier >= 0 ? `+ ${activeCheckRoll.modifier}` : `- ${Math.abs(activeCheckRoll.modifier)}`})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeCheckRoll.isNat20 && (
                  <span className="text-xs font-bold text-[var(--color-gold-bright)] bg-amber-950/90 px-3 py-1 rounded-full border border-[var(--color-gold-400)] shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                    💀 CRITICAL HIT (Natural 20)!
                  </span>
                )}
                {activeCheckRoll.isNat1 && (
                  <span className="text-xs font-bold text-red-300 bg-red-950/90 px-3 py-1 rounded-full border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    ⚠️ CRITICAL FAIL (Natural 1)!
                  </span>
                )}

                <button
                  onClick={() => setActiveCheckRoll(null)}
                  className="p-1.5 rounded-lg text-[var(--color-parchment-dim)] hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Roll Result"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          ) : null}
        </SpotlightCard>
      )}

      {/* Ability Scores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2 flex-1">
            <span className="w-8 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
            Ability Scores
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
            Click card to roll d20 Check
          </span>
        </div>

        <div ref={statsRef} className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {abilities.map((ability) => (
            <SpotlightCard
              key={ability.name}
              className="stat-card !p-0 cursor-pointer group transition-transform hover:scale-[1.03] active:scale-95"
              spotlightColor={ABILITY_COLORS[ability.name]}
            >
              <button
                onClick={() => rollCheck(`${ability.label} (${ability.name})`, ability.modifier)}
                className="w-full flex flex-col items-center p-4 rounded-xl text-center focus:outline-none cursor-pointer"
                style={{
                  background: ABILITY_COLORS[ability.name],
                  borderColor: ABILITY_BORDER_COLORS[ability.name],
                }}
              >
                <span className="text-[10px] uppercase tracking-[0.15em] font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)] mb-1 group-hover:text-[var(--color-gold-400)] transition-colors">
                  {ability.name}
                </span>
                <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)] group-hover:scale-110 transition-transform">
                  {formatModifier(ability.modifier)}
                </span>
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mt-2 group-hover:border-[var(--color-gold-400)] transition-colors"
                     style={{ borderColor: ABILITY_BORDER_COLORS[ability.name] }}>
                  <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--color-parchment-muted)]">
                    {ability.total}
                  </span>
                </div>
              </button>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Saving Throws */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2 flex-1">
            <span className="w-8 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
            Saving Throws
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
            Click to roll Saving Throw
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {abilities.map((ability) => (
            <button
              key={`save-${ability.name}`}
              onClick={() => rollCheck(`${ability.label} Saving Throw`, ability.saveBonus)}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer hover:-translate-y-0.5 active:scale-95',
                ability.saveProficient
                  ? 'bg-[rgba(255,215,0,0.08)] border border-[rgba(255,215,0,0.25)] hover:border-[var(--color-gold-400)]'
                  : 'bg-[rgba(255,255,255,0.02)] border border-transparent hover:bg-[rgba(255,255,255,0.06)] hover:border-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  ability.saveProficient ? 'bg-[var(--color-gold-500)] shadow-[0_0_8px_var(--color-gold-400)]' : 'bg-[rgba(255,255,255,0.1)]'
                )} />
                <span className="text-sm text-[var(--color-parchment-muted)]">{ability.label}</span>
              </div>
              <span className={cn(
                'font-[family-name:var(--font-mono)] text-sm font-semibold',
                ability.saveProficient ? 'text-[var(--color-gold-400)]' : 'text-[var(--color-parchment-dim)]'
              )}>
                {formatModifier(ability.saveBonus)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2 flex-1">
            <span className="w-8 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
            Skills
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
            Click to roll Skill Check
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {character.skills.map((skill) => (
            <button
              key={skill.name}
              onClick={() => rollCheck(`${skill.name} Skill`, skill.bonus)}
              className={cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg transition-all text-sm text-left cursor-pointer hover:-translate-y-0.5 active:scale-95',
                skill.expertise
                  ? 'bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.3)] hover:border-[var(--color-arcane-400)]'
                  : skill.proficient
                  ? 'bg-[rgba(255,215,0,0.08)] border border-[rgba(255,215,0,0.2)] hover:border-[var(--color-gold-400)]'
                  : 'border border-transparent hover:bg-[rgba(255,255,255,0.05)] hover:border-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                {/* Proficiency indicator */}
                <div className="flex items-center gap-0.5">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    skill.expertise
                      ? 'bg-[var(--color-arcane-500)]'
                      : skill.proficient
                      ? 'bg-[var(--color-gold-500)]'
                      : 'bg-[rgba(255,255,255,0.08)]'
                  )} />
                  {skill.expertise && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-arcane-500)]" />
                  )}
                </div>
                <span className={cn(
                  skill.proficient ? 'text-[var(--color-parchment)]' : 'text-[var(--color-parchment-dim)]'
                )}>
                  {skill.name}
                </span>
                <span className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
                  ({skill.ability})
                </span>
              </div>
              <span className={cn(
                'font-[family-name:var(--font-mono)] font-semibold',
                skill.expertise
                  ? 'text-[var(--color-arcane-400)]'
                  : skill.proficient
                  ? 'text-[var(--color-gold-400)]'
                  : 'text-[var(--color-parchment-dim)]'
              )}>
                {formatModifier(skill.bonus)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--color-parchment-dim)] uppercase tracking-wider font-[family-name:var(--font-heading)]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-gold-500)]" />
            Proficient
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-arcane-500)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-arcane-500)]" />
            Expertise
          </div>
        </div>
      </div>

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
