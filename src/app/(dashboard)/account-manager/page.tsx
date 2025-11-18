/**
 * Account Manager Dashboard
 * Unified dashboard for property owners and guests with role-switching capability
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Settings,
  Users,
  Plane,
  Building,
  BarChart3,
  Bell,
  ChevronDown
} from 'lucide-react';

type UserRole = 'host' | 'guest';

interface DashboardStats {
  host: {
    properties: number;
    pendingBookings: number;
    monthlyEarnings: number;
    occupancyRate: number;
    unreadMessages: number;
  };
  guest: {
    upcomingTrips: number;
    activeBookings: number;
    savedProperties: number;
    unreadMessages: number;
  };
}

export default function AccountManagerPage() {
  const { user, isLoaded } = useUser();
  const [currentRole, setCurrentRole] = useState<UserRole>('host');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadDashboardStats();
    }
  }, [isLoaded, user, currentRole]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Fetch actual stats from API
      const mockStats: DashboardStats = {
        host: {
          properties: 5,
          pendingBookings: 3,
          monthlyEarnings: 12500,
          occupancyRate: 78,
          unreadMessages: 7
        },
        guest: {
          upcomingTrips: 2,
          activeBookings: 1,
          savedProperties: 12,
          unreadMessages: 3
        }
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = () => {
    setCurrentRole(prev => prev === 'host' ? 'guest' : 'host');
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isHostMode = currentRole === 'host';
  const currentStats = stats?.[currentRole];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Account Manager
              </h1>

              {/* Role Toggle Button */}
              <button
                onClick={toggleRole}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isHostMode ? (
                  <>
                    <Building className="w-4 h-4" />
                    <span>Property Owner Mode</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4" />
                    <span>Guest Mode</span>
                  </>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {currentStats && (currentStats as any).unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {(currentStats as any).unreadMessages}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isHostMode ? (
            <>
              <StatCard
                icon={<Home className="w-6 h-6 text-blue-600" />}
                title="Properties"
                value={stats?.host.properties || 0}
                change="+2 this month"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6 text-yellow-600" />}
                title="Pending Bookings"
                value={stats?.host.pendingBookings || 0}
                change="Needs attention"
                alert
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                title="Monthly Earnings"
                value={`$${stats?.host.monthlyEarnings.toLocaleString() || 0}`}
                change="+12% vs last month"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                title="Occupancy Rate"
                value={`${stats?.host.occupancyRate || 0}%`}
                change="+5% vs last month"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={<Plane className="w-6 h-6 text-blue-600" />}
                title="Upcoming Trips"
                value={stats?.guest.upcomingTrips || 0}
                change="Next: Dec 15"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6 text-yellow-600" />}
                title="Active Bookings"
                value={stats?.guest.activeBookings || 0}
                change="1 in progress"
              />
              <StatCard
                icon={<Home className="w-6 h-6 text-purple-600" />}
                title="Saved Properties"
                value={stats?.guest.savedProperties || 0}
                change="3 new matches"
              />
              <StatCard
                icon={<MessageSquare className="w-6 h-6 text-green-600" />}
                title="Messages"
                value={stats?.guest.unreadMessages || 0}
                change="Unread"
                alert={stats?.guest.unreadMessages ? stats.guest.unreadMessages > 0 : false}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isHostMode ? (
              <>
                <QuickActionButton
                  icon={<Home className="w-5 h-5" />}
                  label="Add Property"
                  onClick={() => window.location.href = '/host-dashboard/add-listing'}
                />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  label="Manage Calendar"
                  onClick={() => {}}
                />
                <QuickActionButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Messages"
                  badge={stats?.host.unreadMessages}
                  onClick={() => {}}
                />
                <QuickActionButton
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Analytics"
                  onClick={() => {}}
                />
              </>
            ) : (
              <>
                <QuickActionButton
                  icon={<Home className="w-5 h-5" />}
                  label="Search Properties"
                  onClick={() => window.location.href = '/explore'}
                />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  label="My Trips"
                  onClick={() => window.location.href = '/trips'}
                />
                <QuickActionButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Messages"
                  badge={stats?.guest.unreadMessages}
                  onClick={() => {}}
                />
                <QuickActionButton
                  icon={<Settings className="w-5 h-5" />}
                  label="Settings"
                  onClick={() => window.location.href = '/settings'}
                />
              </>
            )}
          </div>
        </div>

        {/* Main Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isHostMode ? 'Recent Bookings' : 'My Bookings'}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          </div>

          {/* Messages Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Messages
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">No messages</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  change,
  alert = false
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs ${alert ? 'text-red-600' : 'text-green-600'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({
  icon,
  label,
  badge,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
    >
      <div className="mb-2 text-gray-600 group-hover:text-blue-600">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {badge && badge > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
