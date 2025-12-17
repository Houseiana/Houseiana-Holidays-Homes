'use client';

import { Check } from 'lucide-react';

interface SavedToastProps {
  isVisible: boolean;
  message?: string;
}

export function SavedToast({ isVisible, message = 'Settings saved' }: SavedToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
