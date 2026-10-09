'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CloudFog, Dices, EyeOff, MapPin, Minus, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import type { AtmosphereState, TimeOfDay, WeatherCondition } from '@/lib/dm-types';

interface DMSlideOverToolsProps {
  open: boolean;
  onClose: () => void;
  atmosphere: AtmosphereState;
  onUpdateAtmosphere: (updates: Partial<AtmosphereState>) => void;
}

const TIMES_OF_DAY: TimeOfDay[] = ['Dawn', 'Morning', 'Noon', 'Afternoon', 'Dusk', 'Night', 'Midnight'];

const WEATHERS: Array<{ name: WeatherCondition; icon: string }> = [
  { name: 'Clear Skies', icon: '☀️' },
  { name: 'Overcast', icon: '☁️' },
  { name: 'Dense Fog', icon: '🌫️' },
  { name: 'Gentle Rain', icon: '🌧️' },
  { name: 'Thunderstorm', icon: '⛈️' },
  { name: 'Blood Mist', icon: '🩸' },
  { name: 'Howling Blizzard', icon: '❄️' },
];

const DC_LADDER = [
  { dc: 5, label: 'Very Easy' },
  { dc: 10, label: 'Easy' },
  { dc: 15, label: 'Medium' },
  { dc: 20, label: 'Hard' },
  { dc: 25, label: 'Very Hard' },
  { dc: 30, label: 'Nearly Impossible' },
];

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;

type RollMode = 'normal' | 'adv' | 'dis';

interface RollEntry {
  id: string;
  sides: number;
  count: number;
  modifier: number;
  mode: RollMode;
  rolls: number[];
  kept: number[];
  total: number;
  nat?: 'crit' | 'fumble';
}

const rollOne = (sides: number) => Math.floor(Math.random() * sides) + 1;

/**
 * Right-hand slide-over for secret dice + session atmosphere.
 * Overlays the workspace instead of pushing it down (no layout shift).
 */
