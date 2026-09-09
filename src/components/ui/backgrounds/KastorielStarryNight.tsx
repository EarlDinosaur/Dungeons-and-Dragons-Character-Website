'use client';

import React, { useMemo } from 'react';
import { useCharacter } from '@/app/providers';

interface KastorielStarryNightProps {
  activeConstellation?: 'none' | 'archer' | 'chalice' | 'dragon';
  starryActive?: boolean;
}

export default function KastorielStarryNight({
  activeConstellation = 'none',
  starryActive = false,
}: KastorielStarryNightProps) {
  const { getBackgroundUrl } = useCharacter();
  const customBg = getBackgroundUrl('kastoriel');

  // Random static stars for consistent render
  const stars = useMemo(() => {
    return Array.from({ length: 75 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 61) % 100,
      size: (i % 3) + 1,
      opacity: 0.3 + ((i % 7) / 10),
      animDuration: 2 + (i % 4),
      animDelay: (i % 5) * 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#06080f]">
      {/* ====================================================================
         1. BASE WALLPAPER / NEBULA CANVAS
         ==================================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={
            customBg ||
            'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'
          }
          alt="Kastoriel Celestial Void"
          className="w-full h-full object-cover object-center scale-105 opacity-60 transition-all duration-1000 filter brightness-90 contrast-125 pointer-events-none"
        />
      </div>

      {/* ====================================================================
         2. DEEP SPACE OBSIDIAN & GOLDEN NEBULA GLOWS
         ==================================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 mix-blend-screen"
        style={{
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.40), rgba(217, 119, 6, 0.20) 28%, transparent 60%),
            radial-gradient(ellipse at 15% 75%, rgba(251, 146, 60, 0.30), rgba(180, 83, 9, 0.15) 32%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.12), transparent 60%),
            radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.15), transparent 45%)
          `,
        }}
      />

      {/* ====================================================================
         3. DYNAMIC CONSTELLATION OVERLAY (ARCHER / CHALICE / DRAGON)
         ==================================================================== */}
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="starlight-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Archer Constellation (Top Left) */}
        <g
          className={`transition-all duration-700 ${
            activeConstellation === 'archer' ? 'opacity-100 stroke-amber-300' : 'opacity-30 stroke-amber-400/40'
          }`}
          strokeWidth="1.5"
          filter="url(#starlight-glow)"
        >
          <line x1="12%" y1="18%" x2="18%" y2="24%" />
          <line x1="18%" y1="24%" x2="25%" y2="20%" />
          <line x1="25%" y1="20%" x2="22%" y2="12%" />
          <line x1="22%" y1="12%" x2="15%" y2="10%" />
          <line x1="15%" y1="10%" x2="18%" y2="24%" />
          <line x1="25%" y1="20%" x2="32%" y2="15%" />

          {/* Star Nodes */}
          {[[12, 18], [18, 24], [25, 20], [22, 12], [15, 10], [32, 15]].map(([x, y], idx) => (
            <circle
              key={`archer-${idx}`}
              cx={`${x}%`}
              cy={`${y}%`}
              r={activeConstellation === 'archer' ? 4 : 2.5}
              className="fill-amber-200 stroke-amber-400"
            />
          ))}
        </g>

        {/* Chalice Constellation (Bottom Right) */}
        <g
          className={`transition-all duration-700 ${
            activeConstellation === 'chalice' ? 'opacity-100 stroke-emerald-300' : 'opacity-30 stroke-amber-400/40'
          }`}
          strokeWidth="1.5"
          filter="url(#starlight-glow)"
        >
          <line x1="75%" y1="70%" x2="85%" y2="70%" />
          <line x1="85%" y1="70%" x2="82%" y2="82%" />
          <line x1="82%" y1="82%" x2="78%" y2="82%" />
          <line x1="78%" y1="82%" x2="75%" y2="70%" />
          <line x1="80%" y1="82%" x2="80%" y2="90%" />
          <line x1="76%" y1="90%" x2="84%" y2="90%" />

          {[[75, 70], [85, 70], [82, 82], [78, 82], [80, 82], [80, 90], [76, 90], [84, 90]].map(
            ([x, y], idx) => (
              <circle
                key={`chalice-${idx}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r={activeConstellation === 'chalice' ? 4 : 2.5}
                className="fill-emerald-200 stroke-emerald-400"
              />
            )
          )}
        </g>

        {/* Dragon Constellation (Top Center-Right) */}
        <g
          className={`transition-all duration-700 ${
            activeConstellation === 'dragon' ? 'opacity-100 stroke-orange-300' : 'opacity-30 stroke-amber-400/40'
          }`}
          strokeWidth="1.5"
          filter="url(#starlight-glow)"
        >
          <line x1="60%" y1="12%" x2="68%" y2="10%" />
          <line x1="68%" y1="10%" x2="74%" y2="16%" />
          <line x1="74%" y1="16%" x2="70%" y2="24%" />
          <line x1="70%" y1="24%" x2="62%" y2="22%" />
          <line x1="62%" y1="22%" x2="56%" y2="28%" />
          <line x1="56%" y1="28%" x2="52%" y2="20%" />

          {[[60, 12], [68, 10], [74, 16], [70, 24], [62, 22], [56, 28], [52, 20]].map(([x, y], idx) => (
            <circle
              key={`dragon-${idx}`}
              cx={`${x}%`}
              cy={`${y}%`}
              r={activeConstellation === 'dragon' ? 4.5 : 3}
              className="fill-orange-200 stroke-amber-400"
            />
          ))}
        </g>
      </svg>

      {/* ====================================================================
         4. DRIFTING TWINKLING STARLIGHT PARTICLES
         ==================================================================== */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-amber-100 animate-pulse pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: `${s.animDuration}s`,
              animationDelay: `${s.animDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette Edge Shading */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,8,15,0.85)_100%)] pointer-events-none" />
    </div>
  );
}
