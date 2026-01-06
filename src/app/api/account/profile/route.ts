import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { EmailAddress, PhoneNumber } from '@clerk/nextjs/server';

/**
 * GET /api/account/profile
 * Returns the current user's profile data from Clerk
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      (email: EmailAddress) => email.id === user.primaryEmailAddressId
    );

    // Get primary phone
    const primaryPhone = user.phoneNumbers.find(
      (phone: PhoneNumber) => phone.id === user.primaryPhoneNumberId
    );

    // Get metadata for additional fields
    const metadata = (user.publicMetadata || {}) as Record<string, any>;

    // Mask email for display
    const maskEmail = (email: string) => {
      const [local, domain] = email.split('@');
      if (local.length <= 2) return `${local[0]}••••@${domain}`;
      return `${local[0]}••••${local[local.length - 1]}@${domain}`;
    };

    // Mask phone for display
    const maskPhone = (phone: string) => {
      if (phone.length <= 4) return phone;
      const last4 = phone.slice(-4);
      const prefix = phone.slice(0, phone.length - 8);
      return `${prefix} •••• ••${last4.slice(-2)}`;
    };

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        preferredName: metadata.preferredName || '',
        email: primaryEmail?.emailAddress || '',
        emailMasked: primaryEmail ? maskEmail(primaryEmail.emailAddress) : '',
        emailVerified: primaryEmail?.verification?.status === 'verified',
        phone: primaryPhone?.phoneNumber || '',
        phoneMasked: primaryPhone ? maskPhone(primaryPhone.phoneNumber) : '',
        phoneVerified: primaryPhone?.verification?.status === 'verified',
        imageUrl: user.imageUrl,
        // Additional metadata fields
        address: metadata.address || null,
        emergencyContact: metadata.emergencyContact || null,
        governmentId: metadata.governmentId || { verified: false, type: null },
      },
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/profile
 * Updates user profile data in Clerk
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { field, data } = body;

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    switch (field) {
      case 'legalName': {
        // Update first and last name in Clerk
        await clerk.users.updateUser(userId, {
          firstName: data.firstName,
          lastName: data.lastName,
        });
        break;
      }

      case 'preferredName': {
        // Store in public metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            preferredName: data.preferredName,
          },
        });
        break;
      }

      case 'email': {
        // For email, Clerk requires verification flow
        // We'll create a new email address and it will need to be verified
        const existingEmail = user.emailAddresses.find(
          (e: EmailAddress) => e.emailAddress === data.email
        );

        if (!existingEmail) {
          // Create new email (user will need to verify it)
          const newEmail = await clerk.emailAddresses.createEmailAddress({
            userId,
            emailAddress: data.email,
          });

          // Note: Verification must be triggered from the client side or via a different flow
          // as the backend API does not support prepareVerification directly in this context.

          return NextResponse.json({
            success: true,
            message: 'Email added. Please verify it in your account settings.',
            requiresVerification: true,
            emailId: newEmail.id,
          });
        }
        break;
      }

      case 'phone': {
        // For phone, Clerk requires verification flow
        const existingPhone = user.phoneNumbers.find(
          (p: PhoneNumber) => p.phoneNumber === data.phone
        );

        if (!existingPhone) {
          // Create new phone (user will need to verify it)
          const newPhone = await clerk.phoneNumbers.createPhoneNumber({
            userId,
            phoneNumber: data.phone,
          });

          // Note: Verification must be triggered from the client side or via a different flow
          // as the backend API does not support prepareVerification directly in this context.

          return NextResponse.json({
            success: true,
            message: 'Phone number added. Please verify it in your account settings.',
            requiresVerification: true,
            phoneId: newPhone.id,
          });
        }
        break;
      }

      case 'address': {
        // Store in public metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            address: {
              street: data.street,
              apt: data.apt,
              city: data.city,
              state: data.state,
              zip: data.zip,
              country: data.country,
            },
          },
        });
        break;
      }

      case 'emergencyContact': {
        // Store in public metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            emergencyContact: {
              name: data.name,
              relationship: data.relationship,
              phone: data.phone,
              email: data.email,
            },
          },
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid field' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
