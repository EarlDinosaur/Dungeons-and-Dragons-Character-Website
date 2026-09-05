'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Moon, Sparkles, Wand2, Heart, Package, Scroll, Shield, Coins, Info, X, CheckCircle2 } from 'lucide-react';

export type ToastType = 'rest' | 'power' | 'spell' | 'hp' | 'inventory' | 'quest' | 'level' | 'currency' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      showToast: (title: string, message: string) => console.log(`[Toast] ${title}: ${message}`),
    };
  }
  return ctx;
}

const ICON_MAP: Record<ToastType, React.ComponentType<{ size?: number; className?: string }>> = {
  rest: Moon,
  power: Sparkles,
  spell: Wand2,
  hp: Heart,
  inventory: Package,
  quest: Scroll,
  level: Shield,
  currency: Coins,
  info: Info,
};

const COLOR_MAP: Record<ToastType, { border: string; bg: string; text: string; iconColor: string }> = {
  rest: { border: 'border-[#a992e8]', bg: 'from-[#171b3f] to-[#0d1026]', text: 'text-[#e8e6ff]', iconColor: 'text-[#a992e8]' },
  power: { border: 'border-[#daa520]', bg: 'from-[#2a220a] to-[#120e06]', text: 'text-amber-100', iconColor: 'text-[#daa520]' },
  spell: { border: 'border-[#c7c2e6]', bg: 'from-[#1d2249] to-[#14183a]', text: 'text-amber-100', iconColor: 'text-[#a992e8]' },
  hp: { border: 'border-[var(--color-crimson-500)]', bg: 'from-[#2b0f14] to-[#120709]', text: 'text-red-100', iconColor: 'text-[var(--color-crimson-400)]' },
  inventory: { border: 'border-[var(--color-gold-600)]', bg: 'from-[#1f1a12] to-[#0f0c08]', text: 'text-amber-100', iconColor: 'text-[var(--color-gold-400)]' },
  quest: { border: 'border-amber-500', bg: 'from-[#241c12] to-[#120e09]', text: 'text-amber-100', iconColor: 'text-amber-400' },
  level: { border: 'border-[#ffd700]', bg: 'from-[#282108] to-[#120f04]', text: 'text-amber-100', iconColor: 'text-[#ffd700]' },
  currency: { border: 'border-amber-400', bg: 'from-[#261f0a] to-[#110d04]', text: 'text-amber-100', iconColor: 'text-amber-300' },
  info: { border: 'border-[#daa520]/50', bg: 'from-[#1a1608] to-[#0d0a06]', text: 'text-amber-100', iconColor: 'text-[#daa520]' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastItem = { id, title, message, type };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Portal Stack */}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 max-w-sm w-full pointer-events-none font-['Spectral',serif]">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type] || Info;
          const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border-2 ${colors.border} bg-gradient-to-r ${colors.bg} shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-start gap-3 relative overflow-hidden animate-slide-in-right transition-all duration-300`}
            >
              {/* Top Accent Shimmer */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className={`p-2 rounded-lg bg-black/60 border border-white/10 ${colors.iconColor} shrink-0`}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className={`text-sm font-bold font-['Cormorant_Garamond',serif] ${colors.text} uppercase tracking-wider`}>
                    {toast.title}
                  </h4>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-white transition-colors p-0.5"
                    aria-label="Close notification"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-xs text-amber-200/80 font-mono leading-snug">
                  {toast.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
