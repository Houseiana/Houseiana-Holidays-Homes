'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Heart,
  MapPin,
  Search,
  Star,
  Clock,
  CheckCircle,
  Home,
  User,
  CreditCard,
  Bell
} from 'lucide-react';

export default function ClientDashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const upcomingTrips = [
    {
      id: 1,
      property: 'Downtown Loft',
      location: 'New York, NY',
      dates: 'Dec 15-18, 2024',
      status: 'confirmed',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      property: 'Beachfront Villa',
      location: 'Miami, FL',
      dates: 'Jan 5-12, 2025',
      status: 'pending',
      image: '/api/placeholder/300/200'
    }
  ];

  const pastTrips = [
    {
      id: 3,
      property: 'Mountain Cabin',
      location: 'Aspen, CO',
      dates: 'Nov 10-14, 2024',
      rating: 5,
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      property: 'City Apartment',
      location: 'San Francisco, CA',
      dates: 'Oct 22-25, 2024',
      rating: 4,
      image: '/api/placeholder/300/200'
    }
  ];

  const savedProperties = [
    {
      id: 5,
      name: 'Luxury Penthouse',
      location: 'Dubai, UAE',
      price: '$450/night',
      rating: 4.9,
      image: '/api/placeholder/300/200'
    },
    {
      id: 6,
      name: 'Cozy Cottage',
      location: 'Cotswolds, UK',
      price: '$180/night',
      rating: 4.7,
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Plan your next adventure or manage your bookings</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/discover"
            className="flex items-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Search className="w-6 h-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium text-indigo-900">Find Properties</h3>
              <p className="text-sm text-indigo-600">Discover amazing places to stay</p>
            </div>
          </Link>

          <button className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-green-900">Manage Trips</h3>
              <p className="text-sm text-green-600">View your bookings</p>
            </div>
          </button>

          <button className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Heart className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-purple-900">Saved Places</h3>
              <p className="text-sm text-purple-600">Your wishlist</p>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Upcoming Trips</h3>
          <Link href="/trips" className="text-indigo-600 hover:text-indigo-700 font-medium">
            View all
          </Link>
        </div>

        {upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Home className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{trip.property}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.location}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trip.status === 'confirmed' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{trip.dates}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Contact Host
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h4>
            <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
            <Link
              href="/discover"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Explore Properties
            </Link>
          </div>
        )}
      </div>

      {/* Past Trips & Saved Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Past Trips */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Past Trips</h3>
          <div className="space-y-4">
            {pastTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{trip.property}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {trip.location}
                    </p>
                    <p className="text-sm text-gray-500">{trip.dates}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < trip.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button className="text-xs text-indigo-600 hover:text-indigo-700">
                      Write Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Properties */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Saved Properties</h3>
          <div className="space-y-4">
            {savedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{property.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium text-gray-900">{property.price}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{property.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-600">
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">12</h4>
          <p className="text-sm text-gray-600">Total Trips</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">8</h4>
          <p className="text-sm text-gray-600">Saved Properties</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h4 className="text-2xl font-bold text-gray-900">4.8</h4>
          <p className="text-sm text-gray-600">Average Rating Given</p>
        </div>
      </div>
    </div>
  );
}