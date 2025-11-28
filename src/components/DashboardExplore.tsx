'use client';

import { useState } from 'react';
import { 
  Search, MapPin, Calendar, Users, Home, DollarSign, 
  Check, SlidersHorizontal, Heart, Star, ChevronDown 
} from 'lucide-react';

export default function DashboardExplore() {
  const [instantBook, setInstantBook] = useState(false);

  // TODO: Fetch from API based on search filters
  const properties: Array<{
    id: string;
    title: string;
    location: string;
    rating: number;
    guests: number;
    beds: number;
    baths: number;
    price: number;
    image: string;
    instantBook: boolean;
  }> = [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Properties</h1>
        <p className="text-gray-500">Find your perfect stay from thousands of properties worldwide</p>
      </div>

      {/* Search Filters Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Where to?" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in - Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Add dates" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guests</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="number" 
                placeholder="Add guests" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property Type</label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none text-gray-500">
                <option>Any Type</option>
                <option>Villa</option>
                <option>Apartment</option>
                <option>Cabin</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Price</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="number" 
                placeholder="Min" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="number" 
                placeholder="Max" 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

           {/* Instant Book Toggle */}
           <div className="md:col-span-2 flex items-end pb-1">
            <div 
              onClick={() => setInstantBook(!instantBook)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${instantBook ? 'bg-orange-600' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${instantBook ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Instant Book Only</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-600/30 flex items-center gap-2">
            <Search size={20} />
            Search Properties
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{properties.length} properties found</h2>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900">
            <SlidersHorizontal size={18} />
            Sort by: Recommended
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                  <Heart size={20} />
                </button>
                {property.instantBook && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Instant Book
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {property.rating}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin size={14} />
                      {property.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 py-3 border-y border-gray-50">
                  <span className="flex items-center gap-1"><Users size={14} /> {property.guests} guests</span>
                  <span>•</span>
                  <span>{property.beds} beds</span>
                  <span>•</span>
                  <span>{property.baths} bath</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900">${property.price}</span>
                    <span className="text-sm text-gray-500"> / night</span>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
