'use client';

import React, { useState, useEffect } from 'react';
import { X, Dices, RotateCcw, Trash2, Sparkles, Skull, Plus, Minus } from 'lucide-react';

interface MobileDiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DieType = 'd20' | 'd12' | 'd100' | 'd10' | 'd8' | 'd6' | 'd4';

interface DieConfig {
  type: DieType;
  sides: number;
  label: string;
}

const DICE_CONFIGS: DieConfig[] = [
  { type: 'd20', sides: 20, label: 'd20' },
  { type: 'd12', sides: 12, label: 'd12' },
  { type: 'd100', sides: 100, label: 'd100' },
  { type: 'd10', sides: 10, label: 'd10' },
  { type: 'd8', sides: 8, label: 'd8' },
  { type: 'd6', sides: 6, label: 'd6' },
  { type: 'd4', sides: 4, label: 'd4' },
];

export default function MobileDiceRollerModal({ isOpen, onClose }: MobileDiceRollerModalProps) {
  const [selectedDice, setSelectedDice] = useState<Record<DieType, number>>({
    d20: 1,
    d12: 0,
    d100: 0,
    d10: 0,
    d8: 0,
    d6: 0,
    d4: 0,
  });

  const [modifier, setModifier] = useState<number>(0);
  const [advantageMode, setAdvantageMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<{
    rolls: Array<{ die: DieType; value: number }>;
    droppedRolls?: Array<{ die: DieType; value: number }>;
    modifier: number;
    total: number;
    isNat20?: boolean;
    isNat1?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalDiceCount = Object.values(selectedDice).reduce((acc, count) => acc + count, 0);

  const handleAddDie = (die: DieType) => {
    setSelectedDice((prev) => ({
      ...prev,
      [die]: Math.min(20, (prev[die] || 0) + 1),
    }));
  };

  const handleClearDice = () => {
    setSelectedDice({
      d20: 0,
      d12: 0,
      d100: 0,
      d10: 0,
      d8: 0,
      d6: 0,
      d4: 0,
    });
    setRollResult(null);
  };

  const handleResetToD20 = () => {
    setSelectedDice({
      d20: 1,
      d12: 0,
      d100: 0,
      d10: 0,
      d8: 0,
      d6: 0,
      d4: 0,
    });
    setModifier(0);
    setAdvantageMode('normal');
    setRollResult(null);
  };

  const executeRoll = () => {
    if (totalDiceCount === 0) return;

    setIsRolling(true);
    setRollResult(null);

    setTimeout(() => {
      const rolls: Array<{ die: DieType; value: number }> = [];
      const dropped: Array<{ die: DieType; value: number }> = [];

      const onlyOneD20 = selectedDice.d20 === 1 && totalDiceCount === 1;

      if (onlyOneD20 && advantageMode !== 'normal') {
        const roll1 = Math.floor(Math.random() * 20) + 1;
        const roll2 = Math.floor(Math.random() * 20) + 1;

        if (advantageMode === 'advantage') {
          rolls.push({ die: 'd20', value: Math.max(roll1, roll2) });
          dropped.push({ die: 'd20', value: Math.min(roll1, roll2) });
        } else {
          rolls.push({ die: 'd20', value: Math.min(roll1, roll2) });
          dropped.push({ die: 'd20', value: Math.max(roll1, roll2) });
        }
      } else {
        (Object.keys(selectedDice) as DieType[]).forEach((die) => {
          const count = selectedDice[die];
          const config = DICE_CONFIGS.find((c) => c.type === die);
          const sides = config ? config.sides : 20;

          for (let i = 0; i < count; i++) {
            rolls.push({ die, value: Math.floor(Math.random() * sides) + 1 });
          }
        });
      }

      const sumDice = rolls.reduce((acc, r) => acc + r.value, 0);
      const total = sumDice + modifier;

      const hasD20 = rolls.some((r) => r.die === 'd20');
      const isNat20 = hasD20 && rolls.find((r) => r.die === 'd20')?.value === 20;
      const isNat1 = hasD20 && rolls.find((r) => r.die === 'd20')?.value === 1;

      setRollResult({
        rolls,
        droppedRolls: dropped.length > 0 ? dropped : undefined,
        modifier,
        total,
        isNat20,
        isNat1,
      });

      setIsRolling(false);
    }, 300);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Roll Dice Modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#0e111a]/95 border border-zinc-800 p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-md animate-scale-up max-h-[90vh] overflow-y-auto space-y-4"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <Dices size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold font-[family-name:var(--font-heading)] text-zinc-100 uppercase tracking-wider">
                Roll Dice
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 block">
                Interactive Dice Roller
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Roller"
            aria-label="Close Roller"
          >
            <X size={16} />
          </button>
        </div>

        {/* 7-DICE SELECTION BAR (D&D BEYOND STYLE) */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DICE_CONFIGS.map((die) => {
            const count = selectedDice[die.type] || 0;
            const isSelected = count > 0;

            return (
              <button
                key={die.type}
                onClick={() => handleAddDie(die.type)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-950/60 to-zinc-900 border-red-500/80 text-amber-300 shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                    : 'bg-[#141724]/80 hover:bg-[#1a1e2f] border-zinc-800 text-zinc-300 hover:text-white'
                }`}
                title={`Add ${die.label}`}
              >
                <span className="text-xs font-mono font-bold">{die.label}</span>

                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border border-black shadow-sm">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ACTIVE POOL & CONTROLS */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Pool:</span>
            <span className="text-amber-300 font-bold">
              {totalDiceCount === 0
                ? 'No dice selected'
                : Object.entries(selectedDice)
                    .filter(([_, count]) => count > 0)
                    .map(([die, count]) => `${count}${die}`)
                    .join(' + ') +
                  (modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '')}
            </span>
          </div>

          {/* ADVANTAGE MODES FOR D20 */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Advantage:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAdvantageMode('advantage')}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  advantageMode === 'advantage'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                ADV
              </button>
              <button
                onClick={() => setAdvantageMode('normal')}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  advantageMode === 'normal'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                NORM
              </button>
              <button
                onClick={() => setAdvantageMode('disadvantage')}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  advantageMode === 'disadvantage'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                DIS
              </button>
            </div>
          </div>

          {/* MODIFIER CONTROLS */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Modifier:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModifier((m) => m - 1)}
                className="w-7 h-7 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono cursor-pointer"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center font-mono font-bold text-zinc-100">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button
                onClick={() => setModifier((m) => m + 1)}
                className="w-7 h-7 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ROLL RESULT CARD */}
        {isRolling ? (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center animate-pulse">
            <Dices size={28} className="mx-auto text-amber-400 animate-spin mb-1" />
            <span className="text-xs font-mono text-zinc-400">Rolling...</span>
          </div>
        ) : rollResult ? (
          <div className={`p-4 rounded-xl border text-center transition-all ${
            rollResult.isNat20
              ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : rollResult.isNat1
              ? 'bg-red-950/40 border-red-600/80 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
              : 'bg-zinc-950/90 border-zinc-800'
          }`}>
            {rollResult.isNat20 && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-1">
                <Sparkles size={14} />
                <span>NATURAL 20! CRITICAL HIT!</span>
              </div>
            )}
            {rollResult.isNat1 && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-red-400 mb-1">
                <Skull size={14} />
                <span>NATURAL 1! CRITICAL FUMBLE!</span>
              </div>
            )}

            <div className="text-4xl font-black font-mono text-white tracking-tight my-1">
              {rollResult.total}
            </div>

            <div className="text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-2 mt-2">
              Dice: [{rollResult.rolls.map((r) => r.value).join(', ')}]
              {rollResult.droppedRolls && (
                <span className="text-zinc-500 line-through ml-1.5">
                  (Dropped: {rollResult.droppedRolls.map((r) => r.value).join(', ')})
                </span>
              )}
              {rollResult.modifier !== 0 && (
                <span className="text-zinc-300 ml-1.5">
                  {rollResult.modifier > 0 ? `+ ${rollResult.modifier}` : `- ${Math.abs(rollResult.modifier)}`}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* PRIMARY ACTIONS */}
        <div className="space-y-2 pt-1">
          <button
            onClick={executeRoll}
            disabled={totalDiceCount === 0 || isRolling}
            className={`w-full py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-500 text-white font-[family-name:var(--font-heading)] uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 cursor-pointer active:scale-[0.99] transition-all ${
              totalDiceCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Dices size={16} />
            <span>Roll</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleResetToD20}
              className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset (1d20)</span>
            </button>
            <button
              onClick={handleClearDice}
              className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear Dice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
