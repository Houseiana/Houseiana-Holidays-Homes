import React from 'react';
import { Minus, Plus } from 'lucide-react';


interface GuestCounterProps {
  label: string;
  description: string;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minValue?: number;
  maxValue?: number;
}

export const GuestCounter = ({
  label,
  description,
  count,
  onIncrease,
  onDecrease,
  minValue = 0,
  maxValue
}: GuestCounterProps) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        disabled={count <= minValue}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
          count <= minValue ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-900'
        }`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-6 text-center font-medium">{count}</span>
      <button
        onClick={onIncrease}
        disabled={maxValue !== undefined && count >= maxValue}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
          (maxValue !== undefined && count >= maxValue) ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-900'
        }`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default GuestCounter;
