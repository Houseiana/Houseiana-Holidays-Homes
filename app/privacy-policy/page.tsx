'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /privacy (same content)
    router.replace('/privacy');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading privacy policy...</p>
      </div>
    </div>
  );
}
