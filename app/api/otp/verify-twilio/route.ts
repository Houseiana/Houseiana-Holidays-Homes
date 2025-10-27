import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    console.log('🔍 Verify Twilio OTP Request:', {
      phoneNumber: phoneNumber?.substring(0, 5) + '***',
      codeLength: code?.length
    });

    // Check if we have real Twilio credentials
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    const hasTwilioConfig = twilioAccountSid &&
                           twilioAuthToken &&
                           twilioAccountSid !== 'your-twilio-account-sid-here' &&
                           twilioAuthToken !== 'your-twilio-auth-token-here' &&
                           twilioAccountSid.startsWith('AC');

    // Demo mode for missing credentials
    if (!hasTwilioConfig) {
      console.log('⚠️ Running in DEMO mode (no Twilio config)');
      if (code === '123456') {
        return NextResponse.json({
          success: true,
          message: '✅ Demo verification successful! (Used demo code 123456)'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `❌ Demo mode: Use code "123456" for testing. You entered: "${code}"`
        });
      }
    }

    // Use Twilio Verify for SMS verification
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      console.error('❌ Twilio configuration missing');
      return NextResponse.json(
        { success: false, message: 'Twilio configuration missing' },
        { status: 500 }
      );
    }

    console.log('📞 Verifying with Twilio Verify API...');
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);

    const verificationCheck = await client.verify
      .services(serviceSid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });

    console.log('📋 Twilio verification status:', verificationCheck.status);

    if (verificationCheck.status === 'approved') {
      console.log('✅ OTP verification successful');
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully!'
      });
    } else {
      console.log('❌ OTP verification failed:', verificationCheck.status);
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP code. Please try again.'
      });
    }

  } catch (error: any) {
    console.error('❌ Twilio OTP verify error:', error.message);
    console.error('Error details:', error);
    return NextResponse.json(
      { success: false, message: `Failed to verify OTP: ${error.message}` },
      { status: 500 }
    );
  }
}