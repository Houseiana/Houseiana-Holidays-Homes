'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
export interface BookingProperty {
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

export interface BookingPricing {
  base: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  tax: number;
  total: number;
}

export interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  infants: number;
}

export interface BookingData {
  property: BookingProperty;
  booking: BookingDetails;
  pricing: BookingPricing;
}

export interface GuestForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  specialRequests: string;
}

interface UseBookingConfirmProps {
  searchParams: URLSearchParams | null;
  user: any;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
}

interface UseBookingConfirmReturn {
  // Data
  bookingData: BookingData | null;
  loading: boolean;
  error: string | null;
  processing: boolean;

  // Payment frame
  showPaymentFrame: boolean;
  pendingBookingId: string | null;

  // Guest form
  guestForm: GuestForm;
  setGuestForm: React.Dispatch<React.SetStateAction<GuestForm>>;

  // Actions
  isFormValid: () => boolean;
  handlePayment: () => Promise<void>;
  handlePaymentSuccess: () => void;
  handlePaymentError: (errorMessage: string) => void;
  closePaymentFrame: () => void;

  // Computed
  displayImage: string;
}

const DEFAULT_GUEST_FORM: GuestForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCode: '+974',
  phone: '',
  specialRequests: '',
};

export function useBookingConfirm({
  searchParams,
  user,
  isSignedIn,
  getToken,
}: UseBookingConfirmProps): UseBookingConfirmReturn {
  // Data state
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Payment frame state
  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  // Guest form state
  const [guestForm, setGuestForm] = useState<GuestForm>(DEFAULT_GUEST_FORM);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setGuestForm(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      }));
    }
  }, [user]);

  // Fetch property data
  const fetchPropertyData = useCallback(async (
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    adults: number
  ) => {
    try {
      const response = await fetch('/api/properties/' + propertyId);
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
  }, []);

  // Load property data from search params
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
  }, [searchParams, fetchPropertyData]);

  // Form validation
  const isFormValid = useCallback((): boolean => {
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
  }, [guestForm]);

  // Handle payment
  const handlePayment = useCallback(async () => {
    if (!isFormValid() || !bookingData || !isSignedIn) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = await getToken();

      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
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

      // Store booking ID and show payment frame
      setPendingBookingId(booking.id);
      setShowPaymentFrame(true);
      setProcessing(false);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  }, [isFormValid, bookingData, isSignedIn, getToken, guestForm.specialRequests]);

  // Handle payment success
  const handlePaymentSuccess = useCallback(() => {
    // Return to allow router navigation in component
  }, []);

  // Handle payment error
  const handlePaymentError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setShowPaymentFrame(false);
  }, []);

  // Close payment frame
  const closePaymentFrame = useCallback(() => {
    setShowPaymentFrame(false);
  }, []);

  // Computed display image
  const displayImage = bookingData?.property.coverPhoto || bookingData?.property.images?.[0] || '/placeholder.jpg';

  return {
    // Data
    bookingData,
    loading,
    error,
    processing,

    // Payment frame
    showPaymentFrame,
    pendingBookingId,

    // Guest form
    guestForm,
    setGuestForm,

    // Actions
    isFormValid,
    handlePayment,
    handlePaymentSuccess,
    handlePaymentError,
    closePaymentFrame,

    // Computed
    displayImage,
  };
}
