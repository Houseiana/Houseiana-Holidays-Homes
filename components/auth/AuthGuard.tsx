'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "host" | "guest" | "admin";
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/?auth=signin");
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <div>Redirecting to login...</div>;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <div>Unauthorized access</div>;
  }

  return <>{children}</>;
}

export function RequireHost({ children, fallback }: Omit<AuthGuardProps, 'requiredRole'>) {
  return <AuthGuard requiredRole="host" fallback={fallback}>{children}</AuthGuard>;
}

export function RequireGuest({ children, fallback }: Omit<AuthGuardProps, 'requiredRole'>) {
  return <AuthGuard requiredRole="guest" fallback={fallback}>{children}</AuthGuard>;
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}