// ============================================================================
// D&D 5e Character Engine
// Handles all math for Earl (Vesper Ashwood) — Human Rogue (Assassin)
// ============================================================================

import type { AbilityScores, AbilityName, Skill, SkillName, AssassinFeature } from './types';

// Base ability scores (Standard Array assignment)
const BASE_SCORES: Record<AbilityName, number> = {
  STR: 8,
  DEX: 17,
  CON: 13,
  INT: 14,
  WIS: 12,
  CHA: 10,
};

// ASI schedule: [level, ability, amount]
const ASI_SCHEDULE: [number, AbilityName, number][] = [
  [4, 'DEX', 1],
  [4, 'CON', 1],
  [8, 'DEX', 2],
];

// Saving throw proficiencies (Rogue)
const SAVE_PROFICIENCIES: AbilityName[] = ['DEX', 'INT'];

// Skill proficiencies
const SKILL_PROFICIENCIES: SkillName[] = [
  'Acrobatics', 'Deception', 'Investigation', 'Perception',
  'Sleight of Hand', 'Stealth',
];

// Expertise
const EXPERTISE_SKILLS: SkillName[] = ['Stealth', 'Sleight of Hand'];

// Skill → Ability mapping
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  'Acrobatics': 'DEX',
  'Animal Handling': 'WIS',
  'Arcana': 'INT',
  'Athletics': 'STR',
  'Deception': 'CHA',
  'History': 'INT',
  'Insight': 'WIS',
  'Intimidation': 'CHA',
  'Investigation': 'INT',
  'Medicine': 'WIS',
  'Nature': 'INT',
  'Perception': 'WIS',
  'Performance': 'CHA',
  'Persuasion': 'CHA',
  'Religion': 'INT',
  'Sleight of Hand': 'DEX',
  'Stealth': 'DEX',
  'Survival': 'WIS',
};

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

/**
 * Calculate the modifier for an ability score.
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Format a modifier as a string (e.g., "+3" or "-1").
 */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Calculate ability scores at a given level, applying ASIs.
 */
export function calculateAbilityScores(level: number): AbilityScores {
  const scores = { ...BASE_SCORES };

  // Apply ASIs that are at or below the current level
  for (const [asiLevel, ability, amount] of ASI_SCHEDULE) {
    if (level >= asiLevel) {
      scores[ability] = Math.min(20, scores[ability] + amount);
    }
  }

  const abilities: Partial<AbilityScores> = {};
  const profBonus = calculateProficiencyBonus(level);

  for (const [key, base] of Object.entries(scores) as [AbilityName, number][]) {
    const total = scores[key];
    const modifier = getModifier(total);
    const saveProficient = SAVE_PROFICIENCIES.includes(key);

    abilities[key] = {
      name: key,
      label: ABILITY_LABELS[key],
      base,
      modifier,
      total,
      saveProficient,
      saveBonus: modifier + (saveProficient ? profBonus : 0),
    };
  }

  return abilities as AbilityScores;
}

/**
 * Proficiency bonus scales with level: +2 at 1, up to +6 at 17.
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * HP = 8 + CON mod at Level 1, then (5 + CON mod) per level.
 */
export function calculateHP(level: number, conMod: number): number {
  if (level <= 0) return 0;
  const lvl1HP = 8 + conMod;
  const additionalHP = (level - 1) * (5 + conMod);
  return lvl1HP + additionalHP;
}

/**
 * Sneak Attack dice: starts at 1d6 at level 1, gains +1d6 every odd level.
 */
export function calculateSneakAttackDice(level: number): number {
  return Math.ceil(level / 2);
}

/**
 * AC calculation (assumes leather armor for Rogue).
 * Leather: 11 + DEX mod. Studded Leather: 12 + DEX mod.
 */
export function calculateAC(dexMod: number, hasStuddedLeather: boolean = false): number {
  return (hasStuddedLeather ? 12 : 11) + dexMod;
}

/**
 * Initiative = DEX mod + penalties (e.g., Phantom Murmurs).
 */
export function calculateInitiative(dexMod: number, penalty: number = 0): number {
  return dexMod + penalty;
}

/**
 * Passive Perception = 10 + Perception bonus.
 */
export function calculatePassivePerception(wisMod: number, profBonus: number, proficient: boolean): number {
  return 10 + wisMod + (proficient ? profBonus : 0);
}

