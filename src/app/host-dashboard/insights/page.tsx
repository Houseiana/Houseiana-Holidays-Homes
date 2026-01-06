'use client';

import { useState } from 'react';
import {
  Home, Calendar, Building2, MessageSquare, ChevronDown,
  Globe, Menu, Download, Eye, TrendingUp,
  TrendingDown, DollarSign, Star, Award,
  Users, MapPin, Sparkles, ChevronRight
} from 'lucide-react';

export default function HouseianaHostInsights() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30');

  // TODO: Fetch from API
  const stats = {
    views: 0,
    viewsChange: 0,
    bookingRate: 0,
    bookingRateChange: 0,
    avgNightly: 0,
    avgNightlyChange: 0,
    occupancy: 0,
    occupancyChange: 0,
  };

  // TODO: Fetch from API
  const isSuperhost = false;

  // TODO: Fetch from API
  const reviewStats = {
    overall: 0,
    totalReviews: 0,
    categories: [
      { name: 'Cleanliness', rating: 0 },
      { name: 'Accuracy', rating: 0 },
      { name: 'Check-in', rating: 0 },
      { name: 'Communication', rating: 0 },
      { name: 'Location', rating: 0 },
      { name: 'Value', rating: 0 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Insights</h1>
            <p className="text-gray-500 mt-1">Analyze your performance and grow your business</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="thisYear">This year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Views</span>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.views.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stats.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.viewsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.viewsChange >= 0 ? '+' : ''}{stats.viewsChange}% vs. previous period
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Booking rate</span>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.bookingRate}%</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stats.bookingRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.bookingRateChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.bookingRateChange >= 0 ? '+' : ''}{stats.bookingRateChange}% vs. previous period
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Avg. nightly rate</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">QAR {stats.avgNightly}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stats.avgNightlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.avgNightlyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.avgNightlyChange >= 0 ? '+' : ''}{stats.avgNightlyChange}% vs. previous period
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Occupancy</span>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.occupancy}%</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stats.occupancyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.occupancyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.occupancyChange >= 0 ? '+' : ''}{stats.occupancyChange}% vs. previous period
            </div>
          </div>
        </div>

        {/* Superhost Banner */}
        {isSuperhost && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">You&apos;re a Superhost!</h3>
                  <p className="text-sm text-amber-700">Great job maintaining your status. Next review: March 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span className="font-semibold text-amber-900">4.89</span>
                  </div>
                  <p className="text-amber-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-amber-900">98%</p>
                  <p className="text-amber-600">Response</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-amber-900">&lt;1hr</p>
                  <p className="text-amber-600">Response time</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Views Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Views over time</h2>
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-400">Chart visualization will appear here</p>
              </div>
            </div>

            {/* Guest Insights */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Guest insights</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Top countries</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">How you compare</h2>
              <p className="text-gray-500 text-center py-8">
                Market comparison data will appear here once you have more bookings
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reviews</h3>
              {reviewStats.totalReviews > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-2xl font-semibold">{reviewStats.overall}</span>
                    <span className="text-gray-500">({reviewStats.totalReviews} reviews)</span>
                  </div>
                  <div className="space-y-2">
                    {reviewStats.categories.map(cat => (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{cat.name}</span>
                          <span className="font-medium">{cat.rating}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${(cat.rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Suggestions</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <p className="text-sm font-medium text-teal-900">List your first property</p>
                  <p className="text-xs text-teal-700 mt-1">Start earning by adding a listing</p>
                  <button className="mt-2 text-sm text-teal-600 font-medium flex items-center gap-1 hover:underline">
                    Get started <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State (when no data) */}
        {stats.views === 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Once you list your properties and start receiving views and bookings, detailed insights will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
