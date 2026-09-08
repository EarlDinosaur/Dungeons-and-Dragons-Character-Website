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
} from 'lucide-react';
import type { CharacterState, AbilityName, SkillName, AttackOption, TabId, InventoryItem, Currency, JournalEntry, CampaignMystery } from '@/lib/types';
import { formatModifier, getModifier } from '@/lib/character-engine';
import {
  calculateACWithBreakdown,
  calculateInitiativeWithBreakdown,
  calculateSpellDCWithBreakdown,
  calculateSpellAttackWithBreakdown,
  calculatePassiveSenseWithBreakdown,
  calculateSavingThrowWithBreakdown,
  calculateSkillWithBreakdown,
  calculateEncumbranceWithBreakdown,
  calculateHPBreakdown,
  type StatBreakdown,
} from '@/lib/calc-engine';
import StatBreakdownModal from '@/components/ui/StatBreakdownModal';
import UnifiedDiceRollerModal, { type RollRequest } from '@/components/ui/UnifiedDiceRollerModal';
import InventoryManager from '@/components/shared/InventoryManager';
import ProgressionPanel from '@/components/characters/vesper/ProgressionPanel';
import Dossier from '@/components/characters/vesper/Dossier';

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
  onUseSpellSlot?: (level: number) => void;
  onRestoreSpellSlot?: (level: number) => void;
  onAddAttack?: (atk: Omit<AttackOption, 'id'>) => void;
  onEditAttack?: (atk: AttackOption) => void;
  onDeleteAttack?: (id: string) => void;
  onOpenMediaPicker?: () => void;
}

