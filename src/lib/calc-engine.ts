// ============================================================================
// D&D 5e Calculation Engine with Transparent Formula Breakdowns
// ============================================================================

import type { CharacterState, AbilityName, SkillName, InventoryItem } from './types';
import { getModifier, formatModifier } from './character-engine';

export interface StatBreakdownPart {
  label: string;
  value: number | string;
  description?: string;
  type?: 'base' | 'ability' | 'proficiency' | 'equipment' | 'feature' | 'override' | 'penalty';
}

export interface StatBreakdown {
  statName: string;
  total: number;
  displayValue: string;
  formula: string;
  summary: string;
  parts: StatBreakdownPart[];
  notes?: string;
}

/**
 * Calculate Armor Class with detailed breakdown based on equipped inventory and DEX mod.
 */
export function calculateACWithBreakdown(char: CharacterState): StatBreakdown {
  if (char.overrides?.ac !== undefined && char.overrides.ac !== null) {
    return {
      statName: 'Armor Class (AC)',
      total: char.overrides.ac,
      displayValue: `${char.overrides.ac}`,
      formula: `Manual Override: ${char.overrides.ac}`,
      summary: 'Armor Class is currently locked by a custom combat override.',
      parts: [
        { label: 'Custom Override', value: char.overrides.ac, type: 'override', description: 'Manual user adjustment' },
      ],
      notes: 'You can remove this override in Character Settings to restore automatic armor calculation.',
    };
  }

  const dexMod = char.abilityScores.DEX.modifier;
  const equippedArmor = char.inventory?.find(
    (item) => item.equipped && item.category === 'armor' && !item.name.toLowerCase().includes('shield')
  );
  const equippedShield = char.inventory?.find(
    (item) => item.equipped && item.name.toLowerCase().includes('shield')
  );

  const parts: StatBreakdownPart[] = [];
  let baseAC = 10;
  let dexAllowed = dexMod;
  let armorName = 'Unarmored';

  if (equippedArmor) {
    const name = equippedArmor.name.toLowerCase();
    if (name.includes('leather') && !name.includes('studded')) {
      baseAC = 11;
      armorName = equippedArmor.name;
    } else if (name.includes('studded leather')) {
      baseAC = 12;
      armorName = equippedArmor.name;
    } else if (name.includes('padded')) {
      baseAC = 11;
      armorName = equippedArmor.name;
    } else if (name.includes('hide')) {
      baseAC = 12;
      dexAllowed = Math.min(2, dexMod);
      armorName = `${equippedArmor.name} (Max +2 DEX)`;
    } else if (name.includes('chain shirt')) {
      baseAC = 13;
      dexAllowed = Math.min(2, dexMod);
      armorName = `${equippedArmor.name} (Max +2 DEX)`;
    } else if (name.includes('scale mail')) {
      baseAC = 14;
      dexAllowed = Math.min(2, dexMod);
      armorName = `${equippedArmor.name} (Max +2 DEX)`;
    } else if (name.includes('breastplate')) {
      baseAC = 14;
      dexAllowed = Math.min(2, dexMod);
      armorName = `${equippedArmor.name} (Max +2 DEX)`;
    } else if (name.includes('half plate')) {
      baseAC = 15;
      dexAllowed = Math.min(2, dexMod);
      armorName = `${equippedArmor.name} (Max +2 DEX)`;
    } else if (name.includes('ring mail')) {
      baseAC = 14;
      dexAllowed = 0;
      armorName = `${equippedArmor.name} (No DEX)`;
    } else if (name.includes('chain mail')) {
      baseAC = 16;
      dexAllowed = 0;
      armorName = `${equippedArmor.name} (No DEX)`;
    } else if (name.includes('splint')) {
      baseAC = 17;
      dexAllowed = 0;
      armorName = `${equippedArmor.name} (No DEX)`;
    } else if (name.includes('plate')) {
      baseAC = 18;
      dexAllowed = 0;
      armorName = `${equippedArmor.name} (No DEX)`;
    } else {
      // Generic light armor fallback
      baseAC = 11;
      armorName = equippedArmor.name;
    }
  }

  // Check for Monk / Barbarian unarmored defense or fallback default calculation
  if (!equippedArmor) {
    const isBarbarian = char.classes?.some((c) => c.className.toLowerCase() === 'barbarian');
    const isMonk = char.classes?.some((c) => c.className.toLowerCase() === 'monk');
    if (isBarbarian) {
      baseAC = 10;
      const conMod = char.abilityScores.CON.modifier;
      parts.push({ label: 'Base Unarmored', value: 10, type: 'base' });
      parts.push({ label: 'DEX Modifier', value: formatModifier(dexMod), type: 'ability' });
      parts.push({ label: 'Unarmored Defense (CON)', value: formatModifier(conMod), type: 'feature' });
      let total = 10 + dexMod + conMod;
      if (equippedShield) {
        total += 2;
        parts.push({ label: equippedShield.name, value: '+2', type: 'equipment' });
      }
      return {
        statName: 'Armor Class (AC)',
        total,
        displayValue: `${total}`,
        formula: `10 + ${dexMod} (DEX) + ${conMod} (CON)${equippedShield ? ' + 2 (Shield)' : ''}`,
        summary: 'Barbarian Unarmored Defense: AC equals 10 + DEX mod + CON mod.',
        parts,
      };
    } else if (isMonk) {
      baseAC = 10;
      const wisMod = char.abilityScores.WIS.modifier;
      parts.push({ label: 'Base Unarmored', value: 10, type: 'base' });
      parts.push({ label: 'DEX Modifier', value: formatModifier(dexMod), type: 'ability' });
      parts.push({ label: 'Unarmored Defense (WIS)', value: formatModifier(wisMod), type: 'feature' });
      return {
        statName: 'Armor Class (AC)',
        total: 10 + dexMod + wisMod,
        displayValue: `${10 + dexMod + wisMod}`,
        formula: `10 + ${dexMod} (DEX) + ${wisMod} (WIS)`,
        summary: 'Monk Unarmored Defense: AC equals 10 + DEX mod + WIS mod while not wearing armor or shield.',
        parts,
      };
    }
  }

  parts.push({ label: armorName, value: baseAC, type: equippedArmor ? 'equipment' : 'base' });
  if (dexAllowed !== 0) {
    parts.push({ label: 'DEX Modifier', value: formatModifier(dexAllowed), type: 'ability' });
  }

  let total = baseAC + dexAllowed;

  if (equippedShield) {
    total += 2;
    parts.push({ label: equippedShield.name, value: '+2', type: 'equipment', description: 'Shield bonus to AC' });
  }

  const formulaParts = [`${baseAC} (${armorName})`];
  if (dexAllowed !== 0) formulaParts.push(`${formatModifier(dexAllowed)} (DEX)`);
  if (equippedShield) formulaParts.push(`+2 (${equippedShield.name})`);

  return {
    statName: 'Armor Class (AC)',
    total,
    displayValue: `${total}`,
    formula: formulaParts.join(' + '),
    summary: equippedArmor
      ? `Derived from ${equippedArmor.name} plus Dexterity modifier${equippedShield ? ' and a Shield' : ''}.`
      : 'Standard 5e unarmored defense (10 + DEX modifier).',
    parts,
  };
}

