/**
 * Payments Page
 * Payment history and methods (Placeholder - to be implemented)
 */
'use client';

import { useUser } from '@clerk/nextjs';

export default function PaymentsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments & Billing</h1>

      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment System Coming Soon
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We're integrating a secure payment system to handle all your transactions seamlessly.
          This feature will be available soon!
        </p>

        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Planned Features:</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Secure payment processing with Stripe</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Multiple payment methods (Cards, Digital Wallets)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Payment history and receipts</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Automatic refund processing for cancellations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Host payout management</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Tax calculation and invoicing</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Multi-currency support</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Split payments for group bookings</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">For Guests</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Save payment methods securely</li>
              <li>• View booking transaction history</li>
              <li>• Download receipts and invoices</li>
              <li>• Track refunds and cancellations</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">For Hosts</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatic payout scheduling</li>
              <li>• Earnings dashboard and analytics</li>
              <li>• Tax documentation (1099, etc.)</li>
              <li>• Transaction fee breakdown</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>All payments will be PCI DSS compliant and fully encrypted</p>
        </div>
      </div>
    </div>
  );
}