export default function UnifiedCharacterSheet({
  character,
  activeTab,
  primaryColor = '#dc2626',
  accentColor = '#ffd700',
  portraitUrl,
  signatureTab,
  onLevelChange,
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
  onUseSpellSlot,
  onRestoreSpellSlot,
  onAddAttack,
  onEditAttack,
  onDeleteAttack,
  onOpenMediaPicker,
}: UnifiedCharacterSheetProps) {
  // Stat Breakdown Modal State
  const [activeBreakdown, setActiveBreakdown] = useState<StatBreakdown | null>(null);

  // D20 Interactive Roller Modal State
  const [activeRoll, setActiveRoll] = useState<RollRequest | null>(null);

  // HP Adjuster Inputs
  const [hpDelta, setHpDelta] = useState<string>('');

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

  const rollCheck = (title: string, modifier: number, subtitle?: string) => {
    setActiveRoll({
      title,
      modifier,
      subtitle,
      rollType: 'check',
    });
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
    const current = character.combat.conditions || [];
    const exists = current.includes(cond);
    const updated = exists ? current.filter((c) => c !== cond) : [...current, cond];
    character.combat.conditions = updated;
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
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}50`,
                    color: accentColor,
                  }}
                >
                  Level {character.level} {character.class}
                </span>
                {character.subclass && (
                  <span className="text-zinc-400 text-xs font-serif italic">
                    ({character.subclass})
                  </span>
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
          <div className="w-full md:w-auto flex flex-col items-end gap-3">
            {/* Rest Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
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
                  className={`h-full transition-all duration-500 ${
                    hpPercent > 50
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
          <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              Speed
            </span>
            <span className="text-xl font-black font-mono text-white tracking-tight">
              {character.speed} ft
            </span>
            <span className="text-[9px] font-mono text-zinc-500">Walking</span>
          </div>

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
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>Pass. Percept.</span>
              <Info size={11} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </span>
            <span className="text-xl font-black font-mono text-white tracking-tight">
              {passivePerceptionBreakdown.total}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-full">
              10 + WIS + Prof
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

            {/* Attack Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                          `d20 + ${atk.attackBonus} vs Target AC`
                        )
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>To-Hit</span>
                      <span>{formatModifier(atk.attackBonus)}</span>
                    </button>

                    <button
                      onClick={() =>
                        rollCheck(
                          `${atk.name} (Damage)`,
                          0,
                          `${atk.damage} ${atk.damageType} damage`
                        )
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer border border-zinc-700/60"
                    >
                      <span>Damage</span>
                      <span className="font-bold">{atk.damage}</span>
                      <span className="text-[10px] text-zinc-400">({atk.damageType})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer border ${
                        isActive
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
                        rollCheck(`${ability} Check`, stat.modifier, `d20 + ${stat.modifier}`)
                      }
                      className="text-3xl font-black font-mono text-zinc-100 hover:text-amber-300 transition-colors cursor-pointer my-0.5"
                      title="Click to roll Ability Check"
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
                      onClick={() =>
                        rollCheck(
                          `${ability} Saving Throw`,
                          saveBreakdown.total,
                          `d20 + ${saveBreakdown.total} (Save)`
                        )
                      }
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActiveBreakdown(saveBreakdown);
                      }}
                      className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-mono flex items-center justify-between border transition-all cursor-pointer ${
                        stat.saveProficient
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Left-click to Roll Save, Right-click to Inspect Formula"
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stat.saveProficient ? 'bg-amber-400' : 'bg-zinc-600'
                          }`}
                        />
                        <span>Save</span>
                      </span>
                      <span>{saveBreakdown.displayValue}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Skills Table */}
            <div className="rounded-xl bg-[#0e1017]/90 border border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs font-mono uppercase text-zinc-400 font-bold">
                <span>Skill</span>
                <span>Bonus &amp; Roll</span>
              </div>

              <div className="divide-y divide-zinc-800/50">
                {(character.skills || []).map((sk) => {
                  const breakdown = calculateSkillWithBreakdown(character, sk.name);

                  return (
                    <div
                      key={sk.name}
                      className="p-2.5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onToggleSkillProficiency?.(sk.name)}
                          className="cursor-pointer"
                          title="Toggle Proficiency"
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full inline-block ${
                              sk.expertise
                                ? 'bg-amber-400 ring-2 ring-amber-400/40'
                                : sk.proficient
                                ? 'bg-amber-400'
                                : 'bg-zinc-700'
                            }`}
                          />
                        </button>
                        <span className="font-medium text-zinc-200">{sk.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          ({sk.ability})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
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
                              `d20 + ${breakdown.total}`
                            )
                          }
                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-amber-500 hover:text-black font-mono font-bold text-zinc-200 transition-colors cursor-pointer"
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

        {/* TAB 3: SPELLS & MAGIC */}
        {activeTab === 'spells' && (
          <div className="space-y-6">
            {/* Spellcasting Header Banner */}
            <div className="p-4 rounded-xl bg-[#0e1017]/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-[family-name:var(--font-heading)] text-zinc-100">
                    Spellcasting Dashboard
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono">
                    Save DC: <strong className="text-white">{spellDCBreakdown.total}</strong> &bull;{' '}
                    Attack: <strong className="text-white">{spellAtkBreakdown.displayValue}</strong>
                  </p>
                </div>
              </div>

              {/* Slot Pips */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {Object.entries(character.spellcasting?.slots || {}).map(([lvlStr, slotData]) => {
                  const lvl = parseInt(lvlStr, 10);
                  const available = Math.max(0, slotData.max - slotData.used);

                  return (
                    <div
                      key={lvl}
                      className="flex flex-col items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono"
                    >
                      <span className="text-[10px] text-zinc-400 uppercase mb-1">
                        {character.class === 'Warlock' ? 'Pact Slots' : `Lvl ${lvl}`}
                      </span>
                      <div className="flex items-center gap-1 my-0.5">
                        {Array.from({ length: slotData.max }).map((_, idx) => (
                          <span
                            key={idx}
                            onClick={() => {
                              if (idx < available && onUseSpellSlot) {
                                onUseSpellSlot(lvl);
                              } else if (onRestoreSpellSlot) {
                                onRestoreSpellSlot(lvl);
                              }
                            }}
                            className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all ${
                              idx < available
                                ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                                : 'bg-zinc-800 border-zinc-700'
                            }`}
                            title={idx < available ? 'Click to expend slot' : 'Click to restore slot'}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {available} / {slotData.max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spells List */}
            <div className="space-y-3">
              {(character.spellcasting?.spells || []).map((spell) => (
                <div
                  key={spell.id}
                  className="p-3.5 rounded-xl bg-[#0e1017]/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-100">{spell.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                      </span>
                      {spell.school && (
                        <span className="text-[10px] text-purple-400 font-serif italic">
                          ({spell.school})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {spell.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-zinc-500">
                      <span>Time: {spell.castingTime}</span>
                      <span>&bull;</span>
                      <span>Range: {spell.range}</span>
                      <span>&bull;</span>
                      <span>Comp: {spell.components}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (spell.level > 0 && onUseSpellSlot) {
                        onUseSpellSlot(spell.level);
                      }
                      rollCheck(
                        `Cast ${spell.name}`,
                        spellAtkBreakdown.total,
                        spell.damageDice ? `Damage: ${spell.damageDice}` : undefined
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Cast Spell
                  </button>
                </div>
              ))}
            </div>
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
            onNotesChange={onNotesChange || (() => {})}
            onJournalChange={onJournalChange || (() => {})}
            onMysteriesChange={onMysteriesChange || (() => {})}
          />
        )}
      </div>

      {/* 4. MODALS & POPUPS */}
      <StatBreakdownModal
        breakdown={activeBreakdown}
        onClose={() => setActiveBreakdown(null)}
      />

      <UnifiedDiceRollerModal
        roll={activeRoll}
        onClose={() => setActiveRoll(null)}
      />

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
    </div>
  );
}
