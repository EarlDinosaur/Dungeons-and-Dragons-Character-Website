'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Heart, Minus, Plus, Shield, X } from 'lucide-react';
import {
  ALL_CONDITIONS,
  applyDamage,
  applyHeal,
  applyTempHP,
  hpBand,
  hpPercent,
  HP_BAND_STYLES,
  type HPState,
} from '@/lib/dm-hp';

export interface HPPopoverAnchor {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function anchorFromElement(el: HTMLElement): HPPopoverAnchor {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
}

interface DMHPPopoverProps {
  anchor: HPPopoverAnchor;
  title: string;
  subtitle?: string;
  ac?: number;
  hp: HPState;
  /** Called with the new HP state. `damageTaken` is set when the change came from damage. */
  onChange: (next: HPState, damageTaken?: number) => void;
  onClose: () => void;
  conditions?: string[];
  onToggleCondition?: (condition: string) => void;
}

const POPOVER_WIDTH = 300;
const MARGIN = 8;

/**
 * Anchored, non-blocking HP + conditions editor.
 * Quick steps (-10/-5/-1/+1/+5/+10), a custom amount field (Enter = damage,
 * Shift+Enter = heal), temp HP, and an optional condition grid.
 */
export default function DMHPPopover({
  anchor,
  title,
  subtitle,
  ac,
  hp,
  onChange,
  onClose,
  conditions,
  onToggleCondition,
}: DMHPPopoverProps) {
  const [amount, setAmount] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: anchor.bottom + 6, left: anchor.left });

  // Keep the panel inside the viewport (flip above the anchor if there's no room below, center on mobile).
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const height = panel?.offsetHeight ?? 320;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // On small mobile screens, center the popover so it never clips edges
    if (vw < 640) {
      const modalLeft = Math.max(MARGIN, (vw - Math.min(POPOVER_WIDTH, vw - MARGIN * 2)) / 2);
      const modalTop = Math.max(MARGIN, Math.min(vh - height - MARGIN, (vh - height) / 2));
      setPos({ top: modalTop, left: modalLeft });
      return;
    }

    let left = Math.min(Math.max(MARGIN, anchor.left), vw - POPOVER_WIDTH - MARGIN);
    if (vw < POPOVER_WIDTH + MARGIN * 2) left = MARGIN;
    let top = anchor.bottom + 6;
    if (top + height > vh - MARGIN) {
      top = Math.max(MARGIN, anchor.top - height - 6);
    }
    setPos({ top, left });
  }, [anchor, conditions?.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const parsed = parseInt(amount, 10);
  const hasAmount = !isNaN(parsed) && parsed > 0;

  const damage = (n: number) => {
    onChange(applyDamage(hp, n), n);
    setAmount('');
  };
  const heal = (n: number) => {
    onChange(applyHeal(hp, n));
    setAmount('');
  };
  const temp = (n: number) => {
    onChange(applyTempHP(hp, n));
    setAmount('');
  };

  const band = hpBand(hp);
  const pct = hpPercent(hp);
  const bandStyle = HP_BAND_STYLES[band];

  return (
    <>
      {/* Transparent click-catcher: closes without dimming the screen */}
      <div className="fixed inset-0 z-[120]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Adjust ${title}`}
        className="fixed z-[121] rounded-xl bg-[#0e1018] border border-amber-500/30 shadow-[0_18px_50px_rgba(0,0,0,0.75)] font-mono text-xs animate-pop-in"
        style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH, maxWidth: `calc(100vw - ${MARGIN * 2}px)` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-zinc-800/80">
          <div className="min-w-0">
            <p className="font-bold text-zinc-100 truncate font-[family-name:var(--font-heading)] text-[13px]">
              {title}
            </p>
            {subtitle && <p className="text-[10px] text-zinc-500 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {ac !== undefined && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold">
                <Shield size={10} className="text-zinc-500" /> {ac}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* HP readout */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="flex items-baseline gap-1">
                <Heart size={11} className={`${bandStyle.text} self-center`} />
                <span className="text-lg font-bold text-zinc-100 leading-none">{hp.currentHP}</span>
                <span className="text-zinc-500">/ {hp.maxHP}</span>
                {hp.tempHP > 0 && <span className="text-cyan-300 font-bold ml-1">+{hp.tempHP} temp</span>}
              </span>
              <span className={`text-[10px] font-bold uppercase ${bandStyle.text}`}>{bandStyle.label}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className={`h-full ${bandStyle.bar} transition-all duration-300`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Quick steps */}
          <div className="grid grid-cols-6 gap-1">
            {[10, 5, 1].map((n) => (
              <button
                key={`d${n}`}
                onClick={() => damage(n)}
                className="py-1.5 rounded-md bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/80 font-bold cursor-pointer transition-colors"
                title={`Deal ${n} damage`}
              >
                −{n}
              </button>
            ))}
            {[1, 5, 10].map((n) => (
              <button
                key={`h${n}`}
                onClick={() => heal(n)}
                className="py-1.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-900/80 font-bold cursor-pointer transition-colors"
                title={`Heal ${n}`}
              >
                +{n}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              autoFocus
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasAmount) {
                  e.preventDefault();
                  if (e.shiftKey) heal(parsed);
                  else damage(parsed);
                }
              }}
              placeholder="Amount…"
              aria-label="HP amount"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm font-bold text-center placeholder:text-zinc-600 placeholder:font-normal focus:border-amber-400 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-1">
              <button
                disabled={!hasAmount}
                onClick={() => damage(parsed)}
                className="flex items-center justify-center gap-1 py-1.5 rounded-md bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800/80 font-bold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={11} /> Damage
              </button>
              <button
                disabled={!hasAmount}
                onClick={() => heal(parsed)}
                className="flex items-center justify-center gap-1 py-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 font-bold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={11} /> Heal
              </button>
              <button
                disabled={!hasAmount}
                onClick={() => temp(parsed)}
                className="py-1.5 rounded-md bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 border border-cyan-800/80 font-bold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title="Temp HP doesn't stack: keeps the higher value"
              >
                Temp
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-600">
              <span>Enter = damage &bull; Shift+Enter = heal</span>
              {hp.tempHP > 0 && (
                <button
                  onClick={() => onChange({ ...hp, tempHP: 0 })}
                  className="text-cyan-500/80 hover:text-cyan-300 cursor-pointer"
                >
                  Clear temp
                </button>
              )}
            </div>
          </div>

          {/* Conditions */}
          {conditions && onToggleCondition && (
            <div className="pt-2 border-t border-zinc-800/80">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5">Conditions</p>
              <div className="flex flex-wrap gap-1">
                {ALL_CONDITIONS.map((c) => {
                  const active = conditions.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => onToggleCondition(c)}
                      aria-pressed={active}
                      className={`px-1.5 py-0.5 rounded border text-[10px] cursor-pointer transition-colors ${
                        active
                          ? 'bg-red-900/70 text-red-100 border-red-600/80 font-bold'
                          : 'bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
