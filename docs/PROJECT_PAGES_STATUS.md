# 📋 Houseiana Project - All Pages & Links

## 🏠 Homepage & Public Pages

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Homepage** | http://localhost:3001/ | ✅ Working | Landing page with property search |
| **Discover** | http://localhost:3001/discover | ✅ Working | Browse all properties |
| **Property Details** | http://localhost:3001/property/[id] | ✅ Working | View individual property |
| **Become a Host** | http://localhost:3001/become-host | ✅ Working | Host signup/onboarding |
| **Help Center** | http://localhost:3001/help | ✅ Working | Support & FAQs |

---

## 🔐 Authentication Pages

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Signup Modal** | Opens from header | ✅ Working | Phone/Email signup with OTP |
| **Login Modal** | Opens from header | ✅ Working | Email/Phone + Password login |
| **Login Page** | http://localhost:3001/login | ⚠️ Legacy | Old standalone page (not used) |
| **Signup Page** | http://localhost:3001/signup | ⚠️ Legacy | Old standalone page (not used) |
| **OTP Test** | http://localhost:3001/test-otp | 🧪 Testing | For OTP testing |

---

## 🎯 Dashboard Pages (NEED FIXING)

### Main Dashboards

| Page | URL | Status | Issue |
|------|-----|--------|-------|
| **Unified Dashboard** | http://localhost:3001/dashboard | ❌ **Broken** | Uses NextAuth (needs JWT) |
| **Host Dashboard** | http://localhost:3001/host-dashboard | ❌ **Broken** | Uses NextAuth (needs JWT) |
| **Client Dashboard** | http://localhost:3001/client-dashboard | ❌ **Broken** | Uses NextAuth (needs JWT) |

### Why Dashboards Don't Work:
```typescript
// ❌ PROBLEM: These pages use NextAuth
import { useSession, signOut } from 'next-auth/react';

const { data: session, status } = useSession(); // This won't work!

// ✅ SOLUTION: Need to use JWT auth from localStorage
const [user, setUser] = useState(null);

useEffect(() => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('auth_user');
  if (token && userData) {
    setUser(JSON.parse(userData));
  }
}, []);
```

---

## 📁 Sub-Pages & Features

### Booking Flow

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Booking Confirm** | http://localhost:3001/booking/confirm | ✅ Working | Confirm reservation |
| **Booking Success** | http://localhost:3001/booking/success | ✅ Working | Booking confirmation |

### User Features

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **My Trips** | http://localhost:3001/my-trips | ⚠️ Needs Auth | View all bookings |
| **Saved Properties** | http://localhost:3001/saved-properties | ⚠️ Needs Auth | Wishlist/favorites |
| **Messages Inbox** | http://localhost:3001/messages-inbox | ⚠️ Needs Auth | Host/Guest messaging |
| **Recommendations** | http://localhost:3001/recommendations | ⚠️ Needs Auth | AI-powered suggestions |

### Host Features

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Add Listing** | http://localhost:3001/host-dashboard/add-listing | ❌ **Broken** | Create new property |

### Support

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Contact Support** | http://localhost:3001/contact-support | ✅ Working | Help & support |
| **Unauthorized** | http://localhost:3001/unauthorized | ✅ Working | Access denied page |

### Testing Pages

| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Test Railway** | http://localhost:3001/test-railway | 🧪 Testing | Railway API test |

---

## 🔧 Files That Need Fixing

### Priority 1: Dashboard Pages (Critical)

1. **[app/dashboard/page.tsx](app/dashboard/page.tsx)** - Line 4
   ```typescript
   // ❌ Remove this
   import { useSession, signOut } from 'next-auth/react';

   // ✅ Add this
   import { useState, useEffect } from 'react';
   ```

2. **[app/host-dashboard/page.tsx](app/host-dashboard/page.tsx)**
   - Remove NextAuth imports
   - Use localStorage + JWT auth

3. **[app/client-dashboard/page.tsx](app/client-dashboard/page.tsx)** - Line 8
   ```typescript
   // ❌ Remove this
   import { signOut } from 'next-auth/react';
   ```

### Priority 2: Protected Pages

These pages need to check JWT authentication:

- [app/my-trips/page.tsx](app/my-trips/page.tsx)
- [app/saved-properties/page.tsx](app/saved-properties/page.tsx)
- [app/messages-inbox/page.tsx](app/messages-inbox/page.tsx)
- [app/recommendations/page.tsx](app/recommendations/page.tsx)
- [app/host-dashboard/add-listing/page.tsx](app/host-dashboard/add-listing/page.tsx)

