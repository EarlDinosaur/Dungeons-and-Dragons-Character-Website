'use client';

import { Moon, Sparkles, Wand2, Shield, Zap, RefreshCw } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { AriaState, LunarPhase } from '@/lib/aria-engine';

interface LunarPhaseEngineProps {
  aria: AriaState;
  onPhaseChange: (phase: LunarPhase) => void;
  onSorceryPointsChange: (points: number) => void;
  onToggleInnateSorcery: () => void;
  onLongRest: () => void;
}

export default function LunarPhaseEngine({
  aria,
  onPhaseChange,
  onSorceryPointsChange,
  onToggleInnateSorcery,
  onLongRest,
}: LunarPhaseEngineProps) {
  const phase = aria.lunarEngine.currentPhase;
  const currentPoints = aria.lunarEngine.sorceryPointsCurrent;
  const maxPoints = aria.lunarEngine.sorceryPointsMax;
  const innateActive = aria.lunarEngine.innateSorceryActive;
  const innateUses = aria.lunarEngine.innateSorceryUses;

  return (
    <div className="space-y-6">
      {/* Lunar Phase Selector Panel */}
      <SpotlightCard className="p-6 border-[#343a72] bg-gradient-to-b from-[#171b3f] to-[#0d1026]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(169,146,232,0.15)] border border-[#a992e8]/40 flex items-center justify-center text-[#a992e8]">
              <Moon size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                Lunar Sorcery Engine
              </h2>
              <p className="text-xs text-[#9aa1cc] font-[family-name:var(--font-mono)]">
                Embodiment of Cosmic Celestial Tides
              </p>
            </div>
          </div>

          <button
            onClick={onLongRest}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(217,184,114,0.15)] border border-[#d9b872]/40 text-[#d9b872] hover:bg-[#d9b872]/20 text-xs font-[family-name:var(--font-mono)] font-bold transition-all"
          >
            <RefreshCw size={14} /> Long Rest (Restore Slots & Points)
          </button>
        </div>

        {/* Phase Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Full Moon */}
          <div
            onClick={() => onPhaseChange('full')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              phase === 'full'
                ? 'bg-[rgba(242,239,224,0.1)] border-[#f2efe0] shadow-[0_0_20px_rgba(242,239,224,0.3)] scale-[1.02]'
                : 'bg-[#14183a]/60 border-[#262b57] hover:border-[#f2efe0]/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#f2efe0] shadow-[0_0_10px_rgba(242,239,224,0.8)] border border-white" />
              <div>
                <h3 className="font-bold text-sm text-[#f2efe0] font-[family-name:var(--font-heading)]">
                  Full Moon Phase
                </h3>
                <span className="text-[10px] text-[#d9b872] font-[family-name:var(--font-mono)]">
                  Abjuration & Divination
                </span>
              </div>
            </div>
            <p className="text-xs text-[#cfd4ee] leading-relaxed">
              Sorcery Point costs for Abjuration/Divination spells reduced by 1. Bonus spells: <em className="text-[#f2efe0]">Shield, Detect Magic, Dispel Magic, Moonbeam</em>.
            </p>
          </div>

          {/* New Moon */}
          <div
            onClick={() => onPhaseChange('new')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              phase === 'new'
                ? 'bg-[rgba(58,63,110,0.3)] border-[#a992e8] shadow-[0_0_20px_rgba(169,146,232,0.3)] scale-[1.02]'
                : 'bg-[#14183a]/60 border-[#262b57] hover:border-[#a992e8]/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#0d1026] border border-[#a992e8] shadow-[inset_4px_-1px_0_0_rgba(169,146,232,0.6)]" />
              <div>
                <h3 className="font-bold text-sm text-[#a992e8] font-[family-name:var(--font-heading)]">
                  New Moon Phase
                </h3>
                <span className="text-[10px] text-[#a992e8] font-[family-name:var(--font-mono)]">
                  Necromancy & Evocation
                </span>
              </div>
            </div>
            <p className="text-xs text-[#cfd4ee] leading-relaxed">
              Sorcery Point costs for Necromancy/Evocation spells reduced by 1. Bonus spells: <em className="text-[#a992e8]">Ray of Sickness, Darkness, Vampiric Touch</em>.
            </p>
          </div>

          {/* Crescent Moon */}
          <div
            onClick={() => onPhaseChange('crescent')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              phase === 'crescent'
                ? 'bg-[rgba(199,194,230,0.15)] border-[#c7c2e6] shadow-[0_0_20px_rgba(199,194,230,0.3)] scale-[1.02]'
                : 'bg-[#14183a]/60 border-[#262b57] hover:border-[#c7c2e6]/40 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#14183a] border border-[#c7c2e6] shadow-[inset_8px_-2px_0_0_#c7c2e6]" />
              <div>
                <h3 className="font-bold text-sm text-[#c7c2e6] font-[family-name:var(--font-heading)]">
                  Crescent Moon Phase
                </h3>
                <span className="text-[10px] text-[#c7c2e6] font-[family-name:var(--font-mono)]">
                  Illusion & Transmutation
                </span>
              </div>
            </div>
            <p className="text-xs text-[#cfd4ee] leading-relaxed">
              Sorcery Point costs for Illusion/Transmutation spells reduced by 1. Bonus spells: <em className="text-[#c7c2e6]">Color Spray, Alter Self, Invisibility</em>.
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* Sorcery Points & Innate Sorcery Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sorcery Points Tracker */}
        <SpotlightCard className="p-6 border-[#343a72] bg-[#14183a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#a992e8]" />
              <h3 className="text-lg font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                Sorcery Points
              </h3>
            </div>
            <span className="text-sm font-[family-name:var(--font-mono)] font-bold text-[#a992e8]">
              {currentPoints} / {maxPoints}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-6">
            {Array.from({ length: maxPoints }, (_, i) => {
              const isFilled = i < currentPoints;
              return (
                <button
                  key={i}
                  onClick={() => onSorceryPointsChange(isFilled ? i : i + 1)}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    isFilled
                      ? 'bg-[#a992e8] border-[#e8e6ff] shadow-[0_0_10px_rgba(169,146,232,0.8)] scale-105'
                      : 'bg-[#0d1026] border-[#343a72] opacity-50 hover:opacity-80'
                  }`}
                />
              );
            })}
          </div>

          {/* Quick Point Adjusters */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSorceryPointsChange(currentPoints - 1)}
              className="flex-1 py-1.5 bg-[#1d2249] hover:bg-[#343a72] border border-[#343a72] text-[#cfd4ee] rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold"
            >
              -1 Point
            </button>
            <button
              onClick={() => onSorceryPointsChange(currentPoints + 1)}
              className="flex-1 py-1.5 bg-[#1d2249] hover:bg-[#343a72] border border-[#343a72] text-[#cfd4ee] rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold"
            >
              +1 Point
            </button>
          </div>
        </SpotlightCard>

        {/* Innate Sorcery Card */}
        <SpotlightCard className={`p-6 border transition-all ${
          innateActive
            ? 'border-[#d9b872] bg-gradient-to-b from-[#1d2249] to-[#14183a] shadow-[0_0_25px_rgba(217,184,114,0.25)]'
            : 'border-[#343a72] bg-[#14183a]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className={innateActive ? 'text-[#d9b872] animate-bounce' : 'text-[#9aa1cc]'} />
              <h3 className="text-lg font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)]">
                Innate Sorcery
              </h3>
            </div>

            <span className="text-xs font-[family-name:var(--font-mono)] text-[#9aa1cc]">
              {innateUses} / 2 Uses Left
            </span>
          </div>

          <p className="text-xs text-[#cfd4ee] mb-4">
            Unleash starlight focus for 1 minute: <strong className="text-[#d9b872]">+1 Spell Save DC (DC 18)</strong> &amp; <strong className="text-[#a992e8]">Advantage on Sorcerer Spell Attack Rolls</strong>.
          </p>

          <button
            onClick={onToggleInnateSorcery}
            disabled={!innateActive && innateUses <= 0}
            className={`w-full py-2 rounded-lg font-bold text-xs font-[family-name:var(--font-mono)] tracking-wider transition-all flex items-center justify-center gap-2 ${
              innateActive
                ? 'bg-[#d9b872] text-black shadow-[0_0_15px_rgba(217,184,114,0.6)]'
                : innateUses > 0
                ? 'bg-[#1d2249] hover:bg-[#343a72] border border-[#a992e8] text-[#a992e8]'
                : 'bg-black/40 border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {innateActive ? '✨ INNATE SORCERY ACTIVE (CLICK TO DEACTIVATE)' : 'ACTIVATE INNATE SORCERY'}
          </button>
        </SpotlightCard>
      </div>

      {/* Metamagic Options Reference */}
      <SpotlightCard className="p-6 border-[#343a72] bg-[#14183a]">
        <h3 className="text-base font-bold text-[#e8e6ff] font-[family-name:var(--font-heading)] mb-3 flex items-center gap-2">
          <Wand2 size={16} className="text-[#a992e8]" /> Metamagic Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#0d1026] border border-[#262b57]">
            <div className="flex items-center justify-between text-xs font-bold text-[#a992e8] mb-1">
              <span>Quickened Spell</span>
              <span className="text-[10px] bg-[#1d2249] px-1.5 py-0.5 rounded text-[#cfd4ee]">2 Pts</span>
            </div>
            <p className="text-[11px] text-[#9aa1cc]">
              Cast a spell with a casting time of 1 action as a bonus action instead.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0d1026] border border-[#262b57]">
            <div className="flex items-center justify-between text-xs font-bold text-[#d9b872] mb-1">
              <span>Twinned Spell</span>
              <span className="text-[10px] bg-[#1d2249] px-1.5 py-0.5 rounded text-[#cfd4ee]">1-5 Pts</span>
            </div>
            <p className="text-[11px] text-[#9aa1cc]">
              Target a second creature in range with a single-target spell.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0d1026] border border-[#262b57]">
            <div className="flex items-center justify-between text-xs font-bold text-[#e8e6ff] mb-1">
              <span>Subtle Spell</span>
              <span className="text-[10px] bg-[#1d2249] px-1.5 py-0.5 rounded text-[#cfd4ee]">1 Pt</span>
            </div>
            <p className="text-[11px] text-[#9aa1cc]">
              Cast a spell without any verbal or somatic components.
            </p>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