/**
 * Calculate Initiative with detailed breakdown.
 */
export function calculateInitiativeWithBreakdown(char: CharacterState): StatBreakdown {
  if (char.overrides?.initiative !== undefined && char.overrides.initiative !== null) {
    return {
      statName: 'Initiative',
      total: char.overrides.initiative,
      displayValue: formatModifier(char.overrides.initiative),
      formula: `Manual Override: ${formatModifier(char.overrides.initiative)}`,
      summary: 'Initiative is currently locked by a combat override.',
      parts: [{ label: 'Custom Override', value: formatModifier(char.overrides.initiative), type: 'override' }],
    };
  }

  const dexMod = char.abilityScores.DEX.modifier;
  const parts: StatBreakdownPart[] = [
    { label: 'DEX Modifier', value: formatModifier(dexMod), type: 'ability', description: 'Base initiative bonus' },
  ];

  let bonus = 0;
  const formulaParts = [`${formatModifier(dexMod)} (DEX)`];

  // Alert Feat check (+5)
  const hasAlert = char.feats?.some(
    (f) => f.title.toLowerCase().includes('alert') || f.description.toLowerCase().includes('+5 bonus to initiative')
  );
  if (hasAlert) {
    bonus += 5;
    parts.push({ label: 'Alert Feat', value: '+5', type: 'feature', description: 'Cannot be surprised; +5 to initiative' });
    formulaParts.push('+5 (Alert)');
  }

  // Penalty check (e.g. Phantom Murmurs from Orphan's Tithe)
  if (char.orphansTithe?.phantomMurmursActive) {
    bonus -= 2;
    parts.push({ label: 'Phantom Murmurs', value: '-2', type: 'penalty', description: 'Whispering souls distract your senses' });
    formulaParts.push('-2 (Phantom Murmurs)');
  }

  const total = dexMod + bonus;

  return {
    statName: 'Initiative',
    total,
    displayValue: formatModifier(total),
    formula: formulaParts.join(' '),
    summary: 'Used when entering combat to determine turn order (d20 + Initiative).',
    parts,
  };
}

