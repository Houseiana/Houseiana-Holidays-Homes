# 🚀 Twilio WhatsApp OTP Setup Guide

## Quick 5-Minute Setup

### 1. Get Twilio Account
1. Sign up at [Twilio Console](https://console.twilio.com)
2. Get your **Account SID** and **Auth Token** from the dashboard

### 2. Create Verify Service
1. Go to **Verify** → **Services** in Twilio Console
2. Click **Create new Service**
3. Name it "Houseiana OTP"
4. Copy the **Service SID**

### 3. Join WhatsApp Sandbox
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see your unique sandbox code (e.g., "join purple-elephant")
3. Send that message to **+1 415 523-8886** on WhatsApp
4. Wait for confirmation

### 4. Update Environment Variables
Replace the placeholder values in your `.env.local` file:

```bash
# Twilio Configuration for WhatsApp OTP
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp Sandbox Configuration
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SANDBOX_MODE=true
```

### 5. Test the Integration

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Use your WhatsApp number** (the one that joined the sandbox)

3. **Test signup flow:**
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Enter your WhatsApp-enabled phone number
   - Select WhatsApp method
   - Check WhatsApp for real OTP message!

## 🔍 Troubleshooting

### "Demo OTP sent" message?
- Check that your Twilio credentials are correct in `.env.local`
- Restart the development server after adding credentials
- Verify the Account SID starts with "AC" and Service SID starts with "VA"

### No WhatsApp message received?
- Ensure you joined the Twilio sandbox
- Use the exact phone number that joined the sandbox
- Check that the number includes country code (+974...)
- Wait up to 30 seconds for message delivery

### "Configuration missing" error?
- Double-check all three Twilio environment variables are set
- Ensure no extra spaces or quotes around the values
- Restart the development server

## 📱 Current Integration Features

✅ **Real Twilio WhatsApp OTP** - No more demo mode
✅ **Sandbox Support** - Perfect for development testing
✅ **Production Ready** - Switch to production templates when ready
✅ **SMS Fallback** - SMS option available via Twilio Verify
✅ **Error Handling** - Clear error messages and troubleshooting

## 🎯 Next Steps for Production

1. **Business Verification** - Complete Meta Business verification
2. **Template Approval** - Submit WhatsApp message templates
3. **Production Switch** - Set `TWILIO_SANDBOX_MODE=false`
4. **Template SID** - Add approved template SID to environment

Your app is now ready for real WhatsApp OTP testing! 🎉