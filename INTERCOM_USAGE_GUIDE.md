# Intercom Messenger Usage Guide

## Errors Fixed

### 1. Import Path Error (FIXED)
**File:** `app/client-dashboard/page.tsx:20`
- **Error:** `Module not found: Can't resolve '@/app/(dashboard)/support/page'`
- **Fix:** Changed to `'@/app/(dashboard)/help-center/page'`

### 2. Missing LoginModal Import (FIXED)
**File:** `app/host-dashboard/add-listing/page.tsx:6`
- **Error:** `Module not found: Can't resolve '@/components/auth/login-modal'`
- **Fix:** Removed import (using Clerk authentication instead)

---

## Where the Intercom Messenger Appears

### Automatic Widget (No Code Needed)

The Intercom messenger widget **automatically appears** on all dashboard pages:

**Locations:**
- `/trips` - My Trips page
- `/wishlist` - Wishlist page
- `/explore` - Explore page
- `/messages` - Messages page
- `/payments` - Payments page
- `/profile` - Profile page
- `/help-center` - Support/Help Center page
- `/host/dashboard` - Host Dashboard
- `/host/properties` - Host Properties
- `/host/bookings` - Host Bookings
- `/host/earnings` - Host Earnings

**How it works:**
- Integrated in `src/app/(dashboard)/layout.tsx:64`
- Appears as a chat bubble in the bottom-right corner
- Automatically identifies users with their Clerk information
- Routes conversations based on user role (client, host, admin)

---

## Where to Add Messaging Buttons

### 1. Message Host Button (CLIENT → HOST)

**Use on:** Property detail pages, search results

**Example location:** `src/app/properties/[id]/page.tsx`

```tsx
import MessageHostButton from '@/components/messaging/MessageHostButton';

// Inside your property detail component
<MessageHostButton
  propertyId={property.id}
  hostId={property.hostId}
  hostName={property.host.name}
/>
```

**What it does:**
- Opens Intercom with pre-filled message to the property host
- Tags conversation as `CLIENT_HOST` and `property_inquiry`
- Includes property ID in conversation context

---

### 2. Message Client Button (HOST → CLIENT)

**Use on:** Host booking management pages

**Example location:** `src/app/host/bookings/page.tsx` or booking detail pages

```tsx
import MessageClientButton from '@/components/messaging/MessageClientButton';

// Inside your bookings list or detail page
<MessageClientButton
  bookingId={booking.id}
  clientId={booking.clientId}
  clientName={booking.client.name}
/>
```

**What it does:**
- Opens Intercom with pre-filled message to the guest/client
- Tags conversation as `HOST_CLIENT` and `booking`
- Includes booking ID in conversation context

---

### 3. Contact Support Button (ANYONE → ADMIN)

**Use on:** Multiple pages where users might need help

**Example locations:**
- Help Center: `src/app/(dashboard)/help-center/page.tsx`
- Payments page with issues: `src/app/(dashboard)/payments/page.tsx`
- Booking pages with problems

```tsx
import ContactSupportButton from '@/components/messaging/ContactSupportButton';

// For a client with a booking issue
<ContactSupportButton
  userType="client"
  context={{
    bookingId: "123",
    issue: "payment problem"
  }}
/>

// For a host with a property issue
<ContactSupportButton
  userType="host"
  context={{
    propertyId: "456",
    issue: "payout question"
  }}
/>

// Generic support button
<ContactSupportButton
  userType="client"
/>
```

**What it does:**
- Opens Intercom with contextual help message
- Routes to appropriate support team (CLIENT_ADMIN or HOST_ADMIN)
- Includes relevant IDs (booking, property) in conversation

---

## Implementation Checklist

### ✅ Already Done
1. IntercomMessenger component created and integrated
2. Three messaging button components created
3. Dashboard layout updated to load Intercom
4. Environment variable added (APP_ID: q0pmvuth)
5. Build errors fixed

### 🔲 To Do in Intercom Dashboard
1. Enable Messenger API
2. Turn on "Show the messenger" toggle
3. Create teams:
   - Support Team (for CLIENT ↔ ADMIN)
   - Host Success Team (for HOST ↔ ADMIN)
   - Property Inquiries (for CLIENT ↔ HOST)
4. Set up assignment rules based on conversation_type

### 🔲 To Do in Your Code
1. Add MessageHostButton to property pages
2. Add MessageClientButton to host booking pages
3. Add ContactSupportButton to help center and other support pages
4. Test all 4 messaging scenarios

---

## Testing

Once you've enabled the Messenger API in Intercom:

1. **Visit http://localhost:3000**
2. **Sign in with Clerk**
3. **Navigate to any dashboard page** (e.g., `/trips`)
4. **Look for the Intercom widget** in the bottom-right corner
5. **Click it** to open the messenger
6. **Send a test message** to verify it appears in your Intercom dashboard

---

## The 4 Messaging Scenarios

| Scenario | Trigger | Route | Team |
|----------|---------|-------|------|
| **CLIENT → HOST** | MessageHostButton on property page | Property Inquiries | Notify host via email |
| **CLIENT → ADMIN** | ContactSupportButton (userType="client") | Support Team | Admin handles |
| **HOST → ADMIN** | ContactSupportButton (userType="host") | Host Success Team | Admin handles |
| **HOST → CLIENT** | MessageClientButton on booking page | Direct to client | Client receives email |

---

## Additional Resources

- **Setup Guide:** See `INTERCOM_SETUP_GUIDE.md` for detailed Intercom configuration
- **Component Files:**
  - `src/components/IntercomMessenger.tsx`
  - `src/components/messaging/MessageHostButton.tsx`
  - `src/components/messaging/MessageClientButton.tsx`
  - `src/components/messaging/ContactSupportButton.tsx`
- **Intercom Docs:** https://developers.intercom.com/
