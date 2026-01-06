'use client';

import { ChevronLeft, Share, Heart } from 'lucide-react';

export interface PropertyHeaderProps {
  onBack: () => void;
  onShare: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function PropertyHeader({ onBack, onShare, isLiked, onToggleLike }: PropertyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-semibold"
          >
            <Share className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm font-semibold ${
              isLiked ? 'text-rose-600 border-rose-200' : 'border-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            Save
          </button>
        </div>
      </div>
    </header>
  );
}
