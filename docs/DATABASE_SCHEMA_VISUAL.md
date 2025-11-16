# Houseiana Database Schema - Visual Reference

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS TABLE                           │
│                         (Central Entity)                         │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  UUID                                     │
│ UQ  email               VARCHAR(255)      ✓ Nullable            │
│ UQ  phone_number        VARCHAR(20)       ✓ Nullable            │
│     password_hash       VARCHAR(255)      BCRYPT                │
│     first_name          VARCHAR(100)      NOT NULL              │
│     last_name           VARCHAR(100)      NOT NULL              │
│     avatar              TEXT              ✓ Profile Photo URL   │
│     date_of_birth       DATE              ✓ Optional            │
│     email_verified_at   TIMESTAMP         ✓ Nullable            │
│     phone_verified_at   TIMESTAMP         ✓ Nullable            │
│     is_host             BOOLEAN           DEFAULT false         │
│     is_active           BOOLEAN           DEFAULT true          │
│     loyalty_points      INTEGER           DEFAULT 0             │
│     created_at          TIMESTAMP         DEFAULT NOW()         │
│     updated_at          TIMESTAMP         AUTO UPDATE           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌───────────────┐  ┌──────────────┐  ┌────────────────┐
        │   SESSIONS    │  │   ACCOUNTS   │  │   REFERRALS    │
        └───────────────┘  └──────────────┘  └────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                         SESSIONS TABLE                           │
│                    (User Authentication)                         │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  UUID                                     │
│ FK  user_id             UUID          → users.id                │
│ UQ  session_token       VARCHAR(255)  Unique JWT token          │
│     access_token        TEXT          ✓ Nullable                │
│     expires_at          TIMESTAMP     Session expiration        │
│     created_at          TIMESTAMP     DEFAULT NOW()             │
│     updated_at          TIMESTAMP     AUTO UPDATE               │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                         ACCOUNTS TABLE                           │
│                   (OAuth Provider Accounts)                      │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                   UUID                                    │
│ FK  user_id              UUID          → users.id               │
│     type                 VARCHAR(50)   'oauth'                  │
│     provider             VARCHAR(50)   'google'|'facebook'|...  │
│     provider_account_id  VARCHAR(255)  Provider's user ID       │
│     refresh_token        TEXT          ✓ Nullable               │
│     access_token         TEXT          ✓ Nullable               │
│     expires_at           INTEGER       ✓ Nullable               │
│     token_type           VARCHAR(50)   ✓ Nullable               │
│     scope                TEXT          ✓ Nullable               │
│     id_token             TEXT          ✓ Nullable               │
│     created_at           TIMESTAMP     DEFAULT NOW()            │
│     updated_at           TIMESTAMP     AUTO UPDATE              │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                        OTP_CODES TABLE                           │
│                  (Verification Code Storage)                     │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  UUID                                     │
│     method              VARCHAR(20)   'email'|'phone'|'whatsapp'│
│     recipient           VARCHAR(255)  Email or phone number     │
│     code                VARCHAR(10)   6-digit verification code │
│     expires_at          TIMESTAMP     5 minutes from creation   │
│     verified            BOOLEAN       DEFAULT false             │
│     created_at          TIMESTAMP     DEFAULT NOW()             │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                       REFERRALS TABLE                            │
│                   (Referral Program Tracking)                    │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  UUID                                     │
│ FK  referrer_id         UUID          → users.id (who invited)  │
│ FK  referred_id         UUID          → users.id (who joined)   │
│ UQ  referral_code       VARCHAR(50)   Unique invite code        │
│     reward_points       INTEGER       Points earned             │
│     status              VARCHAR(20)   'pending'|'completed'     │
│     created_at          TIMESTAMP     DEFAULT NOW()             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Relationships

