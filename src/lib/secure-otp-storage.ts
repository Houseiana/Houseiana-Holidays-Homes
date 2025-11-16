// ⚠️ DEPRECATED: DO NOT USE THIS FILE
//
// This file provided direct database access for OTP storage.
// The frontend MUST NOT access the database directly.
//
// ALL OTP operations should now go through Railway Backend API:
//
// Example migrations:
//   ❌ OLD: await SecureOTPStorage.storeOTP(phone, code, 'PHONE_VERIFICATION')
//   ✅ NEW: await railwayApi.sendOTP({ phone, type: 'PHONE_VERIFICATION' })
//
//   ❌ OLD: await SecureOTPStorage.verifyOTP(phone, code, 'PHONE_VERIFICATION')
//   ✅ NEW: await railwayApi.verifyOTP({ phone, code, type: 'PHONE_VERIFICATION' })
//
// The Railway C# backend handles:
//   - OTP generation and storage
//   - Rate limiting
//   - Expiry management
//   - Security and hashing
//   - SMS/Email sending via Twilio/SendGrid
//
// Import Railway API instead:
//   import { railwayApi } from '@/lib/railway-api'

export class SecureOTPStorage {
  static async storeOTP(): Promise<void> {
    throw new Error(
      'SecureOTPStorage is deprecated. Use Railway API: railwayApi.sendOTP()'
    );
  }

  static async verifyOTP(): Promise<any> {
    throw new Error(
      'SecureOTPStorage is deprecated. Use Railway API: railwayApi.verifyOTP()'
    );
  }

  static async isRateLimited(): Promise<boolean> {
    throw new Error(
      'SecureOTPStorage is deprecated. Rate limiting is handled by Railway backend.'
    );
  }

  static async cleanupExpiredOTPs(): Promise<number> {
    throw new Error(
      'SecureOTPStorage is deprecated. OTP cleanup is handled by Railway backend.'
    );
  }

  static async getOTPStats(): Promise<any> {
    throw new Error(
      'SecureOTPStorage is deprecated. Use Railway API for OTP statistics.'
    );
  }
}

// Log warning if this file is imported
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  WARNING: lib/secure-otp-storage.ts is deprecated!\n' +
    '   OTP operations should go through Railway Backend API.\n' +
    '   Please use: import { railwayApi } from "@/lib/railway-api"'
  );
}
