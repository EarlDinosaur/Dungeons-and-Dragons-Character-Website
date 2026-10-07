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

export const DEFAULT_CAMPAIGN_NPCS: CustomNPC[] = [];
