'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  bookingId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ clientSecret, amount, currency, bookingId, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        setMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        setMessage('Payment successful!');

        // Store booking ID for confirmation page
        sessionStorage.setItem('pendingBookingId', bookingId);
        sessionStorage.setItem('stripePaymentId', paymentIntent.id);

        onSuccess();
      } else {
        setMessage('Payment is processing...');
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error/Success Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start ${
            message.includes('successful')
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.includes('successful') ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              message.includes('successful') ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            Pay {currency.toUpperCase()} {amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Payment Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured by Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  bookingId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4F46E5',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        currency={currency}
        bookingId={bookingId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
