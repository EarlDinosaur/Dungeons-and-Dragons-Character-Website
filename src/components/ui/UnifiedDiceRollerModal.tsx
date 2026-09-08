'use client';

import { useState } from 'react';
import { Dices, RotateCcw, X, Sparkles, Skull, Award } from 'lucide-react';

export interface RollRequest {
  title: string;
  subtitle?: string;
  modifier: number;
  rollType?: 'check' | 'save' | 'attack' | 'damage';
  damageDice?: string; // e.g. '1d8 + 3'
}

interface UnifiedDiceRollerModalProps {
  roll: RollRequest | null;
  onClose: () => void;
}

export default function UnifiedDiceRollerModal({ roll, onClose }: UnifiedDiceRollerModalProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [d20Result, setD20Result] = useState<number | null>(() => {
    if (!roll) return null;
    return Math.floor(Math.random() * 20) + 1;
  });

  if (!roll) return null;

  const handleReroll = () => {
    setIsRolling(true);
    setD20Result(null);
    setTimeout(() => {
      setD20Result(Math.floor(Math.random() * 20) + 1);
      setIsRolling(false);
    }, 450);
  };

  const currentD20 = d20Result ?? 10;
  const isNat20 = currentD20 === 20;
  const isNat1 = currentD20 === 1;
  const total = currentD20 + roll.modifier;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl p-6 text-center relative border-2 shadow-2xl transition-all duration-300 animate-scale-up ${
          isNat20
            ? 'bg-gradient-to-b from-[#1c1809] to-[#0a0a0f] border-amber-400/90 shadow-[0_0_35px_rgba(251,191,36,0.35)]'
            : isNat1
            ? 'bg-gradient-to-b from-[#200808] to-[#0a0a0f] border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.35)]'
            : 'bg-[#0d0f17] border-[var(--char-primary,#dc2626)]/60 shadow-xl'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
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
          <p className="text-[11px] text-zinc-400 font-mono mb-4">{roll.subtitle}</p>
        )}

        {/* Main Dice Animation & Number */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          {isRolling ? (
            <div className="w-24 h-24 flex items-center justify-center">
              <Dices size={54} className="animate-spin text-[var(--char-accent,#ffd700)] duration-500" />
            </div>
          ) : (
            <>
              {/* D20 Outer Hexagon Container */}
              <div
                className={`w-28 h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all relative ${
                  isNat20
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : isNat1
                    ? 'border-red-500 bg-red-500/15 text-red-400'
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
                  <span className="text-zinc-200">{roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier} (Mod)</span>
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

        {/* Special callout banner */}
        {isNat20 && !isRolling && (
          <div className="p-2 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif flex items-center justify-center gap-2">
            <Award size={15} />
            <span>Critical Success! Automatic hit & double damage dice!</span>
          </div>
        )}

        {isNat1 && !isRolling && (
          <div className="p-2 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-serif flex items-center justify-center gap-2">
            <Skull size={15} />
            <span>Critical Failure! Automatic miss.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleReroll}
            disabled={isRolling}
            className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span>Reroll</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-[var(--char-primary,#dc2626)] hover:brightness-110 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
