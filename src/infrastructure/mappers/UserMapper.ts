/**
 * User Mapper
 * Converts between Prisma models and Domain entities
 */
import { User as PrismaUser } from '@prisma/client';
import { User, UserRole, UserStatus, VerificationStatus } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export class UserMapper {
  static toDomain(prisma: PrismaUser): User {
    // Create Email value object
    const email = Email.create(prisma.email || 'unknown@example.com');

    // Create PhoneNumber value object if available
    const phoneNumber =
      prisma.phone && prisma.countryCode
        ? PhoneNumber.create(prisma.phone, prisma.countryCode)
        : undefined;

    // Map roles from Prisma to Domain
    const roles: UserRole[] = [];
    if (!prisma.isHost && !prisma.isAdmin) {
      roles.push(UserRole.GUEST);
    }
    if (prisma.isHost) {
      roles.push(UserRole.HOST);
      // Hosts are also guests
      if (!roles.includes(UserRole.GUEST)) {
        roles.push(UserRole.GUEST);
      }
    }
    if (prisma.isAdmin) {
      roles.push(UserRole.ADMIN);
    }

    // Ensure at least GUEST role
    if (roles.length === 0) {
      roles.push(UserRole.GUEST);
    }

    // Map status
    let status = UserStatus.ACTIVE;
    if (prisma.accountLockedUntil && prisma.accountLockedUntil > new Date()) {
      status = UserStatus.SUSPENDED;
    }

    // Map verification status
    let verificationStatus = VerificationStatus.UNVERIFIED;
    if (prisma.kycCompleted) {
      verificationStatus = VerificationStatus.FULLY_VERIFIED;
    } else if (prisma.emailVerified && prisma.phoneVerified) {
      verificationStatus = VerificationStatus.PHONE_VERIFIED;
    } else if (prisma.emailVerified) {
      verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    }

    // Create host profile if user is a host
    const hostProfile = prisma.isHost
      ? {
          responseRate: 0,
          responseTime: 24,
          isSuperhost: false,
          totalListings: 0,
          totalBookings: 0,
          totalRevenue: 0,
        }
      : undefined;

    // Reconstitute User entity
    return User.reconstitute({
      id: prisma.id,
      email,
      phoneNumber,
      roles,
      status,
      verificationStatus,
      profile: {
        firstName: prisma.firstName,
        lastName: prisma.lastName,
        bio: undefined,
        avatarUrl: prisma.profilePhoto || undefined,
        dateOfBirth: prisma.birthDate ? new Date(prisma.birthDate) : undefined,
        languages: undefined,
        occupation: undefined,
        location: undefined,
      },
      hostProfile,
      clerkId: prisma.id, // Using Prisma ID as Clerk ID for compatibility
      lastLoginAt: prisma.lastLoginAt || undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPrisma(domain: User): Omit<PrismaUser, 'accounts' | 'otpCodes' | 'referrals' | 'sessions' | 'properties' | 'bookings' | 'reviews' | 'favorites'> {
    return {
      id: domain.id,
      firstName: domain.profile.firstName,
      lastName: domain.profile.lastName,
      email: domain.email.value,
      password: null, // Managed by Clerk
      phone: domain.phoneNumber?.value || null,
      countryCode: domain.phoneNumber?.countryCode || null,
      userType: domain.isHost() ? 'HOST' : 'GUEST',
      isAdmin: domain.isAdmin(),
      profilePhoto: domain.profile.avatarUrl || null,
      birthDate: domain.profile.dateOfBirth?.toISOString() || null,
      isPhoneVerified: domain.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
                       domain.verificationStatus === VerificationStatus.FULLY_VERIFIED,
      isHost: domain.isHost(),
      memberSince: domain.createdAt,
      emailVerified: domain.verificationStatus !== VerificationStatus.UNVERIFIED,
      phoneVerified: domain.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
                     domain.verificationStatus === VerificationStatus.FULLY_VERIFIED,
      travelPoints: 0,
      loyaltyTier: 'Bronze',
      idNumber: null,
      idCopy: null,
      kycCompleted: domain.verificationStatus === VerificationStatus.FULLY_VERIFIED,
      avatar: domain.profile.avatarUrl || null,
      passwordResetToken: null,
      passwordResetExpires: null,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      failedLoginAttempts: 0,
      accountLockedUntil: domain.status === UserStatus.SUSPENDED ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      lastLoginAt: domain.lastLoginAt || null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  static toDomainList(prismaList: PrismaUser[]): User[] {
    return prismaList.map(prisma => this.toDomain(prisma));
  }
}
