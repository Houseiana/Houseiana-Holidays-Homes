'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react'

export default function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get transaction details from URL params
      const transactionId = searchParams.get('transaction_id') || searchParams.get('txn_id')
      const paymentStatus = searchParams.get('status')
      const merchantRef = searchParams.get('merchant_reference') || searchParams.get('ref')

      // Get booking ID from localStorage
      const pendingBookingId = localStorage.getItem('pending_payment_booking')
      setBookingId(pendingBookingId)

      console.log('Payment return:', {
        transactionId,
        paymentStatus,
        merchantRef,
        bookingId: pendingBookingId
      })

      // Check if payment was successful
      if (paymentStatus === 'success' || paymentStatus === 'paid' || paymentStatus === 'completed') {
        setStatus('success')
        setMessage('Payment successful! Your booking has been confirmed.')

        // Clear the pending payment
        localStorage.removeItem('pending_payment_booking')

        // Redirect to bookings page after 3 seconds
        setTimeout(() => {
          router.push('/client-dashboard?tab=trips')
        }, 3000)
      } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'declined') {
        setStatus('failed')
        setMessage('Payment failed. Please try again or contact support.')
      } else {
        // Status unclear, check with backend
        await verifyPaymentStatus(pendingBookingId, transactionId)
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  const verifyPaymentStatus = async (bookingId: string | null, transactionId: string | null) => {
    if (!bookingId) {
      setStatus('failed')
      setMessage('Booking not found. Please contact support.')
      return
    }

    try {
      // Fetch booking to check payment status
      const response = await fetch(`/api/bookings?role=guest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const booking = data.items?.find((b: any) => b.id === bookingId)

        if (booking) {
          if (booking.paymentStatus === 'PAID' && booking.status === 'CONFIRMED') {
            setStatus('success')
            setMessage('Payment confirmed! Your booking is confirmed.')
            localStorage.removeItem('pending_payment_booking')

            setTimeout(() => {
              router.push('/client-dashboard?tab=trips')
            }, 3000)
          } else if (booking.paymentStatus === 'FAILED') {
            setStatus('failed')
            setMessage('Payment failed. Please try again.')
          } else {
            // Still pending - keep checking
            setMessage('Verifying payment status...')
            setTimeout(() => verifyPaymentStatus(bookingId, transactionId), 2000)
          }
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStatus('failed')
      setMessage('Error verifying payment. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          )}
          {status === 'failed' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {status === 'loading' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        {/* Transaction Details */}
        {bookingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Booking ID:</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{bookingId}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <p className="text-sm text-center text-gray-500">
              Redirecting to your bookings...
            </p>
          )}

          {status === 'failed' && (
            <>
              <button
                onClick={() => router.push('/client-dashboard?tab=trips')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Return Home
              </button>
            </>
          )}

          {status === 'loading' && (
            <p className="text-sm text-center text-gray-500">
              Please wait while we verify your payment...
            </p>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-center text-gray-500">
            Having issues? Contact our{' '}
            <a href="/support" className="text-blue-600 hover:underline">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