/**
 * Calculate Spell Save DC with detailed breakdown.
 */
export function calculateSpellDCWithBreakdown(
  char: CharacterState,
  preferredAbility?: AbilityName
): StatBreakdown {
  const prof = char.proficiencyBonus;

  // Determine casting ability based on class if not provided
  let ability: AbilityName = preferredAbility || 'CHA';
  const firstClass = char.classes?.[0]?.className.toLowerCase() || char.class?.toLowerCase() || '';

  if (!preferredAbility) {
    if (['wizard', 'artificer'].includes(firstClass)) ability = 'INT';
    else if (['cleric', 'druid', 'ranger'].includes(firstClass)) ability = 'WIS';
    else if (['sorcerer', 'warlock', 'bard', 'paladin'].includes(firstClass)) ability = 'CHA';
    else if (firstClass === 'rogue') ability = 'INT'; // Arcane Trickster / Assassin INT
  }

  const abilityMod = char.abilityScores[ability]?.modifier ?? 0;
  const total = 8 + prof + abilityMod;

  const parts: StatBreakdownPart[] = [
    { label: 'Base Constant', value: 8, type: 'base', description: 'Standard 5e spell DC base' },
    { label: 'Proficiency Bonus', value: formatModifier(prof), type: 'proficiency', description: `Level ${char.level} proficiency` },
    { label: `${ability} Modifier`, value: formatModifier(abilityMod), type: 'ability', description: `Spellcasting ability (${ability})` },
  ];

  return {
    statName: 'Spell Save DC',
    total,
    displayValue: `${total}`,
    formula: `8 + ${prof} (Prof) + ${abilityMod} (${ability})`,
    summary: `The DC enemies must roll on their saving throws to resist your spells.`,
    parts,
  };
}

/**
 * Calculate Spell Attack Bonus with detailed breakdown.
 */
export function calculateSpellAttackWithBreakdown(
  char: CharacterState,
  preferredAbility?: AbilityName
): StatBreakdown {
  const prof = char.proficiencyBonus;

  let ability: AbilityName = preferredAbility || 'CHA';
  const firstClass = char.classes?.[0]?.className.toLowerCase() || char.class?.toLowerCase() || '';

  if (!preferredAbility) {
    if (['wizard', 'artificer'].includes(firstClass)) ability = 'INT';
    else if (['cleric', 'druid', 'ranger'].includes(firstClass)) ability = 'WIS';
    else if (['sorcerer', 'warlock', 'bard', 'paladin'].includes(firstClass)) ability = 'CHA';
    else if (firstClass === 'rogue') ability = 'INT';
  }

  const abilityMod = char.abilityScores[ability]?.modifier ?? 0;
  const total = prof + abilityMod;

  const parts: StatBreakdownPart[] = [
    { label: 'Proficiency Bonus', value: formatModifier(prof), type: 'proficiency' },
    { label: `${ability} Modifier`, value: formatModifier(abilityMod), type: 'ability' },
  ];

  return {
    statName: 'Spell Attack Bonus',
    total,
    displayValue: formatModifier(total),
    formula: `${formatModifier(prof)} (Prof) + ${formatModifier(abilityMod)} (${ability})`,
    summary: `Added to d20 attack rolls when making ranged or melee spell attacks.`,
    parts,
  };
}

/**
 * Calculate Passive Senses (Perception, Investigation, Insight) with detailed breakdown.
 */
