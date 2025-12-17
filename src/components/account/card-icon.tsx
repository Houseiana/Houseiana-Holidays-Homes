'use client';

import { CreditCard } from 'lucide-react';

interface CardIconProps {
  type: 'visa' | 'mastercard' | 'amex' | 'discover' | string;
  className?: string;
}

export function CardIcon({ type, className = '' }: CardIconProps) {
  const normalizedType = type?.toLowerCase();

  if (normalizedType === 'visa') {
    return (
      <div className={`w-10 h-7 bg-[#1A1F71] rounded flex items-center justify-center ${className}`}>
        <span className="text-white text-xs font-bold italic">VISA</span>
      </div>
    );
  }

  if (normalizedType === 'mastercard') {
    return (
      <div className={`w-10 h-7 bg-gray-900 rounded flex items-center justify-center ${className}`}>
        <div className="flex -space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (normalizedType === 'amex') {
    return (
      <div className={`w-10 h-7 bg-blue-600 rounded flex items-center justify-center ${className}`}>
        <span className="text-white text-[8px] font-bold">AMEX</span>
      </div>
    );
  }

  if (normalizedType === 'discover') {
    return (
      <div className={`w-10 h-7 bg-orange-500 rounded flex items-center justify-center ${className}`}>
        <span className="text-white text-[8px] font-bold">DISC</span>
      </div>
    );
  }

  // Default card icon
  return <CreditCard className={`w-6 h-6 text-gray-400 ${className}`} />;
}
