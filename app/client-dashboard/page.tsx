'use client'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import KYCModal from '@/components/KYCModal'
import {
  LayoutDashboard, Clock, Heart, Search, MessageCircle, CreditCard, User,
  HelpCircle, ArrowRightLeft, Star, Calendar, MapPin, LogOut
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
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Houseiana</h1>
            </a>
          </div>

          {/* Navigation Menu */}
          <div className="px-6 pb-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center px-4 py-3 w-full text-left rounded-lg font-medium transition-colors ${
                      activeTab === item.id
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {userProfile.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{userProfile.initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.name}
                </p>
                <p className="text-xs text-orange-600 truncate">
                  🎯 Guest
                </p>
              </div>
            </div>

            {/* Dashboard Switch & Sign Out */}
            <div className="space-y-2">
              <button
                onClick={() => router.push('/host-dashboard')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Switch to Host</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
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
                            <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                              <div className="relative h-48">
                                <img
                                  src={property.photos[0]?.url || 'https://via.placeholder.com/400x300?text=Property+Image'}
                                  alt="Property Image"
                                  className="w-full h-full object-cover"
                                />
                                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                                  <Heart className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{property.address.city}, {property.address.country}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                  <span>${property.pricing.basePrice}/night</span>
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                                    <span>{property.ratings.overall.toFixed(1)} ({property.ratings.totalReviews})</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => viewPropertyDetails(property.id)}
                                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Quick Actions Section */}
                    <section className="mb-8 mt-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Actions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">✈️ Plan Your Next Trip</h3>
                              <p className="text-gray-600 text-sm mb-4">Discover amazing places around the world</p>
                              <button
                                onClick={startNewSearch}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                              >
                                🔍 Explore Now
                              </button>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Search className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Travel Insights</h3>
                              <p className="text-gray-600 text-sm mb-4">View your travel patterns and stats</p>
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                📈 View Insights
                              </button>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">🆘 Get Help</h3>
                              <p className="text-gray-600 text-sm mb-4">24/7 customer support available</p>
                              <a
                                href="/contact-support"
                                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                💬 Contact Support
                              </a>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <HelpCircle className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Recent Activity Section */}
                    <section className="mb-8">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                          <h2 className="text-xl font-bold text-gray-900">🕒 Recent Activity</h2>
                        </div>
                        <div className="p-6">
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-3xl">✈️</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                            <p className="text-gray-600 mb-4">Start planning your next adventure to see activity here</p>
                            <button
                              onClick={startNewSearch}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              🔍 Browse Properties
                            </button>
                          </div>
                        </div>
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