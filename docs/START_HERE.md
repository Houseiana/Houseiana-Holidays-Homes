# 🚀 START HERE - Database Setup

## Current Status

✅ Project is running at: http://localhost:3001
✅ OTP verification working (Email, SMS, WhatsApp)
✅ ID document requirement removed from signup
⚠️ **DATABASE NOT CONFIGURED** - Need to set up PostgreSQL

---

## Quick Setup (5 Minutes)

### Step 1: Create Free Database

**Option A: Neon.tech (Recommended - No credit card)**

1. Go to: https://neon.tech
2. Sign up with GitHub (fastest)
3. Create new project: `houseiana-holidays`
4. Copy the connection string shown (looks like):
   ```
   postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

**Option B: Supabase (Alternative)**

1. Go to: https://supabase.com
2. Sign up and create new project
3. Go to: Settings → Database → Connection String
4. Copy the "Connection Pooling" string

**Option C: Vercel Postgres (If deploying to Vercel)**

1. Go to: https://vercel.com/dashboard
2. Create new project or select existing
3. Go to: Storage → Create Database → Postgres
4. Copy the connection string

---

### Step 2: Update Environment Variables

Open this file: `.env.local`

Find lines 14-15 and replace with your connection string:

```bash
# BEFORE:
DATABASE_URL="postgresql://postgres:password@localhost:5432/houseiana"
DIRECT_URL="postgresql://postgres:password@localhost:5432/houseiana"

# AFTER (paste your Neon/Supabase connection string):
DATABASE_URL="postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**IMPORTANT**: Both URLs should be identical for Neon and Supabase.

---

### Step 3: Initialize Database

Run these commands in terminal:

```bash
# Navigate to project directory (if not already there)
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Option A: Use the automated setup script
./setup-database.sh

# Option B: Manual setup
npx prisma generate
npx prisma db push
npx prisma studio
```

**Expected Output:**
```
✓ Prisma Client generated successfully
✓ Database schema created successfully

Database Schema Created:
  • users - User accounts and authentication
  • sessions - User sessions and tokens
  • otp_codes - OTP verification codes
  • accounts - OAuth provider accounts
  • referrals - Referral program data
```

---

### Step 4: View Your Database

After setup, Prisma Studio will open in your browser:

**URL**: http://localhost:5555

You'll see 5 tables:
- ✅ **users** - Main user accounts
- ✅ **sessions** - Authentication sessions
- ✅ **otp_codes** - Verification codes
- ✅ **accounts** - OAuth providers (Google, Facebook, etc.)
- ✅ **referrals** - Referral tracking

---

## Test Everything

### 1. Restart Development Server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 2. Test Signup

Open: http://localhost:3001

1. Click "Sign Up"
2. Enter phone number or email
3. Verify OTP code
4. Fill in details (name, DOB, email, password)
5. Accept terms
6. Upload photo (optional - can skip!)
7. ✅ Done! You'll be redirected to /dashboard

### 3. Check Database

Open Prisma Studio: http://localhost:5555

After signup, you should see:
- New user in `users` table
- OTP code in `otp_codes` table (verified: true)
- Session in `sessions` table

---

## Troubleshooting

### "Can't reach database server"

**Fix**:
1. Check DATABASE_URL in `.env.local` is correct
2. Ensure no extra spaces in connection string
3. Verify connection string ends with `?sslmode=require`

Test connection:
```bash
npx prisma db execute --stdin <<< "SELECT NOW();"
```

### "The server does not support SSL connections"

**Fix**: Add `?sslmode=require` to end of DATABASE_URL:
```bash
DATABASE_URL="postgresql://...?sslmode=require"
```

### "P1001: Authentication failed"

**Fix**: Double-check username and password in connection string

### Port 5555 already in use (Prisma Studio)

**Fix**: Use different port:
```bash
npx prisma studio --port 5556
```

---

## Project File Structure

```
houseiana-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── otp-send/         # Send OTP codes
│   │   │   ├── otp-verify/       # Verify OTP codes
│   │   │   └── otp-signup/       # Create user account ✅ FIXED
│   │   ├── upload/               # File uploads
│   │   └── ...
│   ├── dashboard/                # User dashboard
│   ├── signup/                   # Signup flow ✅ FIXED
│   └── ...
├── components/
│   ├── auth/
│   │   ├── multi-step-signup/   # Signup steps
│   │   └── signup-modal.tsx
│   └── ...
├── lib/
│   ├── db.ts                    # Database client ✅ NEW
│   └── ...
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.local                   # Your environment variables ⚠️ UPDATE THIS
├── .env.example                 # Template
├── setup-database.sh            # Automated setup script ✅ NEW
├── DATABASE_SETUP.md            # Detailed guide
├── QUICK_DATABASE_SETUP.md      # Quick reference
├── DATABASE_SCHEMA_VISUAL.md    # Visual schema
└── START_HERE.md                # This file
```

---

## Next Steps After Database Setup

### 1. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Database configuration complete"
git push origin main

# Deploy to Vercel (automatic if connected to GitHub)
```

### 2. Add Environment Variables to Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these:
```
DATABASE_URL = your-neon-connection-string
DIRECT_URL = your-neon-connection-string
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = generate-random-string (use: openssl rand -base64 32)
JWT_SECRET = generate-random-string (use: openssl rand -base64 32)
TWILIO_ACCOUNT_SID = your-twilio-sid
TWILIO_AUTH_TOKEN = your-twilio-token
TWILIO_VERIFY_SERVICE_SID = your-verify-service-sid
SENDGRID_API_KEY = your-sendgrid-key
SENDGRID_FROM_EMAIL = info@houseiana.com
```

### 3. Redeploy

Vercel will automatically:
- Run `npm install`
- Run `npx prisma generate`
- Run `npx prisma db push`
- Build and deploy your app

---

## Documentation Reference

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Comprehensive database setup guide
- **[QUICK_DATABASE_SETUP.md](./QUICK_DATABASE_SETUP.md)** - Quick reference
- **[DATABASE_SCHEMA_VISUAL.md](./DATABASE_SCHEMA_VISUAL.md)** - Visual schema and ERD
- **[SIGNUP_FIXED.md](./SIGNUP_FIXED.md)** - ID document removal details
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Vercel deployment
- **[README.md](./README.md)** - Full project documentation

---

## Support

Need help? Check:
1. Troubleshooting sections in documentation
2. Prisma docs: https://www.prisma.io/docs
3. Neon docs: https://neon.tech/docs

---

**Ready to start? Follow the 3 steps above to set up your database!** 🚀

Current Status: ⚠️ **Need to configure DATABASE_URL in `.env.local`**

After setup: ✅ **Ready for development and deployment**
