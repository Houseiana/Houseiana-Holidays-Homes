import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, VerificationChannel, isTwilioConfigured, isEmailConfigured } from '@/lib/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient, channel } = body as { recipient: string; channel: VerificationChannel };

    // Validate inputs
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient (phone number or email) is required' },
        { status: 400 }
      );
    }

    if (!channel || !['sms', 'whatsapp', 'email'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be: sms, whatsapp, or email' },
        { status: 400 }
      );
    }

    // Check if services are configured
    if ((channel === 'sms' || channel === 'whatsapp') && !isTwilioConfigured()) {
      return NextResponse.json(
        {
          error: 'Twilio is not properly configured',
          details: 'Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID environment variables'
        },
        { status: 500 }
      );
    }

    if (channel === 'email' && !isEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Email service is not properly configured',
          details: 'Please check SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables'
        },
        { status: 500 }
      );
    }

    // Send OTP
    const result = await sendOTP(recipient, channel);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        channel: channel,
      });
    } else {
      return NextResponse.json(
        {
          error: result.message,
          details: result.error
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send verification code',
        details: error.message
      },
      { status: 500 }
    );
  }
}
