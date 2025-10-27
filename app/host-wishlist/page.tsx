'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  Grid,
  List,
  Download,
  Share2,
  Bell,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
  X,
  Check,
  MapPin,
  Bed,
  Bath,
  Sparkles,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Award,
  Clock,
  MessageSquare,
  UserPlus,
  FolderOpen,
  Tag,
  ArrowLeft
} from 'lucide-react';

interface WishlistProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  country: string;
  type: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFootage?: number;
  averageRating: number;
  totalReviews: number;
  occupancyRate: number;
  revenuePerMonth: number;
  images: string[];
  amenities: string[];
  addedDate: Date;
  collectionIds: string[];
  notes: WishlistNote[];
  alerts: WishlistAlert[];
  priceHistory: { date: Date; price: number }[];
  marketInsights: {
    demandTrend: 'up' | 'down' | 'stable';
    competitorAnalysis: number;
    seasonalityScore: number;
  };
}

interface WishlistCollection {
  id: string;
  name: string;
  description: string;
  color: string;
  propertyCount: number;
  createdDate: Date;
  isPrivate: boolean;
}

interface WishlistNote {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface WishlistAlert {
  id: string;
  type: 'price_change' | 'availability' | 'market_update' | 'maintenance' | 'booking';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: Date;
}

interface WishlistTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  propertyId?: string;
  createdAt: Date;
}

