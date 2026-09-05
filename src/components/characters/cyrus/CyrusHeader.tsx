'use client';

import { useRef, useEffect } from 'react';
import { ArrowLeft, Scroll, Eye, Sun, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import HPQuickControl from '../../ui/HPQuickControl';
import type { CyrusState } from '@/lib/cyrus-engine';
import { getProficiencyBonus } from '@/lib/cyrus-engine';
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
  const { navigateToMenu, getPortraitUrl, openMediaPicker } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSelectElement>(null);
  const cyrusPortrait = getPortraitUrl('cyrus');

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

  const handleLevelChange = (newLevel: number) => {
    if (levelRef.current) {
      gsap.fromTo(levelRef.current, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
    onLevelChange(newLevel);
  };

  const profBonus = getProficiencyBonus(cyrus.level);

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

              <span className="text-xs font-mono text-[#b89d5e] bg-[#141008] px-2 py-0.5 rounded border border-[#daa520]/30 shrink-0">
                LV
                <select
                  ref={levelRef}
                  value={cyrus.level}
                  onChange={(e) => handleLevelChange(Number(e.target.value))}
                  className="!bg-transparent !border-none !p-0 !pl-1 !w-auto !text-[#daa520] font-bold appearance-none cursor-pointer focus:outline-none inline"
                  id="cyrus-level-selector"
                  style={{ width: '30px' }}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => (
                    <option key={lv} value={lv} className="bg-[#141008] text-white">
                      {lv}
                    </option>
                  ))}
                </select>
              </span>
            </div>

            <p className="text-xs text-[#daa520] font-['Cormorant_Garamond',serif] italic">
              &ldquo;Sworn Counselor of King Zephyr&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs text-amber-200/80 pt-1">
              <span className="bg-[#1a1608] text-[#daa520] px-2 py-0.5 rounded border border-[#daa520]/30 font-semibold text-[10px]">
                {cyrus.race}
              </span>
              <span className="bg-[#1a1608] text-amber-200 px-2 py-0.5 rounded border border-[#daa520]/30 font-semibold text-[10px]">
                {cyrus.characterClass}
              </span>
              <span className="bg-[#1a1608] text-amber-100 px-2 py-0.5 rounded border border-[#daa520]/30 font-semibold text-[10px]">
                {cyrus.subclass}
              </span>
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
        <div className="lg:col-span-4 grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#b89d5e] font-mono uppercase">AC</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-100">{cyrus.combat.ac}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#b89d5e] font-mono uppercase">INIT</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-200">{cyrus.combat.initiative}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#b89d5e] font-mono uppercase">SPEED</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-amber-200">{cyrus.combat.speed}&apos;</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#141008] border border-[#daa520]/25 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#b89d5e] font-mono uppercase">PROF</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#daa520]">+{profBonus}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1a1608] border border-[#daa520]/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#daa520] font-mono uppercase">SPELL DC</span>
            <span className="text-xl font-bold font-['Cormorant_Garamond',serif] text-[#daa520]">{cyrus.spellcasting.spellSaveDC}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1a1608] border border-[#daa520]/40 text-center shadow-md">
            <span className="block text-[10px] tracking-wider text-[#daa520] font-mono uppercase">ATTACK</span>
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
    </div>
  );
}
