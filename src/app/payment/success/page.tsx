'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, isSignedIn } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Get PayPal token from URL
        const token = searchParams?.get('token');
        const paymentId = searchParams?.get('paymentId');
        const PayerID = searchParams?.get('PayerID');

        console.log('📝 Payment return params:', { token, paymentId, PayerID });

        if (!token) {
          setStatus('error');
          setMessage('Missing payment information. Please contact support.');
          return;
        }

        // Get booking ID from session storage (set during booking creation)
        const storedBookingId = sessionStorage.getItem('pendingBookingId');

        if (!storedBookingId) {
          setStatus('error');
          setMessage('Booking information not found. Please check your dashboard.');
          // Still redirect to dashboard after 3 seconds
          setTimeout(() => router.push('/client-dashboard?tab=trips'), 3000);
          return;
        }

        setBookingId(storedBookingId);

        // Get Clerk authentication token
        const authToken = isSignedIn ? await getToken() : null;

        // Verify payment with backend
        const response = await fetch(`/api/bookings/verify?id=${storedBookingId}`, {
          headers: authToken ? {
            'Authorization': `Bearer ${authToken}`
          } : {}
        });

        const data = await response.json();

        if (data.success && data.booking.paymentStatus === 'PAID') {
          setStatus('success');
          setMessage('Payment successful! Your booking is confirmed.');

          // Clear pending booking
          sessionStorage.removeItem('pendingBookingId');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/client-dashboard?tab=trips&success=booking_confirmed');
          }, 3000);
        } else if (data.success && data.booking.paymentStatus === 'PARTIALLY_PAID') {
          setStatus('success');
          setMessage('Partial payment received! You can pay the balance from your dashboard.');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/client-dashboard?tab=trips&success=partial_payment');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Payment verification failed. Please check your dashboard.');

          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            router.push('/client-dashboard?tab=trips');
          }, 5000);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment. Please check your dashboard.');

        // Redirect to dashboard after 5 seconds
        setTimeout(() => {
          router.push('/client-dashboard?tab=trips');
        }, 5000);
      }
    }

    verifyPayment();
  }, [searchParams, router, getToken, isSignedIn]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment with PayPal...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            {bookingId && (
              <p className="text-sm text-gray-500">
                Booking ID: {bookingId}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Issue
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/client-dashboard?tab=trips')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
