'use client';

import { useState } from 'react';
import {
  Sparkles,
  X,
  Shield,
  Swords,
  Heart,
  Wand2,
  Dice5,
  Palette,
  Check,
  User,
  ChevronRight,
  ChevronLeft,
  Crown,
  Upload,
} from 'lucide-react';
import { DND_CLASSES } from '@/lib/class-database';
import type { AbilityName } from '@/lib/types';
import { generateNewCharacter } from '@/lib/character-generator';
import { getModifier, formatModifier } from '@/lib/character-engine';

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  surface: string;
  bgDesc: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'shadow',
    name: 'Shadow & Crimson (Assassin)',
    primary: '#dc2626',
    accent: '#ffd700',
    surface: '#0d070b',
    bgDesc: 'Deep obsidian and blood crimson smoke',
  },
  {
    id: 'lunar',
    name: 'Lunar Starlight (Sorcerer)',
    primary: '#a992e8',
    accent: '#d9b872',
    surface: '#0a0c1a',
    bgDesc: 'Celestial starlight and moonlight lavender',
  },
  {
    id: 'solar',
    name: 'Solar Sanctuary (Cleric/Paladin)',
    primary: '#eab308',
    accent: '#fbbf24',
    surface: '#151208',
    bgDesc: 'Radiant golden temple sunbeams',
  },
  {
    id: 'scarlet',
    name: 'Scarlet Chaos (Warlock)',
    primary: '#ef4444',
    accent: '#f43f5e',
    surface: '#14080b',
    bgDesc: 'Arcane fey chaos and reality-warping sigils',
  },
  {
    id: 'sylvan',
    name: 'Emerald Sylvan (Ranger/Druid)',
    primary: '#10b981',
    accent: '#34d399',
    surface: '#07150d',
    bgDesc: 'Ancient enchanted forest and deep moss',
  },
  {
    id: 'frost',
    name: 'Frost Cobalt (Wizard/Fighter)',
    primary: '#3b82f6',
    accent: '#38bdf8',
    surface: '#081018',
    bgDesc: 'Glacial runes and icy cobalt arcane light',
  },
];

const STANDARD_RACES = [
  'Human',
  'High Elf',
  'Wood Elf',
  'Dwarf (Mountain)',
  'Dwarf (Hill)',
  'Halfling',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Dragonborn',
  'Gnome',
  'Aasimar',
  'Goliath',
];

const STANDARD_BACKGROUNDS = [
  'Folk Hero',
  'Acolyte',
  'Criminal / Spy',
  'Noble',
  'Sage',
  'Soldier',
  'Outlander',
  'Urchin',
  'Gladiator',
];

const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

const DEFAULT_PORTRAITS = [
  { label: 'Knight / Warrior', url: '/vesper-portrait.png' },
  { label: 'Celestial Sorceress', url: '/aria-portrait.png' },
  { label: 'Solar Oracle', url: '/cyrus-portrait.png' },
  { label: 'Fey Prince Warlock', url: '/wynel-portrait.png' },
];

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (characterId: string, charData: any, theme: { primary: string; accent: string; portraitUrl: string }) => void;
}

