import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      countryCode,
      phoneNumber,
      verificationCode,
      firstName,
      lastName,
      birthMonth,
      birthDay,
      birthYear,
      email,
      profilePhoto,
    } = body;

    // Validation
    if (!phoneNumber || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email or phone
    const existingUser = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: `${countryCode}${phoneNumber}` },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or phone number' },
        { status: 409 }
      );
    }

    // Generate a temporary password (user can set it later or use passwordless login)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    // Generate referral code
    const referralCode = `${firstName.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create user
    const user = await (prisma as any).user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: `${countryCode}${phoneNumber}`,
        dateOfBirth: new Date(`${birthYear}-${months.indexOf(birthMonth) + 1}-${birthDay}`),
        profilePhoto,
        referralCode,
        isEmailVerified: false,
        isPhoneVerified: true, // Since they verified via SMS
        role: 'guest',
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isHost: user.isHost,
    });

    // Return user data and token
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}

// Helper to convert month names to numbers
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
