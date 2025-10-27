'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  MessageCircle,
  Plus,
  Star,
  Users
} from 'lucide-react';

export default function HostDashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { title: 'Total Bookings', value: '24', change: '+12%', color: 'text-blue-600' },
    { title: 'Revenue', value: '$4,820', change: '+8%', color: 'text-green-600' },
    { title: 'Occupancy Rate', value: '78%', change: '+5%', color: 'text-yellow-600' },
    { title: 'Average Rating', value: '4.8', change: '+0.2', color: 'text-purple-600' }
  ];

  const recentBookings = [
    { id: 1, guest: 'Sarah Johnson', property: 'Downtown Loft', dates: 'Dec 15-18', status: 'confirmed' },
    { id: 2, guest: 'Mike Chen', property: 'Beachfront Villa', dates: 'Dec 20-25', status: 'pending' },
    { id: 3, guest: 'Emma Davis', property: 'City Apartment', dates: 'Dec 22-24', status: 'confirmed' }
  ];

  return (
    <div className="p-6">
      {/* Quick Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/host-dashboard/add-listing"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Property
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.guest}</h4>
                    <p className="text-sm text-gray-600">{booking.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.dates}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status === 'confirmed' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Performance */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
          <div className="space-y-4">
            {[
              { name: 'Downtown Loft', bookings: 18, revenue: '$2,340' },
              { name: 'Beachfront Villa', bookings: 12, revenue: '$1,980' },
              { name: 'City Apartment', bookings: 8, revenue: '$1,240' }
            ].map((property, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{property.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{property.revenue}</p>
                  <p className="text-xs text-gray-500">{property.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {[
              { guest: 'Sarah Johnson', rating: 5, comment: 'Amazing stay! Perfect location.' },
              { guest: 'Mike Chen', rating: 4, comment: 'Great property, very clean.' },
              { guest: 'Emma Davis', rating: 5, comment: 'Would definitely stay again!' }
            ].map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.guest}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}