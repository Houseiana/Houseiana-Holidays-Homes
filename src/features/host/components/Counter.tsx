import { Minus, Plus } from 'lucide-react';

interface CounterProps {
  label: string;
  sublabel?: string;
  value: number;
  field: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (field: string, delta: number) => void;
}

export const Counter = ({ label, sublabel, value, field, min = 1, max, step = 1, onChange }: CounterProps) => (
  <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0">
    <div>
      <span className="text-lg text-gray-900">{label}</span>
      {sublabel && <p className="text-sm text-gray-500">{sublabel}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(field, -step)}
        disabled={value <= min}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
          value <= min
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
        }`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center text-lg">{value}</span>
      <button
        onClick={() => onChange(field, step)}
        disabled={max ? value >= max : false}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
          max && value >= max
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
        }`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);
