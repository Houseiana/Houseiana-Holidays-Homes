import React from 'react'

type BookingStatus = 
  | 'PENDING' 
  | 'REQUESTED' 
  | 'APPROVED' 
  | 'CONFIRMED' 
  | 'CANCELLED' 
  | 'COMPLETED' 
  | 'REJECTED' 
  | 'EXPIRED' 
  | 'CHECKED_IN'

type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED'

interface BookingStatusBadgeProps {
  status: BookingStatus
  paymentStatus?: PaymentStatus
  size?: 'sm' | 'md' | 'lg'
}

export function BookingStatusBadge({ status, paymentStatus, size = 'md' }: BookingStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'REQUESTED':
        return {
          label: 'Requested',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Awaiting host approval'
        }
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Payment required'
        }
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Booking confirmed'
        }
      case 'CHECKED_IN':
        return {
          label: 'Checked In',
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          description: 'Guest checked in'
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Trip completed'
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Booking cancelled'
        }
      case 'REJECTED':
        return {
          label: 'Declined',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Host declined'
        }
      case 'EXPIRED':
        return {
          label: 'Expired',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'Payment timeout'
        }
      case 'PENDING':
      default:
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Processing'
        }
    }
  }

  const getPaymentBadge = () => {
    if (!paymentStatus || paymentStatus === 'PAID') return null

    switch (paymentStatus) {
      case 'PENDING':
        return (
          <span className="ml-2 text-xs text-yellow-600">
            • Payment pending
          </span>
        )
      case 'FAILED':
        return (
          <span className="ml-2 text-xs text-red-600">
            • Payment failed
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="ml-2 text-xs text-green-600">
            • Refunded
          </span>
        )
      case 'PARTIALLY_REFUNDED':
        return (
          <span className="ml-2 text-xs text-green-600">
            • Partially refunded
          </span>
        )
      default:
        return null
    }
  }

  const config = getStatusConfig()
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <div className="inline-flex items-center">
      <span 
        className={`${config.color} ${sizeClasses[size]} border rounded-full font-medium inline-flex items-center`}
        title={config.description}
      >
        {config.label}
      </span>
      {getPaymentBadge()}
    </div>
  )
}

export default BookingStatusBadge
