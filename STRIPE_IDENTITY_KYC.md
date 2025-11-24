# Stripe Identity KYC Integration

Complete guide for setting up and using Stripe Identity for KYC (Know Your Customer) verification in Houseiana.

## Table of Contents

- [Overview](#overview)
- [Why Stripe Identity?](#why-stripe-identity)
- [Setup Instructions](#setup-instructions)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Webhook Configuration](#webhook-configuration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Pricing](#pricing)

---

## Overview

Stripe Identity provides secure, automated identity verification for regulatory compliance. This integration includes:

- **Document Verification**: Passport, driver's license, or ID card
- **Selfie Verification**: Live selfie capture to match ID document
- **Automated Checks**: Real-time verification with fraud detection
- **Global Coverage**: Supports 33+ countries and growing
- **Compliance**: GDPR, PCI, and SOC 2 compliant

---

## Why Stripe Identity?

### Benefits Over Manual KYC

| Feature | Manual KYC | Stripe Identity |
|---------|-----------|-----------------|
| **Verification Speed** | Hours to days | Seconds to minutes |
| **Accuracy** | Manual review errors | AI-powered verification |
| **Fraud Detection** | Limited | Advanced ML detection |
| **Global Coverage** | Varies | 33+ countries |
| **Cost** | $5-20 per verification | $1.50 per verification |
| **User Experience** | Upload forms | Mobile-optimized flow |
| **Compliance** | Manual process | Automatic compliance |

### Perfect for Houseiana Because:

1. **You already use Stripe** - Same account, seamless integration
2. **Property rentals require trust** - Verify both hosts and guests
3. **Regulatory compliance** - Meet local regulations automatically
4. **Reduce fraud** - Automated fraud detection
5. **Better UX** - Mobile-friendly, fast verification

---

## Setup Instructions

### 1. Enable Stripe Identity

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Products** > **Identity**
3. Click **Enable Identity**
4. Review and accept the terms

### 2. Environment Variables

The integration uses your existing Stripe keys. Update [.env.local](.env.local):

```bash
# Stripe Keys (already configured)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (for Identity events)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for return URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Update Database Schema

Add KYC fields to your User model in [prisma/schema.prisma](prisma/schema.prisma):

```prisma
model User {
  // ... existing fields
  
  kycStatus           String?    // PENDING, VERIFIED, FAILED
  kycVerifiedAt       DateTime?
  kycVerificationId   String?    // Stripe verification session ID
  
  // ... rest of fields
}
```

Then run:

```bash
npx prisma db push
```

### 4. Configure Webhooks (Production Only)

See [Webhook Configuration](#webhook-configuration) section below.

---

## Architecture

### File Structure

```
src/lib/
  └── stripe.ts                    # Stripe Identity functions

app/api/
  ├── kyc/
  │   ├── create-session/
  │   │   └── route.ts            # Create verification session
  │   └── check-status/
  │       └── route.ts            # Check verification status
  └── webhooks/
      └── stripe/
          └── route.ts            # Handle Stripe webhooks
```

### Verification Flow

```
User clicks "Verify Identity"
         ↓
Frontend calls POST /api/kyc/create-session
         ↓
Backend creates Stripe verification session
         ↓
User redirected to Stripe's hosted verification
         ↓
User uploads ID and takes selfie
         ↓
Stripe processes and verifies
         ↓
Webhook updates user's kycStatus in database
         ↓
User redirected back to dashboard
```

---

## API Endpoints

### 1. Create Verification Session

**Endpoint**: `POST /api/kyc/create-session`

**Description**: Creates a Stripe Identity verification session

**Authentication**: Required

**Request Body**:
```json
{
  "returnUrl": "https://houseiana.net/client-dashboard?kyc=complete"
}
```

**Response**:
```json
{
  "sessionId": "vs_1234567890",
  "clientSecret": "vs_1234567890_secret_abcdef",
  "url": "https://verify.stripe.com/start/vs_1234567890",
  "status": "created"
}
```

**Usage**:
```typescript
const response = await fetch('/api/kyc/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    returnUrl: window.location.origin + '/client-dashboard?kyc=complete'
  })
})

