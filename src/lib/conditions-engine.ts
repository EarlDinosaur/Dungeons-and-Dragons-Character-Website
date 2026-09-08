/**
 * D&D 5e Conditions Mechanics & Rules Engine
 * Implements authoritative 5e mechanics for all 15 official conditions,
 * calculating direct impacts on speed, passive perception, attack rolls,
 * actions/reactions, saving throws, and advantage/disadvantage states.
 */

export interface ConditionRule {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  summary: string;
  description: string;
  affects: {
    speedZero?: boolean;
    speedHalved?: boolean;
    passivePerceptionPenalty?: number; // e.g., -5 when Blinded (5e passive disadvantage)
    disadvantageOnAttacks?: boolean;
    disadvantageOnChecks?: boolean;
    advantageToHitCreature?: boolean;
    disadvantageToHitCreature?: boolean;
    cannotTakeActions?: boolean;
    cannotTakeReactions?: boolean;
    cannotSpeak?: boolean;
    autoFailSaves?: ('STR' | 'DEX')[];
    disadvantageOnDEXSaves?: boolean;
  };
}

export const CONDITIONS_REGISTRY: Record<string, ConditionRule> = {
  Blinded: {
    name: 'Blinded',
    badgeBg: 'bg-zinc-950',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-700',
    icon: '👁️',
    summary: 'Auto-fails sight checks. Attackers have Advantage. Own attacks have Disadvantage. -5 Passive Perception.',
    description:
      "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage. In addition, passive Perception suffers a -5 penalty.",
    affects: {
      passivePerceptionPenalty: 5,
      disadvantageOnAttacks: true,
      advantageToHitCreature: true,
      disadvantageOnChecks: true,
    },
  },
  Charmed: {
    name: 'Charmed',
    badgeBg: 'bg-pink-950/60',
    badgeText: 'text-pink-300',
    badgeBorder: 'border-pink-800/60',
    icon: '💖',
    summary: "Cannot attack the charmer. Charmer has Advantage on social ability checks against you.",
    description:
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
    affects: {},
  },
  Deafened: {
    name: 'Deafened',
    badgeBg: 'bg-slate-950',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-700',
    icon: '👂',
    summary: 'Cannot hear. Automatically fails any ability check that requires hearing.',
    description:
      "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    affects: {
      disadvantageOnChecks: true,
    },
  },
  Frightened: {
    name: 'Frightened',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-800/60',
    icon: '😱',
    summary: 'Disadvantage on ability checks & attack rolls while source of fear is in line of sight. Cannot willingly move closer.',
    description:
      "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can't willingly move closer to the source of its fear.",
    affects: {
      disadvantageOnAttacks: true,
      disadvantageOnChecks: true,
    },
  },
  Grappled: {
    name: 'Grappled',
    badgeBg: 'bg-orange-950/60',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-800/60',
    icon: '🤼',
    summary: 'Speed becomes 0. Cannot benefit from any bonus to its speed.',
    description:
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated or if an effect removes the grappled creature from the reach of the grappler.",
    affects: {
      speedZero: true,
    },
  },
  Incapacitated: {
    name: 'Incapacitated',
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-800',
    icon: '⛔',
    summary: 'Cannot take actions or reactions. Concentration on spells broken immediately.',
    description:
      "An incapacitated creature can't take actions or reactions. Any spell concentration is broken immediately.",
    affects: {
      cannotTakeActions: true,
      cannotTakeReactions: true,
    },
  },
  Invisible: {
    name: 'Invisible',
    badgeBg: 'bg-cyan-950/60',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-800/60',
    icon: '✨',
    summary: 'Impossible to see without magic. Own attacks have Advantage. Attackers have Disadvantage.',
    description:
      "An invisible creature is impossible to see without the aid of magic or a special sense. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
    affects: {
      disadvantageToHitCreature: true,
    },
  },
  Paralyzed: {
    name: 'Paralyzed',
    badgeBg: 'bg-red-950/90',
    badgeText: 'text-red-200',
    badgeBorder: 'border-red-600',
    icon: '⚡',
    summary: 'Incapacitated & Speed 0. Auto-fails STR and DEX saves. Attackers have Advantage; melee hits are criticals!',
    description:
      "A paralyzed creature is incapacitated and can't move or speak. Speed is 0. Automatically fails Strength and Dexterity saving throws. Attack rolls against have advantage, and any hit within 5 feet is a critical hit.",
    affects: {
      speedZero: true,
      cannotTakeActions: true,
      cannotTakeReactions: true,
      cannotSpeak: true,
      autoFailSaves: ['STR', 'DEX'],
      advantageToHitCreature: true,
    },
  },
  Petrified: {
    name: 'Petrified',
    badgeBg: 'bg-stone-900',
    badgeText: 'text-stone-300',
    badgeBorder: 'border-stone-600',
    icon: '🗿',
    summary: 'Transformed to solid stone. Incapacitated, Speed 0, weight x10. Auto-fails STR & DEX saves. Damage resistance.',
    description:
      "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance. Incapacitated, can't move or speak, speed 0, auto-fails Strength and Dexterity saving throws.",
    affects: {
      speedZero: true,
      cannotTakeActions: true,
      cannotTakeReactions: true,
      cannotSpeak: true,
      autoFailSaves: ['STR', 'DEX'],
      advantageToHitCreature: true,
    },
  },
  Poisoned: {
    name: 'Poisoned',
    badgeBg: 'bg-emerald-950/70',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-700/60',
    icon: '🧪',
    summary: 'Disadvantage on attack rolls and ability checks.',
    description:
      "A poisoned creature has disadvantage on attack rolls and ability checks.",
    affects: {
      disadvantageOnAttacks: true,
      disadvantageOnChecks: true,
    },
  },
  Prone: {
    name: 'Prone',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-800/60',
    icon: '🛌',
    summary: 'Can only crawl. Disadvantage on attacks. Attacks within 5ft have Advantage; ranged attacks have Disadvantage.',
    description:
      "A prone creature's only movement option is to crawl, unless it stands up. The creature has disadvantage on attack rolls. Attack rolls against have advantage within 5 feet, otherwise disadvantage.",
    affects: {
      disadvantageOnAttacks: true,
    },
  },
  Restrained: {
    name: 'Restrained',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-200',
    badgeBorder: 'border-amber-600',
    icon: '⛓️',
    summary: 'Speed becomes 0. Attackers have Advantage; own attacks have Disadvantage. Disadvantage on DEX saves.',
    description:
      "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed. Attack rolls against have advantage, and creature's attack rolls have disadvantage. Disadvantage on Dexterity saving throws.",
    affects: {
      speedZero: true,
      disadvantageOnAttacks: true,
      advantageToHitCreature: true,
      disadvantageOnDEXSaves: true,
    },
  },
  Stunned: {
    name: 'Stunned',
    badgeBg: 'bg-yellow-950/80',
    badgeText: 'text-yellow-200',
    badgeBorder: 'border-yellow-600',
    icon: '💫',
    summary: 'Incapacitated, Speed 0, falters speech. Auto-fails STR and DEX saves. Attackers have Advantage.',
    description:
      "A stunned creature is incapacitated, can't move, and can speak only falteringly. Speed is 0. Automatically fails Strength and Dexterity saving throws. Attack rolls against have advantage.",
    affects: {
      speedZero: true,
      cannotTakeActions: true,
      cannotTakeReactions: true,
      autoFailSaves: ['STR', 'DEX'],
      advantageToHitCreature: true,
    },
  },
  Unconscious: {
    name: 'Unconscious',
    badgeBg: 'bg-red-950/95',
    badgeText: 'text-red-100',
    badgeBorder: 'border-red-500',
    icon: '💀',
    summary: 'Incapacitated, drops held items, falls Prone, Speed 0. Auto-fails STR/DEX saves. Attacks against have Advantage; melee hits are criticals!',
    description:
      "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings. Drops whatever it's holding and falls prone. Speed is 0. Auto-fails Strength and Dexterity saves. Attacks against have advantage; hits within 5ft are criticals.",
    affects: {
      speedZero: true,
      cannotTakeActions: true,
      cannotTakeReactions: true,
      cannotSpeak: true,
      autoFailSaves: ['STR', 'DEX'],
      advantageToHitCreature: true,
    },
  },
  Exhaustion: {
    name: 'Exhaustion',
    badgeBg: 'bg-orange-950/80',
    badgeText: 'text-orange-200',
    badgeBorder: 'border-orange-700',
    icon: '⏳',
    summary: 'Debilitating physical exhaustion. Imposes Disadvantage on checks and attacks, penalties to speed.',
    description:
      "Exhaustion is measured in six cumulative levels. Level 1: Disadvantage on ability checks. Level 2: Speed halved. Level 3: Disadvantage on attack rolls and saving throws. Level 4: Hit point maximum halved. Level 5: Speed reduced to 0. Level 6: Death.",
    affects: {
      disadvantageOnChecks: true,
      disadvantageOnAttacks: true,
    },
  },
};

