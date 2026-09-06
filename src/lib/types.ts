// ============================================================================
// D&D 5e Character Sheet — Type Definitions
// Earl (Vesper Ashwood) — Human Rogue (Assassin)
// ============================================================================

export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScore {
  name: AbilityName;
  label: string;
  base: number;
  modifier: number;
  total: number;
  saveProficient: boolean;
  saveBonus: number;
}

export type AbilityScores = Record<AbilityName, AbilityScore>;

export type SkillName =
  | 'Acrobatics' | 'Animal Handling' | 'Arcana' | 'Athletics'
  | 'Deception' | 'History' | 'Insight' | 'Intimidation'
  | 'Investigation' | 'Medicine' | 'Nature' | 'Perception'
  | 'Performance' | 'Persuasion' | 'Religion' | 'Sleight of Hand'
  | 'Stealth' | 'Survival';

export interface Skill {
  name: SkillName;
  ability: AbilityName;
  proficient: boolean;
  expertise: boolean;
  bonus: number;
}

export type VestigeStage = 'dormant' | 'awakened' | 'exalted';

export interface SoulEffect {
  name: string;
  description: string;
  active: boolean;
  icon: string;
}

export interface UltimateAbility {
  name: string;
  description: string;
  range: string;
  damage: string;
  effect: string;
  available: boolean;
  soulCost: number;
}

export interface VestigeData {
  stage: VestigeStage;
  stageLabel: string;
  maxSouls: number;
  hitDmgBonus: number;
  effects: SoulEffect[];
  ultimate: UltimateAbility;
}

export interface OrphansTitheState {
  currentSouls: number;
  vestigeStage: VestigeStage;
  phantomMurmursActive: boolean;
  altarTraumaActive: boolean;
}

export interface AssassinFeature {
  name: string;
  level: number;
  description: string;
  unlocked: boolean;
  mechanics: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
  equipped: boolean;
  category: 'weapon' | 'armor' | 'gear' | 'consumable' | 'treasure' | 'tool';
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CampaignMystery {
  id: string;
  title: string;
  description: string;
  clues: string[];
  resolved: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'quest' | 'target' | 'note' | 'session';
}

export interface DossierData {
  backstory: {
    orphanageMassacre: string;
    fatherMalachi: string;
    apprenticeApothecary: string;
    guildScoutVincent: string;
    bossDexter: string;
  };
  mysteries: CampaignMystery[];
  journal: JournalEntry[];
  playerNotes: string;
}

export interface ClassLevel {
  className: string;
  subclass?: string;
  level: number;
  hitDice: string; // e.g. "d8", "d10"
}

export interface AttackOption {
  id: string;
  name: string;
  attackBonus: number;
  damage: string; // e.g. "1d6 + 3"
  damageType: string; // e.g. "Piercing"
  range: string; // e.g. "Melee (5 ft)" or "20/60 ft"
  notes: string;
  equipped?: boolean;
}

export interface CharacterSpellItem {
  id: string;
  name: string;
  level: number; // 0 for Cantrip, 1-9
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damageDice?: string;
  prepared?: boolean;
}

export interface CustomFeat {
  id: string;
  title: string;
  description: string;
  source: string; // e.g. "Racial", "Feat (Level 4)", "Class Trait"
  level: number;
}

export interface NonStatProficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  languages: string[];
}

export interface CombatOverrides {
  ac?: number;
  initiative?: number;
  speed?: number;
  proficiencyBonus?: number;
}

export interface CombatState {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  hitDice: { total: number; used: number; diceType?: string };
  deathSaves: { successes: number; failures: number };
  conditions: string[];
}

export interface CharacterState {
  // Core
  name: string;
  alias: string;
  race: string;
  class: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  experience: number;

  // Multiclassing Support
  classes: ClassLevel[];

  // Derived & Overrides
  proficiencyBonus: number;
  abilityScores: AbilityScores;
  skills: Skill[];
  ac: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  overrides?: CombatOverrides;

  // Combat & Actions
  combat: CombatState;
  sneakAttackDice: number;
  attacks: AttackOption[];

  // Progression (Spells, Feats, Proficiencies)
  spellcasting: {
    spellSaveDC: number;
    spellAttackBonus: number;
    slots: Record<number, { max: number; used: number }>;
    spells: CharacterSpellItem[];
  };
  feats: CustomFeat[];
  proficiencies: NonStatProficiencies;

  // Inventory
  inventory: InventoryItem[];
  currency: Currency;

  // Artifact
  orphansTithe: OrphansTitheState;

  // Narrative
  dossier: DossierData;

  // Meta
  version: number;
  lastSaved: string;
}

export type TabId = 'character' | 'combat' | 'inventory' | 'artifact' | 'dossier' | 'spells' | 'progression';

