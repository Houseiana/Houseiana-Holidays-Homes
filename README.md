# Houseiana - Next.js Application

This is the Next.js version of the Houseiana property rental platform, converted from Angular.

## 🚀 Project Overview

Houseiana is a comprehensive property rental platform (similar to Airbnb) with features for both guests and hosts including:

- Property discovery and search
- Booking management
- Dual dashboards (Client & Host)
- Messaging system
- Wishlist/Saved properties
- User authentication
- Property management
- Reviews and ratings

## 📁 Project Structure

```
houseiana-nextjs/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles (Tailwind + Custom)
├── components/
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # Main navigation header
│   │   └── footer.tsx            # Footer component
│   └── providers/                # React providers
│       └── auth-provider.tsx     # Auth state provider
├── lib/
│   ├── api-client.ts             # Axios API client with interceptors
│   ├── stores/                   # Zustand state management
│   │   └── auth-store.ts         # Authentication store
│   └── hooks/                    # Custom React hooks
│       ├── use-properties.ts     # Property management hook
│       ├── use-bookings.ts       # Booking management hook
│       └── use-messages.ts       # Messaging hook
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Auth types
│   ├── property.ts               # Property types
│   ├── booking.ts                # Booking types
│   ├── message.ts                # Message types
│   └── dashboard.ts              # Dashboard types
├── middleware.ts                 # Next.js middleware for auth
├── .env.local                    # Environment variables
└── package.json                  # Dependencies
```

## 🔧 Technologies Used

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Icons**: Lucide React
- **Authentication**: Custom implementation with JWT

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5288/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔄 Migration from Angular

This Next.js application was converted from the Angular version located in `Houseiana- Frontend/`. Here are the key changes:

### Architecture Changes

| Angular | Next.js Equivalent |
|---------|-------------------|
| Services | Custom React Hooks |
| RxJS Observables | Promises with async/await |
| Angular Signals | Zustand stores |
| Angular Router | Next.js App Router |
| @Injectable services | React hooks + Zustand |
| HttpClient | Axios |
| Angular Guards | Next.js Middleware |
| Template syntax | JSX/TSX |

### Key Conversions

#### 1. **Authentication**
- **Angular**: `AuthService` with `BehaviorSubject`
- **Next.js**: `useAuthStore` (Zustand) with localStorage persistence
- **Location**: `lib/stores/auth-store.ts`

#### 2. **API Communication**
- **Angular**: `ApiBaseService` with HttpClient
- **Next.js**: `apiClient` with Axios interceptors
- **Location**: `lib/api-client.ts`

#### 3. **State Management**
- **Angular**: Services with Signals/BehaviorSubjects
- **Next.js**: Zustand stores + React hooks
- **Examples**:
  - Properties: `lib/hooks/use-properties.ts`
  - Bookings: `lib/hooks/use-bookings.ts`
  - Messages: `lib/hooks/use-messages.ts`

#### 4. **Routing & Protected Routes**
- **Angular**: Route guards (`auth.guard.ts`)
- **Next.js**: Middleware (`middleware.ts`)
- Protected routes automatically redirect to login if not authenticated

#### 5. **Components**
- **Angular**: Standalone components with templates
- **Next.js**: React functional components with JSX
- All Lucide icons remain the same (lucide-angular → lucide-react)

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🔐 Authentication Flow

1. User logs in via `/login` page
2. Credentials sent to backend API (`/api/auth/login`)
3. JWT token received and stored in:
   - `localStorage` (key: `auth_token`)
   - Zustand store
4. Axios interceptor adds token to all API requests
5. Middleware protects routes requiring authentication

## 🎯 Features Implemented

### ✅ Core Infrastructure
- [x] Next.js 15 setup with TypeScript
- [x] Tailwind CSS configuration
- [x] API client with interceptors
- [x] Authentication system (Zustand store)
- [x] Middleware for protected routes
- [x] Type definitions for all models

### ✅ Components
- [x] Header with navigation
- [x] Footer
- [x] Home page
- [x] Auth provider

### ✅ Hooks & State
- [x] useAuthStore (Zustand)
- [x] useProperties hook
- [x] useBookings hook
- [x] useMessages hook

### 🔨 Pages To Be Implemented

The following pages from the Angular app still need to be converted:

