'use client';

import React, { useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Coins,
  Package,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  Tag,
  Check,
  X,
  MapPin,
  Sliders,
  Percent,
  Search,
} from 'lucide-react';
import type { CampaignShop, ShopItem, ShopItemCategory } from '@/lib/shop-types';

interface DMShopManagerProps {
  shops: CampaignShop[];
  onAddShop: (shop: Omit<CampaignShop, 'id'>) => void;
  onUpdateShop: (id: string, updates: Partial<CampaignShop>) => void;
  onDeleteShop: (id: string) => void;
  onAddItem: (shopId: string, item: Omit<ShopItem, 'id'>) => void;
  onUpdateItem: (shopId: string, itemId: string, updates: Partial<ShopItem>) => void;
  onDeleteItem: (shopId: string, itemId: string) => void;
}

const RARITY_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  Common: { border: 'border-zinc-700', text: 'text-zinc-300', bg: 'bg-zinc-900' },
  Uncommon: { border: 'border-emerald-500/60', text: 'text-emerald-300', bg: 'bg-emerald-950/30' },
  Rare: { border: 'border-sky-500/60', text: 'text-sky-300', bg: 'bg-sky-950/30' },
  'Very Rare': { border: 'border-purple-500/60', text: 'text-purple-300', bg: 'bg-purple-950/30' },
  Legendary: { border: 'border-amber-400/70', text: 'text-amber-300', bg: 'bg-amber-950/30' },
};

