'use client'

import { useState, useMemo } from 'react'
import { Filter, Grid, List, Map, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import AirbnbFilter, { FilterState } from '@/components/search/airbnb-filter'
import { PropertyCard } from '@/components/property/property-card'

interface Listing {
  id: string
  title: string
  location: string
  beds: number
  baths: number
  sleeps: number
  rating: number
  reviewCount: number
  price: number
  oldPrice?: number
  discountPercent?: number
  image: string
}

interface Filters {
  destination: string
  propertyType: string
  priceMin: number
  priceMax: number
  bedrooms: number
  beds: number
  bathrooms: number
  minRating: number
  sortBy: string
  adults: number
  children: number
  infants: number
  amenities: string[]
  instantBooking: boolean
  freeCancellation: boolean
}

export default function DiscoverPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [showAirbnbFilter, setShowAirbnbFilter] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [filters, setFilters] = useState<Filters>({
    destination: '',
    propertyType: '',
    priceMin: 0,
    priceMax: 1000,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    minRating: 0,
    sortBy: 'recommended',
    adults: 2,
    children: 0,
    infants: 0,
    amenities: [],
    instantBooking: false,
    freeCancellation: false
  })

  const [airbnbFilters, setAirbnbFilters] = useState<FilterState>({
    propertyType: '',
    priceMin: 0,
    priceMax: 1000,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    maxGuests: 0,
    minRating: 0,
    amenities: []
  })

  // Mock listings data
  const allListings: Listing[] = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      location: 'Downtown, City Center',
      beds: 2,
      baths: 2,
      sleeps: 4,
      rating: 4.8,
      reviewCount: 127,
      price: 120,
      oldPrice: 150,
      discountPercent: 20,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Cozy Beach House',
      location: 'Oceanview, Coastal Area',
      beds: 3,
      baths: 2,
      sleeps: 6,
      rating: 4.9,
      reviewCount: 89,
      price: 200,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Mountain Cabin Retreat',
      location: 'Mountain View, Rural',
      beds: 1,
      baths: 1,
      sleeps: 2,
      rating: 4.7,
      reviewCount: 45,
      price: 80,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Luxury Villa with Pool',
      location: 'Upscale Neighborhood',
      beds: 4,
      baths: 3,
      sleeps: 8,
      rating: 4.9,
      reviewCount: 203,
      price: 350,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'Charming Studio Loft',
      location: 'Arts District',
      beds: 1,
      baths: 1,
      sleeps: 2,
      rating: 4.6,
      reviewCount: 67,
      price: 90,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      title: 'Family Townhouse',
      location: 'Suburban Area',
      beds: 3,
      baths: 2,
      sleeps: 6,
      rating: 4.8,
      reviewCount: 134,
      price: 160,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      title: 'Rustic Country Cottage',
      location: 'Countryside Village',
      beds: 2,
      baths: 1,
      sleeps: 4,
      rating: 4.5,
      reviewCount: 78,
      price: 110,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      title: 'Penthouse with City Views',
      location: 'Financial District',
      beds: 3,
      baths: 3,
      sleeps: 6,
      rating: 4.9,
      reviewCount: 156,
      price: 450,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop'
    }
  ]

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...allListings]

    // Apply destination filter
    if (filters.destination) {
      filtered = filtered.filter(listing =>
        listing.location.toLowerCase().includes(filters.destination.toLowerCase()) ||
        listing.title.toLowerCase().includes(filters.destination.toLowerCase())
      )
    }

    // Apply price filter
    if (filters.priceMin > 0 || filters.priceMax < 1000) {
      filtered = filtered.filter(listing =>
        listing.price >= filters.priceMin && listing.price <= filters.priceMax
      )
    }

    // Apply bedroom filter
    if (filters.bedrooms > 0) {
      filtered = filtered.filter(listing => listing.beds >= filters.bedrooms)
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(listing => listing.rating >= filters.minRating)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      default: // recommended
        break
    }

    return filtered
  }, [filters])

  // Pagination
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredListings.slice(start, start + itemsPerPage)
  }, [filteredListings, currentPage])

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  const hasActiveFilters = () => {
    return filters.destination !== '' ||
           filters.propertyType !== '' ||
           filters.priceMin > 0 ||
           filters.priceMax < 1000 ||
           filters.bedrooms > 0 ||
           filters.minRating > 0 ||
           filters.instantBooking ||
           filters.freeCancellation ||
           filters.amenities.length > 0
  }

  const clearAllFilters = () => {
    setFilters({
      destination: '',
      propertyType: '',
      priceMin: 0,
      priceMax: 1000,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      minRating: 0,
      sortBy: 'recommended',
      adults: 2,
      children: 0,
      infants: 0,
      amenities: [],
      instantBooking: false,
      freeCancellation: false
    })
    setCurrentPage(1)
  }

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const handleToggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId)
      } else {
        newFavorites.add(propertyId)
      }
      return newFavorites
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={filters.destination}
                  onChange={(e) => updateFilter('destination', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAirbnbFilter(true)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Advanced Filters
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Quick Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Filter Sidebar - Now uses AirbnbFilter component */}
          <aside className={`lg:w-80 lg:block ${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-24 lg:h-fit`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Embedded Airbnb Filter Content */}
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="px-6">
                  {/* Quick Filters */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick filters</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateFilter('instantBooking', !filters.instantBooking)}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                          filters.instantBooking
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg mr-2">⚡</span>
                        Instant Booking
                      </button>
                      <button
                        onClick={() => updateFilter('freeCancellation', !filters.freeCancellation)}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                          filters.freeCancellation
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg mr-2">🆓</span>
                        Free cancellation
                      </button>
                      <button
                        onClick={() => {
                          const newAmenities = filters.amenities.includes('pool')
                            ? filters.amenities.filter(id => id !== 'pool')
                            : [...filters.amenities, 'pool'];
                          updateFilter('amenities', newAmenities);
                        }}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                          filters.amenities.includes('pool')
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg mr-2">🏊</span>
                        Pool
                      </button>
                      <button
                        onClick={() => {
                          const newAmenities = filters.amenities.includes('pet_friendly')
                            ? filters.amenities.filter(id => id !== 'pet_friendly')
                            : [...filters.amenities, 'pet_friendly'];
                          updateFilter('amenities', newAmenities);
                        }}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                          filters.amenities.includes('pet_friendly')
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg mr-2">🐕</span>
                        Pet-friendly
                      </button>
                      <button
                        onClick={() => {
                          const newAmenities = filters.amenities.includes('wifi')
                            ? filters.amenities.filter(id => id !== 'wifi')
                            : [...filters.amenities, 'wifi'];
                          updateFilter('amenities', newAmenities);
                        }}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                          filters.amenities.includes('wifi')
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg mr-2">📶</span>
                        WiFi
                      </button>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Property type</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'house', label: 'House' },
                        { id: 'apartment', label: 'Apartment' },
                        { id: 'villa', label: 'Villa' },
                        { id: 'condo', label: 'Condo' },
                        { id: 'townhouse', label: 'Townhouse' },
                        { id: 'studio', label: 'Studio' },
                        { id: 'loft', label: 'Loft' },
                        { id: 'cabin', label: 'Cabin' },
                        { id: 'cottage', label: 'Cottage' },
                        { id: 'hotel_room', label: 'Hotel Room' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFilter('propertyType',
                            filters.propertyType === type.id ? '' : type.id
                          )}
                          className={`flex items-center justify-center p-3 border rounded-lg transition-colors text-sm font-medium ${
                            filters.propertyType === type.id
                              ? 'border-black bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Price range</h2>
                    <p className="text-sm text-gray-500 mb-4">Nightly prices before fees and taxes</p>

                    <div className="h-16 mb-4 flex items-end justify-center space-x-1">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 bg-red-400 rounded-t ${
                            i < 8 || i > 15 ? 'opacity-30' : ''
                          }`}
                          style={{ height: `${Math.random() * 40 + 20}px` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Minimum</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={filters.priceMin}
                            onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="w-4 h-px bg-gray-300 mt-6"></div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Maximum</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={filters.priceMax}
                            onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 1000)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900"
                            placeholder="1000+"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rooms and beds */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Rooms and beds</h2>
                    <div className="space-y-4">
                      {/* Bedrooms */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-base text-gray-700">Bedrooms</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateFilter('bedrooms', Math.max(0, filters.bedrooms - 1))}
                            disabled={filters.bedrooms === 0}
                            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm">−</span>
                          </button>
                          <span className="text-base font-medium text-gray-900 w-8 text-center">
                            {filters.bedrooms === 0 ? 'Any' : filters.bedrooms}
                          </span>
                          <button
                            onClick={() => updateFilter('bedrooms', filters.bedrooms + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition"
                          >
                            <span className="text-sm">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Bathrooms */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-base text-gray-700">Bathrooms</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateFilter('bathrooms', Math.max(0, filters.bathrooms - 1))}
                            disabled={filters.bathrooms === 0}
                            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm">−</span>
                          </button>
                          <span className="text-base font-medium text-gray-900 w-8 text-center">
                            {filters.bathrooms === 0 ? 'Any' : filters.bathrooms}
                          </span>
                          <button
                            onClick={() => updateFilter('bathrooms', filters.bathrooms + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:border-black hover:text-black transition"
                          >
                            <span className="text-sm">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                    <p className="text-sm text-gray-500 mb-4">What does your place offer?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'wifi', label: 'WiFi', emoji: '📶' },
                        { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
                        { id: 'washer', label: 'Washer', emoji: '🧺' },
                        { id: 'dryer', label: 'Dryer', emoji: '🌪️' },
                        { id: 'air_conditioning', label: 'Air conditioning', emoji: '❄️' },
                        { id: 'heating', label: 'Heating', emoji: '🔥' },
                        { id: 'workspace', label: 'Workspace', emoji: '💻' },
                        { id: 'tv', label: 'TV', emoji: '📺' },
                        { id: 'parking', label: 'Free parking', emoji: '🅿️' },
                        { id: 'pool', label: 'Pool', emoji: '🏊' },
                        { id: 'gym', label: 'Gym', emoji: '🏋️' },
                        { id: 'hot_tub', label: 'Hot tub', emoji: '🛁' },
                        { id: 'jacuzzi', label: 'Jacuzzi', emoji: '🛀' },
                        { id: 'private_garden', label: 'Private Garden', emoji: '🌿' },
                        { id: 'rooftop', label: 'RoofTop', emoji: '🏢' },
                        { id: 'swing', label: 'Swing', emoji: '🪢' },
                        { id: 'pet_friendly', label: 'Pet-friendly', emoji: '🐕' }
                      ].map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => {
                            const newAmenities = filters.amenities.includes(amenity.id)
                              ? filters.amenities.filter(id => id !== amenity.id)
                              : [...filters.amenities, amenity.id];
                            updateFilter('amenities', newAmenities);
                          }}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors h-16 ${
                            filters.amenities.includes(amenity.id)
                              ? 'border-black bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <span className="text-lg mb-1">{amenity.emoji}</span>
                          <span className="text-xs font-medium text-gray-900 text-center">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {hasActiveFilters() && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Results Section */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {filteredListings.length} vacation rentals
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Applied Filters */}
            {hasActiveFilters() && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700">Applied filters:</span>
                {filters.destination && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {filters.destination}
                    <button onClick={() => updateFilter('destination', '')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {(filters.priceMin > 0 || filters.priceMax < 1000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    ${filters.priceMin} - ${filters.priceMax}
                    <button onClick={() => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 1000 }))}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Grid/List */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-600">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Map View</h3>
                <p className="text-gray-600">Interactive map showing {filteredListings.length} vacation rentals</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {paginatedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    property={listing}
                    isFavorite={favorites.has(listing.id)}
                    onToggleFavorite={handleToggleFavorite}
                    layout={viewMode}
                    showViewButton={false}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredListings.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredListings.length)} of {filteredListings.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Airbnb-style Advanced Filter Modal */}
      <AirbnbFilter
        isOpen={showAirbnbFilter}
        onClose={() => setShowAirbnbFilter(false)}
        filters={airbnbFilters}
        onFiltersChange={setAirbnbFilters}
        onApply={(appliedFilters) => {
          setAirbnbFilters(appliedFilters);
          // Sync the advanced filters with the basic filters
          setFilters(prev => ({
            ...prev,
            propertyType: appliedFilters.propertyType,
            priceMin: appliedFilters.priceMin,
            priceMax: appliedFilters.priceMax,
            bedrooms: appliedFilters.bedrooms,
            bathrooms: appliedFilters.bathrooms,
            minRating: appliedFilters.minRating,
            amenities: appliedFilters.amenities
          }));
          setShowAirbnbFilter(false);
        }}
      />
    </div>
  )
}