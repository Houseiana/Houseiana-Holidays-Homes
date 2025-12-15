'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu, ChevronLeft, ChevronRight, Bell, Mail, Smartphone, MessageSquare, Tag, Shield, Users, Calendar, Heart, Star, CreditCard, AlertCircle, Check } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'guest' | 'host' | 'account'>('guest');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const user = {
    name: 'Mohamed',
    avatar: 'M',
    email: 'mohamed@gmail.com',
  };

  // Notification settings state
  const [notifications, setNotifications] = useState({
    // Guest notifications
    guestMessages: { email: true, push: true, sms: true },
    guestReminders: { email: true, push: true, sms: false },
    guestReviews: { email: true, push: true, sms: false },
    guestPromotions: { email: true, push: false, sms: false },
    guestTravelTips: { email: true, push: false, sms: false },

    // Host notifications
    hostMessages: { email: true, push: true, sms: true },
    hostReservations: { email: true, push: true, sms: true },
    hostReminders: { email: true, push: true, sms: false },
    hostReviews: { email: true, push: true, sms: false },
    hostListingTips: { email: true, push: false, sms: false },
    hostPromotions: { email: false, push: false, sms: false },

    // Account notifications
    accountSecurity: { email: true, push: true, sms: true },
    accountPayments: { email: true, push: true, sms: false },
    accountPolicy: { email: true, push: false, sms: false },
    accountNewFeatures: { email: true, push: false, sms: false },
  });

  const handleToggle = (category: string, channel: string) => {
    setNotifications(prev => {
      const catKey = category as keyof typeof prev;
      const categorySettings = prev[catKey];
      const chanKey = channel as keyof typeof categorySettings;

      return {
        ...prev,
        [catKey]: {
          ...categorySettings,
          [chanKey]: !categorySettings[chanKey],
        },
      };
    });

    // Show saved toast
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-teal-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  const NotificationRow = ({ icon: Icon, title, description, category, channels = ['email', 'push', 'sms'] }: {
    icon: any;
    title: string;
    description: string;
    category: string;
    channels?: string[];
  }) => (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 font-medium">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>

          <div className="flex items-center gap-8 mt-4">
            {channels.includes('email') && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-12">Email</span>
                <Toggle
                  enabled={notifications[category as keyof typeof notifications]?.email || false}
                  onChange={() => handleToggle(category, 'email')}
                />
              </div>
            )}
            {channels.includes('push') && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-12">Push</span>
                <Toggle
                  enabled={notifications[category as keyof typeof notifications]?.push || false}
                  onChange={() => handleToggle(category, 'push')}
                />
              </div>
            )}
            {channels.includes('sms') && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-12">SMS</span>
                <Toggle
                  enabled={notifications[category as keyof typeof notifications]?.sms || false}
                  onChange={() => handleToggle(category, 'sms')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/host-dashboard/add-listing">
                <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                  List your home
                </button>
              </Link>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow">
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.avatar}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/client-dashboard?tab=account" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-500 mb-8">Choose how and when you want to be notified.</p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('guest')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'guest'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Guest notifications
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'host'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Host notifications
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Account
            </button>
          </div>
        </div>

        {/* Guest Notifications Tab */}
        {activeTab === 'guest' && (
          <div>
            {/* Messages Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Messages</h2>
              <p className="text-gray-500 text-sm mb-4">Receive messages from hosts and Houseiana.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={MessageSquare}
                  title="Host messages"
                  description="Messages from hosts about your reservations and inquiries."
                  category="guestMessages"
                />
              </div>
            </section>

            {/* Reminders Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Reminders and suggestions</h2>
              <p className="text-gray-500 text-sm mb-4">Booking reminders, tips for your trip, and other helpful info.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Calendar}
                  title="Reservation reminders"
                  description="Reminders about upcoming check-ins, check-outs, and trip details."
                  category="guestReminders"
                />
                <NotificationRow
                  icon={Star}
                  title="Reviews"
                  description="Reminders to write reviews after your stay."
                  category="guestReviews"
                />
              </div>
            </section>

            {/* Promotions Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Promotions and tips</h2>
              <p className="text-gray-500 text-sm mb-4">Coupons, promotions, surveys, and inspiration.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Tag}
                  title="Deals and promotions"
                  description="Exclusive discounts, coupons, and special offers."
                  category="guestPromotions"
                />
                <NotificationRow
                  icon={Heart}
                  title="Travel inspiration"
                  description="Destination ideas, travel tips, and personalized recommendations."
                  category="guestTravelTips"
                />
              </div>
            </section>
          </div>
        )}

        {/* Host Notifications Tab */}
        {activeTab === 'host' && (
          <div>
            {/* Messages Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Messages</h2>
              <p className="text-gray-500 text-sm mb-4">Receive messages from guests and Houseiana.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={MessageSquare}
                  title="Guest messages"
                  description="Messages from guests about reservations, inquiries, and requests."
                  category="hostMessages"
                />
              </div>
            </section>

            {/* Reservations Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Reservations</h2>
              <p className="text-gray-500 text-sm mb-4">Updates about booking requests and confirmed reservations.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Calendar}
                  title="Booking requests and confirmations"
                  description="New booking requests, instant bookings, and reservation changes."
                  category="hostReservations"
                />
                <NotificationRow
                  icon={Bell}
                  title="Reservation reminders"
                  description="Reminders about upcoming guest arrivals and departures."
                  category="hostReminders"
                />
              </div>
            </section>

            {/* Reviews Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h2>
              <p className="text-gray-500 text-sm mb-4">Notifications about guest reviews and feedback.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Star}
                  title="Guest reviews"
                  description="New reviews from guests and reminders to respond."
                  category="hostReviews"
                />
              </div>
            </section>

            {/* Hosting Tips Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Hosting tips and updates</h2>
                <p className="text-gray-600 mb-6">To update your notification settings, please go to your device&apos;s settings and enable notifications for the &quot;Houseiana&quot; app.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Users}
                  title="Listing suggestions"
                  description="Tips to optimize your listing, pricing recommendations, and performance insights."
                  category="hostListingTips"
                />
                <NotificationRow
                  icon={Tag}
                  title="Host promotions"
                  description="Special offers, tools, and resources for hosts."
                  category="hostPromotions"
                />
              </div>
            </section>
          </div>
        )}

        {/* Account Notifications Tab */}
        {activeTab === 'account' && (
          <div>
            {/* Security Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Account activity</h2>
              <p className="text-gray-500 text-sm mb-4">Important updates about your account security.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Shield}
                  title="Security alerts"
                  description="Login notifications, password changes, and suspicious activity."
                  category="accountSecurity"
                />
                <NotificationRow
                  icon={CreditCard}
                  title="Payments and payouts"
                  description="Payment confirmations, payout updates, and billing reminders."
                  category="accountPayments"
                />
              </div>
            </section>

            {/* Policy Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Policy and community</h2>
              <p className="text-gray-500 text-sm mb-4">Updates on policies, terms, and community guidelines.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={AlertCircle}
                  title="Policy updates"
                  description="Changes to terms of service, privacy policy, and community standards."
                  category="accountPolicy"
                  channels={['email', 'push']}
                />
              </div>
            </section>

            {/* Product Updates Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Product updates</h2>
              <p className="text-gray-500 text-sm mb-4">News about new features and improvements.</p>

              <div className="border-t border-gray-200">
                <NotificationRow
                  icon={Bell}
                  title="New features"
                  description="Announcements about new tools, features, and product improvements."
                  category="accountNewFeatures"
                  channels={['email', 'push']}
                />
              </div>
            </section>
          </div>
        )}

        {/* Info Box */}
        <div className="p-6 bg-gray-50 rounded-xl mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Get the Houseiana app</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Download the app to receive push notifications on your phone. Never miss a message from a host or guest.
              </p>
              <div className="flex gap-3">
                <button className="text-sm font-semibold text-gray-900 underline hover:text-gray-600">
                  App Store
                </button>
                <button className="text-sm font-semibold text-gray-900 underline hover:text-gray-600">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unsubscribe Info */}
        <div className="mt-8 p-4 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                You can also unsubscribe from promotional emails by clicking &quot;Unsubscribe&quot; at the bottom of any email.
                Some notifications about your account, reservations, and legal updates cannot be turned off.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Settings saved</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                <Globe className="w-4 h-4" />
                English (US)
              </button>
              <span className="text-sm font-medium">$ USD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
