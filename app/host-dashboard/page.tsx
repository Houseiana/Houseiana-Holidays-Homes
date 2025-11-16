'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Property } from '@/types/property';
import {
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  Star,
  Home,
  Calendar,
  MessageCircle,
  HelpCircle,
  BarChart3,
  Bell,
  Phone,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Mail,
  UserPlus,
  TrendingUp,
  Percent,
  RefreshCw,
  Inbox,
  DoorOpen,
  Settings,
  LogOut
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


interface OnboardingStep {
  step: string;
  completed: boolean;
  title: string;
}

function HostDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Get user data from auth store
  const { user, isAuthenticated, setAuthData } = useAuthStore();

  // Unified User Profile - use real user data or fallback
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
    yearToDateRevenue: 18950,
    totalProperties: 5,
    availableNights: 150,
    bookedNights: 117,
    responseRate: 95,
    acceptanceRate: 87
  };

  // Performance Analytics
  const performanceData = {
    revenueGrowth: 12.5,
    occupancyTrend: 'up',
    bookingsTrend: 'up',
    ratingTrend: 'stable'
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
      specialRequests: '',
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
    },
    {
      id: '3',
      guestName: 'David Wilson',
      guestInitials: 'DW',
      propertyName: 'City Apartment',
      amount: 850,
      dates: 'Jan 5-8',
      status: 'confirmed',
      checkIn: '2025-01-05',
      checkOut: '2025-01-08',
      guests: 2,
      avatarColor: '#2563eb',
      guestRating: 4.6,
      isNewGuest: false,
      specialRequests: 'Late check-out requested',
      guestPhone: '+1-555-0789',
      emergencyContact: 'Sarah Wilson (+1-555-0790)'
    }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_booking',
      title: 'New Booking Request',
      message: 'Anna Johnson requested to book Mountain Cabin',
      timestamp: new Date('2024-12-10T10:30:00'),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Mike Rodriguez sent you a message',
      timestamp: new Date('2024-12-10T09:15:00'),
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review',
      message: 'You received a 5-star review from David Wilson',
      timestamp: new Date('2024-12-09T16:45:00'),
      read: true,
      priority: 'low'
    }
  ]);


  // Onboarding status
  const isNewHost = false;
  const onboardingSteps: OnboardingStep[] = [
    { step: 'profile', completed: true, title: 'Complete your host profile' },
    { step: 'property', completed: true, title: 'Add your first property' },
    { step: 'photos', completed: false, title: 'Upload high-quality photos' },
    { step: 'pricing', completed: false, title: 'Set competitive pricing' },
    { step: 'calendar', completed: false, title: 'Update your calendar' }
  ];

  // Helper functions
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getOnboardingProgress = () => {
    const completedSteps = onboardingSteps.filter(s => s.completed).length;
    return Math.round((completedSteps / onboardingSteps.length) * 100);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const acceptBooking = (bookingId: string) => {
    setRecentBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b)
    );
  };

  const declineBooking = (bookingId: string) => {
    setRecentBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'declined' as const } : b)
    );
  };

  const messageGuest = (guestName: string) => {
    console.log('Messaging guest:', guestName);
    setActiveTab('messages');
  };

  const viewBookingDetails = (bookingId: string) => {
    console.log('Viewing booking details:', bookingId);
  };

  const navigateToClientDashboard = () => {
    router.push('/client-dashboard');
  };

  const navigateToAddProperty = () => {
    console.log('Navigating to add listing page...');
    router.push('/host-dashboard/add-listing');
  };

  const handleSignOut = () => {
    try {
      console.log('🚪 Starting sign out process...');

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      // Clear auth store
      const { logout } = useAuthStore.getState();
      logout();
      console.log('✅ Auth cleared successfully');

      // Redirect to home page
      router.push('/');
      console.log('✅ Redirecting to home page');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const fetchProperties = async () => {
    if (!user?.userId) return;

    setLoadingProperties(true);
    try {
      const response = await fetch(`/api/properties?hostId=${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProperties(data.properties || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Handle URL parameters to set initial tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch properties when my-properties tab is active
  useEffect(() => {
    if (activeTab === 'my-properties' && user?.userId) {
      fetchProperties();
    }
  }, [activeTab, user?.userId]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && user) {
        // Update user in auth store with new profile photo
        const updatedUser = {
          ...user,
          profilePhoto: result.photoUrl
        };

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }

        // Reload to reflect changes (you could also use a state update)
        window.location.reload();
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (!user) return;

    try {
      // Update user in auth store to remove profile photo
      const updatedUser = {
        ...user,
        profilePhoto: undefined
      };

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Remove photo error:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
          <div className="p-6">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Houseiana</h1>
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="px-6 pb-4 flex-1 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'dashboard'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('my-properties')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'my-properties'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                My Properties
              </button>
              <Link
                href="/host-dashboard/add-listing"
                className="flex items-center px-4 py-3 rounded-lg font-medium w-full text-left text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              >
                <Plus className="w-5 h-5 mr-3" />
                Add New Listing
              </Link>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'bookings'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Bookings & Calendar
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'earnings'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Earnings & Payouts
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'reviews'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Star className="w-5 h-5 mr-3" />
                Reviews & Ratings
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'messages'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Guest Messages
              </button>
              <button
                onClick={() => setActiveTab('guest-crm')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'guest-crm'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Guest CRM
              </button>
              <button
                onClick={() => setActiveTab('kyc-compliance')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'kyc-compliance'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                KYC & Compliance
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'analytics'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                Analytics & Insights
              </button>
              <button
                onClick={() => setActiveTab('automations')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'automations'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="w-5 h-5 mr-3" />
                Automations
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left ${
                  activeTab === 'settings'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Host Settings
              </button>
              <Link href="/help" className="flex items-center px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg">
                <HelpCircle className="w-5 h-5 mr-3" />
                Host Support
              </Link>
            </nav>
          </div>

          {/* User Profile Section - Bottom of Sidebar */}
          <div className="p-6 border-t border-gray-200 mt-auto">
            <div className="flex items-center space-x-3 mb-3">
              {userProfile.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{userProfile.initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.name}
                </p>
                <p className="text-xs text-purple-600 truncate">
                  🏠 Host
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                title="Edit Profile"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Dashboard Actions */}
            <div className="flex space-x-2">
              <button
                onClick={navigateToClientDashboard}
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Switch to Guest Dashboard"
              >
                <Users className="w-3 h-3 mr-1" />
                Guest
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {isLoading && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">Loading dashboard data...</p>
              </div>
            )}

            {!isLoading && (
              <>
                {/* Dashboard Content */}
                {activeTab === 'dashboard' && (
                  <div>
                    {/* Welcome Section */}
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8 flex flex-col md:flex-row items-center justify-between">
                      <div className="text-center md:text-left mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          Welcome back, {userProfile.name}! 🏠
                        </h1>
                        <p className="text-gray-600 text-lg">
                          Here's an overview of your hosting performance and activity.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          type="button"
                          onClick={navigateToAddProperty}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md cursor-pointer touch-manipulation"
                        >
                          ➕ Add New Listing
                        </button>
                        <button
                          onClick={navigateToClientDashboard}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Switch to Guest
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Revenue */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">💰 Total Revenue</p>
                            <h3 className="text-2xl font-bold text-green-600">${hostStats.totalRevenue.toLocaleString()}</h3>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              +{performanceData.revenueGrowth}% this month
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      {/* Occupancy Rate */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">📊 Occupancy Rate</p>
                            <h3 className="text-2xl font-bold text-blue-600">{hostStats.occupancyRate}%</h3>
                            <p className="text-xs text-gray-500 mt-1">{hostStats.bookedNights}/{hostStats.availableNights} nights</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* Active Bookings */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">📅 Active Bookings</p>
                            <h3 className="text-2xl font-bold text-purple-600">{hostStats.activeBookings}</h3>
                            <p className="text-xs text-purple-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending up
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      {/* Average Rating */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">⭐ Average Rating</p>
                            <h3 className="text-2xl font-bold text-yellow-600">{hostStats.averageRating}</h3>
                            <p className="text-xs text-gray-500 mt-1">{hostStats.responseRate}% response rate</p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Bookings Section */}
                    <section className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">📋 Recent Guest Bookings</h2>
                          <p className="text-gray-600 text-sm mt-1">Manage your current and upcoming reservations</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            {getUnreadNotificationsCount()} pending actions
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                            View All Bookings →
                          </button>
                        </div>
                      </div>

                      {recentBookings.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📋</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Bookings</h3>
                          <p className="mb-4">Start by adding your first property to receive bookings</p>
                          <button
                            type="button"
                            onClick={navigateToAddProperty}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer touch-manipulation"
                          >
                            🏠 Add Your First Property
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentBookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center">
                                    <div
                                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                                      style={{ backgroundColor: booking.avatarColor }}
                                    >
                                      {booking.guestInitials}
                                    </div>
                                    <div className="ml-4">
                                      <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{booking.guestName}</h3>
                                        {booking.isNewGuest && (
                                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                            New Guest
                                          </span>
                                        )}
                                        {booking.guestRating && (
                                          <span className="text-yellow-500 text-sm flex items-center">
                                            ⭐ {booking.guestRating}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-600 text-sm mt-1">🏡 {booking.propertyName}</p>
                                      <p className="text-gray-500 text-xs mt-1">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">${booking.amount.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">{booking.dates}</div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(booking.status)}`}>
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                      <span>Check-in: {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      <span className="mx-2">•</span>
                                      <span>Check-out: {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex space-x-3">
                                      {booking.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => declineBooking(booking.id)}
                                            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                          >
                                            ❌ Decline
                                          </button>
                                          <button
                                            onClick={() => acceptBooking(booking.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                          >
                                            ✅ Accept
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => viewBookingDetails(booking.id)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                      >
                                        👁️ Details
                                      </button>
                                      <button
                                        onClick={() => messageGuest(booking.guestName)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                      >
                                        💬 Message
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Enhanced Host Tools & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                      {/* Left Column: Host Tools */}
                      <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Host Tools & Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Property Management */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🏠</span>
                              </div>
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                                {hostStats.totalProperties} Properties
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Properties</h3>
                            <p className="text-gray-600 text-sm mb-4">Add, edit, and optimize your listings</p>
                            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                              Manage Listings
                            </button>
                          </div>

                          {/* Pricing Tools */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                              </div>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Smart Pricing</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Tools</h3>
                            <p className="text-gray-600 text-sm mb-4">Optimize rates and increase revenue</p>
                            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                              Optimize Pricing
                            </button>
                          </div>

                          {/* Calendar Management */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📅</span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Multi-Calendar</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar</h3>
                            <p className="text-gray-600 text-sm mb-4">Manage availability and sync channels</p>
                            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                              View Calendar
                            </button>
                          </div>

                          {/* Guest Communication */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💬</span>
                              </div>
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                {getUnreadNotificationsCount()} New
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                            <p className="text-gray-600 text-sm mb-4">Unified inbox for all guest communications</p>
                            <button
                              onClick={() => setActiveTab('messages')}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Check Messages
                            </button>
                          </div>

                          {/* Reviews Management */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⭐</span>
                              </div>
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                {hostStats.averageRating}/5
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
                            <p className="text-gray-600 text-sm mb-4">Monitor and respond to guest feedback</p>
                            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                              Manage Reviews
                            </button>
                          </div>

                          {/* Analytics & Reports */}
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📈</span>
                              </div>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                +{performanceData.revenueGrowth}%
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                            <p className="text-gray-600 text-sm mb-4">Performance insights and reports</p>
                            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                              View Analytics
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Notifications & Quick Actions */}
                      <div className="space-y-6">
                        {/* Notifications Panel */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">🔔 Notifications</h3>
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                {getUnreadNotificationsCount()}
                              </span>
                            </div>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => markNotificationRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {notification.timestamp.toLocaleString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 border-t border-gray-200">
                            <button className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                              View All Notifications
                            </button>
                          </div>
                        </div>

                        {/* Quick Performance Insights */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Performance Insights</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Response Rate</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${hostStats.responseRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{hostStats.responseRate}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Acceptance Rate</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${hostStats.acceptanceRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{hostStats.acceptanceRate}%</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                📋 Download Full Report
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Onboarding Section for New Hosts */}
                    {(isNewHost || getOnboardingProgress() < 100) && (
                      <section className="mb-8">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">🚀 Complete Your Host Setup</h2>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                              {getOnboardingProgress()}% Complete
                            </span>
                          </div>
                          <div className="mb-4">
                            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                              <div
                                className="bg-white h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getOnboardingProgress()}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {onboardingSteps.map((step, index) => (
                              <div key={step.step} className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  step.completed ? 'bg-green-500' : 'bg-white bg-opacity-20'
                                }`}>
                                  <span className="text-white text-xs">
                                    {step.completed ? '✓' : index + 1}
                                  </span>
                                </div>
                                <span className={`text-sm ${step.completed ? 'opacity-100' : 'opacity-70'}`}>
                                  {step.title}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                              Continue Setup
                            </button>
                            <button className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium">
                              Skip for Now
                            </button>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Properties Overview */}
                    <section className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">🏡 Your Properties</h2>
                        <button
                          type="button"
                          onClick={navigateToAddProperty}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer touch-manipulation"
                        >
                          ➕ Add New Property
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {properties.map((property) => (
                          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                                  <p className="text-gray-600 text-sm">📍 {property.location}</p>
                                  <p className="text-gray-500 text-xs mt-1">{property.type} • {property.bedrooms} bedrooms</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  property.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{property.occupancyRate}%</div>
                                  <div className="text-xs text-gray-500">Occupancy</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-yellow-600">{property.averageRating}</div>
                                  <div className="text-xs text-gray-500">Rating</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">${property.monthlyRevenue.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">Monthly</div>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                  📊 Analytics
                                </button>
                                <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                                  ✏️ Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Recent Activity Section */}
                    <section className="mb-8">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                          <h2 className="text-xl font-bold text-gray-900">🕒 Recent Hosting Activity</h2>
                        </div>
                        <div className="p-6">
                          <div className="space-y-4">
                            {/* Sample recent activities */}
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm">📋</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New booking request from Anna Johnson</p>
                                <p className="text-xs text-gray-500">Mountain Cabin • 2 hours ago</p>
                              </div>
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm">⭐</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New 5-star review from David Wilson</p>
                                <p className="text-xs text-gray-500">City Apartment • 1 day ago</p>
                              </div>
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">Read</button>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 text-sm">💰</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Payout of $1,250 processed successfully</p>
                                <p className="text-xs text-gray-500">Beachfront Villa • 2 days ago</p>
                              </div>
                              <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">Details</button>
                            </div>
                          </div>

                          <div className="mt-6 text-center">
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                              View All Activity →
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {/* My Trips Content */}
                {activeTab === 'my-trips' && (
                  <div>
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧳 Host Bookings & Guest Management</h1>
                          <p className="text-gray-600 text-lg">Monitor all your property bookings, guest interactions, and reservation history.</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            📊 Export Report
                          </button>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            📅 Calendar View
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booking Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {/* Pending Requests */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">⏳ Pending Requests</p>
                            <h3 className="text-2xl font-bold text-yellow-600">3</h3>
                            <p className="text-xs text-yellow-600 mt-1">Awaiting response</p>
                          </div>
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                        </div>
                      </div>

                      {/* Confirmed Bookings */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">✅ Confirmed</p>
                            <h3 className="text-2xl font-bold text-green-600">{hostStats.activeBookings}</h3>
                            <p className="text-xs text-green-600 mt-1">Upcoming stays</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>

                      {/* Current Guests */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">🏠 Current Guests</p>
                            <h3 className="text-2xl font-bold text-blue-600">5</h3>
                            <p className="text-xs text-blue-600 mt-1">Checked in now</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* Total Revenue */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">💰 Month Revenue</p>
                            <h3 className="text-2xl font-bold text-purple-600">${hostStats.monthlyRevenue.toLocaleString()}</h3>
                            <p className="text-xs text-purple-600 mt-1">This month</p>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Management Interface */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">📋 Recent Booking Requests & Reservations</h3>
                          <div className="flex items-center space-x-2">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                              <option>All Properties</option>
                              <option>Beachfront Villa</option>
                              <option>Mountain Cabin</option>
                            </select>
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                              <option>All Status</option>
                              <option>Pending</option>
                              <option>Confirmed</option>
                              <option>Checked In</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Booking Cards */}
                        <div className="space-y-4">
                          {recentBookings.map((booking) => (
                            <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              {/* Booking Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                  {/* Guest Avatar */}
                                  <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                                    style={{ backgroundColor: booking.avatarColor }}
                                  >
                                    {booking.guestInitials}
                                  </div>

                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className="text-lg font-semibold text-gray-900">{booking.guestName}</h4>
                                      {booking.isNewGuest && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                          New Guest
                                        </span>
                                      )}
                                      {booking.guestRating && (
                                        <span className="text-yellow-500 text-sm flex items-center">
                                          ⭐ {booking.guestRating}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600 text-sm">🏡 {booking.propertyName}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                      <span>📅 {booking.dates}</span>
                                      <span>👥 {booking.guests} guests</span>
                                      {booking.specialRequests && (
                                        <span className="text-indigo-600">💬 Special requests</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900">${booking.amount.toLocaleString()}</div>
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                              </div>

                              {/* Special Requests */}
                              {booking.specialRequests && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <span className="font-medium">💬 Guest Request:</span> {booking.specialRequests}
                                  </p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-3">
                                  {booking.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => acceptBooking(booking.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                      >
                                        ✅ Accept
                                      </button>
                                      <button
                                        onClick={() => declineBooking(booking.id)}
                                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                      >
                                        ❌ Decline
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => viewBookingDetails(booking.id)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                  >
                                    👁️ View Details
                                  </button>
                                  <button
                                    onClick={() => messageGuest(booking.guestName)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                  >
                                    💬 Message Guest
                                  </button>
                                </div>

                                <div className="text-sm text-gray-500">
                                  Booking ID: {booking.id}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {recentBookings.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-3xl">📋</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Bookings</h3>
                            <p className="text-gray-600 mb-6">Your booking requests and reservations will appear here</p>
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                              🏠 Manage Properties
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Host Tools for Trips */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Guest Communication */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">💬 Guest Communication</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">2 unread messages</p>
                              <p className="text-xs text-gray-600">From current guests</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('messages')}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View All Messages
                          </button>
                        </div>
                      </div>

                      {/* Check-in/Check-out */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🚪 Check-in/Check-out</h4>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <p><span className="font-medium">Today's Check-ins:</span> 2 guests</p>
                            <p><span className="font-medium">Today's Check-outs:</span> 1 guest</p>
                          </div>
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            Manage Check-ins
                          </button>
                        </div>
                      </div>

                      {/* Emergency Contacts */}
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🆘 Support & Emergency</h4>
                        <div className="space-y-3">
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            📞 Emergency Hotline
                          </button>
                          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                            💬 Contact Support
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wishlist Content */}
                {activeTab === 'wishlist' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">❤️ Wishlist</h1>
                      <p className="text-gray-600 text-lg">Properties you're interested in hosting similar to.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-gray-500 text-center">Host wishlist content will be loaded here...</p>
                    </div>
                  </div>
                )}

                {/* Explore Content */}
                {activeTab === 'explore' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Explore</h1>
                      <p className="text-gray-600 text-lg">Discover market insights and competitor analysis.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-gray-500 text-center">Host explore content will be loaded here...</p>
                    </div>
                  </div>
                )}

                {/* Messages Content */}
                {activeTab === 'messages' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Messages</h1>
                      <p className="text-gray-600 text-lg">Communicate with guests and manage your conversations.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-gray-500 text-center">Host messages content will be loaded here...</p>
                    </div>
                  </div>
                )}

                {/* Payments Content */}
                {activeTab === 'payments' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payments</h1>
                      <p className="text-gray-600 text-lg">Manage your payouts and financial settings.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-gray-500 text-center">Host payments content will be loaded here...</p>
                    </div>
                  </div>
                )}

                {/* Guest CRM Content */}
                {activeTab === 'guest-crm' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Guest CRM System</h1>
                      <p className="text-gray-600 text-lg">Complete guest directory with communication history and insights.</p>
                    </div>

                    {/* Guest Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">👥 Total Guests</p>
                            <h3 className="text-2xl font-bold text-blue-600">248</h3>
                            <p className="text-xs text-blue-600 mt-1">+15% this month</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">🔄 Repeat Guests</p>
                            <h3 className="text-2xl font-bold text-green-600">67</h3>
                            <p className="text-xs text-green-600 mt-1">27% repeat rate</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">⭐ VIP Guests</p>
                            <h3 className="text-2xl font-bold text-purple-600">23</h3>
                            <p className="text-xs text-purple-600 mt-1">High-value guests</p>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">💬 Active Conversations</p>
                            <h3 className="text-2xl font-bold text-orange-600">12</h3>
                            <p className="text-xs text-orange-600 mt-1">Ongoing chats</p>
                          </div>
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Management Tools */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">🔍 Guest Directory</h3>
                          <div className="flex items-center space-x-3">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                              <option>All Guests</option>
                              <option>VIP Guests</option>
                              <option>Repeat Guests</option>
                              <option>New Guests</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Search guests..."
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
                            />
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                              + Add Guest
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Sample Guest Entries */}
                          {[
                            {
                              name: 'Sarah Johnson',
                              email: 'sarah.j@email.com',
                              phone: '+1-555-0123',
                              stays: 3,
                              totalSpent: 2400,
                              rating: 4.9,
                              lastStay: '2024-11-15',
                              tags: ['VIP', 'Repeat'],
                              rfmScore: 'High Value',
                              avatar: 'SJ',
                              color: '#059669'
                            },
                            {
                              name: 'Mike Chen',
                              email: 'mike.chen@email.com',
                              phone: '+1-555-0456',
                              stays: 1,
                              totalSpent: 850,
                              rating: 4.7,
                              lastStay: '2024-12-01',
                              tags: ['New'],
                              rfmScore: 'Medium Value',
                              avatar: 'MC',
                              color: '#2563eb'
                            },
                            {
                              name: 'Emma Davis',
                              email: 'emma.davis@email.com',
                              phone: '+1-555-0789',
                              stays: 5,
                              totalSpent: 4200,
                              rating: 5.0,
                              lastStay: '2024-10-20',
                              tags: ['VIP', 'Repeat', 'Loyal'],
                              rfmScore: 'High Value',
                              avatar: 'ED',
                              color: '#dc2626'
                            }
                          ].map((guest, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                                    style={{ backgroundColor: guest.color }}
                                  >
                                    {guest.avatar}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className="text-lg font-semibold text-gray-900">{guest.name}</h4>
                                      <div className="flex space-x-1">
                                        {guest.tags.map((tag, i) => (
                                          <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            tag === 'VIP' ? 'bg-purple-100 text-purple-800' :
                                            tag === 'Repeat' ? 'bg-green-100 text-green-800' :
                                            tag === 'Loyal' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{guest.email} • {guest.phone}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                      <span>🏠 {guest.stays} stays</span>
                                      <span>💰 ${guest.totalSpent.toLocaleString()} total</span>
                                      <span>⭐ {guest.rating} rating</span>
                                      <span>📅 Last: {new Date(guest.lastStay).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    guest.rfmScore === 'High Value' ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {guest.rfmScore}
                                  </span>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Phone className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CRM Tools */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📧 Email Campaigns</h4>
                        <div className="space-y-3">
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Send Review Request
                          </button>
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                            Loyalty Discount Offer
                          </button>
                          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            Welcome Back Message
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🤖 Automations</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Check-in reminder</span>
                            <div className="w-8 h-4 bg-green-500 rounded-full relative">
                              <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Review follow-up</span>
                            <div className="w-8 h-4 bg-green-500 rounded-full relative">
                              <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Birthday wishes</span>
                            <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                              <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Guest Insights</h4>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Average stay duration:</span>
                            <span className="font-medium text-gray-900 ml-2">3.2 nights</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Peak booking months:</span>
                            <span className="font-medium text-gray-900 ml-2">Jun, Jul, Dec</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Guest satisfaction:</span>
                            <span className="font-medium text-gray-900 ml-2">4.8/5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC & Compliance Content */}
                {activeTab === 'kyc-compliance' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ KYC & Compliance</h1>
                      <p className="text-gray-600 text-lg">Identity verification and compliance management.</p>
                    </div>

                    {/* KYC Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">✅ Verification Status</p>
                            <h3 className="text-2xl font-bold text-green-600">Approved</h3>
                            <p className="text-xs text-green-600 mt-1">Valid until Dec 2025</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">📄 Documents</p>
                            <h3 className="text-2xl font-bold text-blue-600">5/5</h3>
                            <p className="text-xs text-blue-600 mt-1">All uploaded</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">🔍 Compliance Score</p>
                            <h3 className="text-2xl font-bold text-purple-600">98%</h3>
                            <p className="text-xs text-purple-600 mt-1">Excellent</p>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">📁 Document Management</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {[
                            { name: 'Government ID (Passport)', status: 'approved', uploaded: '2024-01-15', expires: '2026-01-15' },
                            { name: 'Proof of Address', status: 'approved', uploaded: '2024-01-15', expires: '2025-01-15' },
                            { name: 'Property Ownership Proof', status: 'approved', uploaded: '2024-01-15', expires: 'N/A' },
                            { name: 'Business License', status: 'approved', uploaded: '2024-01-15', expires: '2025-12-31' },
                            { name: 'Tax Form (W-9)', status: 'approved', uploaded: '2024-01-15', expires: '2025-12-31' }
                          ].map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    Uploaded: {new Date(doc.uploaded).toLocaleDateString()} •
                                    Expires: {doc.expires === 'N/A' ? 'N/A' : new Date(doc.expires).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Approved
                                </span>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Tools */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🔄 Verification Providers</h4>
                        <div className="space-y-3">
                          {['Veriff', 'Onfido', 'Persona', 'Sumsub'].map((provider, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <span className="font-medium text-gray-900">{provider}</span>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Connected</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Audit Trail</h4>
                        <div className="space-y-3">
                          {[
                            { action: 'Document verified', date: '2024-12-10', user: 'System' },
                            { action: 'KYC status updated', date: '2024-12-10', user: 'Admin' },
                            { action: 'Document uploaded', date: '2024-01-15', user: 'Host' },
                            { action: 'Verification started', date: '2024-01-15', user: 'Host' }
                          ].map((event, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900">{event.action}</span>
                              <span className="text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Automations Content */}
                {activeTab === 'automations' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Automations & Integrations</h1>
                      <p className="text-gray-600 text-lg">Streamline your hosting operations with smart automations.</p>
                    </div>

                    {/* Automation Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">⚡ Active Automations</p>
                            <h3 className="text-2xl font-bold text-blue-600">12</h3>
                            <p className="text-xs text-blue-600 mt-1">Running smoothly</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">📧 Messages Sent</p>
                            <h3 className="text-2xl font-bold text-green-600">1,247</h3>
                            <p className="text-xs text-green-600 mt-1">This month</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">🔗 Integrations</p>
                            <h3 className="text-2xl font-bold text-purple-600">8</h3>
                            <p className="text-xs text-purple-600 mt-1">Connected services</p>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">⏱️ Time Saved</p>
                            <h3 className="text-2xl font-bold text-orange-600">24h</h3>
                            <p className="text-xs text-orange-600 mt-1">This week</p>
                          </div>
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automation Builder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">🛠️ Automation Builder</h3>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                            + Create New Automation
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {[
                            {
                              name: 'Welcome Message Sequence',
                              trigger: 'Booking confirmed',
                              action: 'Send WhatsApp welcome message',
                              status: 'active',
                              runs: 145
                            },
                            {
                              name: 'Check-in Reminder',
                              trigger: '24 hours before check-in',
                              action: 'Send check-in instructions email',
                              status: 'active',
                              runs: 89
                            },
                            {
                              name: 'Review Request',
                              trigger: '3 days after check-out',
                              action: 'Send review request email',
                              status: 'active',
                              runs: 67
                            },
                            {
                              name: 'Price Optimization',
                              trigger: 'Daily at 6 AM',
                              action: 'Update pricing based on demand',
                              status: 'paused',
                              runs: 30
                            }
                          ].map((automation, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-gray-900">{automation.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      automation.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {automation.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Trigger:</span> {automation.trigger}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Action:</span> {automation.action}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">Executed {automation.runs} times</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <div className={`w-8 h-4 rounded-full relative ${
                                    automation.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                                      automation.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Integration Management */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🔗 Connected Integrations</h4>
                        <div className="space-y-3">
                          {[
                            { name: 'Stripe', type: 'Payment Processing', status: 'connected' },
                            { name: 'SendGrid', type: 'Email Service', status: 'connected' },
                            { name: 'WhatsApp API', type: 'Messaging', status: 'connected' },
                            { name: 'Airbnb', type: 'Channel Manager', status: 'connected' },
                            { name: 'Google Calendar', type: 'Calendar Sync', status: 'pending' }
                          ].map((integration, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.type}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                integration.status === 'connected'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {integration.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Automation Performance</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Message Delivery Rate</span>
                              <span className="text-sm font-medium text-gray-900">98.5%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Response Rate</span>
                              <span className="text-sm font-medium text-gray-900">87%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Automation Success Rate</span>
                              <span className="text-sm font-medium text-gray-900">94%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* My Properties Content */}
                {activeTab === 'my-properties' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 My Properties</h1>
                          <p className="text-gray-600 text-lg">Manage your property listings and performance.</p>
                        </div>
                        <Link
                          href="/host-dashboard/add-listing"
                          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          <Plus className="w-5 h-5 inline-block mr-2" />
                          Add New Property
                        </Link>
                      </div>
                    </div>

                    {/* Properties List */}
                    <PropertiesListSection />
                  </div>
                )}

                {/* Profile Content */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Host Profile</h1>
                      <p className="text-gray-600 text-lg">Manage your host profile and account settings.</p>
                    </div>

                    {/* Profile Photo Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">📸 Profile Photo</h3>
                        <p className="text-sm text-gray-600">Update your profile photo to help guests recognize you.</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-6">
                          {/* Current Photo Display */}
                          <div className="relative">
                            {userProfile.profilePhoto ? (
                              <img
                                src={userProfile.profilePhoto}
                                alt={userProfile.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200">
                                <span className="text-white font-bold text-2xl">{userProfile.initials}</span>
                              </div>
                            )}
                            {/* Camera Icon Overlay */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                              <span className="text-white text-xs">📷</span>
                            </div>
                          </div>

                          {/* Upload Controls */}
                          <div className="flex-1">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Update Profile Photo</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Choose a clear, professional photo where your face is clearly visible. JPG, PNG or GIF (max 5MB).
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <label className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-sm font-medium ${
                                uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                              }`}>
                                {uploadingPhoto ? 'Uploading...' : 'Choose File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingPhoto}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePhotoUpload(file);
                                    }
                                  }}
                                />
                              </label>
                              {userProfile.profilePhoto && (
                                <button
                                  onClick={removeProfilePhoto}
                                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                >
                                  Remove Photo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">ℹ️ Personal Information</h3>
                        <p className="text-sm text-gray-600">Update your personal details and contact information.</p>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={user?.firstName || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={user?.lastName || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your last name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={user?.phone || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">⚙️ Account Settings</h3>
                        <p className="text-sm text-gray-600">Manage your account preferences and security settings.</p>
                      </div>
                      <div className="p-6">
                        <div className="space-y-6">
                          {/* Privacy Settings */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Privacy & Visibility</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Show profile to guests</p>
                                  <p className="text-xs text-gray-500">Allow guests to see your host profile</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Contact information visible</p>
                                  <p className="text-xs text-gray-500">Show your contact details to confirmed guests</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notification Preferences */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Email notifications</p>
                                  <p className="text-xs text-gray-500">Receive booking updates via email</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">SMS notifications</p>
                                  <p className="text-xs text-gray-500">Get urgent updates via text message</p>
                                </div>
                                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Security Settings */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Security</h4>
                            <div className="space-y-3">
                              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                                  <p className="text-xs text-gray-500">Update your account password</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </button>
                              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">Enabled</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Host Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">🏠 Host Status</h3>
                        <p className="text-sm text-gray-600">Your hosting status and membership details.</p>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-green-900">Verified Host</p>
                            <p className="text-xs text-green-600">Identity confirmed</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Star className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-blue-900">Superhost</p>
                            <p className="text-xs text-blue-600">Top-rated host</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium text-purple-900">Member Since</p>
                            <p className="text-xs text-purple-600">{user?.memberSince || '2024'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );

  // PropertiesListSection component
  function PropertiesListSection() {
    if (loadingProperties) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      );
    }

    if (properties.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
          <p className="text-gray-600 mb-6">Start your hosting journey by adding your first property.</p>
          <Link
            href="/host-dashboard/add-listing"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Property
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Properties Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">🏠 Total Properties</p>
                <h3 className="text-2xl font-bold text-blue-600">{properties.length}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">📊 Active Listings</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'active').length}
                </h3>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">💰 Total Earnings</p>
                <h3 className="text-2xl font-bold text-purple-600">
                  ${properties.reduce((sum, p) => sum + (p.totalEarnings || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">⭐ Avg Rating</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {properties.length > 0
                    ? (properties.reduce((sum, p) => sum + (p.ratings?.overall || 0), 0) / properties.length).toFixed(1)
                    : '0.0'
                  }
                </h3>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Property Image */}
              <div className="aspect-video bg-gray-200 relative">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'active' ? 'bg-green-100 text-green-800' :
                    property.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600">
                      {property.address?.city}, {property.address?.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${property.pricing?.basePrice}</p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{property.ratings?.overall || '0.0'}</span>
                    <span className="ml-1">({property.ratings?.totalReviews || 0})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Bookings</p>
                    <p className="font-semibold">{property.bookingCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Earnings</p>
                    <p className="font-semibold">${property.totalEarnings || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                    <Eye className="w-4 h-4 inline-block mr-1" />
                    View Details
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 font-medium text-sm">
                    <Edit className="w-4 h-4 inline-block mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default function HostDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostDashboardContent />
    </Suspense>
  );
}