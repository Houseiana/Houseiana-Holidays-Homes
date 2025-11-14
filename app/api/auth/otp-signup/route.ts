import { NextRequest, NextResponse } from 'next/server';
import { railwayApi } from '@/lib/railway-api';

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

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'First name and last name are required' },
        { status: 400 }
      );
    }

    try {
      // Register new user via Railway API
      const registrationData: any = {
        password,
        firstName,
        lastName,
        email: email || '', // Backend requires email field
        phoneNumber: phoneNumber || '' // Include both fields
      };

      // Add KYC data if provided
      if (idNumber) {
        registrationData.idNumber = idNumber;
      }
      if (idCopy) {
        registrationData.idCopy = idCopy;
      }

      console.log('🚀 Calling Railway API register with:', {
        method,
        hasEmail: !!registrationData.email,
        hasPhone: !!registrationData.phoneNumber,
        hasKYC: !!idNumber
      });

      // Call Railway backend API
      const response = await railwayApi.register(registrationData);

      console.log('✅ Railway API response:', {
        success: response.success,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user
      });

      if (!response.success || !response.data) {
        return NextResponse.json(
          {
            success: false,
            message: response.message || 'Failed to create account'
          },
          { status: 400 }
        );
      }

      // Extract user and token from Railway response
      const { user: railwayUser, token } = response.data;

      // Validate response has required data
      if (!railwayUser || !token) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid response from server'
          },
          { status: 500 }
        );
      }

      // Format user object for frontend
      const user = {
        id: railwayUser.id,
        email: railwayUser.email,
        phone: railwayUser.phoneNumber,
        firstName: railwayUser.firstName,
        lastName: railwayUser.lastName,
        name: `${railwayUser.firstName} ${railwayUser.lastName}`,
        isGuest: railwayUser.isGuest !== undefined ? railwayUser.isGuest : true,
        isHost: railwayUser.isHost !== undefined ? railwayUser.isHost : true,
        hasCompletedKYC: railwayUser.kycCompleted || false
      };

      console.log('✅ User created successfully:', {
        id: user.id,
        hasKYC: user.hasCompletedKYC
      });

      return NextResponse.json({
        success: true,
        token,
        user,
        needsKYC: !user.hasCompletedKYC,
        isNewUser: true
      });

    } catch (apiError: any) {
      console.error('❌ Railway API error:', apiError.message || apiError);

      // Check if user already exists
      if (apiError.message && (
        apiError.message.includes('already exists') ||
        apiError.message.includes('duplicate') ||
        apiError.message.includes('unique constraint')
      )) {
        return NextResponse.json(
          {
            success: false,
            message: method === 'email'
              ? 'An account with this email already exists'
              : 'An account with this phone number already exists'
          },
          { status: 409 }
        );
      }

      // Return generic error
      return NextResponse.json(
        {
          success: false,
          message: apiError.message || 'Failed to create account. Please try again.'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ OTP Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create account'
      },
      { status: 500 }
    );
  }
}