const { url } = await response.json()
window.location.href = url // Redirect to Stripe verification
```

---

### 2. Check Verification Status

**Endpoint**: `GET /api/kyc/check-status?sessionId=vs_xxx`

**Description**: Checks the status of a verification session

**Authentication**: Required

**Query Parameters**:
- `sessionId` (required): Stripe verification session ID

**Response**:
```json
{
  "sessionId": "vs_1234567890",
  "status": "verified",
  "verifiedData": {
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-15",
    "idNumber": "AB123456",
    "address": {
      "city": "San Francisco",
      "country": "US",
      "line1": "123 Main St",
      "postalCode": "94102",
      "state": "CA"
    }
  },
  "lastError": null
}
```

**Possible Statuses**:
- `requires_input`: User needs to provide information
- `processing`: Verification in progress
- `verified`: Successfully verified
- `canceled`: User or system canceled

---

### 3. Webhook Handler

**Endpoint**: `POST /api/webhooks/stripe`

**Description**: Receives and processes Stripe webhook events

**Events Handled**:

| Event | Action |
|-------|--------|
| `identity.verification_session.verified` | Set kycStatus = 'VERIFIED' |
| `identity.verification_session.requires_input` | Set kycStatus = 'PENDING' |
| `identity.verification_session.canceled` | Set kycStatus = 'FAILED' |
| `identity.verification_session.processing` | Set kycStatus = 'PENDING' |

---

## Frontend Integration

### Simple Button Integration

```typescript
// In your client dashboard component

const handleVerifyIdentity = async () => {
  try {
    setIsLoading(true)
    
    const response = await fetch('/api/kyc/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnUrl: window.location.origin + '/client-dashboard?kyc=complete'
      })
    })

    const { url } = await response.json()
    
    // Redirect to Stripe's hosted verification page
    window.location.href = url
    
  } catch (error) {
    console.error('Error creating verification session:', error)
    alert('Failed to start verification. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

return (
  <button
    onClick={handleVerifyIdentity}
    disabled={isLoading}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg"
  >
    {isLoading ? 'Loading...' : 'Verify Identity'}
  </button>
)
```

### Check Status After Return

```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const kycComplete = urlParams.get('kyc')
  const sessionId = urlParams.get('verification_session')

  if (kycComplete === 'complete' && sessionId) {
    checkVerificationStatus(sessionId)
  }
}, [])

const checkVerificationStatus = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/kyc/check-status?sessionId=${sessionId}`)
    const data = await response.json()
    
    if (data.status === 'verified') {
      alert('Identity verified successfully!')
      // Refresh user data
      window.location.href = '/client-dashboard'
    } else {
      alert(`Verification status: ${data.status}`)
    }
  } catch (error) {
    console.error('Error checking status:', error)
  }
}
```

---

## Webhook Configuration

### Development (Local Testing)

For local development, webhooks aren't necessary because you can check status via the API.

If you want to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook signing secret like: whsec_...
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

### Production

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://houseiana.net/api/webhooks/stripe`
4. Select events to listen for:
   - `identity.verification_session.verified`
   - `identity.verification_session.requires_input`
   - `identity.verification_session.canceled`
   - `identity.verification_session.processing`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Vercel environment variables:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET production
   ```

---

## Testing

### Test Mode

Stripe Identity works in test mode with test data:

1. **Create a verification session** using test mode keys
2. **Visit the verification URL**
3. **Use test document**:
   - Upload any image as ID (test mode accepts any file)
   - Take any selfie (test mode auto-verifies)
4. **Check status** - Should show "verified"

### Test Document Numbers

In test mode, use these to simulate different scenarios:

| ID Number | Result |
|-----------|--------|
| `000000000` | Success (verified) |
| `000000001` | Requires additional verification |
| `000000002` | Document unreadable |
| `000000003` | Expired document |

### Testing Flow

1. **Create Session**:
   ```bash
   curl -X POST http://localhost:3000/api/kyc/create-session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TEST_TOKEN"
   ```

2. **Visit verification URL** in response

3. **Complete verification** with test data

4. **Check webhook** was received (if testing webhooks)

5. **Verify database** updated:
   ```sql
   SELECT id, email, kycStatus, kycVerifiedAt 
   FROM User 
   WHERE email = 'test@example.com';
   ```

---

## Production Deployment

### 1. Get Production Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle **View test data** OFF
3. Go to **Developers** > **API keys**
4. Copy **Publishable key** and **Secret key**

### 2. Update Environment Variables

```bash
# Vercel deployment
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production

