// Authentication utilities for Inventory Management System

const TOKEN_KEY = 'inventory_token';

/**
 * Check if user is authenticated by verifying token existence
 * @returns {boolean} True if token exists, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

/**
 * Get the authentication token from localStorage
 * @returns {string | null} The token if it exists, null otherwise
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save authentication token to localStorage
 * @param {string} token - The JWT token to save
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token from localStorage (logout)
 */
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Clear all authentication data (logout completely)
 */
export function logout(): void {
  removeToken();

  // Clear any other auth-related data if needed
  if (typeof window !== 'undefined') {
    // You can add more cleanup here if needed
    // e.g., clearing user data, session data, etc.
  }
}

/**
 * Redirect to login page if user is not authenticated
 * This should be called in protected pages/components
 * @returns {boolean} True if authenticated, false if redirecting to login
 */
export function requireAuth(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!isAuthenticated()) {
    // Store the current path to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }

    // Redirect to login page
    window.location.href = '/login';
    return false;
  }

  return true;
}

/**
 * Get the redirect path after login and clear it
 * @returns {string} The path to redirect to, or '/' if none stored
 */
export function getRedirectAfterLogin(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  const path = sessionStorage.getItem('redirectAfterLogin') || '/';
  sessionStorage.removeItem('redirectAfterLogin');
  return path;
}

/**
 * Decode JWT token to get user information
 * Note: This does NOT verify the token signature, only decodes the payload
 * @param {string} token - The JWT token to decode
 * @returns {any | null} The decoded token payload or null if invalid
 */
export function decodeToken(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get user information from the stored token
 * @returns {any | null} User information from token or null if not available
 */
export function getUserFromToken(): any | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }

  return decodeToken(token);
}

/**
 * Check if user has a specific role
 * @param {string | string[]} roles - Role or array of roles to check
 * @returns {boolean} True if user has one of the specified roles
 */
export function hasRole(roles: string | string[]): boolean {
  const user = getUserFromToken();
  if (!user || !user.role) {
    return false;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Check if user is an admin
 * @returns {boolean} True if user is an admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Check if user is a host
 * @returns {boolean} True if user is a host
 */
export function isHost(): boolean {
  return hasRole('host');
}

/**
 * Refresh token if needed (this should be implemented based on your backend)
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    return false;
  }

  // Check if token is close to expiring (e.g., within 5 minutes)
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;

    // If token expires in less than 5 minutes, try to refresh
    if (timeUntilExpiry < 300) {
      // TODO: Implement token refresh API call
      // const newToken = await api.refreshToken();
      // setToken(newToken);
      // return true;

      console.warn('Token refresh not implemented');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return false;
  }
}
