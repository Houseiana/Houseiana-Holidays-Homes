import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, use Redis or a database
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the code with 10-minute expiration
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    verificationCodes.set(fullPhoneNumber, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // In production, you would send this via Twilio, AWS SNS, or another SMS service
    // For demo purposes, we'll just log it
    console.log(`SMS Code for ${fullPhoneNumber}: ${code}`);

    // TODO: Integrate with SMS service
    // Example with Twilio:
    // const twilioClient = require('twilio')(accountSid, authToken);
    // await twilioClient.messages.create({
    //   body: `Your Houseiana verification code is: ${code}`,
    //   from: '+1234567890',
    //   to: fullPhoneNumber,
    // });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      // For demo purposes only - remove in production
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
