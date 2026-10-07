'use client';

import { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Weight,
  Coins,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ListOrdered,
  ArrowUpDown,
} from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { useToast } from '../ui/ToastNotification';
import type { CharacterState, InventoryItem, Currency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCharacter } from '@/app/providers';
import BG3EquipmentPaperdoll, {
  getItemRarity,
  RARITY_COLORS,
} from '@/components/characters/shared/BG3EquipmentPaperdoll';
import ItemEditorModal from './ItemEditorModal';
import { getItemBaseValue, getItemSellValue } from '@/lib/shop-types';

interface InventoryManagerProps {
  character: CharacterState;
  onInventoryChange: (inventory: InventoryItem[]) => void;
  onCurrencyChange: (currency: Currency) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  weapon: 'var(--color-crimson-500)',
  armor: 'var(--color-gold-500)',
  shield: 'var(--color-gold-bright)',
  ring: 'var(--color-arcane-400)',
  amulet: 'var(--color-gold-500)',
  gear: 'var(--color-parchment-muted)',
  consumable: 'var(--color-vitality)',
  treasure: 'var(--color-gold-bright)',
  tool: 'var(--color-arcane-400)',
  wondrous: 'var(--color-purple-400, #c084fc)',
};

const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  shield: 'Shield',
  ring: 'Ring',
  amulet: 'Amulet',
  gear: 'Gear',
  consumable: 'Consumable',
  treasure: 'Treasure',
  tool: 'Tool',
  wondrous: 'Wondrous',
};

