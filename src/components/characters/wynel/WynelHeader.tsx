'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Scroll,
  Layers,
  Edit3,
  Plus,
  Trash2,
  X,
  Check,
  Flame,
  Heart,
  Crown,
  BookOpen,
  Sparkles,
  Shield,
} from 'lucide-react';
import gsap from 'gsap';
import HPQuickControl from '../../ui/HPQuickControl';
import type { WynelState } from '@/lib/wynel-engine';
import { getProficiencyBonus } from '@/lib/wynel-engine';
import { DND_CLASSES, getClassDefinition, formatHitDicePool } from '@/lib/class-database';
import type { ClassLevel } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface WynelHeaderProps {
  wynel: WynelState;
  onLevelChange: (level: number) => void;
  onHPChange: (hp: number) => void;
  onTempHPChange: (hp: number) => void;
}

export default function WynelHeader({
  wynel,
  onLevelChange,
  onHPChange,
  onTempHPChange,
}: WynelHeaderProps) {
  const { navigateToMenu, getPortraitUrl, openMediaPicker, setClasses, setCombatOverrides } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const wynelPortrait = getPortraitUrl('wynel');

  // Modals State
  const [isMulticlassModalOpen, setIsMulticlassModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Draft classes state for Multiclass modal
  const [draftClasses, setDraftClasses] = useState<ClassLevel[]>([]);

  // Draft combat overrides state
  const [draftAC, setDraftAC] = useState<number>(wynel.combat.ac);
  const [draftInit, setDraftInit] = useState<number>(wynel.combat.initiative);
  const [draftSpeed, setDraftSpeed] = useState<number>(wynel.combat.speed);
  const [draftProf, setDraftProf] = useState<number>(getProficiencyBonus(wynel.level));

  const hpPercent = wynel.combat.maxHP > 0
    ? (wynel.combat.currentHP / wynel.combat.maxHP) * 100
    : 0;

  const hpColor =
    hpPercent > 60 ? '#ef4444' :
    hpPercent > 30 ? '#f59e0b' :
    hpPercent > 0 ? '#b91c1c' : '#4b5563';

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
    const initial = wynel.classes && wynel.classes.length > 0
      ? wynel.classes
      : [{ className: wynel.characterClass || 'Warlock', subclass: wynel.subclass || 'The Archfey', level: wynel.level || 3, hitDice: 'd8' }];
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
      { className: 'Sorcerer', subclass: 'Wild Magic', level: 1, hitDice: 'd6' },
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
    setDraftAC(wynel.combat.ac);
    setDraftInit(wynel.combat.initiative);
    setDraftSpeed(wynel.combat.speed);
    setDraftProf(getProficiencyBonus(wynel.level));
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

  const profBonus = getProficiencyBonus(wynel.level);

  const activeClasses = wynel.classes && wynel.classes.length > 0
    ? wynel.classes
    : [{ className: wynel.characterClass || 'Warlock', subclass: wynel.subclass || 'The Archfey', level: wynel.level, hitDice: 'd8' }];

  const hitDicePoolText = formatHitDicePool(activeClasses);
  const availableSlots = Math.max(0, wynel.pactEngine.slotsMax - wynel.pactEngine.slotsUsed);

  return (
    <div className="relative p-6 rounded-2xl border border-red-500/50 bg-gradient-to-b from-[#240811]/95 via-[#18050c]/98 to-[#0b0205]/98 shadow-[0_0_50px_rgba(239,68,68,0.28)] font-['Spectral',serif]">
      {/* Scarlet Royal Filigree Lines */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-85 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      {/* Inner decorative filigree border */}
      <div className="absolute inset-[6px] border border-red-500/20 rounded-xl pointer-events-none" />

      {/* Corner Filigree Glyphs */}
      <div className="absolute top-2 left-2.5 text-red-500/40 pointer-events-none text-xs font-serif select-none">❖</div>
      <div className="absolute top-2 right-2.5 text-red-500/40 pointer-events-none text-xs font-serif select-none">❖</div>
      <div className="absolute bottom-2 left-2.5 text-red-500/40 pointer-events-none text-xs font-serif select-none">❖</div>
      <div className="absolute bottom-2 right-2.5 text-red-500/40 pointer-events-none text-xs font-serif select-none">❖</div>

      {/* Top Guildhall Navigation Strip */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-5 pb-3 border-b border-red-900/30">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.10)] hover:bg-[rgba(239,68,68,0.22)] border border-red-500/40 hover:border-red-400 text-rose-100 hover:text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5 cursor-pointer"
          id="wynel-header-back-button"
        >
          <ArrowLeft size={13} className="text-red-400 group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-red-400" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-mono text-rose-300/80 uppercase tracking-widest hidden sm:flex items-center gap-1.5">
          <Crown size={12} className="text-amber-400" />
          <span>The Ashen Pact &bull; House Aeluin Exiled Crown &bull; Archfey Chaos Patron</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Avatar Portrait & Identity (4 cols) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:col-span-4">
          <div
            onClick={() => openMediaPicker('portraits', 'wynel')}
            className="relative group shrink-0 mx-auto sm:mx-0 cursor-pointer"
            title="Tap to change portrait or wallpaper"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] transition-all duration-500 relative">
              <img
                src={wynelPortrait}
                alt="Wyn'el Aeluin"
                className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0d0205] rounded-full border-2 border-red-500 flex items-center justify-center text-sm shadow-lg">
              <Heart size={13} className="text-red-400 fill-red-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-rose-100 tracking-wide drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                {wynel.name}
              </h1>

              <button
                onClick={openMulticlassModal}
                className="text-xs font-mono text-rose-300 bg-[#1f070e] hover:bg-[#2d0a14] border border-red-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Manage Level & Multiclassing"
              >
                <Layers size={13} />
                <span className="font-bold">Total Level {wynel.level}</span>
                <Edit3 size={11} className="opacity-70" />
              </button>
            </div>

            <p className="text-xs text-rose-400 font-['Cormorant_Garamond',serif] italic">
              &ldquo;Exiled Prince of House Aeluin &bull; Scion of the Chaos Weave&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs text-rose-200/80 pt-1">
              <span className="bg-[#1f070e] text-red-400 px-2 py-0.5 rounded border border-red-900/40 font-semibold text-[10px]">
                {wynel.race}
              </span>
              {activeClasses.map((c, i) => (
                <span key={i} className="bg-[#1f070e] text-rose-200 px-2 py-0.5 rounded border border-red-900/40 font-semibold text-[10px]">
                  {c.className} {c.level} {c.subclass && `(${c.subclass})`}
                </span>
              ))}
              <span className="text-[10px] text-rose-400/70 font-mono">&bull; {hitDicePoolText}</span>
            </div>
          </div>
        </div>

        {/* Middle: The Crimson Heart-Tattoo & Chaos Engine Box (4 cols) */}
        <div className="p-3.5 rounded-xl bg-[#0e0306] border border-red-900/40 lg:col-span-4 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
              <Flame size={12} className="text-red-500 animate-pulse" /> The Crimson Heart-Tattoo
            </span>
            <span className="text-[10px] font-mono text-rose-300/80 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/30 flex items-center gap-1">
              <Sparkles size={9} className="text-amber-400" /> Archfey Chaos Conduit
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[rgba(239,68,68,0.06)] border border-red-900/30 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-rose-300/80 uppercase block flex items-center gap-1">
                <BookOpen size={10} className="text-red-400" /> Pact Magic (Lv {wynel.pactEngine.slotLevel})
              </span>
              <span className="text-xs font-mono font-bold text-rose-100 mt-0.5 flex items-center gap-1">
                🔮 {availableSlots} / {wynel.pactEngine.slotsMax} Slots Ready
              </span>
            </div>

            <div className="bg-[rgba(239,68,68,0.06)] border border-red-900/30 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-rose-300/80 uppercase block flex items-center gap-1">
                <Heart size={10} className="text-rose-400" /> Chaos Pulse
              </span>
              <span className="text-xs font-mono font-bold text-red-400 mt-0.5">
                {wynel.pactEngine.chaosAuraActive ? '⚡ Surging (+Aura Active)' : '🛡️ Warded & Controlled'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats 6-Box Grid (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-2 font-mono text-center">
          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#17050a] border border-red-900/30 hover:border-red-500 transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-rose-300/70 uppercase">AC ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-rose-100">{wynel.combat.ac}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#17050a] border border-red-900/30 hover:border-red-500 transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-rose-300/70 uppercase">INIT ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-rose-200">+{wynel.combat.initiative}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#17050a] border border-red-900/30 hover:border-red-500 transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-rose-300/70 uppercase">SPEED ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-rose-200">{wynel.combat.speed}&apos;</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#17050a] border border-red-900/30 hover:border-red-500 transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-rose-300/70 uppercase">PROF ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-red-400">+{profBonus}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#20070e] border border-red-700/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-rose-300 uppercase">SPELL DC</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-red-400">{wynel.spellcasting.spellSaveDC}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#20070e] border border-red-700/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-rose-300 uppercase">ATTACK</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-rose-300">+{wynel.spellcasting.spellAttackBonus}</span>
          </div>
        </div>
      </div>

      {/* Full-Width HP Bar Section */}
      <div className="mt-5 pt-3 border-t border-red-900/30 relative z-10">
        <HPQuickControl
          currentHP={wynel.combat.currentHP}
          maxHP={wynel.combat.maxHP}
          tempHP={wynel.combat.tempHP}
          onHPChange={onHPChange}
          onTempHPChange={onTempHPChange}
          themeColor="crimson"
          characterName={wynel.name}
        />
      </div>

      {/* MULTICLASS MANAGER MODAL */}
      {isMulticlassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#140508] border-2 border-red-600 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto font-['Spectral',serif]">
            <button
              onClick={() => setIsMulticlassModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-900/30">
              <Layers className="text-red-400" size={20} />
              <h2 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif]">
                Wyn’el Multiclassing &amp; Level Manager
              </h2>
            </div>

            <p className="text-xs text-rose-300/80 mb-4 font-mono">
              Configure Prince Wyn’el&apos;s classes from the 5e Class Catalog. Chaos spells, pact slots, and combat stats adjust automatically.
            </p>

            <div className="space-y-4 mb-6">
              {draftClasses.map((c, idx) => {
                const classDef = getClassDefinition(c.className);
                return (
                  <div key={idx} className="bg-[#0b0204] border border-red-900/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                        Class #{idx + 1}
                      </span>
                      {draftClasses.length > 1 && (
                        <button
                          onClick={() => handleRemoveClass(idx)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                          Class Name
                        </label>
                        <select
                          value={c.className}
                          onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                          className="w-full bg-[#18050a] border border-red-900/40 rounded-lg p-2 text-white font-semibold focus:border-red-500"
                        >
                          {Object.keys(DND_CLASSES).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls} ({DND_CLASSES[cls].hitDie})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                          Subclass / Archetype
                        </label>
                        <select
                          value={c.subclass || ''}
                          onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                          className="w-full bg-[#18050a] border border-red-900/40 rounded-lg p-2 text-white focus:border-red-500"
                        >
                          {classDef.subclasses.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                          Level
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={c.level}
                          onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)}
                          className="w-full bg-[#18050a] border border-red-900/40 rounded-lg p-2 text-white font-bold text-center focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-red-900/30">
              <button
                onClick={handleAddClass}
                className="px-3 py-1.5 bg-[#1f070e] hover:bg-[#2d0a14] text-rose-200 border border-red-700/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Multiclass
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMulticlassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-rose-300/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMulticlass}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.4)]"
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
          <div className="bg-[#140508] border-2 border-red-600 rounded-2xl p-6 max-w-md w-full shadow-2xl relative font-['Spectral',serif]">
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-900/30">
              <Edit3 className="text-red-400" size={20} />
              <h2 className="text-xl font-bold text-rose-100 font-['Cormorant_Garamond',serif]">
                Wyn’el Combat Stats Overrides
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Armor Class (AC)
                </label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-[#0b0204] border border-red-900/40 rounded-lg p-2.5 text-white font-bold text-lg text-center focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Initiative Bonus
                </label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-[#0b0204] border border-red-900/40 rounded-lg p-2.5 text-white font-bold text-lg text-center focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Speed (ft)
                </label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-[#0b0204] border border-red-900/40 rounded-lg p-2.5 text-white font-bold text-lg text-center focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-rose-400/80 mb-1">
                  Proficiency Bonus
                </label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-[#0b0204] border border-red-900/40 rounded-lg p-2.5 text-white font-bold text-lg text-center focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-red-900/30">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-rose-300/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.4)]"
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
