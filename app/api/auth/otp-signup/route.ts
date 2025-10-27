import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const {
      method,
      phoneNumber,
      email,
      password,
      isVerified,
      firstName,
      lastName,
      idNumber,
      idCopy,
      kycCompleted
    } = await request.json();

    console.log('📝 OTP Signup Request:', {
      method,
      hasPassword: !!password,
      hasKYC: !!firstName && !!lastName,
      isVerified,
      kycCompleted
    });

    // Validate input
    if (!isVerified) {
      return NextResponse.json(
        { success: false, message: 'Phone/Email must be verified first' },
        { status: 400 }
      );
    }

    if (method === 'phone' && !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (method === 'email' && !email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = method === 'phone'
      ? await db.user.findByPhone(phoneNumber)
      : await db.user.findByEmail(email);

    if (existingUser) {
      // User exists - this is a login, not signup
      const token = generateToken({
        userId: existingUser.id,
        email: existingUser.email || '',
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
        isHost: existingUser.is_host
      });

      const user = {
        id: existingUser.id,
        email: existingUser.email,
        phone: existingUser.phone_number,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
        name: `${existingUser.first_name} ${existingUser.last_name}`,
        isGuest: true,
        isHost: existingUser.is_host,
        hasCompletedKYC: existingUser.id_number ? true : false
      };

      return NextResponse.json({
        success: true,
        token,
        user,
        needsKYC: !existingUser.id_number,
        isNewUser: false
      });
    }

    // Validate and hash password if provided
    let hashedPassword = '';
    if (password) {
      // Validate password strength
      const { validatePassword } = await import('@/lib/password-validation');
      const passwordValidation = validatePassword(password);

      if (!passwordValidation.isValid) {
        return NextResponse.json({
          success: false,
          message: 'Password does not meet security requirements',
          details: passwordValidation.errors
        }, { status: 400 });
      }

      const bcrypt = await import('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 for better security
    }

    // Create new user with dual role (Guest + Host)
    const newUser = await db.user.create({
      email: method === 'email' ? email : undefined,
      phoneNumber: method === 'phone' ? phoneNumber : undefined,
      firstName: firstName || '',
      lastName: lastName || '',
      passwordHash: hashedPassword,
      isHost: true, // Dual role: can be both guest and host
      phoneVerifiedAt: method === 'phone' ? new Date() : null,
      emailVerifiedAt: method === 'email' ? new Date() : null,
      // KYC fields
      idNumber: idNumber || undefined,
      idCopyUrl: idCopy || undefined,
      idVerifiedAt: (idNumber && firstName && lastName) ? new Date() : null,
      isActive: true
    });

    console.log('✅ User created successfully:', {
      id: newUser.id,
      hasKYC: !!newUser.id_number
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email || '',
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      isHost: newUser.is_host
    });

    const user = {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone_number,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      name: `${newUser.first_name} ${newUser.last_name}`,
      isGuest: true,
      isHost: newUser.is_host,
      hasCompletedKYC: !!(newUser.id_number && newUser.id_verified_at)
    };

    return NextResponse.json({
      success: true,
      token,
      user,
      needsKYC: !newUser.id_number, // Only need KYC if not completed
      isNewUser: true
    });

  } catch (error) {
    console.error('OTP Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
