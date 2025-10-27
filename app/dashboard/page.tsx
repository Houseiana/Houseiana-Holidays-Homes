'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Switch } from '@headlessui/react';
import { User, Home, Settings, LogOut } from 'lucide-react';

// Import the dashboard content components
import HostDashboardContent from '@/components/dashboard/host-dashboard-content';
import ClientDashboardContent from '@/components/dashboard/client-dashboard-content';

export default function UnifiedDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState<'host' | 'guest'>('guest');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial view based on user's current role
  useEffect(() => {
    if ((session?.user as any)?.role) {
      setActiveView((session?.user as any).role as 'host' | 'guest');
    }
  }, [session]);

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/?auth=signin');
    }
  }, [session, status, router]);

  const handleRoleSwitch = async (newRole: 'host' | 'guest') => {
    if (newRole === activeView || isLoading) return;

    setIsLoading(true);
    try {
      // Update user role in the backend
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        // Update the session with new role
        await update({ role: newRole });
        setActiveView(newRole);
      } else {
        console.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      await signOut({ callbackUrl: '/' });
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header with Role Switcher */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Houseiana</h1>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Switch between modes:
                </span>

                {/* Role Toggle Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleRoleSwitch('guest')}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'guest'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Guest Mode
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('host')}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'host'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Home className="w-4 h-4 inline mr-2" />
                    Host Mode
                  </button>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900"
                  title="Back to Homepage"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="text-gray-700">Switching mode...</span>
          </div>
        </div>
      )}

      {/* Dynamic Dashboard Content */}
      <main className="flex-1 bg-gray-50">
        {activeView === 'host' ? (
          <HostDashboardContent />
        ) : (
          <ClientDashboardContent />
        )}
      </main>
    </div>
  );
}