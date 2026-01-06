'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  if (!images.length) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="max-w-5xl w-full px-6">
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        className="absolute right-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
