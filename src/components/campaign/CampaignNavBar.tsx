'use client';

import { ArrowLeft, Scroll, Shield, Sparkles, Camera } from 'lucide-react';
import { useCharacter } from '@/app/providers';
import { PARTY_ROSTER } from '@/lib/roster';

export default function CampaignNavBar() {
  const { activeCharacterId, navigateToMenu, getPortraitUrl, openMediaPicker } = useCharacter();

  const activeChar = PARTY_ROSTER.find((c) => c.id === activeCharacterId) || PARTY_ROSTER[0];
  const isVesper = activeCharacterId === 'vesper';
  const portraitUrl = getPortraitUrl(activeCharacterId);

  return (
    <div className="glass-card p-3 mb-6 relative overflow-hidden border-b border-[var(--color-border-subtle)] shadow-lg rounded-xl">
      {/* Decorative Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
          isVesper
            ? 'via-[var(--color-crimson-500)]'
            : activeCharacterId === 'cyrus'
            ? 'via-amber-400'
            : activeCharacterId === 'wynel'
            ? 'via-rose-500'
            : 'via-[#a992e8]'
        } to-transparent opacity-75`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        {/* Ornate D&D Guildhall Signpost Return Button */}
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(40,32,22,0.9),rgba(20,16,12,0.95))] hover:bg-[radial-gradient(ellipse_at_center,rgba(60,48,30,0.95),rgba(30,24,18,0.98))] border border-[var(--color-gold-500)]/40 hover:border-[var(--color-gold-bright)] text-[var(--color-gold-300)] hover:text-[var(--color-gold-bright)] text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:-translate-y-0.5 active:scale-95"
          id="back-to-campaign-hub"
        >
          <span className="p-1 rounded-md bg-[rgba(255,215,0,0.15)] group-hover:bg-[rgba(255,215,0,0.3)] text-[var(--color-gold-400)] transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span className="flex items-center gap-1.5">
            <Scroll size={13} className="text-[var(--color-gold-400)]" />
            Return to Guildhall
          </span>
        </button>

        {/* Media Customizer Button (Mobile & Desktop Accessible) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openMediaPicker()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,215,0,0.12)] hover:bg-[rgba(255,215,0,0.25)] border border-[var(--color-gold-400)]/40 hover:border-[var(--color-gold-bright)] text-[var(--color-gold-300)] hover:text-white text-xs font-mono font-bold transition-all shadow-md active:scale-95 min-h-[36px]"
            title="Custom Mobile Media & Wallpaper Picker"
          >
            <Camera size={14} className="text-[var(--color-gold-400)]" />
            <span>Media Customizer</span>
          </button>

          {/* Dedicated Active Character Dossier Badge */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-[family-name:var(--font-mono)] shadow-md ${
              isVesper
                ? 'bg-[rgba(69,10,10,0.4)] border-[var(--color-crimson-700)]/60 text-[var(--color-parchment)]'
                : activeCharacterId === 'cyrus'
                ? 'bg-[rgba(45,30,10,0.5)] border-amber-500/60 text-amber-100'
                : activeCharacterId === 'wynel'
                ? 'bg-[rgba(55,12,18,0.5)] border-red-500/60 text-rose-100'
                : 'bg-[rgba(29,34,73,0.5)] border-[#343a72] text-[#e8e6ff]'
            }`}
          >
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-[var(--color-gold-400)]/60 shrink-0">
              <img
                src={portraitUrl}
                alt={activeChar.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {isVesper ? (
                <Shield size={12} className="text-[var(--color-crimson-400)]" />
              ) : activeCharacterId === 'cyrus' ? (
                <span className="text-amber-400 text-xs">☀️</span>
              ) : activeCharacterId === 'wynel' ? (
                <span className="text-rose-400 text-xs">👑</span>
              ) : (
                <Sparkles size={12} className="text-[#a992e8]" />
              )}
              <span className="font-bold font-[family-name:var(--font-heading)]">
                {activeChar.name}
              </span>
              <span className="text-[10px] text-[var(--color-parchment-dim)]">
                (Lv {activeChar.level})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
