export type NPCCategory = 'friendly' | 'quest' | 'neutral' | 'enemy' | 'boss';

export interface NPCAction {
  id: string;
  name: string;
  type: 'action' | 'bonus_action' | 'reaction' | 'legendary' | 'trait';
  attackType?: 'melee' | 'ranged' | 'spell' | 'ability';
  toHit?: number;
  reachRange?: string;
  damageFormula?: string;
  damageType?: string;
  description: string;
  saveDC?: number;
  saveType?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
}

export interface CustomNPC {
  id: string;
  name: string;
  title?: string;
  category: NPCCategory;
  creatureType: string;
  alignment?: string;
  cr?: string;
  size?: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  ac: number;
  hp: number;
  maxHP: number;
  speed: string;
  initiativeBonus: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  savingThrows?: string;
  skills?: string;
  senses?: string;
  languages?: string;
  actions: NPCAction[];
  location?: string;
  affiliation?: string;
  personality?: string;
  questDescription?: string;
  notes?: string;
  sharedWithPlayers?: boolean;
  portraitUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_CAMPAIGN_NPCS: CustomNPC[] = [
  {
    id: 'npc-brogun',
    name: 'Brogun Ironshaper',
    title: 'Master Dwarven Smith & Clan Elder',
    category: 'friendly',
    creatureType: 'Humanoid (Mountain Dwarf)',
    alignment: 'Lawful Good',
    cr: '3',
    size: 'Medium',
    ac: 17,
    hp: 48,
    maxHP: 48,
    speed: '25 ft.',
    initiativeBonus: 0,
    stats: { str: 18, dex: 10, con: 16, int: 12, wis: 14, cha: 11 },
    savingThrows: 'Str +6, Con +5',
    skills: 'Athletics +6, History (Stonework) +5, Insight +4',
    senses: 'Darkvision 60 ft., Passive Perception 14',
    languages: 'Common, Dwarvish',
    location: 'Ironpeak Forge, Upper Ward',
    affiliation: 'Iron Clan Guild',
    personality: 'Gruff, booming laugh, smells of soot and peat whiskey. Fiercely loyal to honest adventurers.',
    questDescription: 'Will craft masterwork silvered weapons if the party retrieves 3 ingots of Star-Iron from the Sunken Crypts.',
    notes: 'Knows the secret backdoor into the Lower Catacombs through the forge drainage canal.',
    sharedWithPlayers: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    actions: [
      {
        id: 'act-b1',
        name: 'Masterwork Smith’s Hammer',
        type: 'action',
        attackType: 'melee',
        toHit: 6,
        reachRange: '5 ft.',
        damageFormula: '1d8 + 4',
        damageType: 'bludgeoning',
        description: 'Melee Weapon Attack. Hits with resounding forge-tempered force.',
      },
      {
        id: 'act-b2',
        name: 'Dwarven Resilience',
        type: 'trait',
        description: 'Brogun has advantage on saving throws against poison and resistance to poison damage.',
      },
    ],
  },
  {
    id: 'npc-valena',
    name: 'Lady Valena Ravenscroft',
    title: 'Envoy of the Twilight Spire',
    category: 'quest',
    creatureType: 'Humanoid (Moon Elf)',
    alignment: 'Neutral Good',
    cr: '4',
    size: 'Medium',
    ac: 15,
    hp: 52,
    maxHP: 52,
    speed: '30 ft.',
    initiativeBonus: 2,
    stats: { str: 10, dex: 15, con: 12, int: 18, wis: 15, cha: 16 },
    savingThrows: 'Int +6, Wis +4',
    skills: 'Arcana +6, Deception +5, Persuasion +6',
    senses: 'Darkvision 60 ft., Passive Perception 12',
    languages: 'Common, Elvish, Sylvan, Celestial',
    location: 'Ravenscroft Manor / High Council Room',
    affiliation: 'The Twilight Enclave',
    personality: 'Poised, speaking in measured whispers. Carries an ornate astrolabe that vibrates near occult relics.',
    questDescription: 'Contract: Purify the Crypt of Ashenford before the blood eclipse. Reward: 500 GP and a Periapt of Wound Closure.',
    notes: 'Privately knows that Kastoriel’s starlight coven once protected her ancestral estate.',
    sharedWithPlayers: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 1,
    actions: [
      {
        id: 'act-v1',
        name: 'Starlight Ray',
        type: 'action',
        attackType: 'ranged',
        toHit: 6,
        reachRange: '120 ft.',
        damageFormula: '3d8',
        damageType: 'radiant',
        description: 'Fires a concentrated beam of cold lunar light.',
      },
      {
        id: 'act-v2',
        name: 'Misty Jaunt',
        type: 'bonus_action',
        description: 'Teleports up to 30 feet to an unoccupied space she can see enveloped in silver mist.',
      },
    ],
  },
  {
    id: 'npc-corvin',
    name: 'Corvin "The Raven"',
    title: 'Whispering Broker of the Docks',
    category: 'neutral',
    creatureType: 'Humanoid (Kenku)',
    alignment: 'Chaotic Neutral',
    cr: '2',
    size: 'Medium',
    ac: 14,
    hp: 36,
    maxHP: 36,
    speed: '30 ft.',
    initiativeBonus: 3,
    stats: { str: 10, dex: 17, con: 12, int: 14, wis: 15, cha: 11 },
    savingThrows: 'Dex +5',
    skills: 'Deception +4, Sleight of Hand +5, Stealth +7, Perception +4',
    senses: 'Passive Perception 14',
    languages: 'Understands Common and Auran; communicates using mimicry',
    location: 'The Leaning Mast Tavern, Cellar Table',
    affiliation: 'Shadow Merchant Guild',
    personality: 'Speaks only by mimicking voices he has heard. Shuffles counterfeit coins nervously.',
    questDescription: 'Will trade a map of the Inquisitor’s patrol routes for 50 GP or a flask of rare venom.',
    notes: 'Secretly fears Malakor and carries a smoke bomb for emergency escape.',
    sharedWithPlayers: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
    actions: [
      {
        id: 'act-c1',
        name: 'Poisoned Stiletto',
        type: 'action',
        attackType: 'melee',
        toHit: 5,
        reachRange: '5 ft.',
        damageFormula: '1d4 + 3',
        damageType: 'piercing',
        description: 'Target must make a DC 12 Constitution saving throw or take 2d6 poison damage.',
      },
      {
        id: 'act-c2',
        name: 'Smoke Vanish',
        type: 'reaction',
        description: 'When hit by an attack, drops a smoke bomb, imposing disadvantage on the attacker and moving 10 ft without provoking.',
      },
    ],
  },
  {
    id: 'npc-wight',
    name: 'Crypt Wight Commander',
    title: 'Guardian of the Ashen Tombs',
    category: 'enemy',
    creatureType: 'Undead',
    alignment: 'Neutral Evil',
    cr: '3',
    size: 'Medium',
    ac: 15,
    hp: 45,
    maxHP: 45,
    speed: '30 ft.',
    initiativeBonus: 2,
    stats: { str: 16, dex: 14, con: 16, int: 10, wis: 13, cha: 15 },
    savingThrows: 'Wis +3',
    skills: 'Perception +3, Stealth +4',
    senses: 'Darkvision 60 ft., Passive Perception 13',
    languages: 'Common, Abyssal',
    location: 'Sunken Crypts, Lower Sepulcher',
    affiliation: 'The Ashen Horde',
    personality: 'Cold, hollow rasp. Bound by ancient blood oath to slaughter all warm-blooded intruders.',
    notes: 'Rises again 24 hours after death unless holy water is poured over its skull.',
    sharedWithPlayers: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
    actions: [
      {
        id: 'act-w1',
        name: 'Multiattack',
        type: 'action',
        description: 'Makes two longsword attacks or two longbow attacks. It can use its Life Drain in place of one longsword attack.',
      },
      {
        id: 'act-w2',
        name: 'Life Drain',
        type: 'action',
        attackType: 'melee',
        toHit: 5,
        reachRange: '5 ft.',
        damageFormula: '1d6 + 3',
        damageType: 'necrotic',
        description: 'Target must succeed on a DC 13 Con save or its HP maximum is reduced by an amount equal to the damage taken.',
        saveDC: 13,
        saveType: 'CON',
      },
      {
        id: 'act-w3',
        name: 'Rusted Longsword',
        type: 'action',
        attackType: 'melee',
        toHit: 5,
        reachRange: '5 ft.',
        damageFormula: '1d8 + 3',
        damageType: 'slashing',
        description: 'Versatile (1d10 + 3 if used two-handed).',
      },
    ],
  },
  {
    id: 'npc-malakor',
    name: 'Inquisitor Malakor',
    title: 'Scourge of the Eclipse & High Inquisitor',
    category: 'boss',
    creatureType: 'Fiend (Tiefling / Devilbound)',
    alignment: 'Lawful Evil',
    cr: '8',
    size: 'Medium',
    ac: 18,
    hp: 125,
    maxHP: 125,
    speed: '30 ft., fly 30 ft. (hellfire wings)',
    initiativeBonus: 3,
    stats: { str: 18, dex: 16, con: 18, int: 15, wis: 16, cha: 20 },
    savingThrows: 'Con +7, Wis +6, Cha +8',
    skills: 'Intimidation +8, Religion +5, Insight +6, Perception +6',
    senses: 'Truesight 60 ft., Darkvision 120 ft., Passive Perception 16',
    languages: 'Common, Infernal, Abyssal',
    location: 'The Throne of Cinders, Sunken Spire Apex',
    affiliation: 'Order of the Ashen Eclipse',
    personality: 'Cruel, charismatic fanatic who views pain as holy revelation. Speaks with theatrical nobility.',
    notes: 'Possesses a Soul Gem containing the imprisoned essence of a celestial solar.',
    sharedWithPlayers: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    actions: [
      {
        id: 'act-m1',
        name: 'Multiattack',
        type: 'action',
        description: 'Malakor makes three attacks with his Ashen Greatsword or casts two hellfire spells.',
      },
      {
        id: 'act-m2',
        name: 'Ashen Greatsword',
        type: 'action',
        attackType: 'melee',
        toHit: 8,
        reachRange: '5 ft.',
        damageFormula: '2d6 + 4',
        damageType: 'slashing',
        description: 'Plus 2d8 fire damage and 1d8 necrotic damage.',
      },
      {
        id: 'act-m3',
        name: 'Hellfire Gaze',
        type: 'action',
        attackType: 'spell',
        reachRange: '60 ft.',
        damageFormula: '4d10',
        damageType: 'fire',
        saveDC: 16,
        saveType: 'DEX',
        description: 'Target creature must make a DC 16 Dex save or take 4d10 fire damage and become Frightened until the end of its next turn.',
      },
      {
        id: 'act-m4',
        name: 'Shadow Parry',
        type: 'reaction',
        description: 'Malakor adds +4 to his AC against one melee attack that would hit him.',
      },
      {
        id: 'act-m5',
        name: 'Legendary Resistance (2/Day)',
        type: 'trait',
        description: 'If Malakor fails a saving throw, he can choose to succeed instead.',
      },
      {
        id: 'act-m6',
        name: 'Legendary Action: Teleporting Strike',
        type: 'legendary',
        description: 'Malakor teleports up to 30 ft into an unoccupied space and makes one Greatsword attack.',
      },
    ],
  },
];
