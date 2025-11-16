# Twilio OTP Verification Setup Guide

## ✅ Current Status

Your Houseiana application now has **Twilio OTP verification** integrated with support for:
- 📱 **SMS** verification
- 💬 **WhatsApp** verification
- 📧 **Email** verification (optional)

### Configuration Status:
- ✅ Twilio Account SID: **Configured**
- ✅ Twilio Auth Token: **Configured**
- ✅ Twilio Verify Service SID: **Configured**
- ⚠️ Email SMTP: **Not Configured** (optional)

---

## 🚀 How to Use

### 1. Import the OTP Component

```tsx
import OTPVerification from '@/components/auth/otp-verification';
```

### 2. Use in Your Signup/Login Flow

```tsx
'use client';

import { useState } from 'react';
import OTPVerification from '@/components/auth/otp-verification';

export default function SignupPage() {
  const [showOTP, setShowOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleOTPVerified = () => {
    console.log('User verified!');
    // Proceed with registration
  };

  if (showOTP) {
    return (
      <OTPVerification
        recipient={phoneNumber} // Can be phone or email
        onVerified={handleOTPVerified}
        onCancel={() => setShowOTP(false)}
      />
    );
  }

  return (
    <div>
      <input
        type="tel"
        placeholder="+974XXXXXXXX"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={() => setShowOTP(true)}>
        Verify Phone Number
      </button>
    </div>
  );
}
```

---

## 📱 API Endpoints

### Send OTP
**POST** `/api/auth/send-otp`

```json
{
  "recipient": "+974XXXXXXXX",  // Phone (E.164 format) or Email
  "channel": "sms"              // "sms", "whatsapp", or "email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent via sms",
  "channel": "sms"
}
```

### Verify OTP
**POST** `/api/auth/verify-otp`

```json
{
  "recipient": "+974XXXXXXXX",
  "code": "123456",
  "channel": "sms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification successful",
  "verified": true
}
```

---

## 🧪 Testing

### Test with SMS
1. Make sure your phone number is in E.164 format: `+974XXXXXXXX`
2. Use the OTP component or call the API directly
3. You should receive an SMS with a 6-digit code
4. Enter the code to verify

### Test with WhatsApp
1. First, you need to join Twilio's WhatsApp Sandbox:
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Send the join code from your WhatsApp to Twilio's number
2. Use the component with `channel: "whatsapp"`
3. You'll receive the OTP via WhatsApp

### Test with Email (if configured)
1. Configure SMTP settings in `.env.local`
2. Use the component with `channel: "email"`
3. You'll receive the OTP via email

---

## ⚙️ Configuration

### Required Environment Variables (Already Set)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxx
```

### Optional: Email Configuration
If you want to support email OTP, add these to `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

---

## 🔒 Security Features

✅ **Code Expiration:** OTP codes expire after 10 minutes
✅ **Rate Limiting:** Built-in Twilio rate limiting
✅ **One-Time Use:** Codes are deleted after successful verification
✅ **Resend Cooldown:** 60-second cooldown between resend requests

---

## 📞 Twilio Pricing

### SMS OTP
- ~$0.01 - $0.05 per message (varies by country)
- Qatar pricing: Check Twilio pricing page

### WhatsApp OTP
- Free during trial/sandbox mode
- Production: ~$0.005 - $0.01 per message

### Verify Service
- Free for first 1,000 verifications/month
- $0.05 per verification after that

---

## 🐛 Troubleshooting

### "Twilio is not properly configured"
- Check that all three Twilio env variables are set in `.env.local`
- Restart your dev server after adding env variables

### "Invalid phone number format"
- Phone numbers must be in E.164 format: `+[country code][number]`
- Qatar example: `+974XXXXXXXX`
- Not: `974XXXXXXXX` or `00974XXXXXXXX`

### WhatsApp not working
- Make sure you've joined the Twilio Sandbox
- For production, you need WhatsApp Business approval

### Email not working
- Check SMTP credentials
- For Gmail, use an App Password, not your regular password
- Make sure "Less secure app access" is NOT enabled (use App Passwords instead)

---

## 📚 Resources

- [Twilio Verify Docs](https://www.twilio.com/docs/verify/api)
- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [Phone Number Formatting](https://www.twilio.com/docs/glossary/what-e164)

---

## 🎯 Next Steps

1. ✅ Twilio SMS/WhatsApp is working!
2. ⚠️ (Optional) Configure email SMTP for email OTP
3. 🔨 Integrate OTP component into your signup/login flows
4. 🧪 Test with real phone numbers
5. 🚀 Deploy to production

---

**Need help?** Check the Twilio console at https://console.twilio.com
