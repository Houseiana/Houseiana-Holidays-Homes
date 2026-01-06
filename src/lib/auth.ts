/**
 * Authentication utilities using Clerk
 * All JWT/password handling is done by the Backend API
 */

import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export interface UserInfo {
  userId: string
  email?: string
  firstName?: string
  lastName?: string
}

/**
 * Get user info from request using Clerk authentication
 */
export function getUserFromRequest(request: NextRequest): UserInfo | null {
  // Try to get user from Clerk auth header
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    // For API calls with Bearer token, extract user ID
    // The actual token validation should be done by the backend
    const token = authHeader.substring(7)

    // For now, we'll rely on Clerk's server-side auth
    // The token is passed to backend for validation
    return null
  }

  return null
}

/**
 * Get authenticated user from Clerk session (for server components/API routes)
 */
export async function getAuthenticatedUser(): Promise<UserInfo | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    return {
      userId,
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * JWT Payload type for compatibility
 * Actual JWT verification is handled by the Backend API
 */
export interface JWTPayload {
  userId: string
  email?: string
  iat?: number
  exp?: number
}

/**
 * Verify token - delegates to Backend API
 * @deprecated Use Backend API for token verification
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  console.warn('verifyToken should be handled by Backend API')
  return null
}
