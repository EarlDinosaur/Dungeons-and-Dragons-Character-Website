import type { ItemCategory } from '@/lib/types';

export type ShopItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'potion'
  | 'scroll'
  | 'consumable'
  | 'wondrous'
  | 'ring'
  | 'amulet'
  | 'gear'
  | 'tool'
  | 'poison'
  | 'trinket'
  | 'gem'
  | 'clothing'
  | 'book'
  | 'mount'
  | 'service'
  | 'relic'
  | 'custom'
  | (string & {});

export interface ShopItem {
  id: string;
  name: string;
  category: ShopItemCategory;
  catalogue?: string; // Specific catalogue / department section in the shop
  price: number; // Cost in GP
  currencyType: 'gp' | 'sp' | 'cp' | 'pp';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  stock: number; // -1 for unlimited, or finite number
  weight: number; // lbs
  description: string;
  effect?: string;
  requiresAttunement?: boolean;
  visibleToPlayers: boolean;
  icon?: string;
}

export interface CampaignShop {
  id: string;
  name: string;
  shopkeeper: string;
  shopkeeperTitle: string;
  location: string;
  description: string;
  bannerColor: string;
  accentColor: string;
  icon: string;
  discountPercent: number; // e.g. 10 = 10% off, -20 = 20% markup
  isOpen: boolean;
  visibleToPlayers: boolean;
  catalogues?: string[]; // Custom catalogue sections defined for this shop
  items: ShopItem[];
}

export interface ShopCategoryDefinition {
  id: ShopItemCategory;
  label: string;
  icon: string;
  emoji: string;
  description: string;
  defaultCatalogue: string;
  inventoryCategory: ItemCategory;
}

export const STANDARD_SHOP_CATEGORIES: ShopCategoryDefinition[] = [
  { id: 'weapon', label: 'Weapons', icon: 'Swords', emoji: '⚔️', description: 'Melee and ranged armaments', defaultCatalogue: 'Weapons & Armaments', inventoryCategory: 'weapon' },
  { id: 'armor', label: 'Armor', icon: 'Shield', emoji: '🛡️', description: 'Body armor and protective mail', defaultCatalogue: 'Suits of Armor', inventoryCategory: 'armor' },
  { id: 'shield', label: 'Shields', icon: 'Shield', emoji: '🔰', description: 'Defensive shields and bucklers', defaultCatalogue: 'Shields & Defenses', inventoryCategory: 'shield' },
  { id: 'potion', label: 'Potions & Elixirs', icon: 'FlaskConical', emoji: '🧪', description: 'Magical draughts, oils, and elixirs', defaultCatalogue: 'Potions & Elixirs', inventoryCategory: 'consumable' },
  { id: 'scroll', label: 'Spell Scrolls', icon: 'Scroll', emoji: '📜', description: 'Inscribed arcane and divine incantations', defaultCatalogue: 'Spell Scrolls', inventoryCategory: 'consumable' },
  { id: 'consumable', label: 'Consumables', icon: 'Package', emoji: '🍞', description: 'Rations, alchemical flasks, and supplies', defaultCatalogue: 'Consumables & Supplies', inventoryCategory: 'consumable' },
  { id: 'wondrous', label: 'Wondrous Items', icon: 'Sparkles', emoji: '✨', description: 'Enchanted curios and magical devices', defaultCatalogue: 'Wondrous Items', inventoryCategory: 'wondrous' },
  { id: 'ring', label: 'Magic Rings', icon: 'CircleDot', emoji: '💍', description: 'Ensorcelled rings and signets', defaultCatalogue: 'Enchanted Rings', inventoryCategory: 'ring' },
  { id: 'amulet', label: 'Amulets & Talismans', icon: 'Gem', emoji: '📿', description: 'Periapts, medallions, and talismans', defaultCatalogue: 'Amulets & Talismans', inventoryCategory: 'amulet' },
  { id: 'gear', label: 'Adventuring Gear', icon: 'Package', emoji: '🎒', description: 'Ropes, lanterns, bedrolls, and kits', defaultCatalogue: 'Adventuring Gear', inventoryCategory: 'gear' },
  { id: 'tool', label: 'Tools & Kits', icon: 'Sliders', emoji: '🔧', description: 'Artisan tools, thieves tools, and kits', defaultCatalogue: 'Tools of the Trade', inventoryCategory: 'tool' },
  { id: 'poison', label: 'Poisons & Toxins', icon: 'Skull', emoji: '☠️', description: 'Venoms, neurotoxins, and acids', defaultCatalogue: 'Poisons & Toxins', inventoryCategory: 'consumable' },
  { id: 'trinket', label: 'Trinkets & Curios', icon: 'Sparkles', emoji: '🔮', description: 'Oddities, luck charms, and tokens', defaultCatalogue: 'Trinkets & Curios', inventoryCategory: 'treasure' },
  { id: 'gem', label: 'Gems & Valuables', icon: 'Gem', emoji: '💎', description: 'Precious cut gemstones and ingots', defaultCatalogue: 'Gems & Valuables', inventoryCategory: 'treasure' },
  { id: 'clothing', label: 'Apparel & Cloaks', icon: 'Tag', emoji: '🥼', description: 'Fine garments, cloaks, and disguises', defaultCatalogue: 'Apparel & Cloaks', inventoryCategory: 'gear' },
  { id: 'book', label: 'Books & Grimoires', icon: 'BookOpen', emoji: '📖', description: 'Tomes, spellbooks, maps, and lore', defaultCatalogue: 'Books & Grimoires', inventoryCategory: 'gear' },
  { id: 'mount', label: 'Mounts & Transport', icon: 'Package', emoji: '🐎', description: 'Steeds, wagons, feed, and tack', defaultCatalogue: 'Mounts & Transport', inventoryCategory: 'gear' },
  { id: 'service', label: 'Services & Bounties', icon: 'Coins', emoji: '🤝', description: 'Spellcasting services and contracts', defaultCatalogue: 'Services & Contracts', inventoryCategory: 'gear' },
  { id: 'relic', label: 'Relics & Artifacts', icon: 'Sparkles', emoji: '🏛️', description: 'Sacred relics and forgotten lore', defaultCatalogue: 'Relics & Antiquities', inventoryCategory: 'wondrous' },
  { id: 'custom', label: 'Custom Wares', icon: 'Tag', emoji: '📦', description: 'Specialized goods and wares', defaultCatalogue: 'Special Curios', inventoryCategory: 'gear' },
];

