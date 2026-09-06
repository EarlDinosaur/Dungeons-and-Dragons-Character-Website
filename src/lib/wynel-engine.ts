import type { AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery } from './types';
import { getModifier } from './character-engine';

// ============================================================================
// Wyn’el Aeluin — Prince of House Aeluin (Exiled Heir)
// Half-Elf Warlock Lv 3 (The Archfey Patron / Scarlet Chaos)
// Pact Emblem: The Crimson Heart-Tattoo (Fused from his mother's magical tome)
// ============================================================================

export interface WarlockSpell {
  id: string;
  name: string;
  level: number; // 0 = cantrip, 1+, all leveled spells cast at pact slot level
  school: string;
  castingTime: string;
  range: string;
  target?: number | string;
  components: string;
  duration: string;
  description: string;
  damageDice?: string;
  isTomeCantrip?: boolean;
}

export interface SimpleAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface EldritchInvocation {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface WarlockFeature {
  name: string;
  description: string;
  source: 'Race' | 'Class' | 'Patron' | 'Pact Boon' | 'Background';
}

export interface WynelState {
  id: string;
  name: string;
  title: string;
  race: string;
  characterClass: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  pactEmblem: string;

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

  pactEngine: {
    slotLevel: number; // Level 2 pact slots at Warlock 3
    slotsMax: number;  // 2 slots
    slotsUsed: number;
    feyPresenceUsed: boolean; // 10-ft cube charm/frighten (recharges on Short/Long rest)
    crimsonPulseUsed: boolean; // Mother's tome pulse (+1d4 to Arcana/social check)
    chaosAuraActive: boolean;  // Scarlet Witch inspired reality-warp visual effect
    armorOfShadowsActive: boolean; // Mage Armor at will (+3 AC without armor)
  };

  spellcasting: {
    spellcastingAbility: 'CHA';
    spellSaveDC: number;
    spellAttackBonus: number;
    spells: WarlockSpell[];
  };

