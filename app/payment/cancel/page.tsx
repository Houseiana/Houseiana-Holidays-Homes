'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Don't clear the booking ID yet - user might want to retry payment
    console.log('💳 Payment cancelled by user');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-6">
          You cancelled the payment process. Your booking has not been confirmed yet.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Your booking is still on hold. You can complete the payment from your dashboard before it expires.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              // Get the pending booking ID and redirect to payment
              const bookingId = sessionStorage.getItem('pendingBookingId');
              if (bookingId) {
                router.push(`/client-dashboard?tab=trips&retry=${bookingId}`);
              } else {
                router.push('/client-dashboard?tab=trips');
              }
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retry Payment
          </button>

          <button
            onClick={() => router.push('/client-dashboard?tab=trips')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push('/discover')}
            className="w-full px-6 py-3 bg-white text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Browse Properties
          </button>
        </div>
      </div>
    </div>
  );
}
