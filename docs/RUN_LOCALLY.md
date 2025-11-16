# 🚀 Run Houseiana Locally - Quick Start

## Option 1: Quick Test (Frontend Only - 30 seconds)

To quickly see the frontend without setting up a database:

```bash
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Set a temporary DATABASE_URL (won't actually connect)
export DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"
export DIRECT_URL="postgresql://temp:temp@localhost:5432/temp"

# Generate Prisma Client (just for types)
npx prisma generate

# Start the server
npm run dev
```

Then open: **http://localhost:3000**

**Note**: Some features requiring database (signup, login with database) won't work, but you can see the UI.

---

## Option 2: Full Setup with Database (5 minutes)

For full functionality, you need a PostgreSQL database.

### Step 1: Get Free Database from Neon

1. Go to: **https://neon.tech**
2. Sign up (free, no credit card)
3. Create project: `houseiana-dev`
4. **Copy the connection string** (looks like):
   ```
   postgresql://username:password@host.neon.tech/neondb?sslmode=require
   ```

### Step 2: Update Environment Variables

Edit `.env.local` and update lines 14-15:

```bash
DATABASE_URL="YOUR_NEON_CONNECTION_STRING_HERE"
DIRECT_URL="YOUR_NEON_CONNECTION_STRING_HERE"
```

### Step 3: Initialize Database

```bash
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## 🎯 What You Can Test

### Without Database:
- ✅ Home page
- ✅ Browse properties (mock data)
- ✅ UI components
- ✅ Navigation
- ✅ Responsive design

### With Database:
- ✅ Sign up / Registration
- ✅ Login
- ✅ OTP verification (if Twilio configured)
- ✅ Create listings
- ✅ Book properties
- ✅ Messages
- ✅ All features!

---

## 🐛 Troubleshooting

### Error: "Missing DATABASE_URL"

**Solution**: Set environment variable:
```bash
export DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"
```

### Error: "Prisma Client not generated"

**Solution**:
```bash
npx prisma generate
```

### Error: "Cannot connect to database"

**Solution**:
- Check your DATABASE_URL is correct
- Ensure it includes `?sslmode=require` at the end
- Verify database is accessible

### Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 📝 Next Steps After Testing

1. ✅ Test the application locally
2. 🔧 Fix any issues
3. 📤 Push to GitHub
4. 🚀 Deploy to Vercel
5. 🎉 Go live!

---

## 💡 Quick Commands Reference

```bash
# Navigate to project
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Install dependencies (if needed)
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# View Prisma Studio (database GUI)
npx prisma studio
```

---

**🎊 Ready to run? Choose an option above and let's test your app!**
