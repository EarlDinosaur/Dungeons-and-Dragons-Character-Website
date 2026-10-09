import {
  Shield,
  Swords,
  Package,
  Gem,
  BookOpen,
  Moon,
  Wand2,
  Sparkles,
  Scroll,
  Flame,
  Heart,
  ArrowLeft,
  Camera,
  Store,
  Dices,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { TabId } from '@/lib/types';
import { useCharacter } from '@/app/providers';
import { hasSpellcastingClass } from '@/lib/class-database';

export interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenDiceRoller?: () => void;
}

export interface CharacterTabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function useCharacterTabs() {
  const {
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    activeCharacterId,
    customCharacters,
    customThemes,
    navigateToMenu,
    navigateToCharacter,
    getPortraitUrl,
    openMediaPicker,
  } = useCharacter();

  const isVesper = activeCharacterId === 'vesper';
  const isCyrus = activeCharacterId === 'cyrus';
  const isWynel = activeCharacterId === 'wynel';
  const isKastoriel = activeCharacterId === 'kastoriel';
  const isAria = activeCharacterId === 'aria';
  const customChar = customCharacters?.[activeCharacterId];
  const customTheme = customThemes?.[activeCharacterId];

  const charName = isVesper
    ? (character?.name || 'Earl')
    : isAria
    ? (aria?.name || 'Aria')
    : isCyrus
    ? (cyrus?.name || 'Cyrus')
    : isWynel
    ? (wynel?.name || "Wyn'el")
    : isKastoriel
    ? (kastoriel?.name || 'Kastoriel')
    : (customChar?.name || 'Hero');

  const charLevel = isVesper
    ? character?.level || 10
    : isAria
    ? aria?.level || 10
    : isCyrus
    ? cyrus?.level || 10
    : isWynel
    ? wynel?.level || 10
    : isKastoriel
    ? kastoriel?.level || 10
    : customChar?.level || 1;

  const charClass = isVesper
    ? character?.class || 'Rogue'
    : isAria
    ? aria?.characterClass || 'Sorcerer'
    : isCyrus
    ? cyrus?.characterClass || 'Oracle'
    : isWynel
    ? wynel?.characterClass || 'Warlock'
    : isKastoriel
    ? kastoriel?.characterClass || 'Druid'
    : customChar?.class || 'Adventurer';

  const portraitUrl = getPortraitUrl(activeCharacterId);

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
    (Object.keys(customChar?.spellcasting?.slots || {}).length > 0) ||
    (character?.classes?.some((c) => ['Wizard', 'Sorcerer', 'Cleric', 'Druid', 'Bard', 'Warlock', 'Paladin', 'Ranger', 'Artificer'].includes(c.className)));

  // Character-specific tab definitions (standardized to unified labels)
  const vesperTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    ...(hasSpells ? [{ id: 'spells' as TabId, label: 'Spells', icon: Wand2 }] : []),
    { id: 'artifact', label: 'Artifact', icon: Gem },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: BookOpen },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
  ];

  const ariaTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Moon },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Spells', icon: Wand2 },
    { id: 'artifact', label: 'Artifact', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: Scroll },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
  ];

  const cyrusTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Sparkles },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Spells', icon: Wand2 },
    { id: 'artifact', label: 'Artifact', icon: Flame },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: Scroll },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
  ];

  const wynelTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Spells', icon: Wand2 },
    { id: 'artifact', label: 'Artifact', icon: Heart },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: BookOpen },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
  ];

  const kastorielTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    { id: 'spells', label: 'Spells', icon: Wand2 },
    { id: 'artifact', label: 'Artifact', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: BookOpen },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
  ];

  const customTabs: CharacterTabItem[] = [
    { id: 'character', label: 'Overview', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    ...(hasSpells ? [{ id: 'spells' as TabId, label: 'Spells', icon: Wand2 }] : []),
    { id: 'artifact', label: 'Artifact', icon: Sparkles },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dossier', label: 'Lore', icon: BookOpen },
    { id: 'chronicle', label: 'DM Notes', icon: Scroll },
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
    charName,
    charLevel,
    charClass,
    portraitUrl,
    navigateToMenu,
    navigateToCharacter,
    openMediaPicker,
    getPortraitUrl,
  };
}

/**
 * In-Page Fantasy Codex Navigation Banner.
 * Embedded directly at the top of the character sheet (NOT an edge-to-edge browser header).
 */
