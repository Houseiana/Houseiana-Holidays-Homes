import React from 'react';

interface CounterControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CounterControl({ label, value, onChange, min = 0, max }: CounterControlProps) {
  const handleIncrement = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + 1);
  };

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-base text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value === min}
          className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:border-black hover:text-black hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
        >
          <span className="text-base font-light">−</span>
        </button>
        <span className="text-base font-semibold text-gray-900 w-8 text-center tabular-nums">
          {value === 0 && min === 0 ? 'Any' : value}
        </span>
        <button
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:border-black hover:text-black hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
        >
          <span className="text-base font-light">+</span>
        </button>
      </div>
    </div>
  );
}