- [ ] `/discover` - Property discovery page
- [ ] `/property/[id]` - Property detail page
- [ ] `/login` - Login page
- [ ] `/register` - Registration page
- [ ] `/client-dashboard/*` - Client dashboard pages
- [ ] `/host-dashboard/*` - Host dashboard pages
- [ ] `/my-trips` - User trips
- [ ] `/messages` - Messages inbox
- [ ] `/saved-properties` - Wishlist
- [ ] `/booking/*` - Booking flow pages

### 🔨 Components To Be Implemented

Refer to the Angular app for these components:

**Shared Components:**
- Listing cards (property-card, listing-card)
- Filter components (filter-sidebar, universal-filter-panel)
- Search components (universal-search, unified-search)
- Auth modal
- Property map
- Guest selector
- Breadcrumb

**Dashboard Components:**
- Stats overview
- Quick actions
- Recent bookings
- Loyalty rewards
- Notifications
- Travel insights
- Wishlist preview
- Chart cards

## 📊 Data Models

All TypeScript interfaces from Angular have been migrated to the `types/` directory:

- **Property**: Full property schema with pricing, amenities, rules, availability
- **Booking**: Booking details with guest, property, payment info
- **Message**: Messaging system with conversations
- **Dashboard**: Stats and widgets for dashboards
- **Auth**: User and authentication types

## 🔌 API Integration

The backend API is expected to run at `http://localhost:5288/api`.

### API Endpoints (from Angular)

```typescript
// Auth
POST /auth/login
POST /auth/register

// Properties
GET  /property                    // All properties
GET  /property/my-properties      // User's properties
GET  /property/:id                // Single property
POST /property                    // Create property
PUT  /property/:id                // Update property
DELETE /property/:id              // Delete property

// Bookings
GET  /booking/my-bookings         // User's bookings
GET  /booking/:id                 // Single booking
POST /booking                     // Create booking
PATCH /booking/:id/status         // Update status
POST /booking/:id/cancel          // Cancel booking
GET  /booking/stats               // Booking statistics

// Messages
GET  /messages/conversations                           // All conversations
GET  /messages/conversations/:id                       // Single conversation
GET  /messages/conversations/:id/messages              // Conversation messages
POST /messages/send                                    // Send message
POST /messages/conversations/:id/mark-read             // Mark as read
```

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Inter font family** (300-900 weights) from Google Fonts
- Consistent design system from Angular version maintained
- Responsive design (mobile-first approach)

## 🚧 Development Workflow

### Adding a New Page

1. Create page in `app/[route]/page.tsx`
2. Import and use layout components (Header, Footer)
3. Use custom hooks for data fetching
4. Add route to middleware if authentication required

### Adding a New Component

1. Create component in `components/[category]/[name].tsx`
2. Use TypeScript for props
3. Import types from `types/` directory
4. Follow existing patterns (functional components, hooks)

### Adding a New API Hook

1. Create hook in `lib/hooks/use-[feature].ts`
2. Use `apiClient` for API calls
3. Manage loading/error states
4. Return data and actions

## 🔒 Security

- JWT tokens stored in localStorage
- HTTP-only cookies recommended for production
- Middleware protects sensitive routes
- Axios interceptors handle token refresh
- Environment variables for sensitive config

## 📝 Notes for Developers

1. **State Management**: Zustand is simpler than Redux and suits this app's needs
2. **API Client**: All API calls go through `apiClient` with centralized error handling
3. **TypeScript**: Strict mode enabled - all types must be defined
4. **Styling**: Use Tailwind classes directly in JSX
5. **Forms**: Consider using React Hook Form for complex forms
6. **Date Handling**: Consider adding `date-fns` or `dayjs` for date operations

## 🐛 Known Issues

1. Google OAuth integration needs configuration (client ID required)
2. Some complex dashboard components not yet implemented
3. Image upload functionality needs to be added
4. Real-time messaging requires WebSocket implementation

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

To continue the conversion from Angular:

1. Reference the Angular components in `Houseiana- Frontend/src/app/`
2. Convert templates to JSX
3. Replace Angular directives with React equivalents
4. Use custom hooks instead of services
5. Test thoroughly before merging

---

**Conversion Progress**: ~30% Complete

**Last Updated**: 2025-10-23
