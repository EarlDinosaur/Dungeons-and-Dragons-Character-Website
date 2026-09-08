'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dices,
  RotateCcw,
  X,
  Sparkles,
  Skull,
  Award,
  AlertTriangle,
  ZapOff,
  Flame,
  ArrowLeft,
  HeartHandshake,
} from 'lucide-react';

export interface RollRequest {
  title: string;
  subtitle?: string;
  modifier: number;
  rollType?: 'check' | 'save' | 'attack' | 'damage';
  damageDice?: string; // e.g. '2d8' or '8d6 fire'
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
  advantageReason?: string;
  isAutoFail?: boolean;
}

interface UnifiedDiceRollerModalProps {
  roll: RollRequest | null;
  onClose: () => void;
}

export interface ParsedDamage {
  count: number;
  sides: number;
  modifier: number;
  damageType: string;
}

export function parseDamageFormula(formula?: string): ParsedDamage | null {
  if (!formula || typeof formula !== 'string') return null;
  const clean = formula.trim().replace(/[()]/g, '');
  const match = clean.match(/(\d*)\s*d\s*(4|6|8|10|12|20|100)(?:\s*([+\-]\s*\d+))?\s*(.*)/i);
  if (match) {
    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0;
    const damageType = match[4] ? match[4].trim() : '';
    return { count: Math.max(1, Math.min(50, count)), sides, modifier, damageType };
  }
  const loose = clean.match(/(\d*)\s*d\s*(4|6|8|10|12|20|100)/i);
  if (loose) {
    const count = loose[1] ? parseInt(loose[1], 10) : 1;
    const sides = parseInt(loose[2], 10);
    return { count: Math.max(1, Math.min(50, count)), sides, modifier: 0, damageType: '' };
  }
  return null;
}

function getRandomD20() {
  return Math.floor(Math.random() * 20) + 1;
}

function getRandomDamageRolls(parsed: ParsedDamage | null): number[] {
  if (!parsed || parsed.count <= 0) return [];
  return Array.from({ length: parsed.count }, () => Math.floor(Math.random() * parsed.sides) + 1);
}

