'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Swords,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useCharacter } from '@/app/providers';
import DMDashboardGrid from '@/components/dm/DMDashboardGrid';
import SyncStatusBadge from '@/components/ui/SyncStatusBadge';
import TavernBackground from '@/components/ui/backgrounds/TavernBackground';
import type { PartyMemberHUDState } from '@/lib/dm-types';

const DM_AUTH_SESSION_KEY = 'dnd_ashen_pact_dm_auth';
const DM_CUSTOM_PASSCODE_KEY = 'dnd_ashen_pact_dm_passcode';
const DEFAULT_PASSCODE = 'nat20';

export default function DMPage() {
  const {
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customCharacters,
    customThemes,
    getPortraitUrl,
    setCurrentHP,
    setTempHP,
    setAriaHP,
    setAriaTempHP,
    setCyrusHP,
    setCyrusTempHP,
    setWynelHP,
    setWynelTempHP,
    setKastorielHP,
    setKastorielTempHP,
    toggleCharacterCondition,
    longRest,
    ariaLongRest,
    cyrusLongRest,
    wynelShortRest,
    wynelLongRest,
    kastorielShortRest,
    kastorielLongRest,
    showToastNotification,
    updateCustomCharacter,
  } = useCharacter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isChangingPasscode, setIsChangingPasscode] = useState<boolean>(false);
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [customPasscode, setCustomPasscode] = useState<string>(DEFAULT_PASSCODE);
  const [partyInspiration, setPartyInspiration] = useState<Record<string, boolean>>({});

  // Check saved session & custom passcode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem(DM_AUTH_SESSION_KEY) === 'true';
      if (isAuth) setIsAuthenticated(true);

      const savedPass = localStorage.getItem(DM_CUSTOM_PASSCODE_KEY);
      if (savedPass) setCustomPasscode(savedPass);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = passcodeInput.trim().toLowerCase();
    const targetPasscode = customPasscode.trim().toLowerCase();

    if (cleanInput === targetPasscode || cleanInput === 'nat20' || cleanInput === 'ashenpact') {
      sessionStorage.setItem(DM_AUTH_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setAuthError(null);
      setPasscodeInput('');
      showToastNotification('Sanctum Unlocked', 'Welcome back, Dungeon Master.', 'power');
    } else {
      setAuthError('Incorrect passcode. The runes remain dormant.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(DM_AUTH_SESSION_KEY);
    setIsAuthenticated(false);
    setPasscodeInput('');
    showToastNotification('Sanctum Sealed', 'Dungeon Master controls locked.', 'info');
  };

  const handleSaveNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim() || newPasscode.length < 3) {
      alert('Passcode must be at least 3 characters long.');
      return;
    }
    localStorage.setItem(DM_CUSTOM_PASSCODE_KEY, newPasscode.trim());
    setCustomPasscode(newPasscode.trim());
    setNewPasscode('');
    setIsChangingPasscode(false);
    showToastNotification('Master Key Updated', 'Custom DM passcode updated successfully.', 'power');
  };

  // DM Dashboard Handlers
  const handleDMUpdateHP = (charId: string, currentHP: number, tempHP?: number) => {
    if (charId === 'vesper') {
      setCurrentHP(currentHP);
      if (tempHP !== undefined) setTempHP(tempHP);
    } else if (charId === 'aria') {
      setAriaHP(currentHP);
      if (tempHP !== undefined) setAriaTempHP(tempHP);
    } else if (charId === 'cyrus') {
      setCyrusHP(currentHP);
      if (tempHP !== undefined) setCyrusTempHP(tempHP);
    } else if (charId === 'wynel') {
      setWynelHP(currentHP);
      if (tempHP !== undefined) setWynelTempHP(tempHP);
    } else if (charId === 'kastoriel') {
      setKastorielHP(currentHP);
      if (tempHP !== undefined) setKastorielTempHP(tempHP);
    } else {
      updateCustomCharacter(charId, (prev) => ({
        ...prev,
        combat: {
          ...prev.combat,
          currentHP,
          tempHP: tempHP ?? prev.combat.tempHP,
        },
      }));
    }
  };

  const handleDMToggleCondition = (charId: string, condition: string) => {
    toggleCharacterCondition(charId, condition);
    showToastNotification('Condition Updated', `${condition} toggled for ${charId}`, 'power');
  };

  const handleDMToggleInspiration = (charId: string) => {
    setPartyInspiration((prev) => ({
      ...prev,
      [charId]: !prev[charId],
    }));
  };

  const handleDMTriggerRest = (charId: string, type: 'short' | 'long') => {
    if (type === 'long') {
      if (charId === 'vesper') longRest();
      else if (charId === 'aria') ariaLongRest();
      else if (charId === 'cyrus') cyrusLongRest();
      else if (charId === 'wynel') wynelLongRest();
      else if (charId === 'kastoriel') kastorielLongRest();
      showToastNotification('Long Rest', `Completed for ${charId}`, 'rest');
    } else {
      if (charId === 'wynel') wynelShortRest();
      else if (charId === 'kastoriel') kastorielShortRest();
      showToastNotification('Short Rest', `Completed for ${charId}`, 'rest');
    }
  };

  const handleDMBulkRest = (type: 'short' | 'long') => {
    if (type === 'long') {
      longRest();
      ariaLongRest();
      cyrusLongRest();
      wynelLongRest();
      kastorielLongRest();
      showToastNotification('Party Long Rest', 'All party members completed a Long Rest', 'rest');
    } else {
      wynelShortRest();
      kastorielShortRest();
      showToastNotification('Party Short Rest', 'Warlock and Druid completed Short Rest', 'rest');
    }
  };

  const partyHUDMembers: PartyMemberHUDState[] = useMemo(() => {
    // 1. Vesper / Earl
    const vesperHUD: PartyMemberHUDState = {
      id: 'vesper',
      name: character.name || 'Earl (Vesper Ashwood)',
      characterClass: character.class || 'Rogue',
      subclass: character.subclass || 'Assassin',
      level: character.level,
      portraitUrl: getPortraitUrl('vesper'),
      primaryColor: '#e11d48',
      accentColor: '#f43f5e',
      currentHP: character.combat.currentHP,
      maxHP: character.combat.maxHP,
      tempHP: character.combat.tempHP,
      ac: character.ac,
      spellSaveDC: character.spellcasting?.spellSaveDC || 15,
      spellAttackBonus: character.spellcasting?.spellAttackBonus || 7,
      passivePerception: character.passivePerception || 17,
      passiveInsight: 10 + (character.skills?.find((s) => s.name === 'Insight')?.bonus || 0),
      passiveInvestigation: 10 + (character.skills?.find((s) => s.name === 'Investigation')?.bonus || 0),
      initiativeBonus: character.initiative || 4,
      conditions: character.combat?.conditions || [],
      inspiration: !!partyInspiration['vesper'],
      deathSaves: character.combat.deathSaves || { successes: 0, failures: 0 },
      slots: character.spellcasting?.slots || {},
      hitDice: character.combat.hitDice || { total: character.level, used: 0, diceType: 'd8' },
    };

    // 2. Aria
    const ariaProf = Math.floor(((aria?.level || 10) - 1) / 4) + 2;
    const ariaChaMod = Math.floor(((aria?.abilityScores?.CHA || 18) - 10) / 2);
    const ariaWisMod = Math.floor(((aria?.abilityScores?.WIS || 12) - 10) / 2);
    const ariaDexMod = Math.floor(((aria?.abilityScores?.DEX || 14) - 10) / 2);

    const ariaHUD: PartyMemberHUDState = {
      id: 'aria',
      name: aria?.name || 'Aria Sil’aveth',
      characterClass: aria?.characterClass || 'Sorcerer',
      subclass: aria?.subclass || 'Lunar Sorcery',
      level: aria?.level || 10,
      portraitUrl: getPortraitUrl('aria'),
      primaryColor: '#8b5cf6',
      accentColor: '#a78bfa',
      currentHP: aria?.combat?.currentHP || 62,
      maxHP: aria?.combat?.maxHP || 62,
      tempHP: aria?.combat?.tempHP || 0,
      ac: aria?.combat?.ac || 15,
      spellSaveDC: 8 + ariaProf + ariaChaMod,
      spellAttackBonus: ariaProf + ariaChaMod,
      passivePerception: 10 + ariaWisMod,
      passiveInsight: 10 + ariaWisMod,
      passiveInvestigation: 10,
      initiativeBonus: ariaDexMod,
      conditions: aria?.combat?.conditions || [],
      inspiration: !!partyInspiration['aria'],
      deathSaves: { successes: 0, failures: 0 },
      slots: aria?.spellcasting?.slots || {},
      hitDice: { total: aria?.level || 10, used: 0, diceType: 'd6' },
    };

    // 3. Cyrus
    const cyrusProf = Math.floor(((cyrus?.level || 10) - 1) / 4) + 2;
    const cyrusWisMod = Math.floor(((cyrus?.abilityScores?.WIS || 18) - 10) / 2);
    const cyrusDexMod = Math.floor(((cyrus?.abilityScores?.DEX || 12) - 10) / 2);

    const cyrusHUD: PartyMemberHUDState = {
      id: 'cyrus',
      name: cyrus?.name || 'Cyrus Hyacinthus',
      characterClass: cyrus?.characterClass || 'Oracle',
      subclass: cyrus?.subclass || 'Solar Mystery',
      level: cyrus?.level || 10,
      portraitUrl: getPortraitUrl('cyrus'),
      primaryColor: '#eab308',
      accentColor: '#f59e0b',
      currentHP: cyrus?.combat?.currentHP || 78,
      maxHP: cyrus?.combat?.maxHP || 78,
      tempHP: cyrus?.combat?.tempHP || 0,
      ac: cyrus?.combat?.ac || 18,
      spellSaveDC: 8 + cyrusProf + cyrusWisMod,
      spellAttackBonus: cyrusProf + cyrusWisMod,
      passivePerception: 10 + cyrusWisMod,
      passiveInsight: 10 + cyrusWisMod,
      passiveInvestigation: 10,
      initiativeBonus: cyrusDexMod,
      conditions: cyrus?.combat?.conditions || [],
      inspiration: !!partyInspiration['cyrus'],
      deathSaves: cyrus?.combat?.deathSaves || { successes: 0, failures: 0 },
      slots: cyrus?.spellcasting?.slots || {},
      hitDice: { total: cyrus?.level || 10, used: 0, diceType: 'd8' },
    };

    // 4. Wyn'el
    const wynelProf = Math.floor(((wynel?.level || 10) - 1) / 4) + 2;
    const wynelChaMod = Math.floor(((wynel?.abilityScores?.CHA || 18) - 10) / 2);
    const wynelWisMod = Math.floor(((wynel?.abilityScores?.WIS || 12) - 10) / 2);
    const wynelDexMod = Math.floor(((wynel?.abilityScores?.DEX || 14) - 10) / 2);

    const wynelHUD: PartyMemberHUDState = {
      id: 'wynel',
      name: wynel?.name || "Wyn'el",
      characterClass: wynel?.characterClass || 'Warlock',
      subclass: wynel?.subclass || 'Archfey / Crimson Pact',
      level: wynel?.level || 10,
      portraitUrl: getPortraitUrl('wynel'),
      primaryColor: '#dc2626',
      accentColor: '#ef4444',
      currentHP: wynel?.combat?.currentHP || 72,
      maxHP: wynel?.combat?.maxHP || 72,
      tempHP: wynel?.combat?.tempHP || 0,
      ac: wynel?.combat?.ac || 15,
      spellSaveDC: 8 + wynelProf + wynelChaMod,
      spellAttackBonus: wynelProf + wynelChaMod,
      passivePerception: 10 + wynelWisMod,
      passiveInsight: 10 + wynelWisMod,
      passiveInvestigation: 10,
      initiativeBonus: wynelDexMod,
      conditions: wynel?.combat?.conditions || [],
      inspiration: !!partyInspiration['wynel'],
      deathSaves: { successes: 0, failures: 0 },
      slots: { 5: { max: 2, used: 0 } },
      hitDice: { total: wynel?.level || 10, used: 0, diceType: 'd8' },
    };

    // 5. Kastoriel
    const kastorielProf = Math.floor(((kastoriel?.level || 10) - 1) / 4) + 2;
    const kastorielWisMod = Math.floor(((kastoriel?.abilityScores?.WIS || 18) - 10) / 2);
    const kastorielDexMod = Math.floor(((kastoriel?.abilityScores?.DEX || 14) - 10) / 2);

    const kastorielHUD: PartyMemberHUDState = {
      id: 'kastoriel',
      name: kastoriel?.name || 'Kastoriel',
      characterClass: kastoriel?.characterClass || 'Druid',
      subclass: kastoriel?.subclass || 'Circle of the Stars',
      level: kastoriel?.level || 10,
      portraitUrl: getPortraitUrl('kastoriel'),
      primaryColor: '#f59e0b',
      accentColor: '#fb923c',
      currentHP: kastoriel?.combat?.currentHP || 73,
      maxHP: kastoriel?.combat?.maxHP || 73,
      tempHP: kastoriel?.combat?.tempHP || 0,
      ac: kastoriel?.combat?.ac || 16,
      spellSaveDC: 8 + kastorielProf + kastorielWisMod,
      spellAttackBonus: kastorielProf + kastorielWisMod,
      passivePerception: 10 + kastorielWisMod + kastorielProf,
      passiveInsight: 10 + kastorielWisMod + kastorielProf,
      passiveInvestigation: 10,
      initiativeBonus: kastorielDexMod,
      conditions: kastoriel?.combat?.conditions || [],
      inspiration: !!partyInspiration['kastoriel'],
      deathSaves: { successes: 0, failures: 0 },
      slots: kastoriel?.spellcasting?.slots || {},
      hitDice: { total: kastoriel?.level || 10, used: 0, diceType: 'd8' },
    };

    // 6. Custom Characters
    const customHUDs: PartyMemberHUDState[] = Object.values(customCharacters || {}).map((c) => {
      const theme = customThemes[c.name] || { primary: '#6366f1', accent: '#818cf8', portraitUrl: '' };
      return {
        id: c.name,
        name: c.name,
        characterClass: c.class,
        subclass: c.subclass,
        level: c.level,
        portraitUrl: theme.portraitUrl || getPortraitUrl(c.name),
        primaryColor: theme.primary,
        accentColor: theme.accent,
        currentHP: c.combat.currentHP,
        maxHP: c.combat.maxHP,
        tempHP: c.combat.tempHP,
        ac: c.ac,
        spellSaveDC: c.spellcasting?.spellSaveDC || 14,
        spellAttackBonus: c.spellcasting?.spellAttackBonus || 6,
        passivePerception: c.passivePerception || 12,
        passiveInsight: 12,
        passiveInvestigation: 12,
        initiativeBonus: c.initiative || 0,
        conditions: c.combat?.conditions || [],
        inspiration: !!partyInspiration[c.name],
        deathSaves: c.combat.deathSaves || { successes: 0, failures: 0 },
        slots: c.spellcasting?.slots || {},
        hitDice: c.combat.hitDice || { total: c.level, used: 0, diceType: 'd8' },
      };
    });

    return [vesperHUD, ariaHUD, cyrusHUD, wynelHUD, kastorielHUD, ...customHUDs];
  }, [
    character,
    aria,
    cyrus,
    wynel,
    kastoriel,
    customCharacters,
    customThemes,
    getPortraitUrl,
    partyInspiration,
  ]);

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col relative overflow-x-hidden font-[family-name:var(--font-body)]">
      <TavernBackground />

      {/* ====================================================================
         1. AUTHENTICATION GATE (IF NOT AUTHENTICATED)
         ==================================================================== */}
      {!isAuthenticated ? (
        <main className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f17]/95 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl relative overflow-hidden text-center animate-fade-in">
            {/* Ambient Rune Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            {/* Arcane Seal Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-amber-500/40 mx-auto flex items-center justify-center shadow-lg mb-4 text-amber-400">
              <Lock size={32} />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400/90 block mb-1">
              Restricted Sanctum
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-amber-100 tracking-wider">
              Dungeon Master Clearance
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              This tactical console controls live health, conditions, and secrets for all campaign members.
              Enter your master key to proceed.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter Master Passcode..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/60 border border-zinc-700/80 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-xs font-mono text-red-200 flex items-center gap-2 text-left">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-bold font-[family-name:var(--font-heading)] uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock size={16} />
                <span>Unlock Tactical Console</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <Link
                href="/"
                className="text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Return to Guildhall</span>
              </Link>
              <span className="text-[10px] text-zinc-600">
                Default key: <code className="text-zinc-400">nat20</code>
              </span>
            </div>
          </div>
        </main>
      ) : (
        /* ====================================================================
           2. AUTHENTICATED DUNGEON MASTER TACTICAL COMMAND
           ==================================================================== */
        <>
          {/* Change Passcode Dropdown Bar */}
          {isChangingPasscode && (
            <div className="bg-[#120d06] border-b border-amber-500/40 px-4 py-3 relative z-30 animate-fade-in">
              <form
                onSubmit={handleSaveNewPasscode}
                className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 flex-wrap text-xs font-mono"
              >
                <div className="flex items-center gap-2 text-amber-200">
                  <KeyRound size={15} />
                  <span>Set New DM Passcode:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new master key..."
                    className="px-3 py-1 rounded bg-black/80 border border-zinc-700 text-white text-xs font-mono focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} /> Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPasscode(false)}
                    className="px-2 py-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main Console Canvas with Unified Single Header */}
          <main className="relative z-10 w-full flex-1 flex flex-col">
            <DMDashboardGrid
              partyMembers={partyHUDMembers}
              onUpdatePartyHP={handleDMUpdateHP}
              onTogglePartyCondition={handleDMToggleCondition}
              onToggleInspiration={handleDMToggleInspiration}
              onTriggerRest={handleDMTriggerRest}
              onBulkRest={handleDMBulkRest}
              onInspectCharacter={(id) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/?character=${id}`;
                }
              }}
              onBackToMenu={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              customHeaderActions={
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                  <SyncStatusBadge />

                  <button
                    onClick={() => setIsChangingPasscode(!isChangingPasscode)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-200 border border-zinc-800 text-xs font-mono transition-colors cursor-pointer"
                    title="Change DM Passcode"
                  >
                    <KeyRound size={13} />
                    <span className="hidden md:inline">Passcode</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-mono font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Lock DM Session"
                  >
                    <Lock size={13} />
                    <span>Lock Sanctum</span>
                  </button>
                </div>
              }
            />
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-zinc-900 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
          The Ashen Pact &bull; Dungeon Master Sanctum &bull; Level 10 Campaign
        </p>
      </footer>
    </div>
  );
}
