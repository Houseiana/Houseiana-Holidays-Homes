# Railway Backend Integration Guide

This guide explains how to connect your Houseiana Next.js frontend to the C# backend deployed on Railway.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Getting Your Railway Backend URL](#getting-your-railway-backend-url)
- [Environment Configuration](#environment-configuration)
- [API Client Usage](#api-client-usage)
- [Testing the Connection](#testing-the-connection)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Houseiana application uses a hybrid architecture:

- **Frontend**: Next.js 14 with React (deployed on Vercel or other platform)
- **Backend**: C# ASP.NET Core API (deployed on Railway)
- **Database**: PostgreSQL (Neon for frontend OTP/auth, separate DB for backend)

The frontend communicates with the Railway backend through REST APIs and WebSocket connections.

---

## Quick Start

### 1. Get Your Railway Deployment URL

1. Go to your Railway project: [https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894](https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894)
2. Click on your backend service
3. Go to the **Settings** tab
4. Under **Domains**, you'll see your Railway domain (e.g., `https://houseiana-backend-production.up.railway.app`)
5. Copy this URL

### 2. Update Environment Variables

Open your `.env.local` file and update these variables:

```bash
# Replace with your actual Railway URL
NEXT_PUBLIC_API_URL="https://your-backend.up.railway.app/api/v1.0"
API_URL="https://your-backend.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://your-backend.up.railway.app"
```

### 3. Restart Your Development Server

```bash
npm run dev
```

Your frontend is now connected to the Railway backend!

---

## Getting Your Railway Backend URL

### Method 1: From Railway Dashboard

1. Login to [Railway](https://railway.app)
2. Navigate to your project
3. Click on your backend service
4. Go to **Settings** → **Domains**
5. Copy the domain URL

### Method 2: From Railway CLI

```bash
# Install Railway CLI if you haven't
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get the domain
railway domain
```

### Method 3: From Environment Variables in Railway

Your Railway backend should have a `PUBLIC_URL` or `RAILWAY_PUBLIC_DOMAIN` environment variable. Check the Variables tab in your Railway service.

---

## Environment Configuration

### Development (.env.local)

```bash
# Railway Backend
NEXT_PUBLIC_API_URL="https://your-backend.up.railway.app/api/v1.0"
API_URL="https://your-backend.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://your-backend.up.railway.app"

# Database (Neon PostgreSQL for frontend)
DATABASE_URL="postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"

# Authentication
JWT_SECRET="your-jwt-secret-key-must-match-backend"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Twilio (for OTP)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_VERIFY_SERVICE_SID="your-verify-service-sid"

# SendGrid (for email OTP)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="info@houseiana.com"
```

### Production (Vercel Environment Variables)

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same variables as above
4. Set them for **Production**, **Preview**, and **Development** environments

Or use the Vercel CLI:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Paste your Railway URL when prompted
```

---

## API Client Usage

The project includes a Railway-specific API client at `lib/railway-api.ts`.

### Importing the Client

```typescript
import { railwayApi } from '@/lib/railway-api';
```

### Authentication Examples

```typescript
// Register a new user
const response = await railwayApi.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
const loginResponse = await railwayApi.login({
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

// Get current user
const user = await railwayApi.getCurrentUser();

// Logout
await railwayApi.logout();
```

### Properties Examples

```typescript
// Get all properties
const properties = await railwayApi.getProperties({
  location: 'New York',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05',
  guests: 2
});

// Get single property
const property = await railwayApi.getProperty('property-id');

// Create property (host only)
const newProperty = await railwayApi.createProperty({
  title: 'Beautiful Apartment',
  description: 'A lovely place to stay',
  propertyType: 'apartment',
  basePrice: 150,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1
});
```

### Bookings Examples

```typescript
// Create a booking
const booking = await railwayApi.createBooking({
  propertyId: 'property-id',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05',
  guests: 2,
  adults: 2,
  children: 0
});

// Get user's bookings
const bookings = await railwayApi.getBookings({
  role: 'guest',
  status: 'confirmed'
});
```

### Error Handling

```typescript
try {
  const properties = await railwayApi.getProperties();
} catch (error: any) {
  console.error('Error:', error.message);
  console.error('Status:', error.status);
  console.error('Details:', error.details);
}
```

---

## Testing the Connection

### 1. Create a Test Page

Create `app/test-railway/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { railwayApi } from '@/lib/railway-api';

export default function TestRailwayPage() {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const isHealthy = await railwayApi.healthCheck();
      setStatus(isHealthy ? '✅ Connected to Railway backend!' : '❌ Backend unhealthy');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Railway Backend Connection Test</h1>
      <p className="mb-4">Backend URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      <p className="mt-4">{status}</p>
    </div>
  );
}
```

### 2. Visit the Test Page

Navigate to `http://localhost:3000/test-railway` and click "Test Connection".

### 3. Check Browser Console

Open browser developer tools (F12) and check the Console tab for detailed logs:

- `🚂 Railway API configured: [URL]` - Shows the configured backend URL
- `🚀 Railway API Request: GET /health` - Request logs
- `✅ Railway API Response: 200` - Successful responses
- `❌ Railway API Error [status]:` - Error details

---

## Troubleshooting

### Issue: "Cannot connect to server"

**Possible causes:**
1. Railway backend is not deployed or is down
2. Incorrect URL in environment variables
3. CORS issues

**Solutions:**
1. Check Railway dashboard to ensure backend is running
2. Verify the URL in `.env.local` matches your Railway domain
3. Ensure backend has CORS configured to allow your frontend domain

### Issue: "Unauthorized" errors

**Possible causes:**
1. JWT secret mismatch between frontend and backend
2. Token expired
3. Invalid token format

**Solutions:**
1. Ensure `JWT_SECRET` matches between frontend and backend
2. Try logging in again to get a fresh token
3. Check token format in localStorage

### Issue: CORS errors in browser

**Error message:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
Your C# backend needs to configure CORS. In your backend `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://your-frontend.vercel.app"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Use CORS
app.UseCors("AllowFrontend");
```

### Issue: Railway backend URL not found

**Steps to find your URL:**

1. Go to Railway project dashboard
2. Click your backend service
3. Go to Settings → Domains
4. If no domain exists, click "Generate Domain"
5. Copy the generated URL

### Issue: Environment variables not updating

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

### Issue: 404 errors for API endpoints

**Check:**
1. API endpoint path matches backend routes
2. Backend base path is `/api/v1.0` (check backend configuration)
3. Check backend logs in Railway for request details

**View Railway logs:**
```bash
railway logs
```

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## Need Help?

If you encounter issues:

1. Check Railway service logs in the dashboard
2. Check browser console for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure backend is deployed and running on Railway
5. Test backend endpoints directly using Postman or curl

---

## Summary Checklist

- [ ] Get Railway backend URL from dashboard
- [ ] Update `.env.local` with Railway URL
- [ ] Restart development server
- [ ] Test connection using test page
- [ ] Verify CORS configuration on backend
- [ ] Deploy frontend with updated environment variables
- [ ] Test end-to-end flow (signup, login, API calls)

---

**Last Updated:** October 2025
**Project:** Houseiana Full Stack Application
