-- ============================================================
-- Houseiana Users Schema (PostgreSQL) — Production Best Practice
-- ============================================================
-- Author: You (generated)
-- Date: 2025-10-27
-- Notes:
-- - Uses CITEXT for case-insensitive email
-- - Stores session tokens as *hashes* (never raw tokens)
-- - Normalizes loyalty tiers
-- - Removes duplicate phone verification flag
-- - Prevents overlapping live OTPs per channel/type
-- - Auto-updates updatedAt via trigger
-- ============================================================

-- ----------------------------
-- EXTENSIONS
-- ----------------------------
CREATE EXTENSION IF NOT EXISTS citext;       -- case-insensitive text
CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- gen_random_uuid()

-- ----------------------------
-- ENUMS
-- ----------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN
    CREATE TYPE "UserType" AS ENUM ('HOST', 'GUEST');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OtpType') THEN
    CREATE TYPE "OtpType" AS ENUM ('PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'LOGIN', 'PASSWORD_RESET');
  END IF;
END $$;

-- ----------------------------
-- LOOKUP: LOYALTY TIERS
-- ----------------------------
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
  "name"       TEXT PRIMARY KEY,
  "minPoints"  INTEGER NOT NULL,
  "maxPoints"  INTEGER,
  "benefits"   TEXT[]
);

INSERT INTO "loyalty_tiers" ("name","minPoints","maxPoints","benefits") VALUES
('Bronze',   0,    999,  ARRAY['Basic support'])
,('Silver',  1000, 4999, ARRAY['Priority support','Early booking access'])
,('Gold',    5000, 9999, ARRAY['Premium support','Exclusive properties','Upgrades'])
,('Platinum',10000, NULL, ARRAY['Dedicated concierge','Luxury properties','Free upgrades'])
ON CONFLICT ("name") DO NOTHING;

