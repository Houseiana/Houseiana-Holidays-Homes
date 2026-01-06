import React from 'react';

interface AmenityButtonProps {
  label: string;
  emoji: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const AmenityButton = ({
  label,
  emoji,
  checked,
  onChange
}: AmenityButtonProps) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors h-20 ${
      checked
        ? 'border-black bg-gray-50'
        : 'border-gray-300 hover:border-gray-400'
    }`}
  >
    <span className="text-2xl mb-1">{emoji}</span>
    <span className="text-xs font-medium text-gray-900 text-center">{label}</span>
  </button>
);
