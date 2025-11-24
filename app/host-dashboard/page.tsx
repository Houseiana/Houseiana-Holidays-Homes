'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Property } from '@/types/property';
import {
  Clock, CheckCircle, Users, DollarSign, Star, Home, Calendar, MessageCircle,
  HelpCircle, BarChart3, Bell, Phone, AlertTriangle, Eye, Edit, Download,
  FileText, Plus, ArrowUpRight, ArrowRight, Mail, UserPlus, TrendingUp,
  Percent, RefreshCw, Inbox, DoorOpen, Settings, LogOut, ChevronRight, MoreHorizontal, MapPin, Filter
} from 'lucide-react';

interface Booking {
  id: string;
  guestName: string;
  guestInitials: string;
  propertyName: string;
  amount: number;
  dates: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'declined';
  checkIn: string;
  checkOut: string;
  guests: number;
  avatarColor: string;
  guestRating?: number;
  isNewGuest: boolean;
  specialRequests?: string;
  guestPhone: string;
  emergencyContact: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

function HostDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyCards, setPropertyCards] = useState([
    {
      id: 'p1',
      name: 'Beachfront Villa',
      city: 'Doha',
      country: 'Qatar',
      status: 'Live',
      kycStatus: 'Verified',
      occupancy: 92,
      adr: 320,
      revenue: 12400,
      rating: 4.9,
      bookings: 18,
      cover: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600'
    },
    {
      id: 'p2',
      name: 'Mountain Cabin',
      city: 'Aspen',
      country: 'USA',
      status: 'Pending',
      kycStatus: 'Pending',
      occupancy: 81,
      adr: 250,
      revenue: 8900,
      rating: 4.7,
      bookings: 12,
      cover: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600'
    },
    {
      id: 'p3',
      name: 'City Loft',
      city: 'Dubai',
      country: 'UAE',
      status: 'Live',
      kycStatus: 'Verified',
      occupancy: 74,
      adr: 210,
      revenue: 6200,
      rating: 4.6,
      bookings: 9,
      cover: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600'
    }
  ]);
  const [propertyPerformance, setPropertyPerformance] = useState([
    { id: 'p1', name: 'Beachfront Villa', occupancy: 92, adr: 320, revenue: 12400, trend: 8 },
    { id: 'p2', name: 'Mountain Cabin', occupancy: 81, adr: 250, revenue: 8900, trend: 5 },
    { id: 'p3', name: 'City Loft', occupancy: 74, adr: 210, revenue: 6200, trend: -2 }
  ]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'checked-in' | 'checked-out'>('all');
  const [payouts] = useState([
    { id: 'py-204', amount: 4200, status: 'scheduled', date: '2024-12-02', method: 'Bank •••• 1022' },
    { id: 'py-203', amount: 3650, status: 'paid', date: '2024-11-15', method: 'Bank •••• 1022' },
    { id: 'py-202', amount: 2980, status: 'paid', date: '2024-10-30', method: 'Bank •••• 1022' }
  ]);
  const [upcomingTasks] = useState([
    { id: 't1', title: 'Approve booking for Mountain Cabin', due: 'Today', type: 'booking' },
    { id: 't2', title: 'Reply to 2 unread messages', due: 'Today', type: 'message' },
    { id: 't3', title: 'Update rates for January', due: 'This week', type: 'pricing' }
  ]);
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState({
    mtdRevenue: 0,
    mtdRevenueMoM: 0,
    occupancy: 0,
    adr: 0,
    bookings: 0,
    revenueTrend: [0, 0, 0, 0, 0, 0, 0],
    occupancyTrend: [0, 0, 0, 0, 0, 0, 0],
    topMarkets: [] as Array<{ name: string; share: number }>
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsRetryCount, setAnalyticsRetryCount] = useState(0);
  const [settingsPrefs, setSettingsPrefs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    autoPayouts: true,
    defaultPayoutMethod: 'Bank •••• 1022'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsRetryCount, setSettingsRetryCount] = useState(0);
  const [settingsUpdating, setSettingsUpdating] = useState(false);

  // Get user data from auth store
  const { user } = useAuthStore();

  // Unified User Profile
  const userProfile = {
    name: user?.name || `${user?.firstName || 'Host'} ${user?.lastName || ''}`.trim() || 'Host User',
    initials: user?.initials || `${user?.firstName?.charAt(0) || 'H'}${user?.lastName?.charAt(0) || ''}`.trim() || 'HU',
    email: user?.email || 'host@example.com',
    profilePhoto: user?.profilePhoto
  };

  // Host Statistics
  const hostStats = {
    totalRevenue: 24580,
    occupancyRate: 78,
    activeBookings: 23,
    averageRating: 4.8,
    monthlyRevenue: 4200,
    responseRate: 95,
  };

  // Performance Analytics
  const performanceData = {
    revenueGrowth: 12.5,
    occupancyTrend: 'up',
  };

  // Recent Bookings
  const [recentBookings, setRecentBookings] = useState<Booking[]>([
    {
      id: '1',
      guestName: 'Mike Rodriguez',
      guestInitials: 'MR',
      propertyName: 'Beachfront Villa',
      amount: 1250,
      dates: 'Dec 15-20',
      status: 'confirmed',
      checkIn: '2024-12-15',
      checkOut: '2024-12-20',
      guests: 4,
      avatarColor: '#059669',
      guestRating: 4.9,
      isNewGuest: false,
      guestPhone: '+1-555-0123',
      emergencyContact: 'Elena Rodriguez (+1-555-0124)'
    },
    {
      id: '2',
      guestName: 'Anna Johnson',
      guestInitials: 'AJ',
      propertyName: 'Mountain Cabin',
      amount: 2100,
      dates: 'Dec 22-28',
      status: 'pending',
      checkIn: '2024-12-22',
      checkOut: '2024-12-28',
      guests: 6,
      avatarColor: '#d97706',
      isNewGuest: true,
      specialRequests: 'Early check-in requested',
      guestPhone: '+1-555-0456',
      emergencyContact: 'David Johnson (+1-555-0457)'
    }
  ]);

  const navigateToClientDashboard = () => {
    router.push('/client-dashboard');
  };

  const navigateToAddProperty = () => {
    router.push('/host-dashboard/add-listing');
  };

  const viewProperty = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      const { logout } = useAuthStore.getState();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'declined': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-50';
    if (trend < 0) return 'text-rose-600 bg-rose-50';
    return 'text-gray-600 bg-gray-50';
  };

  const propertyStatusStyle = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'live') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (normalized === 'pending') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (normalized === 'draft') return 'bg-gray-50 text-gray-600 border-gray-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const payoutStatusStyle = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (normalized === 'scheduled') return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const kycStatusStyle = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'verified') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (normalized === 'pending') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (normalized === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const mapPropertiesToCards = (items: any[]) => {
    return items.map((item) => ({
      id: item.id,
      name: item.title || 'Listing',
      city: item.city || item.address?.city || '—',
      country: item.country || item.address?.country || '—',
      status: item.status || 'Live',
      kycStatus: item.kycStatus || item.verificationStatus || 'Pending',
      occupancy: item.occupancy || Math.min(98, Math.max(50, Math.round(Math.random() * 50 + 50))),
      adr: item.pricePerNight || item.basePrice || 0,
      revenue: item.revenue || Math.round((item.pricePerNight || 200) * 30 * 0.7),
      rating: item.averageRating || 4.8,
      bookings: item.bookings || item._count?.bookings || Math.floor(Math.random() * 12) + 5,
      cover: item.coverPhoto || item.photos?.[0] || 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600'
    }));
  };

  const fetchPropertiesList = async () => {
    setPropertiesError(null);
    setPropertiesLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/properties?limit=20', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to load properties');
      }

      const data = await response.json();
      const items = data?.properties || data?.items || data || [];
      const mapped = mapPropertiesToCards(items);
      setPropertyCards(mapped);
      setPropertyPerformance(
        mapped.map((m) => ({
          id: m.id,
          name: m.name,
          occupancy: m.occupancy,
          adr: m.adr,
          revenue: m.revenue,
          trend: Math.round(Math.random() * 10) - 2
        }))
      );
    } catch (err) {
      setPropertiesError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsError(null);
    setAnalyticsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/analytics/host', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to load analytics');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setAnalyticsSnapshot(result.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchHostSettings = async () => {
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/host/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to load settings');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setSettingsPrefs(result.data);
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateHostSettings = async (updates: Partial<typeof settingsPrefs>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/host/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to update settings');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setSettingsPrefs(result.data);
      }
    } catch (err) {
      console.error('Settings update error:', err);
      // Revert optimistic update if needed
      fetchHostSettings();
    }
  };

  const toggleSettingPref = async (key: keyof typeof settingsPrefs) => {
    // Prevent toggling during update
    if (settingsUpdating) return;

    // Optimistic update
    const newValue = !settingsPrefs[key];
    setSettingsPrefs(prev => ({ ...prev, [key]: newValue }));

    // Send to backend
    setSettingsUpdating(true);
    try {
      await updateHostSettings({ [key]: newValue });
    } finally {
      setSettingsUpdating(false);
    }
  };

  const retryAnalyticsFetch = () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, analyticsRetryCount), 30000);
    setAnalyticsRetryCount(prev => prev + 1);

    setTimeout(() => {
      fetchAnalyticsData();
    }, backoffDelay);
  };

  const retrySettingsFetch = () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, settingsRetryCount), 30000);
    setSettingsRetryCount(prev => prev + 1);

    setTimeout(() => {
      fetchHostSettings();
    }, backoffDelay);
  };

  const checkAuthToken = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  };

  useEffect(() => {
    if (activeTab === 'my-properties' && !propertiesLoading && propertyCards.length === 3 && !propertiesError) {
      fetchPropertiesList();
    }
  }, [activeTab, propertiesLoading, propertyCards.length, propertiesError]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsLoading && !analyticsError) {
      // Check auth token first
      if (!checkAuthToken()) {
        setAnalyticsError('Please log in to view analytics');
        return;
      }
      fetchAnalyticsData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'settings' && !settingsLoading && !settingsError) {
      // Check auth token first
      if (!checkAuthToken()) {
        setSettingsError('Please log in to view settings');
        return;
      }
      fetchHostSettings();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex">
      {/* Sidebar Navigation - Professional Dark Mode */}
      <nav className="w-72 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl hidden lg:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Houseiana</h1>
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Host Console</span>
            </div>
          </Link>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('my-properties')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'my-properties'
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'bookings'
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'earnings'
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-3" />
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Messages
            </button>
          </div>

          <div className="mt-8">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tools</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'text-white bg-indigo-600'
                    : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium w-full text-left transition-all duration-200 ${
                  activeTab === 'settings'
                    ? 'text-white bg-indigo-600'
                    : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {userProfile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-400">Superhost</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={navigateToClientDashboard}
              className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={14} /> Guest Mode
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={navigateToAddProperty}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} /> New Listing
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Hero + quick actions */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_30%)]" />
                    <div className="relative p-6 md:p-10 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                      <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-semibold">
                          <Star size={14} className="text-amber-300 fill-amber-300" />
                          Host performance snapshot
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-white">{userProfile.name || 'Host'}</span>
                        </h1>
                        <p className="text-white/70 text-sm md:text-base">
                          Track revenue, occupancy, and guest messages in one place. Keep response time low to boost ranking.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={navigateToAddProperty}
                            className="px-4 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors flex items-center gap-2"
                          >
                            <Plus size={16} /> Add listing
                          </button>
                          <button
                            onClick={() => setActiveTab('bookings')}
                            className="px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/15 transition-colors flex items-center gap-2"
                          >
                            <Calendar size={16} /> View bookings
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full lg:w-80">
                        {[
                          { label: 'Monthly revenue', value: `$${hostStats.monthlyRevenue.toLocaleString()}`, accent: 'from-emerald-400 to-emerald-600' },
                          { label: 'Occupancy', value: `${hostStats.occupancyRate}%`, accent: 'from-blue-400 to-blue-600' },
                          { label: 'Response rate', value: `${hostStats.responseRate}%`, accent: 'from-indigo-400 to-indigo-600' },
                          { label: 'Average rating', value: hostStats.averageRating.toFixed(1), accent: 'from-amber-300 to-amber-500' }
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl p-3 bg-white/10 border border-white/10 backdrop-blur">
                            <p className="text-xs text-white/70 uppercase font-semibold">{item.label}</p>
                            <p className="text-lg font-bold mt-1">{item.value}</p>
                            <div className={`h-1 rounded-full mt-2 bg-gradient-to-r ${item.accent}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total revenue</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">${hostStats.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <ArrowUpRight size={14} className="mr-1" />
                        +{performanceData.revenueGrowth}% MoM
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Occupancy</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{hostStats.occupancyRate}%</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <BarChart3 size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-medium">Top 10% in your area</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Active bookings</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{hostStats.activeBookings}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <Calendar size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">8 checking in this week</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Overall rating</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{hostStats.averageRating}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Star size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Based on 124 reviews</p>
                    </div>
                  </div>

                  {/* Performance + Tasks + Alerts */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Portfolio performance</h3>
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View analytics</button>
                      </div>
                      <div className="space-y-3">
                        {propertyPerformance.map((property) => (
                          <div key={property.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <p className="font-bold text-gray-900">{property.name}</p>
                                <p className="text-xs text-gray-500">ADR ${property.adr} · Rev ${property.revenue.toLocaleString()}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTrendColor(property.trend)}`}>
                                {property.trend > 0 ? '+' : ''}{property.trend}%
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${property.occupancy}%` }}></div>
                              </div>
                              <span className="font-semibold text-gray-900">{property.occupancy}% occupancy</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Action list</h3>
                        <div className="space-y-3">
                          {upcomingTasks.map((task) => (
                            <div key={task.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{task.due}</p>
                              </div>
                              <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Open</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell size={18} className="text-indigo-600" />
                          <h3 className="text-lg font-bold text-gray-900">Alerts</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><CheckCircle className="text-emerald-500" size={16} /> Calendar sync healthy</p>
                          <p className="flex items-center gap-2"><AlertTriangle className="text-amber-500" size={16} /> Pending booking expires in 24h</p>
                          <p className="flex items-center gap-2"><MessageCircle className="text-blue-500" size={16} /> 2 unread guest messages</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bookings + Messages */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent bookings</h3>
                        <button onClick={() => setActiveTab('bookings')} className="text-indigo-600 text-sm font-bold hover:text-indigo-700">View all</button>
                      </div>

                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: booking.avatarColor }}
                              >
                                {booking.guestInitials}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{booking.guestName}</h4>
                                <p className="text-sm text-gray-500">{booking.propertyName} • {booking.dates}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">${booking.amount}</p>
                              <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold border mt-1 ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Inbox</h3>
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Open inbox</button>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                        <MessageCircle className="text-blue-600 shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-blue-900 text-sm">Unread messages</h4>
                          <p className="text-blue-700 text-xs mt-1">Mike asked about check-in time. Reply to keep response score high.</p>
                          <button className="mt-2 text-blue-700 text-xs font-bold hover:underline">Reply now</button>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex gap-3">
                        <Phone className="text-green-600 shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-green-900 text-sm">Upcoming arrival</h4>
                          <p className="text-green-800 text-xs mt-1">Mike checks in tomorrow. Confirm key exchange.</p>
                          <button className="mt-2 text-green-700 text-xs font-bold hover:underline">Send instructions</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'my-properties' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
                      <p className="text-gray-600 text-sm">Manage listings, occupancy, and performance.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={navigateToAddProperty}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} /> New listing
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Analytics
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Live listings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{propertyCards.filter(p => p.status === 'Live').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Published and bookable</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Average occupancy</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {Math.round(propertyCards.reduce((a, p) => a + p.occupancy, 0) / Math.max(propertyCards.length, 1))}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Across active listings</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Avg rating</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {(propertyCards.reduce((a, p) => a + p.rating, 0) / Math.max(propertyCards.length, 1)).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Guest satisfaction</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Portfolio</h3>
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Export CSV</button>
                      </div>
                      <div className="space-y-3">
                        {propertyCards.map((prop) => (
                          <div key={prop.id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-sm transition-all flex gap-4 items-center">
                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              <img src={prop.cover} alt={prop.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 truncate">{prop.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${propertyStatusStyle(prop.status)}`}>
                                  {prop.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${kycStatusStyle(prop.kycStatus || 'pending')}`}>
                                  KYC {prop.kycStatus || 'Pending'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} /> {prop.city}, {prop.country}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-2">
                                <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">ADR ${prop.adr}</span>
                                <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">Occ {prop.occupancy}%</span>
                                <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">Bookings {prop.bookings}</span>
                                <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">Rating {prop.rating}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="text-sm font-bold text-gray-900">${prop.revenue.toLocaleString()}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewProperty(prop.id)}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                  View
                                </button>
                                <button className="text-xs font-semibold text-gray-600 hover:text-indigo-600">Edit</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Top movers</h3>
                        <button className="text-xs font-semibold text-gray-600 hover:text-indigo-600">See all</button>
                      </div>
                      <div className="space-y-3">
                        {propertyPerformance.map((property) => (
                          <div key={property.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{property.name}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTrendColor(property.trend)}`}>
                                {property.trend > 0 ? '+' : ''}{property.trend}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Occ {property.occupancy}% · ADR ${property.adr}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-900">Boost visibility</p>
                        <p className="text-xs text-indigo-800 mt-1">Enable Instant Book and keep response times low to climb search results.</p>
                        <button className="mt-2 text-xs font-bold text-indigo-700 hover:underline">View tips</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                      <p className="text-gray-600 text-sm">Track requests, check-ins, and guest details.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700">
                        <Filter size={14} /> Status
                        <select
                          value={bookingFilter}
                          onChange={(e) => setBookingFilter(e.target.value as any)}
                          className="text-sm font-semibold text-gray-700 bg-transparent outline-none"
                        >
                          <option value="all">All</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked-in">Checked in</option>
                          <option value="checked-out">Checked out</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Pending</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{recentBookings.filter(b => b.status === 'pending').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting your response</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Confirmed</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{recentBookings.filter(b => b.status === 'confirmed').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Ready to check in</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        ${recentBookings.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">From recent bookings</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Booking queue</h3>
                      <span className="text-xs font-semibold text-gray-500">{recentBookings.length} items</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="py-3">Guest</th>
                            <th className="py-3">Property</th>
                            <th className="py-3">Dates</th>
                            <th className="py-3 text-right">Amount</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentBookings
                            .filter((b) => bookingFilter === 'all' ? true : b.status === bookingFilter)
                            .map((booking) => (
                              <tr key={booking.id} className="text-sm text-gray-700">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                      style={{ backgroundColor: booking.avatarColor }}
                                    >
                                      {booking.guestInitials}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{booking.guestName}</p>
                                      <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div>
                                    <p className="font-semibold text-gray-900">{booking.propertyName}</p>
                                    <p className="text-xs text-gray-500">Guests: {booking.guests}</p>
                                  </div>
                                </td>
                                <td className="py-3 text-gray-600">
                                  {booking.dates}
                                </td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                  ${booking.amount}
                                </td>
                                <td className="py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right space-x-2">
                                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Approve</button>
                                  <button className="text-xs font-semibold text-gray-600 hover:text-indigo-600">Message</button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                      <p className="text-gray-600 text-sm">Payouts, revenue, and ADR performance.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                        Export
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                        Payout settings
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">MTD revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${hostStats.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 text-emerald-600">
                        <ArrowUpRight size={12} /> +{performanceData.revenueGrowth}% vs last month
                      </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Upcoming payout</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${payouts[0].amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Scheduled {payouts[0].date}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">ADR</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${Math.round(propertyCards.reduce((a, p) => a + p.adr, 0) / Math.max(propertyCards.length, 1))}</p>
                      <p className="text-xs text-gray-500 mt-1">Across active listings</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Occupancy</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{hostStats.occupancyRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Payouts</h3>
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View statements</button>
                      </div>
                      <div className="space-y-3">
                        {payouts.map((payout) => (
                          <div key={payout.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{payout.id}</p>
                              <p className="text-xs text-gray-500 mt-1">{payout.method} • {payout.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">${payout.amount.toLocaleString()}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${payoutStatusStyle(payout.status)}`}>
                                {payout.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Earnings tips</h3>
                        <button className="text-xs font-semibold text-gray-600 hover:text-indigo-600">See all</button>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-500 mt-0.5" /> Offer weekly discounts to improve occupancy.</p>
                        <p className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-500 mt-0.5" /> Enable Instant Book to surface higher in search.</p>
                        <p className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-500 mt-0.5" /> Keep response time under 1 hour for better ranking.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                      <p className="text-gray-600 text-sm">Performance snapshot for your portfolio.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                        Export
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                        Download report
                      </button>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {analyticsError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-rose-900 text-sm">Failed to load analytics</h4>
                          <p className="text-rose-700 text-xs mt-1">{analyticsError}</p>
                          <button
                            onClick={retryAnalyticsFetch}
                            disabled={analyticsLoading}
                            className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${analyticsLoading ? 'animate-spin' : ''}`} />
                            {analyticsLoading ? 'Retrying...' : 'Retry'}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnalyticsError(null)}
                        className="text-rose-400 hover:text-rose-600 p-1"
                      >
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </div>
                  )}

                  {/* Loading Skeleton */}
                  {analyticsLoading && !analyticsError && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
                            <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
                            <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-32"></div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                          <div className="h-5 bg-gray-300 rounded w-48 mb-4"></div>
                          <div className="h-40 bg-gray-200 rounded"></div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                          <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                          <div className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Content */}
                  {!analyticsLoading && !analyticsError && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">MTD revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${analyticsSnapshot.mtdRevenue.toLocaleString()}</p>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${analyticsSnapshot.mtdRevenueMoM >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <ArrowUpRight size={12}/> {analyticsSnapshot.mtdRevenueMoM >= 0 ? '+' : ''}{analyticsSnapshot.mtdRevenueMoM.toFixed(1)}% vs last month
                      </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Occupancy</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsSnapshot.occupancy}%</p>
                      <p className="text-xs text-gray-500 mt-1">Rolling 30 days</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">ADR</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${analyticsSnapshot.adr}</p>
                      <p className="text-xs text-gray-500 mt-1">Avg daily rate</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Bookings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsSnapshot.bookings}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Revenue trend (last 7 periods)</h3>
                        <span className="text-xs text-gray-500">MoM</span>
                      </div>
                      <div className="flex items-end gap-3 h-40">
                        {analyticsSnapshot.revenueTrend.map((value, idx) => {
                          const max = Math.max(...analyticsSnapshot.revenueTrend);
                          const height = Math.max(8, Math.round((value / max) * 100));
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400" style={{ height: `${height}%` }}></div>
                              <span className="text-[10px] text-gray-500">${value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Top markets</h3>
                        <span className="text-xs text-gray-500">Share</span>
                      </div>
                      <div className="space-y-3">
                        {analyticsSnapshot.topMarkets.map((market) => (
                          <div key={market.name}>
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                              <span>{market.name}</span>
                              <span>{market.share}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${market.share}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-bold text-gray-900">Conversion tips</h4>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                        <li>Enable instant book on high-demand dates.</li>
                        <li>Keep response time under 1 hour.</li>
                        <li>Use dynamic pricing for weekends/events.</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-900">Ops health</h4>
                      </div>
                      <p className="text-sm text-gray-700">Calendar sync healthy, response rate 95%, no overdue tasks.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-bold text-gray-900">Next actions</h4>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                        <li>Review pricing for upcoming peak dates.</li>
                        <li>Publish more photos to lift conversion.</li>
                        <li>Follow up on pending booking requests.</li>
                      </ul>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab === 'settings' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                      <p className="text-gray-600 text-sm">Manage notifications, payouts, and security.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                      Save changes
                    </button>
                  </div>

                  {/* Error Banner */}
                  {settingsError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-rose-900 text-sm">Failed to load settings</h4>
                          <p className="text-rose-700 text-xs mt-1">{settingsError}</p>
                          <button
                            onClick={retrySettingsFetch}
                            disabled={settingsLoading}
                            className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${settingsLoading ? 'animate-spin' : ''}`} />
                            {settingsLoading ? 'Retrying...' : 'Retry'}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettingsError(null)}
                        className="text-rose-400 hover:text-rose-600 p-1"
                      >
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </div>
                  )}

                  {/* Loading Skeleton */}
                  {settingsLoading && !settingsError && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-48"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  )}

                  {/* Settings Content */}
                  {!settingsLoading && !settingsError && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailAlerts', label: 'Email alerts', desc: 'Booking updates and payouts to your inbox.' },
                          { key: 'smsAlerts', label: 'SMS alerts', desc: 'Text notifications for urgent bookings.' },
                          { key: 'pushAlerts', label: 'Push notifications', desc: 'Real-time updates on desktop and mobile.' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                            <div>
                              <p className="font-semibold text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => toggleSettingPref(item.key as keyof typeof settingsPrefs)}
                              disabled={settingsUpdating}
                              className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                                settingsPrefs[item.key as keyof typeof settingsPrefs] ? 'bg-indigo-600' : 'bg-gray-300'
                              } ${settingsUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform ${
                                  settingsPrefs[item.key as keyof typeof settingsPrefs] ? 'translate-x-7' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">Payouts</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Auto payouts</p>
                          <p className="text-sm text-gray-600">Send earnings automatically to your bank.</p>
                        </div>
                        <button
                          onClick={() => toggleSettingPref('autoPayouts')}
                          disabled={settingsUpdating}
                          className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                            settingsPrefs.autoPayouts ? 'bg-indigo-600' : 'bg-gray-300'
                          } ${settingsUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform ${
                              settingsPrefs.autoPayouts ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
                        Default method: {settingsPrefs.defaultPayoutMethod}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">Security</h3>
                      <p className="text-sm text-gray-700">Keep your account safe with strong passwords and 2FA.</p>
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Manage security</button>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">Profile & team</h3>
                      <p className="text-sm text-gray-700">Update host profile or invite a co-host.</p>
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Edit profile</button>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">Support</h3>
                      <p className="text-sm text-gray-700">Need help? Our team can assist with payouts, KYC, or booking issues.</p>
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Contact support</button>
                    </div>
                  </div>
                      </>
                  )}
                </div>
              )}

              {activeTab !== 'dashboard' && activeTab !== 'my-properties' && activeTab !== 'bookings' && activeTab !== 'earnings' && activeTab !== 'analytics' && activeTab !== 'settings' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <Settings size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Under Construction</h3>
                  <p className="text-gray-500 max-w-md text-center">
                    We are currently redesigning the {activeTab.replace('-', ' ')} section to bring you a better experience.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <HostDashboardContent />
    </Suspense>
  );
}
