'use client';

import React, { useEffect, useState, useRef } from 'react';
import AriaMoonSVG from '../AriaMoonSVG';
import { useCharacter } from '@/app/providers';

interface AriaNightSkyProps {
  currentPhase?: 'full' | 'new' | 'crescent';
}

export default function AriaNightSky({ currentPhase = 'full' }: AriaNightSkyProps) {
  const { getBackgroundUrl } = useCharacter();
  const customBg = getBackgroundUrl('aria');
  const [burstKey, setBurstKey] = useState(0);
  const prevPhaseRef = useRef(currentPhase);

  // Trigger shockwave burst animation whenever phase changes
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      setBurstKey((prev) => prev + 1);
      prevPhaseRef.current = currentPhase;
    }
  }, [currentPhase]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05040d]">
      {/* ====================================================================
         1. HERO CELESTIAL BACKGROUND IMAGE (Uploaded or Preset Wallpaper)
         ==================================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={customBg || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'}
          alt="Aria Celestial Background"
          className="w-full h-full object-cover object-center scale-105 opacity-70 transition-all duration-1000 filter brightness-95 contrast-110 pointer-events-none"
        />
      </div>

      {/* ====================================================================
         2. DYNAMIC LUNAR PHASE ATMOSPHERIC TINTS (Seamless Starlight Washes)
         ==================================================================== */}

      {/* 1. FULL MOON LAYER (Radiant Silver & Gold Celestial Night) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none mix-blend-screen ${
          currentPhase === 'full' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(255,248,220,0.55), rgba(217,184,114,0.30) 24%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(169,146,232,0.35), transparent 45%),
            radial-gradient(circle at 75% 90%, rgba(217,184,114,0.25), transparent 45%)
          `,
        }}
      />

      {/* 2. NEW MOON LAYER (Crimson Void & Eclipse Shadow) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none mix-blend-screen ${
          currentPhase === 'new' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(255,42,95,0.50), rgba(126,34,206,0.35) 25%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(88,28,135,0.45), transparent 45%),
            radial-gradient(circle at 75% 90%, rgba(127,29,29,0.35), transparent 50%)
          `,
        }}
      />

      {/* 3. CRESCENT MOON LAYER (Ethereal Lavender & Twilight Nebula) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none mix-blend-screen ${
          currentPhase === 'crescent' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(199,194,230,0.50), rgba(169,146,232,0.35) 24%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(143,118,214,0.35), transparent 45%),
            radial-gradient(circle at 75% 90%, rgba(169,146,232,0.25), transparent 45%)
          `,
        }}
      />

      {/* Bottom Fog / Darkness Blend for Content Readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(5,4,13,0.65)] to-[#05040d]" />
      </div>

      {/* Atmospheric Vignette (Soft at center, deep at border) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_35%,rgba(4,3,10,0.65)_100%)] pointer-events-none" />

      {/* ====================================================================
         3. CELESTIAL STARFIELD & FLOATING CLOUDS
         ==================================================================== */}
      <div
        className="absolute -inset-[60px] starfield-anim opacity-85 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 8% 12%,   rgba(255,255,255,0.95), transparent),
            radial-gradient(1.5px 1.5px at 22% 28%, rgba(232,230,255,0.85), transparent),
            radial-gradient(2px 2px at 38% 6%,   rgba(255,255,255,0.9), transparent),
            radial-gradient(1.2px 1.2px at 54% 34%, rgba(232,230,255,0.75), transparent),
            radial-gradient(1.8px 1.8px at 68% 14%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.2px 1.2px at 79% 40%, rgba(232,230,255,0.7), transparent),
            radial-gradient(2px 2px at 91% 20%,  rgba(255,255,255,0.95), transparent),
            radial-gradient(1.2px 1.2px at 12% 62%, rgba(232,230,255,0.7), transparent),
            radial-gradient(1.8px 1.8px at 30% 78%, rgba(255,255,255,0.85), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '340px 240px',
        }}
      />

      {/* Floating Nebula Clouds (mix-blend-screen for seamless harmony with wallpaper) */}
      <div className="absolute top-[6%] -left-[20%] w-[540px] h-[160px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(207,212,238,0.18),transparent_70%)] cloud-anim-1 mix-blend-screen pointer-events-none" />
      <div className="absolute top-[48%] -left-[25%] w-[620px] h-[190px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(169,146,232,0.22),transparent_70%)] cloud-anim-2 mix-blend-screen pointer-events-none" />
      <div className="absolute top-[28%] -left-[15%] w-[440px] h-[140px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(217,184,114,0.18),transparent_70%)] cloud-anim-3 mix-blend-screen pointer-events-none" />

      {/* ====================================================================
         4. HERO MOON & MAGICAL SHOCKWAVE BURST
         ==================================================================== */}
      <div className="fixed top-10 right-6 sm:right-16 md:right-24 z-10 pointer-events-none flex flex-col items-center">
        {/* Shockwave Burst Ring (Fires when phase changes) */}
        <div
          key={burstKey}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border-2 moon-shift-ring pointer-events-none"
        />

        {/* Hero SVG Moon Graphic */}
        <div className="moon-anim-float relative rounded-full overflow-visible drop-shadow-[0_0_35px_rgba(169,146,232,0.5)]">
          <AriaMoonSVG phase={currentPhase} />
        </div>
      </div>

      {/* Secondary Orbiting Moons */}
      <div className="absolute top-[68%] left-[5%] w-[54px] h-[54px] rounded-full bg-[#0d1026]/90 shadow-[inset_16px_-4px_0_0_#c7c2e6,0_0_30px_4px_rgba(169,146,232,0.35)] opacity-85 pointer-events-none" />
      <div className="absolute top-[16%] left-[14%] w-[22px] h-[22px] rounded-full bg-[#0d1026]/90 shadow-[inset_7px_-2px_0_0_#9aa1cc,0_0_12px_2px_rgba(207,212,238,0.25)] opacity-75 pointer-events-none" />
    </div>
  );
}
