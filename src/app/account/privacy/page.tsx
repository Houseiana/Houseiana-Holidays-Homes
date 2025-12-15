'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu, ChevronLeft, ChevronRight, Shield, Eye, EyeOff, Link2, Download, Trash2, Cookie, Users, MapPin, BarChart3, Share2, ExternalLink, AlertCircle, Check, X } from 'lucide-react';

export default function PrivacyPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataRequestModal, setShowDataRequestModal] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const user = {
    name: 'Mohamed',
    avatar: 'M',
    email: 'mohamed@gmail.com',
  };

  // Privacy settings state
  const [settings, setSettings] = useState({
    // Sharing & Activity
    shareActivityWithPartners: false,
    includeInSearchEngines: true,
    showProfileToHosts: true,
    shareLocationWithHosts: true,

    // Personalization
    personalizedRecommendations: true,
    personalizedAds: false,
    usageAnalytics: true,

    // Third-party
    shareWithThirdParties: false,
  });

  // Connected services
  const [connectedServices, setConnectedServices] = useState([
    { id: 'google', name: 'Google', email: 'mohamed@gmail.com', connected: true, icon: 'google' },
    { id: 'facebook', name: 'Facebook', email: null, connected: false, icon: 'facebook' },
    { id: 'apple', name: 'Apple', email: null, connected: false, icon: 'apple' },
  ]);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleDisconnect = (serviceId: string) => {
    setConnectedServices(prev =>
      prev.map(service =>
        service.id === serviceId ? { ...service, connected: false, email: null } : service
      )
    );
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

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );

  const getServiceIcon = (icon: string) => {
    switch (icon) {
      case 'google': return <GoogleIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'apple': return <AppleIcon />;
      default: return null;
    }
  };

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
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Privacy & sharing</h1>
        <p className="text-gray-500 mb-8">Manage your personal data, connected services, and data sharing preferences.</p>
        <p className="text-gray-600 mb-6">To manage your cookie preferences, please go to your browser&apos;s settings and clear cookies for &quot;houseiana.com&quot;.</p>

        {/* Sharing Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sharing</h2>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {/* Activity sharing */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Share activity with travel partners</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Allow us to share your booking activity with airlines and travel partners to help you earn points and rewards.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.shareActivityWithPartners}
                  onChange={() => handleToggle('shareActivityWithPartners')}
                />
              </div>
            </div>

            {/* Search engines */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Include my profile in search engines</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Allow search engines like Google to link to your profile. Turning this off may take time to be reflected.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.includeInSearchEngines}
                  onChange={() => handleToggle('includeInSearchEngines')}
                />
              </div>
            </div>

            {/* Profile visibility */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Show my profile to hosts before booking</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Let hosts see your profile photo, name, and reviews when you send an inquiry or request to book.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.showProfileToHosts}
                  onChange={() => handleToggle('showProfileToHosts')}
                />
              </div>
            </div>

            {/* Location sharing */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Share precise location with hosts</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Share your exact location with hosts after booking confirmation to help with check-in coordination.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.shareLocationWithHosts}
                  onChange={() => handleToggle('shareLocationWithHosts')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connected services</h2>
          <p className="text-gray-500 text-sm mb-6">
            Manage third-party services linked to your Houseiana account.
          </p>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {connectedServices.map((service) => (
              <div key={service.id} className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getServiceIcon(service.icon)}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">{service.name}</h3>
                      {service.connected ? (
                        <p className="text-gray-500 text-sm">{service.email}</p>
                      ) : (
                        <p className="text-gray-400 text-sm">Not connected</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => service.connected && handleDisconnect(service.id)}
                    className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                  >
                    {service.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personalization Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Personalization</h2>
          <p className="text-gray-500 text-sm mb-6">
            Control how we use your data to personalize your experience.
          </p>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {/* Recommendations */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Personalized recommendations</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Allow us to use your browsing and booking history to show you personalized homes and experiences.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.personalizedRecommendations}
                  onChange={() => handleToggle('personalizedRecommendations')}
                />
              </div>
            </div>

            {/* Personalized ads */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Personalized ads</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Allow us to use your activity to show you more relevant ads on other platforms.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.personalizedAds}
                  onChange={() => handleToggle('personalizedAds')}
                />
              </div>
            </div>

            {/* Usage analytics */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Usage data and analytics</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Help us improve by allowing us to collect anonymous usage data and crash reports.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.usageAnalytics}
                  onChange={() => handleToggle('usageAnalytics')}
                />
              </div>
            </div>

            {/* Third-party sharing */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Share data with third-party partners</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Allow us to share your data with select partners for marketing and promotional purposes.
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={settings.shareWithThirdParties}
                  onChange={() => handleToggle('shareWithThirdParties')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Manage Your Data Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage your data</h2>
          <p className="text-gray-500 text-sm mb-6">
            You can request a copy of your data or delete your account at any time.
          </p>

          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {/* Request data */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Request your personal data</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Download a copy of your personal data, including your profile info, reservations, messages, and reviews.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDataRequestModal(true)}
                  className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                >
                  Request
                </button>
              </div>
            </div>

            {/* Delete account */}
            <div className="py-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Delete your account</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-sm font-semibold text-red-600 underline hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy Link */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your privacy matters</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Learn more about how we collect, use, and protect your personal information. You have rights over your data under applicable privacy laws.
              </p>
              <div className="flex gap-4">
                <a href="/privacy-policy" className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1">
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href="/cookie-policy" className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1">
                  Cookie Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="mt-6 p-4 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Your rights:</span> Under GDPR, CCPA, and other applicable laws, you have the right to access, correct, delete, or port your data. You can also object to certain processing activities.{' '}
                <a href="/help/privacy-rights" className="text-gray-900 underline">Learn more about your rights</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Data Request Modal */}
      {showDataRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDataRequestModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6">
              <button
                onClick={() => setShowDataRequestModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Request your data</h2>
              <p className="text-gray-600 mb-4">
                We&apos;ll prepare a copy of your personal data and send you an email when it&apos;s ready to download. This usually takes up to 30 days.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Your data package will include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Profile information</li>
                  <li>• Booking history</li>
                  <li>• Messages and reviews</li>
                  <li>• Payment history</li>
                  <li>• Account activity</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDataRequestModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDataRequestModal(false);
                    setShowSavedToast(true);
                    setTimeout(() => setShowSavedToast(false), 3000);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600"
                >
                  Request data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete your account?</h2>
              <p className="text-gray-600 mb-4">
                This will permanently delete your account and all associated data including your profile, bookings, messages, and reviews. This action cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-red-800 mb-2">Before you delete:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Cancel any upcoming reservations</li>
                  <li>• Withdraw any pending payouts</li>
                  <li>• Download a copy of your data</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type &quot;DELETE&quot; to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirmText !== 'DELETE'}
                  className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-lg ${
                    deleteConfirmText === 'DELETE'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
