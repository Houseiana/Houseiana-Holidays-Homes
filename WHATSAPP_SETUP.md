# WhatsApp OTP Setup Guide

## Quick Setup for Development

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Twilio Configuration for WhatsApp OTP
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-twilio-verify-service-sid

# WhatsApp Sandbox Configuration
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SANDBOX_MODE=true

# For Production (after approval)
# TWILIO_OTP_TEMPLATE_SID=your-whatsapp-template-sid
# TWILIO_SANDBOX_MODE=false
```

### 2. Twilio Sandbox Setup
1. Login to your Twilio Console
2. Go to Messaging > Try it out > Send a WhatsApp message
3. Follow the sandbox setup instructions
4. Join the sandbox by sending "join [code]" to +1 415 523-8886
5. Test with your WhatsApp-enabled phone number

### 3. Testing the Integration
1. Start the development server: `npm run dev`
2. Go to http://localhost:3000
3. Click "Sign up" to open the signup modal
4. Enter your phone number (must be WhatsApp-enabled)
5. The verification step will default to WhatsApp
6. Check your WhatsApp for the OTP message
7. Enter the 6-digit code to verify

### 4. Features Included
✅ **WhatsApp OTP as default method**
✅ **SMS and Email fallback options**
✅ **Automatic OTP resend when switching methods**
✅ **Real-time method switching**
✅ **Twilio Sandbox support for development**
✅ **Production-ready configuration**
✅ **Comprehensive error handling**

### 5. Demo Mode
If Twilio credentials are not configured, the system automatically falls back to demo mode:
- Uses OTP code "123456" for all verifications
- No actual messages are sent
- Perfect for development without Twilio setup

### 6. Production Deployment
For production WhatsApp Business API:
1. Complete business verification with Meta
2. Submit WhatsApp message templates for approval
3. Update environment variables with production credentials
4. Set `TWILIO_SANDBOX_MODE=false`

### 7. Troubleshooting
- **No WhatsApp message received**: Check if you've joined the Twilio sandbox
- **OTP expired**: Request a new code - OTPs expire after 5 minutes
- **Invalid phone number**: Ensure the number includes country code and is WhatsApp-enabled
- **Rate limiting**: Wait 60 seconds between OTP requests

### 8. Test Page
Access the dedicated test page at: http://localhost:3000/test-otp.html
- Test all OTP methods independently
- Useful for debugging Twilio integration
- Bypasses authentication requirements