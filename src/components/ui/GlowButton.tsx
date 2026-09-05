'use client';

import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'gold' | 'crimson' | 'lavender' | 'default';
  fullWidth?: boolean;
  className?: string;
}

export default function GlowButton({
  children,
  variant = 'gold',
  fullWidth = false,
  className = '',
  ...props
}: GlowButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-bold font-[family-name:var(--font-heading)] rounded-xl py-3 px-6 text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    gold: 'bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-400)] text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] hover:scale-[1.02]',
    crimson: 'bg-gradient-to-r from-[var(--color-crimson-800)] to-[var(--color-crimson-600)] text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] hover:scale-[1.02]',
    lavender: 'bg-gradient-to-r from-[#8f76d6] to-[#a992e8] text-black shadow-[0_0_20px_rgba(169,146,232,0.4)] hover:shadow-[0_0_30px_rgba(169,146,232,0.7)] hover:scale-[1.02]',
    default: 'bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] hover:border-[var(--color-gold-400)] hover:text-white',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
