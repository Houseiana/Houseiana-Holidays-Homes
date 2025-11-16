import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  setAuthData: (response: AuthResponse) => void;
  loadStoredAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const credentials: LoginRequest = { email, password };
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      if (response.data) {
        get().setAuthData(response.data);
        return true;
      }
      return false;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      if (response.data) {
        get().setAuthData(response.data);
        return true;
      }
      return false;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock Google OAuth - would integrate with @react-oauth/google in real implementation
      console.log('Google OAuth login initiated');
      // Simulate success for now
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  setAuthData: (response: AuthResponse) => {
    const user: User = {
      userId: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      initials: `${response.firstName.charAt(0)}${response.lastName.charAt(0)}`,
      name: `${response.firstName} ${response.lastName}`,
      memberSince: new Date().getFullYear().toString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }

    set({
      user,
      token: response.token,
      isAuthenticated: true,
      error: null
    });
  },

  loadStoredAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({
            user,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          get().logout();
        }
      }
    }
  },

  clearError: () => set({ error: null })
}));
