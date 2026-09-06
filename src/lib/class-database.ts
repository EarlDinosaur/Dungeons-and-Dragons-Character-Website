// ============================================================================
// D&D 5e Class Database & Multiclassing Engine
// ============================================================================

import type { AbilityName } from './types';

export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none';

export interface ClassDefinition {
  name: string;
  hitDie: string; // e.g. "d12", "d10", "d8", "d6"
  hitDieValue: number; // 12, 10, 8, 6
  primaryAbility: AbilityName[];
  savingThrows: AbilityName[];
  spellcastingType: SpellcastingType;
  subclasses: string[];
  description: string;
}

export const DND_CLASSES: Record<string, ClassDefinition> = {
  Barbarian: {
    name: 'Barbarian',
    hitDie: 'd12',
    hitDieValue: 12,
    primaryAbility: ['STR'],
    savingThrows: ['STR', 'CON'],
    spellcastingType: 'none',
    subclasses: [
      'Path of the Berserker',
      'Path of the Totem Warrior',
      'Path of the Zealot',
      'Path of Wild Magic',
      'Path of the Ancestral Guardian',
      'Path of the Storm Herald',
      'Path of the Beast',
    ],
    description: 'A fierce warrior of primitive background who can enter a battle rage.',
  },
  Bard: {
    name: 'Bard',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['CHA'],
    savingThrows: ['DEX', 'CHA'],
    spellcastingType: 'full',
    subclasses: [
      'College of Lore',
      'College of Valor',
      'College of Glamour',
      'College of Swords',
      'College of Eloquence',
      'College of Creation',
      'College of Whispers',
    ],
    description: 'An inspiring magician whose power echoes the music of creation.',
  },
  Cleric: {
    name: 'Cleric',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['WIS'],
    savingThrows: ['WIS', 'CHA'],
    spellcastingType: 'full',
    subclasses: [
      'Life Domain',
      'Light Domain',
      'Tempest Domain',
      'War Domain',
      'Trickery Domain',
      'Knowledge Domain',
      'Nature Domain',
      'Forge Domain',
      'Grave Domain',
      'Peace Domain',
      'Twilight Domain',
      'Order Domain',
    ],
    description: 'A priestly champion who wields divine magic in service of a higher power.',
  },
  Druid: {
    name: 'Druid',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['WIS'],
    savingThrows: ['INT', 'WIS'],
    spellcastingType: 'full',
    subclasses: [
      'Circle of the Land',
      'Circle of the Moon',
      'Circle of Dreams',
      'Circle of the Shepherd',
      'Circle of Spores',
      'Circle of Stars',
      'Circle of Wildfire',
    ],
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.',
  },
  Fighter: {
    name: 'Fighter',
    hitDie: 'd10',
    hitDieValue: 10,
    primaryAbility: ['STR', 'DEX'],
    savingThrows: ['STR', 'CON'],
    spellcastingType: 'none', // Eldritch Knight is third caster
    subclasses: [
      'Champion',
      'Battle Master',
      'Eldritch Knight',
      'Arcane Archer',
      'Cavalier',
      'Samurai',
      'Rune Knight',
      'Psi Warrior',
    ],
    description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  },
  Monk: {
    name: 'Monk',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['DEX', 'WIS'],
    savingThrows: ['STR', 'DEX'],
    spellcastingType: 'none',
    subclasses: [
      'Way of the Open Hand',
      'Way of Shadow',
      'Way of the Four Elements',
      'Way of the Kensei',
      'Way of the Sun Soul',
      'Way of Mercy',
      'Way of the Astral Self',
      'Way of the Draconic Disciple',
    ],
    description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.',
  },
  Paladin: {
    name: 'Paladin',
    hitDie: 'd10',
    hitDieValue: 10,
    primaryAbility: ['STR', 'CHA'],
    savingThrows: ['WIS', 'CHA'],
    spellcastingType: 'half',
    subclasses: [
      'Oath of Devotion',
      'Oath of Vengeance',
      'Oath of the Ancients',
      'Oath of Conquest',
      'Oath of Redemption',
      'Oath of Glory',
      'Oath of the Watchers',
      'Oathbreaker',
    ],
    description: 'A holy warrior bound to a sacred oath.',
  },
  Ranger: {
    name: 'Ranger',
    hitDie: 'd10',
    hitDieValue: 10,
    primaryAbility: ['DEX', 'WIS'],
    savingThrows: ['STR', 'DEX'],
    spellcastingType: 'half',
    subclasses: [
      'Hunter',
      'Beast Master',
      'Gloom Stalker',
      'Horizon Walker',
      'Monster Slayer',
      'Fey Wanderer',
      'Swarmkeeper',
      'Drakewarden',
    ],
    description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization.',
  },
  Rogue: {
    name: 'Rogue',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['DEX'],
    savingThrows: ['DEX', 'INT'],
    spellcastingType: 'none', // Arcane Trickster & Justicar are third casters
    subclasses: [
      'Bloodknife',
      'Daredevil',
      'Fencer',
      'Gambler',
      'Justicar',
      'Ruffian',
      'Saboteur',
      'Skinchanger',
      'Surgeon',
      'Alternate Assassin',
      'Assassin',
      'Thief',
      'Arcane Trickster',
      'Swashbuckler',
      'Inquisitive',
      'Mastermind',
      'Phantom',
      'Soulknife',
    ],
    description: 'A scoundrel who uses stealth, martial exploits, trickery, or specialized techniques to overcome obstacles and enemies.',
  },
  Sorcerer: {
    name: 'Sorcerer',
    hitDie: 'd6',
    hitDieValue: 6,
    primaryAbility: ['CHA'],
    savingThrows: ['CON', 'CHA'],
    spellcastingType: 'full',
    subclasses: [
      'Lunar Sorcery',
      'Draconic Bloodline',
      'Wild Magic',
      'Shadow Magic',
      'Divine Soul',
      'Storm Sorcery',
      'Aberrant Mind',
      'Clockwork Soul',
    ],
    description: 'A spellcaster who draws on inherent magic from a gift or an ancestor.',
  },
  Warlock: {
    name: 'Warlock',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['CHA'],
    savingThrows: ['WIS', 'CHA'],
    spellcastingType: 'pact',
    subclasses: [
      'The Fiend',
      'The Hexblade',
      'The Archfey',
      'The Great Old One',
      'The Celestial',
      'The Fathomless',
      'The Genie',
      'The Undead',
    ],
    description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.',
  },
  Wizard: {
    name: 'Wizard',
    hitDie: 'd6',
    hitDieValue: 6,
    primaryAbility: ['INT'],
    savingThrows: ['INT', 'WIS'],
    spellcastingType: 'full',
    subclasses: [
      'School of Evocation',
      'School of Abjuration',
      'School of Conjuration',
      'School of Divination',
      'School of Enchantment',
      'School of Illusion',
      'School of Necromancy',
      'School of Transmutation',
      'Bladesinging',
      'Order of Scribes',
      'War Magic',
    ],
    description: 'A scholarly magic-user capable of manipulating the structures of reality.',
  },
  Artificer: {
    name: 'Artificer',
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['INT'],
    savingThrows: ['CON', 'INT'],
    spellcastingType: 'half',
    subclasses: [
      'Alchemist',
      'Armorer',
      'Artillerist',
      'Battle Smith',
    ],
    description: 'A master of invention, using ingenuity and magic to unlock extraordinary capabilities in objects.',
  },
};

