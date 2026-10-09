'use client';

import React, { useState, useMemo } from 'react';
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
  Folder,
  FolderPlus,
  Layers,
  Settings,
  Filter,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import {
  type CampaignShop,
  type ShopItem,
  type ShopItemCategory,
  STANDARD_SHOP_CATEGORIES,
  getShopCatalogues,
  getItemCatalogue,
  getCategoryDefinition,
  getCategoryEmoji,
} from '@/lib/shop-types';

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

const SUGGESTED_CATALOGUES = [
  'Potions & Elixirs',
  'Blades & Weapons',
  'Suits of Armor',
  'Shields & Fortifications',
  'Spell Scrolls',
  'Wondrous Talismans',
  'Enchanted Rings',
  'Amulets & Relics',
  'Poisons & Toxins',
  'Tools of the Trade',
  'Exploration Gear',
  'Books & Grimoires',
  'Mounts & Stables',
  'Underworld Contraband',
  'Services & Contracts',
  'Gems & Valuables',
];

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
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>('all');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);

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

  // Catalogue Management Modals
  const [isAddCatalogueModalOpen, setIsAddCatalogueModalOpen] = useState(false);
  const [newCatalogueInput, setNewCatalogueInput] = useState('');
  const [isManageCataloguesModalOpen, setIsManageCataloguesModalOpen] = useState(false);
  const [renamingCatalogue, setRenamingCatalogue] = useState<{ oldName: string; newName: string } | null>(null);

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ShopItemCategory>('consumable');
  const [itemCatalogueChoice, setItemCatalogueChoice] = useState<string>('__auto__');
  const [customCatalogueInput, setCustomCatalogueInput] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<number>(50);
  const [itemRarity, setItemRarity] = useState<ShopItem['rarity']>('Common');
  const [itemStock, setItemStock] = useState<number>(5);
  const [itemWeight, setItemWeight] = useState<number>(1);
  const [itemDesc, setItemDesc] = useState('');
  const [itemEffect, setItemEffect] = useState('');
  const [itemAttunement, setItemAttunement] = useState(false);

  const currentShop = shops.find((s) => s.id === selectedShopId) || shops[0];

  // Dynamically compute all catalogues for the current shop
  const currentCatalogues = useMemo(() => {
    if (!currentShop) return [];
    return getShopCatalogues(currentShop);
  }, [currentShop]);

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
        catalogues: ['General Wares'],
        items: [],
      });
    }

    setIsShopModalOpen(false);
  };

  // Catalogue Management Handlers
  const handleAddCatalogueSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatalogueInput.trim();
    if (!trimmed || !currentShop) return;

    const existing = currentShop.catalogues || [];
    if (!existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...existing, trimmed];
      onUpdateShop(currentShop.id, { catalogues: updated });
    }

    setSelectedCatalogue(trimmed);
    setNewCatalogueInput('');
    setIsAddCatalogueModalOpen(false);
  };

  const handleQuickAddSuggestedCatalogue = (presetName: string) => {
    if (!currentShop) return;
    const existing = currentShop.catalogues || [];
    if (!existing.some((c) => c.toLowerCase() === presetName.toLowerCase())) {
      const updated = [...existing, presetName];
      onUpdateShop(currentShop.id, { catalogues: updated });
    }
    setSelectedCatalogue(presetName);
    setIsAddCatalogueModalOpen(false);
  };

  const handleDeleteCatalogue = (catNameToDelete: string) => {
    if (!currentShop) return;
    const updatedCatalogues = (currentShop.catalogues || []).filter(
      (c) => c.toLowerCase() !== catNameToDelete.toLowerCase()
    );
    // Also reset items assigned explicitly to this catalogue
    const updatedItems = currentShop.items.map((it) => {
      if (it.catalogue && it.catalogue.toLowerCase() === catNameToDelete.toLowerCase()) {
        return { ...it, catalogue: undefined };
      }
      return it;
    });

    onUpdateShop(currentShop.id, {
      catalogues: updatedCatalogues,
      items: updatedItems,
    });

    if (selectedCatalogue.toLowerCase() === catNameToDelete.toLowerCase()) {
      setSelectedCatalogue('all');
    }
  };

  const handleRenameCatalogueSubmit = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || !currentShop) return;

    const updatedCatalogues = (currentShop.catalogues || []).map((c) =>
      c.toLowerCase() === oldName.toLowerCase() ? trimmedNew : c
    );
    if (!updatedCatalogues.some((c) => c.toLowerCase() === trimmedNew.toLowerCase())) {
      updatedCatalogues.push(trimmedNew);
    }

    const updatedItems = currentShop.items.map((it) => {
      if (it.catalogue && it.catalogue.toLowerCase() === oldName.toLowerCase()) {
        return { ...it, catalogue: trimmedNew };
      }
      return it;
    });

    onUpdateShop(currentShop.id, {
      catalogues: updatedCatalogues,
      items: updatedItems,
    });

    if (selectedCatalogue.toLowerCase() === oldName.toLowerCase()) {
      setSelectedCatalogue(trimmedNew);
    }
    setRenamingCatalogue(null);
  };

  // Item Modal Handlers
  const openAddItemModal = () => {
    setEditingItemId(null);
    setItemName('');
    setItemCategory('consumable');
    setItemCatalogueChoice(selectedCatalogue !== 'all' ? selectedCatalogue : '__auto__');
    setCustomCatalogueInput('');
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
    if (item.catalogue) {
      setItemCatalogueChoice(item.catalogue);
    } else {
      setItemCatalogueChoice('__auto__');
    }
    setCustomCatalogueInput('');
    setItemPrice(item.price);
    setItemRarity(item.rarity);
    setItemStock(item.stock);
    setItemWeight(item.weight || 1);
    setItemDesc(item.description);
    setItemEffect(item.effect || '');
    setItemAttunement(!!item.requiresAttunement);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !currentShop) return;

    let finalCatalogue: string | undefined = undefined;
    if (itemCatalogueChoice === '__custom__') {
      const trimmedCustom = customCatalogueInput.trim();
      if (trimmedCustom) {
        finalCatalogue = trimmedCustom;
        const existing = currentShop.catalogues || [];
        if (!existing.some((c) => c.toLowerCase() === trimmedCustom.toLowerCase())) {
          onUpdateShop(currentShop.id, {
            catalogues: [...existing, trimmedCustom],
          });
        }
      }
    } else if (itemCatalogueChoice !== '__auto__' && itemCatalogueChoice.trim()) {
      finalCatalogue = itemCatalogueChoice.trim();
    }

    const payload = {
      name: itemName.trim(),
      category: itemCategory,
      catalogue: finalCatalogue,
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

  // Filter items by catalogue and search query
  const filteredItems = useMemo(() => {
    if (!currentShop) return [];
    return (currentShop.items || []).filter((i) => {
      // 1. Catalogue filter
      if (selectedCatalogue !== 'all') {
        const itemCat = getItemCatalogue(i);
        if (itemCat.toLowerCase() !== selectedCatalogue.toLowerCase()) {
          return false;
        }
      }

      // 2. Search query filter
      if (itemSearchQuery.trim()) {
        const q = itemSearchQuery.toLowerCase();
        const itemCat = getItemCatalogue(i).toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          itemCat.includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.effect && i.effect.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [currentShop, selectedCatalogue, itemSearchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#07080b] text-zinc-200 font-mono text-xs overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-3 bg-[#0c0d14] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Store size={16} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)] flex items-center gap-2">
              Merchant Emporium &amp; Department Catalogues
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                {shops.length} shops
              </span>
            </h2>
            <p className="text-[10px] text-zinc-400">
              Split-pane merchant ledger with department sections, live markups &amp; player shop inventories
            </p>
          </div>
        </div>

        <button
          onClick={openAddShopModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
        >
          <Plus size={13} />
          <span>Establish New Shop</span>
        </button>
      </div>

      {/* 2. Master-Detail Split Pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT COLUMN: Shops & Department Sections Directory */}
        <div
          className={`w-full lg:w-88 xl:w-96 flex flex-col border-r border-zinc-800 bg-[#090a10] shrink-0 ${
            showMobileDetail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Shops List Header */}
          <div className="p-2.5 border-b border-zinc-800/80 bg-[#0c0d14]/70 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Settlement Markets
            </span>
            <span className="text-[10px] text-zinc-500">{shops.length} Active</span>
          </div>

          {/* Shops List */}
          <div className="p-2 space-y-1.5 max-h-52 overflow-y-auto border-b border-zinc-800/80">
            {shops.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">No shops created yet.</div>
            ) : (
              shops.map((shop) => {
                const isSelected = (currentShop?.id || '') === shop.id;
                return (
                  <button
                    key={shop.id}
                    onClick={() => {
                      setSelectedShopId(shop.id);
                      setSelectedCatalogue('all');
                      setShowMobileDetail(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                        : 'bg-[#0d0e16]/60 border-transparent hover:bg-zinc-900/60 hover:border-zinc-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Store
                          size={13}
                          className={isSelected ? 'text-amber-400' : 'text-zinc-500'}
                        />
                        <span
                          className={`font-bold truncate text-xs font-[family-name:var(--font-heading)] ${
                            isSelected ? 'text-amber-300' : 'text-zinc-200'
                          }`}
                        >
                          {shop.name}
                        </span>
                        {shop.visibleToPlayers ? (
                          <span title="Visible to players">
                            <Eye size={11} className="text-emerald-400 shrink-0" />
                          </span>
                        ) : (
                          <span title="Hidden from players">
                            <EyeOff size={11} className="text-zinc-600 shrink-0" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="truncate">{shop.shopkeeper}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="text-zinc-500 truncate">{shop.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                        {shop.items?.length || 0}
                      </span>
                      <ChevronRight
                        size={14}
                        className={isSelected ? 'text-amber-400' : 'text-zinc-600'}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Department Catalogues for Current Shop */}
          {currentShop && (
            <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70 mb-2">
                <div className="flex items-center gap-1.5">
                  <Folder size={12} className="text-amber-400" />
                  <span className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">
                    Catalogues
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setNewCatalogueInput('');
                      setIsAddCatalogueModalOpen(true);
                    }}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-[10px] cursor-pointer"
                    title="Add new catalogue section"
                  >
                    <FolderPlus size={12} />
                  </button>
                  <button
                    onClick={() => setIsManageCataloguesModalOpen(true)}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] cursor-pointer"
                    title="Manage / Rename catalogues"
                  >
                    <Settings size={12} />
                  </button>
                </div>
              </div>

              {/* Catalogues list */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                <button
                  onClick={() => setSelectedCatalogue('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                    selectedCatalogue === 'all'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-xs'
                      : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers size={12} />
                    <span>All Wares</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                      selectedCatalogue === 'all'
                        ? 'bg-black/30 text-black border-black/20'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {currentShop.items?.length || 0}
                  </span>
                </button>

                {currentCatalogues.map((catName) => {
                  const isSelected = selectedCatalogue.toLowerCase() === catName.toLowerCase();
                  const count = currentShop.items.filter(
                    (it) => getItemCatalogue(it).toLowerCase() === catName.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={catName}
                      onClick={() => setSelectedCatalogue(catName)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-xs'
                          : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Folder size={11} className={isSelected ? 'text-black' : 'text-amber-400/80'} />
                        <span className="truncate">{catName}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full border shrink-0 ${
                          isSelected
                            ? 'bg-black/30 text-black border-black/20'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Merchant Ledger & Wares Inventory */}
        <div
          className={`flex-1 flex flex-col bg-[#07080b] min-w-0 overflow-y-auto ${
            showMobileDetail ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {currentShop ? (
            <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-5xl mx-auto w-full">
              {/* Back to Directory Button (for mobile & portrait tablets) */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold cursor-pointer transition-colors active:scale-95 mb-2"
                >
                  <ArrowLeft size={13} />
                  <span>&larr; Back to Settlement Shops</span>
                </button>
              </div>

              {/* Shop Proprietor Header Banner */}
              <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg md:text-xl font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                        {currentShop.name}
                      </h3>
                      <button
                        onClick={() =>
                          onUpdateShop(currentShop.id, { isOpen: !currentShop.isOpen })
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          currentShop.isOpen
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                        }`}
                      >
                        {currentShop.isOpen ? '✓ Open for Trade' : '✕ Closed'}
                      </button>
                      <button
                        onClick={() =>
                          onUpdateShop(currentShop.id, {
                            visibleToPlayers: !currentShop.visibleToPlayers,
                          })
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          currentShop.visibleToPlayers
                            ? 'bg-sky-950 text-sky-300 border-sky-800 hover:bg-sky-900'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {currentShop.visibleToPlayers ? 'Visible to Party' : 'DM Eyes Only'}
                      </button>
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

                    <div className="flex items-center gap-2 text-xs text-zinc-300 flex-wrap">
                      <span>
                        Proprietor: <strong className="text-amber-300">{currentShop.shopkeeper}</strong>
                        {currentShop.shopkeeperTitle && ` (${currentShop.shopkeeperTitle})`}
                      </span>
                      {currentShop.location && (
                        <>
                          <span className="text-zinc-600">&bull;</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <MapPin size={11} className="text-amber-400" />
                            {currentShop.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditShopModal(currentShop)}
                      className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 cursor-pointer transition-colors"
                      title="Edit Shop Details"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete shop "${currentShop.name}" and all its inventory?`)) {
                          onDeleteShop(currentShop.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 cursor-pointer transition-colors"
                      title="Delete Shop"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={openAddItemModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
                    >
                      <Plus size={13} />
                      <span>Stock New Ware</span>
                    </button>
                  </div>
                </div>

                {currentShop.description && (
                  <p className="text-xs text-zinc-400 italic pt-1 border-t border-zinc-800/80 font-sans">
                    &ldquo;{currentShop.description}&rdquo;
                  </p>
                )}
              </div>

              {/* Items Inventory Ledger */}
              <div className="p-4 rounded-2xl bg-[#0c0d15] border border-zinc-800 shadow-xl space-y-3">
                {/* Search & Section Filter Bar */}
                <div className="flex flex-wrap items-center justify-between pb-2 border-b border-zinc-800 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-zinc-200 tracking-wider">
                      {selectedCatalogue === 'all' ? 'All Wares' : selectedCatalogue}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      ({filteredItems.length} {filteredItems.length === 1 ? 'ware' : 'wares'} listed)
                    </span>
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      placeholder="Search name, category, rules..."
                      className="w-full pl-7 pr-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 space-y-2">
                    <Package size={28} className="mx-auto opacity-30 text-amber-400" />
                    <p className="text-xs">No wares found matching current filters.</p>
                    <button
                      onClick={openAddItemModal}
                      className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                    >
                      + Stock Item into {selectedCatalogue === 'all' ? 'this Shop' : `"${selectedCatalogue}"`}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredItems.map((item) => {
                      const rStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common;
                      const itemCat = getItemCatalogue(item);
                      const catEmoji = getCategoryEmoji(item.category);
                      const effectivePrice = Math.max(
                        1,
                        Math.round(item.price * (1 - currentShop.discountPercent / 100))
                      );

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between bg-[#0a0c12] ${rStyle.border} gap-2 hover:border-amber-500/50 transition-colors`}
                        >
                          <div>
                            {/* Badges: Catalogue, Category, Rarity */}
                            <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                                  <Folder size={9} />
                                  <span>{itemCat}</span>
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium capitalize flex items-center gap-1">
                                  <span>{catEmoji}</span>
                                  <span>{item.category}</span>
                                </span>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${rStyle.border} ${rStyle.text} ${rStyle.bg}`}
                              >
                                {item.rarity}
                              </span>
                            </div>

                            <h4 className="font-bold text-zinc-100 text-xs line-clamp-1 mb-1">
                              {item.name}
                            </h4>

                            <p className="text-[11px] text-zinc-400 line-clamp-2 mb-1 leading-relaxed font-sans">
                              {item.description}
                            </p>

                            {item.effect && (
                              <p className="text-[10px] text-emerald-400 font-medium mb-1 line-clamp-2">
                                ⚡ {item.effect}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-0.5">
                              <span>{item.weight || 0} lbs</span>
                              {item.requiresAttunement && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-purple-400 font-bold">Attunement</span>
                                </>
                              )}
                            </div>
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
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 space-y-3">
              <Store size={36} className="mx-auto opacity-30 text-amber-400" />
              <p className="text-zinc-400">No merchant shops configured in this campaign yet.</p>
              <button
                onClick={openAddShopModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Establish First Town Shop
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Shop Create / Edit Modal */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-amber-300 text-xs uppercase">
                {editingShopId ? 'Edit Shop Properties' : 'Establish New Town Shop'}
              </span>
              <button onClick={() => setIsShopModalOpen(false)} className="p-1 text-zinc-500 hover:text-white cursor-pointer">
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
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-xs cursor-pointer"
                >
                  Save Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Catalogue Modal */}
      {isAddCatalogueModalOpen && currentShop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-md bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <FolderPlus size={15} className="text-amber-400" />
                <span className="font-bold text-amber-300 text-xs uppercase">
                  Add Catalogue Section to {currentShop.name}
                </span>
              </div>
              <button
                onClick={() => setIsAddCatalogueModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Create a custom catalogue section to organize diverse item types within this shop (e.g., Rare Concoctions, Heavy Armaments, Exotic Mounts).
            </p>

            <form onSubmit={handleAddCatalogueSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                  Catalogue Section Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatalogueInput}
                  onChange={(e) => setNewCatalogueInput(e.target.value)}
                  placeholder="E.g., Rare Concoctions, Ancient Relics..."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1.5">
                  Or Quick-Add Suggested Presets:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {SUGGESTED_CATALOGUES.map((preset) => {
                    const alreadyExists = currentCatalogues.some(
                      (c) => c.toLowerCase() === preset.toLowerCase()
                    );
                    return (
                      <button
                        key={preset}
                        type="button"
                        disabled={alreadyExists}
                        onClick={() => handleQuickAddSuggestedCatalogue(preset)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                          alreadyExists
                            ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                            : 'bg-zinc-900/90 text-zinc-300 hover:text-amber-300 hover:border-amber-500/50 border-zinc-800'
                        }`}
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogueModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-xs cursor-pointer"
                >
                  Establish Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Manage Catalogues Modal */}
      {isManageCataloguesModalOpen && currentShop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-md bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Settings size={15} className="text-amber-400" />
                <span className="font-bold text-amber-300 text-xs uppercase">
                  Manage Catalogues ({currentShop.name})
                </span>
              </div>
              <button
                onClick={() => {
                  setIsManageCataloguesModalOpen(false);
                  setRenamingCatalogue(null);
                }}
                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Rename or delete catalogue sections. Deleting a catalogue will retain its wares under the general catalog.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {currentCatalogues.map((catName) => {
                const count = currentShop.items.filter(
                  (it) => getItemCatalogue(it).toLowerCase() === catName.toLowerCase()
                ).length;
                const isRenaming = renamingCatalogue?.oldName === catName;

                if (isRenaming) {
                  return (
                    <div
                      key={catName}
                      className="p-2 rounded-lg bg-zinc-900 border border-amber-500/50 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={renamingCatalogue.newName}
                        onChange={(e) =>
                          setRenamingCatalogue({
                            ...renamingCatalogue,
                            newName: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white"
                      />
                      <button
                        onClick={() =>
                          handleRenameCatalogueSubmit(
                            renamingCatalogue.oldName,
                            renamingCatalogue.newName
                          )
                        }
                        className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        title="Save Rename"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setRenamingCatalogue(null)}
                        className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={catName}
                    className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Folder size={13} className="text-amber-400/80" />
                      <span className="font-bold text-zinc-200">{catName}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        ({count} {count === 1 ? 'item' : 'items'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setRenamingCatalogue({ oldName: catName, newName: catName })
                        }
                        className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                        title="Rename Catalogue"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCatalogue(catName)}
                        className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        title="Delete Catalogue"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setNewCatalogueInput('');
                  setIsAddCatalogueModalOpen(true);
                  setIsManageCataloguesModalOpen(false);
                }}
                className="text-amber-400 text-xs font-bold hover:underline cursor-pointer"
              >
                + Add Another Catalogue
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsManageCataloguesModalOpen(false);
                  setRenamingCatalogue(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Item Create / Edit Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-xs space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-amber-300 text-xs uppercase">
                {editingItemId ? 'Edit Ware Details' : 'Stock New Item'}
              </span>
              <button onClick={() => setIsItemModalOpen(false)} className="p-1 text-zinc-500 hover:text-white cursor-pointer">
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

              {/* Multi-Catalogue Assignment */}
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <label className="text-[10px] uppercase text-amber-400 font-bold block flex items-center gap-1.5">
                  <Folder size={12} />
                  <span>Catalogue Section / Department *</span>
                </label>
                <select
                  value={itemCatalogueChoice}
                  onChange={(e) => setItemCatalogueChoice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white cursor-pointer"
                >
                  <option value="__auto__">✨ Auto (Derived from Item Category)</option>
                  {currentCatalogues.map((cat) => (
                    <option key={cat} value={cat}>
                      📁 {cat}
                    </option>
                  ))}
                  <option value="__custom__">➕ + Create New Catalogue Section...</option>
                </select>

                {itemCatalogueChoice === '__custom__' && (
                  <div className="pt-1 animate-fade-in">
                    <input
                      type="text"
                      required
                      value={customCatalogueInput}
                      onChange={(e) => setCustomCatalogueInput(e.target.value)}
                      placeholder="Type new catalogue name (e.g. Alchemical Toxins)..."
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-amber-500/60 rounded-lg text-white placeholder:text-zinc-600"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Item Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white cursor-pointer"
                  >
                    {STANDARD_SHOP_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
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

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={itemAttunement}
                    onChange={(e) => setItemAttunement(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span>Requires Attunement by Spellcaster or Adventurer</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-xs cursor-pointer"
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
