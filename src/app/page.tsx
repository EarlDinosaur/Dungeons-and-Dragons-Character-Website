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
import InventoryManager from '@/components/shared/InventoryManager';
import SyncStatusBadge from '@/components/ui/SyncStatusBadge';

// Vesper Ashwood components
import CharacterHeader from '@/components/characters/vesper/CharacterHeader';
import StatBlock from '@/components/characters/vesper/StatBlock';
import CombatActions from '@/components/characters/vesper/CombatActions';
import SpellbookPanelVesper from '@/components/characters/vesper/SpellbookPanelVesper';
import ProgressionPanel from '@/components/characters/vesper/ProgressionPanel';
import SoulHarvester from '@/components/characters/vesper/SoulHarvester';
import Dossier from '@/components/characters/vesper/Dossier';

// Aria Sil'aveth components
import AriaHeader from '@/components/characters/aria/AriaHeader';
import AriaStatBlock from '@/components/characters/aria/AriaStatBlock';
import LunarPhaseEngine from '@/components/characters/aria/LunarPhaseEngine';
import SpellbookPanel from '@/components/characters/aria/SpellbookPanel';
import AriaGrimoire from '@/components/characters/aria/AriaGrimoire';

// Cyrus Hyacinthus components
import CyrusHeader from '@/components/characters/cyrus/CyrusHeader';
import CyrusStatBlock from '@/components/characters/cyrus/CyrusStatBlock';
import CyrusOracleEngine from '@/components/characters/cyrus/CyrusOracleEngine';
import CyrusGrimoire from '@/components/characters/cyrus/CyrusGrimoire';
import CyrusSpellbookPanel from '@/components/characters/cyrus/CyrusSpellbookPanel';

// Wyn'el Aeluin components
import WynelHeader from '@/components/characters/wynel/WynelHeader';
import WynelStatBlock from '@/components/characters/wynel/WynelStatBlock';
import CrimsonTattooEngine from '@/components/characters/wynel/CrimsonTattooEngine';
import WynelSpellbookPanel from '@/components/characters/wynel/WynelSpellbookPanel';
import WynelGrimoire from '@/components/characters/wynel/WynelGrimoire';

