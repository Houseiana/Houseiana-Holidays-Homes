'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadStoredAuth = useAuthStore(state => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
