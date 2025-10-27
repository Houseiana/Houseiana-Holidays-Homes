#!/bin/bash

# Add environment variables to Vercel
echo "Adding environment variables to Vercel..."

# Database
echo "postgresql://neondb_owner:npg_CL2brY4ZJHIE@ep-ancient-dew-a9me2kbl-pooler.gwc.azure.neon.tech/neondb?sslmode=require" | vercel env add DATABASE_URL production

# Twilio
echo "ACa1bc611cf5f0a132290557a801a9f8e0" | vercel env add TWILIO_ACCOUNT_SID production
echo "4322f5048d0a47b8847d61f498a1aa0c" | vercel env add TWILIO_AUTH_TOKEN production
echo "VAc316821ba052602e9296f259e5450c12" | vercel env add TWILIO_VERIFY_SERVICE_SID production

# SendGrid
echo "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" | vercel env add SENDGRID_API_KEY production
echo "info@houseiana.com" | vercel env add SENDGRID_FROM_EMAIL production

# JWT
echo "your-super-secure-jwt-secret-key-for-authentication-tokens-must-be-at-least-32-characters-long" | vercel env add JWT_SECRET production

# NextAuth - Generate a secure secret
echo "$(openssl rand -base64 32)" | vercel env add NEXTAUTH_SECRET production

echo "Environment variables added successfully!"
