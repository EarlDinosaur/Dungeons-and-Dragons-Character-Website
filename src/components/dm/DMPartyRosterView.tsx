'use client';

import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Eye,
  Wand2,
  Sparkles,
  ExternalLink,
  Plus,
  Minus,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  X,
  Check,
  Zap,
} from 'lucide-react';
import type { PartyMemberHUDState } from '@/lib/dm-types';

interface DMPartyRosterViewProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, currentHP: number, tempHp?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  onToggleInspiration: (charId: string) => void;
  onTriggerRest: (charId: string, type: 'short' | 'long') => void;
  onInspectCharacter?: (charId: string) => void;
}

const ALL_CONDITIONS = [
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

export default function DMPartyRosterView({
  partyMembers,
  onUpdatePartyHP,
  onTogglePartyCondition,
  onToggleInspiration,
  onTriggerRest,
  onInspectCharacter,
}: DMPartyRosterViewProps) {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Active HP Adjustment Modal / Popover State
  const [activeAdjustMember, setActiveAdjustMember] = useState<PartyMemberHUDState | null>(null);
  const [adjustAmt, setAdjustAmt] = useState<string>('');

  // Active Condition Modal State
  const [activeConditionMember, setActiveConditionMember] = useState<PartyMemberHUDState | null>(null);

  const handleApplyDamage = () => {
    if (!activeAdjustMember) return;
    const val = parseInt(adjustAmt, 10);
    if (isNaN(val) || val <= 0) return;

    let newCurrent = activeAdjustMember.currentHP;
    let newTemp = activeAdjustMember.tempHP;

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

    onUpdatePartyHP(activeAdjustMember.id, newCurrent, newTemp);
    setActiveAdjustMember(null);
    setAdjustAmt('');
  };

  const handleApplyHeal = () => {
    if (!activeAdjustMember) return;
    const val = parseInt(adjustAmt, 10);
    if (isNaN(val) || val <= 0) return;

    const newCurrent = Math.min(activeAdjustMember.maxHP, activeAdjustMember.currentHP + val);
    onUpdatePartyHP(activeAdjustMember.id, newCurrent, activeAdjustMember.tempHP);
    setActiveAdjustMember(null);
    setAdjustAmt('');
  };

  const handleApplyTemp = () => {
    if (!activeAdjustMember) return;
    const val = parseInt(adjustAmt, 10);
    if (isNaN(val) || val < 0) return;

    onUpdatePartyHP(activeAdjustMember.id, activeAdjustMember.currentHP, val);
    setActiveAdjustMember(null);
    setAdjustAmt('');
  };

  return (
    <div className="w-full space-y-4 animate-fade-in font-mono text-xs">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d0f17]/90 border border-zinc-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Shield size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider">
              Party Vitals &amp; Passive Senses
            </h2>
            <p className="text-[10px] text-zinc-400">
              {partyMembers.length} Active Heroes &bull; Live DC &bull; Defense &amp; Senses Matrix
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px]">
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TableIcon size={13} />
            <span>Table Matrix</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Hero Cards</span>
          </button>
        </div>
      </div>

      {/* 2. View Mode: Table Matrix (Neat, clean, dense) */}
      {viewMode === 'matrix' ? (
        <div className="rounded-2xl border border-zinc-800/90 bg-[#0a0c12]/95 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/70 text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
                  <th className="py-3 px-4">Hero</th>
                  <th className="py-3 px-3 text-center">AC</th>
                  <th className="py-3 px-3">Hit Points</th>
                  <th className="py-3 px-3 text-center">Pass. Perc</th>
                  <th className="py-3 px-3 text-center">Pass. Ins</th>
                  <th className="py-3 px-3 text-center">Pass. Inv</th>
                  <th className="py-3 px-3 text-center">Spell DC</th>
                  <th className="py-3 px-3 text-center">Insp</th>
                  <th className="py-3 px-3">Conditions</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {partyMembers.map((member) => {
                  const hpPercent = Math.max(
                    0,
                    Math.min(100, Math.round((member.currentHP / Math.max(1, member.maxHP)) * 100))
                  );
                  const isCritical = hpPercent <= 25 && member.currentHP > 0;
                  const isUnconscious = member.currentHP <= 0;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-900/40 transition-colors group"
                    >
                      {/* Hero Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => onInspectCharacter?.(member.id)}
                            className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-700/80 shrink-0 bg-zinc-900 cursor-pointer group-hover:border-amber-400 transition-colors"
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
                              <span
                                onClick={() => onInspectCharacter?.(member.id)}
                                className="font-bold text-zinc-100 truncate cursor-pointer hover:text-amber-300 font-[family-name:var(--font-heading)] text-xs"
                              >
                                {member.name}
                              </span>
                              <span className="text-[10px] text-zinc-400">Lv {member.level}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {member.characterClass} {member.subclass ? `(${member.subclass})` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* AC */}
                      <td className="py-3 px-3 text-center font-bold text-zinc-200">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          <Shield size={11} className="text-zinc-400" />
                          {member.ac}
                        </span>
                      </td>

                      {/* HP Bar & Quick Adjust */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => {
                            setActiveAdjustMember(member);
                            setAdjustAmt('');
                          }}
                          className="cursor-pointer group/hp"
                          title="Click to adjust HP"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-zinc-200 group-hover/hp:text-amber-300 transition-colors">
                              {member.currentHP} <span className="text-zinc-500 font-normal">/ {member.maxHP}</span>
                            </span>
                            {member.tempHP > 0 && (
                              <span className="text-[10px] text-cyan-300 font-bold">+{member.tempHP} THP</span>
                            )}
                            <span
                              className={`text-[10px] font-bold ${
                                isUnconscious
                                  ? 'text-red-500 animate-pulse'
                                  : isCritical
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {isUnconscious ? '0 HP' : `${hpPercent}%`}
                            </span>
                          </div>

                          <div className="h-1.5 w-32 sm:w-36 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
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
                        </div>
                      </td>

                      {/* Passive Perception */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {member.passivePerception}
                        </span>
                      </td>

                      {/* Passive Insight */}
                      <td className="py-3 px-3 text-center font-bold text-sky-300">
                        {member.passiveInsight}
                      </td>

                      {/* Passive Investigation */}
                      <td className="py-3 px-3 text-center font-bold text-zinc-400">
                        {member.passiveInvestigation}
                      </td>

                      {/* Spell DC */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[11px]">
                          DC {member.spellSaveDC}
                        </span>
                      </td>

                      {/* Inspiration */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleInspiration(member.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            member.inspiration
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:text-zinc-400'
                          }`}
                          title="Toggle Heroic Inspiration"
                        >
                          <Sparkles size={13} className={member.inspiration ? 'fill-amber-400' : ''} />
                        </button>
                      </td>

                      {/* Conditions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {member.conditions.length > 0 ? (
                            member.conditions.map((cond) => (
                              <span
                                key={cond}
                                onClick={() => onTogglePartyCondition(member.id, cond)}
                                className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[9px] font-bold cursor-pointer hover:bg-red-900/90 transition-colors"
                                title="Click to remove condition"
                              >
                                {cond} &times;
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-zinc-600 italic">None</span>
                          )}
                          <button
                            onClick={() => setActiveConditionMember(member)}
                            className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Add / override conditions"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveAdjustMember(member);
                              setAdjustAmt('');
                            }}
                            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-[10px] cursor-pointer"
                          >
                            HP &plusmn;
                          </button>
                          <button
                            onClick={() => onInspectCharacter?.(member.id)}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                            title="Inspect Character Sheet"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 3. View Mode: Sleek Hero Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {partyMembers.map((member) => {
            const hpPercent = Math.max(
              0,
              Math.min(100, Math.round((member.currentHP / Math.max(1, member.maxHP)) * 100))
            );
            const isCritical = hpPercent <= 25 && member.currentHP > 0;
            const isUnconscious = member.currentHP <= 0;

            return (
              <div
                key={member.id}
                className="flex flex-col rounded-2xl bg-[#0a0c12]/95 border border-zinc-800/90 shadow-lg hover:border-zinc-700 transition-all p-3.5 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      onClick={() => onInspectCharacter?.(member.id)}
                      className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700/80 shrink-0 bg-zinc-900 cursor-pointer hover:border-amber-400 transition-colors"
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
                          onClick={() => onInspectCharacter?.(member.id)}
                          className="font-bold text-zinc-100 truncate cursor-pointer hover:text-amber-300 font-[family-name:var(--font-heading)] text-xs"
                        >
                          {member.name}
                        </h3>
                        <span className="text-[10px] text-zinc-400">Lv {member.level}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {member.characterClass} {member.subclass ? `(${member.subclass})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleInspiration(member.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        member.inspiration
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:text-zinc-400'
                      }`}
                      title="Toggle Heroic Inspiration"
                    >
                      <Sparkles size={12} className={member.inspiration ? 'fill-amber-400' : ''} />
                    </button>
                    <button
                      onClick={() => onInspectCharacter?.(member.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                      title="Inspect full sheet"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                {/* Senses Ribbon */}
                <div className="grid grid-cols-4 divide-x divide-zinc-800/80 rounded-xl bg-zinc-950/60 border border-zinc-800/80 py-1.5 text-center text-[10px]">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">AC</span>
                    <span className="font-bold text-zinc-200">{member.ac}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Pass. Perc</span>
                    <span className="font-bold text-amber-300">{member.passivePerception}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Pass. Ins</span>
                    <span className="font-bold text-sky-300">{member.passiveInsight}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Spell DC</span>
                    <span className="font-bold text-purple-300">{member.spellSaveDC}</span>
                  </div>
                </div>

                {/* Hit Points Bar & Quick Edit */}
                <div
                  onClick={() => {
                    setActiveAdjustMember(member);
                    setAdjustAmt('');
                  }}
                  className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 cursor-pointer hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <Heart size={12} className={isUnconscious ? 'text-zinc-600' : 'text-red-400'} />
                      <span className="font-bold text-zinc-200">
                        {member.currentHP} <span className="text-zinc-500 text-[10px]">/ {member.maxHP}</span>
                      </span>
                      {member.tempHP > 0 && (
                        <span className="text-[10px] font-bold text-cyan-300">+{member.tempHP} THP</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isUnconscious ? 'text-red-500 animate-pulse' : isCritical ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isUnconscious ? 'Unconscious' : `${hpPercent}%`}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
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
                </div>

                {/* Conditions (Only if active) */}
                {member.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.conditions.map((cond) => (
                      <span
                        key={cond}
                        onClick={() => onTogglePartyCondition(member.id, cond)}
                        className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[9px] font-bold cursor-pointer hover:bg-red-900"
                        title="Click to remove condition"
                      >
                        {cond} &times;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. HP Adjustment Popover / Modal */}
      {activeAdjustMember && (
        <div
          onClick={() => setActiveAdjustMember(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#0e1017] border border-amber-500/40 p-5 shadow-2xl space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">{activeAdjustMember.name}</h3>
                <p className="text-[10px] text-zinc-400">
                  Current HP: {activeAdjustMember.currentHP} / {activeAdjustMember.maxHP}
                  {activeAdjustMember.tempHP > 0 && ` (+${activeAdjustMember.tempHP} THP)`}
                </p>
              </div>
              <button
                onClick={() => setActiveAdjustMember(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">HP Amount</label>
              <input
                type="number"
                min={1}
                value={adjustAmt}
                onChange={(e) => setAdjustAmt(e.target.value)}
                placeholder="Enter points..."
                autoFocus
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-base font-bold text-center focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleApplyDamage}
                className="py-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <Minus size={13} /> Damage
              </button>
              <button
                onClick={handleApplyHeal}
                className="py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <Plus size={13} /> Heal
              </button>
              <button
                onClick={handleApplyTemp}
                className="py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                Set THP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Condition Picker Modal */}
      {activeConditionMember && (
        <div
          onClick={() => setActiveConditionMember(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#0e1017] border border-zinc-800 p-5 shadow-2xl space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400" />
                <span>Afflictions &bull; {activeConditionMember.name}</span>
              </h3>
              <button
                onClick={() => setActiveConditionMember(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[10px] text-zinc-400">Click a condition to toggle it on or off for this hero:</p>

            <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {ALL_CONDITIONS.map((cond) => {
                const active = activeConditionMember.conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => onTogglePartyCondition(activeConditionMember.id, cond)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-red-900/80 text-red-200 border-red-600'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