-- ----------------------------
-- CORE: USERS
-- ----------------------------
CREATE TABLE IF NOT EXISTS "users" (
  -- Identity
  "id"                      TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName"               TEXT NOT NULL,
  "lastName"                TEXT NOT NULL,
  "email"                   CITEXT UNIQUE,                                  -- optional + unique (case-insensitive)
  "password"                TEXT NOT NULL,                                   -- password hash

  -- Contact
  "phone"                   TEXT,                                            -- store E.164 (+1..., +974...)
  "countryCode"             CHAR(2),                                         -- ISO-3166-1 alpha-2 (e.g., CA, QA)
  "profilePhoto"            TEXT,
  "birthDate"               DATE,
  "avatar"                  TEXT,

  -- Classification
  "userType"                "UserType" NOT NULL DEFAULT 'GUEST',
  "isHost"                  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Verification
  "emailVerified"           BOOLEAN NOT NULL DEFAULT FALSE,
  "phoneVerified"           BOOLEAN NOT NULL DEFAULT FALSE,
  "kycCompleted"            BOOLEAN NOT NULL DEFAULT FALSE,

  -- KYC (basic)
  "idNumber"                TEXT,                                            -- often unique; see index below
  "idCopy"                  TEXT,

  -- Loyalty
  "memberSince"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "travelPoints"            INTEGER NOT NULL DEFAULT 0 CHECK ("travelPoints" >= 0),
  "loyaltyTier"             TEXT NOT NULL DEFAULT 'Bronze'
                              REFERENCES "loyalty_tiers"("name") ON UPDATE CASCADE,

  -- Security & recovery (store only hashes for tokens)
  "passwordResetTokenHash"  TEXT,
  "passwordResetExpires"    TIMESTAMP(3),
  "emailVerificationTokenHash" TEXT,
  "emailVerificationExpires" TIMESTAMP(3),
  "failedLoginAttempts"     INTEGER NOT NULL DEFAULT 0 CHECK ("failedLoginAttempts" >= 0),
  "accountLockedUntil"      TIMESTAMP(3),
  "lastLoginAt"             TIMESTAMP(3),

  -- Account state
  "isDisabled"              BOOLEAN NOT NULL DEFAULT FALSE,
  "disabledReason"          TEXT,

  -- Timestamps
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "users" IS 'Core user info & authentication';
COMMENT ON COLUMN "users"."email" IS 'Case-insensitive unique';
COMMENT ON COLUMN "users"."password" IS 'BCrypt/Argon2 hash, never plain';
COMMENT ON COLUMN "users"."countryCode" IS 'ISO-3166-1 alpha-2';
COMMENT ON COLUMN "users"."passwordResetTokenHash" IS 'Hash of reset token';
COMMENT ON COLUMN "users"."emailVerificationTokenHash" IS 'Hash of verification token';

-- Helpful indexes & constraints
CREATE INDEX IF NOT EXISTS users_phone_idx          ON "users"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique
  ON "users"("phone") WHERE "phone" IS NOT NULL;                 -- if phone used for login
CREATE UNIQUE INDEX IF NOT EXISTS users_idnumber_unique
  ON "users"("idNumber") WHERE "idNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_userType_idx       ON "users"("userType");
CREATE INDEX IF NOT EXISTS users_isHost_idx         ON "users"("isHost");
CREATE INDEX IF NOT EXISTS users_emailVerified_idx  ON "users"("emailVerified");
CREATE INDEX IF NOT EXISTS users_phoneVerified_idx  ON "users"("phoneVerified");
CREATE INDEX IF NOT EXISTS users_kycCompleted_idx   ON "users"("kycCompleted");
CREATE INDEX IF NOT EXISTS users_loyaltyTier_idx    ON "users"("loyaltyTier");
CREATE INDEX IF NOT EXISTS users_createdAt_idx      ON "users"("createdAt");
CREATE INDEX IF NOT EXISTS users_lastLoginAt_idx    ON "users"("lastLoginAt");

-- ----------------------------
-- REFERRALS (codes) + REFERRAL USES (each redemption)
-- ----------------------------
CREATE TABLE IF NOT EXISTS "referrals" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "code"      TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS referrals_userId_idx ON "referrals"("userId");

CREATE TABLE IF NOT EXISTS "referral_uses" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "referralId" TEXT NOT NULL REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "usedBy"     TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "usedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("referralId","usedBy")
);

CREATE INDEX IF NOT EXISTS referral_uses_referralId_idx ON "referral_uses"("referralId");
CREATE INDEX IF NOT EXISTS referral_uses_usedBy_idx     ON "referral_uses"("usedBy");