```
┌──────────┐
│  USERS   │
└────┬─────┘
     │
     ├─────────────────────┬────────────────────┬─────────────────┐
     │                     │                    │                 │
     │ one-to-many         │ one-to-many        │ one-to-many     │
     ▼                     ▼                    ▼                 │
┌──────────┐         ┌──────────┐        ┌───────────┐           │
│ SESSIONS │         │ ACCOUNTS │        │ REFERRALS │           │
└──────────┘         └──────────┘        │ (referrer)│           │
                                         └───────────┘           │
                                                                 │
                                                                 │ one-to-many
                                                                 ▼
                                                          ┌───────────┐
                                                          │ REFERRALS │
                                                          │ (referred)│
                                                          └───────────┘
```

---

## Database Indexes (For Performance)

### users table:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_is_host ON users(is_host);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### sessions table:
```sql
CREATE UNIQUE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### otp_codes table:
```sql
CREATE INDEX idx_otp_recipient ON otp_codes(recipient);
CREATE INDEX idx_otp_code ON otp_codes(code);
CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_verified ON otp_codes(verified);
```

### accounts table:
```sql
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider);
CREATE UNIQUE INDEX idx_accounts_provider_account ON accounts(provider, provider_account_id);
```

### referrals table:
```sql
CREATE UNIQUE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);
```

---

## Data Flow Diagrams

### 1. User Signup Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. Submit phone/email
       ▼
┌─────────────────────┐
│  /api/auth/otp-send │
└──────┬──────────────┘
       │ 2. Generate OTP
       ▼
┌─────────────────────┐
│   OTP_CODES TABLE   │  (Store code, expires_at)
└──────┬──────────────┘
       │ 3. Send via Twilio/SendGrid
       ▼
┌─────────────┐
│     User    │  Receives OTP
└──────┬──────┘
       │ 4. Enter code
       ▼
┌───────────────────────┐
│ /api/auth/otp-verify  │
└──────┬────────────────┘
       │ 5. Verify code
       ▼
┌─────────────────────┐
│   OTP_CODES TABLE   │  (Update verified=true)
└──────┬──────────────┘
       │ 6. Code valid
       ▼
┌───────────────────────┐
│ /api/auth/otp-signup  │
└──────┬────────────────┘
       │ 7. Create user
       ▼
┌─────────────────────┐
│    USERS TABLE      │  (Insert new user)
└──────┬──────────────┘
       │ 8. Generate JWT
       ▼
┌─────────────────────┐
│  SESSIONS TABLE     │  (Create session)
└──────┬──────────────┘
       │ 9. Return token
       ▼
┌─────────────┐
│   Frontend  │  Redirect to /dashboard
└─────────────┘
```

### 2. User Login Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. Submit email + password
       ▼
┌─────────────────────┐
│  /api/auth/login    │
└──────┬──────────────┘
       │ 2. Find user by email
       ▼
┌─────────────────────┐
│    USERS TABLE      │  SELECT * WHERE email = ?
└──────┬──────────────┘
       │ 3. User found
       ▼
┌─────────────────────┐
│  bcrypt.compare()   │  Verify password hash
└──────┬──────────────┘
       │ 4. Password correct
       ▼
┌─────────────────────┐
│  jwt.sign()         │  Generate JWT token
└──────┬──────────────┘
       │ 5. Create session
       ▼
┌─────────────────────┐
│  SESSIONS TABLE     │  INSERT session
└──────┬──────────────┘
       │ 6. Return token
       ▼
