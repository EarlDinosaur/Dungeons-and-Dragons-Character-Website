'use client';

import { useRef, useEffect } from 'react';
import {
  Gem, Plus, Minus, Moon, AlertTriangle, Skull,
  Sword, Heart, Zap, EyeOff, Ghost, Target, Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import FloatingParticles from '../../ui/backgrounds/FloatingParticles';
import SpotlightCard from '../../ui/SpotlightCard';
import GlowButton from '../../ui/GlowButton';
import { useToast } from '../../ui/ToastNotification';
import {
  getVestigeData,
  getStageColor,
  isPhantomMurmursActive,
  getPhantomMurmursPenalties,
  longRestDecay,
} from '@/lib/orphans-tithe';
import type { CharacterState } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SoulHarvesterProps {
  character: CharacterState;
  onSoulsChange: (souls: number) => void;
  onLongRest: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sword: <Sword size={14} />,
  Skull: <Skull size={14} />,
  Heart: <Heart size={14} />,
  Zap: <Zap size={14} />,
  EyeOff: <EyeOff size={14} />,
  Ghost: <Ghost size={14} />,
  Target: <Target size={14} />,
};

export default function SoulHarvester({
  character,
  onSoulsChange,
  onLongRest,
}: SoulHarvesterProps) {
  const { showToast } = useToast();
  const counterRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const souls = character.orphansTithe.currentSouls;
  const vestige = getVestigeData(character.level, souls);
  const stageColor = getStageColor(vestige.stage);
  const murmursActive = isPhantomMurmursActive(souls, vestige.maxSouls);
  const murmursPenalties = getPhantomMurmursPenalties();
  const fillPercent = (souls / vestige.maxSouls) * 100;

  // Animate soul count changes
  useEffect(() => {
    if (counterRef.current) {
      gsap.fromTo(counterRef.current,
        { scale: 1.3, color: stageColor.primary },
        { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }
      );
    }
  }, [souls, stageColor.primary]);

  // Animate ring fill
  useEffect(() => {
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        '--soul-fill': `${fillPercent}%`,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [fillPercent]);

  const handleHarvest = () => {
    if (souls < vestige.maxSouls) {
      onSoulsChange(souls + 1);
    }
  };

  const handleSpend = () => {
    if (souls > 0) {
      onSoulsChange(souls - 1);
    }
  };

  const handleLongRest = () => {
    const decayed = longRestDecay(souls);
    onSoulsChange(decayed);
    onLongRest();
  };

  const particleColor = vestige.stage === 'exalted' ? 'gold' :
                         vestige.stage === 'awakened' ? 'arcane' : 'crimson';

  return (
    <div className="space-y-6 relative">
      {/* Background particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
        <FloatingParticles count={15} color={particleColor} />
      </div>

      {/* Artifact Title */}
      <div className="text-center">
        <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-glow-crimson"
            style={{ color: stageColor.primary }}>
          The Orphan&apos;s Tithe
        </h2>
        <p className="text-sm text-[var(--color-parchment-dim)] font-[family-name:var(--font-body)] italic">
          Scaling Vestige Dagger
        </p>
      </div>

      {/* Vestige Stage Indicator */}
      <div className="flex items-center justify-center gap-2">
        {(['dormant', 'awakened', 'exalted'] as const).map((stage, i) => {
          const isActive = vestige.stage === stage;
          const isPast = (['dormant', 'awakened', 'exalted'].indexOf(vestige.stage) > i);
          const color = getStageColor(stage);
          return (
            <div key={stage} className="flex items-center gap-2">
              {i > 0 && (
                <div className={cn(
                  'w-8 h-[2px] rounded',
                  isPast || isActive ? 'opacity-100' : 'opacity-20'
                )} style={{ backgroundColor: isPast || isActive ? color.primary : '#6b7280' }} />
              )}
              <div className={cn(
                'flex flex-col items-center gap-1',
                isActive ? 'scale-110' : isPast ? 'opacity-60' : 'opacity-30'
              )}>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive && 'animate-pulse-glow'
                  )}
                  style={{
                    borderColor: color.primary,
                    backgroundColor: isActive ? color.bg : 'transparent',
                    boxShadow: isActive ? `0 0 15px ${color.glow}` : 'none',
                  }}
                >
                  <Gem size={16} style={{ color: color.primary }} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-[family-name:var(--font-heading)]"
                      style={{ color: isActive ? color.primary : '#6b7280' }}>
                  {stage}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Soul Counter Ring */}
      <div className="flex flex-col items-center gap-4">
        <div
          ref={ringRef}
          className="soul-ring"
          style={{
            '--soul-color': stageColor.primary,
            '--soul-fill': `${fillPercent}%`,
            boxShadow: `0 0 30px ${stageColor.glow}`,
          } as React.CSSProperties}
        >
          <div className="relative z-10 text-center">
            <div ref={counterRef} className="text-4xl font-bold font-[family-name:var(--font-mono)]"
                 style={{ color: stageColor.primary }}>
              {souls}
            </div>
            <div className="text-xs text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
              / {vestige.maxSouls}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)] mt-1">
              Souls
            </div>
          </div>

          {/* Orbiting soul dots */}
          {Array.from({ length: souls }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: stageColor.primary,
                boxShadow: `0 0 6px ${stageColor.glow}`,
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                animation: `soul-orbit ${4 + i * 0.5}s linear infinite`,
                animationDelay: `${i * (6 / Math.max(souls, 1))}s`,
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSpend}
            disabled={souls <= 0}
            className="btn btn-crimson !rounded-full !w-12 !h-12 !p-0 disabled:opacity-30 disabled:cursor-not-allowed"
            id="spend-soul"
            aria-label="Spend a soul"
          >
            <Minus size={18} />
          </button>

          <button
            onClick={handleLongRest}
            className="btn btn-ghost flex items-center gap-2"
            id="long-rest"
          >
            <Moon size={14} />
            Long Rest
          </button>

          <button
            onClick={handleHarvest}
            disabled={souls >= vestige.maxSouls}
            className="btn !rounded-full !w-12 !h-12 !p-0 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${stageColor.primary}80, ${stageColor.primary}40)`,
              borderColor: stageColor.primary,
            }}
            id="harvest-soul"
            aria-label="Harvest a soul"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Weapon Stats */}
      <SpotlightCard className="p-4" spotlightColor={stageColor.bg}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-sm"
              style={{ color: stageColor.primary }}>
            Weapon Bonuses
          </h3>
          <span className="font-[family-name:var(--font-mono)] text-sm px-2 py-0.5 rounded"
                style={{
                  color: stageColor.primary,
                  backgroundColor: stageColor.bg,
                }}>
            +{vestige.hitDmgBonus}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block mb-1">To Hit</span>
            <span className="font-[family-name:var(--font-mono)] font-bold" style={{ color: stageColor.primary }}>
              +{vestige.hitDmgBonus}
            </span>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block mb-1">Damage</span>
            <span className="font-[family-name:var(--font-mono)] font-bold" style={{ color: stageColor.primary }}>
              +{vestige.hitDmgBonus}
            </span>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block mb-1">Stage</span>
            <span className="font-[family-name:var(--font-mono)] font-bold text-xs" style={{ color: stageColor.primary }}>
              {vestige.stageLabel}
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* Active Effects */}
      <div>
        <h3 className="text-sm font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-2 flex items-center gap-2">
          <Sparkles size={14} />
          Soul Effects
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h3>
        <div className="space-y-1.5">
          {vestige.effects.map((effect) => (
            <div
              key={effect.name}
              className={cn(
                'flex items-start gap-3 px-3 py-2 rounded-lg transition-all',
                effect.active
                  ? 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'
                  : 'opacity-30'
              )}
            >
              <div className="mt-0.5" style={{ color: effect.active ? stageColor.primary : '#6b7280' }}>
                {ICON_MAP[effect.icon] || <Gem size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-sm font-semibold block',
                  effect.active ? 'text-[var(--color-parchment)]' : 'text-[var(--color-parchment-dim)]'
                )}>
                  {effect.name}
                </span>
                <span className="text-[11px] text-[var(--color-parchment-dim)]">
                  {effect.description}
                </span>
              </div>
              <div className={cn(
                'w-2 h-2 rounded-full mt-1.5 shrink-0',
                effect.active ? 'animate-pulse-glow' : ''
              )} style={{ backgroundColor: effect.active ? stageColor.primary : '#4b5563' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Ultimate Ability */}
      <SpotlightCard
        className="p-4 !border-2"
        spotlightColor={`${stageColor.primary}15`}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(to right, transparent, ${stageColor.primary}, transparent)` }}
        />
        <div className="flex items-center gap-2 mb-2">
          <Skull size={16} style={{ color: stageColor.primary }} />
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm"
              style={{ color: stageColor.primary }}>
            {vestige.ultimate.name}
          </h3>
          <span className="ml-auto text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded"
                style={{
                  color: stageColor.primary,
                  backgroundColor: stageColor.bg,
                  borderColor: `${stageColor.primary}30`,
                }}>
            Cost: {vestige.ultimate.soulCost} souls
          </span>
        </div>
        <p className="text-xs text-[var(--color-parchment-muted)] mb-2 italic">
          {vestige.ultimate.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[rgba(255,255,255,0.03)] rounded p-2">
            <span className="text-[var(--color-parchment-dim)] block text-[10px]">Range</span>
            <span className="font-[family-name:var(--font-mono)]" style={{ color: stageColor.primary }}>
              {vestige.ultimate.range}
            </span>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded p-2">
            <span className="text-[var(--color-parchment-dim)] block text-[10px]">Damage</span>
            <span className="font-[family-name:var(--font-mono)]" style={{ color: stageColor.primary }}>
              {vestige.ultimate.damage}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[var(--color-parchment-dim)] mt-2 bg-[rgba(255,255,255,0.02)] rounded p-2">
          {vestige.ultimate.effect}
        </p>
        <button
          disabled={souls < vestige.ultimate.soulCost}
          onClick={() => onSoulsChange(souls - vestige.ultimate.soulCost)}
          className="btn w-full mt-3 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${stageColor.primary}60, ${stageColor.primary}30)`,
            borderColor: `${stageColor.primary}50`,
            color: stageColor.primary,
          }}
          id="use-ultimate"
        >
          <Skull size={14} />
          Unleash {vestige.ultimate.name}
        </button>
      </SpotlightCard>

      {/* Drawbacks */}
      <div>
        <h3 className="text-sm font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] mb-2 flex items-center gap-2">
          <AlertTriangle size={14} />
          Drawbacks
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-crimson-800)] to-transparent" />
        </h3>

        <div className="space-y-2">
          {/* Phantom Murmurs */}
          <div className={cn(
            'glass-card-crimson p-3 transition-all',
            murmursActive ? 'opacity-100' : 'opacity-40'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-2 h-2 rounded-full', murmursActive ? 'bg-[var(--color-crimson-500)] animate-pulse-glow' : 'bg-[#4b5563]')} />
              <span className="text-xs font-[family-name:var(--font-heading)] font-semibold text-[var(--color-crimson-400)]">
                Phantom Murmurs
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)] ml-auto">
                {murmursActive ? 'ACTIVE' : 'INACTIVE'} (≥50% souls)
              </span>
            </div>
            <ul className="text-[11px] text-[var(--color-crimson-300)] space-y-0.5 pl-4">
              <li>• {murmursPenalties.perception}</li>
              <li>• {murmursPenalties.initiative} Initiative penalty</li>
            </ul>
          </div>

          {/* Altar Trauma */}
          <div className="glass-card-crimson p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-crimson-500)]" />
              <span className="text-xs font-[family-name:var(--font-heading)] font-semibold text-[var(--color-crimson-400)]">
                Altar Trauma
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-crimson-300)] ml-auto">
                PERMANENT
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-crimson-300)] pl-4">
              • Disadvantage on saves vs. Frightened/Charmed from Divine/Unholy spellcasters
            </p>
          </div>

          {/* Long Rest Decay */}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Moon size={12} className="text-[var(--color-parchment-dim)]" />
              <span className="text-xs font-[family-name:var(--font-heading)] font-semibold text-[var(--color-parchment-muted)]">
                Long Rest Soul Decay
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-parchment-dim)] pl-4">
              • Half of all stored souls decay (rounded down). Current: {souls} → {longRestDecay(souls)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
