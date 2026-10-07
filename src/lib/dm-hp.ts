/**
 * Shared 5e hit point math for DM tooling.
 * Centralises damage / healing / temp HP rules so the vitals dock, roster
 * and combat engine all behave identically.
 */

export interface HPState {
  currentHP: number;
  maxHP: number;
  tempHP: number;
}

/** Damage drains temporary HP first, then current HP (floored at 0). */
export function applyDamage(state: HPState, amount: number): HPState {
  const dmg = Math.max(0, Math.floor(amount));
  if (dmg === 0) return state;
  const absorbed = Math.min(state.tempHP, dmg);
  const overflow = dmg - absorbed;
  return {
    ...state,
    tempHP: state.tempHP - absorbed,
    currentHP: Math.max(0, state.currentHP - overflow),
  };
}

/** Healing restores current HP up to max. Temp HP is untouched. */
export function applyHeal(state: HPState, amount: number): HPState {
  const heal = Math.max(0, Math.floor(amount));
  return { ...state, currentHP: Math.min(state.maxHP, state.currentHP + heal) };
}

/** Temp HP does not stack in 5e: keep the higher of the two values. */
export function applyTempHP(state: HPState, amount: number): HPState {
  const thp = Math.max(0, Math.floor(amount));
  return { ...state, tempHP: Math.max(state.tempHP, thp) };
}

export function hpPercent(state: Pick<HPState, 'currentHP' | 'maxHP'>): number {
  return Math.max(0, Math.min(100, Math.round((state.currentHP / Math.max(1, state.maxHP)) * 100)));
}

export type HPBand = 'down' | 'critical' | 'bloodied' | 'healthy';

/** Down = 0 HP, Critical ≤ 25%, Bloodied ≤ 50%, otherwise Healthy. */
export function hpBand(state: Pick<HPState, 'currentHP' | 'maxHP'>): HPBand {
  if (state.currentHP <= 0) return 'down';
  const pct = hpPercent(state);
  if (pct <= 25) return 'critical';
  if (pct <= 50) return 'bloodied';
  return 'healthy';
}

export const HP_BAND_STYLES: Record<HPBand, { bar: string; text: string; label: string }> = {
  down: { bar: 'bg-zinc-600', text: 'text-red-400', label: 'Down' },
  critical: { bar: 'bg-red-500', text: 'text-red-400', label: 'Critical' },
  bloodied: { bar: 'bg-amber-500', text: 'text-amber-300', label: 'Bloodied' },
  healthy: { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Healthy' },
};

/** DC for a concentration save after taking damage: max(10, floor(damage / 2)). */
export function concentrationDC(damage: number): number {
  return Math.max(10, Math.floor(damage / 2));
}

export const ALL_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion',
] as const;