  invocations: EldritchInvocation[];
  features: WarlockFeature[];

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

export function getPactSlotLevel(level: number): number {
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

export function getPactSlotCount(level: number): number {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 2) return 2;
  return 1;
}

export function calculateWynelStats(state: WynelState): WynelState {
  const prof = getProficiencyBonus(state.level);
  const chaMod = getModifier(state.abilityScores.CHA);
  const dexMod = getModifier(state.abilityScores.DEX);
  const conMod = getModifier(state.abilityScores.CON);

  // Warlock Hit Dice is d8. Max HP at lvl 1 = 8 + CON, then 5 + CON per level
  const baseMaxHP = 8 + conMod + (state.level - 1) * (5 + conMod);
  const finalMaxHP = baseMaxHP;

  // AC: Base 10 + DEX, or with Armor of Shadows (Mage Armor): 13 + DEX = 15
  const baseAC = state.pactEngine.armorOfShadowsActive ? 13 + dexMod : 11 + dexMod; // leather armor = 11 + DEX
  const finalAC = state.overrides?.ac ?? baseAC;

  const finalInit = state.overrides?.initiative ?? dexMod;
  const finalSpeed = state.overrides?.speed ?? 30;

  const slotLevel = getPactSlotLevel(state.level);
  const slotsMax = getPactSlotCount(state.level);

  return {
    ...state,
    combat: {
      ...state.combat,
      maxHP: finalMaxHP,
      currentHP: Math.min(state.combat.currentHP, finalMaxHP),
      ac: finalAC,
      initiative: finalInit,
      speed: finalSpeed,
      hitDice: {
        total: state.level,
        used: Math.min(state.combat.hitDice.used, state.level),
      },
    },
    pactEngine: {
      ...state.pactEngine,
      slotLevel,
      slotsMax,
      slotsUsed: Math.min(state.pactEngine.slotsUsed, slotsMax),
    },
    spellcasting: {
      ...state.spellcasting,
      spellSaveDC: 8 + prof + chaMod,
      spellAttackBonus: prof + chaMod,
    },
  };
}

export function createDefaultWynelState(): WynelState {
  const defaultSpells: WarlockSpell[] = [
    // Cantrips
    {
      id: 'eldritch-blast',
      name: 'Eldritch Blast (Scarlet Hex Beam)',
      level: 0,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '120 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'A searing beam of scarlet chaos crackles toward a creature within range. Make a ranged spell attack. On hit, deals 1d10 + 3 force/chaos damage (enhanced by Agonizing Blast).',
      damageDice: '1d10+3',
    },
    {
      id: 'minor-illusion',
      name: 'Minor Illusion',
      level: 0,
      school: 'Illusion',
      castingTime: '1 Action',
      range: '30 feet',
      components: 'S, M (fleece)',
      duration: '1 minute',
      description: 'Create a sound or an image of an object within range that lasts for the duration.',
    },
    {
      id: 'prestidigitation',
      name: 'Prestidigitation',
      level: 0,
      school: 'Transmutation',
      castingTime: '1 Action',
      range: '10 feet',
      components: 'V, S',
      duration: 'Up to 1 hour',
      description: 'Perform minor magical tricks, ignite red candle flames, clean royal garments, or chill wine.',
    },
    // The Crimson Heart-Tattoo (Pact of the Tome Bonus Cantrips)
    {
      id: 'guidance',
      name: 'Guidance (Maternal Grimoire)',
      level: 0,
      school: 'Divination',
      castingTime: '1 Action',
      range: 'Touch',
      components: 'V, S',
      duration: 'Concentration, up to 1 minute',
      description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number to one ability check of its choice.',
      isTomeCantrip: true,
    },
    {
      id: 'vicious-mockery',
      name: 'Vicious Mockery (Scarlet Hex)',
      level: 0,
      school: 'Enchantment',
      castingTime: '1 Action',
      range: '60 feet',
      components: 'V',
      duration: 'Instantaneous',
      description: 'You unleash a string of stinging insults laced with crimson enchantment. Target must succeed on a WIS saving throw or take 1d4 psychic damage and have disadvantage on its next attack roll.',
      damageDice: '1d4',
      isTomeCantrip: true,
    },
    {
      id: 'spare-the-dying',
      name: 'Spare the Dying (Heart ward)',
      level: 0,
      school: 'Necromancy',
      castingTime: '1 Action',
      range: 'Touch',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'You touch a living creature that has 0 hit points. The creature becomes stable with a pulse of scarlet life.',
      isTomeCantrip: true,
    },
    // Leveled Warlock Spells (Cast at 2nd Level via Pact Magic)
    {
      id: 'misty-step',
      name: 'Misty Step (Scarlet Jaunt)',
      level: 2,
      school: 'Conjuration',
      castingTime: '1 Bonus Action',
      range: 'Self',
      components: 'V',
      duration: 'Instantaneous',
      description: 'Briefly surrounded by silvery-red mist, you teleport up to 30 feet to an unoccupied space you can see.',
    },
    {
      id: 'faerie-fire',
      name: 'Faerie Fire (Scarlet Starlight)',
      level: 1,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '60 feet',
      components: 'V',
      duration: 'Concentration, up to 1 minute',
      description: 'Each object and creature in a 20-foot cube is outlined in glowing crimson light. Attack rolls against affected creatures have advantage if the attacker can see them.',
    },
    {
      id: 'sleep',
      name: 'Sleep (Fey Somnolence)',
      level: 1,
      school: 'Enchantment',
      castingTime: '1 Action',
      range: '90 feet',
      components: 'V, S, M (sand/rose petals)',
      duration: '1 minute',
      description: 'Cast at 2nd level with Pact Magic: Roll 7d8; the total is how many hit points of creatures this spell can affect, putting them into a magical slumber.',
      damageDice: '7d8',
    },
    {
      id: 'phantasmal-force',
      name: 'Phantasmal Force (Chaos Hallucination)',
      level: 2,
      school: 'Illusion',
      castingTime: '1 Action',
      range: '60 feet',
      components: 'V, S, M (fleece)',
      duration: 'Concentration, up to 1 minute',
      description: 'You craft an illusion in the mind of a creature within range. The phantasm seems completely real to the target, dealing 1d6 psychic damage per turn if perceived as hazardous.',
      damageDice: '1d6',
    },
    {
      id: 'hellish-rebuke',
      name: 'Hellish Rebuke (Crimson Retribution)',
      level: 1,
      school: 'Evocation',
      castingTime: '1 Reaction',
      range: '60 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'Triggered when you take damage. Cast at 2nd level: The attacker must make a DEX saving throw, taking 3d10 crimson flame damage on a failure, or half on success.',
      damageDice: '3d10',
    },
    {
      id: 'hold-person',
      name: 'Hold Person (Paralyzing Sigil)',
      level: 2,
      school: 'Enchantment',
      castingTime: '1 Action',
      range: '60 feet',
      components: 'V, S, M (iron bar)',
      duration: 'Concentration, up to 1 minute',
      description: 'Choose a humanoid within range. Target must succeed on a WIS saving throw or become paralyzed for the duration. It can repeat the save at the end of each turn.',
    },
  ];

  const defaultInvocations: EldritchInvocation[] = [
    {
      id: 'agonizing-blast',
      name: 'Agonizing Blast',
      description: 'When you cast Eldritch Blast, add your Charisma modifier (+3) to the damage it deals on a hit.',
      active: true,
    },
    {
      id: 'armor-of-shadows',
      name: 'Armor of Shadows',
      description: 'You can cast Mage Armor on yourself at will, without expending a spell slot or material components. Sets your base AC to 13 + DEX (15 total).',
      active: true,
    },
    {
      id: 'book-of-ancient-secrets',
      name: 'Book of Ancient Secrets',
      description: 'Your Crimson Heart-Tattoo houses ritual magic. You can cast ritual spells from any class if they have the ritual tag (e.g. Find Familiar, Detect Magic).',
      active: true,
    },
  ];

  const defaultFeatures: WarlockFeature[] = [
    {
      name: 'Fey Ancestry',
      source: 'Race',
      description: 'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.',
    },
    {
      name: 'Darkvision (60 ft)',
      source: 'Race',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
    },
    {
      name: 'Fey Presence (10-ft Cube)',
      source: 'Patron',
      description: 'As an action, cause each creature in a 10-foot cube originating from you to make a WIS saving throw (DC 13). On a failure, they are charmed or frightened by you until the end of your next turn. Recharges on a Short or Long Rest.',
    },
    {
      name: 'Pact of the Tome: The Crimson Heart-Tattoo',
      source: 'Pact Boon',
      description: 'Wyn’el’s mother fused her ancient family grimoire into his very flesh as a living crimson sigil over his heart. It grants him three cantrips from any class list and channels reality-warping chaos magic.',
    },
    {
      name: 'Position of Privilege',
      source: 'Background',
      description: 'Thanks to your noble birth in House Aeluin, high society recognizes your royal bloodline and grants you welcome among the peerage and noble houses.',
    },
  ];

  const defaultInventory: InventoryItem[] = [
    {
      id: 'inv-rapier',
      name: 'Aeluin Ceremonial Rapier',
      category: 'weapon',
      weight: 2,
      quantity: 1,
      equipped: true,
      description: '+4 to hit, 1d8+2 piercing damage. Inscribed with the weeping swan crest of House Aeluin.',
    },
    {
      id: 'inv-focus',
      name: 'Archfey Bloodstone Focus',
      category: 'gear',
      weight: 1,
      quantity: 1,
      equipped: true,
      description: 'Carved ruby teardrop that resonates with the Scarlet Witch chaos magic pulsing from his tattoo.',
    },
    {
      id: 'inv-robes',
      name: 'Exiled Prince Velvet Regalia',
      category: 'armor',
      weight: 4,
      quantity: 1,
      equipped: true,
      description: 'Finely tailored obsidian velvet double-breasted coat lined with crimson silk.',
    },
    {
      id: 'inv-locket',
      name: 'Mother’s Ash-Silver Locket',
      category: 'gear',
      weight: 0.5,
      quantity: 1,
      equipped: true,
      description: 'Contains the remaining silver ash of his mother’s grimoire before the rest fused into his chest.',
    },
    {
      id: 'inv-signet',
      name: 'House Aeluin Royal Signet Ring',
      category: 'gear',
      weight: 0.1,
      quantity: 1,
      equipped: false,
      description: 'Worn on a thin chain beneath his shirt to conceal his true royal lineage from bounty hunters.',
    },
  ];

  const rawState: WynelState = {
    id: 'wynel',
    name: "Wyn'el Aeluin",
    title: 'Prince of House Aeluin (Exiled Heir)',
    race: 'Half-Elf',
    characterClass: 'Warlock',
    subclass: 'The Archfey',
    level: 3,
    background: 'Noble',
    alignment: 'Lawful Good',
    pactEmblem: "The Crimson Heart-Tattoo (Fused from his mother's magical tome)",

    abilityScores: {
      STR: 8,
      DEX: 15,
      CON: 13,
      INT: 10,
      WIS: 12,
      CHA: 17,
    },
    savingThrowProficiencies: ['WIS', 'CHA'],
    skillProficiencies: ['Deception', 'Persuasion', 'Insight', 'History', 'Arcana'],

    combat: {
      currentHP: 21,
      maxHP: 21,
      tempHP: 0,
      ac: 15, // with Armor of Shadows active by default
      initiative: 2,
      speed: 30,
      hitDice: { total: 3, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
    },

    pactEngine: {
      slotLevel: 2,
      slotsMax: 2,
      slotsUsed: 0,
      feyPresenceUsed: false,
      crimsonPulseUsed: false,
      chaosAuraActive: false,
      armorOfShadowsActive: true,
    },

    spellcasting: {
      spellcastingAbility: 'CHA',
      spellSaveDC: 13,
      spellAttackBonus: 5,
      spells: defaultSpells,
    },

    invocations: defaultInvocations,
    features: defaultFeatures,

    inventory: defaultInventory,
    currency: { cp: 0, sp: 20, ep: 0, gp: 45, pp: 5 },
    notes: `Prince Wyn'el Aeluin is the last true heir of House Aeluin. Inspired by the reality-altering scarlet chaos magic, his patron is a mysterious Archfey entity from the Gloaming Court. Before the palace fell to coup conspirators, his sorceress mother sacrificed herself to bind her ancestral grimoire into his very soul — permanently etching The Crimson Heart-Tattoo across his chest. Now traveling with The Ashen Pact under an alias, he gathers allies to reclaim his stolen kingdom.`,
    journal: [
      {
        id: 'entry-1',
        title: 'The Night the Banners Burned',
        content: 'I still smell the sulfur and jasmine from that night. House Aeluin stood for six hundred years, dismantled in six hours by our own seneschal. Mother pushed me through the portal, but not before burning the grand tome into my heart. "Let them take the marble, Wyn\'el," she whispered. "The magic remains with you."',
        timestamp: 'Session 1',
        category: 'session',
      },
      {
        id: 'entry-2',
        title: 'Alliance with the Ashen Pact',
        content: 'Vesper watched my hands today when the scarlet runes flared during the skirmish. He knows I am running from something, just as he is. There is an unspoken understanding between those who carry dangerous secrets.',
        timestamp: 'Session 2',
        category: 'quest',
      },
    ],
    mysteries: [
      {
        id: 'mystery-seneschal',
        title: 'Who Poisoned the Archon of House Aeluin?',
        description: 'The royal guard turned within minutes of the banquet. What foreign power supplied the shadow-glass daggers used against my kin?',
        clues: ['A serpent coin matching Vincent’s guild mark was found near the throne room.'],
        resolved: false,
      },
      {
        id: 'mystery-crimson-tome',
        title: 'The Awakening Heart-Tattoo',
        description: 'The tattoo beats when chaos magic surges. As I grow stronger, new spells from Mother\'s book bleed through my skin in bright crimson ink.',
        clues: ['The third chapter of the grimoire deals with dimensional warding and hex spheres.'],
        resolved: false,
      },
    ],
  };

  return calculateWynelStats(rawState);
}
