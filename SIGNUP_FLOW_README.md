# Multi-Step Sign-Up Flow - Airbnb Style

This document explains the new multi-step sign-up flow inspired by Airbnb's registration process.

## Overview

The sign-up flow consists of 7 steps that guide users through creating an account:

1. **Phone Number Entry** - User enters their phone number with country code
2. **Security Check** - CAPTCHA verification to prevent bots
3. **SMS Verification** - User enters the code sent to their phone
4. **User Details** - User provides personal information (name, DOB, email)
5. **Community Commitment** - User agrees to community guidelines
6. **Profile Welcome** - Welcome screen
7. **Profile Photo** - User uploads a profile photo (optional)

## File Structure

```
houseiana-nextjs/
├── app/
│   ├── signup/
│   │   └── page.tsx                 # Main orchestrator page
│   └── api/
│       └── auth/
│           ├── signup/route.ts      # User registration endpoint
│           ├── send-sms/route.ts    # Send SMS verification code
│           └── verify-sms/route.ts  # Verify SMS code
└── components/
    └── auth/
        └── multi-step-signup/
            ├── Step1PhoneNumber.tsx
            ├── Step2SecurityCheck.tsx
            ├── Step3VerificationCode.tsx
            ├── Step4UserDetails.tsx
            ├── Step5CommunityCommitment.tsx
            ├── Step6ProfileWelcome.tsx
            └── Step7ProfilePhoto.tsx
```

## Usage

### Accessing the Sign-Up Flow

Navigate to `/signup` in your application to start the sign-up process.

```typescript
// Example: Link to sign-up
<Link href="/signup">Sign Up</Link>
```

### Step-by-Step Breakdown

#### Step 1: Phone Number Entry
- User selects country code from dropdown
- User enters phone number
- Supports alternative sign-up methods (Google, Facebook, Apple, Email)
- **Features:**
  - Country code selector with search
  - Phone number formatting
  - Social login buttons
  - Privacy policy notice

#### Step 2: Security Check
- CAPTCHA verification to ensure the user is not a robot
- **Features:**
  - Auto-advancing after verification
  - Loading state during verification
  - Success confirmation

#### Step 3: SMS Verification
- User enters 6-digit code sent via SMS
- **Features:**
  - Auto-focus on input fields
  - Auto-submit when all 6 digits are entered
  - Support for paste functionality
  - Backspace navigation between inputs
  - Resend option

#### Step 4: User Details
- User provides:
  - First name (as on ID)
  - Last name (as on ID)
  - Date of birth (month, day, year)
  - Email address
- **Features:**
  - Real-time validation
  - Error messages
  - Preferred name option link
  - Terms and conditions agreement

#### Step 5: Community Commitment
- User agrees to treat everyone with respect
- **Features:**
  - Community guidelines explanation
  - "Learn more" link
  - Agree or Decline options

#### Step 6: Profile Welcome
- Welcome message and introduction to the platform
- **Features:**
  - Airbnb logo
  - Welcome text
  - Continue button

#### Step 7: Profile Photo
- User uploads or skips profile photo
- **Features:**
  - Drag and drop upload
  - File picker
  - Facebook photo import option
  - Photo preview
  - Skip option ("I'll do this later")

## API Endpoints

### 1. Send SMS Verification Code

**Endpoint:** `POST /api/auth/send-sms`

**Request Body:**
```json
{
  "countryCode": "+1",
  "phoneNumber": "6502137552"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "code": "290123" // Only in development mode
}
```

### 2. Verify SMS Code

**Endpoint:** `POST /api/auth/verify-sms`

**Request Body:**
```json
{
  "countryCode": "+1",
  "phoneNumber": "6502137552",
  "code": "290123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

### 3. Complete Sign-Up

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "countryCode": "+1",
  "phoneNumber": "6502137552",
  "verificationCode": "290123",
  "firstName": "Sam",
  "lastName": "Lee",
  "birthMonth": "February",
  "birthDay": "18",
  "birthYear": "1995",
  "email": "samlee.mobbin+1@gmail.com",
  "profilePhoto": "base64_encoded_image_or_url"
}
```