export const ALL_CONDITIONS_LIST = Object.keys(CONDITIONS_REGISTRY);

/**
 * Calculates how conditions mechanically modify a character's state.
 */
export function calculateConditionModifiers(conditions: string[] = []) {
  const activeConditions = (conditions || []).filter((c) => CONDITIONS_REGISTRY[c]);
  const activeRules = activeConditions.map((c) => CONDITIONS_REGISTRY[c]);

  // Speed
  const isSpeedZero = activeRules.some((r) => r.affects.speedZero);
  const isSpeedHalved = activeRules.some((r) => r.affects.speedHalved);
  const speedZeroReasons = activeRules.filter((r) => r.affects.speedZero).map((r) => r.name);

  // Passive Perception Penalty
  const passivePerceptionPenalty = activeRules.reduce(
    (acc, r) => acc + (r.affects.passivePerceptionPenalty || 0),
    0
  );
  const perceptionPenaltyReasons = activeRules
    .filter((r) => (r.affects.passivePerceptionPenalty || 0) > 0)
    .map((r) => r.name);

  // Action / Reaction Lockouts
  const cannotTakeActions = activeRules.some((r) => r.affects.cannotTakeActions);
  const cannotTakeReactions = activeRules.some((r) => r.affects.cannotTakeReactions);
  const actionLockoutReasons = activeRules
    .filter((r) => r.affects.cannotTakeActions)
    .map((r) => r.name);

  // Attack Disadvantage
  const hasDisadvantageOnAttacks = activeRules.some((r) => r.affects.disadvantageOnAttacks);
  const attackDisadvantageReasons = activeRules
    .filter((r) => r.affects.disadvantageOnAttacks)
    .map((r) => r.name);

  // Attackers Have Advantage Against Character
  const attackersHaveAdvantage = activeRules.some((r) => r.affects.advantageToHitCreature);
  const attackerAdvantageReasons = activeRules
    .filter((r) => r.affects.advantageToHitCreature)
    .map((r) => r.name);

  // Ability Checks Disadvantage
  const hasDisadvantageOnChecks = activeRules.some((r) => r.affects.disadvantageOnChecks);
  const checkDisadvantageReasons = activeRules
    .filter((r) => r.affects.disadvantageOnChecks)
    .map((r) => r.name);

  // Auto-fail saving throws
  const autoFailSavesSet = new Set<'STR' | 'DEX'>();
  activeRules.forEach((r) => {
    r.affects.autoFailSaves?.forEach((s) => autoFailSavesSet.add(s));
  });
  const autoFailSaves = Array.from(autoFailSavesSet);

  // Disadvantage on DEX saves
  const hasDisadvantageOnDEXSaves = activeRules.some((r) => r.affects.disadvantageOnDEXSaves);

  return {
    activeConditions,
    activeRules,
    isSpeedZero,
    isSpeedHalved,
    speedZeroReasons,
    passivePerceptionPenalty,
    perceptionPenaltyReasons,
    cannotTakeActions,
    cannotTakeReactions,
    actionLockoutReasons,
    hasDisadvantageOnAttacks,
    attackDisadvantageReasons,
    attackersHaveAdvantage,
    attackerAdvantageReasons,
    hasDisadvantageOnChecks,
    checkDisadvantageReasons,
    autoFailSaves,
    hasDisadvantageOnDEXSaves,
  };
}
