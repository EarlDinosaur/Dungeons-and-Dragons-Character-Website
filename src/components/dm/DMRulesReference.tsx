'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Shield,
  Zap,
  Eye,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Info,
  Activity,
} from 'lucide-react';

const CONDITIONS_5E = [
  {
    name: 'Blinded',
    effect:
      'A blinded creature can’t see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.',
  },
  {
    name: 'Charmed',
    effect:
      'A charmed creature can’t attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.',
  },
  {
    name: 'Deafened',
    effect:
      'A deafened creature can’t hear and automatically fails any ability check that requires hearing.',
  },
  {
    name: 'Frightened',
    effect:
      'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can’t willingly move closer to the source of its fear.',
  },
  {
    name: 'Grappled',
    effect:
      'A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed. The condition ends if the grappler is incapacitated or an effect removes the creature from the grappler’s reach.',
  },
  {
    name: 'Incapacitated',
    effect: 'An incapacitated creature can’t take actions or reactions.',
  },
  {
    name: 'Invisible',
    effect:
      'An invisible creature is impossible to see without magic or a special sense. For the purpose of hiding, the creature is heavily obscured. Attack rolls against the creature have disadvantage, and the creature’s attack rolls have advantage.',
  },
  {
    name: 'Paralyzed',
    effect:
      'A paralyzed creature is incapacitated and can’t move or speak. Automatically fails Str and Dex saves. Attacks against it have advantage. Any attack that hits from within 5 ft is an automatic critical hit.',
  },
  {
    name: 'Petrified',
    effect:
      'A petrified creature is transformed into stone. It is incapacitated, can’t move or speak, and is unaware of its surroundings. Attack rolls against it have advantage. Has resistance to all damage.',
  },
  {
    name: 'Poisoned',
    effect: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
  },
  {
    name: 'Prone',
    effect:
      'A prone creature’s only movement option is to crawl (half speed), unless it stands up (costs half movement). Disadvantage on attack rolls. An attack against it has advantage within 5 ft, otherwise disadvantage.',
  },
  {
    name: 'Restrained',
    effect:
      'Speed becomes 0. Attack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage. Disadvantage on Dex saves.',
  },
  {
    name: 'Stunned',
    effect:
      'A stunned creature is incapacitated, can’t move, and can speak only falteringly. Automatically fails Str and Dex saving throws. Attack rolls against the creature have advantage.',
  },
  {
    name: 'Unconscious',
    effect:
      'Incapacitated, can’t move or speak, unaware of surroundings. Drops whatever it’s holding and falls prone. Automatically fails Str and Dex saves. Attacks within 5 ft have advantage and are automatic crits.',
  },
  {
    name: 'Exhaustion',
    effect:
      'Cumulative levels: 1: Disadv. on ability checks; 2: Speed halved; 3: Disadv. on attacks & saves; 4: HP max halved; 5: Speed reduced to 0; 6: Death. Long rest removes 1 level.',
  },
];

const COMBAT_ACTIONS = [
  { name: 'Attack', rule: 'Make one melee or ranged weapon attack (or multiple if Extra Attack).' },
  { name: 'Cast a Spell', rule: 'Cast a spell with a casting time of 1 action (respecting bonus action spell rules).' },
  { name: 'Dash', rule: 'Gain extra movement equal to your speed for the current turn.' },
  { name: 'Disengage', rule: 'Your movement doesn’t provoke opportunity attacks for the rest of the turn.' },
  { name: 'Dodge', rule: 'Attacks against you have disadvantage if you can see attacker. Advantage on Dex saves.' },
  { name: 'Help', rule: 'Give an ally advantage on next ability check, or advantage on next attack against target within 5 ft.' },
  { name: 'Hide', rule: 'Make a Dexterity (Stealth) check in an attempt to become hidden.' },
  { name: 'Ready', rule: 'Wait for a particular trigger before acting with your reaction.' },
  { name: 'Search', rule: 'Devote attention to finding something (Perception or Investigation check).' },
  { name: 'Use Object', rule: 'Interact with a second object on your turn (e.g., drink a potion, open locked chest).' },
];

export default function DMRulesReference() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'conditions' | 'actions' | 'cover'>('conditions');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredConditions = CONDITIONS_5E.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.effect.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = COMBAT_ACTIONS.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.rule.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0c12] text-zinc-200 font-mono text-xs">
      {/* Header */}
      <div className="p-3 bg-[#0d0f17] border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-amber-400" />
          <h3 className="font-bold text-zinc-100 text-xs uppercase tracking-wider font-[family-name:var(--font-heading)]">
            5e Rules &amp; SRD Compendium
          </h3>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[10px]">
          <button
            onClick={() => setActiveTab('conditions')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeTab === 'conditions' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Conditions
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeTab === 'actions' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeTab === 'cover' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cover &amp; DCs
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 bg-[#08090d] border-b border-zinc-800">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search rules, effects..."
            className="w-full pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {activeTab === 'conditions' && (
          <div className="space-y-1.5">
            {filteredConditions.map((cond) => {
              const isExpanded = expandedItem === cond.name;
              return (
                <div
                  key={cond.name}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : cond.name)}
                    className="w-full p-2 text-left flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-amber-300/90 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500" />
                      {cond.name}
                    </span>
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  {isExpanded && (
                    <div className="p-2.5 border-t border-zinc-800/60 text-zinc-300 text-[11px] leading-relaxed bg-zinc-950/90">
                      {cond.effect}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-1.5">
            {filteredActions.map((act) => (
              <div
                key={act.name}
                className="p-2 rounded-lg border border-zinc-800/80 bg-zinc-950/60 space-y-1"
              >
                <span className="font-bold text-sky-300 block">{act.name}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{act.rule}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cover' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2">
              <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1">
                <Shield size={13} /> Cover Rules
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="font-bold text-white">Half Cover: </span>
                  <span className="text-zinc-400">+2 bonus to AC and Dexterity saving throws.</span>
                </div>
                <div>
                  <span className="font-bold text-white">Three-Quarters Cover: </span>
                  <span className="text-zinc-400">+5 bonus to AC and Dexterity saving throws.</span>
                </div>
                <div>
                  <span className="font-bold text-white">Total Cover: </span>
                  <span className="text-zinc-400">Can’t be targeted directly by an attack or spell.</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2">
              <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1">
                <Zap size={13} /> Difficulty Class (DC) Scale
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-emerald-400 font-bold block">DC 5: Very Easy</span>
                  <span className="text-[10px] text-zinc-500">Noticeable details</span>
                </div>
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-emerald-300 font-bold block">DC 10: Easy</span>
                  <span className="text-[10px] text-zinc-500">Climb rough wall</span>
                </div>
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-amber-400 font-bold block">DC 15: Medium</span>
                  <span className="text-[10px] text-zinc-500">Pick standard lock</span>
                </div>
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-orange-400 font-bold block">DC 20: Hard</span>
                  <span className="text-[10px] text-zinc-500">Swim raging rapids</span>
                </div>
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-red-400 font-bold block">DC 25: Very Hard</span>
                  <span className="text-[10px] text-zinc-500">Recall forgotten rune</span>
                </div>
                <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-purple-400 font-bold block">DC 30: Nearly Impossible</span>
                  <span className="text-[10px] text-zinc-500">Track across bare stone</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
