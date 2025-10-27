import { NextRequest, NextResponse } from 'next/server';
import { OTPStorage } from '@/lib/otp-storage';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Verifying email OTP for ${email} with code: ${code}`);

    // Verify the OTP
    const isValid = await OTPStorage.verifyOTP(email, code, 'email');

    if (isValid) {
      console.log(`✅ Email OTP verification successful for ${email}`);

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        verified: true
      });
    } else {
      console.log(`❌ Email OTP verification failed for ${email}`);

      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Email OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}