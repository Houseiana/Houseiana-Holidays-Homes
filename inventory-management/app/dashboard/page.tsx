'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Home,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  TrendingUp,
  Star,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Bell,
  Activity,
  PieChart,
  MessageSquare,
  LogOut,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Trash2,
  RotateCcw,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Plus,
  Loader2,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';

// Types
interface KPI {
  totalProperties: number;
  activeProperties: number;
  pendingApprovals: number;
  suspendedProperties: number;
  totalRevenue: number;
  revenueChange: number;
  occupancyRate: number;
  occupancyChange: number;
  averageRating: number;
  ratingChange: number;
  totalHosts: number;
  hostsChange: number;
}

type TabName =
  | 'approvals'
  | 'inventory'
  | 'calendar'
  | 'documents'
  | 'hosts'
  | 'notifications'
  | 'incidents'
  | 'financials'
  | 'reviews'
  | 'audit';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('approvals');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('inventory_token');
      if (!token) {
        router.push('/login');
      } else {
        loadKPIs();
      }
    }
  }, [router]);

  // Load KPIs
  const loadKPIs = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardKPIs();
      if (response.data) {
        setKpis(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load KPIs:', error);
      // Set mock data for demo
      setKpis({
        totalProperties: 248,
        activeProperties: 215,
        pendingApprovals: 12,
        suspendedProperties: 8,
        totalRevenue: 487250,
        revenueChange: 12.5,
        occupancyRate: 78.5,
        occupancyChange: 5.2,
        averageRating: 4.6,
        ratingChange: 0.3,
        totalHosts: 156,
        hostsChange: 8.1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('inventory_token');
    router.push('/login');
  };

  // Show message helpers
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const tabs = [
    { id: 'approvals' as TabName, name: 'Approvals & Moderation', icon: CheckCircle },
    { id: 'inventory' as TabName, name: 'Inventory & Lifecycle', icon: Building2 },
    { id: 'calendar' as TabName, name: 'Calendar & Blocking', icon: Calendar },
    { id: 'documents' as TabName, name: 'Documents & Compliance', icon: FileText },
    { id: 'hosts' as TabName, name: 'Hosts & Owners', icon: Users },
    { id: 'notifications' as TabName, name: 'Notifications Center', icon: Bell },
    { id: 'incidents' as TabName, name: 'History & Incidents', icon: AlertTriangle },
    { id: 'financials' as TabName, name: 'Financials & Performance', icon: PieChart },
    { id: 'reviews' as TabName, name: 'Ratings & Reviews', icon: MessageSquare },
    { id: 'audit' as TabName, name: 'Audit & Activity Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Inventory Management Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">Comprehensive Property Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <XCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* KPI Dashboard */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Performance Indicators</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Properties"
                value={kpis?.totalProperties || 0}
                icon={Home}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
              />
              <KPICard
                title="Active Properties"
                value={kpis?.activeProperties || 0}
                icon={CheckCircle2}
                iconColor="text-green-600"
                bgColor="bg-green-50"
              />
              <KPICard
                title="Pending Approvals"
                value={kpis?.pendingApprovals || 0}
                icon={Clock}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-50"
              />
              <KPICard
                title="Suspended Properties"
                value={kpis?.suspendedProperties || 0}
                icon={Ban}
                iconColor="text-red-600"
                bgColor="bg-red-50"
              />
              <KPICard
                title="Total Revenue"
                value={`$${((kpis?.totalRevenue || 0) / 1000).toFixed(1)}k`}
                change={kpis?.revenueChange}
                icon={DollarSign}
                iconColor="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <KPICard
                title="Occupancy Rate"
                value={`${kpis?.occupancyRate || 0}%`}
                change={kpis?.occupancyChange}
                icon={TrendingUp}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
              />
              <KPICard
                title="Average Rating"
                value={kpis?.averageRating || 0}
                change={kpis?.ratingChange}
                icon={Star}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-50"
              />
              <KPICard
                title="Total Hosts"
                value={kpis?.totalHosts || 0}
                change={kpis?.hostsChange}
                icon={Users}
                iconColor="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {activeTab === 'approvals' && <ApprovalsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'inventory' && <InventoryTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'calendar' && <CalendarTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'documents' && <DocumentsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'hosts' && <HostsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'notifications' && <NotificationsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'incidents' && <IncidentsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'financials' && <FinancialsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'reviews' && <ReviewsTab showSuccess={showSuccess} showError={showError} />}
          {activeTab === 'audit' && <AuditTab showSuccess={showSuccess} showError={showError} />}
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  iconColor: string;
  bgColor: string;
}

function KPICard({ title, value, change, icon: Icon, iconColor, bgColor }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-slate-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Tab Components
function ApprovalsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('all');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.getApprovals({ status: 'pending' });
      setApprovals(response.data || []);
    } catch (error: any) {
      console.error('Failed to load approvals:', error);
      showError(error.message || 'Failed to load approvals');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveApproval(id, 'Approved by admin');
      showSuccess('Property approved successfully');
      loadApprovals();
    } catch (error: any) {
      showError(error.message || 'Failed to approve property');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectApproval(id, 'Does not meet requirements');
      showSuccess('Property rejected');
      loadApprovals();
    } catch (error: any) {
      showError(error.message || 'Failed to reject property');
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      await api.requestChanges(id, ['Update photos', 'Add more details'], 'Please update the listing');
      showSuccess('Changes requested');
      loadApprovals();
    } catch (error: any) {
      showError(error.message || 'Failed to request changes');
    }
  };

  const cities = ['all', ...new Set(approvals.map((a) => a.property?.city).filter(Boolean))];

  const filteredApprovals = filterCity === 'all' ? approvals : approvals.filter((a) => a.property?.city === filterCity);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Pending Approvals</h3>
        <div className="flex items-center gap-3">
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>
          <button onClick={loadApprovals} className="p-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No pending approvals</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">City</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Submitted</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Documents</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{approval.property?.name}</div>
                      <div className="text-sm text-slate-500">{approval.property?.address}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700">{approval.property?.city}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {approval.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700">
                    {new Date(approval.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        approval.documentsVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {approval.documentsVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestChanges(approval.id)}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors text-sm font-medium border border-yellow-200"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InventoryTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await api.getProperties({});
      setProperties(response.data || []);
    } catch (error) {
      // Mock data
      setProperties([
        {
          id: '1',
          name: 'Beachfront Paradise',
          address: '789 Coastal Ave',
          city: 'Los Angeles',
          status: 'active',
          pricePerNight: 250,
        },
        {
          id: '2',
          name: 'Urban Loft',
          address: '321 Downtown St',
          city: 'New York',
          status: 'active',
          pricePerNight: 180,
        },
        {
          id: '3',
          name: 'Country House',
          address: '555 Rural Road',
          city: 'Austin',
          status: 'suspended',
          pricePerNight: 150,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.suspendProperty(id, 'Maintenance required');
      showSuccess('Property suspended');
      loadProperties();
    } catch (error: any) {
      showError(error.message || 'Failed to suspend property');
    }
  };

  const handleUnsuspend = async (id: string) => {
    try {
      await api.unsuspendProperty(id);
      showSuccess('Property unsuspended');
      loadProperties();
    } catch (error: any) {
      showError(error.message || 'Failed to unsuspend property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.softDeleteProperty(id);
      showSuccess('Property deleted');
      loadProperties();
    } catch (error: any) {
      showError(error.message || 'Failed to delete property');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.restoreProperty(id);
      showSuccess('Property restored');
      loadProperties();
    } catch (error: any) {
      showError(error.message || 'Failed to restore property');
    }
  };

  const filteredProperties =
    statusFilter === 'all' ? properties : properties.filter((p) => p.status === statusFilter);

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === 'active').length,
    suspended: properties.filter((p) => p.status === 'suspended').length,
    deleted: properties.filter((p) => p.status === 'deleted').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Property Inventory</h3>
        <button onClick={loadProperties} className="p-2 text-slate-600 hover:text-emerald-600 transition-colors">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Properties</div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-900">{stats.active}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm font-medium text-orange-600 mb-1">Suspended</div>
          <div className="text-2xl font-bold text-orange-900">{stats.suspended}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm font-medium text-red-600 mb-1">Deleted</div>
          <div className="text-2xl font-bold text-red-900">{stats.deleted}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">City</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Price/Night</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{property.name}</div>
                      <div className="text-sm text-slate-500">{property.address}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700">{property.city}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        property.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : property.status === 'suspended'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700">${property.pricePerNight}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {property.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleSuspend(property.id)}
                            className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors text-sm"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {property.status === 'suspended' && (
                        <>
                          <button
                            onClick={() => handleUnsuspend(property.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm"
                          >
                            Unsuspend
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {property.status === 'deleted' && (
                        <button
                          onClick={() => handleRestore(property.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                        >
                          Restore
                        </button>
                      )}
                      <button className="p-1.5 text-slate-600 hover:text-emerald-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CalendarTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties({});
      setProperties(response.data || []);
    } catch (error) {
      setProperties([
        { id: '1', name: 'Beachfront Paradise' },
        { id: '2', name: 'Urban Loft' },
      ]);
    }
  };

  const loadBlockedDates = async (propertyId: string) => {
    try {
      const response = await api.getBlockedDates(propertyId);
      setBlockedDates(response.data || []);
    } catch (error) {
      setBlockedDates([
        { id: '1', startDate: '2025-12-01', endDate: '2025-12-05', reason: 'Maintenance' },
      ]);
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      loadBlockedDates(selectedProperty);
    }
  }, [selectedProperty]);

  const handleBlockDates = async () => {
    if (!selectedProperty || !startDate || !endDate || !reason) {
      showError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await api.blockDates({
        propertyId: selectedProperty,
        startDate,
        endDate,
        reason,
      });
      showSuccess('Dates blocked successfully');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadBlockedDates(selectedProperty);
    } catch (error: any) {
      showError(error.message || 'Failed to block dates');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedDateId: string) => {
    try {
      await api.unblockDates(selectedProperty, blockedDateId);
      showSuccess('Dates unblocked');
      loadBlockedDates(selectedProperty);
    } catch (error: any) {
      showError(error.message || 'Failed to unblock dates');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Calendar & Date Blocking</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Dates Form */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Block Dates</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Maintenance, Personal use"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleBlockDates}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calendar className="h-5 w-5" />}
              Block Dates
            </button>
          </div>
        </div>

        {/* Blocked Dates List */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Blocked Dates</h4>
          {!selectedProperty ? (
            <div className="text-center text-slate-500 py-8">Select a property to view blocked dates</div>
          ) : blockedDates.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No blocked dates</div>
          ) : (
            <div className="space-y-3">
              {blockedDates.map((blocked) => (
                <div key={blocked.id} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {new Date(blocked.startDate).toLocaleDateString()} -{' '}
                        {new Date(blocked.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{blocked.reason}</div>
                    </div>
                    <button
                      onClick={() => handleUnblock(blocked.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Visualization */}
      <div className="mt-6 bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Calendar View</h4>
        <div className="bg-white rounded-lg p-8 text-center text-slate-500 border border-slate-200">
          <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-400" />
          Calendar visualization would be displayed here
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'property' | 'host'>('property');
  const [selectedId, setSelectedId] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    loadProperties();
    loadHosts();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties({});
      setProperties(response.data || []);
    } catch (error) {
      setProperties([{ id: '1', name: 'Beachfront Paradise' }]);
    }
  };

  const loadHosts = async () => {
    try {
      const response = await api.getHosts({});
      setHosts(response.data || []);
    } catch (error) {
      setHosts([{ id: '1', name: 'John Doe' }]);
    }
  };

  const loadDocuments = async () => {
    if (!selectedId) return;
    try {
      setLoading(true);
      const response =
        selectedType === 'property'
          ? await api.getPropertyDocuments(selectedId)
          : await api.getHostDocuments(selectedId);
      setDocuments(response.data || []);
    } catch (error) {
      setDocuments([
        {
          id: '1',
          category: 'License',
          fileName: 'business-license.pdf',
          expiryDate: '2026-12-31',
          status: 'valid',
          uploadedAt: '2025-01-15',
        },
        {
          id: '2',
          category: 'Insurance',
          fileName: 'insurance-policy.pdf',
          expiryDate: '2025-12-15',
          status: 'expiring_soon',
          uploadedAt: '2025-01-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadDocuments();
    }
  }, [selectedId, selectedType]);

  const handleUpload = async () => {
    if (!uploadFile || !selectedId) {
      showError('Please select a file');
      return;
    }
    try {
      setLoading(true);
      await api.uploadDocument(uploadFile, {
        category: 'other',
        propertyId: selectedType === 'property' ? selectedId : undefined,
        hostId: selectedType === 'host' ? selectedId : undefined,
      });
      showSuccess('Document uploaded successfully');
      setUploadFile(null);
      loadDocuments();
    } catch (error: any) {
      showError(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(docId);
      showSuccess('Document deleted');
      loadDocuments();
    } catch (error: any) {
      showError(error.message || 'Failed to delete document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-700';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Documents & Compliance</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Selector */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Select Entity</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'property' | 'host');
                  setSelectedId('');
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="property">Property</option>
                <option value="host">Host</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {selectedType === 'property' ? 'Property' : 'Host'}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select...</option>
                {(selectedType === 'property' ? properties : hosts).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Upload Document</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={loading || !uploadFile || !selectedId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {!selectedId ? (
        <div className="text-center text-slate-500 py-12">Select an entity to view documents</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No documents found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">File Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Uploaded</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Expiry Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-slate-900">{doc.category}</td>
                  <td className="py-4 px-4 text-slate-700">{doc.fileName}</td>
                  <td className="py-4 px-4 text-slate-700">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-slate-700">
                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HostsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      setLoading(true);
      const response = await api.getHosts({});
      setHosts(response.data || []);
    } catch (error) {
      // Mock data
      setHosts([
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1-555-0100',
          propertiesCount: 5,
          totalRevenue: 45000,
          rating: 4.8,
          verificationStatus: 'verified',
          documentsCompliant: true,
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1-555-0101',
          propertiesCount: 3,
          totalRevenue: 28000,
          rating: 4.6,
          verificationStatus: 'pending',
          documentsCompliant: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.suspendHost(id, 'Compliance issues');
      showSuccess('Host suspended');
      loadHosts();
    } catch (error: any) {
      showError(error.message || 'Failed to suspend host');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.verifyHost(id);
      showSuccess('Host verified');
      loadHosts();
    } catch (error: any) {
      showError(error.message || 'Failed to verify host');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Hosts & Owners</h3>
        <button onClick={loadHosts} className="p-2 text-slate-600 hover:text-emerald-600 transition-colors">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hosts.map((host) => (
            <div key={host.id} className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-lg">{host.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-slate-600">{host.rating}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    host.verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {host.verificationStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  {host.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  {host.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Home className="h-4 w-4" />
                  {host.propertiesCount} Properties
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-xs text-emerald-600 mb-1">Revenue</div>
                  <div className="font-bold text-emerald-900">${(host.totalRevenue / 1000).toFixed(1)}k</div>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    host.documentsCompliant ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className={`text-xs mb-1 ${host.documentsCompliant ? 'text-green-600' : 'text-red-600'}`}>
                    Documents
                  </div>
                  <div className={`font-bold ${host.documentsCompliant ? 'text-green-900' : 'text-red-900'}`}>
                    {host.documentsCompliant ? 'Compliant' : 'Issues'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {host.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => handleVerify(host.id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handleSuspend(host.id)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [notificationType, setNotificationType] = useState<'push' | 'email' | 'sms'>('email');
  const [recipientType, setRecipientType] = useState<'individual' | 'bulk'>('individual');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [hosts, setHosts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHosts();
    loadHistory();
  }, []);

  const loadHosts = async () => {
    try {
      const response = await api.getHosts({});
      setHosts(response.data || []);
    } catch (error) {
      setHosts([
        { id: '1', name: 'John Smith' },
        { id: '2', name: 'Sarah Johnson' },
      ]);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.getNotificationHistory({});
      setHistory(response.data || []);
    } catch (error) {
      setHistory([
        {
          id: '1',
          type: 'email',
          recipient: 'John Smith',
          subject: 'Document expiring soon',
          sentAt: '2025-11-25T10:00:00Z',
          status: 'delivered',
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!subject || !message) {
      showError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      if (recipientType === 'individual') {
        if (!recipientId) {
          showError('Please select a recipient');
          return;
        }
        await api.sendNotification({
          type: notificationType,
          recipientId,
          recipientType: 'host',
          subject,
          message,
        });
        showSuccess('Notification sent successfully');
      } else {
        await api.sendBulkNotifications({
          type: notificationType,
          recipientIds: hosts.map((h) => h.id),
          recipientType: 'host',
          subject,
          message,
        });
        showSuccess('Bulk notifications sent successfully');
      }
      setSubject('');
      setMessage('');
      loadHistory();
    } catch (error: any) {
      showError(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Notifications Center</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Send Notification */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Send Notification</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recipient</label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="individual">Individual</option>
                <option value="bulk">All Hosts</option>
              </select>
            </div>
            {recipientType === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Host</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select...</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Notification subject"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              Send Notification
            </button>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4">Recent Notifications</h4>
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No notifications sent yet</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((notif) => (
                <div key={notif.id} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{notif.subject}</div>
                      <div className="text-sm text-slate-600 mt-1">To: {notif.recipient}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        notif.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : notif.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {notif.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">{notif.type}</span>
                    <span>{new Date(notif.sentAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncidentsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newIncident, setNewIncident] = useState({
    propertyId: '',
    type: 'maintenance',
    severity: 'medium',
    description: '',
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.getIncidents({});
      setIncidents(response.data || []);
    } catch (error) {
      // Mock data
      setIncidents([
        {
          id: '1',
          property: { name: 'Beachfront Paradise' },
          type: 'maintenance',
          severity: 'high',
          status: 'in_progress',
          description: 'Leaking pipe in bathroom',
          reportedAt: '2025-11-24T14:30:00Z',
        },
        {
          id: '2',
          property: { name: 'Urban Loft' },
          type: 'damage',
          severity: 'medium',
          status: 'reported',
          description: 'Broken window',
          reportedAt: '2025-11-25T09:15:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await api.createIncident(newIncident as any);
      showSuccess('Incident created successfully');
      setShowCreateModal(false);
      setNewIncident({
        propertyId: '',
        type: 'maintenance',
        severity: 'medium',
        description: '',
      });
      loadIncidents();
    } catch (error: any) {
      showError(error.message || 'Failed to create incident');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.resolveIncident(id, 'Issue resolved successfully', 0);
      showSuccess('Incident resolved');
      loadIncidents();
    } catch (error: any) {
      showError(error.message || 'Failed to resolve incident');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateIncident(id, { status } as any);
      showSuccess('Status updated');
      loadIncidents();
    } catch (error: any) {
      showError(error.message || 'Failed to update status');
    }
  };

  const filteredIncidents =
    filterStatus === 'all' ? incidents : incidents.filter((i) => i.status === filterStatus);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">History & Incidents</h3>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Incident
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No incidents found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Severity</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Reported</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-slate-900">{incident.property?.name}</td>
                  <td className="py-4 px-4 text-slate-700">{incident.type}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 max-w-xs truncate">{incident.description}</td>
                  <td className="py-4 px-4 text-slate-700">{new Date(incident.reportedAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {incident.status === 'reported' && (
                        <button
                          onClick={() => handleUpdateStatus(incident.id, 'in_progress')}
                          className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors text-sm"
                        >
                          Start
                        </button>
                      )}
                      {incident.status === 'in_progress' && (
                        <button
                          onClick={() => handleResolve(incident.id)}
                          className="px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm"
                        >
                          Resolve
                        </button>
                      )}
                      <button className="p-1.5 text-slate-600 hover:text-emerald-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h4 className="text-xl font-semibold text-slate-800 mb-4">Create Incident</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property ID</label>
                <input
                  type="text"
                  value={newIncident.propertyId}
                  onChange={(e) => setNewIncident({ ...newIncident, propertyId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="damage">Damage</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIncident}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties({});
      setProperties(response.data || []);
    } catch (error) {
      setProperties([
        { id: '1', name: 'Beachfront Paradise' },
        { id: '2', name: 'Urban Loft' },
      ]);
    }
  };

  const loadFinancials = async () => {
    if (!selectedProperty || !dateRange.start || !dateRange.end) return;
    try {
      setLoading(true);
      const response = await api.getFinancialSummary(selectedProperty, dateRange.start, dateRange.end);
      setSummary(response.data);
    } catch (error) {
      // Mock data
      setSummary({
        totalRevenue: 12500,
        totalCosts: 4200,
        netProfit: 8300,
        profitMargin: 66.4,
        bookings: 15,
        costs: {
          cleaning: 1200,
          maintenance: 800,
          commission: 1500,
          utilities: 700,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProperty && dateRange.start && dateRange.end) {
      loadFinancials();
    }
  }, [selectedProperty, dateRange]);

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Financials & Performance</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : !summary ? (
        <div className="text-center py-12 text-slate-500">Select property and date range to view financials</div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <div className="text-sm font-medium text-emerald-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-emerald-900">${summary.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="text-sm font-medium text-red-600 mb-1">Total Costs</div>
              <div className="text-3xl font-bold text-red-900">${summary.totalCosts.toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="text-sm font-medium text-blue-600 mb-1">Net Profit</div>
              <div className="text-3xl font-bold text-blue-900">${summary.netProfit.toLocaleString()}</div>
            </div>
            <div
              className={`rounded-lg p-6 border ${
                summary.profitMargin > 50
                  ? 'bg-green-50 border-green-200'
                  : summary.profitMargin > 30
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  summary.profitMargin > 50
                    ? 'text-green-600'
                    : summary.profitMargin > 30
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                Profit Margin
              </div>
              <div
                className={`text-3xl font-bold ${
                  summary.profitMargin > 50
                    ? 'text-green-900'
                    : summary.profitMargin > 30
                    ? 'text-yellow-900'
                    : 'text-red-900'
                }`}
              >
                {summary.profitMargin.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
            <h4 className="font-semibold text-slate-800 mb-4">Cost Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary.costs).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-sm text-slate-600 mb-1 capitalize">{key}</div>
                  <div className="text-xl font-bold text-slate-900">${value.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((value / summary.totalCosts) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-4">Revenue Trends</h4>
            <div className="bg-white rounded-lg p-12 text-center text-slate-500 border border-slate-200">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-slate-400" />
              Revenue trend chart would be displayed here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties({});
      setProperties(response.data || []);
    } catch (error) {
      setProperties([
        { id: '1', name: 'Beachfront Paradise' },
        { id: '2', name: 'Urban Loft' },
      ]);
    }
  };

  const loadReviews = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await api.getPropertyReviews(propertyId);
      setReviews(response.data || []);
    } catch (error) {
      // Mock data
      setReviews([
        {
          id: '1',
          guestName: 'Alice Johnson',
          rating: 5,
          comment: 'Amazing place! Clean and comfortable. Host was very responsive.',
          createdAt: '2025-11-20T14:30:00Z',
          response: null,
        },
        {
          id: '2',
          guestName: 'Bob Smith',
          rating: 4,
          comment: 'Good location, but WiFi could be better.',
          createdAt: '2025-11-18T10:15:00Z',
          response: 'Thank you for your feedback. We have upgraded the WiFi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      loadReviews(selectedProperty);
    }
  }, [selectedProperty]);

  const handleRespond = async (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response) {
      showError('Please enter a response');
      return;
    }
    try {
      await api.respondToReview(reviewId, response);
      showSuccess('Response posted successfully');
      setResponseText({ ...responseText, [reviewId]: '' });
      loadReviews(selectedProperty);
    } catch (error: any) {
      showError(error.message || 'Failed to post response');
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      await api.flagReview(reviewId, 'Inappropriate content');
      showSuccess('Review flagged for moderation');
      loadReviews(selectedProperty);
    } catch (error: any) {
      showError(error.message || 'Failed to flag review');
    }
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Ratings & Reviews</h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Select Property</label>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select Property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedProperty ? (
        <div className="text-center py-12 text-slate-500">Select a property to view reviews</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div>
          {/* Average Rating */}
          {reviews.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-5xl font-bold text-yellow-900">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-800">Average Rating</div>
                  <div className="text-sm text-slate-600">{reviews.length} total reviews</div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No reviews yet</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{review.guestName}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-slate-600 ml-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFlag(review.id)}
                      className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-slate-700 mb-4">{review.comment}</p>

                  {review.response ? (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="text-sm font-medium text-slate-700 mb-1">Host Response:</div>
                      <p className="text-slate-600">{review.response}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Respond to Review</label>
                      <textarea
                        value={responseText[review.id] || ''}
                        onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                        placeholder="Type your response..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 mb-2"
                      />
                      <button
                        onClick={() => handleRespond(review.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        Post Response
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuditTab({ showSuccess, showError }: { showSuccess: (msg: string) => void; showError: (msg: string) => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAuditLogs({
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setLogs(response.data || []);
    } catch (error) {
      // Mock data
      setLogs([
        {
          id: '1',
          user: { name: 'Admin User', email: 'admin@example.com' },
          action: 'APPROVE_PROPERTY',
          entityType: 'Property',
          entityId: '123',
          timestamp: '2025-11-26T10:30:00Z',
          changes: {
            before: { status: 'pending' },
            after: { status: 'approved' },
          },
          ipAddress: '192.168.1.100',
        },
        {
          id: '2',
          user: { name: 'Admin User', email: 'admin@example.com' },
          action: 'SUSPEND_HOST',
          entityType: 'Host',
          entityId: '456',
          timestamp: '2025-11-26T09:15:00Z',
          changes: {
            before: { status: 'active' },
            after: { status: 'suspended' },
          },
          ipAddress: '192.168.1.100',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportAuditLogs({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      a.click();
      showSuccess('Audit logs exported successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to export logs');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Audit & Activity Log</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Action Type</label>
          <select
            value={filters.action}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value });
              setTimeout(loadLogs, 100);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Actions</option>
            <option value="APPROVE_PROPERTY">Approve Property</option>
            <option value="SUSPEND_HOST">Suspend Host</option>
            <option value="CREATE_INCIDENT">Create Incident</option>
            <option value="SEND_NOTIFICATION">Send Notification</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value });
              setTimeout(loadLogs, 100);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value });
              setTimeout(loadLogs, 100);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No audit logs found</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-50 rounded-lg p-5 border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-slate-600">
                      {log.entityType} #{log.entityId}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">{log.user.name}</span> ({log.user.email})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-900">{new Date(log.timestamp).toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">{log.ipAddress}</div>
                </div>
              </div>
              {log.changes && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-medium text-slate-700 mb-2">Changes:</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Before:</div>
                      <code className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                        {JSON.stringify(log.changes.before)}
                      </code>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">After:</div>
                      <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {JSON.stringify(log.changes.after)}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
