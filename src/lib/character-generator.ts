// ============================================================================
// D&D 5e Automated Character Generator
// Generates full playable CharacterState objects from user configuration
// ============================================================================

import type {
  CharacterState,
  AbilityName,
  AbilityScores,
  SkillName,
  Skill,
  AttackOption,
  InventoryItem,
  CharacterSpellItem,
  CustomFeat,
  NonStatProficiencies,
  ClassLevel,
} from './types';
import { getModifier, calculateProficiencyBonus } from './character-engine';
import { DND_CLASSES, getMulticlassSpellSlots } from './class-database';

export interface CreateCharacterInput {
  name: string;
  alias?: string;
  title?: string;
  race: string;
  className: string;
  subclass?: string;
  level: number;
  background?: string;
  alignment?: string;
  abilityScores: Record<AbilityName, number>;
  primaryColor?: string;
  accentColor?: string;
  portraitUrl?: string;
  signatureFeatureName?: string;
  signatureFeatureDescription?: string;
}

const ALL_SKILLS: Array<{ name: SkillName; ability: AbilityName }> = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
];

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export function generateNewCharacter(input: CreateCharacterInput): CharacterState {
  const level = Math.max(1, Math.min(20, input.level || 1));
  const profBonus = calculateProficiencyBonus(level);
  const className = input.className || 'Fighter';
  const classDef = DND_CLASSES[className] || DND_CLASSES['Fighter'];

  // 1. Ability Scores & Saving Throws
  const savingThrows = classDef.savingThrows || ['STR', 'CON'];
  const abilityScores: Partial<AbilityScores> = {};

  for (const name of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityName[]) {
    const base = input.abilityScores[name] || 10;
    const modifier = getModifier(base);
    const saveProficient = savingThrows.includes(name);
    const saveBonus = modifier + (saveProficient ? profBonus : 0);

    abilityScores[name] = {
      name,
      label: ABILITY_LABELS[name],
      base,
      total: base,
      modifier,
      saveProficient,
      saveBonus,
    };
  }

  const completeAbilityScores = abilityScores as AbilityScores;
  const conMod = completeAbilityScores.CON.modifier;
  const dexMod = completeAbilityScores.DEX.modifier;

  // 2. Hit Points
  const hitDieValue = classDef.hitDieValue || 8;
  const avgPerLevel = Math.floor(hitDieValue / 2) + 1;
  const lvl1HP = hitDieValue + conMod;
  const subsequentHP = Math.max(0, level - 1) * (avgPerLevel + conMod);
  const maxHP = Math.max(1, lvl1HP + subsequentHP);

  // 3. Classes array
  const classes: ClassLevel[] = [
    {
      className,
      subclass: input.subclass || (classDef.subclasses?.[0] ?? ''),
      level,
      hitDice: classDef.hitDie || 'd8',
    },
  ];

  // 4. Skills (pick 3 default proficiencies based on primary abilities)
  const defaultProficientSkills: SkillName[] = ['Perception', 'Athletics', 'Insight'];
  if (['Wizard', 'Sorcerer', 'Warlock'].includes(className)) {
    defaultProficientSkills.splice(1, 1, 'Arcana');
  } else if (['Rogue', 'Ranger'].includes(className)) {
    defaultProficientSkills.splice(1, 1, 'Stealth');
  }

  const skills: Skill[] = ALL_SKILLS.map((sk) => {
    const proficient = defaultProficientSkills.includes(sk.name);
    const abilityMod = completeAbilityScores[sk.ability].modifier;
    const bonus = abilityMod + (proficient ? profBonus : 0);
    return {
      name: sk.name,
      ability: sk.ability,
      proficient,
      expertise: false,
      bonus,
    };
  });

  // 5. Attacks
  const attacks: AttackOption[] = [];
  const primaryAtkMod = Math.max(completeAbilityScores.STR.modifier, completeAbilityScores.DEX.modifier);
  const toHit = profBonus + primaryAtkMod;

  if (['Barbarian', 'Fighter', 'Paladin'].includes(className)) {
    attacks.push(
      {
        id: `atk-greatsword-${Date.now()}`,
        name: 'Greatsword',
        attackBonus: profBonus + completeAbilityScores.STR.modifier,
        damage: `2d6 + ${completeAbilityScores.STR.modifier}`,
        damageType: 'Slashing',
        range: 'Melee (5 ft)',
        notes: 'Heavy, Two-Handed martial weapon',
        equipped: true,
      },
      {
        id: `atk-javelin-${Date.now()}`,
        name: 'Javelin',
        attackBonus: profBonus + completeAbilityScores.STR.modifier,
        damage: `1d6 + ${completeAbilityScores.STR.modifier}`,
        damageType: 'Piercing',
        range: '30/120 ft',
        notes: 'Thrown weapon',
        equipped: false,
      }
    );
  } else if (['Rogue', 'Ranger', 'Monk'].includes(className)) {
    attacks.push(
      {
        id: `atk-rapier-${Date.now()}`,
        name: 'Rapier',
        attackBonus: profBonus + completeAbilityScores.DEX.modifier,
        damage: `1d8 + ${completeAbilityScores.DEX.modifier}`,
        damageType: 'Piercing',
        range: 'Melee (5 ft)',
        notes: 'Finesse martial weapon',
        equipped: true,
      },
      {
        id: `atk-shortbow-${Date.now()}`,
        name: 'Shortbow',
        attackBonus: profBonus + completeAbilityScores.DEX.modifier,
        damage: `1d6 + ${completeAbilityScores.DEX.modifier}`,
        damageType: 'Piercing',
        range: '80/320 ft',
        notes: 'Ammunition, Two-Handed',
        equipped: true,
      }
    );
  } else {
    // Casters
    const castingAbility = ['Wizard', 'Artificer'].includes(className)
      ? 'INT'
      : ['Cleric', 'Druid'].includes(className)
      ? 'WIS'
      : 'CHA';
    const castMod = completeAbilityScores[castingAbility].modifier;

    attacks.push(
      {
        id: `atk-cantrip-${Date.now()}`,
        name: className === 'Warlock' ? 'Eldritch Blast' : 'Fire Bolt',
        attackBonus: profBonus + castMod,
        damage: `1d10`,
        damageType: className === 'Warlock' ? 'Force' : 'Fire',
        range: '120 ft',
        notes: 'Cantrip attack beam',
        equipped: true,
      },
      {
        id: `atk-dagger-${Date.now()}`,
        name: 'Dagger',
        attackBonus: profBonus + completeAbilityScores.DEX.modifier,
        damage: `1d4 + ${completeAbilityScores.DEX.modifier}`,
        damageType: 'Piercing',
        range: '20/60 ft',
        notes: 'Finesse, Light, Thrown',
        equipped: true,
      }
    );
  }

  // 6. Spellcasting
  let casterAbility: AbilityName = 'CHA';
  if (['Wizard', 'Artificer'].includes(className)) casterAbility = 'INT';
  else if (['Cleric', 'Druid', 'Ranger'].includes(className)) casterAbility = 'WIS';
  else if (['Sorcerer', 'Lunar Sorcerer', 'Oracle', 'Warlock', 'Bard', 'Paladin'].includes(className)) casterAbility = 'CHA';

  const isCaster = classDef.spellcastingType !== 'none';
  const spellSaveDC = isCaster ? 8 + profBonus + completeAbilityScores[casterAbility].modifier : 10;
  const spellAttackBonus = isCaster ? profBonus + completeAbilityScores[casterAbility].modifier : 2;

  let spellSlots: Record<number, { max: number; used: number }> = {};
  if (className === 'Warlock') {
    const pactSlotLevel = Math.min(5, Math.ceil(level / 2));
    const pactSlotCount = level >= 17 ? 4 : level >= 11 ? 3 : 2;
    spellSlots = {
      [pactSlotLevel]: { max: pactSlotCount, used: 0 },
    };
  } else if (isCaster) {
    const casterLevel =
      classDef.spellcastingType === 'full'
        ? level
        : classDef.spellcastingType === 'half'
        ? Math.floor(level / 2)
        : Math.floor(level / 3);
    spellSlots = getMulticlassSpellSlots(Math.max(1, casterLevel));
  }

  const spells: CharacterSpellItem[] = [];
  if (isCaster) {
    spells.push({
      id: `spell-cantrip-1-${Date.now()}`,
      name:
        className === 'Warlock'
          ? 'Eldritch Blast'
          : ['Cleric', 'Oracle'].includes(className)
          ? 'Sacred Flame'
          : ['Sorcerer', 'Lunar Sorcerer'].includes(className)
          ? 'Lunar Ray (Fire Bolt)'
          : 'Light',
      level: 0,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '120 ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'A burst of magical energy fires toward a target creature within range.',
      prepared: true,
    });
    if (level >= 1) {
      spells.push({
        id: `spell-lvl1-1-${Date.now()}`,
        name: ['Cleric', 'Oracle'].includes(className) ? 'Bless' : className === 'Wizard' ? 'Magic Missile' : 'Shield',
        level: 1,
        school: ['Cleric', 'Oracle'].includes(className) ? 'Enchantment' : 'Abjuration',
        castingTime: ['Cleric', 'Oracle'].includes(className) ? '1 Action' : '1 Reaction',
        range: ['Cleric', 'Oracle'].includes(className) ? '30 ft' : 'Self',
        components: 'V, S',
        duration: ['Cleric', 'Oracle'].includes(className) ? 'Concentration, up to 1 minute' : '1 round',
        description:
          ['Cleric', 'Oracle'].includes(className)
            ? 'Bless up to three creatures. When a target makes an attack roll or saving throw, they add a d4.'
            : 'An invisible barrier appears, granting +5 AC and immunity to magic missile until your next turn.',
        prepared: true,
      });
    }
  }

  // 7. Inventory
  const inventory: InventoryItem[] = [
    {
      id: `inv-armor-${Date.now()}`,
      name: ['Barbarian', 'Monk'].includes(className) ? 'Traveler Clothes' : ['Fighter', 'Paladin'].includes(className) ? 'Chain Mail' : 'Leather Armor',
      quantity: 1,
      weight: ['Fighter', 'Paladin'].includes(className) ? 55 : 10,
      description: 'Standard protective equipment.',
      equipped: true,
      category: 'armor',
    },
    {
      id: `inv-backpack-${Date.now()}`,
      name: "Explorer's Pack",
      quantity: 1,
      weight: 12,
      description: 'Includes a bedroll, mess kit, tinderbox, 10 torches, and 10 days of rations.',
      equipped: true,
      category: 'gear',
    },
    {
      id: `inv-potion-${Date.now()}`,
      name: 'Potion of Healing',
      quantity: 2,
      weight: 1,
      description: 'Restores 2d4 + 2 hit points when consumed.',
      equipped: false,
      category: 'consumable',
    },
  ];

  // 8. Feats & Traits
  const feats: CustomFeat[] = [
    {
      id: `feat-class-core-${Date.now()}`,
      title: `${className} Training`,
      description: classDef.description || 'Core archetype abilities and proficiencies.',
      source: `${className} Class`,
      level: 1,
    },
  ];

  if (input.signatureFeatureName) {
    feats.push({
      id: `feat-sig-${Date.now()}`,
      title: input.signatureFeatureName,
      description: input.signatureFeatureDescription || 'Signature heroic power.',
      source: 'Heroic Archetype',
      level: 1,
    });
  }

  // 9. AC calculation
  let baseAC = 10 + dexMod;
  if (['Fighter', 'Paladin'].includes(className)) {
    baseAC = 16; // Chain mail
  } else if (!['Barbarian', 'Monk'].includes(className)) {
    baseAC = 11 + dexMod; // Leather armor
  }

  return {
    name: input.name || 'Unnamed Hero',
    alias: input.alias || input.title || `Level ${level} ${input.race || 'Human'} ${className}`,
    race: input.race || 'Human',
    class: className,
    subclass: input.subclass || (classDef.subclasses?.[0] ?? ''),
    level,
    background: input.background || 'Folk Hero',
    alignment: input.alignment || 'Neutral Good',
    experience: level * 1000,

    classes,

    proficiencyBonus: profBonus,
    abilityScores: completeAbilityScores,
    skills,
    ac: baseAC,
    initiative: dexMod,
    speed: ['Dwarf', 'Halfling', 'Gnome'].includes(input.race || '') ? 25 : 30,
    passivePerception: 10 + completeAbilityScores.WIS.modifier + (defaultProficientSkills.includes('Perception') ? profBonus : 0),
    overrides: {},

    combat: {
      currentHP: maxHP,
      maxHP,
      tempHP: 0,
      hitDice: { total: level, used: 0, diceType: classDef.hitDie || 'd8' },
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
    },
    sneakAttackDice: className === 'Rogue' ? Math.ceil(level / 2) : 0,
    attacks,

    spellcasting: {
      spellSaveDC,
      spellAttackBonus,
      slots: spellSlots,
      spells,
    },
    feats,
    proficiencies: {
      armor: ['Light Armor', 'Medium Armor'],
      weapons: ['Simple Weapons', 'Martial Weapons'],
      tools: ['Dice Set'],
      languages: ['Common', 'Elvish'],
    },

    inventory,
    currency: { cp: 0, sp: 25, ep: 0, gp: 100, pp: 0 },

    orphansTithe: {
      currentSouls: 0,
      vestigeStage: 'dormant',
      phantomMurmursActive: false,
      altarTraumaActive: false,
    },

    dossier: {
      title: `The Story of ${input.name}`,
      subtitle: `${input.race} ${input.className} • ${input.background || 'Hero'}`,
      chapters: [
        {
          id: 'ch-origin',
          title: 'Origins & Heritage',
          subtitle: `Early life and background as a ${input.background || 'Hero'}`,
          icon: 'Scroll',
          content: `${input.name} began their journey across the realm driven by purpose and destiny. Raised in the traditions of their people, early experiences forged their character and resolve.`,
        },
        {
          id: 'ch-training',
          title: 'Discipline & Mastery',
          subtitle: `Training and dedication as a ${input.className}`,
          icon: 'Target',
          content: `Through rigorous discipline and study, ${input.name} mastered the core capabilities of a ${input.className}. Every skirmish and trial sharpened their focus.`,
        },
        {
          id: 'ch-pact',
          title: 'The Road with The Ashen Pact',
          subtitle: 'Companions bound by common peril',
          icon: 'Shield',
          content: `Drawn together with the heroes of The Ashen Pact, ${input.name} recognized kindred spirits who face supernatural perils and ancient threats across the realm.`,
        },
      ],
      backstory: {
        orphanageMassacre: `${input.name} began their journey across the realm driven by purpose and destiny.`,
        fatherMalachi: 'Mentors and allies encountered along the winding road.',
        apprenticeApothecary: 'Early professions and training in the provinces.',
        guildScoutVincent: 'Allied party companions in The Ashen Pact.',
        bossDexter: 'Renowned contacts in the merchant and adventurer guilds.',
      },
      mysteries: [
        {
          id: `mystery-${Date.now()}`,
          title: 'The Unsolved Calling',
          description: `An ancient omen or personal quest that brought ${input.name} to the campaign party.`,
          clues: ['A mysterious token found during early travels.'],
          resolved: false,
        },
      ],
      journal: [
        {
          id: `journal-${Date.now()}`,
          title: 'Arrival at the Guildhall',
          content: `${input.name} has joined the roster of The Ashen Pact companion heroes.`,
          timestamp: new Date().toLocaleDateString(),
          category: 'session',
        },
      ],
      playerNotes: '',
    },

    version: 1,
    lastSaved: new Date().toISOString(),
  };
}