export function calculatePassiveSenseWithBreakdown(
  char: CharacterState,
  sense: 'Perception' | 'Investigation' | 'Insight'
): StatBreakdown {
  const prof = char.proficiencyBonus;
  let abilityName: AbilityName = 'WIS';
  if (sense === 'Investigation') abilityName = 'INT';

  const abilityMod = char.abilityScores[abilityName]?.modifier ?? 0;
  const skill = char.skills?.find((s) => s.name === sense);

  const isProf = skill?.proficient ?? false;
  const isExpert = skill?.expertise ?? false;

  let bonus = 0;
  const parts: StatBreakdownPart[] = [
    { label: 'Base Sense', value: 10, type: 'base' },
    { label: `${abilityName} Modifier`, value: formatModifier(abilityMod), type: 'ability' },
  ];

  const formulaParts = ['10 (Base)', `${formatModifier(abilityMod)} (${abilityName})`];

  if (isExpert) {
    bonus = prof * 2;
    parts.push({ label: 'Expertise', value: `+${bonus}`, type: 'proficiency', description: 'Double proficiency bonus' });
    formulaParts.push(`+${bonus} (Expertise)`);
  } else if (isProf) {
    bonus = prof;
    parts.push({ label: 'Proficiency', value: `+${bonus}`, type: 'proficiency', description: 'Proficient in skill' });
    formulaParts.push(`+${bonus} (Prof)`);
  }

  // 5e Condition Penalty: Blinded imposes disadvantage on perception checks requiring sight (-5 to passive perception)
  const isBlinded = sense === 'Perception' && char.combat?.conditions?.includes('Blinded');
  if (isBlinded) {
    parts.push({
      label: 'Blinded Penalty',
      value: '-5',
      type: 'penalty',
      description: '5e rules impose a -5 penalty to passive Perception when Blinded',
    });
    formulaParts.push('- 5 (Blinded)');
  }

  const total = Math.max(0, 10 + abilityMod + bonus - (isBlinded ? 5 : 0));

  return {
    statName: `Passive ${sense}`,
    total,
    displayValue: `${total}`,
    formula: formulaParts.join(' + '),
    summary: isBlinded
      ? `Passive ${sense} suffers a -5 penalty while Blinded.`
      : `Default score for ${sense} without having to actively roll dice.`,
    parts,
    notes: isBlinded ? 'Character cannot see and auto-fails checks requiring sight.' : undefined,
  };
}

/**
 * Calculate Saving Throw with detailed breakdown.
 */
export function calculateSavingThrowWithBreakdown(
  char: CharacterState,
  ability: AbilityName
): StatBreakdown {
  const abilityScore = char.abilityScores[ability];
  const mod = abilityScore.modifier;
  const isProf = abilityScore.saveProficient;
  const prof = char.proficiencyBonus;
  const conditions = char.combat?.conditions || [];

  // Check 5e auto-fail conditions for STR and DEX saves
  const autoFailConditions = ['Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].filter((c) =>
    conditions.includes(c)
  );

  const parts: StatBreakdownPart[] = [
    { label: `${ability} Modifier`, value: formatModifier(mod), type: 'ability' },
  ];

  const formulaParts = [`${formatModifier(mod)} (${ability})`];

  let total = mod;
  if (isProf) {
    total += prof;
    parts.push({ label: 'Save Proficiency', value: `+${prof}`, type: 'proficiency', description: `Class saving throw proficiency` });
    formulaParts.push(`+${prof} (Prof)`);
  }

  if (['STR', 'DEX'].includes(ability) && autoFailConditions.length > 0) {
    parts.push({
      label: 'Condition Automatic Failure',
      value: 'FAIL',
      type: 'penalty',
      description: `Automatically fails ${ability} saving throws while ${autoFailConditions.join(', ')}`,
    });
    return {
      statName: `${ability} Saving Throw`,
      total: 0,
      displayValue: 'AUTO-FAIL',
      formula: `Automatic Failure (${autoFailConditions.join(', ')})`,
      summary: `You automatically fail ${ability} saves due to active condition: ${autoFailConditions.join(', ')}.`,
      parts,
      notes: 'Under 5e rules, paralyzed, petrified, stunned, and unconscious creatures auto-fail Strength and Dexterity saving throws.',
    };
  }

  // Check Disadvantage on DEX saves from Restrained
  const hasDexDisadv = ability === 'DEX' && conditions.includes('Restrained');
  if (hasDexDisadv) {
    parts.push({
      label: 'Restrained Condition',
      value: 'Disadvantage',
      type: 'penalty',
      description: 'Restrained imposes disadvantage on Dexterity saving throws',
    });
  }

  return {
    statName: `${ability} Saving Throw`,
    total,
    displayValue: formatModifier(total),
    formula: formulaParts.join(' '),
    summary: `Used to resist spells, poisons, traps, and hazards targeting your ${abilityScore.label}.${hasDexDisadv ? ' (Rolled with Disadvantage due to Restrained)' : ''}`,
    parts,
    notes: hasDexDisadv ? 'Roll with Disadvantage while Restrained.' : undefined,
  };
}

