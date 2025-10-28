# Railway Backend - Quick Start Guide

## 🚀 3-Step Setup

### Step 1: Get Your Railway URL

Go to your Railway project and copy the deployment URL:
👉 [https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894](https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894)

**Location:** Settings → Domains

It will look like: `https://houseiana-backend-production.up.railway.app`

---

### Step 2: Update `.env.local`

Replace these lines in your `.env.local` file:

```bash
NEXT_PUBLIC_API_URL="https://your-railway-url.up.railway.app/api/v1.0"
API_URL="https://your-railway-url.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://your-railway-url.up.railway.app"
```

---

### Step 3: Restart & Test

```bash
# Stop your dev server (Ctrl+C)
# Clear cache
rm -rf .next

# Start again
npm run dev
```

Then visit: **http://localhost:3000/test-railway**

Click "Run All Tests" to verify connection!

---

## ✅ What's Been Set Up

Your project now includes:

### 1. Railway API Client (`lib/railway-api.ts`)
- Full-featured API client with authentication
- Automatic token management
- Error handling and logging
- Type-safe methods for all endpoints

### 2. Environment Configuration
- `.env.local` - Updated with Railway URL
- `.env.example` - Template with Railway setup
- Comments explaining each variable

### 3. Test Page (`app/test-railway/page.tsx`)
- Health check test
- Properties API test
- Authentication test
- Run all tests option
- Detailed error reporting

### 4. Documentation
- `RAILWAY_SETUP.md` - Comprehensive guide
- `RAILWAY_QUICKSTART.md` - This quick start
- Troubleshooting tips
- Usage examples

---

## 📖 How to Use the Railway API

### Import the client

```typescript
import { railwayApi } from '@/lib/railway-api';
```

### Example: Login

```typescript
const response = await railwayApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored
console.log('User:', response.data.user);
```

### Example: Get Properties

```typescript
const properties = await railwayApi.getProperties({
  location: 'New York',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05'
});
```

### Example: Create Booking

```typescript
const booking = await railwayApi.createBooking({
  propertyId: 'prop-123',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05',
  guests: 2
});
```

---

## 🔍 Current Configuration

Based on your `.env.local`:

```
Backend URL: https://houseiana-backend-production.up.railway.app/api/v1.0
Database: Neon PostgreSQL (for frontend OTP/auth)
JWT Secret: Configured
Twilio: Configured for SMS OTP
SendGrid: Configured for Email OTP
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"

1. Check Railway backend is running
2. Verify URL in `.env.local`
3. Restart dev server

### "CORS error"

Your backend needs CORS configuration:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://your-frontend.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowFrontend");
```

### "401 Unauthorized"

- Make sure JWT_SECRET matches between frontend and backend
- Check if you're logged in
- Try logging in again

---

## 📚 Next Steps

1. **Test the connection**: Visit `/test-railway` and run tests
2. **Update your components**: Replace local API calls with Railway API
3. **Deploy frontend**: Update environment variables in Vercel/hosting platform
4. **Configure CORS**: Ensure backend allows your frontend domain

---

## 📞 Need Help?

Check the detailed guide: [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)

View Railway logs:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# View logs
railway logs
```

---

## 🎯 Testing Checklist

- [ ] Railway backend is running
- [ ] `.env.local` updated with Railway URL
- [ ] Dev server restarted
- [ ] Test page shows ✅ for health check
- [ ] Browser console shows no CORS errors
- [ ] Can make API calls successfully

---

**Your Railway Project**: [View on Railway](https://railway.com/project/cee9fdf6-439e-4b7a-8185-7b30e0005894?environmentId=07955ebf-67dd-44de-88c8-42c92a16f249)

**Created**: October 2025
