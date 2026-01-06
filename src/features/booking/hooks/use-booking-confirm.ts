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

                // Check if we have formAction and formData for POST submission
                if (data.formAction && data.formData) {
                    console.log('🔗 Sadad Form Action:', data.formAction);
                    console.log('📋 Sadad Form Data:', data.formData);

                    toast.success('Redirecting to payment page...');

                    // Create and submit a hidden form (POST request required by Sadad)
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = data.formAction;
                    form.style.display = 'none';

                    // Add all form fields from the response
                    const formData = data.formData;

                    // Add standard fields
                    const addField = (name: string, value: string) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = name;
                        input.value = value;
                        form.appendChild(input);
                    };

                    // Map the response fields to Sadad expected field names
                    // IMPORTANT: Don't modify values here - backend must provide sanitized data
                    // because signature is calculated on backend with these exact values
                    if (formData.merchant_id) addField('merchant_id', formData.merchant_id);
                    if (formData.ORDER_ID) addField('ORDER_ID', formData.ORDER_ID);
                    if (formData.WEBSITE) addField('WEBSITE', formData.WEBSITE);
                    if (formData.TXN_AMOUNT) addField('TXN_AMOUNT', formData.TXN_AMOUNT);
                    if (formData.email) addField('email', formData.email);
                    if (formData.MOBILE_NO) addField('MOBILE_NO', formData.MOBILE_NO);
                    if (formData.CALLBACK_URL) addField('CALLBACK_URL', formData.CALLBACK_URL);
                    if (formData.txnDate) addField('txnDate', formData.txnDate);
                    if (formData.signature) addField('signature', formData.signature);

                    // Add product details as array fields (not JSON string)
                    // Sadad expects: productdetail[0][order_id], productdetail[0][amount], productdetail[0][quantity]
                    if (formData.productdetail && Array.isArray(formData.productdetail)) {
                        formData.productdetail.forEach((product: any, index: number) => {
                            if (product.order_id) addField(`productdetail[${index}][order_id]`, product.order_id);
                            if (product.amount) addField(`productdetail[${index}][amount]`, product.amount);
                            if (product.quantity) addField(`productdetail[${index}][quantity]`, product.quantity);
                        });
                    }

                    // Append form to body and submit
                    document.body.appendChild(form);
                    console.log('📤 Submitting Sadad form...');
                    form.submit();
                } else {
                    // Fallback: try direct URL redirect
                    let redirectUrl = data.formAction || data.transactionUrl || data.url || data.redirectUrl;

                    if (redirectUrl) {
                        console.log('🔗 Sadad Redirect URL (fallback):', redirectUrl);
                        toast.success('Redirecting to payment page...');
                        window.location.href = redirectUrl;
                    } else {
                        console.error('❌ No valid form data or redirect URL found:', data);
                        throw new Error('Invalid Sadad response format');
                    }
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
