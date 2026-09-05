'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CharacterState, InventoryItem, Currency, JournalEntry, CampaignMystery, TabId } from '@/lib/types';
import { createDefaultCharacterState, recalculateForLevel, saveCharacterState, loadCharacterState } from '@/lib/persistence';
import { isPhantomMurmursActive, getMaxSouls, getVestigeStage } from '@/lib/orphans-tithe';
import type { AriaState, LunarPhase } from '@/lib/aria-engine';
import { createDefaultAriaState, calculateAriaStats } from '@/lib/aria-engine';
import type { CyrusState } from '@/lib/cyrus-engine';
import { createDefaultCyrusState, calculateCyrusStats } from '@/lib/cyrus-engine';
import { ToastProvider, useToast, type ToastType } from '@/components/ui/ToastNotification';

import MediaPickerModal from '@/components/ui/MediaPickerModal';

const ARIA_STORAGE_KEY = 'dnd_char_aria';
const CYRUS_STORAGE_KEY = 'dnd_char_cyrus';
const ACTIVE_CHAR_KEY = 'dnd_active_character_id';
const ACTIVE_VIEW_KEY = 'dnd_active_view';
const CUSTOM_MEDIA_STORAGE_KEY = 'dnd_custom_media';

export type ViewMode = 'menu' | 'character';

export interface CustomMedia {
  portraits: {
    vesper?: string;
    aria?: string;
    cyrus?: string;
  };
  backgrounds: {
    vesper?: string;
    aria?: string;
    cyrus?: string;
    menu?: string;
  };
}

const DEFAULT_PORTRAITS: Record<string, string> = {
  vesper: '/vesper-portrait.png',
  aria: '/aria-portrait.png',
  cyrus: '/cyrus-portrait.png',
};

const DEFAULT_BACKGROUNDS: Record<string, string> = {
  vesper: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  aria: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  cyrus: '/images/cyrus-bg.jpg',
  menu: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
};

