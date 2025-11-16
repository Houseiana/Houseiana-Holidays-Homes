# Quick Database Setup - 5 Minutes

## Option 1: Free Cloud Database (Recommended for Vercel Deployment)

### Using Neon.tech (No credit card required)

1. **Create Neon Account** (2 minutes)
   - Visit: https://neon.tech
   - Sign up with GitHub (fastest)
   - Create project: `houseiana-holidays`
   - Select region: **US East (Ohio)**

2. **Copy Connection String**

   Neon will show you something like:
   ```
   postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

   **Copy this entire string!**

3. **Update .env.local**

   Open `.env.local` and replace line 14-15:
   ```bash
   DATABASE_URL="paste-your-neon-connection-string-here"
   DIRECT_URL="paste-your-neon-connection-string-here"
   ```

4. **Run Setup Script**
   ```bash
   ./setup-database.sh
   ```

   Or manually:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma studio
   ```

**Done! Your database is ready.** ✅

---

## Option 2: Local PostgreSQL (For local development only)

### macOS:
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb houseiana

# Update .env.local
DATABASE_URL="postgresql://postgres@localhost:5432/houseiana"
DIRECT_URL="postgresql://postgres@localhost:5432/houseiana"

# Setup
./setup-database.sh
```

### Windows:
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install and set password
3. Create database `houseiana` in pgAdmin
4. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/houseiana"
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/houseiana"
   ```
5. Run: `./setup-database.sh`

---

## Verify Database Setup

After setup, run:

```bash
# Open Prisma Studio
npx prisma studio
```

Your browser will open at: **http://localhost:5555**

You should see 5 tables:
- ✅ users
- ✅ sessions
- ✅ otp_codes
- ✅ accounts
- ✅ referrals

---

## Database Schema Overview

### users table (Main user accounts)
```
id                UUID (Primary Key)
email             String (Unique)
phone_number      String (Unique)
password_hash     String (Encrypted)
first_name        String
last_name         String
avatar            String (URL)
date_of_birth     DateTime
email_verified_at DateTime
phone_verified_at DateTime
is_host           Boolean
is_active         Boolean
loyalty_points    Integer
created_at        DateTime
updated_at        DateTime
```

### sessions table (User authentication)
```
id             UUID (Primary Key)
user_id        UUID (Foreign Key → users.id)
session_token  String (Unique)
access_token   String
expires_at     DateTime
created_at     DateTime
updated_at     DateTime
```

### otp_codes table (Verification codes)
```
id         UUID (Primary Key)
method     String ('email' | 'phone' | 'whatsapp')
recipient  String (Email or phone)
code       String (6 digits)
expires_at DateTime (5 minutes)
verified   Boolean
created_at DateTime
```

### accounts table (OAuth providers)
```
id                   UUID (Primary Key)
user_id              UUID (Foreign Key → users.id)
type                 String
provider             String (google, facebook, apple)
provider_account_id  String
refresh_token        String
access_token         String
expires_at           Integer
created_at           DateTime
updated_at           DateTime
```

### referrals table (Referral program)
```
id            UUID (Primary Key)
referrer_id   UUID (Foreign Key → users.id)
referred_id   UUID (Foreign Key → users.id)
referral_code String (Unique)
reward_points Integer
status        String
created_at    DateTime
```

---

## Test Your Database

### 1. View in Prisma Studio
```bash
npx prisma studio
```
Open: http://localhost:5555

### 2. Test Signup Flow
```bash
npm run dev
```
Open: http://localhost:3001

Try signing up with:
- Phone number (with OTP)
- Email (with OTP)

### 3. Check Database
After signup, refresh Prisma Studio to see:
- New user in `users` table
- OTP code in `otp_codes` table (with `verified: true`)
- Session in `sessions` table

---

## Deploy to Vercel

1. **Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables:**
   ```
   DATABASE_URL = your-neon-connection-string
   DIRECT_URL = your-neon-connection-string
   NEXTAUTH_URL = https://your-app.vercel.app
   NEXTAUTH_SECRET = generate-random-string
   JWT_SECRET = generate-random-string
   ```

3. **Redeploy** (Vercel will automatically run `prisma generate` and `prisma db push`)

---

## Troubleshooting

### "Can't reach database server"
- Check DATABASE_URL in `.env.local`
- Verify database is running
- Test connection: `npx prisma db execute --stdin <<< "SELECT NOW();"`

### "The server does not support SSL connections"
- Add `?sslmode=require` to your connection string
- Or use Neon.tech which includes SSL by default

### "P1001: Authentication failed"
- Double-check username and password in DATABASE_URL
- Ensure no extra spaces in connection string

### Prisma Studio not opening
- Check if port 5555 is already in use
- Try: `npx prisma studio --port 5556`

---

## Manual Setup Commands

If you prefer manual setup:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create database tables
npx prisma db push

# 3. View schema
npx prisma studio

# 4. Test database connection
npx prisma db execute --stdin <<< "SELECT NOW();"

# 5. View schema in terminal
npx prisma db pull
```

---

**That's it! Your database is ready for development and deployment.** 🎉

Need help? Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.
