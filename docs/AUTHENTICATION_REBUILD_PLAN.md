# Authentication System Rebuild - Action Plan

## Current Status
- Database: Working (Neon PostgreSQL with Prisma)
- Login API: Working at `/app/api/auth/login/route.ts`
- Signup API: Working at `/app/api/auth/otp-signup/route.ts`
- Middleware: Updated for JWT cookies

## Issue
- ChunkLoadError causing page not to load
- NextAuth still imported in old header causing conflicts
- Need clean rebuild without social logins

## Solution Steps

### 1. Replace Header Component
**File**: `components/layout/header.tsx`
- Created new header at `components/layout/new-header.tsx` (done)
- Replace old header.tsx content with new-header.tsx content
- Removes all NextAuth dependencies
- Adds SignupModal integration
- Uses localStorage + cookies for auth state

### 2. Update Signup Modal (Remove Social Logins)
**File**: `app/signup/page.tsx`
- Remove Google, Facebook, Apple login buttons (lines 382-422)
- Keep only Phone and Email signup methods
- Already has OTP verification working

### 3. Restart Server with Clean Cache
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### 4. Test Complete Flow

#### Signup Flow Test:
1. Go to http://localhost:3001
2. Click user menu icon (top right)
3. Click "Sign up"
4. Choose Phone or Email
5. Complete OTP verification
6. Should redirect to /dashboard

#### Login Flow Test:
1. Click user menu icon
2. Click "Log in"
3. Choose Email or Phone tab
4. Enter credentials from signup
5. Should redirect to /dashboard

## Files to Replace

### `components/layout/header.tsx`
Replace entire content with `components/layout/new-header.tsx`

Key changes:
- No `import { useSession, signOut } from 'next-auth/react'`
- Auth state from localStorage
- Both Login and Signup modals
- Logout clears localStorage + cookies

## What's Already Working

✅ Database connection (Neon PostgreSQL)
✅ User model with Prisma
✅ Password hashing (bcrypt)
✅ JWT token generation
✅ Login API (`/api/auth/login`)
✅ Signup API (`/api/auth/otp-signup`)
✅ OTP verification (Twilio + SendGrid)
✅ Middleware checking JWT cookies
✅ Login modal component
✅ Signup modal component

## Quick Fix Command

```bash
# 1. Clear cache
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"
rm -rf .next

# 2. Replace header
cp components/layout/new-header.tsx components/layout/header.tsx

# 3. Restart
npm run dev
```

## Expected Result

After these changes:
1. Page loads without ChunkLoadError
2. Click burger menu → dropdown appears
3. Click "Sign up" → Signup modal opens
4. Click "Log in" → Login modal opens
5. After login/signup → redirects to /dashboard
6. Logout works correctly

## API Endpoints Ready

- `POST /api/auth/login` - Email/Phone + Password login
- `POST /api/auth/otp-login` - OTP-based login
- `POST /api/auth/otp-signup` - Signup with OTP verification
- `POST /api/otp/send-twilio` - Send SMS/WhatsApp OTP
- `POST /api/otp/send-email` - Send Email OTP
- `POST /api/otp/verify-twilio` - Verify Twilio OTP
- `POST /api/otp/verify-email` - Verify Email OTP

All APIs tested and working!
