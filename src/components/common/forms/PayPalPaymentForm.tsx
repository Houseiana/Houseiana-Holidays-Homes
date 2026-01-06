import { useState, useCallback } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import BackendAPI from '@/lib/api/backend-api';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';

interface PayPalPaymentFormProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PayPalPaymentForm({
  bookingId,
  amount,
  currency = 'USD',
  onSuccess,
  onError,
}: PayPalPaymentFormProps) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
    currency: currency,
    intent: 'capture',
  };

  const createOrder = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const response = await BackendAPI.Payment.createPayPalOrderForBooking(bookingId, amount);
      
      if (!response.success || !response.data?.id) {
        throw new Error(response.error || 'Failed to initialize PayPal order');
      }

      return response.data.id;
    } catch (err: any) {
      const message = err.message || 'Payment initialization failed';
      setError(message);
      onError(message);
      // Return empty string to signal failure to PayPal button
      return '';
    }
  };

  const onApprove = async (data: any) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await BackendAPI.Payment.capturePayPalOrder(data.orderID, user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Payment capture failed');
      }

      onSuccess();
    } catch (err: any) {
      const message = err.message || 'Payment verification failed';
      setError(message);
      onError(message);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err: any) => {
            console.error('PayPal Button Error:', err);
            setError('An error occurred with PayPal. Please try again.');
          }}
        />
      </PayPalScriptProvider>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        You will be redirected to PayPal to complete your purchase securely.
      </p>
    </div>
  );
}
