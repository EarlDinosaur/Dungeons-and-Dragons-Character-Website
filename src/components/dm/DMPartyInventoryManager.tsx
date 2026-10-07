'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Shield,
  Swords,
  Search,
  Check,
  X,
  Sparkles,
  Weight,
  Coins,
  Crown,
  Heart,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';
import type { InventoryItem, ItemCategory, EquipmentSlotId, CharacterState } from '@/lib/types';
import ItemEditorModal from '@/components/shared/ItemEditorModal';
import { getItemRarity, RARITY_COLORS } from '@/components/characters/shared/BG3EquipmentPaperdoll';
import { calculateACWithBreakdown } from '@/lib/calc-engine';

interface DMPartyInventoryManagerProps {
  initialCharacterId?: string;
  onClose?: () => void;
}

export default function DMPartyInventoryManager({
  initialCharacterId = 'vesper',
  onClose,
}: DMPartyInventoryManagerProps) {
  const {
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customCharacters,
    getCharacterInventory,
    updateCharacterInventory,
    equipInventoryItem,
    unequipInventoryItem,
    getPortraitUrl,
    showToastNotification,
  } = useCharacter();

  const [selectedCharId, setSelectedCharId] = useState<string>(initialCharacterId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Item Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Build full list of campaign party members
  const partyList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      characterClass: string;
      level: number;
      portrait: string;
      hp: { current: number; max: number };
    }> = [
      {
        id: 'vesper',
        name: character.name || 'Earl (Vesper)',
        characterClass: `${character.class || 'Rogue'}${character.subclass ? ` (${character.subclass})` : ''}`,
        level: character.level,
        portrait: getPortraitUrl('vesper'),
        hp: { current: character.combat.currentHP, max: character.combat.maxHP },
      },
      {
        id: 'aria',
        name: aria.name || 'Aria Nightwhisper',
        characterClass: `${aria.characterClass || 'Sorcerer'}${aria.subclass ? ` (${aria.subclass})` : ''}`,
        level: aria.level,
        portrait: getPortraitUrl('aria'),
        hp: { current: aria.combat.currentHP, max: aria.combat.maxHP },
      },
      {
        id: 'cyrus',
        name: cyrus.name || 'Cyrus Drake',
        characterClass: `${cyrus.characterClass || 'Oracle'}${cyrus.subclass ? ` (${cyrus.subclass})` : ''}`,
        level: cyrus.level,
        portrait: getPortraitUrl('cyrus'),
        hp: { current: cyrus.combat.currentHP, max: cyrus.combat.maxHP },
      },
      {
        id: 'wynel',
        name: wynel.name || "Wyn'el Aeluin",
        characterClass: `${wynel.characterClass || 'Warlock'}${wynel.subclass ? ` (${wynel.subclass})` : ''}`,
        level: wynel.level,
        portrait: getPortraitUrl('wynel'),
        hp: { current: wynel.combat.currentHP, max: wynel.combat.maxHP },
      },
      {
        id: 'kastoriel',
        name: kastoriel.name || 'Kastoriel',
        characterClass: `${kastoriel.characterClass || 'Druid'}${kastoriel.subclass ? ` (${kastoriel.subclass})` : ''}`,
        level: kastoriel.level,
        portrait: getPortraitUrl('kastoriel'),
        hp: { current: kastoriel.combat.currentHP, max: kastoriel.combat.maxHP },
      },
    ];

    for (const [id, customChar] of Object.entries(customCharacters)) {
      list.push({
        id,
        name: customChar.name || `Hero ${id}`,
        characterClass: `${customChar.class || 'Adventurer'}${customChar.subclass ? ` (${customChar.subclass})` : ''}`,
        level: customChar.level || 10,
        portrait: getPortraitUrl(id) || '/portraits/default.jpg',
        hp: { current: customChar.combat.currentHP, max: customChar.combat.maxHP },
      });
    }

    return list;
  }, [character, aria, cyrus, wynel, kastoriel, customCharacters, getPortraitUrl]);

  // Selected character details
  const activeChar = partyList.find((p) => p.id === selectedCharId) || partyList[0];
  const inventory = useMemo(() => {
    return getCharacterInventory(activeChar.id);
  }, [getCharacterInventory, activeChar.id]);

  // Live AC breakdown based on active hero's DEX and current inventory
  const charForAC = useMemo(() => {
    let dex = 14;
    if (activeChar.id === 'vesper') {
      dex = character.abilityScores?.DEX?.total ?? 14;
    } else if (activeChar.id === 'aria') {
      dex = aria.abilityScores?.DEX ?? 14;
    } else if (activeChar.id === 'cyrus') {
      dex = cyrus.abilityScores?.DEX ?? 14;
    } else if (activeChar.id === 'wynel') {
      dex = wynel.abilityScores?.DEX ?? 14;
    } else if (activeChar.id === 'kastoriel') {
      dex = kastoriel.abilityScores?.DEX ?? 14;
    } else if (customCharacters[activeChar.id]) {
      dex = customCharacters[activeChar.id].abilityScores?.DEX?.total ?? 14;
    }

    return {
      inventory,
      abilityScores: {
        DEX: { total: dex, base: dex, modifier: Math.floor((dex - 10) / 2) },
      },
    };
  }, [activeChar.id, character, aria, cyrus, wynel, kastoriel, customCharacters, inventory]);

  const liveACBreakdown = useMemo(() => calculateACWithBreakdown(charForAC), [charForAC]);

  // Total weight
  const totalWeight = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
  }, [inventory]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'weapon') return item.category === 'weapon';
      if (selectedCategory === 'armor') return item.category === 'armor';
      if (selectedCategory === 'shield') return item.category === 'shield' || item.name.toLowerCase().includes('shield');
      if (selectedCategory === 'accessories') return item.category === 'ring' || item.category === 'amulet' || item.category === 'wondrous';
      if (selectedCategory === 'consumables') return item.category === 'consumable';
      if (selectedCategory === 'gear') return item.category === 'gear' || item.category === 'tool' || item.category === 'treasure';
      return true;
    });
  }, [inventory, searchQuery, selectedCategory]);

  // Handlers
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleSaveItem = (savedItem: InventoryItem) => {
    let updated: InventoryItem[];
    const exists = inventory.some((i) => i.id === savedItem.id);

    if (exists) {
      updated = inventory.map((i) => (i.id === savedItem.id ? savedItem : i));
      showToastNotification('DM Inventory', `Updated "${savedItem.name}" for ${activeChar.name}`, 'inventory');
    } else {
      updated = [savedItem, ...inventory];
      showToastNotification('DM Inventory', `Granted "${savedItem.name}" to ${activeChar.name}`, 'inventory');
    }

    updateCharacterInventory(activeChar.id, updated);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    if (confirm(`Remove "${item.name}" from ${activeChar.name}'s inventory?`)) {
      const updated = inventory.filter((i) => i.id !== item.id);
      updateCharacterInventory(activeChar.id, updated);
      showToastNotification('DM Inventory', `Removed "${item.name}" from ${activeChar.name}`, 'inventory');
    }
  };

  const handleToggleEquip = (item: InventoryItem) => {
    if (item.equipped) {
      unequipInventoryItem(activeChar.id, item.id);
    } else {
      equipInventoryItem(activeChar.id, item.id, item.slot);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fade-in font-mono text-xs">
      <div className="bg-[#0b0d14] border-2 border-amber-500/50 rounded-2xl max-w-5xl w-full p-3.5 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[94vh] sm:max-h-[92vh] relative overflow-hidden my-auto">
        {/* Top Arcane Accent Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* 1. Header Toolbar */}
        <div className="pb-3 border-b border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Package size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-base font-bold text-zinc-100 font-[family-name:var(--font-heading)] uppercase tracking-wider truncate">
                    Party Equipment &amp; Inventory
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 shrink-0">
                    Live Sync
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 hidden sm:block truncate">
                  Directly inspect, edit statistics, grant items, and equip gear for any party member
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenCreateItem}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Forge Item for {activeChar.name.split(' ')[0]}</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  title="Close Gear Manager"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile-only full-width Forge button */}
          <div className="sm:hidden">
            <button
              onClick={handleOpenCreateItem}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Forge Item for {activeChar.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* 2. Party Member Tabs (Hot-swapper) */}
        <div className="py-2.5 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {partyList.map((member) => {
            const isSelected = member.id === activeChar.id;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedCharId(member.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <img
                  src={member.portrait}
                  alt={member.name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                />
                <span>{member.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-60">Lv {member.level}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Selected Hero Stat Strip (Instant Stat Feedback) */}
        <div className="py-2.5 sm:py-3 px-3 sm:px-3.5 my-2 sm:my-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img
              src={activeChar.portrait}
              alt={activeChar.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-400 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-bold text-zinc-100 text-xs sm:text-sm">{activeChar.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({activeChar.characterClass})</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-red-400 font-bold whitespace-nowrap">
                  <Heart size={11} className="sm:w-3 sm:h-3" /> {activeChar.hp.current}/{activeChar.hp.max} HP
                </span>
                <span className="hidden xs:inline">&bull;</span>
                <span className="text-zinc-300 font-mono whitespace-nowrap">
                  {inventory.length} Items ({inventory.filter((i) => i.equipped).length} Eq)
                </span>
                <span className="hidden xs:inline">&bull;</span>
                <span className="flex items-center gap-1 text-zinc-300 whitespace-nowrap">
                  <Weight size={11} className="sm:w-3 sm:h-3 text-zinc-400" /> {totalWeight.toFixed(1)} lbs
                </span>
              </div>
            </div>
          </div>

          {/* Armor Class Plaque with breakdown */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-black/60 px-3 py-1 sm:py-1.5 rounded-xl border border-amber-500/30 shrink-0">
            <Shield size={15} className="text-amber-400" />
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400 block font-bold leading-tight">
                Calculated AC
              </span>
              <span className="text-sm sm:text-base font-black text-amber-300 font-mono leading-none">
                {liveACBreakdown.total}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 italic hidden md:inline max-w-xs truncate">
              {liveACBreakdown.formula}
            </span>
          </div>
        </div>

        {/* 4. Filter Toolbar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'weapon', label: 'Weapons ⚔️' },
              { id: 'armor', label: 'Armor 🛡️' },
              { id: 'shield', label: 'Shields 🛡️' },
              { id: 'accessories', label: 'Accessories 💍' },
              { id: 'consumables', label: 'Consumables 🧪' },
              { id: 'gear', label: 'Gear 🎒' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, stats, spells..."
              className="w-full pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 5. Inventory Item Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 pb-4 min-h-[180px]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono space-y-2">
              <Package size={30} className="mx-auto text-zinc-600 opacity-60" />
              <p className="text-xs">No items match the active category filter.</p>
              <button
                onClick={handleOpenCreateItem}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-xs cursor-pointer inline-flex items-center gap-1 font-bold"
              >
                <Plus size={13} /> Grant New Item to {activeChar.name.split(' ')[0]}
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const rarity = getItemRarity(item);
              const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    item.equipped
                      ? `${rarityStyle.border} ${rarityStyle.bg} shadow-md ring-1 ring-amber-500/20`
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Item Info, Badges & Stats */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Equipped Toggle Pill */}
                      <button
                        onClick={() => handleToggleEquip(item)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                          item.equipped
                            ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                        title="Click to toggle equipped state"
                      >
                        <Shield size={11} className={item.equipped ? 'fill-black' : ''} />
                        <span>{item.equipped ? 'EQUIPPED' : 'IN BAG'}</span>
                      </button>

                      {/* Item Name */}
                      <h4 className={`font-bold text-xs sm:text-sm truncate ${item.equipped ? rarityStyle.text : 'text-zinc-200'}`}>
                        {item.name}
                      </h4>

                      {/* Rarity */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${rarityStyle.badgeBg} ${rarityStyle.badgeText}`}
                      >
                        {rarity}
                      </span>

                      {/* Category */}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 capitalize">
                        {item.category}
                      </span>
                    </div>

                    {/* Stat Badges Strip */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      {item.acBonus !== undefined && item.acBonus !== 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                          🛡️ AC +{item.acBonus}
                        </span>
                      )}

                      {item.baseAC !== undefined && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-700/60 font-bold">
                          🛡️ Base AC {item.baseAC}
                        </span>
                      )}

                      {item.attackBonus !== undefined && item.attackBonus !== 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/60 font-bold">
                          ⚔️ Atk +{item.attackBonus}
                        </span>
                      )}

                      {item.damage && (
                        <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-700/60 font-bold">
                          💥 {item.damage} {item.damageType || ''}
                        </span>
                      )}

                      {item.statModifiers &&
                        Object.entries(item.statModifiers).map(([stat, val]) => (
                          <span
                            key={stat}
                            className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/60 font-bold"
                          >
                            +{val} {stat}
                          </span>
                        ))}

                      <span className="text-zinc-500">
                        {item.weight || 0} lbs &bull; Qty {item.quantity || 1}
                      </span>

                      {item.slot && (
                        <span className="text-zinc-400 font-mono text-[9px]">
                          [{item.slot}]
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    {item.description && (
                      <p className="text-[11px] text-zinc-400 italic line-clamp-1">
                        &ldquo;{item.description}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleEquip(item)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        item.equipped
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-black border border-amber-500/50'
                      }`}
                    >
                      {item.equipped ? 'Unequip' : 'Equip'}
                    </button>

                    <button
                      onClick={() => handleOpenEditItem(item)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
                      title="Edit Item Stats & Description"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 6. Item Editor Modal */}
        <ItemEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveItem}
          initialItem={editingItem}
          mode={editorMode}
          characterName={activeChar.name}
        />
      </div>
    </div>
  );
}