# Railway deployment
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set NEXT_PUBLIC_APP_URL=https://houseiana.net
```

### 3. Configure Production Webhook

Follow steps in [Webhook Configuration](#webhook-configuration) section.

### 4. Test in Production

1. Create a verification session in production
2. Complete verification with real ID
3. Verify webhook received
4. Check database updated
5. Verify user sees updated status

---

## Pricing

### Stripe Identity Costs

| Tier | Price | Details |
|------|-------|---------|
| **Verification** | $1.50 per successful verification | Includes document + selfie |
| **Failed Verification** | Free | No charge if verification fails |
| **Canceled** | Free | No charge if user cancels |

### Cost Comparison

**Monthly Volume: 1000 verifications**

- **Stripe Identity**: $1,500/month
- **Onfido**: $2,000-3,000/month
- **Jumio**: $2,500-4,000/month
- **Manual Review**: $5,000-10,000/month

**Stripe Identity is the most cost-effective solution** for startups and growing platforms.

---

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` server-side only
2. **Validate webhooks**: Always verify webhook signatures in production
3. **Use HTTPS**: Webhooks only work with HTTPS endpoints
4. **Store minimal data**: Don't store sensitive ID images or numbers
5. **Idempotency**: Webhook handlers should be safe to retry
6. **Error handling**: Log errors but don't expose internal details

---

## Supported Documents

Stripe Identity accepts:

- **Passport** (all countries)
- **Driver's License** (US, UK, CA, AU, and more)
- **National ID Card** (EU countries and more)
- **Residence Permit**

### Supported Countries

33+ countries including:
- United States
- United Kingdom  
- Canada
- Australia
- EU countries
- Many more...

See [Stripe Identity Coverage](https://stripe.com/docs/identity/verification-checks) for full list.

---

## Common Issues & Solutions

### Issue: "Verification session expired"
**Solution**: Sessions expire after 7 days. Create a new session.

### Issue: "Document not readable"
**Solution**: User needs to:
- Use good lighting
- Ensure document is not blurred
- Capture entire document in frame

### Issue: "Selfie doesn't match"
**Solution**: User should:
- Remove glasses/hat
- Face camera directly
- Use good lighting
- Don't use old photos

### Issue: Webhook not received
**Solution**:
- Verify webhook URL is correct
- Check webhook secret is set
- Ensure endpoint is HTTPS
- Check Stripe webhook logs

---

## Support & Resources

- **Stripe Identity Docs**: [https://stripe.com/docs/identity](https://stripe.com/docs/identity)
- **Stripe Dashboard**: [https://dashboard.stripe.com/identity](https://dashboard.stripe.com/identity)
- **Stripe Support**: [https://support.stripe.com/](https://support.stripe.com/)
- **API Reference**: [https://stripe.com/docs/api/identity](https://stripe.com/docs/api/identity)

---

## Summary

Your Stripe Identity KYC integration is now configured with:

✅ Automated identity verification
✅ Document + selfie verification
✅ Real-time fraud detection
✅ Webhook event processing
✅ Global coverage (33+ countries)
✅ GDPR & PCI compliant
✅ Cost-effective ($1.50 per verification)

**Next Steps**:
1. Test in development with test mode
2. Configure production webhooks
3. Update frontend UI to trigger verification
4. Deploy to production
5. Monitor verification success rates

**Questions?** Check the [Stripe Identity Documentation](https://stripe.com/docs/identity) or contact Stripe support.
