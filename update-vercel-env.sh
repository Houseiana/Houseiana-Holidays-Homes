#!/bin/bash

# Update Vercel Environment Variables for Railway Backend Integration
# Railway Backend: houseianabackend-production.up.railway.app

echo "🔧 Updating Vercel environment variables for Railway backend..."

# Railway Backend URLs
RAILWAY_API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
RAILWAY_SOCKET_URL="https://houseianabackend-production.up.railway.app"

# Database (Railway backend handles all data)
DATABASE_URL="postgresql://postgres:StplYBmRJbgXXqCiTzNYlOESzvbpPyDn@postgres.railway.internal:5432/railway"

echo "📝 Setting NEXT_PUBLIC_API_URL..."
vercel env rm NEXT_PUBLIC_API_URL production --yes 2>/dev/null || true
echo "$RAILWAY_API_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo "📝 Setting API_URL..."
vercel env rm API_URL production --yes 2>/dev/null || true
echo "$RAILWAY_API_URL" | vercel env add API_URL production

echo "📝 Setting SOCKET_IO_URL..."
vercel env rm SOCKET_IO_URL production --yes 2>/dev/null || true
echo "$RAILWAY_SOCKET_URL" | vercel env add SOCKET_IO_URL production

echo "📝 Setting DATABASE_URL (Railway backend database)..."
vercel env rm DATABASE_URL production --yes 2>/dev/null || true
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo ""
echo "✅ Environment variables updated successfully!"
echo ""
echo "🔗 Railway Backend API: $RAILWAY_API_URL"
echo "🔗 Railway Socket URL: $RAILWAY_SOCKET_URL"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with the same values"
echo "2. Redeploy Vercel: vercel --prod"
echo "3. Test the connection at your Vercel URL"
