'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  Shield,
  Swords,
  Package,
  Weight,
  Layers,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Coins,
} from 'lucide-react';
import type { InventoryItem, ItemCategory, EquipmentSlotId } from '@/lib/types';
import { getItemRarity, RARITY_COLORS } from '@/components/characters/shared/BG3EquipmentPaperdoll';
import { getItemSellValue } from '@/lib/shop-types';

export interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialItem?: Partial<InventoryItem> | null;
  mode?: 'create' | 'edit';
  isNew?: boolean;
  characterName?: string;
}

export const ITEM_CATEGORIES: Array<{
  id: ItemCategory;
  label: string;
  icon: string;
  defaultSlot?: EquipmentSlotId;
  description: string;
}> = [
  { id: 'weapon', label: 'Weapon', icon: '⚔️', defaultSlot: 'melee_main', description: 'Swords, bows, daggers, staves' },
  { id: 'armor', label: 'Armor', icon: '🛡️', defaultSlot: 'armor', description: 'Light, medium, heavy armor, robes' },
  { id: 'shield', label: 'Shield', icon: '🛡️', defaultSlot: 'melee_off', description: 'Shields and off-hand defense' },
  { id: 'ring', label: 'Ring', icon: '💍', defaultSlot: 'ring1', description: 'Magical rings & signets' },
  { id: 'amulet', label: 'Amulet / Pendant', icon: '📿', defaultSlot: 'amulet', description: 'Necklaces, periapts, holy symbols' },
  { id: 'consumable', label: 'Consumable', icon: '🧪', description: 'Potions, elixirs, scrolls, poisons, rations' },
  { id: 'wondrous', label: 'Wondrous Item', icon: '✨', defaultSlot: 'cloak', description: 'Cloaks, boots, gloves, magical artifacts' },
  { id: 'gear', label: 'Adventuring Gear', icon: '🎒', description: 'Backpacks, bedrolls, rope, torches' },
  { id: 'tool', label: 'Tool / Kit', icon: '🔧', description: "Thieves' tools, disguise kits, instruments" },
  { id: 'treasure', label: 'Treasure / Gem', icon: '💎', description: 'Gems, art objects, ancient coins, relics' },
];

export const EQUIPMENT_SLOTS: Array<{ id: EquipmentSlotId | 'none'; label: string; icon: string }> = [
  { id: 'none', label: 'None (In Backpack / Pocket)', icon: '🎒' },
  { id: 'melee_main', label: 'Melee Main-Hand', icon: '⚔️' },
  { id: 'melee_off', label: 'Shield / Off-Hand', icon: '🛡️' },
  { id: 'armor', label: 'Body Armor', icon: '🦺' },
  { id: 'head', label: 'Headwear / Helm', icon: '👑' },
  { id: 'cloak', label: 'Cloak / Cape', icon: '🧣' },
  { id: 'gloves', label: 'Gloves / Gauntlets', icon: '🧤' },
  { id: 'boots', label: 'Boots / Greaves', icon: '👢' },
  { id: 'clothes', label: 'Camp Clothes / Robes', icon: '🥋' },
  { id: 'amulet', label: 'Amulet / Necklace', icon: '📿' },
  { id: 'ring1', label: 'Ring 1', icon: '💍' },
  { id: 'ring2', label: 'Ring 2', icon: '💍' },
  { id: 'trinket', label: 'Trinket / Arcane Focus', icon: '🔮' },
  { id: 'ranged_main', label: 'Ranged Weapon', icon: '🏹' },
  { id: 'ranged_off', label: 'Quiver / Ammo', icon: '🎯' },
];

export const RARITY_OPTIONS: Array<{
  value: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  label: string;
  badgeColor: string;
}> = [
  { value: 'Common', label: 'Common', badgeColor: 'text-zinc-300 border-zinc-700 bg-zinc-800/80' },
  { value: 'Uncommon', label: 'Uncommon', badgeColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/50' },
  { value: 'Rare', label: 'Rare', badgeColor: 'text-blue-400 border-blue-500/50 bg-blue-950/50' },
  { value: 'Very Rare', label: 'Very Rare', badgeColor: 'text-purple-400 border-purple-500/50 bg-purple-950/50' },
  { value: 'Legendary', label: 'Legendary', badgeColor: 'text-amber-400 border-amber-500/50 bg-amber-950/50' },
];

export const DAMAGE_TYPES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'Slashing', label: 'Slashing', icon: '🗡️' },
  { id: 'Piercing', label: 'Piercing', icon: '🏹' },
  { id: 'Bludgeoning', label: 'Bludgeoning', icon: '🔨' },
  { id: 'Fire', label: 'Fire', icon: '🔥' },
  { id: 'Cold', label: 'Cold', icon: '❄️' },
  { id: 'Lightning', label: 'Lightning', icon: '⚡' },
  { id: 'Thunder', label: 'Thunder', icon: '🌩️' },
  { id: 'Acid', label: 'Acid', icon: '🧪' },
  { id: 'Poison', label: 'Poison', icon: '☠️' },
  { id: 'Radiant', label: 'Radiant', icon: '✨' },
  { id: 'Necrotic', label: 'Necrotic', icon: '💀' },
  { id: 'Force', label: 'Force', icon: '💥' },
  { id: 'Psychic', label: 'Psychic', icon: '🧠' },
];

function ThemedSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: T;
  onChange: (val: T) => void;
  options: Array<{
    value: T;
    label: string;
    icon?: React.ReactNode;
    badgeColor?: string;
  }>;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ zIndex: isOpen ? 100 : undefined }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 bg-[#0d0f17] border rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? 'border-amber-400 ring-1 ring-amber-400/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            : 'border-zinc-700/80 hover:border-zinc-500 text-zinc-100 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selected?.icon && <span className="text-sm shrink-0">{selected.icon}</span>}
          <span className="truncate">{selected?.label || placeholder || 'Select...'}</span>
          {selected?.badgeColor && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ml-1 ${selected.badgeColor}`}>
              {selected.label}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-400 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-[#0a0c14] border border-amber-500/40 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] p-1.5 space-y-0.5 custom-scrollbar"
          style={{ zIndex: 110 }}
        >
          {options.map((opt) => {
            const isOptSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isOptSelected
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/90 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.badgeColor && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ml-1 ${opt.badgeColor}`}>
                      {opt.label}
                    </span>
                  )}
                </div>
                {isOptSelected && <Check size={14} className="text-amber-400 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ItemEditorModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  mode = 'edit',
  isNew,
  characterName,
}: ItemEditorModalProps) {
  const activeMode = isNew !== undefined ? (isNew ? 'create' : 'edit') : mode;
  const [form, setForm] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'gear',
    rarity: 'Common',
    cost: undefined,
    quantity: 1,
    weight: 0,
    equipped: false,
    description: '',
    acBonus: 0,
    baseAC: undefined,
    attackBonus: 0,
    damage: '',
    damageType: 'Slashing',
    range: '',
    slot: undefined,
    statModifiers: {},
  });

  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setForm({
        ...initialItem,
        category: initialItem.category || 'gear',
        rarity: initialItem.rarity || 'Common',
        cost: initialItem.cost !== undefined ? initialItem.cost : undefined,
        quantity: initialItem.quantity ?? 1,
        weight: initialItem.weight ?? 0,
        equipped: initialItem.equipped ?? false,
        acBonus: initialItem.acBonus ?? 0,
        baseAC: initialItem.baseAC,
        attackBonus: initialItem.attackBonus ?? 0,
        damage: initialItem.damage || '',
        damageType: initialItem.damageType || 'Slashing',
        range: initialItem.range || '',
        slot: initialItem.slot,
        statModifiers: initialItem.statModifiers || {},
      });
      // Automatically expand advanced stats if item has custom combat stats
      if (
        initialItem.acBonus ||
        initialItem.baseAC ||
        initialItem.attackBonus ||
        initialItem.damage ||
        (initialItem.statModifiers && Object.values(initialItem.statModifiers).some(Boolean))
      ) {
        setShowAdvancedStats(true);
      }
    } else {
      setForm({
        id: `item-${Date.now()}`,
        name: '',
        category: 'gear',
        rarity: 'Common',
        cost: undefined,
        quantity: 1,
        weight: 1,
        equipped: false,
        description: '',
        acBonus: 0,
        baseAC: undefined,
        attackBonus: 0,
        damage: '',
        damageType: 'Slashing',
        range: '',
        slot: undefined,
        statModifiers: {},
      });
      setShowAdvancedStats(false);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ItemCategory) => {
    const meta = ITEM_CATEGORIES.find((c) => c.id === newCat);
    setForm((prev) => {
      const next = { ...prev, category: newCat };
      // Auto-set slot if none was chosen or switching categories
      if (meta?.defaultSlot && (!prev.slot || prev.category !== newCat)) {
        next.slot = meta.defaultSlot;
      } else if (newCat === 'consumable' || newCat === 'gear' || newCat === 'tool' || newCat === 'treasure') {
        next.slot = undefined;
        next.equipped = false;
      }
      // If weapon, prepopulate damage fallback if empty
      if (newCat === 'weapon' && !next.damage) {
        next.damage = '1d8';
      }
      // If shield, default AC bonus is +2
      if (newCat === 'shield' && (next.acBonus === undefined || next.acBonus === 0)) {
        next.acBonus = 2;
      }
      return next;
    });
  };

  const handleStatModifierChange = (
    stat: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: string
  ) => {
    const num = parseInt(value, 10);
    setForm((prev) => ({
      ...prev,
      statModifiers: {
        ...prev.statModifiers,
        [stat]: isNaN(num) ? undefined : num,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    const finalItem: InventoryItem = {
      id: form.id || `item-${Date.now()}`,
      name: form.name.trim(),
      category: form.category || 'gear',
      rarity: (form.rarity as InventoryItem['rarity']) || 'Common',
      quantity: Math.max(1, form.quantity || 1),
      weight: Math.max(0, form.weight || 0),
      cost: form.cost !== undefined && form.cost !== null && !isNaN(Number(form.cost)) ? Math.max(0, Number(form.cost)) : undefined,
      equipped: !!form.equipped,
      description: form.description?.trim() || '',
      slot: form.slot && (form.slot as string) !== 'none' ? form.slot : undefined,
      acBonus: form.acBonus ? Number(form.acBonus) : undefined,
      baseAC: form.baseAC ? Number(form.baseAC) : undefined,
      attackBonus: form.attackBonus ? Number(form.attackBonus) : undefined,
      damage: form.damage?.trim() || undefined,
      damageType: form.damageType?.trim() || undefined,
      range: form.range?.trim() || undefined,
      statModifiers:
        form.statModifiers && Object.values(form.statModifiers).some((v) => v !== undefined && v !== 0)
          ? form.statModifiers
          : undefined,
    };

    onSave(finalItem);
    onClose();
  };

  const activeRarity = (form.rarity as 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary') || 'Common';
  const rarityStyle = RARITY_COLORS[activeRarity] || RARITY_COLORS.Common;

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in font-mono">
      <div className="bg-[#0f1118] border-2 border-amber-500/40 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-4 my-auto relative">
        {/* Ambient Top Glow */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: rarityStyle.accent }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-start sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-sm shrink-0 ${rarityStyle.border} ${rarityStyle.bg}`}
            >
              {ITEM_CATEGORIES.find((c) => c.id === form.category)?.icon || '📦'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider flex items-center gap-2 flex-wrap">
                <span>{mode === 'edit' ? 'Edit Equipment & Stats' : 'Forge New Inventory Item'}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${rarityStyle.badgeBg} ${rarityStyle.badgeText} shrink-0`}
                >
                  {activeRarity}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                {characterName ? `Equipped & carried by ${characterName}` : 'Configure item statistics, category, and combat bonuses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Name & Rarity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-amber-300/90 font-bold mb-1 uppercase tracking-wider text-[10px]">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Flame Tongue Greatsword, Shield +1, Ring of Protection"
                className="w-full px-3 py-2 bg-black/70 border border-zinc-700/80 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-amber-300/90 font-bold mb-1 uppercase tracking-wider text-[10px]">
                Rarity Tier
              </label>
              <ThemedSelect
                value={(form.rarity as any) || 'Common'}
                onChange={(val) => setForm({ ...form, rarity: val as any })}
                options={RARITY_OPTIONS}
              />
            </div>
          </div>

          {/* Row 2: Category Selector (Crucial user request!) */}
          <div>
            <label className="block text-amber-300/90 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Item Category * (Determines compatibility &amp; rules)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ITEM_CATEGORIES.map((cat) => {
                const isSelected = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                    title={cat.description}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Equipment Slot & Equipped Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/80">
            <div>
              <label className="block text-zinc-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                Equipment Slot (BG3 Paperdoll)
              </label>
              <ThemedSelect
                value={form.slot || 'none'}
                onChange={(val) =>
                  setForm({
                    ...form,
                    slot: val === 'none' ? undefined : (val as EquipmentSlotId),
                  })
                }
                options={EQUIPMENT_SLOTS.map((s) => ({
                  value: s.id,
                  label: s.label,
                  icon: s.icon,
                }))}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 sm:pt-2">
              <label className="text-xs text-zinc-300 font-medium flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!form.equipped}
                  onChange={(e) => setForm({ ...form, equipped: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-amber-200">Equipped on Character</span>
              </label>

              <span className="text-[10px] text-zinc-500 italic">
                {form.equipped ? 'Stats actively apply to hero' : 'Stored in backpack'}
              </span>
            </div>
          </div>

          {/* Section 4: COMBAT & STAT REFLECTION (The Core Request!) */}
          <div className="p-3.5 bg-gradient-to-br from-amber-950/20 via-zinc-950/80 to-zinc-950 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                <Shield size={14} className="text-amber-400" />
                <span>Combat &amp; Armor Statistics</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-normal">
                Reflects instantly on Character Sheet &amp; Armor Class
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* AC Bonus */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[10px]">
                  AC Bonus (+/-)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.acBonus ?? 0}
                    onChange={(e) => setForm({ ...form, acBonus: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-emerald-400 font-bold text-xs focus:border-amber-400"
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1.5 text-[9px] text-zinc-500">AC</span>
                </div>
                <span className="text-[9px] text-zinc-500 block mt-0.5">Shield (+2), Ring (+1)</span>
              </div>

              {/* Base Armor AC (if armor) */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[10px]">
                  Base Armor AC
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="25"
                    value={form.baseAC ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        baseAC: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-amber-300 font-bold text-xs focus:border-amber-400"
                    placeholder="Auto (11-18)"
                  />
                  <span className="absolute right-2 top-1.5 text-[9px] text-zinc-500">Base</span>
                </div>
                <span className="text-[9px] text-zinc-500 block mt-0.5">e.g. 14, 18</span>
              </div>

              {/* Attack Bonus */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[10px]">
                  Weapon Atk Bonus
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.attackBonus ?? 0}
                    onChange={(e) => setForm({ ...form, attackBonus: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-amber-200 font-bold text-xs focus:border-amber-400"
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1.5 text-[9px] text-zinc-500">Atk</span>
                </div>
                <span className="text-[9px] text-zinc-500 block mt-0.5">+1, +2 magic</span>
              </div>

              {/* Damage Dice */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[10px]">
                  Damage Formula
                </label>
                <input
                  type="text"
                  value={form.damage || ''}
                  onChange={(e) => setForm({ ...form, damage: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-amber-300 font-bold text-xs focus:border-amber-400"
                  placeholder="e.g. 1d8 + 3"
                />
                <span className="text-[9px] text-zinc-500 block mt-0.5">e.g. 2d6, 1d10</span>
              </div>
            </div>

            {/* Damage Type & Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-zinc-400 text-[10px] mb-1">Damage Type</label>
                <ThemedSelect
                  value={form.damageType || 'Slashing'}
                  onChange={(val) => setForm({ ...form, damageType: val })}
                  options={DAMAGE_TYPES.map((dt) => ({
                    value: dt.id,
                    label: dt.label,
                    icon: dt.icon,
                  }))}
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[10px] mb-1">Range / Reach</label>
                <input
                  type="text"
                  value={form.range || ''}
                  onChange={(e) => setForm({ ...form, range: e.target.value })}
                  className="w-full px-2.5 py-1 bg-black/70 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:border-amber-400"
                  placeholder="e.g. Melee (5 ft) or 150/600 ft"
                />
              </div>
            </div>
          </div>

          {/* Section 5: ADVANCED STAT MODIFIERS (Toggle Accordion) */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              className="w-full px-3.5 py-2 bg-zinc-950 hover:bg-zinc-900/80 flex items-center justify-between text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                <span>Attribute Bonuses (STR, DEX, CON, INT, WIS, CHA)</span>
              </span>
              {showAdvancedStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvancedStats && (
              <div className="p-3 bg-zinc-950/70 border-t border-zinc-800 space-y-2">
                <p className="text-[10px] text-zinc-500">
                  Grants attribute modifiers to the character while equipped (e.g. Gauntlets of Ogre Power, Amulet of Health).
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((stat) => (
                    <div key={stat} className="text-center">
                      <label className="block text-[9px] font-bold text-amber-300 mb-0.5">{stat}</label>
                      <input
                        type="number"
                        value={form.statModifiers?.[stat] ?? ''}
                        onChange={(e) => handleStatModifierChange(stat, e.target.value)}
                        placeholder="+0"
                        className="w-full py-1 text-center bg-black/80 border border-zinc-700 rounded text-xs text-white focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Quantity, Weight & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 text-[10px] mb-1 uppercase font-bold">
                Stack Quantity
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity || 1}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-white text-xs focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] mb-1 uppercase font-bold">
                Weight (lbs per item)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight || 0}
                onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 bg-black/70 border border-zinc-700 rounded-lg text-white text-xs focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-amber-300/90 text-[10px] mb-1 uppercase font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Coins size={11} className="text-amber-400" />
                  Base Value (GP)
                </span>
                <span className="text-[9px] font-mono text-emerald-400">
                  Sell: ~{getItemSellValue(form as any)} GP
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.cost ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  setForm({ ...form, cost: val });
                }}
                placeholder={`Est: ${getItemSellValue(form as any) * 2} GP`}
                className="w-full px-3 py-1.5 bg-black/70 border border-amber-500/40 rounded-lg text-amber-300 font-bold text-xs focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 7: Description & Magical Properties */}
          <div>
            <label className="block text-amber-300/90 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Item Description, Magical Effects &amp; Lore Notes
            </label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Requires attunement. While holding this blade, you can use a bonus action to speak its command word..."
              className="w-full p-2.5 bg-black/70 border border-zinc-700 rounded-lg text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono border border-zinc-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>{mode === 'edit' ? 'Save Item Changes' : 'Forge Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
