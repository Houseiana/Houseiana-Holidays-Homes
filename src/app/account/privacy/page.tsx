'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Home, Globe, Menu, ChevronLeft, Share2, Users, MapPin, Eye, BarChart3, Cookie, Link2, Download, Trash2, Loader2 } from 'lucide-react';
import {
  PrivacySettingItem,
  DataActionItem,
  ConnectedServiceItem,
  PrivacyPolicyBox,
  GdprNotice,
  DataRequestModal,
  DeleteAccountModal,
  SavedToast,
  ConnectedService,
} from '@/components/account';
import { AccountAPI } from '@/lib/backend-api';

type PrivacySettings = {
  shareActivityWithPartners: boolean;
  includeInSearchEngines: boolean;
  showProfileToHosts: boolean;
  shareLocationWithHosts: boolean;
  personalizedRecommendations: boolean;
  personalizedAds: boolean;
  usageAnalytics: boolean;
  shareWithThirdParties: boolean;
};

const DEFAULT_SETTINGS: PrivacySettings = {
  shareActivityWithPartners: false,
  includeInSearchEngines: true,
  showProfileToHosts: true,
  shareLocationWithHosts: true,
  personalizedRecommendations: true,
  personalizedAds: false,
  usageAnalytics: true,
  shareWithThirdParties: false,
};

