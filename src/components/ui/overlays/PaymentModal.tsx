'use client'

import React, { useState } from 'react'
import { X, CreditCard, Lock, Shield } from 'lucide-react'
import { createSadadPayment, submitToSadad, type SadadPaymentRequest } from '@/lib/sadad'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    property: {
      title: string
    }
    totalPrice: number
    checkIn: string
    checkOut: string
    cancellationPolicyType?: string
  }
  customerEmail?: string
  customerPhone?: string
  onPaymentSuccess: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  booking,
  customerEmail = '',
  customerPhone = '',
  onPaymentSuccess
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayNow = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Store booking ID for callback verification
      localStorage.setItem('pending_sadad_booking', booking.id)

      // Create payment via backend
      const request: SadadPaymentRequest = {
        amount: booking.totalPrice,
        orderId: booking.id,
        email: customerEmail || 'guest@houseiana.com',
        mobileNo: customerPhone || '97400000000',
        description: `Booking for ${booking.property.title}`,
      } as unknown as SadadPaymentRequest
      const response = await createSadadPayment(request)

      console.log('Sadad payment created:', response)

      // Submit form to Sadad - this will redirect the user
      submitToSadad(response.formAction, response.formData)

      // Note: The page will redirect, so onPaymentSuccess won't be called here
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900">{booking.property.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
              <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
              {booking.cancellationPolicyType && (
                <p className="text-xs pt-2 border-t">
                  Cancellation policy: {booking.cancellationPolicyType}
                </p>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center py-3 border-t border-b">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">
              QAR {booking.totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Payment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Lock size={16} className="text-blue-600" />
              <span>Secure payment powered by Sadad Qatar</span>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
              <CreditCard size={48} className="mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-sm text-gray-600 mb-4">
                You&apos;ll be redirected to Sadad Qatar&apos;s secure payment page to complete your transaction.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Shield size={12} className="text-green-600" />
                  SSL Secured
                </span>
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-green-600" />
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Pay QAR {booking.totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By completing this payment, you agree to the booking terms and cancellation policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
