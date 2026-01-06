'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  Heart,
  MapPin,
  Users,
  Bed,
  Bath,
  Filter,
  ArrowLeft,
  Wifi,
  Car,
  Utensils,
  Tv,
  Waves,
  Check
} from 'lucide-react';

interface RecommendedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  isLiked: boolean;
  badges: string[];
  property: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  host: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  amenities: string[];
  type: string;
}

export default function Recommendations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [filterType, setFilterType] = useState('all');

  const allRecommendations: RecommendedProperty[] = [
    {
      id: '1',
      title: 'Modern Tokyo Apartment',
      description: 'Stunning apartment in vibrant Shibuya district with city views',
      location: 'Shibuya, Tokyo, Japan',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      rating: 4.9,
      reviews: 127,
      pricePerNight: 120,
      isLiked: false,
      badges: ['Superhost', 'Instant Book', 'New'],
      property: { guests: 4, bedrooms: 2, bathrooms: 1 },
      host: { name: 'Yuki', avatar: 'Y', isVerified: true },
      amenities: ['WiFi', 'Kitchen', 'AC', 'TV', 'Washer'],
      type: 'Apartment'
    },
    {
      id: '2',
      title: 'Artistic Paris Loft',
      description: 'Charming artist loft with stunning Sacré-Cœur views',
      location: 'Montmartre, Paris, France',
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
      rating: 4.8,
      reviews: 89,
      pricePerNight: 185,
      isLiked: true,
      badges: ['Superhost', 'Art Studio'],
      property: { guests: 3, bedrooms: 1, bathrooms: 1 },
      host: { name: 'Marie', avatar: 'M', isVerified: true },
      amenities: ['WiFi', 'Kitchen', 'Balcony', 'Art Supplies'],
      type: 'Loft'
    },
    {
      id: '3',
      title: 'Beachfront Villa Santorini',
      description: 'Luxury villa with private pool and sunset views',
      location: 'Oia, Santorini, Greece',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      rating: 4.9,
      reviews: 156,
      pricePerNight: 320,
      isLiked: false,
      badges: ['Luxury', 'Pool', 'Sunset Views'],
      property: { guests: 6, bedrooms: 3, bathrooms: 2 },
      host: { name: 'Kostas', avatar: 'K', isVerified: true },
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Beach Access', 'Parking'],
      type: 'Villa'
    },
    {
      id: '4',
      title: 'Cozy Mountain Cabin',
      description: 'Perfect winter retreat with fireplace and ski access',
      location: 'Aspen, Colorado, USA',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      rating: 4.7,
      reviews: 92,
      pricePerNight: 225,
      isLiked: false,
      badges: ['Ski-in/Ski-out', 'Hot Tub', 'Pet Friendly'],
      property: { guests: 8, bedrooms: 4, bathrooms: 2 },
      host: { name: 'John', avatar: 'J', isVerified: true },
      amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Hot Tub', 'Ski Access'],
      type: 'Cabin'
    },
    {
      id: '5',
      title: 'Historic London Townhouse',
      description: 'Victorian elegance in trendy Notting Hill',
      location: 'Notting Hill, London, UK',
      imageUrl: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800',
      rating: 4.6,
      reviews: 73,
      pricePerNight: 280,
      isLiked: true,
      badges: ['Historic', 'Garden', 'Central Location'],
      property: { guests: 5, bedrooms: 3, bathrooms: 2 },
      host: { name: 'Emma', avatar: 'E', isVerified: true },
      amenities: ['WiFi', 'Kitchen', 'Garden', 'Workspace', 'Parking'],
      type: 'Townhouse'
    },
    {
      id: '6',
      title: 'Desert Oasis Resort',
      description: 'Luxury Moroccan riad with traditional architecture',
      location: 'Marrakech, Morocco',
      imageUrl: 'https://images.unsplash.com/photo-1544989164-e5b7b93ab4cb?w=800',
      rating: 4.8,
      reviews: 134,
      pricePerNight: 195,
      isLiked: false,
      badges: ['Luxury', 'Spa', 'Traditional'],
      property: { guests: 4, bedrooms: 2, bathrooms: 2 },
      host: { name: 'Ahmed', avatar: 'A', isVerified: true },
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Airport Transfer'],
      type: 'Resort'
    }
  ];

  const [recommendations, setRecommendations] = useState(allRecommendations);

  const filteredRecommendations = recommendations.filter(property => {
    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filterType !== 'all') {
      return property.type.toLowerCase() === filterType.toLowerCase();
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerNight - b.pricePerNight;
      case 'price-high':
        return b.pricePerNight - a.pricePerNight;
      case 'rating':
        return b.rating - a.rating;
      case 'recommended':
      default:
        return 0; // Keep original order
    }
  });

  const handlePropertyClick = (property: RecommendedProperty) => {
    router.push(`/property/${property.id}`);
  };

  const handleLikeProperty = (property: RecommendedProperty) => {
    setRecommendations(prev =>
      prev.map(p =>
        p.id === property.id ? { ...p, isLiked: !p.isLiked } : p
      )
    );
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'kitchen':
        return <Utensils className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'pool':
      case 'beach access':
        return <Waves className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

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
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Recommendations
                </h1>
                <p className="text-gray-600 text-sm">Handpicked properties just for you</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by destination, property name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartments</option>
                <option value="villa">Villas</option>
                <option value="cabin">Cabins</option>
                <option value="loft">Lofts</option>
                <option value="townhouse">Townhouses</option>
                <option value="resort">Resorts</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((property, index) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handlePropertyClick(property)}
            >

              {/* Property Image */}
              <div className="relative h-48">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeProperty(property);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                    property.isLiked
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${property.isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Badges */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {property.badges.slice(0, 2).map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-800"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Property Content */}
              <div className="p-6">

                {/* Property Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{property.property.guests}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.property.bathrooms}</span>
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">
                      {property.host.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {property.host.name}
                      </span>
                      {property.host.isVerified && (
                        <Check className="w-4 h-4 text-emerald-500" />
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
                    {property.rating}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({property.reviews} reviews)
                  </span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 4).map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                    >
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                  {property.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      +{property.amenities.length - 4} more
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${property.pricePerNight}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">/ night</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {property.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all properties.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setSortBy('recommended');
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}