export default function DMShopManager({
  shops,
  onAddShop,
  onUpdateShop,
  onDeleteShop,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: DMShopManagerProps) {
  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.id || '');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');

  // Shop Modal
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopkeeper, setShopkeeper] = useState('');
  const [shopkeeperTitle, setShopkeeperTitle] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopDiscount, setShopDiscount] = useState<number>(0);
  const [shopBannerColor, setShopBannerColor] = useState('#f59e0b');

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ShopItemCategory>('consumable');
  const [itemPrice, setItemPrice] = useState<number>(50);
  const [itemRarity, setItemRarity] = useState<ShopItem['rarity']>('Common');
  const [itemStock, setItemStock] = useState<number>(5);
  const [itemWeight, setItemWeight] = useState<number>(1);
  const [itemDesc, setItemDesc] = useState('');
  const [itemEffect, setItemEffect] = useState('');
  const [itemAttunement, setItemAttunement] = useState(false);

  const currentShop = shops.find((s) => s.id === selectedShopId) || shops[0];

  const openAddShopModal = () => {
    setEditingShopId(null);
    setShopName('');
    setShopkeeper('');
    setShopkeeperTitle('');
    setShopLocation('');
    setShopDescription('');
    setShopDiscount(0);
    setShopBannerColor('#f59e0b');
    setIsShopModalOpen(true);
  };

  const openEditShopModal = (shop: CampaignShop) => {
    setEditingShopId(shop.id);
    setShopName(shop.name);
    setShopkeeper(shop.shopkeeper);
    setShopkeeperTitle(shop.shopkeeperTitle);
    setShopLocation(shop.location);
    setShopDescription(shop.description);
    setShopDiscount(shop.discountPercent);
    setShopBannerColor(shop.bannerColor);
    setIsShopModalOpen(true);
  };

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    if (editingShopId) {
      onUpdateShop(editingShopId, {
        name: shopName.trim(),
        shopkeeper: shopkeeper.trim(),
        shopkeeperTitle: shopkeeperTitle.trim(),
        location: shopLocation.trim(),
        description: shopDescription.trim(),
        discountPercent: shopDiscount,
        bannerColor: shopBannerColor,
      });
    } else {
      onAddShop({
        name: shopName.trim(),
        shopkeeper: shopkeeper.trim(),
        shopkeeperTitle: shopkeeperTitle.trim(),
        location: shopLocation.trim(),
        description: shopDescription.trim(),
        discountPercent: shopDiscount,
        bannerColor: shopBannerColor,
        accentColor: shopBannerColor,
        icon: 'Store',
        isOpen: true,
        visibleToPlayers: true,
        items: [],
      });
    }

    setIsShopModalOpen(false);
  };

  const openAddItemModal = () => {
    setEditingItemId(null);
    setItemName('');
    setItemCategory('consumable');
    setItemPrice(50);
    setItemRarity('Common');
    setItemStock(5);
    setItemWeight(1);
    setItemDesc('');
    setItemEffect('');
    setItemAttunement(false);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: ShopItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemRarity(item.rarity);
    setItemStock(item.stock);
    setItemWeight(item.weight);
    setItemDesc(item.description);
    setItemEffect(item.effect || '');
    setItemAttunement(!!item.requiresAttunement);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !currentShop) return;

    const payload = {
      name: itemName.trim(),
      category: itemCategory,
      price: itemPrice,
      currencyType: 'gp' as const,
      rarity: itemRarity,
      stock: itemStock,
      weight: itemWeight,
      description: itemDesc.trim(),
      effect: itemEffect.trim() || undefined,
      requiresAttunement: itemAttunement,
      visibleToPlayers: true,
    };

    if (editingItemId) {
      onUpdateItem(currentShop.id, editingItemId, payload);
    } else {
      onAddItem(currentShop.id, payload);
    }

    setIsItemModalOpen(false);
  };

  const filteredItems = (currentShop?.items || []).filter((i) => {
    if (!itemSearchQuery.trim()) return true;
    const q = itemSearchQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* 1. Header Toolbar */}
      <div className="p-3 bg-[#0d0f17] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Store size={16} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] flex items-center gap-2">
              Merchant Emporium &amp; Shops
            </h2>
            <p className="text-[10px] text-zinc-400">
              Configure town shops, restock wares, set pricing &amp; manage player marketplace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddShopModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={13} />
            <span>Establish New Shop</span>
          </button>
        </div>
      </div>

      {/* 2. Shop Tabs */}
      <div className="p-2.5 bg-[#08090d] border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {shops.map((shop) => {
          const isSelected = (currentShop?.id || '') === shop.id;
          return (
            <button
              key={shop.id}
              onClick={() => setSelectedShopId(shop.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs border ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Store size={13} />
              <span>{shop.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                  isSelected ? 'bg-black/40 text-black border-black/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {shop.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Shop Content Area */}
      {currentShop ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Shop Header Card */}
          <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800/90 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                  {currentShop.name}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    currentShop.isOpen
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-red-950 text-red-300 border-red-800'
                  }`}
                >
                  {currentShop.isOpen ? 'Open for Trade' : 'Closed'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    currentShop.visibleToPlayers
                      ? 'bg-sky-950 text-sky-300 border-sky-800'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {currentShop.visibleToPlayers ? 'Visible to Players' : 'Hidden from Players'}
                </span>
                {currentShop.discountPercent !== 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      currentShop.discountPercent > 0
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {currentShop.discountPercent > 0
                      ? `${currentShop.discountPercent}% Discount Active`
                      : `${Math.abs(currentShop.discountPercent)}% Markup`}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 font-medium">
                Proprietor: <span className="text-amber-300">{currentShop.shopkeeper}</span> ({currentShop.shopkeeperTitle})
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <MapPin size={12} className="text-amber-400" />
                <span>{currentShop.location}</span>
              </div>
              <p className="text-xs text-zinc-400 italic pt-1 max-w-2xl">
                &ldquo;{currentShop.description}&rdquo;
              </p>
            </div>

            {/* Shop DM Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() =>
                  onUpdateShop(currentShop.id, { isOpen: !currentShop.isOpen })
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold cursor-pointer"
              >
                {currentShop.isOpen ? 'Close Shop' : 'Open Shop'}
              </button>

              <button
                onClick={() =>
                  onUpdateShop(currentShop.id, {
                    visibleToPlayers: !currentShop.visibleToPlayers,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold cursor-pointer"
              >
                {currentShop.visibleToPlayers ? 'Hide from Players' : 'Show to Players'}
              </button>

              <button
                onClick={() => openEditShopModal(currentShop)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 text-xs font-bold cursor-pointer"
              >
                <Edit2 size={12} className="inline mr-1" /> Edit
              </button>

              <button
                onClick={openAddItemModal}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-xs"
              >
                <Plus size={13} className="inline mr-1" /> Add Item
              </button>
            </div>
          </div>

          {/* Item Catalog List */}
          <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800/90 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 gap-3">
              <span className="text-xs uppercase font-bold text-zinc-200 tracking-wider">
                Inventory Catalog ({filteredItems.length} items)
              </span>

              <div className="relative w-48">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  placeholder="Filter wares..."
                  className="w-full pl-7 pr-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const rStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common;
                const effectivePrice = Math.max(
                  1,
                  Math.round(item.price * (1 - currentShop.discountPercent / 100))
                );

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between bg-[#0a0c12] ${rStyle.border} gap-2`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-zinc-100 text-xs truncate">
                          {item.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${rStyle.border} ${rStyle.text} ${rStyle.bg}`}
                        >
                          {item.rarity}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-1.5">
                        {item.description}
                      </p>

                      {item.effect && (
                        <p className="text-[10px] text-emerald-400 font-medium">
                          ⚡ {item.effect}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Coins size={12} /> {effectivePrice} GP
                          {currentShop.discountPercent !== 0 && (
                            <span className="text-[10px] text-zinc-500 line-through">
                              {item.price} GP
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Stock: {item.stock < 0 ? '∞' : item.stock}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(currentShop.id, item.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                          title="Delete Item"
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
      ) : (
        <div className="py-20 text-center text-zinc-500">No shops configured yet.</div>
      )}

      {/* 4. Shop Create / Edit Modal */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-amber-300 text-xs uppercase">
                {editingShopId ? 'Edit Shop Properties' : 'Establish New Town Shop'}
              </span>
              <button onClick={() => setIsShopModalOpen(false)} className="p-1 text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="E.g., The Crimson Alembic"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Proprietor Name</label>
                  <input
                    type="text"
                    value={shopkeeper}
                    onChange={(e) => setShopkeeper(e.target.value)}
                    placeholder="E.g., Madam Evelyn"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Shopkeeper Title</label>
                  <input
                    type="text"
                    value={shopkeeperTitle}
                    onChange={(e) => setShopkeeperTitle(e.target.value)}
                    placeholder="E.g., Master Alchemist"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={shopLocation}
                  onChange={(e) => setShopLocation(e.target.value)}
                  placeholder="E.g., Cobblestone Row, High Quarter"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Atmosphere Description</label>
                <textarea
                  rows={2}
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Describe smells, decor, and shop personality..."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Discount (%) (e.g. 10 or -15 markup)</label>
                  <input
                    type="number"
                    value={shopDiscount}
                    onChange={(e) => setShopDiscount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Banner Accent Color</label>
                  <input
                    type="text"
                    value={shopBannerColor}
                    onChange={(e) => setShopBannerColor(e.target.value)}
                    placeholder="#10b981"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsShopModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-xs"
                >
                  Save Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Item Create / Edit Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-amber-300 text-xs uppercase">
                {editingItemId ? 'Edit Ware Details' : 'Stock New Item'}
              </span>
              <button onClick={() => setIsItemModalOpen(false)} className="p-1 text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="E.g., Potion of Greater Healing"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white capitalize cursor-pointer"
                  >
                    <option value="potion">Potion</option>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="wondrous">Wondrous Item</option>
                    <option value="consumable">Consumable</option>
                    <option value="gear">Adventuring Gear</option>
                    <option value="scroll">Spell Scroll</option>
                    <option value="tool">Tool</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Rarity</label>
                  <select
                    value={itemRarity}
                    onChange={(e) => setItemRarity(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white capitalize cursor-pointer"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Very Rare">Very Rare</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Price (GP)</label>
                  <input
                    type="number"
                    min={1}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Stock (-1 for ∞)</label>
                  <input
                    type="number"
                    value={itemStock}
                    onChange={(e) => setItemStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={itemWeight}
                    onChange={(e) => setItemWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Appearance, origins, lore..."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Mechanical Effect / Rules</label>
                <input
                  type="text"
                  value={itemEffect}
                  onChange={(e) => setItemEffect(e.target.value)}
                  placeholder="E.g., Heals 4d4+4 HP, +1 to AC, etc."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-xs"
                >
                  Stock Ware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
