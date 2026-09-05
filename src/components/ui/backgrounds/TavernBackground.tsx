'use client';

import React, { useMemo } from 'react';
import { useCharacter } from '@/app/providers';

export default function TavernBackground() {
  const { getBackgroundUrl } = useCharacter();
  const menuBg = getBackgroundUrl('menu') || '/tavern-bg.jpg';

  // Generate floating snow/ember particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 3.4) % 100}%`,
      top: `${(i * 6.8) % 100}%`,
      size: (i % 3) + 2,
      duration: 10 + (i % 8) * 2,
      delay: (i % 4) * 1.2,
      opacity: (i % 3 === 0) ? 0.7 : 0.4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c0a08]">
      {/* 1. HERO TAVERN / GUILD CITADEL BACKGROUND IMAGE */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={menuBg}
          alt="Guildhall Citadel Background"
          className="w-full h-full object-cover object-center scale-105 opacity-65 filter blur-[3px] brightness-85 contrast-110 pointer-events-none"
        />
        {/* Warm Lantern Glow Breathing Overlay */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(217,184,114,0.18),transparent_60%)] animate-pulse-glow"
          style={{ animationDuration: '5s' }}
        />
      </div>

      {/* 2. ATMOSPHERIC VIGNETTE & TAVERN AMBIANCE */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(12, 10, 8, 0.45), rgba(7, 5, 4, 0.92) 88%),
            radial-gradient(circle at 15% 85%, rgba(217, 184, 114, 0.14), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(220, 38, 38, 0.12), transparent 50%)
          `,
        }}
      />

      {/* 3. DRIFTING SNOW / EMBERS */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[rgba(255,248,220,0.85)] pointer-events-none animate-float shadow-[0_0_8px_rgba(255,215,0,0.5)]"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom Mist Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-b from-transparent via-[rgba(12,10,8,0.7)] to-[#0c0a08]" />
    </div>
  );
}