export default function DMSlideOverTools({ open, onClose, atmosphere, onUpdateAtmosphere }: DMSlideOverToolsProps) {
  const [modifier, setModifier] = useState(0);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<RollMode>('normal');
  const [log, setLog] = useState<RollEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const roll = (sides: number) => {
    // Advantage / disadvantage only applies to a single d20.
    const useMode: RollMode = sides === 20 && count === 1 ? mode : 'normal';
    let rolls: number[];
    let kept: number[];
    if (useMode !== 'normal') {
      rolls = [rollOne(20), rollOne(20)];
      kept = [useMode === 'adv' ? Math.max(...rolls) : Math.min(...rolls)];
    } else {
      rolls = Array.from({ length: count }, () => rollOne(sides));
      kept = rolls;
    }
    const nat: 'crit' | 'fumble' | undefined =
      sides === 20 && kept.length === 1
        ? kept[0] === 20
          ? 'crit'
          : kept[0] === 1
          ? 'fumble'
          : undefined
        : undefined;
    const total = kept.reduce((a, b) => a + b, 0) + modifier;
    setLog((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sides,
          count: useMode !== 'normal' ? 1 : count,
          modifier,
          mode: useMode,
          rolls,
          kept,
          total,
          nat,
        },
        ...prev,
      ].slice(0, 8)
    );
  };

  const formula = (e: RollEntry) =>
    `${e.count}d${e.sides}${e.modifier ? (e.modifier > 0 ? `+${e.modifier}` : e.modifier) : ''}${
      e.mode === 'adv' ? ' adv' : e.mode === 'dis' ? ' dis' : ''
    }`;

  const latest = log[0];

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="DM tools">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-[400px] bg-[#0b0c12] border-l border-amber-500/20 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col font-mono text-xs animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Dices size={15} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-100 font-[family-name:var(--font-heading)]">
                DM Tools
              </h2>
              <p className="text-[10px] text-zinc-500">Secret rolls &amp; session atmosphere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
            aria-label="Close tools (Esc)"
            title="Close (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ===== Secret dice ===== */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              <EyeOff size={11} className="text-amber-400" /> Secret Roll
            </h3>

            {/* Result display */}
            <div
              className={`rounded-xl border p-4 text-center transition-colors ${
                latest?.nat === 'crit'
                  ? 'border-amber-400/70 bg-amber-500/10'
                  : latest?.nat === 'fumble'
                  ? 'border-red-600/70 bg-red-950/30'
                  : 'border-zinc-800 bg-zinc-950/70'
              }`}
              aria-live="polite"
            >
              {latest ? (
                <>
                  <p
                    key={latest.id}
                    className={`text-4xl font-extrabold leading-none animate-pop-in ${
                      latest.nat === 'crit' ? 'text-amber-300' : latest.nat === 'fumble' ? 'text-red-400' : 'text-zinc-100'
                    }`}
                  >
                    {latest.total}
                  </p>
                  <p className="mt-1.5 text-[10px] text-zinc-500">
                    {formula(latest)} &bull; rolled [{latest.rolls.join(', ')}]
                    {latest.nat === 'crit' && <span className="text-amber-300 font-bold"> &bull; NAT 20</span>}
                    {latest.nat === 'fumble' && <span className="text-red-400 font-bold"> &bull; NAT 1</span>}
                  </p>
                </>
              ) : (
                <p className="text-zinc-600 py-2">Pick a die. Only you can see the result.</p>
              )}
            </div>

            {/* Dice buttons */}
            <div className="grid grid-cols-7 gap-1">
              {DICE.map((d) => (
                <button
                  key={d}
                  onClick={() => roll(d)}
                  className={`py-2 rounded-lg border font-bold cursor-pointer transition-colors ${
                    d === 20
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:text-amber-200'
                  }`}
                >
                  d{d}
                </button>
              ))}
            </div>

            {/* Count / modifier / mode */}
            <div className="grid grid-cols-2 gap-2">
              <Stepper label="Dice" value={count} min={1} max={20} onChange={setCount} format={(v) => `×${v}`} />
              <Stepper
                label="Modifier"
                value={modifier}
                min={-20}
                max={30}
                onChange={setModifier}
                format={(v) => (v >= 0 ? `+${v}` : `${v}`)}
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800" role="radiogroup" aria-label="d20 roll mode">
              {(
                [
                  { id: 'normal', label: 'Normal' },
                  { id: 'adv', label: 'Advantage' },
                  { id: 'dis', label: 'Disadvantage' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    mode === m.id
                      ? m.id === 'adv'
                        ? 'bg-emerald-900/80 text-emerald-100'
                        : m.id === 'dis'
                        ? 'bg-red-900/80 text-red-100'
                        : 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode !== 'normal' && count > 1 && (
              <p className="text-[10px] text-zinc-500">Advantage/disadvantage only applies to a single d20.</p>
            )}

            {/* Log */}
            {log.length > 1 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-600">Recent</span>
                  <button
                    onClick={() => setLog([])}
                    className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 cursor-pointer"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                </div>
                <ul className="space-y-0.5">
                  {log.slice(1).map((e) => (
                    <li key={e.id} className="flex items-center justify-between px-2 py-1 rounded bg-zinc-950/60 text-[10px]">
                      <span className="text-zinc-500">{formula(e)}</span>
                      <span
                        className={`font-bold ${
                          e.nat === 'crit' ? 'text-amber-300' : e.nat === 'fumble' ? 'text-red-400' : 'text-zinc-300'
                        }`}
                      >
                        {e.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DC ladder */}
            <div className="grid grid-cols-3 gap-1">
              {DC_LADDER.map((d) => {
                const passes = latest ? latest.total >= d.dc : undefined;
                return (
                  <div
                    key={d.dc}
                    className={`px-2 py-1 rounded-md border text-[10px] ${
                      passes === undefined
                        ? 'border-zinc-800 bg-zinc-950/40 text-zinc-500'
                        : passes
                        ? 'border-emerald-900/70 bg-emerald-950/20 text-emerald-300/90'
                        : 'border-zinc-800 bg-zinc-950/40 text-zinc-600'
                    }`}
                    title={latest ? (passes ? 'Latest roll meets this DC' : 'Latest roll misses this DC') : undefined}
                  >
                    <span className="font-bold">DC {d.dc}</span> <span className="opacity-80">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===== Atmosphere ===== */}
          <section className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              <Clock size={11} className="text-amber-400" /> Session &amp; Atmosphere
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Stepper
                label="Session"
                value={atmosphere.sessionNumber}
                min={1}
                max={999}
                onChange={(v) => onUpdateAtmosphere({ sessionNumber: v })}
              />
              <Stepper
                label="In-game day"
                value={atmosphere.inGameDay}
                min={1}
                max={9999}
                onChange={(v) => onUpdateAtmosphere({ inGameDay: v })}
              />
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Time of day</span>
              <div className="flex flex-wrap gap-1">
                {TIMES_OF_DAY.map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateAtmosphere({ timeOfDay: t })}
                    aria-pressed={atmosphere.timeOfDay === t}
                    className={`px-2 py-1 rounded-md border text-[10px] cursor-pointer transition-colors ${
                      atmosphere.timeOfDay === t
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Weather</span>
              <div className="grid grid-cols-2 gap-1">
                {WEATHERS.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => onUpdateAtmosphere({ weather: w.name })}
                    aria-pressed={atmosphere.weather === w.name}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] text-left cursor-pointer transition-colors ${
                      atmosphere.weather === w.name
                        ? 'bg-amber-500/15 text-amber-200 border-amber-500/50 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <span>{w.icon}</span>
                    <span className="truncate">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
                <MapPin size={9} /> Location
              </span>
              <input
                type="text"
                value={atmosphere.locationName}
                onChange={(e) => onUpdateAtmosphere({ locationName: e.target.value })}
                placeholder="Where is the party?"
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
                <CloudFog size={9} /> Ambience note
              </span>
              <textarea
                value={atmosphere.ambianceNote || ''}
                onChange={(e) => onUpdateAtmosphere({ ambianceNote: e.target.value })}
                rows={3}
                placeholder="Smells, sounds, mood to describe…"
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-y"
              />
            </label>

            <button
              onClick={() => onUpdateAtmosphere({ inGameDay: atmosphere.inGameDay + 1, timeOfDay: 'Dawn' })}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-200 cursor-pointer"
            >
              <RotateCcw size={11} /> Advance to next dawn
            </button>
          </section>
        </div>

        <div className="px-4 py-2 border-t border-zinc-800 text-[9px] text-zinc-600 text-center">
          Press <kbd className="px-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">D</kbd> to toggle &bull;{' '}
          <kbd className="px-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Esc</kbd> to close
        </div>
      </aside>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div>
      <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">{label}</span>
      <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
        <button
          onClick={() => onChange(clamp(value - 1))}
          className="px-2 py-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={11} />
        </button>
        <span className="flex-1 text-center font-bold text-zinc-100">{format ? format(value) : value}</span>
        <button
          onClick={() => onChange(clamp(value + 1))}
          className="px-2 py-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
          aria-label={`Increase ${label}`}
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}