/**
 * Get class definition by name. Returns fallback if not found.
 */
export function getClassDefinition(className: string): ClassDefinition {
  const normalized = className.trim();
  const found = Object.keys(DND_CLASSES).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );

  if (found) return DND_CLASSES[found];

  // Default fallback for custom or unlisted classes
  return {
    name: className,
    hitDie: 'd8',
    hitDieValue: 8,
    primaryAbility: ['DEX'],
    savingThrows: ['DEX', 'INT'],
    spellcastingType: 'none',
    subclasses: ['Custom Archetype'],
    description: 'Custom character class.',
  };
}

/**
 * Calculate total multiclass spellcaster level (for 5e spell slot table).
 */
export function calculateMulticlassSpellcasterLevel(
  classes: Array<{ className: string; subclass?: string; level: number }>
): number {
  let totalCasterLevel = 0;

  for (const c of classes) {
    const def = getClassDefinition(c.className);
    if (def.spellcastingType === 'full') {
      totalCasterLevel += c.level;
    } else if (def.spellcastingType === 'half') {
      totalCasterLevel += Math.floor(c.level / 2);
    } else if (def.spellcastingType === 'third') {
      if (
        c.subclass &&
        (c.subclass.includes('Eldritch Knight') || c.subclass.includes('Arcane Trickster') || c.subclass.includes('Justicar'))
      ) {
        totalCasterLevel += Math.floor(c.level / 3);
      }
    } else if (def.spellcastingType === 'none') {
      if (
        c.subclass &&
        (c.subclass.includes('Eldritch Knight') || c.subclass.includes('Arcane Trickster') || c.subclass.includes('Justicar'))
      ) {
        totalCasterLevel += Math.floor(c.level / 3);
      }
    }
  }

  return totalCasterLevel;
}

