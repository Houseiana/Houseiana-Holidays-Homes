export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  profilePhoto?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresAt: string;
  phone?: string;
  profilePhoto?: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole?: 'guest' | 'host'; // Dual role support - user can be both guest and host
  initials?: string;
  name?: string;
  memberSince?: string;
  phone?: string;
  profilePhoto?: string;
}
