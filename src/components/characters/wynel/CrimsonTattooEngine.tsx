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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/90 via-[#19060b]/95 to-black border-2 border-red-500/50 shadow-[0_12px_40px_rgba(239,68,68,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/40 border border-red-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Flame size={13} className="text-red-400" /> Warlock Pact Magic
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-100 font-['Cormorant_Garamond',serif] tracking-wider">
              Pact Slots (Level {pactEngine.slotLevel})
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed mt-1">
              All Warlock leveled spells are automatically cast at <strong>Level {pactEngine.slotLevel}</strong>.
              Unlike other casters, your pact slots recover completely on a <strong>Short Rest</strong> or Long Rest!
            </p>
          </div>

          {/* Quick Rest Recovery Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShortRest}
              className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-rose-100 border border-red-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <RefreshCw size={13} className="text-rose-400" />
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
                      : 'bg-red-950/80 border-red-500 text-rose-200 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
                  }`}
                  title={isUsed ? 'Click to restore slot' : 'Click to expend slot'}
                >
                  <Flame size={20} className={isUsed ? 'text-zinc-600' : 'text-red-400'} />
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
              <div className="text-[11px] font-mono text-zinc-500">
                Spell DC: <strong className="text-rose-300">{spellcasting.spellSaveDC}</strong> &bull; Spell Attack: <strong className="text-rose-300">+{spellcasting.spellAttackBonus}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onUsePactSlot}
              disabled={availableSlots <= 0}
              className="px-3.5 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/50 text-rose-200 text-xs font-mono font-bold disabled:opacity-40 cursor-pointer"
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
        <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/90 border border-red-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-950 border border-red-500/60 text-rose-400">
                  <Heart size={20} className="fill-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-100 font-serif">
                    The Crimson Heart-Tattoo
                  </h3>
                  <span className="text-[11px] font-mono text-rose-400 uppercase tracking-widest block">
                    Pact of the Tome &bull; Maternal Grimoire
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleCrimsonPulse}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                  pactEngine.crimsonPulseUsed
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    : 'bg-red-900/60 border-red-500 text-rose-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer'
                }`}
              >
                {pactEngine.crimsonPulseUsed ? 'Used this Rest' : 'Channel Pulse (+1d4)'}
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-red-950">
              Before the palace fell, Wyn&apos;el&apos;s mother burned her ancestral grimoire into his very flesh.
              The ink beats like a living heart across his collarbone, allowing him to channel reality-warping chaos sigils and ritual enchantments.
            </p>

            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
                Tome Cantrips (Any Class List):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-rose-200">
                  <div className="font-bold text-rose-100">Guidance</div>
                  <div className="text-[10px] text-zinc-400">Touch &bull; +1d4 Check</div>
                </div>
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-rose-200">
                  <div className="font-bold text-rose-100">Vicious Mockery</div>
                  <div className="text-[10px] text-zinc-400">60ft &bull; 1d4 Psychic</div>
                </div>
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-rose-200">
                  <div className="font-bold text-rose-100">Spare the Dying</div>
                  <div className="text-[10px] text-zinc-400">Touch &bull; Stabilize</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Scarlet Witch Chaos Surge:</span>
            <button
              onClick={onToggleChaosAura}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                pactEngine.chaosAuraActive
                  ? 'bg-red-600 text-white shadow-[0_0_15px_#ef4444]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-rose-300'
              }`}
            >
              {pactEngine.chaosAuraActive ? 'Chaos Flare Active' : 'Toggle Chaos Flare'}
            </button>
          </div>
        </SpotlightCard>

        {/* Archfey Patron Feature: Fey Presence */}
        <SpotlightCard className="p-6 rounded-3xl bg-zinc-950/90 border border-red-500/40 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-950 border border-rose-500/60 text-rose-400">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-100 font-serif">
                    Fey Presence (Scarlet Wave)
                  </h3>
                  <span className="text-[11px] font-mono text-rose-400 uppercase tracking-widest block">
                    The Archfey &bull; 10-ft Cube
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleFeyPresence}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                  pactEngine.feyPresenceUsed
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    : 'bg-rose-900/60 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer'
                }`}
              >
                {pactEngine.feyPresenceUsed ? 'Expended' : 'Unleash Presence'}
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-red-950">
              As an action, you can cause each creature in a <strong>10-foot cube</strong> originating from you to make a <strong>WIS saving throw (DC {spellcasting.spellSaveDC})</strong>.
              On a failed save, the creatures become <strong>charmed or frightened</strong> by you (your choice) until the end of your next turn.
            </p>

            <div className="p-3 rounded-2xl bg-red-950/30 border border-red-900/40 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Save DC:</span>
                <strong className="text-rose-300">DC {spellcasting.spellSaveDC} Wisdom</strong>
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
            <Shield size={12} className="text-red-400" />
            Empowered by his bargain with the Gloaming Court of the Archfey.
          </div>
        </SpotlightCard>
      </div>

      {/* 3. Eldritch Invocations Grid */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-red-900/40 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-widest text-rose-300 font-bold mb-4 flex items-center gap-2">
          <Zap size={14} className="text-red-400" />
          Eldritch Invocations (Level 3 &bull; 2 Active)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {wynel.invocations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-red-900/30 hover:border-red-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-rose-100 font-serif">{inv.name}</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-rose-300 border border-red-500/30 font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{inv.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
