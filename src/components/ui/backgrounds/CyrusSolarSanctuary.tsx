'use client';

import React from 'react';
import { useCharacter } from '@/app/providers';

interface CyrusSolarSanctuaryProps {
  radiantActive?: boolean;
}

export default function CyrusSolarSanctuary({ radiantActive = false }: CyrusSolarSanctuaryProps) {
  const { getBackgroundUrl } = useCharacter();
  const bgUrl = getBackgroundUrl('cyrus');

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0d0a06]">
      {/* Radiant Soul Divine Flare Overlay */}
      {radiantActive && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,215,0,0.25)_0%,transparent_70%)] animate-pulse pointer-events-none z-10" />
      )}
      {/* Custom Temple Balcony & Celestial Clouds Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-screen filter contrast-125 saturate-125"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a06] via-[#0d0a06]/40 to-[#0d0a06]/70 pointer-events-none" />

      {/* Base warm golden radiance */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 82% 10%, rgba(255,200,60,0.35), rgba(218,165,32,0.20) 22%, transparent 50%),
            radial-gradient(circle at 10% 85%, rgba(184,134,11,0.20), transparent 40%),
            radial-gradient(circle at 55% 50%, rgba(255,223,120,0.10), transparent 50%),
            #0d0a06/50
          `,
        }}
      />

      {/* Sun disc glow in top-right corner */}
      <div
        className="absolute -top-[100px] -right-[80px] w-[400px] h-[400px] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,180,0,0.3) 30%, rgba(218,165,32,0.15) 50%, transparent 70%)',
          boxShadow: '0 0 120px 60px rgba(255,200,60,0.15)',
          animation: 'cyrusSunPulse 6s ease-in-out infinite',
        }}
      />

      {/* Secondary warm glow bottom left */}
      <div
        className="absolute bottom-[5%] left-[8%] w-[300px] h-[300px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(218,165,32,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Marble Column Silhouettes (decorative) */}
      <div className="absolute bottom-0 left-[8%] w-[3px] h-[45%] bg-gradient-to-t from-[rgba(255,248,220,0.08)] to-transparent" />
      <div className="absolute bottom-0 left-[12%] w-[3px] h-[50%] bg-gradient-to-t from-[rgba(255,248,220,0.06)] to-transparent" />
      <div className="absolute bottom-0 right-[10%] w-[3px] h-[42%] bg-gradient-to-t from-[rgba(255,248,220,0.07)] to-transparent" />
      <div className="absolute bottom-0 right-[15%] w-[3px] h-[48%] bg-gradient-to-t from-[rgba(255,248,220,0.05)] to-transparent" />

      {/* Floating golden dust particles */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 15% 20%,  rgba(255,215,0,0.7), transparent),
            radial-gradient(1px 1px at 30% 45%,       rgba(255,223,120,0.6), transparent),
            radial-gradient(1.5px 1.5px at 50% 15%,   rgba(255,200,60,0.7), transparent),
            radial-gradient(1px 1px at 65% 55%,        rgba(218,165,32,0.6), transparent),
            radial-gradient(1.2px 1.2px at 80% 30%,    rgba(255,215,0,0.7), transparent),
            radial-gradient(1px 1px at 20% 70%,        rgba(255,223,120,0.5), transparent),
            radial-gradient(1.5px 1.5px at 45% 80%,    rgba(255,200,60,0.5), transparent),
            radial-gradient(1px 1px at 88% 65%,        rgba(218,165,32,0.6), transparent),
            radial-gradient(1.2px 1.2px at 72% 85%,    rgba(255,215,0,0.5), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 300px',
          animation: 'cyrusDustDrift 30s linear infinite',
        }}
      />

      {/* Light beam streaks */}
      <div
        className="absolute top-0 right-[20%] w-[120px] h-[60%] opacity-[0.06] rotate-[15deg]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,215,0,0.6), transparent)',
        }}
      />
      <div
        className="absolute top-0 right-[35%] w-[80px] h-[50%] opacity-[0.04] rotate-[8deg]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,223,120,0.5), transparent)',
        }}
      />

      {/* Warm fog at the bottom */}
      <div className="absolute -left-[20%] w-[140%] h-[200px] bottom-[-30px] blur-[30px] opacity-60 bg-gradient-to-b from-transparent via-[rgba(30,22,10,0.5)] to-[#0d0a06]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_35%,rgba(13,10,6,0.80)_100%)] pointer-events-none" />

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes cyrusSunPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes cyrusDustDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100px, -60px); }
        }
      `}</style>
    </div>
  );
}
