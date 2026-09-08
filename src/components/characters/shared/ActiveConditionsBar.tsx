'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  X,
  ShieldAlert,
  ZapOff,
  EyeOff,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CONDITIONS_REGISTRY,
  ALL_CONDITIONS_LIST,
  calculateConditionModifiers,
  type ConditionRule,
} from '@/lib/conditions-engine';

interface ActiveConditionsBarProps {
  conditions: string[];
  onToggleCondition?: (conditionName: string) => void;
  readOnly?: boolean;
}

export default function ActiveConditionsBar({
  conditions = [],
  onToggleCondition,
  readOnly = false,
}: ActiveConditionsBarProps) {
  const [selectedRule, setSelectedRule] = useState<ConditionRule | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);

  const mods = calculateConditionModifiers(conditions);

  const hasAnyConditions = conditions.length > 0;

  return (
    <div className="w-full bg-[#0a0c12]/90 border border-zinc-800/90 rounded-xl p-3 shadow-md space-y-2.5 font-sans">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert size={14} />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Active Conditions &amp; Afflictions
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${
              hasAnyConditions
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-xs'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            {conditions.length} Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasAnyConditions && (
            <button
              onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 cursor-pointer"
              title="Toggle detailed mechanical breakdown"
            >
              <span>{isEffectsExpanded ? 'Hide Mechanics' : 'Show Mechanics'}</span>
              {isEffectsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {!readOnly && onToggleCondition && (
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 border border-zinc-700 text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs min-h-[30px]"
            >
              <Plus size={12} />
              <span>Toggle Condition</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Badges Tray */}
      {hasAnyConditions ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {conditions.map((cond) => {
            const rule = CONDITIONS_REGISTRY[cond];
            if (!rule) return null;
            return (
              <div
                key={cond}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all shadow-xs ${rule.badgeBg} ${rule.badgeText} ${rule.badgeBorder} group`}
              >
                <span>{rule.icon}</span>
                <button
                  onClick={() => setSelectedRule(rule)}
                  className="hover:underline cursor-pointer font-bold"
                  title="Click to view full 5e rules"
                >
                  {cond}
                </button>
                {!readOnly && onToggleCondition && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCondition(cond);
                    }}
                    className="p-0.5 rounded hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-0.5"
                    title={`Remove ${cond}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs font-serif italic text-zinc-500 py-0.5">
          No debilitating conditions currently affecting this character. All senses &amp; movement nominal.
        </p>
      )}

      {/* Summary Impact Alerts (When conditions are active) */}
      {hasAnyConditions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
          {mods.isSpeedZero && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300">
              <ZapOff size={13} className="shrink-0 text-red-400" />
              <span>
                <strong>Movement Locked:</strong> Speed reduced to 0 ft ({mods.speedZeroReasons.join(', ')})
              </span>
            </div>
          )}

          {mods.cannotTakeActions && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
              <AlertTriangle size={13} className="shrink-0 text-rose-400" />
              <span>
                <strong>Incapacitated:</strong> Cannot take actions or reactions
              </span>
            </div>
          )}

          {mods.hasDisadvantageOnAttacks && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
              <AlertTriangle size={13} className="shrink-0 text-amber-400" />
              <span>
                <strong>Attack Penalty:</strong> Disadvantage on your attack rolls
              </span>
            </div>
          )}

          {mods.attackersHaveAdvantage && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-950/40 border border-orange-800/60 text-orange-300">
              <ShieldAlert size={13} className="shrink-0 text-orange-400" />
              <span>
                <strong>Vulnerable:</strong> Attackers have Advantage against you
              </span>
            </div>
          )}

          {mods.passivePerceptionPenalty > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              <EyeOff size={13} className="shrink-0 text-zinc-400" />
              <span>
                <strong>Perception Penalty:</strong> -{mods.passivePerceptionPenalty} Passive Perception ({mods.perceptionPenaltyReasons.join(', ')})
              </span>
            </div>
          )}

          {mods.autoFailSaves.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200">
              <ZapOff size={13} className="shrink-0 text-red-400" />
              <span>
                <strong>Auto-Fail Saves:</strong> Automatically fails {mods.autoFailSaves.join(' & ')} saves
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expandable 5e Mechanical Breakdown */}
      {isEffectsExpanded && hasAnyConditions && (
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2 animate-fade-in">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider block">
            5e Rules Reference for Active Afflictions
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mods.activeRules.map((rule) => (
              <div key={rule.name} className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 font-bold text-amber-200 text-xs mb-1">
                  <span>{rule.icon}</span>
                  <span>{rule.name}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-serif">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable 5e Condition Selector (Mobile-friendly responsive grid) */}
      {isPickerOpen && !readOnly && onToggleCondition && (
        <div className="p-3 bg-zinc-950/95 border border-zinc-800 rounded-xl space-y-2 animate-fade-in shadow-inner">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              Toggle 5e Conditions
            </span>
            <button
              onClick={() => setIsPickerOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {ALL_CONDITIONS_LIST.map((condName) => {
              const rule = CONDITIONS_REGISTRY[condName];
              const isActive = conditions.includes(condName);
              return (
                <button
                  key={condName}
                  onClick={() => onToggleCondition(condName)}
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-mono font-medium transition-all text-left cursor-pointer min-h-[36px] ${
                    isActive
                      ? `${rule.badgeBg} ${rule.badgeText} border ${rule.badgeBorder} font-bold shadow-xs`
                      : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80'
                  }`}
                >
                  <span className="text-sm">{rule.icon}</span>
                  <span className="truncate">{condName}</span>
                  {isActive && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5e Rule Inspection Modal */}
      {selectedRule && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedRule(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedRule.icon}</span>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">
                  {selectedRule.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-700/30 text-xs text-amber-200 font-mono">
              <strong>Quick Rule:</strong> {selectedRule.summary}
            </div>

            <div className="text-xs text-zinc-300 font-serif leading-relaxed space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                Official 5e SRD Description
              </span>
              <p>{selectedRule.description}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRule(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-semibold text-zinc-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
