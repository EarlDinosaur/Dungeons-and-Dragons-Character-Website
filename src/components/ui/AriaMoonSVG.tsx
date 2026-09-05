'use client';

import React from 'react';

interface AriaMoonSVGProps {
  phase: 'full' | 'new' | 'crescent';
  className?: string;
}

export default function AriaMoonSVG({ phase, className = '' }: AriaMoonSVGProps) {
  return (
    <div className={`relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full transition-all duration-700 overflow-visible"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Full Moon Gradients */}
          <radialGradient id="fullMoonGrad" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f5eedc" />
            <stop offset="85%" stopColor="#d9b872" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>

          <filter id="fullMoonGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Crescent Moon Gradients */}
          <linearGradient id="crescentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e8e6ff" />
            <stop offset="80%" stopColor="#c7c2e6" />
            <stop offset="100%" stopColor="#a992e8" />
          </linearGradient>

          <filter id="crescentGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* New Moon / Eclipse Gradients */}
          <radialGradient id="newMoonCorona" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0a0518" />
            <stop offset="90%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#ff2a5f" />
          </radialGradient>

          <filter id="coronaGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. FULL MOON GRAPHIC */}
        {phase === 'full' && (
          <g filter="url(#fullMoonGlow)" className="transition-all duration-700">
            {/* Outer Glow Halo */}
            <circle cx="60" cy="60" r="50" fill="rgba(242,239,224,0.18)" />

            {/* Main Moon Sphere */}
            <circle cx="60" cy="60" r="44" fill="url(#fullMoonGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />

            {/* Crater Textures */}
            <circle cx="48" cy="42" r="7" fill="#c4aa6e" opacity="0.25" />
            <circle cx="72" cy="52" r="9" fill="#c4aa6e" opacity="0.2" />
            <circle cx="56" cy="74" r="11" fill="#c4aa6e" opacity="0.22" />
            <circle cx="78" cy="76" r="5" fill="#c4aa6e" opacity="0.18" />
            <circle cx="40" cy="66" r="4" fill="#c4aa6e" opacity="0.15" />
          </g>
        )}

        {/* 2. CRESCENT MOON GRAPHIC (Crisp SVG Crescent Path) */}
        {phase === 'crescent' && (
          <g filter="url(#crescentGlow)" className="transition-all duration-700">
            {/* Outer Starlight Aura */}
            <circle cx="60" cy="60" r="48" fill="rgba(169,146,232,0.12)" />

            {/* Crisp Crescent Moon Path (Moon crescent facing left-to-right) */}
            <path
              d="M60,14 A46,46 0 1,0 106,60 A38,38 0 1,1 60,14 Z"
              fill="url(#crescentGrad)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="0.8"
            />

            {/* Subtle Moon Craters on Crescent Body */}
            <circle cx="38" cy="54" r="5" fill="#8f76d6" opacity="0.25" />
            <circle cx="48" cy="76" r="6" fill="#8f76d6" opacity="0.2" />
            <circle cx="32" cy="40" r="3.5" fill="#8f76d6" opacity="0.2" />
          </g>
        )}

        {/* 3. NEW MOON / ECLIPSE GRAPHIC */}
        {phase === 'new' && (
          <g filter="url(#coronaGlow)" className="transition-all duration-700">
            {/* Outer Crimson Corona Ring */}
            <circle cx="60" cy="60" r="48" fill="none" stroke="#ff2a5f" strokeWidth="3" opacity="0.8" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="#7e22ce" strokeWidth="4" opacity="0.9" />

            {/* Dark Umbral Moon Disc */}
            <circle cx="60" cy="60" r="44" fill="#080410" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />

            {/* Faint Purple Shadow Crater */}
            <circle cx="52" cy="48" r="8" fill="#581c87" opacity="0.2" />
            <circle cx="70" cy="65" r="10" fill="#581c87" opacity="0.15" />
          </g>
        )}
      </svg>
    </div>
  );
}
