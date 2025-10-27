import { PrismaClient, OtpType } from '@prisma/client';
import prisma from '@/lib/prisma';

interface OTPStoreOptions {
  expiryMinutes?: number;
  maxAttempts?: number;
}

interface OTPVerifyResult {
  success: boolean;
  message: string;
  attemptsLeft?: number;
  isExpired?: boolean;
  isBlocked?: boolean;
}

export class SecureOTPStorage {
  private static readonly DEFAULT_EXPIRY_MINUTES = 5;
  private static readonly DEFAULT_MAX_ATTEMPTS = 3;
  private static readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  static {
    // Auto-cleanup expired OTPs every 5 minutes
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      setInterval(() => {
        this.cleanupExpiredOTPs().catch(console.error);
      }, this.CLEANUP_INTERVAL_MS);
    }
  }

  /**
   * Store OTP code in database with expiry and rate limiting
   */
  static async storeOTP(
    identifier: string, // phone number or email
    code: string,
    type: OtpType,
    userId?: string,
    options: OTPStoreOptions = {}
  ): Promise<void> {
    const {
      expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS
    } = options;

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any existing OTPs for this identifier and type
    await this.invalidateExistingOTPs(identifier, type, userId);

    // Create new OTP record
    await (prisma as any).otpCode.create({
      data: {
        userId,
        phone: type === 'PHONE_VERIFICATION' || type === 'LOGIN' ? identifier : null,
        email: type === 'EMAIL_VERIFICATION' || type === 'PASSWORD_RESET' ? identifier : null,
        code: await this.hashCode(code), // Store hashed code for security
        type,
        expiresAt,
        attempts: 0,
      }
    });
  }

  /**
   * Verify OTP code with rate limiting and security checks
   */
  static async verifyOTP(
    identifier: string,
    code: string,
    type: OtpType,
    userId?: string
  ): Promise<OTPVerifyResult> {
    // Find the OTP record
    const otpRecord = await (prisma as any).otpCode.findFirst({
      where: {
        OR: [
          { phone: identifier, type },
          { email: identifier, type }
        ],
        userId,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid or expired OTP code',
        isExpired: true
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= this.DEFAULT_MAX_ATTEMPTS) {
      await this.invalidateOTP(otpRecord.id);
      return {
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.',
        isBlocked: true
      };
    }

    // Verify the code
    const isValidCode = await this.verifyHashedCode(code, otpRecord.code);

    // Increment attempt count
    await (prisma as any).otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 }
    });

    if (!isValidCode) {
      const attemptsLeft = this.DEFAULT_MAX_ATTEMPTS - (otpRecord.attempts + 1);
      return {
        success: false,
        message: `Invalid OTP code. ${attemptsLeft} attempts remaining.`,
        attemptsLeft
      };
    }

    // Mark as verified and cleanup
    await (prisma as any).otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Clean up other OTPs for this identifier
    await this.invalidateExistingOTPs(identifier, type, userId);

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  /**
   * Check if an identifier is rate limited (too many recent OTP requests)
   */
  static async isRateLimited(identifier: string, type: OtpType): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentCount = await (prisma as any).otpCode.count({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier }
        ],
        type,
        createdAt: {
          gt: oneMinuteAgo
        }
      }
    });

    return recentCount >= 3; // Max 3 OTP requests per minute
  }

  /**
   * Invalidate existing OTPs for an identifier
   */
  private static async invalidateExistingOTPs(
    identifier: string,
    type: OtpType,
    userId?: string
  ): Promise<void> {
    await (prisma as any).otpCode.updateMany({
      where: {
        OR: [
          { phone: identifier, type },
          { email: identifier, type }
        ],
        userId,
        verified: false
      },
      data: {
        verified: true // Mark as used/invalid
      }
    });
  }

  /**
   * Invalidate a specific OTP
   */
  private static async invalidateOTP(otpId: string): Promise<void> {
    await (prisma as any).otpCode.update({
      where: { id: otpId },
      data: { verified: true }
    });
  }

  /**
   * Clean up expired OTP codes
   */
  static async cleanupExpiredOTPs(): Promise<number> {
    const result = await (prisma as any).otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }

  /**
   * Hash OTP code for secure storage
   */
  private static async hashCode(code: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(code, 8); // Lower rounds for OTP (they're short-lived)
  }

  /**
   * Verify hashed OTP code
   */
  private static async verifyHashedCode(code: string, hashedCode: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(code, hashedCode);
  }

  /**
   * Get OTP statistics for monitoring
   */
  static async getOTPStats(): Promise<{
    totalActive: number;
    expiredCount: number;
    verifiedCount: number;
    failedAttempts: number;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalActive, expiredCount, verifiedCount, failedAttempts] = await Promise.all([
      (prisma as any).otpCode.count({
        where: {
          verified: false,
          expiresAt: { gt: now }
        }
      }),
      (prisma as any).otpCode.count({
        where: {
          verified: false,
          expiresAt: { lt: now }
        }
      }),
      (prisma as any).otpCode.count({
        where: {
          verified: true,
          createdAt: { gt: oneDayAgo }
        }
      }),
      (prisma as any).otpCode.aggregate({
        where: {
          attempts: { gt: 1 },
          createdAt: { gt: oneDayAgo }
        },
        _sum: {
          attempts: true
        }
      })
    ]);

    return {
      totalActive,
      expiredCount,
      verifiedCount,
      failedAttempts: failedAttempts._sum.attempts || 0
    };
  }
}