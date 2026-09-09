'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  CloudRain,
  Compass,
  Dices,
  Clock,
  Sparkles,
  RotateCcw,
  EyeOff,
  Flame,
  CloudFog,
} from 'lucide-react';
import type { TimeOfDay, WeatherCondition, AtmosphereState } from '@/lib/dm-types';

interface DMAtmosphereBarProps {
  atmosphere: AtmosphereState;
  onUpdateAtmosphere: (updates: Partial<AtmosphereState>) => void;
}

const TIMES_OF_DAY: TimeOfDay[] = [
  'Dawn',
  'Morning',
  'Noon',
  'Afternoon',
  'Dusk',
  'Night',
  'Midnight',
];

const WEATHERS: Array<{ name: WeatherCondition; icon: string }> = [
  { name: 'Clear Skies', icon: '☀️' },
  { name: 'Overcast', icon: '☁️' },
  { name: 'Dense Fog', icon: '🌫️' },
  { name: 'Gentle Rain', icon: '🌧️' },
  { name: 'Thunderstorm', icon: '⛈️' },
  { name: 'Blood Mist', icon: '🩸' },
  { name: 'Howling Blizzard', icon: '❄️' },
];

export default function DMAtmosphereBar({
  atmosphere,
  onUpdateAtmosphere,
}: DMAtmosphereBarProps) {
  // Dice Roller State
  const [diceLog, setDiceLog] = useState<
    Array<{ id: string; formula: string; result: number; rolls: number[]; isCrit?: boolean }>
  >([]);
  const [diceMod, setDiceMod] = useState<number>(0);
  const [isAdvantage, setIsAdvantage] = useState<boolean>(false);
  const [isDisadvantage, setIsDisadvantage] = useState<boolean>(false);

  const rollDie = (sides: number) => {
    let roll1 = Math.floor(Math.random() * sides) + 1;
    let rolls = [roll1];
    let finalDie = roll1;

    if (sides === 20 && (isAdvantage || isDisadvantage)) {
      let roll2 = Math.floor(Math.random() * sides) + 1;
      rolls = [roll1, roll2];
      finalDie = isAdvantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
    }

    const total = finalDie + diceMod;
    const isCrit = sides === 20 && finalDie === 20;

    const entry = {
      id: `roll-${Date.now()}`,
      formula: `d${sides}${diceMod !== 0 ? (diceMod > 0 ? `+${diceMod}` : diceMod) : ''}${
        isAdvantage ? ' (Adv)' : isDisadvantage ? ' (Dis)' : ''
      }`,
      result: total,
      rolls,
      isCrit,
    };

    setDiceLog((prev) => [entry, ...prev.slice(0, 4)]);
  };

  return (
    <div className="bg-[#0b0d13] border border-zinc-800/90 rounded-2xl p-3 shadow-md font-mono text-xs flex flex-wrap items-center justify-between gap-3">
      {/* 1. Time & Calendar Tracker */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock size={15} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[10px] uppercase">Session:</span>
              <input
                type="number"
                min={1}
                value={atmosphere.sessionNumber}
                onChange={(e) =>
                  onUpdateAtmosphere({ sessionNumber: parseInt(e.target.value, 10) || 1 })
                }
                className="w-10 bg-zinc-900 border border-zinc-700 rounded px-1 text-center font-bold text-amber-300"
              />
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-400 text-[10px] uppercase">Day:</span>
              <input
                type="number"
                min={1}
                value={atmosphere.inGameDay}
                onChange={(e) =>
                  onUpdateAtmosphere({ inGameDay: parseInt(e.target.value, 10) || 1 })
                }
                className="w-10 bg-zinc-900 border border-zinc-700 rounded px-1 text-center font-bold text-white"
              />
            </div>
          </div>
        </div>

        {/* Time of Day Pills */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px]">
          {TIMES_OF_DAY.map((t) => (
            <button
              key={t}
              onClick={() => onUpdateAtmosphere({ timeOfDay: t })}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                atmosphere.timeOfDay === t
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Weather Selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={atmosphere.weather}
            onChange={(e) =>
              onUpdateAtmosphere({ weather: e.target.value as WeatherCondition })
            }
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {WEATHERS.map((w) => (
              <option key={w.name} value={w.name}>
                {w.icon} {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. DM Secret Quick Dice Roller */}
      <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <EyeOff size={11} className="text-amber-400" />
            <span className="hidden md:inline">Secret Roll:</span>
          </span>

          {/* Quick Dice Buttons */}
          {[4, 6, 8, 10, 12, 20, 100].map((d) => (
            <button
              key={d}
              onClick={() => rollDie(d)}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 border border-zinc-700/80 text-[11px] font-bold cursor-pointer transition-colors"
            >
              d{d}
            </button>
          ))}
        </div>

        {/* Advantage / Disadvantage Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsAdvantage(!isAdvantage);
              if (!isAdvantage) setIsDisadvantage(false);
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
              isAdvantage
                ? 'bg-emerald-900 text-emerald-200 border-emerald-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
            title="Roll with Advantage (take highest of 2d20)"
          >
            ADV
          </button>
          <button
            onClick={() => {
              setIsDisadvantage(!isDisadvantage);
              if (!isDisadvantage) setIsAdvantage(false);
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
              isDisadvantage
                ? 'bg-red-900 text-red-200 border-red-500 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
            title="Roll with Disadvantage (take lowest of 2d20)"
          >
            DIS
          </button>
        </div>

        {/* Dice Result Badge */}
        {diceLog.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-amber-500/40 shadow-inner">
            <span className="text-[10px] text-zinc-400">{diceLog[0].formula}:</span>
            <span
              className={`font-bold text-xs ${
                diceLog[0].isCrit ? 'text-amber-400 animate-pulse font-extrabold' : 'text-white'
              }`}
            >
              {diceLog[0].result}
            </span>
            {diceLog[0].rolls.length > 1 && (
              <span className="text-[9px] text-zinc-500">({diceLog[0].rolls.join(', ')})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