export default function CharacterCreatorModal({ isOpen, onClose, onCreated }: CharacterCreatorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [race, setRace] = useState('Human');
  const [className, setClassName] = useState('Fighter');
  const [subclass, setSubclass] = useState('');
  const [level, setLevel] = useState(1);
  const [background, setBackground] = useState('Folk Hero');
  const [alignment, setAlignment] = useState('Neutral Good');

  // Ability Scores
  const [abilityScores, setAbilityScores] = useState<Record<AbilityName, number>>({
    STR: 15,
    DEX: 14,
    CON: 13,
    INT: 12,
    WIS: 10,
    CHA: 8,
  });

  // Theme & Personalization
  const [selectedThemeId, setSelectedThemeId] = useState('frost');
  const [customPrimary, setCustomPrimary] = useState('#3b82f6');
  const [customAccent, setCustomAccent] = useState('#38bdf8');
  const [portraitUrl, setPortraitUrl] = useState('/vesper-portrait.png');
  const [sigFeatureName, setSigFeatureName] = useState('');
  const [sigFeatureDesc, setSigFeatureDesc] = useState('');

  if (!isOpen) return null;

  const currentClassDef = DND_CLASSES[className] || DND_CLASSES['Fighter'];
  const subclasses = currentClassDef.subclasses || [];

  const handleSelectTheme = (theme: ThemePreset) => {
    setSelectedThemeId(theme.id);
    setCustomPrimary(theme.primary);
    setCustomAccent(theme.accent);
  };

  const handleAbilityChange = (ability: AbilityName, val: number) => {
    setAbilityScores((prev) => ({
      ...prev,
      [ability]: Math.max(1, Math.min(30, val)),
    }));
  };

  const handleSetStandardArray = () => {
    setAbilityScores({
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    });
  };

  const handleSetCasterArray = () => {
    setAbilityScores({
      STR: 8,
      DEX: 14,
      CON: 13,
      INT: 15,
      WIS: 12,
      CHA: 10,
    });
  };

  const handleSetRogueArray = () => {
    setAbilityScores({
      STR: 8,
      DEX: 15,
      CON: 14,
      INT: 13,
      WIS: 12,
      CHA: 10,
    });
  };

  // Automated Quick Math Previews
  const hitDieVal = currentClassDef.hitDieValue || 8;
  const conMod = getModifier(abilityScores.CON);
  const dexMod = getModifier(abilityScores.DEX);
  const estimatedHP = hitDieVal + conMod + Math.max(0, level - 1) * (Math.floor(hitDieVal / 2) + 1 + conMod);
  const estimatedAC = 10 + dexMod + (['Fighter', 'Paladin'].includes(className) ? 6 : ['Barbarian', 'Monk'].includes(className) ? 0 : 1);
  const profBonus = Math.ceil(level / 4) + 1;

  const handleSubmit = () => {
    if (!name.trim()) return;

    const charId = `char-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newChar = generateNewCharacter({
      name: name.trim(),
      alias: title.trim() || `Level ${level} ${race} ${className}`,
      race,
      className,
      subclass: subclass || subclasses[0] || '',
      level,
      background,
      alignment,
      abilityScores,
      primaryColor: customPrimary,
      accentColor: customAccent,
      portraitUrl,
      signatureFeatureName: sigFeatureName || `${className} Mastery`,
      signatureFeatureDescription: sigFeatureDesc,
    });

    onCreated(charId, newChar, {
      primary: customPrimary,
      accent: customAccent,
      portraitUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-[#0e1017] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-scale-up max-h-[90vh]"
        style={{
          boxShadow: `0 0 40px ${customPrimary}20`,
        }}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: `${customPrimary}20`,
                borderColor: `${customPrimary}50`,
                color: customAccent,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-zinc-100 flex items-center gap-2">
                <span>Create New Character</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {step === 1 && 'Identity, Class & Archetype'}
                {step === 2 && 'Ability Scores & Core Attributes'}
                {step === 3 && 'Theme, Portrait & Signature Power'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Step Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: IDENTITY & CLASS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thorgar Ironbreaker"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Title / Subtitle
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Champion of the North"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Race
                  </label>
                  <select
                    value={race}
                    onChange={(e) => setRace(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {STANDARDRACES_OPTIONS(STANDARD_RACES, race)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Class
                  </label>
                  <select
                    value={className}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      const def = DND_CLASSES[e.target.value];
                      if (def && def.subclasses && def.subclasses.length > 0) {
                        setSubclass(def.subclasses[0]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.keys(DND_CLASSES).map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} ({DND_CLASSES[cls].hitDie})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Level (1–20)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={level}
                      onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Subclass / Archetype
                  </label>
                  {subclasses.length > 0 ? (
                    <select
                      value={subclass}
                      onChange={(e) => setSubclass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {subclasses.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={subclass}
                      onChange={(e) => setSubclass(e.target.value)}
                      placeholder="e.g. Champion"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                    Background
                  </label>
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {STANDARD_BACKGROUNDS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                  Alignment
                </label>
                <select
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {ALIGNMENTS.map((al) => (
                    <option key={al} value={al}>
                      {al}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Summary Banner */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300">
                    Hit Die: <strong className="text-white">{currentClassDef.hitDie}</strong>
                  </span>
                  <span>&bull;</span>
                  <span className="font-mono text-zinc-300">
                    Saves: <strong className="text-white">{currentClassDef.savingThrows.join(', ')}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {currentClassDef.spellcastingType === 'none' ? 'Martial' : 'Spellcaster'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: ABILITY SCORES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-zinc-300 font-bold">
                  Assign Ability Scores
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetStandardArray}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    Standard Array
                  </button>
                  <button
                    type="button"
                    onClick={handleSetCasterArray}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    Caster Preset
                  </button>
                  <button
                    type="button"
                    onClick={handleSetRogueArray}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    Finesse Preset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityName[]).map((ability) => {
                  const score = abilityScores[ability];
                  const mod = getModifier(score);
                  const isSave = currentClassDef.savingThrows.includes(ability);

                  return (
                    <div
                      key={ability}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden"
                    >
                      {isSave && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono uppercase font-bold border border-amber-500/30">
                          Save Prof
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-zinc-400 mb-1">
                        {ability}
                      </span>
                      <div className="flex items-center gap-2 my-1">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={score}
                          onChange={(e) => handleAbilityChange(ability, parseInt(e.target.value) || 10)}
                          className="w-14 text-center py-1 rounded-md bg-black/60 border border-zinc-700 text-lg font-mono font-black text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <span className="text-sm font-mono font-bold text-amber-300">
                        {formatModifier(mod)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Automated Stats Snapshot */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/80 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Max HP</span>
                  <span className="text-base font-bold text-emerald-400">{estimatedHP}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Est. AC</span>
                  <span className="text-base font-bold text-blue-400">{estimatedAC}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Prof. Bonus</span>
                  <span className="text-base font-bold text-amber-400">+{profBonus}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THEME & PERSONALIZATION */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                  <Palette size={14} />
                  <span>Choose Theme Preset</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedThemeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectTheme(preset)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800/90 border-white/60 shadow-md'
                            : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-200">{preset.name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{preset.bgDesc}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portrait Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                  <User size={14} />
                  <span>Avatar Portrait</span>
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={portraitUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 shadow-sm shrink-0"
                    style={{ borderColor: customAccent }}
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={portraitUrl}
                      onChange={(e) => setPortraitUrl(e.target.value)}
                      placeholder="Image URL (e.g. /my-hero.png or https://...)"
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {DEFAULT_PORTRAITS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPortraitUrl(p.url)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Signature Mechanic / Power */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5 font-bold">
                  Signature Power Name (Personalized Tab)
                </label>
                <input
                  type="text"
                  value={sigFeatureName}
                  onChange={(e) => setSigFeatureName(e.target.value)}
                  placeholder={`e.g. ${className === 'Barbarian' ? 'Rage Engine' : className === 'Paladin' ? 'Divine Smite & Auras' : 'Heroic Resonance'}`}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert('Please enter a character name to proceed.');
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110"
              style={{
                backgroundColor: customAccent || '#fbbf24',
              }}
            >
              <Crown size={16} />
              <span>Awaken {name || 'Hero'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function STANDARDRACES_OPTIONS(races: string[], selected: string) {
  return (
    <>
      {races.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </>
  );
}
