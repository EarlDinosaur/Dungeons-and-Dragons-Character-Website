'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Gem, Plus, Minus, Moon, AlertTriangle, Skull,
  Sword, Heart, Zap, EyeOff, Ghost, Target, Sparkles, X, Dices
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

  // State for interactive attack & ultimate rolls
  const [includeSneak, setIncludeSneak] = useState(true);
  const [autoHarvestOnHit, setAutoHarvestOnHit] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [activeRollModal, setActiveRollModal] = useState<{
    type: 'attack' | 'ultimate';
    title: string;
    d20: number;
    totalToHit: number;
    isNat20: boolean;
    isNat1: boolean;
    baseDamageTotal: number;
    baseRolls: number[];
    sneakDamageTotal: number;
    sneakRolls: number[];
    tempHPGain: number;
    ultimateDamageTotal?: number;
    ultimateEffect?: string;
  } | null>(null);

  const dexMod = character.abilityScores.DEX.modifier;
  const profBonus = character.proficiencyBonus;
  const rogueLevel = character.classes?.find((c) => c.className === 'Rogue')?.level || character.level;
  const sneakDiceCount = character.sneakAttackDice || Math.ceil(rogueLevel / 2);

  const executeDaggerAttack = () => {
    setIsRolling(true);
    setActiveRollModal(null);

    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const isNat20 = d20 === 20;
      const isNat1 = d20 === 1;
      const totalToHit = d20 + dexMod + profBonus + vestige.hitDmgBonus;

      // Base dagger 1d4 + dexMod + vestige bonus
      let baseDiceCount = isNat20 ? 2 : 1;
      const baseRolls: number[] = [];
      let baseSum = 0;
      for (let i = 0; i < baseDiceCount; i++) {
        const r = Math.floor(Math.random() * 4) + 1;
        baseRolls.push(r);
        baseSum += r;
      }
      const baseDamageTotal = baseSum + dexMod + vestige.hitDmgBonus;

      // Sneak attack
      let sneakRolls: number[] = [];
      let sneakDamageTotal = 0;
      if (includeSneak && sneakDiceCount > 0) {
        const numSneakDice = isNat20 ? sneakDiceCount * 2 : sneakDiceCount;
        const maxDice = vestige.stage === 'exalted' && souls >= 9; // Reaper's Precision
        for (let i = 0; i < numSneakDice; i++) {
          const r = maxDice ? 6 : Math.floor(Math.random() * 6) + 1;
          sneakRolls.push(r);
          sneakDamageTotal += r;
        }
      }

      // Soul Siphon temp HP if souls >= 3
      const tempHPGain = souls >= 3 ? rogueLevel : 0;

      // Auto Harvest soul if enabled and souls < maxSouls
      if (autoHarvestOnHit && souls < vestige.maxSouls) {
        onSoulsChange(souls + 1);
        showToast('Soul Harvested!', '+1 Soul trapped in The Orphan\'s Tithe', 'power');
      }

      setActiveRollModal({
        type: 'attack',
        title: "The Orphan's Tithe — Strike",
        d20,
        totalToHit,
        isNat20,
        isNat1,
        baseDamageTotal,
        baseRolls,
        sneakDamageTotal,
        sneakRolls,
        tempHPGain,
      });
      setIsRolling(false);
    }, 400);
  };

  const executeUltimate = () => {
    if (souls < vestige.ultimate.soulCost) return;
    setIsRolling(true);
    setActiveRollModal(null);

    // Deduct soul cost
    onSoulsChange(souls - vestige.ultimate.soulCost);

    setTimeout(() => {
      // Parse ultimate damage dice e.g. "4d8", "6d8", "10d8"
      const match = vestige.ultimate.damage.match(/(\d+)d(\d+)/i);
      const diceCount = match ? parseInt(match[1], 10) : 4;
      const dieSides = match ? parseInt(match[2], 10) : 8;

      const baseRolls: number[] = [];
      let sum = 0;
      for (let i = 0; i < diceCount; i++) {
        const r = Math.floor(Math.random() * dieSides) + 1;
        baseRolls.push(r);
        sum += r;
      }

      setActiveRollModal({
        type: 'ultimate',
        title: `Ultimate: ${vestige.ultimate.name}`,
        d20: 0,
        totalToHit: 0,
        isNat20: false,
        isNat1: false,
        baseDamageTotal: sum,
        baseRolls,
        sneakDamageTotal: 0,
        sneakRolls: [],
        tempHPGain: 0,
        ultimateEffect: vestige.ultimate.effect,
      });
      setIsRolling(false);
    }, 500);
  };

  const particleColor = vestige.stage === 'exalted' ? 'gold' :
                         vestige.stage === 'awakened' ? 'arcane' : 'crimson';

  return (
    <div className="space-y-6 relative">
      {/* Centered Roll Result Modal Overlay */}
      {(isRolling || activeRollModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-[family-name:var(--font-body)]">
          <div className="w-full max-w-md p-6 border-2 border-[var(--color-crimson-500)] bg-[var(--color-surface-dark)] text-center relative overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            <button
              onClick={() => {
                setIsRolling(false);
                setActiveRollModal(null);
              }}
              className="absolute top-3 right-3 text-[var(--color-parchment-dim)] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Roll Result"
            >
              <X size={20} />
            </button>

            {isRolling ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <Dices size={44} className="text-[var(--color-crimson-400)] animate-spin" />
                <span className="text-sm font-bold text-[var(--color-parchment)] font-[family-name:var(--font-heading)] uppercase tracking-wider">
                  {activeRollModal?.type === 'ultimate' ? 'Unleashing Trapped Souls...' : 'Striking with The Orphan\'s Tithe...'}
                </span>
              </div>
            ) : activeRollModal ? (
              <div className="space-y-4 font-[family-name:var(--font-mono)]">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-gold-400)] font-bold block mb-1">
                    {activeRollModal.title}
                  </span>

                  {activeRollModal.type === 'attack' ? (
                    <div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-5xl font-extrabold text-[var(--color-crimson-400)]">
                          {activeRollModal.totalToHit}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-parchment-dim)] mt-1">
                        To Hit (d20: <strong>{activeRollModal.d20}</strong> + DEX/Prof/Vestige: <strong>+{dexMod + profBonus + vestige.hitDmgBonus}</strong>)
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <span className="text-4xl font-extrabold text-[var(--color-gold-400)]">
                        {activeRollModal.baseDamageTotal} Necrotic Damage
                      </span>
                      <p className="text-xs text-[var(--color-parchment-dim)] mt-1">
                        Dice ({vestige.ultimate.damage}): [{activeRollModal.baseRolls.join(', ')}]
                      </p>
                    </div>
                  )}
                </div>

                {activeRollModal.isNat20 && (
                  <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <Sparkles size={16} /> 🌟 SOUL CRITICAL (Natural 20)! Double Damage Dice Applied!
                  </div>
                )}
                {activeRollModal.isNat1 && (
                  <div className="p-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-400 font-bold text-xs flex items-center justify-center gap-2">
                    💀 NATURAL 1!
                  </div>
                )}

                {activeRollModal.type === 'attack' && (
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2 text-left text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-parchment-dim)]">Base Dagger Damage (1d4+{dexMod + vestige.hitDmgBonus}):</span>
                      <span className="font-bold text-[var(--color-crimson-400)]">{activeRollModal.baseDamageTotal} Piercing</span>
                    </div>

                    {activeRollModal.sneakDamageTotal > 0 && (
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
                        <span className="text-[var(--color-parchment-dim)]">
                          Sneak Attack ({sneakDiceCount}d6 {souls >= 2 ? 'Necrotic' : 'Piercing'}):
                        </span>
                        <span className="font-bold text-[var(--color-gold-400)]">+{activeRollModal.sneakDamageTotal}</span>
                      </div>
                    )}

                    {activeRollModal.tempHPGain > 0 && (
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-emerald-400">
                        <span>Soul Siphon Temp HP:</span>
                        <span className="font-bold">+{activeRollModal.tempHPGain} Temp HP</span>
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold text-sm text-white">
                      <span>Total Damage:</span>
                      <span className="text-[var(--color-gold-400)]">
                        {activeRollModal.baseDamageTotal + activeRollModal.sneakDamageTotal}
                      </span>
                    </div>
                  </div>
                )}

                {activeRollModal.ultimateEffect && (
                  <div className="bg-[rgba(255,215,0,0.08)] p-3 rounded-xl border border-[rgba(255,215,0,0.3)] text-xs text-[var(--color-parchment-muted)] italic">
                    {activeRollModal.ultimateEffect}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {activeRollModal.type === 'attack' && souls < vestige.maxSouls && (
                    <button
                      onClick={() => {
                        onSoulsChange(souls + 1);
                        showToast('Soul Harvested!', '+1 Soul trapped in The Orphan\'s Tithe', 'power');
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs rounded-xl font-mono transition-all cursor-pointer border border-amber-500/40 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Harvest Soul (+1)
                    </button>
                  )}

                  <button
                    onClick={() => setActiveRollModal(null)}
                    className="flex-1 py-2.5 bg-[var(--color-crimson-500)] hover:bg-[var(--color-crimson-400)] text-white font-bold text-xs rounded-xl font-mono transition-all cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                  >
                    Dismiss Result
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

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

      {/* Interactive Dagger Attack Execution Panel */}
      <SpotlightCard className="p-5 border-2 border-[var(--color-crimson-500)]/60 bg-gradient-to-b from-[#1a0c0c] to-[#0f0707] shadow-[0_0_20px_rgba(220,38,38,0.2)]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-crimson-800)]/40">
          <div className="flex items-center gap-2">
            <Sword size={20} className="text-[var(--color-crimson-400)]" />
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-base text-[var(--color-parchment)] uppercase tracking-wider">
              Attack with The Orphan&apos;s Tithe
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--color-gold-400)] bg-black/60 px-2.5 py-1 rounded-lg border border-[var(--color-gold-500)]/30">
            +{dexMod + profBonus + vestige.hitDmgBonus} To Hit
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center font-mono text-xs">
          <div className="bg-black/50 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block">Attack Roll</span>
            <span className="font-bold text-[var(--color-crimson-400)]">d20 + {dexMod + profBonus + vestige.hitDmgBonus}</span>
          </div>
          <div className="bg-black/50 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block">Base Damage</span>
            <span className="font-bold text-white">1d4 + {dexMod + vestige.hitDmgBonus} Piercing</span>
          </div>
          <div className="bg-black/50 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block">Sneak Attack</span>
            <span className="font-bold text-[var(--color-gold-400)]">+{sneakDiceCount}d6</span>
          </div>
          <div className="bg-black/50 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-[var(--color-parchment-dim)] block">Stage Bonus</span>
            <span className="font-bold text-emerald-400">+{vestige.hitDmgBonus} ({vestige.stageLabel})</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-4 pt-2 border-t border-white/5">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--color-parchment-muted)] hover:text-white">
            <input
              type="checkbox"
              checked={includeSneak}
              onChange={(e) => setIncludeSneak(e.target.checked)}
              className="accent-[var(--color-crimson-500)] w-4 h-4 rounded cursor-pointer"
            />
            <span>Include Sneak Attack (+{sneakDiceCount}d6)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[var(--color-parchment-muted)] hover:text-white">
            <input
              type="checkbox"
              checked={autoHarvestOnHit}
              onChange={(e) => setAutoHarvestOnHit(e.target.checked)}
              className="accent-[var(--color-gold-500)] w-4 h-4 rounded cursor-pointer"
            />
            <span>Auto-Harvest Soul on Strike (+1 Soul)</span>
          </label>
        </div>

        <button
          onClick={executeDaggerAttack}
          className="w-full py-3 bg-gradient-to-r from-[var(--color-crimson-600)] via-red-700 to-[var(--color-crimson-800)] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm rounded-xl font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer"
        >
          <Sword size={16} /> Execute Dagger Strike &amp; Roll Damage
        </button>
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
          onClick={executeUltimate}
          className="btn w-full mt-3 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
