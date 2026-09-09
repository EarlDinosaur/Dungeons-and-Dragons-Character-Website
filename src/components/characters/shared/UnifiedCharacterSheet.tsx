'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Swords,
  Heart,
  Wand2,
  Sparkles,
  RotateCcw,
  Moon,
  Sun,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  HelpCircle,
  Eye,
  Camera,
  Activity,
  Award,
  Zap,
  BookOpen,
  Info,
  Layers,
  Search,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Dices,
} from 'lucide-react';
import type {
  CharacterState,
  AbilityName,
  SkillName,
  AttackOption,
  TabId,
  InventoryItem,
  Currency,
  JournalEntry,
  CampaignMystery,
  ClassLevel,
  CharacterSpellItem,
} from '@/lib/types';
import { formatModifier, getModifier } from '@/lib/character-engine';
import {
  DND_CLASSES,
  getClassDefinition,
  calculateMulticlassSpellcasterLevel,
  getMulticlassSpellSlots,
} from '@/lib/class-database';
import {
  calculateACWithBreakdown,
  calculateInitiativeWithBreakdown,
  calculateSpellDCWithBreakdown,
  calculateSpellAttackWithBreakdown,
  calculatePassiveSenseWithBreakdown,
  calculateSavingThrowWithBreakdown,
  calculateSkillWithBreakdown,
  calculateSpeedWithBreakdown,
  calculateEncumbranceWithBreakdown,
  calculateHPBreakdown,
  type StatBreakdown,
} from '@/lib/calc-engine';
import { calculateConditionModifiers } from '@/lib/conditions-engine';
import ActiveConditionsBar from './ActiveConditionsBar';
import StatBreakdownModal from '@/components/ui/StatBreakdownModal';
import UnifiedDiceRollerModal, { type RollRequest } from '@/components/ui/UnifiedDiceRollerModal';
import InventoryManager from '@/components/shared/InventoryManager';
import ProgressionPanel from '@/components/characters/vesper/ProgressionPanel';
import Dossier from '@/components/characters/vesper/Dossier';
import PlayerChronicleView from './PlayerChronicleView';

interface UnifiedCharacterSheetProps {
  character: CharacterState;
  activeTab: TabId;
  primaryColor?: string;
  accentColor?: string;
  portraitUrl?: string;
  signatureTab?: {
    id: string;
    label: string;
    component: React.ReactNode;
  };
  onLevelChange?: (lvl: number) => void;
  onSaveClasses?: (classes: ClassLevel[]) => void;
  onHPChange?: (hp: number) => void;
  onTempHPChange?: (tempHp: number) => void;
  onShortRest?: () => void;
  onLongRest?: () => void;
  onInventoryChange?: (items: InventoryItem[]) => void;
  onCurrencyChange?: (curr: Currency) => void;
  onNotesChange?: (notes: string) => void;
  onJournalChange?: (journal: JournalEntry[]) => void;
  onMysteriesChange?: (mysteries: CampaignMystery[]) => void;
  onAbilityBaseScoreChange?: (ability: AbilityName, newBase: number) => void;
  onToggleSkillProficiency?: (skillName: SkillName) => void;
  onToggleCondition?: (conditionName: string) => void;
  onUseSpellSlot?: (level: number) => void;
  onRestoreSpellSlot?: (level: number) => void;
  onUpdateSpellSlots?: (slots: Record<number, { max: number; used: number }>) => void;
  onAddAttack?: (atk: Omit<AttackOption, 'id'>) => void;
  onEditAttack?: (atk: AttackOption) => void;
  onDeleteAttack?: (id: string) => void;
  onAddSpell?: (spell: CharacterSpellItem) => void;
  onEditSpell?: (spell: CharacterSpellItem) => void;
  onDeleteSpell?: (spellId: string) => void;
  onOpenMediaPicker?: () => void;
  onBackToMenu?: () => void;
}

