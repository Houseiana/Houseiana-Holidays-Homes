'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BookingConfirm from '@/features/booking/components/BookingConfirm';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <BookingConfirm />
    </Suspense>
  );
}
