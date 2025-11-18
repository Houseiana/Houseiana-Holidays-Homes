/**
 * Payments Page
 * Payment history and methods
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  CreditCard, Plus, MoreVertical, Check, Calendar,
  ArrowDownRight, ArrowUpRight, Download, Filter
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
}

interface TransactionSummary {
  totalSpent: number;
  totalRefunds: number;
  transactionCount: number;
}

export default function PaymentsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'cards' | 'history'>('cards');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalSpent: 0,
    totalRefunds: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Fetch payment data when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      fetchPaymentData();
    }
  }, [isLoaded, user]);

  const fetchPaymentData = async (applyFilters = false) => {
    try {
      setLoading(true);
      setError(null);

      // Build query string for transactions with filters
      const queryParams = new URLSearchParams();
      if (applyFilters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
      }

      const transactionsUrl = `/api/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const [methodsRes, transactionsRes] = await Promise.all([
        fetch('/api/payment-methods'),
        fetch(transactionsUrl)
      ]);

      const methodsData = await methodsRes.json();
      const transactionsData = await transactionsRes.json();

      if (methodsData.success) {
        setPaymentMethods(methodsData.data);
      } else {
        throw new Error(methodsData.error);
      }

      if (transactionsData.success) {
        setTransactions(transactionsData.data);
        setSummary(transactionsData.summary);
      } else {
        throw new Error(transactionsData.error);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      // Build query string with current filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const exportUrl = `/api/transactions/export${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(exportUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting transactions:', err);
      alert('Failed to export transactions. Please try again.');
    }
  };

  const handleApplyFilters = () => {
    fetchPaymentData(true);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      startDate: '',
      endDate: ''
    });
    fetchPaymentData(false);
    setShowFilters(false);
  };

  if (!isLoaded || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPaymentData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getCardGradient = (brand: string) => {
    const gradients: Record<string, string> = {
      visa: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      mastercard: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
      amex: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600',
      discover: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600'
    };
    return gradients[brand.toLowerCase()] || 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Billing</h1>
          <p className="text-sm text-gray-500">Manage your payment methods and view transaction history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 pb-4 px-4 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'cards'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-4 px-4 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Transaction History
          </button>
        </nav>
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'cards' && (
        <div>
          <div className="mb-6">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm">
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h3>
              <p className="text-sm text-gray-500 mb-6">Add a payment method to make bookings easier.</p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm">
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((card) => (
              <div key={card.id} className="relative group">
                <div className={`${getCardGradient(card.brand)} rounded-2xl p-6 shadow-xl text-white relative overflow-hidden h-48 flex flex-col justify-between`}>
                  {/* Card pattern background */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-wider">{card.brand}</span>
                      </div>
                      <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    {card.isDefault && (
                      <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full mb-4">
                        <Check className="w-3 h-3" />
                        <span className="text-xs font-semibold">Default</span>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      </div>
                      <span className="text-xl font-bold tracking-wider">{card.last4}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/70 uppercase tracking-wide mb-0.5">Expires</p>
                        <p className="text-sm font-semibold">{card.expiry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{user?.firstName} {user?.lastName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Payment Security Info */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Secure Payment Processing</h3>
                <p className="text-sm text-gray-600 mb-3">
                  All payment information is encrypted and stored securely. We never share your payment details.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    PCI DSS Compliant
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    256-bit Encryption
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    Fraud Protection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters || filters.status || filters.type || filters.startDate || filters.endDate
                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {(filters.status || filters.type || filters.startDate || filters.endDate) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-xs font-bold">•</span>
                )}
              </button>
              <button
                onClick={handleExportTransactions}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(txn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            txn.type === 'payment' ? 'bg-red-50' : 'bg-green-50'
                          }`}>
                            {txn.type === 'payment' ? (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{txn.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">{txn.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          txn.status === 'Paid'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {txn.status === 'Paid' && <Check className="w-3 h-3" />}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold ${
                          txn.type === 'payment' ? 'text-gray-900' : 'text-green-600'
                        }`}>
                          {txn.type === 'refund' && '+'} ${txn.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 rounded-lg">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">${summary.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Total Refunds</p>
                  <p className="text-xl font-bold text-gray-900">${summary.totalRefunds.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Transactions</p>
                  <p className="text-xl font-bold text-gray-900">{summary.transactionCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
