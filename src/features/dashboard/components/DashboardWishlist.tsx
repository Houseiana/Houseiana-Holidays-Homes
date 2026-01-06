'use client';

import { Heart, Star, MapPin, Trash2, ShoppingBag } from 'lucide-react';

export default function DashboardWishlist() {
  // TODO: Fetch from API - user's saved properties
  const wishlist: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    image: string;
    dates: string;
  }> = [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-500">Saved properties for your future adventures</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 shadow-sm hover:bg-rose-50 transition-colors">
                  <Trash2 size={18} />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {item.rating}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                  <MapPin size={14} />
                  {item.location}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xl font-bold text-gray-900">${item.price}</span>
                    <span className="text-sm text-gray-500"> / night</span>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Heart size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Start exploring to find your dream stay.</p>
          <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
            Explore Properties
          </button>
        </div>
      )}
    </div>
  );
}