export default function UnifiedCharacterSheet({
  character,
  activeTab,
  primaryColor = '#dc2626',
  accentColor = '#ffd700',
  portraitUrl,
  signatureTab,
  onLevelChange,
  onSaveClasses,
  onHPChange,
  onTempHPChange,
  onShortRest,
  onLongRest,
  onInventoryChange,
  onCurrencyChange,
  onNotesChange,
  onJournalChange,
  onMysteriesChange,
  onAbilityBaseScoreChange,
  onToggleSkillProficiency,
  onToggleCondition,
  onUseSpellSlot,
  onRestoreSpellSlot,
  onUpdateSpellSlots,
  onAddAttack,
  onEditAttack,
  onDeleteAttack,
  onAddSpell,
  onEditSpell,
  onDeleteSpell,
  onOpenMediaPicker,
  onBackToMenu,
}: UnifiedCharacterSheetProps) {
  // Stat Breakdown Modal State
  const [activeBreakdown, setActiveBreakdown] = useState<StatBreakdown | null>(null);

  // 5e Active Conditions & Mechanical Modifiers
  const conditionMods = useMemo(() => {
    return calculateConditionModifiers(character.combat?.conditions || []);
  }, [character.combat?.conditions]);

  // D20 Interactive Roller Modal State
  const [activeRoll, setActiveRoll] = useState<RollRequest | null>(null);
  const [activeRollKey, setActiveRollKey] = useState<number>(0);

  // HP Adjuster Inputs
  const [hpDelta, setHpDelta] = useState<string>('');

  // Multiclass & Level Manager Modal State
  const [isMulticlassModalOpen, setIsMulticlassModalOpen] = useState(false);
  const [draftClasses, setDraftClasses] = useState<ClassLevel[]>([]);

  const openMulticlassModal = () => {
    const initial =
      character.classes && character.classes.length > 0
        ? character.classes
        : [
          {
            className: character.class || 'Fighter',
            subclass: character.subclass || '',
            level: character.level || 1,
            hitDice: 'd8',
          },
        ];
    setDraftClasses([...initial]);
    setIsMulticlassModalOpen(true);
  };

  const handleSaveMulticlass = () => {
    if (draftClasses.length === 0) return;
    onSaveClasses?.(draftClasses);
    setIsMulticlassModalOpen(false);
  };

  const handleAddClass = () => {
    setDraftClasses([
      ...draftClasses,
      { className: 'Fighter', subclass: 'Champion', level: 1, hitDice: 'd10' },
    ]);
  };

  const handleUpdateClass = (index: number, field: keyof ClassLevel, value: string | number) => {
    const updated = [...draftClasses];
    const target = { ...updated[index] };

    if (field === 'className') {
      const def = getClassDefinition(value as string);
      target.className = def.name;
      target.hitDice = def.hitDie;
      target.subclass = def.subclasses[0] || '';
    } else if (field === 'level') {
      target.level = Math.max(1, Number(value));
    } else if (field === 'subclass') {
      target.subclass = value as string;
    } else if (field === 'hitDice') {
      target.hitDice = value as string;
    }

    updated[index] = target;
    setDraftClasses(updated);
  };

  const handleRemoveClass = (index: number) => {
    if (draftClasses.length <= 1) return;
    setDraftClasses(draftClasses.filter((_, i) => i !== index));
  };

  // Spellbook Search, Filter, and Add Modal
  const [spellSearchQuery, setSpellSearchQuery] = useState('');
  const [selectedSpellLevelFilter, setSelectedSpellLevelFilter] = useState<'all' | number>('all');
  const [expandedSpellIds, setExpandedSpellIds] = useState<Record<string, boolean>>({});
  const toggleSpellExpand = (id: string) => {
    setExpandedSpellIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [isAddSpellModalOpen, setIsAddSpellModalOpen] = useState(false);
  const [newSpellForm, setNewSpellForm] = useState<Omit<CharacterSpellItem, 'id'>>({
    name: '',
    level: 1,
    school: 'Evocation',
    castingTime: '1 Action',
    range: '60 ft',
    components: 'V, S',
    duration: 'Instantaneous',
    description: '',
    damageDice: '',
    prepared: true,
  });
  const [editingSpellId, setEditingSpellId] = useState<string | null>(null);

  // Helper to parse dice expressions like "2d8", "d6", "8d6 fire", "1d10 + 4 radiant"
  const parseDiceExpression = (text: string) => {
    if (!text || typeof text !== 'string') {
      return { count: 1, die: null, modifier: '', damageType: '' };
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return { count: 1, die: null, modifier: '', damageType: '' };
    }

    // Pattern: optional count, "d", die (4,6,8,10,12,20,100), optional +/- mod, optional damage type
    const regex = /^\s*(\d*)\s*d\s*(4|6|8|10|12|20|100)\s*(?:([+\-]\s*\d+))?\s*(.*)$/i;
    const match = trimmed.match(regex);

    if (match) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      const die = `d${match[2]}`.toLowerCase();
      const modifier = match[3] ? match[3].replace(/\s+/g, '') : '';
      const damageType = match[4] ? match[4].trim() : '';
      return { count: Math.max(1, count), die, modifier, damageType };
    }

    // Loose match anywhere in the string
    const looseMatch = trimmed.match(/(\d*)\s*d\s*(4|6|8|10|12|20|100)\b/i);
    if (looseMatch) {
      const count = looseMatch[1] ? parseInt(looseMatch[1], 10) : 1;
      const die = `d${looseMatch[2]}`.toLowerCase();
      const damageType = trimmed.replace(looseMatch[0], '').trim();
      return { count: Math.max(1, count), die, modifier: '', damageType };
    }

    return { count: 1, die: null, modifier: '', damageType: trimmed };
  };

  const detectedDice = useMemo(() => {
    return parseDiceExpression(newSpellForm.damageDice || '');
  }, [newSpellForm.damageDice]);

  const handleDiceSelect = (newDie: string | null, newCount?: number) => {
    const current = parseDiceExpression(newSpellForm.damageDice || '');
    const count = newCount !== undefined ? newCount : (current.count || 1);

    if (!newDie) {
      setNewSpellForm((prev) => ({ ...prev, damageDice: current.damageType }));
      return;
    }

    const modPart = current.modifier ? ` ${current.modifier}` : '';
    const dicePart = `${count}${newDie}${modPart}`;
    const full = current.damageType ? `${dicePart} ${current.damageType}` : dicePart;
    setNewSpellForm((prev) => ({ ...prev, damageDice: full }));
  };

  const handleDiceCountChange = (delta: number) => {
    const current = parseDiceExpression(newSpellForm.damageDice || '');
    const activeDie = current.die || 'd8';
    const newCount = Math.max(1, Math.min(50, (current.count || 1) + delta));
    const modPart = current.modifier ? ` ${current.modifier}` : '';
    const dicePart = `${newCount}${activeDie}${modPart}`;
    const full = current.damageType ? `${dicePart} ${current.damageType}` : dicePart;
    setNewSpellForm((prev) => ({ ...prev, damageDice: full }));
  };

  const handleDamageTypeSelect = (dmgType: string) => {
    const current = parseDiceExpression(newSpellForm.damageDice || '');
    const activeDie = current.die ? `${current.count}${current.die}` : '';
    const modPart = current.modifier ? ` ${current.modifier}` : '';
    const dicePart = activeDie ? `${activeDie}${modPart}` : '';
    const isSameType = current.damageType.toLowerCase() === dmgType.toLowerCase();

    // Toggle type or replace
    const targetType = isSameType ? '' : dmgType;
    const full = dicePart && targetType ? `${dicePart} ${targetType}` : dicePart || targetType;
    setNewSpellForm((prev) => ({ ...prev, damageDice: full }));
  };

  const handleOpenAddSpell = () => {
    setEditingSpellId(null);
    setNewSpellForm({
      name: '',
      level: selectedSpellLevelFilter === 'all' ? 1 : selectedSpellLevelFilter,
      school: 'Evocation',
      castingTime: '1 Action',
      range: '60 ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: '',
      damageDice: '',
      prepared: true,
    });
    setIsAddSpellModalOpen(true);
  };

  const handleOpenEditSpell = (spell: CharacterSpellItem) => {
    setEditingSpellId(spell.id);
    setNewSpellForm({
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Evocation',
      castingTime: spell.castingTime || '1 Action',
      range: spell.range || '60 ft',
      components: spell.components || 'V, S',
      duration: spell.duration || 'Instantaneous',
      description: spell.description || '',
      damageDice: spell.damageDice || '',
      prepared: spell.prepared ?? true,
    });
    setIsAddSpellModalOpen(true);
  };

  const hasSpells = useMemo(() => {
    return (
      (character.spellcasting?.spells && character.spellcasting.spells.length > 0) ||
      (character.spellcasting?.slots && Object.keys(character.spellcasting.slots).length > 0) ||
      ['Wizard', 'Sorcerer', 'Lunar Sorcerer', 'Cleric', 'Oracle', 'Druid', 'Bard', 'Warlock', 'Paladin', 'Ranger', 'Artificer'].includes(
        character.class
      ) ||
      (character.classes &&
        character.classes.some((c) =>
          ['Wizard', 'Sorcerer', 'Lunar Sorcerer', 'Cleric', 'Oracle', 'Druid', 'Bard', 'Warlock', 'Paladin', 'Ranger', 'Artificer'].includes(
            c.className
          )
        ))
    );
  }, [character]);

  // Edit Spell Slots Modal State & Handlers
  const [isEditSlotsModalOpen, setIsEditSlotsModalOpen] = useState(false);
  const [draftSlots, setDraftSlots] = useState<Record<number, { max: number; used: number }>>({});

  const openEditSlotsModal = () => {
    const existing = character.spellcasting?.slots || {};
    const initial: Record<number, { max: number; used: number }> = {};
    for (let i = 1; i <= 9; i++) {
      initial[i] = {
        max: existing[i]?.max || 0,
        used: Math.min(existing[i]?.used || 0, existing[i]?.max || 0),
      };
    }
    setDraftSlots(initial);
    setIsEditSlotsModalOpen(true);
  };

  const handleSaveSpellSlots = () => {
    const cleaned: Record<number, { max: number; used: number }> = {};
    for (const [k, v] of Object.entries(draftSlots)) {
      const lvl = parseInt(k, 10);
      const max = Math.max(0, Math.floor(v.max || 0));
      const used = Math.max(0, Math.min(max, Math.floor(v.used || 0)));
      if (max > 0) {
        cleaned[lvl] = { max, used };
      }
    }
    if (onUpdateSpellSlots) {
      onUpdateSpellSlots(cleaned);
    } else if (character.spellcasting) {
      character.spellcasting.slots = cleaned;
    }
    setIsEditSlotsModalOpen(false);
  };

  const handleResetSlotsToDefault = () => {
    const currentClasses = character.classes && character.classes.length > 0
      ? character.classes
      : [{ className: character.class || 'Fighter', subclass: character.subclass || '', level: character.level || 1, hitDice: 'd8' }];

    let defaultSlots: Record<number, { max: number; used: number }> = {};

    if (currentClasses.length === 1 && currentClasses[0].className.toLowerCase() === 'warlock') {
      const lvl = currentClasses[0].level;
      const pactSlotLevel = Math.min(5, Math.ceil(lvl / 2));
      const pactSlotCount = lvl >= 17 ? 4 : lvl >= 11 ? 3 : 2;
      defaultSlots = { [pactSlotLevel]: { max: pactSlotCount, used: 0 } };
    } else {
      const casterLvl = calculateMulticlassSpellcasterLevel(currentClasses);
      if (casterLvl > 0) {
        defaultSlots = getMulticlassSpellSlots(casterLvl);
      }
    }

    const next: Record<number, { max: number; used: number }> = {};
    for (let i = 1; i <= 9; i++) {
      next[i] = {
        max: defaultSlots[i]?.max || 0,
        used: 0,
      };
    }
    setDraftSlots(next);
  };

  const handleClearAllSlots = () => {
    const cleared: Record<number, { max: number; used: number }> = {};
    for (let i = 1; i <= 9; i++) {
      cleared[i] = { max: 0, used: 0 };
    }
    setDraftSlots(cleared);
  };

  const handleSlotMaxChange = (level: number, newMax: number) => {
    const val = Math.max(0, Math.min(20, Math.floor(newMax)));
    setDraftSlots((prev) => {
      const current = prev[level] || { max: 0, used: 0 };
      return {
        ...prev,
        [level]: {
          ...current,
          max: val,
          used: Math.min(current.used, val),
        },
      };
    });
  };

  const handleDeleteSpell = (spellId: string, spellName: string) => {
    if (window.confirm(`Are you sure you want to remove "${spellName}" from your spellbook?`)) {
      if (onDeleteSpell) {
        onDeleteSpell(spellId);
      } else if (character.spellcasting) {
        character.spellcasting.spells = (character.spellcasting.spells || []).filter((s) => s.id !== spellId);
      }
    }
  };

  // Editable Ability Scores Mode
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [draftScores, setDraftScores] = useState<Record<AbilityName, number>>({
    STR: character.abilityScores.STR.base,
    DEX: character.abilityScores.DEX.base,
    CON: character.abilityScores.CON.base,
    INT: character.abilityScores.INT.base,
    WIS: character.abilityScores.WIS.base,
    CHA: character.abilityScores.CHA.base,
  });

  // Attack Modal State
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [editingAttackId, setEditingAttackId] = useState<string | null>(null);
  const [attackForm, setAttackForm] = useState({
    name: '',
    attackBonus: 5,
    damage: '1d8 + 3',
    damageType: 'Slashing',
    range: 'Melee (5 ft)',
    notes: '',
  });

  // Calculations & Breakdowns
  const acBreakdown = useMemo(() => calculateACWithBreakdown(character), [character]);
  const initBreakdown = useMemo(() => calculateInitiativeWithBreakdown(character), [character]);
  const spellDCBreakdown = useMemo(() => calculateSpellDCWithBreakdown(character), [character]);
  const spellAtkBreakdown = useMemo(() => calculateSpellAttackWithBreakdown(character), [character]);
  const passivePerceptionBreakdown = useMemo(
    () => calculatePassiveSenseWithBreakdown(character, 'Perception'),
    [character]
  );
  const hpBreakdown = useMemo(() => calculateHPBreakdown(character), [character]);
  const speedBreakdown = useMemo(() => calculateSpeedWithBreakdown(character), [character]);
  const encumbrance = useMemo(() => calculateEncumbranceWithBreakdown(character), [character]);

  // HP Math Helpers
  const currentHP = character.combat.currentHP;
  const maxHP = character.combat.maxHP;
  const tempHP = character.combat.tempHP;
  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHP / Math.max(1, maxHP)) * 100)));

  const handleApplyDamage = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val <= 0 || !onHPChange) return;

    if (tempHP > 0) {
      if (val <= tempHP) {
        onTempHPChange?.(tempHP - val);
        setHpDelta('');
        return;
      } else {
        const remainder = val - tempHP;
        onTempHPChange?.(0);
        onHPChange(Math.max(0, currentHP - remainder));
        setHpDelta('');
        return;
      }
    }

    onHPChange(Math.max(0, currentHP - val));
    setHpDelta('');
  };

  const handleApplyHeal = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val <= 0 || !onHPChange) return;
    onHPChange(Math.min(maxHP, currentHP + val));
    setHpDelta('');
  };

  const handleApplyTempHP = () => {
    const val = parseInt(hpDelta, 10);
    if (isNaN(val) || val < 0 || !onTempHPChange) return;
    onTempHPChange(val);
    setHpDelta('');
  };

  const handleSaveScores = () => {
    if (onAbilityBaseScoreChange) {
      for (const [key, val] of Object.entries(draftScores) as [AbilityName, number][]) {
        if (val !== character.abilityScores[key].base) {
          onAbilityBaseScoreChange(key, val);
        }
      }
    }
    setIsEditingScores(false);
  };

  const rollCheck = (
    title: string,
    modifier: number,
    subtitle?: string,
    advantageMode: 'normal' | 'advantage' | 'disadvantage' = 'normal',
    advantageReason?: string,
    isAutoFail: boolean = false,
    damageDice?: string,
    rollType: 'check' | 'attack' | 'save' = 'check'
  ) => {
    setActiveRollKey((prev) => prev + 1);
    setActiveRoll({
      title,
      modifier,
      subtitle,
      rollType,
      advantageMode,
      advantageReason,
      isAutoFail,
      damageDice,
    });
  };

  const rollDamage = (title: string, damageDice: string, subtitle?: string) => {
    setActiveRollKey((prev) => prev + 1);
    setActiveRoll({
      title,
      subtitle,
      modifier: 0,
      rollType: 'damage',
      damageDice,
    });
  };

  const handleCastSpell = (spell: CharacterSpellItem) => {
    if (spell.level > 0 && onUseSpellSlot) {
      onUseSpellSlot(spell.level);
    }

    const desc = (spell.description || '').toLowerCase();
    const isSaveSpell =
      desc.includes('save') ||
      desc.includes('saving throw') ||
      desc.includes('dexterity') ||
      desc.includes('wisdom') ||
      desc.includes('constitution') ||
      desc.includes('strength') ||
      desc.includes('intelligence') ||
      desc.includes('charisma');

    const isAttackSpell =
      desc.includes('spell attack') ||
      desc.includes('ranged attack') ||
      desc.includes('melee attack') ||
      desc.includes('to hit') ||
      spell.name.toLowerCase().includes('blast') ||
      spell.name.toLowerCase().includes('bolt') ||
      spell.name.toLowerCase().includes('ray') ||
      spell.name.toLowerCase().includes('arrow');

    if (isAttackSpell) {
      rollCheck(
        `Cast ${spell.name}`,
        spellAtkBreakdown.total,
        spell.damageDice ? `Spell Attack Roll • Damage: ${spell.damageDice}` : 'Spell Attack Roll (To Hit)',
        'normal',
        undefined,
        false,
        spell.damageDice,
        'attack'
      );
    } else if (spell.damageDice) {
      const isHealing = desc.includes('heal') || spell.damageDice.toLowerCase().includes('healing');
      rollDamage(
        `Cast ${spell.name}`,
        spell.damageDice,
        isSaveSpell
          ? `Target DC ${spellDCBreakdown.total} Save • ${isHealing ? 'Healing' : 'Damage'} Roll`
          : `${isHealing ? 'Healing' : 'Damage'} Roll`
      );
    } else {
      rollCheck(
        `Cast ${spell.name}`,
        spellDCBreakdown.total,
        isSaveSpell
          ? `Spell Save DC: ${spellDCBreakdown.total} vs Target`
          : `Level ${spell.level === 0 ? 'Cantrip' : spell.level} • ${spell.school || 'General'} Spell`,
        'normal',
        undefined,
        false,
        undefined,
        'check'
      );
    }
  };

  const handleSaveAttack = () => {
    if (!attackForm.name.trim()) return;

    if (editingAttackId && onEditAttack) {
      onEditAttack({
        id: editingAttackId,
        name: attackForm.name,
        attackBonus: attackForm.attackBonus,
        damage: attackForm.damage,
        damageType: attackForm.damageType,
        range: attackForm.range,
        notes: attackForm.notes,
        equipped: true,
      });
    } else if (onAddAttack) {
      onAddAttack({
        name: attackForm.name,
        attackBonus: attackForm.attackBonus,
        damage: attackForm.damage,
        damageType: attackForm.damageType,
        range: attackForm.range,
        notes: attackForm.notes,
        equipped: true,
      });
    }

    setIsAttackModalOpen(false);
    setEditingAttackId(null);
  };

  // Conditions list
  const standardConditions = [
    'Blinded',
    'Charmed',
    'Deafened',
    'Frightened',
    'Grappled',
    'Incapacitated',
    'Invisible',
    'Paralyzed',
    'Petrified',
    'Poisoned',
    'Prone',
    'Restrained',
    'Stunned',
    'Unconscious',
  ];

  const toggleCondition = (cond: string) => {
    if (onToggleCondition) {
      onToggleCondition(cond);
    } else {
      const current = character.combat.conditions || [];
      const exists = current.includes(cond);
      const updated = exists ? current.filter((c) => c !== cond) : [...current, cond];
      character.combat.conditions = updated;
    }
  };

  return (
    <div
      className="space-y-6"
      style={
        {
          '--char-primary': primaryColor,
          '--char-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* 1. MASTER UNIFIED HERO HEADER */}
      <div className="rounded-2xl bg-[#0b0d14]/90 border border-[var(--char-primary,#dc2626)]/30 p-4 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: primaryColor }}
        />

        {onBackToMenu && (
          <div className="md:hidden relative z-10 mb-3">
            <button
              onClick={onBackToMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 text-xs font-mono font-medium transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft size={13} />
              <span>Guildhall</span>
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          {/* Avatar & Hero Identity */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={portraitUrl || '/vesper-portrait.png'}
                alt={character.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 shadow-lg transition-transform group-hover:scale-105"
                style={{ borderColor: accentColor }}
              />
              {onOpenMediaPicker && (
                <button
                  onClick={onOpenMediaPicker}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Change Portrait or Wallpaper"
                >
                  <Camera size={20} />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <button
                  onClick={openMulticlassModal}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs hover:brightness-125 transition-all cursor-pointer group"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}50`,
                    color: accentColor,
                  }}
                  title="Click to manage Level & Multiclassing"
                >
                  <Layers size={12} className="group-hover:rotate-12 transition-transform text-amber-400" />
                  <span>Level {character.level} {character.class}</span>
                  {character.subclass && (
                    <span className="font-serif italic font-normal text-zinc-300">
                      ({character.subclass})
                    </span>
                  )}
                  {character.classes && character.classes.length > 1 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[9px] font-bold">
                      +{character.classes.length - 1} Multi
                    </span>
                  )}
                  <Edit2 size={10} className="opacity-60 group-hover:opacity-100 ml-0.5" />
                </button>

                {onLevelChange && (!character.classes || character.classes.length <= 1) && (
                  <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-700/80 rounded-full px-1.5 py-0.5">
                    <button
                      onClick={() => onLevelChange(Math.max(1, character.level - 1))}
                      disabled={character.level <= 1}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Level Down (-1)"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono text-zinc-300 font-bold px-0.5">
                      Lv {character.level}
                    </span>
                    <button
                      onClick={() => onLevelChange(Math.min(20, character.level + 1))}
                      disabled={character.level >= 20}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Level Up (+1)"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-zinc-100 tracking-tight">
                {character.name}
              </h1>

              <p className="text-xs text-zinc-400 font-serif">
                {character.race} &bull; {character.background || 'Adventurer'} &bull;{' '}
                {character.alignment || 'Neutral'}
              </p>
            </div>
          </div>

          {/* Quick Resting & HP Vitality Controls */}
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3">
            {/* Rest Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap">
              {onShortRest && (
                <button
                  onClick={onShortRest}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs"
                  title="Short Rest: Spend hit dice and recharge short-rest abilities"
                >
                  <Moon size={14} />
                  <span>Short Rest</span>
                </button>
              )}

              {onLongRest && (
                <button
                  onClick={onLongRest}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-black font-mono font-bold text-xs transition-all cursor-pointer shadow-md hover:brightness-110"
                  style={{ backgroundColor: accentColor }}
                  title="Long Rest: Full HP recovery, spell slots restored, daily abilities recharged"
                >
                  <Sun size={14} />
                  <span>Long Rest</span>
                </button>
              )}
            </div>

            {/* Quick HP Bar & Adjuster */}
            <div className="w-full md:w-72 bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Heart size={13} className="text-red-500" />
                  <span>Hit Points</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">
                    {currentHP} <span className="text-zinc-500 text-xs">/ {maxHP}</span>
                  </span>
                  {tempHP > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-bold">
                      +{tempHP} Temp
                    </span>
                  )}
                  <button
                    onClick={() => setActiveBreakdown(hpBreakdown)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
                    title="Explain HP calculation"
                  >
                    <Info size={13} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-2 border border-zinc-800">
                <div
                  className={`h-full transition-all duration-500 ${hpPercent > 50
                      ? 'bg-emerald-500'
                      : hpPercent > 20
                        ? 'bg-amber-500'
                        : 'bg-red-600 animate-pulse'
                    }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Quick - / + Damage & Heal Buttons */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Amount"
                  value={hpDelta}
                  onChange={(e) => setHpDelta(e.target.value)}
                  className="w-16 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs text-center font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleApplyDamage}
                  className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Apply Damage"
                >
                  - Dmg
                </button>
                <button
                  onClick={handleApplyHeal}
                  className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Apply Healing"
                >
                  + Heal
                </button>
                <button
                  onClick={handleApplyTempHP}
                  className="px-1.5 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/60 text-[10px] font-mono transition-colors cursor-pointer"
                  title="Set Temp HP"
                >
                  Temp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CORE VITALS RIBBON (WITH TRANSPARENT MATH INSPECTORS) */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {/* AC */}
          <button
            onClick={() => setActiveBreakdown(acBreakdown)}
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Armor Class</span>
              <Info size={11} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span className="text-xl font-black font-mono text-white tracking-tight">
              {acBreakdown.total}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              {acBreakdown.formula}
            </span>
          </button>

          {/* Initiative */}
          <button
            onClick={() => rollCheck('Initiative Roll', initBreakdown.total, 'd20 + Initiative')}
            onContextMenu={(e) => {
              e.preventDefault();
              setActiveBreakdown(initBreakdown);
            }}
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center group cursor-pointer"
            title="Left-click to Roll, Right-click to Inspect Formula"
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Initiative</span>
              <Info
                size={11}
                className="text-zinc-500 group-hover:text-amber-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBreakdown(initBreakdown);
                }}
              />
            </span>
            <span className="text-xl font-black font-mono text-amber-300 tracking-tight">
              {initBreakdown.displayValue}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              Click to Roll
            </span>
          </button>

          {/* Speed */}
          <button
            onClick={() => setActiveBreakdown(speedBreakdown)}
            className={`p-2 rounded-xl border flex flex-col items-center transition-all group cursor-pointer ${
              conditionMods.isSpeedZero
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : 'bg-zinc-900/60 hover:bg-zinc-800/70 border-zinc-800 hover:border-zinc-700'
            }`}
            title={
              conditionMods.isSpeedZero
                ? `Speed reduced to 0 ft due to: ${conditionMods.speedZeroReasons.join(', ')}. Click for breakdown.`
                : 'Click to inspect speed calculation'
            }
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Speed</span>
              <Info size={11} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span
              className={`text-xl font-black font-mono tracking-tight ${
                conditionMods.isSpeedZero ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {conditionMods.isSpeedZero ? '0' : character.speed} ft
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              {conditionMods.isSpeedZero ? conditionMods.speedZeroReasons.join(', ') : 'Walking'}
            </span>
          </button>

          {/* Proficiency Bonus */}
          <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              Prof. Bonus
            </span>
            <span className="text-xl font-black font-mono text-white tracking-tight">
              +{character.proficiencyBonus}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">Lvl {character.level} Scale</span>
          </div>

          {/* Passive Perception */}
          <button
            onClick={() => setActiveBreakdown(passivePerceptionBreakdown)}
            className={`p-2 rounded-xl border transition-all flex flex-col items-center group cursor-pointer ${
              conditionMods.passivePerceptionPenalty > 0
                ? 'bg-amber-950/40 border-amber-800/80'
                : 'bg-zinc-900/60 hover:bg-zinc-800/70 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Pass. Percept.</span>
              <Info size={11} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span
              className={`text-xl font-black font-mono tracking-tight ${
                conditionMods.passivePerceptionPenalty > 0 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {Math.max(0, passivePerceptionBreakdown.total - conditionMods.passivePerceptionPenalty)}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              {conditionMods.passivePerceptionPenalty > 0 ? '-5 Blinded' : '10 + WIS + Prof'}
            </span>
          </button>

          {/* Spell Save DC */}
          <button
            onClick={() => setActiveBreakdown(spellDCBreakdown)}
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Spell DC</span>
              <Info size={11} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span className="text-xl font-black font-mono text-amber-300 tracking-tight">
              {spellDCBreakdown.total}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              {spellAtkBreakdown.displayValue} Atk Bonus
            </span>
          </button>
        </div>

        {/* 2.5 ACTIVE CONDITIONS & MECHANICAL IMPACTS BAR */}
        <div className="mt-4">
          <ActiveConditionsBar
            conditions={character.combat?.conditions || []}
            onToggleCondition={onToggleCondition}
          />
        </div>
      </div>

      {/* 3. ACTIVE TAB RENDERER */}
      <div className="animate-fade-in">
        {/* TAB 1: COMBAT & ACTIONS */}
        {activeTab === 'combat' && (
          <div className="space-y-6">
            {/* Attacks & Actions Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords size={20} className="text-amber-400" />
                <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                  Weapon Attacks & Cantrips
                </h2>
              </div>
              <button
                onClick={() => {
                  setEditingAttackId(null);
                  setAttackForm({
                    name: '',
                    attackBonus: character.proficiencyBonus + 3,
                    damage: '1d8 + 3',
                    damageType: 'Slashing',
                    range: 'Melee (5 ft)',
                    notes: '',
                  });
                  setIsAttackModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-colors cursor-pointer border border-zinc-700"
              >
                <Plus size={14} />
                <span>Add Attack</span>
              </button>
            </div>

            {/* Active Condition Combat Warning Banners */}
            {conditionMods.cannotTakeActions && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs font-mono text-red-200 flex items-center gap-2 mb-3 shadow-sm">
                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                <span>
                  <strong>INCAPACITATED ({conditionMods.actionLockoutReasons.join(', ')}):</strong> Cannot take actions or reactions! Any ongoing concentration is broken.
                </span>
              </div>
            )}

            {conditionMods.hasDisadvantageOnAttacks && !conditionMods.cannotTakeActions && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-xs font-mono text-amber-300 flex items-center gap-2 mb-3 shadow-sm">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span>
                  <strong>DISADVANTAGE ON ATTACKS:</strong> Active conditions impose disadvantage on your attack rolls ({conditionMods.attackDisadvantageReasons.join(', ')}).
                </span>
              </div>
            )}

            {/* Attack Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(character.attacks || []).map((atk) => (
                <div
                  key={atk.id}
                  className="p-4 rounded-xl bg-[#0e1017]/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>{atk.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-normal">
                          {atk.range}
                        </span>
                      </h3>
                      {atk.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5">{atk.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onDeleteAttack && (
                        <button
                          onClick={() => onDeleteAttack(atk.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* To-Hit & Damage Buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/60">
                    <button
                      onClick={() =>
                        rollCheck(
                          `${atk.name} (To-Hit)`,
                          atk.attackBonus,
                          conditionMods.hasDisadvantageOnAttacks
                            ? `d20 + ${atk.attackBonus} [DISADVANTAGE (${conditionMods.attackDisadvantageReasons.join(', ')})]`
                            : `d20 + ${atk.attackBonus} vs Target AC`,
                          conditionMods.hasDisadvantageOnAttacks ? 'disadvantage' : 'normal',
                          conditionMods.attackDisadvantageReasons.join(', '),
                          false,
                          `${atk.damage} ${atk.damageType}`,
                          'attack'
                        )
                      }
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        conditionMods.cannotTakeActions
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-60'
                          : conditionMods.hasDisadvantageOnAttacks
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900'
                          : 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300'
                      }`}
                    >
                      <span>To-Hit</span>
                      <span>{formatModifier(atk.attackBonus)}</span>
                      {conditionMods.hasDisadvantageOnAttacks && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900/80 text-amber-200">
                          Disadv
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        rollDamage(
                          `${atk.name} Damage`,
                          `${atk.damage} ${atk.damageType}`
                        )
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer border border-zinc-700/60"
                    >
                      <span>Damage</span>
                      <span className="font-bold text-amber-300">{atk.damage}</span>
                      <span className="text-[10px] text-zinc-400">({atk.damageType})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Combat Spellcasting & Slot Quick-Tracker */}
            {hasSpells && (
              <div className="p-4 rounded-xl bg-[#0e1017]/90 border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 size={18} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-zinc-100 font-[family-name:var(--font-heading)]">
                      Spell Slots &amp; Combat Quick-Casting
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span>
                      Save DC:{' '}
                      <strong className="text-amber-300">{spellDCBreakdown.total}</strong>
                    </span>
                    <span>
                      Spell Atk:{' '}
                      <strong className="text-amber-300">{spellAtkBreakdown.displayValue}</strong>
                    </span>
                  </div>
                </div>

                {/* Spell Slot Pips */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 pb-2 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.entries(character.spellcasting?.slots || {})
                      .filter(([_, slotData]) => slotData && slotData.max > 0)
                      .map(([lvlStr, slotData]) => {
                        const lvl = parseInt(lvlStr, 10);
                        const available = Math.max(0, slotData.max - slotData.used);
                        return (
                          <div
                            key={lvl}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono"
                          >
                            <span className="text-[10px] text-zinc-400 uppercase font-bold">
                              {character.class === 'Warlock' ? 'Pact' : `Lvl ${lvl}`}
                            </span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: slotData.max }).map((_, idx) => (
                                <span
                                  key={idx}
                                  onClick={() => {
                                    if (idx < available && onUseSpellSlot) onUseSpellSlot(lvl);
                                    else if (onRestoreSpellSlot) onRestoreSpellSlot(lvl);
                                  }}
                                  className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all ${idx < available
                                      ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                                      : 'bg-zinc-800 border-zinc-700'
                                    }`}
                                  title={idx < available ? 'Click to expend slot' : 'Click to restore slot'}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-400">
                              {available}/{slotData.max}
                            </span>
                          </div>
                        );
                      })}
                    {Object.values(character.spellcasting?.slots || {}).every((s) => !s || s.max === 0) && (
                      <span className="text-xs font-mono text-zinc-500">No spell slots active</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openEditSlotsModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-purple-300 border border-zinc-700/80 text-xs font-mono transition-colors cursor-pointer shadow-xs"
                    title="Edit Spell Slot Quantities"
                  >
                    <Edit2 size={11} />
                    <span>Edit Slots</span>
                  </button>
                </div>

                {/* Quick Cast Spells */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {(character.spellcasting?.spells || []).map((spell) => (
                    <div
                      key={spell.id}
                      className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/90 flex items-center justify-between gap-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{spell.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} &bull; {spell.castingTime}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCastSpell(spell)}
                        className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/60 text-[11px] font-mono font-bold shrink-0 cursor-pointer shadow-xs"
                      >
                        Cast
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Conditions Banner */}
            <div className="p-4 rounded-xl bg-[#0e1017]/90 border border-zinc-800">
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-bold block mb-2">
                Active Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {standardConditions.map((cond) => {
                  const isActive = (character.combat.conditions || []).includes(cond);
                  return (
                    <button
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer border ${isActive
                          ? 'bg-red-950 text-red-300 border-red-800 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATS & SKILLS */}
        {activeTab === 'character' && (
          <div className="space-y-6">
            {/* Ability Scores Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-zinc-100 flex items-center gap-2">
                <Shield size={18} className="text-amber-400" />
                <span>Ability Scores & Saving Throws</span>
              </h2>

              {isEditingScores ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveScores}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Save Scores</span>
                  </button>
                  <button
                    onClick={() => setIsEditingScores(false)}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDraftScores({
                      STR: character.abilityScores.STR.base,
                      DEX: character.abilityScores.DEX.base,
                      CON: character.abilityScores.CON.base,
                      INT: character.abilityScores.INT.base,
                      WIS: character.abilityScores.WIS.base,
                      CHA: character.abilityScores.CHA.base,
                    });
                    setIsEditingScores(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-mono cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit Base Scores</span>
                </button>
              )}
            </div>

            {/* 6 Core Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityName[]).map((ability) => {
                const stat = character.abilityScores[ability];
                const saveBreakdown = calculateSavingThrowWithBreakdown(character, ability);

                return (
                  <div
                    key={ability}
                    className="p-3 rounded-xl bg-[#0e1017]/90 border border-zinc-800 flex flex-col items-center text-center relative group"
                  >
                    <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-1">
                      {ability}
                    </span>

                    {/* Big Modifier (Clickable to roll Ability Check) */}
                    <button
                      onClick={() =>
                        rollCheck(
                          `${ability} Check`,
                          stat.modifier,
                          conditionMods.hasDisadvantageOnChecks
                            ? `d20 + ${stat.modifier} [DISADVANTAGE (${conditionMods.checkDisadvantageReasons.join(', ')})]`
                            : `d20 + ${stat.modifier}`,
                          conditionMods.hasDisadvantageOnChecks ? 'disadvantage' : 'normal',
                          conditionMods.checkDisadvantageReasons.join(', ')
                        )
                      }
                      className={`text-3xl font-black font-mono transition-colors cursor-pointer my-0.5 ${
                        conditionMods.hasDisadvantageOnChecks
                          ? 'text-amber-400'
                          : 'text-zinc-100 hover:text-amber-300'
                      }`}
                      title={
                        conditionMods.hasDisadvantageOnChecks
                          ? `Disadvantage on checks due to: ${conditionMods.checkDisadvantageReasons.join(', ')}`
                          : 'Click to roll Ability Check'
                      }
                    >
                      {formatModifier(stat.modifier)}
                    </button>

                    {/* Score / Edit Input */}
                    {isEditingScores ? (
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={draftScores[ability]}
                        onChange={(e) =>
                          setDraftScores((prev) => ({
                            ...prev,
                            [ability]: parseInt(e.target.value) || 10,
                          }))
                        }
                        className="w-12 text-center py-0.5 rounded bg-black/60 border border-zinc-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 mb-2"
                      />
                    ) : (
                      <span className="text-xs font-mono text-zinc-400 mb-2 font-semibold">
                        Score {stat.total || stat.base}
                      </span>
                    )}

                    {/* Saving Throw Button */}
                    <button
                      onClick={() => {
                        const isAutoFail = conditionMods.autoFailSaves.includes(ability as 'STR' | 'DEX');
                        const isDisadv = conditionMods.hasDisadvantageOnDEXSaves && ability === 'DEX';
                        rollCheck(
                          `${ability} Saving Throw`,
                          isAutoFail ? 0 : saveBreakdown.total,
                          isAutoFail
                            ? `AUTOMATIC FAILURE (${conditionMods.actionLockoutReasons.join(', ')})`
                            : isDisadv
                            ? `d20 + ${saveBreakdown.total} [DISADVANTAGE (Restrained)]`
                            : `d20 + ${saveBreakdown.total} (Save)`,
                          isDisadv ? 'disadvantage' : 'normal',
                          isDisadv ? 'Restrained' : isAutoFail ? conditionMods.actionLockoutReasons.join(', ') : undefined,
                          isAutoFail
                        );
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActiveBreakdown(saveBreakdown);
                      }}
                      className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-mono flex items-center justify-between border transition-all cursor-pointer ${
                        conditionMods.autoFailSaves.includes(ability as 'STR' | 'DEX')
                          ? 'bg-red-950/80 border-red-700 text-red-300 font-bold animate-pulse'
                          : conditionMods.hasDisadvantageOnDEXSaves && ability === 'DEX'
                          ? 'bg-amber-950/50 border-amber-600 text-amber-200'
                          : stat.saveProficient
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={
                        conditionMods.autoFailSaves.includes(ability as 'STR' | 'DEX')
                          ? 'Auto-fails saving throw due to active condition'
                          : 'Left-click to Roll Save, Right-click to Inspect Formula'
                      }
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            conditionMods.autoFailSaves.includes(ability as 'STR' | 'DEX')
                              ? 'bg-red-500'
                              : stat.saveProficient
                              ? 'bg-amber-400'
                              : 'bg-zinc-600'
                          }`}
                        />
                        <span>Save</span>
                      </span>
                      <span>
                        {conditionMods.autoFailSaves.includes(ability as 'STR' | 'DEX')
                          ? 'Auto-Fail'
                          : saveBreakdown.displayValue}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Skills Grid */}
            <div className="rounded-xl bg-[#0e1017]/90 border border-zinc-800 p-3 sm:p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 text-xs font-mono uppercase text-zinc-400 font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Skills &amp; Proficiencies</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-normal hidden sm:inline">
                  Tap dot to toggle proficiency &bull; Tap bonus to roll
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {(character.skills || []).map((sk) => {
                  const breakdown = calculateSkillWithBreakdown(character, sk.name);

                  return (
                    <div
                      key={sk.name}
                      className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/40 transition-colors flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => onToggleSkillProficiency?.(sk.name)}
                          className="cursor-pointer shrink-0"
                          title="Toggle Proficiency"
                        >
                          <span
                            className={`w-3 h-3 rounded-full inline-block ${
                              sk.expertise
                                ? 'bg-amber-400 ring-2 ring-amber-400/40'
                                : sk.proficient
                                ? 'bg-amber-400'
                                : 'bg-zinc-700'
                            }`}
                          />
                        </button>
                        <span className="font-medium text-zinc-200 truncate">{sk.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                          ({sk.ability})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveBreakdown(breakdown)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                          title="Inspect Skill Math"
                        >
                          <Info size={13} />
                        </button>

                        <button
                          onClick={() =>
                            rollCheck(
                              `${sk.name} (${sk.ability}) Check`,
                              breakdown.total,
                              conditionMods.hasDisadvantageOnChecks
                                ? `d20 + ${breakdown.total} [DISADVANTAGE (${conditionMods.checkDisadvantageReasons.join(', ')})]`
                                : `d20 + ${breakdown.total}`,
                              conditionMods.hasDisadvantageOnChecks ? 'disadvantage' : 'normal',
                              conditionMods.checkDisadvantageReasons.join(', ')
                            )
                          }
                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-amber-500 hover:text-black font-mono font-bold text-zinc-200 transition-colors cursor-pointer text-xs"
                        >
                          {breakdown.displayValue}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPELLS & MAGIC (MOBILE-OPTIMIZED) */}
        {activeTab === 'spells' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Spellcasting Header Banner */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0e1017]/95 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
              {/* Left: Info & DCs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-300 shadow-xs shrink-0">
                    <Wand2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                      Spellcasting
                    </h2>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {character.class || 'Caster'} Magic
                    </span>
                  </div>
                </div>

                {/* Vitals Badges (DC & Attack) */}
                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase block leading-none mb-0.5">Save DC</span>
                    <span className="font-bold text-amber-300">{spellDCBreakdown.total}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase block leading-none mb-0.5">Spell Atk</span>
                    <span className="font-bold text-purple-300">{spellAtkBreakdown.displayValue}</span>
                  </div>
                </div>
              </div>

              {/* Right: Slot Pips Strip & Edit Slots */}
              <div
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1 touch-pan-x overscroll-x-contain"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {Object.entries(character.spellcasting?.slots || {})
                  .filter(([_, slotData]) => slotData && slotData.max > 0)
                  .map(([lvlStr, slotData]) => {
                    const lvl = parseInt(lvlStr, 10);
                    const available = Math.max(0, slotData.max - slotData.used);

                    return (
                      <div
                        key={lvl}
                        className="flex flex-col items-center p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono shrink-0 min-w-[68px]"
                      >
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold mb-1">
                          {character.class === 'Warlock' ? 'Pact' : `Lvl ${lvl}`}
                        </span>
                        <div className="flex items-center gap-1.5 my-1">
                          {Array.from({ length: slotData.max }).map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (idx < available && onUseSpellSlot) {
                                  onUseSpellSlot(lvl);
                                } else if (onRestoreSpellSlot) {
                                  onRestoreSpellSlot(lvl);
                                }
                              }}
                              className={`w-4.5 h-4.5 rounded-full border cursor-pointer transition-all active:scale-90 ${
                                idx < available
                                  ? 'bg-purple-500 border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                                  : 'bg-zinc-950 border-zinc-700'
                              }`}
                              title={idx < available ? 'Tap to expend slot' : 'Tap to restore slot'}
                              aria-label={idx < available ? `Expend Level ${lvl} slot` : `Restore Level ${lvl} slot`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold">
                          {available} / {slotData.max}
                        </span>
                      </div>
                    );
                  })}

                <button
                  type="button"
                  onClick={openEditSlotsModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Configure Spell Slot Quantities"
                >
                  <Edit2 size={13} className="text-purple-400" />
                  <span className="whitespace-nowrap">Slots</span>
                </button>
              </div>
            </div>

            {/* Spell Filter & Search Toolbar */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={spellSearchQuery}
                    onChange={(e) => setSpellSearchQuery(e.target.value)}
                    placeholder="Search spells, schools..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0b0d14] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-500 shadow-inner"
                  />
                  {spellSearchQuery && (
                    <button
                      onClick={() => setSpellSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddSpell}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 text-xs font-mono font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <Plus size={14} />
                  <span>Add Spell</span>
                </button>
              </div>

              {/* Level Filter Horizontal Strip */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth py-1 text-xs font-mono touch-pan-x overscroll-x-contain"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {(['all', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((lvl) => {
                  const count = (character.spellcasting?.spells || []).filter(
                    (s) => lvl === 'all' || s.level === lvl
                  ).length;
                  if (lvl !== 'all' && lvl > 0 && count === 0) return null;

                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedSpellLevelFilter(lvl)}
                      className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        selectedSpellLevelFilter === lvl
                          ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {lvl === 'all' ? 'All Spells' : lvl === 0 ? 'Cantrips' : `Lvl ${lvl}`}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                          selectedSpellLevelFilter === lvl ? 'bg-purple-900/80 text-purple-200' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spells List */}
            {(() => {
              const allSpells = character.spellcasting?.spells || [];
              const filtered = allSpells.filter((s) => {
                if (selectedSpellLevelFilter !== 'all' && s.level !== selectedSpellLevelFilter) return false;
                if (spellSearchQuery.trim()) {
                  const q = spellSearchQuery.toLowerCase();
                  return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || (s.school && s.school.toLowerCase().includes(q));
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-8 rounded-xl bg-[#0e1017]/90 border border-zinc-800 text-center space-y-3">
                    <Wand2 size={28} className="mx-auto text-zinc-600" />
                    <p className="text-sm font-serif text-zinc-400">
                      {allSpells.length === 0
                        ? 'No spells found in this character’s spellbook.'
                        : 'No spells match the current filter or search criteria.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddSpell}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus size={14} /> Add First Spell
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-start">
                  {filtered.map((spell) => {
                    const isExpanded = !!expandedSpellIds[spell.id];
                    const hasAvailableSlot =
                      spell.level === 0 ||
                      (character.spellcasting?.slots?.[spell.level]?.used || 0) <
                        (character.spellcasting?.slots?.[spell.level]?.max || 0);

                    return (
                      <div
                        key={spell.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                          isExpanded
                            ? 'bg-[#10131e] border-purple-800/70 shadow-[0_4px_20px_rgba(168,85,247,0.15)]'
                            : 'bg-[#0e1017]/90 hover:bg-[#121520] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {/* CARD TOP ROW (Always Visible & Interactive) */}
                        <div
                          onClick={() => toggleSpellExpand(spell.id)}
                          className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          {/* Left: Name & Badges */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100 group-hover:text-purple-300 truncate">
                                {spell.name}
                              </h3>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                                spell.level === 0
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                              }`}>
                                {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                              </span>
                              {spell.school && (
                                <span className="text-[10px] text-zinc-400 font-mono hidden min-[360px]:inline">
                                  {spell.school}
                                </span>
                              )}
                              {spell.prepared && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                                  Prepared
                                </span>
                              )}
                            </div>

                            {/* Vitals Summary Strip (Wraps cleanly on mobile) */}
                            <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-[10px] sm:text-[11px] font-mono text-zinc-400">
                              {spell.castingTime && (
                                <span className="flex items-center gap-1 text-zinc-300">
                                  <Clock size={11} className="text-purple-400" />
                                  <span>{spell.castingTime}</span>
                                </span>
                              )}
                              {spell.range && (
                                <span className="text-zinc-400">&bull; {spell.range}</span>
                              )}
                              {spell.damageDice && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    rollDamage(`${spell.name} Damage`, spell.damageDice!);
                                  }}
                                  className="text-amber-300 hover:text-amber-100 font-bold bg-amber-950/60 hover:bg-amber-900/80 px-2 py-0.5 rounded-lg border border-amber-600/60 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                                  title={`Click to roll ${spell.damageDice} damage`}
                                >
                                  <Flame size={11} className="text-amber-400" />
                                  <span>{spell.damageDice}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right: Quick Cast Button & Expand Arrow */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCastSpell(spell);
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                                !hasAvailableSlot
                                  ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                  : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border-purple-700/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                              }`}
                              title={
                                !hasAvailableSlot
                                  ? `No Level ${spell.level} slots remaining (tap to roll anyway)`
                                  : `Cast ${spell.name}`
                              }
                            >
                              <Wand2 size={13} className={hasAvailableSlot ? 'text-purple-300' : 'text-zinc-500'} />
                              <span>{hasAvailableSlot ? 'Cast' : 'Cast (0)'}</span>
                            </button>

                            <button
                              type="button"
                              className="p-1.5 text-zinc-400 hover:text-white transition-transform"
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* EXPANDABLE DETAILS ACCORDION */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-800/80 space-y-3 animate-fade-in text-xs">
                            {/* Full Spell Description */}
                            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                              <p className="text-xs text-zinc-300 font-serif leading-relaxed whitespace-pre-line">
                                {spell.description || 'No detailed description provided for this spell.'}
                              </p>
                            </div>

                            {/* Spell Detailed Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                                <span className="text-[9px] text-zinc-500 uppercase block">School</span>
                                <span className="text-zinc-200 font-semibold">{spell.school || 'General'}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                                <span className="text-[9px] text-zinc-500 uppercase block">Components</span>
                                <span className="text-zinc-200 font-semibold">{spell.components || 'None'}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                                <span className="text-[9px] text-zinc-500 uppercase block">Duration</span>
                                <span className="text-zinc-200 font-semibold">{spell.duration || 'Instantaneous'}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                                <span className="text-[9px] text-zinc-500 uppercase block">Damage / Effect</span>
                                <span className="text-amber-400 font-bold">{spell.damageDice || 'Utility / Status'}</span>
                              </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-800/60">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSpell(spell)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                                >
                                  <Edit2 size={12} className="text-purple-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSpell(spell.id, spell.name)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-800 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>

                              {spell.level > 0 && (
                                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40">
                                  Expends Level {spell.level} Slot
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: INVENTORY & EQUIPMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Carrying Capacity Alert Bar */}
            <div className="p-3 rounded-xl bg-[#0e1017]/90 border border-zinc-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Carrying:</span>
                <span className="font-bold text-white">
                  {encumbrance.totalWeight} / {encumbrance.carryingCapacity} lbs
                </span>
                <span className={`text-[11px] ${encumbrance.statusColor}`}>
                  ({encumbrance.statusLabel})
                </span>
              </div>

              <button
                onClick={() => setActiveBreakdown(encumbrance.breakdown)}
                className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
                title="Inspect Encumbrance Rules"
              >
                <Info size={14} />
              </button>
            </div>

            {onInventoryChange && onCurrencyChange && (
              <InventoryManager
                character={character}
                onInventoryChange={onInventoryChange}
                onCurrencyChange={onCurrencyChange}
              />
            )}
          </div>
        )}

        {/* TAB 5: FEATURES & PROGRESSION */}
        {activeTab === 'progression' && (
          <ProgressionPanel character={character} />
        )}

        {/* TAB 6: SIGNATURE MECHANIC (ANCHORED PER CHARACTER) */}
        {activeTab === 'artifact' && (
          <div>
            {signatureTab ? (
              signatureTab.component
            ) : (
              <div className="p-6 rounded-xl bg-[#0e1017]/90 border border-zinc-800 text-center">
                <Sparkles size={32} className="text-amber-400 mx-auto mb-2" />
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100 mb-1">
                  Heroic Signature Powers
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  This hero channels unique capabilities and archetype specializations during combat.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DOSSIER & LORE */}
        {activeTab === 'dossier' && (
          <Dossier
            character={character}
            onNotesChange={onNotesChange || (() => { })}
            onJournalChange={onJournalChange || (() => { })}
            onMysteriesChange={onMysteriesChange || (() => { })}
          />
        )}

        {/* TAB 8: DM CHRONICLE & NOTES */}
        {activeTab === 'chronicle' && (
          <PlayerChronicleView
            characterId={character.id || character.name.toLowerCase()}
            characterName={character.name}
            primaryColor={primaryColor}
          />
        )}
      </div>

      {/* 4. MODALS & POPUPS */}
      <StatBreakdownModal
        breakdown={activeBreakdown}
        onClose={() => setActiveBreakdown(null)}
      />

      {activeRoll && (
        <UnifiedDiceRollerModal
          key={activeRollKey}
          roll={activeRoll}
          onClose={() => setActiveRoll(null)}
        />
      )}

      {/* Add / Edit Attack Modal */}
      {isAttackModalOpen && (
        <div
          onClick={() => setIsAttackModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0e1017] border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                {editingAttackId ? 'Edit Attack' : 'Add New Attack Option'}
              </h3>
              <button
                onClick={() => setIsAttackModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Weapon / Action Name *</label>
                <input
                  type="text"
                  value={attackForm.name}
                  onChange={(e) => setAttackForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Longsword or Fire Bolt"
                  className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Attack Bonus (+ To Hit)</label>
                  <input
                    type="number"
                    value={attackForm.attackBonus}
                    onChange={(e) =>
                      setAttackForm((prev) => ({ ...prev, attackBonus: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Damage Dice</label>
                  <input
                    type="text"
                    value={attackForm.damage}
                    onChange={(e) => setAttackForm((prev) => ({ ...prev, damage: e.target.value }))}
                    placeholder="e.g. 1d8 + 3"
                    className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Damage Type</label>
                  <input
                    type="text"
                    value={attackForm.damageType}
                    onChange={(e) => setAttackForm((prev) => ({ ...prev, damageType: e.target.value }))}
                    placeholder="e.g. Slashing, Force"
                    className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Range</label>
                  <input
                    type="text"
                    value={attackForm.range}
                    onChange={(e) => setAttackForm((prev) => ({ ...prev, range: e.target.value }))}
                    placeholder="e.g. Melee (5 ft) or 120 ft"
                    className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono mb-1">Properties &amp; Notes</label>
                <input
                  type="text"
                  value={attackForm.notes}
                  onChange={(e) => setAttackForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Finesse, Versatile (1d10)"
                  className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsAttackModalOpen(false)}
                className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttack}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold cursor-pointer"
              >
                Save Attack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTICLASSING & LEVEL MANAGER MODAL */}
      {isMulticlassModalOpen && (
        <div
          onClick={() => setIsMulticlassModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#0e1017] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-amber-400" />
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                  Level &amp; Multiclassing Manager
                </h3>
              </div>
              <button
                onClick={() => setIsMulticlassModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Configure class levels and multiclass archetypes. Hit dice, spellcasting caster levels, and proficiency bonus scale automatically.
            </p>

            {/* Class Rows */}
            <div className="space-y-3">
              {draftClasses.map((clsItem, idx) => {
                const classDef = getClassDefinition(clsItem.className);
                const subclasses = classDef.subclasses || [];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-amber-400">
                        Class #{idx + 1} {draftClasses.length > 1 && `(Hit Die: ${classDef.hitDie})`}
                      </span>
                      {draftClasses.length > 1 && (
                        <button
                          onClick={() => handleRemoveClass(idx)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Class Selection */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                          Class Name
                        </label>
                        <select
                          value={clsItem.className}
                          onChange={(e) => handleUpdateClass(idx, 'className', e.target.value)}
                          className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-white font-semibold focus:border-amber-400 cursor-pointer"
                        >
                          {Object.keys(DND_CLASSES).map((cName) => (
                            <option key={cName} value={cName}>
                              {cName} ({DND_CLASSES[cName].hitDie})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subclass Selection */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                          Subclass / Archetype
                        </label>
                        {subclasses.length > 0 ? (
                          <select
                            value={clsItem.subclass || ''}
                            onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-white focus:border-amber-400 cursor-pointer"
                          >
                            <option value="">None / Custom</option>
                            {subclasses.map((sc) => (
                              <option key={sc} value={sc}>
                                {sc}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={clsItem.subclass || ''}
                            onChange={(e) => handleUpdateClass(idx, 'subclass', e.target.value)}
                            placeholder="e.g. Archetype"
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-white focus:border-amber-400"
                          />
                        )}
                      </div>

                      {/* Level Input */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                          Class Level (1–20)
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateClass(idx, 'level', Math.max(1, clsItem.level - 1))}
                            className="w-7 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={clsItem.level}
                            onChange={(e) =>
                              handleUpdateClass(idx, 'level', Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))
                            }
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg p-1.5 text-white font-mono font-bold text-center focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateClass(idx, 'level', Math.min(20, clsItem.level + 1))}
                            className="w-7 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Class Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleAddClass}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
              >
                <Plus size={14} /> Add Multiclass Dip
              </button>

              <div className="text-right font-mono text-xs text-zinc-400">
                Total Level:{' '}
                <strong className="text-amber-300">
                  {draftClasses.reduce((sum, c) => sum + (c.level || 0), 0)}
                </strong>{' '}
                &bull; Prof:{' '}
                <strong className="text-white">
                  +{Math.ceil(draftClasses.reduce((sum, c) => sum + (c.level || 0), 0) / 4) + 1}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsMulticlassModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMulticlass}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={14} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM SPELL MODAL */}
      {isAddSpellModalOpen && (
        <div
          onClick={() => setIsAddSpellModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0e1017] border border-purple-900/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-purple-400" />
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                  {editingSpellId ? 'Edit Spell' : 'Add Spell to Spellbook'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSpellModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono mb-1 font-bold">Spell Name *</label>
                <input
                  type="text"
                  value={newSpellForm.name}
                  onChange={(e) => setNewSpellForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Misty Step or Guiding Bolt"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">Spell Level</label>
                  <select
                    value={newSpellForm.level}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, level: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white cursor-pointer"
                  >
                    <option value={0}>Cantrip (Level 0)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">School</label>
                  <select
                    value={newSpellForm.school}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, school: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white cursor-pointer"
                  >
                    {['Evocation', 'Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Illusion', 'Necromancy', 'Transmutation'].map((sc) => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">Casting Time</label>
                  <input
                    type="text"
                    value={newSpellForm.castingTime}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, castingTime: e.target.value }))}
                    placeholder="1 Action, Bonus Action..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">Range</label>
                  <input
                    type="text"
                    value={newSpellForm.range}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, range: e.target.value }))}
                    placeholder="Self, Touch, 60 ft..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">Components</label>
                  <input
                    type="text"
                    value={newSpellForm.components}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, components: e.target.value }))}
                    placeholder="V, S, M"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1 font-bold">Duration</label>
                  <input
                    type="text"
                    value={newSpellForm.duration}
                    onChange={(e) => setNewSpellForm((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="Instantaneous, 1 Min..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* DEDICATED DAMAGE / EFFECT DICE & AUTO-DETECTOR */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-3 shadow-inner">
                {/* Header row with auto-detection pill */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-zinc-200 font-mono font-bold flex items-center gap-1.5">
                    <Dices size={15} className="text-purple-400" />
                    <span>Damage / Effect Dice</span>
                  </label>

                  {detectedDice.die ? (
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-600/70 font-bold flex items-center gap-1 shadow-xs animate-fade-in">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>Auto-detected: <strong className="text-amber-300">{detectedDice.count}{detectedDice.die}</strong></span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">
                      Utility / No Dice
                    </span>
                  )}
                </div>

                {/* Die Type Selector Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Choose Die Type:</span>
                    {detectedDice.die && (
                      <button
                        type="button"
                        onClick={() => handleDiceSelect(null)}
                        className="text-zinc-400 hover:text-rose-400 text-[10px] cursor-pointer transition-colors"
                      >
                        Clear Die
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const).map((die) => {
                      const isSelected = detectedDice.die === die;
                      return (
                        <button
                          key={die}
                          type="button"
                          onClick={() => handleDiceSelect(die)}
                          className={`py-1.5 px-1 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border text-center active:scale-95 ${
                            isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-105'
                              : 'bg-zinc-900/90 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 hover:text-white'
                          }`}
                        >
                          {die}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleDiceSelect(null)}
                      className={`py-1.5 px-1 rounded-xl font-mono text-[10px] transition-all cursor-pointer border text-center ${
                        !detectedDice.die
                          ? 'bg-zinc-800 border-zinc-600 text-zinc-200 font-bold'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Utility or Non-Damaging Spell"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* Dice Count Stepper & Direct Expression Input */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center pt-1">
                  {/* Stepper for Quantity (Col 1-5) */}
                  <div className="sm:col-span-6 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">Quantity:</span>
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => handleDiceCountChange(-1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer text-sm active:scale-90 transition-all"
                        title="Decrease dice count"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-amber-300">
                        {detectedDice.count || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDiceCountChange(1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer text-sm active:scale-90 transition-all"
                        title="Increase dice count"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick quantity chips */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 8].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleDiceSelect(detectedDice.die || 'd8', q)}
                          className={`w-6 h-6 rounded-lg text-[10px] font-mono cursor-pointer transition-all border ${
                            detectedDice.count === q
                              ? 'bg-purple-900/90 border-purple-500 text-purple-200 font-bold shadow-xs'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Custom Expression Input (Col 6-12) */}
                  <div className="sm:col-span-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={newSpellForm.damageDice || ''}
                        onChange={(e) => setNewSpellForm((prev) => ({ ...prev, damageDice: e.target.value }))}
                        placeholder="e.g. 2d8 radiant, 8d6 fire"
                        className="w-full px-3 py-2 pr-8 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400 placeholder:text-zinc-600 shadow-inner"
                      />
                      {newSpellForm.damageDice && (
                        <button
                          type="button"
                          onClick={() => setNewSpellForm((prev) => ({ ...prev, damageDice: '' }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                          title="Clear expression"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Damage / Effect Type Pills */}
                <div className="space-y-1.5 pt-1 border-t border-purple-900/30">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Quick Damage / Effect Type:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'radiant',
                      'fire',
                      'necrotic',
                      'force',
                      'lightning',
                      'cold',
                      'psychic',
                      'thunder',
                      'healing',
                    ].map((dmg) => {
                      const isCurrent = (newSpellForm.damageDice || '').toLowerCase().includes(dmg);
                      return (
                        <button
                          key={dmg}
                          type="button"
                          onClick={() => handleDamageTypeSelect(dmg)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-amber-950/80 border-amber-600 text-amber-200 font-bold shadow-xs'
                              : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          }`}
                        >
                          {dmg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono mb-1 font-bold">Spell Description</label>
                <textarea
                  rows={3}
                  value={newSpellForm.description}
                  onChange={(e) => setNewSpellForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe spell effects, mechanics, saving throws..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white leading-relaxed resize-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsAddSpellModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newSpellForm.name.trim()) return;
                  if (editingSpellId) {
                    const updatedSpell: CharacterSpellItem = {
                      ...newSpellForm,
                      id: editingSpellId,
                    };
                    if (onEditSpell) {
                      onEditSpell(updatedSpell);
                    } else if (character.spellcasting) {
                      character.spellcasting.spells = (character.spellcasting.spells || []).map((s) =>
                        s.id === editingSpellId ? updatedSpell : s
                      );
                    }
                  } else {
                    const newSpell: CharacterSpellItem = {
                      ...newSpellForm,
                      id: `spell-${Date.now()}`,
                    };
                    if (onAddSpell) {
                      onAddSpell(newSpell);
                    } else if (character.spellcasting) {
                      character.spellcasting.spells = [...(character.spellcasting.spells || []), newSpell];
                    }
                  }
                  setIsAddSpellModalOpen(false);
                  setEditingSpellId(null);
                  setNewSpellForm({
                    name: '',
                    level: 1,
                    school: 'Evocation',
                    castingTime: '1 Action',
                    range: '60 ft',
                    components: 'V, S',
                    duration: 'Instantaneous',
                    description: '',
                    damageDice: '',
                    prepared: true,
                  });
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold cursor-pointer shadow-md"
              >
                {editingSpellId ? 'Update Spell' : 'Save Spell'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SPELL SLOTS MODAL */}
      {isEditSlotsModalOpen && (
        <div
          onClick={() => setIsEditSlotsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#0e1017] border border-purple-700/50 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 size={20} className="text-purple-400" />
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                  Manage Spell Slots
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSlotsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-zinc-400">
                Configure maximum available spell slots for each level (1st through 9th).
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSlotsToDefault}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 cursor-pointer"
                  title="Compute standard 5e slot progression from current class level"
                >
                  <RotateCcw size={11} /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-red-400 hover:text-red-300 cursor-pointer"
                  title="Clear all spell slots"
                >
                  <Trash2 size={11} /> Clear All
                </button>
              </div>
            </div>

            {/* Spell Slot Rows */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                const max = draftSlots[lvl]?.max || 0;
                const used = draftSlots[lvl]?.used || 0;
                const isPactSlot = character.class?.toLowerCase() === 'warlock' && lvl === Math.min(5, Math.ceil(character.level / 2));

                return (
                  <div
                    key={lvl}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      max > 0 ? 'bg-purple-950/20 border-purple-800/40' : 'bg-zinc-900/50 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          max > 0
                            ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {lvl}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-zinc-200">
                          Level {lvl} {isPactSlot && <span className="text-amber-400 text-[11px]">(Pact Slot)</span>}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {max === 0 ? (
                            <span className="text-[10px] text-zinc-500 font-mono">No slots</span>
                          ) : (
                            Array.from({ length: Math.min(max, 10) }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full border ${
                                  i < Math.max(0, max - used)
                                    ? 'bg-purple-500 border-purple-400'
                                    : 'bg-zinc-800 border-zinc-700'
                                }`}
                              />
                            ))
                          )}
                          {max > 10 && (
                            <span className="text-[10px] text-purple-300 font-mono font-bold">+{max - 10}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSlotMaxChange(lvl, preset)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                              max === preset
                                ? 'bg-purple-600 border-purple-400 text-white font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSlotMaxChange(lvl, Math.max(0, max - 1))}
                          className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer border border-zinc-700 text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={max}
                          onChange={(e) => handleSlotMaxChange(lvl, parseInt(e.target.value, 10) || 0)}
                          className="w-12 h-7 bg-black/60 border border-zinc-700 rounded text-center text-xs font-mono font-bold text-white focus:border-purple-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleSlotMaxChange(lvl, Math.min(20, max + 1))}
                          className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer border border-zinc-700 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditSlotsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSpellSlots}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={14} /> Save Slots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