/**
 * Death Strike DC = 8 + DEX mod + Proficiency Bonus.
 */
export function calculateDeathStrikeDC(dexMod: number, profBonus: number): number {
  return 8 + dexMod + profBonus;
}

/**
 * Calculate all skills with bonuses.
 */
export function calculateSkills(level: number, abilities: AbilityScores): Skill[] {
  const profBonus = calculateProficiencyBonus(level);
  const skillNames = Object.keys(SKILL_ABILITIES) as SkillName[];

  return skillNames.map((name) => {
    const ability = SKILL_ABILITIES[name];
    const proficient = SKILL_PROFICIENCIES.includes(name);
    const expertise = EXPERTISE_SKILLS.includes(name);
    const abilityMod = abilities[ability].modifier;
    let bonus = abilityMod;
    if (expertise) {
      bonus += profBonus * 2;
    } else if (proficient) {
      bonus += profBonus;
    }

    return { name, ability, proficient, expertise, bonus };
  });
}

/**
 * Get Assassin subclass features based on level.
 */
export function getAssassinFeatures(level: number): AssassinFeature[] {
  return [
    {
      name: 'Bonus Proficiencies',
      level: 3,
      description: "You gain proficiency with the Poisoner's Kit and the Disguise Kit.",
      unlocked: level >= 3,
      mechanics: "Proficiency: Poisoner's Kit, Disguise Kit",
    },
    {
      name: 'Assassinate',
      level: 3,
      description: 'You have advantage on attack rolls against any creature that hasn\'t taken a turn in combat yet. Any hit you score against a surprised creature is a critical hit.',
      unlocked: level >= 3,
      mechanics: 'Advantage vs. creatures that haven\'t acted; Auto-crit on Surprised targets',
    },
    {
      name: 'Infiltration Expertise',
      level: 9,
      description: 'You can create false identities for yourself. You must spend 7 days and 25 gp to establish the history, profession, and affiliations for an identity.',
      unlocked: level >= 9,
      mechanics: '7 days + 25 gp → false identity with documentation',
    },
    {
      name: 'Impostor',
      level: 13,
      description: 'You gain the ability to unerringly mimic another person\'s speech, writing, and behavior after studying them for 3 hours. You gain advantage on Deception checks to pass as that person.',
      unlocked: level >= 13,
      mechanics: '3 hours observation → Advantage on Deception to impersonate',
    },
    {
      name: 'Death Strike',
      level: 17,
      description: 'When you attack and hit a creature that is surprised, it must make a Constitution saving throw. On a failed save, double the damage of your attack against the creature.',
      unlocked: level >= 17,
      mechanics: 'CON Save DC = 8 + DEX mod + Prof; Failed → DOUBLE total damage',
    },
  ];
}

/**
 * Get all Rogue class features for the current level.
 */
export function getRogueFeatures(level: number): string[] {
  const features: string[] = [];

  if (level >= 1) features.push('Expertise', 'Sneak Attack', 'Thieves\' Cant');
  if (level >= 2) features.push('Cunning Action');
  if (level >= 3) features.push('Roguish Archetype: Assassin');
  if (level >= 5) features.push('Uncanny Dodge');
  if (level >= 7) features.push('Evasion');
  if (level >= 11) features.push('Reliable Talent');
  if (level >= 14) features.push('Blindsense');
  if (level >= 15) features.push('Slippery Mind');
  if (level >= 18) features.push('Elusive');
  if (level >= 20) features.push('Stroke of Luck');

  return features;
}

/**
 * Get default inventory for Earl.
 */
