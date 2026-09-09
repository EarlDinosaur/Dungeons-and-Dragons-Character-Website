'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  Coins,
  Shield,
  Swords,
  Sparkles,
  Package,
  Check,
  AlertCircle,
  MapPin,
  Tag,
  Search,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';
import type { CampaignShop, ShopItem } from '@/lib/shop-types';

interface PlayerMarketplaceViewProps {
  characterId: string;
}

const RARITY_THEMES: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  Common: {
    border: 'border-zinc-700/80',
    text: 'text-zinc-300',
    bg: 'bg-zinc-900/60',
    glow: '',
  },
  Uncommon: {
    border: 'border-emerald-500/70',
    text: 'text-emerald-300',
    bg: 'bg-emerald-950/20',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]',
  },
  Rare: {
    border: 'border-sky-500/70',
    text: 'text-sky-300',
    bg: 'bg-sky-950/20',
    glow: 'shadow-[0_0_10px_rgba(14,165,233,0.2)]',
  },
  'Very Rare': {
    border: 'border-purple-500/70',
    text: 'text-purple-300',
    bg: 'bg-purple-950/20',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  },
  Legendary: {
    border: 'border-amber-400/80',
    text: 'text-amber-300',
    bg: 'bg-amber-950/25',
    glow: 'shadow-[0_0_14px_rgba(245,158,11,0.3)]',
  },
};

