import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, createAuthResponse, generateReferralCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      firstName,
      lastName,
      email,
      password,
      phone,
      countryCode,
      userType,
      profilePhoto,
      birthDate,
      isPhoneVerified
    } = await request.json()

    // Extract firstName and lastName from name if provided separately
    const fName = firstName || name?.split(' ')[0] || '';
    const lName = lastName || name?.split(' ').slice(1).join(' ') || '';

    // Validate input
    if (!fName || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const { validatePassword } = await import('@/lib/password-validation');
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with referral code
    const user = await (prisma as any).user.create({
      data: {
        firstName: fName,
        lastName: lName,
        email,
        password: hashedPassword,
        phone,
        countryCode,
        userType: userType || 'guest',
        profilePhoto,
        birthDate,
        isPhoneVerified: isPhoneVerified || false,
        referrals: {
          create: {
            code: generateReferralCode(),
            bonusAmount: 50 // $50 referral bonus
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isHost: true,
        memberSince: true,
        emailVerified: true,
        phoneVerified: true,
        travelPoints: true,
        loyaltyTier: true
      }
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isHost: user.isHost
    })

    // Create auth response compatible with NextAuth
    const authResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone,
        profilePhoto,
        birthDate,
        isPhoneVerified: user.phoneVerified
      },
      role: userType || 'guest',
      ...(userType === 'host' ? { hostId: user.id } : { guestId: user.id }),
      accessToken: token
    }

    return NextResponse.json(authResponse, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}