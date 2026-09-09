import type { AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery } from './types';
import { getModifier } from './character-engine';

// ============================================================================
// Kastoriel, The Grounded Star — Half-Elf Druid (Circle of the Stars) Lv 10
// The Coven Foundling — Starlight Coven Exile wielding the blade "Pendulum"
// ============================================================================

export type StarryConstellation = 'none' | 'archer' | 'chalice' | 'dragon';
export type CosmicOmen = 'weal' | 'woe' | null;

export interface DruidSpell {
  id: string;
  name: string;
  level: number; // 0 = cantrip, 1-5
  school: string;
  castingTime: string;
  range: string;
  target?: number | string;
  components: string;
  duration: string;
  description: string;
  damageDice?: string;
  isFreeStarMapSpell?: boolean;
}

export interface SimpleAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface StarryFeature {
  name: string;
  description: string;
  active: boolean;
  source: 'Race' | 'Class' | 'Subclass' | 'Background' | 'Equipment';
}

export interface KastorielState {
  id: string;
  name: string;
  subline: string;
  title?: string;
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
    conditions?: string[];
  };

  starryEngine: {
    activeConstellation: StarryConstellation;
    starryFormActive?: boolean;
    wildShapeMax: number;
    wildShapeUsed: number;
    cosmicOmen: 'weal' | 'woe' | null;
    cosmicOmenRoll: number | null;
    cosmicOmenUsesMax: number;
    cosmicOmenUsesUsed: number;
    freeGuidingBoltMax: number;
    freeGuidingBoltUsed: number;
    pendulumTetherActive: boolean;
    poluxienDistance: string;
    poluxienDirection: string;
  };

  spellcasting: {
    spellcastingAbility: string;
    spellSaveDC: number;
    spellAttackBonus: number;
    slots: Record<number, { max: number; used: number }>;
    spells: DruidSpell[];
  };

  features: StarryFeature[];

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

/**
 * Calculates derived stats for Kastoriel based on level & equipment.
 */
export function calculateKastorielStats(state: KastorielState): KastorielState {
  const level = state.level || 10;
  const prof = getProficiencyBonus(level);
  const wisMod = getModifier(state.abilityScores.WIS);
  const conMod = getModifier(state.abilityScores.CON);
  const dexMod = getModifier(state.abilityScores.DEX);

  // Druid d8 HP calculation
  const maxHP = 8 + conMod + (level - 1) * (5 + conMod);

  // Base AC: Star-Treated High-Coven Obsidian Robes (AC 14 + DEX mod max 2 = 16)
  const baseAC = 14 + Math.min(2, dexMod);

  // Dragon constellation gives 20 ft flying hover speed at Level 10
  const isDragonActive = state.starryEngine?.activeConstellation === 'dragon';
  const baseSpeed = 30;

  const spellSaveDC = 8 + prof + wisMod;
  const spellAttackBonus = prof + wisMod;

  return {
    ...state,
    level,
    combat: {
      ...state.combat,
      maxHP,
      currentHP: Math.min(state.combat.currentHP ?? maxHP, maxHP),
      ac: state.overrides?.ac ?? baseAC,
      initiative: state.overrides?.initiative ?? dexMod,
      speed: state.overrides?.speed ?? baseSpeed,
      hitDice: { total: level, used: state.combat.hitDice?.used || 0 },
    },
    starryEngine: {
      ...state.starryEngine,
      cosmicOmenUsesMax: prof,
      freeGuidingBoltMax: prof,
      wildShapeMax: 2,
    },
    spellcasting: {
      ...state.spellcasting,
      spellSaveDC,
      spellAttackBonus,
    },
  };
}

/**
 * Default initial state for Kastoriel, The Grounded Star.
 */