export default function UnifiedDiceRollerModal({ roll, onClose }: UnifiedDiceRollerModalProps) {
  if (!roll) return null;

  const parsedDamage = useMemo(() => {
    return parseDamageFormula(roll.damageDice);
  }, [roll.damageDice]);

  // Mode: strictly 'damage' only when rollType is 'damage', otherwise 'check'
  const [currentMode, setCurrentMode] = useState<'check' | 'damage'>(() => {
    return roll.rollType === 'damage' ? 'damage' : 'check';
  });

  // Rolling animation state: starts true so user visibly sees dice rolling on every click
  const [isRolling, setIsRolling] = useState(true);

  // d20 results initialized to truly randomized dice (never null, never hardcoded 10)
  const [diceResults, setDiceResults] = useState<{ d1: number; d2: number }>(() => ({
    d1: getRandomD20(),
    d2: getRandomD20(),
  }));

  // Damage dice results initialized to truly randomized dice
  const [damageDiceResults, setDamageDiceResults] = useState<number[]>(() =>
    getRandomDamageRolls(parseDamageFormula(roll.damageDice))
  );

  // Helper to trigger rapid tumbling number animation for authentic dice roll feel
  const startRollAnimation = useCallback((targetMode: 'check' | 'damage', customDice?: string) => {
    setIsRolling(true);
    const targetParsed = parseDamageFormula(customDice || roll.damageDice);

    // Rapid random number tumble (every 45ms)
    const interval = setInterval(() => {
      if (targetMode === 'damage' && targetParsed) {
        setDamageDiceResults(getRandomDamageRolls(targetParsed));
      } else {
        setDiceResults({
          d1: getRandomD20(),
          d2: getRandomD20(),
        });
      }
    }, 45);

    const timer = setTimeout(() => {
      clearInterval(interval);
      // Final locked-in roll
      if (targetMode === 'damage' && targetParsed) {
        setDamageDiceResults(getRandomDamageRolls(targetParsed));
      } else {
        setDiceResults({
          d1: getRandomD20(),
          d2: getRandomD20(),
        });
      }
      setIsRolling(false);
    }, 380);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [roll.damageDice]);

  // When roll changes or modal mounts: reset mode, roll fresh dice
  useEffect(() => {
    const nextMode = roll.rollType === 'damage' ? 'damage' : 'check';
    setCurrentMode(nextMode);
    const cleanup = startRollAnimation(nextMode);
    return cleanup;
  }, [roll, startRollAnimation]);

  const handleReroll = () => {
    if (roll.isAutoFail && currentMode === 'check') return;
    startRollAnimation(currentMode);
  };

  const handleSwitchToDamage = () => {
    if (!parsedDamage) return;
    setCurrentMode('damage');
    startRollAnimation('damage');
  };

  const isAutoFail = !!roll.isAutoFail && currentMode === 'check';
  const isAdvantage = roll.advantageMode === 'advantage' && currentMode === 'check';
  const isDisadvantage = roll.advantageMode === 'disadvantage' && currentMode === 'check';
  const isDualDice = (isAdvantage || isDisadvantage) && !isAutoFail;

  const d1 = diceResults.d1;
  const d2 = diceResults.d2;

  let currentD20 = d1;
  let droppedD20: number | null = null;

  if (isAdvantage) {
    currentD20 = Math.max(d1, d2);
    droppedD20 = Math.min(d1, d2);
  } else if (isDisadvantage) {
    currentD20 = Math.min(d1, d2);
    droppedD20 = Math.max(d1, d2);
  }

  const isNat20 = currentMode === 'check' && !isAutoFail && currentD20 === 20;
  const isNat1 = currentMode === 'check' && !isAutoFail && currentD20 === 1;
  const checkTotal = isAutoFail ? 0 : currentD20 + roll.modifier;

  // Damage math
  const damageSum = damageDiceResults.reduce((acc, val) => acc + val, 0);
  const damageTotal = Math.max(0, damageSum + (parsedDamage?.modifier || 0));
  const isHealing =
    parsedDamage?.damageType.toLowerCase().includes('heal') ||
    (roll.subtitle || '').toLowerCase().includes('heal') ||
    roll.title.toLowerCase().includes('cure') ||
    roll.title.toLowerCase().includes('healing');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl p-5 sm:p-6 text-center relative border-2 shadow-2xl transition-all duration-300 animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar ${
          isAutoFail
            ? 'bg-gradient-to-b from-[#2a0808] to-[#0a0a0f] border-red-600/90 shadow-[0_0_35px_rgba(239,68,68,0.4)]'
            : currentMode === 'damage'
            ? isHealing
              ? 'bg-gradient-to-b from-[#082012] via-[#0b1712] to-[#0a0a0f] border-emerald-600/80 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-b from-[#20100b] via-[#150e12] to-[#0a0a0f] border-amber-600/80 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
            : isNat20
            ? 'bg-gradient-to-b from-[#1c1809] to-[#0a0a0f] border-amber-400/90 shadow-[0_0_35px_rgba(251,191,36,0.35)]'
            : isNat1
            ? 'bg-gradient-to-b from-[#200808] to-[#0a0a0f] border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.35)]'
            : isDisadvantage
            ? 'bg-gradient-to-b from-[#1a1208] to-[#0a0a0f] border-amber-600/70 shadow-[0_0_30px_rgba(217,119,6,0.25)]'
            : 'bg-[#0d0f17] border-[var(--char-primary,#dc2626)]/60 shadow-xl'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Back to attack check button if in damage mode from attack */}
        {currentMode === 'damage' && roll.rollType === 'attack' && (
          <button
            onClick={() => setCurrentMode('check')}
            className="absolute top-3.5 left-3.5 text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
            title="Back to Attack Roll"
          >
            <ArrowLeft size={14} />
            <span>Attack</span>
          </button>
        )}

        {/* Title & Subtitle */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[var(--char-accent,#ffd700)] mb-1">
          {currentMode === 'damage' ? (
            isHealing ? (
              <HeartHandshake size={16} className="text-emerald-400" />
            ) : (
              <Flame size={16} className="text-amber-400" />
            )
          ) : (
            <Dices size={16} />
          )}
          <span>
            {currentMode === 'damage'
              ? `${isHealing ? 'HEALING' : 'DAMAGE'}: ${roll.title.replace(/^Cast\s+/i, '')}`
              : roll.title}
          </span>
        </div>

        {currentMode === 'damage' && (
          <p className="text-[11px] text-amber-300/80 font-mono mb-3">
            {roll.subtitle || (roll.damageDice ? `Formula: ${roll.damageDice}` : '')}
          </p>
        )}

        {currentMode === 'check' && roll.subtitle && (
          <p className="text-[11px] text-zinc-400 font-mono mb-3">{roll.subtitle}</p>
        )}

        {/* ========================================================
            DAMAGE / HEALING MODE DISPLAY (Rolls actual dice e.g. 2d8)
            ======================================================== */}
        {currentMode === 'damage' ? (
          <div className="my-4 relative flex flex-col items-center justify-center">
            <div className="w-full space-y-4">
              {/* Individual Dice Results Grid */}
              <div className="flex items-center justify-center gap-2 flex-wrap max-w-xs mx-auto">
                {damageDiceResults.map((dieVal, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-18 sm:w-18 sm:h-20 flex flex-col items-center justify-center rounded-2xl border-2 relative transition-all ${
                      isRolling
                        ? 'border-amber-400/90 bg-amber-950/60 text-amber-200 scale-95 animate-pulse'
                        : isHealing
                        ? 'border-emerald-500/70 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                        : 'border-amber-500/70 bg-amber-950/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
                        isHealing ? 'text-emerald-400/80' : 'text-amber-400/80'
                      }`}
                    >
                      d{parsedDamage?.sides || 8}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                      {dieVal}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      Die #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Formula & Grand Total */}
              <div className="flex flex-col items-center">
                {isRolling ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold py-2 animate-pulse">
                    <Flame size={14} className="animate-spin text-amber-400" />
                    <span>Rolling {roll.damageDice || 'Dice'}...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-1 flex-wrap justify-center">
                      <span>[{damageDiceResults.join(' + ')}]</span>
                      {parsedDamage && parsedDamage.modifier !== 0 && (
                        <span className="text-zinc-200">
                          {parsedDamage.modifier > 0
                            ? `+ ${parsedDamage.modifier}`
                            : `- ${Math.abs(parsedDamage.modifier)}`}{' '}
                          (Mod)
                        </span>
                      )}
                      <span>=</span>
                    </div>

                    <div
                      className={`text-5xl font-black font-mono tracking-tight ${
                        isHealing
                          ? 'text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : 'text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                      }`}
                    >
                      {damageTotal}
                    </div>

                    <div
                      className={`text-xs font-mono font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5 ${
                        isHealing ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isHealing ? (
                        <>
                          <HeartHandshake size={13} />
                          <span>Total Healing Restored</span>
                        </>
                      ) : (
                        <>
                          <Flame size={13} />
                          <span>
                            {parsedDamage?.damageType
                              ? `${parsedDamage.damageType} Damage`
                              : 'Total Damage'}
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             CHECK / ATTACK MODE DISPLAY (d20)
             ======================================================== */
          <>
            {/* Condition Impact Notice Tag */}
            {isDisadvantage && (
              <div className="mb-3 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-xs">
                <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                <span>
                  Disadvantage: Taking Lower Die{' '}
                  {roll.advantageReason ? `(${roll.advantageReason})` : ''}
                </span>
              </div>
            )}

            {isAdvantage && (
              <div className="mb-3 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-xs">
                <Sparkles size={12} className="text-emerald-400 shrink-0" />
                <span>
                  Advantage: Taking Higher Die{' '}
                  {roll.advantageReason ? `(${roll.advantageReason})` : ''}
                </span>
              </div>
            )}

            {/* AUTO-FAIL DISPLAY */}
            {isAutoFail ? (
              <div className="my-6 p-4 rounded-2xl bg-red-950/40 border-2 border-red-600/70 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse">
                  <ZapOff size={32} />
                </div>
                <span className="text-lg font-black font-mono text-red-300 tracking-wider uppercase">
                  Automatic Failure
                </span>
                <p className="text-xs font-serif text-red-200/90 leading-relaxed max-w-xs">
                  Under 5e rules, incapacitated, paralyzed, petrified, stunned, and unconscious
                  creatures auto-fail Strength and Dexterity saving throws.
                </p>
                {roll.advantageReason && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-900/60 border border-red-700 text-red-200">
                    Cause: {roll.advantageReason}
                  </span>
                )}
              </div>
            ) : (
              /* Main Dice Animation & Number */
              <div className="my-4 relative flex flex-col items-center justify-center">
                {isDualDice ? (
                  /* DUAL DICE DISPLAY FOR DISADVANTAGE / ADVANTAGE */
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-3">
                      {/* Die 1 */}
                      <div
                        className={`w-20 h-22 sm:w-22 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 transition-all relative ${
                          isRolling
                            ? 'border-amber-400/80 bg-amber-500/10 text-amber-200 animate-pulse'
                            : d1 === currentD20
                            ? isNat20
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'
                              : isNat1
                              ? 'border-red-500 bg-red-500/20 text-red-300 ring-2 ring-red-500/50'
                              : 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-600 opacity-50 scale-95'
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase tracking-wider">
                          {isRolling ? 'Die 1' : d1 === currentD20 ? 'Kept' : 'Dropped'}
                        </span>
                        <span
                          className={`text-3xl font-black font-mono tracking-tight ${
                            !isRolling && d1 !== currentD20 ? 'line-through text-zinc-600' : ''
                          }`}
                        >
                          {d1}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">
                          Die 1
                        </span>
                      </div>

                      {/* VS separator */}
                      <span className="text-xs font-mono font-bold text-zinc-500">vs</span>

                      {/* Die 2 */}
                      <div
                        className={`w-20 h-22 sm:w-22 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 transition-all relative ${
                          isRolling
                            ? 'border-amber-400/80 bg-amber-500/10 text-amber-200 animate-pulse'
                            : d2 === currentD20
                            ? isNat20
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'
                              : isNat1
                              ? 'border-red-500 bg-red-500/20 text-red-300 ring-2 ring-red-500/50'
                              : 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-600 opacity-50 scale-95'
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase tracking-wider">
                          {isRolling ? 'Die 2' : d2 === currentD20 ? 'Kept' : 'Dropped'}
                        </span>
                        <span
                          className={`text-3xl font-black font-mono tracking-tight ${
                            !isRolling && d2 !== currentD20 ? 'line-through text-zinc-600' : ''
                          }`}
                        >
                          {d2}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">
                          Die 2
                        </span>
                      </div>
                    </div>

                    {/* Formula & Total */}
                    <div className="mt-4 flex flex-col items-center">
                      {isRolling ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold py-1 animate-pulse">
                          <Dices size={15} className="animate-spin text-amber-400" />
                          <span>Rolling Dual Dice...</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-1">
                            <span>[{currentD20} (Kept)]</span>
                            <span>+</span>
                            <span className="text-zinc-200">
                              {roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier} (Mod)
                            </span>
                            <span>=</span>
                          </div>
                          <div className="text-4xl font-black font-mono text-white tracking-tight">
                            {checkTotal}
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-0.5">
                            {isDisadvantage ? 'Disadvantage Total' : 'Advantage Total'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* SINGLE DIE STANDARD DISPLAY */
                  <>
                    <div
                      className={`w-28 h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all relative ${
                        isRolling
                          ? 'border-amber-400/80 bg-amber-500/10 text-amber-200 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                          : isNat20
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                          : isNat1
                          ? 'border-red-500 bg-red-500/15 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          : 'border-[var(--char-accent,#ffd700)]/40 bg-zinc-900/60 text-white'
                      }`}
                    >
                      <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">
                        d20
                      </span>
                      <span className="text-4xl font-black font-mono tracking-tight">
                        {currentD20}
                      </span>

                      {isNat20 && !isRolling && (
                        <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-bounce">
                          <Sparkles size={11} /> NAT 20!
                        </span>
                      )}

                      {isNat1 && !isRolling && (
                        <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Skull size={11} /> NAT 1!
                        </span>
                      )}
                    </div>

                    {/* Formula & Total */}
                    <div className="mt-4 flex flex-col items-center">
                      {isRolling ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold py-1 animate-pulse">
                          <Dices size={15} className="animate-spin text-amber-400" />
                          <span>Rolling d20...</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-1">
                            <span>[{currentD20}]</span>
                            <span>+</span>
                            <span className="text-zinc-200">
                              {roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier} (Mod)
                            </span>
                            <span>=</span>
                          </div>
                          <div className="text-4xl font-black font-mono text-white tracking-tight">
                            {checkTotal}
                          </div>
                          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
                            {roll.rollType === 'attack' ? 'Attack Roll (To Hit)' : 'Total Roll'}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Special callout banner */}
            {isNat20 && !isRolling && !isAutoFail && (
              <div className="p-2 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif flex items-center justify-center gap-2">
                <Award size={15} />
                <span>Critical Success! Automatic hit &amp; double damage dice!</span>
              </div>
            )}

            {isNat1 && !isRolling && !isAutoFail && (
              <div className="p-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-serif flex items-center justify-center gap-2">
                <Skull size={15} />
                <span>Critical Failure! Automatic miss.</span>
              </div>
            )}

            {/* ROLL DAMAGE TRANSITION BUTTON (if damageDice exists on attack) */}
            {parsedDamage && !isAutoFail && !isRolling && (
              <div className="my-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={handleSwitchToDamage}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 animate-pulse"
                >
                  <Flame size={15} />
                  <span>Roll {roll.damageDice} Damage</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {!isAutoFail && (
            <button
              onClick={handleReroll}
              disabled={isRolling}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} className={isRolling ? 'animate-spin' : ''} />
              <span>{isRolling ? 'Rolling...' : 'Reroll'}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-[var(--char-primary,#dc2626)] hover:brightness-110 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
          >
            {isAutoFail ? 'Acknowledge' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
