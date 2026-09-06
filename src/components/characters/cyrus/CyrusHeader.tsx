'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Scroll, Eye, Sun, Sparkles, Layers, Edit3, Plus, Trash2, X, Check } from 'lucide-react';
import gsap from 'gsap';
import HPQuickControl from '../../ui/HPQuickControl';
import type { CyrusState } from '@/lib/cyrus-engine';
import { getProficiencyBonus } from '@/lib/cyrus-engine';
import { DND_CLASSES, getClassDefinition, formatHitDicePool } from '@/lib/class-database';
import type { ClassLevel } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface CyrusHeaderProps {
  cyrus: CyrusState;
  onLevelChange: (level: number) => void;
  onHPChange: (hp: number) => void;
  onTempHPChange: (hp: number) => void;
}

export default function CyrusHeader({
  cyrus,
  onLevelChange,
  onHPChange,
  onTempHPChange,
}: CyrusHeaderProps) {
  const { navigateToMenu, getPortraitUrl, openMediaPicker, setClasses, setCombatOverrides } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const cyrusPortrait = getPortraitUrl('cyrus');

  // Modals State
  const [isMulticlassModalOpen, setIsMulticlassModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Draft classes state for Multiclass modal
  const [draftClasses, setDraftClasses] = useState<ClassLevel[]>([]);

  // Draft combat overrides state
  const [draftAC, setDraftAC] = useState<number>(cyrus.combat.ac);
  const [draftInit, setDraftInit] = useState<number>(cyrus.combat.initiative);
  const [draftSpeed, setDraftSpeed] = useState<number>(cyrus.combat.speed);
  const [draftProf, setDraftProf] = useState<number>(getProficiencyBonus(cyrus.level));

  const hpPercent = cyrus.combat.maxHP > 0
    ? (cyrus.combat.currentHP / cyrus.combat.maxHP) * 100
    : 0;

  const hpColor =
    hpPercent > 60 ? '#daa520' :
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
    const initial = cyrus.classes && cyrus.classes.length > 0
      ? cyrus.classes
      : [{ className: cyrus.characterClass || 'Cleric', subclass: cyrus.subclass || 'Solar Mystery', level: cyrus.level || 3, hitDice: 'd8' }];
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
      { className: 'Paladin', subclass: 'Oath of Devotion', level: 1, hitDice: 'd10' },
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
    setDraftAC(cyrus.combat.ac);
    setDraftInit(cyrus.combat.initiative);
    setDraftSpeed(cyrus.combat.speed);
    setDraftProf(getProficiencyBonus(cyrus.level));
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

  const profBonus = getProficiencyBonus(cyrus.level);

  const activeClasses = cyrus.classes && cyrus.classes.length > 0
    ? cyrus.classes
    : [{ className: cyrus.characterClass, subclass: cyrus.subclass, level: cyrus.level, hitDice: 'd8' }];

  const hitDicePoolText = formatHitDicePool(activeClasses);

  return (
    <div className="relative p-6 rounded-2xl border border-[#daa520]/50 bg-gradient-to-b from-[#1a1608]/90 via-[#141008]/95 to-[#0d0a06]/95 shadow-[0_0_50px_rgba(218,165,32,0.25)] font-['Spectral',serif]">
      {/* Greek laurel border accents */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#daa520] to-transparent opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#daa520]/40 to-transparent" />

      {/* Inner decorative border */}
      <div className="absolute inset-[6px] border border-[#daa520]/20 rounded-xl pointer-events-none" />

      {/* Top Guildhall Navigation Strip */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#daa520]/30">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(218,165,32,0.10)] hover:bg-[rgba(218,165,32,0.22)] border border-[#daa520]/40 hover:border-[#daa520] text-amber-100 hover:text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5"
          id="cyrus-header-back-button"
        >
          <ArrowLeft size={13} className="text-[#daa520] group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-[#daa520]" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-mono text-[#b89d5e] uppercase tracking-widest hidden sm:block">
          The Ashen Pact &bull; Oracle of Helios
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
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#daa520] shadow-[0_0_35px_rgba(218,165,32,0.5)] group-hover:shadow-[0_0_50px_rgba(255,215,0,0.7)] transition-all duration-500 relative">
              <img
                src={cyrusPortrait}
                alt="Cyrus Hyacinthus"
                className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0d0a06] rounded-full border-2 border-[#daa520] flex items-center justify-center text-sm shadow-lg">
              ☀️
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-['Cormorant_Garamond',serif] text-amber-100 tracking-wide drop-shadow-[0_0_12px_rgba(218,165,32,0.5)]">
                {cyrus.name}
              </h1>

              <button
                onClick={openMulticlassModal}
                className="text-xs font-mono text-[#daa520] bg-[#1a1608] hover:bg-[#251e0b] border border-[#daa520]/40 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Manage Level & Multiclassing"
              >
                <Layers size={13} />
                <span className="font-bold">Total Level {cyrus.level}</span>
                <Edit3 size={11} className="opacity-70" />
              </button>
            </div>

            <p className="text-xs text-[#daa520] font-['Cormorant_Garamond',serif] italic">
              &ldquo;Sworn Counselor of King Zephyr&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs text-amber-200/80 pt-1">
              <span className="bg-[#1a1608] text-[#daa520] px-2 py-0.5 rounded border border-[#daa520]/30 font-semibold text-[10px]">
                {cyrus.race}
              </span>
              {activeClasses.map((c, i) => (
                <span key={i} className="bg-[#1a1608] text-amber-200 px-2 py-0.5 rounded border border-[#daa520]/30 font-semibold text-[10px]">
                  {c.className} {c.level} {c.subclass && `(${c.subclass})`}
                </span>
              ))}
              <span className="text-[10px] text-[#b89d5e] font-mono">&bull; {hitDicePoolText}</span>
            </div>
          </div>
        </div>

        {/* Middle: Solar Oracle Status Box (4 cols) */}
        <div className="p-3.5 rounded-xl bg-[#0d0a06] border border-[#daa520]/30 lg:col-span-4 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#daa520] uppercase font-bold flex items-center gap-1">
              <Sun size={12} /> Solar Oracle Status
            </span>
            <span className="text-[10px] font-mono text-[#b89d5e] bg-[#1a1608] px-2 py-0.5 rounded border border-[#daa520]/20">
              Apollo Celestial Powers
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[rgba(255,215,0,0.06)] border border-[#daa520]/20 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-[#b89d5e] uppercase block flex items-center gap-1">
                <Eye size={10} className="text-[#daa520]" /> Oracle Curse
              </span>
              <span className="text-xs font-mono font-bold text-amber-200 mt-0.5">
                🦯 Lame (Speed 20&apos;)
              </span>
            </div>

            <div className="bg-[rgba(255,215,0,0.06)] border border-[#daa520]/20 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-[#b89d5e] uppercase block flex items-center gap-1">
                <Sparkles size={10} className="text-[#daa520]" /> Radiant Soul
              </span>
              <span className="text-xs font-mono font-bold text-[#daa520] mt-0.5">
                {cyrus.oracleEngine.radiantSoulActive ? '☀️ Active (+3 Dmg)' : '🛡️ Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Grid (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-2 font-mono text-center">
          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 hover:border-[#daa520] transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#b89d5e] uppercase">AC ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-100">{cyrus.combat.ac}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 hover:border-[#daa520] transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#b89d5e] uppercase">INIT ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-200">+{cyrus.combat.initiative}</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 hover:border-[#daa520] transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#b89d5e] uppercase">SPEED ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-200">{cyrus.combat.speed}&apos;</span>
          </div>

          <div
            onClick={openStatsModal}
            className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 hover:border-[#daa520] transition-all cursor-pointer group shadow-md"
            title="Click to edit AC, Initiative, Speed & Prof"
          >
            <span className="block text-[10px] tracking-wider text-[#b89d5e] uppercase">PROF ✏️</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#daa520]">+{profBonus}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1a1608] border border-[#daa520]/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#daa520] uppercase">SPELL DC</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#daa520]">{cyrus.spellcasting.spellSaveDC}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1a1608] border border-[#daa520]/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#daa520] uppercase">ATTACK</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#daa520]">+{cyrus.spellcasting.spellAttackBonus}</span>
          </div>
        </div>
      </div>

      {/* HP Bar Section */}
      <div className="mt-5 pt-3 border-t border-[#daa520]/30 relative z-10">
        <HPQuickControl
          currentHP={cyrus.combat.currentHP}
          maxHP={cyrus.combat.maxHP}
          tempHP={cyrus.combat.tempHP}
          onHPChange={onHPChange}
          onTempHPChange={onTempHPChange}
          themeColor="gold"
          characterName={cyrus.name}
        />
      </div>

      {/* MULTICLASS MANAGER MODAL */}
      {isMulticlassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141008] border-2 border-[#daa520] rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto font-['Spectral',serif]">
            <button
              onClick={() => setIsMulticlassModalOpen(false)}
              className="absolute top-4 right-4 text-[#b89d5e] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#daa520]/30">
              <Layers className="text-[#daa520]" size={20} />
              <h2 className="text-xl font-bold text-amber-100 font-['Cormorant_Garamond',serif]">
                Cyrus Multiclassing &amp; Level Manager
              </h2>
            </div>

            <p className="text-xs text-[#b89d5e] mb-4 font-mono">
              Configure Cyrus&apos;s classes from the 5e Class Catalog. Spells, slots, and stats adjust automatically.
            </p>

            <div className="space-y-4 mb-6">
              {draftClasses.map((c, idx) => {
                const classDef = getClassDefinition(c.className);
                return (
                  <div key={idx} className="bg-[#0d0a06] border border-[#daa520]/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#daa520] uppercase tracking-wider font-mono">
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
                        <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                          Class Name
                        </label>
                        <select
                          value={c.className}
                          onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                          className="w-full bg-[#141008] border border-[#daa520]/30 rounded-lg p-2 text-white font-semibold focus:border-[#daa520]"
                        >
                          {Object.keys(DND_CLASSES).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls} ({DND_CLASSES[cls].hitDie})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                          Subclass / Archetype
                        </label>
                        <select
                          value={c.subclass || ''}
                          onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                          className="w-full bg-[#141008] border border-[#daa520]/30 rounded-lg p-2 text-white focus:border-[#daa520]"
                        >
                          {classDef.subclasses.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                          Level
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={c.level}
                          onChange={(e) => handleUpdateClass(idx, 'level', e.target.value)}
                          className="w-full bg-[#141008] border border-[#daa520]/30 rounded-lg p-2 text-white font-bold text-center focus:border-[#daa520]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#daa520]/30">
              <button
                onClick={handleAddClass}
                className="px-3 py-1.5 bg-[#0d0a06] hover:bg-[#1f1a0b] text-[#daa520] border border-[#daa520]/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Multiclass
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMulticlassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#b89d5e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMulticlass}
                  className="px-4 py-2 bg-[#daa520] hover:bg-amber-400 text-black rounded-xl text-xs font-bold font-mono flex items-center gap-1.5"
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
          <div className="bg-[#141008] border-2 border-[#daa520] rounded-2xl p-6 max-w-md w-full shadow-2xl relative font-['Spectral',serif]">
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-[#b89d5e] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#daa520]/30">
              <Edit3 className="text-[#daa520]" size={20} />
              <h2 className="text-xl font-bold text-amber-100 font-['Cormorant_Garamond',serif]">
                Cyrus Combat Stats Overrides
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                  Armor Class (AC)
                </label>
                <input
                  type="number"
                  value={draftAC}
                  onChange={(e) => setDraftAC(Number(e.target.value))}
                  className="w-full bg-[#0d0a06] border border-[#daa520]/30 rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                  Initiative Bonus
                </label>
                <input
                  type="number"
                  value={draftInit}
                  onChange={(e) => setDraftInit(Number(e.target.value))}
                  className="w-full bg-[#0d0a06] border border-[#daa520]/30 rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                  Speed (ft)
                </label>
                <input
                  type="number"
                  value={draftSpeed}
                  onChange={(e) => setDraftSpeed(Number(e.target.value))}
                  className="w-full bg-[#0d0a06] border border-[#daa520]/30 rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#b89d5e] mb-1">
                  Proficiency Bonus
                </label>
                <input
                  type="number"
                  value={draftProf}
                  onChange={(e) => setDraftProf(Number(e.target.value))}
                  className="w-full bg-[#0d0a06] border border-[#daa520]/30 rounded-lg p-2.5 text-white font-bold text-lg text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#daa520]/30">
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#b89d5e] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="px-4 py-2 bg-[#daa520] hover:bg-amber-400 text-black rounded-xl text-xs font-bold font-mono flex items-center gap-1.5"
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
