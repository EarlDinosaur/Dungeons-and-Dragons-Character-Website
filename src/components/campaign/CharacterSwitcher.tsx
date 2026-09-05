'use client';

import { Users, Crown, Sparkles, Shield } from 'lucide-react';
import { PARTY_ROSTER } from '@/lib/roster';
import { useCharacter } from '@/app/providers';

export default function CharacterSwitcher() {
  const { activeCharacterId, setActiveCharacterId, navigateToCharacter, getPortraitUrl } = useCharacter();

  return (
    <div className="glass-card p-3 mb-6 relative overflow-hidden border-b border-[var(--color-border-subtle)]">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(220,38,38,0.05)] via-transparent to-[rgba(169,146,232,0.08)] pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        {/* Campaign Label */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[var(--color-gold-500)]/30 flex items-center justify-center text-[var(--color-gold-400)]">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[var(--color-gold-400)] font-[family-name:var(--font-heading)] font-bold flex items-center gap-1.5">
              The Ashen Pact <Crown size={12} className="text-[var(--color-gold-400)]" />
            </h2>
            <p className="text-[11px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
              Campaign Party Roster
            </p>
          </div>
        </div>

        {/* Character Selector Cards */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {PARTY_ROSTER.map((char) => {
            const isActive = activeCharacterId === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setActiveCharacterId(char.id)}
                className={`flex-1 sm:flex-initial flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 relative text-left ${
                  isActive
                    ? char.id === 'vesper'
                      ? 'bg-[rgba(220,38,38,0.15)] border-[var(--color-crimson-500)] shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white scale-[1.02]'
                      : 'bg-[rgba(169,146,232,0.18)] border-[#a992e8] shadow-[0_0_15px_rgba(169,146,232,0.35)] text-white scale-[1.02]'
                    : 'bg-black/40 border-[rgba(255,255,255,0.08)] hover:border-white/20 text-[var(--color-parchment-muted)] hover:text-white'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={getPortraitUrl(char.id)}
                    alt={char.name}
                    className={`w-9 h-9 rounded-lg object-cover border ${
                      isActive
                        ? char.id === 'vesper'
                          ? 'border-[var(--color-crimson-400)]'
                          : 'border-[#a992e8]'
                        : 'border-white/10'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs font-[family-name:var(--font-heading)] truncate">
                      {char.name}
                    </span>
                  </div>

                  <p className="text-[10px] text-[var(--color-parchment-dim)] truncate font-[family-name:var(--font-mono)]">
                    Lv {char.level} {char.characterClass} ({char.subclass})
                  </p>
                </div>

                {/* Active Indicator Pip */}
                {isActive && (
                  <div
                    className={`w-2 h-2 rounded-full absolute top-2 right-2 animate-pulse ${
                      char.id === 'vesper' ? 'bg-[var(--color-crimson-500)]' : 'bg-[#a992e8]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
