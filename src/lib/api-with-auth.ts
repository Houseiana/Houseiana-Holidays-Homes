import { getSession } from "next-auth/react";

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

export async function apiWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getSession() as ExtendedSession | null;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api/v1';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  // Add Bearer token if session exists
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(base + path, {
    ...init,
    headers,
    cache: 'no-store',
    credentials: 'include',
  });

  // Handle unauthorized responses
  if (res.status === 401) {
    // Redirect to login or refresh token
    window.location.href = '/auth/signin';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  // Handle empty responses
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

// Server-side API helper (for server components)
export async function apiServer<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api/v1';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(base + path, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}