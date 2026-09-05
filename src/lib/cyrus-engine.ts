import type { AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery } from './types';
import { getModifier } from './character-engine';

// ============================================================================
// Cyrus Hyacinthus — Protector Aasimar, Oracle (Solar Mystery) Lv 3
// Greek Mythology themed Solar Oracle from the Kingdom of Helios
// ============================================================================

export interface OracleSpell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  target: number;
  components: string;
  duration: string;
  description: string;
  damageDice?: string;
}

export interface SimpleAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface OracleFeature {
  name: string;
  description: string;
  active: boolean;
}

export interface CyrusState {
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
  skillProficiencies: string[];

  combat: {
    currentHP: number;
    maxHP: number;
    tempHP: number;
    ac: number;
    initiative: number;
    speed: number;
    hitDice: { total: number; used: number };
    deathSaves: { successes: number; failures: number };
  };

  oracleEngine: {
    healingHandsPool: number; // = level HP pool
    healingHandsUsed: boolean;
    radiantSoulActive: boolean;
    radiantSoulUsed: boolean;
    epiphanyUsed: boolean; // bonus Augury once per long rest
  };

  spellcasting: {
    spellcastingAbility: string;
    spellSaveDC: number;
    spellAttackBonus: number;
    slots: {
      1: { max: number; used: number };
      2: { max: number; used: number };
    };
    spells: OracleSpell[];
  };

  features: OracleFeature[];

  inventory: InventoryItem[];
  currency: Currency;
  notes: string;
  journal: JournalEntry[];
  mysteries: CampaignMystery[];
}

export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function getOracleSpellSlots(level: number) {
  // Oracle (full caster) spell slots
  const slots = {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
  };

  if (level >= 1) slots[1].max = level >= 3 ? 4 : level === 2 ? 3 : 2;
  if (level >= 3) slots[2].max = level >= 4 ? 3 : 2;

  return slots;
}

export function calculateCyrusStats(state: CyrusState): CyrusState {
  const level = state.level;
  const prof = getProficiencyBonus(level);
  const chaMod = getModifier(state.abilityScores.CHA);
  const conMod = getModifier(state.abilityScores.CON);
  const dexMod = getModifier(state.abilityScores.DEX);

  // Max HP: 8 (d8 hit die) + CON mod at Lv 1, + (5 + CON) per level thereafter
  const calculatedMaxHP = 8 + conMod + (level - 1) * (5 + conMod);

  // Spell Save DC: 8 + Prof + CHA mod
  const spellSaveDC = 8 + prof + chaMod;
  const spellAttackBonus = prof + chaMod;

  // AC: Leather armor (11) + DEX mod
  const ac = 11 + dexMod;

  // Oracle Curse: Lame — speed reduced by 10ft (base 30 - 10 = 20)
  const speed = 20;

  const slots = getOracleSpellSlots(level);

  return {
    ...state,
    combat: {
      ...state.combat,
      maxHP: calculatedMaxHP,
      currentHP: Math.min(state.combat.currentHP, calculatedMaxHP),
      ac,
      initiative: dexMod,
      speed,
      hitDice: { total: level, used: state.combat.hitDice?.used || 0 },
    },
    oracleEngine: {
      ...state.oracleEngine,
      healingHandsPool: level, // Aasimar: heal = level HP
    },
    spellcasting: {
      ...state.spellcasting,
      spellSaveDC,
      spellAttackBonus,
      slots: {
        1: { ...slots[1], used: Math.min(state.spellcasting.slots[1]?.used || 0, slots[1].max) },
        2: { ...slots[2], used: Math.min(state.spellcasting.slots[2]?.used || 0, slots[2].max) },
      },
    },
  };
}

