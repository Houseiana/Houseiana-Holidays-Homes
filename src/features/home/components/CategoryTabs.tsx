'use client';

import { 
  ChevronLeft, ChevronRight, Home, Building, Palmtree, 
  Waves, Castle, Tent, Ship, HomeIcon, Building2, Hotel, TreePine
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BackendAPI from '@/lib/api/backend-api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (category: string) => void;
}

import { usePropertiesTypes } from '@/hooks/property/use-properties-types';
import Link from 'next/link';

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 9,
  slidesToScroll: 1,
  arrows: false,
  variableWidth: false,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 7,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    }
  ]
};

export default function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  const router = useRouter();
  // Ref to control the slider programmatically via external buttons
  const sliderRef = useRef<Slider>(null);

  const { propertyTypes, loading } = usePropertiesTypes();
  const [categories, setCategories] = useState<{ id: string; name: string; icon: any }[]>([]);

  useEffect(() => {
    if (propertyTypes.length > 0) {
      setCategories([
        { id: 'all', name: 'All Homes', icon: Home },
        ...propertyTypes.map(t => ({ id: t.id, name: t.name, icon: t.icon }))
      ]);
    }
  }, [propertyTypes]);

  const handlePrev = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  if (loading) return null; // Hide until data is ready as requested

  return (
    <div className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev}
            className="hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200 flex items-center justify-center w-5 h-5 md:w-8 md:h-8 transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <div className="flex-1 min-w-0">
            {/* Global style override for this component to fix slick layout in flex container */}
            <style jsx global>{`
              .slick-list { margin: 0 -8px; }
              .slick-slide { padding: 0 8px; }
              .slick-track { display: flex !important; margin-left: 0; }
            `}</style>
            
            <Slider ref={sliderRef} {...settings}>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="focus:outline-none">
                    <button
                    
                      onClick={() => onSelect(category.id)}
                      className={`w-full flex flex-col items-center gap-2 px-2 py-2 transition-all ${
                        activeCategory === category.id
                          ? 'opacity-100'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${activeCategory === category.id ? 'text-teal-600' : ''}`} />
                      <span className={`text-xs truncate w-full text-center px-1 ${activeCategory === category.id ? 'font-semibold text-teal-600 border-b-2 border-teal-600 pb-1' : 'font-medium'}`}
                      >
                        {category.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </Slider>
          </div>

          <button 
            onClick={handleNext}
            className="hover:bg-gray-100 rounded-full flex-shrink-0 border border-gray-200 flex items-center justify-center w-5 h-5 md:w-8 md:h-8 transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Filter Button */}
          <Link
            href="/properties"
            className="ml-2 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-900 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path fillRule="evenodd" d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
            </svg>
            <span className="text-xs font-medium hidden md:block">Filters</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
