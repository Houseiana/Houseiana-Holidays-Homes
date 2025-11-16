# Clerk Authentication Setup Guide

Your Houseiana application has been successfully migrated from NextAuth to Clerk! This document provides instructions for completing the setup.

## What's Been Done

1. **Installed Clerk** - `@clerk/nextjs` package added
2. **Configured Middleware** - Route protection set up in `middleware.ts`
3. **Updated App Layout** - `ClerkProvider` wraps the entire application
4. **Created Auth Pages**:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
5. **Updated Header** - Uses Clerk hooks for authentication
6. **Removed NextAuth** - All NextAuth code and dependencies removed

## Next Steps - Complete Your Setup

### Step 1: Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application (or select existing one)

### Step 2: Get Your API Keys

1. In the Clerk Dashboard, go to **API Keys** in the sidebar
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update Environment Variables

Open your `.env` file and replace the placeholder values:

```bash
# Replace these with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Important:** Never commit your `.env` file to version control!

### Step 4: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click the menu button and try:
   - **Sign up** - Create a new account
   - **Log in** - Sign in to your account
   - **Sign out** - Log out

### Step 5: Customize Clerk (Optional)

In the Clerk Dashboard, you can customize:

- **Appearance** - Match your brand colors and styling
- **Authentication Methods** - Enable Google, GitHub, etc.
- **User Management** - View and manage users
- **Email Templates** - Customize verification emails

## File Structure

```
houseiana-nextjs/
├── app/
│   ├── layout.tsx                      # ClerkProvider wraps app
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx                    # Sign-in page
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx                    # Sign-up page
├── components/
│   └── layout/
│       └── header.tsx                  # Uses Clerk hooks
├── middleware.ts                        # Route protection
├── .env                                 # Environment variables
└── .env.example                         # Template with instructions
```

## Using Clerk in Your Code

### Client Components (React hooks)

```typescript
'use client'
import { useAuth, useUser } from '@clerk/nextjs'

function MyComponent() {
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

### Server Components

```typescript
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    return <div>Not signed in</div>
  }

  return <div>Hello {user?.firstName}</div>
}
```

### API Routes

```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data: 'Protected data' })
}
```

## Protected Routes

Routes are automatically protected via `middleware.ts`. Public routes:

- `/` - Home
- `/sign-in` - Sign-in page
- `/sign-up` - Sign-up page
- `/discover` - Browse properties
- `/properties` - Property listings
- `/become-host` - Host signup

All other routes require authentication.

## Troubleshooting

### "Missing Clerk keys" Error

Make sure you've added your Clerk keys to `.env`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Redirect Loops

Check that your public routes are listed in `middleware.ts`:
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  // ... other public routes
])
```

### Styles Not Matching

Customize Clerk appearance in the Dashboard or use the `appearance` prop:
```typescript
<SignIn appearance={{
  elements: {
    card: 'shadow-xl',
    // ... custom styles
  }
}} />
```

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/nextjs/getting-started)
- [Clerk Dashboard](https://dashboard.clerk.com)

## Support

If you encounter issues:
1. Check the [Clerk Documentation](https://clerk.com/docs)
2. Visit the [Clerk Discord](https://clerk.com/discord)
3. Review the [GitHub Issues](https://github.com/clerk/javascript/issues)

---

**Note**: Your old NextAuth code has been completely removed. All authentication now goes through Clerk.
