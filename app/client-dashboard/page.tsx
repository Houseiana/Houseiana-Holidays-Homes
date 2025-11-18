'use client'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import KYCModal from '@/components/KYCModal'
import {
  LayoutDashboard, Clock, Heart, Search, MessageCircle, CreditCard, User,
  HelpCircle, ArrowRightLeft, Star, Calendar, MapPin, LogOut, ChevronRight, TrendingUp
} from 'lucide-react'
import TripsPage from '@/app/(dashboard)/trips/page'
import WishlistPage from '@/app/(dashboard)/wishlist/page'
import ExplorePage from '@/app/(dashboard)/explore/page'
import ProfilePage from '@/app/(dashboard)/profile/page'
import PaymentsPage from '@/app/(dashboard)/payments/page'
import SupportPage from '@/app/(dashboard)/help-center/page'

interface Booking {
  id: string
  property: {
    title: string
    address: string
    photos: string[]
  }
  checkIn: string
  checkOut: string
  status: string
  hostId?: string
}

interface SavedProperty {
  id: string
  title: string
  address: {
    city: string
    country: string
  }
  pricing: {
    basePrice: number
  }
  ratings: {
    overall: number
    totalReviews: number
  }
  photos: Array<{ url: string }>
}

function ClientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  // Unified User Profile - use real user data or fallback
  const userProfile = {
    name: user?.name || `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() || 'Guest User',
    initials: user?.initials || `${user?.firstName?.charAt(0) || 'G'}${user?.lastName?.charAt(0) || ''}`.trim() || 'GU',
    email: user?.email || 'guest@example.com',
    profilePhoto: user?.profilePhoto
  };

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showKYCModal, setShowKYCModal] = useState(false)

  // Check if KYC is required
  useEffect(() => {
    const kycRequired = searchParams.get('kyc') === 'required'
    const storedUser = localStorage.getItem('auth_user')

    if (kycRequired && storedUser) {
      const userData = JSON.parse(storedUser)
      if (!userData.hasCompletedKYC) {
        setShowKYCModal(true)
      }
    }
  }, [searchParams])

  // Mock data
  const [upcomingBookings] = useState<Booking[]>([
    {
      id: '1',
      property: {
        title: 'Modern Downtown Apartment',
        address: 'Downtown, City Center',
        photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop']
      },
      checkIn: '2024-11-01',
      checkOut: '2024-11-05',
      status: 'confirmed',
      hostId: 'host1'
    },
    {
      id: '2',
      property: {
        title: 'Cozy Beach House',
        address: 'Oceanview, Coastal Area',
        photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop']
      },
      checkIn: '2024-12-15',
      checkOut: '2024-12-20',
      status: 'pending',
      hostId: 'host2'
    }
  ])

  const [savedProperties] = useState<SavedProperty[]>([
    {
      id: '1',
      title: 'Luxury Villa with Pool',
      address: {
        city: 'Miami',
        country: 'USA'
      },
      pricing: {
        basePrice: 350
      },
      ratings: {
        overall: 4.9,
        totalReviews: 203
      },
      photos: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop' }]
    },
    {
      id: '2',
      title: 'Mountain Cabin Retreat',
      address: {
        city: 'Aspen',
        country: 'USA'
      },
      pricing: {
        basePrice: 180
      },
      ratings: {
        overall: 4.7,
        totalReviews: 45
      },
      photos: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop' }]
    }
  ])

  const startNewSearch = () => {
    router.push('/discover')
  }

  const viewBookingDetails = (bookingId: string) => {
    router.push(`/booking/${bookingId}`)
  }

  const viewPropertyDetails = (propertyId: string) => {
    router.push(`/property/${propertyId}`)
  }

  const messageHost = (hostId: string) => {
    router.push(`/messages/${hostId}`)
  }

  const handleSignOut = () => {
    try {
      console.log('🚪 Starting sign out process...')

      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'

      // Clear auth store
      const { logout } = useAuthStore.getState()
      logout()
      console.log('✅ Auth cleared successfully')

      // Redirect to home page
      router.push('/')
      console.log('✅ Redirecting to home page')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-trips', label: 'My Trips', icon: Clock },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="flex h-screen">
        {/* Improved Sidebar Navigation */}
        <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">

          {/* Brand Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <span className="font-bold text-xl font-serif">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">Houseiana</h1>
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Client Dashboard</span>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 px-4 overflow-y-auto space-y-6 py-4">

            {/* Group: Main Menu */}
            <div>
              <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'dashboard'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard size={18} className={`transition-colors ${activeTab === 'dashboard' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Dashboard</span>
                  {activeTab === 'dashboard' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'explore'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Search size={18} className={`transition-colors ${activeTab === 'explore' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Explore</span>
                  {activeTab === 'explore' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>

                <button
                  onClick={() => setActiveTab('my-trips')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'my-trips'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Clock size={18} className={`transition-colors ${activeTab === 'my-trips' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>My Trips</span>
                  {activeTab === 'my-trips' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'wishlist'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Heart size={18} className={`transition-colors ${activeTab === 'wishlist' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Wishlist</span>
                  {activeTab === 'wishlist' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>
              </div>
            </div>

            {/* Group: Account */}
            <div>
              <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'payments'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <CreditCard size={18} className={`transition-colors ${activeTab === 'payments' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Payments</span>
                  {activeTab === 'payments' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'profile'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <User size={18} className={`transition-colors ${activeTab === 'profile' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Profile</span>
                  {activeTab === 'profile' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === 'support'
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <HelpCircle size={18} className={`transition-colors ${activeTab === 'support' ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>Support</span>
                  {activeTab === 'support' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">

            {/* Switch to Host CTA Card */}
            <div
              onClick={() => router.push('/host-dashboard')}
              className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm group cursor-pointer hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-800">Have a property?</span>
                <ArrowRightLeft size={14} className="text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">Earn money by sharing your home.</p>
              <button className="mt-2 w-full text-xs font-semibold bg-gray-900 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
                Switch to Host
              </button>
            </div>

            {/* User Profile Snippet */}
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
              <div className="relative">
                {userProfile.profilePhoto ? (
                  <img
                    src={userProfile.profilePhoto}
                    alt={userProfile.name}
                    className="w-9 h-9 rounded-full object-cover border border-orange-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
                    {userProfile.initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{userProfile.name}</p>
                <p className="text-xs text-gray-500 truncate">🎯 Guest</p>
              </div>

              <button
                onClick={handleSignOut}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {isLoading && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">Loading dashboard data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* Dashboard Content */}
                {activeTab === 'dashboard' && (
                  <>
                    {/* Welcome Section */}
                    <div className="bg-white rounded-xl shadow-md p-8 mb-8 flex flex-col md:flex-row items-center justify-between">
                      <div className="text-center md:text-left mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          Welcome back, {user?.firstName || 'Guest'}!
                        </h1>
                        <p className="text-gray-600 text-lg">
                          Here's an overview of your Houseiana activity.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={startNewSearch}
                          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-md"
                        >
                          🔍 Start New Search
                        </button>
                        <a
                          href="/host-dashboard"
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <ArrowRightLeft className="w-5 h-5 mr-2" />
                          🏠 Switch to Host
                        </a>
                      </div>
                    </div>

                    {/* Quick Stats - Premium Design */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                      {/* Upcoming Bookings */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{upcomingBookings.length || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Upcoming Bookings</p>
                      </div>

                      {/* Saved Properties */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{savedProperties.length || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Saved Properties</p>
                      </div>

                      {/* Messages */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">5</h3>
                        <p className="text-sm text-gray-500 font-medium">New Messages</p>
                      </div>

                      {/* Loyalty Points */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">450</h3>
                        <p className="text-sm text-gray-500 font-medium">Loyalty Points</p>
                      </div>
                    </div>

                    {/* Upcoming Bookings Section */}
                    <section className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">🏨 Your Upcoming Stays</h2>
                        <button
                          onClick={() => setActiveTab('my-trips')}
                          className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                        >
                          View All Trips →
                        </button>
                      </div>
                      {upcomingBookings.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                          <p className="mb-4">You have no upcoming bookings.</p>
                          <button
                            onClick={startNewSearch}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            🔍 Find a Place to Stay
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {upcomingBookings.map((booking) => {
                            // Calculate nights
                            const checkInDate = new Date(booking.checkIn);
                            const checkOutDate = new Date(booking.checkOut);
                            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

                            // Format dates
                            const formatDate = (date: Date) => {
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            };

                            return (
                              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                {/* Image Area */}
                                <div className="relative h-48 bg-gray-200">
                                  <img
                                    src={booking.property.photos[0] || 'https://via.placeholder.com/400x300?text=Property+Image'}
                                    alt={booking.property.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  {/* Premium Status Badge */}
                                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                                    booking.status === 'confirmed'
                                      ? 'bg-green-500/90 text-white border-green-400'
                                      : 'bg-amber-400/90 text-white border-amber-300'
                                  }`}>
                                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                  </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                        {booking.property.title}
                                      </h3>
                                      <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {booking.property.address}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Date Range with improved formatting */}
                                  <div className="mt-4 py-3 border-t border-b border-gray-50">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span className="block text-xs text-gray-400 uppercase font-semibold">Dates</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {formatDate(checkInDate)} — {formatDate(checkOutDate)}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{nights} night{nights > 1 ? 's' : ''}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons with proper hierarchy */}
                                  <div className="mt-5 flex gap-3">
                                    <button
                                      onClick={() => viewBookingDetails(booking.id)}
                                      className="flex-1 py-2.5 px-4 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                                    >
                                      View Details
                                    </button>
                                    {booking.hostId && (
                                      <button
                                        onClick={() => messageHost(booking.hostId!)}
                                        className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        Message Host
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    {/* Saved Properties Section */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">❤️ Your Saved Properties</h2>
                        <button
                          onClick={() => setActiveTab('wishlist')}
                          className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                        >
                          View All Saved →
                        </button>
                      </div>
                      {savedProperties.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                          <p className="mb-4">You haven't saved any properties yet.</p>
                          <button
                            onClick={startNewSearch}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            🔍 Explore Properties
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {savedProperties.map((property) => (
                            <div key={property.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                              <div className="relative h-48 bg-gray-200 overflow-hidden">
                                <img
                                  src={property.photos[0]?.url || 'https://via.placeholder.com/400x300?text=Property+Image'}
                                  alt={property.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-rose-500 hover:bg-white hover:scale-110 transition-all">
                                  <Heart className="w-4 h-4" fill="currentColor" />
                                </button>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-bold text-gray-900 text-base line-clamp-1 flex-1">{property.title}</h3>
                                  <div className="flex items-center gap-1 text-xs font-bold bg-gray-100 px-2 py-1 rounded ml-2">
                                    <Star className="w-3 h-3 text-orange-500" fill="currentColor" />
                                    {property.ratings.overall.toFixed(1)}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {property.address.city}, {property.address.country}
                                </p>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <div>
                                    <span className="font-bold text-gray-900 text-lg">${property.pricing.basePrice}</span>
                                    <span className="text-xs text-gray-500">/night</span>
                                  </div>
                                  <button
                                    onClick={() => viewPropertyDetails(property.id)}
                                    className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                  >
                                    Check Availability
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Quick Actions Section */}
                    <section className="mb-10 mt-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Actions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={startNewSearch}
                          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all text-left group"
                        >
                          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                            <Search className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Plan Your Next Trip</h4>
                            <p className="text-xs text-gray-500">Discover amazing places</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                        </button>

                        <button
                          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all text-left group"
                        >
                          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Travel Insights</h4>
                            <p className="text-xs text-gray-500">View patterns and stats</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                        </button>

                        <a
                          href="/help"
                          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-purple-200 hover:shadow-md transition-all text-left group"
                        >
                          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Get Help</h4>
                            <p className="text-xs text-gray-500">24/7 customer support</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                        </a>
                      </div>
                    </section>

                    {/* Recent Activity Section */}
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 Recent Activity</h2>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-bold text-sm mb-1">No Recent Activity</h3>
                        <p className="text-xs text-gray-500 mb-4">Start planning your next adventure to see activity here.</p>
                        <button
                          onClick={startNewSearch}
                          className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Browse Properties
                        </button>
                      </div>
                    </section>
                  </>
                )}

                {/* Other Tab Contents */}
                {activeTab === 'my-trips' && (
                  <TripsPage />
                )}

                {activeTab === 'wishlist' && (
                  <WishlistPage />
                )}

                {activeTab === 'explore' && (
                  <ExplorePage />
                )}

                {activeTab === 'payments' && (
                  <PaymentsPage />
                )}

                {activeTab === 'profile' && (
                  <ProfilePage />
                )}

                {activeTab === 'support' && (
                  <SupportPage />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* KYC Modal - Mandatory for new users */}
      <KYCModal
        isOpen={showKYCModal}
        onComplete={() => {
          setShowKYCModal(false);
          // Optionally refresh user data or show success message
          window.location.href = '/client-dashboard';
        }}
      />
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientDashboardContent />
    </Suspense>
  )
}