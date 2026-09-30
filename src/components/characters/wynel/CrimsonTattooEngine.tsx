'use client';

import React from 'react';
import { Flame, Sparkles, Heart, Zap, RefreshCw, Moon, Eye, BookOpen, Shield, Dices } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { WynelState } from '@/lib/wynel-engine';

interface CrimsonTattooEngineProps {
  wynel: WynelState;
  onUsePactSlot: () => void;
  onRestorePactSlot: () => void;
  onShortRest: () => void;
  onLongRest: () => void;
  onToggleFeyPresence: () => void;
  onToggleCrimsonPulse: () => void;
  onToggleChaosAura: () => void;
}

export default function CrimsonTattooEngine({
  wynel,
  onUsePactSlot,
  onRestorePactSlot,
  onShortRest,
  onLongRest,
  onToggleFeyPresence,
  onToggleCrimsonPulse,
  onToggleChaosAura,
}: CrimsonTattooEngineProps) {
  const { pactEngine, spellcasting } = wynel;
  const availableSlots = Math.max(0, pactEngine.slotsMax - pactEngine.slotsUsed);

  return (
    <div className="space-y-6">
      {/* 1. Pact Magic Slots & Rest Management Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-950/90 via-[#1c0816]/95 to-black border-2 border-pink-500/50 shadow-[0_12px_40px_rgba(236,72,153,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-900/40 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Flame size={13} className="text-pink-400" /> Warlock Pact Magic
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-pink-100 font-['Cormorant_Garamond',serif] tracking-wider">
              Pact Slots (Level {pactEngine.slotLevel})
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl leading-relaxed mt-1">
              All Warlock leveled spells are automatically cast at <strong>Level {pactEngine.slotLevel}</strong>.
              Unlike other casters, your pact slots recover completely on a <strong>Short Rest</strong> or Long Rest!
            </p>
          </div>

          {/* Quick Rest Recovery Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShortRest}
              className="px-4 py-2 rounded-xl bg-pink-900/60 hover:bg-pink-800 text-pink-100 border border-pink-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <RefreshCw size={13} className="text-pink-300" />
              Short Rest (1 hr)
            </button>
            <button
              onClick={onLongRest}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Moon size={13} className="text-indigo-300" />
              Long Rest
            </button>
          </div>
        </div>

        {/* Slot Crystals & Controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Array.from({ length: pactEngine.slotsMax }).map((_, idx) => {
              const isUsed = idx >= availableSlots;
              return (
                <div
                  key={idx}
                  onClick={isUsed ? onRestorePactSlot : onUsePactSlot}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer select-none ${
                    isUsed
                      ? 'bg-zinc-900/80 border-zinc-700 text-zinc-600'
                      : 'bg-pink-950/80 border-pink-500 text-pink-200 shadow-[0_0_25px_rgba(236,72,153,0.5)] animate-pulse'
                  }`}
                  title={isUsed ? 'Click to restore slot' : 'Click to expend slot'}
                >
                  <Flame size={20} className={isUsed ? 'text-zinc-600' : 'text-pink-400'} />
                  <span className="text-[10px] font-mono font-bold mt-0.5">
                    {isUsed ? 'Used' : `Lv ${pactEngine.slotLevel}`}
                  </span>
                </div>
              );
            })}

            <div className="ml-2">
              <div className="text-xs font-mono text-zinc-300">
                <strong>{availableSlots}</strong> of <strong>{pactEngine.slotsMax}</strong> Available
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Spell DC: <strong className="text-pink-300">{spellcasting.spellSaveDC}</strong> &bull; Spell Attack: <strong className="text-pink-300">+{spellcasting.spellAttackBonus}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onUsePactSlot}
              disabled={availableSlots <= 0}
              className="px-3.5 py-1.5 rounded-xl bg-pink-950 hover:bg-pink-900 border border-pink-500/50 text-pink-200 text-xs font-mono font-bold disabled:opacity-40 cursor-pointer"
            >
              Cast Leveled Spell (-1 Slot)
            </button>
            <button
              onClick={onRestorePactSlot}
              disabled={pactEngine.slotsUsed <= 0}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-bold disabled:opacity-40 cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      </div>

      {/* 2. The Crimson Heart-Tattoo & Scarlet Chaos Array */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pact Emblem: The Crimson Heart-Tattoo Card */}
        <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/90 border border-pink-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-950 border border-pink-500/60 text-pink-400">
                  <Heart size={20} className="fill-pink-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-pink-100 font-serif">
                    The Crimson Heart-Tattoo
                  </h3>
                  <span className="text-[11px] font-mono text-pink-400 uppercase tracking-widest block font-bold">
                    Pact of the Tome &bull; Maternal Grimoire
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleCrimsonPulse}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                  pactEngine.crimsonPulseUsed
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    : 'bg-pink-900/60 border-pink-500 text-pink-100 shadow-[0_0_15px_rgba(236,72,153,0.4)] cursor-pointer'
                }`}
              >
                {pactEngine.crimsonPulseUsed ? 'Used this Rest' : 'Channel Pulse (+1d4)'}
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-pink-950/60">
              Before the palace fell, Wyn&apos;el&apos;s mother burned her ancestral grimoire into his very flesh.
              The ink beats like a living heart across his collarbone, allowing him to channel reality-warping chaos sigils and ritual enchantments.
            </p>

            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
                Tome Cantrips (Any Class List):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-900/50 text-pink-200">
                  <div className="font-bold text-pink-100">Guidance</div>
                  <div className="text-[10px] text-zinc-400">Touch &bull; +1d4 Check</div>
                </div>
                <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-900/50 text-pink-200">
                  <div className="font-bold text-pink-100">Vicious Mockery</div>
                  <div className="text-[10px] text-zinc-400">60ft &bull; 1d4 Psychic</div>
                </div>
                <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-900/50 text-pink-200">
                  <div className="font-bold text-pink-100">Spare the Dying</div>
                  <div className="text-[10px] text-zinc-400">Touch &bull; Stabilize</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Fey Chaos Surge:</span>
            <button
              onClick={onToggleChaosAura}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                pactEngine.chaosAuraActive
                  ? 'bg-pink-600 text-white shadow-[0_0_15px_#ec4899]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-pink-300'
              }`}
            >
              {pactEngine.chaosAuraActive ? 'Chaos Flare Active' : 'Toggle Chaos Flare'}
            </button>
          </div>
        </SpotlightCard>

        {/* Archfey Patron Feature: Fey Presence */}
        <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/90 border border-pink-500/40 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-950 border border-pink-500/60 text-pink-400">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-pink-100 font-serif">
                    Fey Presence (Rose Wave)
                  </h3>
                  <span className="text-[11px] font-mono text-pink-400 uppercase tracking-widest block font-bold">
                    The Archfey &bull; 10-ft Cube
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleFeyPresence}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                  pactEngine.feyPresenceUsed
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    : 'bg-pink-900/60 border-pink-500 text-pink-100 shadow-[0_0_15px_rgba(236,72,153,0.4)] cursor-pointer'
                }`}
              >
                {pactEngine.feyPresenceUsed ? 'Expended' : 'Unleash Presence'}
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-pink-950/60">
              As an action, you can cause each creature in a <strong>10-foot cube</strong> originating from you to make a <strong>WIS saving throw (DC {spellcasting.spellSaveDC})</strong>.
              On a failed save, the creatures become <strong>charmed or frightened</strong> by you (your choice) until the end of your next turn.
            </p>

            <div className="p-3 rounded-2xl bg-pink-950/30 border border-pink-900/40 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Save DC:</span>
                <strong className="text-pink-300">DC {spellcasting.spellSaveDC} Wisdom</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Range:</span>
                <strong className="text-zinc-200">10-foot cube</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Recovery:</span>
                <strong className="text-amber-300">Short or Long Rest</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <Shield size={12} className="text-pink-400" />
            Empowered by his bargain with the Gloaming Court of the Archfey.
          </div>
        </SpotlightCard>
      </div>

      {/* 3. Eldritch Invocations Grid */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-pink-900/40 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-widest text-pink-300 font-bold mb-4 flex items-center gap-2">
          <Zap size={14} className="text-pink-400" />
          Eldritch Invocations (Level 3 &bull; 2 Active)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {wynel.invocations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-pink-900/30 hover:border-pink-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-pink-100 font-serif">{inv.name}</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{inv.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
