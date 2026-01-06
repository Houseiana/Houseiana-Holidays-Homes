import React from 'react';

interface QuickFilterButtonProps {
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}

export function QuickFilterButton({ label, emoji, isActive, onClick }: QuickFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-3 border rounded-xl transition-all duration-200 text-sm font-medium active:scale-95 ${
        isActive 
          ? 'border-black bg-gray-50 shadow-sm ring-1 ring-black' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
      }`}
    >
      <span className="text-lg mr-2">{emoji}</span>
      {label}
    </button>
  );
}
