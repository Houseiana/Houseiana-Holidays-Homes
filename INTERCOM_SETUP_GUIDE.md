# Intercom Messaging Setup Guide

## All 4 Messaging Scenarios in One Platform

This guide shows how to set up Intercom to handle all messaging needs:
1. **CLIENT ↔ HOST** (Property inquiries)
2. **CLIENT ↔ ADMIN** (Customer support)
3. **HOST ↔ ADMIN** (Host support)
4. **HOST ↔ CLIENT** (Booking communication)

---

## Step 1: Create Intercom Account

1. Go to https://www.intercom.com/
2. Sign up for a free trial or paid plan
3. Choose **"Support & Messaging"** as your primary use case
4. Complete onboarding

---

## Step 2: Get Your App ID

1. In Intercom dashboard, go to **Settings** → **Installation**
2. Find your **App ID** (looks like: `abc12345`)
3. Copy this ID

---

## Step 3: Add Environment Variable

Add to your `.env.local`:

```bash
NEXT_PUBLIC_INTERCOM_APP_ID=your_app_id_here
```

---

## Step 4: Configure Intercom Teams & Routing

### Create Teams in Intercom:

1. Go to **Settings** → **Teammates & teams**
2. Create these teams:
   - **Support Team** (for CLIENT ↔ ADMIN)
   - **Host Success Team** (for HOST ↔ ADMIN)
   - **Property Inquiries** (for CLIENT ↔ HOST routing)

### Set Up Assignment Rules:

1. Go to **Settings** → **Workflows** → **Assignment rules**
2. Create rules:

**Rule 1: Route Clients to Support**
```
IF user_role = "client"
AND conversation_type = "CLIENT_ADMIN"
THEN assign to "Support Team"
```

**Rule 2: Route Hosts to Host Success**
```
IF user_role = "host"
AND conversation_type = "HOST_ADMIN"
THEN assign to "Host Success Team"
```

**Rule 3: Route Property Inquiries**
```
IF conversation_about = "property_inquiry"
THEN assign to "Property Inquiries Team"
THEN notify host via email (target_host_id)
```

---

## Step 5: Set Up Email Notifications for Host ↔ Client

Since Intercom doesn't directly notify users outside the platform:

1. **For HOST → CLIENT messages:**
   - Intercom sends email to client automatically
   - Client can reply via email or widget

2. **For CLIENT → HOST messages:**
   - Set up Intercom webhook to notify host:
   - Go to **Settings** → **Developers** → **Webhooks**
   - Add webhook URL: `https://yoursite.com/api/webhooks/intercom`
   - Subscribe to `conversation.user.created` event

---

## Step 6: How to Use the Components

### 1. Message Host Button (Client → Host)

On property pages:

```tsx
import MessageHostButton from '@/components/messaging/MessageHostButton';

<MessageHostButton
  propertyId={property.id}
  hostId={property.hostId}
  hostName={property.host.name}
/>
```

### 2. Message Client Button (Host → Client)

On booking management pages:

```tsx
import MessageClientButton from '@/components/messaging/MessageClientButton';

<MessageClientButton
  bookingId={booking.id}
  clientId={booking.clientId}
  clientName={booking.client.name}
/>
```

### 3. Contact Support Button (Anyone → Admin)

Anywhere:

```tsx
import ContactSupportButton from '@/components/messaging/ContactSupportButton';

// For clients
<ContactSupportButton
  userType="client"
  context={{ bookingId: "123", issue: "payment problem" }}
/>

// For hosts
<ContactSupportButton
  userType="host"
  context={{ propertyId: "456", issue: "payout question" }}
/>
```

---

## Step 7: Admin Access

### For Account Managers:

1. Add admin users in Intercom:
   - **Settings** → **Teammates**
   - Invite with email

2. Access dashboard:
   - Web: https://app.intercom.com/
   - Mobile: Download Intercom app
   - Desktop: Download desktop app

3. All conversations appear in inbox with tags:
   - `client_support`
   - `host_support`
   - `property_inquiry`

---

## Step 8: Test the Integration

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login as client** and click "Message Host" on a property

3. **Login to Intercom dashboard** - conversation should appear

4. **Reply from Intercom** - message should appear in widget

5. **Test all 4 scenarios:**
   - ✅ Client messages host about property
   - ✅ Client contacts support
   - ✅ Host contacts support
   - ✅ Host messages client about booking

---

## Pricing

- **Free Tier:** 14-day trial (full features)
- **Starter:** $74/month (up to 2 seats)
- **Pro:** $395/month (unlimited seats)
- **Premium:** Custom pricing

**Recommendation:** Start with free trial, then Starter plan

---

## Advanced: Webhook Handler (Optional)

To notify hosts when clients message them, create:

`/app/api/webhooks/intercom/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma-client';

export async function POST(request: NextRequest) {
  const webhook = await request.json();

  if (webhook.topic === 'conversation.user.created') {
    const conversation = webhook.data.item;
    const customAttributes = conversation.custom_attributes;

    // If it's a client messaging a host
    if (customAttributes.conversation_type === 'CLIENT_HOST') {
      const hostId = customAttributes.target_host_id;

      // Send email to host
      const host = await prisma.user.findUnique({
        where: { id: hostId },
        select: { email: true, firstName: true },
      });

      // TODO: Send email notification to host
      console.log(`Notify host ${host.email} about new message`);
    }
  }

  return NextResponse.json({ success: true });
}
```

---

## Support

- Intercom docs: https://www.intercom.com/help
- API docs: https://developers.intercom.com/

---

## Summary

✅ **One platform** handles all 4 messaging scenarios
✅ **No custom backend** needed
✅ **Mobile apps** for admins
✅ **Email notifications** built-in
✅ **Real-time** messaging
✅ **10-minute setup**

**Next Step:** Sign up at https://www.intercom.com/ and add your App ID to `.env.local`