export function getDefaultInventory(): import('./types').InventoryItem[] {
  return [
    {
      id: 'orphans-tithe',
      name: "The Orphan's Tithe",
      quantity: 1,
      weight: 1,
      description: 'A scaling vestige dagger bound with tormented souls.',
      equipped: true,
      category: 'weapon',
    },
    {
      id: 'shortsword',
      name: 'Shortsword',
      quantity: 1,
      weight: 2,
      description: 'A nimble blade favored by rogues.',
      equipped: true,
      category: 'weapon',
    },
    {
      id: 'leather-armor',
      name: 'Leather Armor',
      quantity: 1,
      weight: 10,
      description: 'Light armor made from supple leather. AC 11 + DEX mod.',
      equipped: true,
      category: 'armor',
    },
    {
      id: 'thieves-tools',
      name: "Thieves' Tools",
      quantity: 1,
      weight: 1,
      description: 'A set of tools for picking locks and disarming traps.',
      equipped: false,
      category: 'tool',
    },
    {
      id: 'poisoners-kit',
      name: "Poisoner's Kit",
      quantity: 1,
      weight: 2,
      description: 'Vials, mortars, and compounds for crafting poisons.',
      equipped: false,
      category: 'tool',
    },
    {
      id: 'disguise-kit',
      name: 'Disguise Kit',
      quantity: 1,
      weight: 3,
      description: 'Cosmetics, hair dye, and props for creating disguises.',
      equipped: false,
      category: 'tool',
    },
    {
      id: 'daggers',
      name: 'Dagger',
      quantity: 2,
      weight: 1,
      description: 'Simple throwing daggers.',
      equipped: false,
      category: 'weapon',
    },
    {
      id: 'backpack',
      name: 'Backpack',
      quantity: 1,
      weight: 5,
      description: 'A sturdy leather backpack.',
      equipped: true,
      category: 'gear',
    },
    {
      id: 'rations',
      name: 'Rations (1 day)',
      quantity: 5,
      weight: 2,
      description: 'Dried food suitable for extended travel.',
      equipped: false,
      category: 'consumable',
    },
    {
      id: 'rope',
      name: 'Rope, Silk (50 ft)',
      quantity: 1,
      weight: 5,
      description: 'Fine silk rope, strong yet lightweight.',
      equipped: false,
      category: 'gear',
    },
  ];
}

/**
 * Get default attack options for Earl.
 */
export function getDefaultAttacks(): import('./types').AttackOption[] {
  return [
    {
      id: 'orphans-tithe-attack',
      name: "The Orphan's Tithe",
      attackBonus: 7,
      damage: '1d4 + 4',
      damageType: 'Piercing',
      range: 'Melee (5 ft)',
      notes: 'Vestige blade. +1 to hit/dmg. On crit, target suffers Soul Bleed.',
      equipped: true,
    },
    {
      id: 'shortsword-attack',
      name: 'Shortsword',
      attackBonus: 6,
      damage: '1d6 + 3',
      damageType: 'Piercing',
      range: 'Melee (5 ft)',
      notes: 'Finesse, Light',
      equipped: true,
    },
    {
      id: 'dagger-throw',
      name: 'Throwing Dagger',
      attackBonus: 6,
      damage: '1d4 + 3',
      damageType: 'Piercing',
      range: '20/60 ft',
      notes: 'Finesse, Light, Thrown',
      equipped: false,
    },
  ];
}

/**
 * Get default feats and class features for Earl.
 */
export function getDefaultFeats(): import('./types').CustomFeat[] {
  return [
    {
      id: 'feat-alert',
      title: 'Alert Feat',
      description: '+5 bonus to initiative. You cannot be surprised while conscious. Other creatures don\'t get advantage on attack rolls against you as a result of being unseen by you.',
      source: 'Human Bonus Feat',
      level: 1,
    },
    {
      id: 'feat-assassinate',
      title: 'Assassinate',
      description: 'You have advantage on attack rolls against any creature that hasn\'t taken a turn in combat yet. Any hit you score against a surprised creature is a critical hit.',
      source: 'Rogue (Assassin)',
      level: 3,
    },
    {
      id: 'feat-cunning-action',
      title: 'Cunning Action',
      description: 'You can take a Bonus Action on each of your turns in combat to Dash, Disengage, or Hide.',
      source: 'Rogue Class Trait',
      level: 2,
    },
    {
      id: 'feat-uncanny-dodge',
      title: 'Uncanny Dodge',
      description: 'When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack\'s damage against you.',
      source: 'Rogue Class Trait',
      level: 5,
    },
    {
      id: 'feat-evasion',
      title: 'Evasion',
      description: 'When you are subjected to an effect that allows you to make a DEX saving throw to take only half damage, you take no damage on a success, and half damage on a failure.',
      source: 'Rogue Class Trait',
      level: 7,
    },
  ];
}

/**
 * Get default non-stat proficiencies for Earl.
 */
export function getDefaultProficiencies(): import('./types').NonStatProficiencies {
  return {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ["Thieves' Tools", "Poisoner's Kit", "Disguise Kit"],
    languages: ['Common', 'Elvish', 'Thieves\' Cant'],
  };
}

