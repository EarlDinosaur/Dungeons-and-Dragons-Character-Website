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

export interface CombatState {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  hitDice: { total: number; used: number };
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

  // Derived stats (calculated from level)
  proficiencyBonus: number;
  abilityScores: AbilityScores;
  skills: Skill[];
  ac: number;
  initiative: number;
  speed: number;
  passivePerception: number;

  // Combat
  combat: CombatState;
  sneakAttackDice: number;

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

export type TabId = 'character' | 'combat' | 'inventory' | 'artifact' | 'dossier';
