#!/bin/bash

# Houseiana Database Setup Script
# This script will help you set up your PostgreSQL database

echo "🏠 Houseiana Database Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you:${NC}"
echo "1. Verify your database connection"
echo "2. Generate Prisma Client"
echo "3. Create database tables"
echo "4. Open Prisma Studio to view schema"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo "Please copy .env.example to .env.local first:"
    echo "  cp .env.example .env.local"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env.local${NC}"
    exit 1
fi

# Extract DATABASE_URL (basic extraction, works for most cases)
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'"' -f2)

if [[ "$DATABASE_URL" == *"localhost"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: You're using localhost database${NC}"
    echo "For production deployment, you need a cloud database (Neon, Supabase, etc.)"
    echo ""
fi

echo -e "${BLUE}📋 Setup Steps:${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm packages...${NC}"
    npm install
fi

# Step 2: Generate Prisma Client
echo ""
echo -e "${BLUE}Step 2: Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Step 3: Push schema to database
echo ""
echo -e "${BLUE}Step 3: Creating database tables...${NC}"
echo -e "${YELLOW}This will create all tables defined in prisma/schema.prisma${NC}"
echo ""

npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database schema${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Check DATABASE_URL in .env.local"
    echo "2. Ensure database server is running"
    echo "3. Verify database credentials"
    exit 1
fi

# Step 4: Show success message
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo -e "${BLUE}📊 Database Schema Created:${NC}"
echo "  • users - User accounts and authentication"
echo "  • sessions - User sessions and tokens"
echo "  • otp_codes - OTP verification codes"
echo "  • accounts - OAuth provider accounts"
echo "  • referrals - Referral program data"
echo ""

echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Open Prisma Studio to view your database:"
echo -e "   ${YELLOW}npx prisma studio${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Test signup at:"
echo -e "   ${YELLOW}http://localhost:3001${NC}"
echo ""

# Offer to open Prisma Studio
echo -e "${BLUE}Would you like to open Prisma Studio now? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Opening Prisma Studio at http://localhost:5555${NC}"
    echo -e "${YELLOW}Press Ctrl+C to close Prisma Studio${NC}"
    echo ""
    npx prisma studio
fi

echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
