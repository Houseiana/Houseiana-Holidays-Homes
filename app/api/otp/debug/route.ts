import { NextRequest, NextResponse } from 'next/server';
import { OTPStorage } from '@/lib/otp-storage';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const storedOTPs = await OTPStorage.getAllStoredOTPs();

    return NextResponse.json({
      success: true,
      storedOTPs,
      count: Object.keys(storedOTPs).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve debug info' },
      { status: 500 }
    );
  }
}