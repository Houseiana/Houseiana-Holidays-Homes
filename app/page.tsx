'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Search, Globe, Menu, User, Heart, Star, ChevronLeft, ChevronRight,
  Home, Building, Palmtree, Waves, Castle, Tent, Ship
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  coverPhoto?: string;
  photos?: string | any[];
  averageRating?: number;
  bookingCount?: number;
  createdAt?: string;
}

export default function HouseianaHome() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All', icon: Home },
    { id: 'APARTMENT', name: 'Apartments', icon: Building },
    { id: 'VILLA', name: 'Villas', icon: Castle },
    { id: 'HOUSE', name: 'Houses', icon: Home },
    { id: 'beach', name: 'Beachfront', icon: Waves },
    { id: 'tropical', name: 'Tropical', icon: Palmtree },
    { id: 'TENT', name: 'Camping', icon: Tent },
    { id: 'BOAT', name: 'Boats', icon: Ship },
  ];

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties');
        const data = await response.json();

        if (data.success && data.properties) {
          // Filter published properties and limit to 12
          const publishedProperties = data.properties
            .filter((p: Property) => p)
            .slice(0, 12);
          setProperties(publishedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties by category
  const filteredProperties = activeCategory === 'all'
    ? properties
    : properties.filter(p => p.title?.toLowerCase().includes(activeCategory.toLowerCase()));

  const getPropertyImage = (property: Property) => {
    if (property.coverPhoto) return property.coverPhoto;
    if (property.photos) {
      try {
        const photos = typeof property.photos === 'string' ? JSON.parse(property.photos) : property.photos;
        if (Array.isArray(photos) && photos.length > 0) return photos[0];
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop';
  };

  const isNewProperty = (property: Property) => {
    if (!property.createdAt) return false;
    const createdDate = new Date(property.createdAt);
    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated < 30; // New if created within last 30 days
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-rose-500">houseiana</span>
            </Link>

            {/* Search Bar */}
            <div
              className={`hidden md:flex items-center border rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer ${searchFocused ? 'shadow-md' : ''}`}
              onClick={() => router.push('/discover')}
            >
              <button className="px-4 py-3 text-sm font-medium border-r hover:bg-gray-50 rounded-l-full">
                Anywhere
              </button>
              <button className="px-4 py-3 text-sm font-medium border-r hover:bg-gray-50">
                Any week
              </button>
              <button className="px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-3">
                Add guests
                <div className="bg-rose-500 p-2 rounded-full">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-4">
              <Link href="/host-dashboard/add-listing">
                <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full">
                  List your home
                </button>
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-5 h-5" />
              </button>
              <Link href={isSignedIn ? '/client-dashboard' : '/sign-in'}>
                <button className="flex items-center gap-2 border rounded-full p-2 hover:shadow-md transition-shadow">
                  <Menu className="w-4 h-4" />
                  <div className="bg-gray-500 rounded-full p-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-6 pb-4">
          <button
            onClick={() => router.push('/discover')}
            className="w-full flex items-center gap-4 border rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <Search className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Anywhere</p>
              <p className="text-xs text-gray-500">Any week · Add guests</p>
            </div>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide">
              <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex flex-col items-center gap-2 px-4 py-2 min-w-fit border-b-2 transition-all ${
                      activeCategory === category.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                  </button>
                );
              })}

              <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Property Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No properties found</p>
            <Link href="/discover">
              <button className="mt-4 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600">
                Explore All Properties
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle wishlist toggle
                      }}
                      className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                    >
                      <Heart className="w-6 h-6 text-white drop-shadow-lg" />
                    </button>
                    {isNewProperty(property) && (
                      <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
                        Guest favorite
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {property.city}, {property.country}
                      </h3>
                      {property.averageRating && property.averageRating > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{property.averageRating.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm truncate">{property.title}</p>
                    <p className="text-gray-500 text-sm">Available now</p>
                    <p className="text-gray-900">
                      <span className="font-semibold">${property.pricePerNight}</span>
                      <span className="text-gray-500"> night</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana</span>
              <span>·</span>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:underline">Terms</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" />
                English (US)
              </button>
              <button className="text-sm font-medium">$ USD</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => router.push('/discover')}
            className="flex flex-col items-center gap-1 text-rose-500"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Explore</span>
          </button>
          <button
            onClick={() => router.push('/saved-properties')}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">Wishlists</span>
          </button>
          <button
            onClick={() => router.push(isSignedIn ? '/client-dashboard' : '/sign-in')}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">{isSignedIn ? 'Profile' : 'Log in'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
