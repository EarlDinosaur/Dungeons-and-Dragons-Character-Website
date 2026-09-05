'use client';

import { useState } from 'react';
import { Heart, Shield, Plus, Minus, RotateCcw, Zap, Flame } from 'lucide-react';
import { useToast } from './ToastNotification';

interface HPQuickControlProps {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  onHPChange: (newHP: number) => void;
  onTempHPChange: (newTempHP: number) => void;
  themeColor?: string; // 'crimson' | 'lunar' | 'gold'
  characterName?: string;
}

export default function HPQuickControl({
  currentHP,
  maxHP,
  tempHP,
  onHPChange,
  onTempHPChange,
  themeColor = 'crimson',
  characterName = 'Character',
}: HPQuickControlProps) {
  const { showToast } = useToast();
  const [customValue, setCustomValue] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hpPercent = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;

  // Determine bar & text color based on HP ratio and theme
  const getHpColor = () => {
    if (hpPercent <= 0) return '#6b7280'; // gray / unconscious
    if (hpPercent <= 25) return '#ef4444'; // critical red
    if (hpPercent <= 50) return '#f59e0b'; // warning amber
    return themeColor === 'lunar' ? '#a992e8' : '#22c55e'; // green or lunar purple
  };

  const hpColor = getHpColor();

  const handleApplyDamage = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;

    let remainingDmg = amount;
    let newTempHP = tempHP;

    // Temp HP absorbs damage first
    if (newTempHP > 0) {
      if (newTempHP >= remainingDmg) {
        newTempHP -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= newTempHP;
        newTempHP = 0;
      }
      onTempHPChange(newTempHP);
    }

    if (remainingDmg > 0) {
      const nextHP = Math.max(0, currentHP - remainingDmg);
      onHPChange(nextHP);
    }

    setCustomValue('');
  };

  const handleApplyHeal = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    const nextHP = Math.min(maxHP, currentHP + amount);
    onHPChange(nextHP);
    setCustomValue('');
  };

  const handleSetTempHP = (amount: number) => {
    if (isNaN(amount) || amount < 0) return;
    onTempHPChange(amount);
    setCustomValue('');
  };

  const valNum = parseInt(customValue, 10);
  const isValidNum = !isNaN(valNum) && valNum > 0;

  return (
    <div className="space-y-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,215,0,0.15)] rounded-xl p-3.5 shadow-inner">
      {/* Top Header & Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-[var(--color-crimson-400)] animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-parchment)] font-bold">
            Hit Points
          </span>
          {tempHP > 0 && (
            <span className="text-[10px] font-[family-name:var(--font-mono)] bg-[rgba(168,85,247,0.18)] text-[var(--color-arcane-300)] border border-[rgba(168,85,247,0.3)] px-2 py-0.5 rounded-full font-bold">
              +{tempHP} Temp HP
            </span>
          )}
        </div>

        {/* Current HP Display */}
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-xl font-bold" style={{ color: hpColor }}>
            {currentHP}
          </span>
          <span className="text-[var(--color-parchment-dim)] text-xs font-mono">/ {maxHP} HP</span>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-2 text-[10px] uppercase tracking-wider font-[family-name:var(--font-mono)] text-[var(--color-gold-300)] hover:text-[var(--color-gold-bright)] underline bg-black/40 px-2 py-0.5 rounded border border-[rgba(255,215,0,0.2)] hover:border-[var(--color-gold-400)] transition-colors"
          >
            {showAdvanced ? 'Simple' : 'Quick Math UX ⚡'}
          </button>
        </div>
      </div>

      {/* HP Bar */}
      <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(0, Math.min(100, hpPercent))}%`,
            backgroundColor: hpColor,
          }}
        />
      </div>

      {/* Direct Numeric Input Bar (UX Friendly!) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="relative flex-1 min-w-[120px]">
          <input
            type="number"
            min="1"
            placeholder="Amount..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValidNum) handleApplyDamage(valNum);
            }}
            className="w-full bg-black/70 border border-[rgba(255,215,0,0.25)] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 font-[family-name:var(--font-mono)] focus:outline-none focus:border-[var(--color-gold-400)]"
          />
        </div>

        <button
          onClick={() => handleApplyDamage(valNum)}
          disabled={!isValidNum}
          className="flex items-center gap-1 bg-red-950/80 hover:bg-red-900 border border-red-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-red-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <Flame size={13} className="text-red-400" />
          Damage
        </button>

        <button
          onClick={() => handleApplyHeal(valNum)}
          disabled={!isValidNum}
          className="flex items-center gap-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <Plus size={13} className="text-emerald-400" />
          Heal
        </button>

        <button
          onClick={() => handleSetTempHP(valNum)}
          disabled={!isValidNum}
          className="flex items-center gap-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
        >
          <Shield size={13} className="text-purple-400" />
          Temp HP
        </button>
      </div>

      {/* Quick Delta Chips (Single Click Shortcuts) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px] font-[family-name:var(--font-mono)]">
        {/* Negative Deltas */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-red-400 font-bold mr-0.5">DMG:</span>
          {[-20, -10, -5, -1].map((amt) => (
            <button
              key={amt}
              onClick={() => handleApplyDamage(Math.abs(amt))}
              className="bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800/40 hover:border-red-600 px-2 py-0.5 rounded transition-all active:scale-95"
            >
              {amt}
            </button>
          ))}
        </div>

        {/* Positive Deltas */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-emerald-400 font-bold mr-0.5">HEAL:</span>
          {[1, 5, 10, 20].map((amt) => (
            <button
              key={amt}
              onClick={() => handleApplyHeal(amt)}
              className="bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 hover:border-emerald-600 px-2 py-0.5 rounded transition-all active:scale-95"
            >
              +{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Full Rest & Unconscious Buttons (Advanced Toggle) */}
      {showAdvanced && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs animate-fade-in-up">
          <button
            onClick={() => onHPChange(0)}
            className="flex items-center gap-1 bg-gray-900 hover:bg-red-950 text-gray-400 hover:text-red-300 border border-gray-700/50 hover:border-red-700 px-2.5 py-1 rounded text-[11px] font-mono transition-colors"
          >
            ☠️ 0 HP (Unconscious)
          </button>

          <button
            onClick={() => {
              onHPChange(maxHP);
              onTempHPChange(0);
            }}
            className="flex items-center gap-1 bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] text-[var(--color-gold-300)] border border-[rgba(255,215,0,0.3)] px-3 py-1 rounded text-[11px] font-mono font-bold transition-all"
          >
            <RotateCcw size={12} className="text-[var(--color-gold-400)]" />
            💖 Long Rest (Full HP)
          </button>
        </div>
      )}
    </div>
  );
}
