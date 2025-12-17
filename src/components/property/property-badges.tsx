'use client';

import { Diamond, Heart } from 'lucide-react';

export interface PropertyBadgesProps {
  isRareFind: boolean;
  guestFavorite: boolean;
}

export function PropertyBadges({ isRareFind, guestFavorite }: PropertyBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isRareFind && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          <Diamond className="w-4 h-4" /> Rare find
        </span>
      )}
      {guestFavorite && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <Heart className="w-4 h-4 fill-current" /> Guest favorite
        </span>
      )}
    </div>
  );
}
