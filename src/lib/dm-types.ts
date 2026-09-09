/**
 * DM Toolkit & Dashboard Architectural Types
 * Data models for modular grid layout, party HUD synchronization,
 * encounter/initiative tracking, and contextual scratchpad notes.
 */

export type WidgetType =
  | 'party_hud'
  | 'initiative_tracker'
  | 'progression_overrides'
  | 'scratchpad'
  | 'rule_compendium'
  | 'combat_actions'
  | 'dice_roller';

export type LayoutPresetId = 'combat' | 'social' | 'prep' | 'custom';

export interface GridWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  colSpan: number; // 1 to 4 on standard DM grid
  rowSpan: number; // 1 to 4
  order: number;
  minimized?: boolean;
  removable?: boolean;
  locked?: boolean;
}

export interface DashboardLayoutState {
  activePreset: LayoutPresetId;
  presets: Record<LayoutPresetId, GridWidgetConfig[]>;
  isDrawerOpen: boolean;
  activeDrawerTab: 'notes' | 'compendium' | 'activity_log';
}

/**
 * Normalized Party Member Snapshot for the DM HUD
 */
export interface PartyMemberHUDState {
  id: string;
  name: string;
  characterClass: string;
  subclass?: string;
  level: number;
  portraitUrl: string;
  primaryColor: string;
  accentColor: string;

  // Real-time Combat Core
  currentHP: number;
  maxHP: number;
  tempHP: number;
  ac: number;
  spellSaveDC: number;
  spellAttackBonus: number;
  passivePerception: number;
  passiveInsight: number;
  passiveInvestigation: number;
  initiativeBonus: number;

  // Active States & Overrides
  conditions: string[];
  inspiration: boolean;
  deathSaves: { successes: number; failures: number };
  slots: Record<number, { max: number; used: number }>;
  hitDice: { total: number; used: number; diceType?: string };
}

/**
 * Active Combatant in the Encounter Engine
 */
export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  characterId?: string;
  avatarUrl?: string;
  initiative: number;
  initiativeModifier: number;
  ac: number;
  currentHP: number;
  maxHP: number;
  tempHP: number;
  conditions: Array<{ name: string; durationRounds?: number; source?: string }>;
  isConcentrating?: boolean;
  concentrationSpell?: string;
  hasUsedReaction?: boolean;
  notes?: string;
  crOrLevel?: string;
}

/**
 * Encounter & Initiative Engine State
 */
export interface EncounterState {
  id: string;
  name: string;
  isActive: boolean;
  round: number;
  currentTurnIndex: number;
  combatants: Combatant[];
  history?: Array<{
    round: number;
    turn: string;
    action: string;
    timestamp: number;
  }>;
}

/**
 * Multi-Note Campaign Chronicle System
 * Notes can be private (DM Eyes Only) or shared to specific character sheets.
 */
export type DMNoteCategory = 'quest' | 'secret' | 'lore' | 'handout' | 'clue' | 'combat';

export interface DMNote {
  id: string;
  title: string;
  content: string; // Markdown / rich text
  category: DMNoteCategory;
  targetCharacterId: string; // 'all' for party-wide, or 'vesper', 'aria', 'cyrus', 'wynel', 'kastoriel', custom ID
  isPlayerVisible: boolean; // if true, appears on the player's sheet!
  pinned?: boolean;
  tags: string[];
  author?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Atmosphere & Session Environmental State
 */
export type TimeOfDay = 'Dawn' | 'Morning' | 'Noon' | 'Afternoon' | 'Dusk' | 'Night' | 'Midnight';
export type WeatherCondition = 'Clear Skies' | 'Overcast' | 'Dense Fog' | 'Gentle Rain' | 'Thunderstorm' | 'Blood Mist' | 'Howling Blizzard';

export interface AtmosphereState {
  sessionNumber: number;
  inGameDay: number;
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  locationName: string;
  ambianceNote?: string;
}

/**
 * Contextual Scratchpad & Compendium Entities
 */
export interface CompendiumEntity {
  id: string;
  slug: string;
  name: string;
  type: 'spell' | 'monster' | 'item' | 'rule' | 'npc';
  summary: string;
  data: Record<string, any>;
}

export interface ScratchpadNote {
  id: string;
  title: string;
  content: string; // Markdown supporting [[Entity]] and #tags
  tags: string[];
  roundTimestamp?: number;
  updatedAt: number;
}

