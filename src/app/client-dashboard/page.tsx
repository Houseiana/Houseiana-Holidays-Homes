'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  Search, User, Heart, Star, ChevronRight,
  MessageCircle, Settings, Calendar, MapPin, X, Award,
  CreditCard, Shield, Bell, HelpCircle, FileText
} from 'lucide-react';
import HouseianaHeader from '@/components/layout/HouseianaHeader';

// Type definitions
interface Trip {
  id: string;
  propertyTitle: string;
  propertyCity: string;
  propertyCountry: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationCode: string;
  coverPhoto?: string;
  paymentStatus?: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'FAILED';
  amountPaid?: number;
}

interface Wishlist {
  id: string;
  name: string;
  savedCount: number;
  previewImages: string[];
}

interface Message {
  id: string;
  hostName: string;
  hostAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  propertyTitle: string;
  unread: boolean;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState<'trips' | 'wishlists' | 'messages' | 'account'>('trips');
  const [tripFilter, setTripFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  // Check URL params for initial tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['trips', 'wishlists', 'messages', 'account'].includes(tab)) {
        setActiveTab(tab as 'trips' | 'wishlists' | 'messages' | 'account');
      }
    }
  }, []);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(`/api/guest/trips?filter=${tripFilter}`);
        const result = await response.json();
        if (result.success) {
          setTrips(result.data);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    if (isSignedIn && activeTab === 'trips') {
      fetchTrips();
    }
  }, [tripFilter, isSignedIn, activeTab]);

  // Fetch wishlists
  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const response = await fetch('/api/guest/wishlists');
        const result = await response.json();
        if (result.success) {
          setWishlists(result.data);
        }
      } catch (error) {
        console.error('Error fetching wishlists:', error);
      }
    };

    if (isSignedIn && activeTab === 'wishlists') {
      fetchWishlists();
    }
  }, [isSignedIn, activeTab]);

  // Fetch messages/conversations
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/guest/conversations');
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && activeTab === 'messages') {
      fetchMessages();
    }
  }, [isSignedIn, activeTab]);

  // Trips are already filtered by the API based on tripFilter
  const filteredTrips = trips;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Handle pay balance for PARTIALLY_PAID bookings
  const handlePayBalance = async (bookingId: string, paymentProvider: string = 'paypal') => {
    try {
      const response = await fetch('/api/bookings/pay-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paymentProvider,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Store booking ID in localStorage for verification after payment
        localStorage.setItem('pending_payment_booking', bookingId);

        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating balance payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'trips':
        return (
          <div className="max-w-5xl mx-auto">
            {/* Trip Filters */}
            <div className="flex gap-3 mb-8 border-b border-gray-200">
              <button
                onClick={() => setTripFilter('upcoming')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  tripFilter === 'upcoming'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTripFilter('past')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  tripFilter === 'past'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setTripFilter('cancelled')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  tripFilter === 'cancelled'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Cancelled
              </button>
            </div>

            {/* Trip Cards */}
            {filteredTrips.length > 0 ? (
              <div className="space-y-6">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/bookings/${trip.id}`)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
                        <img
                          src={trip.coverPhoto || '/placeholder-property.jpg'}
                          alt={trip.propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Trip Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {trip.propertyCity}, {trip.propertyCountry}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {trip.propertyTitle}
                            </h3>
                          </div>
                          <div className="flex flex-col gap-2">
                            {trip.status === 'confirmed' && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full text-center">
                                Confirmed
                              </span>
                            )}
                            {trip.paymentStatus === 'PARTIALLY_PAID' && (
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full text-center">
                                Balance Due
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Check-in</p>
                            <p className="font-medium text-gray-900">{formatDate(trip.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">You haven&apos;t saved any properties yet.</p>
                            <p className="font-medium text-gray-900">{formatDate(trip.checkOut)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Guests</p>
                            <p className="font-medium text-gray-900">{trip.guests} guest{trip.guests > 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Confirmation code</p>
                            <p className="font-mono text-sm font-medium text-gray-900">{trip.confirmationCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">
                              {calculateNights(trip.checkIn, trip.checkOut)} nights
                            </p>
                            <p className="text-xl font-semibold text-gray-900">${trip.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Pay Balance Button for PARTIALLY_PAID bookings */}
                        {trip.paymentStatus === 'PARTIALLY_PAID' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm font-medium text-amber-600">Balance Due</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Paid: ${(trip.amountPaid || 0).toLocaleString()} / ${trip.totalPrice.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-lg font-semibold text-amber-600">
                                ${(trip.totalPrice - (trip.amountPaid || 0)).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayBalance(trip.id);
                              }}
                              className="w-full px-4 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <CreditCard size={18} />
                              Pay Remaining Balance
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                <Link href="/discover">
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
          <div className="max-w-6xl mx-auto">
            {wishlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlists.map((wishlist) => (
                  <div
                    key={wishlist.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/wishlists/${wishlist.id}`)}
                  >
                    {/* Mosaic Image Grid */}
                    <div className="grid grid-cols-2 gap-1 h-64">
                      {wishlist.previewImages.slice(0, 4).map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative ${idx === 0 ? 'col-span-2 row-span-1' : ''}`}
                        >
                          <img
                            src={img}
                            alt={`${wishlist.name} preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Wishlist Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {wishlist.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {wishlist.savedCount} saved
                      </p>
                    </div>
                  </div>
                ))}

                {/* Create New Wishlist Card */}
                <div
                  className="bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center h-96 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => {/* Create wishlist modal */}}
                >
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Create wishlist</p>
                    <p className="text-sm text-gray-600">Save your favorite homes</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your first wishlist</h3>
                <p className="text-gray-600 mb-6">
                  As you search, click the heart icon to save your favorite places to stay or things to do
                </p>
                <Link href="/discover">
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
          <div className="max-w-4xl mx-auto">
            {messages.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      idx !== messages.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                    onClick={() => router.push(`/messages/${message.id}`)}
                  >
                    {/* Host Avatar */}
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-semibold">
                        {message.hostAvatar}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{message.hostName}</h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                          {message.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{message.propertyTitle}</p>
                      <p className={`text-sm ${message.unread ? 'font-medium text-gray-900' : 'text-gray-600'} truncate`}>
                        {message.lastMessage}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {message.unread && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  When you contact a Host or send a reservation request, you&apos;ll see your messages here
                </p>
                <Link href="/discover">
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
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/personal-info')}
              >
                <User className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal info</h3>
                <p className="text-sm text-gray-600">
                  Provide personal details and how we can reach you
                </p>
              </div>

              {/* Login & Security */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/security')}
              >
                <Shield className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Login & security</h3>
                <p className="text-sm text-gray-600">
                  Update your password and secure your account
                </p>
              </div>

              {/* Payments & Payouts */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/payments')}
              >
                <CreditCard className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments & payouts</h3>
                <p className="text-sm text-gray-600">
                  Review payments, payouts, coupons, and gift cards
                </p>
              </div>

              {/* Notifications */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/notifications')}
              >
                <Bell className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
                <p className="text-sm text-gray-600">
                  Choose notification preferences and how you want to be contacted
                </p>
              </div>

              {/* Privacy & Sharing */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/privacy')}
              >
                <FileText className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & sharing</h3>
                <p className="text-sm text-gray-600">
                  Manage your personal data and connected services
                </p>
              </div>

              {/* Global Preferences */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/account/preferences')}
              >
                <Settings className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Global preferences</h3>
                <p className="text-sm text-gray-600">
                  Set your default language, currency, and timezone
                </p>
              </div>
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

  // Calculate unread messages count
  const unreadMessagesCount = messages.filter(m => m.unread).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HouseianaHeader unreadMessages={unreadMessagesCount} notifications={0} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          {activeTab === 'trips' && 'Your trips'}
          {activeTab === 'wishlists' && 'Wishlists'}
          {activeTab === 'messages' && 'Messages'}
          {activeTab === 'account' && 'Account settings'}
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