/**
 * Calculate Speed with detailed breakdown, factoring in 5e conditions.
 */
export function calculateSpeedWithBreakdown(char: CharacterState): StatBreakdown {
  const baseSpeed = char.overrides?.speed ?? char.speed ?? 30;
  const conditions = char.combat?.conditions || [];
  const speedZeroConditions = ['Grappled', 'Restrained', 'Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].filter((c) =>
    conditions.includes(c)
  );

  const parts: StatBreakdownPart[] = [
    { label: 'Base Speed', value: `${baseSpeed} ft`, type: 'base', description: 'Base walking speed' },
  ];

  if (speedZeroConditions.length > 0) {
    parts.push({
      label: 'Movement Lock Penalty',
      value: '0 ft',
      type: 'penalty',
      description: `Active condition (${speedZeroConditions.join(', ')}) reduces movement speed to 0 ft`,
    });
    return {
      statName: 'Movement Speed',
      total: 0,
      displayValue: '0 ft',
      formula: `0 ft (${speedZeroConditions.join(', ')})`,
      summary: `Speed is reduced to 0 ft while ${speedZeroConditions.join(', ')}.`,
      parts,
      notes: 'Under 5e rules, a creature whose speed is 0 ft cannot benefit from any bonus to its speed.',
    };
  }

  return {
    statName: 'Movement Speed',
    total: baseSpeed,
    displayValue: `${baseSpeed} ft`,
    formula: `${baseSpeed} ft (Walking)`,
    summary: 'Maximum distance you can move on your turn.',
    parts,
  };
}

/**
 * Calculate Skill Check with detailed breakdown.
 */
export function calculateSkillWithBreakdown(
  char: CharacterState,
  skillName: SkillName
): StatBreakdown {
  const skill = char.skills?.find((s) => s.name === skillName);
  const ability = skill?.ability || 'DEX';
  const mod = char.abilityScores[ability]?.modifier ?? 0;
  const prof = char.proficiencyBonus;
  const isProf = skill?.proficient ?? false;
  const isExpert = skill?.expertise ?? false;

  const parts: StatBreakdownPart[] = [
    { label: `${ability} Modifier`, value: formatModifier(mod), type: 'ability' },
  ];

  const formulaParts = [`${formatModifier(mod)} (${ability})`];
  let total = mod;

  if (isExpert) {
    const expertBonus = prof * 2;
    total += expertBonus;
    parts.push({ label: 'Expertise', value: `+${expertBonus}`, type: 'proficiency', description: 'Double proficiency bonus applied' });
    formulaParts.push(`+${expertBonus} (Expertise)`);
  } else if (isProf) {
    total += prof;
    parts.push({ label: 'Proficiency', value: `+${prof}`, type: 'proficiency', description: 'Proficient bonus applied' });
    formulaParts.push(`+${prof} (Prof)`);
  }

  return {
    statName: `${skillName} (${ability})`,
    total,
    displayValue: formatModifier(total),
    formula: formulaParts.join(' '),
    summary: `Your bonus for ${skillName} checks using your ${ability} modifier.`,
    parts,
  };
}

/**
 * Calculate Carrying Capacity and Encumbrance breakdown.
 */
