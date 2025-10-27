import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
    const sandboxMode = process.env.TWILIO_SANDBOX_MODE === 'true';

    const hasTwilioConfig = twilioAccountSid &&
                           twilioAuthToken &&
                           twilioAccountSid !== 'your-twilio-account-sid-here' &&
                           twilioAuthToken !== 'your-twilio-auth-token-here';

    const hasServiceSid = twilioServiceSid && twilioServiceSid !== 'your-twilio-verify-service-sid-here';

    const status = {
      twilioConfigured: hasTwilioConfig,
      serviceConfigured: hasServiceSid,
      whatsappConfigured: !!whatsappFrom,
      sandboxMode: sandboxMode,
      mode: hasTwilioConfig ? 'twilio' : 'demo',
      details: {
        accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...` : 'Not set',
        serviceSid: hasServiceSid ? `${twilioServiceSid!.substring(0, 6)}...` : 'Not set',
        whatsappFrom: whatsappFrom || 'Not set'
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration status' },
      { status: 500 }
    );
  }
}