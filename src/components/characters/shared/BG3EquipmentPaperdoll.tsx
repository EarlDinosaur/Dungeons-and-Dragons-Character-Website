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
} from 'lucide-react';
import type { CharacterState, InventoryItem, Currency, EquipmentSlotId } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface BG3EquipmentPaperdollProps {
  character: CharacterState;
  characterId: string;
  onInventoryChange: (inv: InventoryItem[]) => void;
  onCurrencyChange: (curr: Currency) => void;
}

export function detectItemSlot(item: InventoryItem): EquipmentSlotId {
  if (item.slot) return item.slot;
  const name = item.name.toLowerCase();

  if (item.category === 'weapon') {
    if (
      name.includes('bow') ||
      name.includes('crossbow') ||
      name.includes('dart') ||
      name.includes('sling')
    ) {
      return 'ranged_main';
    }
    return 'melee_main';
  }

  if (item.category === 'armor') {
    if (name.includes('shield')) return 'melee_off';
    if (
      name.includes('helm') ||
      name.includes('hat') ||
      name.includes('hood') ||
      name.includes('circlet') ||
      name.includes('crown') ||
      name.includes('cowl')
    ) {
      return 'head';
    }
    if (
      name.includes('cloak') ||
      name.includes('cape') ||
      name.includes('mantle') ||
      name.includes('shawl')
    ) {
      return 'cloak';
    }
    if (name.includes('glove') || name.includes('gauntlet') || name.includes('bracer')) {
      return 'gloves';
    }
    if (name.includes('boot') || name.includes('greave') || name.includes('shoe')) {
      return 'boots';
    }
    return 'armor';
  }

  if (name.includes('ring')) return 'ring1';
  if (
    name.includes('amulet') ||
    name.includes('necklace') ||
    name.includes('pendant') ||
    name.includes('talisman') ||
    name.includes('pendulum') ||
    name.includes('periapt')
  ) {
    return 'amulet';
  }
  if (
    name.includes('robe') ||
    name.includes('clothes') ||
    name.includes('tunic') ||
    name.includes('garb')
  ) {
    return 'clothes';
  }
  if (
    name.includes('instrument') ||
    name.includes('lute') ||
    name.includes('flute') ||
    name.includes('focus') ||
    name.includes('symbol') ||
    name.includes('quiver')
  ) {
    return 'trinket';
  }

  return 'trinket';
}

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  Common: {
    border: 'border-zinc-700/80',
    bg: 'bg-zinc-900/80',
    text: 'text-zinc-300',
    glow: '',
  },
  Uncommon: {
    border: 'border-emerald-500/70',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.25)]',
  },
  Rare: {
    border: 'border-sky-500/70',
    bg: 'bg-sky-950/30',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_10px_rgba(14,165,233,0.25)]',
  },
  'Very Rare': {
    border: 'border-purple-500/70',
    bg: 'bg-purple-950/30',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
  },
  Legendary: {
    border: 'border-amber-400/80',
    bg: 'bg-amber-950/30',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_14px_rgba(245,158,11,0.35)]',
  },
};

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

  // Map equipped items by their effective slot
  const equippedBySlot = useMemo(() => {
    const map: Partial<Record<EquipmentSlotId, InventoryItem>> = {};
    for (const item of character.inventory) {
      if (item.equipped) {
        const slot = item.slot || detectItemSlot(item);
        if (!map[slot]) {
          map[slot] = item;
        } else if (slot === 'ring1' && !map['ring2']) {
          map['ring2'] = item;
        }
      }
    }
    return map;
  }, [character.inventory]);

  // Carrying capacity
  const totalWeight = useMemo(() => {
    return character.inventory.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
  }, [character.inventory]);

  const maxCapacity = (character.abilityScores?.STR?.total || 10) * 15;
  const encumbrancePercent = Math.min(100, Math.round((totalWeight / Math.max(1, maxCapacity)) * 100));

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

  const renderSlotSquare = (slotId: EquipmentSlotId, label: string, DefaultIcon: React.ElementType) => {
    const item = equippedBySlot[slotId];
    const rarity = item?.rarity || 'Common';
    const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common;

    return (
      <div
        onClick={() => {
          setSelectedSlot(slotId);
          if (item) setInspectedItem(item);
        }}
        className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
          item
            ? `${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.glow} hover:scale-105 hover:border-amber-400`
            : 'border-zinc-800/90 bg-[#0c0e14]/90 hover:border-zinc-600 hover:bg-zinc-800/50'
        } ${selectedSlot === slotId ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
        title={`${label}: ${item ? item.name : 'Empty'}`}
      >
        {item ? (
          <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full">
            <DefaultIcon size={20} className={rarityStyle.text} />
            <span className="text-[9px] font-bold text-zinc-200 truncate w-full px-1 text-center leading-tight mt-0.5">
              {item.name}
            </span>
          </div>
        ) : (
          <DefaultIcon size={18} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        )}

        <span className="absolute -bottom-4 text-[8px] font-mono text-zinc-500 uppercase tracking-tighter truncate max-w-[60px]">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#07080b] text-zinc-200 font-mono select-none">
      {/* 1. Character Header: BG3 Name & Health Ribbon */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider">
            {character.name || 'Hero'}
          </h2>
          <span className="text-xs text-zinc-500">
            Lv {character.level} {character.class || 'Adventurer'}
          </span>
        </div>

        {/* HP Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-400 font-bold">HP</span>
          <div className="w-28 sm:w-40 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((character.combat.currentHP / Math.max(1, character.combat.maxHP)) * 100)
                )}%`,
              }}
            />
          </div>
          <span className="text-zinc-300 font-bold text-[11px]">
            {character.combat.currentHP} / {character.combat.maxHP}
          </span>
        </div>
      </div>

      {/* 2. BG3 Paperdoll Centerpiece */}
      <div className="w-full max-w-4xl flex flex-col items-center bg-gradient-to-b from-[#0b0d13] via-[#090b10] to-[#07080b] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient class rune behind paperdoll */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Paperdoll & Flanking Slot Columns */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 w-full my-2">
          {/* Left Column: Head, Cloak, Armor, Gloves, Boots */}
          <div className="flex flex-col gap-5 sm:gap-6 items-center">
            {renderSlotSquare('head', 'Head', Crown)}
            {renderSlotSquare('cloak', 'Cloak', Shield)}
            {renderSlotSquare('armor', 'Armor', Shirt)}
            {renderSlotSquare('gloves', 'Gloves', Hand)}
            {renderSlotSquare('boots', 'Boots', Footprints)}
          </div>

          {/* Center Paperdoll Figure */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative w-44 h-64 sm:w-56 sm:h-80 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_25px_rgba(0,0,0,0.8)] bg-zinc-950 group">
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
          <div className="flex flex-col gap-5 sm:gap-6 items-center">
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

      {/* 4. Slot Selection & Swap Popover */}
      {selectedSlot && (
        <div className="w-full max-w-4xl mt-3 p-3.5 rounded-xl bg-[#0c0e15] border border-amber-500/40 shadow-xl animate-fade-in flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Equipment Slot: {selectedSlot.replace('_', ' ')}
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="p-1 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 py-1">
            {equippedBySlot[selectedSlot] ? (
              <div className="flex items-center justify-between w-full bg-zinc-900/90 p-2 rounded-lg border border-zinc-700">
                <div>
                  <span className="font-bold text-white text-xs">
                    {equippedBySlot[selectedSlot]?.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    {equippedBySlot[selectedSlot]?.description || 'No description'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (equippedBySlot[selectedSlot]) {
                      unequipInventoryItem(characterId, equippedBySlot[selectedSlot]!.id);
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Unequip
                </button>
              </div>
            ) : (
              <p className="text-zinc-500 text-xs">Slot is currently empty.</p>
            )}
          </div>

          {/* Quick Swap Options from Inventory */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">
              Available in Bag:
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {character.inventory
                .filter((item) => !item.equipped)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-1.5 rounded bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-200">{item.name}</span>
                      <span className="text-[10px] text-zinc-500 ml-2">({item.category})</span>
                    </div>
                    <button
                      onClick={() => equipInventoryItem(characterId, item.id, selectedSlot)}
                      className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] cursor-pointer"
                    >
                      Equip to {selectedSlot}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Baldur's Gate 3 Inventory Bag Grid */}
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
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
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
            const rarity = item.rarity || 'Common';
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
                title={item.name}
              >
                <Package size={20} className={style.text} />
                <span className="text-[9px] font-bold text-zinc-200 truncate w-full text-center mt-1">
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
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* 6. Item Details Tooltip / Card (When clicked) */}
        {inspectedItem && (
          <div className="p-3 bg-[#0d0f17] border border-amber-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-100 text-xs">{inspectedItem.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    (RARITY_COLORS[inspectedItem.rarity || 'Common'] || RARITY_COLORS.Common).border
                  } ${(RARITY_COLORS[inspectedItem.rarity || 'Common'] || RARITY_COLORS.Common).text}`}
                >
                  {inspectedItem.rarity || 'Common'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {inspectedItem.weight || 0} lbs &bull; Qty {inspectedItem.quantity}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {inspectedItem.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (inspectedItem.equipped) {
                    unequipInventoryItem(characterId, inspectedItem.id);
                  } else {
                    const targetSlot = detectItemSlot(inspectedItem);
                    equipInventoryItem(characterId, inspectedItem.id, targetSlot);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  inspectedItem.equipped
                    ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-xs'
                }`}
              >
                {inspectedItem.equipped ? 'Unequip' : 'Equip'}
              </button>

              <button
                onClick={() => setInspectedItem(null)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
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
            <span className="text-amber-300 font-bold">{character.currency?.gp || 0} GP</span>
            <span className="text-zinc-400">{character.currency?.sp || 0} SP</span>
            <span className="text-amber-600">{character.currency?.cp || 0} CP</span>
            {character.currency?.pp ? (
              <span className="text-purple-300 font-bold">{character.currency.pp} PP</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
