'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Diamond,
  Smartphone,
  Check,
  AlertCircle,
  Loader2,
  Home
} from 'lucide-react';
import { countries } from '@/lib/countries';

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
  isRareFind?: boolean;
  guestFavorite?: boolean;
  cleaningFee: number;
  serviceFee: number;
  minNights: number;
  maxNights: number | null;
  checkInTime: string;
  checkOutTime: string;
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

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital' | 'wallet';
  icon: string;
  selected: boolean;
  logos?: string[];
}

function BookingConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentTiming, setPaymentTiming] = useState<'now' | 'split'>('now');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Form data
  const [guestForm, setGuestForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phoneCode: '+1',
    phone: '',
    country: 'United States',
    address: '',
    purpose: 'leisure',
    specialRequests: ''
  });

  // Card form data
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    zipCode: '',
    billingCountry: 'United States'
  });

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital',
      icon: 'paypal',
      selected: true
    },
    {
      id: 'sadad',
      name: 'Sadad Qatar',
      type: 'digital',
      icon: 'sadad',
      selected: false
    }
  ];

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setGuestForm(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.emailAddresses[0]?.emailAddress || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    // Initialize with default payment method
    setSelectedPaymentMethod(paymentMethods.find(m => m.selected) || null);

    // Get booking params from URL
    const propertyId = searchParams?.get('propertyId');
    const checkIn = searchParams?.get('checkIn');
    const checkOut = searchParams?.get('checkOut');
    const guests = searchParams?.get('guests');
    const adults = searchParams?.get('adults');
    const children = searchParams?.get('children');
    const infants = searchParams?.get('infants');

    if (!propertyId || !checkIn || !checkOut || !guests) {
      setError('Missing booking information. Please start from the property page.');
      setLoading(false);
      return;
    }

    // Fetch property details
    fetchPropertyData(propertyId, checkIn, checkOut, parseInt(guests), parseInt(adults || guests), parseInt(children || '0'), parseInt(infants || '0'));
  }, [searchParams]);

  const fetchPropertyData = async (
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    adults: number,
    children: number,
    infants: number
  ) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);

      if (!response.ok) {
        throw new Error('Failed to load property details');
      }

      const data = await response.json();
      const property = data.property;

      // Calculate pricing
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const base = nights * property.price;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = base * 0.1; // 10% service fee
      const tax = (base + serviceFee) * 0.12; // 12% tax
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
          isRareFind: property.isRareFind,
          guestFavorite: property.guestFavorite,
          cleaningFee: property.cleaningFee,
          serviceFee: property.serviceFee,
          minNights: property.minNights,
          maxNights: property.maxNights,
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,
        },
        booking: {
          checkIn,
          checkOut,
          guests,
          adults,
          children,
          infants,
        },
        pricing: {
          base,
          nights,
          cleaningFee,
          serviceFee,
          tax,
          total,
        },
      });

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching property:', err);
      setError(err.message || 'Failed to load booking details');
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const selectPaymentTiming = (timing: 'now' | 'split') => {
    setPaymentTiming(timing);
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const proceedToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1:
        return paymentTiming === 'now' || paymentTiming === 'split';
      case 2:
        return selectedPaymentMethod !== null;
      case 3:
        return isGuestFormValid();
      default:
        return false;
    }
  };

  const isGuestFormValid = (): boolean => {
    // Validate first name (letters only)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return guestForm.firstName.length > 0 &&
           nameRegex.test(guestForm.firstName) &&
           guestForm.lastName.length > 0 &&
           nameRegex.test(guestForm.lastName) &&
           guestForm.email.length > 0 &&
           emailRegex.test(guestForm.email) &&
           guestForm.phone.length >= 6; // Minimum 6 digits for phone
  };

  const getStepStatus = (step: number): 'completed' | 'current' | 'upcoming' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const getSplitPaymentInfo = () => {
    if (!bookingData) return { first: 0, second: 0, secondDate: '' };

    const total = bookingData.pricing.total;
    const first = Math.round(total * 0.5 * 100) / 100;
    const second = total - first;

    const checkInDate = new Date(bookingData.booking.checkIn);
    const secondDate = checkInDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return { first, second, secondDate };
  };

  const completeBooking = async () => {
    if (!isStepCompleted(1) || !isStepCompleted(2) || !isStepCompleted(3)) {
      setError('Please complete all steps before proceeding');
      return;
    }

    if (!bookingData) {
      setError('Missing required information. Please refresh the page.');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    // Get authentication token from localStorage (custom JWT)
    const token = localStorage.getItem('auth_token');

    // Check if user has valid authentication token
    if (!token) {
      setError('You must be signed in to complete a booking. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/sign-in');
      }, 1500);
      return;
    }

    setProcessing(true);
    setError(null);

    try {

      // Step 1: Create the booking
      console.log('📝 Creating booking...', {
        propertyId: bookingData.property.id,
        checkIn: bookingData.booking.checkIn,
        checkOut: bookingData.booking.checkOut,
        guests: bookingData.booking.guests,
      });

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

      console.log('📡 Booking response status:', bookingResponse.status);

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('❌ Booking creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const bookingResult = await bookingResponse.json();
      const bookingId = bookingResult.id;

      console.log('✅ Booking created successfully:', bookingId);

      // Store booking ID for payment return page
      sessionStorage.setItem('pendingBookingId', bookingId);

      // Step 2: Create payment based on selected method
      if (selectedPaymentMethod.id === 'paypal') {
        console.log('💳 Initiating PayPal payment...');
        const paypalResponse = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        });

        console.log('📡 PayPal response status:', paypalResponse.status);

        if (!paypalResponse.ok) {
          const errorData = await paypalResponse.json();
          console.error('❌ PayPal payment creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create PayPal payment');
        }

        const paypalData = await paypalResponse.json();
        console.log('✅ PayPal order created:', paypalData.orderId);

        // Redirect to PayPal
        const paypalUrl = `https://www.paypal.com/checkoutnow?token=${paypalData.orderId}`;
        console.log('🔄 Redirecting to PayPal:', paypalUrl);
        window.location.href = paypalUrl;
      } else if (selectedPaymentMethod.id === 'sadad') {
        console.log('💳 Initiating Sadad payment...');
        const sadadResponse = await fetch('/api/sadad/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        });

        console.log('📡 Sadad response status:', sadadResponse.status);

        if (!sadadResponse.ok) {
          const errorData = await sadadResponse.json();
          console.error('❌ Sadad payment creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create Sadad payment');
        }

        const sadadData = await sadadResponse.json();
        console.log('✅ Sadad transaction created:', sadadData.transactionId);
        console.log('🔗 Payment URL:', sadadData.paymentUrl);

        // Redirect to Sadad
        console.log('🔄 Redirecting to Sadad payment gateway...');
        window.location.href = sadadData.paymentUrl;
      } else {
        throw new Error('Invalid payment method selected');
      }
    } catch (err: any) {
      console.error('❌ Error completing booking:', err);
      setError(err.message || 'Failed to complete booking. Please try again.');
      setProcessing(false);
    }
  };

  const getCancellationPolicy = () => {
    return 'Free cancellation for 48 hours. Cancel within 48 hours for a full refund.';
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

  if (!bookingData) {
    return null;
  }

  const displayImage = bookingData.property.coverPhoto || bookingData.property.images[0] || '/placeholder.jpg';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Confirm and pay</h1>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-red-900 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Panel - Steps */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Choose when to pay */}
            <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              getStepStatus(1) === 'current' ? 'border-indigo-500' :
              getStepStatus(1) === 'completed' ? 'border-green-500' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    getStepStatus(1) === 'completed' ? 'bg-green-500' :
                    getStepStatus(1) === 'current' ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}>
                    {getStepStatus(1) === 'completed' ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-3">Choose when to pay</h2>
                </div>
                {getStepStatus(1) === 'completed' && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>

              {getStepStatus(1) !== 'upcoming' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* Pay Now Option */}
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentTiming === 'now' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentTiming"
                        value="now"
                        checked={paymentTiming === 'now'}
                        onChange={() => selectPaymentTiming('now')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">
                          Pay ${bookingData.pricing.total.toFixed(2)} now
                        </span>
                      </div>
                    </label>

                    {/* Split Payment Option */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentTiming === 'split' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentTiming"
                        value="split"
                        checked={paymentTiming === 'split'}
                        onChange={() => selectPaymentTiming('split')}
                        className="text-indigo-600 focus:ring-indigo-500 mt-1"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Pay part now, part later</div>
                        <div className="text-sm text-gray-600 mt-1">
                          ${getSplitPaymentInfo().first.toFixed(2)} now, ${getSplitPaymentInfo().second.toFixed(2)} charged on {getSplitPaymentInfo().secondDate}. No extra fees.
                        </div>
                      </div>
                    </label>
                  </div>

                  {currentStep === 1 && (
                    <button
                      onClick={proceedToNextStep}
                      disabled={!isStepCompleted(1)}
                      className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Add a payment method */}
            <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              getStepStatus(2) === 'current' ? 'border-indigo-500' :
              getStepStatus(2) === 'completed' ? 'border-green-500' : 'border-gray-200'
            } ${getStepStatus(2) === 'upcoming' ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    getStepStatus(2) === 'completed' ? 'bg-green-500' :
                    getStepStatus(2) === 'current' ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}>
                    {getStepStatus(2) === 'completed' ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-3">Select payment method</h2>
                </div>
                {getStepStatus(2) === 'completed' && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>

              {getStepStatus(2) !== 'upcoming' && (
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => selectPaymentMethod(method)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod?.id === method.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex items-center gap-2">
                              {method.icon === 'card' && <div className="text-sm font-bold text-gray-700">💳</div>}
                              {method.icon === 'paypal' && <div className="text-sm font-bold text-blue-600">PayPal</div>}
                              {method.icon === 'apple' && <div className="text-sm">🍎</div>}
                              {method.icon === 'google' && <div className="text-sm">G</div>}
                              {method.icon === 'sadad' && <div className="text-sm font-bold text-purple-600">Sadad</div>}
                              <span className="ml-2 font-medium text-gray-900">{method.name}</span>
                            </div>
                            {method.logos && (
                              <div className="ml-4 flex items-center gap-2">
                                {method.logos.map((logo) => (
                                  <span key={logo} className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                    {logo}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            selectedPaymentMethod?.id === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}>
                            {selectedPaymentMethod?.id === method.id && (
                              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Secure Payment:</strong> You will be redirected to complete your payment securely with {selectedPaymentMethod?.name}.
                    </p>
                  </div>

                  {currentStep === 2 && (
                    <button
                      onClick={proceedToNextStep}
                      disabled={!isStepCompleted(2)}
                      className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Review your reservation */}
            <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              getStepStatus(3) === 'current' ? 'border-indigo-500' :
              getStepStatus(3) === 'completed' ? 'border-green-500' : 'border-gray-200'
            } ${getStepStatus(3) === 'upcoming' ? 'opacity-50' : ''}`}>
              <div className="flex items-center mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                  getStepStatus(3) === 'completed' ? 'bg-green-500' :
                  getStepStatus(3) === 'current' ? 'bg-indigo-500' : 'bg-gray-300'
                }`}>
                  {getStepStatus(3) === 'completed' ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-3">Review your reservation</h2>
              </div>

              {getStepStatus(3) !== 'upcoming' && (
                <div className="space-y-6">
                  {/* Guest Information Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          placeholder="Enter first name"
                          value={guestForm.firstName}
                          onChange={(e) => {
                            // Only allow letters, spaces, hyphens, and apostrophes
                            const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                            setGuestForm(prev => ({ ...prev, firstName: value }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            guestForm.firstName && /^[a-zA-Z\s'-]+$/.test(guestForm.firstName)
                              ? 'border-green-500'
                              : guestForm.firstName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {guestForm.firstName && !/^[a-zA-Z\s'-]+$/.test(guestForm.firstName) && (
                          <p className="text-xs text-red-600 mt-1">Only letters, spaces, hyphens, and apostrophes are allowed</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          placeholder="Enter last name"
                          value={guestForm.lastName}
                          onChange={(e) => {
                            // Only allow letters, spaces, hyphens, and apostrophes
                            const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                            setGuestForm(prev => ({ ...prev, lastName: value }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            guestForm.lastName && /^[a-zA-Z\s'-]+$/.test(guestForm.lastName)
                              ? 'border-green-500'
                              : guestForm.lastName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {guestForm.lastName && !/^[a-zA-Z\s'-]+$/.test(guestForm.lastName) && (
                          <p className="text-xs text-red-600 mt-1">Only letters, spaces, hyphens, and apostrophes are allowed</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                          guestForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email)
                            ? 'border-green-500'
                            : guestForm.email
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {guestForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email) && (
                        <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={guestForm.phoneCode}
                          onChange={(e) => setGuestForm(prev => ({ ...prev, phoneCode: e.target.value }))}
                          className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          {countries.map((country) => (
                            <option key={country.code} value={country.dialCode}>
                              {country.dialCode} {country.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="123456789"
                          value={guestForm.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setGuestForm(prev => ({ ...prev, phone: value }));
                          }}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className={`col-span-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            guestForm.phone && guestForm.phone.length >= 6
                              ? 'border-green-500'
                              : guestForm.phone
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {guestForm.phone && guestForm.phone.length < 6 && (
                        <p className="text-xs text-red-600 mt-1">Phone number must be at least 6 digits</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        placeholder="Enter your address"
                        value={guestForm.address}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                      />
                      <select
                        value={guestForm.country}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">What brings you to {bookingData.property.location}?</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="purpose"
                          value="leisure"
                          checked={guestForm.purpose === 'leisure'}
                          onChange={(e) => setGuestForm(prev => ({ ...prev, purpose: e.target.value }))}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-900">I'm traveling for leisure</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="purpose"
                          value="business"
                          checked={guestForm.purpose === 'business'}
                          onChange={(e) => setGuestForm(prev => ({ ...prev, purpose: e.target.value }))}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-900">I'm traveling for work</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Special requests</h3>
                    <textarea
                      placeholder="Let the host know if you have any special requests..."
                      rows={3}
                      value={guestForm.specialRequests}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Payment Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Payment Required</h4>
                        <p className="text-sm text-yellow-800">
                          After clicking "Proceed to Payment", you will be redirected to {selectedPaymentMethod?.name} to complete your payment securely. Your booking will only be confirmed after successful payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      By proceeding to payment, I agree to the{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-800">Host's House Rules</a>,{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-800">Ground rules for guests</a>,{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-800">Houseiana's Rebooking and Refund Policy</a>, and that{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-800">Houseiana can charge my payment method</a> if I'm responsible for damage.
                    </p>
                  </div>

                  {/* Complete Booking Button */}
                  {currentStep === 3 && (
                    <button
                      onClick={completeBooking}
                      disabled={!isStepCompleted(3) || processing}
                      className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Redirecting to Payment...
                        </>
                      ) : (
                        <>Proceed to Payment ({selectedPaymentMethod?.name})</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {/* Property Info */}
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={displayImage}
                  alt={bookingData.property.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{bookingData.property.title}</h3>
                  <p className="text-sm text-gray-600">{bookingData.property.location}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{bookingData.property.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({bookingData.property.reviews})</span>
                    {bookingData.property.guestFavorite && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                        Guest favorite
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Free Cancellation */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Free cancellation</h4>
                <p className="text-sm text-green-700">
                  {getCancellationPolicy()}
                </p>
              </div>

              {/* Trip Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Trip details</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dates</span>
                    <span className="text-gray-900">{bookingData.booking.checkIn} – {bookingData.booking.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="text-gray-900">{bookingData.booking.guests} guest{bookingData.booking.guests !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">${bookingData.property.price.toFixed(2)} x {bookingData.pricing.nights} nights</span>
                    <span className="text-gray-900">${bookingData.pricing.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cleaning fee</span>
                    <span className="text-gray-900">${bookingData.pricing.cleaningFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="text-gray-900">${bookingData.pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span className="text-gray-900">${bookingData.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total (USD)</span>
                      <span className="text-gray-900">${bookingData.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rare Find */}
              {bookingData.property.isRareFind && (
                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <Diamond className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">This is a rare find.</p>
                    <p className="text-sm text-orange-700">This place is usually booked.</p>
                  </div>
                </div>
              )}
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
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
