'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Loader2,
  Home,
  CreditCard,
  AlertCircle,
  Check,
  Shield
} from 'lucide-react';
import { countries } from '@/lib/countries';
import SadadPaymentForm from '@/components/SadadPaymentForm';

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  coverPhoto?: string;
  cleaningFee: number;
}

interface BookingData {
  property: Property;
  booking: {
    checkIn: string;
    checkOut: string;
    guests: number;
    adults: number;
    children: number;
    infants: number;
  };
  pricing: {
    base: number;
    nights: number;
    cleaningFee: number;
    serviceFee: number;
    tax: number;
    total: number;
  };
}

interface SadadFormData {
  action: string;
  formFields: Record<string, string>;
}

function BookingConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Payment frame state
  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  // Guest form
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+974',
    phone: '',
    specialRequests: ''
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setGuestForm(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
      }));
    }
  }, [user]);

  // Load property data
  useEffect(() => {
    const propertyId = searchParams?.get('propertyId');
    const checkIn = searchParams?.get('checkIn');
    const checkOut = searchParams?.get('checkOut');
    const guests = searchParams?.get('guests');
    const adults = searchParams?.get('adults');

    if (!propertyId || !checkIn || !checkOut || !guests) {
      setError('Missing booking information. Please start from the property page.');
      setLoading(false);
      return;
    }

    fetchPropertyData(propertyId, checkIn, checkOut, parseInt(guests), parseInt(adults || guests));
  }, [searchParams]);

  const fetchPropertyData = async (
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    adults: number
  ) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error('Failed to load property');

      const data = await response.json();
      const property = data.property;

      // Calculate pricing
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const base = nights * property.price;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = base * 0.1;
      const tax = (base + serviceFee) * 0.12;
      const total = base + cleaningFee + serviceFee + tax;

      setBookingData({
        property: {
          id: property.id,
          title: property.title,
          location: property.location,
          city: property.city,
          country: property.country,
          price: property.price,
          rating: property.rating,
          reviews: property.reviews,
          images: property.images,
          coverPhoto: property.coverPhoto,
          cleaningFee: property.cleaningFee,
        },
        booking: { checkIn, checkOut, guests, adults, children: 0, infants: 0 },
        pricing: { base, nights, cleaningFee, serviceFee, tax, total },
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details');
      setLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      guestForm.firstName.length > 0 &&
      nameRegex.test(guestForm.firstName) &&
      guestForm.lastName.length > 0 &&
      nameRegex.test(guestForm.lastName) &&
      guestForm.email.length > 0 &&
      emailRegex.test(guestForm.email) &&
      guestForm.phone.length >= 6
    );
  };

  const handlePayment = async () => {
    if (!isFormValid() || !bookingData || !isSignedIn) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = await getToken();

      // Step 1: Create booking
      console.log('📝 Creating booking...');
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: bookingData.property.id,
          checkIn: bookingData.booking.checkIn,
          checkOut: bookingData.booking.checkOut,
          guests: bookingData.booking.guests,
          adults: bookingData.booking.adults,
          children: bookingData.booking.children,
          infants: bookingData.booking.infants,
          specialRequests: guestForm.specialRequests,
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await bookingResponse.json();
      console.log('✅ Booking created:', booking.id);

      // Store booking ID and show payment frame
      setPendingBookingId(booking.id);
      setShowPaymentFrame(true);
      setProcessing(false);

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/payment/success?bookingId=${pendingBookingId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setShowPaymentFrame(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (error && !bookingData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <button
          onClick={() => router.push('/discover')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  if (!bookingData) return null;

  const displayImage = bookingData.property.coverPhoto || bookingData.property.images?.[0] || '/placeholder.jpg';

  // Show payment frame if active
  if (showPaymentFrame && pendingBookingId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <button 
              onClick={() => setShowPaymentFrame(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
              <img src={displayImage} alt={bookingData.property.title} className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <h3 className="font-semibold text-gray-900">{bookingData.property.title}</h3>
                <p className="text-gray-600 text-sm">
                  {bookingData.booking.checkIn} - {bookingData.booking.checkOut}
                </p>
                <p className="font-bold text-indigo-600 mt-1">
                  Total: ${bookingData.pricing.total.toFixed(2)}
                </p>
              </div>
            </div>
            
            <SadadPaymentForm
              bookingId={pendingBookingId}
              amount={bookingData.pricing.total}
              currency="QAR"
              customerEmail={guestForm.email}
              customerPhone={guestForm.phoneCode.replace('+', '') + guestForm.phone}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <Link href="/" className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Confirm and Pay</h1>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Property Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <img src={displayImage} alt={bookingData.property.title} className="w-24 h-24 rounded-lg object-cover" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{bookingData.property.title}</h3>
                  <p className="text-gray-600">{bookingData.property.location}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{bookingData.property.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({bookingData.property.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-medium">{bookingData.booking.checkIn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-medium">{bookingData.booking.checkOut}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">{bookingData.booking.guests}</p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <div className="flex gap-2">
                    <select
                      value={guestForm.phoneCode}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, phoneCode: e.target.value }))}
                      className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.dialCode}>
                          {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                  <textarea
                    value={guestForm.specialRequests}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Any special requests for the host..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-indigo-600 mr-4" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Credit / Debit Card</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard, QPAY via Sadad Qatar</p>
                </div>
                <Check className="w-6 h-6 text-indigo-600" />
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Secure payment powered by Sadad Qatar
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!isFormValid() || processing}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ${bookingData.pricing.total.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By clicking Pay, you agree to our Terms of Service and Cancellation Policy
            </p>
          </div>

          {/* Right: Price Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    ${bookingData.property.price.toFixed(2)} × {bookingData.pricing.nights} nights
                  </span>
                  <span>${bookingData.pricing.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span>${bookingData.pricing.cleaningFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span>${bookingData.pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span>${bookingData.pricing.tax.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${bookingData.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Free cancellation</strong> for 48 hours after booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirm() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
