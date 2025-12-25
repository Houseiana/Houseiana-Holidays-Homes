'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Shield, Lock } from 'lucide-react';
import { createSadadPayment, submitToSadad } from '@/lib/sadad';

interface SadadPaymentFormProps {
  bookingId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function SadadPaymentForm({
  bookingId,
  amount,
  currency = 'QAR',
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: SadadPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Store booking ID for callback verification
      localStorage.setItem('pending_sadad_booking', bookingId);

      // Create payment via backend
      const response = await createSadadPayment({
        amount,
        orderId: bookingId,
        email: customerEmail,
        mobileNo: customerPhone,
        description: 'Booking Payment',
      });

      console.log('Sadad payment created:', response);

      // Submit form to Sadad - this will redirect the user
      submitToSadad(response.formAction, response.formData);

      // Note: The page will redirect, so onSuccess won't be called here
      // It will be handled by the callback URL
    } catch (err: any) {
      console.error('Sadad payment error:', err);
      const errorMessage = err.message || 'Failed to create payment';
      setError(errorMessage);
      setIsProcessing(false);
      onError?.(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <CreditCard size={48} className="text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-center mb-2">Secure Payment</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          You will be redirected to Sadad Qatar&apos;s secure payment page to complete your transaction.
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Shield size={14} className="text-green-600" />
            SSL Secured
          </span>
          <span className="flex items-center gap-1">
            <Lock size={14} className="text-green-600" />
            PCI Compliant
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Visa</span>
          <span>|</span>
          <span>Mastercard</span>
          <span>|</span>
          <span>QPAY</span>
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Sadad...
          </>
        ) : (
          <>
            <Lock size={20} />
            Pay {currency} {amount.toFixed(2)}
          </>
        )}
      </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          By clicking &quot;Pay Now&quot;, you agree to the terms and conditions.
        </p>
    </div>
  );
}
