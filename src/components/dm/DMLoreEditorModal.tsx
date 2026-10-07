'use client';

import React from 'react';
import DMLoreManager from './DMLoreManager';

interface DMLoreEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacterId?: string;
}

export default function DMLoreEditorModal({
  isOpen,
  onClose,
  initialCharacterId,
}: DMLoreEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] max-h-[850px] bg-[#07090e] rounded-2xl border border-amber-500/40 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col relative">
        <DMLoreManager
          initialCharacterId={initialCharacterId}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
}
