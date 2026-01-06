'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewListingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to add-listing page
    router.replace('/host-dashboard/add-listing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading listing creator...</p>
      </div>
    </div>
  );
}
