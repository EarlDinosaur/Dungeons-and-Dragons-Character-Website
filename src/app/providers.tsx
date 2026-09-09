'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CharacterState, AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery, TabId, CustomMember } from '@/lib/types';
import { createDefaultCharacterState, recalculateForLevel, saveCharacterState, loadCharacterState } from '@/lib/persistence';
import { isPhantomMurmursActive, getMaxSouls, getVestigeStage } from '@/lib/orphans-tithe';
import type { AriaState, LunarPhase } from '@/lib/aria-engine';
import { createDefaultAriaState, calculateAriaStats } from '@/lib/aria-engine';
import type { CyrusState } from '@/lib/cyrus-engine';
import { createDefaultCyrusState, calculateCyrusStats } from '@/lib/cyrus-engine';
import type { WynelState } from '@/lib/wynel-engine';
import { createDefaultWynelState, calculateWynelStats } from '@/lib/wynel-engine';
import type { KastorielState, StarryConstellation, CosmicOmen } from '@/lib/kastoriel-engine';
import { createDefaultKastorielState, calculateKastorielStats } from '@/lib/kastoriel-engine';
import { ToastProvider, useToast, type ToastType } from '@/components/ui/ToastNotification';
import { computeInjectedFeatures, mergeInjectedWithManual } from '@/lib/feature-injection';
import type { SyncState, DbStatusInfo } from '@/lib/sync-engine';
import { fetchSync, pushCharacterSync, pushCharacterDelete, pushCampaignSync, fetchDbStatus } from '@/lib/sync-engine';

import MediaPickerModal from '@/components/ui/MediaPickerModal';
import type { DMNote } from '@/lib/dm-types';
import type { EquipmentSlotId } from '@/lib/types';
import type { CustomNPC } from '@/lib/npc-types';
import { DEFAULT_CAMPAIGN_NPCS } from '@/lib/npc-types';
import type { CampaignShop, ShopItem } from '@/lib/shop-types';
import { DEFAULT_CAMPAIGN_SHOPS } from '@/lib/shop-types';

const ARIA_STORAGE_KEY = 'dnd_char_aria';
const CYRUS_STORAGE_KEY = 'dnd_char_cyrus';
const WYNEL_STORAGE_KEY = 'dnd_char_wynel';
const KASTORIEL_STORAGE_KEY = 'dnd_char_kastoriel';
const ACTIVE_CHAR_KEY = 'dnd_active_character_id';
const ACTIVE_VIEW_KEY = 'dnd_active_view';
const CUSTOM_MEDIA_STORAGE_KEY = 'dnd_custom_media';
const CUSTOM_ROSTER_KEY = 'dnd_tavern_custom_roster';
const CUSTOM_CHARACTERS_STORAGE_KEY = 'dnd_custom_characters';
const CUSTOM_THEMES_STORAGE_KEY = 'dnd_custom_themes';
const DM_NOTES_STORAGE_KEY = 'dnd_ashen_pact_dm_notes';
const CUSTOM_NPCS_STORAGE_KEY = 'dnd_ashen_pact_custom_npcs';
const CAMPAIGN_SHOPS_STORAGE_KEY = 'dnd_ashen_pact_campaign_shops';

