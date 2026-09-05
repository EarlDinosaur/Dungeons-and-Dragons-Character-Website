'use client';

import { useState } from 'react';
import { Sun, Sparkles, Heart, Eye, Flame, RotateCcw, Zap, Shield, Moon, Dices } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CyrusState } from '@/lib/cyrus-engine';
import { useCharacter } from '@/app/providers';

interface CyrusOracleEngineProps {
  cyrus: CyrusState;
  onToggleRadiantSoul: () => void;
  onUseHealingHands: () => void;
  onUseEpiphany: () => void;
  onUseSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onLongRest: () => void;
}

const AUGURY_OMENS = [
  { title: 'WEAL', type: 'weal', color: 'text-emerald-300 border-emerald-500 bg-emerald-950/60', description: 'The sun shines brightly upon this path. Divine favor awaits.' },
  { title: 'WOE', type: 'woe', color: 'text-red-300 border-red-500 bg-red-950/60', description: 'Shadows darken this choice. Peril and grief lie ahead.' },
  { title: 'WEAL & WOE', type: 'both', color: 'text-amber-300 border-amber-500 bg-amber-950/60', description: 'Great glory and tragic cost are bound together in equal measure.' },
  { title: 'NOTHING', type: 'nothing', color: 'text-gray-300 border-gray-600 bg-black/80', description: 'The solar threads are silent. The outcome remains unwritten by the gods.' },
];

