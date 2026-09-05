'use client';

import { useState } from 'react';
import {
  Package, Plus, Trash2, Edit2, Check, X, Search,
  Weight, Coins, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { useToast } from '../ui/ToastNotification';
import type { CharacterState, InventoryItem, Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InventoryManagerProps {
  character: CharacterState;
  onInventoryChange: (inventory: InventoryItem[]) => void;
  onCurrencyChange: (currency: Currency) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  weapon: 'var(--color-crimson-500)',
  armor: 'var(--color-gold-500)',
  gear: 'var(--color-parchment-muted)',
  consumable: 'var(--color-vitality)',
  treasure: 'var(--color-gold-bright)',
  tool: 'var(--color-arcane-400)',
};

const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  gear: 'Gear',
  consumable: 'Consumable',
  treasure: 'Treasure',
  tool: 'Tool',
};

export default function InventoryManager({
  character,
  onInventoryChange,
  onCurrencyChange,
}: InventoryManagerProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    weight: 0,
    description: '',
    equipped: false,
    category: 'gear',
  });

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

  // Filter items
  const filteredItems = character.inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    if (!newItem.name) return;
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newItem.name || 'New Item',
      quantity: newItem.quantity || 1,
      weight: newItem.weight || 0,
      description: newItem.description || '',
      equipped: newItem.equipped || false,
      category: (newItem.category as InventoryItem['category']) || 'gear',
    };
    onInventoryChange([...character.inventory, item]);
    showToast('Item Added', `Added "${item.name}" (x${item.quantity}) to inventory`, 'inventory');
    setNewItem({ name: '', quantity: 1, weight: 0, description: '', equipped: false, category: 'gear' });
    setShowAddForm(false);
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-gold btn-sm w-full sm:w-auto justify-center"
            id="add-item-btn"
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-parchment-dim)]" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!pl-9"
            id="inventory-search"
          />
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="glass-card-gold p-4 mb-3 space-y-3 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                id="new-item-name"
              />
              <select
                value={newItem.category || 'gear'}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryItem['category'] })}
                id="new-item-category"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-parchment-dim)] uppercase tracking-wider block mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  id="new-item-qty"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-parchment-dim)] uppercase tracking-wider block mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.weight || 0}
                  onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                  id="new-item-weight"
                />
              </div>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="!h-16 !text-sm"
              id="new-item-desc"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">
                <X size={12} /> Cancel
              </button>
              <button onClick={handleAddItem} className="btn btn-gold btn-sm">
                <Check size={12} /> Add
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-1.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg transition-all group',
                item.equipped
                  ? 'bg-[rgba(255,215,0,0.05)] border border-[rgba(255,215,0,0.1)]'
                  : 'bg-[rgba(255,255,255,0.02)] border border-transparent hover:bg-[rgba(255,255,255,0.03)]'
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Equipped checkbox */}
                <button
                  onClick={() => handleToggleEquipped(item.id)}
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all active:scale-95',
                    item.equipped
                      ? 'bg-[var(--color-gold-700)] border-[var(--color-gold-500)]'
                      : 'border-[rgba(255,255,255,0.15)] hover:border-[var(--color-gold-500)]'
                  )}
                  aria-label={`Toggle ${item.name} equipped`}
                >
                  {item.equipped && <Check size={12} className="text-white" />}
                </button>

                {/* Category dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                />

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="!text-sm !p-0 !bg-transparent !border-b !border-t-0 !border-l-0 !border-r-0 !rounded-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-[var(--color-parchment)] truncate block font-medium">
                      {item.name}
                    </span>
                  )}
                  {item.description && (
                    <span className="text-[10px] text-[var(--color-parchment-dim)] truncate block">
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

                {/* Actions: Always visible on touchscreens (opacity-100), hidden until hover on desktop (sm:opacity-0 sm:group-hover:opacity-100) */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="p-1.5 text-[var(--color-parchment-dim)] hover:text-[var(--color-gold-400)] rounded active:bg-white/10"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-[var(--color-parchment-dim)] hover:text-[var(--color-crimson-500)] rounded active:bg-white/10"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
