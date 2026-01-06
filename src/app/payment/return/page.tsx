import { Suspense } from 'react'
import PaymentReturnContent from './PaymentReturnContent'

// Mark as dynamic route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  )
}
