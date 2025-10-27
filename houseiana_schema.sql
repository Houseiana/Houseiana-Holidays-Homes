-- ================================================
-- Houseiana Project Database Schema
-- ================================================
-- Description: Complete database schema for Houseiana platform
-- Author: Generated from Prisma Schema
-- Date: 2025-10-27
-- Database: PostgreSQL
-- ================================================

-- ================================================
-- DROP EXISTING OBJECTS (if needed)
-- ================================================
-- Uncomment these lines if you need to reset the database
-- DROP TABLE IF EXISTS "accounts" CASCADE;
-- DROP TABLE IF EXISTS "otp_codes" CASCADE;
-- DROP TABLE IF EXISTS "sessions" CASCADE;
-- DROP TABLE IF EXISTS "referrals" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;
-- DROP TYPE IF EXISTS "UserType";
-- DROP TYPE IF EXISTS "OtpType";

-- ================================================
-- CREATE ENUMS
-- ================================================

-- User types for the platform
CREATE TYPE "UserType" AS ENUM ('HOST', 'GUEST');

-- OTP verification types
CREATE TYPE "OtpType" AS ENUM ('PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'LOGIN', 'PASSWORD_RESET');

-- ================================================
-- CREATE TABLES
-- ================================================

-- Users table - Core user information and authentication
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "countryCode" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'GUEST',
    "profilePhoto" TEXT,
    "birthDate" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "travelPoints" INTEGER NOT NULL DEFAULT 0,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'Bronze',
    "idNumber" TEXT,
    "idCopy" TEXT,
    "kycCompleted" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Referral codes for user referral system
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- User sessions for authentication management
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- OTP codes for verification processes
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- Social authentication accounts (NextAuth.js)
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- CREATE INDEXES
-- ================================================

-- Unique constraints and indexes for performance
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- Performance indexes
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_userType_idx" ON "users"("userType");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "otp_codes_email_idx" ON "otp_codes"("email");
CREATE INDEX "otp_codes_phone_idx" ON "otp_codes"("phone");
CREATE INDEX "otp_codes_type_idx" ON "otp_codes"("type");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- ================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ================================================

-- Referral system foreign keys
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Session management foreign keys
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- OTP verification foreign keys
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Social authentication foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================================
-- INITIAL DATA (Optional)
-- ================================================

-- Insert default loyalty tiers
-- CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
--     "name" TEXT PRIMARY KEY,
--     "minPoints" INTEGER NOT NULL,
--     "benefits" TEXT[]
-- );

-- INSERT INTO "loyalty_tiers" ("name", "minPoints", "benefits") VALUES
-- ('Bronze', 0, ARRAY['Basic support', 'Standard booking']),
-- ('Silver', 1000, ARRAY['Priority support', 'Early booking access']),
-- ('Gold', 5000, ARRAY['Premium support', 'Exclusive properties', 'Upgrades']),
-- ('Platinum', 10000, ARRAY['Dedicated concierge', 'Luxury properties', 'Free upgrades']);

-- ================================================
-- VIEWS (Optional)
-- ================================================

-- View for user summary information
CREATE OR REPLACE VIEW "user_summary" AS
SELECT
    u."id",
    u."firstName",
    u."lastName",
    u."email",
    u."userType",
    u."emailVerified",
    u."phoneVerified",
    u."kycCompleted",
    u."travelPoints",
    u."loyaltyTier",
    u."memberSince",
    u."lastLoginAt",
    COUNT(r."id") as "referralCount"
FROM "users" u
LEFT JOIN "referrals" r ON u."id" = r."userId"
GROUP BY u."id";

-- ================================================
-- FUNCTIONS (Optional)
-- ================================================

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "otp_codes"
    WHERE "expiresAt" < NOW() AND "verified" = false;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "sessions"
    WHERE "expiresAt" < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS ON TABLES AND COLUMNS
-- ================================================

COMMENT ON TABLE "users" IS 'Core user information and authentication data';
COMMENT ON TABLE "referrals" IS 'User referral codes and tracking';
COMMENT ON TABLE "sessions" IS 'User session management for authentication';
COMMENT ON TABLE "otp_codes" IS 'One-time passwords for verification processes';
COMMENT ON TABLE "accounts" IS 'Social authentication provider accounts (NextAuth.js)';

COMMENT ON COLUMN "users"."userType" IS 'User role: HOST (property owner) or GUEST (traveler)';
COMMENT ON COLUMN "users"."travelPoints" IS 'Loyalty points earned through bookings and activities';
COMMENT ON COLUMN "users"."loyaltyTier" IS 'Current loyalty tier: Bronze, Silver, Gold, Platinum';
COMMENT ON COLUMN "users"."kycCompleted" IS 'Know Your Customer verification status';
COMMENT ON COLUMN "users"."failedLoginAttempts" IS 'Counter for security lockout mechanism';

-- ================================================
-- SCHEMA COMPLETE
-- ================================================

-- To use this schema:
-- 1. Create a new PostgreSQL database
-- 2. Run this script to create all tables and constraints
-- 3. Update your .env file with the database connection string
-- 4. Run: npx prisma db pull (to sync Prisma with this schema)
-- 5. Run: npx prisma generate (to regenerate Prisma client)