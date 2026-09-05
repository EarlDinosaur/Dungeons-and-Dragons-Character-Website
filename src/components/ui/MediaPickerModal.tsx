'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, X, Check, Upload, Sparkles, Smartphone } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { useCharacter } from '@/app/providers';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'portraits' | 'backgrounds';
}

const PRESET_WALLPAPERS = [
  { id: 'cyrus-temple', name: 'Celestial Solar Temple (Default Cyrus)', url: '/images/cyrus-bg.jpg', hero: 'cyrus' },
  { id: 'golden-sanctuary', name: 'Sunfire Sanctuary', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', hero: 'cyrus' },
  { id: 'night-sky', name: 'Starlight Constellations (Default Aria)', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80', hero: 'aria' },
  { id: 'cosmic-nebula', name: 'Cosmic Astral Void', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=1200&q=80', hero: 'aria' },
  { id: 'shadow-realm', name: 'Shadow Realm Citadel (Default Vesper)', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', hero: 'vesper' },
  { id: 'dark-gothic', name: 'Gothic Obsidian Keep', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', hero: 'vesper' },
  { id: 'tavern-warm', name: 'Cozy Guildhall Tavern (Default Menu)', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80', hero: 'menu' },
];

export default function MediaPickerModal({ isOpen, onClose, defaultTab = 'portraits' }: MediaPickerModalProps) {
  const { customMedia, setCustomPortrait, setCustomBackground, resetMedia, getPortraitUrl, getBackgroundUrl } = useCharacter();
  const [activeTab, setActiveTab] = useState<'portraits' | 'backgrounds'>(defaultTab);
  const [selectedCharacter, setSelectedCharacter] = useState<'vesper' | 'aria' | 'cyrus' | 'menu'>('cyrus');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size (max 5MB for fast mobile performance)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large! Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (activeTab === 'portraits') {
        if (selectedCharacter !== 'menu') {
          setCustomPortrait(selectedCharacter, dataUrl);
        }
      } else {
        setCustomBackground(selectedCharacter, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const activePortrait = selectedCharacter !== 'menu' ? getPortraitUrl(selectedCharacter) : '';
  const activeBackground = getBackgroundUrl(selectedCharacter);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Mobile Drawer Container */}
      <div className="w-full sm:max-w-2xl bg-[#0f0d0a] border-t sm:border border-[#daa520]/40 rounded-t-2xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col overflow-hidden font-['Spectral',serif]">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#daa520]/20 flex items-center justify-between bg-gradient-to-r from-[#1a1608] to-[#120f07] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[rgba(218,165,32,0.15)] border border-[#daa520]/40 flex items-center justify-center text-[#daa520]">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Cormorant_Garamond',serif] text-amber-100 flex items-center gap-2">
                Mobile Media &amp; Theme Customizer
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                  <Smartphone size={10} /> Mobile Optimized
                </span>
              </h2>
              <p className="text-xs text-[#b89d5e]">
                Upload custom portraits &amp; background wallpapers from your camera roll
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/10 hover:border-[#daa520] flex items-center justify-center text-[#b89d5e] hover:text-white transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-[#daa520]/20 bg-black/40 shrink-0">
          <button
            onClick={() => setActiveTab('portraits')}
            className={`flex-1 py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              activeTab === 'portraits'
                ? 'text-[#daa520] border-b-2 border-[#daa520] bg-[rgba(218,165,32,0.1)]'
                : 'text-[#b89d5e]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera size={15} /> Character Portraits
          </button>

          <button
            onClick={() => setActiveTab('backgrounds')}
            className={`flex-1 py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              activeTab === 'backgrounds'
                ? 'text-[#daa520] border-b-2 border-[#daa520] bg-[rgba(218,165,32,0.1)]'
                : 'text-[#b89d5e]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon size={15} /> Background Wallpapers
          </button>
        </div>

        {/* Character Selection Pills (Horizontal Touch Slider) */}
        <div className="p-3 bg-[#141008] border-b border-[#daa520]/15 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] font-mono text-[#b89d5e] uppercase shrink-0 mr-1 font-bold">
            Target Hero:
          </span>
          {(['cyrus', 'aria', 'vesper', 'menu'] as const).map((hero) => {
            const isMenu = hero === 'menu';
            if (activeTab === 'portraits' && isMenu) return null; // No portrait for menu
            const label = hero === 'cyrus' ? '☀️ Cyrus' : hero === 'aria' ? '🌙 Aria' : hero === 'vesper' ? '🗡️ Vesper' : '📜 Guildhall Menu';
            const isSelected = selectedCharacter === hero;
            return (
              <button
                key={hero}
                onClick={() => setSelectedCharacter(hero)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all min-h-[36px] flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#daa520] text-black font-bold shadow-[0_0_12px_rgba(218,165,32,0.5)]'
                    : 'bg-black/50 text-[#b89d5e] border border-white/10 hover:border-[#daa520]/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Active Preview Box */}
          <div className="glass-card p-4 rounded-xl border border-[#daa520]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-200 uppercase font-bold flex items-center gap-1">
                <Sparkles size={13} className="text-[#daa520]" />
                Active {activeTab === 'portraits' ? 'Portrait' : 'Wallpaper'} Preview
              </span>
              <span className="text-[10px] font-mono text-[#b89d5e] capitalize">
                {selectedCharacter} Target
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-[#daa520]/40 bg-black/60 aspect-[16/9] flex items-center justify-center group">
              {activeTab === 'portraits' ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#daa520] shadow-2xl">
                  <img
                    src={activePortrait}
                    alt="Active Portrait Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: `url('${activeBackground}')` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="relative z-10 px-4 py-1.5 rounded-full bg-black/70 border border-[#daa520]/50 text-xs font-mono text-amber-200 font-bold">
                    Wallpaper Active Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Native Phone Camera/File Upload */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-gold w-full py-3 flex items-center justify-center gap-2 text-sm font-mono font-bold shadow-lg min-h-[48px] active:scale-95"
            >
              <Upload size={18} />
              Upload Custom Image from Phone / File Picker
            </button>

            <p className="text-[11px] text-[#b89d5e] text-center italic">
              Supports JPG, PNG, WEBP from your mobile photo gallery or camera.
            </p>
          </div>

          {/* Preset Wallpapers Gallery (For Quick Tap Selection on Mobile) */}
          {activeTab === 'backgrounds' && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-xs font-mono font-bold text-amber-200 uppercase tracking-wider">
                Curated Fantasy Wallpaper Presets
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_WALLPAPERS.map((preset) => {
                  const isCurrent = activeBackground === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setCustomBackground(selectedCharacter, preset.url)}
                      className={`relative rounded-xl overflow-hidden border aspect-[16/9] group text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#daa520] ring-2 ring-[#daa520]/50 shadow-[0_0_15px_rgba(218,165,32,0.4)]'
                          : 'border-white/10 hover:border-[#daa520]/50'
                      }`}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url('${preset.url}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-mono text-white font-bold truncate">
                          {preset.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#daa520] rounded-full flex items-center justify-center text-black">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-[#daa520]/20 bg-[#120f07] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              if (confirm('Reset all custom portraits & wallpapers back to default artwork?')) {
                resetMedia();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 px-3 py-2 rounded-lg transition-all active:scale-95 min-h-[40px]"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="btn btn-ghost text-xs font-mono font-bold px-5 py-2 min-h-[40px]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
