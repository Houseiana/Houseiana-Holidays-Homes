import { NextRequest, NextResponse } from 'next/server';

// This should match the storage used in send-sms
// In production, use Redis or a database
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      );
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const storedData = verificationCodes.get(fullPhoneNumber);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found for this number' },
        { status: 404 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(fullPhoneNumber);
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Code is valid - remove it from storage
    verificationCodes.delete(fullPhoneNumber);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