---

## 📊 Current Authentication Status

### ✅ What's Working:

- JWT-based authentication in API routes
- Login Modal with JWT storage
- Signup Modal with JWT storage
- Header navigation with JWT auth state
- Middleware protecting routes with JWT cookies
- OTP verification (SMS/WhatsApp/Email)

### ❌ What's Broken:

- Dashboard pages (still using NextAuth)
- Host dashboard (still using NextAuth)
- Client dashboard (still using NextAuth)
- Any component importing from 'next-auth/react'

---

## 🎯 Quick Fix Plan

### Step 1: Fix Main Dashboard
Replace NextAuth auth check with JWT:

```typescript
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (!token || !userData) {
      router.push('/?auth=signin');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName || 'User'}!</h1>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
```

### Step 2: Fix Host Dashboard
Same approach - replace NextAuth with JWT auth.

### Step 3: Fix Client Dashboard
Same approach - replace NextAuth with JWT auth.

---

## 🌐 Navigation Links (From Header)

Based on [components/layout/header.tsx](components/layout/header.tsx:273-284):

### When NOT Logged In:
- **Sign up** → Opens SignupModal
- **Log in** → Opens LoginModal
- **Become a Host** → /become-host
- **Houseiana your home** → (Button, needs link)
- **Host an experience** → (Button, needs link)
- **Help Center** → /help

### When Logged In:
- **My Dashboard** → /dashboard (❌ Currently broken)
- **Sign out** → Clears auth and redirects to homepage
- **Become a Host** → /become-host
- **Houseiana your home** → (Button, needs link)
- **Host an experience** → (Button, needs link)
- **Help Center** → /help

---

## 🚀 Complete URL Map

```
ROOT: http://localhost:3001

PUBLIC PAGES:
├── /                           ✅ Homepage
├── /discover                   ✅ Browse properties
├── /property/[id]              ✅ Property details
├── /become-host                ✅ Host onboarding
├── /help                       ✅ Help center
├── /contact-support            ✅ Support page
├── /unauthorized               ✅ Access denied

AUTHENTICATION (Modals):
├── Login Modal                 ✅ From header
└── Signup Modal                ✅ From header

LEGACY AUTH PAGES (Not used):
├── /login                      ⚠️ Old page
└── /signup                     ⚠️ Old page

PROTECTED PAGES (Need Auth Fix):
├── /dashboard                  ❌ BROKEN - Uses NextAuth
├── /host-dashboard             ❌ BROKEN - Uses NextAuth
│   └── /add-listing            ❌ BROKEN - Child of broken page
├── /client-dashboard           ❌ BROKEN - Uses NextAuth
├── /my-trips                   ⚠️ Needs JWT auth check
├── /saved-properties           ⚠️ Needs JWT auth check
├── /messages-inbox             ⚠️ Needs JWT auth check
└── /recommendations            ⚠️ Needs JWT auth check

BOOKING FLOW:
├── /booking/confirm            ✅ Booking confirmation
└── /booking/success            ✅ Booking success

TESTING:
├── /test-otp                   🧪 OTP testing
└── /test-railway               🧪 Railway API test
```

---

## 📌 Summary

### Total Pages: 20+

- **Working**: 9 pages
- **Broken (NextAuth)**: 3 critical dashboards
- **Need Auth**: 4 protected pages
- **Legacy**: 2 old auth pages
- **Testing**: 2 test pages

### Critical Issue:

The main dashboards (/dashboard, /host-dashboard, /client-dashboard) are still using NextAuth, but your authentication system has been completely rebuilt with JWT. These pages will fail because NextAuth session doesn't exist anymore.

### Solution:

Replace all NextAuth imports in dashboard pages with JWT-based authentication using localStorage + cookies (same pattern as the header component).

---

## 🔗 Quick Navigation

**Try These Links Now** (After login):

1. http://localhost:3001/ - Homepage ✅
2. http://localhost:3001/discover - Browse properties ✅
3. http://localhost:3001/become-host - Become a host ✅
4. http://localhost:3001/help - Help center ✅
5. http://localhost:3001/dashboard - **Will be broken** ❌
6. http://localhost:3001/host-dashboard - **Will be broken** ❌
7. http://localhost:3001/client-dashboard - **Will be broken** ❌

**After I fix the dashboards, all links will work!**
