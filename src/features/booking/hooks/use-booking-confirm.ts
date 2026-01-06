'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import BackendAPI from '@/lib/api/backend-api';

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
  handlePayment: (paymentMethod: 'sadad' | 'paypal') => Promise<void>;
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
  const handlePayment = useCallback(async (paymentMethod: 'sadad' | 'paypal') => {
    if (!isFormValid() || !bookingData || !isSignedIn) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      toast.error(msg);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = await getToken();

      const orderId = pendingBookingId || searchParams?.get('bookingId');
      const amount = bookingData.pricing.total;
      if (!orderId) {
          throw new Error('Booking ID not found. Please try reserving again.');
      }

      // 2. Process Payment based on method
      if (paymentMethod === 'paypal') {
        const paypalResponse = await BackendAPI.Payment.createPayPalOrderForBooking(orderId, amount);
        
         if (paypalResponse.success && paypalResponse.data?.links) {
             // Find approval link
             const approveLink = paypalResponse.data.links.find((l: any) => l.rel === 'approve');
             if (approveLink) {
                 window.open(approveLink.href);
                 toast.success('Opening PayPal...');
             } else {
                 throw new Error('PayPal approval link not found');
             }
        } else {
             throw new Error(paypalResponse.error || 'Failed to initiate PayPal payment');
        }

      } else if (paymentMethod === 'sadad') {
          console.log('📤 Initiating Sadad payment:', {
              amount,
              orderId,
              email: guestForm.email,
              mobileNo: guestForm.phoneCode.replace('+', '') + guestForm.phone,
          });

          const sadadResponse = await BackendAPI.Payment.createSadadPayment({
              amount: amount,
              orderId: orderId,
              email: guestForm.email,
              mobileNo: guestForm.phoneCode.replace('+', '') + guestForm.phone,
              description: `Booking for ${bookingData.property.title}`
          });

          console.log('📥 Sadad API Response:', JSON.stringify(sadadResponse, null, 2));

           if (sadadResponse.success && sadadResponse.data) {
                const data = sadadResponse.data as any;
                let redirectUrl = null;

               // Try multiple possible URL fields from the response
               if (typeof data === 'string' && data.startsWith('http')) {
                    redirectUrl = data;
               } else if (data.formAction) {
                    redirectUrl = data.formAction;
               } else if (data.transactionUrl) {
                    redirectUrl = data.transactionUrl;
               } else if (data.url) {
                    redirectUrl = data.url;
               } else if (data.redirectUrl) {
                    redirectUrl = data.redirectUrl;
               } else if (data.paymentUrl) {
                    redirectUrl = data.paymentUrl;
               }

               console.log('🔗 Sadad Redirect URL:', redirectUrl);

               if (redirectUrl) {
                   toast.success('Redirecting to payment page...');
                   // Use same-tab redirect for better compatibility with payment gateways
                   window.location.href = redirectUrl;
               } else {
                   console.error('❌ No valid redirect URL found in Sadad response:', data);
                   throw new Error('Invalid Sadad response format - no redirect URL found');
               }
           } else {
               console.error('❌ Sadad payment failed:', sadadResponse.error);
               throw new Error(sadadResponse.error || 'Failed to initiate Sadad payment');
           }
      }

    } catch (err: any) {
      console.error('Error:', err);
      const msg = err.message || 'Payment failed. Please try again.';
      setError(msg);
      toast.error(msg);
      setProcessing(false);
    }
  }, [isFormValid, bookingData, isSignedIn, getToken, guestForm, user, searchParams, pendingBookingId]);

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
