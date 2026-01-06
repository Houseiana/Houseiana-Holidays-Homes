'use client';

import { Sparkles } from 'lucide-react';

export interface DescriptionSectionProps {
  description: string;
  perks: string[];
}

export function DescriptionSection({ description, perks }: DescriptionSectionProps) {
  return (
    <div className="space-y-3 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Why you&apos;ll love it</h2>
      </div>
      <p className="text-gray-700 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {perks.map((perk) => (
          <span key={perk} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {perk}
          </span>
        ))}
      </div>
    </div>
  );
}
