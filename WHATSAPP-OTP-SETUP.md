# WhatsApp OTP Integration Setup Guide

This guide will help you set up WhatsApp OTP delivery using Twilio's WhatsApp Business API.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://twilio.com)
2. **WhatsApp Business Account**: Apply for WhatsApp Business API access
3. **Pre-approved Message Templates**: Required for business-initiated conversations

## Step 1: WhatsApp Business API Setup

### 1.1 Request WhatsApp Business API Access
1. Go to Twilio Console → Messaging → WhatsApp
2. Apply for WhatsApp Business API access
3. Complete the business verification process
4. Wait for approval (usually 1-3 business days)

### 1.2 Get Your WhatsApp Sender Number
Once approved, you'll receive a WhatsApp-enabled phone number:
- Format: `whatsapp:+14155238886` (example)
- This will be your `TWILIO_WHATSAPP_FROM` environment variable

## Step 2: Create OTP Message Template

### 2.1 Template Requirements
WhatsApp requires pre-approved templates for business-initiated messages. Here's our recommended OTP template:

**Template Name**: `houseiana_otp_verification`

**Template Content**:
```
🏠 *Houseiana Verification*

Your verification code is: *{{1}}*

⏰ This code expires in {{2}} minutes.

🔒 Please do not share this code with anyone for your security.

Need help? Reply to this message.
```

**Template Variables**:
- `{{1}}`: OTP code (6 digits)
- `{{2}}`: Expiry time (5 minutes)

### 2.2 Submit Template for Approval
1. Go to Twilio Console → Messaging → WhatsApp → Templates
2. Click "Create Template"
3. Fill in the template details:
   - **Name**: `houseiana_otp_verification`
   - **Language**: English (US)
   - **Category**: Authentication
   - **Content**: Use the template above
4. Submit for approval
5. Wait for WhatsApp approval (1-2 business days)

### 2.3 Get Template SID
Once approved, you'll get a Template SID:
- Format: `HXb5b62575e6e4ff6129ad7c8efe1f983e` (example)
- This will be your `TWILIO_OTP_TEMPLATE_SID` environment variable

## Step 3: Environment Configuration

Add these variables to your `.env.local` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACa1bc611cf5f0a132290557a801a9f8e0
TWILIO_AUTH_TOKEN=4322f5048d0a47b8847d61f498a1aa0c
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_OTP_TEMPLATE_SID=HXb5b62575e6e4ff6129ad7c8efe1f983e

# SMS Fallback (Twilio Verify)
TWILIO_VERIFY_SERVICE_SID=VA123456789abcdef123456789abcdef12
```

## Step 4: Test Your Integration

### 4.1 Test in Development
1. Set `NODE_ENV=development`
2. Use demo OTP code `123456`
3. Test the WhatsApp flow in the UI

### 4.2 Test in Production
1. Set `NODE_ENV=production`
2. Add a test phone number to your WhatsApp Business account
3. Test sending real OTP messages

## Step 5: Production Considerations

### 5.1 Rate Limiting
- Implement rate limiting to prevent spam
- Current implementation: 1 OTP per minute per phone number
- Consider implementing daily limits

### 5.2 Error Handling
- Handle WhatsApp delivery failures
- Implement SMS fallback for failed WhatsApp delivery
- Log delivery status for monitoring

### 5.3 Cost Optimization
- WhatsApp messages cost more than SMS
- Consider SMS as primary, WhatsApp as optional
- Monitor usage and costs in Twilio Console

### 5.4 Template Management
- Keep templates updated and compliant
- Monitor template approval status
- Have backup templates ready

## Code Example: Sending WhatsApp OTP

```javascript
// Using the integrated system
const otpService = new OTPService({
  provider: 'twilio',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
});

// Send WhatsApp OTP
const result = await otpService.sendOTP({
  phoneNumber: '30424433',
  countryCode: '+974',
  method: 'whatsapp'
});

// Verify WhatsApp OTP
const verification = await otpService.verifyOTP({
  phoneNumber: '30424433',
  countryCode: '+974',
  code: '123456',
  method: 'whatsapp'
});
```

## Troubleshooting

### Common Issues

1. **Template Not Approved**
   - Check template compliance with WhatsApp policies
   - Ensure template follows authentication category guidelines
   - Contact Twilio support if stuck

2. **Message Delivery Failures**
   - Verify recipient phone number is WhatsApp-enabled
   - Check if recipient has blocked your business number
   - Implement SMS fallback

3. **Rate Limit Exceeded**
   - Implement proper rate limiting
   - Monitor sending patterns
   - Consider user behavior analysis

4. **Cost Issues**
   - Monitor WhatsApp vs SMS usage
   - Implement cost-aware delivery logic
   - Set up billing alerts

## Security Best Practices

1. **OTP Security**
   - 6-digit codes minimum
   - 5-minute expiry maximum
   - Limit verification attempts (3 max)
   - Clear OTP after successful verification

2. **Phone Number Validation**
   - Validate phone number format
   - Verify country code compatibility
   - Check for WhatsApp availability

3. **User Privacy**
   - Don't log OTP codes
   - Secure transmission only
   - Clear sensitive data promptly

## Monitoring and Analytics

1. **Track Delivery Rates**
   - WhatsApp delivery success
   - SMS fallback usage
   - User completion rates

2. **Monitor Costs**
   - WhatsApp message costs
   - SMS backup costs
   - Overall authentication costs

3. **User Experience**
   - Time to receive OTP
   - Verification success rates
   - User preference analytics

## Support

For issues with:
- **Twilio Integration**: Contact Twilio Support
- **WhatsApp Approval**: Submit WhatsApp Business support ticket
- **Code Issues**: Check the implementation in `/lib/otp-service.ts`

## Next Steps

1. Apply for WhatsApp Business API access
2. Create and submit OTP template for approval
3. Configure environment variables
4. Test the integration thoroughly
5. Monitor delivery rates and costs
6. Implement additional security measures as needed

---

**Note**: WhatsApp Business API approval can take several days. Plan accordingly and have SMS as a reliable fallback option.