'use client';

import { useCharacter } from './providers';

// Background UI components
import TavernBackground from '@/components/ui/backgrounds/TavernBackground';
import VesperShadowRealm from '@/components/ui/backgrounds/VesperShadowRealm';
import AriaNightSky from '@/components/ui/backgrounds/AriaNightSky';
import CyrusSolarSanctuary from '@/components/ui/backgrounds/CyrusSolarSanctuary';
import WynelScarletSigil from '@/components/ui/backgrounds/WynelScarletSigil';

// Shared UI & Campaign components
import TabNavigation from '@/components/ui/TabNavigation';
import CampaignMainMenu from '@/components/campaign/CampaignMainMenu';
import SyncStatusBadge from '@/components/ui/SyncStatusBadge';
import UnifiedCharacterSheet from '@/components/characters/shared/UnifiedCharacterSheet';

// Signature Character Engines (Anchored per Hero)
import SoulHarvester from '@/components/characters/vesper/SoulHarvester';
import LunarPhaseEngine from '@/components/characters/aria/LunarPhaseEngine';
import CyrusOracleEngine from '@/components/characters/cyrus/CyrusOracleEngine';
import CrimsonTattooEngine from '@/components/characters/wynel/CrimsonTattooEngine';

import type { AriaState } from '@/lib/aria-engine';
import type { CyrusState } from '@/lib/cyrus-engine';
import type { WynelState } from '@/lib/wynel-engine';
import type { CharacterState, AbilityName } from '@/lib/types';
import { getModifier } from '@/lib/character-engine';
import { recalculateForLevel } from '@/lib/persistence';

const ALL_SKILLS_LIST: Array<{ name: import('@/lib/types').SkillName; ability: AbilityName }> = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
];

