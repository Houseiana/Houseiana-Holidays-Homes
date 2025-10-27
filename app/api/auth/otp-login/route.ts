import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email, userType } = await request.json();

    if (!phoneNumber && !email) {
      return NextResponse.json(
        { error: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    // Find user by phone number or email
    let user = null;
    if (phoneNumber) {
      user = await (prisma as any).user.findUnique({
        where: { phone: phoneNumber }
      });
    } else if (email) {
      user = await (prisma as any).user.findUnique({
        where: { email: email }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isHost: user.isHost
    });

    // Create auth response compatible with NextAuth
    const authResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        isPhoneVerified: user.isPhoneVerified
      },
      role: user.userType,
      ...(user.userType === 'host' ? { hostId: user.id } : { guestId: user.id }),
      accessToken: token
    };

    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('OTP login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}