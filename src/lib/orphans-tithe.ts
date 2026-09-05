// ============================================================================
// The Orphan's Tithe — Scaling Vestige Dagger Engine
// ============================================================================

import type { VestigeStage, VestigeData, SoulEffect, UltimateAbility } from './types';

/**
 * Determine the vestige stage based on character level.
 */
export function getVestigeStage(level: number): VestigeStage {
  if (level >= 15) return 'exalted';
  if (level >= 9) return 'awakened';
  return 'dormant';
}

/**
 * Get maximum soul capacity per stage.
 */
export function getMaxSouls(stage: VestigeStage): number {
  switch (stage) {
    case 'dormant': return 6;
    case 'awakened': return 8;
    case 'exalted': return 10;
  }
}

/**
 * Get hit/damage bonus per stage.
 */
export function getHitDmgBonus(stage: VestigeStage): number {
  switch (stage) {
    case 'dormant': return 1;
    case 'awakened': return 2;
    case 'exalted': return 3;
  }
}

/**
 * Get the stage display label.
 */
export function getStageLabel(stage: VestigeStage): string {
  switch (stage) {
    case 'dormant': return 'Dormant';
    case 'awakened': return 'Awakened';
    case 'exalted': return 'Exalted';
  }
}

/**
 * Get stage color theme.
 */
export function getStageColor(stage: VestigeStage): { primary: string; glow: string; bg: string } {
  switch (stage) {
    case 'dormant':
      return { primary: '#6b7280', glow: 'rgba(107,114,128,0.4)', bg: 'rgba(107,114,128,0.1)' };
    case 'awakened':
      return { primary: '#a855f7', glow: 'rgba(168,85,247,0.4)', bg: 'rgba(168,85,247,0.1)' };
    case 'exalted':
      return { primary: '#ffd700', glow: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.1)' };
  }
}

/**
 * Get effects active at the current soul count and stage.
 */
export function getSoulEffects(souls: number, stage: VestigeStage): SoulEffect[] {
  const effects: SoulEffect[] = [];

  // Dormant effects (always available once stage >= dormant)
  effects.push({
    name: `+${getHitDmgBonus(stage)} Hit/Damage`,
    description: `Add +${getHitDmgBonus(stage)} to attack and damage rolls with The Orphan's Tithe.`,
    active: souls >= 1,
    icon: 'Sword',
  });

  effects.push({
    name: 'Necrotic Infusion',
    description: 'Sneak Attack deals additional necrotic damage dice.',
    active: souls >= 2,
    icon: 'Skull',
  });

  effects.push({
    name: 'Soul Siphon',
    description: 'Gain temporary HP equal to your Rogue level when landing a Sneak Attack.',
    active: souls >= 3,
    icon: 'Heart',
  });

  // Awakened effects
  if (stage === 'awakened' || stage === 'exalted') {
    effects.push({
      name: 'Phantom Speed',
      description: 'Your movement speed increases by 10 feet.',
      active: souls >= 4,
      icon: 'Zap',
    });

    effects.push({
      name: 'Silent Steps',
      description: 'Your footsteps make no sound. Advantage on Stealth checks related to movement noise.',
      active: souls >= 5,
      icon: 'EyeOff',
    });
  }

  // Exalted effects
  if (stage === 'exalted') {
    effects.push({
      name: 'Veil of the Departed',
      description: 'Become invisible for 1 turn (no concentration). Usable once per short rest.',
      active: souls >= 7,
      icon: 'Ghost',
    });

    effects.push({
      name: 'Reaper\'s Precision',
      description: 'On a surprise attack, maximize all Sneak Attack dice instead of rolling.',
      active: souls >= 9,
      icon: 'Target',
    });
  }

  return effects;
}

/**
 * Get ultimate ability for the current stage.
 */
export function getUltimateAbility(stage: VestigeStage): UltimateAbility {
  switch (stage) {
    case 'dormant':
      return {
        name: 'Screams of the Altar',
        description: 'Unleash trapped souls in a devastating cone of necrotic energy.',
        range: '15-ft cone',
        damage: '4d8 necrotic',
        effect: 'Targets must succeed a WIS save or be Frightened until end of next turn.',
        available: true,
        soulCost: 4,
      };
    case 'awakened':
      return {
        name: 'Danse Macabre',
        description: 'Spectral souls erupt around you in a terrifying dance of death.',
        range: '20-ft radius',
        damage: '6d8 necrotic',
        effect: 'All creatures in range must save vs Fear. Failed saves also take necrotic damage.',
        available: true,
        soulCost: 6,
      };
    case 'exalted':
      return {
        name: 'Requiem of the Lost',
        description: 'Open a vortex to the realm of lost souls, consuming everything nearby.',
        range: '30-ft vortex',
        damage: '10d8 necrotic',
        effect: 'Creatures in range are Blinded and Frightened. Failed CON save: pulled 10 ft toward center.',
        available: true,
        soulCost: 8,
      };
  }
}

/**
 * Check if Phantom Murmurs are active (>= 50% soul capacity).
 */
export function isPhantomMurmursActive(souls: number, maxSouls: number): boolean {
  return souls >= Math.ceil(maxSouls / 2);
}

/**
 * Get Phantom Murmurs penalties.
 */
export function getPhantomMurmursPenalties(): { perception: string; initiative: number } {
  return {
    perception: 'Disadvantage on hearing-based Perception checks',
    initiative: -2,
  };
}

/**
 * Long Rest soul decay: halve souls, rounded down.
 */
export function longRestDecay(currentSouls: number): number {
  return Math.floor(currentSouls / 2);
}

/**
 * Get complete vestige data for a given stage.
 */
export function getVestigeData(level: number, souls: number): VestigeData {
  const stage = getVestigeStage(level);
  return {
    stage,
    stageLabel: getStageLabel(stage),
    maxSouls: getMaxSouls(stage),
    hitDmgBonus: getHitDmgBonus(stage),
    effects: getSoulEffects(souls, stage),
    ultimate: getUltimateAbility(stage),
  };
}