export function createDefaultKastorielState(): KastorielState {
  return calculateKastorielStats({
    id: 'kastoriel',
    name: 'Kastoriel',
    subline: 'The Grounded Star',
    title: 'The Grounded Star',
    race: 'Half-Elf',
    characterClass: 'Druid',
    subclass: 'Circle of the Stars',
    level: 10,
    background: 'The Coven Foundling',
    alignment: 'Neutral Good',

    abilityScores: {
      STR: 10,
      DEX: 14,
      CON: 16,
      INT: 12,
      WIS: 20,
      CHA: 12,
    },
    savingThrowProficiencies: ['INT', 'WIS'],
    skillProficiencies: ['Arcana', 'Insight', 'Nature', 'Perception', 'Stealth', 'Survival'],

    combat: {
      currentHP: 83,
      maxHP: 83,
      tempHP: 0,
      ac: 16,
      initiative: 2,
      speed: 30,
      hitDice: { total: 10, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
    },

    starryEngine: {
      activeConstellation: 'none',
      starryFormActive: false,
      wildShapeMax: 2,
      wildShapeUsed: 0,
      cosmicOmen: 'weal',
      cosmicOmenRoll: 4,
      cosmicOmenUsesMax: 4,
      cosmicOmenUsesUsed: 0,
      freeGuidingBoltMax: 4,
      freeGuidingBoltUsed: 0,
      pendulumTetherActive: true,
      poluxienDistance: 'Approximately 60 leagues to the Northeast',
      poluxienDirection: 'Toward the Cloudpeak Mountains',
    },

    spellcasting: {
      spellcastingAbility: 'Wisdom',
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
        // Cantrips
        {
          id: 'guidance',
          name: 'Guidance',
          level: 0,
          school: 'Divination',
          castingTime: '1 Action',
          range: 'Touch',
          components: 'V, S',
          duration: 'Concentration 1 min',
          description: 'You touch one willing creature. Target adds 1d4 to one ability check of its choice.',
          damageDice: '1d4',
          isFreeStarMapSpell: true,
        },
        {
          id: 'starry-shillelagh',
          name: 'Starry Shillelagh',
          level: 0,
          school: 'Transmutation',
          castingTime: '1 Bonus Action',
          range: 'Touch',
          components: 'V, S, M',
          duration: '1 Minute',
          description: 'The weapon you hold is imbued with cosmic force. For the duration, you can use your Wisdom modifier for attack and damage rolls (1d8 + WIS force damage).',
          damageDice: '1d8+5',
        },
        {
          id: 'produce-flame',
          name: 'Produce Flame',
          level: 0,
          school: 'Conjuration',
          castingTime: '1 Action',
          range: 'Self / 30 ft',
          components: 'V, S',
          duration: '10 Minutes',
          description: 'A golden starry flicker appears in your hand. You can hurl it at a creature within 30 ft (2d8 fire/radiant damage).',
          damageDice: '2d8',
        },
        {
          id: 'thorn-whip',
          name: 'Thorn Whip',
          level: 0,
          school: 'Transmutation',
          castingTime: '1 Action',
          range: '30 ft',
          components: 'V, S, M',
          duration: 'Instantaneous',
          description: 'You create a whip of stellar briars that lashes out. Deals 2d6 piercing damage and pulls target up to 10 feet closer.',
          damageDice: '2d6',
        },
        {
          id: 'druidcraft',
          name: 'Druidcraft',
          level: 0,
          school: 'Transmutation',
          castingTime: '1 Action',
          range: '30 ft',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'Whispering with nature spirits and constellations, predict weather, bloom a flower, or create minor sensory effects.',
        },

        // 1st Level
        {
          id: 'guiding-bolt',
          name: 'Guiding Bolt',
          level: 1,
          school: 'Evocation',
          castingTime: '1 Action',
          range: '120 ft',
          components: 'V, S',
          duration: '1 Round',
          description: 'A flash of golden starlight streaks toward a creature. Deals 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage.',
          damageDice: '4d6',
          isFreeStarMapSpell: true,
        },
        {
          id: 'healing-word',
          name: 'Healing Word',
          level: 1,
          school: 'Evocation',
          castingTime: '1 Bonus Action',
          range: '60 ft',
          components: 'V',
          duration: 'Instantaneous',
          description: 'A creature of your choice within range regains hit points equal to 1d4 + Wisdom modifier. Triggers Chalice constellation if active (+2d8+5 extra healing).',
          damageDice: '1d4+5',
        },
        {
          id: 'faerie-fire',
          name: 'Faerie Fire',
          level: 1,
          school: 'Evocation',
          castingTime: '1 Action',
          range: '60 ft',
          components: 'V',
          duration: 'Concentration 1 min',
          description: 'Each object in a 20-foot cube is outlined in glittering gold and amber light. Affected creatures grant advantage on attack rolls and cannot benefit from invisibility on DEX save failure.',
        },
        {
          id: 'absorb-elements',
          name: 'Absorb Elements',
          level: 1,
          school: 'Abjuration',
          castingTime: '1 Reaction',
          range: 'Self',
          components: 'S',
          duration: '1 Round',
          description: 'Capture incoming elemental energy. Gain resistance to acid, cold, fire, lightning, or thunder damage, and your next melee strike deals +1d6 extra damage of that type.',
          damageDice: '1d6',
        },
        {
          id: 'entangle',
          name: 'Entangle',
          level: 1,
          school: 'Conjuration',
          castingTime: '1 Action',
          range: '90 ft',
          components: 'V, S',
          duration: 'Concentration 1 min',
          description: 'Grasping cosmic roots and star-vines sprout from the ground in a 20-foot square. Creatures must succeed on a Strength saving throw or be restrained.',
        },

        // 2nd Level
        {
          id: 'moonbeam',
          name: 'Moonbeam',
          level: 2,
          school: 'Evocation',
          castingTime: '1 Action',
          range: '120 ft',
          components: 'V, S, M',
          duration: 'Concentration 1 min',
          description: 'A 5-foot-radius, 40-foot-high cylinder of silver and golden starlight descends. A creature entering or starting turn takes 2d10 radiant damage (half on CON save). Shapechangers make save with disadvantage.',
          damageDice: '2d10',
        },
        {
          id: 'lesser-restoration',
          name: 'Lesser Restoration',
          level: 2,
          school: 'Abjuration',
          castingTime: '1 Action',
          range: 'Touch',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'Touch a creature to end either one disease or one condition afflicting it: blinded, deafened, paralyzed, or poisoned.',
        },
        {
          id: 'pass-without-trace',
          name: 'Pass Without Trace',
          level: 2,
          school: 'Abjuration',
          castingTime: '1 Action',
          range: 'Self (30-ft radius)',
          components: 'V, S, M',
          duration: 'Concentration 1 hour',
          description: 'A veil of shadows and starlight cloaks you and your companions. Each creature within 30 feet gains a +10 bonus to Dexterity (Stealth) checks and cannot be tracked by non-magical means.',
        },
        {
          id: 'spike-growth',
          name: 'Spike Growth',
          level: 2,
          school: 'Transmutation',
          castingTime: '1 Action',
          range: '150 ft',
          components: 'V, S, M',
          duration: 'Concentration 10 min',
          description: 'The ground in a 20-foot radius sprouts hard obsidian caltrops and star-spikes. Difficult terrain; deals 2d4 piercing damage for every 5 feet moved.',
          damageDice: '2d4',
        },

        // 3rd Level
        {
          id: 'call-lightning',
          name: 'Call Lightning',
          level: 3,
          school: 'Conjuration',
          castingTime: '1 Action',
          range: '120 ft',
          components: 'V, S',
          duration: 'Concentration 10 min',
          description: 'A swirling storm cloud appears overhead. As an action each turn, call down a bolt of celestial lightning dealing 3d10 lightning damage (half on DEX save).',
          damageDice: '3d10',
        },
        {
          id: 'revivify',
          name: 'Revivify',
          level: 3,
          school: 'Necromancy',
          castingTime: '1 Action',
          range: 'Touch',
          components: 'V, S, M (diamonds worth 300 gp)',
          duration: 'Instantaneous',
          description: 'Touch a creature that has died within the last minute. The creature returns to life with 1 hit point.',
        },
        {
          id: 'daylight',
          name: 'Daylight',
          level: 3,
          school: 'Evocation',
          castingTime: '1 Action',
          range: '60 ft',
          components: 'V, S',
          duration: '1 Hour',
          description: 'A 60-foot-radius sphere of bright starlight spreads out from a point or object, dispelling darkness created by spells of 3rd level or lower.',
        },
        {
          id: 'dispel-magic',
          name: 'Dispel Magic',
          level: 3,
          school: 'Abjuration',
          castingTime: '1 Action',
          range: '120 ft',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'Choose one creature, object, or magical effect. Any spell of 3rd level or lower on the target ends.',
        },

        // 4th Level
        {
          id: 'freedom-of-movement',
          name: 'Freedom of Movement',
          level: 4,
          school: 'Abjuration',
          castingTime: '1 Action',
          range: 'Touch',
          components: 'V, S, M',
          duration: '1 Hour',
          description: 'The target\'s movement is unaffected by difficult terrain, and spells cannot reduce its speed or cause it to be paralyzed or restrained.',
        },
        {
          id: 'polymorph',
          name: 'Polymorph',
          level: 4,
          school: 'Transmutation',
          castingTime: '1 Action',
          range: '60 ft',
          components: 'V, S, M',
          duration: 'Concentration 1 hour',
          description: 'Transform a creature into a beast whose challenge rating is equal to or less than the target\'s level on failed WIS save.',
        },

        // 5th Level
        {
          id: 'mass-cure-wounds',
          name: 'Mass Cure Wounds',
          level: 5,
          school: 'Evocation',
          castingTime: '1 Action',
          range: '60 ft',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'A wave of healing starlight washes out. Up to six creatures in a 30-foot-radius sphere regain 3d8 + Wisdom modifier hit points.',
          damageDice: '3d8+5',
        },
        {
          id: 'greater-restoration',
          name: 'Greater Restoration',
          level: 5,
          school: 'Abjuration',
          castingTime: '1 Action',
          range: 'Touch',
          components: 'V, S, M (diamond dust worth 100 gp)',
          duration: 'Instantaneous',
          description: 'Imbue creature with positive celestial energy to remove one exhaustion level, charm/petrify, or curse.',
        },
      ],
    },

    features: [
      {
        name: 'Star Map',
        description: 'You carry a celestial star map: a carved crystal cylinder of obsidian etched with constellations. You know the Guidance cantrip, and can cast Guiding Bolt without expending a spell slot 4 times per long rest.',
        active: true,
        source: 'Subclass',
      },
      {
        name: 'Starry Form (Twinkling Constellations)',
        description: 'As a bonus action, expend a Wild Shape to take on a starry form for 10 minutes (Archer: bonus action 2d8+5 radiant shot; Chalice: +2d8+5 extra healing on spells; Dragon: min 10 on INT/WIS/CON checks and 20 ft hover fly). At the start of each of your turns, you can freely switch constellations!',
        active: false,
        source: 'Subclass',
      },
      {
        name: 'Cosmic Omen (Weal / Woe)',
        description: 'Consult the stars after a long rest (d6: even = Weal, odd = Woe). As a reaction within 30 ft, roll 1d6 and add (Weal) or subtract (Woe) from a d20 roll. 4 uses per long rest.',
        active: true,
        source: 'Subclass',
      },
      {
        name: 'The Tether of Pendulum',
        description: 'The stolen twin-blade Pendulum vibrates in the presence of your brother Poluxien. You can sense his rough distance and direction, keeping vigil over the sibling hunting you.',
        active: true,
        source: 'Equipment',
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.',
        active: true,
        source: 'Race',
      },
      {
        name: 'Darkvision',
        description: 'Thanks to your elven blood, you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
        active: true,
        source: 'Race',
      },
      {
        name: 'Coven Foundling',
        description: 'Raised within the isolated Starlight Coven, you are versed in rare celestial prophecies, celestial languages, and high-ritual rites.',
        active: true,
        source: 'Background',
      },
    ],

    inventory: [
      {
        id: 'pendulum-blade',
        name: 'Pendulum (The Stolen Tether Blade)',
        quantity: 1,
        weight: 3,
        equipped: true,
        category: 'weapon',
        description: 'A curved scimitar-blade forged from star-tempered quicksilver steel. Finesse. Stolen from your twin brother Poluxien to save him from the ritual N’elestel. The blade hums with a faint psychic tether linked to Poluxien\'s soul.',
      },
      {
        id: 'star-map-cylinder',
        name: 'Star Map of the High Coven',
        quantity: 1,
        weight: 2,
        equipped: true,
        category: 'gear',
        description: 'An intricate dark obsidian cylinder inset with amber and golden crystals. Used as Kastoriel\'s spellcasting focus, projecting rotating starlight constellations onto surrounding surfaces.',
      },
      {
        id: 'coven-robes',
        name: 'High-Coven Obsidian Robes',
        quantity: 1,
        weight: 4,
        equipped: true,
        category: 'armor',
        description: 'Dramatic black druidic vestments woven with threads of fallen star dust. AC 14 + Dexterity modifier (max +2). Resistant to elemental chills.',
      },
      {
        id: 'twin-star-pendant',
        name: 'Twin Star Pendant (Half)',
        quantity: 1,
        weight: 0.2,
        equipped: true,
        category: 'treasure',
        description: 'Half of a broken celestial pendant carved with binary stars. Poluxien wears the matching jagged half.',
      },
      {
        id: 'herbalism-kit',
        name: 'Starlight Herbalism Kit',
        quantity: 1,
        weight: 3,
        equipped: false,
        category: 'tool',
        description: 'Pouches of midnight herbs, nightshade, and luminescent star-moss used for remedies and sacred salves.',
      },
      {
        id: 'explorers-pack',
        name: "Explorer's Pack",
        quantity: 1,
        weight: 5,
        equipped: false,
        category: 'gear',
        description: 'Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, and 50ft hempen rope.',
      },
      {
        id: 'wooden-shield',
        name: 'Darkwood Starlight Shield',
        quantity: 1,
        weight: 6,
        equipped: false,
        category: 'armor',
        description: 'Shield crafted from sacred ironwood, painted with celestial star charts. (+2 AC when equipped).',
      },
    ],

    attacks: [
      {
        id: 'atk-pendulum',
        name: 'Pendulum (Starlight Tether Blade)',
        attackBonus: 8,
        damage: '1d8 + 4',
        damageType: 'Slashing',
        range: 'Melee (5 ft)',
        notes: 'Finesse, +1 Magical. Vibrates and hums when Poluxien draws near.',
        equipped: true,
      },
      {
        id: 'atk-archer-arrow',
        name: 'Starry Form: Archer Arrow',
        attackBonus: 9,
        damage: '2d8 + 5',
        damageType: 'Radiant',
        range: '60 ft',
        notes: 'Bonus action ranged spell attack while Archer constellation is active.',
        equipped: true,
      },
      {
        id: 'atk-guiding-bolt',
        name: 'Guiding Bolt (Star Map)',
        attackBonus: 9,
        damage: '4d6',
        damageType: 'Radiant',
        range: '120 ft',
        notes: 'Next attack against target has advantage. 4 free casts per long rest.',
        equipped: true,
      },
      {
        id: 'atk-produce-flame',
        name: 'Produce Flame',
        attackBonus: 9,
        damage: '2d8',
        damageType: 'Fire',
        range: '30 ft',
        notes: 'Hurl radiant fire from your palm.',
        equipped: true,
      },
      {
        id: 'atk-starry-shillelagh',
        name: 'Starry Shillelagh',
        attackBonus: 9,
        damage: '1d8 + 5',
        damageType: 'Force',
        range: 'Melee (5 ft)',
        notes: 'Bonus action infusion; uses Wisdom for strike.',
        equipped: true,
      },
    ],

    currency: { pp: 12, gp: 140, ep: 0, sp: 25, cp: 0 },

    notes: `### Appearance & Persona
Kastoriel has pale skin, sharp half-elven features, and thick, wavy white hair that cascades like lunar mist around his shoulders. He wears dramatic high-coven black druidic robes adorned with intricate gold and orange embroidery depicting celestial constellations. His amber eyes shimmer with distant starfire.

### The Starlight Coven & The Ritual of N’elestel
Raised from infancy alongside his twin brother Poluxien by the secretive Starlight Coven, Kastoriel was trained in astral divination and cosmic druidry. However, on the eve of their twentieth nameday, Kastoriel decoded the sacred coven grimoire and discovered the truth: the ancient ritual *N’elestel* ("The Final Star") was a dark rite designed to sacrifice Poluxien's soul, devouring his life essence to ground an alien cosmic entity within Kastoriel.

### The Escape and the Theft of Pendulum
Horrified and unwilling to sacrifice his brother, Kastoriel broke into the coven's sanctum under the eclipse. He stole the ritual's sacred focus — Poluxien's soul-bound curved starblade, *Pendulum* — so the elders could not perform the ritual in his absence. Kastoriel fled into the night, abandoning everything he knew.

### The Brother's Vengeance
Unaware of the sacrifice ritual, Poluxien awoke to find his twin brother gone and his ancestral weapon stolen. Believing Kastoriel betrayed him out of jealousy and greed, Poluxien was manipulated by the coven elders into becoming their chief huntsman. Poluxien now tracks Kastoriel across the continent with burning hatred, while Kastoriel keeps vigil through *Pendulum's* tether, desperately searching for a way to save his brother without fighting him to the death.`,

    journal: [
      {
        id: 'kastoriel-j1',
        title: 'The Night the Stars Shuddered',
        timestamp: 'Night of the Escape',
        content: 'I still see Poluxien sleeping peacefully as I pried Pendulum from its obsidian scabbard. If he knew what the High Matron had planned for his throat, he would have fled with me. But the coven\'s poison runs deep. Now he hunts me, and the blade hums like a weeping heart in my hands.',
        category: 'note',
      },
      {
        id: 'kastoriel-j2',
        title: 'Tether Resonance in the Peaks',
        timestamp: 'Recent Moon',
        content: 'Pendulum grew searingly hot yesterday at twilight. Poluxien has crossed the river valleys into the mountain foothills. He is moving with coven hounds. I must stay ahead, but never so far that I lose his tether.',
        category: 'quest',
      },
    ],

    mysteries: [
      {
        id: 'mystery-nelestel',
        title: 'The Mystery of N’elestel',
        description: 'What ancient entity was the Starlight Coven attempting to summon or ground through the sacrifice of twin blood? The coven archives spoke of an entity that fell from the void before the First Sundering.',
        clues: [
          'The ritual requires identical twin souls: one to burn, one to anchor.',
          'The coven star charts point toward a void gap in the Dragon constellation.',
          'Pendulum vibrates with resonance whenever celestial alignments mirror the ritual date.',
        ],
        resolved: false,
      },
      {
        id: 'mystery-poluxien-tether',
        title: 'The Soul-Tether of Pendulum',
        description: 'The blade Pendulum was bound to Poluxien\'s soul at birth. Can its bond be cleansed or redirected, or will it forever link the two brothers until one draws the other\'s blood?',
        clues: [
          'The blade glows orange when Poluxien experiences intense emotion.',
          'Severing the bond without ritual knowledge might shatter Poluxien\'s life force.',
          'The blade can be used to track Poluxien across great distances.',
        ],
        resolved: false,
      },
      {
        id: 'mystery-coven-inquisitors',
        title: 'The Starlight Inquisitors',
        description: 'Elite assassins and celestial diviners dispatched by the Starlight Coven to capture Kastoriel alive and retrieve Pendulum.',
        clues: [
          'Assassins marked with solar branding have been spotted in nearby settlements.',
          'They carry tracking lenses tuned to Kastoriel\'s Star Map.',
        ],
        resolved: false,
      },
    ],
  });
}
