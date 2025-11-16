/**
 * Property Search Example Component
 * Demonstrates: Using the OOP API (v2) for searching properties
 *
 * This component shows how to:
 * - Search properties with various criteria
 * - Handle URL query parameters
 * - Display search results
 * - Use date range filtering
 */
'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  title: string;
  description: string;
  basePrice: { amount: number; currency: string };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  address: {
    city: string;
    country: string;
  };
  images: string[];
}

export function PropertySearchExample() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    guests: '1',
    bedrooms: '',
    startDate: '',
    endDate: '',
  });

  const searchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.guests) params.append('minGuests', filters.guests);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      // Call the v2 API that uses OOP architecture
      const response = await fetch(`/api/v2/properties?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setProperties(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search properties. Please try again.');
      console.error('Error searching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load - get featured properties
    const loadFeatured = async () => {
      try {
        const response = await fetch('/api/v2/properties?featured=true&limit=10');
        const result = await response.json();
        if (result.success) {
          setProperties(result.data);
        }
      } catch (err) {
        console.error('Error loading featured properties:', err);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search Properties</h1>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              placeholder="City or country"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min Price (QAR)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Price (QAR)</label>
            <input
              type="number"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Guests</label>
            <input
              type="number"
              min="1"
              value={filters.guests}
              onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Check-in</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Check-out</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={searchProperties}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {property.images[0] && (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {property.address.city}, {property.address.country}
              </p>
              <p className="text-gray-700 mb-3 line-clamp-2">
                {property.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <span>{property.maxGuests} guests</span>
                <span>{property.bedrooms} bedrooms</span>
                <span>{property.bathrooms} bathrooms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  {property.basePrice.currency} {property.basePrice.amount}
                  <span className="text-sm text-gray-600"> / night</span>
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && properties.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No properties found. Try adjusting your search filters.
        </div>
      )}
    </div>
  );
}
