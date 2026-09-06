'use client';

import { useState } from 'react';
import { Award, ShieldCheck, Wrench, Languages, Plus, Trash2, X, Check, BookMarked, Sparkles } from 'lucide-react';
import SpotlightCard from '../../ui/SpotlightCard';
import type { CharacterState, CustomFeat, NonStatProficiencies } from '@/lib/types';
import { useCharacter } from '@/app/providers';

interface ProgressionPanelProps {
  character: CharacterState;
}

export default function ProgressionPanel({ character }: ProgressionPanelProps) {
  const { addFeat, deleteFeat, updateProficiencies } = useCharacter();

  // Modal State for Adding Feat / Trait
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [featForm, setFeatForm] = useState<Omit<CustomFeat, 'id'>>({
    title: '',
    description: '',
    source: 'Racial / Class Trait',
    level: character.level,
  });

  // Tag Input State for Proficiencies
  const [tagInputs, setTagInputs] = useState<Record<keyof NonStatProficiencies, string>>({
    armor: '',
    weapons: '',
    tools: '',
    languages: '',
  });

  const handleCreateFeat = () => {
    if (!featForm.title.trim()) return;
    addFeat(featForm);
    setIsFeatModalOpen(false);
    setFeatForm({
      title: '',
      description: '',
      source: 'Racial / Class Trait',
      level: character.level,
    });
  };

  const handleAddTag = (category: keyof NonStatProficiencies) => {
    const text = tagInputs[category].trim();
    if (!text) return;
    const currentTags = character.proficiencies?.[category] || [];
    if (!currentTags.includes(text)) {
      updateProficiencies(category, [...currentTags, text]);
    }
    setTagInputs({ ...tagInputs, [category]: '' });
  };

  const handleRemoveTag = (category: keyof NonStatProficiencies, tagToRemove: string) => {
    const currentTags = character.proficiencies?.[category] || [];
    updateProficiencies(category, currentTags.filter((t) => t !== tagToRemove));
  };

  const feats = character.feats || [];
  const proficiencies = character.proficiencies || {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ["Thieves' Tools", "Poisoner's Kit", "Disguise Kit"],
    languages: ['Common', 'Elvish', 'Thieves\' Cant'],
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* FEATS & CUSTOM TRAITS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] flex items-center gap-2 flex-1">
            <Award size={18} />
            Feats &amp; Special Traits ({feats.length})
            <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
          </h2>

          <button
            onClick={() => setIsFeatModalOpen(true)}
            className="btn btn-gold btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} /> Add Feat / Feature
          </button>
        </div>

        {feats.length === 0 ? (
          <div className="glass-card p-6 text-center text-xs text-[var(--color-parchment-dim)]">
            No feats recorded yet. Click &ldquo;Add Feat / Feature&rdquo; to add custom capabilities.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feats.map((feat) => (
              <SpotlightCard key={feat.id} className="p-4 relative group" spotlightColor="rgba(255, 215, 0, 0.08)">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-[var(--color-gold-300)] font-semibold text-sm">
                      {feat.title}
                    </h3>
                    <p className="text-[10px] text-[var(--color-parchment-dim)] font-[family-name:var(--font-mono)]">
                      {feat.source} &bull; Unlocked Lv {feat.level}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteFeat(feat.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg"
                    title="Remove Feat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <p className="text-xs text-[var(--color-parchment-muted)]">
                  {feat.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

      {/* NON-STAT PROFICIENCIES & LANGUAGES */}
      <div>
        <h2 className="text-lg font-[family-name:var(--font-heading)] text-[var(--color-gold-400)] mb-4 flex items-center gap-2">
          <BookMarked size={18} />
          Proficiencies &amp; Languages Known
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold-700)] to-transparent" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Armor Proficiencies */}
          <SpotlightCard className="p-4" spotlightColor="rgba(59, 130, 246, 0.06)">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="text-blue-400" size={16} />
              <h3 className="font-bold text-xs uppercase text-[var(--color-parchment)] tracking-wider font-[family-name:var(--font-heading)]">
                Armor Proficiencies
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(proficiencies.armor || []).map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-950/50 text-blue-300 border border-blue-800/40 px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag('armor', tag)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add armor (e.g. Medium Armor, Shields)"
                value={tagInputs.armor}
                onChange={(e) => setTagInputs({ ...tagInputs, armor: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('armor')}
                className="flex-1 bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => handleAddTag('armor')}
                className="btn btn-ghost btn-sm text-xs"
              >
                Add
              </button>
            </div>
          </SpotlightCard>

          {/* Weapon Proficiencies */}
          <SpotlightCard className="p-4" spotlightColor="rgba(239, 68, 68, 0.06)">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-red-400" size={16} />
              <h3 className="font-bold text-xs uppercase text-[var(--color-parchment)] tracking-wider font-[family-name:var(--font-heading)]">
                Weapon Proficiencies
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(proficiencies.weapons || []).map((tag) => (
                <span
                  key={tag}
                  className="bg-red-950/50 text-red-300 border border-red-800/40 px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag('weapons', tag)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add weapon (e.g. Martial Weapons, Firearms)"
                value={tagInputs.weapons}
                onChange={(e) => setTagInputs({ ...tagInputs, weapons: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('weapons')}
                className="flex-1 bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => handleAddTag('weapons')}
                className="btn btn-ghost btn-sm text-xs"
              >
                Add
              </button>
            </div>
          </SpotlightCard>

          {/* Tool & Instrument Proficiencies */}
          <SpotlightCard className="p-4" spotlightColor="rgba(249, 115, 22, 0.06)">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="text-orange-400" size={16} />
              <h3 className="font-bold text-xs uppercase text-[var(--color-parchment)] tracking-wider font-[family-name:var(--font-heading)]">
                Tool &amp; Instrument Proficiencies
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(proficiencies.tools || []).map((tag) => (
                <span
                  key={tag}
                  className="bg-orange-950/50 text-orange-300 border border-orange-800/40 px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag('tools', tag)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add tool (e.g. Herbalism Kit, Lute)"
                value={tagInputs.tools}
                onChange={(e) => setTagInputs({ ...tagInputs, tools: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('tools')}
                className="flex-1 bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => handleAddTag('tools')}
                className="btn btn-ghost btn-sm text-xs"
              >
                Add
              </button>
            </div>
          </SpotlightCard>

          {/* Languages Known */}
          <SpotlightCard className="p-4" spotlightColor="rgba(168, 85, 247, 0.06)">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="text-purple-400" size={16} />
              <h3 className="font-bold text-xs uppercase text-[var(--color-parchment)] tracking-wider font-[family-name:var(--font-heading)]">
                Languages Known
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(proficiencies.languages || []).map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-950/50 text-purple-300 border border-purple-800/40 px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag('languages', tag)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add language (e.g. Draconic, Undercommon)"
                value={tagInputs.languages}
                onChange={(e) => setTagInputs({ ...tagInputs, languages: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('languages')}
                className="flex-1 bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => handleAddTag('languages')}
                className="btn btn-ghost btn-sm text-xs"
              >
                Add
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* ADD FEAT MODAL */}
      {isFeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-gold-500)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsFeatModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-parchment-dim)] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,215,0,0.2)]">
              <Award className="text-[var(--color-gold-400)]" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-gold-400)] font-[family-name:var(--font-heading)]">
                Add Feat or Feature
              </h2>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Title / Feature Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharpshooter, Lucky, Fey Touched"
                  value={featForm.title}
                  onChange={(e) => setFeatForm({ ...featForm, title: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Source / Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Feat (Level 4), Racial Trait"
                    value={featForm.source}
                    onChange={(e) => setFeatForm({ ...featForm, source: e.target.value })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                    Unlocked Level
                  </label>
                  <input
                    type="number"
                    value={featForm.level}
                    onChange={(e) => setFeatForm({ ...featForm, level: Number(e.target.value) })}
                    className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[var(--color-parchment-dim)] mb-1">
                  Description &amp; Mechanics
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe mechanics, bonuses, or abilities granted..."
                  value={featForm.description}
                  onChange={(e) => setFeatForm({ ...featForm, description: e.target.value })}
                  className="w-full bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,215,0,0.15)]">
              <button
                onClick={() => setIsFeatModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--color-parchment-dim)] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFeat}
                className="btn btn-gold btn-sm text-xs flex items-center gap-1.5"
              >
                <Check size={14} /> Add Feat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
