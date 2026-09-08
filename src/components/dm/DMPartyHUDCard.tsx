'use client';

import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Wand2,
  Eye,
  Zap,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PartyMemberHUDState } from '@/lib/dm-types';

const STANDARD_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion',
] as const;

interface DMPartyHUDCardProps {
  member: PartyMemberHUDState;
  onUpdateHP: (characterId: string, currentHP: number, tempHP?: number) => void;
  onToggleCondition: (characterId: string, condition: string) => void;
  onToggleInspiration: (characterId: string) => void;
  onTriggerRest: (characterId: string, type: 'short' | 'long') => void;
  onInspectSheet?: (characterId: string) => void;
}

export default function DMPartyHUDCard({
  member,
  onUpdateHP,
  onToggleCondition,
  onToggleInspiration,
  onTriggerRest,
  onInspectSheet,
}: DMPartyHUDCardProps) {
  const [hpDelta, setHpDelta] = useState<string>('');
  const [isConditionsExpanded, setIsConditionsExpanded] = useState<boolean>(false);

  const hpPercent = Math.max(
    0,
    Math.min(100, Math.round((member.currentHP / Math.max(1, member.maxHP)) * 100))
  );

  const isCritical = hpPercent <= 25 && member.currentHP > 0;
  const isUnconscious = member.currentHP <= 0;

  const handleApplyDamage = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val <= 0) return;

    let newCurrent = member.currentHP;
    let newTemp = member.tempHP;

    if (newTemp > 0) {
      if (val <= newTemp) {
        newTemp -= val;
      } else {
        const overflow = val - newTemp;
        newTemp = 0;
        newCurrent = Math.max(0, newCurrent - overflow);
      }
    } else {
      newCurrent = Math.max(0, newCurrent - val);
    }

    onUpdateHP(member.id, newCurrent, newTemp);
    setHpDelta('');
  };

  const handleApplyHeal = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val <= 0) return;

    const newCurrent = Math.min(member.maxHP, member.currentHP + val);
    onUpdateHP(member.id, newCurrent, member.tempHP);
    setHpDelta('');
  };

  const handleApplyTemp = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val < 0) return;
    onUpdateHP(member.id, member.currentHP, val);
    setHpDelta('');
  };

  return (
    <div className="flex flex-col bg-[#0c0e14] border border-zinc-800/90 rounded-xl overflow-hidden shadow-lg transition-all hover:border-zinc-700/80">
      {/* 1. Header Banner & Identity */}
      <div className="p-3 bg-zinc-950/80 border-b border-zinc-800/60 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-700/80 shrink-0 bg-zinc-900 cursor-pointer"
            onClick={() => onInspectSheet?.(member.id)}
            title="Inspect full sheet"
          >
            {member.portraitUrl ? (
              <img
                src={member.portraitUrl}
                alt={member.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-amber-400 font-bold text-sm">
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                onClick={() => onInspectSheet?.(member.id)}
                className="text-xs font-bold text-zinc-100 truncate cursor-pointer hover:text-amber-300 font-[family-name:var(--font-heading)]"
              >
                {member.name}
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">Lv {member.level}</span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              {member.characterClass} {member.subclass ? `(${member.subclass})` : ''}
            </p>
          </div>
        </div>

        {/* Quick Toggles: Inspiration & Rests */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleInspiration(member.id)}
            className={`px-1.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
              member.inspiration
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title="Toggle Heroic Inspiration"
          >
            <Sparkles size={11} />
            <span className="hidden sm:inline">Insp</span>
          </button>

          <button
            onClick={() => onTriggerRest(member.id, 'short')}
            className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-mono cursor-pointer"
            title="Trigger Short Rest (Recover pact slots & short rest abilities)"
          >
            SR
          </button>
          <button
            onClick={() => onTriggerRest(member.id, 'long')}
            className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-mono cursor-pointer"
            title="Trigger Long Rest (Reset HP, spell slots, powers)"
          >
            LR
          </button>
        </div>
      </div>

      {/* 2. Core Passive & Defense Metric Ribbons */}
      <div className="grid grid-cols-4 divide-x divide-zinc-800/60 border-b border-zinc-800/60 bg-zinc-950/40 text-center font-mono py-1.5 text-xs">
        <div>
          <span className="text-[9px] uppercase text-zinc-500 block">AC</span>
          <span className="font-bold text-zinc-200 flex items-center justify-center gap-0.5">
            <Shield size={11} className="text-zinc-400" />
            {member.ac}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-500 block">Pass. Perc</span>
          <span className="font-bold text-amber-300/90 flex items-center justify-center gap-0.5">
            <Eye size={11} className="text-amber-400" />
            {member.passivePerception}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-500 block">Pass. Ins</span>
          <span className="font-bold text-sky-300/90">{member.passiveInsight}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-500 block">DC / Atk</span>
          <span className="font-bold text-purple-300/90 flex items-center justify-center gap-0.5 text-[11px]">
            <Wand2 size={10} className="text-purple-400" />
            {member.spellSaveDC}
          </span>
        </div>
      </div>

      {/* 3. HP Bar & Real-time Override Controls */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Heart size={12} className={isUnconscious ? 'text-zinc-600' : 'text-red-400'} />
            <span className="font-bold text-zinc-200">
              {member.currentHP} <span className="text-zinc-500">/ {member.maxHP}</span>
            </span>
            {member.tempHP > 0 && (
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/60">
                +{member.tempHP} THP
              </span>
            )}
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isUnconscious
                ? 'text-red-500 animate-pulse'
                : isCritical
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {isUnconscious ? 'Unconscious' : `${hpPercent}%`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
          <div
            className={`h-full transition-all duration-300 ${
              isUnconscious
                ? 'bg-zinc-700'
                : isCritical
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-red-600 to-rose-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* DM Direct HP Manipulation Input */}
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="number"
            min={0}
            value={hpDelta}
            onChange={(e) => setHpDelta(e.target.value)}
            placeholder="Amt"
            className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-xs font-mono text-center text-white focus:outline-none focus:border-amber-400"
          />

          <button
            onClick={handleApplyDamage}
            className="flex-1 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-0.5"
            title="Apply Damage"
          >
            <Minus size={11} /> Dmg
          </button>

          <button
            onClick={handleApplyHeal}
            className="flex-1 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-0.5"
            title="Apply Healing"
          >
            <Plus size={11} /> Heal
          </button>

          <button
            onClick={handleApplyTemp}
            className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 text-[11px] font-mono font-bold transition-colors cursor-pointer"
            title="Set Temporary HP"
          >
            THP
          </button>
        </div>
      </div>

      {/* 4. Active Conditions & Force Toggles */}
      <div className="px-3 pb-3 border-t border-zinc-800/60 pt-2 bg-zinc-950/20">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1 font-bold">
            <AlertTriangle size={11} className="text-amber-400" />
            Conditions ({member.conditions.length})
          </span>
          <button
            onClick={() => setIsConditionsExpanded(!isConditionsExpanded)}
            className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono flex items-center gap-0.5 cursor-pointer"
          >
            {isConditionsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {isConditionsExpanded ? 'Hide' : 'Override'}
          </button>
        </div>

        {/* Active Condition Chips */}
        {member.conditions.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {member.conditions.map((cond) => (
              <span
                key={cond}
                onClick={() => onToggleCondition(member.id, cond)}
                className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] font-mono font-medium cursor-pointer hover:bg-red-900/90 transition-colors flex items-center gap-1"
                title="Click to remove condition"
              >
                <span>{cond}</span>
                <span className="text-red-500 hover:text-white">&times;</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] font-mono text-zinc-600 italic mb-1">No active afflictions</p>
        )}

        {/* Collapsible Full Condition Override Selector */}
        {isConditionsExpanded && (
          <div className="pt-2 border-t border-zinc-800/50 flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
            {STANDARD_CONDITIONS.map((cond) => {
              const active = member.conditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => onToggleCondition(member.id, cond)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer border ${
                    active
                      ? 'bg-red-900/80 text-red-200 border-red-700 font-bold'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
