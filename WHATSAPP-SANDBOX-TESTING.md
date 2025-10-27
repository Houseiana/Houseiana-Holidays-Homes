# WhatsApp Sandbox Testing Guide

Great! You've set up the Twilio WhatsApp Sandbox. This allows you to test WhatsApp OTP delivery without waiting for production approval.

## Sandbox Configuration

### Step 1: Get Your Sandbox Credentials

From your Twilio Console → WhatsApp → Sandbox, you should have:

1. **Sandbox Number**: Usually `+1 415 523-8886` or similar
2. **Join Code**: A code like `join <code>` that users need to send first
3. **Sandbox SID**: For API calls (same as your Account SID)

### Step 2: Update Environment Variables

Add these to your `.env.local` file for testing:

```env
# Twilio WhatsApp Sandbox Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# For Sandbox Testing
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SANDBOX_MODE=true

# For Production (when ready)
# TWILIO_WHATSAPP_FROM=whatsapp:+your_approved_number
# TWILIO_OTP_TEMPLATE_SID=your_approved_template_sid
# TWILIO_SANDBOX_MODE=false
```

### Step 3: Test the Integration

1. **Join the Sandbox**:
   - Send `join <your-sandbox-code>` to the sandbox WhatsApp number
   - You'll receive a confirmation message

2. **Test OTP Delivery**:
   - Use your phone number in the app
   - Select "WhatsApp" as delivery method
   - You should receive the OTP via WhatsApp

## Sandbox Limitations

⚠️ **Important Sandbox Restrictions**:

1. **Pre-approved Recipients**: Only numbers that have joined your sandbox can receive messages
2. **No Templates**: Sandbox doesn't require templates, but production does
3. **Limited Features**: Some advanced features may not work
4. **Rate Limits**: Lower rate limits than production

## Testing Your OTP Flow

### Test Script for WhatsApp OTP

```javascript
// Test in browser console or create a test file
async function testWhatsAppOTP() {
  try {
    // Step 1: Send OTP
    const sendResponse = await fetch('/api/otp/send-twilio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+97430424433', // Your phone number
        method: 'whatsapp'
      })
    });

    const sendResult = await sendResponse.json();
    console.log('Send OTP Result:', sendResult);

    if (sendResult.success) {
      // Step 2: Verify OTP (replace with actual code received)
      const verifyResponse = await fetch('/api/otp/verify-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+97430424433',
          code: '123456', // Replace with actual code
          method: 'whatsapp'
        })
      });

      const verifyResult = await verifyResponse.json();
      console.log('Verify OTP Result:', verifyResult);
    }
  } catch (error) {
    console.error('Test Error:', error);
  }
}

// Run the test
testWhatsAppOTP();
```

## Sandbox to Production Migration

### Phase 1: Sandbox Testing ✅
- [x] Set up Twilio WhatsApp Sandbox
- [x] Test OTP delivery in sandbox
- [x] Verify user experience

### Phase 2: Production Setup (Next Steps)

1. **Register Production WhatsApp Sender**:
   - Apply for WhatsApp Business API
   - Submit business verification documents
   - Wait for approval (1-5 business days)

2. **Create Production Templates**:
   - Design OTP message template
   - Submit for WhatsApp approval
   - Wait for template approval (1-2 business days)

3. **Update Production Configuration**:
   - Get production WhatsApp number
   - Get approved template SID
   - Update environment variables

## Troubleshooting Sandbox Issues

### Common Problems:

1. **Messages Not Delivered**:
   - Ensure recipient has joined sandbox with correct code
   - Check phone number formatting (+country code)
   - Verify Twilio account has sufficient balance

2. **API Errors**:
   - Check Account SID and Auth Token
   - Verify sandbox number format
   - Check request payload format

3. **Rate Limiting**:
   - Sandbox has lower limits than production
   - Wait between requests if hitting limits
   - Monitor Twilio console for usage

### Debug Information:

Check these in Twilio Console:
- **Messaging Logs**: See delivery status
- **Error Logs**: Check for API errors
- **Usage**: Monitor message counts
- **Account Balance**: Ensure sufficient funds

## Sample Sandbox Message

When testing, you should receive something like:

```
🏠 Houseiana Verification

Your verification code is: 123456

⏰ This code expires in 5 minutes.

🔒 Please do not share this code with anyone for your security.
```

## Next Steps After Sandbox Testing

Once you've confirmed the sandbox works:

1. **Business Verification**: Submit your business for WhatsApp approval
2. **Template Creation**: Create and submit production OTP template
3. **Production Testing**: Test with approved template and number
4. **Launch**: Deploy to production with monitoring

## Monitoring and Analytics

Track these metrics during testing:
- **Delivery Rate**: Percentage of successful deliveries
- **User Completion**: How many users complete OTP verification
- **Error Rate**: API errors and failures
- **User Preference**: SMS vs WhatsApp preference

## Cost Considerations

### Sandbox vs Production Costs:
- **Sandbox**: Usually free for testing (check Twilio pricing)
- **Production WhatsApp**: ~$0.0042 per message (varies by country)
- **SMS Fallback**: ~$0.0075 per message (varies by country)

### Cost Optimization Tips:
1. Use SMS as primary, WhatsApp as premium option
2. Implement user preference storage
3. Monitor delivery success rates
4. Set up billing alerts

---

**Ready for Production?** Once sandbox testing is successful, follow the production setup guide in `WHATSAPP-OTP-SETUP.md` to move to live WhatsApp delivery.