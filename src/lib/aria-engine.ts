import type { AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery } from './types';
import { getModifier } from './character-engine';

export type LunarPhase = 'full' | 'new' | 'crescent';

export interface SpellItem {
  id: string;
  name: string;
  level: number; // 0 for Cantrip, 1-5 for spells
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damageDice?: string;
  phaseAffinity?: LunarPhase;
}

export interface SimpleAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface AriaState {
  id: string;
  name: string;
  subline: string;
  race: string;
  characterClass: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;

  abilityScores: SimpleAbilityScores;
  savingThrowProficiencies: AbilityName[];

  combat: {
    currentHP: number;
    maxHP: number;
    tempHP: number;
    ac: number;
    initiative: number;
    speed: number;
    deathSaves: { successes: number; failures: number };
  };

  lunarEngine: {
    currentPhase: LunarPhase;
    sorceryPointsMax: number;
    sorceryPointsCurrent: number;
    innateSorceryActive: boolean;
    innateSorceryUses: number;
    innateSorceryMaxUses: number;
    metamagic: {
      quickened: boolean;
      twinned: boolean;
      subtle: boolean;
    };
  };

  spellcasting: {
    spellSaveDC: number;
    spellAttackBonus: number;
    slots: {
      1: { max: number; used: number };
      2: { max: number; used: number };
      3: { max: number; used: number };
      4: { max: number; used: number };
      5: { max: number; used: number };
    };
    spells: SpellItem[];
  };

  inventory: InventoryItem[];
  currency: Currency;
  notes: string;
  journal: JournalEntry[];
  mysteries: CampaignMystery[];
  classes?: import('./types').ClassLevel[];
  overrides?: import('./types').CombatOverrides;
  skills?: import('./types').Skill[];
  attacks?: import('./types').AttackOption[];
  feats?: import('./types').CustomFeat[];
  proficiencies?: import('./types').NonStatProficiencies;
}

export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function getSorcererSpellSlots(level: number) {
  const slots = {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
  };

  if (level >= 1) slots[1].max = level >= 3 ? 4 : level === 2 ? 3 : 2;
  if (level >= 3) slots[2].max = level >= 4 ? 3 : 2;
  if (level >= 5) slots[3].max = level >= 6 ? 3 : 2;
  if (level >= 7) slots[4].max = level >= 9 ? 3 : level === 8 ? 2 : 1;
  if (level >= 9) slots[5].max = level >= 10 ? 2 : 1;

  return slots;
}

export function calculateAriaStats(state: AriaState): AriaState {
  const level = state.level;
  const prof = getProficiencyBonus(level);
  const chaMod = getModifier(state.abilityScores.CHA);
  const conMod = getModifier(state.abilityScores.CON);
  const dexMod = getModifier(state.abilityScores.DEX);

  // Max HP: 6 + CON mod at Lv 1, + (4 + CON mod) per level thereafter
  const calculatedMaxHP = 6 + conMod + (level - 1) * (4 + conMod);

  // Base Spell Save DC: 8 + Prof + CHA
  // +1 if Innate Sorcery is active
  const baseDC = 8 + prof + chaMod;
  const spellSaveDC = state.lunarEngine.innateSorceryActive ? baseDC + 1 : baseDC;

  // Spell Attack Bonus: Prof + CHA
  const spellAttackBonus = prof + chaMod;

  // AC: 14 base + DEX mod (16)
  const ac = 14 + dexMod;

  const slots = getSorcererSpellSlots(level);

  return {
    ...state,
    combat: {
      ...state.combat,
      maxHP: calculatedMaxHP,
      currentHP: Math.min(state.combat.currentHP, calculatedMaxHP),
      ac,
      initiative: dexMod,
    },
    lunarEngine: {
      ...state.lunarEngine,
      sorceryPointsMax: level,
      sorceryPointsCurrent: Math.min(state.lunarEngine.sorceryPointsCurrent, level),
    },
    spellcasting: {
      ...state.spellcasting,
      spellSaveDC,
      spellAttackBonus,
      slots: {
        1: { ...slots[1], used: Math.min(state.spellcasting.slots[1]?.used || 0, slots[1].max) },
        2: { ...slots[2], used: Math.min(state.spellcasting.slots[2]?.used || 0, slots[2].max) },
        3: { ...slots[3], used: Math.min(state.spellcasting.slots[3]?.used || 0, slots[3].max) },
        4: { ...slots[4], used: Math.min(state.spellcasting.slots[4]?.used || 0, slots[4].max) },
        5: { ...slots[5], used: Math.min(state.spellcasting.slots[5]?.used || 0, slots[5].max) },
      },
    },
  };
}

