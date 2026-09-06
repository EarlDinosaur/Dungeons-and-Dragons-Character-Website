'use client';

import React from 'react';

interface WynelScarletSigilProps {
  chaosAuraActive?: boolean;
}

export default function WynelScarletSigil({ chaosAuraActive = false }: WynelScarletSigilProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0507]">
      {/* Deep Obsidian-to-Crimson Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2a080c_0%,#140407_45%,#070204_100%)] opacity-95" />

      {/* Pulsing Chaos Magic Ambient Glows */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-b from-rose-600/25 via-red-700/15 to-transparent blur-3xl transition-opacity duration-1000 ${
          chaosAuraActive ? 'opacity-90 scale-110' : 'opacity-60'
        }`}
      />
      <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-rose-700/10 blur-[120px]" />

      {/* Central Scarlet Witch Eldritch Chaos Sigil (Rotating Geometric Array) */}
      <div className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 w-[620px] h-[620px] sm:w-[820px] sm:h-[820px] opacity-35 select-none pointer-events-none">
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
