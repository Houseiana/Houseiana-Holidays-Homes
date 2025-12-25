'use client';

import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

export interface ImageGalleryProps {
  images: string[];
  title: string;
  onImageClick: (index: number) => void;
}

export function ImageGallery({ images, title, onImageClick }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-[280px] sm:h-[360px] md:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="col-span-1 sm:col-span-1 md:col-span-2 relative h-full">
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover hover:scale-[1.01] transition-transform cursor-pointer"
          onClick={() => onImageClick(0)}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="hidden sm:grid sm:col-span-1 md:col-span-2 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {images.slice(1, 5).map((image, index) => (
          <div key={index} className="relative h-full">
            <Image
              src={image}
              alt={`Image ${index + 2}`}
              fill
              className="object-cover hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => onImageClick(index + 1)}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <button className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base pointer-events-auto">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Show all photos</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
