'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Swords,
  Play,
  RotateCcw,
  SkipForward,
  SkipBack,
  Plus,
  Trash2,
  Heart,
  Shield,
  Zap,
  AlertTriangle,
  Minus,
  Check,
  X,
  Sparkles,
  User,
  Skull,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Combatant, EncounterState, PartyMemberHUDState } from '@/lib/dm-types';

interface DMCombatEngineProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, currentHP: number, tempHP?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  externalCombatants?: Combatant[];
  onClearExternalCombatants?: () => void;
}

const QUICK_MONSTER_TEMPLATES = [
  { name: 'Goblin Skirmisher', hp: 7, ac: 15, init: 2, cr: '1/4' },
  { name: 'Bandit', hp: 11, ac: 12, init: 1, cr: '1/8' },
  { name: 'Skeleton', hp: 13, ac: 13, init: 2, cr: '1/4' },
  { name: 'Cultist Fanatic', hp: 22, ac: 13, init: 1, cr: '2' },
  { name: 'Orc Berserker', hp: 30, ac: 13, init: 1, cr: '1' },
  { name: 'Shadow Assassin', hp: 45, ac: 15, init: 3, cr: '3' },
  { name: 'Crypt Wight', hp: 45, ac: 14, init: 2, cr: '3' },
  { name: 'Ashen Dragon Wyrmling', hp: 75, ac: 16, init: 2, cr: '4' },
];

