'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  Search, User, Heart, ChevronRight,
  MessageCircle, Settings, Calendar,
  CreditCard, Shield, Bell, HelpCircle, FileText, Award
} from 'lucide-react';
import { useClientDashboard, DashboardTab, TripFilter } from '@/hooks';
import { TripCard, MessageItem, AccountCard } from '@/features/client-dashboard';
import PropertyCard from '@/features/home/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/ui/loaders/skeleton';

export default function ClientDashboard() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Hook provides all data and business logic
  const {
    activeTab,
    setActiveTab,
    trips,
    tripFilter,
    setTripFilter,
    wishlists,
    messages,
    unreadMessagesCount,
    formatDate,
    calculateNights,
    handlePayBalance,
    fetchWishlists,
    loadingWishlists,
  } = useClientDashboard(isSignedIn || false);

  // Page titles
  const pageTitles: Record<DashboardTab, string> = {
    trips: 'Your trips',
    wishlists: 'Wishlists',
    messages: 'Messages',
    account: 'Account settings',
  };

  // Trip filter tabs
  const tripFilterTabs: { key: TripFilter; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  // Account settings cards
  const accountCards = [
    { icon: <User className="w-8 h-8" />, title: 'Personal info', description: 'Provide personal details and how we can reach you', path: '/account/personal-info' },
    { icon: <Shield className="w-8 h-8" />, title: 'Login & security', description: 'Update your password and secure your account', path: '/account/security' },
    { icon: <Shield className="w-8 h-8 text-teal-600" />, title: 'KYC Verification', description: 'Verify your identity to unlock all platform features', path: '/account/kyc' },
    { icon: <CreditCard className="w-8 h-8" />, title: 'Payments & payouts', description: 'Review payments, payouts, coupons, and gift cards', path: '/account/payments' },
    { icon: <Bell className="w-8 h-8" />, title: 'Notifications', description: 'Choose notification preferences and how you want to be contacted', path: '/account/notifications' },
    { icon: <FileText className="w-8 h-8" />, title: 'Privacy & sharing', description: 'Manage your personal data and connected services', path: '/account/privacy' },
    { icon: <Settings className="w-8 h-8" />, title: 'Global preferences', description: 'Set your default language, currency, and timezone', path: '/account/preferences' },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'trips':
        return (
          <div className="max-w-6xl mx-auto">
            {/* Trip Filters */}
            <div className="flex gap-3 mb-8 border-b border-gray-200">
              {tripFilterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTripFilter(tab.key)}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    tripFilter === tab.key
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Trip Cards */}
            {trips.length > 0 ? (
              <div className="space-y-6">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    formatDate={formatDate}
                    calculateNights={calculateNights}
                    onPayBalance={handlePayBalance}
                    onClick={() => router.push(`/bookings/${trip.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">
                  {tripFilter === 'upcoming' && "Time to dust off your bags and start planning your next adventure"}
                  {tripFilter === 'past' && "You haven't completed any trips yet"}
                  {tripFilter === 'cancelled' && "No cancelled trips"}
                </p>
                <Link href="/properties">
                  <button className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
                    Start searching
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 'wishlists':
        return (
          <div className="max-w-7xl mx-auto">
            {loadingWishlists ? (
              <PropertyGridSkeleton count={3} />
            ) : wishlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlists?.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onToggle={fetchWishlists}
                  />
                ))}

                {/* Create New Wishlist Card */}
                <Link
                  href="/"
                  className="bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center h-96 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Create wishlist</p>
                    <p className="text-sm text-gray-600">Save your favorite homes</p>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your first wishlist</h3>
                <p className="text-gray-600 mb-6">
                  As you search, click the heart icon to save your favorite places to stay or things to do
                </p>
                <Link href="/properties">
                  <button className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
                    Start exploring
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 'messages':
        return (
          <div className="max-w-6xl mx-auto">
            {messages.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {messages.map((message, idx) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isLast={idx === messages.length - 1}
                    onClick={() => router.push(`/messages/${message.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  When you contact a Host or send a reservation request, you&apos;ll see your messages here
                </p>
                <Link href="/properties">
                  <button className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
                    Explore properties
                  </button>
                </Link>
              </div>
            )}
          </div>
        );

      case 'account':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accountCards.map((card) => (
                <AccountCard
                  key={card.path}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  onClick={() => router.push(card.path)}
                />
              ))}
            </div>

            {/* Support Section */}
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need help?</h3>
              <div className="space-y-3">
                <Link href="/support">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Visit Help Center</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </Link>
                <SignOutButton>
                  <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors text-gray-900">
                    Log out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          {pageTitles[activeTab]}
        </h1>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Become a Host Banner */}
        {activeTab !== 'account' && (
          <div className="mt-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-12 text-center">
            <Award className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Become a Houseiana Host
            </h2>
            <p className="text-teal-50 text-lg mb-6 max-w-2xl mx-auto">
              Earn extra income and unlock new opportunities by sharing your space with our global community
            </p>
            <Link href="/become-host">
              <button className="px-8 py-4 bg-white text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
                Learn more
              </button>
            </Link>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden pb-safe z-50">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'trips' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Trips</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlists')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'wishlists' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">Wishlists</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 relative ${
              activeTab === 'messages' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            {messages.some(m => m.unread) && (
              <span className="absolute top-0 right-6 w-2 h-2 bg-red-500 rounded-full" />
            )}
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'account' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            {isSignedIn && user ? (
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            ) : (
              <User className="w-6 h-6" />
            )}
            <span className="text-xs">Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
