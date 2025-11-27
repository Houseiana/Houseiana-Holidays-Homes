'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Home, Calendar, Building2, MessageSquare, Menu, Bell, ChevronRight, ChevronDown, ChevronLeft,
  Star, DollarSign, TrendingUp, Clock, Check, Users, Search, Filter, MoreHorizontal,
  Phone, MapPin, Bed, Bath, Eye, Edit, Settings, HelpCircle, LogOut, Plus, ArrowUpRight,
  CheckCircle, MessageCircle, CalendarDays, Wallet, BarChart3, X, Send, Paperclip, Globe, User
} from 'lucide-react';

function HostDashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('today');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const userProfile = {
    name: user?.name || `${user?.firstName || 'Host'} ${user?.lastName || ''}`.trim() || 'Host User',
    initials: user?.initials || `${user?.firstName?.charAt(0) || 'H'}${user?.lastName?.charAt(0) || ''}`.trim() || 'HU',
    email: user?.email || 'host@example.com',
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'listings', label: 'Listings', icon: Building2 },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare, badge: 2 },
  ];

  const reservations = {
    current: [
      {
        id: 1,
        guest: 'Mike Rodriguez',
        avatar: 'MR',
        avatarBg: 'bg-teal-500',
        property: 'Beachfront Villa',
        dates: 'Dec 15-20',
        checkIn: 'Dec 15',
        checkOut: 'Dec 20',
        guests: 4,
        amount: 1250,
        status: 'checked_in',
        phone: '+1 555-0123',
        message: 'Great place! Can you recommend restaurants?',
      },
    ],
    upcoming: [
      {
        id: 2,
        guest: 'Anna Johnson',
        avatar: 'AJ',
        avatarBg: 'bg-orange-500',
        property: 'Mountain Cabin',
        dates: 'Dec 22-28',
        checkIn: 'Dec 22',
        checkOut: 'Dec 28',
        guests: 2,
        amount: 2100,
        status: 'confirmed',
        phone: '+1 555-0456',
      },
      {
        id: 3,
        guest: 'David Chen',
        avatar: 'DC',
        avatarBg: 'bg-purple-500',
        property: 'City Loft',
        dates: 'Dec 24-27',
        checkIn: 'Dec 24',
        checkOut: 'Dec 27',
        guests: 1,
        amount: 630,
        status: 'pending',
        phone: '+1 555-0789',
        message: 'Is early check-in possible?',
      },
    ],
  };

  const listings = [
    {
      id: 1,
      name: 'Beachfront Villa',
      location: 'The Pearl, Doha',
      price: 320,
      rating: 4.92,
      reviews: 47,
      status: 'active',
      occupancy: 92,
      revenue: 12400,
      beds: 3,
      baths: 2,
      guests: 6,
    },
    {
      id: 2,
      name: 'Mountain Cabin',
      location: 'Al Khor',
      price: 250,
      rating: 4.85,
      reviews: 31,
      status: 'active',
      occupancy: 81,
      revenue: 8900,
      beds: 2,
      baths: 1,
      guests: 4,
    },
    {
      id: 3,
      name: 'City Loft',
      location: 'West Bay, Doha',
      price: 210,
      rating: 4.78,
      reviews: 23,
      status: 'active',
      occupancy: 74,
      revenue: 6200,
      beds: 1,
      baths: 1,
      guests: 2,
    },
  ];

  const messages = [
    {
      id: 1,
      guest: 'Mike Rodriguez',
      avatar: 'MR',
      avatarBg: 'bg-teal-500',
      property: 'Beachfront Villa',
      lastMessage: 'Great place! Can you recommend restaurants nearby?',
      time: '10 min ago',
      unread: true,
    },
    {
      id: 2,
      guest: 'David Chen',
      avatar: 'DC',
      avatarBg: 'bg-purple-500',
      property: 'City Loft',
      lastMessage: 'Is early check-in possible on the 24th?',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 3,
      guest: 'Anna Johnson',
      avatar: 'AJ',
      avatarBg: 'bg-orange-500',
      property: 'Mountain Cabin',
      lastMessage: 'Looking forward to our stay!',
      time: 'Yesterday',
      unread: false,
    },
  ];

  const earnings = {
    thisMonth: 4200,
    lastMonth: 3850,
    projected: 5100,
    ytd: 45600,
    pendingPayout: 2340,
    nextPayout: 'Dec 20',
  };

  const ReservationCard = ({ reservation, type }: { reservation: any; type: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${reservation.avatarBg} rounded-full flex items-center justify-center text-white font-semibold`}>
            {reservation.avatar}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{reservation.guest}</h4>
            <p className="text-sm text-gray-500">{reservation.property}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">${reservation.amount}</p>
          {reservation.status === 'pending' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          )}
          {reservation.status === 'confirmed' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Confirmed
            </span>
          )}
          {reservation.status === 'checked_in' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              Checked in
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-4 h-4" />
          {reservation.dates}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {reservation.guests} guests
        </span>
      </div>

      {reservation.message && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 line-clamp-2">"{reservation.message}"</p>
        </div>
      )}

      {type === 'current' && (
        <div className="mt-3 flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <MessageCircle className="w-4 h-4 inline mr-1" />
            Message
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Phone className="w-4 h-4 inline mr-1" />
            Call
          </button>
        </div>
      )}

      {reservation.status === 'pending' && (
        <div className="mt-3 flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
            Accept
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Decline
          </button>
        </div>
      )}
    </div>
  );

  const ListingCard = ({ listing }: { listing: any }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="w-full h-full flex items-center justify-center">
          <Building2 className="w-12 h-12 text-gray-400" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {listing.status === 'active' ? 'Listed' : 'Unlisted'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{listing.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.location}
            </p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {listing.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {listing.baths}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {listing.guests}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-lg font-semibold text-gray-900">${listing.price}<span className="text-sm font-normal text-gray-500">/night</span></p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gray-900 fill-current" />
            <span className="font-medium">{listing.rating}</span>
            <span className="text-gray-500">({listing.reviews})</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Occupancy</span>
            <span className="font-medium text-gray-900">{listing.occupancy}%</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${listing.occupancy}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent hidden sm:block">houseiana</span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-3 border border-gray-200 rounded-full hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userProfile.initials}
                  </div>
                </button>

                {/* Menu dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold">{userProfile.name}</p>
                      <p className="text-sm text-gray-500">Superhost</p>
                    </div>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <Wallet className="w-5 h-5 text-gray-500" />
                      <span>Earnings</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <span>Insights</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span>Account settings</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <HelpCircle className="w-5 h-5 text-gray-500" />
                      <span>Help</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link href="/client-dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span>Switch to traveling</span>
                      </Link>
                      <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-500 w-full text-left">
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden border-t border-gray-100 px-4 overflow-x-auto">
          <div className="flex gap-4 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {userProfile.name}!</h1>
                <p className="text-gray-500 mt-1">Here's what's happening with your properties</p>
              </div>
              <Link href="/host-dashboard/add-listing" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-pink-700 transition-colors">
                <Plus className="w-5 h-5" />
                Create listing
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">This month</span>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">${earnings.thisMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+9.1% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Occupancy</span>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">78%</p>
                <p className="text-sm text-gray-500 mt-1">Top 10% in your area</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Active bookings</span>
                  <CalendarDays className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">23</p>
                <p className="text-sm text-gray-500 mt-1">8 checking in this week</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Rating</span>
                  <Star className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">4.8</p>
                <p className="text-sm text-gray-500 mt-1">Based on 124 reviews</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Reservations Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Currently Hosting */}
                {reservations.current.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Currently hosting</h2>
                      <span className="text-sm text-gray-500">{reservations.current.length} guest</span>
                    </div>
                    <div className="space-y-3">
                      {reservations.current.map((res) => (
                        <ReservationCard key={res.id} reservation={res} type="current" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming reservations</h2>
                    <a href="#" className="text-sm font-medium text-gray-900 hover:underline">View all</a>
                  </div>
                  <div className="space-y-3">
                    {reservations.upcoming.map((res) => (
                      <ReservationCard key={res.id} reservation={res} type="upcoming" />
                    ))}
                  </div>
                </div>

                {/* Things to do */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Things to do</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Pending booking request</p>
                          <p className="text-sm text-gray-500">David Chen · City Loft</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                        Review
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Write a review</p>
                          <p className="text-sm text-gray-500">Sarah Williams stayed Dec 8-12</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                        Review
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">2 unread messages</p>
                          <p className="text-sm text-gray-500">Reply to keep response rate high</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Earnings & Performance */}
              <div className="space-y-6">
                {/* Earnings Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Earnings</h3>
                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">View details</a>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">December 2024</p>
                      <p className="text-3xl font-semibold text-gray-900">${earnings.thisMonth.toLocaleString()}</p>
                    </div>

                    {/* Mini chart placeholder */}
                    <div className="h-20 flex items-end gap-1">
                      {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 70, 80].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${i === 11 ? 'bg-teal-500' : 'bg-gray-200'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 text-center">Last 12 months</p>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Pending payout</span>
                        <span className="font-medium text-gray-900">${earnings.pendingPayout.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Next payout</span>
                        <span className="font-medium text-gray-900">{earnings.nextPayout}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Year to date</span>
                        <span className="font-medium text-gray-900">${earnings.ytd.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Performance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Property performance</h3>
                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
                  </div>

                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{listing.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">${listing.revenue.toLocaleString()}</span>
                            <span className="text-gray-300">·</span>
                            <span className={listing.occupancy >= 80 ? 'text-green-600' : listing.occupancy >= 60 ? 'text-yellow-600' : 'text-gray-500'}>
                              {listing.occupancy}% occ
                            </span>
                          </div>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                listing.occupancy >= 80 ? 'bg-green-500' : listing.occupancy >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${listing.occupancy}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-700">Hosting tips</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-700">Community center</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-700">Get help</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All listings</option>
                  {listings.map((l) => (
                    <option key={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">December 2024</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {[...Array(31)].map((_, i) => {
                  const day = i + 1;
                  const isBooked = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28].includes(day);
                  const isToday = day === 17;

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-1 rounded-lg cursor-pointer transition-colors ${
                        isToday ? 'ring-2 ring-gray-900' : ''
                      } ${isBooked ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`text-sm ${isToday ? 'font-bold' : ''} ${isBooked ? 'text-teal-700' : 'text-gray-700'}`}>
                        {day}
                      </div>
                      {isBooked && (
                        <div className="w-full h-1 bg-teal-500 rounded mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded" />
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
                  <span className="text-sm text-gray-600">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
                  <span className="text-sm text-gray-600">Available</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{listings.length} listings</h1>
                <p className="text-gray-500 mt-1">Manage your properties</p>
              </div>
              <Link href="/host-dashboard/add-listing" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-pink-700 transition-colors">
                <Plus className="w-5 h-5" />
                Create listing
              </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
                Status
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
                Property type
              </button>
            </div>

            {/* Listings Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="h-[calc(100vh-12rem)]">
            <div className="flex h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Messages List */}
              <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Messages</h2>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-full">All</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Unread</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Starred</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        msg.unread ? 'bg-teal-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 ${msg.avatarBg} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${msg.unread ? 'text-gray-900' : 'text-gray-700'}`}>{msg.guest}</h4>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-sm text-gray-500">{msg.property}</p>
                          <p className={`text-sm mt-1 truncate ${msg.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {msg.lastMessage}
                          </p>
                        </div>
                        {msg.unread && (
                          <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="hidden md:flex flex-1 flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                      MR
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Mike Rodriguez</h4>
                      <p className="text-sm text-gray-500">Beachfront Villa · Dec 15-20</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-md bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-gray-900">Great place! Can you recommend restaurants nearby?</p>
                      <span className="text-xs text-gray-500 mt-1">10:30 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-md bg-teal-500 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                      <p>Hi Mike! So glad you're enjoying your stay. For restaurants, I highly recommend Morimoto for Japanese, La Mar for seafood, or Nobu if you're feeling fancy. All within 10 min walk!</p>
                      <span className="text-xs text-teal-100 mt-1">10:45 AM</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <button className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 ${
                activeTab === tab.id ? 'text-teal-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <tab.icon className="w-6 h-6" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex flex-col items-center py-2 px-3 text-gray-500"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <HostDashboardContent />
    </Suspense>
  );
}
