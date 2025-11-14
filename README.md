# 🏠 Houseiana - Holiday Homes Platform

<div align="center">

![Houseiana](https://img.shields.io/badge/Houseiana-Holiday%20Homes-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

**A modern, unified fullstack platform for holiday home rentals**

[Live Demo](https://houseiana.vercel.app) · [Documentation](./VERCEL_DEPLOYMENT_GUIDE.md) · [Report Bug](https://github.com/Houseiana/Houseiana-Holidays-Homes/issues)

</div>

---

## 🌟 Features

### For Guests
- 🔍 **Advanced Search** - Filter by location, price, amenities, dates
- 📅 **Smart Booking** - Real-time availability and instant confirmation
- 💳 **Secure Payments** - Stripe integration with multiple payment methods
- ⭐ **Reviews & Ratings** - Read authentic guest reviews
- 💬 **Real-time Messaging** - Chat with hosts instantly
- 🔐 **Multi-factor Auth** - Phone/Email OTP + Google OAuth
- 🎁 **Loyalty Program** - Earn points and unlock rewards

### For Hosts
- 🏡 **Property Management** - List and manage multiple properties
- 📊 **Analytics Dashboard** - Track bookings, earnings, and performance
- 💰 **Dynamic Pricing** - Set base prices, cleaning fees, discounts
- 📸 **Photo Gallery** - Upload multiple high-quality images
- 📅 **Availability Calendar** - Manage bookings and blocked dates
- ✉️ **Guest Communication** - Integrated messaging system
- 💵 **Payout Management** - Track earnings and payment history

### Platform Features
- 🌐 **Responsive Design** - Perfect on mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Optimized with Next.js SSR and caching
- 🔒 **Secure** - Industry-standard encryption and security practices
- 🌍 **Multi-currency** - Support for multiple currencies
- 📱 **PWA Ready** - Install as a mobile app
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2 (React 18)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Headless UI, Lucide Icons
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Date Handling**: date-fns

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL
- **ORM**: Prisma 6.18
- **Authentication**: NextAuth.js + Custom JWT
- **File Storage**: Vercel Blob / Local
- **Real-time**: Socket.IO

### Services & Integrations
- **Payments**: Stripe
- **SMS/WhatsApp**: Twilio
- **Email**: Nodemailer, SendGrid
- **OAuth**: Google
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+ and npm 9+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Houseiana/Houseiana-Holidays-Homes.git
   cd Houseiana-Holidays-Homes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials (see [Environment Variables](#-environment-variables))

4. **Set up database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🌍 Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/houseiana
DIRECT_URL=postgresql://user:password@localhost:5432/houseiana

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-string>
JWT_SECRET=<generate-random-string>
```

### Optional

```env
# Twilio (SMS/WhatsApp OTP)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_VERIFY_SERVICE_SID=your_service_sid

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Generate secrets:**
```bash
openssl rand -base64 32
```

---

## 📁 Project Structure

```
houseiana-nextjs/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Backend)
│   │   ├── auth/              # Authentication endpoints
│   │   ├── bookings/          # Booking management
│   │   ├── properties/        # Property CRUD
│   │   ├── payments/          # Payment processing
│   │   └── messages/          # Messaging system
│   ├── (pages)/               # Frontend pages
│   │   ├── page.tsx           # Home page
│   │   ├── discover/          # Property search
│   │   ├── property/[id]/     # Property details
│   │   ├── dashboard/         # User dashboard
│   │   └── host-dashboard/    # Host management
│   └── layout.tsx             # Root layout
├── components/                 # React components
│   ├── auth/                  # Auth components
│   ├── layout/                # Layout components
│   ├── search/                # Search components
│   └── dashboard/             # Dashboard components
├── lib/                       # Utility libraries
│   ├── db.ts                  # Database client
│   ├── auth.ts                # Auth utilities
│   ├── prisma.ts              # Prisma client
│   └── api-client.ts          # API client
├── prisma/                    # Prisma ORM
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── types/                     # TypeScript types
├── .env.example               # Environment template
├── next.config.js             # Next.js config
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind config
├── tsconfig.json              # TypeScript config
└── vercel.json                # Vercel config
```

---

## 🗄️ Database Schema

### Core Models
- **User** - Guest and host profiles
- **Property** - Holiday home listings
- **Booking** - Reservation data
- **Review** - Guest reviews
- **Message** - Host-guest communication
- **Payment** - Transaction records
- **OtpCode** - OTP verification

[View full schema](./prisma/schema.prisma)

---

## 🔐 Authentication Flow

1. **Registration**
   - Email/Phone input
   - OTP verification (SMS/WhatsApp/Email)
   - Password creation
   - Profile setup
   - KYC verification (for hosts)

2. **Login**
   - Email/Phone + Password
   - Google OAuth
   - OTP-only login

3. **Security**
   - JWT tokens
   - Refresh tokens
   - Session management
   - Rate limiting
   - CSRF protection

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Houseiana/Houseiana-Holidays-Homes)

Or follow the [detailed deployment guide](./VERCEL_DEPLOYMENT_GUIDE.md)

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

---

## 📊 Scripts

```json
{
  "dev": "next dev",                    // Development server
  "build": "next build",                // Production build
  "start": "next start",                // Production server
  "lint": "next lint",                  // Lint code
  "vercel-build": "prisma generate && prisma db push && next build"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

**Houseiana Development Team**

- Project Lead: [Your Name]
- Backend: [Developer Name]
- Frontend: [Developer Name]
- DevOps: [Developer Name]

---

## 📞 Support

- 📧 Email: support@houseiana.com
- 💬 Discord: [Join our server](https://discord.gg/houseiana)
- 📖 Docs: [Documentation](./VERCEL_DEPLOYMENT_GUIDE.md)
- 🐛 Issues: [GitHub Issues](https://github.com/Houseiana/Houseiana-Holidays-Homes/issues)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

### Q2 2025
- [ ] AI-powered recommendations
- [ ] Virtual tours (360°)
- [ ] Insurance integration

### Q3 2025
- [ ] Host insurance program
- [ ] Property management API
- [ ] White-label solution

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and edge functions
- Prisma for the excellent ORM
- All our contributors and supporters

---

<div align="center">

**Made with ❤️ by the Houseiana Team**

[Website](https://houseiana.com) · [GitHub](https://github.com/Houseiana) · [Twitter](https://twitter.com/houseiana)

</div>