export default function PlayerMarketplaceView({ characterId }: PlayerMarketplaceViewProps) {
  const {
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customCharacters,
    campaignShops,
    purchaseShopItem,
  } = useCharacter();

  // Get active character's purse
  const currentCurrency = useMemo(() => {
    if (characterId === 'vesper') return character.currency;
    if (characterId === 'aria') return aria.currency;
    if (characterId === 'cyrus') return cyrus.currency;
    if (characterId === 'wynel') return wynel.currency;
    if (characterId === 'kastoriel') return kastoriel.currency;
    return customCharacters[characterId]?.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  }, [characterId, character, aria, cyrus, wynel, kastoriel, customCharacters]);

  const totalGPValue = useMemo(() => {
    return (
      (currentCurrency.pp || 0) * 10 +
      (currentCurrency.gp || 0) +
      (currentCurrency.ep || 0) * 0.5 +
      (currentCurrency.sp || 0) * 0.1 +
      (currentCurrency.cp || 0) * 0.01
    );
  }, [currentCurrency]);

  // Open & visible shops
  const visibleShops = useMemo(() => {
    return campaignShops.filter((s) => s.isOpen && s.visibleToPlayers);
  }, [campaignShops]);

  const [selectedShopId, setSelectedShopId] = useState<string>(visibleShops[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);

  const currentShop = visibleShops.find((s) => s.id === selectedShopId) || visibleShops[0];

  const filteredItems = useMemo(() => {
    if (!currentShop) return [];
    return currentShop.items.filter((item) => {
      if (!item.visibleToPlayers) return false;
      if (activeCategory !== 'all') {
        if (activeCategory === 'potion' && item.category !== 'potion') return false;
        if (activeCategory === 'weapon' && item.category !== 'weapon') return false;
        if (activeCategory === 'armor' && item.category !== 'armor') return false;
        if (activeCategory === 'wondrous' && item.category !== 'wondrous' && item.category !== 'scroll') return false;
        if (activeCategory === 'gear' && item.category !== 'gear' && item.category !== 'tool' && item.category !== 'consumable') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentShop, activeCategory, searchQuery]);

  const handleBuy = (item: ShopItem) => {
    if (!currentShop) return;
    setPurchasingItemId(item.id);
    purchaseShopItem(characterId, currentShop.id, item.id);
    setTimeout(() => setPurchasingItemId(null), 300);
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#07080b] text-zinc-200 font-mono select-none space-y-5">
      {/* 1. Character Purse Banner */}
      <div className="w-full max-w-5xl rounded-2xl bg-gradient-to-r from-[#141209] via-[#0d0f17] to-[#0a0c12] border border-amber-500/40 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Character Coin Purse
            </span>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-bold pt-0.5">
              <span className="text-amber-300 flex items-center gap-1">
                {currentCurrency.gp || 0} <span className="text-[10px] text-zinc-400 font-normal">GP</span>
              </span>
              <span className="text-zinc-300 flex items-center gap-1">
                {currentCurrency.sp || 0} <span className="text-[10px] text-zinc-500 font-normal">SP</span>
              </span>
              <span className="text-amber-600 flex items-center gap-1">
                {currentCurrency.cp || 0} <span className="text-[10px] text-zinc-500 font-normal">CP</span>
              </span>
              {currentCurrency.pp ? (
                <span className="text-purple-300 flex items-center gap-1">
                  {currentCurrency.pp} <span className="text-[10px] text-zinc-400 font-normal">PP</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-400 uppercase block">Total Buying Power</span>
          <span className="text-sm sm:text-base font-extrabold text-white">
            ~{totalGPValue.toFixed(1)} GP
          </span>
        </div>
      </div>

      {/* 2. Town Shops Navigation */}
      <div className="w-full max-w-5xl flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {visibleShops.map((shop) => {
          const isSelected = (currentShop?.id || '') === shop.id;
          return (
            <button
              key={shop.id}
              onClick={() => setSelectedShopId(shop.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-102'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Store size={14} />
              <span>{shop.name}</span>
              {shop.discountPercent > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  -{shop.discountPercent}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Selected Shop Showcase */}
      {currentShop ? (
        <div className="w-full max-w-5xl space-y-4">
          {/* Shopkeeper Banner */}
          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800/80 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                  {currentShop.name}
                </h3>
                {currentShop.discountPercent > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Town Discount: {currentShop.discountPercent}% Off All Wares
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300">
                Proprietor: <span className="text-amber-400 font-bold">{currentShop.shopkeeper}</span> ({currentShop.shopkeeperTitle})
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <MapPin size={12} className="text-amber-400" />
                <span>{currentShop.location}</span>
              </div>
              <p className="text-xs text-zinc-400 italic pt-1 max-w-2xl">
                &ldquo;{currentShop.description}&rdquo;
              </p>
            </div>
          </div>

          {/* Category Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'potion', label: '🧪 Potions & Elixirs' },
                { id: 'weapon', label: '⚔️ Weapons' },
                { id: 'armor', label: '🛡️ Armor & Shields' },
                { id: 'wondrous', label: '✨ Arcane Curios' },
                { id: 'gear', label: '🎒 Gear & Survival' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wares..."
                className="w-full pl-8 pr-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Item Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => {
              const rStyle = RARITY_THEMES[item.rarity] || RARITY_THEMES.Common;
              const effectivePrice = Math.max(
                1,
                Math.round(item.price * (1 - currentShop.discountPercent / 100))
              );
              const canAfford = totalGPValue >= effectivePrice;
              const isOutOfStock = item.stock === 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                    rStyle.border
                  } ${rStyle.bg} ${rStyle.glow} bg-[#0c0e15] gap-3`}
                >
                  <div>
                    {/* Item Name & Rarity */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-zinc-100 text-xs truncate">
                        {item.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${rStyle.border} ${rStyle.text} bg-black/40`}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-3 mb-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.effect && (
                      <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-[10px] text-emerald-400 font-medium mb-2">
                        ⚡ {item.effect}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>{item.weight || 0} lbs</span>
                      {item.requiresAttunement && (
                        <>
                          <span>&bull;</span>
                          <span className="text-purple-400">Requires Attunement</span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className={item.stock === 0 ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                        {item.stock < 0 ? 'Unlimited Stock' : `${item.stock} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Button Row */}
                  <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase">Price:</span>
                      <div className="flex items-center gap-1.5 font-extrabold text-sm text-amber-400">
                        <Coins size={14} />
                        <span>{effectivePrice} GP</span>
                        {currentShop.discountPercent > 0 && (
                          <span className="text-[10px] text-zinc-500 line-through font-normal">
                            {item.price} GP
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford || isOutOfStock}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer hover:scale-103 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      }`}
                    >
                      <ShoppingBag size={13} />
                      <span>
                        {isOutOfStock ? 'Sold Out' : !canAfford ? 'Can’t Afford' : 'Purchase'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-500">
          No merchant shops are currently open in town.
        </div>
      )}
    </div>
  );
}
