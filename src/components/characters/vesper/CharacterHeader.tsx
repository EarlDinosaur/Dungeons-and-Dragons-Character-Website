'use client';

import { useRef, useEffect } from 'react';
import { Shield, Zap, Footprints, Award, Heart, ChevronUp, ChevronDown, ArrowLeft, Scroll } from 'lucide-react';
import gsap from 'gsap';
import TextGenerateEffect from '../../ui/TextGenerateEffect';
import HPQuickControl from '../../ui/HPQuickControl';
import { formatModifier } from '@/lib/character-engine';
import type { CharacterState } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface CharacterHeaderProps {
  character: CharacterState;
  onLevelChange: (level: number) => void;
  onHPChange: (hp: number) => void;
  onTempHPChange: (hp: number) => void;
}

export default function CharacterHeader({
  character,
  onLevelChange,
  onHPChange,
  onTempHPChange,
}: CharacterHeaderProps) {
  const { navigateToMenu, getPortraitUrl, openMediaPicker } = useCharacter();
  const hpBarRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSelectElement>(null);
  const vesperPortrait = getPortraitUrl('vesper');

  const hpPercent = character.combat.maxHP > 0
    ? (character.combat.currentHP / character.combat.maxHP) * 100
    : 0;

  const hpColor =
    hpPercent > 60 ? '#22c55e' :
    hpPercent > 30 ? '#eab308' :
    hpPercent > 0 ? '#dc2626' : '#6b7280';

  // Animate HP bar on change
  useEffect(() => {
    if (hpBarRef.current) {
      gsap.to(hpBarRef.current, {
        width: `${Math.max(0, Math.min(100, hpPercent))}%`,
        backgroundColor: hpColor,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [hpPercent, hpColor]);

  // Animate level change
  const handleLevelChange = (newLevel: number) => {
    if (levelRef.current) {
      gsap.fromTo(levelRef.current, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
    onLevelChange(newLevel);
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold-bright)] to-transparent opacity-60" />

      {/* Top Guildhall Navigation Strip */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[rgba(255,215,0,0.12)]">
        <button
          onClick={navigateToMenu}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,215,0,0.08)] hover:bg-[rgba(255,215,0,0.18)] border border-[var(--color-gold-500)]/40 hover:border-[var(--color-gold-bright)] text-[var(--color-gold-300)] hover:text-[var(--color-gold-bright)] text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:-translate-y-0.5"
          id="earl-header-back-button"
        >
          <ArrowLeft size={13} className="text-[var(--color-gold-400)] group-hover:-translate-x-0.5 transition-transform" />
          <Scroll size={13} className="text-[var(--color-gold-400)]" />
          Return to Guildhall
        </button>

        <div className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)] uppercase tracking-widest hidden sm:block">
          The Ashen Pact &bull; Earl Dossier
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Avatar Portrait & Identity */}
        <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
          <div
            onClick={() => openMediaPicker('portraits')}
            className="relative group shrink-0 mx-auto sm:mx-0 cursor-pointer"
            title="Tap to change portrait or wallpaper"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-[var(--color-gold-400)] shadow-[0_0_30px_rgba(255,215,0,0.35)] group-hover:border-[var(--color-crimson-500)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all duration-500 relative">
              <img
                src={vesperPortrait}
                alt="Vesper Ashwood"
                className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold gap-1">
                <span>📷 Change</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black/90 rounded-full border-2 border-[var(--color-gold-400)] flex items-center justify-center text-sm shadow-lg">
              🗡️
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold text-glow-gold">
                <TextGenerateEffect text="Earl" />
              </h1>
            <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded">
              LV
              <select
                ref={levelRef}
                value={character.level}
                onChange={(e) => handleLevelChange(Number(e.target.value))}
                className="!bg-transparent !border-none !p-0 !pl-1 !w-auto !text-[var(--color-gold-400)] font-bold appearance-none cursor-pointer focus:outline-none inline"
                id="level-selector"
                style={{ width: '36px' }}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => (
                  <option key={lv} value={lv} className="bg-[var(--color-surface)]">
                    {lv}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <p className="text-lg text-[var(--color-parchment-muted)] font-[family-name:var(--font-body)] italic mb-2">
            &ldquo;Vesper Ashwood&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
            <span className="bg-[rgba(220,38,38,0.15)] text-[var(--color-crimson-400)] px-2 py-0.5 rounded-full border border-[rgba(220,38,38,0.2)]">
              Human
            </span>
            <span className="bg-[rgba(168,85,247,0.15)] text-[var(--color-arcane-400)] px-2 py-0.5 rounded-full border border-[rgba(168,85,247,0.2)]">
              Rogue
            </span>
            <span className="bg-[rgba(255,215,0,0.1)] text-[var(--color-gold-400)] px-2 py-0.5 rounded-full border border-[rgba(255,215,0,0.15)]">
              Assassin
            </span>
            <span className="text-[var(--color-parchment-dim)]">•</span>
            <span>{character.background}</span>
            <span className="text-[var(--color-parchment-dim)]">•</span>
            <span>{character.alignment}</span>
          </div>
        </div>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {/* AC */}
          <div className="flex flex-col items-center glass-card p-3 min-w-[72px]">
            <Shield size={16} className="text-[var(--color-gold-400)] mb-1" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {character.ac}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              AC
            </span>
          </div>

          {/* Initiative */}
          <div className="flex flex-col items-center glass-card p-3 min-w-[72px]">
            <Zap size={16} className="text-[var(--color-gold-400)] mb-1" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {formatModifier(character.initiative)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Init
            </span>
          </div>

          {/* Speed */}
          <div className="flex flex-col items-center glass-card p-3 min-w-[72px]">
            <Footprints size={16} className="text-[var(--color-gold-400)] mb-1" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              {character.speed}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Speed
            </span>
          </div>

          {/* Prof Bonus */}
          <div className="flex flex-col items-center glass-card p-3 min-w-[72px]">
            <Award size={16} className="text-[var(--color-gold-400)] mb-1" />
            <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
              +{character.proficiencyBonus}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
              Prof
            </span>
          </div>
        </div>
      </div>

      {/* Orphan's Tithe Artifact & Assassin Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[rgba(255,215,0,0.1)] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--color-gold-400)] flex items-center gap-1.5">
            <span className="animate-pulse">🩸</span> Orphan&apos;s Tithe Vestige:
          </span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider border ${
            character.orphansTithe.vestigeStage === 'exalted'
              ? 'bg-[rgba(220,38,38,0.25)] text-[var(--color-crimson-400)] border-[var(--color-crimson-500)] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
              : character.orphansTithe.vestigeStage === 'awakened'
              ? 'bg-[rgba(168,85,247,0.25)] text-[var(--color-arcane-300)] border-[var(--color-arcane-500)]'
              : 'bg-[rgba(255,255,255,0.08)] text-[var(--color-parchment-dim)] border-[rgba(255,255,255,0.15)]'
          }`}>
            Stage {character.orphansTithe.vestigeStage === 'exalted' ? 'III (Exalted)' : character.orphansTithe.vestigeStage === 'awakened' ? 'II (Awakened)' : 'I (Dormant)'}
          </span>
          <span className="text-[var(--color-parchment-muted)] font-[family-name:var(--font-mono)]">
            • {character.orphansTithe.currentSouls} / 100 Souls
          </span>
        </div>

        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px]">
          <span className="bg-[rgba(220,38,38,0.1)] text-[var(--color-crimson-400)] px-2.5 py-0.5 rounded border border-[rgba(220,38,38,0.2)]">
            🗡️ Sneak Attack: 5d6
          </span>
          <span className="bg-[rgba(255,215,0,0.1)] text-[var(--color-gold-300)] px-2.5 py-0.5 rounded border border-[rgba(255,215,0,0.2)]">
            💀 Assassinate: Auto-Crit
          </span>
        </div>
      </div>

      {/* HP Section — UX Friendly Quick Math */}
      <div className="mt-5">
        <HPQuickControl
          currentHP={character.combat.currentHP}
          maxHP={character.combat.maxHP}
          tempHP={character.combat.tempHP}
          onHPChange={onHPChange}
          onTempHPChange={onTempHPChange}
          themeColor="crimson"
          characterName={character.name}
        />

        {/* Death Saves (show when HP = 0) */}
        {character.combat.currentHP === 0 && (
          <div className="flex items-center justify-center gap-6 mt-3 p-3 rounded-lg bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.3)] animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-vitality)] font-[family-name:var(--font-heading)] font-bold">Death Saves:</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={`success-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < character.combat.deathSaves.successes
                      ? 'bg-[var(--color-vitality)] border-[var(--color-vitality)] shadow-[0_0_8px_#22c55e]'
                      : 'border-[rgba(255,255,255,0.2)]'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-crimson-400)] font-[family-name:var(--font-heading)] font-bold">Fails:</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={`fail-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < character.combat.deathSaves.failures
                      ? 'bg-[var(--color-crimson-600)] border-[var(--color-crimson-600)] shadow-[0_0_8px_#dc2626]'
                      : 'border-[rgba(255,255,255,0.2)]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