export default function DMCombatEngine({
  partyMembers,
  onUpdatePartyHP,
  onTogglePartyCondition,
  externalCombatants,
  onClearExternalCombatants,
}: DMCombatEngineProps) {
  // Combat State
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);

  // Initialize combatants with party members
  const [monsters, setMonsters] = useState<Combatant[]>([]);
  const [hpInputs, setHpInputs] = useState<Record<string, string>>({});

  // Sync incoming external combatants (e.g. sent from NPC Codex)
  useEffect(() => {
    if (externalCombatants && externalCombatants.length > 0) {
      setMonsters((prev) => [...prev, ...externalCombatants]);
      onClearExternalCombatants?.();
    }
  }, [externalCombatants, onClearExternalCombatants]);

  // Add Monster Form Modal
  const [isAddingMonster, setIsAddingMonster] = useState<boolean>(false);
  const [monsterName, setMonsterName] = useState<string>('');
  const [monsterHP, setMonsterHP] = useState<number>(15);
  const [monsterAC, setMonsterAC] = useState<number>(13);
  const [monsterInitBonus, setMonsterInitBonus] = useState<number>(1);
  const [monsterCount, setMonsterCount] = useState<number>(1);

  // Combine party members and monsters into a unified combatants list
  const allCombatants: Combatant[] = useMemo(() => {
    const playerCombatants: Combatant[] = partyMembers.map((pm) => ({
      id: `player-${pm.id}`,
      name: pm.name,
      isPlayer: true,
      characterId: pm.id,
      avatarUrl: pm.portraitUrl,
      initiative: pm.initiativeBonus + 10, // default placeholder or rolled
      initiativeModifier: pm.initiativeBonus,
      ac: pm.ac,
      currentHP: pm.currentHP,
      maxHP: pm.maxHP,
      tempHP: pm.tempHP,
      conditions: pm.conditions.map((c) => ({ name: c })),
      crOrLevel: `Lv ${pm.level}`,
    }));

    const combined = [...playerCombatants, ...monsters];

    // Sort by initiative descending
    return combined.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return b.initiativeModifier - a.initiativeModifier;
    });
  }, [partyMembers, monsters]);

  // Turn Controls
  const handleNextTurn = () => {
    if (allCombatants.length === 0) return;
    const nextIdx = (currentTurnIndex + 1) % allCombatants.length;
    if (nextIdx === 0) {
      setRound((r) => r + 1);
    }
    setCurrentTurnIndex(nextIdx);
  };

  const handlePrevTurn = () => {
    if (allCombatants.length === 0) return;
    if (currentTurnIndex === 0) {
      if (round > 1) {
        setRound((r) => r - 1);
        setCurrentTurnIndex(allCombatants.length - 1);
      }
    } else {
      setCurrentTurnIndex((i) => i - 1);
    }
  };

  const handleRollInitiative = () => {
    // Re-roll monsters
    setMonsters((prev) =>
      prev.map((m) => {
        const roll = Math.floor(Math.random() * 20) + 1;
        return {
          ...m,
          initiative: roll + m.initiativeModifier,
        };
      })
    );
    setCurrentTurnIndex(0);
    setIsCombatActive(true);
  };

  const handleAddMonster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monsterName.trim()) return;

    const newMonsters: Combatant[] = [];
    const count = Math.max(1, monsterCount);

    for (let i = 1; i <= count; i++) {
      const name = count > 1 ? `${monsterName.trim()} #${i}` : monsterName.trim();
      const initRoll = Math.floor(Math.random() * 20) + 1 + monsterInitBonus;

      newMonsters.push({
        id: `monster-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        isPlayer: false,
        initiative: initRoll,
        initiativeModifier: monsterInitBonus,
        ac: monsterAC,
        currentHP: monsterHP,
        maxHP: monsterHP,
        tempHP: 0,
        conditions: [],
        crOrLevel: 'Monster',
      });
    }

    setMonsters((prev) => [...prev, ...newMonsters]);
    setIsAddingMonster(false);
    setMonsterName('');
    setMonsterCount(1);
  };

  const handleApplyTemplate = (tmpl: typeof QUICK_MONSTER_TEMPLATES[0]) => {
    setMonsterName(tmpl.name);
    setMonsterHP(tmpl.hp);
    setMonsterAC(tmpl.ac);
    setMonsterInitBonus(tmpl.init);
  };

  const handleDeleteMonster = (id: string) => {
    setMonsters((prev) => prev.filter((m) => m.id !== id));
    if (currentTurnIndex >= allCombatants.length - 1) {
      setCurrentTurnIndex(0);
    }
  };

  // Direct Damage & Healing
  const handleModifyCombatantHP = (combatant: Combatant, delta: number, isTemp = false) => {
    if (isTemp) {
      if (combatant.isPlayer && combatant.characterId) {
        onUpdatePartyHP(combatant.characterId, combatant.currentHP, delta);
      } else {
        setMonsters((prev) =>
          prev.map((m) => (m.id === combatant.id ? { ...m, tempHP: delta } : m))
        );
      }
      return;
    }

    if (combatant.isPlayer && combatant.characterId) {
      let newCurrent = combatant.currentHP;
      let newTemp = combatant.tempHP;

      if (delta < 0) {
        // Damage
        const dmg = Math.abs(delta);
        if (newTemp > 0) {
          if (dmg <= newTemp) {
            newTemp -= dmg;
          } else {
            const remainder = dmg - newTemp;
            newTemp = 0;
            newCurrent = Math.max(0, newCurrent - remainder);
          }
        } else {
          newCurrent = Math.max(0, newCurrent - dmg);
        }
      } else {
        // Healing
        newCurrent = Math.min(combatant.maxHP, combatant.currentHP + delta);
      }
      onUpdatePartyHP(combatant.characterId, newCurrent, newTemp);
    } else {
      // Monster
      setMonsters((prev) =>
        prev.map((m) => {
          if (m.id !== combatant.id) return m;
          let newHP = m.currentHP;
          if (delta < 0) {
            newHP = Math.max(0, m.currentHP + delta);
          } else {
            newHP = Math.min(m.maxHP, m.currentHP + delta);
          }
          return { ...m, currentHP: newHP };
        })
      );
    }
  };

  const activeCombatant = allCombatants[currentTurnIndex];

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* 1. Combat Controller Banner */}
      <div className="p-3 bg-[#0d0f17] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Swords size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)]">
                Tactical Combat Engine
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isCombatActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {isCombatActive ? `Round ${round} Active` : 'Encounter Standby'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {allCombatants.length} Combatants &bull; Initiative Order &amp; Turns
            </p>
          </div>
        </div>

        {/* Turn Navigation & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevTurn}
            disabled={!isCombatActive || (round === 1 && currentTurnIndex === 0)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 disabled:opacity-40 cursor-pointer"
            title="Previous Turn"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={handleNextTurn}
            disabled={!isCombatActive || allCombatants.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-xs"
            title="Advance to Next Turn"
          >
            <span>Next Turn</span>
            <SkipForward size={13} />
          </button>

          <button
            onClick={handleRollInitiative}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 cursor-pointer"
            title="Roll Initiative for all combatants"
          >
            <Sparkles size={12} />
            <span>Roll All</span>
          </button>

          <button
            onClick={() => setIsAddingMonster(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 cursor-pointer"
            title="Spawn Monsters/NPCs into combat"
          >
            <Plus size={12} />
            <span>+ Enemy</span>
          </button>
        </div>
      </div>

      {/* 2. Add Monster Modal */}
      {isAddingMonster && (
        <div className="p-3.5 bg-zinc-950/95 border-b border-red-500/40 animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
              <Skull size={13} />
              <span>Spawn Enemy / NPC Combatant</span>
            </h4>
            <button onClick={() => setIsAddingMonster(false)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>

          {/* Quick Archetype Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Quick Templates:</span>
            <div className="flex flex-wrap gap-1">
              {QUICK_MONSTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] transition-colors cursor-pointer"
                >
                  {tmpl.name} ({tmpl.hp} HP)
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddMonster} className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <div className="col-span-2">
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Name</label>
              <input
                type="text"
                value={monsterName}
                onChange={(e) => setMonsterName(e.target.value)}
                placeholder="E.g., Shadow Cultist"
                required
                className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Max HP</label>
              <input
                type="number"
                min={1}
                value={monsterHP}
                onChange={(e) => setMonsterHP(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-xs text-center focus:border-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">AC</label>
              <input
                type="number"
                min={1}
                value={monsterAC}
                onChange={(e) => setMonsterAC(parseInt(e.target.value, 10) || 10)}
                required
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-xs text-center focus:border-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Count</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={monsterCount}
                  onChange={(e) => setMonsterCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-xs text-center focus:border-red-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-xs shrink-0"
                >
                  Spawn
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. Initiative Combatants List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {allCombatants.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-2 font-mono">
            <Swords size={28} className="mx-auto text-zinc-600 opacity-60" />
            <p className="text-xs">No active combatants in initiative.</p>
          </div>
        ) : (
          allCombatants.map((c, idx) => {
            const isCurrentTurn = isCombatActive && idx === currentTurnIndex;
            const isDead = c.currentHP <= 0;
            const hpPercent = Math.max(0, Math.min(100, Math.round((c.currentHP / Math.max(1, c.maxHP)) * 100)));
            const inputVal = hpInputs[c.id] || '';

            return (
              <div
                key={c.id}
                className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                  isCurrentTurn
                    ? 'border-amber-400/90 bg-gradient-to-r from-amber-950/40 via-zinc-950/80 to-[#0d0f17] shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                    : isDead
                    ? 'border-red-900/40 bg-zinc-950/40 opacity-60'
                    : 'border-zinc-800/80 bg-[#0d0f17]/80 hover:border-zinc-700'
                }`}
              >
                {/* Left: Initiative Badge + Name + Tag */}
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold border font-mono ${
                      isCurrentTurn
                        ? 'bg-amber-500 text-black border-amber-300 shadow-xs'
                        : 'bg-zinc-900 text-amber-300 border-zinc-700'
                    }`}
                    title="Initiative Score"
                  >
                    <span className="text-xs font-extrabold">{c.initiative}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100 truncate text-xs font-[family-name:var(--font-heading)]">
                        {c.name}
                      </span>
                      {isCurrentTurn && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-black animate-pulse">
                          Turn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          c.isPlayer
                            ? 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                            : 'bg-red-950/80 text-red-300 border-red-800/60'
                        }`}
                      >
                        {c.isPlayer ? 'Hero' : 'Enemy'}
                      </span>
                      {isDead && (
                        <span className="text-[9px] font-bold text-red-400 uppercase">
                          Down
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: AC & HP Bar */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
                    <Shield size={12} className="text-zinc-500" />
                    <span className="font-bold text-zinc-300">{c.ac}</span>
                    <span className="text-[10px] text-zinc-500">AC</span>
                  </div>

                  <div className="w-28 sm:w-36 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-200">
                        {c.currentHP}/{c.maxHP}
                        {c.tempHP > 0 && <span className="text-cyan-300 font-normal"> (+{c.tempHP})</span>}
                      </span>
                      <span className="text-zinc-500">{hpPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          hpPercent <= 25 ? 'bg-red-500' : hpPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Quick Damage & Healing Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min={1}
                    value={inputVal}
                    onChange={(e) => setHpInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Amt"
                    className="w-14 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-center text-white focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(inputVal, 10);
                      if (!isNaN(val) && val > 0) {
                        handleModifyCombatantHP(c, -val);
                        setHpInputs((prev) => ({ ...prev, [c.id]: '' }));
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold cursor-pointer transition-colors"
                    title="Apply Damage"
                  >
                    - Dmg
                  </button>
                  <button
                    onClick={() => {
                      const val = parseInt(inputVal, 10);
                      if (!isNaN(val) && val > 0) {
                        handleModifyCombatantHP(c, val);
                        setHpInputs((prev) => ({ ...prev, [c.id]: '' }));
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold cursor-pointer transition-colors"
                    title="Apply Healing"
                  >
                    + Heal
                  </button>

                  {!c.isPlayer && (
                    <button
                      onClick={() => handleDeleteMonster(c.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Remove enemy"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
