'use client';

import React from 'react';
import { useCharacter } from '@/app/providers';

interface WynelScarletSigilProps {
  chaosAuraActive?: boolean;
}

export default function WynelScarletSigil({ chaosAuraActive = false }: WynelScarletSigilProps) {
  const { getBackgroundUrl } = useCharacter();
  const customBg = getBackgroundUrl('wynel');

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0507]">
      {/* ====================================================================
         1. HERO FEYWILD / ARCHFEY BACKGROUND IMAGE (Uploaded or Preset)
         ==================================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={customBg || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
          alt="Wyn'el Feywild Chaos Background"
          className="w-full h-full object-cover object-center scale-105 opacity-70 transition-all duration-1000 filter brightness-95 contrast-115 pointer-events-none"
        />
      </div>

      {/* ====================================================================
         2. SCARLET CHAOS ATMOSPHERE & PULSING AMBIENCE
         ==================================================================== */}
      {/* Base warm scarlet/crimson radiance */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(225,29,72,0.30), rgba(159,18,57,0.18) 35%, transparent 65%),
            radial-gradient(circle at 15% 80%, rgba(136,19,55,0.25), transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(225,29,72,0.20), transparent 45%)
          `,
        }}
      />

      {/* Pulsing Chaos Magic Ambient Glows */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-b from-rose-600/30 via-red-700/20 to-transparent blur-3xl transition-all duration-1000 mix-blend-screen pointer-events-none ${
          chaosAuraActive ? 'opacity-100 scale-120 animate-pulse' : 'opacity-65'
        }`}
      />
      <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-red-600/15 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-rose-700/15 blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Bottom Mist Fade for Character Sheet Readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(10,5,7,0.65)] to-[#0a0507]" />
      </div>

      {/* Atmospheric Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_35%,rgba(10,5,7,0.70)_100%)] pointer-events-none" />

      {/* ====================================================================
         3. CREATED SHAPES: SCARLET WITCH ELDRITCH CHAOS SIGIL (Geometric Array)
         ==================================================================== */}
      <div
        className={`absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 w-[620px] h-[620px] sm:w-[820px] sm:h-[820px] select-none pointer-events-none transition-all duration-700 mix-blend-screen ${
          chaosAuraActive ? 'opacity-95 scale-105' : 'opacity-75 hover:opacity-90'
        }`}
        style={{
          filter: chaosAuraActive
            ? 'drop-shadow(0 0 18px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 35px rgba(244, 63, 94, 0.6))'
            : 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.75)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.4))',
        }}
      >
        {/* Outer Rune Ring - Slow Clockwise Rotation */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_120s_linear_infinite]"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Border Ring */}
          <circle cx="250" cy="250" r="238" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
          <circle cx="250" cy="250" r="226" stroke="#b91c1c" strokeWidth="1" opacity="0.4" />

          {/* Cardinal Rune Nodes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 232 * Math.cos(rad);
            const y = 250 + 232 * Math.sin(rad);
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="#f87171" opacity="0.8" />
                <circle cx={x} cy={y} r="9" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
              </g>
            );
          })}
        </svg>

        {/* Middle Hexagram & Chaos Magic Geometry - Counter-Clockwise Rotation */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_75s_linear_infinite_reverse]"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Middle Concentric Circle */}
          <circle cx="250" cy="250" r="185" stroke="#f43f5e" strokeWidth="1.5" opacity="0.5" />
          <circle cx="250" cy="250" r="175" stroke="#991b1b" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.7" />

          {/* Overlapping Hexagon / Octagram Chaos Sigil Lines */}
          <polygon
            points="250,65 410,157 410,343 250,435 90,343 90,157"
            stroke="#ef4444"
            strokeWidth="1.2"
            opacity="0.35"
          />
          <polygon
            points="250,435 410,343 410,157 250,65 90,157 90,343"
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.25"
          />
          {/* Inverted Triangle Trio */}
          <polygon points="250,75 395,335 105,335" stroke="#dc2626" strokeWidth="1" opacity="0.3" />
          <polygon points="250,425 105,165 395,165" stroke="#e11d48" strokeWidth="1" opacity="0.3" />
        </svg>

        {/* Inner Heart-Tattoo Sigil Core - Gentle Pulsing */}
        <svg
          className="absolute inset-0 w-full h-full animate-pulse"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: '4s' }}
        >
          <circle cx="250" cy="250" r="110" stroke="#f43f5e" strokeWidth="2" opacity="0.6" />
          <circle cx="250" cy="250" r="98" stroke="#b91c1c" strokeWidth="1" strokeDasharray="5 7" opacity="0.8" />
          <circle cx="250" cy="250" r="45" stroke="#ef4444" strokeWidth="1" opacity="0.5" />

          {/* Central Stylized Crimson Heart Glyph */}
          <path
            d="M 250,225 C 235,195 200,200 200,230 C 200,265 240,290 250,305 C 260,290 300,265 300,230 C 300,200 265,195 250,225 Z"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            opacity="0.8"
          />
          <circle cx="250" cy="250" r="4" fill="#fca5a5" />
        </svg>
      </div>

      {/* Floating Chaos Magic Embers / Will-o'-the-Wisps */}
      <div className="absolute inset-0">
        {[
          { top: '15%', left: '20%', size: 'w-2 h-2', delay: '0s', dur: '4s' },
          { top: '25%', left: '78%', size: 'w-2.5 h-2.5', delay: '1s', dur: '5s' },
          { top: '65%', left: '12%', size: 'w-1.5 h-1.5', delay: '2s', dur: '6s' },
          { top: '75%', left: '85%', size: 'w-3 h-3', delay: '0.5s', dur: '4.5s' },
          { top: '40%', left: '8%', size: 'w-2 h-2', delay: '2.5s', dur: '5.5s' },
          { top: '55%', left: '92%', size: 'w-2 h-2', delay: '1.5s', dur: '4s' },
          { top: '85%', left: '48%', size: 'w-2.5 h-2.5', delay: '3s', dur: '6s' },
        ].map((ember, i) => (
          <div
            key={i}
            className={`absolute ${ember.size} rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse`}
            style={{
              top: ember.top,
              left: ember.left,
              animationDelay: ember.delay,
              animationDuration: ember.dur,
              opacity: 0.65,
            }}
          />
        ))}
      </div>

      {/* Subtle Noise / Grain Overlay for Parchment / Gothic Grim-Dark Depth */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
