'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Diamond,
  CreditCard,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';

interface BookingData {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    images: string[];
    isRareFind?: boolean;
    guestFavorite?: boolean;
  };
  booking: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  pricing: {
    base: number;
    total: number;
  };
  nights: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital';
  icon: string;
  selected: boolean;
}

export default function BookingConfirm() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentTiming, setPaymentTiming] = useState<'now' | 'split'>('now');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Form data
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    zipCode: '',
    country: 'United States'
  });

  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    purpose: 'leisure',
    specialRequests: ''
  });

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit or debit card',
      type: 'card',
      icon: 'card',
      selected: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital',
      icon: 'paypal',
      selected: false
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      type: 'digital',
      icon: 'apple-pay',
      selected: false
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      type: 'digital',
      icon: 'google-pay',
      selected: false
    }
  ];

  useEffect(() => {
    // Initialize with default payment method
    setSelectedPaymentMethod(paymentMethods.find(m => m.selected) || null);

    // Mock booking data (in real app, this would come from route params or state)
    setBookingData({
      property: {
        id: '1',
        title: 'kawans Inn lembongan villa',
        location: 'Nusapenida, Indonesia',
        price: 31.82,
        rating: 4.82,
        reviews: 199,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300'],
        isRareFind: true,
        guestFavorite: true
      },
      booking: {
        checkIn: '7/4/2025',
        checkOut: '7/6/2025',
        guests: 1
      },
      pricing: {
        base: 63.64,
        total: 63.64
      },
      nights: 2
    });
  }, []);

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
        return selectedPaymentMethod !== null &&
               (selectedPaymentMethod?.type !== 'card' || isPaymentFormValid());
      case 3:
        return isGuestFormValid();
      default:
        return false;
    }
  };

  const isPaymentFormValid = (): boolean => {
    return paymentForm.cardNumber.length >= 16 &&
           paymentForm.expiryDate.length >= 5 &&
           paymentForm.cvv.length >= 3 &&
           paymentForm.zipCode.length > 0;
  };

  const isGuestFormValid = (): boolean => {
    return guestForm.firstName.length > 0 &&
           guestForm.lastName.length > 0 &&
           guestForm.email.length > 0 &&
           guestForm.phone.length > 0;
  };

  const getStepStatus = (step: number): 'completed' | 'current' | 'upcoming' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const formatCardNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    event.target.value = formattedValue;
    setPaymentForm(prev => ({ ...prev, cardNumber: value }));
  };

  const formatExpiryDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    setPaymentForm(prev => ({ ...prev, expiryDate: value }));
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

  const completeBooking = () => {
    if (isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3)) {
      router.push('/booking/success');
    }
  };

  const getCancellationPolicy = () => {
    return 'Free cancellation for 48 hours. Cancel within 48 hours for a full refund.';
  };

  if (!bookingData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Confirm and pay</h1>
        </div>
      </header>

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
                          <a href="#" className="text-indigo-600 hover:text-indigo-800 ml-2">More info</a>
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
                  <h2 className="text-xl font-semibold text-gray-900 ml-3">Add a payment method</h2>
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
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod?.id === method.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {method.icon === 'card' && <CreditCard className="w-5 h-5 text-gray-600" />}
                            {method.icon === 'paypal' && <div className="text-xs font-bold text-blue-600">PayPal</div>}
                            {method.icon === 'apple-pay' && <div className="text-xs font-bold">🍎 Pay</div>}
                            {method.icon === 'google-pay' && <div className="text-xs font-bold text-blue-600">G Pay</div>}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{method.name}</span>
                          {method.type === 'card' && (
                            <div className="ml-4 flex space-x-1">
                              <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">VISA</span>
                              <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">MC</span>
                              <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">AMEX</span>
                              <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">DISC</span>
                            </div>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPaymentMethod?.id === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                          {selectedPaymentMethod?.id === method.id && (
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Credit Card Form */}
                  {selectedPaymentMethod?.type === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Card number 🔒"
                          maxLength={19}
                          onChange={formatCardNumber}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Expiration"
                          maxLength={5}
                          onChange={formatExpiryDate}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          maxLength={4}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="ZIP code"
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <select
                          value={paymentForm.country}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  )}

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
                      <input
                        type="text"
                        placeholder="First name"
                        value={guestForm.firstName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={guestForm.lastName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
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

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      By selecting the button below, I agree to the{' '}
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
                      disabled={!isStepCompleted(3)}
                      className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
                    >
                      Confirm and pay
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
                  src={bookingData.property.images[0]}
                  alt={bookingData.property.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{bookingData.property.title}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{bookingData.property.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({bookingData.property.reviews})</span>
                    {bookingData.property.guestFavorite && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                        ⭐ Guest favorite
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Free Cancellation */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Free cancellation</h4>
                <p className="text-sm text-green-700">
                  {getCancellationPolicy()}{' '}
                  <a href="#" className="text-green-800 underline">Full policy</a>
                </p>
              </div>

              {/* Trip Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Trip details</h4>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dates</span>
                    <span className="text-gray-900">{bookingData.booking.checkIn} – {bookingData.booking.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="text-gray-900">{bookingData.booking.guests} adult{bookingData.booking.guests !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">${bookingData.property.price} x {bookingData.nights} nights</span>
                    <span className="text-gray-900">${bookingData.pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total USD</span>
                      <span className="text-gray-900">${bookingData.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Price breakdown
                  </button>
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