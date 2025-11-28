'use client';

import { useState } from 'react';
import {
  Home, Calendar, Building2, MessageSquare, ChevronDown,
  Globe, Menu, Download, DollarSign, Clock,
  CalendarDays, TrendingUp, TrendingDown, Wallet,
  CircleDollarSign, RefreshCw
} from 'lucide-react';

export default function HouseianaHostEarnings() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(2024);

  // TODO: Fetch from API
  const totals = {
    yearTotal: 0,
    yearBookings: 0,
    currentMonth: 0,
    monthChange: 0,
    availableForPayout: 0,
    pendingAmount: 0,
    processingPayout: 0,
  };

  // TODO: Fetch from API
  const monthlyEarnings = Array(12).fill(0).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    earnings: 0,
    bookings: 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600">Houseiana</span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              <a href="/host-dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Today</a>
              <a href="/host-dashboard/calendar" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Calendar</a>
              <a href="/host-dashboard/listings" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Listings</a>
              <a href="/host-dashboard/messages" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full relative">
                Messages
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
              </a>
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-full flex items-center gap-1">
                Menu <ChevronDown className="w-4 h-4" />
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <a href="/client-dashboard" className="hidden lg:flex px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full">
                Switch to traveling
              </a>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              <button className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md">
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">M</div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Earnings</h1>
            <p className="text-gray-500 mt-1">Track your income and payouts</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Total earnings {selectedYear}</span>
              <CircleDollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">QAR {totals.yearTotal.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{totals.yearBookings} bookings</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">December {selectedYear}</span>
              <CalendarDays className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">QAR {totals.currentMonth.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${totals.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.monthChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totals.monthChange >= 0 ? '+' : ''}{totals.monthChange}% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Available for payout</span>
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">QAR {totals.availableForPayout.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Ready to transfer</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">QAR {totals.pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Released after checkout</p>
          </div>
        </div>

        {/* Processing Payout Banner */}
        {totals.processingPayout > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-teal-900">Payout in progress</p>
                <p className="text-sm text-teal-700">QAR {totals.processingPayout.toLocaleString()} will arrive soon</p>
              </div>
            </div>
            <button className="text-teal-600 font-medium text-sm hover:underline">View details</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'transactions', label: 'Transaction history' },
            { id: 'payouts', label: 'Payouts' },
            { id: 'tax', label: 'Tax info' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Earnings over time</h2>
              <div className="h-64 flex items-end gap-2">
                {monthlyEarnings.map((month, idx) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-48">
                      <div
                        className="w-full max-w-[40px] rounded-t-lg bg-teal-200 hover:bg-teal-300 transition-all"
                        style={{ height: `${month.earnings > 0 ? 20 : 0}%` }}
                        title={`${month.month}: QAR ${month.earnings.toLocaleString()}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Once you start receiving bookings, your earnings will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Your transaction history will appear here once you start earning.
            </p>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payout methods yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Add a payout method to receive your earnings.
            </p>
            <button className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700">
              Add payout method
            </button>
          </div>
        )}

        {/* Tax Info Tab */}
        {activeTab === 'tax' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CircleDollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax information</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Your tax documents will be available here at the end of the tax year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
