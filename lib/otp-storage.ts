// OTP Storage System for handling different OTP methods
// In production, this should use Redis or a proper database

interface OTPRecord {
  code: string;
  phoneNumber: string;
  method: 'sms' | 'whatsapp' | 'email';
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  expiryMinutes: number;
}

// In-memory storage for development (use Redis in production)
const otpStorage = new Map<string, OTPRecord>();

export class OTPStorage {
  private static getKey(phoneNumber: string, method: string): string {
    return `otp_${method}_${phoneNumber.replace(/\D/g, '')}`;
  }

  static async storeOTP(
    phoneNumber: string,
    code: string,
    method: 'sms' | 'whatsapp' | 'email',
    expiryMinutes: number = 5
  ): Promise<void> {
    const key = this.getKey(phoneNumber, method);

    const record: OTPRecord = {
      code,
      phoneNumber,
      method,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3,
      expiryMinutes
    };

    otpStorage.set(key, record);

    // Auto-cleanup after expiry
    setTimeout(() => {
      otpStorage.delete(key);
    }, expiryMinutes * 60 * 1000);
  }

  static async verifyOTP(
    phoneNumber: string,
    code: string,
    method: 'sms' | 'whatsapp' | 'email'
  ): Promise<{ success: boolean; message: string; attemptsLeft?: number }> {
    const key = this.getKey(phoneNumber, method);
    const record = otpStorage.get(key);

    if (!record) {
      return {
        success: false,
        message: 'OTP not found or expired. Please request a new code.'
      };
    }

    // Check if expired
    const now = Date.now();
    const expiryTime = record.timestamp + (record.expiryMinutes * 60 * 1000);
    if (now > expiryTime) {
      otpStorage.delete(key);
      return {
        success: false,
        message: 'OTP has expired. Please request a new code.'
      };
    }

    // Check attempts
    if (record.attempts >= record.maxAttempts) {
      otpStorage.delete(key);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      };
    }

    // Verify code
    if (record.code === code) {
      otpStorage.delete(key);
      return {
        success: true,
        message: 'OTP verified successfully!'
      };
    } else {
      record.attempts++;
      otpStorage.set(key, record);

      const attemptsLeft = record.maxAttempts - record.attempts;
      return {
        success: false,
        message: `Invalid OTP code. ${attemptsLeft} attempts remaining.`,
        attemptsLeft
      };
    }
  }

  static async generateOTP(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async isRateLimited(
    phoneNumber: string,
    method: 'sms' | 'whatsapp' | 'email'
  ): Promise<{ limited: boolean; waitTime?: number }> {
    const key = this.getKey(phoneNumber, method);
    const record = otpStorage.get(key);

    if (!record) {
      return { limited: false };
    }

    // Rate limit: 1 OTP per minute
    const now = Date.now();
    const timeSinceLastOTP = now - record.timestamp;
    const minWaitTime = 60 * 1000; // 1 minute

    if (timeSinceLastOTP < minWaitTime) {
      const waitTime = Math.ceil((minWaitTime - timeSinceLastOTP) / 1000);
      return {
        limited: true,
        waitTime
      };
    }

    return { limited: false };
  }

  // For development/demo purposes
  static async getAllStoredOTPs(): Promise<Record<string, OTPRecord>> {
    if (process.env.NODE_ENV !== 'development') {
      return {};
    }

    const result: Record<string, OTPRecord> = {};
    otpStorage.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  static async clearExpiredOTPs(): Promise<void> {
    const now = Date.now();

    for (const [key, record] of otpStorage.entries()) {
      const expiryTime = record.timestamp + (record.expiryMinutes * 60 * 1000);
      if (now > expiryTime) {
        otpStorage.delete(key);
      }
    }
  }
}

// Cleanup expired OTPs every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    OTPStorage.clearExpiredOTPs();
  }, 5 * 60 * 1000);
}