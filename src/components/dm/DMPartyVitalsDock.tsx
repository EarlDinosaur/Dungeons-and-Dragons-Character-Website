'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Shield, Sparkles, Users } from 'lucide-react';
import type { PartyMemberHUDState } from '@/lib/dm-types';
import { hpBand, hpPercent, HP_BAND_STYLES } from '@/lib/dm-hp';
import DMHPPopover, { anchorFromElement, type HPPopoverAnchor } from './DMHPPopover';

const DOCK_COLLAPSED_KEY = 'dnd_ashen_pact_dm_dock_collapsed';

interface DMPartyVitalsDockProps {
  partyMembers: PartyMemberHUDState[];
  onUpdatePartyHP: (charId: string, currentHP: number, tempHP?: number) => void;
  onTogglePartyCondition: (charId: string, condition: string) => void;
  onToggleInspiration: (charId: string) => void;
}

/**
 * Persistent party strip shown above every non-roster workspace so the DM never
 * loses sight of AC / HP / passive Perception / conditions mid-session.
 */
export default function DMPartyVitalsDock({
  partyMembers,
  onUpdatePartyHP,
  onTogglePartyCondition,
  onToggleInspiration,
}: DMPartyVitalsDockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [popover, setPopover] = useState<{ id: string; anchor: HPPopoverAnchor } | null>(null);

  // Restore collapse preference after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(DOCK_COLLAPSED_KEY) === 'true');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(DOCK_COLLAPSED_KEY, String(!prev));
      return !prev;
    });
  };

  const activeMember = popover ? partyMembers.find((m) => m.id === popover.id) : undefined;
  const downCount = partyMembers.filter((m) => m.currentHP <= 0).length;

  return (
    <section
      aria-label="Party vitals"
      className="shrink-0 border-b border-zinc-800/80 bg-[#090a0f]/95 backdrop-blur-md"
    >
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 flex items-center gap-2">
        {/* Label + collapse */}
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1.5 py-2 pr-2 border-r border-zinc-800/80 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-amber-300 cursor-pointer shrink-0"
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand party vitals' : 'Collapse party vitals'}
        >
          <Users size={12} className="text-amber-400/80" />
          <span className="hidden sm:inline">Party</span>
          {downCount > 0 && (
            <span className="px-1 rounded bg-red-950 text-red-300 border border-red-800/80 normal-case font-bold">
              {downCount} down
            </span>
          )}
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <ul className={`flex items-center ${collapsed ? 'gap-1.5 py-1.5' : 'gap-2 py-2'}`}>
            {partyMembers.map((m) => {
              const band = hpBand(m);
              const style = HP_BAND_STYLES[band];
              const pct = hpPercent(m);
              const accent = m.accentColor || m.primaryColor || '#d9b872';

              if (collapsed) {
                return (
                  <li key={m.id}>
                    <button
                      onClick={(e) => setPopover({ id: m.id, anchor: anchorFromElement(e.currentTarget) })}
                      className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 cursor-pointer"
                      title={`${m.name}: ${m.currentHP}/${m.maxHP} HP`}
                    >
                      <Portrait member={m} size={20} ring={band === 'healthy' ? accent : undefined} band={band} />
                      <span className={`text-[10px] font-mono font-bold ${style.text}`}>
                        {m.currentHP}
                      </span>
                    </button>
                  </li>
                );
              }

              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border bg-zinc-950/60 min-w-[170px] sm:min-w-[210px] transition-colors ${
                    band === 'down'
                      ? 'border-red-900/80 bg-red-950/20'
                      : band === 'critical'
                      ? 'border-red-900/50'
                      : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <Portrait member={m} size={30} ring={accent} band={band} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-zinc-100 truncate font-[family-name:var(--font-heading)]">
                        {m.name.split(' (')[0]}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        <span className="flex items-center gap-0.5 text-zinc-300" title="Armor Class">
                          <Shield size={10} className="text-zinc-500" />
                          {m.ac}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-300" title="Passive Perception">
                          <Eye size={10} className="text-amber-500/70" />
                          {m.passivePerception}
                        </span>
                        <button
                          onClick={() => onToggleInspiration(m.id)}
                          className={`p-0.5 rounded cursor-pointer ${
                            m.inspiration ? 'text-amber-300' : 'text-zinc-700 hover:text-zinc-400'
                          }`}
                          title={m.inspiration ? 'Has Inspiration (click to spend)' : 'Grant Inspiration'}
                          aria-pressed={m.inspiration}
                        >
                          <Sparkles size={11} className={m.inspiration ? 'fill-amber-400' : ''} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={(e) => setPopover({ id: m.id, anchor: anchorFromElement(e.currentTarget) })}
                      className="w-full text-left group cursor-pointer"
                      title="Adjust HP & conditions"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono leading-tight">
                        <span className="text-zinc-300 group-hover:text-amber-200">
                          <span className="font-bold">{m.currentHP}</span>
                          <span className="text-zinc-600">/{m.maxHP}</span>
                          {m.tempHP > 0 && <span className="text-cyan-300 font-bold"> +{m.tempHP}</span>}
                        </span>
                        {m.conditions.length > 0 ? (
                          <span className="text-red-300 truncate max-w-[110px]" title={m.conditions.join(', ')}>
                            {m.conditions[0]}
                            {m.conditions.length > 1 && ` +${m.conditions.length - 1}`}
                          </span>
                        ) : (
                          <span className={`${style.text} uppercase text-[9px]`}>
                            {band === 'healthy' ? `${pct}%` : style.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 h-1 w-full rounded-full bg-zinc-900 overflow-hidden">
                        <div className={`h-full ${style.bar} transition-all duration-300`} style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {popover && activeMember && (
        <DMHPPopover
          anchor={popover.anchor}
          title={activeMember.name}
          subtitle={`Lv ${activeMember.level} ${activeMember.characterClass}`}
          ac={activeMember.ac}
          hp={activeMember}
          onChange={(next) => onUpdatePartyHP(activeMember.id, next.currentHP, next.tempHP)}
          onClose={() => setPopover(null)}
          conditions={activeMember.conditions}
          onToggleCondition={(c) => onTogglePartyCondition(activeMember.id, c)}
        />
      )}
    </section>
  );
}

function Portrait({
  member,
  size,
  ring,
  band,
}: {
  member: PartyMemberHUDState;
  size: number;
  ring?: string;
  band: ReturnType<typeof hpBand>;
}) {
  const borderColor = band === 'down' || band === 'critical' ? '#ef4444' : ring || '#3f3f46';
  return (
    <span
      className={`relative shrink-0 rounded-full overflow-hidden bg-zinc-900 border-2 ${band === 'down' ? 'grayscale' : ''}`}
      style={{ width: size, height: size, borderColor }}
    >
      {member.portraitUrl ? (
        <img src={member.portraitUrl} alt="" className="w-full h-full object-cover object-top" />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center font-serif font-bold text-[11px]"
          style={{ color: ring || '#d9b872' }}
        >
          {member.name.charAt(0)}
        </span>
      )}
    </span>
  );
}
