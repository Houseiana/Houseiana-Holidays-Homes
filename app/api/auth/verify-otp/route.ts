import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, VerificationChannel } from '@/lib/twilio-service';
import { OTPStorage } from '@/lib/otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both old format (recipient, channel) and new format (email, code)
    const recipient = body.recipient || body.email;
    const code = body.code;
    let channel = body.channel as VerificationChannel;

    // Auto-detect channel from email field if not provided
    if (!channel && body.email) {
      channel = 'email';
    }

    console.log('🔍 Verify OTP Request:', {
      recipient: recipient?.substring(0, 5) + '***',
      fullRecipient: recipient, // For debugging - remove in production
      channel,
      codeLength: code?.length,
      code: code // For debugging - remove in production
    });

    // Validate inputs
    if (!recipient || !code) {
      console.error('❌ Missing recipient or code');
      return NextResponse.json(
        { success: false, error: 'Recipient and code are required' },
        { status: 400 }
      );
    }

    if (!channel || !['sms', 'whatsapp', 'email'].includes(channel)) {
      console.error('❌ Invalid or missing channel:', channel);
      return NextResponse.json(
        { success: false, error: 'Invalid channel. Must be: sms, whatsapp, or email' },
        { status: 400 }
      );
    }

    // Verify OTP - Use different verification methods based on channel
    console.log('📞 Calling verification function...');
    let result;

    if (channel === 'email') {
      // Use OTPStorage for email verification
      result = await OTPStorage.verifyOTP(recipient, code, channel);
    } else {
      // Use Twilio for SMS/WhatsApp verification
      result = await verifyOTP(recipient, code, channel);
    }

    console.log('📋 Verification result:', result);

    if (result.success) {
      console.log('✅ OTP verification successful');
      return NextResponse.json({
        success: true,
        message: result.message,
        verified: true,
      });
    } else {
      console.log('❌ OTP verification failed:', result.message);
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          verified: false,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error.message);
    console.error('Error details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed',
        details: error.message,
        verified: false,
      },
      { status: 500 }
    );
  }
}