export function createDefaultAriaState(): AriaState {
  return calculateAriaStats({
    id: 'aria',
    name: 'Aria Sil\'aveth',
    subline: 'Lunar Weaver of Starlight',
    race: 'High Elf',
    characterClass: 'Sorcerer',
    subclass: 'Lunar Sorcery',
    level: 10,
    background: 'Celestial Weaver',
    alignment: 'Neutral Good',

    abilityScores: {
      STR: 10,
      DEX: 14,
      CON: 14,
      INT: 12,
      WIS: 12,
      CHA: 20,
    },
    savingThrowProficiencies: ['CON', 'CHA'],

    combat: {
      currentHP: 62,
      maxHP: 62,
      tempHP: 0,
      ac: 16,
      initiative: 2,
      speed: 30,
      deathSaves: { successes: 0, failures: 0 },
    },

    lunarEngine: {
      currentPhase: 'full',
      sorceryPointsMax: 10,
      sorceryPointsCurrent: 10,
      innateSorceryActive: false,
      innateSorceryUses: 2,
      innateSorceryMaxUses: 2,
      metamagic: {
        quickened: true,
        twinned: true,
        subtle: true,
      },
    },

    spellcasting: {
      spellSaveDC: 17,
      spellAttackBonus: 9,
      slots: {
        1: { max: 4, used: 0 },
        2: { max: 3, used: 0 },
        3: { max: 3, used: 0 },
        4: { max: 3, used: 0 },
        5: { max: 2, used: 0 },
      },
      spells: [
        { id: 'sacred-flame', name: 'Sacred Flame', level: 0, school: 'Evocation', castingTime: '1 Action', range: '60 ft', components: 'V, S', duration: 'Instantaneous', description: 'Flame-like radiance descends on a creature. DEX save DC 17 or take 2d8 radiant damage.', damageDice: '2d8' },
        { id: 'light', name: 'Light', level: 0, school: 'Evocation', castingTime: '1 Action', range: 'Touch', components: 'V, M', duration: '1 hour', description: 'Touch one object to make it glow brightly for 20 ft radius.' },
        { id: 'ray-of-frost', name: 'Ray of Frost', level: 0, school: 'Evocation', castingTime: '1 Action', range: '60 ft', components: 'V, S', duration: 'Instantaneous', description: 'Ranged spell attack. 2d8 cold damage and speed reduced by 10 ft.', damageDice: '2d8' },
        { id: 'minor-illusion', name: 'Minor Illusion', level: 0, school: 'Illusion', castingTime: '1 Action', range: '30 ft', components: 'S, M', duration: '1 minute', description: 'Create a sound or an image of an object.' },
        { id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', castingTime: '1 Reaction', range: 'Self', components: 'V, S', duration: '1 Round', description: '+5 bonus to AC until start of next turn. Phase discount: Full Moon.', phaseAffinity: 'full' },
        { id: 'magic-missile', name: 'Magic Missile', level: 1, school: 'Evocation', castingTime: '1 Action', range: '120 ft', components: 'V, S', duration: 'Instantaneous', description: 'Create 3 darts. Each deals 1d4+1 force damage automatically.', damageDice: '3d4+3' },
        { id: 'guiding-bolt', name: 'Guiding Bolt', level: 1, school: 'Evocation', castingTime: '1 Action', range: '120 ft', components: 'V, S', duration: '1 Round', description: 'Ranged spell attack. 4d6 radiant damage and next attack against target has advantage.', damageDice: '4d6' },
        { id: 'misty-step', name: 'Misty Step', level: 2, school: 'Conjuration', castingTime: '1 Bonus Action', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Teleport up to 30 feet to an unoccupied space you can see.' },
        { id: 'mirror-image', name: 'Mirror Image', level: 2, school: 'Illusion', castingTime: '1 Action', range: 'Self', components: 'V, S', duration: '1 minute', description: 'Create 3 illusory duplicates of yourself to absorb attacks.', phaseAffinity: 'crescent' },
        { id: 'moonbeam', name: 'Moonbeam', level: 2, school: 'Evocation', castingTime: '1 Action', range: '120 ft', components: 'V, S, M', duration: 'Concentration (1 min)', description: '5ft radius cylinder of silvery light. CON save or 2d10 radiant damage.', damageDice: '2d10', phaseAffinity: 'full' },
        { id: 'darkness', name: 'Darkness', level: 2, school: 'Evocation', castingTime: '1 Action', range: '60 ft', components: 'V, M', duration: 'Concentration (10 min)', description: 'Magical darkness fills a 15-foot radius sphere.', phaseAffinity: 'new' },
        { id: 'fireball', name: 'Fireball', level: 3, school: 'Evocation', castingTime: '1 Action', range: '150 ft', components: 'V, S, M', duration: 'Instantaneous', description: 'Bright streak flashes to a point. 20ft sphere DEX save or 8d6 fire damage.', damageDice: '8d6' },
        { id: 'counterspell', name: 'Counterspell', level: 3, school: 'Abjuration', castingTime: '1 Reaction', range: '60 ft', components: 'S', duration: 'Instantaneous', description: 'Interrupt a creature casting a spell of 3rd level or lower.', phaseAffinity: 'full' },
        { id: 'vampiric-touch', name: 'Vampiric Touch', level: 3, school: 'Necromancy', castingTime: '1 Action', range: 'Touch', components: 'V, S', duration: 'Concentration (1 min)', description: 'Melee spell attack. 3d6 necrotic damage, heal half damage dealt.', damageDice: '3d6', phaseAffinity: 'new' },
        { id: 'dimension-door', name: 'Dimension Door', level: 4, school: 'Conjuration', castingTime: '1 Action', range: '500 ft', components: 'V', duration: 'Instantaneous', description: 'Teleport yourself and one willing creature to any destination.' },
        { id: 'invisibility-greater', name: 'Greater Invisibility', level: 4, school: 'Illusion', castingTime: '1 Action', range: 'Touch', components: 'V, S', duration: 'Concentration (1 min)', description: 'Target becomes invisible even when attacking or casting spells.', phaseAffinity: 'crescent' },
        { id: 'synaptic-static', name: 'Synaptic Static', level: 5, school: 'Enchantment', castingTime: '1 Action', range: '120 ft', components: 'V, S', duration: 'Instantaneous', description: 'Psychic explosion in 20ft sphere. INT save or 8d6 psychic damage and d6 penalty to rolls.', damageDice: '8d6' },
      ],
    },

    inventory: [
      { id: 'staff-of-lunar-weaver', name: 'Staff of the Moon Weaver', quantity: 1, weight: 4, equipped: true, category: 'weapon', description: '+1 bonus to spell attack rolls & spell save DC. Focus for lunar sorcery.' },
      { id: 'sorcerer-robes', name: 'Robes of Celestial Weaving', quantity: 1, weight: 3, equipped: true, category: 'armor', description: 'Grants AC 14 + DEX mod (AC 16).' },
      { id: 'moonstone-pendant', name: 'Pendant of the Silver Crescent', quantity: 1, weight: 0.5, equipped: true, category: 'gear', description: 'Emits a soft silvery glow when a spell slot is spent.' },
      { id: 'spell-component-pouch', name: 'Component Pouch', quantity: 1, weight: 2, equipped: true, category: 'gear', description: 'Contains material components for sorcerer spells.' },
    ],

    currency: { pp: 5, gp: 240, ep: 0, sp: 35, cp: 10 },

    notes: `### Celestial Lineage
Aria's powers stem directly from the ancient lunar alignment during the night of her birth. She controls the cosmic tides of spellcraft.

### Lunar Sorcery Features
- **Lunar Embodiment**: Learn bonus spells based on current Lunar Phase.
- **Lunar Boons**: Spells corresponding to active Lunar Phase require 1 less Sorcery Point when metamagic is applied.
- **Innate Sorcery**: Unleash cosmic focus for 1 minute (+1 DC, Advantage on spell attacks).`,

    journal: [
      {
        id: 'aria-j1',
        title: 'The Ashen Pact Alignment',
        timestamp: '1492 DR, Night of the Blood Moon',
        content: 'Met Earl in the shadowed alleys of Baldur\'s Gate. He moves like a phantom; I weave the starlight. Together our fates are linked by the astral weave.',
        category: 'quest',
      },
    ],

    mysteries: [
      {
        id: 'mystery-lunar',
        title: 'The Eclipse Prophecy',
        description: 'An ancient star map indicates a coming cosmic eclipse that will merge the shadowfell with the celestial realm.',
        clues: ['Fragment of silver parchment', 'Lunar alignment chart'],
        resolved: false,
      },
    ],
  });
}
