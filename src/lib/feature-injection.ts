// ============================================================================
// D&D 5e Feature Injection Engine
// Computes auto-granted features & proficiencies based on class configuration
// ============================================================================

import type { ClassLevel, CustomFeat, NonStatProficiencies } from './types';
import { getClassFeaturesData } from './class-features-db';
import type { ClassFeatureEntry } from './class-features-db';

const AUTO_SOURCE_PREFIX = 'Auto:';

/**
 * Check if a feat was auto-injected by the engine.
 */
export function isAutoInjectedFeat(feat: CustomFeat): boolean {
  return feat.source.startsWith(AUTO_SOURCE_PREFIX);
}

/**
 * Features that don't stack across multiclassing (per 5e rules).
 * Only one instance of each should be injected.
 */
const NON_STACKING_FEATURES = new Set([
  'Extra Attack',
  'Unarmored Defense',
]);

/**
 * Given a character's class list, compute all auto-granted features and proficiencies.
 *
 * @param classes - The character's class configuration (ordered; index 0 = starting class).
 * @returns Object with auto-injected features and merged proficiency lists.
 */
export function computeInjectedFeatures(
  classes: ClassLevel[]
): {
  features: CustomFeat[];
  proficiencies: NonStatProficiencies;
} {
  if (!classes || classes.length === 0) {
    return {
      features: [],
      proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
    };
  }

  const allFeatures: CustomFeat[] = [];
  const profSets = {
    armor: new Set<string>(),
    weapons: new Set<string>(),
    tools: new Set<string>(),
    languages: new Set<string>(),
  };

  // Track non-stacking features already injected
  const injectedNonStacking = new Set<string>();
  let featIdCounter = 0;

  for (let classIndex = 0; classIndex < classes.length; classIndex++) {
    const classEntry = classes[classIndex];
    const classData = getClassFeaturesData(classEntry.className);
    if (!classData) continue;

    const isFirstClass = classIndex === 0;

    // --- PROFICIENCIES ---
    if (isFirstClass) {
      // First class gets full starting proficiencies
      classData.startingProficiencies.armor.forEach((p) => profSets.armor.add(p));
      classData.startingProficiencies.weapons.forEach((p) => profSets.weapons.add(p));
      classData.startingProficiencies.tools.forEach((p) => profSets.tools.add(p));
    } else {
      // Multiclass dip gets reduced proficiencies
      classData.multiclassProficiencies.armor.forEach((p) => profSets.armor.add(p));
      classData.multiclassProficiencies.weapons.forEach((p) => profSets.weapons.add(p));
      classData.multiclassProficiencies.tools.forEach((p) => profSets.tools.add(p));
    }

    // --- CLASS FEATURES (filtered by class-specific level) ---
    const classLevel = classEntry.level;
    const sourceLabel = `${AUTO_SOURCE_PREFIX} ${classEntry.className}`;

    for (const feature of classData.features) {
      if (feature.level > classLevel) continue;

      // Check non-stacking rules
      if (NON_STACKING_FEATURES.has(feature.name)) {
        if (injectedNonStacking.has(feature.name)) continue;
        injectedNonStacking.add(feature.name);
      }

      allFeatures.push({
        id: `auto-feat-${featIdCounter++}`,
        title: feature.name,
        description: feature.description,
        source: sourceLabel,
        level: feature.level,
      });
    }

    // --- SUBCLASS FEATURES (if subclass is selected and class level is high enough) ---
    if (classEntry.subclass && classData.subclasses[classEntry.subclass]) {
      const subclassData = classData.subclasses[classEntry.subclass];
      const subSourceLabel = `${AUTO_SOURCE_PREFIX} ${classEntry.className} (${classEntry.subclass})`;

      for (const feature of subclassData.features) {
        if (feature.level > classLevel) continue;

        allFeatures.push({
          id: `auto-feat-${featIdCounter++}`,
          title: feature.name,
          description: feature.description,
          source: subSourceLabel,
          level: feature.level,
        });
      }

      // Some subclasses grant extra proficiencies at certain levels
      injectSubclassProficiencies(
        classEntry.className,
        classEntry.subclass,
        classLevel,
        profSets
      );
    }
  }

  return {
    features: allFeatures,
    proficiencies: {
      armor: Array.from(profSets.armor),
      weapons: Array.from(profSets.weapons),
      tools: Array.from(profSets.tools),
      languages: Array.from(profSets.languages),
    },
  };
}

/**
 * Some subclasses grant additional proficiencies (e.g., heavy armor, martial weapons).
 * This function injects them based on subclass selection and class level.
 */