import type { AriaState } from '@/lib/aria-engine';
import type { CyrusState } from '@/lib/cyrus-engine';
import type { WynelState } from '@/lib/wynel-engine';
import type { CharacterState, AbilityName } from '@/lib/types';
import { getModifier } from '@/lib/character-engine';

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
    isLoaded,
  } = useCharacter();

  // Show loading skeleton during hydration
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

  // Helper to map AriaState into a CharacterState interface for shared components like InventoryManager
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
      attacks: ariaState.attacks || [],
      spellcasting: {
        spellSaveDC: ariaState.spellcasting.spellSaveDC,
        spellAttackBonus: ariaState.spellcasting.spellAttackBonus,
        slots: ariaState.spellcasting.slots,
        spells: ariaState.spellcasting.spells.map(s => ({ ...s, prepared: true })),
      },
      feats: ariaState.feats || [],
      proficiencies: ariaState.proficiencies || { armor: ['Robes'], weapons: ['Daggers', 'Staves'], tools: ['Celestial Weaving Tools'], languages: ['Common', 'Elvish', 'Celestial'] },
      overrides: ariaState.overrides,
      ac: ariaState.overrides?.ac ?? ariaState.combat.ac,
      initiative: ariaState.overrides?.initiative ?? ariaState.combat.initiative,
      speed: ariaState.overrides?.speed ?? ariaState.combat.speed,
      passivePerception: 11,
      combat: {
        currentHP: ariaState.combat.currentHP,
        maxHP: ariaState.combat.maxHP,
        tempHP: ariaState.combat.tempHP,
        hitDice: { total: ariaState.level, used: 0 },
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
          guildScoutVincent: 'Allied with Vesper Ashwood during the Baldur\'s Gate infiltration.',
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

  // Helper to map CyrusState into a CharacterState interface for shared components like InventoryManager
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
      experience: 6500,
      classes: cyrusState.classes && cyrusState.classes.length > 0
        ? cyrusState.classes
        : [{ className: cyrusState.characterClass, subclass: cyrusState.subclass, level: cyrusState.level, hitDice: 'd8' }],
      attacks: cyrusState.attacks || [],
      spellcasting: {
        spellSaveDC: cyrusState.spellcasting.spellSaveDC,
        spellAttackBonus: cyrusState.spellcasting.spellAttackBonus,
        slots: cyrusState.spellcasting.slots,
        spells: cyrusState.spellcasting.spells.map(s => ({ ...s, prepared: true })),
      },
      feats: cyrusState.feats || [],
      proficiencies: cyrusState.proficiencies || { armor: ['Light', 'Medium', 'Heavy', 'Shields'], weapons: ['Simple', 'Martial'], tools: ['Herbalism Kit'], languages: ['Common', 'Celestial', 'Greek'] },
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
        const proficient = found ? found.proficient : (cyrusState.skillProficiencies ? cyrusState.skillProficiencies.includes(def.name) : ['Religion', 'Insight', 'Medicine', 'History'].includes(def.name));
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
        hitDice: { total: cyrusState.level, used: 0 },
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
        ...wynelState.features.map(f => ({
          id: `feat-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: f.name,
          source: f.source,
          description: f.description,
          level: 1,
        })),
        ...wynelState.invocations.map(inv => ({
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
        hitDice: { total: wynelState.level, used: wynelState.combat.hitDice.used },
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

  const ariaCharState = mapAriaToCharacterState(aria);
  const cyrusCharState = mapCyrusToCharacterState(cyrus);
  const wynelCharState = mapWynelToCharacterState(wynel);

  return (
    <>
      {/* Dynamic Background Effect per View & Character */}
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
      ) : (
        <AriaNightSky currentPhase={aria.lunarEngine.currentPhase} />
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
              {activeView === 'menu'
                ? 'Campaign Hub'
                : isVesper
                ? 'Vesper Ashwood'
                : isCyrus
                ? 'Cyrus Hyacinthus'
                : isWynel
                ? "Wyn'el Aeluin"
                : "Aria Sil'aveth"}
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
          /* VIEW 2: CHARACTER SHEET WORKSPACE */
          <>
            {/* Earl (Vesper Ashwood) Dashboard */}
            {isVesper ? (
              <>
                <div className="mb-6">
                  <CharacterHeader
                    character={character}
                    onLevelChange={setLevel}
                    onHPChange={setCurrentHP}
                    onTempHPChange={setTempHP}
                  />
                </div>

                <div className="animate-fade-in-up" key={`vesper-${activeTab}`}>
                  {activeTab === 'character' && (
                    <StatBlock character={character} />
                  )}

                  {activeTab === 'combat' && (
                    <CombatActions character={character} />
                  )}

                  {activeTab === 'spells' && (
                    <SpellbookPanelVesper character={character} />
                  )}

                  {activeTab === 'progression' && (
                    <ProgressionPanel character={character} />
                  )}

                  {activeTab === 'inventory' && (
                    <InventoryManager
                      character={character}
                      onInventoryChange={setInventory}
                      onCurrencyChange={setCurrency}
                    />
                  )}

                  {activeTab === 'artifact' && (
                    <SoulHarvester
                      character={character}
                      onSoulsChange={setSouls}
                      onLongRest={longRest}
                    />
                  )}

                  {activeTab === 'dossier' && (
                    <Dossier
                      character={character}
                      onNotesChange={setPlayerNotes}
                      onJournalChange={setJournal}
                      onMysteriesChange={setMysteries}
                    />
                  )}
                </div>
              </>
            ) : isCyrus ? (
              /* Cyrus Hyacinthus Dashboard (Greek Oracle & Solar Light Cleric) */
              <>
                <div className="mb-6">
                  <CyrusHeader
                    cyrus={cyrus}
                    onLevelChange={setCyrusLevel}
                    onHPChange={setCyrusHP}
                    onTempHPChange={setCyrusTempHP}
                  />
                </div>

                <div className="animate-fade-in-up" key={`cyrus-${activeTab}`}>
                  {/* TAB 1: ORACLE SHEET */}
                  {activeTab === 'character' && (
                    <CyrusStatBlock cyrus={cyrus} />
                  )}

                  {/* TAB 2: COMBAT & DOMAIN SPELLS */}
                  {activeTab === 'combat' && (
                    <div className="space-y-6">
                      <CombatActions character={cyrusCharState} />
                      <CyrusSpellbookPanel
                        cyrus={cyrus}
                        onUseSlot={useCyrusSpellSlot}
                        onRestoreSlot={restoreCyrusSpellSlot}
                        onLongRest={cyrusLongRest}
                      />
                    </div>
                  )}

                  {/* TAB 3: SOLAR ENGINE (Radiant Soul & Channel Divinity) */}
                  {activeTab === 'artifact' && (
                    <CyrusOracleEngine
                      cyrus={cyrus}
                      onToggleRadiantSoul={toggleCyrusRadiantSoul}
                      onUseHealingHands={useCyrusHealingHands}
                      onUseEpiphany={useCyrusEpiphany}
                      onUseSpellSlot={useCyrusSpellSlot}
                      onRestoreSpellSlot={restoreCyrusSpellSlot}
                      onLongRest={cyrusLongRest}
                    />
                  )}

                  {/* TAB 4: EQUIPMENT */}
                  {activeTab === 'inventory' && (
                    <InventoryManager
                      character={cyrusCharState}
                      onInventoryChange={setCyrusInventory}
                      onCurrencyChange={setCyrusCurrency}
                    />
                  )}

                  {/* TAB 5: PROPHECIES & DOSSIER */}
                  {activeTab === 'dossier' && (
                    <CyrusGrimoire
                      cyrus={cyrus}
                      onNotesChange={setCyrusNotes}
                    />
                  )}

                  {/* TAB 6: FEATS & PROGRESSION */}
                  {activeTab === 'progression' && (
                    <ProgressionPanel character={cyrusCharState} />
                  )}
                </div>
              </>
            ) : isWynel ? (
              /* Wyn'el Aeluin Dashboard (Prince of House Aeluin & Scarlet Chaos Warlock) */
              <>
                <div className="mb-6">
                  <WynelHeader
                    wynel={wynel}
                    onLevelChange={setWynelLevel}
                    onHPChange={setWynelHP}
                    onTempHPChange={setWynelTempHP}
                  />
                </div>

                <div className="animate-fade-in-up" key={`wynel-${activeTab}`}>
                  {/* TAB 1: STATS & HERITAGE */}
                  {activeTab === 'character' && (
                    <WynelStatBlock wynel={wynel} />
                  )}

                  {/* TAB 2: COMBAT & SPELLS */}
                  {activeTab === 'combat' && (
                    <div className="space-y-6">
                      <CombatActions character={wynelCharState} />
                      <WynelSpellbookPanel
                        wynel={wynel}
                        onUsePactSlot={useWynelPactSlot}
                        onRestorePactSlot={restoreWynelPactSlot}
                        onShortRest={wynelShortRest}
                        onLongRest={wynelLongRest}
                      />
                    </div>
                  )}

                  {/* TAB 3: CRIMSON TATTOO (Pact Magic & Chaos Aura) */}
                  {activeTab === 'artifact' && (
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
                  )}

                  {/* TAB 4: TREASURY & INVENTORY */}
                  {activeTab === 'inventory' && (
                    <InventoryManager
                      character={wynelCharState}
                      onInventoryChange={setWynelInventory}
                      onCurrencyChange={setWynelCurrency}
                    />
                  )}

                  {/* TAB 5: GRIMOIRE & LORE */}
                  {activeTab === 'dossier' && (
                    <WynelGrimoire
                      wynel={wynel}
                      onNotesChange={setWynelNotes}
                      onJournalChange={setWynelJournal}
                      onMysteriesChange={setWynelMysteries}
                    />
                  )}

                  {/* TAB 6: FEATS (Fallback) */}
                  {activeTab === 'progression' && (
                    <ProgressionPanel character={wynelCharState} />
                  )}
                </div>
              </>
            ) : (
              /* Aria Sil'aveth Dashboard (Personalized Aesthetics & Layout) */
              <>
                <div className="mb-6">
                  <AriaHeader
                    aria={aria}
                    onLevelChange={setAriaLevel}
                    onHPChange={setAriaHP}
                    onTempHPChange={setAriaTempHP}
                    onPhaseChange={setAriaLunarPhase}
                  />
                </div>

                <div className="animate-fade-in-up" key={`aria-${activeTab}`}>
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'character' && (
                    <AriaStatBlock aria={aria} />
                  )}

                  {/* TAB 2: COMBAT & SPELLBOOK */}
                  {activeTab === 'combat' && (
                    <div className="space-y-6">
                      <CombatActions character={ariaCharState} />
                      <SpellbookPanel
                        aria={aria}
                        onUseSlot={useAriaSpellSlot}
                        onRestoreSlot={restoreAriaSpellSlot}
                      />
                    </div>
                  )}

                  {/* TAB 3: LUNAR TIDES (Sorcery Points & Phase Engine) */}
                  {activeTab === 'artifact' && (
                    <LunarPhaseEngine
                      aria={aria}
                      onPhaseChange={setAriaLunarPhase}
                      onSorceryPointsChange={setAriaSorceryPoints}
                      onToggleInnateSorcery={toggleAriaInnateSorcery}
                      onLongRest={ariaLongRest}
                    />
                  )}

                  {/* TAB 4: INVENTORY */}
                  {activeTab === 'inventory' && (
                    <InventoryManager
                      character={ariaCharState}
                      onInventoryChange={setAriaInventory}
                      onCurrencyChange={setAriaCurrency}
                    />
                  )}

                  {/* TAB 5: GRIMOIRE */}
                  {activeTab === 'dossier' && (
                    <AriaGrimoire
                      aria={aria}
                      onNotesChange={setAriaNotes}
                    />
                  )}

                  {/* TAB 6: FEATS & PROGRESSION */}
                  {activeTab === 'progression' && (
                    <ProgressionPanel character={ariaCharState} />
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center">
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold-700)] to-transparent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
            The Ashen Pact — D&amp;D 5e Interactive Campaign Hub
          </p>
        </footer>
      </main>
    </>
  );
}
