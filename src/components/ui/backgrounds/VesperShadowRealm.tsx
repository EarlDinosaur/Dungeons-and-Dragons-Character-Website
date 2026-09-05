'use client';

import React, { useMemo } from 'react';
import type { VestigeStage } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface VesperShadowRealmProps {
  currentSouls?: number;
  vestigeStage?: VestigeStage;
}

export default function VesperShadowRealm({
  currentSouls = 12,
  vestigeStage = 'dormant',
}: VesperShadowRealmProps) {
  const { getBackgroundUrl } = useCharacter();
  const vesperBg = getBackgroundUrl('vesper') || '/vesper-bg.jpg';

  // Generate random particles once for floating embers & soul motes
  const particles = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: `${(i * 3.1) % 100}%`,
      top: `${(i * 7.3) % 100}%`,
      size: (i % 3) + 2, // 2px to 4px
      duration: 12 + (i % 10) * 2, // 12s to 30s
      delay: (i % 5) * 1.5,
      color: i % 4 === 0 ? 'rgba(255, 215, 0, 0.7)' : i % 2 === 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(168, 85, 247, 0.65)',
    }));
  }, []);

  const isExalted = vestigeStage === 'exalted' || currentSouls >= 50;
  const isAwakened = vestigeStage === 'awakened' || currentSouls >= 20;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07050a]">
      {/* ====================================================================
         1. HERO CRIMSON CATHEDRAL BACKGROUND IMAGE (vesper-bg.jpg or Custom)
         ==================================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={vesperBg}
          alt="Vesper Cathedral Background"
          className="w-full h-full object-cover object-center scale-105 opacity-70 transition-all duration-1000 filter blur-[1.5px] brightness-95 contrast-115 pointer-events-none"
        />
        {/* Soft Candle Flame Breathing Animation Overlay */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_85%,rgba(255,42,42,0.22),transparent_60%)] animate-pulse-glow"
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* ====================================================================
         2. GRADUAL BOTTOM CANDLE BLUR & MIST FADE OVERLAY
         ==================================================================== */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden z-0">
        {/* Progressive Backdrop Blur (Sharp at top, heavy 16px blur over candles) */}
        <div
          className="absolute inset-0 backdrop-blur-[16px]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 25%, black 85%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 25%, black 85%)',
          }}
        />
        {/* Smooth Dark Crimson Candle Mist Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(7,5,10,0.70)] to-[#07050a]" />
      </div>

      {/* ====================================================================
         3. DYNAMIC SHADOW REALM TINT & LIGHT ATMOSPHERIC VIGNETTE
         ==================================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isExalted ? 'opacity-80' : 'opacity-65'
        }`}
        style={{
          background: `
            radial-gradient(ellipse at 50% 35%, rgba(7, 5, 10, 0.15), rgba(5, 3, 8, 0.65) 90%),
            radial-gradient(circle at 15% 15%, rgba(220, 38, 38, ${isExalted ? '0.20' : '0.10'}), transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(168, 85, 247, ${isAwakened ? '0.15' : '0.06'}), transparent 55%)
          `,
        }}
      />

      {/* ====================================================================
         2. ASSASSIN SHADOW GRID & RUNIC CONSTELLATIONS
         ==================================================================== */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, rgba(220,38,38,0.8), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255,215,0,0.5), transparent),
            radial-gradient(1px 1px at 70px 150px, rgba(168,85,247,0.6), transparent),
            radial-gradient(1.5px 1.5px at 120px 90px, rgba(220,38,38,0.7), transparent)
          `,
          backgroundSize: '160px 160px',
        }}
      />

      {/* ====================================================================
         3. FLOATING CRIMSON EMBERS & ETHEREAL SOUL MOTES
         ==================================================================== */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none animate-float"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ====================================================================
         4. SWIRLING SHADOW SMOKE & FOG LAYERS
         ==================================================================== */}
      <div className="absolute top-[-10%] -left-[15%] w-[580px] h-[320px] rounded-full blur-[40px] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12),transparent_70%)] cloud-anim-1" />
      <div className="absolute top-[40%] -right-[20%] w-[640px] h-[360px] rounded-full blur-[45px] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_70%)] cloud-anim-2" />
      <div className="absolute bottom-[-10%] left-[10%] w-[700px] h-[300px] rounded-full blur-[50px] bg-[radial-gradient(ellipse_at_center,rgba(69,10,10,0.35),transparent_70%)] cloud-anim-3" />

      {/* ====================================================================
         5. HERO VESTIGE ORPHAN'S TITHE EMBLEM (TOP RIGHT BACKGROUND)
         ==================================================================== */}
      <div className="fixed top-12 right-8 md:right-20 z-0 opacity-20 pointer-events-none flex flex-col items-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 120 120"
          className="animate-soul-orbit overflow-visible"
        >
          <defs>
            <linearGradient id="vesperDaggerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <radialGradient id="soulOrbGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#7e22ce" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Runic Ring */}
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1.5" />

          {/* Central Soul Core Glow */}
          <circle cx="60" cy="60" r="32" fill="url(#soulOrbGlow)" />

          {/* Crossed Assassin Daggers */}
          <g fill="url(#vesperDaggerGrad)">
            {/* Dagger 1 */}
            <path d="M60 20 L64 55 L60 62 L56 55 Z M60 62 L60 76 M54 66 L66 66" stroke="#ffd700" strokeWidth="1.5" />
            {/* Dagger 2 Crossed */}
            <path d="M20 60 L55 64 L62 60 L55 56 Z M62 60 L76 60 M66 54 L66 66" stroke="#dc2626" strokeWidth="1.5" transform="rotate(45 60 60)" />
          </g>
        </svg>
      </div>

      {/* Bottom Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_40%,rgba(5,3,8,0.85)_100%)] pointer-events-none" />
    </div>
  );
}
