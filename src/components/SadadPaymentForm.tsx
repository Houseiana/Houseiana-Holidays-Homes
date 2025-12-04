'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2, XCircle, CreditCard, ExternalLink } from 'lucide-react';

interface SadadPaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function SadadPaymentForm({
  bookingId,
  amount,
  currency,
  customerEmail,
  customerPhone,
  onSuccess: _onSuccess, // Will be called after redirect back from Sadad
  onError,
}: SadadPaymentFormProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    action: string;
    formFields: Record<string, string>;
  } | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Store booking ID in sessionStorage for callback handling
  useEffect(() => {
    sessionStorage.setItem('pendingBookingId', bookingId);
  }, [bookingId]);

  // Fetch payment form data from API
  useEffect(() => {
    const fetchPaymentForm = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();

        const response = await fetch('/api/sadad/create-payment-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({ bookingId, customerEmail, customerPhone }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment form');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate payment form');
        }

        console.log('✅ Sadad payment form ready:', data.action);

        setFormData({
          action: data.action,
          formFields: data.formFields,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error fetching payment form:', err);
        setError(err.message || 'Failed to initialize payment');
        setLoading(false);
        onError(err.message || 'Payment initialization failed');
      }
    };

    fetchPaymentForm();
  }, [bookingId, getToken, onError]);

  const handlePayNow = () => {
    if (formRef.current) {
      setRedirecting(true);
      console.log('🚀 Redirecting to Sadad payment gateway...');
      formRef.current.submit();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-gray-600">Initializing secure payment...</p>
      </div>
    );
  }

  // Error state
  if (error && !formData) {
    return (
      <div className="p-6 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-start">
          <XCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold mb-1">Payment Initialization Failed</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-gray-600 font-medium">Redirecting to Sadad payment gateway...</p>
        <p className="text-gray-500 text-sm">Please wait, do not close this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-indigo-900">Secure Card Payment</h3>
            <p className="text-sm text-indigo-700">
              Powered by Sadad Qatar - Accepts Visa, Mastercard, and QPAY
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Hidden Form for Sadad Submission - redirects to Sadad directly */}
      {formData && (
        <form
          ref={formRef}
          action={formData.action}
          method="POST"
          target="_self"
          style={{ display: 'none' }}
        >
          {Object.entries(formData.formFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      {/* Amount Display */}
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
        <p className="text-3xl font-bold text-gray-900">
          {currency} {amount.toFixed(2)}
        </p>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayNow}
        disabled={!formData}
        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <span>Pay Now with Sadad</span>
        <ExternalLink className="w-5 h-5" />
      </button>

      {/* Payment Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          You will be securely redirected to Sadad Qatar to complete your payment.
          Your card details are never stored on our servers.
        </p>
      </div>
    </div>
  );
}