export default function CyrusOracleEngine({
  cyrus,
  onToggleRadiantSoul,
  onUseHealingHands,
  onUseEpiphany,
  onUseSpellSlot,
  onRestoreSpellSlot,
  onLongRest,
}: CyrusOracleEngineProps) {
  const { showToastNotification } = useCharacter();
  const [confirmRest, setConfirmRest] = useState(false);
  const [activeOmen, setActiveOmen] = useState<typeof AUGURY_OMENS[0] | null>(null);
  const [isConsultingOracle, setIsConsultingOracle] = useState(false);

  const oEngine = cyrus.oracleEngine;
  const slots = cyrus.spellcasting.slots;

  const handleCastEpiphany = () => {
    setIsConsultingOracle(true);
    setActiveOmen(null);
    onUseEpiphany();

    setTimeout(() => {
      const idx = Math.floor(Math.random() * AUGURY_OMENS.length);
      const omen = AUGURY_OMENS[idx];
      setActiveOmen(omen);
      setIsConsultingOracle(false);
    }, 700);
  };

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ============== SOLAR ORACLE MYSTERY PANEL ============== */}
      <SpotlightCard className="p-6 border border-[#daa520]/50 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)] shadow-[0_0_30px_rgba(218,165,32,0.15)]">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#daa520]/25">
          <Sun size={22} className="text-[#daa520]" />
          <h3 className="text-xl font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
            Solar Oracle Mystery
          </h3>
          <span className="ml-auto text-[10px] font-mono text-[#b89d5e] bg-black/50 px-2 py-0.5 rounded border border-[#daa520]/20">
            Level {cyrus.level} Oracle
          </span>
        </div>

        {/* ---- RADIANT SOUL TRANSFORMATION ---- */}
        <div className={`p-4 rounded-xl border mb-4 transition-all duration-500 ${
          oEngine.radiantSoulActive
            ? 'bg-[rgba(255,215,0,0.15)] border-[#daa520] shadow-[0_0_25px_rgba(255,215,0,0.3)]'
            : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className={oEngine.radiantSoulActive ? 'text-[#ffd700] animate-pulse' : 'text-amber-200/50'} />
              <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] text-lg">
                Radiant Soul Transformation
              </h4>
            </div>
            <button
              onClick={onToggleRadiantSoul}
              disabled={oEngine.radiantSoulUsed && !oEngine.radiantSoulActive}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border shadow-md flex items-center justify-center ${
                oEngine.radiantSoulActive
                  ? 'bg-[#daa520] text-black border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:bg-[#ffd700]'
                  : oEngine.radiantSoulUsed
                    ? 'bg-black/40 text-gray-500 border-gray-700 cursor-not-allowed'
                    : 'bg-[rgba(218,165,32,0.15)] text-[#daa520] border-[#daa520]/40 hover:bg-[rgba(218,165,32,0.3)]'
              }`}
            >
              {oEngine.radiantSoulActive ? '☀️ ACTIVE — Deactivate' : oEngine.radiantSoulUsed ? '🌑 Used (Long Rest)' : '✨ Activate Wings'}
            </button>
          </div>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            Transform for 1 minute. Gain <strong className="text-amber-200">30-ft flying speed</strong> and deal
            <strong className="text-[#daa520]"> +{cyrus.level} radiant damage</strong> once per turn with attacks and spells.
            {oEngine.radiantSoulActive && (
              <span className="ml-1 text-[#ffd700] font-bold animate-pulse block mt-1">✦ Wings of golden light unfurl from your back! +{cyrus.level} Radiant damage active.</span>
            )}
          </p>
        </div>

        {/* ---- HEALING HANDS ---- */}
        <div className="p-4 rounded-xl border bg-black/40 border-white/10 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Heart size={18} className={oEngine.healingHandsUsed ? 'text-amber-200/30' : 'text-emerald-400'} />
              <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] text-base">
                Healing Hands
              </h4>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                Heal Pool: {cyrus.level} HP
              </span>
            </div>
            <button
              onClick={onUseHealingHands}
              disabled={oEngine.healingHandsUsed}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border flex items-center justify-center ${
                oEngine.healingHandsUsed
                  ? 'bg-black/40 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-emerald-950/80 text-emerald-200 border-emerald-700/40 hover:bg-emerald-900 shadow-md'
              }`}
            >
              {oEngine.healingHandsUsed ? '✓ Used' : '🤲 Restore HP'}
            </button>
          </div>
          <p className="text-xs text-amber-200/60">
            Touch a creature to heal <strong className="text-amber-200">{cyrus.level} hit points</strong> (equal to your level). Recharges on long rest.
          </p>
        </div>

        {/* ---- EPIPHANY (Bonus Augury & Omen Generator) ---- */}
        <div className="p-4 rounded-xl border bg-black/40 border-white/10 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <Eye size={18} className={oEngine.epiphanyUsed ? 'text-amber-200/30' : 'text-[#daa520]'} />
              <h4 className="font-bold text-amber-200 font-['Cormorant_Garamond',serif] text-base">
                Epiphany &bull; Augury Divination
              </h4>
            </div>
            <button
              onClick={handleCastEpiphany}
              disabled={oEngine.epiphanyUsed || isConsultingOracle}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border flex items-center justify-center ${
                oEngine.epiphanyUsed
                  ? 'bg-black/40 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-[rgba(218,165,32,0.15)] text-[#daa520] border-[#daa520]/40 hover:bg-[rgba(218,165,32,0.3)] shadow-md'
              }`}
            >
              {isConsultingOracle ? '👁️ Gazing...' : oEngine.epiphanyUsed ? '✓ Epiphany Used' : '👁️ Consult Omen'}
            </button>
          </div>

          <p className="text-xs text-amber-200/60 mb-2">
            Cast <strong className="text-amber-200">Augury</strong> as a bonus action without a spell slot or material components. Receive an omen of the future.
          </p>

          {/* Active Omen Result Card */}
          {(isConsultingOracle || activeOmen) && (
            <div className="mt-3 p-3 rounded-xl border bg-black/70 font-mono text-xs text-center animate-fade-in-up">
              {isConsultingOracle ? (
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Dices size={16} className="animate-spin" />
                  <span>The flames of Apollo dance... deciphering fate...</span>
                </div>
              ) : activeOmen ? (
                <div className={`p-3 rounded-lg border ${activeOmen.color}`}>
                  <span className="text-lg font-bold font-['Cormorant_Garamond',serif] block uppercase tracking-widest">
                    ☀️ OMEN OF APOLLO: {activeOmen.title}
                  </span>
                  <span className="text-xs opacity-90 leading-relaxed block mt-1">
                    {activeOmen.description}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ---- ORACLE CURSE: LAME ---- */}
        <div className="p-4 rounded-xl border bg-[rgba(200,80,80,0.06)] border-red-900/25">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🦯</span>
            <h4 className="font-bold text-amber-200/80 font-['Cormorant_Garamond',serif]">
              Oracle Curse: Lame
            </h4>
          </div>
          <p className="text-xs text-amber-200/50 leading-relaxed">
            Speed reduced by 10 ft (current: <strong className="text-amber-200">{cyrus.combat.speed} ft</strong>). Speed can never be reduced unless specifically to 0 ft.
            At 3rd level, suffer no effect from 1st or 2nd levels of exhaustion.
          </p>
        </div>
      </SpotlightCard>

      {/* ============== SPELL SLOTS ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#daa520]/25">
          <Zap size={18} className="text-[#daa520]" />
          <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
            Spell Slots
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([1, 2] as const).map((level) => {
            const slot = slots[level];
            if (!slot || slot.max === 0) return null;
            const available = slot.max - slot.used;
            return (
              <div key={level} className="p-3 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-amber-200 font-['Cormorant_Garamond',serif]">
                    Level {level} Slots
                  </h4>
                  <span className="text-xs font-mono text-[#daa520]">{available}/{slot.max}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: slot.max }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        i < available
                          ? 'bg-[#daa520] border-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.4)]'
                          : 'bg-black/60 border-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUseSpellSlot(level)}
                    disabled={available <= 0}
                    className="flex-1 text-xs font-mono font-bold px-3 py-2 rounded-lg bg-red-950/60 text-red-300 border border-red-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-900/60 transition-colors flex items-center justify-center"
                  >
                    Use Slot
                  </button>
                  <button
                    onClick={() => onRestoreSpellSlot(level)}
                    disabled={slot.used <= 0}
                    className="flex-1 text-xs font-mono font-bold px-3 py-2 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-900/60 transition-colors flex items-center justify-center"
                  >
                    Restore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SpotlightCard>

      {/* ============== LONG REST ============== */}
      <SpotlightCard className="p-5 glass-card border border-[#daa520]/40 bg-[linear-gradient(135deg,rgba(26,22,8,0.95)_0%,rgba(13,10,6,0.98)_100%)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Moon size={18} className="text-[#daa520]" />
            <h3 className="text-lg font-bold text-amber-200 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Rest at the Temple
            </h3>
          </div>

          {confirmRest ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-amber-200/70 block w-full sm:w-auto">Confirm long rest?</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onLongRest();
                    setConfirmRest(false);
                  }}
                  className="flex-1 sm:flex-none text-xs font-mono font-bold px-4 py-2 rounded-lg bg-[#daa520] text-black border border-[#ffd700] shadow-md hover:bg-[#ffd700] transition-all"
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setConfirmRest(false)}
                  className="flex-1 sm:flex-none text-xs font-mono font-bold px-4 py-2 rounded-lg bg-black/60 text-gray-400 border border-gray-700 hover:text-white transition-all"
                >
                  ✗ Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRest(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[rgba(218,165,32,0.12)] hover:bg-[rgba(218,165,32,0.25)] text-[#daa520] border border-[#daa520]/40 hover:border-[#daa520] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <RotateCcw size={13} /> Long Rest
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-amber-200/50">
          Full HP restored, all spell slots recovered, Healing Hands &amp; Radiant Soul &amp; Epiphany recharged.
        </p>
      </SpotlightCard>
    </div>
  );
}