export default function Home() {
  const {
    activeView,
    activeCharacterId,
    navigateToMenu,
    character,
    activeTab,
    setActiveTab,
    setLevel,
    setCurrentHP,
    setTempHP,
    setSouls,
    longRest,
    setInventory,
    setCurrency,
    setPlayerNotes,
    setJournal,
    setMysteries,
    updateAbilityBaseScore,
    toggleSkillProficiency,
    useVesperSpellSlot,
    restoreVesperSpellSlot,
    addAttack,
    editAttack,
    deleteAttack,
    addSpell,
    editSpell,
    deleteSpell,
    setSpellSlots,
    setSpellSlotMax,
    openMediaPicker,
    getPortraitUrl,
    // Aria state
    aria,
    setAriaLevel,
    setAriaHP,
    setAriaTempHP,
    setAriaLunarPhase,
    setAriaSorceryPoints,
    toggleAriaInnateSorcery,
    useAriaSpellSlot,
    restoreAriaSpellSlot,
    ariaLongRest,
    setAriaInventory,
    setAriaCurrency,
    setAriaNotes,
    // Cyrus state
    cyrus,
    setCyrusLevel,
    setCyrusHP,
    setCyrusTempHP,
    useCyrusSpellSlot,
    restoreCyrusSpellSlot,
    toggleCyrusRadiantSoul,
    useCyrusHealingHands,
    useCyrusEpiphany,
    cyrusLongRest,
    setCyrusInventory,
    setCyrusCurrency,
    setCyrusNotes,
    // Wyn'el state
    wynel,
    setWynelLevel,
    setWynelHP,
    setWynelTempHP,
    useWynelPactSlot,
    restoreWynelPactSlot,
    wynelShortRest,
    wynelLongRest,
    toggleWynelFeyPresence,
    toggleWynelCrimsonPulse,
    toggleWynelChaosAura,
    setWynelInventory,
    setWynelCurrency,
    setWynelNotes,
    setWynelJournal,
    setWynelMysteries,
    // Multiclass & Levels
    setClasses,
    // Custom Characters
    customCharacters,
    customThemes,
    updateCustomCharacter,
    isLoaded,
  } = useCharacter();

  // Loading skeleton during hydration
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[var(--color-gold-700)] border-t-[var(--color-gold-bright)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-[family-name:var(--font-heading)] text-[var(--color-parchment-dim)] uppercase tracking-widest">
            Loading Campaign Suite...
          </p>
        </div>
      </div>
    );
  }

  const isVesper = activeCharacterId === 'vesper';
  const isCyrus = activeCharacterId === 'cyrus';
  const isWynel = activeCharacterId === 'wynel';
  const isAria = activeCharacterId === 'aria';
  const isCustom = !isVesper && !isCyrus && !isWynel && !isAria;

  // Map AriaState to CharacterState
  const mapAriaToCharacterState = (ariaState: AriaState): CharacterState => {
    const prof = Math.floor((ariaState.level - 1) / 4) + 2;
    const makeScore = (name: AbilityName, base: number) => {
      const mod = getModifier(base);
      const isProf = ariaState.savingThrowProficiencies.includes(name);
      return {
        name,
        label: name,
        base,
        modifier: mod,
        total: base,
        saveProficient: isProf,
        saveBonus: mod + (isProf ? prof : 0),
      };
    };

    return {
      name: ariaState.name,
      alias: ariaState.subline,
      race: ariaState.race,
      class: ariaState.characterClass,
      subclass: ariaState.subclass,
      level: ariaState.level,
      background: ariaState.background,
      alignment: ariaState.alignment,
      experience: 64000,
      proficiencyBonus: prof,
      abilityScores: {
        STR: makeScore('STR', ariaState.abilityScores.STR),
        DEX: makeScore('DEX', ariaState.abilityScores.DEX),
        CON: makeScore('CON', ariaState.abilityScores.CON),
        INT: makeScore('INT', ariaState.abilityScores.INT),
        WIS: makeScore('WIS', ariaState.abilityScores.WIS),
        CHA: makeScore('CHA', ariaState.abilityScores.CHA),
      },
      skills: ALL_SKILLS_LIST.map((def) => {
        const found = ariaState.skills?.find((s) => s.name === def.name);
        const proficient = found ? found.proficient : ['Arcana', 'History', 'Insight', 'Persuasion'].includes(def.name);
        const expertise = found ? found.expertise : def.name === 'Arcana';
        const abilityMod = getModifier(ariaState.abilityScores[def.ability]);
        let bonus = abilityMod;
        if (expertise) bonus += prof * 2;
        else if (proficient) bonus += prof;
        return { name: def.name, ability: def.ability, proficient, expertise, bonus };
      }),
      classes: ariaState.classes && ariaState.classes.length > 0
        ? ariaState.classes
        : [{ className: ariaState.characterClass, subclass: ariaState.subclass, level: ariaState.level, hitDice: 'd6' }],
      attacks: ariaState.attacks || [
        {
          id: 'atk-lunar-bolt',
          name: 'Lunar Ray (Fire Bolt)',
          attackBonus: prof + getModifier(ariaState.abilityScores.CHA),
          damage: '2d10',
          damageType: 'Radiant',
          range: '120 ft',
          notes: 'Silver moonlight beam (Evocation Cantrip)',
          equipped: true,
        },
        {
          id: 'atk-starlight-dagger',
          name: 'Starlight Silver Dagger',
          attackBonus: prof + getModifier(ariaState.abilityScores.DEX),
          damage: '1d4 + 2',
          damageType: 'Piercing',
          range: '20/60 ft',
          notes: 'Finesse, Light',
          equipped: true,
        },
      ],
      spellcasting: {
        spellSaveDC: ariaState.spellcasting.spellSaveDC,
        spellAttackBonus: ariaState.spellcasting.spellAttackBonus,
        slots: ariaState.spellcasting.slots,
        spells: ariaState.spellcasting.spells.map((s) => ({ ...s, prepared: true })),
      },
      feats: ariaState.feats || [
        {
          id: 'feat-innate-sorcery',
          title: 'Innate Sorcery',
          description: 'An event or cosmic lineage unleashes raw starlight magic. Advantage on sorcerer spell attacks.',
          source: 'Sorcerer Class Feature',
          level: 1,
        },
        {
          id: 'feat-lunar-embodiment',
          title: 'Lunar Embodiment',
          description: 'You can align your soul with the phases of the moon to alter your magical affinity.',
          source: 'Lunar Sorcery',
          level: 3,
        },
      ],
      proficiencies: ariaState.proficiencies || {
        armor: ['Robes'],
        weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'],
        tools: ['Celestial Weaving Tools'],
        languages: ['Common', 'Elvish', 'Celestial'],
      },
      overrides: ariaState.overrides,
      ac: ariaState.overrides?.ac ?? ariaState.combat.ac,
      initiative: ariaState.overrides?.initiative ?? ariaState.combat.initiative,
      speed: ariaState.overrides?.speed ?? ariaState.combat.speed,
      passivePerception: 11,
      combat: {
        currentHP: ariaState.combat.currentHP,
        maxHP: ariaState.combat.maxHP,
        tempHP: ariaState.combat.tempHP,
        hitDice: { total: ariaState.level, used: 0, diceType: 'd6' },
        deathSaves: ariaState.combat.deathSaves,
        conditions: [],
      },
      sneakAttackDice: 0,
      inventory: ariaState.inventory,
      currency: ariaState.currency,
      orphansTithe: {
        currentSouls: 0,
        vestigeStage: 'dormant',
        phantomMurmursActive: false,
        altarTraumaActive: false,
      },
      dossier: {
        backstory: {
          orphanageMassacre: ariaState.notes,
          fatherMalachi: 'Bonds of Celestial Weaving: Connected to the Silver Moon council.',
          apprenticeApothecary: 'Mastery over herbal and astral rearguard alchemy.',
          guildScoutVincent: "Allied with Vesper Ashwood during the Baldur's Gate infiltration.",
          bossDexter: 'Neutral status with the Shadow Guilds.',
        },
        mysteries: ariaState.mysteries,
        journal: ariaState.journal,
        playerNotes: ariaState.notes,
      },
      version: 1,
      lastSaved: new Date().toISOString(),
    };
  };

  // Map CyrusState to CharacterState
  const mapCyrusToCharacterState = (cyrusState: CyrusState): CharacterState => {
    const prof = Math.floor((cyrusState.level - 1) / 4) + 2;
    const makeScore = (name: AbilityName, base: number) => {
      const mod = getModifier(base);
      const isProf = cyrusState.savingThrowProficiencies.includes(name);
      return {
        name,
        label: name,
        base,
        modifier: mod,
        total: base,
        saveProficient: isProf,
        saveBonus: mod + (isProf ? prof : 0),
      };
    };

    return {
      name: cyrusState.name,
      alias: cyrusState.subline,
      race: cyrusState.race,
      class: cyrusState.characterClass,
      subclass: cyrusState.subclass,
      level: cyrusState.level,
      background: cyrusState.background,
      alignment: cyrusState.alignment,
      experience: 65000,
      classes: cyrusState.classes && cyrusState.classes.length > 0
        ? cyrusState.classes
        : [{ className: cyrusState.characterClass, subclass: cyrusState.subclass, level: cyrusState.level, hitDice: 'd8' }],
      attacks: cyrusState.attacks || [
        {
          id: 'atk-sun-mace',
          name: 'Sunstone Mace of Apollo',
          attackBonus: prof + getModifier(cyrusState.abilityScores.STR),
          damage: '1d6 + 2',
          damageType: 'Bludgeoning',
          range: 'Melee (5 ft)',
          notes: 'Gleams with radiant sunlight',
          equipped: true,
        },
        {
          id: 'atk-sacred-flame',
          name: 'Sacred Flame',
          attackBonus: prof + getModifier(cyrusState.abilityScores.WIS),
          damage: '2d8',
          damageType: 'Radiant',
          range: '60 ft',
          notes: 'Target makes DEX save DC ' + (8 + prof + getModifier(cyrusState.abilityScores.WIS)),
          equipped: true,
        },
      ],
      spellcasting: {
        spellSaveDC: cyrusState.spellcasting.spellSaveDC,
        spellAttackBonus: cyrusState.spellcasting.spellAttackBonus,
        slots: cyrusState.spellcasting.slots,
        spells: cyrusState.spellcasting.spells.map((s) => ({ ...s, prepared: true })),
      },
      feats: cyrusState.feats || [
        {
          id: 'feat-radiant-soul',
          title: 'Radiant Soul',
          description: 'Luminous wings sprout from your back for 1 minute. You gain a flying speed and deal bonus radiant damage.',
          source: 'Protector Aasimar',
          level: 3,
        },
        {
          id: 'feat-healing-hands',
          title: 'Healing Hands',
          description: 'As an action, touch a creature to restore hit points equal to your level.',
          source: 'Protector Aasimar',
          level: 1,
        },
      ],
      proficiencies: cyrusState.proficiencies || {
        armor: ['Light', 'Medium', 'Shields'],
        weapons: ['Simple Weapons'],
        tools: ['Herbalism Kit'],
        languages: ['Common', 'Celestial', 'Greek'],
      },
      overrides: cyrusState.overrides,
      proficiencyBonus: prof,
      abilityScores: {
        STR: makeScore('STR', cyrusState.abilityScores.STR),
        DEX: makeScore('DEX', cyrusState.abilityScores.DEX),
        CON: makeScore('CON', cyrusState.abilityScores.CON),
        INT: makeScore('INT', cyrusState.abilityScores.INT),
        WIS: makeScore('WIS', cyrusState.abilityScores.WIS),
        CHA: makeScore('CHA', cyrusState.abilityScores.CHA),
      },
      skills: ALL_SKILLS_LIST.map((def) => {
        const found = cyrusState.skills?.find((s) => s.name === def.name);
        const proficient = found
          ? found.proficient
          : (cyrusState.skillProficiencies ? cyrusState.skillProficiencies.includes(def.name) : ['Religion', 'Insight', 'Medicine', 'History'].includes(def.name));
        const expertise = found ? found.expertise : false;
        const abilityMod = getModifier(cyrusState.abilityScores[def.ability]);
        let bonus = abilityMod;
        if (expertise) bonus += prof * 2;
        else if (proficient) bonus += prof;
        return { name: def.name, ability: def.ability, proficient, expertise, bonus };
      }),
      ac: cyrusState.overrides?.ac ?? cyrusState.combat.ac,
      initiative: cyrusState.overrides?.initiative ?? cyrusState.combat.initiative,
      speed: cyrusState.overrides?.speed ?? cyrusState.combat.speed,
      passivePerception: 15,
      combat: {
        currentHP: cyrusState.combat.currentHP,
        maxHP: cyrusState.combat.maxHP,
        tempHP: cyrusState.combat.tempHP,
        hitDice: { total: cyrusState.level, used: 0, diceType: 'd8' },
        deathSaves: cyrusState.combat.deathSaves,
        conditions: [],
      },
      sneakAttackDice: 0,
      inventory: cyrusState.inventory,
      currency: cyrusState.currency,
      orphansTithe: {
        currentSouls: 0,
        vestigeStage: 'dormant',
        phantomMurmursActive: false,
        altarTraumaActive: false,
      },
      dossier: {
        backstory: {
          orphanageMassacre: cyrusState.notes,
          fatherMalachi: 'Oracle Temple Priest of Apollo',
          apprenticeApothecary: 'Greek Divination & Solar Herbcraft',
          guildScoutVincent: 'Allied with Vesper & Aria',
          bossDexter: 'Neutral',
        },
        mysteries: [],
        journal: [],
        playerNotes: cyrusState.notes,
      },
      version: 1,
      lastSaved: new Date().toISOString(),
    };
  };

  // Map WynelState to CharacterState
  const mapWynelToCharacterState = (wynelState: WynelState): CharacterState => {
    const prof = Math.floor((wynelState.level - 1) / 4) + 2;
    const makeScore = (name: AbilityName, base: number) => {
      const mod = getModifier(base);
      const isProf = wynelState.savingThrowProficiencies.includes(name);
      return {
        name,
        label: name,
        base,
        modifier: mod,
        total: base,
        saveProficient: isProf,
        saveBonus: mod + (isProf ? prof : 0),
      };
    };

    return {
      name: wynelState.name,
      alias: wynelState.title,
      race: wynelState.race,
      class: wynelState.characterClass,
      subclass: wynelState.subclass,
      level: wynelState.level,
      background: wynelState.background,
      alignment: wynelState.alignment,
      experience: 900,
      classes: wynelState.classes && wynelState.classes.length > 0
        ? wynelState.classes
        : [{ className: wynelState.characterClass, subclass: wynelState.subclass, level: wynelState.level, hitDice: 'd8' }],
      attacks: (wynelState.attacks && wynelState.attacks.length > 0)
        ? wynelState.attacks
        : [
            {
              id: 'atk-rapier',
              name: 'Aeluin Ceremonial Rapier',
              attackBonus: 4,
              damage: '1d8 + 2',
              damageType: 'Piercing',
              range: 'Melee (5 ft)',
              notes: 'Finesse. Royal heirloom of House Aeluin.',
              equipped: true,
            },
            {
              id: 'atk-eldritch-blast',
              name: 'Eldritch Blast (Chaos Bolt)',
              attackBonus: 5,
              damage: '1d10 + 3',
              damageType: 'Force',
              range: '120 ft',
              notes: 'Agonizing Blast (+3 CHA). Reality-warping scarlet chaos beam.',
              equipped: true,
            },
            {
              id: 'atk-dagger',
              name: 'Concealed Dagger',
              attackBonus: 4,
              damage: '1d4 + 2',
              damageType: 'Piercing',
              range: '20/60 ft',
              notes: 'Finesse, Light, Thrown.',
              equipped: true,
            },
          ],
      spellcasting: {
        spellSaveDC: wynelState.spellcasting.spellSaveDC,
        spellAttackBonus: wynelState.spellcasting.spellAttackBonus,
        slots: { [wynelState.pactEngine.slotLevel]: { max: wynelState.pactEngine.slotsMax, used: wynelState.pactEngine.slotsUsed } },
        spells: wynelState.spellcasting.spells.map((s) => ({
          id: s.id,
          name: s.name,
          level: s.level,
          school: s.school,
          castingTime: s.castingTime,
          range: s.range,
          components: s.components,
          duration: s.duration,
          description: s.description,
          damageDice: s.damageDice,
          prepared: true,
        })),
      },
      feats: [
        ...wynelState.features.map((f) => ({
          id: `feat-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: f.name,
          source: f.source,
          description: f.description,
          level: 1,
        })),
        ...wynelState.invocations.map((inv) => ({
          id: `inv-${inv.id}`,
          title: `Invocation: ${inv.name}`,
          source: 'Warlock Invocation',
          description: inv.description,
          level: 2,
        })),
        ...(wynelState.feats || []),
      ],
      proficiencies: wynelState.proficiencies || {
        armor: ['Light Armor'],
        weapons: ['Simple Weapons'],
        tools: ['Dice Set', 'Disguise Kit'],
        languages: ['Common', 'Elvish', 'Sylvan'],
      },
      overrides: wynelState.overrides,
      proficiencyBonus: prof,
      abilityScores: {
        STR: makeScore('STR', wynelState.abilityScores.STR),
        DEX: makeScore('DEX', wynelState.abilityScores.DEX),
        CON: makeScore('CON', wynelState.abilityScores.CON),
        INT: makeScore('INT', wynelState.abilityScores.INT),
        WIS: makeScore('WIS', wynelState.abilityScores.WIS),
        CHA: makeScore('CHA', wynelState.abilityScores.CHA),
      },
      skills: ALL_SKILLS_LIST.map((def) => {
        const proficient = wynelState.skillProficiencies.includes(def.name);
        const abilityMod = getModifier(wynelState.abilityScores[def.ability]);
        let bonus = abilityMod + (proficient ? prof : 0);
        return { name: def.name, ability: def.ability, proficient, expertise: false, bonus };
      }),
      ac: wynelState.overrides?.ac ?? wynelState.combat.ac,
      initiative: wynelState.overrides?.initiative ?? wynelState.combat.initiative,
      speed: wynelState.overrides?.speed ?? wynelState.combat.speed,
      passivePerception: 10 + getModifier(wynelState.abilityScores.WIS) + (wynelState.skillProficiencies.includes('Perception') ? prof : 0),
      combat: {
        currentHP: wynelState.combat.currentHP,
        maxHP: wynelState.combat.maxHP,
        tempHP: wynelState.combat.tempHP,
        hitDice: { total: wynelState.level, used: wynelState.combat.hitDice.used, diceType: 'd8' },
        deathSaves: wynelState.combat.deathSaves,
        conditions: [],
      },
      sneakAttackDice: 0,
      inventory: wynelState.inventory,
      currency: wynelState.currency,
      orphansTithe: {
        currentSouls: 0,
        vestigeStage: 'dormant',
        phantomMurmursActive: false,
        altarTraumaActive: false,
      },
      dossier: {
        backstory: {
          orphanageMassacre: wynelState.notes,
          fatherMalachi: 'House Aeluin Noble Archives',
          apprenticeApothecary: "Mother's fused grimoire",
          guildScoutVincent: 'Allied party member',
          bossDexter: 'Neutral',
        },
        mysteries: wynelState.mysteries,
        journal: wynelState.journal,
        playerNotes: wynelState.notes,
      },
      version: 1,
      lastSaved: new Date().toISOString(),
    };
  };

  // Resolve Active Character State & Anchored Theme
  const activeCharState: CharacterState = isVesper
    ? character
    : isCyrus
    ? mapCyrusToCharacterState(cyrus)
    : isWynel
    ? mapWynelToCharacterState(wynel)
    : isAria
    ? mapAriaToCharacterState(aria)
    : (customCharacters[activeCharacterId] || character);

  const activeTheme = isVesper
    ? { primary: '#dc2626', accent: '#ffd700', portraitUrl: getPortraitUrl('vesper') }
    : isAria
    ? { primary: '#a992e8', accent: '#d9b872', portraitUrl: getPortraitUrl('aria') }
    : isCyrus
    ? { primary: '#eab308', accent: '#fbbf24', portraitUrl: getPortraitUrl('cyrus') }
    : isWynel
    ? { primary: '#ef4444', accent: '#f43f5e', portraitUrl: getPortraitUrl('wynel') }
    : (customThemes[activeCharacterId] || { primary: '#3b82f6', accent: '#38bdf8', portraitUrl: '/vesper-portrait.png' });

  // Resolve Anchored Signature Tab Component
  const signatureTabConfig = isVesper
    ? {
        id: 'artifact',
        label: "Soul Harvester",
        component: (
          <SoulHarvester
            character={character}
            onSoulsChange={setSouls}
            onLongRest={longRest}
          />
        ),
      }
    : isAria
    ? {
        id: 'artifact',
        label: "Lunar Tides",
        component: (
          <LunarPhaseEngine
            aria={aria}
            onPhaseChange={setAriaLunarPhase}
            onSorceryPointsChange={setAriaSorceryPoints}
            onToggleInnateSorcery={toggleAriaInnateSorcery}
            onLongRest={ariaLongRest}
          />
        ),
      }
    : isCyrus
    ? {
        id: 'artifact',
        label: "Solar Engine",
        component: (
          <CyrusOracleEngine
            cyrus={cyrus}
            onToggleRadiantSoul={toggleCyrusRadiantSoul}
            onUseHealingHands={useCyrusHealingHands}
            onUseEpiphany={useCyrusEpiphany}
            onUseSpellSlot={useCyrusSpellSlot}
            onRestoreSpellSlot={restoreCyrusSpellSlot}
            onLongRest={cyrusLongRest}
          />
        ),
      }
    : isWynel
    ? {
        id: 'artifact',
        label: "Crimson Tattoo",
        component: (
          <CrimsonTattooEngine
            wynel={wynel}
            onUsePactSlot={useWynelPactSlot}
            onRestorePactSlot={restoreWynelPactSlot}
            onShortRest={wynelShortRest}
            onLongRest={wynelLongRest}
            onToggleFeyPresence={toggleWynelFeyPresence}
            onToggleCrimsonPulse={toggleWynelCrimsonPulse}
            onToggleChaosAura={toggleWynelChaosAura}
          />
        ),
      }
    : undefined;

  // Unified Callback Handlers
  const handleLevelChange = (lvl: number) => {
    if (isVesper) setLevel(lvl);
    else if (isAria) setAriaLevel(lvl);
    else if (isCyrus) setCyrusLevel(lvl);
    else if (isWynel) setWynelLevel(lvl);
    else updateCustomCharacter(activeCharacterId, (prev) => recalculateForLevel(prev, lvl));
  };

  const handleHPChange = (hp: number) => {
    if (isVesper) setCurrentHP(hp);
    else if (isAria) setAriaHP(hp);
    else if (isCyrus) setCyrusHP(hp);
    else if (isWynel) setWynelHP(hp);
    else updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, combat: { ...prev.combat, currentHP: hp } }));
  };

  const handleTempHPChange = (thp: number) => {
    if (isVesper) setTempHP(thp);
    else if (isAria) setAriaTempHP(thp);
    else if (isCyrus) setCyrusTempHP(thp);
    else if (isWynel) setWynelTempHP(thp);
    else updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, combat: { ...prev.combat, tempHP: thp } }));
  };

  const handleShortRest = () => {
    if (isWynel) wynelShortRest();
    else if (isVesper) {
      setCurrentHP(Math.min(character.combat.maxHP, character.combat.currentHP + 10));
    } else if (isCustom) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        combat: { ...prev.combat, currentHP: Math.min(prev.combat.maxHP, prev.combat.currentHP + 10) },
      }));
    }
  };

  const handleLongRest = () => {
    if (isVesper) longRest();
    else if (isAria) ariaLongRest();
    else if (isCyrus) cyrusLongRest();
    else if (isWynel) wynelLongRest();
    else {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        combat: { ...prev.combat, currentHP: prev.combat.maxHP, tempHP: 0 },
      }));
    }
  };

  const handleInventoryChange = (inv: any[]) => {
    if (isVesper) setInventory(inv);
    else if (isAria) setAriaInventory(inv);
    else if (isCyrus) setCyrusInventory(inv);
    else if (isWynel) setWynelInventory(inv);
    else updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, inventory: inv }));
  };

  const handleCurrencyChange = (curr: any) => {
    if (isVesper) setCurrency(curr);
    else if (isAria) setAriaCurrency(curr);
    else if (isCyrus) setCyrusCurrency(curr);
    else if (isWynel) setWynelCurrency(curr);
    else updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, currency: curr }));
  };

  const handleNotesChange = (notes: string) => {
    if (isVesper) setPlayerNotes(notes);
    else if (isAria) setAriaNotes(notes);
    else if (isCyrus) setCyrusNotes(notes);
    else if (isWynel) setWynelNotes(notes);
    else updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, dossier: { ...prev.dossier, playerNotes: notes } }));
  };

  const handleUseSpellSlot = (lvl: number) => {
    if (isVesper) useVesperSpellSlot(lvl);
    else if (isAria) useAriaSpellSlot(lvl);
    else if (isCyrus) useCyrusSpellSlot(lvl);
    else if (isWynel) useWynelPactSlot();
    else {
      updateCustomCharacter(activeCharacterId, (prev) => {
        const slot = prev.spellcasting.slots[lvl];
        if (!slot || slot.used >= slot.max) return prev;
        return {
          ...prev,
          spellcasting: {
            ...prev.spellcasting,
            slots: {
              ...prev.spellcasting.slots,
              [lvl]: { ...slot, used: slot.used + 1 },
            },
          },
        };
      });
    }
  };

  const handleRestoreSpellSlot = (lvl: number) => {
    if (isVesper) restoreVesperSpellSlot(lvl);
    else if (isAria) restoreAriaSpellSlot(lvl);
    else if (isCyrus) restoreCyrusSpellSlot(lvl);
    else if (isWynel) restoreWynelPactSlot();
    else {
      updateCustomCharacter(activeCharacterId, (prev) => {
        const slot = prev.spellcasting.slots[lvl];
        if (!slot || slot.used <= 0) return prev;
        return {
          ...prev,
          spellcasting: {
            ...prev.spellcasting,
            slots: {
              ...prev.spellcasting.slots,
              [lvl]: { ...slot, used: slot.used - 1 },
            },
          },
        };
      });
    }
  };

  return (
    <>
      {/* Dynamic Background Canvas per Character */}
      {activeView === 'menu' ? (
        <TavernBackground />
      ) : isVesper ? (
        <VesperShadowRealm
          currentSouls={character.orphansTithe.currentSouls}
          vestigeStage={character.orphansTithe.vestigeStage}
        />
      ) : isCyrus ? (
        <CyrusSolarSanctuary radiantActive={cyrus.oracleEngine.radiantSoulActive} />
      ) : isWynel ? (
        <WynelScarletSigil chaosAuraActive={wynel.pactEngine.chaosAuraActive} />
      ) : isAria ? (
        <AriaNightSky currentPhase={aria.lunarEngine.currentPhase} />
      ) : (
        <TavernBackground />
      )}

      {/* Global Real-Time Sync & Navigation Top Bar */}
      <header className="sticky top-0 z-40 bg-[#08090d]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-1.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {activeView === 'character' ? (
              <button
                onClick={navigateToMenu}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 text-xs font-mono font-medium transition-colors cursor-pointer shadow-xs"
              >
                <span>&larr;</span>
                <span>Guildhall</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200/90 font-serif">
                <span>🏰</span>
                <span>The Ashen Pact</span>
              </div>
            )}
            <span className="text-zinc-600 text-xs hidden sm:inline">&bull;</span>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              {activeView === 'menu' ? 'Campaign Hub' : activeCharState.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SyncStatusBadge />
          </div>
        </div>
      </header>

      {activeView === 'character' && (
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 flex-1">
        {/* VIEW 1: CAMPAIGN MAIN MENU */}
        {activeView === 'menu' ? (
          <CampaignMainMenu />
        ) : (
          /* VIEW 2: UNIFIED CHARACTER SHEET (D&D BEYOND-STYLE ARCHITECTURE) */
          <div className="animate-fade-in-up">
            <UnifiedCharacterSheet
              character={activeCharState}
              activeTab={activeTab}
              primaryColor={activeTheme.primary}
              accentColor={activeTheme.accent}
              portraitUrl={activeTheme.portraitUrl}
              signatureTab={signatureTabConfig}
              onLevelChange={handleLevelChange}
              onSaveClasses={setClasses}
              onHPChange={handleHPChange}
              onTempHPChange={handleTempHPChange}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
              onInventoryChange={handleInventoryChange}
              onCurrencyChange={handleCurrencyChange}
              onNotesChange={handleNotesChange}
              onJournalChange={isVesper ? setJournal : isWynel ? setWynelJournal : undefined}
              onMysteriesChange={isVesper ? setMysteries : isWynel ? setWynelMysteries : undefined}
              onAbilityBaseScoreChange={updateAbilityBaseScore}
              onToggleSkillProficiency={toggleSkillProficiency}
              onUseSpellSlot={handleUseSpellSlot}
              onRestoreSpellSlot={handleRestoreSpellSlot}
              onUpdateSpellSlots={setSpellSlots}
              onAddSpell={addSpell}
              onEditSpell={editSpell}
              onDeleteSpell={deleteSpell}
              onAddAttack={addAttack}
              onEditAttack={editAttack}
              onDeleteAttack={deleteAttack}
              onOpenMediaPicker={() => openMediaPicker('portraits', activeCharacterId)}
            />
          </div>
        )}

        {/* Campaign Footer */}
        <footer className="mt-12 pb-6 text-center">
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold-700)] to-transparent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
            The Ashen Pact &bull; D&amp;D 5e Interactive Campaign Hub
          </p>
        </footer>
      </main>
    </>
  );
}