export default function TabNavigation({
  activeTab,
  onTabChange,
  onOpenDiceRoller,
}: TabNavigationProps) {
  const {
    tabs,
    isVesper,
    isCyrus,
    isWynel,
    isKastoriel,
    isAria,
    charName,
    charLevel,
    charClass,
    portraitUrl,
    navigateToMenu,
    navigateToCharacter,
    openMediaPicker,
    getPortraitUrl,
    activeCharacterId,
  } = useCharacterTabs();

  const getPrimaryThemeColor = () => {
    if (isVesper) return '#10b981';
    if (isCyrus) return '#f59e0b';
    if (isWynel) return '#dc2626';
    if (isKastoriel) return '#ea580c';
    if (isAria) return '#a992e8';
    return '#f59e0b';
  };

  const getActiveStyle = () => {
    if (isVesper) return 'text-emerald-300 bg-[#062016] border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.35)]';
    if (isCyrus) return 'text-amber-300 bg-[#261d10] border border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    if (isWynel) return 'text-red-200 bg-[#2a0808] border border-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.35)]';
    if (isKastoriel) return 'text-orange-200 bg-[#261204] border border-orange-600/60 shadow-[0_0_15px_rgba(234,88,12,0.35)]';
    if (isAria) return 'text-[#a992e8] bg-[#1d2249] border border-[#a992e8]/50 shadow-[0_0_15px_rgba(169,146,232,0.25)]';
    return 'text-amber-200 bg-zinc-900 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  };

  const getIconStyle = () => {
    if (isVesper) return 'text-emerald-400';
    if (isCyrus) return 'text-amber-400';
    if (isWynel) return 'text-red-400';
    if (isKastoriel) return 'text-orange-400';
    if (isAria) return 'text-[#a992e8]';
    return 'text-amber-400';
  };

  const getLineStyle = () => {
    if (isVesper) return 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    if (isCyrus) return 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
    if (isWynel) return 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]';
    if (isKastoriel) return 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-[0_0_8px_rgba(234,88,12,0.8)]';
    if (isAria) return 'bg-[#a992e8] shadow-[0_0_8px_rgba(169,146,232,0.8)]';
    return 'bg-amber-400';
  };

  return (
    <div className="w-full rounded-2xl bg-[#0a0c14]/90 border border-amber-500/20 shadow-2xl backdrop-blur-md p-3 sm:p-4 mb-6 relative overflow-hidden animate-fade-in">
      {/* Thematic Ambient Glow */}
      <div
        className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ backgroundColor: getPrimaryThemeColor() }}
      />

      {/* TOP ROW: Guildhall Return + Party Hero Hot-Swapper + Hero Mini Badge + Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 relative z-10">
        {/* LEFT: Return to Guildhall & Party Swapper */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={navigateToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-amber-200 border border-amber-500/30 hover:border-amber-400/60 text-xs font-mono font-medium transition-all shadow-md active:scale-95 cursor-pointer group shrink-0"
            title="Return to Campaign Hub & Guildhall"
          >
            <ArrowLeft size={14} className="text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-['Cormorant_Garamond',serif] uppercase tracking-wider text-xs sm:text-sm font-bold">
              Guildhall
            </span>
          </button>
        </div>

        {/* RIGHT: Active Hero Pill & Utilities */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Active Hero Identity Badge */}
          <div className="hidden min-[540px]:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 border border-zinc-800 text-xs">
            <img
              src={portraitUrl || '/vesper-portrait.png'}
              alt={charName}
              className="w-5 h-5 rounded-full object-cover border border-amber-500/40 shrink-0"
            />
            <span className="font-bold font-[family-name:var(--font-heading)] text-zinc-200 truncate max-w-[120px]">
              {charName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Lv {charLevel} {charClass}
            </span>
          </div>

          {/* Quick Dice Roller Trigger */}
          {onOpenDiceRoller && (
            <button
              onClick={onOpenDiceRoller}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-red-500/20 text-amber-200 border border-amber-500/30 hover:border-amber-400 text-xs font-mono font-semibold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              title="Open Interactive Dice Roller"
            >
              <Dices size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Dice</span>
            </button>
          )}

          {/* Media Customizer */}
          <button
            onClick={() => openMediaPicker('portraits', activeCharacterId)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 hover:border-zinc-700 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Custom Portrait & Wallpaper Customizer"
          >
            <Camera size={13} className="text-amber-400/80" />
            <span className="hidden xl:inline text-[11px]">Media</span>
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: Themed Tab Navigation Ribbon */}
      <nav
        className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-3 scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold transition-all duration-300 relative shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? getActiveStyle()
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={15} className={isActive ? getIconStyle() : 'text-zinc-400'} />
              <span className="text-[11px] sm:text-xs">{tab.label}</span>

              {isActive && (
                <div
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full ${getLineStyle()}`}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Floating Fantasy Navigation Capsule (Desktop & Tablet).
 * Floats unobtrusively at the bottom-center of the viewport, granting instant 1-click tab switching,
 * party hot-swapping, and dice rolling anywhere on the page without any top headers.
 */
export function FloatingFantasyDock({
  activeTab,
  onTabChange,
  onOpenDiceRoller,
}: TabNavigationProps) {
  const {
    tabs,
    isVesper,
    isCyrus,
    isWynel,
    isAria,
    isKastoriel,
    activeCharacterId,
    navigateToCharacter,
    navigateToMenu,
    getPortraitUrl,
    openMediaPicker,
  } = useCharacterTabs();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const currentTab = tabs[currentIndex] || tabs[0];

  const handlePrev = () => {
    if (tabs.length === 0) return;
    const idx = (currentIndex - 1 + tabs.length) % tabs.length;
    onTabChange(tabs[idx].id);
  };

  const handleNext = () => {
    if (tabs.length === 0) return;
    const idx = (currentIndex + 1) % tabs.length;
    onTabChange(tabs[idx].id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPillActiveColor = () => {
    if (isVesper) return 'from-emerald-600 to-emerald-950 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (isCyrus) return 'from-amber-600 to-yellow-800 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    if (isWynel) return 'from-red-600 to-rose-950 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]';
    if (isKastoriel) return 'from-orange-600 to-amber-950 border-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]';
    if (isAria) return 'from-purple-600 to-indigo-900 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]';
    return 'from-amber-600 to-amber-900 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]';
  };

  return (
    <aside
      aria-label="Desktop Character Navigation Dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden md:flex pointer-events-none max-w-[96vw]"
    >
      <div className="pointer-events-auto flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#0a0c14]/94 backdrop-blur-xl border border-amber-500/30 shadow-[0_12px_45px_rgba(0,0,0,0.9)] text-xs">
        {/* RETURN TO GUILDHALL */}
        <button
          onClick={navigateToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-amber-200 border border-amber-500/30 hover:border-amber-400 text-xs font-['Cormorant_Garamond',serif] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          title="Return to Guildhall / Campaign Hub"
        >
          <ArrowLeft size={13} className="text-amber-400" />
          <span>Guildhall</span>
        </button>

        <div className="h-5 w-[1px] bg-zinc-800/80 shrink-0" />

        {/* PREV TAB */}
        <button
          onClick={handlePrev}
          className="w-7 h-7 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
          title="Previous Tab"
        >
          <ChevronLeft size={15} />
        </button>

        {/* TAB ICONS STRIP */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? `bg-gradient-to-r ${getPillActiveColor()} border scale-105`
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={tab.label}
              >
                <Icon size={14} />
                {isActive && <span className="text-[11px] font-semibold">{tab.label}</span>}
              </button>
            );
          })}
        </div>

        {/* NEXT TAB */}
        <button
          onClick={handleNext}
          className="w-7 h-7 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
          title="Next Tab"
        >
          <ChevronRight size={15} />
        </button>

        {/* DICE ROLLER TRIGGER */}
        {onOpenDiceRoller && (
          <>
            <div className="h-5 w-[1px] bg-zinc-800/80 shrink-0" />
            <button
              onClick={onOpenDiceRoller}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600/30 to-red-600/30 hover:from-amber-600/50 hover:to-red-600/50 text-amber-300 border border-amber-500/40 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm shrink-0"
              title="Roll Dice"
            >
              <Dices size={14} />
            </button>
          </>
        )}

        {/* MEDIA PICKER */}
        <button
          onClick={() => openMediaPicker('portraits', activeCharacterId)}
          className="w-7 h-7 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
          title="Custom Portrait & Wallpaper Customizer"
        >
          <Camera size={13} />
        </button>

        {/* SCROLL TO TOP */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-7 h-7 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95 animate-fade-in shrink-0"
            title="Scroll to top of character sheet"
          >
            <ArrowUp size={13} />
          </button>
        )}
      </div>
    </aside>
  );
}
