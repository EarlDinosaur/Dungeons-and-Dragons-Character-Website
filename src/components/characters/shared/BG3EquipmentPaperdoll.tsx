'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Swords,
  Crosshair,
  Crown,
  Sparkles,
  Gem,
  CircleDot,
  Music,
  Footprints,
  Shirt,
  Hand,
  Feather,
  Package,
  Weight,
  Coins,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  Info,
  Sliders,
  Zap,
  AlertCircle,
} from 'lucide-react';
import type { CharacterState, InventoryItem, Currency, EquipmentSlotId } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface BG3EquipmentPaperdollProps {
  character: CharacterState;
  characterId: string;
  onInventoryChange: (inv: InventoryItem[]) => void;
  onCurrencyChange: (curr: Currency) => void;
}

export const RARITY_COLORS: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  }
> = {
  Common: {
    border: 'border-zinc-700/80',
    bg: 'bg-zinc-900/80',
    text: 'text-zinc-300',
    glow: '',
    badgeBg: 'bg-zinc-800/80 border-zinc-700/80',
    badgeText: 'text-zinc-300',
    accent: '#71717a',
  },
  Uncommon: {
    border: 'border-emerald-500',
    bg: 'bg-gradient-to-b from-emerald-950/60 via-zinc-900/90 to-zinc-950',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_14px_rgba(16,185,129,0.35)]',
    badgeBg: 'bg-emerald-950/80 border-emerald-500/60',
    badgeText: 'text-emerald-300',
    accent: '#10b981',
  },
  Rare: {
    border: 'border-sky-400',
    bg: 'bg-gradient-to-b from-sky-950/60 via-zinc-900/90 to-zinc-950',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_18px_rgba(56,189,248,0.4)]',
    badgeBg: 'bg-sky-950/80 border-sky-500/60',
    badgeText: 'text-sky-300',
    accent: '#38bdf8',
  },
  'Very Rare': {
    border: 'border-purple-400',
    bg: 'bg-gradient-to-b from-purple-950/60 via-zinc-900/90 to-zinc-950',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.45)]',
    badgeBg: 'bg-purple-950/80 border-purple-500/60',
    badgeText: 'text-purple-300',
    accent: '#c084fc',
  },
  Legendary: {
    border: 'border-amber-400',
    bg: 'bg-gradient-to-b from-amber-950/70 via-zinc-900/90 to-zinc-950',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.55)]',
    badgeBg: 'bg-amber-950/80 border-amber-400/70',
    badgeText: 'text-amber-300',
    accent: '#fbbf24',
  },
};

export function getItemRarity(
  item?: InventoryItem | null
): 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' {
  if (!item) return 'Common';
  if (item.rarity) {
    const r = item.rarity.toLowerCase();
    if (r.includes('legendary') || r.includes('artifact')) return 'Legendary';
    if (r.includes('very rare')) return 'Very Rare';
    if (r.includes('rare')) return 'Rare';
    if (r.includes('uncommon')) return 'Uncommon';
    return 'Common';
  }

  // Automatic heuristic based on item name and description
  const text = `${item.name} ${item.description || ''}`.toLowerCase();
  if (
    text.includes('legendary') ||
    text.includes('artifact') ||
    text.includes('netheril') ||
    text.includes('demigod') ||
    text.includes('moonblade')
  ) {
    return 'Legendary';
  }
  if (
    text.includes('very rare') ||
    text.includes('obsidian robes') ||
    text.includes('+2') ||
    text.includes('sunblade') ||
    text.includes('celestial') ||
    text.includes('wyrm')
  ) {
    return 'Very Rare';
  }
  if (
    text.includes('rare') ||
    text.includes('elvenkind') ||
    text.includes('protection') ||
    text.includes('+1') ||
    text.includes('holding') ||
    text.includes('silver mist') ||
    text.includes('mithral') ||
    text.includes('flame') ||
    text.includes('frost')
  ) {
    return 'Rare';
  }
  if (
    text.includes('uncommon') ||
    text.includes('healing') ||
    text.includes('greater') ||
    text.includes('superior') ||
    text.includes('alchemy') ||
    text.includes('scroll') ||
    text.includes('gem')
  ) {
    return 'Uncommon';
  }

  return 'Common';
}

