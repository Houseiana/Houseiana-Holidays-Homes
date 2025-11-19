/**
 * Property Search & Explore Page
 * Search and browse available properties
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Home, Search, Filter, MapPin, Calendar,
  Users, DollarSign, Heart, Building2, Zap, Star
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  pricePerNight: number;
  photos: string[];
  city: string;
  country: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  instantBook: boolean;
  averageRating?: number;
}

export default function ExplorePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    instantBook: false
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.guests) params.append('minGuests', filters.guests);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.propertyType) params.append('type', filters.propertyType);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.instantBook) params.append('instantBooking', 'true');

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/properties/search?${params}`);
      // const data = await response.json();
      // setProperties(data.properties);

      // Mock data for now
      setProperties([
        {
          id: '1',
          title: 'Luxury Beach Villa',
          description: 'Beautiful oceanfront property with stunning views',
          propertyType: 'VILLA',
          pricePerNight: 350,
          photos: [],
          city: 'Miami',
          country: 'USA',
          guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning'],
          instantBook: true,
          averageRating: 4.8
        },
        {
          id: '2',
          title: 'Modern Downtown Apartment',
          description: 'Stylish apartment in the heart of the city',
          propertyType: 'APARTMENT',
          pricePerNight: 120,
          photos: [],
          city: 'New York',
          country: 'USA',
          guests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ['WiFi', 'Kitchen', 'Workspace', 'Parking'],
          instantBook: false,
          averageRating: 4.5
        }
      ]);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Properties</h1>
        <p className="text-sm text-gray-500">Find your perfect stay from thousands of properties worldwide</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="City or country"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Check-in */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              Check-in
            </label>
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              Check-out
            </label>
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Guests */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Users className="w-3 h-3 inline mr-1" />
              Guests
            </label>
            <input
              type="number"
              value={filters.guests}
              onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
              placeholder="2"
              min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Building2 className="w-3 h-3 inline mr-1" />
              Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="CONDO">Condo</option>
              <option value="STUDIO">Studio</option>
              <option value="CABIN">Cabin</option>
              <option value="HOTEL">Hotel</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <DollarSign className="w-3 h-3 inline mr-1" />
              Min Price
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <DollarSign className="w-3 h-3 inline mr-1" />
              Max Price
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Instant Book */}
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.instantBook}
                onChange={(e) => setFilters({ ...filters, instantBook: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                <Zap className="w-4 h-4 text-orange-500" />
                Instant Book
              </span>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold text-sm"
          >
            <Search className="w-4 h-4" />
            Search Properties
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching properties...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          {/* No results */}
          {properties.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}

          {/* Property Grid */}
          {properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                >
                  {/* Property Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {property.photos.length > 0 ? (
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Instant Book Badge */}
                    {property.instantBook && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Instant Book
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                      {property.averageRating && (
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {property.averageRating}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.city}, {property.country}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>{property.guests} guests</span>
                      <span>•</span>
                      <span>{property.bedrooms} beds</span>
                      <span>•</span>
                      <span>{property.bathrooms} bath</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${property.pricePerNight}
                        </p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
