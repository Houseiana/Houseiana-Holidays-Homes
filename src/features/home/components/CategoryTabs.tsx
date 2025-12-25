'use client';

import { 
  ChevronLeft, ChevronRight, Home, Building, Palmtree, 
  Waves, Castle, Tent, Ship 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All Homes', icon: Home },
    { id: 'apartments', name: 'Apartments', icon: Building },
    { id: 'villas', name: 'Luxury Villas', icon: Castle },
    { id: 'beach', name: 'Beachfront', icon: Waves },
    { id: 'tropical', name: 'Tropical', icon: Palmtree },
    { id: 'camping', name: 'Camping', icon: Tent },
    { id: 'boats', name: 'Houseboats', icon: Ship },
  ];

  return (
    <div className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4 py-4 overflow-x-auto scrollbar-hide">
          <button className="hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={`flex flex-col items-center gap-2 px-4 py-2 min-w-fit transition-all ${
                  activeCategory === category.id
                    ? 'opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Icon className={`w-6 h-6 ${activeCategory === category.id ? 'text-teal-600' : ''}`} />
                <span className={`text-xs whitespace-nowrap ${activeCategory === category.id ? 'font-semibold text-teal-600 border-b-2 border-teal-600 pb-1' : 'font-medium'}`}
                >
                  {category.name}
                </span>
              </button>
            );
          })}

          <button className="hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200 flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Filter Button */}
          <button
            onClick={() => router.push('/discover')}
            className="ml-4 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path fillRule="evenodd" d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
            </svg>
            <span className="text-xs font-medium">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
