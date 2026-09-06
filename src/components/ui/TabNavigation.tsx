'use client';

import { Shield, Swords, Package, Gem, BookOpen, Moon, Wand2, Sparkles, Scroll, Flame } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { useCharacter } from '@/app/providers';

import { hasSpellcastingClass } from '@/lib/class-database';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { character, aria, cyrus, activeCharacterId } = useCharacter();
  const isVesper = activeCharacterId === 'vesper';
  const isCyrus = activeCharacterId === 'cyrus';

  const activeClasses = isVesper
    ? (character?.classes && character.classes.length > 0 ? character.classes : [{ className: character?.class || 'Rogue', subclass: character?.subclass || 'Assassin' }])
    : isCyrus
    ? (cyrus?.classes && cyrus.classes.length > 0 ? cyrus.classes : [{ className: cyrus?.characterClass || 'Cleric', subclass: cyrus?.subclass || 'Solar Mystery' }])
    : (aria?.classes && aria.classes.length > 0 ? aria.classes : [{ className: aria?.characterClass || 'Sorcerer', subclass: aria?.subclass || 'Lunar Sorcery' }]);

  const canCastSpells = hasSpellcastingClass(activeClasses);

  // Character-specific tab definitions
  const vesperTabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'character', label: 'Stats', icon: Shield },
    { id: 'combat', label: 'Combat', icon: Swords },
    ...(canCastSpells ? [{ id: 'spells' as TabId, label: 'Spells', icon: Wand2 }] : []),
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'artifact', label: 'Soul Harvester', icon: Gem },
    { id: 'dossier', label: 'Dossier', icon: BookOpen },
  ];

  const ariaTabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'character', label: 'Overview', icon: Moon },
    { id: 'combat', label: canCastSpells ? 'Combat & Spells' : 'Combat', icon: Swords },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'artifact', label: 'Lunar Tides', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'dossier', label: 'Grimoire', icon: Scroll },
  ];

  const cyrusTabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'character', label: 'Oracle Sheet', icon: Sparkles },
    { id: 'combat', label: canCastSpells ? 'Combat & Spells' : 'Combat', icon: Swords },
    { id: 'progression', label: 'Feats', icon: Sparkles },
    { id: 'artifact', label: 'Solar Engine', icon: Flame },
    { id: 'inventory', label: 'Equipment', icon: Package },
    { id: 'dossier', label: 'Prophecies', icon: Scroll },
  ];

  const tabs = isVesper ? vesperTabs : isCyrus ? cyrusTabs : ariaTabs;


  return (
    <nav className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-2">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const getActiveStyle = () => {
            if (isVesper) return 'text-[var(--color-gold-400)] bg-[var(--color-surface-raised)] border border-[rgba(255,215,0,0.2)] shadow-[0_0_15px_rgba(255,215,0,0.15)]';
            if (isCyrus) return 'text-amber-300 bg-[#261d10] border border-[#f59e0b]/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
            return 'text-[#a992e8] bg-[#1d2249] border border-[#a992e8]/40 shadow-[0_0_15px_rgba(169,146,232,0.25)]';
          };

          const getIconStyle = () => {
            if (isVesper) return 'text-[var(--color-gold-400)]';
            if (isCyrus) return 'text-amber-400';
            return 'text-[#a992e8]';
          };

          const getLineStyle = () => {
            if (isVesper) return 'bg-[var(--color-gold-bright)]';
            if (isCyrus) return 'bg-amber-400';
            return 'bg-[#a992e8]';
          };

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold transition-all duration-300 relative ${isActive
                  ? getActiveStyle()
                  : 'text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] hover:bg-white/5'
                }`}
            >
              <Icon size={16} className={isActive ? getIconStyle() : 'text-[var(--color-parchment-dim)]'} />
              <span className="hidden sm:inline">{tab.label}</span>

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
