'use client';

import { Shield, Swords, Package, Gem, BookOpen, Moon, Wand2, Sparkles, Scroll, Flame, Heart } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { useCharacter } from '@/app/providers';

import { hasSpellcastingClass } from '@/lib/class-database';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export interface CharacterTabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function useCharacterTabs() {
  const { character, aria, cyrus, wynel, kastoriel, activeCharacterId, customCharacters, customThemes } = useCharacter();
  const isVesper = activeCharacterId === 'vesper';
  const isCyrus = activeCharacterId === 'cyrus';
  const isWynel = activeCharacterId === 'wynel';
  const isKastoriel = activeCharacterId === 'kastoriel';
  const isAria = activeCharacterId === 'aria';
  const customChar = customCharacters?.[activeCharacterId];
  const customTheme = customThemes?.[activeCharacterId];

  const activeClasses = isVesper
    ? (character?.classes && character.classes.length > 0 ? character.classes : [{ className: character?.class || 'Rogue', subclass: character?.subclass || 'Assassin' }])
    : isCyrus
    ? (cyrus?.classes && cyrus.classes.length > 0 ? cyrus.classes : [{ className: cyrus?.characterClass || 'Oracle', subclass: cyrus?.subclass || 'Solar Mystery' }])
    : isWynel
    ? (wynel?.classes && wynel.classes.length > 0 ? wynel.classes : [{ className: wynel?.characterClass || 'Warlock', subclass: wynel?.subclass || 'The Archfey' }])
    : isKastoriel
    ? (kastoriel?.classes && kastoriel.classes.length > 0 ? kastoriel.classes : [{ className: kastoriel?.characterClass || 'Druid', subclass: kastoriel?.subclass || 'Circle of the Stars' }])
    : isAria
    ? (aria?.classes && aria.classes.length > 0 ? aria.classes : [{ className: aria?.characterClass || 'Lunar Sorcerer', subclass: aria?.subclass || 'Lunar Sorcery' }])
    : (customChar?.classes && customChar.classes.length > 0 ? customChar.classes : [{ className: customChar?.class || 'Fighter', subclass: customChar?.subclass || '' }]);

  const canCastSpells = hasSpellcastingClass(activeClasses);
  const hasSpells =
    isAria ||
    isCyrus ||
    isWynel ||
    isKastoriel ||
    canCastSpells ||
    (character?.spellcasting?.spells && character.spellcasting.spells.length > 0) ||
    (customChar?.spellcasting?.spells && customChar.spellcasting.spells.length > 0) ||
    (Object.keys(character?.spellcasting?.slots || {}).length > 0) ||
    (Object.keys(customChar?.spellcasting?.slots || {}).length > 0);

  // Character-specific tab definitions
  const vesperTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Stats', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    ...(hasSpells ? [{ id: 'spells' as TabId, label: 'Spells', icon: Wand2 }] : []),
    { id: 'artifact', label: 'Soul Harvester', icon: Gem },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'dossier', label: 'Dossier', icon: BookOpen },
  ];

  const ariaTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Moon },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Spellbook', icon: Wand2 },
    { id: 'artifact', label: 'Lunar Tides', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'dossier', label: 'Grimoire', icon: Scroll },
  ];

  const cyrusTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Oracle Sheet', icon: Sparkles },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Solar Spells', icon: Wand2 },
    { id: 'artifact', label: 'Solar Engine', icon: Flame },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Equipment', icon: Package },
    { id: 'dossier', label: 'Prophecies', icon: Scroll },
  ];

  const wynelTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Stats & Heritage', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Pact Magic', icon: Wand2 },
    { id: 'artifact', label: 'Crimson Tattoo', icon: Heart },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Treasury', icon: Package },
    { id: 'dossier', label: 'Grimoire & Lore', icon: BookOpen },
  ];

  const kastorielTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Starry Druid', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Star Spells', icon: Wand2 },
    { id: 'artifact', label: 'Starry Forms', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Pendulum & Gear', icon: Package },
    { id: 'dossier', label: 'Starlight Lore', icon: BookOpen },
  ];

  const customTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Stats', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    ...(hasSpells ? [{ id: 'spells' as TabId, label: 'Spells', icon: Wand2 }] : []),
    { id: 'artifact', label: 'Heroic Powers', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'dossier', label: 'Dossier', icon: BookOpen },
  ];

  const tabs = isVesper
    ? vesperTabs
    : isCyrus
    ? cyrusTabs
    : isWynel
    ? wynelTabs
    : isKastoriel
    ? kastorielTabs
    : isAria
    ? ariaTabs
    : customTabs;

  return {
    tabs,
    isVesper,
    isCyrus,
    isWynel,
    isKastoriel,
    isAria,
    activeCharacterId,
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customChar,
    customTheme,
  };
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { tabs, isVesper, isCyrus, isWynel, isKastoriel, isAria } = useCharacterTabs();

  return (
    <nav className="sticky top-[41px] z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-2 hidden md:block">
      <div
        className="max-w-6xl mx-auto px-2 sm:px-4 flex items-center justify-start md:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth touch-pan-x overscroll-x-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const getActiveStyle = () => {
            if (isVesper) return 'text-[var(--color-gold-400)] bg-[var(--color-surface-raised)] border border-[rgba(255,215,0,0.2)] shadow-[0_0_15px_rgba(255,215,0,0.15)]';
            if (isCyrus) return 'text-amber-300 bg-[#261d10] border border-[#f59e0b]/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
            if (isWynel) return 'text-rose-200 bg-[#2b080f] border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)]';
            if (isKastoriel) return 'text-amber-200 bg-[#161208] border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]';
            if (isAria) return 'text-[#a992e8] bg-[#1d2249] border border-[#a992e8]/40 shadow-[0_0_15px_rgba(169,146,232,0.25)]';
            return 'text-amber-200 bg-zinc-900 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
          };

          const getIconStyle = () => {
            if (isVesper) return 'text-[var(--color-gold-400)]';
            if (isCyrus) return 'text-amber-400';
            if (isWynel) return 'text-red-400';
            if (isKastoriel) return 'text-amber-400';
            if (isAria) return 'text-[#a992e8]';
            return 'text-amber-400';
          };

          const getLineStyle = () => {
            if (isVesper) return 'bg-[var(--color-gold-bright)]';
            if (isCyrus) return 'bg-amber-400';
            if (isWynel) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
            if (isKastoriel) return 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
            if (isAria) return 'bg-[#a992e8]';
            return 'bg-amber-400';
          };

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold transition-all duration-300 relative shrink-0 whitespace-nowrap cursor-pointer ${isActive
                  ? getActiveStyle()
                  : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] hover:bg-white/5'
                }`}
            >
              <Icon size={15} className={isActive ? getIconStyle() : 'text-[var(--color-parchment-dim)]'} />
              <span className="text-[11px] sm:text-xs">{tab.label}</span>

              {isActive && (
                <div
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full ${getLineStyle()}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
