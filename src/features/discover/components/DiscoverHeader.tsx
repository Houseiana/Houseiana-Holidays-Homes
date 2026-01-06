import React from 'react';
import { Search, Filter } from 'lucide-react';
import { DiscoverFilters } from '@/hooks/discover/use-discover';

interface DiscoverHeaderProps {
  destination: string;
  updateFilter: <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => void;
  onToggleAirbnbFilter: () => void;
  onToggleMobileFilters: () => void;
}

export function DiscoverHeader({
  destination,
  updateFilter,
  onToggleAirbnbFilter,
  onToggleMobileFilters,
}: DiscoverHeaderProps) {
  return (
    <div className="bg-white sticky top-0 z-40 safe-area-inset-top border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Input Container */}
            <div className="flex-1 relative group">
              <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                <div className="pl-4 text-gray-400">
                   <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => updateFilter('destination', e.target.value)}
                  className="w-full pl-3 pr-4 py-3 bg-transparent border-none rounded-full focus:ring-0 focus:outline-none outline-none text-gray-900 placeholder-gray-500 text-base"
                />
                
                {/* Mobile Quick Filter Trigger inside bar (Optional integration) */}
                <button
                   onClick={onToggleMobileFilters}
                   className="md:hidden pr-2 pl-2 text-gray-500"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop Filter Button */}
            <button
              onClick={onToggleAirbnbFilter}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all duration-200 whitespace-nowrap shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Mobile Filter Buttons Row (if separate from bar) */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-1">
               <button
                  onClick={onToggleAirbnbFilter}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap"
               >
                 <Filter className="w-4 h-4" />
                 Advanced
               </button>
               <button
                  onClick={onToggleMobileFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap"
               >
                 <Filter className="w-4 h-4" />
                 Quick Filters
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
