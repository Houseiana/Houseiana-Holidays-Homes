import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    hostId?: string;
    guestId?: string;
  };
  accessToken: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user as ExtendedSession['user'] | undefined;

  return {
    session: session as ExtendedSession | null,
    user,
    isLoading,
    isAuthenticated,
    isHost: user?.role === "host",
    isGuest: user?.role === "guest",
    accessToken: (session as ExtendedSession)?.accessToken,
  };
}

export function useRequireAuth(requiredRole?: "host" | "guest") {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/signin");
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireHost() {
  return useRequireAuth("host");
}

export function useRequireGuest() {
  return useRequireAuth("guest");
}