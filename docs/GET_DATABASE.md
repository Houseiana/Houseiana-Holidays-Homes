# 🗄️ Get Free Database for Local Testing

## Quick Option: Neon (Recommended - 2 minutes)

Neon provides a free PostgreSQL database perfect for testing.

### Steps:

1. **Go to Neon**: https://neon.tech
2. **Sign up** (free, no credit card required)
3. **Create Project**:
   - Click "Create a project"
   - Name: `houseiana-dev`
   - Region: Choose closest to you
4. **Get Connection String**:
   - Copy the connection string shown
   - It looks like: `postgresql://username:password@host.neon.tech/dbname?sslmode=require`

5. **Update `.env.local`**:
   - Open: `.env.local`
   - Replace line 14 with your connection string:
     ```bash
     DATABASE_URL="postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require"
     DIRECT_URL="postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require"
     ```

6. **Continue** - Then come back and run the server!

---

## Alternative: Use Vercel Postgres

If you prefer Vercel's database:

1. Go to: https://vercel.com/storage/postgres
2. Create database
3. Copy connection strings
4. Update `.env.local`

---

## After Getting Database URL

Once you have your database URL in `.env.local`, run:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Start the dev server
npm run dev
```

Then open: http://localhost:3000

---

**⚡ Quick Test Option (Skip Database)**

If you just want to test the frontend without database, I can help you run it in a mock mode!
