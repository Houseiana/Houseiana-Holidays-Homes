'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to reservations page (same thing, different name)
    router.replace('/host-dashboard/reservations');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your bookings...</p>
      </div>
    </div>
  );
}