export function createDefaultCyrusState(): CyrusState {
  return calculateCyrusStats({
    id: 'cyrus',
    name: 'Cyrus Hyacinthus',
    subline: 'Sworn Counselor of King Zephyr',
    race: 'Protector Aasimar',
    characterClass: 'Oracle',
    subclass: 'Solar Mystery',
    level: 3,
    background: 'Courtier',
    alignment: 'Neutral',

    abilityScores: {
      STR: 8,
      DEX: 8,
      CON: 13,
      INT: 12,
      WIS: 16,
      CHA: 17,
    },
    savingThrowProficiencies: ['WIS', 'CHA'],
    skillProficiencies: ['History', 'Insight', 'Medicine', 'Perception', 'Persuasion'],

    combat: {
      currentHP: 21,
      maxHP: 21,
      tempHP: 0,
      ac: 11,
      initiative: -1,
      speed: 20,
      hitDice: { total: 3, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
    },

    oracleEngine: {
      healingHandsPool: 3,
      healingHandsUsed: false,
      radiantSoulActive: false,
      radiantSoulUsed: false,
      epiphanyUsed: false,
    },

    spellcasting: {
      spellcastingAbility: 'Charisma',
      spellSaveDC: 13,
      spellAttackBonus: 5,
      slots: {
        1: { max: 4, used: 0 },
        2: { max: 2, used: 0 },
      },
      spells: [
        // Cantrips
        { id: 'guidance', name: 'Guidance', level: 0, school: 'Divination', castingTime: '1 Action', range: 'Touch', target: 10, components: 'V, S', duration: 'Concentration 1 min', description: 'Target adds 1d4 to one ability check.', damageDice: '1d4' },
        { id: 'sacred-flame', name: 'Sacred Flame', level: 0, school: 'Evocation', castingTime: '1 Action', range: '60 ft', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: 'DEX save DC 13; 1d8 radiant damage.', damageDice: '1d8' },
        { id: 'spare-the-dying', name: 'Spare the Dying', level: 0, school: 'Necromancy', castingTime: '1 Action', range: 'Touch', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: 'Stabilizes a creature at 0 HP.' },
        { id: 'light', name: 'Light', level: 0, school: 'Evocation', castingTime: '1 Action', range: 'Touch', target: 10, components: 'V, S, M', duration: '1 hr', description: 'Object sheds bright light 20 ft + dim 20 ft.' },
        { id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', castingTime: '1 Action', range: '120 ft', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: '1d10 fire damage. Ranged spell attack.', damageDice: '1d10' },
        // 1st Level
        { id: 'bless', name: 'Bless', level: 1, school: 'Enchantment', castingTime: '1 Action', range: '30 ft', target: 3, components: 'V, S, M', duration: 'Concentration 1 min', description: 'Up to 3 creatures add 1d4 to attacks and saves.' },
        { id: 'detect-magic', name: 'Detect Magic', level: 1, school: 'Divination', castingTime: '1 Action (Ritual)', range: 'Self 30 ft', target: 10, components: 'V, S, M', duration: 'Concentration 10 min', description: 'Sense the presence of magic within 30 feet. Learn its school.' },
        { id: 'healing-word', name: 'Healing Word', level: 1, school: 'Evocation', castingTime: '1 Bonus Action', range: '60 ft', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: 'Heal 1d4 + spellcasting modifier.', damageDice: '1d4+3' },
        { id: 'faerie-fire', name: 'Faerie Fire', level: 1, school: 'Evocation', castingTime: '1 Action', range: '60 ft', target: 10, components: 'V, S, M', duration: 'Concentration 1 min', description: 'Objects in 20-ft cube outlined in light. Affected creatures grant advantage on attacks.' },
        { id: 'guiding-bolt', name: 'Guiding Bolt', level: 1, school: 'Evocation', castingTime: '1 Action', range: '120 ft', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: 'Deals 4d6 radiant damage. Next attack against target has advantage.', damageDice: '4d6' },
        // 2nd Level
        { id: 'detect-thoughts', name: 'Detect Thoughts', level: 2, school: 'Divination', castingTime: '1 Action', range: 'Self 30 ft', target: 10, components: 'V, S, M', duration: 'Concentration 1 min', description: 'Read surface thoughts. Probe deeper with WIS save.' },
        { id: 'flaming-sphere', name: 'Flaming Sphere', level: 2, school: 'Conjuration', castingTime: '1 Action', range: '60 ft', target: 10, components: 'V, S, M', duration: 'Concentration 1 min', description: '5-ft fire sphere. 2d6 fire damage on DEX save.', damageDice: '2d6' },
        { id: 'augury', name: 'Augury', level: 2, school: 'Divination', castingTime: '1 min (Ritual)', range: 'Self', target: 10, components: 'V, S, M', duration: 'Instantaneous', description: 'Receive an omen about a specific course of action: Weal, Woe, Both, or Nothing.' },
      ],
    },

    features: [
      { name: 'Darkvision', description: 'See in darkness as if dimlight and dimlight as bright for 60 ft.', active: true },
      { name: 'Celestial Resistance', description: 'Resistance to necrotic and radiant damage.', active: true },
      { name: 'Healing Hands', description: 'Touch heal d4s equal to proficiency bonus once per long rest.', active: true },
      { name: 'Light Bearer', description: 'Knows Light cantrip; Charisma is the spellcasting ability.', active: true },
      { name: 'Radiant Soul', description: 'Once per long rest, transform for 1 minute. Gain 30-ft flying speed and deal +3 radiant damage with attacks/spells.', active: false },
      { name: 'Epiphany', description: 'Once per long rest, cast Augury as a bonus action without spell slot or material components.', active: false },
      { name: 'Oracle Curse: Lame', description: 'One or both legs are deformed, giving a noticeably altered gait and reduced speed by 10 ft. Speed can never be reduced unless specifically reduced to 0 ft. At 3rd level, no effect from 1st or 2nd levels of exhaustion.', active: true },
      { name: 'Blistering Caress', description: 'Learn Fire Bolt. Spells of 1st level or higher deal additional damage equal to Charisma modifier (to creatures of your choice).', active: true },
      { name: 'Court Functionary', description: 'Knowledge of how bureaucracies and courts function, and access to court officials and functionaries.', active: true },
    ],

    inventory: [
      { id: 'walking-cane', name: 'Walking Cane (Quarterstaff)', quantity: 1, weight: 4, equipped: true, category: 'weapon', description: 'Quarterstaff used as walking cane. 1d6-1 bludgeoning damage.' },
      { id: 'dagger', name: 'Dagger', quantity: 2, weight: 1, equipped: true, category: 'weapon', description: '1d4-1 piercing damage.' },
      { id: 'leather-armor', name: 'Leather Armor', quantity: 1, weight: 10, equipped: true, category: 'armor', description: 'AC 11 + DEX modifier.' },
      { id: 'oracular-focus', name: 'Oracular Focus', quantity: 1, weight: 1, equipped: true, category: 'gear', description: 'Spellcasting focus for Oracle spells.' },
      { id: 'fine-clothes', name: 'Fine Clothes', quantity: 1, weight: 6, equipped: false, category: 'gear', description: 'Noble courtier attire from Helios.' },
      { id: 'explorers-pack', name: "Explorer's Pack", quantity: 1, weight: 0, equipped: false, category: 'gear', description: 'Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50ft hempen rope.' },
      { id: 'gaming-set', name: 'Gaming Set - Cards', quantity: 1, weight: 0, equipped: false, category: 'tool', description: 'A set of playing cards for games of chance.' },
      { id: 'pouch', name: 'Pouch', quantity: 1, weight: 1, equipped: true, category: 'gear', description: 'Small belt pouch for coins and small items.' },
    ],

    currency: { pp: 0, gp: 5, ep: 0, sp: 0, cp: 0 },

    notes: `### The Kingdom of Helios
Cyrus hails from Helios, a sun-drenched kingdom inspired by the grandeur of ancient Greece and Rome. Marble temples and golden-domed palaces rise beneath an ever-glowing sun. The kingdom values honor, family oaths, and divine service.

### The Golden Veins
After exposure to a mysterious golden liquid found in abandoned temple ruins during childhood, golden veins now run beneath Cyrus's skin, glowing faintly when he channels divine magic or experiences strong emotion.

### The King's Illness
King Zephyr Apollos suffers from a mysterious declining illness with no known cure. Cyrus received a vision of an artifact that might save the king and has been sent on a quest to find it.

### Oracle Curse: Lame
One of Cyrus's legs was permanently deformed, requiring a walking cane. This is his Oracle Curse — a price paid for the gift of divine sight. His speed is reduced by 10 ft but can never be reduced below 0.`,

    journal: [
      {
        id: 'cyrus-j1',
        title: 'A Vision of Gold',
        timestamp: 'Before the Journey',
        content: "The vision came in fire and golden light — an artifact, ancient and radiant, hidden beyond the borders of Helios. It pulses like a second heartbeat. If Zephyr is to be saved, I must find it.",
        category: 'quest',
      },
      {
        id: 'cyrus-j2',
        title: 'Leaving Helios',
        timestamp: 'Day of Departure',
        content: "Zephyr gripped my hand at the palace gates. He tried to smile, but the illness has taken its toll. 'Come back to me, Cyrus.' I swore I would.",
        category: 'note',
      },
    ],

    mysteries: [
      {
        id: 'mystery-artifact',
        title: 'The Radiant Artifact',
        description: "Cyrus's oracle visions revealed a golden artifact capable of curing King Zephyr's mysterious illness. Its location lies beyond Helios, in lands unknown.",
        clues: ['Golden light in the vision', 'Connected to ancient sun temples', 'The artifact pulses like a heartbeat'],
        resolved: false,
      },
      {
        id: 'mystery-golden-veins',
        title: 'The Golden Liquid Mystery',
        description: 'The mysterious golden liquid in the abandoned temple that permanently altered Cyrus\'s body — what was it? Divine ichor? A fragment of solar essence?',
        clues: ['Found in abandoned temple ruins during childhood', 'Golden veins beneath the skin', 'Glows when channeling divine magic'],
        resolved: false,
      },
    ],
  });
}
