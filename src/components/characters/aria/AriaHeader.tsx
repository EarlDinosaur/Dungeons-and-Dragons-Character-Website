'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Footprints, Moon, Award, ArrowLeft, Scroll, Layers, Edit3, Plus, Trash2, X, Check } from 'lucide-react';
import gsap from 'gsap';
import HPQuickControl from '../../ui/HPQuickControl';
import type { AriaState, LunarPhase } from '@/lib/aria-engine';
import { getProficiencyBonus } from '@/lib/aria-engine';
import { DND_CLASSES, getClassDefinition, formatHitDicePool } from '@/lib/class-database';
import type { ClassLevel } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface AriaHeaderProps {
  aria: AriaState;
  onLevelChange: (level: number) => void;
  onHPChange: (hp: number) => void;
  onTempHPChange: (hp: number) => void;
  onPhaseChange?: (phase: LunarPhase) => void;
}

export default function AriaHeader({
  aria,
  onLevelChange,
  onHPChange,
  onTempHPChange,
  onPhaseChange,
}: AriaHeaderProps) {
  const { navigateToMenu, getPortraitUrl, openMediaPicker, setClasses, setCombatOverrides } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const ariaPortrait = getPortraitUrl('aria');

  // Modals State
  const [isMulticlassModalOpen, setIsMulticlassModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Draft classes state for Multiclass modal
  const [draftClasses, setDraftClasses] = useState<ClassLevel[]>([]);

  // Draft combat overrides state
  const [draftAC, setDraftAC] = useState<number>(aria.combat.ac);
  const [draftInit, setDraftInit] = useState<number>(aria.combat.initiative);
  const [draftSpeed, setDraftSpeed] = useState<number>(aria.combat.speed);
  const [draftProf, setDraftProf] = useState<number>(getProficiencyBonus(aria.level));

  const hpPercent = aria.combat.maxHP > 0
    ? (aria.combat.currentHP / aria.combat.maxHP) * 100
    : 0;

  const hpColor =
    hpPercent > 60 ? '#a992e8' :
    hpPercent > 30 ? '#eab308' :
    hpPercent > 0 ? '#c9707a' : '#6b7280';

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
    const initial = aria.classes && aria.classes.length > 0
      ? aria.classes
      : [{ className: aria.characterClass || 'Sorcerer', subclass: aria.subclass || 'Lunar Sorcery', level: aria.level || 10, hitDice: 'd6' }];
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
      { className: 'Wizard', subclass: 'Abjuration', level: 1, hitDice: 'd6' },
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
    }

    updated[index] = target;
    setDraftClasses(updated);
  };

  const handleRemoveClass = (index: number) => {
    if (draftClasses.length <= 1) return;
    setDraftClasses(draftClasses.filter((_, i) => i !== index));
  };

  const openStatsModal = () => {
    setDraftAC(aria.combat.ac);
    setDraftInit(aria.combat.initiative);
    setDraftSpeed(aria.combat.speed);
    setDraftProf(getProficiencyBonus(aria.level));
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

  const profBonus = getProficiencyBonus(aria.level);
  const currentPhase = aria.lunarEngine.currentPhase;

  const phaseDetails = {
    full: { title: 'FULL MOON', desc: 'Abjuration & Divination Discount', color: '#f2efe0', border: '#d9b872', bg: 'rgba(242,239,224,0.15)', icon: '🌕' },
    new: { title: 'NEW MOON', desc: 'Necromancy & Evocation Discount', color: '#a992e8', border: '#7e22ce', bg: 'rgba(168,85,247,0.15)', icon: '🌑' },
    crescent: { title: 'CRESCENT MOON', desc: 'Illusion & Transmutation Discount', color: '#c7c2e6', border: '#343a72', bg: 'rgba(199,194,230,0.15)', icon: '🌙' },
  };

  const activePhaseInfo = phaseDetails[currentPhase] || phaseDetails.full;

  const activeClasses = aria.classes && aria.classes.length > 0
    ? aria.classes
    : [{ className: aria.characterClass, subclass: aria.subclass, level: aria.level, hitDice: 'd6' }];

  const hitDicePoolText = formatHitDicePool(activeClasses);

  return (
    <div className="relative p-6 rounded-2xl border border-[#d9b872]/50 bg-gradient-to-b from-[#1d2249]/90 via-[#14183a]/95 to-[#0d1026]/95 shadow-[0_0_50px_rgba(169,146,232,0.25)] font-['Spectral',serif]">
      {/* Ornate Corner SVG Ornaments */}
      <div className="frame-ornament tl" />
      <div className="frame-ornament tr" />
      <div className="frame-ornament bl" />
      <div className="frame-ornament br" />

      {/* Inner Decorative Border */}
      <div className="absolute inset-[6px] border border-[#a992e8]/35 rounded-xl pointer-events-none" />

      {/* Top Guildhall Navigation Strip */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#343a72]/80">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(169,146,232,0.12)] hover:bg-[rgba(169,146,232,0.25)] border border-[#a992e8]/40 hover:border-[#d9b872] text-[#e8e6ff] hover:text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5"
          id="aria-header-back-button"
        >
          <ArrowLeft size={13} className="text-[#a992e8] group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-[#a992e8]" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-mono text-[#9aa1cc] uppercase tracking-widest hidden sm:block">
          The Ashen Pact &bull; Aria Grimoire
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Avatar Portrait & Identity (4 cols) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:col-span-4">
          <div
            onClick={() => openMediaPicker('portraits')}
            className="relative group shrink-0 mx-auto sm:mx-0 cursor-pointer"
            title="Tap to change portrait or wallpaper"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#d9b872] shadow-[0_0_35px_rgba(217,184,114,0.6)] group-hover:shadow-[0_0_45px_rgba(169,146,232,0.8)] transition-all duration-500 relative">
              <img
                src={ariaPortrait}
                alt="Aria Sil'aveth"
                className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0d1026] rounded-full border-2 border-[#d9b872] flex items-center justify-center text-sm shadow-lg">
              {activePhaseInfo.icon}
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff] tracking-wide drop-shadow-[0_0_12px_rgba(232,230,255,0.5)]">
                {aria.name}
              </h1>

              <button
                onClick={openMulticlassModal}
                className="text-xs font-mono text-[#a992e8] bg-[#14183a] hover:bg-[#171b3f] border border-[#343a72] px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Manage Level & Multiclassing"
              >
                <Layers size={13} />
                <span className="font-bold">Total Level {aria.level}</span>
                <Edit3 size={11} className="opacity-70" />
              </button>
            </div>

            <p className="text-xs text-[#d9b872] font-['Cormorant_Garamond',serif] italic">
              &ldquo;Lunar Weaver of Starlight&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs text-[#cfd4ee] pt-1">
              <span className="bg-[#171b3f] text-[#a992e8] px-2 py-0.5 rounded border border-[#343a72] font-semibold text-[10px]">
                {aria.race}
              </span>
              {activeClasses.map((c, i) => (
                <span key={i} className="bg-[#171b3f] text-[#d9b872] px-2 py-0.5 rounded border border-[#343a72] font-semibold text-[10px]">
                  {c.className} {c.level} {c.subclass && `(${c.subclass})`}
                </span>
              ))}
              <span className="text-[10px] text-[#9aa1cc] font-mono">&bull; {hitDicePoolText}</span>
            </div>
          </div>
        </div>

        {/* Middle: Active Lunar Phase Boon Box (4 cols) */}
        {onPhaseChange && (
          <div className="p-3.5 rounded-xl bg-[#0d1026] border border-[#343a72] lg:col-span-4 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#a992e8] uppercase font-bold flex items-center gap-1">
                <Moon size={12} /> Active Phase Boon
              </span>
              <span className="text-[10px] font-mono text-[#d9b872] font-bold">
                {activePhaseInfo.icon} {activePhaseInfo.title}
              </span>
            </div>

            <p className="text-[11px] text-[#cfd4ee] leading-tight font-mono min-h-[28px] flex items-center">
              {activePhaseInfo.desc}
            </p>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                onClick={() => onPhaseChange('full')}
                className={`h-8 whitespace-nowrap flex items-center justify-center gap-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold tracking-tight transition-all text-center ${
                  currentPhase === 'full'
                    ? 'bg-[#f2efe0] text-black shadow-md scale-[1.02]'
                    : 'bg-[#14183a] text-[#9aa1cc] hover:text-white border border-[#343a72]'
                }`}
              >
                <span>🌕</span> <span>Full</span>
              </button>
              <button
                onClick={() => onPhaseChange('new')}
                className={`h-8 whitespace-nowrap flex items-center justify-center gap-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold tracking-tight transition-all text-center ${
                  currentPhase === 'new'
                    ? 'bg-[#a992e8] text-black shadow-md scale-[1.02]'
                    : 'bg-[#14183a] text-[#9aa1cc] hover:text-white border border-[#343a72]'
                }`}
              >
                <span>🌑</span> <span>New</span>
              </button>
              <button
                onClick={() => onPhaseChange('crescent')}
                className={`h-8 whitespace-nowrap flex items-center justify-center gap-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold tracking-tight transition-all text-center ${
                  currentPhase === 'crescent'
                    ? 'bg-[#c7c2e6] text-black shadow-md scale-[1.02]'
                    : 'bg-[#14183a] text-[#9aa1cc] hover:text-white border border-[#343a72]'
                }`}
              >
                <span>🌙</span> <span>Crescent</span>
              </button>
            </div>
          </div>
        )}

        {/* Right: Quick Stats Strip (4 cols) */}
        <div className="grid grid-cols-3 gap-2 lg:col-span-4 font-mono text-center">
          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#14183a] border border-[#262b57] hover:border-[#a992e8] transition-all cursor-pointer group"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#9aa1cc] uppercase">AC ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#e8e6ff]">{aria.combat.ac}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#14183a] border border-[#262b57] hover:border-[#a992e8] transition-all cursor-pointer group"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#9aa1cc] uppercase">INIT ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#a992e8]">+{aria.combat.initiative}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#14183a] border border-[#262b57] hover:border-[#a992e8] transition-all cursor-pointer group"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#9aa1cc] uppercase">SPEED ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#cfd4ee]">{aria.combat.speed}&apos;</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#14183a] border border-[#262b57] hover:border-[#a992e8] transition-all cursor-pointer group"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#9aa1cc] uppercase">PROF ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#d9b872]">+{profBonus}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1d2249] border border-[#a992e8]/40">
            <span className="block text-[10px] tracking-wider text-[#a992e8] uppercase">SPELL DC</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#a992e8]">{aria.spellcasting.spellSaveDC}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1d2249] border border-[#d9b872]/40">
            <span className="block text-[10px] tracking-wider text-[#d9b872] uppercase">ATTACK</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#d9b872]">+{aria.spellcasting.spellAttackBonus}</span>
          </div>
        </div>
      </div>

      {/* HP Bar Section — UX Friendly Quick Math */}
      <div className="mt-5 pt-3 border-t border-[#343a72]/80 relative z-10">
        <HPQuickControl
          currentHP={aria.combat.currentHP}
          maxHP={aria.combat.maxHP}
          tempHP={aria.combat.tempHP}
          onHPChange={onHPChange}
          onTempHPChange={onTempHPChange}
          themeColor="lunar"
          characterName={aria.name}
        />
      </div>

      {/* MULTICLASS MANAGER MODAL */}
      {isMulticlassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#14183a] border-2 border-[#a992e8] rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto font-['Spectral',serif]">
            <button
              onClick={() => setIsMulticlassModalOpen(false)}
              className="absolute top-4 right-4 text-[#9aa1cc] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#343a72]">
              <Layers className="text-[#a992e8]" size={20} />
              <h2 className="text-xl font-bold text-[#e8e6ff] font-['Cormorant_Garamond',serif]">
                Aria Multiclassing &amp; Level Manager
              </h2>
            </div>

            <p className="text-xs text-[#9aa1cc] mb-4 font-mono">
              Configure Aria&apos;s classes from the 5e Class Catalog. Spells, slots, and stats adjust automatically.
            </p>

            <div className="space-y-4 mb-6">
              {draftClasses.map((c, idx) => {
                const classDef = getClassDefinition(c.className);
                return (
                  <div key={idx} className="bg-[#0d1026] border border-[#262b57] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#d9b872] uppercase tracking-wider font-mono">
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
                        <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                          Class Name
                        </label>
                        <select
                          value={c.className}
                          onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                          className="w-full bg-[#14183a] border border-[#343a72] rounded-lg p-2 text-white font-semibold focus:border-[#a992e8]"
                        >
                          {Object.keys(DND_CLASSES).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls} ({DND_CLASSES[cls].hitDie})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                          Subclass / Archetype
                        </label>
                        <select
                          value={c.subclass || ''}
                          onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                          className="w-full bg-[#14183a] border border-[#343a72] rounded-lg p-2 text-white focus:border-[#a992e8]"
                        >
                          {classDef.subclasses.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                          Level
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={c.level}
                          onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)}
                          className="w-full bg-[#14183a] border border-[#343a72] rounded-lg p-2 text-white font-bold text-center focus:border-[#a992e8]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#343a72]">
              <button
                onClick={handleAddClass}
                className="px-3 py-1.5 bg-[#0d1026] hover:bg-[#171b3f] text-[#a992e8] border border-[#343a72] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Multiclass
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMulticlassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9aa1cc] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMulticlass}
                  className="px-4 py-2 bg-[#a992e8] hover:bg-[#8f76d6] text-black rounded-xl text-xs font-bold font-mono flex items-center gap-1.5"
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
          <div className="bg-[#14183a] border-2 border-[#a992e8] rounded-2xl p-6 max-w-md w-full shadow-2xl relative font-['Spectral',serif]">
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-[#9aa1cc] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#343a72]">
              <Edit3 className="text-[#a992e8]" size={20} />
              <h2 className="text-xl font-bold text-[#e8e6ff] font-['Cormorant_Garamond',serif]">
                Aria Combat Stats Overrides
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Armor Class (AC)
                </label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-[#0d1026] border border-[#343a72] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Initiative Bonus
                </label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-[#0d1026] border border-[#343a72] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Speed (ft)
                </label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-[#0d1026] border border-[#343a72] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#9aa1cc] mb-1">
                  Proficiency Bonus
                </label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-[#0d1026] border border-[#343a72] rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#343a72]">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#9aa1cc] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="px-4 py-2 bg-[#a992e8] hover:bg-[#8f76d6] text-black rounded-xl text-xs font-bold font-mono flex items-center gap-1.5"
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
