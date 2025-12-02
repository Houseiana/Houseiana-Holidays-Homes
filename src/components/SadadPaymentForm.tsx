'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

interface SadadPaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function SadadPaymentForm({
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
}: SadadPaymentFormProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    action: string;
    formFields: Record<string, string>;
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          body: JSON.stringify({ bookingId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment form');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error('Failed to generate payment form');
        }

        setFormData({
          action: data.action,
          formFields: data.formFields,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching payment form:', err);
        setError(err.message || 'Failed to initialize payment');
        setLoading(false);
        onError(err.message || 'Payment initialization failed');
      }
    };

    fetchPaymentForm();
  }, [bookingId, getToken, onError]);

  // Submit form to iframe once data is loaded
  useEffect(() => {
    if (formData && formRef.current && !processing) {
      setProcessing(true);

      // Submit the form to the iframe
      setTimeout(() => {
        formRef.current?.submit();
      }, 500);
    }
  }, [formData, processing]);

  // Listen for payment callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin is from Sadad
      if (!event.origin.includes('sadadqa.com')) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Handle payment success
        if (data.status === 'success' || data.RESPCODE === '1') {
          console.log('Sadad payment successful:', data);

          // Store booking ID for confirmation page
          sessionStorage.setItem('pendingBookingId', bookingId);
          sessionStorage.setItem('sadadTransactionId', data.transaction_number || data.TXNID);

          onSuccess();
        }
        // Handle payment failure
        else if (data.status === 'failed' || data.RESPCODE === '810') {
          console.error('Sadad payment failed:', data);
          setError(data.RESPMSG || 'Payment failed');
          onError(data.RESPMSG || 'Payment failed');
        }
        // Handle payment pending
        else if (data.RESPCODE === '400' || data.RESPCODE === '402') {
          console.log('Sadad payment pending:', data);
          setError('Payment is being processed. Please wait for confirmation.');
        }
      } catch (err) {
        console.error('Error parsing payment callback:', err);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [bookingId, onSuccess, onError]);

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

      {/* Hidden Form for Sadad Submission */}
      {formData && (
        <form
          ref={formRef}
          action={formData.action}
          method="POST"
          target="sadad-payment-iframe"
          style={{ display: 'none' }}
        >
          {Object.entries(formData.formFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      {/* Payment Iframe */}
      <div className="relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        {processing && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          name="sadad-payment-iframe"
          title="Sadad Payment Gateway"
          className="w-full border-0"
          style={{ minHeight: '600px', height: '100%' }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
          onLoad={() => setProcessing(false)}
        />
      </div>

      {/* Payment Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured by Sadad Qatar. Your card details are encrypted and never stored on our servers.
        </p>
      </div>

      {/* Amount Display */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600">Total Amount</p>
        <p className="text-2xl font-bold text-gray-900">
          {currency} {amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