**Response:**
```json
{
  "userId": "user_id",
  "email": "samlee.mobbin+1@gmail.com",
  "firstName": "Sam",
  "lastName": "Lee",
  "phone": "+16502137552",
  "profilePhoto": "url_to_photo",
  "token": "jwt_token",
  "expiresAt": "2025-10-31T00:00:00.000Z"
}
```

## Integration with Existing Auth System

The sign-up flow integrates with your existing Zustand auth store:

```typescript
// After successful signup, update the auth store
import { useAuthStore } from '@/lib/stores/auth-store';

const { setUser, setToken } = useAuthStore();

// Set user data and token
setUser(userData);
setToken(token);
```

## SMS Integration (Production)

For production use, integrate with an SMS service provider:

### Option 1: Twilio

```bash
npm install twilio
```

```typescript
// In send-sms/route.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Your Houseiana verification code is: ${code}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: fullPhoneNumber,
});
```

### Option 2: AWS SNS

```bash
npm install @aws-sdk/client-sns
```

```typescript
// In send-sms/route.ts
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

await snsClient.send(
  new PublishCommand({
    Message: `Your Houseiana verification code is: ${code}`,
    PhoneNumber: fullPhoneNumber,
  })
);
```

## Database Schema Updates

Ensure your User model supports the new fields:

```prisma
model User {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  email           String    @unique
  password        String
  phone           String?   @unique
  dateOfBirth     DateTime?
  profilePhoto    String?
  referralCode    String?   @unique
  isEmailVerified Boolean   @default(false)
  isPhoneVerified Boolean   @default(false)
  role            String    @default("guest")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Customization

### Changing Colors

The flow uses Tailwind CSS. Update colors in [tailwind.config.js](tailwind.config.js):

```javascript
// Current primary color
colors: {
  primary: '#FF385C', // Airbnb pink/red
}
```

### Modifying Steps

To add or remove steps:

1. Create/remove the step component in `components/auth/multi-step-signup/`
2. Update the `currentStep` state management in `app/signup/page.tsx`
3. Add the step to the conditional rendering

### Skipping Steps

To make certain steps optional, add skip handlers:

```typescript
const handleStepSkip = () => {
  setCurrentStep(currentStep + 1);
};
```

## Testing

### Development Mode

In development, the SMS code is returned in the API response for easy testing:

```json
{
  "success": true,
  "code": "290123" // Only shown in development
}
```

### Test Flow

1. Navigate to `/signup`
2. Enter any phone number
3. Complete security check (auto-advances)
4. Check console logs for SMS code
5. Enter the code
6. Fill in user details
7. Accept community commitment
8. Upload or skip profile photo

## Production Checklist

- [ ] Set up SMS service (Twilio, AWS SNS, etc.)
- [ ] Remove SMS code from API response
- [ ] Implement proper CAPTCHA service (reCAPTCHA, hCaptcha)
- [ ] Set up Redis or database for verification code storage
- [ ] Configure rate limiting for SMS sends
- [ ] Add email verification flow
- [ ] Implement proper error logging
- [ ] Add analytics tracking for each step
- [ ] Set up A/B testing for flow optimization
- [ ] Configure environment variables
- [ ] Test on various devices and browsers

## Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="your_database_url"

# JWT
JWT_SECRET="your_jwt_secret"

# SMS Service (Twilio example)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_number"

# Or AWS SNS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

## Troubleshooting

### Issue: SMS not sending

**Solution:** Check your SMS service credentials and ensure the phone number format is correct.

### Issue: Verification code expired

**Solution:** Codes expire after 10 minutes. Request a new code.

### Issue: Profile photo not uploading

**Solution:** Check file size limits and supported formats. Ensure the server can handle base64 encoded images.

### Issue: Navigation not working

**Solution:** Ensure Next.js router is properly configured and all route files exist.

## Support

For issues or questions, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)

## License

This implementation is part of the Houseiana project.
