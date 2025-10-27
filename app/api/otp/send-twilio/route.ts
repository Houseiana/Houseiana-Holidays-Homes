import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, method } = await request.json();

    // Check if we have real Twilio credentials (not placeholder values)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    const hasTwilioConfig = twilioAccountSid &&
                           twilioAuthToken &&
                           twilioAccountSid !== 'your-twilio-account-sid-here' &&
                           twilioAuthToken !== 'your-twilio-auth-token-here' &&
                           twilioAccountSid.startsWith('AC');

    if (hasTwilioConfig) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!accountSid || !authToken) {
        return NextResponse.json(
          { success: false, message: 'Twilio configuration missing' },
          { status: 500 }
        );
      }

      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);

      // Use Twilio Verify for SMS and Email
      if (!serviceSid) {
        return NextResponse.json(
          { success: false, message: 'Twilio Verify service configuration missing' },
          { status: 500 }
        );
      }

      // Determine the channel based on method
      const channel = method === 'email' ? 'email' : 'sms';

      const verification = await client.verify
        .services(serviceSid)
        .verifications
        .create({
          to: phoneNumber,
          channel: channel
        });

      return NextResponse.json({
        success: true,
        message: `OTP sent via ${method.toUpperCase()} to ${phoneNumber}`,
        sessionId: verification.sid
      });
    }

    // Demo mode - Twilio credentials not configured
    console.log(`Demo mode: Simulating OTP send to ${phoneNumber} via ${method.toUpperCase()}`);

    return NextResponse.json({
      success: true,
      message: `📱 Demo Mode: OTP simulation for ${phoneNumber} via ${method.toUpperCase()}`,
      demoCode: '123456',
      sessionId: 'demo_session',
      note: 'Add Twilio credentials to .env.local for real messages'
    });

  } catch (error) {
    console.error('Twilio OTP send error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP via Twilio' },
      { status: 500 }
    );
  }
}