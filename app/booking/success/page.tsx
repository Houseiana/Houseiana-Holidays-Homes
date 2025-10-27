'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Star,
  Download,
  MessageSquare,
  Home,
  CalendarDays
} from 'lucide-react';

interface BookingConfirmation {
  bookingId: string;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    images: string[];
    host: {
      name: string;
      avatar: string;
    };
  };
  booking: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  pricing: {
    total: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentMethod: {
    name: string;
  };
  confirmationDate: Date;
}

export default function BookingSuccess() {
  const router = useRouter();
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    // In a real app, this would come from route state or be fetched by booking ID
    // For now, we'll use mock data
    setBookingConfirmation({
      bookingId: generateBookingId(),
      property: {
        id: '1',
        title: 'kawans Inn lembongan villa',
        location: 'Nusapenida, Indonesia',
        price: 31.82,
        rating: 4.82,
        reviews: 199,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300'],
        host: {
          name: 'Nyoman',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        }
      },
      booking: {
        checkIn: '7/4/2025',
        checkOut: '7/6/2025',
        guests: 1
      },
      pricing: {
        total: 63.64
      },
      guestInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      paymentMethod: {
        name: 'Credit or debit card'
      },
      confirmationDate: new Date()
    });
  }, []);

  const generateBookingId = (): string => {
    return 'HM' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const goToBookings = () => {
    router.push('/client-dashboard');
  };

  const goHome = () => {
    router.push('/');
  };

  const downloadReceipt = () => {
    console.log('Downloading receipt...');
    // Implementation for downloading receipt
  };

  const contactHost = () => {
    console.log('Contacting host...');
    // Implementation for contacting host
  };

  const getNights = (): number => {
    if (!bookingConfirmation) return 0;

    const checkIn = new Date(bookingConfirmation.booking.checkIn);
    const checkOut = new Date(bookingConfirmation.booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCheckInTime = (): string => {
    return '3:00 PM';
  };

  const getCheckOutTime = (): string => {
    return '11:00 AM';
  };

  if (!bookingConfirmation) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're going to {bookingConfirmation.property.location}!
            </h1>
            <p className="text-lg text-gray-600">Your reservation has been confirmed</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Panel - Booking Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Confirmation Number */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmation number</h2>
              <div className="text-2xl font-bold text-indigo-600 mb-2">{bookingConfirmation.bookingId}</div>
              <p className="text-gray-600">Keep this confirmation number for your records</p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={bookingConfirmation.property.images[0]}
                  alt={bookingConfirmation.property.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {bookingConfirmation.property.title}
                  </h3>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{bookingConfirmation.property.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({bookingConfirmation.property.reviews})</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{bookingConfirmation.property.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your trip</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Dates</div>
                    <div className="text-gray-600">
                      {formatDate(bookingConfirmation.booking.checkIn)} – {formatDate(bookingConfirmation.booking.checkOut)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Guests</div>
                    <div className="text-gray-600">
                      {bookingConfirmation.booking.guests} guest{bookingConfirmation.booking.guests !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Check-in:</span>
                    <div className="text-sm text-gray-600">{getCheckInTime()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Check-out:</span>
                    <div className="text-sm text-gray-600">{getCheckOutTime()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment details</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>${bookingConfirmation.property.price} x {getNights()} nights</span>
                  <span>${bookingConfirmation.pricing.total.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total paid</span>
                    <span>${bookingConfirmation.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Paid with: </span>
                <span className="text-sm font-medium text-gray-900">
                  {bookingConfirmation.paymentMethod.name}
                </span>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest information</h2>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">
                  {bookingConfirmation.guestInfo.firstName} {bookingConfirmation.guestInfo.lastName}
                </div>
                <div className="text-gray-600">{bookingConfirmation.guestInfo.email}</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Actions */}
          <div className="lg:col-span-1 space-y-6">

            {/* Next Steps Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">What's next?</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Check your email</div>
                    <div className="text-sm text-gray-600">
                      We've sent confirmation details to {bookingConfirmation.guestInfo.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Get ready for your trip</div>
                    <div className="text-sm text-gray-600">
                      Download our mobile app for easy check-in and trip management
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Contact your host</div>
                    <div className="text-sm text-gray-600">
                      {bookingConfirmation.property.host.name} will be happy to help with any questions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact {bookingConfirmation.property.host.name}
              </h3>
              <button
                onClick={contactHost}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Send message
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download receipt
              </button>

              <button
                onClick={goToBookings}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View all bookings
              </button>

              <button
                onClick={goHome}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue browsing
              </button>
            </div>

            {/* Trip Management */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <CalendarDays className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Manage your trip</h3>
              </div>
              <p className="text-indigo-100 text-sm mb-4">
                Get the most out of your stay with easy trip management tools
              </p>
              <button
                onClick={goToBookings}
                className="w-full px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}