'use client';

import { useState } from 'react';
import { Dices, RotateCcw, X, Sparkles, Skull, Award, AlertTriangle, ZapOff } from 'lucide-react';

export interface RollRequest {
  title: string;
  subtitle?: string;
  modifier: number;
  rollType?: 'check' | 'save' | 'attack' | 'damage';
  damageDice?: string; // e.g. '1d8 + 3'
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
  advantageReason?: string;
  isAutoFail?: boolean;
}

interface UnifiedDiceRollerModalProps {
  roll: RollRequest | null;
  onClose: () => void;
}

export default function UnifiedDiceRollerModal({ roll, onClose }: UnifiedDiceRollerModalProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState<{ d1: number; d2: number } | null>(() => {
    if (!roll) return null;
    return {
      d1: Math.floor(Math.random() * 20) + 1,
      d2: Math.floor(Math.random() * 20) + 1,
    };
  });

  if (!roll) return null;

  const isAutoFail = !!roll.isAutoFail;
  const isAdvantage = roll.advantageMode === 'advantage';
  const isDisadvantage = roll.advantageMode === 'disadvantage';
  const isDualDice = (isAdvantage || isDisadvantage) && !isAutoFail;

  const handleReroll = () => {
    if (isAutoFail) return;
    setIsRolling(true);
    setDiceResults(null);
    setTimeout(() => {
      setDiceResults({
        d1: Math.floor(Math.random() * 20) + 1,
        d2: Math.floor(Math.random() * 20) + 1,
      });
      setIsRolling(false);
    }, 450);
  };

  const d1 = diceResults?.d1 ?? 10;
  const d2 = diceResults?.d2 ?? 10;

  let currentD20 = d1;
  let droppedD20: number | null = null;

  if (isAdvantage) {
    currentD20 = Math.max(d1, d2);
    droppedD20 = Math.min(d1, d2);
  } else if (isDisadvantage) {
    currentD20 = Math.min(d1, d2);
    droppedD20 = Math.max(d1, d2);
  }

  const isNat20 = !isAutoFail && currentD20 === 20;
  const isNat1 = !isAutoFail && currentD20 === 1;
  const total = isAutoFail ? 0 : currentD20 + roll.modifier;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl p-5 sm:p-6 text-center relative border-2 shadow-2xl transition-all duration-300 animate-scale-up max-h-[90vh] overflow-y-auto ${
          isAutoFail
            ? 'bg-gradient-to-b from-[#2a0808] to-[#0a0a0f] border-red-600/90 shadow-[0_0_35px_rgba(239,68,68,0.4)]'
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

        {/* Title & Subtitle */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[var(--char-accent,#ffd700)] mb-1">
          <Dices size={16} />
          <span>{roll.title}</span>
        </div>
        {roll.subtitle && (
          <p className="text-[11px] text-zinc-400 font-mono mb-3">{roll.subtitle}</p>
        )}

        {/* Condition Impact Notice Tag */}
        {isDisadvantage && (
          <div className="mb-3 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-xs">
            <AlertTriangle size={12} className="text-amber-400 shrink-0" />
            <span>Disadvantage: Taking Lower Die {roll.advantageReason ? `(${roll.advantageReason})` : ''}</span>
          </div>
        )}

        {isAdvantage && (
          <div className="mb-3 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 shadow-xs">
            <Sparkles size={12} className="text-emerald-400 shrink-0" />
            <span>Advantage: Taking Higher Die {roll.advantageReason ? `(${roll.advantageReason})` : ''}</span>
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
              Under 5e rules, incapacitated, paralyzed, petrified, stunned, and unconscious creatures auto-fail Strength and Dexterity saving throws.
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
            {isRolling ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <Dices size={54} className="animate-spin text-[var(--char-accent,#ffd700)] duration-500" />
              </div>
            ) : isDualDice ? (
              /* DUAL DICE DISPLAY FOR DISADVANTAGE / ADVANTAGE */
              <div className="w-full">
                <div className="flex items-center justify-center gap-3">
                  {/* Die 1 */}
                  <div
                    className={`w-20 h-22 sm:w-22 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 transition-all relative ${
                      d1 === currentD20
                        ? isNat20
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'
                          : isNat1
                          ? 'border-red-500 bg-red-500/20 text-red-300 ring-2 ring-red-500/50'
                          : 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-600 opacity-50 scale-95'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {d1 === currentD20 ? 'Kept' : 'Dropped'}
                    </span>
                    <span
                      className={`text-3xl font-black font-mono tracking-tight ${
                        d1 !== currentD20 ? 'line-through text-zinc-600' : ''
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
                      d2 === currentD20
                        ? isNat20
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'
                          : isNat1
                          ? 'border-red-500 bg-red-500/20 text-red-300 ring-2 ring-red-500/50'
                          : 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-600 opacity-50 scale-95'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {d2 === currentD20 ? 'Kept' : 'Dropped'}
                    </span>
                    <span
                      className={`text-3xl font-black font-mono tracking-tight ${
                        d2 !== currentD20 ? 'line-through text-zinc-600' : ''
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
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-1">
                    <span>[{currentD20} (Kept)]</span>
                    <span>+</span>
                    <span className="text-zinc-200">
                      {roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier} (Mod)
                    </span>
                    <span>=</span>
                  </div>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {total}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-0.5">
                    {isDisadvantage ? 'Disadvantage Total' : 'Advantage Total'}
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE DIE STANDARD DISPLAY */
              <>
                <div
                  className={`w-28 h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all relative ${
                    isNat20
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

                  {isNat20 && (
                    <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles size={11} /> NAT 20!
                    </span>
                  )}

                  {isNat1 && (
                    <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Skull size={11} /> NAT 1!
                    </span>
                  )}
                </div>

                {/* Formula & Total */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mb-1">
                    <span>[{currentD20}]</span>
                    <span>+</span>
                    <span className="text-zinc-200">
                      {roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier} (Mod)
                    </span>
                    <span>=</span>
                  </div>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {total}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
                    Total Roll
                  </div>
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

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {!isAutoFail && (
            <button
              onClick={handleReroll}
              disabled={isRolling}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} />
              <span>Reroll</span>
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
