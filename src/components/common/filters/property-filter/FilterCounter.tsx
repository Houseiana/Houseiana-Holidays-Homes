import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface FilterCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const FilterCounter = ({
  label,
  value,
  onChange,
  min = 0,
  max
}: FilterCounterProps) => {
  const increment = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + 1);
  };
  const decrement = () => onChange(value > min ? value - 1 : min);

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-base text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value === min}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600
                     hover:border-black hover:text-black transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>
        <span className="text-base font-medium text-gray-900 w-8 text-center">
          {value === 0 ? 'Any' : value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600
                     hover:border-black hover:text-black transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