export default function InventoryManager({
  character,
  onInventoryChange,
  onCurrencyChange,
}: InventoryManagerProps) {
  const { showToast } = useToast();
  const { activeCharacterId, sellInventoryItem } = useCharacter();
  const [viewMode, setViewMode] = useState<'bg3' | 'classic'>('bg3');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'rarity' | 'name' | 'value' | 'weight' | 'equipped'>('default');
  
  // Full Item Editor Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  // Calculate encumbrance
  const totalWeight = character.inventory.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );
  const maxCapacity = character.abilityScores.STR.total * 15; // 8 * 15 = 120
  const encumbrancePercent = (totalWeight / maxCapacity) * 100;
  const isEncumbered = totalWeight > maxCapacity;

  const encumbranceColor =
    encumbrancePercent > 100 ? 'var(--color-crimson-500)' :
      encumbrancePercent > 80 ? 'var(--color-crimson-700)' :
        encumbrancePercent > 50 ? 'var(--color-gold-500)' :
          'var(--color-vitality)';

  const RARITY_WEIGHT: Record<string, number> = {
    Legendary: 5,
    'Very Rare': 4,
    Rare: 3,
    Uncommon: 2,
    Common: 1,
  };

  // Filter & sort items
  const filteredItems = useMemo(() => {
    const list = character.inventory.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortMode === 'rarity') {
      return [...list].sort((a, b) => {
        const ra = RARITY_WEIGHT[getItemRarity(a)] || 0;
        const rb = RARITY_WEIGHT[getItemRarity(b)] || 0;
        if (rb !== ra) return rb - ra;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortMode === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortMode === 'value') {
      return [...list].sort((a, b) => getItemSellValue(b) - getItemSellValue(a));
    }
    if (sortMode === 'weight') {
      return [...list].sort((a, b) => ((b.weight || 0) * (b.quantity || 1)) - ((a.weight || 0) * (a.quantity || 1)));
    }
    if (sortMode === 'equipped') {
      return [...list].sort((a, b) => (b.equipped ? 1 : 0) - (a.equipped ? 1 : 0));
    }

    return list;
  }, [character.inventory, searchQuery, sortMode]);

  const handleOpenCreateModal = () => {
    setItemToEdit({
      id: `item-${Date.now()}`,
      name: '',
      category: 'gear',
      quantity: 1,
      weight: 0,
      equipped: false,
      description: '',
    });
    setIsNewItem(true);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsNewItem(false);
    setIsEditorModalOpen(true);
  };

  const handleSaveItemFromModal = (savedItem: InventoryItem) => {
    if (isNewItem) {
      onInventoryChange([...character.inventory, savedItem]);
      showToast('Item Forged', `Added "${savedItem.name}" to inventory`, 'inventory');
    } else {
      onInventoryChange(
        character.inventory.map((i) => (i.id === savedItem.id ? savedItem : i))
      );
      showToast('Item Updated', `Updated "${savedItem.name}" stats and details`, 'inventory');
    }
  };

  const handleDeleteItem = (id: string) => {
    onInventoryChange(character.inventory.filter((item) => item.id !== id));
  };

  const handleToggleEquipped = (id: string) => {
    onInventoryChange(
      character.inventory.map((item) =>
        item.id === id ? { ...item, equipped: !item.equipped } : item
      )
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<InventoryItem>) => {
    onInventoryChange(
      character.inventory.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Inventory Mode:
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setViewMode('bg3')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${viewMode === 'bg3'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              <ShieldCheck size={14} />
              <span>BG3 Equipment Paperdoll</span>
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${viewMode === 'classic'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              <ListOrdered size={14} />
              <span>Item Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'bg3' ? (
        <BG3EquipmentPaperdoll
          character={character}
          characterId={activeCharacterId}
          onInventoryChange={onInventoryChange}
          onCurrencyChange={onCurrencyChange}
        />
      ) : (
        <div className="space-y-6">
          {/* Encumbrance Banner */}
          {isEncumbered && (
            <div className="encumbered-banner flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              ENCUMBERED — Speed reduced by 10 ft
            </div>
          )}

          {/* Encumbrance Bar */}
          <SpotlightCard className="p-4" spotlightColor="rgba(255, 215, 0, 0.04)">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight size={14} className="text-[var(--color-parchment-dim)]" />
                <span className="text-sm font-[family-name:var(--font-heading)] text-[var(--color-parchment-muted)]">
                  Carrying Capacity
                </span>
              </div>
              <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: encumbranceColor }}>
                {totalWeight.toFixed(1)} / {maxCapacity} lbs
              </span>
            </div>
            <div className="progress-bar h-4 rounded-full">
              <div
                className="progress-bar-fill rounded-full"
                style={{
                  width: `${Math.min(100, encumbrancePercent)}%`,
                  backgroundColor: encumbranceColor,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
              <span>0</span>
              <span>{maxCapacity / 2}</span>
              <span>{maxCapacity}</span>
            </div>
          </SpotlightCard>

          {/* Currency */}
          <div>
            <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
              <Coins size={18} />
              Currency
              <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((coin) => {
                const coinColors: Record<string, string> = {
                  cp: '#b87333',
                  sp: '#c0c0c0',
                  ep: '#8faadc',
                  gp: '#ffd700',
                  pp: '#e5e4e2',
                };
                return (
                  <div key={coin} className="glass-card p-2 text-center">
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold uppercase"
                      style={{
                        background: `linear-gradient(135deg, ${coinColors[coin]}40, ${coinColors[coin]}15)`,
                        border: `1px solid ${coinColors[coin]}50`,
                        color: coinColors[coin],
                      }}
                    >
                      {coin}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={character.currency[coin]}
                      onChange={(e) => onCurrencyChange({
                        ...character.currency,
                        [coin]: Math.max(0, parseInt(e.target.value) || 0),
                      })}
                      className="!text-center !text-sm !p-1.5 !w-full font-[family-name:var(--font-mono)] rounded"
                      id={`currency-${coin}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory List */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2">
                <Package size={18} />
                Inventory
                <span className="text-sm font-normal text-[var(--color-parchment-dim)]">
                  ({character.inventory.length} items)
                </span>
              </h2>
              <button
                onClick={handleOpenCreateModal}
                className="btn btn-gold btn-sm w-full sm:w-auto justify-center"
                id="add-item-btn"
              >
                <Plus size={14} />
                Forge / Add Item
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-parchment-dim)]" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="!pl-9 w-full"
                  id="inventory-search"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 shrink-0">
                <ArrowUpDown size={12} className="text-amber-400 shrink-0" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                  className="bg-transparent text-xs text-zinc-200 font-mono focus:outline-none cursor-pointer pr-1"
                  title="Sort ledger items"
                >
                  <option value="default" className="bg-zinc-900 text-zinc-300">Sort: Default</option>
                  <option value="rarity" className="bg-zinc-900 text-amber-300">Sort: Rarity</option>
                  <option value="value" className="bg-zinc-900 text-emerald-400">Sort: Value (GP)</option>
                  <option value="name" className="bg-zinc-900 text-zinc-300">Sort: Name (A-Z)</option>
                  <option value="weight" className="bg-zinc-900 text-zinc-300">Sort: Weight</option>
                  <option value="equipped" className="bg-zinc-900 text-sky-300">Sort: Equipped</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const rarity = getItemRarity(item);
                const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg transition-all group border',
                      item.equipped
                        ? `${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.glow}`
                        : 'bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.03)]'
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Equipped checkbox */}
                      <button
                        onClick={() => handleToggleEquipped(item.id)}
                        className={cn(
                          'w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all active:scale-95',
                          item.equipped
                            ? rarityStyle.border
                            : 'border-[rgba(255,255,255,0.15)] hover:border-[var(--color-gold-500)]'
                        )}
                        style={{
                          backgroundColor: item.equipped ? rarityStyle.accent : undefined,
                        }}
                        aria-label={`Toggle ${item.name} equipped`}
                      >
                        {item.equipped && <Check size={12} className="text-black font-bold" />}
                      </button>

                      {/* Category dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || 'var(--color-parchment-muted)' }}
                      />

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'text-sm truncate block font-medium cursor-pointer hover:underline',
                              item.equipped ? rarityStyle.text : 'text-[var(--color-parchment)]'
                            )}
                            onClick={() => handleOpenEditModal(item)}
                            title="Click to edit item stats"
                          >
                            {item.name}
                          </span>
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.2 rounded border',
                              rarityStyle.badgeBg,
                              rarityStyle.badgeText
                            )}
                          >
                            {rarity}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-400 font-mono">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>

                          {/* Dynamic Combat & Armor Stat Badges */}
                          {item.acBonus !== undefined && item.acBonus !== 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              +{item.acBonus} AC
                            </span>
                          )}
                          {item.baseAC !== undefined && item.baseAC > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              {item.baseAC} Base AC
                            </span>
                          )}
                          {item.attackBonus !== undefined && item.attackBonus !== 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                              +{item.attackBonus} Atk
                            </span>
                          )}
                          {item.damage && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {item.damage} {item.damageType || ''}
                            </span>
                          )}
                          {item.statModifiers &&
                            Object.entries(item.statModifiers).map(([attr, val]) =>
                              val ? (
                                <span
                                  key={attr}
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                >
                                  +{val} {attr}
                                </span>
                              ) : null
                            )}
                          {/* Sell Value Badge */}
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                            <Coins size={10} className="text-emerald-400" />
                            Sell: {getItemSellValue(item)} GP
                          </span>
                        </div>
                        {item.description && (
                          <span className="text-[10px] text-[var(--color-parchment-dim)] truncate block mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Weight & Actions bar for mobile/desktop */}
                    <div className="flex items-center gap-3 shrink-0 text-xs font-[family-name:var(--font-mono)] ml-auto sm:ml-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded border border-white/5">
                        <button
                          onClick={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded active:bg-white/10"
                          aria-label="Decrease quantity"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <span className="text-[var(--color-parchment-muted)] min-w-[20px] text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                          className="text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded active:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          <ChevronUp size={12} />
                        </button>
                      </div>

                      <span className="text-[var(--color-parchment-dim)] min-w-[42px] text-right">
                        {(item.weight * item.quantity).toFixed(1)} lb
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const sellVal = getItemSellValue(item);
                            if (confirm(`Sell 1x "${item.name}" for ${sellVal} GP?`)) {
                              sellInventoryItem(character.id || activeCharacterId, item.id, 1);
                            }
                          }}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded active:bg-white/10 cursor-pointer"
                          title={`Sell 1x ${item.name} for ${getItemSellValue(item)} GP`}
                          aria-label={`Sell ${item.name}`}
                        >
                          <Coins size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-[var(--color-parchment-dim)] hover:text-[var(--color-gold-400)] rounded active:bg-white/10 cursor-pointer"
                          title={`Edit ${item.name} stats, category & details`}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-[var(--color-parchment-dim)] hover:text-[var(--color-crimson-500)] rounded active:bg-white/10 cursor-pointer"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Item Editor Modal (for both editing and forging items) */}
      {isEditorModalOpen && (
        <ItemEditorModal
          isOpen={isEditorModalOpen}
          initialItem={itemToEdit}
          isNew={isNewItem}
          onSave={handleSaveItemFromModal}
          onClose={() => setIsEditorModalOpen(false)}
        />
      )}
    </div>
  );
}