┌─────────────┐
│   Frontend  │  Store token, redirect
└─────────────┘
```

### 3. OAuth Login Flow (Google/Facebook)

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. Click "Sign in with Google"
       ▼
┌─────────────────────┐
│   NextAuth OAuth    │
└──────┬──────────────┘
       │ 2. Redirect to Google
       ▼
┌─────────────┐
│   Google    │  User authorizes
└──────┬──────┘
       │ 3. Return with auth code
       ▼
┌─────────────────────┐
│   NextAuth OAuth    │  Exchange code for tokens
└──────┬──────────────┘
       │ 4. Get user profile
       ▼
┌─────────────────────┐
│    USERS TABLE      │  Find or create user
└──────┬──────────────┘
       │ 5. User exists/created
       ▼
┌─────────────────────┐
│  ACCOUNTS TABLE     │  Store OAuth tokens
└──────┬──────────────┘
       │ 6. Create session
       ▼
┌─────────────────────┐
│  SESSIONS TABLE     │  INSERT session
└──────┬──────────────┘
       │ 7. Return session
       ▼
┌─────────────┐
│   Frontend  │  Logged in!
└─────────────┘
```

---

## Sample Data Examples

### users table:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "phone_number": "+974XXXXXXXX",
  "password_hash": "$2a$10$xyz...",
  "first_name": "John",
  "last_name": "Doe",
  "avatar": "https://cdn.houseiana.com/avatars/john.jpg",
  "date_of_birth": "1990-01-15",
  "email_verified_at": "2025-11-14T10:30:00Z",
  "phone_verified_at": "2025-11-14T10:30:00Z",
  "is_host": false,
  "is_active": true,
  "loyalty_points": 100,
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

### sessions table:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_token": "ya29.a0AfH6...",
  "expires_at": "2025-11-21T10:30:00Z",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

### otp_codes table:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "method": "phone",
  "recipient": "+974XXXXXXXX",
  "code": "123456",
  "expires_at": "2025-11-14T10:35:00Z",
  "verified": true,
  "created_at": "2025-11-14T10:30:00Z"
}
```

### accounts table:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440333",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "oauth",
  "provider": "google",
  "provider_account_id": "1234567890",
  "refresh_token": "1//0gABCDEF...",
  "access_token": "ya29.a0AfH6...",
  "expires_at": 1700000000,
  "token_type": "Bearer",
  "scope": "openid profile email",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg4...",
  "created_at": "2025-11-14T10:30:00Z",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

### referrals table:
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440444",
  "referrer_id": "550e8400-e29b-41d4-a716-446655440000",
  "referred_id": "aa0e8400-e29b-41d4-a716-446655440555",
  "referral_code": "JOHN2025",
  "reward_points": 50,
  "status": "completed",
  "created_at": "2025-11-14T10:30:00Z"
}
```

---

## Database Constraints & Rules

### users table:
- ✓ Either `email` OR `phone_number` must be provided (not both nullable)
- ✓ `email` must be unique (case-insensitive)
- ✓ `phone_number` must be unique
- ✓ `password_hash` required (bcrypt, 10 rounds)
- ✓ `first_name` and `last_name` required
- ✓ `is_host` defaults to `false` (users are guests by default)
- ✓ `is_active` defaults to `true`
- ✓ `loyalty_points` defaults to `0`

### sessions table:
- ✓ `session_token` must be unique
- ✓ `user_id` must reference existing user
- ✓ `expires_at` must be in the future
- ✓ Cascade delete when user is deleted

### otp_codes table:
- ✓ `code` is 6 digits
- ✓ `expires_at` is 5 minutes from `created_at`
- ✓ `method` must be 'email', 'phone', or 'whatsapp'
- ✓ `verified` defaults to `false`
- ✓ Auto-delete codes older than 24 hours (cleanup job)

### accounts table:
- ✓ `provider` + `provider_account_id` must be unique together
- ✓ `user_id` must reference existing user
- ✓ Cascade delete when user is deleted

### referrals table:
- ✓ `referral_code` must be unique
- ✓ `referrer_id` and `referred_id` must reference different users
- ✓ `referrer_id` and `referred_id` must reference existing users
- ✓ `status` must be 'pending' or 'completed'
- ✓ Cascade delete when either user is deleted

---

**This schema is production-ready and optimized for the Houseiana platform.**

View it live in Prisma Studio: `npx prisma studio`
