'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Footprints, Award, ArrowLeft, Scroll, Layers, Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import gsap from 'gsap';
import TextGenerateEffect from '../../ui/TextGenerateEffect';
import HPQuickControl from '../../ui/HPQuickControl';
import { formatModifier } from '@/lib/character-engine';
import { DND_CLASSES, formatHitDicePool, getClassDefinition } from '@/lib/class-database';
import type { CharacterState, ClassLevel } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface CharacterHeaderProps {
  character: CharacterState;
  onLevelChange: (level: number) => void;
  onHPChange: (hp: number) => void;
  onTempHPChange: (hp: number) => void;
}

export default function CharacterHeader({
  character,
  onLevelChange,
  onHPChange,
  onTempHPChange,
}: CharacterHeaderProps) {
  const { navigateToMenu, getPortraitUrl, openMediaPicker, setClasses, setCombatOverrides } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const vesperPortrait = getPortraitUrl('vesper');

  // Modals state
  const [isMulticlassModalOpen, setIsMulticlassModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Draft classes state for Multiclass modal
  const [draftClasses, setDraftClasses] = useState<ClassLevel[]>([]);

  // Draft combat overrides state
  const [draftAC, setDraftAC] = useState<number>(character.ac);
  const [draftInit, setDraftInit] = useState<number>(character.initiative);
  const [draftSpeed, setDraftSpeed] = useState<number>(character.speed);
  const [draftProf, setDraftProf] = useState<number>(character.proficiencyBonus);

  const hpPercent = character.combat.maxHP > 0
    ? (character.combat.currentHP / character.combat.maxHP) * 100
    : 0;

  const hpColor =
    hpPercent > 60 ? '#22c55e' :
    hpPercent > 30 ? '#eab308' :
    hpPercent > 0 ? '#dc2626' : '#6b7280';

  useEffect(() => {
    if (hpBarRef.current) {
      gsap.to(hpBarRef.current, {
        width: `${Math.max(0, Math.min(100, hpPercent))}%`,
        backgroundColor: hpColor,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [hpPercent, hpColor]);

  const openMulticlassModal = () => {
    const initial = character.classes && character.classes.length > 0
      ? character.classes
      : [{ className: character.class || 'Rogue', subclass: character.subclass || 'Assassin', level: character.level || 10, hitDice: 'd8' }];
    setDraftClasses([...initial]);
    setIsMulticlassModalOpen(true);
  };

  const handleSaveMulticlass = () => {
    if (draftClasses.length === 0) return;
    setClasses(draftClasses);
    setIsMulticlassModalOpen(false);
  };

  const handleAddClass = () => {
    setDraftClasses([
      ...draftClasses,
      { className: 'Warlock', subclass: 'The Fiend', level: 1, hitDice: 'd8' },
    ]);
  };

  const handleUpdateClass = (index: number, field: keyof ClassLevel, value: string | number) => {
    const updated = [...draftClasses];
    const target = { ...updated[index] };

    if (field === 'className') {
      const def = getClassDefinition(value as string);
      target.className = def.name;
      target.hitDice = def.hitDie;
      target.subclass = def.subclasses[0] || 'Custom Subclass';
    } else if (field === 'level') {
      target.level = Math.max(1, Number(value));
    } else if (field === 'subclass') {
      target.subclass = value as string;
    } else if (field === 'hitDice') {
      target.hitDice = value as string;
    }

    updated[index] = target;
    setDraftClasses(updated);
  };

  const handleRemoveClass = (index: number) => {
    if (draftClasses.length <= 1) return;
    setDraftClasses(draftClasses.filter((_, i) => i !== index));
  };

  const openStatsModal = () => {
    setDraftAC(character.ac);
    setDraftInit(character.initiative);
    setDraftSpeed(character.speed);
    setDraftProf(character.proficiencyBonus);
    setIsStatsModalOpen(true);
  };

  const handleSaveStats = () => {
    setCombatOverrides({
      ac: draftAC,
      initiative: draftInit,
      speed: draftSpeed,
      proficiencyBonus: draftProf,
    });
    setIsStatsModalOpen(false);
  };

  const activeClasses = character.classes && character.classes.length > 0
    ? character.classes
    : [{ className: character.class || 'Rogue', subclass: character.subclass || 'Assassin', level: character.level, hitDice: 'd8' }];

  const hitDicePoolText = formatHitDicePool(activeClasses);

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold-bright)] to-transparent opacity-60" />

      {/* Top Guildhall Navigation Strip */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[rgba(255,215,0,0.12)]">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,215,0,0.08)] hover:bg-[rgba(255,215,0,0.18)] border border-[var(--color-gold-500)]/40 hover:border-[var(--color-gold-bright)] text-[var(--color-gold-300)] hover:text-[var(--color-gold-bright)] text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5"
          id="earl-header-back-button"
        >
          <ArrowLeft size={13} className="text-[var(--color-gold-400)] group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-[var(--color-gold-400)]" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)] uppercase tracking-widest hidden sm:block">
          The Ashen Pact &bull; Earl Dossier
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Avatar Portrait & Identity */}
        <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
          <div
            onClick={() => openMediaPicker('portraits')}
            className="relative group shrink-0 mx-auto sm:mx-0 cursor-pointer"
            title="Tap to change portrait or wallpaper"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-[var(--color-gold-400)] shadow-[0_0_30px_rgba(255,215,0,0.35)] group-hover:border-[var(--color-crimson-500)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all duration-500 relative">
              <img
                src={vesperPortrait}
                alt="Vesper Ashwood"
                className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black/90 rounded-full border-2 border-[var(--color-gold-400)] flex items-center justify-center text-sm shadow-lg">
              🗡️
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-glow-gold">
                <TextGenerateEffect text={character.name} />
              </h1>
              <button
                onClick={openMulticlassModal}
                className="text-xs font-[family-name:var(--font-mono)] text-[var(--color-gold-400)] bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] border border-[rgba(255,215,0,0.3)] px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Manage Level & Multiclassing"
              >
                <Layers size={13} />
                <span className="font-bold">Total Level {character.level}</span>
                <Edit3 size={11} className="opacity-70" />
              </button>
            </div>

            <p className="text-lg text-[var(--color-parchment-muted)] font-[family-name:var(--font-body)] italic mb-2">
              &ldquo;{character.alias}&rdquo;
            </p>

            {/* Multiclass Badges & Class List */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
              <span className="bg-[rgba(220,38,38,0.15)] text-[var(--color-crimson-400)] px-2 py-0.5 rounded-full border border-[rgba(220,38,38,0.2)]">
                {character.race}
              </span>
              {activeClasses.map((c, i) => (
                <span
                  key={`${c.className}-${i}`}
                  className="bg-[rgba(168,85,247,0.15)] text-[var(--color-arcane-300)] px-2.5 py-0.5 rounded-full border border-[rgba(168,85,247,0.25)] flex items-center gap-1"
                >
                  <span className="font-semibold">{c.className} {c.level}</span>
                  {c.subclass && <span className="opacity-75">({c.subclass})</span>}
                </span>
              ))}
              <span className="text-[var(--color-parchment-dim)]">•</span>
              <span className="text-[var(--color-parchment-dim)]">{hitDicePoolText} Hit Dice</span>
            </div>
          </div>
        </div>

        {/* Quick Stats — Clickable to edit */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {/* AC */}
          <div
            onClick={openStatsModal}
            className="flex flex-col items-center glass-card p-3 min-w-[72px] cursor-pointer hover:border-[var(--color-gold-400)] transition-all group"
            title="Click to edit AC, Initiative, Speed, & Prof Bonus"
          >
            <Shield size={16} className="text-[var(--color-gold-400)] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {character.ac}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              AC ✏️
            </span>
          </div>

          {/* Initiative */}
          <div
            onClick={openStatsModal}
            className="flex flex-col items-center glass-card p-3 min-w-[72px] cursor-pointer hover:border-[var(--color-gold-400)] transition-all group"
            title="Click to edit AC, Initiative, Speed, & Prof Bonus"
          >
            <Zap size={16} className="text-[var(--color-gold-400)] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {formatModifier(character.initiative)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Init ✏️
            </span>
          </div>

          {/* Speed */}
          <div
            onClick={openStatsModal}
            className="flex flex-col items-center glass-card p-3 min-w-[72px] cursor-pointer hover:border-[var(--color-gold-400)] transition-all group"
            title="Click to edit AC, Initiative, Speed, & Prof Bonus"
          >
            <Footprints size={16} className="text-[var(--color-gold-400)] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {character.speed}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Speed ✏️
            </span>
          </div>

          {/* Prof Bonus */}
          <div
            onClick={openStatsModal}
            className="flex flex-col items-center glass-card p-3 min-w-[72px] cursor-pointer hover:border-[var(--color-gold-400)] transition-all group"
            title="Click to edit AC, Initiative, Speed, & Prof Bonus"
          >
            <Award size={16} className="text-[var(--color-gold-400)] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              +{character.proficiencyBonus}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Prof ✏️
            </span>
          </div>
        </div>
      </div>

      {/* Orphan's Tithe Artifact & Assassin Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[rgba(255,215,0,0.1)] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--color-gold-400)] flex items-center gap-1.5">
            <span className="animate-pulse">🩸</span> Orphan&apos;s Tithe Vestige:
          </span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider border ${
            character.orphansTithe.vestigeStage === 'exalted'
              ? 'bg-[rgba(220,38,38,0.25)] text-[var(--color-crimson-400)] border-[var(--color-crimson-500)] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
              : character.orphansTithe.vestigeStage === 'awakened'
              ? 'bg-[rgba(168,85,247,0.25)] text-[var(--color-arcane-300)] border-[var(--color-arcane-500)]'
              : 'bg-[rgba(255,255,255,0.08)] text-[var(--color-parchment-dim)] border-[rgba(255,255,255,0.15)]'
          }`}>
            Stage {character.orphansTithe.vestigeStage === 'exalted' ? 'III (Exalted)' : character.orphansTithe.vestigeStage === 'awakened' ? 'II (Awakened)' : 'I (Dormant)'}
          </span>
          <span className="text-[var(--color-parchment-muted)] font-[family-name:var(--font-mono)]">
            • {character.orphansTithe.currentSouls} / 100 Souls
          </span>
        </div>

        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px]">
          <span className="bg-[rgba(220,38,38,0.1)] text-[var(--color-crimson-400)] px-2.5 py-0.5 rounded border border-[rgba(220,38,38,0.2)]">
            🗡️ Sneak Attack: {character.sneakAttackDice}d6
          </span>
          <span className="bg-[rgba(255,215,0,0.1)] text-[var(--color-gold-300)] px-2.5 py-0.5 rounded border border-[rgba(255,215,0,0.2)]">
            💀 Assassinate: Auto-Crit
          </span>
        </div>
      </div>

      {/* HP Section — UX Friendly Quick Math */}
      <div className="mt-5">
        <HPQuickControl
          currentHP={character.combat.currentHP}
          maxHP={character.combat.maxHP}
          tempHP={character.combat.tempHP}
          onHPChange={onHPChange}
          onTempHPChange={onTempHPChange}
          themeColor="crimson"
          characterName={character.name}
        />

        {/* Death Saves (show when HP = 0) */}
        {character.combat.currentHP === 0 && (
          <div className="flex items-center justify-center gap-6 mt-3 p-3 rounded-lg bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.3)] animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-vitality)] font-[family-name:var(--font-heading)] font-bold">Death Saves:</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={`success-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < character.combat.deathSaves.successes
                      ? 'bg-[var(--color-vitality)] border-[var(--color-vitality)] shadow-[0_0_8px_#22c55e]'
                      : 'border-[rgba(255,255,255,0.2)]'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-crimson-400)] font-[family-name:var(--font-heading)] font-bold">Fails:</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={`fail-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < character.combat.deathSaves.failures
                      ? 'bg-[var(--color-crimson-600)] border-[var(--color-crimson-600)] shadow-[0_0_8px_#dc2626]'
                      : 'border-[rgba(255,255,255,0.2)]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MULTICLASS MANAGER MODAL */}
      {isMulticlassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-500)] rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMulticlassModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <Layers className="text-[var(--color-gold-400)]" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                Multiclassing &amp; Level Manager
              </h2>
            </div>

            <p className="text-xs text-[var(--color-parchment-dim)] mb-4">
              Select classes from the 5e Class Database. Hit dice, spellcasting levels, and subclass options automatically configure!
            </p>

            <div className="space-y-4 mb-6">
              {draftClasses.map((c, idx) => {
                const classDef = getClassDefinition(c.className);
                return (
                  <div key={idx} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[var(--color-gold-400)] uppercase tracking-wider font-[family-name:var(--font-heading)]">
                        Class #{idx + 1}
                      </span>
                      {draftClasses.length > 1 && (
                        <button
                          onClick={() => handleRemoveClass(idx)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Class Selection */}
                      <div>
                        <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                          Class Name
                        </label>
                        <select
                          value={c.className}
                          onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                          className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2 text-white font-semibold focus:border-[var(--color-gold-400)]"
                        >
                          {Object.keys(DND_CLASSES).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls} ({DND_CLASSES[cls].hitDie})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subclass Selection */}
                      <div>
                        <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                          Subclass / Archetype
                        </label>
                        <select
                          value={c.subclass || ''}
                          onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                          className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2 text-white focus:border-[var(--color-gold-400)]"
                        >
                          {classDef.subclasses.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Level Input */}
                      <div>
                        <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                          Level
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={c.level}
                          onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)}
                          className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2 text-white font-bold text-center focus:border-[var(--color-gold-400)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[rgba(255,215,0,0.15)]">
              <button
                onClick={handleAddClass}
                className="btn btn-ghost btn-sm text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Multiclass
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMulticlassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--color-parchment-dim)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMulticlass}
                  className="btn btn-gold btn-sm text-xs flex items-center gap-1.5"
                >
                  <Check size={14} /> Apply Multiclassing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMBAT STATS OVERRIDE MODAL */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-500)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <Edit3 className="text-[var(--color-gold-400)]" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                Combat Stats Overrides
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Armor Class (AC)
                </label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Initiative Bonus
                </label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Speed (ft)
                </label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Proficiency Bonus
                </label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,215,0,0.15)]">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--color-parchment-dim)] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="btn btn-gold btn-sm text-xs flex items-center gap-1.5"
              >
                <Check size={14} /> Save Overrides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

