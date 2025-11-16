# PostgreSQL Database Setup Guide

## Quick Setup with Neon.tech (Recommended - Free Tier)

Neon.tech provides a free PostgreSQL database with:
- 0.5 GB storage (sufficient for development)
- Proper SSL support (required by our app)
- No credit card required
- Perfect for Vercel deployment

### Step 1: Create Neon Account

1. Go to: https://neon.tech
2. Click "Sign Up" (use GitHub for fastest setup)
3. Create a new project named: `houseiana-holidays`
4. Select region: **US East (Ohio)** (closest to Vercel's default region)

### Step 2: Get Connection String

After creating the project, Neon will show you a connection string like:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**IMPORTANT**: Copy this connection string immediately - you'll need it for both `DATABASE_URL` and `DIRECT_URL`.

### Step 3: Update .env.local

Open `.env.local` and replace the database URLs:

```bash
# Replace these lines:
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Note**: Both URLs should be identical for Neon.

### Step 4: Initialize Database

Run these commands in order:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database (creates all tables)
npx prisma db push

# 3. Open Prisma Studio to view schema
npx prisma studio
```

**Expected output from `npx prisma db push`:**
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb"

🚀 Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client
```

### Step 5: View Schema in Prisma Studio

After running `npx prisma studio`, your browser will open at: http://localhost:5555

You'll see all database tables:
- **users** - User accounts and authentication
- **sessions** - Active user sessions
- **otp_codes** - OTP verification codes
- **accounts** - OAuth provider accounts
- **referrals** - Referral program data

---

## Alternative: Local PostgreSQL Setup

If you prefer running PostgreSQL locally:

### macOS (using Homebrew):

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb houseiana

# Update .env.local
DATABASE_URL="postgresql://postgres@localhost:5432/houseiana"
DIRECT_URL="postgresql://postgres@localhost:5432/houseiana"
```

### Windows (using PostgreSQL installer):

1. Download: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 15
3. During installation, set password for `postgres` user
4. Create database using pgAdmin or command line:
   ```bash
   createdb -U postgres houseiana
   ```
5. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/houseiana"
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/houseiana"
   ```

---

## Database Schema Overview

Our Prisma schema includes these tables:

### 1. **users** table
Core user account data:
- `id` - UUID primary key
- `email` - Unique email address
- `phone_number` - Unique phone number
- `password_hash` - Encrypted password
- `first_name`, `last_name` - User names
- `avatar` - Profile photo URL
- `date_of_birth` - User's birthdate
- `email_verified_at`, `phone_verified_at` - Verification timestamps
- `is_host` - Boolean (guest vs host)
- `is_active` - Account status
- `loyalty_points` - Rewards system
- `created_at`, `updated_at` - Timestamps

### 2. **sessions** table
User authentication sessions:
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `session_token` - Unique session identifier
- `access_token` - JWT access token
- `expires_at` - Session expiration
- `created_at`, `updated_at` - Timestamps

### 3. **otp_codes** table
OTP verification codes:
- `id` - UUID primary key
- `method` - 'email' | 'phone' | 'whatsapp'
- `recipient` - Email or phone number
- `code` - 6-digit verification code
- `expires_at` - Code expiration (5 minutes)
- `verified` - Boolean (has been used)
- `created_at` - Timestamp

### 4. **accounts** table
OAuth provider accounts (Google, Apple, etc.):
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `type` - Account type
- `provider` - OAuth provider name
- `provider_account_id` - Provider's user ID
- `refresh_token`, `access_token` - OAuth tokens
- `expires_at` - Token expiration

### 5. **referrals** table
Referral program tracking:
- `id` - UUID primary key
- `referrer_id` - User who referred
- `referred_id` - User who was referred
- `referral_code` - Unique referral code
- `reward_points` - Points earned
- `status` - Referral status
- `created_at` - Timestamp

---

## Verifying Database Connection

After setting up the database, test the connection:

```bash
# Test Prisma connection
npx prisma db execute --stdin <<< "SELECT NOW();"
```

**Expected output:**
```
PostgreSQL connection successful!
```

---

## Troubleshooting

### Error: "The server does not support SSL connections"

**Solution**: Use Neon.tech or ensure your connection string includes `?sslmode=require`

### Error: "Can't reach database server"

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify database is running (for local setup)
3. Check firewall/network settings
4. Ensure connection string includes proper SSL mode

### Error: "P1001: Can't reach database"

**Solutions**:
1. For Neon: Check your internet connection
2. For local: Ensure PostgreSQL service is running
3. Verify port 5432 is not blocked

---

## Next Steps

After database setup:

1. **Test Signup Flow**: http://localhost:3001
2. **Check Prisma Studio**: http://localhost:5555
3. **Deploy to Vercel**: Add DATABASE_URL to Vercel environment variables

---

## Production Deployment (Vercel)

When deploying to Vercel:

1. **Neon Dashboard** → Copy connection string
2. **Vercel Dashboard** → Your Project → Settings → Environment Variables
3. Add variable:
   - Key: `DATABASE_URL`
   - Value: `postgresql://...?sslmode=require`
4. Add variable:
   - Key: `DIRECT_URL`
   - Value: Same as DATABASE_URL
5. Redeploy your project

**Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Database Maintenance

### View all users:
```bash
npx prisma studio
# Navigate to 'users' table
```

### Reset database (⚠️ deletes all data):
```bash
npx prisma db push --force-reset
```

### Create database backup:
```bash
# For Neon: Use Neon dashboard → Backups
# For local: pg_dump houseiana > backup.sql
```

---

**Your database is ready! Run `npx prisma studio` to explore the schema.**
