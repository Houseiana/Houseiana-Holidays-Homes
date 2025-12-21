'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Houseiana</h1>
          <p className="mt-2 text-gray-600">Create an account to get started</p>
        </div>
        {mounted ? (
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-xl rounded-xl",
              },
            }}
            routing="path"
            path="/sign-up"
          />
        ) : (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