-- ----------------------------
-- SESSIONS (store hashes)
-- ----------------------------
CREATE TABLE IF NOT EXISTS "sessions" (
  "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"           TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tokenHash"        TEXT NOT NULL UNIQUE,               -- hash of session token
  "refreshTokenHash" TEXT UNIQUE,                        -- hash of refresh token
  "expiresAt"        TIMESTAMP(3) NOT NULL,
  "ipAddress"        INET,                               -- clean IP type
  "userAgent"        TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_user_token_unique
  ON "sessions"("userId","tokenHash");
CREATE INDEX IF NOT EXISTS sessions_userId_idx    ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS sessions_expiresAt_idx ON "sessions"("expiresAt");

-- ----------------------------
-- OTP CODES
-- ----------------------------
CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "phone"     TEXT,
  "email"     CITEXT,
  "code"      CHAR(6) NOT NULL,
  "type"      "OtpType" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "verified"  BOOLEAN NOT NULL DEFAULT FALSE,
  "attempts"  INTEGER NOT NULL DEFAULT 0 CHECK ("attempts" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT otp_code_six_digits_chk CHECK ("code" ~ '^[0-9]{6}$')
);

CREATE INDEX IF NOT EXISTS otp_codes_userId_idx    ON "otp_codes"("userId");
CREATE INDEX IF NOT EXISTS otp_codes_phone_idx     ON "otp_codes"("phone");
CREATE INDEX IF NOT EXISTS otp_codes_email_idx     ON "otp_codes"("email");
CREATE INDEX IF NOT EXISTS otp_codes_type_idx      ON "otp_codes"("type");
CREATE INDEX IF NOT EXISTS otp_codes_verified_idx  ON "otp_codes"("verified");
CREATE INDEX IF NOT EXISTS otp_codes_expiresAt_idx ON "otp_codes"("expiresAt");

-- Prevent multiple simultaneous unverified, unexpired OTPs per channel/type
CREATE UNIQUE INDEX IF NOT EXISTS otp_unique_email_type_live
  ON "otp_codes"("email","type")
  WHERE "email" IS NOT NULL AND "verified" = FALSE AND "expiresAt" > NOW();

CREATE UNIQUE INDEX IF NOT EXISTS otp_unique_phone_type_live
  ON "otp_codes"("phone","type")
  WHERE "phone" IS NOT NULL AND "verified" = FALSE AND "expiresAt" > NOW();

-- ----------------------------
-- SOCIAL ACCOUNTS (NextAuth-compatible)
-- ----------------------------
CREATE TABLE IF NOT EXISTS "accounts" (
  "id"                 TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"             TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type"               TEXT NOT NULL,                 -- e.g., 'oauth'
  "provider"           TEXT NOT NULL,                 -- google, facebook, apple
  "providerAccountId"  TEXT NOT NULL,
  "refresh_token"      TEXT,
  "access_token"       TEXT,
  "expires_at"         INTEGER,
  "token_type"         TEXT,
  "scope"              TEXT,
  "id_token"           TEXT,
  "session_state"      TEXT,
  UNIQUE ("provider","providerAccountId")
);

CREATE INDEX IF NOT EXISTS accounts_userId_idx   ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS accounts_provider_idx ON "accounts"("provider");

-- ----------------------------
-- TRIGGERS: AUTO-UPDATE updatedAt
-- ----------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON "users";
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sessions_set_updated_at ON "sessions";
CREATE TRIGGER trg_sessions_set_updated_at
BEFORE UPDATE ON "sessions"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------
-- VIEWS
-- ----------------------------
CREATE OR REPLACE VIEW "user_summary" AS
SELECT
  u."id",
  u."firstName",
  u."lastName",
  u."email",
  u."phone",
  u."userType",
  u."isHost",
  u."emailVerified",
  u."phoneVerified",
  u."kycCompleted",
  u."travelPoints",
  u."loyaltyTier",
  u."memberSince",
  u."lastLoginAt",
  u."createdAt",
  COUNT(DISTINCT r."id") AS "referralCount",
  COUNT(DISTINCT s."id") AS "activeSessionsCount",
  COUNT(DISTINCT a."id") AS "connectedAccountsCount"
FROM "users" u
LEFT JOIN "referrals" r       ON u."id" = r."userId"
LEFT JOIN "sessions" s        ON u."id" = s."userId" AND s."expiresAt" > NOW()
LEFT JOIN "accounts" a        ON u."id" = a."userId"
GROUP BY u."id";

CREATE OR REPLACE VIEW "hosts" AS
SELECT
  u.*,
  COUNT(DISTINCT r."id") AS "referralCount"
FROM "users" u
LEFT JOIN "referrals" r ON u."id" = r."userId"
WHERE u."isHost" = TRUE OR u."userType" = 'HOST'
GROUP BY u."id";

CREATE OR REPLACE VIEW "guests" AS
SELECT
  u.*,
  COUNT(DISTINCT r."id") AS "referralCount"
FROM "users" u
LEFT JOIN "referrals" r ON u."id" = r."userId"
WHERE u."userType" = 'GUEST' AND u."isHost" = FALSE
GROUP BY u."id";

CREATE OR REPLACE VIEW "verified_users" AS
SELECT *
FROM "users"
WHERE "emailVerified" = TRUE AND "kycCompleted" = TRUE;

-- ----------------------------
-- FUNCTIONS (BUSINESS HELPERS)
-- ----------------------------
CREATE OR REPLACE FUNCTION can_become_host(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE r RECORD;
BEGIN
  SELECT "emailVerified","kycCompleted","isHost"
  INTO r FROM "users" WHERE "id" = user_id;
  IF r IS NULL THEN RETURN FALSE; END IF;
  RETURN r."emailVerified" AND r."kycCompleted" AND NOT r."isHost";
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upgrade_to_host(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT can_become_host(user_id) THEN
    RETURN FALSE;
  END IF;

  UPDATE "users"
  SET "isHost" = TRUE,
      "userType" = 'HOST',
      "updatedAt" = NOW()
  WHERE "id" = user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM "otp_codes"
  WHERE "expiresAt" < NOW() AND "verified" = FALSE;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM "sessions"
  WHERE "expiresAt" < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION lock_user_account(user_id TEXT, lock_duration_minutes INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE "users"
  SET "accountLockedUntil" = NOW() + (lock_duration_minutes || ' minutes')::interval,
      "updatedAt" = NOW()
  WHERE "id" = user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_account_locked(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE lock_until TIMESTAMP(3);
BEGIN
  SELECT "accountLockedUntil" INTO lock_until
  FROM "users" WHERE "id" = user_id;
  IF lock_until IS NULL THEN RETURN FALSE; END IF;
  RETURN lock_until > NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SAMPLE DATA INSERTION (Optional)
-- ================================================

-- Insert loyalty tier definitions (if needed)
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
-- COMMENTS ON TABLES AND COLUMNS
-- ================================================

COMMENT ON TABLE "users" IS 'Core user information and authentication data';
COMMENT ON TABLE "referrals" IS 'User referral codes and tracking';
COMMENT ON TABLE "sessions" IS 'User session management for authentication';
COMMENT ON TABLE "otp_codes" IS 'One-time passwords for verification processes';
COMMENT ON TABLE "accounts" IS 'Social authentication provider accounts (NextAuth.js)';

-- Users table comments
COMMENT ON COLUMN "users"."id" IS 'Unique user identifier (CUID)';
COMMENT ON COLUMN "users"."userType" IS 'User role: HOST (property owner) or GUEST (traveler)';
COMMENT ON COLUMN "users"."isHost" IS 'Boolean flag indicating if user can list properties';
COMMENT ON COLUMN "users"."travelPoints" IS 'Loyalty points earned through bookings and activities';
COMMENT ON COLUMN "users"."loyaltyTier" IS 'Current loyalty tier: Bronze, Silver, Gold, Platinum';
COMMENT ON COLUMN "users"."kycCompleted" IS 'Know Your Customer verification status';
COMMENT ON COLUMN "users"."failedLoginAttempts" IS 'Counter for security lockout mechanism';
COMMENT ON COLUMN "users"."accountLockedUntil" IS 'Timestamp until which account is locked';

-- OTP codes comments
COMMENT ON COLUMN "otp_codes"."type" IS 'Type of verification: PHONE_VERIFICATION, EMAIL_VERIFICATION, LOGIN, PASSWORD_RESET';
COMMENT ON COLUMN "otp_codes"."attempts" IS 'Number of verification attempts made';

-- Sessions comments
COMMENT ON COLUMN "sessions"."token" IS 'JWT session token';
COMMENT ON COLUMN "sessions"."refreshToken" IS 'Token used to refresh expired sessions';

-- ================================================
-- USERS SCHEMA COMPLETE
-- ================================================

-- Usage Instructions:
-- 1. Create a new PostgreSQL database
-- 2. Run this script to create all user-related tables
-- 3. Update your .env file with DATABASE_URL
-- 4. Use with your application's authentication system