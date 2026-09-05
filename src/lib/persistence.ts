// ============================================================================
// Persistence Layer — localStorage with hydration safety
// ============================================================================

import type { CharacterState } from './types';
import {
  calculateAbilityScores,
  calculateProficiencyBonus,
  calculateHP,
  calculateSneakAttackDice,
  calculateAC,
  calculateInitiative,
  calculatePassivePerception,
  calculateSkills,
  getDefaultInventory,
} from './character-engine';
import { getVestigeStage } from './orphans-tithe';

const STORAGE_KEY = 'vesper-ashwood-character-state';
const SCHEMA_VERSION = 1;

/**
 * Get default dossier data with Earl's backstory.
 */
function getDefaultDossier(): CharacterState['dossier'] {
  return {
    backstory: {
      orphanageMassacre: `The night the orphanage burned is the only memory that comes unbidden. Earl — then just another nameless child — watched from beneath a collapsed beam as Father Malachi's congregation performed their ritual. The iron manacles. The altar stone slick with something darker than wine. The screams that became whispers, then silence. He was seven years old. He was the only survivor, though "survivor" felt generous for what crawled out of the ashes.`,

      fatherMalachi: `Father Malachi found him three days later, wandering the roads with burnt hands and empty eyes. The priest claimed divine providence. Earl learned to call it something else entirely. Malachi ran a parish that served as cover — a way station for information, contraband, and occasionally, people who needed to disappear. The old man taught Earl letters, numbers, and the catechism. He also taught him which herbs could put a man to sleep, which could stop a heart, and which could make the difference look natural.`,

      apprenticeApothecary: `By fifteen, Earl had constructed his cover identity with meticulous care. Vesper Ashwood — apprentice apothecary, quiet but reliable, known for his steady hands and knowledge of medicines. The shop in the merchant quarter was real. The tinctures he sold were genuine. The identity was flawless because it was built on truth: he did know medicines, he was a skilled herbalist, and Vesper Ashwood was, in every practical sense, a real person. The assassin underneath was simply the part that paid better.`,

      guildScoutVincent: `Vincent appeared on a rain-soaked Tuesday, ordering a headache powder and leaving behind a coin with a serpent stamped on its face. The Guild's calling card. Vincent was a scout — the kind of person who found talent before it found trouble. He'd watched Earl for six months before making contact. "You have a gift," Vincent told him over cheap wine in a back room. "The Guild can sharpen it." What Vincent didn't say was that gifts, once given to the Guild, were never returned.`,

      bossDexter: `Dexter runs the local Guild cell with the precision of a watchmaker and the morality of a plague rat. He is Earl's handler, his employer, and the closest thing to a patron he has in this city. Dexter doesn't ask questions about methods — only results. He pays well, protects his assets, and has exactly zero tolerance for loose ends. Earl respects him the way one respects a loaded crossbow: carefully, and always from the right end.`,
    },
    mysteries: [
      {
        id: 'rusted-manacle',
        title: 'The Rusted Manacle',
        description: 'A corroded iron manacle, child-sized, found in the ruins of the orphanage. It hums faintly when held near The Orphan\'s Tithe. Who forged these chains, and what ritual were they part of? The metalwork bears symbols that no local blacksmith recognizes.',
        clues: [],
        resolved: false,
      },
      {
        id: 'eclipse-brand',
        title: 'The Eclipse Shoulder Brand',
        description: 'A circular burn scar on Earl\'s left shoulder blade — a solar eclipse design that appeared overnight after his first kill with The Orphan\'s Tithe. The brand occasionally pulses with warmth during new moons. Similar marks have been spotted on other individuals, all of whom are now dead.',
        clues: [],
        resolved: false,
      },
      {
        id: 'changing-whispers',
        title: 'The Changing Whispers',
        description: 'The dagger whispers. Not always, and never clearly, but the voices shift. Sometimes they sound like children. Sometimes they speak in a language that Earl almost understands. Recently, one voice has been repeating a name — but it changes each time he tries to remember it.',
        clues: [],
        resolved: false,
      },
      {
        id: 'platinum-benefactor',
        title: 'The Secret Platinum Benefactor',
        description: 'Someone has been leaving platinum coins in Earl\'s dead drops — far more than his contracts pay. The coins are unmarked, impossibly pure, and warm to the touch. Dexter claims ignorance. Vincent is too dead to ask. Someone very wealthy and very informed is investing in Vesper Ashwood, and Earl has no idea why.',
        clues: [],
        resolved: false,
      },
    ],
    journal: [],
    playerNotes: '',
  };
}