const DEFAULT_DM_NOTES: DMNote[] = [
  {
    id: 'note-starter-1',
    title: 'The Starlight Conclave Directive',
    content: 'Kastoriel, your pendulum vibrates with astral resonance when aligned with the zenith. A stellar rift approaches above the Sunken Spire. Seek the celestial coordinates before the blood moon rises.',
    category: 'secret',
    targetCharacterId: 'kastoriel',
    isPlayerVisible: true,
    pinned: true,
    tags: ['#starry_coven', '#pendulum', '#vision'],
    author: 'Dungeon Master',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'note-starter-2',
    title: 'Bounty: The Ashen Inquisitors',
    content: 'Public decree posted in the Guildhall tavern: A cell of rogue Inquisitors was spotted skulking near the lower catacombs. Beware shadowy ambushes. 500 GP reward upon delivery of their insignia.',
    category: 'quest',
    targetCharacterId: 'all',
    isPlayerVisible: true,
    pinned: true,
    tags: ['#main_quest', '#bounty', '#catacombs'],
    author: 'Dungeon Master',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'note-starter-3',
    title: 'Lunar Anomaly at the Eclipse Sanctum',
    content: 'Aria, the silver tides whisper of an ancient ritual that inverted the lunar weave. Your Lunar Sorcery will surge with wild potency when within 60 feet of the Obsidian Obelisk.',
    category: 'secret',
    targetCharacterId: 'aria',
    isPlayerVisible: true,
    pinned: false,
    tags: ['#lunar_weave', '#obelisk'],
    author: 'Dungeon Master',
    createdAt: Date.now() - 3600000 * 6,
    updatedAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'note-starter-4',
    title: 'Shadow Guild Whisper: Contract on the Magistrate',
    content: 'Vesper, the ravens brought a coded letter. The merchant guild is laundering counterfeit soul gems through the lower docks. A contact waits at midnight under the weeping gargoyle.',
    category: 'secret',
    targetCharacterId: 'vesper',
    isPlayerVisible: true,
    pinned: false,
    tags: ['#thieves_guild', '#soul_gems', '#docks'],
    author: 'Dungeon Master',
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'note-starter-5',
    title: 'DM Confidential: Crypt Trap Placements & Boss Tactics',
    content: 'CONFIDENTIAL (DM EYES ONLY). The crypt bridge is rigged with a Glyph of Warding (DC 16 Investigation to detect; 5d8 Thunder). Inquisitor Malakor casts Shield and uses legendary action misty step.',
    category: 'clue',
    targetCharacterId: 'all',
    isPlayerVisible: false,
    pinned: true,
    tags: ['#dm_secret', '#traps', '#boss_tactics'],
    author: 'Dungeon Master',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
];

export type ViewMode = 'menu' | 'character' | 'dm';

export interface CustomMedia {
  portraits: {
    vesper?: string;
    aria?: string;
    cyrus?: string;
    wynel?: string;
    kastoriel?: string;
  };
  backgrounds: {
    vesper?: string;
    aria?: string;
    cyrus?: string;
    wynel?: string;
    kastoriel?: string;
    menu?: string;
  };
}

const DEFAULT_PORTRAITS: Record<string, string> = {
  vesper: '/vesper-portrait.png',
  aria: '/aria-portrait.png',
  cyrus: '/cyrus-portrait.png',
  wynel: '/wynel-portrait.png',
  kastoriel: '/kastoriel-portrait.png',
};

const DEFAULT_BACKGROUNDS: Record<string, string> = {
  vesper: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  aria: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  cyrus: '/images/cyrus-bg.jpg',
  wynel: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  kastoriel: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  menu: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
};

interface CharacterContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  navigateToMenu: () => void;
  navigateToCharacter: (id: string) => void;
  navigateToDM: () => void;

  activeCharacterId: string;
  setActiveCharacterId: (id: string) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  showToastNotification: (title: string, message: string, type?: ToastType) => void;

  // Custom Media Picker state & methods
  customMedia: CustomMedia;
  setCustomPortrait: (characterId: string, dataUrl: string | null) => void;
  setCustomBackground: (targetId: string, dataUrl: string | null) => void;
  resetMedia: () => void;
  getPortraitUrl: (characterId: string) => string;
  getBackgroundUrl: (targetId: string) => string;
  isMediaPickerOpen: boolean;
  setIsMediaPickerOpen: (open: boolean) => void;
  openMediaPicker: (defaultTab?: 'portraits' | 'backgrounds', targetCharacter?: string) => void;

  // Earl's state & actions
  character: CharacterState;
  setLevel: (level: number) => void;
  setCurrentHP: (hp: number) => void;
  setTempHP: (hp: number) => void;
  setSouls: (souls: number) => void;
  longRest: () => void;
  setInventory: (items: InventoryItem[]) => void;
  setCurrency: (currency: Currency) => void;
  setPlayerNotes: (notes: string) => void;
  setJournal: (entries: JournalEntry[]) => void;
  setMysteries: (mysteries: CampaignMystery[]) => void;

  // New Progression & Field Editability Actions
  updateAbilityBaseScore: (ability: AbilityName, newBase: number) => void;
  toggleSkillProficiency: (skillName: import('@/lib/types').SkillName) => void;
  toggleCharacterCondition: (charId: string, condition: string) => void;
  setCombatOverrides: (overrides: Partial<import('@/lib/types').CombatOverrides>) => void;
  setClasses: (classes: import('@/lib/types').ClassLevel[]) => void;
  addAttack: (attack: Omit<import('@/lib/types').AttackOption, 'id'>) => void;
  editAttack: (attack: import('@/lib/types').AttackOption) => void;
  deleteAttack: (id: string) => void;
  addSpell: (spell: Omit<import('@/lib/types').CharacterSpellItem, 'id'>) => void;
  editSpell: (spell: import('@/lib/types').CharacterSpellItem) => void;
  deleteSpell: (id: string) => void;
  useVesperSpellSlot: (level: number) => void;
  restoreVesperSpellSlot: (level: number) => void;
  setVesperSpellSlotMax: (level: number, max: number) => void;
  setSpellSlots: (slots: Record<number, { max: number; used: number }>) => void;
  setSpellSlotMax: (level: number, max: number) => void;
  addFeat: (feat: Omit<import('@/lib/types').CustomFeat, 'id'>) => void;
  deleteFeat: (id: string) => void;
  updateProficiencies: (category: keyof import('@/lib/types').NonStatProficiencies, tags: string[]) => void;


  // Aria's state & actions
  aria: AriaState;
  setAriaLevel: (level: number) => void;
  setAriaHP: (hp: number) => void;
  setAriaTempHP: (hp: number) => void;
  setAriaLunarPhase: (phase: LunarPhase) => void;
  setAriaSorceryPoints: (points: number) => void;
  toggleAriaInnateSorcery: () => void;
  useAriaSpellSlot: (level: number) => void;
  restoreAriaSpellSlot: (level: number) => void;
  setAriaSpellSlotMax: (level: number, max: number) => void;
  ariaLongRest: () => void;
  setAriaInventory: (items: InventoryItem[]) => void;
  setAriaCurrency: (currency: Currency) => void;
  setAriaNotes: (notes: string) => void;
  setAriaJournal: (entries: JournalEntry[]) => void;
  setAriaMysteries: (mysteries: CampaignMystery[]) => void;

  // Cyrus's state & actions
  cyrus: CyrusState;
  setCyrusLevel: (level: number) => void;
  setCyrusHP: (hp: number) => void;
  setCyrusTempHP: (hp: number) => void;
  useCyrusSpellSlot: (level: number) => void;
  restoreCyrusSpellSlot: (level: number) => void;
  setCyrusSpellSlotMax: (level: number, max: number) => void;
  toggleCyrusRadiantSoul: () => void;
  useCyrusHealingHands: () => void;
  useCyrusEpiphany: () => void;
  cyrusLongRest: () => void;
  setCyrusInventory: (items: InventoryItem[]) => void;
  setCyrusCurrency: (currency: Currency) => void;
  setCyrusNotes: (notes: string) => void;
  setCyrusJournal: (entries: JournalEntry[]) => void;
  setCyrusMysteries: (mysteries: CampaignMystery[]) => void;

  // Wyn'el's state & actions
  wynel: WynelState;
  setWynelLevel: (level: number) => void;
  setWynelHP: (hp: number) => void;
  setWynelTempHP: (hp: number) => void;
  useWynelPactSlot: () => void;
  restoreWynelPactSlot: () => void;
  setWynelPactSlotMax: (max: number) => void;
  wynelShortRest: () => void;
  wynelLongRest: () => void;
  toggleWynelFeyPresence: () => void;
  toggleWynelCrimsonPulse: () => void;
  toggleWynelChaosAura: () => void;
  setWynelInventory: (items: InventoryItem[]) => void;
  setWynelCurrency: (currency: Currency) => void;
  setWynelNotes: (notes: string) => void;
  setWynelJournal: (entries: JournalEntry[]) => void;
  setWynelMysteries: (mysteries: CampaignMystery[]) => void;

  // Kastoriel's state & actions
  kastoriel: KastorielState;
  setKastorielLevel: (level: number) => void;
  setKastorielHP: (hp: number) => void;
  setKastorielTempHP: (hp: number) => void;
  useKastorielSpellSlot: (level: number) => void;
  restoreKastorielSpellSlot: (level: number) => void;
  setKastorielSpellSlotMax: (level: number, max: number) => void;
  useKastorielWildShape: () => void;
  restoreKastorielWildShape: () => void;
  setKastorielStarryForm: (form: StarryConstellation) => void;
  rollKastorielCosmicOmen: (dieRoll?: number) => void;
  useKastorielCosmicOmen: () => void;
  useKastorielGuidingBolt: () => void;
  restoreKastorielGuidingBolt: () => void;
  kastorielShortRest: () => void;
  kastorielLongRest: () => void;
  setKastorielInventory: (items: InventoryItem[]) => void;
  setKastorielCurrency: (currency: Currency) => void;
  setKastorielNotes: (notes: string) => void;
  setKastorielJournal: (entries: JournalEntry[]) => void;
  setKastorielMysteries: (mysteries: CampaignMystery[]) => void;

  // Custom Party Roster
  customMembers: CustomMember[];
  setCustomMembers: (members: CustomMember[]) => void;

  // Dynamic / Custom Characters (Created on the website)
  customCharacters: Record<string, CharacterState>;
  customThemes: Record<string, { primary: string; accent: string; portraitUrl: string }>;
  createCustomCharacter: (charId: string, charData: CharacterState, theme: { primary: string; accent: string; portraitUrl: string }) => void;
  deleteCustomCharacter: (charId: string) => void;
  updateCustomCharacter: (charId: string, updater: (prev: CharacterState) => CharacterState) => void;

  // Real-time SQLite Sync
  syncStatus: SyncState;
  dbInfo: DbStatusInfo | null;
  lastSyncedAt: number | null;
  forceSync: () => Promise<void>;

  // DM Multi-Note Campaign Chronicle System
  dmNotes: DMNote[];
  addDMNote: (note: Omit<DMNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDMNote: (id: string, updates: Partial<DMNote>) => void;
  deleteDMNote: (id: string) => void;
  toggleNoteVisibility: (id: string) => void;
  getNotesForCharacter: (characterId: string) => DMNote[];

  // Custom NPC System
  customNPCs: CustomNPC[];
  addCustomNPC: (npc: Omit<CustomNPC, 'id' | 'createdAt' | 'updatedAt'>) => CustomNPC;
  updateCustomNPC: (id: string, updates: Partial<CustomNPC>) => void;
  deleteCustomNPC: (id: string) => void;
  toggleNPCPlayerVisibility: (id: string) => void;

  // Campaign Shop System
  campaignShops: CampaignShop[];
  addShop: (shop: Omit<CampaignShop, 'id'>) => void;
  updateShop: (id: string, updates: Partial<CampaignShop>) => void;
  deleteShop: (id: string) => void;
  addShopItem: (shopId: string, item: Omit<ShopItem, 'id'>) => void;
  updateShopItem: (shopId: string, itemId: string, updates: Partial<ShopItem>) => void;
  deleteShopItem: (shopId: string, itemId: string) => void;
  purchaseShopItem: (characterId: string, shopId: string, itemId: string) => { success: boolean; message: string };

  // Equipment Slot Management (BG3 Paperdoll)
  equipInventoryItem: (charId: string, itemId: string, slot?: EquipmentSlotId) => void;
  unequipInventoryItem: (charId: string, itemId: string) => void;

  isLoaded: boolean;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used within CharacterProvider');
  return ctx;
}

function CharacterProviderContent({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [activeView, setActiveViewState] = useState<ViewMode>('menu');
  const [activeCharacterId, setActiveCharacterIdState] = useState<string>('vesper');
  const [character, setCharacter] = useState<CharacterState>(createDefaultCharacterState);
  const [aria, setAria] = useState<AriaState>(createDefaultAriaState);
  const [cyrus, setCyrus] = useState<CyrusState>(createDefaultCyrusState);
  const [wynel, setWynel] = useState<WynelState>(createDefaultWynelState);
  const [kastoriel, setKastoriel] = useState<KastorielState>(createDefaultKastorielState);
  const [activeTab, setActiveTab] = useState<TabId>('character');
  const [isLoaded, setIsLoaded] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncState>('syncing');
  const [dbInfo, setDbInfo] = useState<DbStatusInfo | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [customMembers, setCustomMembersState] = useState<CustomMember[]>([]);
  const [customCharacters, setCustomCharactersState] = useState<Record<string, CharacterState>>({});
  const [customThemes, setCustomThemesState] = useState<Record<string, { primary: string; accent: string; portraitUrl: string }>>({});
  const [dmNotes, setDmNotesState] = useState<DMNote[]>(DEFAULT_DM_NOTES);
  const [customNPCs, setCustomNPCsState] = useState<CustomNPC[]>(DEFAULT_CAMPAIGN_NPCS);
  const [campaignShops, setCampaignShopsState] = useState<CampaignShop[]>(DEFAULT_CAMPAIGN_SHOPS);

  const lastServerTimestampRef = useRef<number>(0);
  const vesperModifiedRef = useRef<number>(0);
  const ariaModifiedRef = useRef<number>(0);
  const cyrusModifiedRef = useRef<number>(0);
  const wynelModifiedRef = useRef<number>(0);
  const kastorielModifiedRef = useRef<number>(0);
  const mediaModifiedRef = useRef<number>(0);
  const rosterModifiedRef = useRef<number>(0);
  const dmNotesModifiedRef = useRef<number>(0);
  const customNPCsModifiedRef = useRef<number>(0);
  const campaignShopsModifiedRef = useRef<number>(0);
  const customCharactersRef = useRef<Record<string, CharacterState>>({});
  const customThemesRef = useRef<Record<string, { primary: string; accent: string; portraitUrl: string }>>({});
  const isPollingRef = useRef<boolean>(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ariaSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cyrusSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wynelSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kastorielSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rosterSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [customMedia, setCustomMediaState] = useState<CustomMedia>({
    portraits: {},
    backgrounds: {},
  });
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTab, setMediaPickerTab] = useState<'portraits' | 'backgrounds'>('portraits');
  const [mediaPickerTargetChar, setMediaPickerTargetChar] = useState<string | undefined>(undefined);

  // Perform differential or full synchronization with SQLite backend
  const performSync = useCallback(async (isFullSync = false) => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const since = isFullSync ? 0 : lastServerTimestampRef.current;
      const res = await fetchSync(since);
      if (!res) {
        setSyncStatus('offline');
        return;
      }

      if (res.upToDate) {
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
        return;
      }

      // Sync character updates
      if (res.characters) {
        // Vesper / Earl
        const vesperRemote = res.characters.vesper;
        if (vesperRemote && vesperRemote.updatedAt > vesperModifiedRef.current) {
          setCharacter(vesperRemote.data);
          saveCharacterState(vesperRemote.data);
        }

        // Aria
        const ariaRemote = res.characters.aria;
        if (ariaRemote && ariaRemote.updatedAt > ariaModifiedRef.current) {
          setAria(ariaRemote.data);
          try {
            localStorage.setItem(ARIA_STORAGE_KEY, JSON.stringify(ariaRemote.data));
          } catch {}
        }

        // Cyrus
        const cyrusRemote = res.characters.cyrus;
        if (cyrusRemote && cyrusRemote.updatedAt > cyrusModifiedRef.current) {
          setCyrus(cyrusRemote.data);
          try {
            localStorage.setItem(CYRUS_STORAGE_KEY, JSON.stringify(cyrusRemote.data));
          } catch {}
        }

        // Wyn'el
        const wynelRemote = res.characters.wynel;
        if (wynelRemote && wynelRemote.updatedAt > wynelModifiedRef.current) {
          const defaultState = createDefaultWynelState();
          const existingIds = new Set((wynelRemote.data?.spellcasting?.spells || []).map((s: any) => s.id));
          const missingDefaults = defaultState.spellcasting.spells.filter((s) => !existingIds.has(s.id));
          const mergedData = missingDefaults.length > 0
            ? {
                ...wynelRemote.data,
                spellcasting: {
                  ...wynelRemote.data.spellcasting,
                  spells: [...(wynelRemote.data.spellcasting?.spells || []), ...missingDefaults],
                },
              }
            : wynelRemote.data;
          setWynel(mergedData);
          try {
            localStorage.setItem(WYNEL_STORAGE_KEY, JSON.stringify(mergedData));
          } catch {}
        }

        // Kastoriel
        const kastorielRemote = res.characters.kastoriel;
        if (kastorielRemote && kastorielRemote.updatedAt > kastorielModifiedRef.current) {
          const defaultState = createDefaultKastorielState();
          const existingIds = new Set((kastorielRemote.data?.spellcasting?.spells || []).map((s: any) => s.id));
          const missingDefaults = defaultState.spellcasting.spells.filter((s) => !existingIds.has(s.id));
          const mergedData = missingDefaults.length > 0
            ? {
                ...kastorielRemote.data,
                spellcasting: {
                  ...kastorielRemote.data.spellcasting,
                  spells: [...(kastorielRemote.data.spellcasting?.spells || []), ...missingDefaults],
                },
              }
            : kastorielRemote.data;
          setKastoriel(mergedData);
          try {
            localStorage.setItem(KASTORIEL_STORAGE_KEY, JSON.stringify(mergedData));
          } catch {}
        }

        // Custom Characters from SQLite
        const knownKeys = new Set(['vesper', 'aria', 'cyrus', 'wynel', 'kastoriel']);
        const remoteCustoms: Record<string, CharacterState> = {};
        for (const [id, val] of Object.entries(res.characters)) {
          if (!knownKeys.has(id) && val?.data) {
            remoteCustoms[id] = val.data;
          }
        }
        if (Object.keys(remoteCustoms).length > 0) {
          setCustomCharactersState((prev) => {
            const next = { ...prev, ...remoteCustoms };
            customCharactersRef.current = next;
            try {
              localStorage.setItem(CUSTOM_CHARACTERS_STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      }

      // Sync campaign updates
      if (res.campaign) {
        // Custom media
        const mediaRemote = res.campaign.custom_media;
        if (mediaRemote && mediaRemote.updatedAt > mediaModifiedRef.current) {
          setCustomMediaState(mediaRemote.data);
          try {
            localStorage.setItem(CUSTOM_MEDIA_STORAGE_KEY, JSON.stringify(mediaRemote.data));
          } catch {}
        }

        // Custom party roster
        const rosterRemote = res.campaign.custom_roster;
        if (rosterRemote && rosterRemote.updatedAt > rosterModifiedRef.current) {
          setCustomMembersState(rosterRemote.data);
          try {
            localStorage.setItem(CUSTOM_ROSTER_KEY, JSON.stringify(rosterRemote.data));
          } catch {}
        }

        // DM Campaign Notes
        const dmNotesRemote = res.campaign.dm_notes;
        if (dmNotesRemote && dmNotesRemote.updatedAt > dmNotesModifiedRef.current) {
          if (Array.isArray(dmNotesRemote.data)) {
            setDmNotesState(dmNotesRemote.data);
            try {
              localStorage.setItem(DM_NOTES_STORAGE_KEY, JSON.stringify(dmNotesRemote.data));
            } catch {}
          }
        }
      }

      if (res.lastUpdated) {
        lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.lastUpdated);
      }
      setSyncStatus('synced');
      setLastSyncedAt(Date.now());
    } catch (err) {
      console.warn('[CharacterProvider] Sync error:', err);
      setSyncStatus('offline');
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  // Hydration-safe load from localStorage + background polling
  useEffect(() => {
    try {
      const savedActiveChar = localStorage.getItem(ACTIVE_CHAR_KEY);
      if (savedActiveChar) setActiveCharacterIdState(savedActiveChar);

      const savedActiveView = localStorage.getItem(ACTIVE_VIEW_KEY) as ViewMode | null;
      if (savedActiveView) setActiveViewState(savedActiveView);

      const savedVesper = loadCharacterState();
      if (savedVesper) setCharacter(savedVesper);

      const savedAriaRaw = localStorage.getItem(ARIA_STORAGE_KEY);
      if (savedAriaRaw) {
        setAria(JSON.parse(savedAriaRaw));
      }

      const savedCyrusRaw = localStorage.getItem(CYRUS_STORAGE_KEY);
      if (savedCyrusRaw) {
        setCyrus(JSON.parse(savedCyrusRaw));
      }

      const savedWynelRaw = localStorage.getItem(WYNEL_STORAGE_KEY);
      if (savedWynelRaw) {
        try {
          const parsed = JSON.parse(savedWynelRaw);
          const defaultState = createDefaultWynelState();
          const existingIds = new Set((parsed.spellcasting?.spells || []).map((s: any) => s.id));
          const missingDefaults = defaultState.spellcasting.spells.filter((s) => !existingIds.has(s.id));
          if (missingDefaults.length > 0) {
            parsed.spellcasting = {
              ...parsed.spellcasting,
              spells: [...(parsed.spellcasting?.spells || []), ...missingDefaults],
            };
          }
          if (parsed.features && Array.isArray(parsed.features)) {
            const hasAwakened = parsed.features.some((f: any) => f.name?.includes('Awakened Mind'));
            if (!hasAwakened) {
              const feat = defaultState.features.find((f) => f.name.includes('Awakened Mind'));
              if (feat) parsed.features.push(feat);
            }
          }
          setWynel(calculateWynelStats(parsed));
        } catch {
          setWynel(createDefaultWynelState());
        }
      }

      const savedKastorielRaw = localStorage.getItem(KASTORIEL_STORAGE_KEY);
      if (savedKastorielRaw) {
        try {
          const parsed = JSON.parse(savedKastorielRaw);
          const defaultState = createDefaultKastorielState();
          const existingIds = new Set((parsed.spellcasting?.spells || []).map((s: any) => s.id));
          const missingDefaults = defaultState.spellcasting.spells.filter((s) => !existingIds.has(s.id));
          if (missingDefaults.length > 0) {
            parsed.spellcasting = {
              ...parsed.spellcasting,
              spells: [...(parsed.spellcasting?.spells || []), ...missingDefaults],
            };
          }
          setKastoriel(calculateKastorielStats(parsed));
        } catch {
          setKastoriel(createDefaultKastorielState());
        }
      }

      const savedMediaRaw = localStorage.getItem(CUSTOM_MEDIA_STORAGE_KEY);
      if (savedMediaRaw) {
        setCustomMediaState(JSON.parse(savedMediaRaw));
      }

      const savedRosterRaw = localStorage.getItem(CUSTOM_ROSTER_KEY);
      if (savedRosterRaw) {
        setCustomMembersState(JSON.parse(savedRosterRaw));
      }

      const savedCustomCharsRaw = localStorage.getItem(CUSTOM_CHARACTERS_STORAGE_KEY);
      if (savedCustomCharsRaw) {
        try {
          const parsed = JSON.parse(savedCustomCharsRaw);
          setCustomCharactersState(parsed);
          customCharactersRef.current = parsed;
        } catch {}
      }

      const savedCustomThemesRaw = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
      if (savedCustomThemesRaw) {
        try {
          const parsed = JSON.parse(savedCustomThemesRaw);
          setCustomThemesState(parsed);
          customThemesRef.current = parsed;
        } catch {}
      }

      const savedDMNotesRaw = localStorage.getItem(DM_NOTES_STORAGE_KEY);
      if (savedDMNotesRaw) {
        try {
          const parsed = JSON.parse(savedDMNotesRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDmNotesState(parsed);
          }
        } catch {}
      }

      const savedNPCsRaw = localStorage.getItem(CUSTOM_NPCS_STORAGE_KEY);
      if (savedNPCsRaw) {
        try {
          const parsed = JSON.parse(savedNPCsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomNPCsState(parsed);
          }
        } catch {}
      }

      const savedShopsRaw = localStorage.getItem(CAMPAIGN_SHOPS_STORAGE_KEY);
      if (savedShopsRaw) {
        try {
          const parsed = JSON.parse(savedShopsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCampaignShopsState(parsed);
          }
        } catch {}
      }
    } catch (err) {
      console.error('Error loading characters from localStorage:', err);
    }
    setIsLoaded(true);

    // Check DB driver & connection
    fetchDbStatus().then((info) => {
      if (info) setDbInfo(info);
    });

    // Initial full sync from SQLite
    performSync(true);

    // Live background polling (every 3.5 seconds)
    const interval = setInterval(() => {
      performSync(false);
    }, 3500);

    // Sync on window focus or visibility change
    const onFocus = () => performSync(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') performSync(false);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [performSync]);

  const forceSync = useCallback(async () => {
    setSyncStatus('syncing');
    const info = await fetchDbStatus();
    if (info) setDbInfo(info);
    await performSync(true);
  }, [performSync]);

  const scheduleCustomMediaSave = useCallback((next: CustomMedia) => {
    mediaModifiedRef.current = Date.now();
    try {
      localStorage.setItem(CUSTOM_MEDIA_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving custom media:', e);
    }
    setSyncStatus('syncing');
    if (mediaSaveTimerRef.current) clearTimeout(mediaSaveTimerRef.current);
    mediaSaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await pushCampaignSync('custom_media', next, mediaModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  const saveCustomMedia = useCallback((next: CustomMedia) => {
    setCustomMediaState(next);
    scheduleCustomMediaSave(next);
  }, [scheduleCustomMediaSave]);

  const setCustomMembers = useCallback((next: CustomMember[]) => {
    setCustomMembersState(next);
    rosterModifiedRef.current = Date.now();
    try {
      localStorage.setItem(CUSTOM_ROSTER_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving custom roster:', e);
    }
    setSyncStatus('syncing');
    if (rosterSaveTimerRef.current) clearTimeout(rosterSaveTimerRef.current);
    rosterSaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await pushCampaignSync('custom_roster', next, rosterModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  const createCustomCharacter = useCallback(
    (charId: string, charData: CharacterState, theme: { primary: string; accent: string; portraitUrl: string }) => {
      setCustomCharactersState((prev) => {
        const next = { ...prev, [charId]: charData };
        customCharactersRef.current = next;
        try {
          localStorage.setItem(CUSTOM_CHARACTERS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      setCustomThemesState((prev) => {
        const next = { ...prev, [charId]: theme };
        customThemesRef.current = next;
        try {
          localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      pushCharacterSync(charId, charData, Date.now(), `Created new hero: ${charData.name}`);
      showToast('Hero Awakened', `${charData.name} has joined the campaign roster!`, 'level');
      setActiveCharacterIdState(charId);
      setActiveViewState('character');
      setActiveTab('combat');
    },
    [showToast]
  );

  const deleteCustomCharacter = useCallback(
    (charId: string) => {
      setCustomCharactersState((prev) => {
        const next = { ...prev };
        delete next[charId];
        customCharactersRef.current = next;
        try {
          localStorage.setItem(CUSTOM_CHARACTERS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      setCustomThemesState((prev) => {
        const next = { ...prev };
        delete next[charId];
        customThemesRef.current = next;
        try {
          localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      pushCharacterDelete(charId, `Deleted hero: ${charId}`);
      showToast('Hero Retired', `Character removed from campaign party.`, 'info');
      if (activeCharacterId === charId) {
        setActiveCharacterIdState('vesper');
        setActiveViewState('menu');
      }
    },
    [activeCharacterId, showToast]
  );

  const updateCustomCharacter = useCallback(
    (charId: string, updater: (prev: CharacterState) => CharacterState) => {
      setCustomCharactersState((prev) => {
        const existing = prev[charId];
        if (!existing) return prev;
        const updated = updater(existing);
        const next = { ...prev, [charId]: updated };
        customCharactersRef.current = next;
        try {
          localStorage.setItem(CUSTOM_CHARACTERS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        pushCharacterSync(charId, updated, Date.now());
        return next;
      });
    },
    []
  );

  const setCustomPortrait = useCallback((characterId: string, dataUrl: string | null) => {
    setCustomMediaState((prev) => {
      const next: CustomMedia = {
        ...prev,
        portraits: {
          ...prev.portraits,
          [characterId]: dataUrl || undefined,
        },
      };
      scheduleCustomMediaSave(next);
      return next;
    });
    showToast('Portrait Updated', `Updated custom portrait for ${characterId}`, 'power');
  }, [scheduleCustomMediaSave, showToast]);

  const setCustomBackground = useCallback((targetId: string, dataUrl: string | null) => {
    setCustomMediaState((prev) => {
      const next: CustomMedia = {
        ...prev,
        backgrounds: {
          ...prev.backgrounds,
          [targetId]: dataUrl || undefined,
        },
      };
      scheduleCustomMediaSave(next);
      return next;
    });
    showToast('Wallpaper Updated', `Updated background wallpaper for ${targetId}`, 'power');
  }, [scheduleCustomMediaSave, showToast]);

  const resetMedia = useCallback(() => {
    const next: CustomMedia = { portraits: {}, backgrounds: {} };
    setCustomMediaState(next);
    scheduleCustomMediaSave(next);
    showToast('Media Reset', 'Reset custom media to defaults', 'info');
  }, [scheduleCustomMediaSave, showToast]);

  const getPortraitUrl = useCallback((characterId: string) => {
    const custom = customMedia.portraits[characterId as keyof CustomMedia['portraits']];
    return custom || DEFAULT_PORTRAITS[characterId] || '/vesper-portrait.png';
  }, [customMedia.portraits]);

  const getBackgroundUrl = useCallback((targetId: string) => {
    const custom = customMedia.backgrounds[targetId as keyof CustomMedia['backgrounds']];
    return custom || DEFAULT_BACKGROUNDS[targetId] || '/images/cyrus-bg.jpg';
  }, [customMedia.backgrounds]);

  const openMediaPicker = useCallback((tab: 'portraits' | 'backgrounds' = 'portraits', targetCharacter?: string) => {
    setMediaPickerTab(tab);
    setMediaPickerTargetChar(targetCharacter);
    setIsMediaPickerOpen(true);
  }, []);

  const showToastNotification = useCallback((title: string, message: string, type: ToastType = 'info') => {
    showToast(title, message, type);
  }, [showToast]);

  const setActiveView = useCallback((view: ViewMode) => {
    setActiveViewState(view);
    localStorage.setItem(ACTIVE_VIEW_KEY, view);
  }, []);

  const setActiveCharacterId = useCallback((id: string) => {
    setActiveCharacterIdState(id);
    localStorage.setItem(ACTIVE_CHAR_KEY, id);
  }, []);

  const navigateToMenu = useCallback(() => {
    setActiveView('menu');
  }, [setActiveView]);

  const navigateToCharacter = useCallback((id: string) => {
    setActiveCharacterId(id);
    setActiveView('character');
  }, [setActiveCharacterId, setActiveView]);

  const navigateToDM = useCallback(() => {
    setActiveView('dm');
  }, [setActiveView]);

  // Earl's Auto-save with debounce & SQLite push
  const scheduleVesperSave = useCallback((state: CharacterState) => {
    vesperModifiedRef.current = Date.now();
    setSyncStatus('syncing');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      saveCharacterState(state);
      try {
        const res = await pushCharacterSync('vesper', state, vesperModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  // Aria's Auto-save with debounce & SQLite push
  const scheduleAriaSave = useCallback((state: AriaState) => {
    ariaModifiedRef.current = Date.now();
    setSyncStatus('syncing');
    if (ariaSaveTimerRef.current) clearTimeout(ariaSaveTimerRef.current);
    ariaSaveTimerRef.current = setTimeout(async () => {
      try {
        localStorage.setItem(ARIA_STORAGE_KEY, JSON.stringify(state));
      } catch {}
      try {
        const res = await pushCharacterSync('aria', state, ariaModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  // Cyrus's Auto-save with debounce & SQLite push
  const scheduleCyrusSave = useCallback((state: CyrusState) => {
    cyrusModifiedRef.current = Date.now();
    setSyncStatus('syncing');
    if (cyrusSaveTimerRef.current) clearTimeout(cyrusSaveTimerRef.current);
    cyrusSaveTimerRef.current = setTimeout(async () => {
      try {
        localStorage.setItem(CYRUS_STORAGE_KEY, JSON.stringify(state));
      } catch {}
      try {
        const res = await pushCharacterSync('cyrus', state, cyrusModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  const updateCharacter = useCallback((updater: (prev: CharacterState) => CharacterState) => {
    setCharacter((prev) => {
      const next = updater(prev);
      scheduleVesperSave(next);
      return next;
    });
  }, [scheduleVesperSave]);

  const updateAria = useCallback((updater: (prev: AriaState) => AriaState) => {
    setAria((prev) => {
      const next = updater(prev);
      scheduleAriaSave(next);
      return next;
    });
  }, [scheduleAriaSave]);

  const updateCyrus = useCallback((updater: (prev: CyrusState) => CyrusState) => {
    setCyrus((prev) => {
      const next = updater(prev);
      scheduleCyrusSave(next);
      return next;
    });
  }, [scheduleCyrusSave]);

  // Wyn'el's Auto-save with debounce & SQLite push
  const scheduleWynelSave = useCallback((state: WynelState) => {
    wynelModifiedRef.current = Date.now();
    setSyncStatus('syncing');
    if (wynelSaveTimerRef.current) clearTimeout(wynelSaveTimerRef.current);
    wynelSaveTimerRef.current = setTimeout(async () => {
      try {
        localStorage.setItem(WYNEL_STORAGE_KEY, JSON.stringify(state));
      } catch {}
      try {
        const res = await pushCharacterSync('wynel', state, wynelModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  const updateWynel = useCallback((updater: (prev: WynelState) => WynelState) => {
    setWynel((prev) => {
      const next = updater(prev);
      scheduleWynelSave(next);
      return next;
    });
  }, [scheduleWynelSave]);

  // Kastoriel's Auto-save with debounce & SQLite push
  const scheduleKastorielSave = useCallback((state: KastorielState) => {
    kastorielModifiedRef.current = Date.now();
    setSyncStatus('syncing');
    if (kastorielSaveTimerRef.current) clearTimeout(kastorielSaveTimerRef.current);
    kastorielSaveTimerRef.current = setTimeout(async () => {
      try {
        localStorage.setItem(KASTORIEL_STORAGE_KEY, JSON.stringify(state));
      } catch {}
      try {
        const res = await pushCharacterSync('kastoriel', state, kastorielModifiedRef.current);
        if (res?.success) {
          lastServerTimestampRef.current = Math.max(lastServerTimestampRef.current, res.timestamp);
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 400);
  }, []);

  const updateKastoriel = useCallback((updater: (prev: KastorielState) => KastorielState) => {
    setKastoriel((prev) => {
      const next = updater(prev);
      scheduleKastorielSave(next);
      return next;
    });
  }, [scheduleKastorielSave]);

  const toggleCharacterCondition = useCallback((charId: string, condition: string) => {
    if (charId === 'vesper') {
      updateCharacter((prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    } else if (charId === 'aria') {
      updateAria((prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    } else if (charId === 'cyrus') {
      updateCyrus((prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    } else if (charId === 'wynel') {
      updateWynel((prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    } else if (charId === 'kastoriel') {
      updateKastoriel((prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    } else {
      updateCustomCharacter(charId, (prev) => {
        const list = prev.combat?.conditions || [];
        const updated = list.includes(condition)
          ? list.filter((c) => c !== condition)
          : [...list, condition];
        return {
          ...prev,
          combat: {
            ...prev.combat,
            conditions: updated,
          },
        };
      });
    }
  }, [updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, updateCustomCharacter]);

  // Earl Actions
  const setLevel = useCallback((level: number) => {
    updateCharacter((prev) => recalculateForLevel(prev, level));
    showToast('Level Updated', `Vesper Ashwood is now Level ${level}! Stats recalculated.`, 'level');
  }, [updateCharacter, showToast]);

  const setCurrentHP = useCallback((hp: number) => {
    updateCharacter((prev) => ({ ...prev, combat: { ...prev.combat, currentHP: hp } }));
  }, [updateCharacter]);

  const setTempHP = useCallback((hp: number) => {
    updateCharacter((prev) => ({ ...prev, combat: { ...prev.combat, tempHP: hp } }));
  }, [updateCharacter]);

  const setSouls = useCallback((souls: number) => {
    updateCharacter((prev) => {
      const stage = getVestigeStage(prev.level);
      const maxSouls = getMaxSouls(stage);
      const clampedSouls = Math.max(0, Math.min(maxSouls, souls));
      const murmurs = isPhantomMurmursActive(clampedSouls, maxSouls);

      return {
        ...prev,
        orphansTithe: {
          ...prev.orphansTithe,
          currentSouls: clampedSouls,
          phantomMurmursActive: murmurs,
        },
        initiative: prev.abilityScores.DEX.modifier + (murmurs ? -2 : 0),
      };
    });
  }, [updateCharacter]);

  const longRest = useCallback(() => {
    updateCharacter((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        currentHP: prev.combat.maxHP,
        tempHP: 0,
        hitDice: { ...prev.combat.hitDice, used: Math.max(0, prev.combat.hitDice.used - Math.floor(prev.combat.hitDice.total / 2)) },
        deathSaves: { successes: 0, failures: 0 },
      },
    }));
    showToast('Long Rest Completed', 'Vesper restored HP to max. Souls decayed by 50%.', 'rest');
  }, [updateCharacter, showToast]);

  const setInventory = useCallback((items: InventoryItem[]) => {
    updateCharacter((prev) => ({ ...prev, inventory: items }));
  }, [updateCharacter]);

  const setCurrency = useCallback((currency: Currency) => {
    updateCharacter((prev) => ({ ...prev, currency }));
  }, [updateCharacter]);

  const setPlayerNotes = useCallback((notes: string) => {
    updateCharacter((prev) => ({
      ...prev,
      dossier: { ...prev.dossier, playerNotes: notes },
    }));
  }, [updateCharacter]);

  const setJournal = useCallback((entries: JournalEntry[]) => {
    updateCharacter((prev) => ({
      ...prev,
      dossier: { ...prev.dossier, journal: entries },
    }));
  }, [updateCharacter]);

  const setMysteries = useCallback((mysteries: CampaignMystery[]) => {
    updateCharacter((prev) => ({
      ...prev,
      dossier: { ...prev.dossier, mysteries },
    }));
  }, [updateCharacter]);

  // Extended Editable Actions
  const updateAbilityBaseScore = useCallback((ability: AbilityName, newBase: number) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => {
        const nextScores = { ...prev.abilityScores, [ability]: newBase };
        return calculateAriaStats({ ...prev, abilityScores: nextScores });
      });
      showToast('Ability Score Updated', `Aria's ${ability} set to ${newBase}`, 'level');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => {
        const nextScores = { ...prev.abilityScores, [ability]: newBase };
        return calculateCyrusStats({ ...prev, abilityScores: nextScores });
      });
      showToast('Ability Score Updated', `Cyrus's ${ability} set to ${newBase}`, 'level');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => {
        const nextScores = { ...prev.abilityScores, [ability]: newBase };
        return calculateWynelStats({ ...prev, abilityScores: nextScores });
      });
      showToast('Ability Score Updated', `Wyn'el's ${ability} set to ${newBase}`, 'level');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => {
        const nextScores = { ...prev.abilityScores, [ability]: newBase };
        return calculateKastorielStats({ ...prev, abilityScores: nextScores });
      });
      showToast('Ability Score Updated', `Kastoriel's ${ability} set to ${newBase}`, 'level');
    } else {
      updateCharacter((prev) => {
        const updatedScores = { ...prev.abilityScores };
        const current = updatedScores[ability];
        if (!current) return prev;
        const total = newBase;
        const modifier = Math.floor((total - 10) / 2);
        const saveBonus = modifier + (current.saveProficient ? prev.proficiencyBonus : 0);

        updatedScores[ability] = {
          ...current,
          base: newBase,
          total,
          modifier,
          saveBonus,
        };

        // Recalculate skill bonuses
        const updatedSkills = prev.skills.map((skill) => {
          if (skill.ability === ability) {
            let bonus = modifier;
            if (skill.expertise) bonus += prev.proficiencyBonus * 2;
            else if (skill.proficient) bonus += prev.proficiencyBonus;
            return { ...skill, bonus };
          }
          return skill;
        });

        return {
          ...prev,
          abilityScores: updatedScores,
          skills: updatedSkills,
        };
      });
      showToast('Ability Score Updated', `${ability} updated to ${newBase}`, 'level');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, showToast]);

  const toggleSkillProficiency = useCallback((skillName: import('@/lib/types').SkillName) => {
    const all18Skills: Array<{ name: import('@/lib/types').SkillName; ability: import('@/lib/types').AbilityName }> = [
      { name: 'Acrobatics', ability: 'DEX' },
      { name: 'Animal Handling', ability: 'WIS' },
      { name: 'Arcana', ability: 'INT' },
      { name: 'Athletics', ability: 'STR' },
      { name: 'Deception', ability: 'CHA' },
      { name: 'History', ability: 'INT' },
      { name: 'Insight', ability: 'WIS' },
      { name: 'Intimidation', ability: 'CHA' },
      { name: 'Investigation', ability: 'INT' },
      { name: 'Medicine', ability: 'WIS' },
      { name: 'Nature', ability: 'INT' },
      { name: 'Perception', ability: 'WIS' },
      { name: 'Performance', ability: 'CHA' },
      { name: 'Persuasion', ability: 'CHA' },
      { name: 'Religion', ability: 'INT' },
      { name: 'Sleight of Hand', ability: 'DEX' },
      { name: 'Stealth', ability: 'DEX' },
      { name: 'Survival', ability: 'WIS' },
    ];

    if (activeCharacterId === 'aria') {
      updateAria((prev) => {
        const existingMap = new Map((prev.skills || []).map((s) => [s.name, s]));
        const fullSkills = all18Skills.map((def) => {
          const existing = existingMap.get(def.name);
          if (existing) return existing;
          return {
            name: def.name,
            ability: def.ability,
            proficient: ['Arcana', 'History', 'Insight', 'Persuasion'].includes(def.name),
            expertise: def.name === 'Arcana',
            bonus: 0,
          };
        });
        const updatedSkills = fullSkills.map((s) => {
          if (s.name === skillName) {
            let proficient = s.proficient;
            let expertise = s.expertise;
            if (!proficient && !expertise) proficient = true;
            else if (proficient && !expertise) expertise = true;
            else { proficient = false; expertise = false; }
            return { ...s, proficient, expertise };
          }
          return s;
        });
        return { ...prev, skills: updatedSkills };
      });
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => {
        const existingMap = new Map((prev.skills || []).map((s) => [s.name, s]));
        const fullSkills = all18Skills.map((def) => {
          const existing = existingMap.get(def.name);
          if (existing) return existing;
          return {
            name: def.name,
            ability: def.ability,
            proficient: prev.skillProficiencies ? prev.skillProficiencies.includes(def.name) : ['Religion', 'Insight', 'Medicine', 'History'].includes(def.name),
            expertise: false,
            bonus: 0,
          };
        });
        const updatedSkills = fullSkills.map((s) => {
          if (s.name === skillName) {
            let proficient = s.proficient;
            let expertise = s.expertise;
            if (!proficient && !expertise) proficient = true;
            else if (proficient && !expertise) expertise = true;
            else { proficient = false; expertise = false; }
            return { ...s, proficient, expertise };
          }
          return s;
        });
        return { ...prev, skills: updatedSkills };
      });
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => {
        const has = prev.skillProficiencies.includes(skillName);
        const nextSkills = has
          ? prev.skillProficiencies.filter((s) => s !== skillName)
          : [...prev.skillProficiencies, skillName];
        return { ...prev, skillProficiencies: nextSkills };
      });
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => {
        const has = prev.skillProficiencies.includes(skillName);
        const nextSkills = has
          ? prev.skillProficiencies.filter((s) => s !== skillName)
          : [...prev.skillProficiencies, skillName];
        return calculateKastorielStats({ ...prev, skillProficiencies: nextSkills });
      });
    } else {
      updateCharacter((prev) => {
        const updatedSkills = prev.skills.map((s) => {
          if (s.name === skillName) {
            let proficient = s.proficient;
            let expertise = s.expertise;
            if (!proficient && !expertise) {
              proficient = true;
            } else if (proficient && !expertise) {
              expertise = true;
            } else {
              proficient = false;
              expertise = false;
            }

            const abilityMod = prev.abilityScores[s.ability]?.modifier || 0;
            let bonus = abilityMod;
            if (expertise) bonus += prev.proficiencyBonus * 2;
            else if (proficient) bonus += prev.proficiencyBonus;

            return { ...s, proficient, expertise, bonus };
          }
          return s;
        });

        return { ...prev, skills: updatedSkills };
      });
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel]);

  const setCombatOverrides = useCallback((overrides: Partial<import('@/lib/types').CombatOverrides>) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        overrides: { ...(prev.overrides || {}), ...overrides },
        combat: {
          ...prev.combat,
          ac: overrides.ac ?? prev.combat.ac,
          initiative: overrides.initiative ?? prev.combat.initiative,
          speed: overrides.speed ?? prev.combat.speed,
        },
      }));
      showToast('Stats Updated', "Aria's combat stats updated", 'info');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        overrides: { ...(prev.overrides || {}), ...overrides },
        combat: {
          ...prev.combat,
          ac: overrides.ac ?? prev.combat.ac,
          initiative: overrides.initiative ?? prev.combat.initiative,
          speed: overrides.speed ?? prev.combat.speed,
        },
      }));
      showToast('Stats Updated', "Cyrus's combat stats updated", 'info');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({
        ...prev,
        overrides: { ...(prev.overrides || {}), ...overrides },
        combat: {
          ...prev.combat,
          ac: overrides.ac ?? prev.combat.ac,
          initiative: overrides.initiative ?? prev.combat.initiative,
          speed: overrides.speed ?? prev.combat.speed,
        },
      }));
      showToast('Stats Updated', "Wyn'el's combat stats updated", 'info');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        overrides: { ...(prev.overrides || {}), ...overrides },
        combat: {
          ...prev.combat,
          ac: overrides.ac ?? prev.combat.ac,
          initiative: overrides.initiative ?? prev.combat.initiative,
          speed: overrides.speed ?? prev.combat.speed,
        },
      }));
      showToast('Stats Updated', "Kastoriel's combat stats updated", 'info');
    } else {
      updateCharacter((prev) => {
        const nextOverrides = { ...(prev.overrides || {}), ...overrides };
        const ac = nextOverrides.ac ?? prev.ac;
        const initiative = nextOverrides.initiative ?? prev.initiative;
        const speed = nextOverrides.speed ?? prev.speed;
        const proficiencyBonus = nextOverrides.proficiencyBonus ?? prev.proficiencyBonus;

        return {
          ...prev,
          overrides: nextOverrides,
          ac,
          initiative,
          speed,
          proficiencyBonus,
        };
      });
      showToast('Stats Updated', 'Combat stats updated', 'info');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, showToast]);

  const setClasses = useCallback((classes: import('@/lib/types').ClassLevel[]) => {
    const totalLevel = classes.reduce((sum, c) => sum + c.level, 0);
    const primary = classes[0];

    // Compute auto-injected features & proficiencies from the class config
    const injected = computeInjectedFeatures(classes);

    if (activeCharacterId === 'aria') {
      updateAria((prev) => {
        const base = calculateAriaStats({
          ...prev,
          level: totalLevel,
          characterClass: primary?.className || prev.characterClass,
          subclass: primary?.subclass || prev.subclass,
          classes,
        });
        const merged = mergeInjectedWithManual(
          base.feats || [],
          base.proficiencies || { armor: [], weapons: [], tools: [], languages: [] },
          injected
        );
        return { ...base, feats: merged.feats, proficiencies: merged.proficiencies };
      });
      showToast('Classes Updated', `Aria's Multiclass saved (Total Lv ${totalLevel}). Features auto-injected!`, 'level');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => {
        const base = calculateCyrusStats({
          ...prev,
          level: totalLevel,
          characterClass: primary?.className || prev.characterClass,
          subclass: primary?.subclass || prev.subclass,
          classes,
        });
        const merged = mergeInjectedWithManual(
          base.feats || [],
          base.proficiencies || { armor: [], weapons: [], tools: [], languages: [] },
          injected
        );
        return { ...base, feats: merged.feats, proficiencies: merged.proficiencies };
      });
      showToast('Classes Updated', `Cyrus's Multiclass saved (Total Lv ${totalLevel}). Features auto-injected!`, 'level');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => {
        const base = calculateWynelStats({
          ...prev,
          level: totalLevel,
          characterClass: primary?.className || prev.characterClass,
          subclass: primary?.subclass || prev.subclass,
          classes,
        });
        return base;
      });
      showToast('Classes Updated', `Wyn'el's Multiclass saved (Total Lv ${totalLevel}).`, 'level');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => {
        const base = calculateKastorielStats({
          ...prev,
          level: totalLevel,
          characterClass: primary?.className || prev.characterClass,
          subclass: primary?.subclass || prev.subclass,
          classes,
        });
        return base;
      });
      showToast('Classes Updated', `Kastoriel's Multiclass saved (Total Lv ${totalLevel}).`, 'level');
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => {
        const title = classes.map((c) => `${c.className} ${c.level}${c.subclass ? ` (${c.subclass})` : ''}`).join(' / ');
        const primaryClass = classes[0] || { className: prev.class || 'Fighter', subclass: prev.subclass || '', level: totalLevel, hitDice: 'd8' };

        const nextState = recalculateForLevel(
          {
            ...prev,
            class: primaryClass.className,
            subclass: primaryClass.subclass || '',
            classes,
          },
          totalLevel
        );

        const merged = mergeInjectedWithManual(
          nextState.feats || [],
          nextState.proficiencies || { armor: [], weapons: [], tools: [], languages: [] },
          injected
        );

        return {
          ...nextState,
          feats: merged.feats,
          proficiencies: merged.proficiencies,
          alias: title ? `Multiclass: ${title}` : prev.alias,
        };
      });
      showToast('Classes Updated', 'Multiclass saved. Features & proficiencies auto-injected!', 'level');
    } else {
      updateCharacter((prev) => {
        const title = classes.map((c) => `${c.className} ${c.level}${c.subclass ? ` (${c.subclass})` : ''}`).join(' / ');
        const primaryClass = classes[0] || { className: 'Rogue', subclass: 'Assassin', level: totalLevel, hitDice: 'd8' };

        const nextState = recalculateForLevel(
          {
            ...prev,
            class: primaryClass.className,
            subclass: primaryClass.subclass || '',
            classes,
          },
          totalLevel
        );

        const merged = mergeInjectedWithManual(
          nextState.feats || [],
          nextState.proficiencies || { armor: [], weapons: [], tools: [], languages: [] },
          injected
        );

        return {
          ...nextState,
          feats: merged.feats,
          proficiencies: merged.proficiencies,
          alias: title ? `Multiclass: ${title}` : prev.alias,
        };
      });
      showToast('Classes Updated', 'Multiclass saved. Features & proficiencies auto-injected!', 'level');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const addAttack = useCallback((attack: Omit<import('@/lib/types').AttackOption, 'id'>) => {
    const newAttack = { ...attack, id: (attack as any).id || `attack-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else {
      updateCharacter((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    }
    showToast('Attack Added', `${attack.name} added`, 'power');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const editAttack = useCallback((attack: import('@/lib/types').AttackOption) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)),
      }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)),
      }));
    }
    showToast('Attack Updated', `${attack.name} updated`, 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const deleteAttack = useCallback((id: string) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        attacks: (prev.attacks || []).filter((a) => a.id !== id),
      }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        attacks: (prev.attacks || []).filter((a) => a.id !== id),
      }));
    }
    showToast('Attack Removed', 'Attack option deleted', 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const addSpell = useCallback((spell: Omit<import('@/lib/types').CharacterSpellItem, 'id'>) => {
    const newSpell = { ...spell, id: (spell as any).id || `spell-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell as any],
        },
      }));
      showToast('Spell Added', `${spell.name} added to Aria's spellbook`, 'power');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell as any],
        },
      }));
      showToast('Spell Added', `${spell.name} added to Cyrus's spellbook`, 'power');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell as any],
        },
      }));
      showToast('Spell Added', `${spell.name} added to Wyn'el's grimoire`, 'power');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell as any],
        },
      }));
      showToast('Spell Added', `${spell.name} prepared for Kastoriel`, 'power');
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell],
        },
      }));
      showToast('Spell Added', `${spell.name} added to spellbook`, 'power');
    } else {
      updateCharacter((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell],
        },
      }));
      showToast('Spell Added', `${spell.name} added to spellbook`, 'power');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const editSpell = useCallback((spell: import('@/lib/types').CharacterSpellItem) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? (spell as any) : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? (spell as any) : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? ({ ...s, ...spell } as any) : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? ({ ...s, ...spell } as any) : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? spell : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    } else {
      updateCharacter((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).map((s) => (s.id === spell.id ? spell : s)),
        },
      }));
      showToast('Spell Updated', `${spell.name} updated`, 'info');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const deleteSpell = useCallback((id: string) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    } else {
      updateCharacter((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
        },
      }));
      showToast('Spell Removed', 'Spell deleted', 'info');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const useVesperSpellSlot = useCallback((level: number) => {
    updateCharacter((prev) => {
      const current = prev.spellcasting?.slots[level];
      if (!current || current.used >= current.max) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...current, used: current.used + 1 },
          },
        },
      };
    });
  }, [updateCharacter]);

  const restoreVesperSpellSlot = useCallback((level: number) => {
    updateCharacter((prev) => {
      const current = prev.spellcasting?.slots[level];
      if (!current || current.used <= 0) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...current, used: current.used - 1 },
          },
        },
      };
    });
  }, [updateCharacter]);

  const setVesperSpellSlotMax = useCallback((level: number, max: number) => {
    updateCharacter((prev) => {
      const current = prev.spellcasting?.slots[level] || { max: 0, used: 0 };
      const newMax = Math.max(0, Math.floor(max));
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: {
              ...current,
              max: newMax,
              used: Math.min(current.used, newMax),
            },
          },
        },
      };
    });
    showToast('Spell Slots Updated', `Level ${level} max slots set to ${max}`, 'info');
  }, [updateCharacter, showToast]);



  const addFeat = useCallback((feat: Omit<import('@/lib/types').CustomFeat, 'id'>) => {
    const newFeat = { ...feat, id: (feat as any).id || `feat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else {
      updateCharacter((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    }
    showToast('Feat/Trait Added', `${feat.title} added`, 'power');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const deleteFeat = useCallback((id: string) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        feats: (prev.feats || []).filter((f) => f.id !== id),
      }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        feats: (prev.feats || []).filter((f) => f.id !== id),
      }));
    }
    showToast('Feat Removed', 'Feat/trait removed', 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const updateProficiencies = useCallback((category: keyof import('@/lib/types').NonStatProficiencies, tags: string[]) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    } else if (activeCharacterId === 'wynel') {
      updateWynel((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, customCharacters, updateCustomCharacter]);


  // Aria Actions
  const setAriaLevel = useCallback((level: number) => {
    updateAria((prev) => calculateAriaStats({ ...prev, level }));
    showToast('Level Updated', `Aria Sil'aveth is now Level ${level}! Spell Save DC & Slots updated.`, 'level');
  }, [updateAria, showToast]);

  const setAriaHP = useCallback((hp: number) => {
    updateAria((prev) => ({
      ...prev,
      combat: { ...prev.combat, currentHP: Math.max(0, Math.min(prev.combat.maxHP, hp)) },
    }));
  }, [updateAria]);

  const setAriaTempHP = useCallback((hp: number) => {
    updateAria((prev) => ({
      ...prev,
      combat: { ...prev.combat, tempHP: Math.max(0, hp) },
    }));
  }, [updateAria]);

  const setAriaLunarPhase = useCallback((phase: LunarPhase) => {
    updateAria((prev) => ({
      ...prev,
      lunarEngine: { ...prev.lunarEngine, currentPhase: phase },
    }));
  }, [updateAria]);

  const setAriaSorceryPoints = useCallback((points: number) => {
    updateAria((prev) => ({
      ...prev,
      lunarEngine: {
        ...prev.lunarEngine,
        sorceryPointsCurrent: Math.max(0, Math.min(prev.lunarEngine.sorceryPointsMax, points)),
      },
    }));
  }, [updateAria]);

  const toggleAriaInnateSorcery = useCallback(() => {
    updateAria((prev) => {
      const active = !prev.lunarEngine.innateSorceryActive;
      const uses = active
        ? Math.max(0, prev.lunarEngine.innateSorceryUses - 1)
        : prev.lunarEngine.innateSorceryUses;
      return calculateAriaStats({
        ...prev,
        lunarEngine: {
          ...prev.lunarEngine,
          innateSorceryActive: active,
          innateSorceryUses: uses,
        },
      });
    });
  }, [updateAria]);

  const useAriaSpellSlot = useCallback((level: number) => {
    updateAria((prev) => {
      const currentSlots = prev.spellcasting.slots[level as 1 | 2 | 3 | 4 | 5];
      if (!currentSlots || currentSlots.used >= currentSlots.max) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used + 1 },
          },
        },
      };
    });
  }, [updateAria]);

  const restoreAriaSpellSlot = useCallback((level: number) => {
    updateAria((prev) => {
      const currentSlots = prev.spellcasting.slots[level as 1 | 2 | 3 | 4 | 5];
      if (!currentSlots || currentSlots.used <= 0) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used - 1 },
          },
        },
      };
    });
  }, [updateAria]);

  const setAriaSpellSlotMax = useCallback((level: number, max: number) => {
    updateAria((prev) => {
      const currentSlots = prev.spellcasting.slots[level as 1 | 2 | 3 | 4 | 5] || { max: 0, used: 0 };
      const newMax = Math.max(0, Math.floor(max));
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, max: newMax, used: Math.min(currentSlots.used, newMax) },
          },
        },
      };
    });
  }, [updateAria]);

  const ariaLongRest = useCallback(() => {
    updateAria((prev) => {
      const resetSlots = { ...prev.spellcasting.slots };
      for (const k in resetSlots) {
        const key = Number(k) as 1 | 2 | 3 | 4 | 5;
        resetSlots[key] = { ...resetSlots[key], used: 0 };
      }
      return {
        ...prev,
        combat: {
          ...prev.combat,
          currentHP: prev.combat.maxHP,
          tempHP: 0,
          deathSaves: { successes: 0, failures: 0 },
        },
        lunarEngine: {
          ...prev.lunarEngine,
          sorceryPointsCurrent: prev.lunarEngine.sorceryPointsMax,
          innateSorceryUses: prev.lunarEngine.innateSorceryMaxUses,
          innateSorceryActive: false,
        },
        spellcasting: {
          ...prev.spellcasting,
          slots: resetSlots,
        },
      };
    });
    showToast('Long Rest Completed', 'Aria restored HP to max. All spell slots & sorcery points recovered.', 'rest');
  }, [updateAria, showToast]);

  const setAriaInventory = useCallback((items: InventoryItem[]) => {
    updateAria((prev) => ({ ...prev, inventory: items }));
  }, [updateAria]);

  const setAriaCurrency = useCallback((currency: Currency) => {
    updateAria((prev) => ({ ...prev, currency }));
  }, [updateAria]);

  const setAriaNotes = useCallback((notes: string) => {
    updateAria((prev) => ({ ...prev, notes }));
  }, [updateAria]);

  const setAriaJournal = useCallback((journal: JournalEntry[]) => {
    updateAria((prev) => ({ ...prev, journal }));
  }, [updateAria]);

  const setAriaMysteries = useCallback((mysteries: CampaignMystery[]) => {
    updateAria((prev) => ({ ...prev, mysteries }));
  }, [updateAria]);

  // Cyrus Actions
  const setCyrusLevel = useCallback((level: number) => {
    updateCyrus((prev) => calculateCyrusStats({ ...prev, level }));
    showToast('Level Updated', `Cyrus Hyacinthus is now Level ${level}! Stats & slots recalculated.`, 'level');
  }, [updateCyrus, showToast]);

  const setCyrusHP = useCallback((hp: number) => {
    updateCyrus((prev) => ({
      ...prev,
      combat: { ...prev.combat, currentHP: Math.max(0, Math.min(prev.combat.maxHP, hp)) },
    }));
  }, [updateCyrus]);

  const setCyrusTempHP = useCallback((hp: number) => {
    updateCyrus((prev) => ({
      ...prev,
      combat: { ...prev.combat, tempHP: Math.max(0, hp) },
    }));
  }, [updateCyrus]);

  const useCyrusSpellSlot = useCallback((level: number) => {
    updateCyrus((prev) => {
      const currentSlots = prev.spellcasting.slots[level] || { max: 0, used: 0 };
      if (currentSlots.used >= currentSlots.max) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used + 1 },
          },
        },
      };
    });
  }, [updateCyrus]);

  const restoreCyrusSpellSlot = useCallback((level: number) => {
    updateCyrus((prev) => {
      const currentSlots = prev.spellcasting.slots[level] || { max: 0, used: 0 };
      if (currentSlots.used <= 0) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used - 1 },
          },
        },
      };
    });
  }, [updateCyrus]);

  const setCyrusSpellSlotMax = useCallback((level: number, max: number) => {
    updateCyrus((prev) => {
      const currentSlots = prev.spellcasting.slots[level] || { max: 0, used: 0 };
      const newMax = Math.max(0, Math.floor(max));
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, max: newMax, used: Math.min(currentSlots.used, newMax) },
          },
        },
      };
    });
  }, [updateCyrus]);

  const toggleCyrusRadiantSoul = useCallback(() => {
    updateCyrus((prev) => {
      const active = !prev.oracleEngine.radiantSoulActive;
      return {
        ...prev,
        oracleEngine: {
          ...prev.oracleEngine,
          radiantSoulActive: active,
          radiantSoulUsed: true,
        },
      };
    });
  }, [updateCyrus]);

  const useCyrusHealingHands = useCallback(() => {
    updateCyrus((prev) => ({
      ...prev,
      oracleEngine: {
        ...prev.oracleEngine,
        healingHandsUsed: true,
      },
    }));
  }, [updateCyrus]);

  const useCyrusEpiphany = useCallback(() => {
    updateCyrus((prev) => ({
      ...prev,
      oracleEngine: {
        ...prev.oracleEngine,
        epiphanyUsed: true,
      },
    }));
  }, [updateCyrus]);

  const cyrusLongRest = useCallback(() => {
    updateCyrus((prev) => {
      const resetSlots = { ...prev.spellcasting.slots };
      for (const k in resetSlots) {
        const key = Number(k) as 1 | 2;
        resetSlots[key] = { ...resetSlots[key], used: 0 };
      }
      return {
        ...prev,
        combat: {
          ...prev.combat,
          currentHP: prev.combat.maxHP,
          tempHP: 0,
          deathSaves: { successes: 0, failures: 0 },
        },
        oracleEngine: {
          ...prev.oracleEngine,
          healingHandsUsed: false,
          radiantSoulActive: false,
          radiantSoulUsed: false,
          epiphanyUsed: false,
        },
        spellcasting: {
          ...prev.spellcasting,
          slots: resetSlots,
        },
      };
    });
    showToast('Long Rest Completed', 'Cyrus restored HP to max. All spell slots & solar powers recovered.', 'rest');
  }, [updateCyrus, showToast]);

  const setCyrusInventory = useCallback((items: InventoryItem[]) => {
    updateCyrus((prev) => ({ ...prev, inventory: items }));
  }, [updateCyrus]);

  const setCyrusCurrency = useCallback((currency: Currency) => {
    updateCyrus((prev) => ({ ...prev, currency }));
  }, [updateCyrus]);

  const setCyrusNotes = useCallback((notes: string) => {
    updateCyrus((prev) => ({ ...prev, notes }));
  }, [updateCyrus]);

  const setCyrusJournal = useCallback((journal: JournalEntry[]) => {
    updateCyrus((prev) => ({ ...prev, journal }));
  }, [updateCyrus]);

  const setCyrusMysteries = useCallback((mysteries: CampaignMystery[]) => {
    updateCyrus((prev) => ({ ...prev, mysteries }));
  }, [updateCyrus]);

  // Wyn'el Actions
  const setWynelLevel = useCallback((level: number) => {
    updateWynel((prev) => calculateWynelStats({ ...prev, level }));
    showToast('Level Updated', `Wyn'el Aeluin is now Level ${level}! Stats & Pact magic updated.`, 'level');
  }, [updateWynel, showToast]);

  const setWynelHP = useCallback((hp: number) => {
    updateWynel((prev) => ({ ...prev, combat: { ...prev.combat, currentHP: hp } }));
  }, [updateWynel]);

  const setWynelTempHP = useCallback((hp: number) => {
    updateWynel((prev) => ({ ...prev, combat: { ...prev.combat, tempHP: hp } }));
  }, [updateWynel]);

  const useWynelPactSlot = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        slotsUsed: Math.min(prev.pactEngine.slotsMax, prev.pactEngine.slotsUsed + 1),
      },
    }));
  }, [updateWynel]);

  const restoreWynelPactSlot = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        slotsUsed: Math.max(0, prev.pactEngine.slotsUsed - 1),
      },
    }));
  }, [updateWynel]);

  const setWynelPactSlotMax = useCallback((max: number) => {
    updateWynel((prev) => {
      const newMax = Math.max(0, Math.floor(max));
      return {
        ...prev,
        pactEngine: {
          ...prev.pactEngine,
          slotsMax: newMax,
          slotsUsed: Math.min(prev.pactEngine.slotsUsed, newMax),
        },
      };
    });
    showToast('Pact Slots Updated', `Pact slot max set to ${max}`, 'info');
  }, [updateWynel, showToast]);

  const wynelShortRest = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        slotsUsed: 0,
        feyPresenceUsed: false,
        crimsonPulseUsed: false,
      },
    }));
    showToast('Short Rest Finished', "Wyn'el recovered all Pact Magic slots (2nd Level) and Fey Presence!", 'rest');
  }, [updateWynel, showToast]);

  const wynelLongRest = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        currentHP: prev.combat.maxHP,
        tempHP: 0,
        deathSaves: { successes: 0, failures: 0 },
      },
      pactEngine: {
        ...prev.pactEngine,
        slotsUsed: 0,
        feyPresenceUsed: false,
        crimsonPulseUsed: false,
        chaosAuraActive: false,
      },
    }));
    showToast('Long Rest Completed', "Wyn'el restored HP to max. All Pact Magic and chaos abilities refreshed.", 'rest');
  }, [updateWynel, showToast]);

  const toggleWynelFeyPresence = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        feyPresenceUsed: !prev.pactEngine.feyPresenceUsed,
      },
    }));
  }, [updateWynel]);

  const toggleWynelCrimsonPulse = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        crimsonPulseUsed: !prev.pactEngine.crimsonPulseUsed,
      },
    }));
  }, [updateWynel]);

  const toggleWynelChaosAura = useCallback(() => {
    updateWynel((prev) => ({
      ...prev,
      pactEngine: {
        ...prev.pactEngine,
        chaosAuraActive: !prev.pactEngine.chaosAuraActive,
      },
    }));
  }, [updateWynel]);

  const setWynelInventory = useCallback((items: InventoryItem[]) => {
    updateWynel((prev) => ({ ...prev, inventory: items }));
  }, [updateWynel]);

  const setWynelCurrency = useCallback((currency: Currency) => {
    updateWynel((prev) => ({ ...prev, currency }));
  }, [updateWynel]);

  const setWynelNotes = useCallback((notes: string) => {
    updateWynel((prev) => ({ ...prev, notes }));
  }, [updateWynel]);

  const setWynelJournal = useCallback((journal: JournalEntry[]) => {
    updateWynel((prev) => ({ ...prev, journal }));
  }, [updateWynel]);

  const setWynelMysteries = useCallback((mysteries: CampaignMystery[]) => {
    updateWynel((prev) => ({ ...prev, mysteries }));
  }, [updateWynel]);

  // Kastoriel Actions
  const setKastorielLevel = useCallback((level: number) => {
    updateKastoriel((prev) => calculateKastorielStats({ ...prev, level }));
    showToast('Level Updated', `Kastoriel is now Level ${level}! Starry form and spell slots updated.`, 'level');
  }, [updateKastoriel, showToast]);

  const setKastorielHP = useCallback((hp: number) => {
    updateKastoriel((prev) => ({ ...prev, combat: { ...prev.combat, currentHP: Math.max(0, Math.min(prev.combat.maxHP, hp)) } }));
  }, [updateKastoriel]);

  const setKastorielTempHP = useCallback((hp: number) => {
    updateKastoriel((prev) => ({ ...prev, combat: { ...prev.combat, tempHP: Math.max(0, hp) } }));
  }, [updateKastoriel]);

  const useKastorielSpellSlot = useCallback((level: number) => {
    updateKastoriel((prev) => {
      const currentSlots = prev.spellcasting.slots[level];
      if (!currentSlots || currentSlots.used >= currentSlots.max) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used + 1 },
          },
        },
      };
    });
  }, [updateKastoriel]);

  const restoreKastorielSpellSlot = useCallback((level: number) => {
    updateKastoriel((prev) => {
      const currentSlots = prev.spellcasting.slots[level];
      if (!currentSlots || currentSlots.used <= 0) return prev;
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, used: currentSlots.used - 1 },
          },
        },
      };
    });
  }, [updateKastoriel]);

  const setKastorielSpellSlotMax = useCallback((level: number, max: number) => {
    updateKastoriel((prev) => {
      const currentSlots = prev.spellcasting.slots[level] || { max: 0, used: 0 };
      const newMax = Math.max(0, Math.floor(max));
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: {
            ...prev.spellcasting.slots,
            [level]: { ...currentSlots, max: newMax, used: Math.min(currentSlots.used, newMax) },
          },
        },
      };
    });
  }, [updateKastoriel]);

  const useKastorielWildShape = useCallback(() => {
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        wildShapeUsed: Math.min(prev.starryEngine.wildShapeMax, prev.starryEngine.wildShapeUsed + 1),
      },
    }));
  }, [updateKastoriel]);

  const restoreKastorielWildShape = useCallback(() => {
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        wildShapeUsed: Math.max(0, prev.starryEngine.wildShapeUsed - 1),
      },
    }));
  }, [updateKastoriel]);

  const setKastorielStarryForm = useCallback((form: StarryConstellation) => {
    updateKastoriel((prev) => {
      const willBeActive = form !== 'none';
      let wildShapeUsed = prev.starryEngine.wildShapeUsed;
      if (willBeActive && prev.starryEngine.activeConstellation === 'none') {
        wildShapeUsed = Math.min(prev.starryEngine.wildShapeMax, wildShapeUsed + 1);
      }
      return calculateKastorielStats({
        ...prev,
        starryEngine: {
          ...prev.starryEngine,
          activeConstellation: form,
          starryFormActive: willBeActive,
          wildShapeUsed,
        },
      });
    });
    if (form !== 'none') {
      showToast('Starry Form Activated', `Kastoriel assumed the constellation of the ${form.toUpperCase()}!`, 'power');
    }
  }, [updateKastoriel, showToast]);

  const rollKastorielCosmicOmen = useCallback((dieRoll?: number) => {
    const roll = dieRoll !== undefined ? dieRoll : Math.floor(Math.random() * 6) + 1;
    const omen: CosmicOmen = roll % 2 === 0 ? 'weal' : 'woe';
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        cosmicOmen: omen,
        cosmicOmenRoll: roll,
        cosmicOmenUsesUsed: 0,
      },
    }));
    showToast('Cosmic Omen Rolled', `Rolled a ${roll}: ${omen.toUpperCase()}! (${omen === 'weal' ? 'Add 1d6 to a friend roll' : 'Subtract 1d6 from enemy roll'})`, 'info');
  }, [updateKastoriel, showToast]);

  const useKastorielCosmicOmen = useCallback(() => {
    updateKastoriel((prev) => {
      if (prev.starryEngine.cosmicOmenUsesUsed >= prev.starryEngine.cosmicOmenUsesMax) return prev;
      return {
        ...prev,
        starryEngine: {
          ...prev.starryEngine,
          cosmicOmenUsesUsed: prev.starryEngine.cosmicOmenUsesUsed + 1,
        },
      };
    });
  }, [updateKastoriel]);

  const useKastorielGuidingBolt = useCallback(() => {
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        freeGuidingBoltUsed: Math.min(prev.starryEngine.freeGuidingBoltMax, prev.starryEngine.freeGuidingBoltUsed + 1),
      },
    }));
  }, [updateKastoriel]);

  const restoreKastorielGuidingBolt = useCallback(() => {
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        freeGuidingBoltUsed: Math.max(0, prev.starryEngine.freeGuidingBoltUsed - 1),
      },
    }));
  }, [updateKastoriel]);

  const kastorielShortRest = useCallback(() => {
    updateKastoriel((prev) => ({
      ...prev,
      starryEngine: {
        ...prev.starryEngine,
        wildShapeUsed: 0,
        starryFormActive: false,
        activeConstellation: 'none',
      },
    }));
    showToast('Short Rest Finished', 'Kastoriel recovered both Wild Shape / Starry Form charges.', 'rest');
  }, [updateKastoriel, showToast]);

  const kastorielLongRest = useCallback(() => {
    updateKastoriel((prev) => {
      const resetSlots = { ...prev.spellcasting.slots };
      for (const k in resetSlots) {
        const key = Number(k);
        resetSlots[key] = { ...resetSlots[key], used: 0 };
      }
      return {
        ...prev,
        combat: {
          ...prev.combat,
          currentHP: prev.combat.maxHP,
          tempHP: 0,
          hitDice: { ...prev.combat.hitDice, used: Math.max(0, prev.combat.hitDice.used - Math.floor(prev.combat.hitDice.total / 2)) },
          deathSaves: { successes: 0, failures: 0 },
        },
        starryEngine: {
          ...prev.starryEngine,
          wildShapeUsed: 0,
          starryFormActive: false,
          activeConstellation: 'none',
          freeGuidingBoltsUsed: 0,
          cosmicOmen: null,
          cosmicOmenUsed: 0,
          cosmicOmenDieRoll: null,
        },
        spellcasting: {
          ...prev.spellcasting,
          slots: resetSlots,
        },
      };
    });
    showToast('Long Rest Completed', 'Kastoriel restored HP to max. Spell slots, Wild Shapes, and Free Guiding Bolts recovered.', 'rest');
  }, [updateKastoriel, showToast]);

  const setKastorielInventory = useCallback((items: InventoryItem[]) => {
    updateKastoriel((prev) => ({ ...prev, inventory: items }));
  }, [updateKastoriel]);

  const setKastorielCurrency = useCallback((currency: Currency) => {
    updateKastoriel((prev) => ({ ...prev, currency }));
  }, [updateKastoriel]);

  const setKastorielNotes = useCallback((notes: string) => {
    updateKastoriel((prev) => ({ ...prev, notes }));
  }, [updateKastoriel]);

  const setKastorielJournal = useCallback((journal: JournalEntry[]) => {
    updateKastoriel((prev) => ({ ...prev, journal }));
  }, [updateKastoriel]);

  const setKastorielMysteries = useCallback((mysteries: CampaignMystery[]) => {
    updateKastoriel((prev) => ({ ...prev, mysteries }));
  }, [updateKastoriel]);

  const setSpellSlots = useCallback((slots: Record<number, { max: number; used: number }>) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: { ...prev.spellcasting.slots, ...slots },
        },
      }));
      showToast('Spell Slots Updated', "Aria's spell slots updated", 'info');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: { ...prev.spellcasting.slots, ...slots },
        },
      }));
      showToast('Spell Slots Updated', "Cyrus's spell slots updated", 'info');
    } else if (activeCharacterId === 'wynel') {
      const slotLevel = wynel.pactEngine.slotLevel;
      const matchingSlot = slots[slotLevel];
      const newSlotsMax = matchingSlot ? matchingSlot.max : wynel.pactEngine.slotsMax;
      setWynelPactSlotMax(newSlotsMax);
      showToast('Pact Slots Updated', "Wyn'el's pact slots updated", 'info');
    } else if (activeCharacterId === 'kastoriel') {
      updateKastoriel((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots: { ...prev.spellcasting.slots, ...slots } as any,
        },
      }));
      showToast('Spell Slots Updated', "Kastoriel's spell slots updated", 'info');
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots,
        },
      }));
      showToast('Spell Slots Updated', 'Spell slots updated', 'info');
    } else {
      updateCharacter((prev) => ({
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          slots,
        },
      }));
      showToast('Spell Slots Updated', 'Spell slots updated', 'info');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, wynel, setWynelPactSlotMax, updateKastoriel, customCharacters, updateCustomCharacter, showToast]);

  const setSpellSlotMax = useCallback((level: number, max: number) => {
    const validMax = Math.max(0, Math.floor(max));
    if (activeCharacterId === 'aria') {
      setAriaSpellSlotMax(level, validMax);
    } else if (activeCharacterId === 'cyrus') {
      setCyrusSpellSlotMax(level, validMax);
    } else if (activeCharacterId === 'wynel') {
      setWynelPactSlotMax(validMax);
    } else if (activeCharacterId === 'kastoriel') {
      setKastorielSpellSlotMax(level, validMax);
    } else if (customCharacters[activeCharacterId]) {
      updateCustomCharacter(activeCharacterId, (prev) => {
        const current = prev.spellcasting?.slots?.[level] || { max: 0, used: 0 };
        return {
          ...prev,
          spellcasting: {
            ...prev.spellcasting,
            slots: {
              ...(prev.spellcasting?.slots || {}),
              [level]: { ...current, max: validMax, used: Math.min(current.used, validMax) },
            },
          },
        };
      });
      showToast('Spell Slots Updated', `Level ${level} max slots set to ${validMax}`, 'info');
    } else {
      setVesperSpellSlotMax(level, validMax);
    }
  }, [activeCharacterId, setAriaSpellSlotMax, setCyrusSpellSlotMax, setWynelPactSlotMax, setKastorielSpellSlotMax, customCharacters, updateCustomCharacter, setVesperSpellSlotMax, showToast]);

  // DM Multi-Note Campaign Chronicle Callbacks
  const addDMNote = useCallback((noteData: Omit<DMNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: DMNote = {
      ...noteData,
      id: `dm-note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dmNotesModifiedRef.current = Date.now();
    setDmNotesState((prev) => {
      const next = [newNote, ...prev];
      try {
        localStorage.setItem(DM_NOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('dm_notes', next).catch(() => {});
      return next;
    });
    showToast('Chronicle Entry Added', `Note "${newNote.title}" saved`, 'power');
  }, [showToast]);

  const updateDMNote = useCallback((id: string, updates: Partial<DMNote>) => {
    dmNotesModifiedRef.current = Date.now();
    setDmNotesState((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
      try {
        localStorage.setItem(DM_NOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('dm_notes', next).catch(() => {});
      return next;
    });
  }, []);

  const deleteDMNote = useCallback((id: string) => {
    dmNotesModifiedRef.current = Date.now();
    setDmNotesState((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(DM_NOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('dm_notes', next).catch(() => {});
      return next;
    });
    showToast('Note Deleted', 'Chronicle note removed', 'info');
  }, [showToast]);

  const toggleNoteVisibility = useCallback((id: string) => {
    dmNotesModifiedRef.current = Date.now();
    setDmNotesState((prev) => {
      const target = prev.find((n) => n.id === id);
      const newVis = target ? !target.isPlayerVisible : false;
      const next = prev.map((n) => (n.id === id ? { ...n, isPlayerVisible: newVis, updatedAt: Date.now() } : n));
      try {
        localStorage.setItem(DM_NOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('dm_notes', next).catch(() => {});
      showToast(
        newVis ? 'Shared to Player' : 'Concealed (DM Only)',
        newVis ? 'Note is now visible on player sheets' : 'Note is hidden from players',
        newVis ? 'power' : 'info'
      );
      return next;
    });
  }, [showToast]);

  const getNotesForCharacter = useCallback((characterId: string) => {
    const cleanTarget = characterId.toLowerCase();
    return dmNotes.filter(
      (n) => n.isPlayerVisible && (n.targetCharacterId === 'all' || n.targetCharacterId.toLowerCase() === cleanTarget)
    );
  }, [dmNotes]);

  // ----------------------------------------------------
  // Custom NPC Actions
  // ----------------------------------------------------
  const addCustomNPC = useCallback((npcData: Omit<CustomNPC, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNPC: CustomNPC = {
      ...npcData,
      id: `npc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    customNPCsModifiedRef.current = Date.now();
    setCustomNPCsState((prev) => {
      const next = [newNPC, ...prev];
      try {
        localStorage.setItem(CUSTOM_NPCS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('custom_npcs', next).catch(() => {});
      return next;
    });
    showToast('NPC Created', `${newNPC.name} added to Codex`, 'power');
    return newNPC;
  }, [showToast]);

  const updateCustomNPC = useCallback((id: string, updates: Partial<CustomNPC>) => {
    customNPCsModifiedRef.current = Date.now();
    setCustomNPCsState((prev) => {
      const next = prev.map((npc) => (npc.id === id ? { ...npc, ...updates, updatedAt: Date.now() } : npc));
      try {
        localStorage.setItem(CUSTOM_NPCS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('custom_npcs', next).catch(() => {});
      return next;
    });
  }, []);

  const deleteCustomNPC = useCallback((id: string) => {
    customNPCsModifiedRef.current = Date.now();
    setCustomNPCsState((prev) => {
      const next = prev.filter((npc) => npc.id !== id);
      try {
        localStorage.setItem(CUSTOM_NPCS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('custom_npcs', next).catch(() => {});
      return next;
    });
    showToast('NPC Removed', 'NPC deleted from Codex', 'info');
  }, [showToast]);

  const toggleNPCPlayerVisibility = useCallback((id: string) => {
    customNPCsModifiedRef.current = Date.now();
    setCustomNPCsState((prev) => {
      const target = prev.find((n) => n.id === id);
      const newVis = target ? !target.sharedWithPlayers : false;
      const next = prev.map((n) => (n.id === id ? { ...n, sharedWithPlayers: newVis, updatedAt: Date.now() } : n));
      try {
        localStorage.setItem(CUSTOM_NPCS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('custom_npcs', next).catch(() => {});
      showToast(
        newVis ? 'NPC Shared' : 'NPC Hidden',
        newVis ? 'NPC is now visible in player lore archive' : 'NPC is private to DM',
        newVis ? 'power' : 'info'
      );
      return next;
    });
  }, [showToast]);

  // ----------------------------------------------------
  // Campaign Shop Actions
  // ----------------------------------------------------
  const addShop = useCallback((shopData: Omit<CampaignShop, 'id'>) => {
    const newShop: CampaignShop = {
      ...shopData,
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = [...prev, newShop];
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
    showToast('Shop Opened', `${newShop.name} established in town`, 'power');
  }, [showToast]);

  const updateShop = useCallback((id: string, updates: Partial<CampaignShop>) => {
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = prev.map((shop) => (shop.id === id ? { ...shop, ...updates } : shop));
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
  }, []);

  const deleteShop = useCallback((id: string) => {
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = prev.filter((shop) => shop.id !== id);
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
    showToast('Shop Closed', 'Shop removed from marketplace', 'info');
  }, [showToast]);

  const addShopItem = useCallback((shopId: string, itemData: Omit<ShopItem, 'id'>) => {
    const newItem: ShopItem = {
      ...itemData,
      id: `shop-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = prev.map((shop) => {
        if (shop.id !== shopId) return shop;
        return { ...shop, items: [...shop.items, newItem] };
      });
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
    showToast('Item Stocked', `${newItem.name} added to catalog`, 'inventory');
  }, [showToast]);

  const updateShopItem = useCallback((shopId: string, itemId: string, updates: Partial<ShopItem>) => {
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = prev.map((shop) => {
        if (shop.id !== shopId) return shop;
        return {
          ...shop,
          items: shop.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it)),
        };
      });
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
  }, []);

  const deleteShopItem = useCallback((shopId: string, itemId: string) => {
    campaignShopsModifiedRef.current = Date.now();
    setCampaignShopsState((prev) => {
      const next = prev.map((shop) => {
        if (shop.id !== shopId) return shop;
        return { ...shop, items: shop.items.filter((it) => it.id !== itemId) };
      });
      try {
        localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      pushCampaignSync('campaign_shops', next).catch(() => {});
      return next;
    });
    showToast('Item Removed', 'Item removed from shop', 'info');
  }, [showToast]);

  // ----------------------------------------------------
  // Equipment Slot Management (BG3 Paperdoll)
  // ----------------------------------------------------
  const equipInventoryItem = useCallback((charId: string, itemId: string, slot?: EquipmentSlotId) => {
    const updateInv = (prevInv: InventoryItem[]) => {
      const target = prevInv.find((i) => i.id === itemId);
      if (!target) return prevInv;
      const targetSlot = slot || target.slot;

      return prevInv.map((i) => {
        if (i.id === itemId) {
          return { ...i, equipped: true, slot: targetSlot };
        }
        if (targetSlot && i.slot === targetSlot && i.equipped) {
          return { ...i, equipped: false };
        }
        return i;
      });
    };

    if (charId === 'vesper') {
      updateCharacter((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'aria') {
      updateAria((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'wynel') {
      updateWynel((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else {
      updateCustomCharacter(charId, (prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    }
  }, [updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, updateCustomCharacter]);

  const unequipInventoryItem = useCallback((charId: string, itemId: string) => {
    const updateInv = (prevInv: InventoryItem[]) => {
      return prevInv.map((i) => (i.id === itemId ? { ...i, equipped: false } : i));
    };

    if (charId === 'vesper') {
      updateCharacter((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'aria') {
      updateAria((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'wynel') {
      updateWynel((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else if (charId === 'kastoriel') {
      updateKastoriel((prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    } else {
      updateCustomCharacter(charId, (prev) => ({ ...prev, inventory: updateInv(prev.inventory) }));
    }
  }, [updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, updateCustomCharacter]);

  // ----------------------------------------------------
  // Marketplace Purchasing
  // ----------------------------------------------------
  const purchaseShopItem = useCallback((characterId: string, shopId: string, itemId: string) => {
    const shop = campaignShops.find((s) => s.id === shopId);
    if (!shop) return { success: false, message: 'Shop not found' };
    const item = shop.items.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in shop' };

    if (item.stock === 0) {
      showToast('Out of Stock', `${item.name} is currently sold out.`, 'info');
      return { success: false, message: 'Item out of stock' };
    }

    const finalPrice = Math.max(1, Math.round(item.price * (1 - shop.discountPercent / 100)));

    let currentCurrency: Currency;
    let setCurrFn: (c: Currency) => void;
    let addInvFn: (newItem: InventoryItem) => void;

    if (characterId === 'vesper') {
      currentCurrency = character.currency;
      setCurrFn = setCurrency;
      addInvFn = (ni) => updateCharacter((prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    } else if (characterId === 'aria') {
      currentCurrency = aria.currency;
      setCurrFn = setAriaCurrency;
      addInvFn = (ni) => updateAria((prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    } else if (characterId === 'cyrus') {
      currentCurrency = cyrus.currency;
      setCurrFn = setCyrusCurrency;
      addInvFn = (ni) => updateCyrus((prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    } else if (characterId === 'wynel') {
      currentCurrency = wynel.currency;
      setCurrFn = setWynelCurrency;
      addInvFn = (ni) => updateWynel((prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    } else if (characterId === 'kastoriel') {
      currentCurrency = kastoriel.currency;
      setCurrFn = setKastorielCurrency;
      addInvFn = (ni) => updateKastoriel((prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    } else {
      const customChar = customCharacters[characterId];
      if (!customChar) return { success: false, message: 'Character not found' };
      currentCurrency = customChar.currency;
      setCurrFn = (c) => updateCustomCharacter(characterId, (prev) => ({ ...prev, currency: c }));
      addInvFn = (ni) => updateCustomCharacter(characterId, (prev) => ({ ...prev, inventory: [ni, ...prev.inventory] }));
    }

    const totalGP = (currentCurrency.pp || 0) * 10 + (currentCurrency.gp || 0) + (currentCurrency.ep || 0) * 0.5 + (currentCurrency.sp || 0) * 0.1 + (currentCurrency.cp || 0) * 0.01;

    if (totalGP < finalPrice) {
      showToast('Insufficient Funds', `You need ${finalPrice} GP, but only have ${totalGP.toFixed(1)} GP equivalent.`, 'info');
      return { success: false, message: 'Insufficient funds' };
    }

    let rem = finalPrice;
    let newGP = currentCurrency.gp || 0;
    let newPP = currentCurrency.pp || 0;
    let newSP = currentCurrency.sp || 0;
    let newCP = currentCurrency.cp || 0;

    if (newGP >= rem) {
      newGP -= rem;
      rem = 0;
    } else {
      rem -= newGP;
      newGP = 0;
      const ppNeeded = Math.ceil(rem / 10);
      if (newPP >= ppNeeded) {
        newPP -= ppNeeded;
        const change = (ppNeeded * 10) - rem;
        newGP += change;
        rem = 0;
      }
    }

    setCurrFn({
      ...currentCurrency,
      gp: newGP,
      pp: newPP,
      sp: newSP,
      cp: newCP,
    });

    const newItem: InventoryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      quantity: 1,
      weight: item.weight,
      description: item.description + (item.effect ? ` (${item.effect})` : ''),
      equipped: false,
      category: item.category === 'potion' || item.category === 'scroll' ? 'consumable' : (item.category as any),
      rarity: item.rarity,
    };

    addInvFn(newItem);

    if (item.stock > 0) {
      setCampaignShopsState((prev) => {
        const next = prev.map((s) => {
          if (s.id !== shopId) return s;
          return {
            ...s,
            items: s.items.map((it) => (it.id === itemId ? { ...it, stock: it.stock - 1 } : it)),
          };
        });
        try {
          localStorage.setItem(CAMPAIGN_SHOPS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    showToast('Purchase Complete', `Purchased "${item.name}" for ${finalPrice} GP`, 'currency');
    return { success: true, message: `Purchased ${item.name} for ${finalPrice} GP` };
  }, [campaignShops, character, aria, cyrus, wynel, kastoriel, customCharacters, setCurrency, setAriaCurrency, setCyrusCurrency, setWynelCurrency, setKastorielCurrency, updateCharacter, updateAria, updateCyrus, updateWynel, updateKastoriel, updateCustomCharacter, showToast]);

  return (
    <CharacterContext.Provider
      value={{
        activeView,
        setActiveView,
        navigateToMenu,
        navigateToCharacter,
        navigateToDM,
        activeCharacterId,
        setActiveCharacterId,
        activeTab,
        setActiveTab,
        showToastNotification,
        customMedia,
        setCustomPortrait,
        setCustomBackground,
        resetMedia,
        getPortraitUrl,
        getBackgroundUrl,
        isMediaPickerOpen,
        setIsMediaPickerOpen,
        openMediaPicker,
        character,
        setLevel,
        setCurrentHP,
        setTempHP,
        setSouls,
        longRest,
        setInventory,
        setCurrency,
        setPlayerNotes,
        setJournal,
        setMysteries,
        updateAbilityBaseScore,
        toggleSkillProficiency,
        toggleCharacterCondition,
        setCombatOverrides,
        setClasses,
        addAttack,
        editAttack,
        deleteAttack,
        addSpell,
        editSpell,
        deleteSpell,
        useVesperSpellSlot,
        restoreVesperSpellSlot,
        setVesperSpellSlotMax,
        setSpellSlots,
        setSpellSlotMax,
        addFeat,
        deleteFeat,
        updateProficiencies,
        aria,
        setAriaLevel,
        setAriaHP,
        setAriaTempHP,
        setAriaLunarPhase,
        setAriaSorceryPoints,
        toggleAriaInnateSorcery,
        useAriaSpellSlot,
        restoreAriaSpellSlot,
        setAriaSpellSlotMax,
        ariaLongRest,
        setAriaInventory,
        setAriaCurrency,
        setAriaNotes,
        setAriaJournal,
        setAriaMysteries,
        cyrus,
        setCyrusLevel,
        setCyrusHP,
        setCyrusTempHP,
        useCyrusSpellSlot,
        restoreCyrusSpellSlot,
        setCyrusSpellSlotMax,
        toggleCyrusRadiantSoul,
        useCyrusHealingHands,
        useCyrusEpiphany,
        cyrusLongRest,
        setCyrusInventory,
        setCyrusCurrency,
        setCyrusNotes,
        setCyrusJournal,
        setCyrusMysteries,
        wynel,
        setWynelLevel,
        setWynelHP,
        setWynelTempHP,
        useWynelPactSlot,
        restoreWynelPactSlot,
        setWynelPactSlotMax,
        wynelShortRest,
        wynelLongRest,
        toggleWynelFeyPresence,
        toggleWynelCrimsonPulse,
        toggleWynelChaosAura,
        setWynelInventory,
        setWynelCurrency,
        setWynelNotes,
        setWynelJournal,
        setWynelMysteries,
        kastoriel,
        setKastorielLevel,
        setKastorielHP,
        setKastorielTempHP,
        useKastorielSpellSlot,
        restoreKastorielSpellSlot,
        setKastorielSpellSlotMax,
        useKastorielWildShape,
        restoreKastorielWildShape,
        setKastorielStarryForm,
        rollKastorielCosmicOmen,
        useKastorielCosmicOmen,
        useKastorielGuidingBolt,
        restoreKastorielGuidingBolt,
        kastorielShortRest,
        kastorielLongRest,
        setKastorielInventory,
        setKastorielCurrency,
        setKastorielNotes,
        setKastorielJournal,
        setKastorielMysteries,
        customMembers,
        setCustomMembers,
        customCharacters,
        customThemes,
        createCustomCharacter,
        deleteCustomCharacter,
        updateCustomCharacter,
        syncStatus,
        dbInfo,
        lastSyncedAt,
        forceSync,
        dmNotes,
        addDMNote,
        updateDMNote,
        deleteDMNote,
        toggleNoteVisibility,
        getNotesForCharacter,
        customNPCs,
        addCustomNPC,
        updateCustomNPC,
        deleteCustomNPC,
        toggleNPCPlayerVisibility,
        campaignShops,
        addShop,
        updateShop,
        deleteShop,
        addShopItem,
        updateShopItem,
        deleteShopItem,
        purchaseShopItem,
        equipInventoryItem,
        unequipInventoryItem,
        isLoaded,
      }}
    >
      {children}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        defaultTab={mediaPickerTab}
        targetCharacter={mediaPickerTargetChar}
      />
    </CharacterContext.Provider>
  );
}

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CharacterProviderContent>{children}</CharacterProviderContent>
    </ToastProvider>
  );
}
