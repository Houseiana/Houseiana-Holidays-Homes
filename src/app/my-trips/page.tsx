'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Share2,
  MessageCircle,
  Phone,
  Download,
  FileText,
  Plus,
  Search,
  Filter,
  List,
  Calendar as CalendarIcon,
  Map,
  GanttChart,
  Edit,
  X,
  Copy,
  Eye,
  Bell,
  TrendingUp,
  Award
} from 'lucide-react';

interface TripTab {
  key: 'upcoming' | 'past' | 'cancelled' | 'saved';
  label: string;
  count: number;
  icon: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  photos: string[];
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
  ratings: {
    overall: number;
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
  totalReviews: number;
}

interface Trip {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  createdAt: Date;
  property: Property;
}

interface TripInsights {
  totalSpendThisYear: number;
  averagePerTrip: number;
  totalNights: number;
  countriesVisited: number;
  favoriteDestination: string;
  totalTrips: number;
  loyaltyPoints: number;
  carbonFootprint: number;
}

export default function MyTrips() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled' | 'saved'>('upcoming');
  const [currentView, setCurrentView] = useState<'list' | 'timeline' | 'map' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const tripInsights: TripInsights = {
    totalSpendThisYear: 28750,
    averagePerTrip: 2395,
    totalNights: 67,
    countriesVisited: 12,
    favoriteDestination: 'Paris, France',
    totalTrips: 12,
    loyaltyPoints: 1850,
    carbonFootprint: 4.2
  };

  const [allTrips] = useState<Trip[]>([
    {
      id: '1',
      userId: 'user1',
      propertyId: 'prop1',
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-27'),
      guests: 4,
      totalPrice: 2850,
      currency: 'USD',
      status: 'confirmed',
      createdAt: new Date('2024-11-15'),
      property: {
        id: 'prop1',
        title: 'Luxury Villa with Sea View',
        address: 'Santorini, Greece',
        photos: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        type: 'Villa',
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 350,
        amenities: ['WiFi', 'Pool', 'Sea View', 'Kitchen'],
        ratings: { overall: 4.9, cleanliness: 4.8, communication: 4.9, checkin: 4.7, accuracy: 4.8, location: 5.0, value: 4.6 },
        totalReviews: 127
      }
    },
    {
      id: '2',
      userId: 'user1',
      propertyId: 'prop2',
      checkIn: new Date('2024-11-10'),
      checkOut: new Date('2024-11-15'),
      guests: 2,
      totalPrice: 1250,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date('2024-10-01'),
      property: {
        id: 'prop2',
        title: 'Cozy Mountain Cabin',
        address: 'Aspen, Colorado',
        photos: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        type: 'Cabin',
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        pricePerNight: 250,
        amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Hot Tub'],
        ratings: { overall: 4.7, cleanliness: 4.6, communication: 4.8, checkin: 4.5, accuracy: 4.7, location: 4.9, value: 4.5 },
        totalReviews: 89
      }
    },
    {
      id: '3',
      userId: 'user1',
      propertyId: 'prop3',
      checkIn: new Date('2024-10-05'),
      checkOut: new Date('2024-10-12'),
      guests: 6,
      totalPrice: 3200,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date('2024-09-01'),
      property: {
        id: 'prop3',
        title: 'Beachfront Villa Paradise',
        address: 'Malibu, California',
        photos: ['https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        type: 'Villa',
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        pricePerNight: 450,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Chef Kitchen'],
        ratings: { overall: 4.8, cleanliness: 4.9, communication: 4.7, checkin: 4.8, accuracy: 4.8, location: 4.9, value: 4.6 },
        totalReviews: 156
      }
    }
  ]);

  const tabs: TripTab[] = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: allTrips.filter(t => t.status === 'confirmed' && new Date(t.checkIn) > new Date()).length,
      icon: '🚀'
    },
    {
      key: 'past',
      label: 'Past',
      count: allTrips.filter(t => t.status === 'completed' || new Date(t.checkOut) < new Date()).length,
      icon: '✅'
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: allTrips.filter(t => t.status === 'cancelled').length,
      icon: '❌'
    },
    {
      key: 'saved',
      label: 'Saved',
      count: allTrips.filter(t => t.status === 'pending').length,
      icon: '💾'
    }
  ];

  const filteredTrips = allTrips.filter(trip => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        trip.property.title.toLowerCase().includes(query) ||
        trip.property.address.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter
    switch (selectedTab) {
      case 'upcoming':
        return trip.status === 'confirmed' && new Date(trip.checkIn) > new Date();
      case 'past':
        return trip.status === 'completed' || new Date(trip.checkOut) < new Date();
      case 'cancelled':
        return trip.status === 'cancelled';
      case 'saved':
        return trip.status === 'pending';
      default:
        return true;
    }
  });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleTripAction = (action: string, tripId: string) => {
    switch (action) {
      case 'view':
        router.push(`/trip-details/${tripId}`);
        break;
      case 'modify':
        router.push(`/modify-booking/${tripId}`);
        break;
      case 'message':
        router.push(`/messages-inbox?tripId=${tripId}`);
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/shared-trip/${tripId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Trip link copied to clipboard!');
        break;
      case 'review':
        router.push(`/leave-review/${tripId}`);
        break;
      case 'cancel':
        if (confirm('Are you sure you want to cancel this trip?')) {
          console.log('Cancelling trip:', tripId);
        }
        break;
      default:
        console.log(`Action ${action} for trip ${tripId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                My Trips
              </h1>
              <p className="text-gray-600 mt-1">Manage your bookings and reservations</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/discover')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Book New Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Travel Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(tripInsights.totalSpendThisYear)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tripInsights.totalNights}</div>
                <div className="text-sm text-gray-600">Nights</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tripInsights.countriesVisited}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tripInsights.loyaltyPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trips..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

            <div className="flex items-center gap-2">
              {[
                { key: 'list', icon: List },
                { key: 'timeline', icon: GanttChart },
                { key: 'calendar', icon: CalendarIcon },
                { key: 'map', icon: Map }
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentView === key
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trip Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors ${
                selectedTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search terms.' : 'Start planning your next adventure!'}
              </p>
              <button
                onClick={() => router.push('/discover')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">

                  {/* Property Image */}
                  <div className="md:w-80 h-48 md:h-auto relative">
                    <img
                      src={trip.property.photos[0]}
                      alt={trip.property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {trip.property.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.property.address}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(trip.checkIn)} - {formatDate(trip.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{calculateNights(trip.checkIn, trip.checkOut)} nights</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(trip.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-600">total</div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      <span>{trip.guests} guests</span>
                      <span>{trip.property.bedrooms} bedrooms</span>
                      <span>{trip.property.bathrooms} bathrooms</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{trip.property.ratings.overall} ({trip.property.totalReviews} reviews)</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.property.amenities.slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {trip.property.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{trip.property.amenities.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleTripAction('view', trip.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {trip.status === 'confirmed' && new Date(trip.checkIn) > new Date() && (
                        <>
                          <button
                            onClick={() => handleTripAction('modify', trip.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Modify
                          </button>
                          <button
                            onClick={() => handleTripAction('cancel', trip.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}

                      {trip.status === 'completed' && (
                        <button
                          onClick={() => handleTripAction('review', trip.id)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          Leave Review
                        </button>
                      )}

                      <button
                        onClick={() => handleTripAction('message', trip.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message Host
                      </button>

                      <button
                        onClick={() => handleTripAction('share', trip.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
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