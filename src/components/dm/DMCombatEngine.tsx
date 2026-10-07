'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Swords,
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
  Skull,
  User,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import type { Combatant, PartyMemberHUDState } from '@/lib/dm-types';
import type { CustomNPC } from '@/lib/npc-types';
import { concentrationDC, hpBand, hpPercent, HP_BAND_STYLES } from '@/lib/dm-hp';
import { npcToCombatants } from '@/lib/dm-combat';
import DMHPPopover, { anchorFromElement, type HPPopoverAnchor } from './DMHPPopover';

interface DMCombatEngineProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, currentHP: number, tempHP?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  externalCombatants?: Combatant[];
  onClearExternalCombatants?: () => void;
  customNPCs?: CustomNPC[];
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
  customNPCs = [],
}: DMCombatEngineProps) {
  // Combat State
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);

  // Monsters/Enemies
  const [monsters, setMonsters] = useState<Combatant[]>([]);
  const [hpInputs, setHpInputs] = useState<Record<string, string>>({});

  // Active HP Popover State
  const [activePopover, setActivePopover] = useState<{ combatant: Combatant; anchor: HPPopoverAnchor } | null>(null);

  // Concentration Alert Flash
  const [concentrationNotice, setConcentrationNotice] = useState<{
    combatantName: string;
    dc: number;
    spell?: string;
  } | null>(null);

  // Add Monster Form Modal
  const [isAddingMonster, setIsAddingMonster] = useState<boolean>(false);
  const [monsterName, setMonsterName] = useState<string>('');
  const [monsterHP, setMonsterHP] = useState<number>(15);
  const [monsterAC, setMonsterAC] = useState<number>(13);
  const [monsterInitBonus, setMonsterInitBonus] = useState<number>(1);
  const [monsterCount, setMonsterCount] = useState<number>(1);

  // Spawn from Codex Dropdown / Modal
  const [isCodexSpawnOpen, setIsCodexSpawnOpen] = useState<boolean>(false);
  const [selectedCodexNPCId, setSelectedCodexNPCId] = useState<string>('');
  const [codexSpawnCount, setCodexSpawnCount] = useState<number>(1);

  // Sync incoming external combatants (e.g. sent from NPC Codex)
  useEffect(() => {
    if (externalCombatants && externalCombatants.length > 0) {
      setMonsters((prev) => [...prev, ...externalCombatants]);
      onClearExternalCombatants?.();
    }
  }, [externalCombatants, onClearExternalCombatants]);

  // Unified combatants list (players + monsters, sorted by initiative)
  const allCombatants: Combatant[] = useMemo(() => {
    const playerCombatants: Combatant[] = partyMembers.map((pm) => ({
      id: `player-${pm.id}`,
      name: pm.name,
      isPlayer: true,
      characterId: pm.id,
      avatarUrl: pm.portraitUrl,
      initiative: pm.initiativeBonus + 10,
      initiativeModifier: pm.initiativeBonus,
      ac: pm.ac,
      currentHP: pm.currentHP,
      maxHP: pm.maxHP,
      tempHP: pm.tempHP,
      conditions: pm.conditions.map((c) => ({ name: c })),
      crOrLevel: `Lv ${pm.level}`,
    }));

    const combined = [...playerCombatants, ...monsters];

    return combined.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return b.initiativeModifier - a.initiativeModifier;
    });
  }, [partyMembers, monsters]);

  // Turn Controls with automatic reaction reset
  const handleNextTurn = () => {
    if (allCombatants.length === 0) return;
    const nextIdx = (currentTurnIndex + 1) % allCombatants.length;
    if (nextIdx === 0) {
      setRound((r) => r + 1);
    }
    setCurrentTurnIndex(nextIdx);

    // Reset reaction used for the combatant whose turn just started
    const nextCombatant = allCombatants[nextIdx];
    if (nextCombatant && !nextCombatant.isPlayer) {
      setMonsters((prev) =>
        prev.map((m) => (m.id === nextCombatant.id ? { ...m, hasUsedReaction: false } : m))
      );
    }
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

  const handleResetCombat = () => {
    if (confirm('End combat encounter and reset initiative turns?')) {
      setIsCombatActive(false);
      setRound(1);
      setCurrentTurnIndex(0);
      setConcentrationNotice(null);
    }
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

  const handleSpawnFromCodex = () => {
    const targetNPC = customNPCs.find((n) => n.id === selectedCodexNPCId);
    if (!targetNPC) return;

    const spawned = npcToCombatants(targetNPC, codexSpawnCount);
    setMonsters((prev) => [...prev, ...spawned]);
    setIsCodexSpawnOpen(false);
    setSelectedCodexNPCId('');
    setCodexSpawnCount(1);
  };

  const handleApplyTemplate = (tmpl: (typeof QUICK_MONSTER_TEMPLATES)[0]) => {
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

  // Modify Combatant HP and check for concentration
  const handleModifyCombatantHP = (combatant: Combatant, delta: number, isTemp = false) => {
    if (delta < 0 && combatant.isConcentrating) {
      const damageAmt = Math.abs(delta);
      const dc = concentrationDC(damageAmt);
      setConcentrationNotice({
        combatantName: combatant.name,
        dc,
        spell: combatant.concentrationSpell,
      });
    }

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
        newCurrent = Math.min(combatant.maxHP, combatant.currentHP + delta);
      }
      onUpdatePartyHP(combatant.characterId, newCurrent, newTemp);
    } else {
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

  const handleToggleMonsterConcentration = (monsterId: string) => {
    setMonsters((prev) =>
      prev.map((m) => (m.id === monsterId ? { ...m, isConcentrating: !m.isConcentrating } : m))
    );
  };

  const handleToggleMonsterReaction = (monsterId: string) => {
    setMonsters((prev) =>
      prev.map((m) => (m.id === monsterId ? { ...m, hasUsedReaction: !m.hasUsedReaction } : m))
    );
  };

  const activeCombatant = allCombatants[currentTurnIndex];
  const onDeckCombatant =
    allCombatants.length > 1
      ? allCombatants[(currentTurnIndex + 1) % allCombatants.length]
      : null;

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* 1. Tactical Command Header */}
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
                {isCombatActive ? `Round ${round} Active` : 'Standby'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {allCombatants.length} Combatants &bull; Initiative Order &amp; Turns
            </p>
          </div>
        </div>

        {/* Turn Navigation & Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handlePrevTurn}
            disabled={!isCombatActive || (round === 1 && currentTurnIndex === 0)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 disabled:opacity-30 cursor-pointer"
            title="Previous Turn"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={handleNextTurn}
            disabled={!isCombatActive || allCombatants.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-xs disabled:opacity-30 transition-transform active:scale-95"
            title="Advance to Next Turn"
          >
            <span>Next Turn</span>
            <SkipForward size={13} />
          </button>

          <button
            onClick={handleRollInitiative}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 cursor-pointer"
            title="Roll Initiative for all monsters"
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">Roll Monsters</span>
          </button>

          {/* Spawn from Codex */}
          {customNPCs.length > 0 && (
            <button
              onClick={() => setIsCodexSpawnOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-800/80 cursor-pointer"
              title="Spawn from NPC Codex"
            >
              <BookOpen size={12} />
              <span className="hidden sm:inline">From Codex</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingMonster(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 cursor-pointer"
            title="Spawn Custom Enemy"
          >
            <Plus size={12} />
            <span>+ Enemy</span>
          </button>

          {isCombatActive && (
            <button
              onClick={handleResetCombat}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-300 border border-zinc-800 cursor-pointer"
              title="End / Reset Combat"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Concentration Notice Banner */}
      {concentrationNotice && (
        <div className="p-2.5 bg-amber-950/60 border-b border-amber-500/50 flex items-center justify-between text-xs animate-fade-in text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>
              <strong>Concentration Check:</strong> {concentrationNotice.combatantName} must make a{' '}
              <strong className="text-amber-300">DC {concentrationNotice.dc} CON save</strong> to maintain{' '}
              {concentrationNotice.spell ? `"${concentrationNotice.spell}"` : 'concentration'}!
            </span>
          </div>
          <button
            onClick={() => setConcentrationNotice(null)}
            className="p-1 rounded text-amber-400 hover:text-white cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. Spotlight Turn Ribbon (Active Combatant + On Deck) */}
      {isCombatActive && activeCombatant && (
        <div className="p-3 bg-[#0d0f17]/95 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Active Acting Combatant */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400 bg-zinc-900 shadow-md">
                {activeCombatant.avatarUrl ? (
                  <img src={activeCombatant.avatarUrl} alt="" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-amber-300">
                    {activeCombatant.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded bg-amber-500 text-black font-extrabold text-[9px] uppercase shadow-xs">
                Turn
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-zinc-100 font-[family-name:var(--font-heading)]">
                  {activeCombatant.name}
                </h4>
                <span className="text-[10px] px-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Init {activeCombatant.initiative}
                </span>
                <span className="text-[10px] px-1.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  AC {activeCombatant.ac}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-zinc-300 text-xs">
                  HP: <strong className="text-white">{activeCombatant.currentHP}</strong> / {activeCombatant.maxHP}
                  {activeCombatant.tempHP > 0 && <span className="text-cyan-300"> (+{activeCombatant.tempHP})</span>}
                </span>
                {activeCombatant.crOrLevel && (
                  <span className="text-[10px] text-zinc-400">&bull; {activeCombatant.crOrLevel}</span>
                )}
              </div>
            </div>
          </div>

          {/* On Deck Preview */}
          {onDeckCombatant && (
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] w-full sm:w-auto shrink-0">
              <span className="text-zinc-500 uppercase text-[9px] font-bold">On Deck:</span>
              <div className="w-6 h-6 rounded-md overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0">
                {onDeckCombatant.avatarUrl ? (
                  <img src={onDeckCombatant.avatarUrl} alt="" className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                    {onDeckCombatant.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="font-bold text-zinc-300 truncate max-w-[120px]">{onDeckCombatant.name}</span>
              <span className="text-zinc-500 text-[10px] font-mono">({onDeckCombatant.initiative})</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Spawn From Codex Modal */}
      {isCodexSpawnOpen && (
        <div className="p-3.5 bg-zinc-950/95 border-b border-purple-500/40 animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
              <BookOpen size={13} />
              <span>Spawn Combatant from NPC Codex</span>
            </h4>
            <button onClick={() => setIsCodexSpawnOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Select Codex NPC</label>
              <select
                value={selectedCodexNPCId}
                onChange={(e) => setSelectedCodexNPCId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:border-purple-400"
              >
                <option value="">-- Choose an NPC / Monster --</option>
                {customNPCs.map((npc) => (
                  <option key={npc.id} value={npc.id}>
                    {npc.name} ({npc.category.toUpperCase()} &bull; HP {npc.maxHP} &bull; AC {npc.ac}
                    {npc.cr ? ` • CR ${npc.cr}` : ''})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Quantity</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={codexSpawnCount}
                  onChange={(e) => setCodexSpawnCount(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs text-center"
                />
                <button
                  onClick={handleSpawnFromCodex}
                  disabled={!selectedCodexNPCId}
                  className="flex-1 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Spawn into Combat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Custom Monster Modal */}
      {isAddingMonster && (
        <div className="p-3.5 bg-zinc-950/95 border-b border-red-500/40 animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
              <Skull size={13} />
              <span>Spawn Enemy Combatant</span>
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

      {/* 5. Initiative Combatants List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {allCombatants.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2 font-mono">
            <Swords size={32} className="mx-auto text-zinc-600 opacity-60" />
            <p className="text-xs">No active combatants in initiative.</p>
          </div>
        ) : (
          allCombatants.map((c, idx) => {
            const isCurrentTurn = isCombatActive && idx === currentTurnIndex;
            const isDead = c.currentHP <= 0;
            const hpPct = hpPercent(c);
            const band = hpBand(c);
            const bandStyle = HP_BAND_STYLES[band];
            const inputVal = hpInputs[c.id] || '';

            return (
              <div
                key={c.id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isCurrentTurn
                    ? 'border-amber-400/90 bg-gradient-to-r from-amber-950/40 via-zinc-950/80 to-[#0d0f17] shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                    : isDead
                    ? 'border-red-900/40 bg-zinc-950/40 opacity-60'
                    : 'border-zinc-800/80 bg-[#0d0f17]/80 hover:border-zinc-700'
                }`}
              >
                {/* Row 1 (Mobile/Tablet) or Left/Middle Section (Desktop): Initiative + Identity + AC + HP */}
                <div className="flex items-center justify-between gap-2.5 flex-1 min-w-0">
                  {/* Initiative Badge + Avatar + Name + Tags */}
                  <div className="flex items-center gap-2.5 min-w-0">
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

                    {c.avatarUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        <img src={c.avatarUrl} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-100 truncate text-xs font-[family-name:var(--font-heading)] max-w-[120px] sm:max-w-[180px]">
                          {c.name}
                        </span>
                        {isCurrentTurn && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-black animate-pulse shrink-0">
                            Turn
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            c.isPlayer
                              ? 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                              : 'bg-red-950/80 text-red-300 border-red-800/60'
                          }`}
                        >
                          {c.isPlayer ? 'Hero' : 'Hostile'}
                        </span>
                        <div className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px]">
                          <Shield size={10} className="text-zinc-500" />
                          <span className="font-bold text-zinc-300">{c.ac}</span>
                        </div>
                        {isDead && (
                          <span className="text-[9px] font-bold text-red-400 uppercase">Down</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HP bar with quick-click popover */}
                  <div
                    onClick={(e) =>
                      setActivePopover({
                        combatant: c,
                        anchor: anchorFromElement(e.currentTarget),
                      })
                    }
                    className="w-24 sm:w-32 lg:w-36 flex flex-col gap-1 cursor-pointer group shrink-0"
                    title="Click for full HP adjuster"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-200 group-hover:text-amber-300 truncate">
                        {c.currentHP}/{c.maxHP}
                        {c.tempHP > 0 && <span className="text-cyan-300 font-normal"> (+{c.tempHP})</span>}
                      </span>
                      <span className={`${bandStyle.text} text-[9px] shrink-0 ml-1`}>{hpPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${bandStyle.bar} transition-all duration-300`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 (Mobile/Tablet) or Right Section (Desktop): Reaction, Conc & Quick HP controls */}
                <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 border-t border-zinc-800/60 lg:border-t-0 lg:pt-0 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Reaction & Concentration Badges */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleMonsterReaction(c.id)}
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-colors ${
                        c.hasUsedReaction
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:text-zinc-400'
                      }`}
                      title="Toggle Reaction status (resets on turn start)"
                    >
                      {c.hasUsedReaction ? 'React Used' : 'React Ready'}
                    </button>

                    <button
                      onClick={() => handleToggleMonsterConcentration(c.id)}
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-colors ${
                        c.isConcentrating
                          ? 'bg-purple-950/80 text-purple-300 border-purple-700/80 animate-pulse'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:text-zinc-400'
                      }`}
                      title="Toggle Concentration tracking"
                    >
                      {c.isConcentrating ? '🔮 Conc' : 'Conc'}
                    </button>
                  </div>

                  {/* Steppers, Custom HP Input & Actions */}
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleModifyCombatantHP(c, -5)}
                        className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-red-950 text-red-300 border border-zinc-800 text-[10px] font-bold cursor-pointer"
                        title="Quick -5 HP"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleModifyCombatantHP(c, -1)}
                        className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-red-950 text-red-300 border border-zinc-800 text-[10px] font-bold cursor-pointer"
                        title="Quick -1 HP"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleModifyCombatantHP(c, 5)}
                        className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-emerald-950 text-emerald-300 border border-zinc-800 text-[10px] font-bold cursor-pointer"
                        title="Quick +5 HP"
                      >
                        +5
                      </button>
                    </div>

                    <input
                      type="number"
                      min={1}
                      value={inputVal}
                      onChange={(e) => setHpInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Amt"
                      className="w-11 sm:w-12 px-1 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-center text-white focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val > 0) {
                          handleModifyCombatantHP(c, -val);
                          setHpInputs((prev) => ({ ...prev, [c.id]: '' }));
                        }
                      }}
                      className="px-1.5 sm:px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold cursor-pointer"
                      title="Apply Damage"
                    >
                      -Dmg
                    </button>
                    <button
                      onClick={() => {
                        const val = parseInt(inputVal, 10);
                        if (!isNaN(val) && val > 0) {
                          handleModifyCombatantHP(c, val);
                          setHpInputs((prev) => ({ ...prev, [c.id]: '' }));
                        }
                      }}
                      className="px-1.5 sm:px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold cursor-pointer"
                      title="Apply Healing"
                    >
                      +Heal
                    </button>

                    {!c.isPlayer && (
                      <button
                        onClick={() => handleDeleteMonster(c.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Remove enemy"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating HP Popover */}
      {activePopover && (
        <DMHPPopover
          anchor={activePopover.anchor}
          title={activePopover.combatant.name}
          subtitle={`AC ${activePopover.combatant.ac} • Init ${activePopover.combatant.initiative}`}
          ac={activePopover.combatant.ac}
          hp={{
            currentHP: activePopover.combatant.currentHP,
            maxHP: activePopover.combatant.maxHP,
            tempHP: activePopover.combatant.tempHP,
          }}
          onChange={(nextHP, damageTaken) => {
            if (damageTaken && activePopover.combatant.isConcentrating) {
              const dc = concentrationDC(damageTaken);
              setConcentrationNotice({
                combatantName: activePopover.combatant.name,
                dc,
                spell: activePopover.combatant.concentrationSpell,
              });
            }

            if (activePopover.combatant.isPlayer && activePopover.combatant.characterId) {
              onUpdatePartyHP(
                activePopover.combatant.characterId,
                nextHP.currentHP,
                nextHP.tempHP
              );
            } else {
              setMonsters((prev) =>
                prev.map((m) =>
                  m.id === activePopover.combatant.id
                    ? { ...m, currentHP: nextHP.currentHP, tempHP: nextHP.tempHP }
                    : m
                )
              );
            }
          }}
          onClose={() => setActivePopover(null)}
          conditions={activePopover.combatant.conditions.map((c) => c.name)}
          onToggleCondition={(cond) => {
            if (activePopover.combatant.isPlayer && activePopover.combatant.characterId) {
              onTogglePartyCondition(activePopover.combatant.characterId, cond);
            } else {
              setMonsters((prev) =>
                prev.map((m) => {
                  if (m.id !== activePopover.combatant.id) return m;
                  const hasCond = m.conditions.some((c) => c.name === cond);
                  return {
                    ...m,
                    conditions: hasCond
                      ? m.conditions.filter((c) => c.name !== cond)
                      : [...m.conditions, { name: cond }],
                  };
                })
              );
            }
          }}
        />
      )}
    </div>
  );
}