/**
 * Create the default character state for Earl (Vesper Ashwood).
 */
export function createDefaultCharacterState(): CharacterState {
  const level = 1;
  const abilities = calculateAbilityScores(level);
  const profBonus = calculateProficiencyBonus(level);
  const conMod = abilities.CON.modifier;
  const dexMod = abilities.DEX.modifier;
  const maxHP = calculateHP(level, conMod);

  return {
    name: 'Earl',
    alias: 'Vesper Ashwood',
    race: 'Human',
    class: 'Rogue',
    subclass: 'Assassin',
    level,
    background: 'Criminal / Spy',
    alignment: 'Neutral Evil',
    experience: 0,

    proficiencyBonus: profBonus,
    abilityScores: abilities,
    skills: calculateSkills(level, abilities),
    ac: calculateAC(dexMod),
    initiative: calculateInitiative(dexMod),
    speed: 30,
    passivePerception: calculatePassivePerception(abilities.WIS.modifier, profBonus, true),

    combat: {
      currentHP: maxHP,
      maxHP,
      tempHP: 0,
      hitDice: { total: level, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
    },
    sneakAttackDice: calculateSneakAttackDice(level),

    inventory: getDefaultInventory(),
    currency: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },

    orphansTithe: {
      currentSouls: 0,
      vestigeStage: getVestigeStage(level),
      phantomMurmursActive: false,
      altarTraumaActive: true,
    },

    dossier: getDefaultDossier(),

    version: SCHEMA_VERSION,
    lastSaved: new Date().toISOString(),
  };
}

/**
 * Recalculate all derived stats when level changes.
 */
export function recalculateForLevel(state: CharacterState, newLevel: number): CharacterState {
  const abilities = calculateAbilityScores(newLevel);
  const profBonus = calculateProficiencyBonus(newLevel);
  const conMod = abilities.CON.modifier;
  const dexMod = abilities.DEX.modifier;
  const maxHP = calculateHP(newLevel, conMod);

  // Preserve current HP ratio when max HP changes
  const hpRatio = state.combat.maxHP > 0 ? state.combat.currentHP / state.combat.maxHP : 1;

  return {
    ...state,
    level: newLevel,
    proficiencyBonus: profBonus,
    abilityScores: abilities,
    skills: calculateSkills(newLevel, abilities),
    ac: calculateAC(dexMod, newLevel >= 5), // Studded leather at level 5+
    initiative: calculateInitiative(dexMod, state.orphansTithe.phantomMurmursActive ? -2 : 0),
    speed: 30,
    passivePerception: calculatePassivePerception(abilities.WIS.modifier, profBonus, true),
    combat: {
      ...state.combat,
      currentHP: Math.round(maxHP * hpRatio),
      maxHP,
      hitDice: { ...state.combat.hitDice, total: newLevel },
    },
    sneakAttackDice: calculateSneakAttackDice(newLevel),
    orphansTithe: {
      ...state.orphansTithe,
      vestigeStage: getVestigeStage(newLevel),
    },
  };
}

/**
 * Save state to localStorage (debounced externally).
 */
export function saveCharacterState(state: CharacterState): void {
  if (typeof window === 'undefined') return;
  try {
    const data = { ...state, lastSaved: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save character state:', e);
  }
}

/**
 * Load state from localStorage (hydration-safe).
 */
export function loadCharacterState(): CharacterState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CharacterState;
    if (parsed.version !== SCHEMA_VERSION) {
      // Future: migration logic
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load character state:', e);
    return null;
  }
}

/**
 * Clear saved state.
 */
export function clearCharacterState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
