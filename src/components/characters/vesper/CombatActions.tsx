'use client';

import { useState } from 'react';
import {
  Swords, Crosshair, ShieldAlert, Eye, EyeOff,
  Dices, Skull, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import { formatModifier, getAssassinFeatures, calculateDeathStrikeDC, getRogueFeatures } from '@/lib/character-engine';
import { getVestigeData } from '@/lib/orphans-tithe';
import type { CharacterState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCharacter } from '@/app/providers';

interface CombatActionsProps {
  character: CharacterState;
}

export default function CombatActions({ character }: CombatActionsProps) {
  const { showToastNotification } = useCharacter();
  const [showRollResult, setShowRollResult] = useState<{ value: number; type: string } | null>(null);

  const dexMod = character.abilityScores.DEX.modifier;
  const profBonus = character.proficiencyBonus;
  const assassinFeatures = getAssassinFeatures(character.level);
  const rogueFeatures = getRogueFeatures(character.level);
  const vestige = getVestigeData(character.level, character.orphansTithe.currentSouls);
  const deathStrikeDC = calculateDeathStrikeDC(dexMod, profBonus);

  const rollD20 = (type: string) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setShowRollResult({ value: roll, type });
    setTimeout(() => setShowRollResult(null), 3000);
  };

  const attackBonus = dexMod + profBonus + vestige.hitDmgBonus;

  return (
    <div className="space-y-6">
      {/* Roll Result Overlay */}
      {showRollResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-fade-in-up glass-card-crimson p-8 text-center glow-crimson">
            <p className="text-sm uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)] mb-2">
              {showRollResult.type}
            </p>
            <p className={cn(
              'text-6xl font-bold font-[family-name:var(--font-mono)]',
              showRollResult.value === 20 ? 'text-[var(--color-gold-bright)] text-glow-gold' :
              showRollResult.value === 1 ? 'text-[var(--color-crimson-500)] text-glow-crimson' :
              'text-[var(--color-parchment)]'
            )}>
              {showRollResult.value}
            </p>
            {showRollResult.value === 20 && (
              <p className="text-[var(--color-gold-400)] text-sm mt-1 font-[family-name:var(--font-heading)]">NATURAL 20!</p>
            )}
            {showRollResult.value === 1 && (
              <p className="text-[var(--color-crimson-400)] text-sm mt-1 font-[family-name:var(--font-heading)]">CRITICAL FAIL!</p>
            )}
          </div>
        </div>
      )}

      {/* Attack Actions */}
      <div>
        <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
          <Swords size={18} />
          Attack Actions
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* The Orphan's Tithe */}
          <SpotlightCard className="p-4" spotlightColor="rgba(220, 38, 38, 0.08)">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold text-sm">
                  The Orphan&apos;s Tithe
                </h3>
                <p className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
                  Vestige Dagger • Finesse • Light
                </p>
              </div>
              <button
                onClick={() => rollD20('Attack Roll')}
                className="btn btn-crimson btn-sm"
                id="roll-attack"
              >
                <Dices size={12} />
                Roll
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
                <span className="text-[var(--color-parchment-dim)]">To Hit</span>
                <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-crimson-400)]">
                  {formatModifier(attackBonus)}
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
                <span className="text-[var(--color-parchment-dim)]">Damage</span>
                <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-parchment)]">
                  1d4{formatModifier(dexMod + vestige.hitDmgBonus)}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Shortsword */}
          <SpotlightCard className="p-4" spotlightColor="rgba(255, 255, 255, 0.04)">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-parchment)] font-semibold text-sm">
                  Shortsword
                </h3>
                <p className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
                  Martial • Finesse • Light
                </p>
              </div>
              <button
                onClick={() => rollD20('Attack Roll')}
                className="btn btn-ghost btn-sm"
              >
                <Dices size={12} />
                Roll
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
                <span className="text-[var(--color-parchment-dim)]">To Hit</span>
                <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-parchment)]">
                  {formatModifier(dexMod + profBonus)}
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
                <span className="text-[var(--color-parchment-dim)]">Damage</span>
                <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-parchment)]">
                  1d6{formatModifier(dexMod)}
                </span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Sneak Attack */}
      <SpotlightCard className="p-4" spotlightColor="rgba(220, 38, 38, 0.06)">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-[var(--color-crimson-500)]" />
            <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold">
              Sneak Attack
            </h3>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-crimson-400)]">
            {character.sneakAttackDice}d6
          </span>
        </div>
        {/* Visual dice */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: character.sneakAttackDice }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-crimson-800)] to-[var(--color-crimson-950)] border border-[rgba(220,38,38,0.3)] flex items-center justify-center text-xs font-[family-name:var(--font-mono)] text-[var(--color-crimson-300)] animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              d6
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-parchment-dim)] mt-2">
          Once per turn when you hit with an attack and have advantage, or an ally is within 5ft of the target.
        </p>
      </SpotlightCard>

      {/* Cunning Action */}
      {character.level >= 2 && (
        <div>
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
            <Crosshair size={18} />
            Cunning Action
            <span className="text-xs text-[var(--color-parchment-dim)] font-normal">(Bonus Action)</span>
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Dash', icon: <Crosshair size={14} />, desc: 'Double your speed this turn.' },
              { name: 'Disengage', icon: <ShieldAlert size={14} />, desc: 'Move without provoking opportunity attacks.' },
              { name: 'Hide', icon: <EyeOff size={14} />, desc: 'Make a Stealth check to become hidden.' },
            ].map((action) => (
              <div key={action.name} className="glass-card p-3 text-center hover:glow-gold transition-shadow cursor-default">
                <div className="text-[var(--color-gold-400)] mb-1 flex justify-center">{action.icon}</div>
                <p className="text-xs font-[family-name:var(--font-heading)] font-semibold text-[var(--color-parchment)] uppercase tracking-wider">
                  {action.name}
                </p>
                <p className="text-[10px] text-[var(--color-parchment-dim)] mt-1">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assassin Features */}
      <div>
        <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
          <Skull size={18} />
          Assassin Features
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h2>

        <div className="space-y-2">
          {assassinFeatures.map((feature) => (
            <SpotlightCard
              key={feature.name}
              className={cn('p-4', !feature.unlocked && 'opacity-40')}
              spotlightColor={feature.unlocked ? 'rgba(220, 38, 38, 0.06)' : 'rgba(255,255,255,0.02)'}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {feature.unlocked ? (
                    <Unlock size={14} className="text-[var(--color-gold-400)]" />
                  ) : (
                    <Lock size={14} className="text-[var(--color-parchment-dim)]" />
                  )}
                  <h3 className={cn(
                    'font-[family-name:var(--font-heading)] font-semibold text-sm',
                    feature.unlocked ? 'text-[var(--color-crimson-400)]' : 'text-[var(--color-parchment-dim)]'
                  )}>
                    {feature.name}
                  </h3>
                </div>
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded">
                  Lv {feature.level}
                </span>
              </div>
              <p className="text-xs text-[var(--color-parchment-muted)] mb-2">{feature.description}</p>
              <div className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-gold-400)] bg-[rgba(255,215,0,0.05)] p-2 rounded">
                {feature.mechanics}
                {feature.name === 'Death Strike' && feature.unlocked && (
                  <span className="ml-2 text-[var(--color-crimson-400)]">
                    (DC {deathStrikeDC})
                  </span>
                )}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Rogue Features */}
      <div>
        <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
          <Eye size={18} />
          Rogue Features
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h2>

        <div className="flex flex-wrap gap-2">
          {rogueFeatures.map((feature) => (
            <span
              key={feature}
              className="text-xs font-[family-name:var(--font-mono)] bg-[rgba(255,215,0,0.08)] text-[var(--color-gold-300)] px-3 py-1.5 rounded-full border border-[rgba(255,215,0,0.12)]"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Drawbacks Warning */}
      {character.orphansTithe.phantomMurmursActive && (
        <div className="glass-card-crimson p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[var(--color-crimson-500)]" />
            <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold text-sm">
              Phantom Murmurs Active
            </h3>
          </div>
          <ul className="text-xs text-[var(--color-crimson-300)] space-y-1">
            <li>• Disadvantage on hearing-based Perception checks</li>
            <li>• -2 penalty to Initiative ({formatModifier(character.initiative)})</li>
          </ul>
        </div>
      )}
    </div>
  );
}
