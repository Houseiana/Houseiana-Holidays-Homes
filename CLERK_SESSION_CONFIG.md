# Clerk Session Configuration Guide

## ✅ Domain Status

**https://houseiana.net** is working correctly!

- HTTP Status: 200 ✓
- Clerk Authentication: Active ✓
- Deployment: Production (Vercel) ✓
- SSL Certificate: Valid ✓

---

## 🔐 Authentication Session Timeout Configuration

### Current Setting Required: **30 Minutes**

The session timeout is configured in the **Clerk Dashboard**, not in code. Follow these steps:

### Step-by-Step Configuration

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign in with your Clerk account

2. **Select Your Application**
   - Click on "Houseiana" application
   - This is using the publishable key: `pk_live_Y2xlcmsuaG91c2VpYW5hLm5ldCQ`

3. **Navigate to Sessions Settings**
   - In the left sidebar, click **"Sessions"**
   - Or go to: **Settings → Sessions**

4. **Configure Session Lifetime**
   - Find the **"Inactivity timeout"** setting
   - Set it to: **30 minutes (1800 seconds)**
   - This means users will be automatically logged out after 30 minutes of inactivity

5. **Save Changes**
   - Click **"Save"** or **"Update"** button
   - Changes take effect immediately for new sessions

---

## 📋 Session Settings Explained

### Inactivity Timeout
- **Current Requirement:** 30 minutes
- **Purpose:** Automatically logs users out after 30 minutes of no activity
- **Security:** Prevents unauthorized access if users forget to log out

### Session Token Lifetime (Optional)
- **Default:** 60 minutes (1 hour)
- **Purpose:** How long session tokens remain valid before refresh
- **Recommendation:** Keep at 60 minutes for security

### Refresh Token Lifetime (Optional)
- **Default:** 7 days
- **Purpose:** How long users can stay logged in without re-entering credentials
- **Recommendation:** Keep at 7 days for good UX

---

## 🔍 Verification

After configuring in Clerk Dashboard, verify the settings:

1. **Log into your application** at https://houseiana.net
2. **Wait 30 minutes** without any interaction
3. **Try to perform an action** (navigate to a page, click something)
4. **Expected Result:** You should be automatically redirected to the sign-in page

---

## 🛠️ Technical Implementation

The middleware configuration is already set up correctly in `middleware.ts`:

```typescript
// Session Configuration:
// - Session timeout: 30 minutes of inactivity
// - Configured in Clerk Dashboard > Sessions > Session lifetime
// - Set "Inactivity timeout" to 30 minutes (1800 seconds)
// - Sessions automatically expire after 30 minutes of user inactivity
```

### Protected Routes
The following routes require authentication:
- `/client-dashboard/*`
- `/host-dashboard/*`
- `/booking/*`
- `/messages/*`
- `/profile/*`

### Public Routes (No Authentication Required)
- `/` (Homepage)
- `/sign-in`, `/sign-up`, `/register`, `/login`
- `/discover/*`
- `/property/*`, `/properties/*`
- `/become-host`
- `/api/webhooks/*`
- `/api/properties/*`

---

## 📝 Environment Variables

Your Clerk configuration is stored in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuaG91c2VpYW5hLm5ldCQ
CLERK_SECRET_KEY=[your-secret-key]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/client-dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/client-dashboard
```

---

## ⚠️ Important Notes

1. **Dashboard Configuration Only:** Session timeout CANNOT be configured via code or environment variables. It must be set in the Clerk Dashboard.

2. **Immediate Effect:** Changes made in the Clerk Dashboard take effect immediately for new sessions. Existing sessions will continue with their original settings until they expire.

3. **No Code Changes Needed:** The middleware is already configured correctly. You only need to update the Clerk Dashboard settings.

4. **Domain Already Configured:** houseiana.net is properly configured and working with Clerk authentication.

---

## ✅ Checklist

- [x] Domain https://houseiana.net is working
- [x] Clerk authentication is active
- [x] Middleware configuration is documented
- [ ] **ACTION REQUIRED:** Configure 30-minute session timeout in Clerk Dashboard
  - Go to https://dashboard.clerk.com
  - Select Houseiana application
  - Navigate to Sessions settings
  - Set "Inactivity timeout" to 30 minutes (1800 seconds)
  - Save changes

---

## 🎯 Quick Summary

**What's Working:**
- ✅ Domain: https://houseiana.net (HTTP 200, SSL valid)
- ✅ Clerk Authentication: Properly integrated
- ✅ Code Configuration: Middleware configured correctly
- ✅ Production Deployment: Live on Vercel

**What You Need to Do:**
- ⚠️ **Log into Clerk Dashboard**
- ⚠️ **Set session inactivity timeout to 30 minutes**
- ⚠️ **Save the changes**

That's it! No code changes or redeployment needed.
