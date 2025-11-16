# Vercel + Railway Backend Configuration Guide

## 🎯 Overview

This guide shows how to update your Vercel frontend deployment to use the Railway C# backend for ALL data operations.

**Architecture:**
- **Frontend**: Next.js on Vercel
- **Backend**: C# API on Railway (handles ALL data)
- **Database**: PostgreSQL on Railway (backend only)

---

## 📋 Railway Backend Details

### Public URLs
- **API Base:** `https://houseianabackend-production.up.railway.app/api/v1.0`
- **WebSocket:** `https://houseianabackend-production.up.railway.app`

### Private URLs (Railway Internal)
- **Backend:** `houseiana_backend.railway.internal`
- **Database:** `postgres.railway.internal:5432`

### Database Credentials
```
Host: postgres.railway.internal
Port: 5432
Database: railway
Username: postgres
Password: StplYBmRJbgXXqCiTzNYlOESzvbpPyDn
```

**⚠️ IMPORTANT:** The frontend should NEVER access the database directly. All data operations go through the Railway backend API.

---

## 🔧 Step 1: Update Vercel Environment Variables

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select project: `houseiana-nextjs`
   - Go to Settings → Environment Variables

2. **Update these variables for Production:**

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://houseianabackend-production.up.railway.app/api/v1.0` | Public backend API |
| `API_URL` | `https://houseianabackend-production.up.railway.app/api/v1.0` | Server-side API |
| `SOCKET_IO_URL` | `https://houseianabackend-production.up.railway.app` | WebSocket connection |
| `DATABASE_URL` | `postgresql://postgres:StplYBmRJbgXXqCiTzNYlOESzvbpPyDn@postgres.railway.internal:5432/railway` | Backend database (not used by frontend) |

3. **Keep existing variables:**
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (update to your Vercel domain)
   - JWT_SECRET (must match backend)
   - TWILIO_* variables
   - SENDGRID_* variables
   - STRIPE_* variables

### Option B: Using Vercel CLI

Due to interactive prompts, manual update is easier. But here's the command format:

```bash
# Navigate to project
cd "/path/to/houseiana-nextjs"

# Update each variable (will prompt for confirmation)
echo "https://houseianabackend-production.up.railway.app/api/v1.0" | vercel env add NEXT_PUBLIC_API_URL production

# Repeat for each variable...
```

---

## 📝 Step 2: Update Local Configuration

Your `.env.local` has been updated with:

```bash
# Railway Backend URLs
NEXT_PUBLIC_API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://houseianabackend-production.up.railway.app"

# Database (Backend only - Frontend doesn't use this directly)
DATABASE_URL="postgresql://postgres:StplYBmRJbgXXqCiTzNYlOESzvbpPyDn@postgres.railway.internal:5432/railway"
```

---

## 🚀 Step 3: Redeploy Vercel

### Method 1: Automatic Deployment (Recommended)

```bash
# Commit and push changes
git add .
git commit -m "Update to Railway backend URLs"
git push origin main

# Vercel will automatically deploy
```

### Method 2: Manual Deployment

```bash
# Deploy with Vercel CLI
cd "/path/to/houseiana-nextjs"
vercel --prod
```

---

## ✅ Step 4: Verify the Setup

1. **Check Deployment:**
   - Visit your Vercel URL
   - Check browser console (F12) for API calls
   - Look for requests to `houseianabackend-production.up.railway.app`

2. **Test Railway Connection:**
   - Visit: `https://your-vercel-app.vercel.app/test-railway`
   - Click "Run All Tests"
   - All tests should pass ✅

3. **Test Features:**
   - Try signing up/logging in
   - Check if data is saved (via Railway backend)
   - Test property listings
   - Test bookings

---

## 🔐 Security Notes

### Frontend Configuration

✅ **Frontend SHOULD:**
- Call Railway backend API for all data operations
- Use `NEXT_PUBLIC_API_URL` for client-side API calls
- Use `API_URL` for server-side API calls
- Handle authentication tokens
- Display data from API responses

❌ **Frontend should NOT:**
- Access database directly
- Execute SQL queries
- Handle business logic
- Store sensitive data

### Backend Responsibilities

The Railway backend handles:
- ✅ Database operations (CRUD)
- ✅ Authentication & authorization
- ✅ Business logic
- ✅ Data validation
- ✅ API endpoints
- ✅ WebSocket connections

---

## 📊 API Endpoints (Railway Backend)

### Authentication
```
POST /api/v1.0/auth/register
POST /api/v1.0/auth/login
POST /api/v1.0/auth/logout
GET  /api/v1.0/auth/me
```

### Properties
```
GET    /api/v1.0/properties
GET    /api/v1.0/properties/:id
POST   /api/v1.0/properties
PUT    /api/v1.0/properties/:id
DELETE /api/v1.0/properties/:id
```

### Bookings
```
GET  /api/v1.0/bookings
POST /api/v1.0/bookings
GET  /api/v1.0/bookings/:id
PATCH /api/v1.0/bookings/:id
```

### Payments
```
POST /api/v1.0/payments/create-intent
POST /api/v1.0/payments/:id/confirm
```

### Messages
```
GET  /api/v1.0/messages/conversations
GET  /api/v1.0/messages/conversations/:id/messages
POST /api/v1.0/messages/send
```

---

## 🐛 Troubleshooting

### Issue: API calls failing

**Check:**
1. Railway backend is running
2. Environment variables are correct
3. CORS is configured on backend
4. Network tab in browser shows requests

**Solution:**
```javascript
// Check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should show: https://houseianabackend-production.up.railway.app/api/v1.0
```

### Issue: Database connection errors

**Remember:** Frontend should NOT connect to database!

If you see database errors in frontend:
1. Remove direct database calls from frontend code
2. Use Railway API instead
3. Check that you're using `railwayApi` client

### Issue: CORS errors

**Solution:** Configure CORS in Railway backend:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel", policy =>
    {
        policy.WithOrigins(
            "https://your-app.vercel.app",
            "http://localhost:3000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

app.UseCors("AllowVercel");
```

---

## 📚 Files Updated

1. `.env.local` - Updated with Railway backend URLs ✅
2. `lib/railway-api.ts` - API client for Railway backend ✅
3. `app/test-railway/page.tsx` - Test page for verification ✅

---

## 🎯 Quick Verification Checklist

- [ ] Vercel environment variables updated
- [ ] `.env.local` updated with Railway URLs
- [ ] Code pushed to GitHub
- [ ] Vercel redeployed
- [ ] Test page accessible
- [ ] API calls going to Railway backend
- [ ] No direct database access from frontend
- [ ] Authentication working
- [ ] Data loading from backend

---

## 🔗 Important Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Project:** https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs
- **Railway Project:** https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894
- **Railway Backend:** https://houseianabackend-production.up.railway.app

---

## 📞 Next Steps

1. **Update Vercel environment variables** (via dashboard)
2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Configure Railway backend integration"
   git push origin main
   ```
3. **Wait for Vercel deployment** (2-3 minutes)
4. **Test at:** `https://your-vercel-app.vercel.app/test-railway`

---

**Last Updated:** October 28, 2025
**Status:** ✅ Ready for deployment
**Configuration:** Vercel (Frontend) + Railway (Backend + Database)

🎉 **Frontend now uses Railway backend for ALL data operations!**