export function calculateEncumbranceWithBreakdown(char: CharacterState): {
  totalWeight: number;
  carryingCapacity: number;
  encumberedThreshold: number;
  heavilyEncumberedThreshold: number;
  status: 'unencumbered' | 'encumbered' | 'heavily-encumbered' | 'over-capacity';
  statusLabel: string;
  statusColor: string;
  percentUsed: number;
  breakdown: StatBreakdown;
} {
  const strScore = char.abilityScores.STR.total || char.abilityScores.STR.base || 10;
  const carryingCapacity = strScore * 15;
  const encumberedThreshold = strScore * 5;
  const heavilyEncumberedThreshold = strScore * 10;

  let totalWeight = 0;
  if (char.inventory) {
    for (const item of char.inventory) {
      totalWeight += (item.weight || 0) * (item.quantity || 1);
    }
  }

  // Add currency weight (50 coins = 1 lb)
  if (char.currency) {
    const totalCoins = (char.currency.cp || 0) + (char.currency.sp || 0) + (char.currency.ep || 0) + (char.currency.gp || 0) + (char.currency.pp || 0);
    totalWeight += Math.round((totalCoins / 50) * 10) / 10;
  }

  totalWeight = Math.round(totalWeight * 10) / 10;

  let status: 'unencumbered' | 'encumbered' | 'heavily-encumbered' | 'over-capacity' = 'unencumbered';
  let statusLabel = 'Normal (Unencumbered)';
  let statusColor = 'text-emerald-400';

  if (totalWeight > carryingCapacity) {
    status = 'over-capacity';
    statusLabel = 'Over Capacity (Cannot Move)';
    statusColor = 'text-red-500 font-bold';
  } else if (totalWeight > heavilyEncumberedThreshold) {
    status = 'heavily-encumbered';
    statusLabel = 'Heavily Encumbered (-20 ft Speed, Disadvantage on STR/DEX/CON)';
    statusColor = 'text-amber-500 font-bold';
  } else if (totalWeight > encumberedThreshold) {
    status = 'encumbered';
    statusLabel = 'Encumbered (-10 ft Speed)';
    statusColor = 'text-yellow-400';
  }

  const percentUsed = Math.min(100, Math.round((totalWeight / Math.max(1, carryingCapacity)) * 100));

  const breakdown: StatBreakdown = {
    statName: 'Encumbrance & Carrying Capacity',
    total: carryingCapacity,
    displayValue: `${totalWeight} / ${carryingCapacity} lbs`,
    formula: `STR (${strScore}) × 15 lbs = ${carryingCapacity} lbs Max Capacity`,
    summary: `Tracks total weight of equipped and carried gear plus currency (50 coins = 1 lb).`,
    parts: [
      { label: 'Strength Score', value: strScore, type: 'ability' },
      { label: 'Carrying Capacity Ratio', value: '× 15 lbs', type: 'base' },
      { label: 'Current Gear Weight', value: `${totalWeight} lbs`, type: 'equipment' },
      { label: 'Encumbrance Threshold', value: `${encumberedThreshold} lbs (STR × 5)`, type: 'feature' },
      { label: 'Heavy Encumbrance', value: `${heavilyEncumberedThreshold} lbs (STR × 10)`, type: 'feature' },
    ],
  };

  return {
    totalWeight,
    carryingCapacity,
    encumberedThreshold,
    heavilyEncumberedThreshold,
    status,
    statusLabel,
    statusColor,
    percentUsed,
    breakdown,
  };
}

/**
 * Calculate Hit Points (Max HP) with detailed breakdown.
 */
export function calculateHPBreakdown(char: CharacterState): StatBreakdown {
  const level = char.level;
  const conMod = char.abilityScores.CON.modifier;
  const firstClass = char.classes?.[0]?.className.toLowerCase() || char.class?.toLowerCase() || '';

  // Standard hit die by class
  let hitDieValue = 8;
  if (firstClass === 'barbarian') hitDieValue = 12;
  else if (['fighter', 'paladin', 'ranger'].includes(firstClass)) hitDieValue = 10;
  else if (['wizard', 'sorcerer'].includes(firstClass)) hitDieValue = 6;
  else hitDieValue = 8;

  const avgPerLevel = Math.floor(hitDieValue / 2) + 1; // e.g. d8 avg is 5, d10 avg is 6, d6 avg is 4

  const lvl1HP = hitDieValue + conMod;
  const subsequentHP = Math.max(0, level - 1) * (avgPerLevel + conMod);
  const total = lvl1HP + subsequentHP;

  const parts: StatBreakdownPart[] = [
    { label: `Level 1 Max (${hitDieValue} + CON)`, value: lvl1HP, type: 'base', description: `Full hit die (${hitDieValue}) + CON mod (${conMod})` },
  ];

  if (level > 1) {
    parts.push({
      label: `Levels 2–${level} (${level - 1} × [${avgPerLevel} + ${conMod}])`,
      value: subsequentHP,
      type: 'base',
      description: `Average hit die roll (${avgPerLevel}) + CON mod (${conMod}) per level`,
    });
  }

  return {
    statName: 'Maximum Hit Points (HP)',
    total,
    displayValue: `${char.combat.currentHP} / ${char.combat.maxHP}`,
    formula: `Level 1 (${lvl1HP}) + Levels 2–${level} (${subsequentHP}) = ${total} Max HP`,
    summary: 'Standard 5e fixed HP progression: Full die at level 1, then average hit die + CON modifier per level.',
    parts,
  };
}