interface CharacterContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  navigateToMenu: () => void;
  navigateToCharacter: (id: string) => void;

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
  openMediaPicker: (defaultTab?: 'portraits' | 'backgrounds') => void;

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
  ariaLongRest: () => void;
  setAriaInventory: (items: InventoryItem[]) => void;
  setAriaCurrency: (currency: Currency) => void;
  setAriaNotes: (notes: string) => void;

  // Cyrus's state & actions
  cyrus: CyrusState;
  setCyrusLevel: (level: number) => void;
  setCyrusHP: (hp: number) => void;
  setCyrusTempHP: (hp: number) => void;
  useCyrusSpellSlot: (level: number) => void;
  restoreCyrusSpellSlot: (level: number) => void;
  toggleCyrusRadiantSoul: () => void;
  useCyrusHealingHands: () => void;
  useCyrusEpiphany: () => void;
  cyrusLongRest: () => void;
  setCyrusInventory: (items: InventoryItem[]) => void;
  setCyrusCurrency: (currency: Currency) => void;
  setCyrusNotes: (notes: string) => void;

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
  const [activeTab, setActiveTab] = useState<TabId>('character');
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ariaSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cyrusSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [customMedia, setCustomMediaState] = useState<CustomMedia>({
    portraits: {},
    backgrounds: {},
  });
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTab, setMediaPickerTab] = useState<'portraits' | 'backgrounds'>('portraits');

  // Hydration-safe load from localStorage
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

      const savedMediaRaw = localStorage.getItem(CUSTOM_MEDIA_STORAGE_KEY);
      if (savedMediaRaw) {
        setCustomMediaState(JSON.parse(savedMediaRaw));
      }
    } catch (err) {
      console.error('Error loading characters from localStorage:', err);
    }
    setIsLoaded(true);
  }, []);

  const saveCustomMedia = useCallback((next: CustomMedia) => {
    setCustomMediaState(next);
    try {
      localStorage.setItem(CUSTOM_MEDIA_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving custom media:', e);
    }
  }, []);

  const setCustomPortrait = useCallback((characterId: string, dataUrl: string | null) => {
    saveCustomMedia({
      ...customMedia,
      portraits: {
        ...customMedia.portraits,
        [characterId]: dataUrl || undefined,
      },
    });
    showToast('Portrait Updated', `Updated custom portrait for ${characterId}`, 'power');
  }, [customMedia, saveCustomMedia, showToast]);

  const setCustomBackground = useCallback((targetId: string, dataUrl: string | null) => {
    saveCustomMedia({
      ...customMedia,
      backgrounds: {
        ...customMedia.backgrounds,
        [targetId]: dataUrl || undefined,
      },
    });
    showToast('Wallpaper Updated', `Updated background wallpaper for ${targetId}`, 'power');
  }, [customMedia, saveCustomMedia, showToast]);

  const resetMedia = useCallback(() => {
    saveCustomMedia({ portraits: {}, backgrounds: {} });
    showToast('Media Reset', 'Reset custom media to defaults', 'info');
  }, [saveCustomMedia, showToast]);

  const getPortraitUrl = useCallback((characterId: string) => {
    const custom = customMedia.portraits[characterId as keyof CustomMedia['portraits']];
    return custom || DEFAULT_PORTRAITS[characterId] || '/vesper-portrait.png';
  }, [customMedia.portraits]);

  const getBackgroundUrl = useCallback((targetId: string) => {
    const custom = customMedia.backgrounds[targetId as keyof CustomMedia['backgrounds']];
    return custom || DEFAULT_BACKGROUNDS[targetId] || '/images/cyrus-bg.jpg';
  }, [customMedia.backgrounds]);

  const openMediaPicker = useCallback((tab: 'portraits' | 'backgrounds' = 'portraits') => {
    setMediaPickerTab(tab);
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

  // Earl's Auto-save with debounce
  const scheduleVesperSave = useCallback((state: CharacterState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCharacterState(state);
    }, 500);
  }, []);

  // Aria's Auto-save with debounce
  const scheduleAriaSave = useCallback((state: AriaState) => {
    if (ariaSaveTimerRef.current) clearTimeout(ariaSaveTimerRef.current);
    ariaSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(ARIA_STORAGE_KEY, JSON.stringify(state));
    }, 500);
  }, []);

  // Cyrus's Auto-save with debounce
  const scheduleCyrusSave = useCallback((state: CyrusState) => {
    if (cyrusSaveTimerRef.current) clearTimeout(cyrusSaveTimerRef.current);
    cyrusSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(CYRUS_STORAGE_KEY, JSON.stringify(state));
    }, 500);
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
      const currentSlots = prev.spellcasting.slots[level as 1 | 2];
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
  }, [updateCyrus]);

  const restoreCyrusSpellSlot = useCallback((level: number) => {
    updateCyrus((prev) => {
      const currentSlots = prev.spellcasting.slots[level as 1 | 2];
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

  return (
    <CharacterContext.Provider
      value={{
        activeView,
        setActiveView,
        navigateToMenu,
        navigateToCharacter,
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
        aria,
        setAriaLevel,
        setAriaHP,
        setAriaTempHP,
        setAriaLunarPhase,
        setAriaSorceryPoints,
        toggleAriaInnateSorcery,
        useAriaSpellSlot,
        restoreAriaSpellSlot,
        ariaLongRest,
        setAriaInventory,
        setAriaCurrency,
        setAriaNotes,
        cyrus,
        setCyrusLevel,
        setCyrusHP,
        setCyrusTempHP,
        useCyrusSpellSlot,
        restoreCyrusSpellSlot,
        toggleCyrusRadiantSoul,
        useCyrusHealingHands,
        useCyrusEpiphany,
        cyrusLongRest,
        setCyrusInventory,
        setCyrusCurrency,
        setCyrusNotes,
        isLoaded,
      }}
    >
      {children}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        defaultTab={mediaPickerTab}
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
