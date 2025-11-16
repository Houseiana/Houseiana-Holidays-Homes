# Houseiana Unified Fullstack - Vercel Deployment Guide

## 🏗️ Project Overview

This is a **unified Next.js fullstack application** that includes:
- ✅ Frontend (React/Next.js with TypeScript)
- ✅ Backend API (Next.js API Routes)
- ✅ Database (PostgreSQL with Prisma ORM)
- ✅ Authentication (NextAuth.js + Custom OTP)
- ✅ File Storage (Vercel Blob or local)
- ✅ Payment Integration (Stripe)
- ✅ Email & SMS Services (Twilio, SMTP)

---

## 📋 Prerequisites

1. **GitHub Account** - [Sign up](https://github.com)
2. **Vercel Account** - [Sign up](https://vercel.com/signup)
3. **PostgreSQL Database** - Choose one:
   - [Vercel Postgres](https://vercel.com/storage/postgres) (Recommended)
   - [Neon](https://neon.tech) (Serverless PostgreSQL)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Navigate to project directory
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Unified Houseiana fullstack application for Vercel deployment"

# Push to new repository
git push -u origin main
```

### Step 2: Set Up Database

#### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Name: `houseiana-db`
4. Region: Choose closest to your users
5. Copy the `DATABASE_URL` and `DIRECT_URL`

#### Option B: Neon (Free Tier Available)

1. Go to [Neon Console](https://console.neon.tech)
2. Create new project: `houseiana`
3. Copy the connection string
4. Add `?sslmode=require` at the end

### Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Import from GitHub: `Houseiana/Houseiana-Holidays-Homes`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 4: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Required Variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
DIRECT_URL=postgresql://username:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# JWT
JWT_SECRET=<generate with: openssl rand -base64 32>
```

#### Optional Variables (Add as needed):

```bash
# Twilio SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 5: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Vercel will automatically run:
   ```bash
   npm install
   npm run build
   # Which includes: prisma generate && next build
   ```

### Step 6: Initialize Database

After first deployment, run Prisma migrations:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Run migration:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

   Or use Vercel Dashboard:
   - Go to **Storage** → Your Database → **Query**
   - Run the SQL from `houseiana_schema.sql`

---

## 🔧 Post-Deployment Configuration

### 1. Update NEXTAUTH_URL

After deployment, update the environment variable:
- `NEXTAUTH_URL` = Your actual Vercel URL (e.g., `https://houseiana.vercel.app`)

### 2. Set Up Custom Domain (Optional)

1. Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain: `www.houseiana.com`
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain

### 3. Configure OAuth Callbacks

If using Google OAuth, update redirect URIs:
- Authorized redirect URIs:
  - `https://your-domain.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google` (for local dev)

---

## 🧪 Testing Your Deployment

### 1. Check Health

```bash
curl https://your-domain.vercel.app/api/health
```

### 2. Test Database Connection

Visit: `https://your-domain.vercel.app/api/test-db`

### 3. Test Authentication

1. Go to `https://your-domain.vercel.app`
2. Click "Sign Up"
3. Complete registration flow

---

## 📊 Monitoring & Logs

### View Logs

1. Vercel Dashboard → Project → Deployments
2. Click on latest deployment
3. View **Function Logs** for API routes
4. Check **Build Logs** for deployment issues

### Analytics

- Vercel Dashboard → Project → Analytics
- Monitor: Page views, User sessions, Top pages, etc.

---

## 🐛 Troubleshooting

### Build Failed

**Error**: `Prisma generate failed`
- **Solution**: Ensure `DATABASE_URL` is set in environment variables

**Error**: `Module not found`
- **Solution**: Clear build cache in Vercel settings and redeploy

### Runtime Errors

**Error**: `Database connection failed`
- **Solution**: Check `DATABASE_URL` format and database accessibility
- Ensure `?sslmode=require` is added

**Error**: `NEXTAUTH_SECRET missing`
- **Solution**: Add `NEXTAUTH_SECRET` in environment variables

### Database Issues

**Error**: `Table does not exist`
- **Solution**: Run `npx prisma db push` or execute SQL schema

**Error**: `Connection timeout`
- **Solution**: Check database is running and accessible from Vercel's region

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Runs tests (if configured)
# 4. Deploys to production
```

---

## 📱 Local Development

To run locally:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your credentials

# Generate Prisma Client
npx prisma generate

# Push database schema (first time only)
npx prisma db push

# Run development server
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Rotate secrets** regularly (NEXTAUTH_SECRET, JWT_SECRET)
3. **Use environment variables** for all sensitive data
4. **Enable HTTPS only** in production
5. **Set up CORS** properly for API routes
6. **Implement rate limiting** for auth endpoints
7. **Use secure cookies** (httpOnly, secure, sameSite)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

---

## 🆘 Support

If you encounter issues:

1. Check Vercel Function Logs
2. Review build logs
3. Test database connectivity
4. Verify environment variables
5. Check [Vercel Status](https://www.vercel-status.com)

---

## ✅ Deployment Checklist

- [ ] Database created and accessible
- [ ] All required environment variables set
- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] First deployment successful
- [ ] Database schema applied
- [ ] NEXTAUTH_URL updated with production URL
- [ ] OAuth callbacks configured (if using)
- [ ] Custom domain configured (optional)
- [ ] Test authentication flow
- [ ] Test key features (booking, payments, etc.)
- [ ] Monitor logs for errors
- [ ] Set up error tracking (optional: Sentry)

---

**🎉 Congratulations! Your Houseiana application is now live on Vercel!**

Repository: [github.com/Houseiana/Houseiana-Holidays-Homes](https://github.com/Houseiana/Houseiana-Holidays-Homes)
