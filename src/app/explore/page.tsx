'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { 
  Search, MapPin, Calendar, Users, SlidersHorizontal, 
  Heart, Star, ChevronDown, Map as MapIcon, List, Filter
} from 'lucide-react';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamicImport(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-3xl">
      <p className="text-gray-400 font-medium">Loading Map...</p>
    </div>
  )
});

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  superhost: boolean;
  type: string;
}

function ExploreContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Mock Data
  const properties: Property[] = [
    {
      id: '1',
      title: 'Modern Beachfront Villa',
      location: 'Malibu, California',
      price: 450,
      rating: 4.9,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop',
      amenities: ['Pool', 'Wifi', 'Kitchen'],
      superhost: true,
      type: 'Villa'
    },
    {
      id: '2',
      title: 'Cozy Mountain Cabin',
      location: 'Aspen, Colorado',
      price: 280,
      rating: 4.8,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop',
      amenities: ['Fireplace', 'Hiking', 'Wifi'],
      superhost: false,
      type: 'Cabin'
    },
    {
      id: '3',
      title: 'Luxury City Penthouse',
      location: 'New York, NY',
      price: 650,
      rating: 4.95,
      reviews: 210,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
      amenities: ['Gym', 'Concierge', 'View'],
      superhost: true,
      type: 'Apartment'
    },
    {
      id: '4',
      title: 'Secluded Forest Retreat',
      location: 'Portland, Oregon',
      price: 180,
      rating: 4.7,
      reviews: 64,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
      amenities: ['Hot Tub', 'Nature', 'Wifi'],
      superhost: true,
      type: 'Cabin'
    },
    {
      id: '5',
      title: 'Tropical Island Bungalow',
      location: 'Maui, Hawaii',
      price: 550,
      rating: 4.85,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
      amenities: ['Beach Access', 'AC', 'Pool'],
      superhost: false,
      type: 'Bungalow'
    },
    {
      id: '6',
      title: 'Historic Downtown Loft',
      location: 'Charleston, SC',
      price: 320,
      rating: 4.92,
      reviews: 180,
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop',
      amenities: ['Walkable', 'Kitchen', 'Wifi'],
      superhost: true,
      type: 'Apartment'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header / Search Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-xl hidden md:block">Houseiana</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow p-1.5">
              <div className="flex-1 px-4 border-r border-gray-200">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Where</label>
                <input type="text" placeholder="Search destinations" className="w-full text-sm font-medium outline-none text-gray-900 placeholder-gray-400" />
              </div>
              <div className="hidden md:block flex-1 px-4 border-r border-gray-200">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Check in</label>
                <input type="text" placeholder="Add dates" className="w-full text-sm font-medium outline-none text-gray-900 placeholder-gray-400" />
              </div>
              <div className="hidden md:block flex-1 px-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Who</label>
                <input type="text" placeholder="Add guests" className="w-full text-sm font-medium outline-none text-gray-900 placeholder-gray-400" />
              </div>
              <button className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 transition-colors shrink-0">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3 shrink-0">
             <Link href="/become-host" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden md:block">
              Switch to hosting
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
               <img src="https://i.pravatar.cc/150?img=3" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="border-t border-gray-100 py-4 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:border-gray-900 transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {['Beachfront', 'Cabins', 'Trending', 'Amazing Pools', 'Islands', 'Mansions'].map((filter) => (
                  <button key={filter} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 whitespace-nowrap transition-colors">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <List size={20} />
               </button>
               <button 
                 onClick={() => setViewMode('map')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <MapIcon size={20} />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-200">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-black/10 hover:bg-white hover:scale-110 transition-all backdrop-blur-sm text-white hover:text-rose-500">
                    <Heart size={20} fill={property.id === '1' ? 'currentColor' : 'none'} className={property.id === '1' ? 'text-rose-500' : ''} />
                  </button>
                  {property.superhost && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                      Superhost
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate pr-4">{property.location}</h3>
                    <p className="text-gray-500 text-sm mb-1">{property.type}</p>
                    <p className="text-gray-500 text-sm mb-2">{property.amenities.slice(0, 2).join(' • ')}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-gray-900">${property.price}</span>
                      <span className="text-gray-500 text-sm">night</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-gray-900 fill-gray-900" />
                    <span className="font-medium">{property.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)] sticky top-24">
             <Map properties={properties} />
          </div>
        )}
      </main>
      
      {/* Floating Map Toggle (Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden z-40">
        <button 
          onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
          className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {viewMode === 'grid' ? (
            <>
              <MapIcon size={18} /> Map
            </>
          ) : (
            <>
              <List size={18} /> List
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