export function getCategoryDefinition(cat: string): ShopCategoryDefinition | undefined {
  const normalized = (cat || '').toLowerCase().trim();
  return STANDARD_SHOP_CATEGORIES.find((c) => c.id.toLowerCase() === normalized);
}

export function getCategoryLabel(cat: string): string {
  const def = getCategoryDefinition(cat);
  if (def) return def.label;
  if (!cat) return 'General';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function getCategoryEmoji(cat: string): string {
  const def = getCategoryDefinition(cat);
  return def ? def.emoji : '📦';
}

export function getItemCatalogue(item: ShopItem): string {
  if (item.catalogue && item.catalogue.trim()) {
    return item.catalogue.trim();
  }
  const def = getCategoryDefinition(item.category);
  return def ? def.defaultCatalogue : getCategoryLabel(item.category);
}

export function getShopCatalogues(shop: CampaignShop): string[] {
  const explicit = shop.catalogues || [];
  const fromItems = (shop.items || []).map((i) => getItemCatalogue(i));
  const seen = new Set<string>();
  const list: string[] = [];

  for (const cat of [...explicit, ...fromItems]) {
    const trimmed = (cat || '').trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      list.push(trimmed);
    }
  }

  return list.length > 0 ? list : ['General Wares'];
}

export function mapShopCategoryToInventoryCategory(category: string): ItemCategory {
  const def = getCategoryDefinition(category);
  if (def) return def.inventoryCategory;

  const lower = (category || '').toLowerCase().trim();
  if (lower.includes('weapon') || lower.includes('blade') || lower.includes('bow')) return 'weapon';
  if (lower.includes('armor') || lower.includes('mail') || lower.includes('plate')) return 'armor';
  if (lower.includes('shield')) return 'shield';
  if (lower.includes('ring')) return 'ring';
  if (lower.includes('amulet') || lower.includes('necklace')) return 'amulet';
  if (lower.includes('potion') || lower.includes('elixir') || lower.includes('poison') || lower.includes('scroll') || lower.includes('food')) return 'consumable';
  if (lower.includes('wondrous') || lower.includes('relic') || lower.includes('magic')) return 'wondrous';
  if (lower.includes('tool') || lower.includes('kit')) return 'tool';
  if (lower.includes('gem') || lower.includes('treasure') || lower.includes('gold')) return 'treasure';
  return 'gear';
}

export const DEFAULT_CAMPAIGN_SHOPS: CampaignShop[] = [];

