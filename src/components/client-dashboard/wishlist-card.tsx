'use client';

import { Wishlist } from '@/hooks';

interface WishlistCardProps {
  wishlist: Wishlist;
  onClick: () => void;
}

export function WishlistCard({ wishlist, onClick }: WishlistCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Mosaic Image Grid */}
      <div className="grid grid-cols-2 gap-1 h-64">
        {wishlist.previewImages.slice(0, 4).map((img, idx) => (
          <div
            key={idx}
            className={`relative ${idx === 0 ? 'col-span-2 row-span-1' : ''}`}
          >
            <img
              src={img}
              alt={`${wishlist.name} preview ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Wishlist Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {wishlist.name}
        </h3>
        <p className="text-sm text-gray-600">
          {wishlist.savedCount} saved
        </p>
      </div>
    </div>
  );
}
