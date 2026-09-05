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
      {/* Custom Wallpaper Layer */}
      {customBg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen filter contrast-125 saturate-125"
          style={{ backgroundImage: `url('${customBg}')` }}
        />
      )}
      {/* ====================================================================
         3 STACKED OPACITY LAYERS FOR 100% BUTTER-SMOOTH COLOR TRANSITIONS
         ==================================================================== */}

      {/* 1. FULL MOON LAYER (Radiant Silver & Gold Celestial Night) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          currentPhase === 'full' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(255,248,220,0.50), rgba(217,184,114,0.30) 22%, transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(169,146,232,0.30), transparent 40%),
            radial-gradient(circle at 75% 90%, rgba(217,184,114,0.25), transparent 40%),
            #080c28
          `,
        }}
      />

      {/* 2. NEW MOON LAYER (Crimson Void & Eclipse Shadow) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          currentPhase === 'new' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(255,42,95,0.45), rgba(126,34,206,0.35) 25%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(88,28,135,0.55), transparent 45%),
            radial-gradient(circle at 75% 90%, rgba(127,29,29,0.40), transparent 50%),
            #0a0314
          `,
        }}
      />

      {/* 3. CRESCENT MOON LAYER (Ethereal Lavender & Twilight Nebula) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          currentPhase === 'crescent' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(199,194,230,0.50), rgba(169,146,232,0.35) 24%, transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(143,118,214,0.40), transparent 40%),
            radial-gradient(circle at 75% 90%, rgba(169,146,232,0.25), transparent 40%),
            #0e0722
          `,
        }}
      />

      {/* ====================================================================
         CELESTIAL STARFIELD & FLOATING CLOUDS
         ==================================================================== */}
      <div
        className="absolute -inset-[60px] starfield-anim opacity-90"
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

      {/* Floating Nebula Clouds */}
      <div className="absolute top-[6%] -left-[20%] w-[540px] h-[160px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(207,212,238,0.12),transparent_70%)] cloud-anim-1" />
      <div className="absolute top-[48%] -left-[25%] w-[620px] h-[190px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(169,146,232,0.15),transparent_70%)] cloud-anim-2" />
      <div className="absolute top-[28%] -left-[15%] w-[440px] h-[140px] rounded-full blur-[26px] bg-[radial-gradient(ellipse_at_center,rgba(217,184,114,0.12),transparent_70%)] cloud-anim-3" />

      {/* ====================================================================
         HERO MOON & MAGICAL SHOCKWAVE BURST
         ==================================================================== */}
      <div className="fixed top-10 right-6 sm:right-16 md:right-24 z-10 pointer-events-none flex flex-col items-center">
        {/* Shockwave Burst Ring (Fires when phase changes) */}
        <div
          key={burstKey}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border-2 moon-shift-ring pointer-events-none"
        />

        {/* Hero SVG Moon Graphic */}
        <div className="moon-anim-float relative rounded-full overflow-visible">
          <AriaMoonSVG phase={currentPhase} />
        </div>
      </div>

      {/* Secondary Orbiting Moons */}
      <div className="absolute top-[68%] left-[5%] w-[54px] h-[54px] rounded-full bg-[#0d1026] shadow-[inset_16px_-4px_0_0_#c7c2e6,0_0_30px_4px_rgba(169,146,232,0.25)] opacity-80" />
      <div className="absolute top-[16%] left-[14%] w-[22px] h-[22px] rounded-full bg-[#0d1026] shadow-[inset_7px_-2px_0_0_#9aa1cc,0_0_12px_2px_rgba(207,212,238,0.2)] opacity-70" />

      {/* Dynamic Night Fog */}
      <div className="absolute -left-[20%] w-[140%] h-[260px] bottom-[-40px] blur-[30px] opacity-70 bg-gradient-to-b from-transparent via-[rgba(20,24,58,0.5)] to-[#04030a]" />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_35%,rgba(4,3,10,0.75)_100%)] pointer-events-none" />
    </div>
  );
}