export function getSlotTypeName(slotId: EquipmentSlotId): string {
  switch (slotId) {
    case 'head':
      return 'Headwear';
    case 'cloak':
      return 'Cloak';
    case 'armor':
      return 'Body Armor';
    case 'gloves':
      return 'Gloves / Bracers';
    case 'boots':
      return 'Boots';
    case 'clothes':
      return 'Camp Clothes / Robes';
    case 'amulet':
      return 'Amulet / Necklace';
    case 'ring1':
    case 'ring2':
      return 'Ring';
    case 'trinket':
      return 'Trinket / Focus';
    case 'melee_main':
      return 'Melee Main-Hand';
    case 'melee_off':
      return 'Shield / Off-Hand';
    case 'ranged_main':
      return 'Ranged Weapon';
    case 'ranged_off':
      return 'Quiver / Ammo';
    default:
      return 'Equipment';
  }
}

export function isItemCompatibleWithSlot(
  item: InventoryItem,
  targetSlot: EquipmentSlotId
): boolean {
  if (!item) return false;

  // Consumables can NEVER be equipped to wearable slots
  if (item.category === 'consumable') return false;

  // Explicit slot assignment check
  if (item.slot) {
    if (item.slot === targetSlot) return true;
    if (
      (item.slot === 'ring1' || item.slot === 'ring2') &&
      (targetSlot === 'ring1' || targetSlot === 'ring2')
    ) {
      return true;
    }
  }

  const name = item.name.toLowerCase();

  switch (targetSlot) {
    case 'head':
      return (
        name.includes('helm') ||
        name.includes('helmet') ||
        name.includes('hat') ||
        name.includes('hood') ||
        name.includes('circlet') ||
        name.includes('crown') ||
        name.includes('cowl') ||
        name.includes('diadem') ||
        name.includes('mask') ||
        name.includes('cap') ||
        name.includes('headband') ||
        name.includes('tiara')
      );

    case 'cloak':
      return (
        name.includes('cloak') ||
        name.includes('cape') ||
        name.includes('mantle') ||
        name.includes('shawl') ||
        name.includes('shroud')
      );

    case 'armor':
      if (
        name.includes('shield') ||
        name.includes('helm') ||
        name.includes('hat') ||
        name.includes('hood') ||
        name.includes('cloak') ||
        name.includes('cape') ||
        name.includes('glove') ||
        name.includes('gauntlet') ||
        name.includes('boot') ||
        name.includes('greave')
      ) {
        return false;
      }
      return (
        item.category === 'armor' ||
        name.includes('armor') ||
        name.includes('plate') ||
        name.includes('mail') ||
        name.includes('cuirass') ||
        name.includes('breastplate') ||
        name.includes('hide') ||
        name.includes('scale') ||
        name.includes('chainmail') ||
        name.includes('leather armor') ||
        name.includes('padded armor') ||
        name.includes('half plate')
      );

    case 'gloves':
      return (
        name.includes('glove') ||
        name.includes('gauntlet') ||
        name.includes('bracer') ||
        name.includes('handwrap') ||
        name.includes('mitt')
      );

    case 'boots':
      return (
        name.includes('boot') ||
        name.includes('greave') ||
        name.includes('shoe') ||
        name.includes('sandal') ||
        name.includes('slipper') ||
        name.includes('treads') ||
        name.includes('stride')
      );

    case 'clothes':
      return (
        name.includes('robe') ||
        name.includes('clothes') ||
        name.includes('tunic') ||
        name.includes('garb') ||
        name.includes('vestment') ||
        name.includes('shirt') ||
        name.includes('doublet') ||
        name.includes('outfit') ||
        name.includes('attire') ||
        name.includes('gown') ||
        name.includes('breeches')
      );

    case 'amulet':
      return (
        name.includes('amulet') ||
        name.includes('necklace') ||
        name.includes('pendant') ||
        name.includes('talisman') ||
        name.includes('pendulum') ||
        name.includes('periapt') ||
        name.includes('choker') ||
        name.includes('locket') ||
        name.includes('medallion') ||
        name.includes('torc')
      );

    case 'ring1':
    case 'ring2':
      return (
        name.includes('ring') ||
        name.includes('signet') ||
        name.includes('band') ||
        name.includes('loop')
      );

    case 'trinket':
      return (
        name.includes('instrument') ||
        name.includes('lute') ||
        name.includes('flute') ||
        name.includes('drum') ||
        name.includes('horn') ||
        name.includes('lyre') ||
        name.includes('viol') ||
        name.includes('focus') ||
        name.includes('symbol') ||
        name.includes('holy') ||
        name.includes('relic') ||
        name.includes('orb') ||
        name.includes('crystal') ||
        name.includes('charm') ||
        name.includes('trinket') ||
        name.includes('deck') ||
        name.includes('bell') ||
        name.includes('totem') ||
        item.category === 'treasure' ||
        item.category === 'tool'
      );

    case 'melee_main':
      return (
        item.category === 'weapon' &&
        !name.includes('bow') &&
        !name.includes('crossbow') &&
        !name.includes('sling') &&
        !name.includes('dart') &&
        !name.includes('blowgun')
      );

    case 'melee_off':
      return (
        name.includes('shield') ||
        name.includes('buckler') ||
        (item.category === 'weapon' &&
          (name.includes('dagger') ||
            name.includes('shortsword') ||
            name.includes('scimitar') ||
            name.includes('handaxe') ||
            name.includes('light hammer') ||
            name.includes('sickle') ||
            name.includes('offhand')))
      );

    case 'ranged_main':
      return (
        item.category === 'weapon' &&
        (name.includes('bow') ||
          name.includes('crossbow') ||
          name.includes('sling') ||
          name.includes('dart') ||
          name.includes('blowgun') ||
          name.includes('javelin'))
      );

    case 'ranged_off':
      return (
        name.includes('quiver') ||
        name.includes('arrow') ||
        name.includes('bolt') ||
        name.includes('bullet') ||
        name.includes('ammo') ||
        name.includes('ammunition')
      );

    default:
      return false;
  }
}

