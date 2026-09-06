'use client';

import { useState } from 'react';
import {
  Swords, Crosshair, ShieldAlert, Eye, EyeOff,
  Dices, Skull, AlertTriangle, Lock, Unlock, Plus, Trash2, Edit2, X, Check,
  Zap, Flame, Shield, Heart, Sparkles, RefreshCw, Target, Activity, Layers, BookOpen, Feather, PackageCheck
} from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import { formatModifier, calculateDeathStrikeDC, calculateAC } from '@/lib/character-engine';
import { getVestigeData } from '@/lib/orphans-tithe';
import { getClassFeaturesData } from '@/lib/class-features-db';
import { formatHitDicePool, getClassDefinition } from '@/lib/class-database';
import type { CharacterState, AttackOption } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCharacter } from '@/app/providers';

interface CombatActionsProps {
  character: CharacterState;
}

// Preset weapon templates for quick selection
const WEAPON_PRESETS = [
  { name: "The Orphan's Tithe", dice: '1d4', damageType: 'Piercing', range: 'Melee (5 ft)', ability: 'DEX', magicBonus: 1, notes: 'Vestige blade. +1 to hit/dmg. On crit, target suffers Soul Bleed.' },
  { name: 'Shortsword', dice: '1d6', damageType: 'Piercing', range: 'Melee (5 ft)', ability: 'DEX', magicBonus: 0, notes: 'Finesse, Light' },
  { name: 'Rapier', dice: '1d8', damageType: 'Piercing', range: 'Melee (5 ft)', ability: 'DEX', magicBonus: 0, notes: 'Finesse' },
  { name: 'Hand Crossbow', dice: '1d6', damageType: 'Piercing', range: '30/120 ft', ability: 'DEX', magicBonus: 0, notes: 'Ammunition, Light, Loading' },
  { name: 'Dagger', dice: '1d4', damageType: 'Piercing', range: '20/60 ft', ability: 'DEX', magicBonus: 0, notes: 'Finesse, Light, Thrown' },
  { name: 'Scimitar', dice: '1d6', damageType: 'Slashing', range: 'Melee (5 ft)', ability: 'DEX', magicBonus: 0, notes: 'Finesse, Light' },
  { name: 'Longsword', dice: '1d8', damageType: 'Slashing', range: 'Melee (5 ft)', ability: 'STR', magicBonus: 0, notes: 'Versatile (1d10)' },
  { name: 'Greatsword', dice: '2d6', damageType: 'Slashing', range: 'Melee (5 ft)', ability: 'STR', magicBonus: 0, notes: 'Heavy, Two-Handed' },
  { name: 'Eldritch Blast', dice: '1d10', damageType: 'Force', range: '120 ft', ability: 'CHA', magicBonus: 0, notes: 'Evocation Cantrip (1 beam per 5 levels)' },
  { name: 'Fire Bolt', dice: '1d10', damageType: 'Fire', range: '120 ft', ability: 'INT', magicBonus: 0, notes: 'Evocation Cantrip' },
];

