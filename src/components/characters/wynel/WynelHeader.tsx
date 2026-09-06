'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Scroll, Sparkles, Layers, Edit3, Plus, Trash2, X, Check, Flame, Heart, Crown } from 'lucide-react';
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

  const activeClasses = wynel.classes && wynel.classes.length > 0
    ? wynel.classes
    : [{ className: wynel.characterClass || 'Warlock', subclass: wynel.subclass || 'The Archfey', level: wynel.level, hitDice: 'd8' }];

  const hitDicePoolText = formatHitDicePool(activeClasses);

  return (
    <div className="glass-card p-6 relative overflow-hidden border border-red-500/40 shadow-[0_16px_50px_rgba(239,68,68,0.15)] bg-gradient-to-br from-[#1b0a0e]/95 via-[#120508]/95 to-[#080203]/98 text-zinc-100 rounded-3xl">
      {/* Scarlet Chaos Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />

      {/* Top Guildhall Navigation Strip */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-red-900/40">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 hover:border-red-400 text-rose-300 hover:text-rose-100 text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          <ArrowLeft size={13} className="text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-rose-400" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-mono text-rose-300/80 uppercase tracking-widest hidden sm:flex items-center gap-1.5">
          <Crown size={12} className="text-amber-400" />
          House Aeluin &bull; Archfey Pact Companion
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
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.45)] group-hover:border-rose-400 group-hover:shadow-[0_0_45px_rgba(244,63,94,0.65)] transition-all duration-500 relative">
              <img
                src={wynelPortrait}
                alt="Wyn'el Aeluin"
                className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-950 rounded-full border-2 border-red-500 flex items-center justify-center text-sm shadow-lg">
              <Heart size={14} className="text-rose-400 fill-rose-500 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-100 font-['Cormorant_Garamond',serif] tracking-wider drop-shadow-md">
                {wynel.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-950/80 text-rose-300 border border-red-500/40 uppercase tracking-wider flex items-center gap-1">
                <Crown size={11} className="text-amber-400" /> Prince of House Aeluin
              </span>
            </div>

            <p className="text-xs font-mono text-rose-300/90 font-medium mb-3 flex items-center gap-2 flex-wrap">
              <span className="text-rose-400 font-bold">{wynel.title}</span>
              <span>&bull;</span>
              <span>{wynel.race}</span>
              <span>&bull;</span>
              <span className="text-amber-300 font-semibold">{wynel.characterClass} ({wynel.subclass})</span>
            </p>

            {/* Pact Emblem Banner */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/70 via-black/60 to-red-950/40 border border-red-500/30 text-xs mb-4 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-red-500/20 text-rose-400 shrink-0">
                  <Flame size={13} />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Pact Emblem:</span>
                  <span className="text-xs font-bold text-rose-200 font-serif truncate">
                    {wynel.pactEmblem}
                  </span>
                </div>
              </div>
              <button
                onClick={openMulticlassModal}
                className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-800 text-rose-200 text-[11px] font-mono flex items-center gap-1 border border-red-500/30 transition-colors shrink-0 cursor-pointer"
              >
                <Layers size={11} />
                Multiclass
              </button>
            </div>

            {/* Level Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-xl border border-red-900/40">
                <span className="text-xs font-mono text-zinc-400 mr-1">Level</span>
                <span className="text-base font-bold text-rose-300 font-mono">{wynel.level}</span>
                <div className="flex flex-col ml-2">
                  <button
                    onClick={() => onLevelChange(Math.min(20, wynel.level + 1))}
                    className="text-[10px] text-zinc-400 hover:text-rose-300 px-1 font-mono cursor-pointer"
                    title="Level Up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onLevelChange(Math.max(1, wynel.level - 1))}
                    className="text-[10px] text-zinc-400 hover:text-rose-300 px-1 font-mono cursor-pointer"
                    title="Level Down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openStatsModal}
                  className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-red-950/60 text-zinc-300 hover:text-rose-200 border border-red-900/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={12} className="text-rose-400" />
                  Edit Combat Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HP Quick Controller Card */}
        <div className="w-full md:w-72 shrink-0 p-4 rounded-2xl bg-black/70 border border-red-900/50 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Heart size={13} className="text-red-500 fill-red-500" /> Hit Points
            </span>
            <span className="text-xs font-mono font-bold text-rose-300">
              {wynel.combat.currentHP} / {wynel.combat.maxHP}
              {wynel.combat.tempHP > 0 && (
                <span className="text-amber-400 font-bold ml-1">+{wynel.combat.tempHP}</span>
              )}
            </span>
          </div>

          {/* Animated GSAP HP Bar */}
          <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden mb-3 border border-zinc-800">
            <div ref={hpBarRef} className="h-full rounded-full transition-all duration-300" />
          </div>

          {/* Quick HP Adjustment Buttons */}
          <HPQuickControl
            currentHP={wynel.combat.currentHP}
            maxHP={wynel.combat.maxHP}
            tempHP={wynel.combat.tempHP}
            onHPChange={onHPChange}
            onTempHPChange={onTempHPChange}
          />
        </div>
      </div>

      {/* Multiclass Modal */}
      {isMulticlassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-red-900/60 rounded-2xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-semibold font-serif text-rose-200 flex items-center gap-2">
                <Layers size={16} className="text-red-400" /> Manage Wyn’el Classes
              </h3>
              <button onClick={() => setIsMulticlassModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-4 pr-1">
              {draftClasses.map((cls, idx) => {
                const classDef = getClassDefinition(cls.className);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Class</label>
                      <select
                        value={cls.className}
                        onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-100 focus:border-red-500"
                      >
                        {Object.values(DND_CLASSES).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.hitDie})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Level</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={cls.level}
                        onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-100 focus:border-red-500"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Subclass / Archetype</label>
                      <select
                        value={cls.subclass || ''}
                        onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-100 focus:border-red-500"
                      >
                        {classDef.subclasses.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                        {cls.subclass && !classDef.subclasses.includes(cls.subclass) && (
                          <option value={cls.subclass}>{cls.subclass}</option>
                        )}
                      </select>
                    </div>

                    {draftClasses.length > 1 && (
                      <button
                        onClick={() => handleRemoveClass(idx)}
                        className="text-red-400 hover:text-red-300 p-1 self-end cursor-pointer"
                        title="Remove class"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleAddClass}
                className="w-full py-2 border border-dashed border-zinc-700 hover:border-red-500/60 rounded-xl text-xs font-mono text-zinc-400 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Add Multiclass Level
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsMulticlassModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMulticlass}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs font-mono shadow-md"
              >
                Save Classes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combat Overrides Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-red-900/60 rounded-2xl max-w-sm w-full p-6 text-zinc-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-semibold font-serif text-rose-200 flex items-center gap-2">
                <Edit3 size={16} className="text-red-400" /> Edit Combat Overrides
              </h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-4 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Armor Class (AC)</label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-rose-200"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Initiative Bonus</label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-rose-200"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Speed (ft)</label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-rose-200"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Proficiency Bonus</label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-rose-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs font-mono shadow-md"
              >
                Save Overrides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
