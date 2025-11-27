#!/bin/bash

echo "🔧 Clerk Keys Update Script"
echo "======================================"
echo ""
echo "This script will update your Clerk keys in Vercel production"
echo ""

read -p "Enter your Clerk Publishable Key (pk_live_... or pk_test_...): " PUB_KEY
read -sp "Enter your Clerk Secret Key (sk_live_... or sk_test_...): " SECRET_KEY
echo ""
echo ""

cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/H User Fullstack/houseiana-nextjs"

echo "Removing old Clerk keys..."
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production -y 2>/dev/null || true
vercel env rm CLERK_SECRET_KEY production -y 2>/dev/null || true

echo ""
echo "Adding new Clerk Publishable Key..."
echo "$PUB_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

echo ""
echo "Adding new Clerk Secret Key..."
echo "$SECRET_KEY" | vercel env add CLERK_SECRET_KEY production

echo ""
echo "✅ Clerk keys updated!"
echo ""
echo "Now run: vercel --prod"
echo "This will redeploy your app with the new keys"