export function detectItemSlot(item: InventoryItem): EquipmentSlotId | null {
  if (item.slot) return item.slot;
  if (item.category === 'consumable') return null;

  const slots: EquipmentSlotId[] = [
    'head',
    'cloak',
    'armor',
    'gloves',
    'boots',
    'clothes',
    'amulet',
    'ring1',
    'ring2',
    'trinket',
    'melee_off',
    'ranged_main',
    'ranged_off',
    'melee_main',
  ];

  for (const s of slots) {
    if (isItemCompatibleWithSlot(item, s)) {
      return s;
    }
  }

  return null;
}

export default function BG3EquipmentPaperdoll({
  character,
  characterId,
  onInventoryChange,
  onCurrencyChange,
}: BG3EquipmentPaperdollProps) {
  const { equipInventoryItem, unequipInventoryItem, getPortraitUrl } = useCharacter();

  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlotId | null>(null);
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);
  const [bagCategory, setBagCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map equipped items by their effective and validated slot
  const equippedBySlot = useMemo(() => {
    const map: Partial<Record<EquipmentSlotId, InventoryItem>> = {};
    for (const item of character.inventory) {
      if (item.equipped) {
        const slot = item.slot || detectItemSlot(item);
        if (slot && isItemCompatibleWithSlot(item, slot)) {
          if (!map[slot]) {
            map[slot] = item;
          } else if (slot === 'ring1' && !map['ring2']) {
            map['ring2'] = item;
          }
        }
      }
    }
    return map;
  }, [character.inventory]);

  // Carrying capacity
  const totalWeight = useMemo(() => {
    return character.inventory.reduce(
      (sum, item) => sum + (item.weight || 0) * (item.quantity || 1),
      0
    );
  }, [character.inventory]);

  const maxCapacity = (character.abilityScores?.STR?.total || 10) * 15;
  const encumbrancePercent = Math.min(
    100,
    Math.round((totalWeight / Math.max(1, maxCapacity)) * 100)
  );

  // Filter bag items
  const bagItems = useMemo(() => {
    return character.inventory.filter((item) => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (bagCategory === 'all') return true;
      if (bagCategory === 'weapon') return item.category === 'weapon';
      if (bagCategory === 'armor') return item.category === 'armor';
      if (bagCategory === 'consumable') return item.category === 'consumable';
      if (bagCategory === 'gear') return item.category === 'gear' || item.category === 'tool';
      return true;
    });
  }, [character.inventory, bagCategory, searchQuery]);

  // Attack & Damage estimation
  const meleeMain = equippedBySlot.melee_main;
  const rangedMain = equippedBySlot.ranged_main;

  const profBonus = character.proficiencyBonus || 4;
  const strMod = Math.floor(((character.abilityScores?.STR?.total || 10) - 10) / 2);
  const dexMod = Math.floor(((character.abilityScores?.DEX?.total || 10) - 10) / 2);

  const meleeAttackBonus = (meleeMain?.attackBonus ?? 0) + profBonus + strMod;
  const meleeDamageRange = meleeMain?.damage || '1d8 + 3';

  const rangedAttackBonus = (rangedMain?.attackBonus ?? 0) + profBonus + dexMod;
  const rangedDamageRange = rangedMain?.damage || '1d8 + 4';

  const portrait = getPortraitUrl(characterId) || '/portraits/default.jpg';

  const renderSlotSquare = (
    slotId: EquipmentSlotId,
    label: string,
    DefaultIcon: React.ElementType
  ) => {
    const item = equippedBySlot[slotId];
    const rarity = getItemRarity(item);
    const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common;

    return (
      <div className="flex flex-col items-center gap-1 group">
        <div
          onClick={() => {
            setSelectedSlot(slotId);
            if (item) setInspectedItem(item);
          }}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            item
              ? `${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.glow} hover:scale-105 hover:border-amber-400`
              : 'border-zinc-800/90 bg-[#0c0e14]/90 hover:border-zinc-600 hover:bg-zinc-800/50'
          } ${selectedSlot === slotId ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
          title={`${label}: ${item ? `${item.name} (${rarity})` : 'Empty'}`}
        >
          {item ? (
            <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full relative overflow-hidden rounded-xl">
              {/* Corner Rarity Gem */}
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full border border-black/40 pointer-events-none"
                style={{
                  backgroundColor: rarityStyle.accent,
                  boxShadow: `0 0 6px ${rarityStyle.accent}`,
                }}
              />
              <DefaultIcon size={20} className={rarityStyle.text} />
              <span
                className={`text-[9px] font-bold ${rarityStyle.text} truncate w-full px-1 text-center leading-tight mt-0.5`}
              >
                {item.name}
              </span>
            </div>
          ) : (
            <DefaultIcon
              size={18}
              className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
            />
          )}
        </div>

        {/* Clean, non-overlapping label in document flow */}
        <span className="text-[9px] font-mono text-zinc-400 group-hover:text-amber-400 transition-colors uppercase tracking-wider font-semibold truncate max-w-[64px] text-center">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#07080b] text-zinc-200 font-mono select-none">
      {/* 1. Character Header: BG3 Name & Health Ribbon with comfortable spacing */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2 pb-3 mb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <Crown size={18} className="text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider">
            {character.name || 'Hero'}
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Lv {character.level} {character.class || 'Adventurer'}
          </span>
        </div>

        {/* HP Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-400 font-bold">HP</span>
          <div className="w-28 sm:w-40 h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (character.combat.currentHP / Math.max(1, character.combat.maxHP)) * 100
                  )
                )}%`,
              }}
            />
          </div>
          <span className="text-zinc-300 font-bold text-[11px]">
            {character.combat.currentHP} / {character.combat.maxHP}
          </span>
        </div>
      </div>

      {/* 2. BG3 Paperdoll Centerpiece with generous padding to prevent top overlap */}
      <div className="w-full max-w-4xl flex flex-col items-center bg-gradient-to-b from-[#0b0d13] via-[#090b10] to-[#07080b] border border-zinc-800/80 rounded-2xl pt-8 pb-7 px-4 sm:px-8 shadow-2xl relative overflow-hidden">
        {/* Ambient class rune behind paperdoll */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Paperdoll & Flanking Slot Columns */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 w-full">
          {/* Left Column: Head, Cloak, Armor, Gloves, Boots */}
          <div className="flex flex-col gap-3.5 sm:gap-4 items-center">
            {renderSlotSquare('head', 'Head', Crown)}
            {renderSlotSquare('cloak', 'Cloak', Shield)}
            {renderSlotSquare('armor', 'Armor', Shirt)}
            {renderSlotSquare('gloves', 'Gloves', Hand)}
            {renderSlotSquare('boots', 'Boots', Footprints)}
          </div>

          {/* Center Paperdoll Figure (Proportionally matched to flanking slots) */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative w-44 h-72 sm:w-60 sm:h-[390px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_30px_rgba(0,0,0,0.85)] bg-zinc-950 group">
              {/* Character full portrait */}
              <img
                src={portrait}
                alt={character.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Shading overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Runic frame corner accents */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Clothes, Amulet, Ring 1, Ring 2, Trinket */}
          <div className="flex flex-col gap-3.5 sm:gap-4 items-center">
            {renderSlotSquare('clothes', 'Clothes', Sparkles)}
            {renderSlotSquare('amulet', 'Amulet', Gem)}
            {renderSlotSquare('ring1', 'Ring 1', CircleDot)}
            {renderSlotSquare('ring2', 'Ring 2', CircleDot)}
            {renderSlotSquare('trinket', 'Trinket', Music)}
          </div>
        </div>

        {/* 3. Combat Armament Section (Melee Weapons + AC Shield Badge + Ranged Weapons) */}
        <div className="w-full max-w-2xl mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Melee Set */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {renderSlotSquare('melee_main', 'Main Hand', Swords)}
              {renderSlotSquare('melee_off', 'Off Hand', Shield)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Melee
              </span>
              <span className="text-xs font-bold text-zinc-100">
                {meleeAttackBonus >= 0 ? `+${meleeAttackBonus}` : meleeAttackBonus} Atk
              </span>
              <span className="text-[10px] text-zinc-400">{meleeDamageRange}</span>
            </div>
          </div>

          {/* Center: Prominent AC Badge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] w-20 h-20 shrink-0">
            <Shield size={22} className="text-amber-400 mb-0.5" />
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">AC</span>
            <span className="text-base font-extrabold text-white leading-none">
              {character.ac || 15}
            </span>
          </div>

          {/* Right: Ranged Set */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Ranged
              </span>
              <span className="text-xs font-bold text-zinc-100">
                {rangedAttackBonus >= 0 ? `+${rangedAttackBonus}` : rangedAttackBonus} Atk
              </span>
              <span className="text-[10px] text-zinc-400">{rangedDamageRange}</span>
            </div>
            <div className="flex items-center gap-2">
              {renderSlotSquare('ranged_main', 'Ranged', Crosshair)}
              {renderSlotSquare('ranged_off', 'Quiver', Feather)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Slot Selection & Swap Popover (Enforces Strict Slot-Type Matching) */}
      {selectedSlot && (
        <div className="w-full max-w-4xl mt-4 p-4 rounded-xl bg-[#0c0e15] border border-amber-500/40 shadow-2xl animate-fade-in flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Equipment Slot: {getSlotTypeName(selectedSlot)}
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="p-1 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Current Equipped Item in this Slot */}
          <div className="py-1">
            {equippedBySlot[selectedSlot] ? (
              (() => {
                const currentItem = equippedBySlot[selectedSlot]!;
                const currentRarity = getItemRarity(currentItem);
                const currentRarityStyle = RARITY_COLORS[currentRarity] || RARITY_COLORS.Common;

                return (
                  <div
                    className={`flex items-center justify-between w-full p-2.5 rounded-lg border ${currentRarityStyle.border} ${currentRarityStyle.bg} ${currentRarityStyle.glow}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${currentRarityStyle.text}`}>
                          {currentItem.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${currentRarityStyle.badgeBg} ${currentRarityStyle.badgeText}`}
                        >
                          {currentRarity}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {currentItem.description || 'Equipped in this slot.'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        unequipInventoryItem(characterId, currentItem.id);
                      }}
                      className="px-3 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold cursor-pointer transition-colors shrink-0 ml-2"
                    >
                      Unequip
                    </button>
                  </div>
                );
              })()
            ) : (
              <p className="text-zinc-500 text-xs py-1">Slot is currently empty.</p>
            )}
          </div>

          {/* Quick Swap Options from Inventory (Filtered Strictly by Slot Compatibility) */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">
              Compatible Items in Bag (Only {getSlotTypeName(selectedSlot)}):
            </span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {(() => {
                const compatibleItems = character.inventory.filter(
                  (item) => !item.equipped && isItemCompatibleWithSlot(item, selectedSlot)
                );

                if (compatibleItems.length === 0) {
                  return (
                    <div className="p-3 text-center bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                      <p className="text-zinc-400 text-xs flex items-center justify-center gap-1.5">
                        <AlertCircle size={13} className="text-amber-400" />
                        No matching {getSlotTypeName(selectedSlot)} items found in your bag.
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1">
                        Only items of type "{getSlotTypeName(selectedSlot)}" can be equipped into
                        this slot.
                      </p>
                    </div>
                  );
                }

                return compatibleItems.map((item) => {
                  const itemRarity = getItemRarity(item);
                  const itemRarityStyle = RARITY_COLORS[itemRarity] || RARITY_COLORS.Common;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${itemRarityStyle.border} ${itemRarityStyle.bg} text-xs transition-all`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${itemRarityStyle.text}`}>{item.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${itemRarityStyle.badgeBg} ${itemRarityStyle.badgeText}`}
                          >
                            {itemRarity}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block truncate max-w-sm mt-0.5">
                          {item.description || `${item.category} • ${item.weight || 0} lbs`}
                        </span>
                      </div>
                      <button
                        onClick={() => equipInventoryItem(characterId, item.id, selectedSlot)}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shrink-0 ml-2 shadow-xs transition-transform active:scale-95"
                      >
                        Equip to {getSlotTypeName(selectedSlot)}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 5. Baldur's Gate 3 Inventory Bag Grid with Rarity Coloring */}
      <div className="w-full max-w-4xl mt-6 p-4 rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-xl flex flex-col gap-3">
        {/* Category filter pills & search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {['all', 'weapon', 'armor', 'consumable', 'gear'].map((cat) => (
              <button
                key={cat}
                onClick={() => setBagCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                  bagCategory === cat
                    ? 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-48">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bag..."
              className="w-full pl-8 pr-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Item Tile Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 min-h-[160px] max-h-[360px] overflow-y-auto p-1">
          {bagItems.map((item) => {
            const rarity = getItemRarity(item);
            const style = RARITY_COLORS[rarity] || RARITY_COLORS.Common;
            const isEquipped = item.equipped;

            return (
              <div
                key={item.id}
                onClick={() => setInspectedItem(item)}
                className={`relative group aspect-square rounded-xl border flex flex-col items-center justify-center p-1.5 cursor-pointer transition-all duration-200 ${
                  style.border
                } ${style.bg} ${style.glow} hover:scale-105 hover:border-amber-400 ${
                  inspectedItem?.id === item.id ? 'ring-2 ring-amber-400' : ''
                }`}
                title={`${item.name} (${rarity})`}
              >
                {/* Rarity Corner Jewel */}
                <span
                  className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: style.accent,
                    boxShadow: `0 0 5px ${style.accent}`,
                  }}
                />

                <Package size={20} className={style.text} />
                <span
                  className={`text-[9px] font-bold ${style.text} truncate w-full text-center mt-1 px-0.5`}
                >
                  {item.name}
                </span>

                {/* Stack count */}
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded bg-black/80 text-amber-300 border border-zinc-700">
                    x{item.quantity}
                  </span>
                )}

                {/* Equipped Badge */}
                {isEquipped && (
                  <span
                    className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-black/50"
                    style={{
                      backgroundColor: style.accent,
                      boxShadow: `0 0 8px ${style.accent}`,
                    }}
                    title="Equipped"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 6. Item Details Tooltip / Card (When clicked) */}
        {inspectedItem && (
          <div className="p-3 bg-[#0d0f17] border border-amber-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            {(() => {
              const itemRarity = getItemRarity(inspectedItem);
              const itemStyle = RARITY_COLORS[itemRarity] || RARITY_COLORS.Common;
              const compatibleSlot = detectItemSlot(inspectedItem);
              const canEquip =
                compatibleSlot !== null && isItemCompatibleWithSlot(inspectedItem, compatibleSlot);

              return (
                <>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${itemStyle.text}`}>
                        {inspectedItem.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${itemStyle.badgeBg} ${itemStyle.badgeText}`}
                      >
                        {itemRarity}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {inspectedItem.weight || 0} lbs &bull; Qty {inspectedItem.quantity}
                      </span>
                      {compatibleSlot && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          [{getSlotTypeName(compatibleSlot)}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {inspectedItem.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {inspectedItem.equipped ? (
                      <button
                        onClick={() => unequipInventoryItem(characterId, inspectedItem.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer transition-colors"
                      >
                        Unequip
                      </button>
                    ) : canEquip ? (
                      <button
                        onClick={() =>
                          equipInventoryItem(characterId, inspectedItem.id, compatibleSlot)
                        }
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-xs cursor-pointer transition-transform active:scale-95"
                      >
                        Equip to {getSlotTypeName(compatibleSlot)}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs italic">
                        {inspectedItem.category === 'consumable'
                          ? 'Consumable'
                          : 'Cannot be worn'}
                      </span>
                    )}

                    <button
                      onClick={() => setInspectedItem(null)}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 7. Bottom Bar: Carrying Capacity & Purse Balance */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Encumbrance Bar */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Weight size={14} className="text-zinc-400" />
            <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${
                  encumbrancePercent > 90
                    ? 'bg-red-500'
                    : encumbrancePercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${encumbrancePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold shrink-0">
              {totalWeight.toFixed(1)} / {maxCapacity} lbs
            </span>
          </div>

          {/* Coin Purse Summary */}
          <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1 rounded-xl border border-zinc-800/80 text-[11px]">
            <Coins size={13} className="text-amber-400" />
            <span className="text-amber-300 font-bold">{character.currency.gp} GP</span>
            <span className="text-zinc-400 text-[10px]">
              &bull; {character.currency.sp} SP &bull; {character.currency.cp} CP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