interface WishlistAnalytics {
  totalProperties: number;
  totalValue: number;
  averagePrice: number;
  averageRating: number;
  averageOccupancy: number;
  monthlyRevenue: number;
  topLocations: { city: string; count: number; avgPrice: number }[];
  propertyTypes: { type: string; count: number; percentage: number }[];
  priceDistribution: { range: string; count: number }[];
  recentActivity: { action: string; property: string; date: Date }[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'price_low' | 'price_high' | 'rating' | 'occupancy';

export default function HostWishlist() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalyticsSidebar, setShowAnalyticsSidebar] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<WishlistProperty | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 2000 });
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Mock data
  const [properties] = useState<WishlistProperty[]>([
    {
      id: '1',
      title: 'Luxury Beachfront Villa',
      address: '123 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      type: 'Villa',
      pricePerNight: 450,
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      squareFootage: 2500,
      averageRating: 4.8,
      totalReviews: 127,
      occupancyRate: 85,
      revenuePerMonth: 12500,
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Pool', 'Beach Access', 'WiFi', 'Kitchen', 'Parking'],
      addedDate: new Date('2024-01-15'),
      collectionIds: ['collection1'],
      notes: [],
      alerts: [
        {
          id: 'alert1',
          type: 'price_change',
          title: 'Price Opportunity',
          message: 'Similar properties increased prices by 15%',
          severity: 'medium',
          read: false,
          createdAt: new Date()
        }
      ],
      priceHistory: [
        { date: new Date('2024-01-01'), price: 400 },
        { date: new Date('2024-01-15'), price: 450 }
      ],
      marketInsights: {
        demandTrend: 'up',
        competitorAnalysis: 78,
        seasonalityScore: 85
      }
    },
    {
      id: '2',
      title: 'Mountain Cabin Retreat',
      address: '456 Pine Trail',
      city: 'Aspen',
      state: 'CO',
      country: 'USA',
      type: 'Cabin',
      pricePerNight: 320,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      squareFootage: 1800,
      averageRating: 4.6,
      totalReviews: 89,
      occupancyRate: 72,
      revenuePerMonth: 8900,
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Fireplace', 'Hot Tub', 'WiFi', 'Kitchen', 'Ski Access'],
      addedDate: new Date('2024-01-10'),
      collectionIds: ['collection2'],
      notes: [],
      alerts: [],
      priceHistory: [
        { date: new Date('2024-01-01'), price: 350 },
        { date: new Date('2024-01-10'), price: 320 }
      ],
      marketInsights: {
        demandTrend: 'stable',
        competitorAnalysis: 65,
        seasonalityScore: 92
      }
    },
    {
      id: '3',
      title: 'Historic Downtown Loft',
      address: '789 Main Street',
      city: 'Charleston',
      state: 'SC',
      country: 'USA',
      type: 'Apartment',
      pricePerNight: 180,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      squareFootage: 1200,
      averageRating: 4.9,
      totalReviews: 203,
      occupancyRate: 91,
      revenuePerMonth: 5400,
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Historic Building', 'Downtown Location', 'WiFi', 'Kitchen'],
      addedDate: new Date('2024-01-05'),
      collectionIds: ['collection1', 'collection3'],
      notes: [],
      alerts: [],
      priceHistory: [
        { date: new Date('2024-01-01'), price: 180 },
        { date: new Date('2024-01-05'), price: 180 }
      ],
      marketInsights: {
        demandTrend: 'up',
        competitorAnalysis: 88,
        seasonalityScore: 75
      }
    }
  ]);

  const [collections] = useState<WishlistCollection[]>([
    {
      id: 'collection1',
      name: 'High Revenue Properties',
      description: 'Properties with exceptional earning potential',
      color: 'green',
      propertyCount: 2,
      createdDate: new Date('2024-01-01'),
      isPrivate: false
    },
    {
      id: 'collection2',
      name: 'Seasonal Properties',
      description: 'Properties for specific seasons',
      color: 'blue',
      propertyCount: 1,
      createdDate: new Date('2024-01-01'),
      isPrivate: false
    },
    {
      id: 'collection3',
      name: 'Urban Investments',
      description: 'City-based properties',
      color: 'purple',
      propertyCount: 1,
      createdDate: new Date('2024-01-01'),
      isPrivate: true
    }
  ]);

  const [tasks] = useState<WishlistTask[]>([
    {
      id: 'task1',
      title: 'Schedule property inspection',
      description: 'Arrange viewing for Miami villa',
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2024-02-01'),
      propertyId: '1',
      createdAt: new Date()
    },
    {
      id: 'task2',
      title: 'Research market comps',
      description: 'Analyze similar properties in Aspen area',
      status: 'in_progress',
      priority: 'medium',
      propertyId: '2',
      createdAt: new Date()
    }
  ]);

  const analytics: WishlistAnalytics = {
    totalProperties: properties.length,
    totalValue: properties.reduce((sum, p) => sum + (p.pricePerNight * 30), 0),
    averagePrice: properties.reduce((sum, p) => sum + p.pricePerNight, 0) / properties.length,
    averageRating: properties.reduce((sum, p) => sum + p.averageRating, 0) / properties.length,
    averageOccupancy: properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length,
    monthlyRevenue: properties.reduce((sum, p) => sum + p.revenuePerMonth, 0),
    topLocations: [
      { city: 'Miami', count: 1, avgPrice: 450 },
      { city: 'Aspen', count: 1, avgPrice: 320 },
      { city: 'Charleston', count: 1, avgPrice: 180 }
    ],
    propertyTypes: [
      { type: 'Villa', count: 1, percentage: 33.3 },
      { type: 'Cabin', count: 1, percentage: 33.3 },
      { type: 'Apartment', count: 1, percentage: 33.3 }
    ],
    priceDistribution: [
      { range: '$100-$200', count: 1 },
      { range: '$200-$400', count: 1 },
      { range: '$400+', count: 1 }
    ],
    recentActivity: [
      { action: 'Added property', property: 'Luxury Beachfront Villa', date: new Date('2024-01-15') },
      { action: 'Price updated', property: 'Mountain Cabin Retreat', date: new Date('2024-01-10') }
    ]
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Property type filter
    if (selectedPropertyTypes.length > 0) {
      if (!selectedPropertyTypes.includes(property.type)) return false;
    }

    // Price range filter
    if (property.pricePerNight < priceRange.min || property.pricePerNight > priceRange.max) {
      return false;
    }

    // Bedrooms filter
    if (selectedBedrooms.length > 0) {
      if (!selectedBedrooms.includes(property.bedrooms)) return false;
    }

    // Collections filter
    if (selectedCollections.length > 0) {
      const hasCollection = property.collectionIds.some(id => selectedCollections.includes(id));
      if (!hasCollection) return false;
    }

    // Rating filter
    if (minRating > 0) {
      if (property.averageRating < minRating) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.addedDate.getTime() - a.addedDate.getTime();
      case 'price_low':
        return a.pricePerNight - b.pricePerNight;
      case 'price_high':
        return b.pricePerNight - a.pricePerNight;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'occupancy':
        return b.occupancyRate - a.occupancyRate;
      default:
        return 0;
    }
  });

  const activeFiltersCount = [
    searchQuery,
    selectedPropertyTypes.length > 0,
    selectedCollections.length > 0,
    selectedBedrooms.length > 0,
    minRating > 0,
    priceRange.min > 0 || priceRange.max < 2000
  ].filter(Boolean).length;

  const unreadAlertsCount = properties
    .flatMap(p => p.alerts)
    .filter(a => !a.read).length;

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getOccupancyColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.8) return 'text-green-600';
    if (rating >= 4.5) return 'text-blue-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriceChangeDirection = (property: WishlistProperty): 'up' | 'down' | 'stable' => {
    if (property.priceHistory.length < 2) return 'stable';
    const recent = property.priceHistory[property.priceHistory.length - 1];
    const previous = property.priceHistory[property.priceHistory.length - 2];
    if (recent.price > previous.price) return 'up';
    if (recent.price < previous.price) return 'down';
    return 'stable';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPropertyTypes([]);
    setSelectedCollections([]);
    setSelectedBedrooms([]);
    setPriceRange({ min: 0, max: 2000 });
    setMinRating(0);
    setSortBy('recent');
  };

  const handlePropertyAction = (action: string, property: WishlistProperty) => {
    switch (action) {
      case 'view':
        setSelectedProperty(property);
        setShowPropertyModal(true);
        break;
      case 'remove':
        if (confirm('Remove this property from your wishlist?')) {
          console.log('Removing property:', property.id);
        }
        break;
      case 'analyze':
        router.push(`/property-analysis/${property.id}`);
        break;
      default:
        console.log(`Action ${action} for property ${property.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/host-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Investment Wishlist
                </h1>
                <p className="text-gray-600 text-sm">Track and analyze potential properties</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {unreadAlertsCount > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadAlertsCount}
                  </div>
                </div>
              )}
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                H
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Analytics Sidebar */}
          {showAnalyticsSidebar && (
            <div className="w-80 space-y-6">

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Properties</span>
                    <span className="font-semibold">{analytics.totalProperties}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Est. Monthly Revenue</span>
                    <span className="font-semibold text-green-600">{formatPrice(analytics.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Occupancy</span>
                    <span className={`font-semibold ${getOccupancyColor(analytics.averageOccupancy)}`}>
                      {analytics.averageOccupancy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Rating</span>
                    <span className={`font-semibold ${getRatingColor(analytics.averageRating)}`}>
                      {analytics.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  <div className="flex items-center gap-2">
                    {pendingTasksCount > 0 && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {pendingTasksCount} pending
                      </span>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-600">{task.description}</div>
                        {task.dueDate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Due {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Collections</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => {
                        if (selectedCollections.includes(collection.id)) {
                          setSelectedCollections(prev => prev.filter(id => id !== collection.id));
                        } else {
                          setSelectedCollections(prev => [...prev, collection.id]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedCollections.includes(collection.id)
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${collection.color}-500`}></div>
                        <span className="text-sm font-medium">{collection.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{collection.propertyCount}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">

            {/* Search and Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search properties..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      activeFiltersCount > 0
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="occupancy">Best Occupancy</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAnalyticsSidebar(!showAnalyticsSidebar)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Property Types */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Property Type</h4>
                      <div className="space-y-2">
                        {['Villa', 'Apartment', 'Cabin', 'House', 'Condo'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedPropertyTypes.includes(type)}
                              onChange={() => {
                                if (selectedPropertyTypes.includes(type)) {
                                  setSelectedPropertyTypes(prev => prev.filter(t => t !== type));
                                } else {
                                  setSelectedPropertyTypes(prev => [...prev, type]);
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Bedrooms</h4>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((count) => (
                          <button
                            key={count}
                            onClick={() => {
                              if (selectedBedrooms.includes(count)) {
                                setSelectedBedrooms(prev => prev.filter(c => c !== count));
                              } else {
                                setSelectedBedrooms(prev => [...prev, count]);
                              }
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedBedrooms.includes(count)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {count}+ bed{count > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatPrice(priceRange.min)}</span>
                          <span>{formatPrice(priceRange.max)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={clearFilters}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Clear All Filters
                    </button>
                    <span className="text-sm text-gray-600">
                      {filteredProperties.length} of {properties.length} properties
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Properties Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeFiltersCount > 0 ? 'Try adjusting your filters.' : 'Start building your investment wishlist!'}
                  </p>
                  <div className="space-x-4">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/discover')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Explore Properties
                    </button>
                  </div>
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Property Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-80 h-48' : 'h-48'}`}>
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {property.alerts.length > 0 && (
                          <div className="bg-red-500 text-white p-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.marketInsights.demandTrend === 'up' ? 'bg-green-100 text-green-800' :
                          property.marketInsights.demandTrend === 'down' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.marketInsights.demandTrend === 'up' ? 'Hot Market' :
                           property.marketInsights.demandTrend === 'down' ? 'Cooling' : 'Stable'}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePropertyAction('remove', property)}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Property Content */}
                    <div className="p-6 flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{property.city}, {property.state}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{property.maxGuests} guests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(property.pricePerNight)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            per night
                            {getPriceChangeDirection(property) === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                            {getPriceChangeDirection(property) === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {formatPrice(property.revenuePerMonth)}
                          </div>
                          <div className="text-sm text-gray-600">monthly est.</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={getRatingColor(property.averageRating)}>
                            {property.averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-600">({property.totalReviews})</span>
                        </div>
                        <div className={`font-medium ${getOccupancyColor(property.occupancyRate)}`}>
                          {property.occupancyRate}% occupied
                        </div>
                      </div>

                      {/* Collections */}
                      {property.collectionIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {property.collectionIds.map((collectionId) => {
                            const collection = collections.find(c => c.id === collectionId);
                            return collection ? (
                              <span
                                key={collectionId}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {collection.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePropertyAction('view', property)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handlePropertyAction('analyze', property)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Analyze</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
                  <p className="text-gray-600">{selectedProperty.address}, {selectedProperty.city}</p>
                </div>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(selectedProperty.pricePerNight)}
                        </div>
                        <div className="text-sm text-gray-600">per night</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedProperty.revenuePerMonth)}
                        </div>
                        <div className="text-sm text-gray-600">monthly revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedProperty.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedProperty.occupancyRate}%
                        </div>
                        <div className="text-sm text-gray-600">occupancy</div>
                      </div>
                    </div>
                  </div>

                  {selectedProperty.alerts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Alerts</h3>
                      <div className="space-y-2">
                        {selectedProperty.alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg ${
                              alert.severity === 'high' || alert.severity === 'critical'
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-yellow-50 border border-yellow-200'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{alert.title}</div>
                            <div className="text-sm text-gray-600">{alert.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}