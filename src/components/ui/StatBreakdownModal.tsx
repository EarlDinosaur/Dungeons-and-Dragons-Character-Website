'use client';

import { X, HelpCircle, Calculator, Info } from 'lucide-react';
import type { StatBreakdown } from '@/lib/calc-engine';

interface StatBreakdownModalProps {
  breakdown: StatBreakdown | null;
  onClose: () => void;
}

export default function StatBreakdownModal({ breakdown, onClose }: StatBreakdownModalProps) {
  if (!breakdown) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0e1017] border border-[var(--color-border-subtle)] rounded-xl shadow-2xl p-6 relative overflow-hidden animate-scale-up"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--char-primary,#dc2626)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--char-primary,#dc2626)]/15 text-[var(--char-accent,#ffd700)] border border-[var(--char-primary,#dc2626)]/30">
              <Calculator size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-parchment-dim)] flex items-center gap-1.5">
                <span>D&D 5e Computation</span>
              </div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--char-accent,#ffd700)]">
                {breakdown.statName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Big Total & Formula Display */}
        <div className="mb-5 p-4 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center text-center">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
            Calculated Result
          </span>
          <span className="text-3xl font-black font-mono text-white tracking-tight mb-2">
            {breakdown.displayValue}
          </span>
          <div className="px-3 py-1.5 rounded-md bg-[var(--char-primary,#dc2626)]/10 border border-[var(--char-primary,#dc2626)]/25 text-xs font-mono text-[var(--char-accent,#ffd700)] break-all max-w-full">
            {breakdown.formula}
          </div>
        </div>

        {/* Step-by-Step Breakdown Table */}
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 px-1">
            Calculation Components
          </div>
          <div className="divide-y divide-zinc-800/60 rounded-lg border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
            {breakdown.parts.map((part, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 text-xs">
                <div className="flex flex-col pr-2">
                  <span className="font-medium text-zinc-200">{part.label}</span>
                  {part.description && (
                    <span className="text-[10px] text-zinc-400">{part.description}</span>
                  )}
                </div>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs shrink-0 ${
                    part.type === 'ability'
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                      : part.type === 'proficiency'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                      : part.type === 'equipment'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      : part.type === 'feature'
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                      : part.type === 'penalty'
                      ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {part.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation Summary */}
        <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-300 flex items-start gap-2 mb-4">
          <Info size={15} className="text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">{breakdown.summary}</p>
        </div>

        {breakdown.notes && (
          <p className="text-[10px] text-zinc-500 italic text-center mb-4">
            {breakdown.notes}
          </p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