function injectSubclassProficiencies(
  className: string,
  subclass: string,
  classLevel: number,
  profSets: {
    armor: Set<string>;
    weapons: Set<string>;
    tools: Set<string>;
    languages: Set<string>;
  }
): void {
  const key = `${className}::${subclass}`;

  // Cleric domains that grant heavy armor and/or martial weapons
  const heavyArmorClericDomains = [
    'Life Domain', 'Nature Domain', 'Tempest Domain', 'War Domain',
    'Forge Domain', 'Twilight Domain', 'Order Domain',
  ];
  if (className === 'Cleric') {
    if (heavyArmorClericDomains.includes(subclass) && classLevel >= 1) {
      profSets.armor.add('Heavy Armor');
    }
    if (['Tempest Domain', 'War Domain', 'Twilight Domain'].includes(subclass) && classLevel >= 1) {
      profSets.weapons.add('Martial Weapons');
    }
    if (subclass === 'Forge Domain' && classLevel >= 1) {
      profSets.tools.add("Smith's Tools");
    }
  }

  // Bard colleges with combat proficiencies
  if (className === 'Bard') {
    if (subclass === 'College of Valor' && classLevel >= 3) {
      profSets.armor.add('Medium Armor');
      profSets.armor.add('Shields');
      profSets.weapons.add('Martial Weapons');
    }
    if (subclass === 'College of Swords' && classLevel >= 3) {
      profSets.armor.add('Medium Armor');
      profSets.weapons.add('Scimitar');
    }
  }

  // Fighter - Battle Master
  if (key === 'Fighter::Battle Master' && classLevel >= 3) {
    profSets.tools.add("One type of artisan's tools");
  }

  // Rogue Subclasses (Laserllama & Core)
  if (className === 'Rogue' && classLevel >= 3) {
    if (subclass === 'Bloodknife') {
      profSets.languages.add('Abyssal or Infernal');
    } else if (subclass === 'Fencer') {
      profSets.armor.add('Medium Armor');
    } else if (subclass === 'Gambler') {
      profSets.weapons.add('Improvised Weapons');
      profSets.tools.add('Playing Cards');
      profSets.tools.add('Gaming Set of Choice');
    } else if (subclass === 'Saboteur') {
      profSets.tools.add("Alchemist's Supplies");
    } else if (subclass === 'Skinchanger') {
      profSets.languages.add('Druidic');
    } else if (subclass === 'Surgeon') {
      profSets.tools.add("Healer's Kit");
    } else if (subclass === 'Alternate Assassin' || subclass === 'Assassin') {
      profSets.tools.add('Disguise Kit');
      profSets.tools.add("Poisoner's Kit");
    } else if (subclass === 'Mastermind') {
      profSets.tools.add('Disguise Kit');
      profSets.tools.add('Forgery Kit');
    }
  }

  // Wizard - Bladesinging
  if (key === 'Wizard::Bladesinging' && classLevel >= 2) {
    profSets.armor.add('Light Armor');
    profSets.weapons.add('One type of one-handed melee weapon');
  }

  // Artificer - Armorer
  if (key === 'Artificer::Armorer' && classLevel >= 3) {
    profSets.armor.add('Heavy Armor');
    profSets.tools.add("Smith's Tools");
  }

  // Artificer - Battle Smith
  if (key === 'Artificer::Battle Smith' && classLevel >= 3) {
    profSets.weapons.add('Martial Weapons');
    profSets.tools.add("Smith's Tools");
  }

  // Artificer - Artillerist
  if (key === 'Artificer::Artillerist' && classLevel >= 3) {
    profSets.tools.add("Woodcarver's Tools");
  }

  // Artificer - Alchemist
  if (key === 'Artificer::Alchemist' && classLevel >= 3) {
    profSets.tools.add("Alchemist's Supplies");
  }

  // Warlock - Hexblade
  if (key === 'Warlock::The Hexblade' && classLevel >= 1) {
    profSets.armor.add('Medium Armor');
    profSets.armor.add('Shields');
    profSets.weapons.add('Martial Weapons');
  }

  // Monk - Way of Mercy
  if (key === 'Monk::Way of Mercy' && classLevel >= 3) {
    profSets.tools.add('Herbalism Kit');
  }
}

/**
 * Merge auto-injected features/proficiencies with existing manual ones.
 * Removes old auto-injected entries and adds new ones.
 *
 * @param existingFeats - All existing feats (manual + previously auto-injected).
 * @param existingProficiencies - Current proficiency tags.
 * @param injected - Newly computed auto features & proficiencies.
 * @returns Merged feats and proficiencies.
 */
export function mergeInjectedWithManual(
  existingFeats: CustomFeat[],
  existingProficiencies: NonStatProficiencies,
  injected: { features: CustomFeat[]; proficiencies: NonStatProficiencies }
): {
  feats: CustomFeat[];
  proficiencies: NonStatProficiencies;
} {
  // Keep only manually-added feats
  const manualFeats = existingFeats.filter((f) => !isAutoInjectedFeat(f));

  // Merge proficiencies: start with auto-injected, then add manual ones that aren't already included
  const mergedProf: NonStatProficiencies = {
    armor: [...injected.proficiencies.armor],
    weapons: [...injected.proficiencies.weapons],
    tools: [...injected.proficiencies.tools],
    languages: [...injected.proficiencies.languages],
  };

  // Add back any manual proficiency tags that aren't already in the auto-injected set
  for (const category of ['armor', 'weapons', 'tools', 'languages'] as const) {
    const autoSet = new Set(injected.proficiencies[category].map((s) => s.toLowerCase()));
    for (const tag of existingProficiencies[category] || []) {
      if (!autoSet.has(tag.toLowerCase())) {
        mergedProf[category].push(tag);
      }
    }
  }

  return {
    feats: [...injected.features, ...manualFeats],
    proficiencies: mergedProf,
  };
}
