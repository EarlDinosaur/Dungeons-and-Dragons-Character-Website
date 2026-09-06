'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CharacterState, AbilityName, InventoryItem, Currency, JournalEntry, CampaignMystery, TabId } from '@/lib/types';
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

  // New Progression & Field Editability Actions
  updateAbilityBaseScore: (ability: AbilityName, newBase: number) => void;
  toggleSkillProficiency: (skillName: import('@/lib/types').SkillName) => void;
  setCombatOverrides: (overrides: Partial<import('@/lib/types').CombatOverrides>) => void;
  setClasses: (classes: import('@/lib/types').ClassLevel[]) => void;
  addAttack: (attack: Omit<import('@/lib/types').AttackOption, 'id'>) => void;
  editAttack: (attack: import('@/lib/types').AttackOption) => void;
  deleteAttack: (id: string) => void;
  addSpell: (spell: Omit<import('@/lib/types').CharacterSpellItem, 'id'>) => void;
  deleteSpell: (id: string) => void;
  useVesperSpellSlot: (level: number) => void;
  restoreVesperSpellSlot: (level: number) => void;
  setVesperSpellSlotMax: (level: number, max: number) => void;
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
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const toggleSkillProficiency = useCallback((skillName: import('@/lib/types').SkillName) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => {
        const currentSkills = prev.skills || [
          { name: 'Arcana', ability: 'INT', proficient: true, expertise: true, bonus: 13 },
          { name: 'History', ability: 'INT', proficient: true, expertise: false, bonus: 5 },
          { name: 'Insight', ability: 'WIS', proficient: true, expertise: false, bonus: 5 },
          { name: 'Persuasion', ability: 'CHA', proficient: true, expertise: false, bonus: 9 },
          { name: 'Perception', ability: 'WIS', proficient: false, expertise: false, bonus: 1 },
        ];
        const updatedSkills = currentSkills.map((s) => {
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
        const currentSkills = prev.skills || [
          { name: 'Religion', ability: 'INT', proficient: true, expertise: false, bonus: 3 },
          { name: 'Insight', ability: 'WIS', proficient: true, expertise: false, bonus: 5 },
          { name: 'Medicine', ability: 'WIS', proficient: true, expertise: false, bonus: 5 },
          { name: 'History', ability: 'INT', proficient: true, expertise: false, bonus: 3 },
          { name: 'Perception', ability: 'WIS', proficient: false, expertise: false, bonus: 3 },
        ];
        const updatedSkills = currentSkills.map((s) => {
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
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus]);

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
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const setClasses = useCallback((classes: import('@/lib/types').ClassLevel[]) => {
    const totalLevel = classes.reduce((sum, c) => sum + c.level, 0);
    const primary = classes[0];

    if (activeCharacterId === 'aria') {
      updateAria((prev) => calculateAriaStats({
        ...prev,
        level: totalLevel,
        characterClass: primary?.className || prev.characterClass,
        subclass: primary?.subclass || prev.subclass,
        classes,
      }));
      showToast('Classes Updated', `Aria's Multiclass saved (Total Lv ${totalLevel})`, 'level');
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => calculateCyrusStats({
        ...prev,
        level: totalLevel,
        characterClass: primary?.className || prev.characterClass,
        subclass: primary?.subclass || prev.subclass,
        classes,
      }));
      showToast('Classes Updated', `Cyrus's Multiclass saved (Total Lv ${totalLevel})`, 'level');
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

        return {
          ...nextState,
          alias: title ? `Multiclass: ${title}` : prev.alias,
        };
      });
      showToast('Classes Updated', 'Multiclass configuration saved', 'level');
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const addAttack = useCallback((attack: Omit<import('@/lib/types').AttackOption, 'id'>) => {
    const newAttack = { ...attack, id: `attack-${Date.now()}` };
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    } else {
      updateCharacter((prev) => ({ ...prev, attacks: [...(prev.attacks || []), newAttack] }));
    }
    showToast('Attack Added', `${attack.name} added`, 'power');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const editAttack = useCallback((attack: import('@/lib/types').AttackOption) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)) }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        attacks: (prev.attacks || []).map((a) => (a.id === attack.id ? attack : a)),
      }));
    }
    showToast('Attack Updated', `${attack.name} updated`, 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const deleteAttack = useCallback((id: string) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, attacks: (prev.attacks || []).filter((a) => a.id !== id) }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        attacks: (prev.attacks || []).filter((a) => a.id !== id),
      }));
    }
    showToast('Attack Removed', 'Attack option deleted', 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const addSpell = useCallback((spell: Omit<import('@/lib/types').CharacterSpellItem, 'id'>) => {
    updateCharacter((prev) => {
      const newSpell = { ...spell, id: `spell-${Date.now()}` };
      return {
        ...prev,
        spellcasting: {
          ...prev.spellcasting,
          spells: [...(prev.spellcasting?.spells || []), newSpell],
        },
      };
    });
    showToast('Spell Added', `${spell.name} added to spellbook`, 'power');
  }, [updateCharacter, showToast]);

  const deleteSpell = useCallback((id: string) => {
    updateCharacter((prev) => ({
      ...prev,
      spellcasting: {
        ...prev.spellcasting,
        spells: (prev.spellcasting?.spells || []).filter((s) => s.id !== id),
      },
    }));
    showToast('Spell Removed', 'Spell deleted', 'info');
  }, [updateCharacter, showToast]);

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
    showToastNotification('Spell Slots Updated', `Level ${level} max slots set to ${max}`, 'info');
  }, [updateCharacter, showToastNotification]);

  const addFeat = useCallback((feat: Omit<import('@/lib/types').CustomFeat, 'id'>) => {
    const newFeat = { ...feat, id: `feat-${Date.now()}` };
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    } else {
      updateCharacter((prev) => ({ ...prev, feats: [...(prev.feats || []), newFeat] }));
    }
    showToast('Feat/Trait Added', `${feat.title} added`, 'power');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

  const deleteFeat = useCallback((id: string) => {
    if (activeCharacterId === 'aria') {
      updateAria((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else if (activeCharacterId === 'cyrus') {
      updateCyrus((prev) => ({ ...prev, feats: (prev.feats || []).filter((f) => f.id !== id) }));
    } else {
      updateCharacter((prev) => ({
        ...prev,
        feats: (prev.feats || []).filter((f) => f.id !== id),
      }));
    }
    showToast('Feat Removed', 'Feat/trait removed', 'info');
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus, showToast]);

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
    } else {
      updateCharacter((prev) => ({
        ...prev,
        proficiencies: {
          ...(prev.proficiencies || { armor: [], weapons: [], tools: [], languages: [] }),
          [category]: tags,
        },
      }));
    }
  }, [activeCharacterId, updateCharacter, updateAria, updateCyrus]);


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

  const setCyrusSpellSlotMax = useCallback((level: number, max: number) => {
    updateCyrus((prev) => {
      const currentSlots = prev.spellcasting.slots[level as 1 | 2] || { max: 0, used: 0 };
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
        updateAbilityBaseScore,
        toggleSkillProficiency,
        setCombatOverrides,
        setClasses,
        addAttack,
        editAttack,
        deleteAttack,
        addSpell,
        deleteSpell,
        useVesperSpellSlot,
        restoreVesperSpellSlot,
        setVesperSpellSlotMax,
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
