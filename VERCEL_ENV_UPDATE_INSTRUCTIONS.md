# Vercel Environment Variables Update Instructions

**Project:** houseiana-nextjs
**Vercel URL:** https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs/settings/environment-variables

---

## 🎯 Required Updates

You need to add **ONE** missing environment variable to Vercel production:

### Missing Variable:

```
Name:  SOCKET_IO_URL
Value: https://houseianabackend-production.up.railway.app
```

---

## 📋 Step-by-Step Instructions

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Environment Variables Settings:**
   - URL: https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs/settings/environment-variables
   - Or: Open your Vercel project → Settings → Environment Variables

2. **Add SOCKET_IO_URL:**
   - Click the **"Add New"** button
   - **Name:** `SOCKET_IO_URL`
   - **Value:** `https://houseianabackend-production.up.railway.app`
   - **Environment:** Check ✅ **Production** (and optionally Preview, Development)
   - Click **"Save"**

3. **Redeploy (Important!):**
   - Go to: https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs
   - Find your latest deployment
   - Click **"⋯" (three dots)** → **"Redeploy"**
   - Or wait for the automatic deployment triggered by the recent git push

---

### Option 2: Via Vercel CLI (Alternative)

```bash
# Navigate to your project directory
cd "/Users/goldenloonie/Desktop/Houseiana Updated Project/Full Satck Next Github copy/Houseiana Full Stack project /houseiana-nextjs"

# Add SOCKET_IO_URL to production
vercel env add SOCKET_IO_URL production

# When prompted, paste this value:
# https://houseianabackend-production.up.railway.app

# Redeploy to apply changes
vercel --prod
```

---

## ✅ Verify Current Configuration

Here's what your Vercel environment variables should look like:

| Variable Name | Value | Status |
|--------------|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://houseianabackend-production.up.railway.app/api/v1.0` | ✅ Already set |
| `API_URL` | `https://houseianabackend-production.up.railway.app/api/v1.0` | ✅ Already set |
| `SOCKET_IO_URL` | `https://houseianabackend-production.up.railway.app` | ❌ **NEEDS TO BE ADDED** |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://houseiana-nextjs.vercel.app`) | ✅ Already set |
| `NEXTAUTH_SECRET` | Your NextAuth secret | ✅ Already set |
| `JWT_SECRET` | Your JWT secret | ✅ Already set |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID | ✅ Already set |
| `TWILIO_AUTH_TOKEN` | Your Twilio token | ✅ Already set |
| `TWILIO_VERIFY_SERVICE_SID` | Your Twilio Verify SID | ✅ Already set |
| `SENDGRID_API_KEY` | Your SendGrid key | ✅ Already set |
| `SENDGRID_FROM_EMAIL` | Your from email | ✅ Already set |
| `STRIPE_SECRET_KEY` | Your Stripe secret | ✅ Already set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe public key | ✅ Already set |
| `DATABASE_URL` | (if present) | ⚠️ Not used by frontend |

---

## 🔍 After Adding the Variable

### 1. Verify the Variable Was Added

```bash
# Check if SOCKET_IO_URL was added
vercel env ls production | grep SOCKET_IO_URL
```

You should see:
```
SOCKET_IO_URL   Encrypted   Production   [timestamp]
```

### 2. Wait for Deployment

- Vercel should automatically redeploy after you save the environment variable
- Monitor deployment at: https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs
- Wait for status to show: ✅ **Ready**

### 3. Test the Deployment

Once deployed, test your application:

```bash
# Get your Vercel URL
vercel ls --prod | head -1
```

Then visit your Vercel URL and:
- Open browser DevTools (F12)
- Go to Console tab
- Look for: `🚂 Railway API configured: https://houseianabackend-production.up.railway.app/api/v1.0`
- Test user registration/login
- Verify API calls go to Railway backend

---

## 🚨 Important Notes

### About DATABASE_URL

If you see `DATABASE_URL` in your Vercel environment variables:
- ⚠️ **It should NOT be used by the frontend**
- The frontend ONLY uses Railway API endpoints
- The `DATABASE_URL` is for the Railway C# backend, not the Next.js frontend
- You can leave it there (it won't be used) or remove it

### Environment Variable Priority

Vercel environment variables override local `.env` files in production:
1. Vercel Production Environment Variables (highest priority)
2. `.env.production.local`
3. `.env.local`
4. `.env.production`
5. `.env`

---

## 📊 Complete Environment Configuration

After adding `SOCKET_IO_URL`, your complete production environment should be:

```bash
# Railway Backend API (Required)
NEXT_PUBLIC_API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://houseianabackend-production.up.railway.app"

# Authentication (Required)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
JWT_SECRET="your-jwt-secret"

# Twilio SMS (Required for OTP)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_VERIFY_SERVICE_SID="your-verify-sid"

# SendGrid Email (Required for OTP)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="info@houseiana.com"

# Stripe Payments (Required)
STRIPE_SECRET_KEY="your-stripe-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-public"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
FACEBOOK_CLIENT_ID="your-facebook-id"
FACEBOOK_CLIENT_SECRET="your-facebook-secret"
APPLE_CLIENT_ID="your-apple-id"
APPLE_CLIENT_SECRET="your-apple-secret"
```

---

## 🎉 Success Checklist

After completing the update, verify:

- [ ] `SOCKET_IO_URL` variable added to Vercel production
- [ ] Latest git changes deployed to Vercel
- [ ] Deployment status shows "Ready" ✅
- [ ] Application loads without errors
- [ ] Browser console shows Railway API connection
- [ ] User authentication works
- [ ] Data loads from Railway backend

---

## 📞 Troubleshooting

### Issue: Variable Not Showing Up

**Solution:**
- Clear browser cache
- Redeploy the application
- Wait 2-3 minutes for propagation

### Issue: Application Still Uses Old Configuration

**Solution:**
```bash
# Force a new deployment
vercel --prod --force
```

### Issue: Can't Access Vercel Dashboard

**Solution:**
- Ensure you're logged into the correct Vercel account
- Check if you have permission to modify environment variables
- Contact the project owner if needed

---

## 🔗 Quick Links

- **Vercel Project:** https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs
- **Environment Variables:** https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs/settings/environment-variables
- **Deployments:** https://vercel.com/devweb3-outlookcoms-projects/houseiana-nextjs/deployments
- **Railway Backend:** https://houseianabackend-production.up.railway.app
- **GitHub Repo:** https://github.com/Houseiana/houseiana-frontend

---

**Last Updated:** October 28, 2025
**Status:** Waiting for `SOCKET_IO_URL` to be added to Vercel production
