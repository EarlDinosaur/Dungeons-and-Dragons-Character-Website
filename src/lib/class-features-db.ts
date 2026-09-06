// ============================================================================
// D&D 5e Class Features Database — Comprehensive Data
// All 13 Classes × 80+ Subclasses with Level-Gated Features
// ============================================================================

export interface ClassFeatureEntry {
  name: string;
  level: number;
  description: string;
}

export interface SubclassFeatureData {
  name: string;
  features: ClassFeatureEntry[];
}

export interface ClassFeaturesData {
  startingProficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    savingThrows: string[];
    skillChoices: { count: number; from: string[] };
  };
  multiclassProficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
  };
  prerequisites: Record<string, number>; // e.g. { STR: 13 }
  features: ClassFeatureEntry[];
  subclassLevel: number;
  subclassFeatureLevels: number[];
  subclasses: Record<string, SubclassFeatureData>;
}

// ============================================================================
// BARBARIAN
// ============================================================================
const BARBARIAN: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
    savingThrows: ['STR', 'CON'],
    skillChoices: { count: 2, from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  },
  multiclassProficiencies: {
    armor: ['Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  prerequisites: { STR: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 6, 10, 14],
  features: [
    { name: 'Rage', level: 1, description: 'Enter a battle rage for bonus damage and resistance to bludgeoning, piercing, and slashing damage. Uses: 2 at Lv1, 3 at Lv3, 4 at Lv6, 5 at Lv12, 6 at Lv17, Unlimited at Lv20.' },
    { name: 'Unarmored Defense', level: 1, description: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier. You can use a shield and still gain this benefit.' },
    { name: 'Reckless Attack', level: 2, description: 'When making your first attack on your turn, you can choose to attack recklessly, gaining advantage on STR-based melee attacks but granting advantage to attackers against you until your next turn.' },
    { name: 'Danger Sense', level: 2, description: 'Advantage on DEX saving throws against effects you can see (such as traps and spells). You cannot be blinded, deafened, or incapacitated to use this.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, when you take the Attack action on your turn.' },
    { name: 'Fast Movement', level: 5, description: 'Your speed increases by 10 feet while you aren\'t wearing heavy armor.' },
    { name: 'Feral Instinct', level: 7, description: 'Advantage on initiative rolls. If surprised, you can act normally on your first turn if you enter rage.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Brutal Critical', level: 9, description: 'Roll one additional weapon damage die when determining extra damage for a critical hit with a melee attack. Increases to 2 dice at Lv13, 3 dice at Lv17.' },
    { name: 'Relentless Rage', level: 11, description: 'While raging, if you drop to 0 HP, you can make a DC 10 CON save to drop to 1 HP instead. DC increases by 5 each use, resets on rest.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Persistent Rage', level: 15, description: 'Your rage only ends early if you fall unconscious or choose to end it.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Indomitable Might', level: 18, description: 'If your total for a STR check is less than your STR score, you can use that score in place of the total.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Primal Champion', level: 20, description: 'STR and CON scores each increase by 4. Maximum for those scores is now 24.' },
  ],
  subclasses: {
    'Path of the Berserker': {
      name: 'Path of the Berserker',
      features: [
        { name: 'Frenzy', level: 3, description: 'While raging, you can frenzy. You can make a single melee weapon attack as a bonus action on each turn. When rage ends, gain one level of exhaustion.' },
        { name: 'Mindless Rage', level: 6, description: 'You can\'t be charmed or frightened while raging. If under such an effect, it\'s suspended for the duration of the rage.' },
        { name: 'Intimidating Presence', level: 10, description: 'Use your action to frighten a creature within 30 feet. Target makes a WIS save (DC 8 + Prof + CHA mod).' },
        { name: 'Retaliation', level: 14, description: 'When you take damage from a creature within 5 feet, you can use your reaction to make a melee weapon attack against it.' },
      ],
    },
    'Path of the Totem Warrior': {
      name: 'Path of the Totem Warrior',
      features: [
        { name: 'Spirit Seeker / Totem Spirit', level: 3, description: 'Choose a totem animal: Bear (resistance to all damage except psychic while raging), Eagle (opportunity attacks have disadvantage against you; Dash as bonus action while raging), or Wolf (allies have advantage on melee attacks against hostile creatures within 5 ft of you while raging).' },
        { name: 'Aspect of the Beast', level: 6, description: 'Gain a benefit based on your totem: Bear (carry capacity doubled), Eagle (see up to 1 mile clearly), Wolf (track creatures at fast pace).' },
        { name: 'Spirit Walker', level: 10, description: 'You can cast Commune with Nature as a ritual.' },
        { name: 'Totemic Attunement', level: 14, description: 'Bear (hostile creatures within 5 ft have disadvantage on attacks against your allies), Eagle (gain flying speed equal to walking speed while raging), Wolf (knock Large or smaller creatures prone when you hit with melee attack while raging).' },
      ],
    },
    'Path of the Zealot': {
      name: 'Path of the Zealot',
      features: [
        { name: 'Divine Fury', level: 3, description: 'While raging, the first creature you hit on each turn takes extra 1d6 + half your barbarian level in necrotic or radiant damage (your choice).' },
        { name: 'Warrior of the Gods', level: 3, description: 'Spells to restore you to life (not Revivify) don\'t require material components.' },
        { name: 'Fanatical Focus', level: 6, description: 'While raging, if you fail a saving throw, you can reroll it (once per rage).' },
        { name: 'Zealous Presence', level: 10, description: 'As a bonus action, up to 10 allies within 60 ft gain advantage on attack rolls and saving throws until your next turn. Once per long rest.' },
        { name: 'Rage Beyond Death', level: 14, description: 'While raging, dropping to 0 HP doesn\'t knock you unconscious. You still make death saves, and you only die if you fail three death saves or your rage ends at 0 HP.' },
      ],
    },
    'Path of Wild Magic': {
      name: 'Path of Wild Magic',
      features: [
        { name: 'Magic Awareness', level: 3, description: 'As an action, sense magic within 60 feet until end of your next turn. Similar to Detect Magic but not a spell.' },
        { name: 'Wild Surge', level: 3, description: 'When you enter rage, roll on the Wild Magic table for a random magical effect.' },
        { name: 'Bolstering Magic', level: 6, description: 'Touch a creature to give +1d3 to attacks/ability checks for 10 min, or restore an expended spell slot of d3 level or lower.' },
        { name: 'Unstable Backlash', level: 10, description: 'When you take damage or fail a save while raging, you can use reaction to roll on Wild Magic table, replacing current Wild Magic effect.' },
        { name: 'Controlled Surge', level: 14, description: 'When you roll on Wild Magic table, you can roll twice and choose which effect to use.' },
      ],
    },
    'Path of the Ancestral Guardian': {
      name: 'Path of the Ancestral Guardian',
      features: [
        { name: 'Ancestral Protectors', level: 3, description: 'While raging, the first creature you hit on your turn has disadvantage on attacks against anyone other than you, and others have resistance to the target\'s damage, until your next turn.' },
        { name: 'Spirit Shield', level: 6, description: 'If a creature you can see within 30 feet takes damage while you\'re raging, use reaction to reduce damage by 2d6 (3d6 at 10th, 4d6 at 14th).' },
        { name: 'Consult the Spirits', level: 10, description: 'Cast Clairvoyance as a ritual without material components.' },
        { name: 'Vengeful Ancestors', level: 14, description: 'When Spirit Shield reduces damage, the attacker takes an amount of force damage equal to the damage prevented.' },
      ],
    },
    'Path of the Storm Herald': {
      name: 'Path of the Storm Herald',
      features: [
        { name: 'Storm Aura', level: 3, description: 'While raging, you emanate a 10-foot aura. Choose: Desert (fire damage), Sea (lightning damage), or Tundra (temp HP to allies).' },
        { name: 'Storm Soul', level: 6, description: 'Gain benefits based on environment: Desert (fire resistance, no extreme heat effects), Sea (lightning resistance, breathe underwater, swim speed), Tundra (cold resistance, no extreme cold effects).' },
        { name: 'Shielding Storm', level: 10, description: 'Creatures of your choice in your aura gain the resistance from your Storm Soul feature.' },
        { name: 'Raging Storm', level: 14, description: 'Desert (reaction to force DEX save or 1/2 barbarian level fire damage), Sea (reaction to force STR save or knock prone), Tundra (aura freezes water and each creature of your choice must make STR save or have speed reduced to 0).' },
      ],
    },
    'Path of the Beast': {
      name: 'Path of the Beast',
      features: [
        { name: 'Form of the Beast', level: 3, description: 'When you enter rage, choose a natural weapon: Bite (1d8 piercing, regain HP on hit), Claws (1d6 slashing each, extra attack when using Attack action), or Tail (1d8 piercing, reach, reaction to add 1d8 to AC against one attack).' },
        { name: 'Bestial Soul', level: 6, description: 'Your natural weapons count as magical. Choose: swimming speed, climbing speed (no hands needed), or long jump of 20 ft.' },
        { name: 'Infectious Fury', level: 10, description: 'When you hit with natural weapons while raging, target must make WIS save or take 2d12 psychic damage or be forced to attack another creature.' },
        { name: 'Call the Hunt', level: 14, description: 'When you enter rage, choose allies within 30 ft equal to your CON mod. Each gains 5 temp HP and +1d6 to the first attack roll per turn. You gain 5 temp HP per ally chosen.' },
      ],
    },
  },
};

// ============================================================================
// BARD
// ============================================================================
const BARD: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ['Three musical instruments of your choice'],
    savingThrows: ['DEX', 'CHA'],
    skillChoices: { count: 3, from: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor'],
    weapons: [],
    tools: ['One musical instrument of your choice'],
  },
  prerequisites: { CHA: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 6, 14],
  features: [
    { name: 'Spellcasting', level: 1, description: 'You can cast bard spells using CHA as your spellcasting ability. You learn spells from the bard spell list.' },
    { name: 'Bardic Inspiration (d6)', level: 1, description: 'Use a bonus action to inspire a creature within 60 ft with a d6 they can add to one ability check, attack roll, or saving throw in the next 10 minutes. Uses equal to CHA mod per long rest.' },
    { name: 'Jack of All Trades', level: 2, description: 'Add half your proficiency bonus (rounded down) to any ability check you make that doesn\'t already include your proficiency bonus.' },
    { name: 'Song of Rest (d6)', level: 2, description: 'During a short rest, you and allies who hear your performance regain extra 1d6 HP when spending Hit Dice. Increases at Lv9 (d8), Lv13 (d10), Lv17 (d12).' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Bardic Inspiration (d8)', level: 5, description: 'Your Bardic Inspiration die becomes a d8.' },
    { name: 'Font of Inspiration', level: 5, description: 'You regain all expended uses of Bardic Inspiration when you finish a short or long rest.' },
    { name: 'Countercharm', level: 6, description: 'As an action, you perform for 1 minute. You and allies within 30 ft have advantage on saves against being frightened or charmed.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Expertise', level: 3, description: 'Choose two skill proficiencies. Your proficiency bonus is doubled for those skills. Choose two more at 10th level.' },
    { name: 'Bardic Inspiration (d10)', level: 10, description: 'Your Bardic Inspiration die becomes a d10.' },
    { name: 'Magical Secrets', level: 10, description: 'Choose two spells from any class and add them to your known spells. Choose two more at 14th and 18th level.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Bardic Inspiration (d12)', level: 15, description: 'Your Bardic Inspiration die becomes a d12.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Superior Inspiration', level: 20, description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.' },
  ],
  subclasses: {
    'College of Lore': {
      name: 'College of Lore',
      features: [
        { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with three skills of your choice.' },
        { name: 'Cutting Words', level: 3, description: 'When a creature you can see within 60 ft makes an attack roll, ability check, or damage roll, you can use your reaction to expend a Bardic Inspiration die and subtract the result from the creature\'s roll.' },
        { name: 'Additional Magical Secrets', level: 6, description: 'You learn two spells from any class. They count as bard spells for you.' },
        { name: 'Peerless Skill', level: 14, description: 'When you make an ability check, you can expend a Bardic Inspiration die and add the result to your check.' },
      ],
    },
    'College of Valor': {
      name: 'College of Valor',
      features: [
        { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with medium armor, shields, and martial weapons.' },
        { name: 'Combat Inspiration', level: 3, description: 'A creature using your Bardic Inspiration can also add the die to a weapon damage roll or to AC as a reaction against one attack.' },
        { name: 'Extra Attack', level: 6, description: 'You can attack twice when you take the Attack action on your turn.' },
        { name: 'Battle Magic', level: 14, description: 'When you cast a bard spell as an action, you can make one weapon attack as a bonus action.' },
      ],
    },
    'College of Glamour': {
      name: 'College of Glamour',
      features: [
        { name: 'Mantle of Inspiration', level: 3, description: 'As a bonus action, expend Bardic Inspiration to give up to CHA mod creatures within 60 ft 5 temp HP and they can move up to their speed as a reaction without provoking opportunity attacks. Temp HP increases with level.' },
        { name: 'Enthralling Performance', level: 3, description: 'After performing for 1 minute, charm up to CHA mod humanoids within 60 ft for 1 hour if they fail a WIS save.' },
        { name: 'Mantle of Majesty', level: 6, description: 'As a bonus action, cast Command without expending a spell slot for 1 minute (concentration). Once per long rest.' },
        { name: 'Unbreakable Majesty', level: 14, description: 'As a bonus action, gain a majestic presence for 1 minute. Creatures attacking you must make a CHA save or choose a new target; on fail, they have disadvantage on saves against your spells until your next turn.' },
      ],
    },
    'College of Swords': {
      name: 'College of Swords',
      features: [
        { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with medium armor and the scimitar. Your weapon can serve as a spellcasting focus.' },
        { name: 'Fighting Style', level: 3, description: 'Choose Dueling (+2 damage with one-handed weapon) or Two-Weapon Fighting (add ability modifier to offhand damage).' },
        { name: 'Blade Flourish', level: 3, description: 'When you take the Attack action, your speed increases by 10 ft and you can use a Bardic Inspiration die for a Defensive Flourish (+AC), Slashing Flourish (damage nearby), or Mobile Flourish (push target).' },
        { name: 'Extra Attack', level: 6, description: 'You can attack twice when you take the Attack action on your turn.' },
        { name: 'Master\'s Flourish', level: 14, description: 'You can use a d6 instead of expending a Bardic Inspiration die for your Blade Flourish.' },
      ],
    },
    'College of Eloquence': {
      name: 'College of Eloquence',
      features: [
        { name: 'Silver Tongue', level: 3, description: 'When you make a Persuasion or Deception check, treat any d20 roll of 9 or lower as a 10.' },
        { name: 'Unsettling Words', level: 3, description: 'As a bonus action, expend a Bardic Inspiration die. A creature within 60 ft subtracts the result from its next saving throw before your next turn.' },
        { name: 'Unfailing Inspiration', level: 6, description: 'When a creature uses your Bardic Inspiration and fails, they don\'t lose the die.' },
        { name: 'Universal Speech', level: 6, description: 'Choose up to CHA mod creatures within 60 ft. They magically understand you for 1 hour regardless of language.' },
        { name: 'Infectious Inspiration', level: 14, description: 'When a creature succeeds using your Bardic Inspiration, use reaction to give another creature within 60 ft a Bardic Inspiration die without expending a use.' },
      ],
    },
    'College of Creation': {
      name: 'College of Creation',
      features: [
        { name: 'Mote of Potential', level: 3, description: 'Your Bardic Inspiration gains extra effects: ability check (roll 2 choose higher), attack roll (temp HP to nearby allies), or saving throw (gain temp HP on success).' },
        { name: 'Performance of Creation', level: 3, description: 'Create a nonmagical item worth no more than 20× your bard level in GP. Item lasts hours equal to proficiency bonus.' },
        { name: 'Animating Performance', level: 6, description: 'Animate a Large or smaller nonmagical item to become a dancing construct under your control for 1 hour.' },
        { name: 'Creative Crescendo', level: 14, description: 'Performance of Creation can create multiple items simultaneously (up to CHA mod), and one can be Large.' },
      ],
    },
    'College of Whispers': {
      name: 'College of Whispers',
      features: [
        { name: 'Psychic Blades', level: 3, description: 'When you hit with a weapon attack, expend Bardic Inspiration to deal extra 2d6 psychic damage (3d6 at 5th, 5d6 at 10th, 8d6 at 15th).' },
        { name: 'Words of Terror', level: 3, description: 'Speak privately with a creature for 1 minute to magically frighten it of a creature of your choice for 1 hour (WIS save negates).' },
        { name: 'Mantle of Whispers', level: 6, description: 'When a humanoid dies within 30 ft, capture its shadow. Use it to magically disguise yourself as that person for 1 hour.' },
        { name: 'Shadow Lore', level: 14, description: 'Whisper to a creature to magically charm it for 8 hours. While charmed, it follows your orders (WIS save negates). Once per long rest.' },
      ],
    },
  },
};

// ============================================================================
// CLERIC
// ============================================================================
const CLERIC: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons'],
    tools: [],
    savingThrows: ['WIS', 'CHA'],
    skillChoices: { count: 2, from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: [],
    tools: [],
  },
  prerequisites: { WIS: 13 },
  subclassLevel: 1,
  subclassFeatureLevels: [1, 2, 6, 8, 17],
  features: [
    { name: 'Spellcasting', level: 1, description: 'You can cast cleric spells using WIS as your spellcasting ability. You prepare spells from the entire cleric spell list.' },
    { name: 'Channel Divinity (1/rest)', level: 2, description: 'You gain the ability to channel divine energy. Turn Undead: each undead within 30 ft must make a WIS save or be turned for 1 minute. Uses: 1 at Lv2, 2 at Lv6, 3 at Lv18.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Destroy Undead (CR 1/2)', level: 5, description: 'When an undead fails its save against Turn Undead and has CR 1/2 or lower, it is instantly destroyed. CR threshold increases: 1 at Lv8, 2 at Lv11, 3 at Lv14, 4 at Lv17.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Divine Intervention', level: 10, description: 'Call on your deity for aid. Roll d100; if you roll equal to or below your cleric level, the deity intervenes. Once per long rest (auto-succeed at Lv20).' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
  ],
  subclasses: {
    'Life Domain': {
      name: 'Life Domain',
      features: [
        { name: 'Bonus Proficiency', level: 1, description: 'You gain proficiency with heavy armor.' },
        { name: 'Disciple of Life', level: 1, description: 'Whenever you use a spell of 1st level or higher to restore HP, the creature regains additional HP equal to 2 + the spell\'s level.' },
        { name: 'Channel Divinity: Preserve Life', level: 2, description: 'As an action, restore a total of 5 × cleric level HP, divided among creatures within 30 ft (can\'t exceed half their max HP).' },
        { name: 'Blessed Healer', level: 6, description: 'When you cast a healing spell on another creature, you also regain HP equal to 2 + the spell\'s level.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 radiant damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Supreme Healing', level: 17, description: 'When you roll dice to restore HP with a healing spell, treat any die roll of 1-4 as a 5 instead.' },
      ],
    },
    'Light Domain': {
      name: 'Light Domain',
      features: [
        { name: 'Bonus Cantrip: Light', level: 1, description: 'You gain the Light cantrip if you don\'t already know it.' },
        { name: 'Warding Flare', level: 1, description: 'When attacked by a creature within 30 ft, use reaction to impose disadvantage on the attack roll. Uses: WIS mod per long rest.' },
        { name: 'Channel Divinity: Radiance of the Dawn', level: 2, description: 'As an action, dispel magical darkness within 30 ft. Each hostile creature within 30 ft takes 2d10 + cleric level radiant damage (CON save for half).' },
        { name: 'Improved Flare', level: 6, description: 'You can also use Warding Flare when a creature you can see within 30 ft attacks a creature other than you.' },
        { name: 'Potent Spellcasting', level: 8, description: 'Add your WIS modifier to the damage of cleric cantrips.' },
        { name: 'Corona of Light', level: 17, description: 'As an action, activate an aura of sunlight (60 ft bright light, 30 ft dim). Enemies in bright light have disadvantage on saves against fire/radiant spells.' },
      ],
    },
    'Tempest Domain': {
      name: 'Tempest Domain',
      features: [
        { name: 'Bonus Proficiencies', level: 1, description: 'You gain proficiency with martial weapons and heavy armor.' },
        { name: 'Wrath of the Storm', level: 1, description: 'When a creature within 5 ft hits you with an attack, use reaction to deal 2d8 lightning or thunder damage (DEX save for half). Uses: WIS mod per long rest.' },
        { name: 'Channel Divinity: Destructive Wrath', level: 2, description: 'When you deal lightning or thunder damage, you can use Channel Divinity to deal maximum damage instead of rolling.' },
        { name: 'Thunderbolt Strike', level: 6, description: 'When you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 thunder damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Stormborn', level: 17, description: 'You have a flying speed equal to your walking speed whenever you are outdoors.' },
      ],
    },
    'War Domain': {
      name: 'War Domain',
      features: [
        { name: 'Bonus Proficiencies', level: 1, description: 'You gain proficiency with martial weapons and heavy armor.' },
        { name: 'War Priest', level: 1, description: 'When you take the Attack action, you can make one weapon attack as a bonus action. Uses: WIS mod per long rest.' },
        { name: 'Channel Divinity: Guided Strike', level: 2, description: 'When you make an attack roll, you can use Channel Divinity to gain +10 to the roll.' },
        { name: 'Channel Divinity: War God\'s Blessing', level: 6, description: 'When a creature within 30 ft makes an attack roll, you can use reaction and Channel Divinity to grant +10 to the roll.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 damage of the weapon\'s type with a weapon attack (2d8 at 14th level).' },
        { name: 'Avatar of Battle', level: 17, description: 'You have resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.' },
      ],
    },
    'Trickery Domain': {
      name: 'Trickery Domain',
      features: [
        { name: 'Blessing of the Trickster', level: 1, description: 'Touch a willing creature to give it advantage on Stealth checks for 1 hour.' },
        { name: 'Channel Divinity: Invoke Duplicity', level: 2, description: 'Create an illusory duplicate of yourself within 30 ft for 1 minute (concentration). You have advantage on attack rolls against creatures within 5 ft of the duplicate.' },
        { name: 'Channel Divinity: Cloak of Shadows', level: 6, description: 'As an action, become invisible until end of your next turn or until you attack/cast a spell.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 poison damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Improved Duplicity', level: 17, description: 'You can create up to four duplicates with Invoke Duplicity.' },
      ],
    },
    'Knowledge Domain': {
      name: 'Knowledge Domain',
      features: [
        { name: 'Blessings of Knowledge', level: 1, description: 'Learn two languages. Gain proficiency and double proficiency bonus in two of: Arcana, History, Nature, or Religion.' },
        { name: 'Channel Divinity: Knowledge of the Ages', level: 2, description: 'As an action, gain proficiency with one skill or tool for 10 minutes.' },
        { name: 'Channel Divinity: Read Thoughts', level: 6, description: 'As an action, read a creature\'s surface thoughts within 60 ft for 1 minute (WIS save). If it fails, you can also cast Suggestion on it.' },
        { name: 'Potent Spellcasting', level: 8, description: 'Add your WIS modifier to the damage of cleric cantrips.' },
        { name: 'Visions of the Past', level: 17, description: 'Spend 1 minute in meditation to receive visions from the history of an object you hold or the area you\'re in.' },
      ],
    },
    'Nature Domain': {
      name: 'Nature Domain',
      features: [
        { name: 'Acolyte of Nature', level: 1, description: 'Learn one druid cantrip. Gain proficiency in Animal Handling, Nature, or Survival.' },
        { name: 'Bonus Proficiency', level: 1, description: 'You gain proficiency with heavy armor.' },
        { name: 'Channel Divinity: Charm Animals and Plants', level: 2, description: 'As an action, each beast and plant creature within 30 ft must make a WIS save or be charmed by you for 1 minute.' },
        { name: 'Dampen Elements', level: 6, description: 'When you or a creature within 30 ft takes acid, cold, fire, lightning, or thunder damage, use reaction to grant resistance to that damage.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 cold, fire, or lightning damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Master of Nature', level: 17, description: 'While creatures are charmed by your Charm Animals and Plants, you can command them on each of your turns as a bonus action.' },
      ],
    },
    'Forge Domain': {
      name: 'Forge Domain',
      features: [
        { name: 'Bonus Proficiency', level: 1, description: 'You gain proficiency with heavy armor and smith\'s tools.' },
        { name: 'Blessing of the Forge', level: 1, description: 'At the end of a long rest, touch one nonmagical weapon or armor to make it a +1 item until your next long rest.' },
        { name: 'Channel Divinity: Artisan\'s Blessing', level: 2, description: 'Conduct a 1-hour ritual to craft a nonmagical metal item worth ≤ 100 GP by providing metal equal to its value.' },
        { name: 'Soul of the Forge', level: 6, description: 'You gain +1 AC while wearing heavy armor and resistance to fire damage.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 fire damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Saint of Forge and Fire', level: 17, description: 'While wearing heavy armor: immunity to fire damage, resistance to bludgeoning/piercing/slashing from nonmagical attacks.' },
      ],
    },
    'Grave Domain': {
      name: 'Grave Domain',
      features: [
        { name: 'Circle of Mortality', level: 1, description: 'When you would roll dice to restore HP to a creature at 0 HP, use the maximum result instead. You learn Spare the Dying (cast as bonus action at range of 30 ft).' },
        { name: 'Eyes of the Grave', level: 1, description: 'As an action, detect undead within 60 ft not behind total cover. Uses: WIS mod per long rest.' },
        { name: 'Channel Divinity: Path to the Grave', level: 2, description: 'As an action, choose a creature within 30 ft. The next time it takes damage before your next turn, it is vulnerable to that damage.' },
        { name: 'Sentinel at Death\'s Door', level: 6, description: 'As a reaction, turn a critical hit against a creature within 30 ft into a normal hit. Uses: WIS mod per long rest.' },
        { name: 'Potent Spellcasting', level: 8, description: 'Add your WIS modifier to the damage of cleric cantrips.' },
        { name: 'Keeper of Souls', level: 17, description: 'When an enemy you can see dies within 60 ft, you or one ally within 60 ft regains HP equal to the enemy\'s number of hit dice.' },
      ],
    },
    'Peace Domain': {
      name: 'Peace Domain',
      features: [
        { name: 'Implement of Peace', level: 1, description: 'Gain proficiency in Insight, Medicine, Performance, or Persuasion.' },
        { name: 'Emboldening Bond', level: 1, description: 'Bond a number of creatures equal to proficiency bonus. For 10 minutes, a bonded creature can add 1d4 to an attack/check/save once per turn if within 30 ft of another bonded creature.' },
        { name: 'Channel Divinity: Balm of Peace', level: 2, description: 'Move up to your speed without provoking opportunity attacks. Restore 2d6 + WIS mod HP to each creature within 5 ft as you pass.' },
        { name: 'Protective Bond', level: 6, description: 'When a bonded creature takes damage, another bonded creature within 30 ft can use reaction to teleport adjacent and take all the damage instead (with resistance).' },
        { name: 'Potent Spellcasting', level: 8, description: 'Add your WIS modifier to the damage of cleric cantrips.' },
        { name: 'Expansive Bond', level: 17, description: 'Emboldening Bond and Protective Bond range extends to 60 ft. Protective Bond grants resistance to the redirected damage.' },
      ],
    },
    'Twilight Domain': {
      name: 'Twilight Domain',
      features: [
        { name: 'Bonus Proficiencies', level: 1, description: 'You gain proficiency with martial weapons and heavy armor.' },
        { name: 'Eyes of Night', level: 1, description: 'You have darkvision out to 300 ft. You can share it with willing creatures within 10 ft for 1 hour.' },
        { name: 'Vigilant Blessing', level: 1, description: 'Touch a creature (including yourself) to give it advantage on the next initiative roll. Ends after use or next long rest.' },
        { name: 'Channel Divinity: Twilight Sanctuary', level: 2, description: 'As an action, create a 30-ft radius sphere of dim light for 1 minute. Creatures of your choice ending their turn in it gain 1d6 + cleric level temp HP or end one charmed/frightened effect.' },
        { name: 'Steps of Night', level: 6, description: 'As a bonus action, grant yourself a flying speed equal to walking speed for 1 minute while in dim light or darkness. Uses: proficiency bonus per long rest.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 radiant damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Twilight Shroud', level: 17, description: 'Creatures of your choice in your Twilight Sanctuary have half cover (+2 to AC and DEX saves).' },
      ],
    },
    'Order Domain': {
      name: 'Order Domain',
      features: [
        { name: 'Bonus Proficiencies', level: 1, description: 'You gain proficiency with heavy armor and Intimidation or Persuasion.' },
        { name: 'Voice of Authority', level: 1, description: 'When you cast a spell on an ally using a spell slot of 1st level or higher, that ally can use reaction to make one weapon attack.' },
        { name: 'Channel Divinity: Order\'s Demand', level: 2, description: 'As an action, each creature of your choice within 30 ft must make a WIS save or be charmed until the end of your next turn. You can also drop its held items.' },
        { name: 'Embodiment of the Law', level: 6, description: 'When you cast an enchantment spell of 1st level or higher, you can cast it as a bonus action. Uses: WIS mod per long rest.' },
        { name: 'Divine Strike', level: 8, description: 'Once per turn, deal extra 1d8 psychic damage with a weapon attack (2d8 at 14th level).' },
        { name: 'Order\'s Wrath', level: 17, description: 'When you deal your Divine Strike damage, the target is also cursed. The next time an ally hits the cursed target, it takes extra 2d8 psychic damage.' },
      ],
    },
  },
};

// ============================================================================
// DRUID
// ============================================================================
const DRUID: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields (non-metal)'],
    weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    tools: ['Herbalism Kit'],
    savingThrows: ['INT', 'WIS'],
    skillChoices: { count: 2, from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields (non-metal)'],
    weapons: [],
    tools: [],
  },
  prerequisites: { WIS: 13 },
  subclassLevel: 2,
  subclassFeatureLevels: [2, 6, 10, 14],
  features: [
    { name: 'Druidic', level: 1, description: 'You know Druidic, the secret language of druids. You can leave hidden messages that other druids understand.' },
    { name: 'Spellcasting', level: 1, description: 'You can cast druid spells using WIS as your spellcasting ability. You prepare spells from the entire druid spell list.' },
    { name: 'Wild Shape', level: 2, description: 'As an action, transform into a beast you have seen. Uses: 2 per short/long rest. Max CR: 1/4 at Lv2, 1/2 at Lv4, 1 at Lv8. Duration: hours = half druid level.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Timeless Body', level: 18, description: 'You age 1 year for every 10 years that pass. You can no longer be magically aged.' },
    { name: 'Beast Spells', level: 18, description: 'You can cast spells while in Wild Shape form (if the spell has no material component or you can provide it).' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Archdruid', level: 20, description: 'You can use Wild Shape an unlimited number of times. You can ignore verbal and somatic components of druid spells, and material components without a cost.' },
  ],
  subclasses: {
    'Circle of the Land': {
      name: 'Circle of the Land',
      features: [
        { name: 'Bonus Cantrip', level: 2, description: 'You learn one additional druid cantrip of your choice.' },
        { name: 'Natural Recovery', level: 2, description: 'During a short rest, recover expended spell slots with a combined level equal to or less than half your druid level (rounded up). No 6th level or higher slots.' },
        { name: 'Circle Spells', level: 3, description: 'You gain access to additional spells based on the land where you became a druid (Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, or Underdark).' },
        { name: 'Land\'s Stride', level: 6, description: 'Moving through nonmagical difficult terrain costs no extra movement. You can pass through nonmagical plants without being slowed. Advantage on saves against magically created/manipulated plants.' },
        { name: 'Nature\'s Ward', level: 10, description: 'You can\'t be charmed or frightened by elementals or fey. You are immune to poison and disease.' },
        { name: 'Nature\'s Sanctuary', level: 14, description: 'When a beast or plant creature attacks you, it must make a WIS save or choose a different target. On a failed save, the creature must choose a different target or the attack automatically misses.' },
      ],
    },
    'Circle of the Moon': {
      name: 'Circle of the Moon',
      features: [
        { name: 'Combat Wild Shape', level: 2, description: 'You can use Wild Shape as a bonus action. While in Wild Shape, you can spend a spell slot as a bonus action to regain 1d8 HP per level of the spell slot.' },
        { name: 'Circle Forms', level: 2, description: 'You can transform into beasts with a CR as high as 1 (CR = druid level ÷ 3 at 6th level and higher).' },
        { name: 'Primal Strike', level: 6, description: 'Your attacks in beast form count as magical for overcoming resistance and immunity.' },
        { name: 'Elemental Wild Shape', level: 10, description: 'You can expend two uses of Wild Shape to transform into an air, earth, fire, or water elemental.' },
        { name: 'Thousand Forms', level: 14, description: 'You can cast Alter Self at will.' },
      ],
    },
    'Circle of Dreams': {
      name: 'Circle of Dreams',
      features: [
        { name: 'Balm of the Summer Court', level: 2, description: 'You have a pool of fey energy (d6s equal to druid level). As a bonus action, spend dice to heal a creature within 120 ft and grant temp HP.' },
        { name: 'Hearth of Moonlight and Shadow', level: 6, description: 'During a rest, create a 30-ft sphere that grants +5 to Stealth and Perception and makes the area invisible from the outside.' },
        { name: 'Hidden Paths', level: 10, description: 'As a bonus action, teleport yourself up to 60 ft or teleport a willing creature within 30 ft up to 30 ft. Uses: WIS mod per long rest.' },
        { name: 'Walker in Dreams', level: 14, description: 'After a short rest, cast Dream, Scrying, or Teleportation Circle (to the last place you long rested) without expending a spell slot. Once per long rest.' },
      ],
    },
    'Circle of the Shepherd': {
      name: 'Circle of the Shepherd',
      features: [
        { name: 'Speech of the Woods', level: 2, description: 'You can communicate with beasts and learn Sylvan.' },
        { name: 'Spirit Totem', level: 2, description: 'As a bonus action, summon a spirit totem (60-ft aura, 1 minute). Bear Spirit (temp HP), Hawk Spirit (advantage on Perception, advantage on attacks for allies), or Unicorn Spirit (healing aura when you cast healing spells).' },
        { name: 'Mighty Summoner', level: 6, description: 'Beasts and fey you conjure have +2 HP per Hit Die and their natural attacks are magical.' },
        { name: 'Guardian Spirit', level: 10, description: 'Beasts and fey you summon regain HP equal to half your druid level when they end their turn in your Spirit Totem aura.' },
        { name: 'Faithful Summons', level: 14, description: 'If you are reduced to 0 HP or incapacitated, you can immediately summon up to four beasts of CR 2 or lower within 20 ft of you. They appear with 1/2 HP and defend you. Once per long rest.' },
      ],
    },
    'Circle of Spores': {
      name: 'Circle of Spores',
      features: [
        { name: 'Halo of Spores', level: 2, description: 'When a creature you can see moves within 10 ft or starts its turn there, use reaction to deal 1d4 necrotic damage (CON save negates). Damage increases: 1d6 at 6th, 1d8 at 10th, 1d10 at 14th.' },
        { name: 'Symbiotic Entity', level: 2, description: 'As an action, use a Wild Shape to gain 4 × druid level temp HP. While you have the temp HP: Halo of Spores damage is doubled and melee attacks deal extra 1d6 necrotic.' },
        { name: 'Fungal Infestation', level: 6, description: 'If a beast or humanoid of Small/Medium size dies within 10 ft, use reaction to animate it as a zombie with 1 HP for 1 hour. Uses: WIS mod per long rest.' },
        { name: 'Spreading Spores', level: 10, description: 'As a bonus action while Symbiotic Entity is active, hurl spores up to 30 ft to create a 10-ft cube that deals Halo of Spores damage to creatures entering or starting there.' },
        { name: 'Fungal Body', level: 14, description: 'You can\'t be blinded, deafened, frightened, or poisoned. Any critical hit against you becomes a normal hit unless you are incapacitated.' },
      ],
    },
    'Circle of Stars': {
      name: 'Circle of Stars',
      features: [
        { name: 'Star Map', level: 2, description: 'You gain a star map focus. You learn Guidance and Guiding Bolt (free cast once per long rest). The star map is your spellcasting focus.' },
        { name: 'Starry Form', level: 2, description: 'As a bonus action, use a Wild Shape to enter a starry form (Archer: bonus action ranged attack 1d8+WIS radiant; Chalice: heal when casting healing spells; Dragon: treat rolls of 9 or lower as 10 on concentration saves and INT/WIS checks).' },
        { name: 'Cosmic Omen', level: 6, description: 'After a long rest, roll a die. Weal (even): as a reaction, add 1d6 to a creature\'s roll within 30 ft. Woe (odd): subtract 1d6. Uses: proficiency bonus per long rest.' },
        { name: 'Twinkling Constellations', level: 10, description: 'You can change Starry Form constellation at the start of each turn. Archer/Chalice die becomes 2d8. Dragon: gain flying speed of 20 ft and hover.' },
        { name: 'Full of Stars', level: 14, description: 'While in Starry Form, you are partially incorporeal: resistance to bludgeoning, piercing, and slashing damage.' },
      ],
    },
    'Circle of Wildfire': {
      name: 'Circle of Wildfire',
      features: [
        { name: 'Summon Wildfire Spirit', level: 2, description: 'Use a Wild Shape to summon a wildfire spirit in an unoccupied space within 30 ft. Creatures within 10 ft take 2d6 fire damage (DEX save for half). Spirit acts on your initiative.' },
        { name: 'Enhanced Bond', level: 6, description: 'When you cast a healing or fire damage spell, you can add 1d8 to one roll if the wildfire spirit is active. You can cast through the spirit\'s space.' },
        { name: 'Cauterizing Flames', level: 10, description: 'When a creature you see dies in or adjacent to your wildfire spirit, you can use reaction to create spectral flame. Another creature touching it regains 2d10 + WIS mod HP or takes 2d10 + WIS mod fire damage. Uses: proficiency bonus per long rest.' },
        { name: 'Blazing Revival', level: 14, description: 'If you are reduced to 0 HP and your wildfire spirit is within 120 ft, the spirit is destroyed and you regain HP equal to half your HP max and rise to your feet. Once per long rest.' },
      ],
    },
  },
};

// ============================================================================
// FIGHTER
// ============================================================================
const FIGHTER: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
    savingThrows: ['STR', 'CON'],
    skillChoices: { count: 2, from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  prerequisites: { STR: 13 }, // STR 13 or DEX 13
  subclassLevel: 3,
  subclassFeatureLevels: [3, 7, 10, 15, 18],
  features: [
    { name: 'Fighting Style', level: 1, description: 'Choose a fighting style: Archery (+2 to ranged attack rolls), Defense (+1 AC in armor), Dueling (+2 damage one-handed), Great Weapon Fighting (reroll 1s and 2s on two-handed weapon damage), Protection (impose disadvantage on attack roll against ally), or Two-Weapon Fighting (add ability mod to offhand damage).' },
    { name: 'Second Wind', level: 1, description: 'On your turn, use a bonus action to regain HP equal to 1d10 + fighter level. Once per short or long rest.' },
    { name: 'Action Surge', level: 2, description: 'Take one additional action on your turn. Once per short or long rest (twice at 17th level).' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Extra Attack', level: 5, description: 'Attack twice when you take the Attack action. Increases to three attacks at 11th and four at 20th level.' },
    { name: 'Ability Score Improvement', level: 6, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Indomitable', level: 9, description: 'Reroll a failed saving throw. You must use the new roll. Once per long rest (twice at 13th, three times at 17th).' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 14, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
  ],
  subclasses: {
    'Champion': {
      name: 'Champion',
      features: [
        { name: 'Improved Critical', level: 3, description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' },
        { name: 'Remarkable Athlete', level: 7, description: 'Add half your proficiency bonus (rounded up) to any STR, DEX, or CON check that doesn\'t already use your proficiency bonus. Your running long jump distance increases by your STR modifier.' },
        { name: 'Additional Fighting Style', level: 10, description: 'Choose a second Fighting Style option.' },
        { name: 'Superior Critical', level: 15, description: 'Your weapon attacks score a critical hit on a roll of 18, 19, or 20.' },
        { name: 'Survivor', level: 18, description: 'At the start of each of your turns, you regain HP equal to 5 + CON modifier if you have no more than half your HP remaining. Doesn\'t function if you have 0 HP.' },
      ],
    },
    'Battle Master': {
      name: 'Battle Master',
      features: [
        { name: 'Combat Superiority', level: 3, description: 'Learn 3 maneuvers and gain 4 superiority dice (d8). Choose from: Commander\'s Strike, Disarming Attack, Distracting Strike, Evasive Footwork, Feinting Attack, Goading Attack, Lunging Attack, Maneuvering Attack, Menacing Attack, Parry, Precision Attack, Pushing Attack, Rally, Riposte, Sweeping Attack, Trip Attack.' },
        { name: 'Student of War', level: 3, description: 'You gain proficiency with one type of artisan\'s tools.' },
        { name: 'Know Your Enemy', level: 7, description: 'If you spend 1 minute observing a creature, the DM tells you if it is equal, superior, or inferior in two characteristics (STR, DEX, CON, AC, current HP, total class levels, or fighter class levels).' },
        { name: 'Improved Combat Superiority', level: 10, description: 'Your superiority dice become d10s (d12s at 18th level).' },
        { name: 'Relentless', level: 15, description: 'When you roll initiative and have no superiority dice remaining, you regain one superiority die.' },
      ],
    },
    'Eldritch Knight': {
      name: 'Eldritch Knight',
      features: [
        { name: 'Spellcasting', level: 3, description: 'You gain spellcasting ability from the wizard spell list, focusing on Abjuration and Evocation. INT is your spellcasting ability. Third-caster progression.' },
        { name: 'Weapon Bond', level: 3, description: 'Bond with up to two weapons. You can\'t be disarmed of a bonded weapon and can summon it to your hand as a bonus action.' },
        { name: 'War Magic', level: 7, description: 'When you use your action to cast a cantrip, you can make one weapon attack as a bonus action.' },
        { name: 'Eldritch Strike', level: 10, description: 'When you hit a creature with a weapon attack, it has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn.' },
        { name: 'Arcane Charge', level: 15, description: 'When you use Action Surge, you can teleport up to 30 feet to an unoccupied space you can see.' },
        { name: 'Improved War Magic', level: 18, description: 'When you use your action to cast a spell, you can make one weapon attack as a bonus action.' },
      ],
    },
    'Arcane Archer': {
      name: 'Arcane Archer',
      features: [
        { name: 'Arcane Archer Lore', level: 3, description: 'Learn Druidcraft or Prestidigitation cantrip and gain proficiency in Arcana or Nature.' },
        { name: 'Arcane Shot', level: 3, description: 'Learn 2 Arcane Shot options (Banishing, Beguiling, Bursting, Enfeebling, Grasping, Piercing, Seeking, Shadow). Twice per short rest, apply an effect when you hit with a magic arrow.' },
        { name: 'Magic Arrow', level: 7, description: 'Whenever you fire a nonmagical arrow, it becomes magical (+1) for the purpose of overcoming resistance and immunity.' },
        { name: 'Curving Shot', level: 7, description: 'When you miss with a magic arrow, use a bonus action to reroll the attack against a different target within 60 ft of the original.' },
        { name: 'Ever-Ready Shot', level: 15, description: 'When you roll initiative and have no Arcane Shot uses, you regain one use.' },
      ],
    },
    'Cavalier': {
      name: 'Cavalier',
      features: [
        { name: 'Bonus Proficiency', level: 3, description: 'Gain proficiency in Animal Handling, History, Insight, Performance, or Persuasion. Or learn one language.' },
        { name: 'Born to the Saddle', level: 3, description: 'Advantage on saves to avoid falling off mount. If you fall, you land on your feet if not incapacitated. Mounting/dismounting costs only 5 ft of movement.' },
        { name: 'Unwavering Mark', level: 3, description: 'When you hit a creature with melee attack, you can mark it until end of your next turn. Marked creature has disadvantage on attacks that don\'t target you. If it damages anyone other than you, you can make a bonus action melee attack against it with extra damage equal to half fighter level.' },
        { name: 'Warding Maneuver', level: 7, description: 'When you or a creature within 5 ft is hit by an attack, if you can see it, use reaction to add 1d8 to AC (potentially causing miss). If the attack still hits, target has resistance. Uses: CON mod per long rest.' },
        { name: 'Hold the Line', level: 10, description: 'Creatures that move at least 5 ft within your reach provoke opportunity attacks. If your opportunity attack hits, the creature\'s speed becomes 0 for the rest of the turn.' },
        { name: 'Ferocious Charger', level: 15, description: 'If you move at least 10 ft in a straight line before attacking, the target must make a STR save or be knocked prone (bonus action). You can then attack the prone target.' },
        { name: 'Vigilant Defender', level: 18, description: 'You gain a special reaction you can use on every other creature\'s turn for an opportunity attack. Can\'t use this on the same turn you use your normal reaction.' },
      ],
    },
    'Samurai': {
      name: 'Samurai',
      features: [
        { name: 'Bonus Proficiency', level: 3, description: 'Gain proficiency in History, Insight, Performance, or Persuasion. Or learn one language.' },
        { name: 'Fighting Spirit', level: 3, description: 'As a bonus action, gain advantage on all weapon attack rolls until end of turn and 5 temp HP (10 at 10th, 15 at 15th). Three times per long rest.' },
        { name: 'Elegant Courtier', level: 7, description: 'Add WIS modifier to Persuasion checks. Gain proficiency in WIS saving throws (or INT/CHA if already proficient).' },
        { name: 'Tireless Spirit', level: 10, description: 'When you roll initiative and have no uses of Fighting Spirit, you regain one use.' },
        { name: 'Rapid Strike', level: 15, description: 'If you have advantage on an attack roll and hit, you can forego the advantage on one attack to make one additional weapon attack as part of the same action.' },
        { name: 'Strength Before Death', level: 18, description: 'If you are reduced to 0 HP, you can take an entire extra turn immediately (interrupting the current turn). If you take damage at 0 HP during this turn, you suffer normal death save failures. Once per long rest.' },
      ],
    },
    'Rune Knight': {
      name: 'Rune Knight',
      features: [
        { name: 'Bonus Proficiency', level: 3, description: 'Gain proficiency with smith\'s tools.' },
        { name: 'Rune Carver', level: 3, description: 'Learn 2 runes from: Cloud (advantage on Deception/Sleight of Hand, reaction to redirect attack), Fire (+2 to tool checks, bonus action for extra fire damage), Frost (advantage on Animal Handling/Intimidation, reaction to boost STR/CON save), Stone (advantage on Insight, reaction to charm), Hill (resistance to poison, advantage on poison saves), or Storm (advantage on Arcana, reaction to give advantage or disadvantage on attack).' },
        { name: 'Giant\'s Might', level: 3, description: 'As a bonus action, become Large for 1 minute. Advantage on STR checks/saves, and once per turn deal extra 1d6 damage (1d8 at 10th, 1d10 at 18th). Uses: proficiency bonus per long rest.' },
        { name: 'Runic Shield', level: 7, description: 'When a creature you can see within 60 ft is hit by an attack, use reaction to force the attacker to reroll and use the new roll.' },
        { name: 'Great Stature', level: 10, description: 'Your height increases by 3d4 inches. Giant\'s Might extra damage increases to 1d8.' },
        { name: 'Master of Runes', level: 15, description: 'You can use each rune\'s invoke power twice instead of once per short/long rest.' },
        { name: 'Runic Juggernaut', level: 18, description: 'Giant\'s Might makes you Huge. Extra damage increases to 1d10. Your reach increases by 5 ft.' },
      ],
    },
    'Psi Warrior': {
      name: 'Psi Warrior',
      features: [
        { name: 'Psionic Power', level: 3, description: 'Gain a pool of Psionic Energy dice (d6, count = 2 × proficiency bonus). Use for: Protective Field (reaction, reduce damage by roll + INT mod), Psionic Strike (extra force damage once per turn), Telekinetic Movement (move object or creature up to 30 ft).' },
        { name: 'Telekinetic Adept', level: 7, description: 'Psi-Powered Leap: as a bonus action, gain flying speed equal to twice walking speed until end of turn. Telekinetic Thrust: when dealing Psionic Strike damage, force target to make STR save or be knocked prone or pushed 10 ft.' },
        { name: 'Guarded Mind', level: 10, description: 'Resistance to psychic damage. If charmed or frightened, spend a Psionic Energy die to end the effect.' },
        { name: 'Bulwark of Force', level: 15, description: 'As a bonus action, choose up to INT mod creatures within 30 ft. Each gains half cover (+2 AC and DEX saves) for 1 minute. Once per long rest (or spend a Psionic Energy die).' },
        { name: 'Telekinetic Master', level: 18, description: 'Cast Telekinesis without components, using INT as spellcasting ability. While concentrating on it, make one weapon attack as a bonus action on each turn. Once per long rest (or spend a Psionic Energy die).' },
      ],
    },
  },
};

// ============================================================================
// MONK
// ============================================================================
const MONK: ClassFeaturesData = {
  startingProficiencies: {
    armor: [],
    weapons: ['Simple Weapons', 'Shortswords'],
    tools: ['One type of artisan\'s tools or one musical instrument'],
    savingThrows: ['STR', 'DEX'],
    skillChoices: { count: 2, from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  },
  multiclassProficiencies: {
    armor: [],
    weapons: ['Simple Weapons', 'Shortswords'],
    tools: [],
  },
  prerequisites: { DEX: 13, WIS: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 6, 11, 17],
  features: [
    { name: 'Unarmored Defense', level: 1, description: 'While not wearing armor or wielding a shield, your AC equals 10 + DEX modifier + WIS modifier.' },
    { name: 'Martial Arts', level: 1, description: 'While unarmed or using monk weapons: use DEX for attack/damage, roll a d4 (scales up) for unarmed damage, make one unarmed strike as a bonus action after attacking. Die: d4 at 1st, d6 at 5th, d8 at 11th, d10 at 17th.' },
    { name: 'Ki', level: 2, description: 'You have ki points equal to your monk level. Spend ki for: Flurry of Blows (bonus action: two unarmed strikes), Patient Defense (bonus action: Dodge), Step of the Wind (bonus action: Disengage or Dash, jump distance doubled). Regain all ki on short/long rest.' },
    { name: 'Unarmored Movement', level: 2, description: 'Speed increases by 10 ft while not wearing armor or wielding a shield. Increases: +15 at 6th, +20 at 10th, +25 at 14th, +30 at 18th.' },
    { name: 'Deflect Missiles', level: 3, description: 'Use reaction to reduce ranged weapon attack damage by 1d10 + DEX mod + monk level. If reduced to 0, catch the missile and spend 1 ki to throw it back (ranged attack, monk weapon damage).' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Extra Attack', level: 5, description: 'Attack twice when you take the Attack action on your turn.' },
    { name: 'Slow Fall', level: 4, description: 'Use reaction to reduce falling damage by 5 × monk level.' },
    { name: 'Stunning Strike', level: 5, description: 'When you hit a creature with a melee weapon attack, spend 1 ki to force a CON save or the target is stunned until the end of your next turn.' },
    { name: 'Ki-Empowered Strikes', level: 6, description: 'Your unarmed strikes count as magical for overcoming resistance and immunity.' },
    { name: 'Evasion', level: 7, description: 'When subjected to an effect that allows a DEX save for half damage, you take no damage on success and half on failure.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Stillness of Mind', level: 7, description: 'As an action, end one charmed or frightened effect on yourself.' },
    { name: 'Purity of Body', level: 10, description: 'You are immune to disease and poison.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Tongue of the Sun and Moon', level: 13, description: 'You can understand all spoken languages and any creature that can understand a language can understand you.' },
    { name: 'Diamond Soul', level: 14, description: 'Proficiency in all saving throws. If you fail a saving throw, spend 1 ki to reroll and use the new result.' },
    { name: 'Timeless Body', level: 15, description: 'You no longer need food or water. You don\'t suffer the frailty of old age and can\'t be aged magically.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Empty Body', level: 18, description: 'Spend 4 ki to become invisible for 1 minute (resistance to all damage except force). Spend 8 ki to cast Astral Projection without material components.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Perfect Self', level: 20, description: 'When you roll initiative and have no ki points remaining, you regain 4 ki points.' },
  ],
  subclasses: {
    'Way of the Open Hand': {
      name: 'Way of the Open Hand',
      features: [
        { name: 'Open Hand Technique', level: 3, description: 'When you hit with a Flurry of Blows attack, you can impose one effect: target must succeed on DEX save or be knocked prone; target must make STR save or be pushed 15 ft; target can\'t take reactions until end of your next turn.' },
        { name: 'Wholeness of Body', level: 6, description: 'As an action, regain HP equal to 3 × your monk level. Once per long rest.' },
        { name: 'Tranquility', level: 11, description: 'At the end of a long rest, you gain the effect of a Sanctuary spell (WIS save DC) that lasts until your next long rest or you attack/cast an offensive spell.' },
        { name: 'Quivering Palm', level: 17, description: 'When you hit a creature with an unarmed strike, spend 3 ki to start imperceptible vibrations. Within a number of days equal to your monk level, use an action to end the vibrations: the creature makes a CON save or is reduced to 0 HP. Success: 10d10 necrotic damage.' },
      ],
    },
    'Way of Shadow': {
      name: 'Way of Shadow',
      features: [
        { name: 'Shadow Arts', level: 3, description: 'Spend 2 ki to cast Darkness, Darkvision, Pass Without Trace, or Silence. You also learn Minor Illusion cantrip.' },
        { name: 'Shadow Step', level: 6, description: 'When in dim light or darkness, as a bonus action teleport up to 60 ft to another space in dim light or darkness. You gain advantage on the first melee attack you make before end of turn.' },
        { name: 'Cloak of Shadows', level: 11, description: 'While in dim light or darkness, you can use your action to become invisible until you attack, cast a spell, or are in bright light.' },
        { name: 'Opportunist', level: 17, description: 'When a creature within 5 ft of you is hit by an attack from another creature, you can use your reaction to make a melee attack against it.' },
      ],
    },
    'Way of the Four Elements': {
      name: 'Way of the Four Elements',
      features: [
        { name: 'Disciple of the Elements', level: 3, description: 'Learn elemental disciplines that let you spend ki to cast spells or create elemental effects. You start with Elemental Attunement (minor elemental effects) and one other discipline.' },
        { name: 'Additional Discipline', level: 6, description: 'Learn one additional elemental discipline. Some disciplines require minimum monk levels.' },
        { name: 'Additional Discipline', level: 11, description: 'Learn one additional elemental discipline.' },
        { name: 'Additional Discipline', level: 17, description: 'Learn one additional elemental discipline.' },
      ],
    },
    'Way of the Kensei': {
      name: 'Way of the Kensei',
      features: [
        { name: 'Path of the Kensei', level: 3, description: 'Choose 2 kensei weapons (one melee, one ranged). They become monk weapons. Agile Parry: +2 AC if you make unarmed attack and are holding kensei weapon. Kensei\'s Shot: bonus action for +1d4 ranged kensei damage. Way of the Brush: proficiency in calligrapher\'s or painter\'s supplies.' },
        { name: 'One with the Blade', level: 6, description: 'Kensei weapons count as magical. Deft Strike: spend 1 ki to deal extra martial arts die damage when you hit with a kensei weapon.' },
        { name: 'Sharpen the Blade', level: 11, description: 'As a bonus action, spend 1-3 ki to grant a kensei weapon a bonus to attack and damage equal to ki spent for 1 minute. Doesn\'t work on magical weapons with existing bonus.' },
        { name: 'Unerring Accuracy', level: 17, description: 'Once on each of your turns, if you miss with a monk weapon attack, you can reroll the attack roll.' },
      ],
    },
    'Way of the Sun Soul': {
      name: 'Way of the Sun Soul',
      features: [
        { name: 'Radiant Sun Bolt', level: 3, description: 'Gain a ranged spell attack (30 ft range) that deals radiant damage equal to your martial arts die + DEX mod. Can make these in place of unarmed strikes and with Flurry of Blows (1 ki for two extra bolts).' },
        { name: 'Searing Arc Strike', level: 6, description: 'After taking the Attack action, spend 2+ ki to cast Burning Hands as a bonus action (increased slot level for more ki).' },
        { name: 'Searing Sunburst', level: 11, description: 'As an action, create a 20-ft radius sphere of radiant light at a point within 150 ft. Each creature makes a CON save or takes 2d6 radiant damage. Spend ki (up to 3) for +2d6 each.' },
        { name: 'Sun Shield', level: 17, description: 'You emit bright light in a 30-ft radius and dim light for another 30 ft (toggle as bonus action). While the light shines, when a creature hits you with a melee attack, deal radiant damage equal to 5 + WIS mod.' },
      ],
    },
    'Way of Mercy': {
      name: 'Way of Mercy',
      features: [
        { name: 'Implements of Mercy', level: 3, description: 'Gain proficiency with Insight, Medicine, and the herbalism kit. You also gain a special monk mask.' },
        { name: 'Hands of Healing', level: 3, description: 'When you use Flurry of Blows, you can replace one unarmed strike with a touch that restores HP equal to martial arts die + WIS mod. You can also end a disease or condition (blinded, deafened, paralyzed, poisoned, stunned) by spending 1 ki.' },
        { name: 'Hands of Harm', level: 3, description: 'When you hit with an unarmed strike, spend 1 ki to deal extra necrotic damage equal to martial arts die + WIS mod. Once per turn.' },
        { name: 'Physician\'s Touch', level: 6, description: 'Hands of Healing can also end one of: blinded, deafened, paralyzed, poisoned, or stunned (no additional ki cost). Hands of Harm can also poison the target (CON save) until end of your next turn.' },
        { name: 'Flurry of Healing and Harm', level: 11, description: 'When you use Flurry of Blows, you can replace each unarmed strike with Hands of Healing (no ki cost) or Hands of Harm (still costs 1 ki each use).' },
        { name: 'Hand of Ultimate Mercy', level: 17, description: 'Touch a creature that died within the last 24 hours and spend 5 ki points to return it to life with 4d10 + WIS mod HP and cure all diseases/poisons. Once per long rest.' },
      ],
    },
    'Way of the Astral Self': {
      name: 'Way of the Astral Self',
      features: [
        { name: 'Arms of the Astral Self', level: 3, description: 'As a bonus action, spend 1 ki to summon spectral arms for 10 minutes. Use WIS for unarmed attacks, reach of 10 ft, deal extra damage, and gain +5 ft reach for unarmed strikes.' },
        { name: 'Visage of the Astral Self', level: 6, description: 'Spend 1 ki when summoning arms to also create a visage for 10 minutes: Astral Sight (see in darkness 120 ft), Wisdom of the Spirit (advantage on Insight/Intimidation), Word of the Spirit (speak so only one creature hears you, or amplify to 600 ft).' },
        { name: 'Body of the Astral Self', level: 11, description: 'When you have both arms and visage active, you can spend 1 ki to create the body. Deflect Energy: reduce elemental damage by 1d10 + WIS mod as reaction. Empowered Arms: once per turn, deal extra martial arts die damage with astral arms.' },
        { name: 'Awakened Astral Self', level: 17, description: 'Spend 5 ki to summon arms, visage, and body all at once for 10 minutes. +2 AC, extra attack when using Arms (3 attacks total with Flurry of Blows).' },
      ],
    },
    'Way of the Draconic Disciple': {
      name: 'Way of the Draconic Disciple',
      features: [
        { name: 'Draconic Disciple', level: 3, description: 'You learn to channel draconic power through your ki. You learn Thaumaturgy cantrip. Choose a dragon type for your discipline.' },
        { name: 'Breath of the Dragon', level: 3, description: 'Spend 2 ki to exhale a breath weapon (15-ft cone or 30-ft line). Damage type based on your dragon type. Damage: 2 martial arts dice (DEX save for half).' },
        { name: 'Wings Unfurled', level: 6, description: 'When you use Step of the Wind, gain flying speed equal to walking speed until end of turn.' },
        { name: 'Aspect of the Wyrm', level: 11, description: 'As a bonus action, create a 10-ft aura for 1 minute: either frightful presence (WIS save) or resistance to your breath damage type for you and allies. Once per long rest (or 3 ki).' },
        { name: 'Ascendant Dragon', level: 17, description: 'Augmented Breath: increase breath to 60-ft cone or 90-ft line for 3 extra ki. Blindsight 10 ft. Explosive Fury: once per turn when you deal damage, spend 1 ki to deal extra damage in 10-ft radius to all creatures.' },
      ],
    },
  },
};

// ============================================================================
// PALADIN
// ============================================================================
const PALADIN: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
    savingThrows: ['WIS', 'CHA'],
    skillChoices: { count: 2, from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  prerequisites: { STR: 13, CHA: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 7, 15, 20],
  features: [
    { name: 'Divine Sense', level: 1, description: 'As an action, detect celestials, fiends, and undead within 60 ft, and consecrated/desecrated areas. Uses: 1 + CHA mod per long rest.' },
    { name: 'Lay on Hands', level: 1, description: 'A pool of healing power equal to 5 × paladin level HP. Touch a creature to restore HP from this pool. Or expend 5 HP from the pool to cure one disease or neutralize one poison.' },
    { name: 'Fighting Style', level: 2, description: 'Choose a fighting style: Defense (+1 AC), Dueling (+2 melee damage), Great Weapon Fighting (reroll 1s/2s), or Protection (impose disadvantage on attacks against allies).' },
    { name: 'Spellcasting', level: 2, description: 'You can cast paladin spells using CHA as your spellcasting ability. You prepare spells from the paladin spell list. Half-caster progression.' },
    { name: 'Divine Smite', level: 2, description: 'When you hit with a melee weapon attack, expend a spell slot to deal extra 2d8 radiant damage (+1d8 per slot level above 1st, max 5d8). +1d8 against undead or fiends.' },
    { name: 'Divine Health', level: 3, description: 'You are immune to disease.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Extra Attack', level: 5, description: 'Attack twice when you take the Attack action on your turn.' },
    { name: 'Aura of Protection', level: 6, description: 'You and friendly creatures within 10 ft gain a bonus to saving throws equal to your CHA modifier (minimum +1). Range increases to 30 ft at 18th level.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Aura of Courage', level: 10, description: 'You and friendly creatures within 10 ft can\'t be frightened while you are conscious. Range increases to 30 ft at 18th level.' },
    { name: 'Improved Divine Smite', level: 11, description: 'All your melee weapon attacks deal an extra 1d8 radiant damage.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Cleansing Touch', level: 14, description: 'As an action, end one spell on yourself or a willing creature you touch. Uses: CHA mod per long rest.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
  ],
  subclasses: {
    'Oath of Devotion': { name: 'Oath of Devotion', features: [
      { name: 'Oath Spells', level: 3, description: 'You gain oath spells: Protection from Evil and Good, Sanctuary (3rd), Lesser Restoration, Zone of Truth (5th), Beacon of Hope, Dispel Magic (9th), Freedom of Movement, Guardian of Faith (13th), Commune, Flame Strike (17th).' },
      { name: 'Channel Divinity: Sacred Weapon / Turn the Unholy', level: 3, description: 'Sacred Weapon: add CHA mod to attack rolls for 1 minute (weapon emits light). Turn the Unholy: each fiend and undead within 30 ft must make a WIS save or be turned for 1 minute.' },
      { name: 'Aura of Devotion', level: 7, description: 'You and friendly creatures within 10 ft can\'t be charmed while you\'re conscious. 30 ft at 18th level.' },
      { name: 'Purity of Spirit', level: 15, description: 'You are always under the effects of Protection from Evil and Good.' },
      { name: 'Holy Nimbus', level: 20, description: 'As an action, emanate an aura of sunlight for 1 minute: 30 ft bright light, enemies starting turn in it take 10 radiant damage. Advantage on saves against fiend/undead spells.' },
    ]},
    'Oath of Vengeance': { name: 'Oath of Vengeance', features: [
      { name: 'Oath Spells', level: 3, description: 'Bane, Hunter\'s Mark (3rd), Hold Person, Misty Step (5th), Haste, Protection from Energy (9th), Banishment, Dimension Door (13th), Hold Monster, Scrying (17th).' },
      { name: 'Channel Divinity: Abjure Enemy / Vow of Enmity', level: 3, description: 'Abjure Enemy: frighten a creature within 60 ft (WIS save). Vow of Enmity: gain advantage on attack rolls against a creature within 10 ft for 1 minute.' },
      { name: 'Relentless Avenger', level: 7, description: 'When you hit with an opportunity attack, you can move up to half your speed immediately after as part of the reaction without provoking opportunity attacks.' },
      { name: 'Soul of Vengeance', level: 15, description: 'When a creature under your Vow of Enmity makes an attack, you can use reaction to make a melee weapon attack against it.' },
      { name: 'Avenging Angel', level: 20, description: 'Transform for 1 hour: gain 60 ft flying speed, enemies within 30 ft must make WIS save or be frightened for 1 minute.' },
    ]},
    'Oath of the Ancients': { name: 'Oath of the Ancients', features: [
      { name: 'Oath Spells', level: 3, description: 'Ensnaring Strike, Speak with Animals (3rd), Moonbeam, Misty Step (5th), Plant Growth, Protection from Energy (9th), Ice Storm, Stoneskin (13th), Commune with Nature, Tree Stride (17th).' },
      { name: 'Channel Divinity: Nature\'s Wrath / Turn the Faithless', level: 3, description: 'Nature\'s Wrath: restrain a creature within 10 ft with spectral vines (STR/DEX save). Turn the Faithless: turn fey and fiends within 30 ft.' },
      { name: 'Aura of Warding', level: 7, description: 'You and friendly creatures within 10 ft have resistance to damage from spells. 30 ft at 18th level.' },
      { name: 'Undying Sentinel', level: 15, description: 'When reduced to 0 HP, you can choose to drop to 1 HP instead. Once per long rest. Also, you don\'t suffer the drawbacks of old age.' },
      { name: 'Elder Champion', level: 20, description: 'Transform for 1 minute: regain 10 HP at start of turn, cast paladin spells as bonus action, enemies within 10 ft have disadvantage on saves against your spells/Channel Divinity.' },
    ]},
    'Oath of Conquest': { name: 'Oath of Conquest', features: [
      { name: 'Oath Spells', level: 3, description: 'Armor of Agathys, Command (3rd), Hold Person, Spiritual Weapon (5th), Bestow Curse, Fear (9th), Dominate Beast, Stoneskin (13th), Cloudkill, Dominate Person (17th).' },
      { name: 'Channel Divinity: Conquering Presence / Guided Strike', level: 3, description: 'Conquering Presence: each creature of your choice within 30 ft must make WIS save or be frightened for 1 minute. Guided Strike: +10 to an attack roll.' },
      { name: 'Aura of Conquest', level: 7, description: 'Creatures frightened by you within 10 ft have speed reduced to 0 and take psychic damage equal to half your paladin level at the start of their turn. 30 ft at 18th level.' },
      { name: 'Scornful Rebuke', level: 15, description: 'Whenever a creature hits you with an attack, it takes psychic damage equal to your CHA modifier.' },
      { name: 'Invincible Conqueror', level: 20, description: 'Transform for 1 minute: resistance to all damage, Extra Attack (one additional attack), critical hits on 19-20.' },
    ]},
    'Oath of Redemption': { name: 'Oath of Redemption', features: [
      { name: 'Oath Spells', level: 3, description: 'Sanctuary, Sleep (3rd), Calm Emotions, Hold Person (5th), Counterspell, Hypnotic Pattern (9th), Otiluke\'s Resilient Sphere, Stoneskin (13th), Hold Monster, Wall of Force (17th).' },
      { name: 'Channel Divinity: Emissary of Peace / Rebuke the Violent', level: 3, description: 'Emissary of Peace: +5 to Persuasion checks for 10 minutes. Rebuke the Violent: when a creature within 30 ft deals damage, it takes equal radiant damage (WIS save for half).' },
      { name: 'Aura of the Guardian', level: 7, description: 'When a creature within 10 ft takes damage, you can use reaction to take the damage instead (no reduction/resistance). 30 ft at 18th level.' },
      { name: 'Protective Spirit', level: 15, description: 'At the end of your turn, if you have less than half your max HP and aren\'t incapacitated, regain HP equal to 1d6 + half paladin level.' },
      { name: 'Emissary of Redemption', level: 20, description: 'Resistance to all damage dealt by other creatures. When a creature hits you, it takes radiant damage equal to half the damage it dealt to you. Both benefits cease against a creature you attack or target with a spell.' },
    ]},
    'Oath of Glory': { name: 'Oath of Glory', features: [
      { name: 'Oath Spells', level: 3, description: 'Guiding Bolt, Heroism (3rd), Enhance Ability, Magic Weapon (5th), Haste, Protection from Energy (9th), Compulsion, Freedom of Movement (13th), Commune, Flame Strike (17th).' },
      { name: 'Channel Divinity: Peerless Athlete / Inspiring Smite', level: 3, description: 'Peerless Athlete: bonus action, 10 minutes of advantage on Athletics/Acrobatics, carry/push/lift/drag double. Inspiring Smite: after dealing Divine Smite damage, distribute 2d8 + paladin level temp HP among creatures within 30 ft.' },
      { name: 'Aura of Alacrity', level: 7, description: 'Your walking speed increases by 10 ft. Allies within 5 ft also gain +10 speed. 10 ft at 18th level.' },
      { name: 'Glorious Defense', level: 15, description: 'When a creature you can see hits you or an ally within 10 ft, use reaction to add CHA mod to AC. If the attack misses, you can make one weapon attack against the attacker. Uses: CHA mod per long rest.' },
      { name: 'Living Legend', level: 20, description: 'Transform for 1 minute: advantage on CHA checks, one missed attack can hit instead (once/turn), reroll a failed save (once).' },
    ]},
    'Oath of the Watchers': { name: 'Oath of the Watchers', features: [
      { name: 'Oath Spells', level: 3, description: 'Alarm, Detect Magic (3rd), Moonbeam, See Invisibility (5th), Counterspell, Nondetection (9th), Aura of Purity, Banishment (13th), Hold Monster, Scrying (17th).' },
      { name: 'Channel Divinity: Watcher\'s Will / Abjure the Extraplanar', level: 3, description: 'Watcher\'s Will: choose a number of creatures within 30 ft equal to CHA mod, they have advantage on INT/WIS/CHA saves for 1 minute. Abjure the Extraplanar: turn aberrations, celestials, elementals, fey, and fiends within 30 ft.' },
      { name: 'Aura of the Sentinel', level: 7, description: 'You and allies within 10 ft add your proficiency bonus to initiative rolls. 30 ft at 18th level.' },
      { name: 'Vigilant Rebuke', level: 15, description: 'When you or an ally within 30 ft succeeds on an INT, WIS, or CHA save, use reaction to deal 2d8 + CHA mod force damage to the creature that forced the save.' },
      { name: 'Mortal Bulwark', level: 20, description: 'Transform for 1 minute: truesight 120 ft, advantage on attacks against aberrations/celestials/elementals/fey/fiends, when you hit one, force a CHA save or banish it.' },
    ]},
    'Oathbreaker': { name: 'Oathbreaker', features: [
      { name: 'Oathbreaker Spells', level: 3, description: 'Hellish Rebuke, Inflict Wounds (3rd), Crown of Madness, Darkness (5th), Animate Dead, Bestow Curse (9th), Blight, Confusion (13th), Contagion, Dominate Person (17th).' },
      { name: 'Channel Divinity: Control Undead / Dreadful Aspect', level: 3, description: 'Control Undead: target undead within 30 ft makes WIS save or obeys your commands for 24 hours (CR ≤ your level). Dreadful Aspect: each creature within 30 ft makes WIS save or is frightened for 1 minute.' },
      { name: 'Aura of Hate', level: 7, description: 'You and fiends/undead within 10 ft gain a bonus to melee weapon damage equal to your CHA modifier. 30 ft at 18th level.' },
      { name: 'Supernatural Resistance', level: 15, description: 'Resistance to bludgeoning, piercing, and slashing damage from nonmagical weapons.' },
      { name: 'Dread Lord', level: 20, description: 'Surround yourself in an aura of gloom for 1 minute: dim light 30 ft, enemies frightened in aura take 4d10 psychic damage, bonus action for melee spell attack dealing 3d10 + CHA necrotic and reducing HP max.' },
    ]},
  },
};

// ============================================================================
// RANGER
// ============================================================================
const RANGER: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
    savingThrows: ['STR', 'DEX'],
    skillChoices: { count: 3, from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  prerequisites: { DEX: 13, WIS: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 7, 11, 15],
  features: [
    { name: 'Favored Enemy', level: 1, description: 'Choose a type of favored enemy (or two races of humanoids). Advantage on WIS (Survival) checks to track them and INT checks to recall information. You learn one language of your choice spoken by your favored enemies.' },
    { name: 'Natural Explorer', level: 1, description: 'Choose a favored terrain. While traveling in it: difficult terrain doesn\'t slow your group, can\'t become lost except by magic, always alert to danger, move stealthily at normal pace solo, find twice as much food, learn exact number/size of tracked creatures.' },
    { name: 'Fighting Style', level: 2, description: 'Choose Archery (+2 to ranged attacks), Defense (+1 AC), Dueling (+2 damage one-handed), or Two-Weapon Fighting (add ability mod to offhand damage).' },
    { name: 'Spellcasting', level: 2, description: 'You can cast ranger spells using WIS as your spellcasting ability. Half-caster progression.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Extra Attack', level: 5, description: 'Attack twice when you take the Attack action on your turn.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Land\'s Stride', level: 8, description: 'Moving through nonmagical difficult terrain costs no extra movement. You can pass through nonmagical plants without being slowed. Advantage on saves against magically created/manipulated plants.' },
    { name: 'Hide in Plain Sight', level: 10, description: 'Spend 1 minute creating camouflage. While remaining still, you gain +10 to Stealth checks. Once you move or take an action, you must camouflage again.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Vanish', level: 14, description: 'You can use the Hide action as a bonus action. You also can\'t be tracked by nonmagical means unless you choose to leave a trail.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Feral Senses', level: 18, description: 'You gain 30 ft of blindsight. You are aware of the location of invisible creatures within 30 ft.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Foe Slayer', level: 20, description: 'Once on each of your turns, add your WIS modifier to the attack roll or damage roll against one of your favored enemies.' },
  ],
  subclasses: {
    'Hunter': { name: 'Hunter', features: [
      { name: 'Hunter\'s Prey', level: 3, description: 'Choose: Colossus Slayer (+1d8 to injured target once/turn), Giant Killer (reaction attack when Large+ creature misses you), or Horde Breaker (one additional attack per turn against a different creature within 5 ft of original target).' },
      { name: 'Defensive Tactics', level: 7, description: 'Choose: Escape the Horde (opportunity attacks against you have disadvantage), Multiattack Defense (+4 AC after being hit by a creature\'s multiattack), or Steel Will (advantage on saves against being frightened).' },
      { name: 'Multiattack', level: 11, description: 'Choose: Volley (attack all creatures within 10 ft of a point in range, one attack each) or Whirlwind Attack (melee attack against all creatures within reach).' },
      { name: 'Superior Hunter\'s Defense', level: 15, description: 'Choose: Evasion (DEX saves for half → no damage on success), Stand Against the Tide (redirect a missed attack to another creature), or Uncanny Dodge (halve damage from an attack you can see as reaction).' },
    ]},
    'Beast Master': { name: 'Beast Master', features: [
      { name: 'Ranger\'s Companion', level: 3, description: 'Gain a beast companion of CR 1/4 or lower. It obeys your commands, acts on your initiative, and uses your proficiency bonus for various calculations.' },
      { name: 'Exceptional Training', level: 7, description: 'On your turn when your companion doesn\'t attack, you can command it to take the Dash, Disengage, Dodge, or Help action. Its attacks count as magical.' },
      { name: 'Bestial Fury', level: 11, description: 'Your companion can make two attacks when you command it to use the Attack action.' },
      { name: 'Share Spells', level: 15, description: 'When you cast a spell targeting yourself, you can also affect your beast companion if it is within 30 ft.' },
    ]},
    'Gloom Stalker': { name: 'Gloom Stalker', features: [
      { name: 'Dread Ambusher', level: 3, description: '+WIS mod to initiative. On the first turn of combat, walking speed increases by 10 ft and you gain one extra attack (deals extra 1d8 damage on hit).' },
      { name: 'Umbral Sight', level: 3, description: 'Gain 60 ft darkvision (or +30 ft if you already have it). While in darkness, you are invisible to any creature relying on darkvision to see you.' },
      { name: 'Iron Mind', level: 7, description: 'Proficiency in WIS saving throws. If already proficient, choose INT or CHA instead.' },
      { name: 'Stalker\'s Flurry', level: 11, description: 'Once per turn, when you miss with a weapon attack, you can make another weapon attack as part of the same action.' },
      { name: 'Shadowy Dodge', level: 15, description: 'When a creature attacks you without advantage, use reaction to impose disadvantage on the attack roll.' },
    ]},
    'Horizon Walker': { name: 'Horizon Walker', features: [
      { name: 'Detect Portal', level: 3, description: 'As an action, detect the distance and direction to the closest planar portal within 1 mile.' },
      { name: 'Planar Warrior', level: 3, description: 'As a bonus action, choose one creature within 30 ft. The next time you hit it with a weapon attack, all damage becomes force damage and deals extra 1d8 force damage (2d8 at 11th level).' },
      { name: 'Ethereal Step', level: 7, description: 'As a bonus action, step into the Ethereal Plane until the end of the current turn. Once per short/long rest.' },
      { name: 'Distant Strike', level: 11, description: 'When you take the Attack action, you can teleport 10 ft before each attack. If you attack two different creatures, make one additional attack against a third creature.' },
      { name: 'Spectral Defense', level: 15, description: 'When you take damage, use reaction to grant yourself resistance to that damage.' },
    ]},
    'Monster Slayer': { name: 'Monster Slayer', features: [
      { name: 'Hunter\'s Sense', level: 3, description: 'As an action, learn if a creature within 60 ft has any damage immunities, resistances, or vulnerabilities and what they are.' },
      { name: 'Slayer\'s Prey', level: 3, description: 'As a bonus action, designate a creature within 60 ft as your prey. First hit each turn deals extra 1d6 damage. Concentration, lasts until you finish a short/long rest or designate a different creature.' },
      { name: 'Supernatural Defense', level: 7, description: 'When your Slayer\'s Prey forces you to make a saving throw or grapple check, add 1d6 to your roll.' },
      { name: 'Magic-User\'s Nemesis', level: 11, description: 'When your Slayer\'s Prey casts a spell or teleports, use reaction to force a WIS save or the spell/teleport fails and is wasted.' },
      { name: 'Slayer\'s Counter', level: 15, description: 'If your Slayer\'s Prey forces you to make a saving throw, use reaction to make one weapon attack against it. If the attack hits, you auto-succeed on the save.' },
    ]},
    'Fey Wanderer': { name: 'Fey Wanderer', features: [
      { name: 'Dreadful Strikes', level: 3, description: 'Your weapons deal extra 1d4 psychic damage on hit (once per turn per creature). Increases to 1d6 at 11th level.' },
      { name: 'Otherworldly Glamour', level: 3, description: 'Add WIS modifier to CHA checks. Gain proficiency in Deception, Performance, or Persuasion.' },
      { name: 'Fey Reinforcements', level: 3, description: 'You learn Charm Person and always have it prepared. Also learn Summon Fey at 5th level.' },
      { name: 'Beguiling Twist', level: 7, description: 'When a creature within 120 ft succeeds on a save against being charmed or frightened, use reaction to force a different creature within 120 ft to make a WIS save or be charmed/frightened by you.' },
      { name: 'Fey Reinforcements', level: 11, description: 'You can cast Summon Fey without a spell slot once per long rest. When you do, the summoned fey is immune to charmed/frightened.' },
      { name: 'Misty Wanderer', level: 15, description: 'Cast Misty Step without expending a spell slot a number of times equal to WIS mod. When you cast Misty Step, you can bring one willing creature within 5 ft.' },
    ]},
    'Swarmkeeper': { name: 'Swarmkeeper', features: [
      { name: 'Gathered Swarm', level: 3, description: 'A swarm of nature spirits aids you. Once per turn when you hit, choose: +1d6 piercing damage, push target 15 ft horizontally (STR save), or move yourself 5 ft (no opportunity attack). Die increases to 1d8 at 11th level.' },
      { name: 'Swarmkeeper Magic', level: 3, description: 'Learn Faerie Fire and Mage Hand (appears as a swarm). Additional spells at higher levels: Web (5th), Gaseous Form (9th), Arcane Eye (13th), Insect Plague (17th).' },
      { name: 'Writhing Tide', level: 7, description: 'As a bonus action, gain a flying speed of 10 ft for 1 minute (hover). Uses: proficiency bonus per long rest.' },
      { name: 'Mighty Swarm', level: 11, description: 'Gathered Swarm damage increases to 1d8. Push becomes 15 ft or knock prone. Self-movement: gain half cover until start of next turn.' },
      { name: 'Swarming Dispersal', level: 15, description: 'When you take damage, use reaction to become a swarm and teleport up to 30 ft. Gain resistance to the triggering damage. Uses: proficiency bonus per long rest.' },
    ]},
    'Drakewarden': { name: 'Drakewarden', features: [
      { name: 'Draconic Gift', level: 3, description: 'Learn Thaumaturgy cantrip and speak/understand Draconic.' },
      { name: 'Drake Companion', level: 3, description: 'Summon a drake companion (Small dragon). It shares your initiative, has HP based on your ranger level, and can assist in combat with its bite attack.' },
      { name: 'Bond of Fang and Scale', level: 7, description: 'Drake grows to Medium. You can ride it if Small or smaller. Drake\'s bite deals extra damage, and you gain resistance to the drake\'s damage type.' },
      { name: 'Drake\'s Breath', level: 11, description: 'As an action, the drake exhales a 30-ft cone of damage (dragon type, 8d6, DEX save for half). Uses: once per long rest (or expend 3rd+ level spell slot).' },
      { name: 'Perfected Bond', level: 15, description: 'Drake grows to Large (can ride it if Medium or smaller). Drake gains flying speed of 40 ft. Empowered Bite: +1d6 damage per bite. Large Drake Reflexes: it gains its own reaction for opportunity attacks.' },
    ]},
  },
};

// ============================================================================
// ROGUE
// ============================================================================
const ROGUE: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ["Thieves' Tools"],
    savingThrows: ['DEX', 'INT'],
    skillChoices: { count: 4, from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor'],
    weapons: [],
    tools: ["Thieves' Tools"],
  },
  prerequisites: { DEX: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 9, 13, 17],
  features: [
    { name: 'Expertise', level: 1, description: 'Choose two skill proficiencies or one skill and thieves\' tools. Your proficiency bonus is doubled for those. Choose two more at 6th level.' },
    { name: 'Sneak Attack', level: 1, description: 'Once per turn, deal extra damage when you hit with a finesse/ranged weapon and have advantage, or an ally is within 5 ft of the target. Damage: 1d6 at 1st, increases by 1d6 every 2 rogue levels (max 10d6 at 19th).' },
    { name: "Thieves' Cant", level: 1, description: 'You know thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.' },
    { name: 'Cunning Action', level: 2, description: 'Use a bonus action to Dash, Disengage, or Hide on each of your turns in combat.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Uncanny Dodge', level: 5, description: 'When an attacker you can see hits you with an attack, use reaction to halve the attack\'s damage against you.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Evasion', level: 7, description: 'When subjected to an effect that allows a DEX save for half damage, take no damage on success and half on failure.' },
    { name: 'Ability Score Improvement', level: 10, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Reliable Talent', level: 11, description: 'When you make an ability check that uses a skill you are proficient in, treat any d20 roll of 9 or lower as a 10.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Blindsense', level: 14, description: 'If you can hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.' },
    { name: 'Slippery Mind', level: 15, description: 'You gain proficiency in WIS saving throws.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Elusive', level: 18, description: 'No attack roll has advantage against you while you aren\'t incapacitated.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Stroke of Luck', level: 20, description: 'If your attack misses, you can turn it into a hit. Or if you fail an ability check, treat the d20 roll as a 20. Once per short/long rest.' },
  ],
  subclasses: {
    'Bloodknife': { name: 'Bloodknife', features: [
      { name: 'Dread Strike', level: 3, description: 'When you hit a creature with a weapon attack, expend one Hit Die: no advantage required for Sneak Attack, Sneak Attack damage becomes necrotic. If attack drops target to 0 HP, regain expended Hit Die & gain temp HP = Rogue level.' },
      { name: 'Forked Tongue', level: 3, description: 'Learn Abyssal or Infernal. Abyssal: gain Intimidation prof & treat d20 rolls of 7 or lower as 8 when speaking Abyssal. Infernal: gain Persuasion prof & treat d20 rolls of 7 or lower as 8 when negotiating bargains/contracts.' },
      { name: 'Sinister Vitality', level: 9, description: 'Starting at 9th level, when you score a critical hit, use reaction to regain an expended Hit Die. Uses equal to CHA modifier (min 1) per long rest.' },
      { name: 'Hellish Curse', level: 13, description: 'When you hit a creature with Dread Strike, mutter a curse in Forked Tongue to blind, deafen, or mute target until beginning of your next turn.' },
      { name: 'Touch of Death', level: 17, description: 'Use Dread Strike at will without expending Hit Dice. When using Dread Strike, expend a Hit Die to force CON save (DC 8 + PB + CHA) or target suffers 1 level of exhaustion.' },
    ]},
    'Daredevil': { name: 'Daredevil', features: [
      { name: 'Aerialist', level: 3, description: 'Climbing speed equals movement speed. Use DEX modifier in place of STR to calculate running or standing high and long jump distances.' },
      { name: 'Death from Above', level: 3, description: 'Move at least 10 ft through air & land within 5 ft of creature: force STR save (DC 8 + PB + DEX). On failure, creature falls prone & takes 2d6 bludgeoning damage. Applies Sneak Attack damage even without meeting normal requirements.' },
      { name: 'Slow Fall', level: 9, description: 'Reduce fall damage taken by 5 × Rogue level. If landing on a soft surface, take 0 fall damage.' },
      { name: 'Defy Death', level: 13, description: 'Add proficiency bonus to death saving throws. Death save roll total of 20 or higher counts as a natural 20.' },
      { name: 'Airborne Strikes', level: 17, description: 'Advantage on attack rolls while airborne and at least 5 ft off the ground. Advantage on DEX checks while airborne.' },
    ]},
    'Fencer': { name: 'Fencer', features: [
      { name: 'Classical Training', level: 3, description: 'Proficiency with Medium Armor. Apply Sneak Attack when using an Exploit as part of an attack roll.' },
      { name: 'Fencer\'s Exploits (d6)', level: 3, description: 'Gain 3 d6 Exploit Dice (regain on short/long rest). Learn 2 Exploits: Crippling Strike, Disarm, Feint, Fluid Grace, Martial Focus, Riposte. Exploit Save DC = 8 + PB + STR or DEX mod.' },
      { name: 'Sharp Reflexes', level: 9, description: 'Add proficiency bonus to initiative rolls. Exploit Dice grow to 4 d8s (1 at 9th level).' },
      { name: 'Counterattack', level: 13, description: 'When a creature hits you with a melee attack, use reaction to gain an extra Exploit Die and make a weapon attack against the attacker.' },
      { name: 'Fencer\'s Exploits (d10)', level: 17, description: 'Gain a 5th Exploit Die, and all Exploit Dice become d10s.' },
    ]},
    'Gambler': { name: 'Gambler', features: [
      { name: 'Pick a Card', level: 3, description: 'Decks of cards count as thrown finesse weapons (30/60 ft, 1d4 + DEX slashing). Once per turn on hit, d4/suit roll grants bonus effect: 1=speed -5×PB ft, 2=Sneak Attack guaranteed, 3=temp HP equal to damage, 4=swap initiative order with target at top of next round.' },
      { name: 'Gambler\'s Know-how', level: 3, description: 'Proficiency with improvised weapons, playing cards, and 1 gaming set. Double PB on checks with proficient gaming sets. Observe game 1 min to gain PB to checks.' },
      { name: 'Lucky Streak', level: 9, description: 'Critical hit on d20 roll of 7 or 20. Critical failure on d20 roll of 13 or 1.' },
      { name: 'Quickdraw', level: 13, description: 'Advantage on initiative rolls. First Pick a Card attack after rolling initiative gains a bonus effect of your choice.' },
      { name: 'Jackpot', level: 17, description: 'Whenever you roll a 6 on a d6 Sneak Attack die, roll an additional d6 and add it to damage roll.' },
    ]},
    'Justicar': { name: 'Justicar', features: [
      { name: 'Spellcasting', level: 3, description: 'Cast divine spells using Charisma (third-caster, cleric/paladin spell list). Learn 2 cantrips & 3 1st-level spells.' },
      { name: 'Channel Divinity: Shroud of Faith', level: 3, description: 'As an action, turn invisible (with carried items) for 1 minute or until attacking/casting a spell. 1 use / short or long rest (2 at 13th).' },
      { name: 'Divine Sense', level: 3, description: 'Bonus action to detect celestials, fiends, undead within 60 ft and consecrated/desecrated areas. 1/rest (or 1st+ spell slot).' },
      { name: 'Consecrated Strikes', level: 9, description: 'On Sneak Attack hit, expend spell slot (1st+) to turn Sneak Attack damage into radiant and reroll 1s and 2s on damage dice.' },
      { name: 'Divine Judgment', level: 13, description: 'Bonus action mark creature within 30 ft for 1 min. Critical hit on 19-20 against marked foe. 1/rest (or 3rd+ spell slot).' },
      { name: 'Anointed Inquisitor', level: 17, description: 'Add Charisma modifier (minimum +1) to all saving throws you make.' },
    ]},
    'Ruffian': { name: 'Ruffian', features: [
      { name: 'Enforcer', level: 3, description: 'Intimidation prof with STR. Unarmed strikes deal 1d4 + STR. Sneak Attack works with any non-heavy/non-two-handed weapon (including unarmed). Cunning Action bonus action grapple. AC = 10 + DEX or CON mod in light/medium armor.' },
      { name: 'Shake Down', level: 3, description: 'Treat d20 rolls of 7 or lower as 8 on Strength (Athletics) or Strength (Intimidation) checks.' },
      { name: 'Imposing Glance', level: 9, description: 'Bonus action STR Intimidation vs target WIS Insight within 30 ft: target is frightened until start of next turn & gain advantage on next attack. STR mod uses / rest.' },
      { name: 'Nerves of Steel', level: 9, description: 'Immunity to the frightened condition.' },
      { name: 'Dodge and Counter', level: 13, description: 'Reaction when missed by melee attack: force target DEX save (DC 8 + PB + STR) or target falls prone & 0 speed, or is grappled.' },
      { name: 'Ruthless Strike', level: 17, description: 'Hit frightened creature with Sneak Attack = automatic critical hit. STR mod uses / long rest.' },
    ]},
    'Saboteur': { name: 'Saboteur', features: [
      { name: 'Destructive Strikes', level: 3, description: 'Automatic critical hit against non-magical structures. Score a critical hit on 19 or 20 against constructs.' },
      { name: 'Explosives', level: 3, description: 'Proficiency with Alchemist\'s tools. Produce Black Powder Charges = PB + INT mod per long rest. Learn Hand Bomb (1 charge, 2d6 fire + Sneak Attack, DEX save DC 8 + PB + INT) and Arcane Explosives (Earth Tremor, Fog Cloud, Grease, Fireball, Web, etc.).' },
      { name: 'Advanced Alchemy', level: 9, description: 'Alter appearance, color, and damage type of explosives (bludgeoning, piercing, fire, thunder, or lightning).' },
      { name: 'Sabotage', level: 13, description: 'Surprised creatures have disadvantage on saving throws against your Explosives.' },
      { name: 'Hair Trigger', level: 17, description: 'Create rudimentary arcane remote to detonate explosives from afar up to 100 feet as an action.' },
    ]},
    'Skinchanger': { name: 'Skinchanger', features: [
      { name: 'Druidic Secrets', level: 3, description: 'Speak, read, and write Druidic. Count as both druid and rogue for attuning magic items and spell scrolls.' },
      { name: 'Limited Wild Shape', level: 3, description: 'Bonus action assume form of beast touched. Rogue level limits form (3rd: CR 1/4 Panther no fly/swim). Lasts 1 hour. 1 use / short or long rest.' },
      { name: 'Instinctual Strike', level: 9, description: 'Wild Shape attacks count as magical. 2 Wild Shapes / short rest. Apply Sneak Attack to natural weapons without advantage.' },
      { name: 'Bestial Senses', level: 13, description: 'Advantage on Perception and Survival checks relying on hearing or smell.' },
      { name: 'Druidic Mastery', level: 17, description: 'Remain in Wild Shape transformation indefinitely.' },
    ]},
    'Surgeon': { name: 'Surgeon', features: [
      { name: 'Anatomical Studies', level: 3, description: 'Proficiency in Medicine and Nature. Treat Medicine d20 rolls of 7 or lower as 8. Cunning Action bonus action Use an Object for healer\'s kit or healing potion.' },
      { name: 'Surgical Strike', level: 3, description: 'Crit on 19-20 vs humanoids, beasts, giants, monstrosities, undead. On Sneak Attack hit, replace Sneak Attack damage with a condition: Cripple (-5×WIS speed), Daze (no reactions, -WIS to next save), Infect (CON save vs poison), or Maim (DEX save vs blind/deafen/mute).' },
      { name: 'Cultivated Immunity', level: 9, description: 'Reduce acid, necrotic, or poison damage taken by PB + WIS mod (min 1). Advantage on saves vs poison, disease, and toxins.' },
      { name: 'Improved Surgical Strike', level: 13, description: 'Crit on 18-20 vs all except constructs, oozes, plants. Inflict Surgical Strike condition AND keep Sneak Attack damage.' },
      { name: 'Expert Surgeon', level: 17, description: 'Use Rogue level in place of d20 roll on Medicine checks. Touch creature to inflict Contagion or Regenerate once / short or long rest.' },
    ]},
    'Alternate Assassin': { name: 'Alternate Assassin', features: [
      { name: 'Assassin\'s Strike', level: 3, description: 'Advantage on attack rolls against creatures that haven\'t acted in combat. Auto-crit vs surprised targets. Reroll 1s on critical hit damage dice.' },
      { name: 'Infiltrator', level: 3, description: 'Proficiency with disguise kit and poisoner\'s kit. Treat Deception d20 rolls of 7 or lower as 8 while wearing disguise.' },
      { name: 'Stolen Identity', level: 9, description: '1 hr craft perfect disguise of slain humanoid. 8 hr completely assume their life.' },
      { name: 'Impostor', level: 13, description: 'Advantage on Deception checks to thwart detection of disguise.' },
      { name: 'Poisoned Blade', level: 13, description: 'Bonus action soak blade with poison: next hit deals Sneak Attack as necrotic damage even without meeting requirements. 1/short or long rest.' },
      { name: 'Death Strike', level: 17, description: 'When hitting with Sneak Attack, turn attack into an automatic critical hit. 1/short or long rest.' },
    ]},
    'Assassin': { name: 'Assassin', features: [
      { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with the disguise kit and the poisoner\'s kit.' },
      { name: 'Assassinate', level: 3, description: 'You have advantage on attack rolls against any creature that hasn\'t taken a turn in combat yet. Any hit you score against a surprised creature is a critical hit.' },
      { name: 'Infiltration Expertise', level: 9, description: 'You can create false identities. Spend 7 days and 25 GP to establish a history, profession, and affiliations for a false persona.' },
      { name: 'Impostor', level: 13, description: 'You can unerringly mimic another person\'s speech, writing, and behavior after spending 3 hours studying them.' },
      { name: 'Death Strike', level: 17, description: 'When you hit a surprised creature, it must make a CON save (DC 8 + DEX mod + proficiency bonus) or take double damage from the attack.' },
    ]},
    'Thief': { name: 'Thief', features: [
      { name: 'Fast Hands', level: 3, description: 'Use Cunning Action to make a Sleight of Hand check, use thieves\' tools to disarm a trap or open a lock, or use the Use an Object action.' },
      { name: 'Second-Story Work', level: 3, description: 'Climbing no longer costs extra movement. Your running jump distance increases by a number of feet equal to your DEX modifier.' },
      { name: 'Supreme Sneak', level: 9, description: 'Advantage on Stealth checks if you move no more than half your speed on the same turn.' },
      { name: 'Use Magic Device', level: 13, description: 'Ignore all class, race, and level requirements on the use of magic items.' },
      { name: "Thief's Reflexes", level: 17, description: 'You can take two turns during the first round of combat: your normal turn and one at your initiative minus 10.' },
    ]},
    'Arcane Trickster': { name: 'Arcane Trickster', features: [
      { name: 'Spellcasting', level: 3, description: 'You gain spellcasting from the wizard spell list, focusing on Enchantment and Illusion. INT is your spellcasting ability. Third-caster progression. You also learn Mage Hand with enhanced invisibility.' },
      { name: 'Mage Hand Legerdemain', level: 3, description: 'Your Mage Hand is invisible. You can use it to stow/retrieve objects from containers, pick locks, or disarm traps at range.' },
      { name: 'Magical Ambush', level: 9, description: 'If you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw against the spell.' },
      { name: 'Versatile Trickster', level: 13, description: 'As a bonus action, your Mage Hand can distract a creature within 5 ft of it, giving you advantage on attack rolls against that creature until end of turn.' },
      { name: 'Spell Thief', level: 17, description: 'When a creature casts a spell targeting you or including you in its area, you can use reaction to force a save. If it fails, the spell has no effect on you and you learn it temporarily for 8 hours. It also loses one spell slot. Once per long rest.' },
    ]},
    'Swashbuckler': { name: 'Swashbuckler', features: [
      { name: 'Fancy Footwork', level: 3, description: 'After you make a melee attack against a creature, that creature can\'t make opportunity attacks against you for the rest of your turn.' },
      { name: 'Rakish Audacity', level: 3, description: 'Add CHA modifier to initiative rolls. You can use Sneak Attack against a creature if you are within 5 ft, no other creature is within 5 ft of you, and you don\'t have disadvantage.' },
      { name: 'Panache', level: 9, description: 'Make a Persuasion check vs target\'s Insight: hostile targets are goaded (disadvantage on attacks against others, can\'t make opportunity attacks against others, 1 minute); non-hostile targets are charmed for 1 minute.' },
      { name: 'Elegant Maneuver', level: 13, description: 'As a bonus action, gain advantage on the next Acrobatics or Athletics check you make during the same turn.' },
      { name: 'Master Duelist', level: 17, description: 'If you miss with an attack roll, you can roll again with advantage. Once per short/long rest.' },
    ]},
    'Inquisitive': { name: 'Inquisitive', features: [
      { name: 'Ear for Deceit', level: 3, description: 'When you make an Insight check to determine if a creature is lying, treat any roll of 7 or lower on the d20 as an 8.' },
      { name: 'Eye for Detail', level: 3, description: 'As a bonus action, make a Perception check to spot a hidden creature/object or an Investigation check to uncover/decipher clues.' },
      { name: 'Insightful Fighting', level: 3, description: 'As a bonus action, make an Insight check against a creature\'s Deception. On success, use Sneak Attack against that target without advantage for 1 minute.' },
      { name: 'Steady Eye', level: 9, description: 'Advantage on Perception and Investigation checks if you move no more than half your speed on the same turn.' },
      { name: 'Unerring Eye', level: 13, description: 'As an action, sense the presence of illusions, shapechangers, or magic designed to deceive within 30 ft. Uses: WIS mod per long rest.' },
      { name: 'Eye for Weakness', level: 17, description: 'When using Insightful Fighting, Sneak Attack deals an extra 3d6 damage.' },
    ]},
    'Mastermind': { name: 'Mastermind', features: [
      { name: 'Master of Intrigue', level: 3, description: 'Gain proficiency with disguise kit, forgery kit, and one gaming set. Learn two languages. You can mimic speech patterns and accent of a creature you\'ve heard speak for at least 1 minute.' },
      { name: 'Master of Tactics', level: 3, description: 'Use the Help action as a bonus action. The Help action can aid an ally attacking a creature within 30 ft (instead of 5 ft).' },
      { name: 'Insightful Manipulator', level: 9, description: 'Spend 1 minute observing a creature outside combat to learn if it is your equal, superior, or inferior in: INT, WIS, CHA, or class levels (2 of 4, DM\'s choice).' },
      { name: 'Misdirection', level: 13, description: 'When you are targeted by an attack and another creature is providing you with cover, you can use reaction to redirect the attack to the covering creature.' },
      { name: 'Soul of Deceit', level: 17, description: 'Your thoughts can\'t be read by telepathy or similar. You can present false thoughts (CHA vs investigator\'s check). Undetectable by magic that determines if you\'re lying.' },
    ]},
    'Phantom': { name: 'Phantom', features: [
      { name: 'Whispers of the Dead', level: 3, description: 'After a short/long rest, you gain a skill or tool proficiency of your choice that lasts until you use this feature again.' },
      { name: 'Wails from the Grave', level: 3, description: 'When you deal Sneak Attack damage, you can cause a second creature within 30 ft to take half of the Sneak Attack dice in necrotic damage. Uses: proficiency bonus per long rest.' },
      { name: 'Tokens of the Departed', level: 9, description: 'When a creature you can see dies within 30 ft, use reaction to create a soul trinket (max = proficiency bonus). While you have a trinket: advantage on death saves, CON saves. Destroy a trinket to ask the spirit one question.' },
      { name: 'Ghost Walk', level: 13, description: 'As a bonus action, gain a flying speed of 10 ft (hover) and move through creatures and objects for 10 minutes. You take 1d10 force damage if you end turn inside an object. Once per long rest (or destroy a soul trinket).' },
      { name: 'Death\'s Friend', level: 17, description: 'Wails from the Grave: the second creature takes full Sneak Attack dice necrotic instead of half. At the end of a long rest, a soul trinket appears in your hand if you don\'t have any.' },
    ]},
    'Soulknife': { name: 'Soulknife', features: [
      { name: 'Psionic Power', level: 3, description: 'Gain Psionic Energy dice (d6 count = 2 × proficiency bonus). Psi-Bolstered Knack: when you fail an ability check with a proficient skill, add a Psionic Energy die. Psychic Whispers: telepathy with chosen creatures for hours equal to die roll.' },
      { name: 'Psychic Blades', level: 3, description: 'Manifest psychic blades: melee or ranged (60 ft) attacks dealing 1d6 psychic damage (+ ability mod). Bonus action for a second blade dealing 1d4 psychic. Blades vanish after hit/miss.' },
      { name: 'Soul Blades', level: 9, description: 'Homing Strikes: when you miss with a psychic blade, expend a Psionic Energy die to add it to the attack roll. Psychic Teleportation: as a bonus action, throw a psychic blade to teleport to the unoccupied space where it lands (up to 10 × Psionic Energy die ft).' },
      { name: 'Psychic Veil', level: 13, description: 'As an action, become invisible for 1 hour or until you attack, deal damage, force a save, or end it. Once per long rest (or expend a Psionic Energy die).' },
      { name: 'Rend Mind', level: 17, description: 'When you deal Sneak Attack damage with your Psychic Blades, force the target to make a WIS save (DC 8 + DEX mod + proficiency bonus) or be stunned for 1 minute (save at end of each turn). Once per long rest (or expend 3 Psionic Energy dice).' },
    ]},
  },
};

// ============================================================================
// SORCERER
// ============================================================================
const SORCERER: ClassFeaturesData = {
  startingProficiencies: {
    armor: [],
    weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'],
    tools: [],
    savingThrows: ['CON', 'CHA'],
    skillChoices: { count: 2, from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  },
  multiclassProficiencies: { armor: [], weapons: [], tools: [] },
  prerequisites: { CHA: 13 },
  subclassLevel: 1,
  subclassFeatureLevels: [1, 6, 14, 18],
  features: [
    { name: 'Spellcasting', level: 1, description: 'You can cast sorcerer spells using CHA as your spellcasting ability. Full caster progression.' },
    { name: 'Font of Magic', level: 2, description: 'Gain sorcery points equal to sorcerer level. Convert sorcery points to spell slots and vice versa.' },
    { name: 'Metamagic', level: 3, description: 'Choose 2 Metamagic options: Careful, Distant, Empowered, Extended, Heightened, Quickened, Subtle, or Twinned Spell. Choose 1 more at 10th and 17th level.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Sorcerous Restoration', level: 20, description: 'On a short rest, regain 4 expended sorcery points.' },
  ],
  subclasses: {
    'Draconic Bloodline': { name: 'Draconic Bloodline', features: [
      { name: 'Dragon Ancestor', level: 1, description: 'Choose a dragon type. You learn Draconic and have double proficiency bonus on CHA checks with dragons. Your HP max increases by 1 per sorcerer level.' },
      { name: 'Draconic Resilience', level: 1, description: 'When unarmored, your AC = 13 + DEX modifier.' },
      { name: 'Elemental Affinity', level: 6, description: 'When you cast a spell that deals your dragon ancestor\'s damage type, add CHA mod to one damage roll. Spend 1 sorcery point for resistance to that damage type for 1 hour.' },
      { name: 'Dragon Wings', level: 14, description: 'As a bonus action, gain flying speed equal to your current speed. The wings last until you dismiss them.' },
      { name: 'Draconic Presence', level: 18, description: 'Spend 5 sorcery points to emanate a 60-ft aura of awe or fear for 1 minute (concentration). Each hostile creature that starts its turn in the aura must make a WIS save or be charmed/frightened.' },
    ]},
    'Wild Magic': { name: 'Wild Magic', features: [
      { name: 'Wild Magic Surge', level: 1, description: 'After casting a sorcerer spell of 1st level or higher, the DM may have you roll a d20. On a 1, roll on the Wild Magic Surge table for a random magical effect.' },
      { name: 'Tides of Chaos', level: 1, description: 'Gain advantage on one attack roll, ability check, or saving throw. Once per long rest, or the DM can restore it by having you roll on the Wild Magic Surge table after a sorcerer spell.' },
      { name: 'Bend Luck', level: 6, description: 'When another creature you can see makes an attack roll, ability check, or saving throw, spend 2 sorcery points as a reaction to roll 1d4 and add or subtract the result.' },
      { name: 'Controlled Chaos', level: 14, description: 'When you roll on the Wild Magic Surge table, roll twice and choose either result.' },
      { name: 'Spell Bombardment', level: 18, description: 'When you roll damage for a spell and roll the highest number on any die, you can reroll that die and add the result to the total. Once per turn.' },
    ]},
    'Shadow Magic': { name: 'Shadow Magic', features: [
      { name: 'Eyes of the Dark', level: 1, description: 'You gain 120 ft darkvision. At 3rd level, cast Darkness by spending 2 sorcery points (you can see through darkness cast this way).' },
      { name: 'Strength of the Grave', level: 1, description: 'When damage reduces you to 0 HP, make a CHA save (DC 5 + damage taken). On success, you drop to 1 HP instead. Can\'t work against radiant damage or critical hits. Once per long rest.' },
      { name: 'Hound of Ill Omen', level: 6, description: 'Spend 3 sorcery points as a bonus action to summon a dire wolf of shadow next to a creature within 120 ft. The hound has its own turn, has temp HP equal to half your sorcerer level, and the target has disadvantage on saves against your spells while within 5 ft of the hound.' },
      { name: 'Shadow Walk', level: 14, description: 'When in dim light or darkness, as a bonus action teleport up to 120 ft to another space in dim light or darkness.' },
      { name: 'Umbral Form', level: 18, description: 'Spend 6 sorcery points as a bonus action to become a shadowy form for 1 minute: resistance to all damage except force and radiant, move through creatures and objects, flying speed.' },
    ]},
    'Divine Soul': { name: 'Divine Soul', features: [
      { name: 'Divine Magic', level: 1, description: 'You can learn spells from the cleric spell list in addition to the sorcerer spell list. You also learn an additional spell based on your affinity (Good, Evil, Law, Chaos, or Neutrality).' },
      { name: 'Favored by the Gods', level: 1, description: 'When you fail a saving throw or miss with an attack roll, add 2d4 to the total, potentially changing the outcome. Once per short/long rest.' },
      { name: 'Empowered Healing', level: 6, description: 'When you or an ally within 5 ft rolls dice to determine HP from a spell, spend 1 sorcery point to reroll any number of those dice (once per turn).' },
      { name: 'Otherworldly Wings', level: 14, description: 'As a bonus action, gain spectral wings with a flying speed of 30 ft. Wings can be eagle (good), bat (evil), or dragonfly (neutral).' },
      { name: 'Unearthly Recovery', level: 18, description: 'When you have less than half your HP remaining, as a bonus action regain HP equal to half your HP maximum. Once per long rest.' },
    ]},
    'Storm Sorcery': { name: 'Storm Sorcery', features: [
      { name: 'Wind Speaker', level: 1, description: 'You speak, read, and write Primordial (and its dialects: Aquan, Auran, Ignan, and Terran).' },
      { name: 'Tempestuous Magic', level: 1, description: 'When you cast a spell of 1st level or higher, you can use a bonus action to fly 10 ft without provoking opportunity attacks.' },
      { name: 'Heart of the Storm', level: 6, description: 'You gain resistance to lightning and thunder damage. When you cast a spell of 1st level or higher that deals lightning or thunder damage, deal lightning or thunder damage equal to half your sorcerer level to all creatures of your choice within 10 ft.' },
      { name: 'Storm Guide', level: 6, description: 'You can subtly control the weather around you. Stop rain in a 20-ft sphere, or direct wind in a 100-ft sphere.' },
      { name: 'Storm\'s Fury', level: 14, description: 'When a creature hits you with a melee attack, use reaction to deal lightning damage equal to your sorcerer level (STR save or be pushed 20 ft).' },
      { name: 'Wind Soul', level: 18, description: 'Immunity to lightning and thunder damage. Magical flying speed of 60 ft. As an action, reduce flying speed to 30 ft and give up to 3 + CHA mod creatures a flying speed of 30 ft for 1 hour.' },
    ]},
    'Aberrant Mind': { name: 'Aberrant Mind', features: [
      { name: 'Psionic Spells', level: 1, description: 'You learn additional spells: Arms of Hadar, Dissonant Whispers (1st), Calm Emotions, Detect Thoughts (3rd), Hunger of Hadar, Sending (5th), Evard\'s Black Tentacles, Summon Aberration (7th), Telekinesis, Rary\'s Telepathic Bond (9th). You can swap these for divination/enchantment spells.' },
      { name: 'Telepathic Speech', level: 1, description: 'As a bonus action, create a telepathic link with a creature within 30 ft for a number of minutes equal to your sorcerer level.' },
      { name: 'Psionic Sorcery', level: 6, description: 'Cast psionic spells by spending sorcery points equal to spell level instead of a spell slot. When cast this way, the spell requires no verbal or somatic components and no material components (unless consumed).' },
      { name: 'Psychic Defenses', level: 6, description: 'Resistance to psychic damage. Advantage on saves against being charmed or frightened.' },
      { name: 'Revelation in Flesh', level: 14, description: 'Spend sorcery points (1+ per option) as a bonus action for 10 minutes: see invisible creatures (1), flying speed (1), swimming speed + waterbreathing (1), become slimy and squeeze through 1-inch gaps (1).' },
      { name: 'Warping Implosion', level: 18, description: 'As an action, teleport up to 120 ft. Each creature within 30 ft of where you left makes a STR save or takes 3d10 force damage and is pulled toward your former space. On success, half damage and not pulled. Once per long rest (or 5 sorcery points).' },
    ]},
    'Clockwork Soul': { name: 'Clockwork Soul', features: [
      { name: 'Clockwork Magic', level: 1, description: 'Learn additional spells: Alarm, Protection from Evil and Good (1st), Aid, Lesser Restoration (3rd), Dispel Magic, Protection from Energy (5th), Freedom of Movement, Summon Construct (7th), Greater Restoration, Wall of Force (9th). You can swap these for abjuration/transmutation spells.' },
      { name: 'Restore Balance', level: 1, description: 'When a creature within 60 ft rolls with advantage or disadvantage, use reaction to cancel the advantage/disadvantage. Uses: proficiency bonus per long rest.' },
      { name: 'Bastion of Law', level: 6, description: 'Spend 1-5 sorcery points to create a ward on a creature you touch. The ward has d8s equal to sorcery points spent. When the creature takes damage, spend dice from the ward to reduce damage.' },
      { name: 'Trance of Order', level: 14, description: 'As a bonus action, enter a state for 1 minute: attack rolls, ability checks, and saves can\'t roll below a 10 on the d20. Once per long rest (or 7 sorcery points).' },
      { name: 'Clockwork Cavalcade', level: 18, description: 'As an action, summon spirits in a 30-ft cube within 120 ft. Each creature of your choice in the cube: restore 100 HP, repair damaged objects, end up to 6th-level spells. Once per long rest (or 7 sorcery points).' },
    ]},
    'Lunar Sorcery': { name: 'Lunar Sorcery', features: [
      { name: 'Moon Fire', level: 1, description: 'You learn Sacred Flame cantrip (it doesn\'t count against your cantrips known) and one additional spell based on your lunar phase: Full (Shield), New (Ray of Sickness), or Crescent (Color Spray).' },
      { name: 'Lunar Embodiment', level: 1, description: 'You can change your active lunar phase (Full, New, or Crescent) whenever you finish a long rest. You gain a free casting of each phase\'s 1st-level spell once per long rest.' },
      { name: 'Lunar Boons', level: 6, description: 'Gain a benefit based on your current lunar phase when you use Metamagic: Full (two creatures you choose within 30 ft are illuminated, granting advantage on attacks against them), New (you become partially invisible until start of next turn), Crescent (you gain resistance to radiant and necrotic damage until start of next turn).' },
      { name: 'Waxing and Waning', level: 6, description: 'You can spend 1 sorcery point as a bonus action to change your current lunar phase.' },
      { name: 'Lunar Empowerment', level: 14, description: 'Full: you shed bright light 10 ft and creatures in it have disadvantage on saves against your spells. New: advantage on Stealth checks and advantage on saves against being blinded. Crescent: resistance to necrotic and radiant damage.' },
      { name: 'MoonLight Transformation', level: 18, description: 'Spend 5 sorcery points as a bonus action to transform for 1 minute, gaining all three lunar phase benefits simultaneously. Regain 2 sorcery points at start of each turn while transformed.' },
    ]},
  },
};

// ============================================================================
// WARLOCK
// ============================================================================
const WARLOCK: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons'],
    tools: [],
    savingThrows: ['WIS', 'CHA'],
    skillChoices: { count: 2, from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons'],
    tools: [],
  },
  prerequisites: { CHA: 13 },
  subclassLevel: 1,
  subclassFeatureLevels: [1, 6, 10, 14],
  features: [
    { name: 'Pact Magic', level: 1, description: 'You can cast warlock spells using CHA. You have a limited number of spell slots (1-4) that all share the same level (1st-5th) and recharge on a short or long rest.' },
    { name: 'Eldritch Invocations', level: 2, description: 'Learn 2 eldritch invocations (e.g. Agonizing Blast, Devil\'s Sight, Mask of Many Faces). You learn more as you level up and can swap one each level. Some invocations require a specific Pact Boon.' },
    { name: 'Pact Boon', level: 3, description: 'Choose: Pact of the Chain (find familiar with special forms), Pact of the Blade (create a magical weapon), Pact of the Tome (Book of Shadows with 3 cantrips from any class), or Pact of the Talisman (1d4 bonus to ability checks).' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Mystic Arcanum (6th)', level: 11, description: 'Choose one 6th-level spell from the warlock spell list. Cast it once without a spell slot per long rest. Learn 7th at 13th, 8th at 15th, 9th at 17th level.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Eldritch Master', level: 20, description: 'Spend 1 minute entreating your patron to regain all expended Pact Magic spell slots. Once per long rest.' },
  ],
  subclasses: {
    'The Fiend': { name: 'The Fiend', features: [
      { name: 'Dark One\'s Blessing', level: 1, description: 'When you reduce a hostile creature to 0 HP, gain temp HP equal to CHA mod + warlock level.' },
      { name: 'Dark One\'s Own Luck', level: 6, description: 'When you make an ability check or saving throw, add 1d10 to the roll. Once per short/long rest.' },
      { name: 'Fiendish Resilience', level: 10, description: 'Choose a damage type after a short/long rest. You gain resistance to that damage type until you choose a different one (excludes magical/silvered weapons).' },
      { name: 'Hurl Through Hell', level: 14, description: 'When you hit with an attack, you can send the creature through the lower planes. It disappears and takes 10d10 psychic damage at the end of your next turn when it returns. Once per long rest.' },
    ]},
    'The Hexblade': { name: 'The Hexblade', features: [
      { name: 'Hexblade\'s Curse', level: 1, description: 'As a bonus action, curse a creature within 30 ft for 1 minute. You gain: +proficiency bonus to damage rolls, crits on 19-20, regain HP equal to warlock level + CHA mod when the cursed target dies. Once per short/long rest.' },
      { name: 'Hex Warrior', level: 1, description: 'You gain proficiency with medium armor, shields, and martial weapons. You can use CHA instead of STR or DEX for attacks with one weapon of your choice (or your Pact of the Blade weapon).' },
      { name: 'Accursed Specter', level: 6, description: 'When you slay a humanoid, you can raise its specter to serve you until your next long rest. It gains temp HP equal to half your warlock level and bonus to attack rolls equal to your CHA mod.' },
      { name: 'Armor of Hexes', level: 10, description: 'When a creature cursed by your Hexblade\'s Curse hits you with an attack roll, roll a d6. On a 4 or higher, the attack misses regardless of the roll.' },
      { name: 'Master of Hexes', level: 14, description: 'When a creature cursed by your Hexblade\'s Curse dies, you can apply the curse to a different creature within 30 ft (no use expended).' },
    ]},
    'The Archfey': { name: 'The Archfey', features: [
      { name: 'Fey Presence', level: 1, description: 'As an action, each creature in a 10-ft cube originating from you must make a WIS save or be charmed or frightened (your choice) until end of your next turn. Once per short/long rest.' },
      { name: 'Misty Escape', level: 6, description: 'When you take damage, use reaction to become invisible and teleport up to 60 ft. Invisible until start of your next turn or until you attack/cast a spell. Once per short/long rest.' },
      { name: 'Beguiling Defenses', level: 10, description: 'You can\'t be charmed. If a creature tries to charm you, you can use reaction to turn the charm back on it (WIS save).' },
      { name: 'Dark Delirium', level: 14, description: 'As an action, charm or frighten a creature within 60 ft for 1 minute (WIS save). While affected, the creature thinks it\'s lost in a misty realm. Concentration. Once per short/long rest.' },
    ]},
    'The Great Old One': { name: 'The Great Old One', features: [
      { name: 'Awakened Mind', level: 1, description: 'You can telepathically speak to any creature within 30 ft. The creature doesn\'t need to share a language but must understand at least one language.' },
      { name: 'Entropic Ward', level: 6, description: 'When a creature attacks you, use reaction to impose disadvantage on the attack roll. If it misses, your next attack roll against it has advantage. Once per short/long rest.' },
      { name: 'Thought Shield', level: 10, description: 'Your thoughts can\'t be read by telepathy or other means unless you allow it. Resistance to psychic damage; when you take psychic damage, the attacker takes the same amount.' },
      { name: 'Create Thrall', level: 14, description: 'Touch an incapacitated humanoid to charm it until Remove Curse is cast on it. You can communicate telepathically with the charmed creature across any distance (same plane).' },
    ]},
    'The Celestial': { name: 'The Celestial', features: [
      { name: 'Healing Light', level: 1, description: 'Pool of d6s equal to 1 + warlock level. As a bonus action, heal a creature within 60 ft by spending dice (max dice = CHA mod per use). Regain all dice on long rest.' },
      { name: 'Bonus Cantrips', level: 1, description: 'You learn Light and Sacred Flame cantrips.' },
      { name: 'Radiant Soul', level: 6, description: 'Resistance to radiant damage. When you cast a spell that deals radiant or fire damage, add CHA mod to one damage or healing roll.' },
      { name: 'Celestial Resilience', level: 10, description: 'When you finish a short/long rest, you and up to 5 creatures of your choice gain temp HP. You get warlock level + CHA mod; each chosen creature gets half your warlock level + CHA mod.' },
      { name: 'Searing Vengeance', level: 14, description: 'When you make a death saving throw at the start of your turn, you can instead spring back with HP equal to half your max HP, then deal 2d8 + CHA mod radiant damage to and blind creatures within 30 ft. Once per long rest.' },
    ]},
    'The Fathomless': { name: 'The Fathomless', features: [
      { name: 'Tentacle of the Deeps', level: 1, description: 'As a bonus action, create a 10-ft spectral tentacle within 60 ft. Make a melee spell attack: 1d8 cold damage and reduce target\'s speed by 10 ft. Move tentacle 30 ft and attack again as bonus action on later turns. Uses: proficiency bonus per long rest.' },
      { name: 'Gift of the Sea', level: 1, description: 'You gain a swimming speed of 40 ft and can breathe underwater.' },
      { name: 'Oceanic Soul', level: 6, description: 'Resistance to cold damage. While fully submerged, any creature also submerged can understand your speech and you theirs.' },
      { name: 'Guardian Coil', level: 6, description: 'When you or a creature you can see within 10 ft of your tentacle takes damage, use reaction to reduce damage by 1d8.' },
      { name: 'Grasping Tentacles', level: 10, description: 'You learn Evard\'s Black Tentacles (cast once per long rest without a spell slot). When you cast it, you gain temp HP equal to warlock level. While concentrating, cold damage resistance extends to allies in the tentacle area.' },
      { name: 'Fathomless Plunge', level: 14, description: 'As an action, teleport yourself and up to 5 willing creatures within 30 ft to a body of water you\'ve seen within 1 mile, or 100 ft if on the same body of water. Once per short/long rest.' },
    ]},
    'The Genie': { name: 'The Genie', features: [
      { name: 'Genie\'s Vessel', level: 1, description: 'You have a tiny object that serves as your genie vessel. You can enter it as a Tiny space (bonus action, up to 2 × proficiency bonus hours per long rest). While inside, you can hear outside, AC and saves use your spell save DC, and you can emerge early as a bonus action.' },
      { name: 'Genie\'s Wrath', level: 1, description: 'Once per turn, when you hit with an attack roll, deal extra damage equal to your proficiency bonus. Damage type: bludgeoning (Dao), thunder (Djinni), fire (Efreeti), or cold (Marid).' },
      { name: 'Elemental Gift', level: 6, description: 'Resistance to your genie type\'s damage. As a bonus action, gain a flying speed of 30 ft (hover) for 10 minutes. Uses: proficiency bonus per long rest.' },
      { name: 'Sanctuary Vessel', level: 10, description: 'When you enter your Genie\'s Vessel, you can bring up to 5 willing creatures. The interior becomes a comfortable space (20-ft radius). During a short rest inside, you and your guests regain HP equal to your proficiency bonus.' },
      { name: 'Limited Wish', level: 14, description: 'Contact your genie patron to cast any spell of 6th level or lower from any spell list (no material components). Once per 1d4 long rests.' },
    ]},
    'The Undead': { name: 'The Undead', features: [
      { name: 'Form of Dread', level: 1, description: 'As a bonus action, transform for 1 minute. Gain temp HP equal to 1d10 + warlock level. Once per turn when you hit, target must make WIS save or be frightened until end of your next turn. You are immune to the frightened condition. Uses: proficiency bonus per long rest.' },
      { name: 'Grave Touched', level: 6, description: 'You don\'t need to eat, drink, or breathe. While in Form of Dread, once per turn you can change damage of an attack to necrotic. If you do, you can roll one extra damage die (maximum die of the attack).' },
      { name: 'Necrotic Husk', level: 10, description: 'Resistance to necrotic damage. If you would be reduced to 0 HP, you can instead drop to 1 HP and each creature within 30 ft takes 2d10 + warlock level necrotic damage. You gain one level of exhaustion. Once per long rest.' },
      { name: 'Spirit Projection', level: 14, description: 'As an action, project your spirit from your body for 1 hour. You gain a flying speed of 40 ft (hover), resistance to physical damage, and can move through creatures and objects. You can heal by dealing necrotic damage (half the damage dealt). Conjure form of dread as part of projecting. Once per long rest.' },
    ]},
  },
};

// ============================================================================
// WIZARD
// ============================================================================
const WIZARD: ClassFeaturesData = {
  startingProficiencies: {
    armor: [],
    weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'],
    tools: [],
    savingThrows: ['INT', 'WIS'],
    skillChoices: { count: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
  },
  multiclassProficiencies: { armor: [], weapons: [], tools: [] },
  prerequisites: { INT: 13 },
  subclassLevel: 2,
  subclassFeatureLevels: [2, 6, 10, 14],
  features: [
    { name: 'Spellcasting', level: 1, description: 'You can cast wizard spells using INT. You have a spellbook and prepare spells from it. Full caster progression.' },
    { name: 'Arcane Recovery', level: 1, description: 'Once per day during a short rest, recover spell slots with a combined level equal to or less than half your wizard level (rounded up). No 6th-level or higher slots.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Spell Mastery', level: 18, description: 'Choose one 1st-level and one 2nd-level wizard spell. You can cast them at their lowest level without expending a spell slot if you have them prepared.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Signature Spells', level: 20, description: 'Choose two 3rd-level wizard spells in your spellbook. They are always prepared and don\'t count against prepared spells. Cast each once per short/long rest at 3rd level without expending a spell slot.' },
  ],
  subclasses: {
    'School of Evocation': { name: 'School of Evocation', features: [
      { name: 'Evocation Savant', level: 2, description: 'Halve the time and gold to copy evocation spells into your spellbook.' },
      { name: 'Sculpt Spells', level: 2, description: 'When you cast an evocation spell, choose a number of creatures equal to 1 + spell level. Those creatures automatically succeed on their save and take no damage.' },
      { name: 'Potent Cantrip', level: 6, description: 'When a creature succeeds on a saving throw against your cantrip, it still takes half the cantrip\'s damage.' },
      { name: 'Empowered Evocation', level: 10, description: 'Add your INT modifier to one damage roll of any wizard evocation spell you cast.' },
      { name: 'Overchannel', level: 14, description: 'When you cast a wizard spell of 1st through 5th level that deals damage, deal maximum damage. If you Overchannel again before a long rest, take 2d12 necrotic damage per spell level (increasing per use).' },
    ]},
    'School of Abjuration': { name: 'School of Abjuration', features: [
      { name: 'Abjuration Savant', level: 2, description: 'Halve the time and gold to copy abjuration spells into your spellbook.' },
      { name: 'Arcane Ward', level: 2, description: 'When you cast an abjuration spell of 1st level or higher, create a magical ward (HP = 2 × wizard level + INT mod). When you take damage, the ward takes it first. Replenish the ward when you cast abjuration spells.' },
      { name: 'Projected Ward', level: 6, description: 'When a creature you can see within 30 ft takes damage, use reaction to have your Arcane Ward absorb the damage instead.' },
      { name: 'Improved Abjuration', level: 10, description: 'Add your proficiency bonus to ability checks made for abjuration spells (such as Dispel Magic and Counterspell).' },
      { name: 'Spell Resistance', level: 14, description: 'Advantage on saving throws against spells. Resistance to damage from spells.' },
    ]},
    'School of Conjuration': { name: 'School of Conjuration', features: [
      { name: 'Conjuration Savant', level: 2, description: 'Halve the time and gold to copy conjuration spells into your spellbook.' },
      { name: 'Minor Conjuration', level: 2, description: 'As an action, conjure an inanimate object (≤3 ft on a side, ≤10 lbs) in your hand. It is visibly magical and lasts 1 hour.' },
      { name: 'Benign Transposition', level: 6, description: 'As an action, teleport up to 30 ft to an unoccupied space or swap places with a willing Small/Medium creature within 30 ft. Once per long rest (or until you cast a conjuration spell of 1st level+).' },
      { name: 'Focused Conjuration', level: 10, description: 'Your concentration on a conjuration spell can\'t be broken by taking damage.' },
      { name: 'Durable Summons', level: 14, description: 'Any creature you summon or create with a conjuration spell has 30 temporary hit points.' },
    ]},
    'School of Divination': { name: 'School of Divination', features: [
      { name: 'Divination Savant', level: 2, description: 'Halve the time and gold to copy divination spells into your spellbook.' },
      { name: 'Portent', level: 2, description: 'After a long rest, roll two d20s and record the results. Before your next long rest, you can replace any attack roll, saving throw, or ability check made by you or a creature you can see with one of these rolls. Three portent dice at 14th level.' },
      { name: 'Expert Divination', level: 6, description: 'When you cast a divination spell of 2nd level or higher using a spell slot, you regain one expended spell slot of a level lower than the one cast (max 5th level).' },
      { name: 'The Third Eye', level: 10, description: 'As an action, gain one of: darkvision 60 ft, ethereal sight 60 ft, read any language, or see invisible creatures within 10 ft. Lasts until you rest or use this feature again.' },
      { name: 'Greater Portent', level: 14, description: 'You roll three d20s for your Portent feature instead of two.' },
    ]},
    'School of Enchantment': { name: 'School of Enchantment', features: [
      { name: 'Enchantment Savant', level: 2, description: 'Halve the time and gold to copy enchantment spells into your spellbook.' },
      { name: 'Hypnotic Gaze', level: 2, description: 'As an action, choose a creature within 5 ft. If it can see you, it is charmed and incapacitated (WIS save at end of each turn). You can maintain this with your action on subsequent turns. Target doesn\'t know it was charmed unless you damage it.' },
      { name: 'Instinctive Charm', level: 6, description: 'When a creature attacks you, use reaction to redirect the attack to another creature within range (WIS save; immune for 24 hours on success). Once per long rest.' },
      { name: 'Split Enchantment', level: 10, description: 'When you cast an enchantment spell of 1st level or higher that targets only one creature, you can target a second creature.' },
      { name: 'Alter Memories', level: 14, description: 'When you cast an enchantment spell that charms a creature, you can make it unaware of being charmed. You can also erase up to 1 + CHA mod hours of memories (INT save to resist).' },
    ]},
    'School of Illusion': { name: 'School of Illusion', features: [
      { name: 'Illusion Savant', level: 2, description: 'Halve the time and gold to copy illusion spells into your spellbook.' },
      { name: 'Improved Minor Illusion', level: 2, description: 'You learn Minor Illusion cantrip. When you cast it, you can create both a sound and an image simultaneously.' },
      { name: 'Malleable Illusions', level: 6, description: 'When you cast an illusion spell with a duration of 1 minute or longer, you can use your action to change the nature of the illusion (within the spell\'s parameters).' },
      { name: 'Illusory Self', level: 10, description: 'When a creature hits you with an attack, use reaction to interpose an illusory duplicate. The attack automatically misses. Once per short/long rest.' },
      { name: 'Illusory Reality', level: 14, description: 'When you cast an illusion spell of 1st level or higher, you can choose one inanimate, nonmagical object that is part of the illusion and make it real for 1 minute.' },
    ]},
    'School of Necromancy': { name: 'School of Necromancy', features: [
      { name: 'Necromancy Savant', level: 2, description: 'Halve the time and gold to copy necromancy spells into your spellbook.' },
      { name: 'Grim Harvest', level: 2, description: 'When you kill a creature with a spell of 1st level or higher, regain HP equal to 2 × spell level (3 × for necromancy spells). Doesn\'t work on undead or constructs.' },
      { name: 'Undead Thralls', level: 6, description: 'You learn Animate Dead. When you cast it, you can target one additional corpse/pile of bones. Undead you create with necromancy spells gain extra HP equal to your wizard level and add your proficiency bonus to damage rolls.' },
      { name: 'Inured to Undeath', level: 10, description: 'Resistance to necrotic damage. Your HP maximum can\'t be reduced.' },
      { name: 'Command Undead', level: 14, description: 'As an action, choose one undead you can see within 60 ft. It makes a CHA save or becomes permanently under your control (INT 8+ undead have advantage, INT 12+ undead can repeat save hourly).' },
    ]},
    'School of Transmutation': { name: 'School of Transmutation', features: [
      { name: 'Transmutation Savant', level: 2, description: 'Halve the time and gold to copy transmutation spells into your spellbook.' },
      { name: 'Minor Alchemy', level: 2, description: 'Spend 10 minutes to transform a nonmagical object (wood, stone, iron, copper, or silver) into a different one of those materials. Lasts 1 hour or until you lose concentration.' },
      { name: 'Transmuter\'s Stone', level: 6, description: 'Create a stone that grants one benefit to the bearer: darkvision 60 ft, +10 ft speed, proficiency in CON saves, or resistance to an elemental damage type. You can change the benefit when you cast a transmutation spell.' },
      { name: 'Shapechanger', level: 10, description: 'Cast Polymorph without a spell slot to turn yourself into a beast of CR 1 or lower. Once per short/long rest.' },
      { name: 'Master Transmuter', level: 14, description: 'Destroy your transmuter\'s stone for one effect: transmute a nonmagical object into another of same size/mass, restore youth, cast Raise Dead without a spell slot, or remove all curses/diseases/poisons and restore full HP.' },
    ]},
    'Bladesinging': { name: 'Bladesinging', features: [
      { name: 'Training in War and Song', level: 2, description: 'You gain proficiency with light armor and one type of one-handed melee weapon.' },
      { name: 'Bladesong', level: 2, description: 'As a bonus action, start the Bladesong for 1 minute: +INT mod to AC, +10 ft walking speed, advantage on Acrobatics, +INT mod to concentration saves. Twice per short/long rest.' },
      { name: 'Extra Attack', level: 6, description: 'You can attack twice when you take the Attack action. One of the attacks can be replaced by casting a cantrip.' },
      { name: 'Song of Defense', level: 10, description: 'While your Bladesong is active, when you take damage you can expend a spell slot as a reaction to reduce damage by 5 × slot level.' },
      { name: 'Song of Victory', level: 14, description: 'While your Bladesong is active, add INT modifier to melee weapon damage rolls.' },
    ]},
    'Order of Scribes': { name: 'Order of Scribes', features: [
      { name: 'Wizardly Quill', level: 2, description: 'As a bonus action, create a magical quill. It doesn\'t require ink, copying time for spells is halved, and you can erase anything you wrote with it.' },
      { name: 'Awakened Spellbook', level: 2, description: 'Your spellbook gains sentience. When you cast a wizard spell with a spell slot, you can change the damage type to one from another spell of the same level in your spellbook. You can also cast rituals in 10 minutes (instead of 10 extra minutes). You can use the book as a spellcasting focus.' },
      { name: 'Manifest Mind', level: 6, description: 'As a bonus action, conjure the mind of your book as a spectral object within 60 ft. You can see/hear through it, and cast wizard spells as if you were in its space. Uses: proficiency bonus per long rest.' },
      { name: 'Master Scrivener', level: 10, description: 'After a long rest, create a spell scroll of a 1st or 2nd level spell in your spellbook. The scroll has the spell stored at one level higher. It doesn\'t require concentration if it normally would.' },
      { name: 'One with the Word', level: 14, description: 'While your spellbook is on your person, advantage on Arcana checks. When you take damage while Manifest Mind is active, use reaction to dismiss the mind and negate the damage. One spell of each level is randomly erased from your spellbook. Erased spells can be re-added normally.' },
    ]},
    'War Magic': { name: 'War Magic', features: [
      { name: 'Arcane Deflection', level: 2, description: 'When hit by an attack or you fail a saving throw, use reaction to gain +2 AC or +4 to the save. If you do, you can only cast cantrips on your next turn. No spell slot needed.' },
      { name: 'Tactical Wit', level: 2, description: 'Add your INT modifier to initiative rolls.' },
      { name: 'Power Surge', level: 6, description: 'Store power surges (max = INT mod). When you deal damage with a wizard spell, expend one surge for extra force damage equal to half wizard level. Gain a surge when you use Arcane Deflection or counterspell/dispel a spell.' },
      { name: 'Durable Magic', level: 10, description: 'While maintaining concentration on a spell, you gain +2 to AC and all saving throws.' },
      { name: 'Deflecting Shroud', level: 14, description: 'When you use Arcane Deflection, you can also deal force damage equal to half your wizard level to up to 3 creatures within 60 ft.' },
    ]},
  },
};

// ============================================================================
// ARTIFICER
// ============================================================================
const ARTIFICER: ClassFeaturesData = {
  startingProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons'],
    tools: ["Thieves' Tools", "Tinker's Tools", 'One type of artisan\'s tools'],
    savingThrows: ['CON', 'INT'],
    skillChoices: { count: 2, from: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'] },
  },
  multiclassProficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: [],
    tools: ["Thieves' Tools", "Tinker's Tools"],
  },
  prerequisites: { INT: 13 },
  subclassLevel: 3,
  subclassFeatureLevels: [3, 5, 9, 15],
  features: [
    { name: 'Magical Tinkering', level: 1, description: 'As an action, imbue a Tiny nonmagical object with one property: shed 5-ft bright light and 5-ft dim light, emit a recorded message (6 sec), emit an odor/sound (10 ft, 1 min intervals), or display a static visual. You can have INT mod objects affected. Lasts indefinitely.' },
    { name: 'Spellcasting', level: 1, description: 'You can cast artificer spells using INT. You prepare spells from the artificer spell list. Half-caster progression (round up). Requires tinker\'s tools or artisan\'s tools as a focus.' },
    { name: 'Infuse Item', level: 2, description: 'Learn 4 infusions (more at higher levels). At the end of a long rest, infuse up to 2 nonmagical objects (more at higher levels) with magical properties. Examples: Enhanced Defense (+1 AC), Enhanced Weapon (+1 attack/damage), Bag of Holding, Goggles of Night.' },
    { name: 'The Right Tool for the Job', level: 3, description: 'Spend 1 hour (can be during a short/long rest) to produce any set of artisan\'s tools (from thin air) with your tinker\'s tools.' },
    { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Tool Expertise', level: 6, description: 'Your proficiency bonus is doubled for any ability check you make that uses your proficiency with a tool.' },
    { name: 'Flash of Genius', level: 7, description: 'When you or a creature within 30 ft makes an ability check or saving throw, use reaction to add your INT modifier to the roll. Uses: INT mod per long rest.' },
    { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Magic Item Adept', level: 10, description: 'Craft common and uncommon magic items in a quarter of the normal time and at half the normal cost. You can attune to up to 4 items at once (5 at 14th, 6 at 18th).' },
    { name: 'Spell-Storing Item', level: 11, description: 'At the end of a long rest, store a 1st or 2nd level artificer spell in an object you hold (or infused item). The stored spell can be cast 2 × INT mod times by anyone holding the object.' },
    { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1, or take a feat.' },
    { name: 'Soul of Artifice', level: 20, description: '+1 to all saving throws per magic item you are currently attuned to. If reduced to 0 HP, you can use reaction to end one infusion to drop to 1 HP instead.' },
  ],
  subclasses: {
    'Alchemist': { name: 'Alchemist', features: [
      { name: 'Tool Proficiency', level: 3, description: 'You gain proficiency with alchemist\'s supplies.' },
      { name: 'Alchemist Spells', level: 3, description: 'You always have certain spells prepared: Healing Word, Ray of Sickness (3rd), Flaming Sphere, Melf\'s Acid Arrow (5th), Gaseous Form, Mass Healing Word (9th), Blight, Death Ward (13th), Cloudkill, Raise Dead (17th).' },
      { name: 'Experimental Elixir', level: 3, description: 'At the end of a long rest, create one experimental elixir (random effect or chosen). Spend spell slots to create more. Effects: Healing (2d4+INT HP), Swiftness (+10 ft speed), Resilience (+1 AC), Boldness (1d4 to attacks/saves), Flight (10 ft flying speed), or Transformation (Alter Self for 10 minutes).' },
      { name: 'Alchemical Savant', level: 5, description: 'When you cast a spell using alchemist\'s supplies as your focus that restores HP or deals acid, fire, necrotic, or poison damage, add INT mod to one roll of the spell.' },
      { name: 'Restorative Reagents', level: 9, description: 'Elixirs gain temp HP equal to 2d6 + INT mod. Cast Lesser Restoration without a spell slot INT mod times per long rest.' },
      { name: 'Chemical Mastery', level: 15, description: 'Resistance to acid and poison damage; immune to the poisoned condition. Cast Greater Restoration and Heal once each per long rest without a spell slot.' },
    ]},
    'Armorer': { name: 'Armorer', features: [
      { name: 'Tools of the Trade', level: 3, description: 'You gain proficiency with heavy armor and smith\'s tools.' },
      { name: 'Armorer Spells', level: 3, description: 'Magic Missile, Thunderwave (3rd), Mirror Image, Shatter (5th), Hypnotic Pattern, Lightning Bolt (9th), Fire Shield, Greater Invisibility (13th), Passwall, Wall of Force (17th).' },
      { name: 'Arcane Armor', level: 3, description: 'Turn a suit of armor into Arcane Armor: no STR requirement, use as spellcasting focus, can\'t be removed against your will, replaces missing limbs. Choose model: Guardian (Thunder Gauntlets: 1d8 thunder melee, mark target; Defensive Field: temp HP = proficiency bonus) or Infiltrator (Lightning Launcher: 1d6 + 1d6 lightning ranged, advantage on Stealth, 5 ft speed bonus).' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice when you take the Attack action on your turn.' },
      { name: 'Armor Modifications', level: 9, description: 'Your Arcane Armor gains four special infusion slots (helmet, chest, boots, weapon). You learn four more infusions and can infuse two extra items beyond your normal allowance (these must be parts of the armor).' },
      { name: 'Perfected Armor', level: 15, description: 'Guardian: use reaction to pull a Huge or smaller creature within 30 ft (STR save) next to you and make a melee attack. Infiltrator: Lightning Launcher deals extra 1d6 lightning damage, and the next attack roll against the target has advantage.' },
    ]},
    'Artillerist': { name: 'Artillerist', features: [
      { name: 'Tool Proficiency', level: 3, description: 'You gain proficiency with woodcarver\'s tools.' },
      { name: 'Artillerist Spells', level: 3, description: 'Shield, Thunderwave (3rd), Scorching Ray, Shatter (5th), Fireball, Wind Wall (9th), Ice Storm, Wall of Fire (13th), Cone of Cold, Wall of Force (17th).' },
      { name: 'Eldritch Cannon', level: 3, description: 'As an action, create a Small or Tiny magical cannon (AC 18, HP = 5 × artificer level). Choose: Flamethrower (15-ft cone, 2d8 fire, DEX save), Force Ballista (120 ft ranged, 2d8 force, push 5 ft), or Protector (1d8 + INT mod temp HP to creatures within 10 ft). Activate as bonus action. Lasts 1 hour. Uses: once per long rest (or spend spell slot).' },
      { name: 'Arcane Firearm', level: 5, description: 'Turn a wand, staff, or rod into an arcane firearm (spellcasting focus). Add 1d8 to one damage roll of artificer spells cast through it.' },
      { name: 'Explosive Cannon', level: 9, description: 'Eldritch Cannon damage increases by 1d8 (to 3d8). As an action, destroy a cannon for an explosion: 20-ft radius, 3d8 force damage (DEX save for half).' },
      { name: 'Fortified Position', level: 15, description: 'Allies within 10 ft of your Eldritch Cannon gain half cover (+2 AC and DEX saves). You can create two cannons, but only activate one per bonus action.' },
    ]},
    'Battle Smith': { name: 'Battle Smith', features: [
      { name: 'Tool Proficiency', level: 3, description: 'You gain proficiency with smith\'s tools.' },
      { name: 'Battle Smith Spells', level: 3, description: 'Heroism, Shield (3rd), Branding Smite, Warding Bond (5th), Aura of Vitality, Conjure Barrage (9th), Aura of Purity, Fire Shield (13th), Banishing Smite, Mass Cure Wounds (17th).' },
      { name: 'Battle Ready', level: 3, description: 'You gain proficiency with martial weapons. You can use INT instead of STR or DEX for magical weapon attacks and damage.' },
      { name: 'Steel Defender', level: 3, description: 'Create an iron defender companion. It uses your proficiency bonus, has HP = 2 + INT mod + 5 × artificer level, and can attack, repair, or impose disadvantage on an attacker. It acts on your initiative and obeys your commands.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice when you take the Attack action on your turn.' },
      { name: 'Arcane Jolt', level: 9, description: 'When you or your Steel Defender hits with a magic weapon or the Defender\'s attack, deal extra 2d6 force damage or heal an ally within 30 ft for 2d6 HP (4d6 at 15th level). Uses: INT mod per long rest.' },
      { name: 'Improved Defender', level: 15, description: 'Arcane Jolt damage/healing increases to 4d6. Steel Defender gains +2 AC and its Deflect Attack deals 1d4 + INT mod force damage.' },
    ]},
  },
};

// ============================================================================
// EXPORT: The Complete Database
// ============================================================================
export const CLASS_FEATURES_DB: Record<string, ClassFeaturesData> = {
  Barbarian: BARBARIAN,
  Bard: BARD,
  Cleric: CLERIC,
  Druid: DRUID,
  Fighter: FIGHTER,
  Monk: MONK,
  Paladin: PALADIN,
  Ranger: RANGER,
  Rogue: ROGUE,
  Sorcerer: SORCERER,
  Warlock: WARLOCK,
  Wizard: WIZARD,
  Artificer: ARTIFICER,
};

/**
 * Look up a class in the features database (case-insensitive).
 */
export function getClassFeaturesData(className: string): ClassFeaturesData | undefined {
  const key = Object.keys(CLASS_FEATURES_DB).find(
    (k) => k.toLowerCase() === className.trim().toLowerCase()
  );
  return key ? CLASS_FEATURES_DB[key] : undefined;
}
