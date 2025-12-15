'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Eye,
  Calendar,
  MessageCircle,
  Share2,
  TrendingUp,
  DollarSign,
  Award,
  Crown,
  Check,
  X
} from 'lucide-react';

interface SavedProperty {
  id: string;
  title: string;
  location: string;
  emoji: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  totalPrice: number;
  savedDate: string;
  type: string;
  host: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  property: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  amenities: string[];
  images: string[];
  badges: string[];
  isSuperhost: boolean;
  instantBook: boolean;
  freeCancellation: boolean;
}

interface PropertyFilter {
  priceRange: { min: number; max: number };
  propertyType: 'all' | 'apartment' | 'house' | 'villa' | 'cabin' | 'other';
  features: string[];
  sortBy: 'saved-date' | 'price-low' | 'price-high' | 'rating';
}

export default function SavedProperties() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [currentFilter, setCurrentFilter] = useState<PropertyFilter>({
    priceRange: { min: 0, max: 1000 },
    propertyType: 'all',
    features: [],
    sortBy: 'saved-date'
  });

  const userProfile = {
    name: 'Alex Johnson',
    initials: 'AJ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  };

  const availableFeatures = [
    'WiFi', 'Kitchen', 'Pool', 'Parking', 'Pet Friendly', 'Air Conditioning',
    'Gym', 'Hot Tub', 'Beach Access', 'Mountain View', 'Fireplace', 'Balcony'
  ];

  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([
    {
      id: '1',
      title: 'Ocean View Villa',
      location: 'Santorini, Greece',
      emoji: '🏖️',
      rating: 4.9,
      reviews: 127,
      pricePerNight: 400,
      totalPrice: 2800,
      savedDate: '2025-01-15',
      type: 'Villa',
      host: {
        name: 'Maria Papadakis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        isVerified: true
      },
      property: {
        guests: 6,
        bedrooms: 3,
        bathrooms: 2
      },
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Beach Access', 'Air Conditioning'],
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      badges: ['Free cancellation', 'Self check-in'],
      isSuperhost: true,
      instantBook: true,
      freeCancellation: true
    },
    {
      id: '2',
      title: 'Alpine Chalet',
      location: 'Zermatt, Switzerland',
      emoji: '⛰️',
      rating: 4.7,
      reviews: 89,
      pricePerNight: 550,
      totalPrice: 3850,
      savedDate: '2025-01-10',
      type: 'Cabin',
      host: {
        name: 'Hans Mueller',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hans',
        isVerified: true
      },
      property: {
        guests: 8,
        bedrooms: 4,
        bathrooms: 3
      },
      amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Mountain View', 'Hot Tub', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      badges: ['Instant Book', 'Self check-in'],
      isSuperhost: false,
      instantBook: true,
      freeCancellation: false
    },
    {
      id: '3',
      title: 'Historic Villa',
      location: 'Tuscany, Italy',
      emoji: '🏛️',
      rating: 4.8,
      reviews: 203,
      pricePerNight: 300,
      totalPrice: 2100,
      savedDate: '2025-01-05',
      type: 'Villa',
      host: {
        name: 'Giuseppe Romano',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Giuseppe',
        isVerified: true
      },
      property: {
        guests: 4,
        bedrooms: 2,
        bathrooms: 2
      },
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Parking', 'Balcony'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      badges: ['Free cancellation'],
      isSuperhost: true,
      instantBook: false,
      freeCancellation: true
    },
    {
      id: '4',
      title: 'Modern Downtown Loft',
      location: 'New York, NY',
      emoji: '🏙️',
      rating: 4.6,
      reviews: 156,
      pricePerNight: 320,
      totalPrice: 2240,
      savedDate: '2025-01-01',
      type: 'Apartment',
      host: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        isVerified: false
      },
      property: {
        guests: 2,
        bedrooms: 1,
        bathrooms: 1
      },
      amenities: ['WiFi', 'Kitchen', 'Gym', 'Air Conditioning'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      badges: ['Instant Book'],
      isSuperhost: false,
      instantBook: true,
      freeCancellation: false
    },
    {
      id: '5',
      title: 'Beachfront House',
      location: 'Malibu, California',
      emoji: '🌊',
      rating: 4.9,
      reviews: 234,
      pricePerNight: 650,
      totalPrice: 4550,
      savedDate: '2024-12-20',
      type: 'House',
      host: {
        name: 'Jennifer Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
        isVerified: true
      },
      property: {
        guests: 10,
        bedrooms: 5,
        bathrooms: 4
      },
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Beach Access', 'Hot Tub', 'Parking', 'Balcony'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ],
      badges: ['Instant Book', 'Free cancellation', 'Self check-in'],
      isSuperhost: true,
      instantBook: true,
      freeCancellation: true
    }
  ]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredProperties = savedProperties.filter(property => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        property.title.toLowerCase().includes(term) ||
        property.location.toLowerCase().includes(term) ||
        property.type.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Property type filter
    if (currentFilter.propertyType !== 'all') {
      if (property.type.toLowerCase() !== currentFilter.propertyType) return false;
    }

    // Price range filter
    if (property.pricePerNight < currentFilter.priceRange.min ||
        property.pricePerNight > currentFilter.priceRange.max) {
      return false;
    }

    // Features filter
    if (currentFilter.features.length > 0) {
      const hasAllFeatures = currentFilter.features.every(feature =>
        property.amenities.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (currentFilter.sortBy) {
      case 'saved-date':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      case 'price-low':
        return a.pricePerNight - b.pricePerNight;
      case 'price-high':
        return b.pricePerNight - a.pricePerNight;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const savedStats = {
    total: savedProperties.length,
    avgPrice: Math.round(savedProperties.reduce((sum, p) => sum + p.pricePerNight, 0) / savedProperties.length),
    avgRating: (savedProperties.reduce((sum, p) => sum + p.rating, 0) / savedProperties.length).toFixed(1),
    superhosts: savedProperties.filter(p => p.isSuperhost).length
  };

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString()}`;
  };

  const formatSavedDate = (dateString: string): string => {
    const savedDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getPropertyTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'apartment': return '🏢';
      case 'house': return '🏠';
      case 'villa': return '🏖️';
      case 'cabin': return '⛰️';
      default: return '✨';
    }
  };

  const handlePropertyAction = (action: string, property: SavedProperty) => {
    switch (action) {
      case 'view':
        router.push(`/property/${property.id}`);
        break;
      case 'book':
        router.push(`/booking/confirm?propertyId=${property.id}`);
        break;
      case 'message':
        router.push(`/messages-inbox?hostId=${property.host.name}`);
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/property/${property.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Property link copied to clipboard!');
        break;
      case 'unsave':
        setSavedProperties(prev => prev.filter(p => p.id !== property.id));
        break;
      default:
        console.log(`Action ${action} for property ${property.id}`);
    }
  };

  const toggleFeature = (feature: string) => {
    setCurrentFilter(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const clearFilters = () => {
    setCurrentFilter({
      priceRange: { min: 0, max: 1000 },
      propertyType: 'all',
      features: [],
      sortBy: 'saved-date'
    });
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your saved properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/client-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Saved Properties
                </h1>
                <p className="text-gray-600 text-sm">Your favorite places to stay</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userProfile.initials}
              </div>
              <div className="hidden md:block">
                <div className="font-medium text-gray-900">{userProfile.name}</div>
                <div className="text-sm text-gray-500">❤️ Collector</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{savedStats.total}</div>
                <div className="text-sm text-gray-600">Saved</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(savedStats.avgPrice)}</div>
                <div className="text-sm text-gray-600">Avg. Price</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{savedStats.avgRating}</div>
                <div className="text-sm text-gray-600">Avg. Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{savedStats.superhosts}</div>
                <div className="text-sm text-gray-600">Superhosts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search properties, locations, or types..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <select
              value={currentFilter.sortBy}
              onChange={(e) => setCurrentFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="saved-date">Recently Saved</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Property Type Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'apartment', 'house', 'villa', 'cabin', 'other'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCurrentFilter(prev => ({ ...prev, propertyType: type as any }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentFilter.propertyType === type
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price Range (per night)</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={currentFilter.priceRange.min}
                      onChange={(e) => setCurrentFilter(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={currentFilter.priceRange.max}
                      onChange={(e) => setCurrentFilter(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(currentFilter.priceRange.min)}</span>
                      <span>{formatPrice(currentFilter.priceRange.max)}</span>
                    </div>
                  </div>
                </div>

                {/* Amenities Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          currentFilter.features.includes(feature)
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved properties found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || currentFilter.propertyType !== 'all' || currentFilter.features.length > 0
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start exploring and save properties you love!'}
              </p>
              <div className="space-x-4">
                {(searchTerm || currentFilter.propertyType !== 'all' || currentFilter.features.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => router.push('/discover')}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Explore Properties
                </button>
              </div>
            </div>
          ) : (
            filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >

                {/* Property Images */}
                <div className="relative h-48">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span className="text-2xl">{property.emoji}</span>
                  </div>
                  <button
                    onClick={() => handlePropertyAction('unsave', property)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {property.isSuperhost && (
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-full">
                        Superhost
                      </span>
                    )}
                    {property.instantBook && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Instant Book
                      </span>
                    )}
                    {property.freeCancellation && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Free Cancellation
                      </span>
                    )}
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>{getPropertyTypeIcon(property.type)}</span>
                      <span>{property.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{property.property.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.property.bathrooms} bath</span>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={property.host.avatar}
                      alt={property.host.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {property.host.name}
                        </span>
                        {property.host.isVerified && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Host</div>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= property.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {property.rating.toFixed(1)} ({property.reviews} reviews)
                    </span>
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.amenities.slice(0, 4).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{property.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Price & Saved Info */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(property.pricePerNight)}
                      </div>
                      <div className="text-sm text-gray-600">per night</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Saved {formatSavedDate(property.savedDate)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.totalPrice)} total
                      </div>
                    </div>
                  </div>

                  {/* Property Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePropertyAction('view', property)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handlePropertyAction('book', property)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book</span>
                    </button>
                    <button
                      onClick={() => handlePropertyAction('message', property)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                    <button
                      onClick={() => handlePropertyAction('share', property)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}