export default function CombatActions({ character }: CombatActionsProps) {
  const { addAttack, editAttack, deleteAttack } = useCharacter();

  // Attack Modal State
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [editingAttackId, setEditingAttackId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [attackForm, setAttackForm] = useState<{
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    range: string;
    notes: string;
    equipped: boolean;
  }>({
    name: '',
    attackBonus: 0,
    damage: '1d6 + 3',
    damageType: 'Piercing',
    range: 'Melee (5 ft)',
    notes: '',
    equipped: true,
  });

  // Detailed Roll Result Overlay State
  const [rollResultModal, setRollResultModal] = useState<{
    attackName: string;
    d20Roll: number;
    attackBonus: number;
    totalToHit: number;
    isNat20: boolean;
    isNat1: boolean;
    baseDamageText: string;
    baseDamageTotal: number;
    baseRolls: number[];
    damageType: string;
    includeSneak: boolean;
    sneakDiceCount: number;
    sneakRolls: number[];
    sneakTotal: number;
  } | null>(null);

  // Resource Trackers State
  const [secondWindUsed, setSecondWindUsed] = useState(false);
  const [actionSurgeUsed, setActionSurgeUsed] = useState(false);
  const [hexbladesCurseUsed, setHexbladesCurseUsed] = useState(false);
  const [rageUsesLeft, setRageUsesLeft] = useState<number | null>(null);
  const [kiPointsLeft, setKiPointsLeft] = useState<number | null>(null);
  const [layOnHandsLeft, setLayOnHandsLeft] = useState<number | null>(null);
  const [bardicInspirationLeft, setBardicInspirationLeft] = useState<number | null>(null);

  // Class Level Breakdown from Multiclass Engine
  const classes = character.classes || [{ className: 'Rogue', subclass: 'Assassin', level: character.level }];
  
  const rogueClass = classes.find((c) => c.className === 'Rogue');
  const rogueLevel = rogueClass?.level || 0;

  const fighterClass = classes.find((c) => c.className === 'Fighter');
  const fighterLevel = fighterClass?.level || 0;

  const warlockClass = classes.find((c) => c.className === 'Warlock');
  const warlockLevel = warlockClass?.level || 0;
  const warlockSubclass = warlockClass?.subclass || '';

  const barbarianClass = classes.find((c) => c.className === 'Barbarian');
  const barbarianLevel = barbarianClass?.level || 0;

  const paladinClass = classes.find((c) => c.className === 'Paladin');
  const paladinLevel = paladinClass?.level || 0;

  const monkClass = classes.find((c) => c.className === 'Monk');
  const monkLevel = monkClass?.level || 0;

  const bardClass = classes.find((c) => c.className === 'Bard');
  const bardLevel = bardClass?.level || 0;

  // Stat Mods
  const dexMod = character.abilityScores.DEX.modifier;
  const strMod = character.abilityScores.STR.modifier;
  const chaMod = character.abilityScores.CHA.modifier;
  const intMod = character.abilityScores.INT.modifier;
  const wisMod = character.abilityScores.WIS.modifier;
  const profBonus = character.proficiencyBonus;

  // Class calculations
  const sneakAttackDice = rogueLevel > 0 ? Math.ceil(rogueLevel / 2) : 0;
  const deathStrikeDC = calculateDeathStrikeDC(dexMod, profBonus);

  // Maximum resource calculations
  const maxRages = barbarianLevel >= 20 ? 'Unlimited' : barbarianLevel >= 17 ? 6 : barbarianLevel >= 12 ? 5 : barbarianLevel >= 6 ? 4 : barbarianLevel >= 3 ? 3 : 2;
  const rageDamage = barbarianLevel >= 16 ? '+4' : barbarianLevel >= 9 ? '+3' : '+2';
  const maxKi = monkLevel;
  const maxLayOnHands = paladinLevel * 5;
  const maxBardicInspiration = Math.max(1, chaMod);
  const bardicDie = bardLevel >= 15 ? 'd12' : bardLevel >= 10 ? 'd10' : bardLevel >= 5 ? 'd8' : 'd6';

  const hitDicePoolStr = formatHitDicePool(classes);

  // Auto-fill attack form when preset selected
  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = WEAPON_PRESETS.find((p) => p.name === presetName);
    if (!found) return;

    const abilityMod =
      found.ability === 'DEX' ? dexMod :
      found.ability === 'STR' ? strMod :
      found.ability === 'CHA' ? chaMod :
      found.ability === 'INT' ? intMod : wisMod;

    // Check weapon proficiency
    const isProficient = (character.proficiencies?.weapons || []).some(
      (w) => w.toLowerCase().includes('weapon') || w.toLowerCase().includes(found.name.toLowerCase())
    ) || true;

    const calculatedBonus = abilityMod + (isProficient ? profBonus : 0) + found.magicBonus;
    const calculatedDamage = `${found.dice} ${formatModifier(abilityMod)}`;

    setAttackForm({
      name: found.name,
      attackBonus: calculatedBonus,
      damage: calculatedDamage,
      damageType: found.damageType,
      range: found.range,
      notes: found.notes,
      equipped: true,
    });
  };

  const handleSaveAttack = () => {
    if (!attackForm.name.trim()) return;
    if (editingAttackId) {
      editAttack({
        id: editingAttackId,
        name: attackForm.name,
        attackBonus: Number(attackForm.attackBonus),
        damage: attackForm.damage,
        damageType: attackForm.damageType,
        range: attackForm.range,
        notes: attackForm.notes,
        equipped: attackForm.equipped,
      });
    } else {
      addAttack({
        name: attackForm.name,
        attackBonus: Number(attackForm.attackBonus),
        damage: attackForm.damage,
        damageType: attackForm.damageType,
        range: attackForm.range,
        notes: attackForm.notes,
        equipped: attackForm.equipped,
      });
    }
    setIsAttackModalOpen(false);
  };

  // Parsing & rolling damage dice
  const executeRoll = (atk: AttackOption) => {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const isNat20 = d20Roll === 20;
    const isNat1 = d20Roll === 1;
    const totalToHit = d20Roll + atk.attackBonus;

    // Parse damage dice string e.g. "1d6 + 3" or "2d4 + 1"
    const match = atk.damage.match(/(\d+)d(\d+)(?:\s*([\+\-])\s*(\d+))?/i);
    let count = match ? parseInt(match[1], 10) : 1;
    const sides = match ? parseInt(match[2], 10) : 6;
    const sign = match && match[3] === '-' ? -1 : 1;
    const bonus = match && match[4] ? parseInt(match[4], 10) * sign : 0;

    // Double dice on critical hit
    if (isNat20) {
      count *= 2;
    }

    const baseRolls: number[] = [];
    let baseSum = 0;
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * sides) + 1;
      baseRolls.push(r);
      baseSum += r;
    }
    const baseDamageTotal = baseSum + bonus;

    // Sneak attack calculation if applicable
    const isFinesseOrRanged =
      atk.notes?.toLowerCase().includes('finesse') ||
      atk.range?.toLowerCase().includes('ft') ||
      atk.name.toLowerCase().includes('tithe') ||
      atk.name.toLowerCase().includes('shortsword') ||
      atk.name.toLowerCase().includes('dagger') ||
      atk.name.toLowerCase().includes('crossbow');

    let sneakDiceCount = isFinesseOrRanged && rogueLevel >= 1 ? sneakAttackDice : 0;
    if (isNat20 && sneakDiceCount > 0) sneakDiceCount *= 2;

    const sneakRolls: number[] = [];
    let sneakTotal = 0;
    for (let i = 0; i < sneakDiceCount; i++) {
      const r = Math.floor(Math.random() * 6) + 1;
      sneakRolls.push(r);
      sneakTotal += r;
    }

    setRollResultModal({
      attackName: atk.name,
      d20Roll,
      attackBonus: atk.attackBonus,
      totalToHit,
      isNat20,
      isNat1,
      baseDamageText: atk.damage,
      baseDamageTotal,
      baseRolls,
      damageType: atk.damageType || 'Physical',
      includeSneak: sneakDiceCount > 0,
      sneakDiceCount,
      sneakRolls,
      sneakTotal,
    });
  };

  // Sync equipped inventory weapons to attacks
  const equippedInventoryWeapons = (character.inventory || []).filter(
    (item) => item.category === 'weapon' && item.equipped
  );

  const handleSyncInventoryWeapon = (item: import('@/lib/types').InventoryItem) => {
    const existing = (character.attacks || []).find(
      (a) => a.name.toLowerCase() === item.name.toLowerCase()
    );

    if (!existing) {
      addAttack({
        name: item.name,
        attackBonus: dexMod + profBonus,
        damage: '1d6 + ' + dexMod,
        damageType: 'Piercing',
        range: 'Melee (5 ft)',
        notes: item.description || 'Equipped weapon from inventory',
        equipped: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Combat Roll Result Modal */}
      {rollResultModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-400)] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setRollResultModal(null)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <Dices className="text-[var(--color-gold-400)]" size={22} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                {rollResultModal.attackName} — Attack Roll
              </h2>
            </div>

            <div className="space-y-4">
              {/* To Hit Section */}
              <div className="glass-card p-4 rounded-xl text-center bg-gradient-to-b from-black/40 to-black/70 border border-white/10">
                <p className="text-xs uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)] mb-1">
                  Attack Roll (To Hit)
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
                    d20 ({rollResultModal.d20Roll})
                  </span>
                  <span className="text-xl font-bold text-[var(--color-gold-400)]">+</span>
                  <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
                    {rollResultModal.attackBonus}
                  </span>
                  <span className="text-2xl font-bold text-white">=</span>
                  <span className={cn(
                    'text-4xl font-extrabold font-[family-name:var(--font-mono)] px-4 py-1 rounded-xl',
                    rollResultModal.isNat20 ? 'bg-amber-500/20 text-amber-300 border border-amber-400 text-glow-gold' :
                    rollResultModal.isNat1 ? 'bg-red-500/20 text-red-400 border border-red-500' :
                    'bg-white/5 text-[var(--color-gold-300)]'
                  )}>
                    {rollResultModal.totalToHit}
                  </span>
                </div>

                {rollResultModal.isNat20 && (
                  <p className="text-amber-400 font-bold text-sm mt-2 animate-bounce flex items-center justify-center gap-1 font-[family-name:var(--font-heading)]">
                    <Sparkles size={16} /> NATURAL 20! CRITICAL HIT! (Dice Doubled)
                  </p>
                )}
                {rollResultModal.isNat1 && (
                  <p className="text-red-400 font-bold text-sm mt-2 font-[family-name:var(--font-heading)]">
                    CRITICAL MISS (Natural 1)
                  </p>
                )}
              </div>

              {/* Damage Section */}
              <div className="glass-card p-4 rounded-xl bg-gradient-to-b from-black/40 to-black/70 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-parchment-dim)] font-[family-name:var(--font-heading)]">
                    Weapon Damage ({rollResultModal.damageType})
                  </span>
                  <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
                    Dice Rolls: [{rollResultModal.baseRolls.join(', ')}]
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--color-parchment)]">
                    Base Weapon: {rollResultModal.baseDamageText}
                  </span>
                  <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-crimson-400)]">
                    {rollResultModal.baseDamageTotal} {rollResultModal.damageType}
                  </span>
                </div>

                {/* Sneak Attack Calculation */}
                {rollResultModal.sneakDiceCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rollResultModal.includeSneak}
                          onChange={(e) => setRollResultModal({ ...rollResultModal, includeSneak: e.target.checked })}
                          className="accent-[var(--color-crimson-500)] w-4 h-4 rounded"
                        />
                        <span className="text-xs font-semibold text-[var(--color-crimson-300)] flex items-center gap-1 font-[family-name:var(--font-heading)]">
                          <Crosshair size={14} /> Sneak Attack ({rollResultModal.sneakDiceCount}d6)
                        </span>
                      </label>
                      <span className="text-xs font-[family-name:var(--font-mono)] text-red-300">
                        [{rollResultModal.sneakRolls.join(', ')}] = +{rollResultModal.sneakTotal}
                      </span>
                    </div>
                  </div>
                )}

                {/* Grand Total Damage */}
                <div className="mt-4 pt-3 border-t-2 border-[var(--color-gold-500)] flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                    Total Combat Damage:
                  </span>
                  <span className="text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[var(--color-gold-300)] text-glow-gold">
                    {rollResultModal.baseDamageTotal + (rollResultModal.includeSneak ? rollResultModal.sneakTotal : 0)} {rollResultModal.damageType}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setRollResultModal(null)}
                className="btn btn-gold text-xs px-6 py-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiclass Combat Overview Banner */}
      <div className="glass-card p-4 rounded-xl border border-[rgba(255,215,0,0.15)] bg-gradient-to-r from-[rgba(20,20,25,0.8)] via-[rgba(30,25,40,0.6)] to-[rgba(20,20,25,0.8)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[var(--color-gold-400)]" />
              <h2 className="text-base font-bold font-[family-name:var(--font-heading)] text-[var(--color-parchment)]">
                Combat Vitality &amp; Class Pool
              </h2>
            </div>
            <p className="text-xs text-[var(--color-parchment-dim)] mt-0.5">
              Multiclass Hit Dice: <span className="font-semibold text-[var(--color-gold-300)] font-[family-name:var(--font-mono)]">{hitDicePoolStr}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[rgba(220,38,38,0.12)] border border-[rgba(220,38,38,0.25)] flex items-center gap-1.5">
              <Heart size={14} className="text-[var(--color-crimson-400)]" />
              <span className="text-[var(--color-parchment-dim)]">HP:</span>
              <span className="font-bold text-[var(--color-parchment)] font-[family-name:var(--font-mono)]">
                {character.combat.currentHP} / {character.combat.maxHP}
                {character.combat.tempHP > 0 && <span className="text-emerald-400 ml-1">(+{character.combat.tempHP} temp)</span>}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[rgba(255,215,0,0.08)] border border-[rgba(255,215,0,0.2)] flex items-center gap-1.5">
              <Shield size={14} className="text-[var(--color-gold-400)]" />
              <span className="text-[var(--color-parchment-dim)]">AC:</span>
              <span className="font-bold text-[var(--color-gold-300)] font-[family-name:var(--font-mono)]">{character.overrides?.ac ?? calculateAC(dexMod, character.level >= 5)}</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[rgba(255,215,0,0.08)] border border-[rgba(255,215,0,0.2)] flex items-center gap-1.5">
              <Zap size={14} className="text-[var(--color-gold-400)]" />
              <span className="text-[var(--color-parchment-dim)]">Initiative:</span>
              <span className="font-bold text-[var(--color-gold-300)] font-[family-name:var(--font-mono)]">{formatModifier(character.initiative)}</span>
            </div>
          </div>
        </div>

        {/* Equipment & Weapon Proficiencies Indicator */}
        {character.proficiencies && (character.proficiencies.weapons?.length > 0 || character.proficiencies.armor?.length > 0) && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
            {character.proficiencies.armor?.length > 0 && (
              <span className="text-[var(--color-parchment-dim)]">
                <strong className="text-[var(--color-gold-400)]">Armor:</strong> {character.proficiencies.armor.join(', ')}
              </span>
            )}
            {character.proficiencies.weapons?.length > 0 && (
              <span className="text-[var(--color-parchment-dim)]">
                <strong className="text-[var(--color-gold-400)]">Weapons:</strong> {character.proficiencies.weapons.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sync Equipped Inventory Weapons Bar */}
      {equippedInventoryWeapons.length > 0 && (
        <div className="glass-card p-3 rounded-xl border border-[rgba(255,215,0,0.12)] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs">
            <PackageCheck size={16} className="text-[var(--color-gold-400)]" />
            <span className="text-[var(--color-parchment-dim)]">Equipped Weapons from Inventory:</span>
            <div className="flex flex-wrap gap-1.5">
              {equippedInventoryWeapons.map((item) => (
                <span key={item.id} className="font-semibold text-[var(--color-gold-300)] bg-white/5 px-2 py-0.5 rounded text-[11px]">
                  {item.name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => equippedInventoryWeapons.forEach(handleSyncInventoryWeapon)}
            className="btn btn-gold btn-sm text-[10px] uppercase font-bold tracking-wider"
          >
            Sync All to Attacks
          </button>
        </div>
      )}

      {/* Multiclass Combat Resource Trackers */}
      {(fighterLevel > 0 || warlockSubclass.includes('Hexblade') || barbarianLevel > 0 || monkLevel > 0 || paladinLevel > 0 || bardLevel > 0) && (
        <div>
          <h2 className="text-sm uppercase tracking-wider font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            Class Combat Features &amp; Resource Trackers
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Fighter - Second Wind */}
            {fighterLevel >= 1 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(255, 215, 0, 0.08)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Heart size={15} className="text-emerald-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-parchment)]">
                      Second Wind
                    </h3>
                  </div>
                  <button
                    onClick={() => setSecondWindUsed(!secondWindUsed)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all',
                      secondWindUsed
                        ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                        : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60'
                    )}
                  >
                    {secondWindUsed ? 'EXPENDED' : 'READY'}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Bonus action to regain <strong className="text-white font-[family-name:var(--font-mono)]">1d10 + {fighterLevel}</strong> HP. (1/short rest)
                </p>
              </SpotlightCard>
            )}

            {/* Fighter - Action Surge */}
            {fighterLevel >= 2 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(220, 38, 38, 0.08)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-amber-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-parchment)]">
                      Action Surge
                    </h3>
                  </div>
                  <button
                    onClick={() => setActionSurgeUsed(!actionSurgeUsed)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all',
                      actionSurgeUsed
                        ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                        : 'bg-amber-950/50 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60'
                    )}
                  >
                    {actionSurgeUsed ? 'EXPENDED' : 'READY'}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Take 1 additional action on your turn. (1/short rest{fighterLevel >= 17 ? ', 2 at Lv17' : ''})
                </p>
              </SpotlightCard>
            )}

            {/* Hexblade's Curse */}
            {warlockSubclass.includes('Hexblade') && warlockLevel >= 1 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(168, 85, 247, 0.1)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Target size={15} className="text-purple-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-purple-300">
                      Hexblade&apos;s Curse
                    </h3>
                  </div>
                  <button
                    onClick={() => setHexbladesCurseUsed(!hexbladesCurseUsed)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all',
                      hexbladesCurseUsed
                        ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                        : 'bg-purple-950/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/60'
                    )}
                  >
                    {hexbladesCurseUsed ? 'ACTIVE/USED' : 'READY'}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Target takes <strong className="text-purple-300">+{profBonus}</strong> dmg, crits on 19-20. Regain HP on target death.
                </p>
              </SpotlightCard>
            )}

            {/* Barbarian - Rage */}
            {barbarianLevel >= 1 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(220, 38, 38, 0.1)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Flame size={15} className="text-red-500" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-red-400">
                      Rage ({rageUsesLeft ?? maxRages}/{maxRages})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRageUsesLeft(Math.max(0, (rageUsesLeft ?? (typeof maxRages === 'number' ? maxRages : 6)) - 1))}
                      className="px-2 py-0.5 rounded text-xs bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800/40"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => setRageUsesLeft(typeof maxRages === 'number' ? maxRages : 6)}
                      className="p-1 rounded text-xs bg-white/5 text-white/70 hover:bg-white/10"
                      title="Reset Rages"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Melee Dmg: <strong className="text-red-400">{rageDamage}</strong> &bull; Resists Bludgeoning/Piercing/Slashing.
                </p>
              </SpotlightCard>
            )}

            {/* Monk - Ki Points */}
            {monkLevel >= 2 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(59, 130, 246, 0.1)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-cyan-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-cyan-300">
                      Ki Pool ({kiPointsLeft ?? maxKi}/{maxKi})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setKiPointsLeft(Math.max(0, (kiPointsLeft ?? maxKi) - 1))}
                      className="px-2 py-0.5 rounded text-xs bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900 border border-cyan-800/40"
                    >
                      -1 Ki
                    </button>
                    <button
                      onClick={() => setKiPointsLeft(maxKi)}
                      className="p-1 rounded text-xs bg-white/5 text-white/70 hover:bg-white/10"
                      title="Rest (Reset Ki)"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Flurry of Blows, Patient Defense (+AC), Step of the Wind (Dash/Disengage).
                </p>
              </SpotlightCard>
            )}

            {/* Paladin - Lay on Hands */}
            {paladinLevel >= 1 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(255, 215, 0, 0.1)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Heart size={15} className="text-amber-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-amber-300">
                      Lay on Hands Pool
                    </h3>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] font-bold text-amber-400 text-sm">
                    {layOnHandsLeft ?? maxLayOnHands} / {maxLayOnHands} HP
                  </span>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Touch a creature to restore HP or cure disease (5 HP per disease/poison).
                </p>
              </SpotlightCard>
            )}

            {/* Bard - Bardic Inspiration */}
            {bardLevel >= 1 && (
              <SpotlightCard className="p-3.5" spotlightColor="rgba(236, 72, 153, 0.1)">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Feather size={15} className="text-pink-400" />
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-pink-300">
                      Bardic Inspiration ({bardicInspirationLeft ?? maxBardicInspiration}/{maxBardicInspiration})
                    </h3>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] font-bold text-pink-400 text-sm">
                    {bardicDie}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-parchment-dim)]">
                  Bonus action to grant ally {bardicDie} to attack, check, or save within 10 min.
                </p>
              </SpotlightCard>
            )}
          </div>
        </div>
      )}

      {/* Attack Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2 flex-1">
            <Swords size={18} />
            Attack &amp; Weapon Actions
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>

          <button
            onClick={() => {
              setEditingAttackId(null);
              setSelectedPreset('');
              setAttackForm({
                name: '',
                attackBonus: dexMod + profBonus,
                damage: '1d6 + 3',
                damageType: 'Slashing',
                range: 'Melee (5 ft)',
                notes: '',
                equipped: true,
              });
              setIsAttackModalOpen(true);
            }}
            className="btn btn-gold btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} /> Add Weapon / Attack
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(character.attacks || []).map((atk) => (
            <SpotlightCard
              key={atk.id}
              className={cn('p-4 relative group border transition-all', atk.equipped !== false ? 'border-[rgba(220,38,38,0.3)]' : 'border-white/5 opacity-70')}
              spotlightColor="rgba(220, 38, 38, 0.08)"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold text-sm flex items-center gap-2">
                    {atk.name}
                    {atk.equipped !== false && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[rgba(220,38,38,0.2)] text-[var(--color-crimson-300)] font-mono">
                        Equipped
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
                    {atk.range || 'Melee'} &bull; {atk.damageType || 'Physical'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => executeRoll(atk)}
                    className="btn btn-crimson btn-sm text-xs flex items-center gap-1 font-bold shadow-md cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Dices size={13} /> Roll
                  </button>

                  <button
                    onClick={() => {
                      setEditingAttackId(atk.id);
                      setSelectedPreset(atk.name);
                      setAttackForm({
                        name: atk.name,
                        attackBonus: atk.attackBonus,
                        damage: atk.damage,
                        damageType: atk.damageType,
                        range: atk.range,
                        notes: atk.notes,
                        equipped: atk.equipped !== false,
                      });
                      setIsAttackModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-[var(--color-parchment-dim)] hover:text-white hover:bg-white/10"
                    title="Edit Attack"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => deleteAttack(atk.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    title="Delete Attack"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2 border border-white/5">
                  <span className="text-[var(--color-parchment-dim)] text-[10px] uppercase">To Hit Bonus</span>
                  <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-crimson-400)]">
                    {formatModifier(atk.attackBonus)}
                  </span>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2 border border-white/5">
                  <span className="text-[var(--color-parchment-dim)] text-[10px] uppercase">Damage</span>
                  <span className="block font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-parchment)]">
                    {atk.damage}
                  </span>
                </div>
              </div>

              {atk.notes && (
                <p className="text-[10px] text-[var(--color-parchment-dim)] italic mt-2">
                  {atk.notes}
                </p>
              )}
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Rogue - Sneak Attack */}
      {rogueLevel >= 1 && (
        <SpotlightCard className="p-4" spotlightColor="rgba(220, 38, 38, 0.06)">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crosshair size={16} className="text-[var(--color-crimson-500)]" />
              <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold">
                Sneak Attack (Rogue Lv {rogueLevel})
              </h3>
            </div>
            <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-crimson-400)]">
              {sneakAttackDice}d6
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: sneakAttackDice }, (_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-crimson-800)] to-[var(--color-crimson-950)] border border-[rgba(220,38,38,0.3)] flex items-center justify-center text-xs font-[family-name:var(--font-mono)] text-[var(--color-crimson-300)] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                d6
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-parchment-dim)] mt-2">
            Once per turn when you hit with a finesse or ranged weapon and have advantage, or an ally is within 5ft of the target.
          </p>
        </SpotlightCard>
      )}

      {/* Rogue - Cunning Action */}
      {rogueLevel >= 2 && (
        <div>
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
            <Crosshair size={18} />
            Cunning Action
            <span className="text-xs text-[var(--color-parchment-dim)] font-normal">(Bonus Action)</span>
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Dash', icon: <Crosshair size={14} />, desc: 'Double your speed this turn.' },
              { name: 'Disengage', icon: <ShieldAlert size={14} />, desc: 'Move without provoking opportunity attacks.' },
              { name: 'Hide', icon: <EyeOff size={14} />, desc: 'Make a Stealth check to become hidden.' },
            ].map((action) => (
              <div key={action.name} className="glass-card p-3 text-center hover:glow-gold transition-shadow cursor-default">
                <div className="text-[var(--color-gold-400)] mb-1 flex justify-center">{action.icon}</div>
                <p className="text-xs font-[family-name:var(--font-heading)] font-semibold text-[var(--color-parchment)] uppercase tracking-wider">
                  {action.name}
                </p>
                <p className="text-[10px] text-[var(--color-parchment-dim)] mt-1">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Class Features Compendium */}
      <div>
        <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-3 flex items-center gap-2">
          <BookOpen size={18} />
          Active Class &amp; Subclass Features
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h2>

        <div className="space-y-4">
          {classes.map((cls) => {
            const classData = getClassFeaturesData(cls.className);
            if (!classData) return null;

            const unlockedClassFeatures = classData.features.filter((f) => f.level <= cls.level);
            const subclassData = cls.subclass ? classData.subclasses[cls.subclass] : null;
            const unlockedSubclassFeatures = subclassData
              ? subclassData.features.filter((f) => f.level <= cls.level)
              : [];

            return (
              <div key={cls.className} className="glass-card p-4 rounded-xl border border-[rgba(255,215,0,0.12)]">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[var(--color-gold-400)]" />
                    <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-gold-300)]">
                      {cls.className} {cls.subclass ? `(${cls.subclass})` : ''}
                    </h3>
                  </div>
                  <span className="text-xs font-[family-name:var(--font-mono)] px-2.5 py-0.5 rounded-full bg-[rgba(255,215,0,0.1)] text-[var(--color-gold-400)] border border-[rgba(255,215,0,0.2)]">
                    Level {cls.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {unlockedClassFeatures.map((feat, idx) => (
                    <div key={`${cls.className}-class-${feat.name}-${feat.level}-${idx}`} className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[family-name:var(--font-heading)] font-semibold text-xs text-[var(--color-parchment)] flex items-center gap-1.5">
                          <Unlock size={12} className="text-[var(--color-gold-400)]" />
                          {feat.name}
                        </span>
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-parchment-dim)]">
                          Lv {feat.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-parchment-dim)] line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                        {feat.description}
                      </p>
                    </div>
                  ))}

                  {unlockedSubclassFeatures.map((feat, idx) => (
                    <div key={`${cls.className}-subclass-${feat.name}-${feat.level}-${idx}`} className="bg-[rgba(220,38,38,0.06)] p-3 rounded-lg border border-[rgba(220,38,38,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[family-name:var(--font-heading)] font-semibold text-xs text-[var(--color-crimson-300)] flex items-center gap-1.5">
                          <Skull size={12} className="text-[var(--color-crimson-400)]" />
                          {feat.name}
                        </span>
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-crimson-400)]">
                          Subclass Lv {feat.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-parchment-dim)] line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                        {feat.description}
                        {feat.name === 'Death Strike' && (
                          <span className="ml-1 text-[var(--color-crimson-400)] font-semibold">
                            (DC {deathStrikeDC})
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawbacks Warning */}
      {character.orphansTithe?.phantomMurmursActive && (
        <div className="glass-card-crimson p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[var(--color-crimson-500)]" />
            <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-crimson-400)] font-semibold text-sm">
              Phantom Murmurs Active
            </h3>
          </div>
          <ul className="text-xs text-[var(--color-crimson-300)] space-y-1">
            <li>&bull; Disadvantage on hearing-based Perception checks</li>
            <li>&bull; -2 penalty to Initiative ({formatModifier(character.initiative)})</li>
          </ul>
        </div>
      )}

      {/* ADD / EDIT ATTACK FORM MODAL */}
      {isAttackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-500)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAttackModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <Swords className="text-[var(--color-gold-400)]" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                {editingAttackId ? 'Edit Attack' : 'Add New Attack / Weapon'}
              </h2>
            </div>

            {/* Quick Preset Selector */}
            <div className="mb-4">
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-gold-400)] font-[family-name:var(--font-heading)] mb-1">
                Quick Weapon Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-gold-500)]/40 rounded-lg p-2.5 text-white font-semibold text-xs"
              >
                <option value="">-- Choose a Preset Weapon --</option>
                {WEAPON_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.dice} {p.damageType}, {p.range})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Weapon / Attack Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hand Crossbow, Eldritch Blast"
                  value={attackForm.name}
                  onChange={(e) => setAttackForm({ ...attackForm, name: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    To Hit Bonus
                  </label>
                  <input
                    type="number"
                    value={attackForm.attackBonus}
                    onChange={(e) => setAttackForm({ ...attackForm, attackBonus: Number(e.target.value) })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Damage (Dice + Mod)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1d6 + 4"
                    value={attackForm.damage}
                    onChange={(e) => setAttackForm({ ...attackForm, damage: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Damage Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Piercing, Force"
                    value={attackForm.damageType}
                    onChange={(e) => setAttackForm({ ...attackForm, damageType: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Melee (5 ft), 120 ft"
                    value={attackForm.range}
                    onChange={(e) => setAttackForm({ ...attackForm, range: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Properties / Special Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Finesse, Light, Advantage vs surprised targets"
                  value={attackForm.notes}
                  onChange={(e) => setAttackForm({ ...attackForm, notes: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="equipped-chk"
                  checked={attackForm.equipped}
                  onChange={(e) => setAttackForm({ ...attackForm, equipped: e.target.checked })}
                  className="accent-[var(--color-gold-500)] w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="equipped-chk" className="text-xs text-[var(--color-parchment)] cursor-pointer">
                  Equipped / Wielded in Combat
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,215,0,0.15)]">
              <button
                onClick={() => setIsAttackModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--color-parchment-dim)] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttack}
                className="btn btn-gold btn-sm text-xs flex items-center gap-1.5"
              >
                <Check size={14} /> Save Attack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
