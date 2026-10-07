import type { Combatant } from '@/lib/dm-types';
import type { CustomNPC } from '@/lib/npc-types';

const d20 = () => Math.floor(Math.random() * 20) + 1;

/** Build a fresh, initiative-rolled combatant from a Codex NPC. Call from event handlers only. */
export function npcToCombatant(npc: CustomNPC, label?: string): Combatant {
  const initBonus = npc.initiativeBonus ?? Math.floor((npc.stats.dex - 10) / 2);
  return {
    id: `npc-${npc.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: label ?? npc.name,
    isPlayer: false,
    avatarUrl: npc.portraitUrl,
    initiative: d20() + initBonus,
    initiativeModifier: initBonus,
    ac: npc.ac,
    currentHP: npc.maxHP,
    maxHP: npc.maxHP,
    tempHP: 0,
    conditions: [],
    crOrLevel: npc.cr ? `CR ${npc.cr}` : npc.category === 'boss' ? 'Boss' : 'NPC',
    notes: `${npc.creatureType}${npc.alignment ? ` • ${npc.alignment}` : ''}`,
  };
}

/** Spawn `count` copies, numbering them (#1, #2…) when more than one. */
export function npcToCombatants(npc: CustomNPC, count: number): Combatant[] {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, (_, i) => npcToCombatant(npc, n > 1 ? `${npc.name} #${i + 1}` : npc.name));
}
