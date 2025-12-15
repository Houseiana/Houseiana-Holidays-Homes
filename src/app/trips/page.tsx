'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TripsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to client-dashboard with trips tab
    router.replace('/client-dashboard?tab=trips');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your trips...</p>
      </div>
    </div>
  );
}