export default function PrivacyPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataRequestModal, setShowDataRequestModal] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings saved');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Privacy settings state
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);

  // Connected services
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([
    { id: 'google', name: 'Google', email: null, connected: false, icon: 'google' },
    { id: 'facebook', name: 'Facebook', email: null, connected: false, icon: 'facebook' },
    { id: 'apple', name: 'Apple', email: null, connected: false, icon: 'apple' },
  ]);

  // Fetch data on mount
  const fetchData = useCallback(async () => {
    if (!isLoaded || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch privacy settings
      const settingsResult = await AccountAPI.getPrivacySettings();
      if (settingsResult.success && settingsResult.data) {
        setSettings(settingsResult.data);
      }

      // Fetch connected services
      const servicesResult = await AccountAPI.getConnectedServices();
      if (servicesResult.success && servicesResult.data) {
        setConnectedServices(servicesResult.data.map(s => ({
          ...s,
          icon: s.icon as 'google' | 'facebook' | 'apple',
        })));
      }
    } catch (err) {
      console.error('Error fetching privacy data:', err);
      setError('Failed to load privacy settings');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleToggle = async (setting: keyof PrivacySettings) => {
    const newValue = !settings[setting];

    // Optimistic update
    setSettings(prev => ({
      ...prev,
      [setting]: newValue,
    }));
    setIsSaving(true);

    try {
      const result = await AccountAPI.updatePrivacySetting(setting, newValue);
      if (result.success) {
        showToast('Settings saved');
      } else {
        // Revert on failure
        setSettings(prev => ({
          ...prev,
          [setting]: !newValue,
        }));
        showToast(result.error || 'Failed to save setting');
      }
    } catch (err) {
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [setting]: !newValue,
      }));
      showToast('Failed to save setting');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    // Optimistic update
    setConnectedServices(prev =>
      prev.map(service =>
        service.id === serviceId ? { ...service, connected: false, email: null } : service
      )
    );

    try {
      const result = await AccountAPI.disconnectService(serviceId);
      if (result.success) {
        showToast(`${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)} disconnected`);
      } else {
        // Revert - refetch
        await fetchData();
        showToast(result.error || 'Failed to disconnect');
      }
    } catch (err) {
      await fetchData();
      showToast('Failed to disconnect');
    }
  };

  const handleConnect = async (serviceId: string) => {
    try {
      const result = await AccountAPI.connectService(serviceId);
      if (result.success && result.data?.redirectTo) {
        // In production, this would redirect to OAuth flow
        // For demo, show message
        showToast(`${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)} connection initiated`);
        // Simulate connection for demo
        setConnectedServices(prev =>
          prev.map(service =>
            service.id === serviceId
              ? { ...service, connected: true, email: `demo@${serviceId}.com` }
              : service
          )
        );
      } else {
        showToast(result.error || 'Failed to connect');
      }
    } catch (err) {
      showToast('Failed to initiate connection');
    }
  };

  const handleDataRequest = async () => {
    setShowDataRequestModal(false);

    try {
      const result = await AccountAPI.requestDataExport();
      if (result.success) {
        showToast(result.message || 'Data request submitted');
      } else {
        showToast(result.error || 'Failed to submit request');
      }
    } catch (err) {
      showToast('Failed to submit data request');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await AccountAPI.deleteAccount('DELETE');
      if (result.success) {
        // Redirect to home after deletion
        router.push('/');
      } else {
        showToast(result.error || 'Failed to delete account');
      }
    } catch (err) {
      showToast('Failed to delete account');
    }
  };

  // Get user display info
  const userDisplay = {
    name: user?.firstName || 'User',
    avatar: user?.firstName?.charAt(0).toUpperCase() || 'U',
    imageUrl: user?.imageUrl,
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

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
                  {userDisplay.imageUrl ? (
                    <img src={userDisplay.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{userDisplay.avatar}</span>
                    </div>
                  )}
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={fetchData} className="ml-2 underline">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : (
          <>
            {/* Sharing Section */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sharing</h2>
              <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
                <PrivacySettingItem
                  icon={Share2}
                  title="Share activity with travel partners"
                  description="Allow us to share your booking activity with airlines and travel partners to help you earn points and rewards."
                  enabled={settings.shareActivityWithPartners}
                  onToggle={() => handleToggle('shareActivityWithPartners')}
                />
                <PrivacySettingItem
                  icon={Globe}
                  title="Include my profile in search engines"
                  description="Allow search engines like Google to link to your profile. Turning this off may take time to be reflected."
                  enabled={settings.includeInSearchEngines}
                  onToggle={() => handleToggle('includeInSearchEngines')}
                />
                <PrivacySettingItem
                  icon={Users}
                  title="Show my profile to hosts before booking"
                  description="Let hosts see your profile photo, name, and reviews when you send an inquiry or request to book."
                  enabled={settings.showProfileToHosts}
                  onToggle={() => handleToggle('showProfileToHosts')}
                />
                <PrivacySettingItem
                  icon={MapPin}
                  title="Share precise location with hosts"
                  description="Share your exact location with hosts after booking confirmation to help with check-in coordination."
                  enabled={settings.shareLocationWithHosts}
                  onToggle={() => handleToggle('shareLocationWithHosts')}
                />
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
                  <ConnectedServiceItem
                    key={service.id}
                    service={service}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
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
                <PrivacySettingItem
                  icon={Eye}
                  title="Personalized recommendations"
                  description="Allow us to use your browsing and booking history to show you personalized homes and recommendations."
                  enabled={settings.personalizedRecommendations}
                  onToggle={() => handleToggle('personalizedRecommendations')}
                />
                <PrivacySettingItem
                  icon={BarChart3}
                  title="Personalized ads"
                  description="Allow us to use your activity to show you more relevant ads on other platforms."
                  enabled={settings.personalizedAds}
                  onToggle={() => handleToggle('personalizedAds')}
                />
                <PrivacySettingItem
                  icon={Cookie}
                  title="Usage data and analytics"
                  description="Help us improve by allowing us to collect anonymous usage data and crash reports."
                  enabled={settings.usageAnalytics}
                  onToggle={() => handleToggle('usageAnalytics')}
                />
                <PrivacySettingItem
                  icon={Link2}
                  title="Share data with third-party partners"
                  description="Allow us to share your data with select partners for marketing and promotional purposes."
                  enabled={settings.shareWithThirdParties}
                  onToggle={() => handleToggle('shareWithThirdParties')}
                />
              </div>
            </section>

            {/* Manage Your Data Section */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage your data</h2>
              <p className="text-gray-500 text-sm mb-6">
                You can request a copy of your data or delete your account at any time.
              </p>
              <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
                <DataActionItem
                  icon={Download}
                  title="Request your personal data"
                  description="Download a copy of your personal data, including your profile info, reservations, messages, and reviews."
                  actionLabel="Request"
                  onAction={() => setShowDataRequestModal(true)}
                />
                <DataActionItem
                  icon={Trash2}
                  iconBgColor="bg-red-100"
                  iconColor="text-red-600"
                  title="Delete your account"
                  description="Permanently delete your account and all associated data. This action cannot be undone."
                  actionLabel="Delete"
                  actionColor="text-red-600 hover:text-red-700"
                  onAction={() => setShowDeleteModal(true)}
                />
              </div>
            </section>

            {/* Privacy Policy Link */}
            <PrivacyPolicyBox />

            {/* GDPR Notice */}
            <GdprNotice />
          </>
        )}
      </main>

      {/* Data Request Modal */}
      <DataRequestModal
        isOpen={showDataRequestModal}
        onClose={() => setShowDataRequestModal(false)}
        onConfirm={handleDataRequest}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* Saved Toast */}
      <SavedToast isVisible={showSavedToast} message={toastMessage} />

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
