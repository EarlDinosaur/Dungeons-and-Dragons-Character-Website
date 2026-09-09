'use client';

import { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Compass,
  Zap,
  Shield,
  Dices,
  Heart,
  Eye,
  Crosshair,
  Flame,
  Radio,
  Swords,
  Scroll,
  Wind,
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { KastorielState, StarryConstellation } from '@/lib/kastoriel-engine';
import { useCharacter } from '@/app/providers';

interface StarryFormEngineProps {
  kastoriel: KastorielState;
  onConstellationChange: (constellation: StarryConstellation) => void;
  onUseWildShape: () => void;
  onRestoreWildShape: () => void;
  onRollCosmicOmen: () => void;
  onUseCosmicOmen: () => void;
  onUseGuidingBoltFree: () => void;
  onRestoreGuidingBoltFree: () => void;
  onLongRest: () => void;
}

export default function StarryFormEngine({
  kastoriel,
  onConstellationChange,
  onUseWildShape,
  onRestoreWildShape,
  onRollCosmicOmen,
  onUseCosmicOmen,
  onUseGuidingBoltFree,
  onRestoreGuidingBoltFree,
  onLongRest,
}: StarryFormEngineProps) {
  const { showToastNotification } = useCharacter();
  const [confirmRest, setConfirmRest] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const sEngine = kastoriel.starryEngine;
  const activeConstellation = sEngine.activeConstellation;
  const isFormActive = activeConstellation !== 'none';

  const handlePulseTether = () => {
    setPulseAnimation(true);
    showToastNotification(
      'Pendulum Soul-Tether',
      'The blade hums with golden heat. Poluxien is moving relentlessly through the northern passes.',
      'spell'
    );
    setTimeout(() => setPulseAnimation(false), 1200);
  };

  return (
    <div className="space-y-6 font-['Spectral',serif]">
      {/* ====================================================================
         1. STARRY FORM (TWINKLING CONSTELLATIONS LV 10)
         ==================================================================== */}
      <SpotlightCard className="p-6 border border-amber-500/50 bg-[linear-gradient(135deg,rgba(26,18,8,0.95)_0%,rgba(13,10,6,0.98)_100%)] shadow-[0_0_30px_rgba(245,158,11,0.18)] rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-amber-500/25">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-amber-400 animate-pulse" />
            <h3 className="text-xl font-bold text-amber-100 font-['Cormorant_Garamond',serif] uppercase tracking-wider">
              Starry Form &bull; Twinkling Constellations
            </h3>
          </div>

          {/* Wild Shape Usage Pips */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-300/80">Wild Shape:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: sEngine.wildShapeMax }).map((_, idx) => {
                const isAvailable = idx < sEngine.wildShapeMax - sEngine.wildShapeUsed;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isAvailable) onUseWildShape();
                      else onRestoreWildShape();
                    }}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-105'
                        : 'bg-black/60 border-zinc-700'
                    }`}
                    title={isAvailable ? 'Click to expend Wild Shape' : 'Click to restore Wild Shape'}
                  />
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              ({sEngine.wildShapeMax - sEngine.wildShapeUsed}/{sEngine.wildShapeMax})
            </span>
          </div>
        </div>

        {/* Constellation Selector Buttons (Level 10: Can change constellation every turn!) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* ARCHER */}
          <button
            type="button"
            onClick={() => onConstellationChange(activeConstellation === 'archer' ? 'none' : 'archer')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              activeConstellation === 'archer'
                ? 'bg-gradient-to-b from-amber-950/80 to-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] scale-[1.02]'
                : 'bg-black/40 border-zinc-800 hover:border-amber-600/50 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-['Cormorant_Garamond',serif] font-bold text-lg text-amber-200">
                <Crosshair size={18} className="text-amber-400" />
                <span>The Archer</span>
              </div>
              {activeConstellation === 'archer' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-400 text-black shadow-xs">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed font-serif">
              Luminous starlight bow. As a bonus action, make a ranged spell attack:
              <strong className="text-amber-300 block mt-1 font-mono">2d8 + 5 Radiant Damage (60 ft)</strong>
            </p>
          </button>

          {/* CHALICE */}
          <button
            type="button"
            onClick={() => onConstellationChange(activeConstellation === 'chalice' ? 'none' : 'chalice')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              activeConstellation === 'chalice'
                ? 'bg-gradient-to-b from-emerald-950/80 to-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                : 'bg-black/40 border-zinc-800 hover:border-emerald-600/50 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-['Cormorant_Garamond',serif] font-bold text-lg text-emerald-200">
                <Heart size={18} className="text-emerald-400" />
                <span>The Chalice</span>
              </div>
              {activeConstellation === 'chalice' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-400 text-black shadow-xs">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed font-serif">
              Overflowing starry cup. Whenever you cast a spell using a slot that restores HP:
              <strong className="text-emerald-300 block mt-1 font-mono">+2d8 + 5 Extra Healing to nearby ally</strong>
            </p>
          </button>

          {/* DRAGON */}
          <button
            type="button"
            onClick={() => onConstellationChange(activeConstellation === 'dragon' ? 'none' : 'dragon')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              activeConstellation === 'dragon'
                ? 'bg-gradient-to-b from-orange-950/80 to-black border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.35)] scale-[1.02]'
                : 'bg-black/40 border-zinc-800 hover:border-orange-600/50 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-['Cormorant_Garamond',serif] font-bold text-lg text-orange-200">
                <Wind size={18} className="text-orange-400" />
                <span>The Dragon</span>
              </div>
              {activeConstellation === 'dragon' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-orange-400 text-black shadow-xs">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-orange-200/70 leading-relaxed font-serif">
              Wise cosmic dragon. INT/WIS checks &amp; CON concentration saves under 9 become a 10:
              <strong className="text-orange-300 block mt-1 font-mono">20 ft Flying Speed (Hover)</strong>
            </p>
          </button>
        </div>

        {isFormActive && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-200">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400 animate-spin" />
              <span>
                Twinkling Constellations (Lv 10): You can switch constellations freely at the start of your turn!
              </span>
            </span>
            <button
              type="button"
              onClick={() => onConstellationChange('none')}
              className="px-2.5 py-1 rounded bg-black/60 hover:bg-black text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
            >
              Dismiss Form
            </button>
          </div>
        )}
      </SpotlightCard>

      {/* ====================================================================
         2. COSMIC OMEN (WEAL & WOE) + STAR MAP GUIDING BOLT
         ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cosmic Omen Panel */}
        <SpotlightCard className="p-5 border border-amber-500/40 bg-black/60 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-amber-400" />
              <h4 className="font-bold text-amber-100 font-['Cormorant_Garamond',serif] text-lg">
                Cosmic Omen (Weal / Woe)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Reaction (30 ft)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Current Omen:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-bold font-mono uppercase px-2.5 py-0.5 rounded-lg border ${
                    sEngine.cosmicOmen === 'weal'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/80 border-red-500 text-red-300'
                  }`}
                >
                  {sEngine.cosmicOmen === 'weal' ? 'WEAL (Add 1d6)' : 'WOE (Subtract 1d6)'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  (Rolled {sEngine.cosmicOmenRoll})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onRollCosmicOmen}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Dices size={14} />
              <span>Consult Stars</span>
            </button>
          </div>

          {/* Omen Reaction Uses Pips */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Omen Reactions Available:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: sEngine.cosmicOmenUsesMax }).map((_, idx) => {
                const isAvailable = idx < sEngine.cosmicOmenUsesMax - sEngine.cosmicOmenUsesUsed;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={onUseCosmicOmen}
                    className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-black/80 border-zinc-700'
                    }`}
                    title={isAvailable ? 'Click to expend Cosmic Omen' : 'Expended'}
                  />
                );
              })}
            </div>
          </div>
        </SpotlightCard>

        {/* Star Map Guiding Bolt Free Casts */}
        <SpotlightCard className="p-5 border border-amber-500/40 bg-black/60 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-amber-400" />
              <h4 className="font-bold text-amber-100 font-['Cormorant_Garamond',serif] text-lg">
                Star Map Free Guiding Bolts
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              No Slot Expended
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-serif leading-relaxed">
            Your carved obsidian Star Map allows you to channel pure celestial starlight, casting 
            <strong className="text-amber-300 font-mono"> Guiding Bolt (4d6 Radiant)</strong> a number of times equal to your proficiency bonus without expending spell slots.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-400">Free Casts Remaining:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: sEngine.freeGuidingBoltMax }).map((_, idx) => {
                const isAvailable = idx < sEngine.freeGuidingBoltMax - sEngine.freeGuidingBoltUsed;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isAvailable) onUseGuidingBoltFree();
                      else onRestoreGuidingBoltFree();
                    }}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                        : 'bg-black/80 border-zinc-700'
                    }`}
                    title={isAvailable ? 'Click to expend free cast' : 'Click to restore'}
                  />
                );
              })}
              <span className="text-zinc-400 ml-1">
                ({sEngine.freeGuidingBoltMax - sEngine.freeGuidingBoltUsed}/{sEngine.freeGuidingBoltMax})
              </span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ====================================================================
         3. PENDULUM — THE STOLEN BLADE & TWIN SOUL-TETHER
         ==================================================================== */}
      <SpotlightCard className="p-6 border border-orange-500/50 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15)_0%,rgba(10,12,18,0.98)_100%)] shadow-2xl rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-orange-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-950/60 border border-orange-600/50 text-orange-300">
              <Swords size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-100 font-['Cormorant_Garamond',serif] text-xl">
                Pendulum &bull; The Stolen Tether Blade
              </h4>
              <span className="text-[11px] font-mono text-orange-300/80">
                Bound Artifact Blade &bull; Linked to Twin Brother Poluxien
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePulseTether}
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              pulseAnimation
                ? 'bg-orange-500 text-black border-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-105'
                : 'bg-orange-950/60 hover:bg-orange-900 text-orange-200 border-orange-600/60 shadow-md'
            }`}
          >
            <Radio size={14} className={pulseAnimation ? 'animate-ping' : ''} />
            <span>Pulse Tether</span>
          </button>
        </div>

        {/* Narrative & Mechanical Tether Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono mb-4">
          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Soul-Tether State</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Harmonized &bull; Linked
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Estimated Distance</span>
            <span className="font-bold text-amber-300">{sEngine.poluxienDistance}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Heading / Vector</span>
            <span className="font-bold text-orange-300">{sEngine.poluxienDirection}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-serif leading-relaxed italic p-3 rounded-xl bg-black/40 border-l-2 border-l-orange-500">
          &ldquo;Stolen on the night of the ritual N’elestel to prevent Poluxien&apos;s soul from being devoured. 
          While Poluxien hunts you with bitter vengeance, the blade vibrates with warmth, alerting you to his approach.&rdquo;
        </p>
      </SpotlightCard>

      {/* Long Rest Restoration Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
        <span className="text-zinc-400">
          Restore Wild Shape, Cosmic Omen, and Star Map uses on Long Rest:
        </span>
        {confirmRest ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLongRest();
                setConfirmRest(false);
              }}
              className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
            >
              Confirm Rest
            </button>
            <button
              type="button"
              onClick={() => setConfirmRest(false)}
              className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRest(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw size={13} />
            <span>Long Rest</span>
          </button>
        )}
      </div>
    </div>
  );
}