/**
 * Check if character has any spellcasting class or spellcasting subclass.
 */
export function hasSpellcastingClass(
  classes: Array<{ className: string; subclass?: string }>
): boolean {
  if (!classes || classes.length === 0) return false;
  return classes.some((c) => {
    const def = getClassDefinition(c.className);
    if (def.spellcastingType !== 'none') return true;
    if (
      c.subclass &&
      (c.subclass.includes('Eldritch Knight') || c.subclass.includes('Arcane Trickster') || c.subclass.includes('Justicar'))
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Standard 5e Multiclass Spell Slot Table (Level 1–20 Caster Level)
 */
export function getMulticlassSpellSlots(casterLevel: number): Record<number, { max: number; used: number }> {
  const slots: Record<number, { max: number; used: number }> = {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 0, used: 0 },
    8: { max: 0, used: 0 },
    9: { max: 0, used: 0 },
  };

  if (casterLevel <= 0) return slots;

  if (casterLevel >= 1) slots[1].max = casterLevel === 1 ? 2 : casterLevel === 2 ? 3 : 4;
  if (casterLevel >= 3) slots[2].max = casterLevel === 3 ? 2 : 3;
  if (casterLevel >= 5) slots[3].max = casterLevel === 5 ? 2 : 3;
  if (casterLevel >= 7) slots[4].max = casterLevel === 7 ? 1 : casterLevel === 8 ? 2 : 3;
  if (casterLevel >= 9) slots[5].max = casterLevel === 9 ? 1 : casterLevel >= 10 && casterLevel < 18 ? 2 : 3;
  if (casterLevel >= 11) slots[6].max = casterLevel >= 19 ? 2 : 1;
  if (casterLevel >= 13) slots[7].max = casterLevel >= 20 ? 2 : 1;
  if (casterLevel >= 15) slots[8].max = 1;
  if (casterLevel >= 17) slots[9].max = 1;

  return slots;
}

/**
 * Format multiclass header title, e.g. "Rogue 7 (Assassin) / Warlock 3 (Hexblade)"
 */
export function formatMulticlassTitle(
  classes: Array<{ className: string; subclass?: string; level: number }>
): string {
  if (!classes || classes.length === 0) return 'Classless';
  return classes
    .map((c) => `${c.className} ${c.level}${c.subclass ? ` (${c.subclass})` : ''}`)
    .join(' / ');
}

/**
 * Format combined Hit Dice display, e.g. "7d8 + 3d10"
 */
export function formatHitDicePool(
  classes: Array<{ className: string; level: number; hitDice?: string }>
): string {
  if (!classes || classes.length === 0) return '1d8';

  const pools: Record<string, number> = {};
  for (const c of classes) {
    const def = getClassDefinition(c.className);
    const hd = c.hitDice || def.hitDie;
    pools[hd] = (pools[hd] || 0) + c.level;
  }

  return Object.entries(pools)
    .map(([die, count]) => `${count}${die}`)
    .join(' + ');
}
