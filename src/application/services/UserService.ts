/**
 * User Service
 * Application layer service for user business logic
 * Demonstrates: Dependency Injection, Service Layer Pattern
 */
import { User, UserRole, UserStatus, VerificationStatus } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPropertyRepository } from '@/domain/repositories/IPropertyRepository';
import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
  dateOfBirth?: Date;
  clerkId: string;
}

export interface UpdateUserProfileDTO {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  language?: string;
  currency?: string;
}

export interface UpdateHostProfileDTO {
  bio?: string;
  responseTime?: number;
  acceptanceRate?: number;
  isSuperhost?: boolean;
}

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  /**
   * Create a new user
   */
  async createUser(dto: CreateUserDTO): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create value objects
    const email = Email.create(dto.email);
    const phoneNumber = dto.phone && dto.countryCode
      ? PhoneNumber.create(dto.phone, dto.countryCode)
      : undefined;

    // Create user entity
    const user = User.create({
      email,
      phoneNumber,
      roles: [UserRole.GUEST],
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
      profile: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatar: undefined,
        bio: undefined,
        dateOfBirth: dto.dateOfBirth,
        language: 'en',
        currency: 'QAR',
      },
      clerkId: dto.clerkId,
    });

    // Save user
    return await this.userRepository.create(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return await this.userRepository.findByClerkId(clerkId);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UpdateUserProfileDTO): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update profile using domain logic
    user.updateProfile(updates);

    return await this.userRepository.update(user);
  }

  /**
   * Become a host
   */
  async becomeHost(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate user can become host
    if (!user.isVerified()) {
      throw new Error('User must be verified to become a host');
    }

    // Add host role using domain logic
    user.addRole(UserRole.HOST);

    return await this.userRepository.update(user);
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verifyEmail();

    return await this.userRepository.update(user);
  }

  /**
   * Verify phone number
   */
  async verifyPhone(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.phoneNumber) {
      throw new Error('User has no phone number to verify');
    }

    user.verifyPhone();

    return await this.userRepository.update(user);
  }

  /**
   * Complete ID verification (KYC)
   */
  async completeIdVerification(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isPhoneVerified()) {
      throw new Error('User must verify email and phone before ID verification');
    }

    user.completeIdVerification();

    return await this.userRepository.update(user);
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.suspend(reason);

    return await this.userRepository.update(user);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.deactivate();

    return await this.userRepository.update(user);
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.reactivate();

    return await this.userRepository.update(user);
  }

  /**
   * Update host profile
   */
  async updateHostProfile(userId: string, updates: UpdateHostProfileDTO): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.hasRole(UserRole.HOST)) {
      throw new Error('User is not a host');
    }

    // Update host metrics using domain logic
    user.updateHostMetrics(updates);

    return await this.userRepository.update(user);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalBookings: number;
    totalProperties: number;
    totalReviews: number;
    averageRating: number;
    totalEarnings: number;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get bookings
    const guestBookings = await this.bookingRepository.findByGuestId(userId);
    const hostBookings = await this.bookingRepository.findByHostId(userId);

    // Get properties
    const properties = user.hasRole(UserRole.HOST)
      ? await this.propertyRepository.findByHostId(userId)
      : [];

    // Calculate earnings (from completed bookings as host)
    const totalEarnings = hostBookings
      .filter(b => b.status === 'COMPLETED' as any)
      .reduce((sum, b) => sum + b.totalPrice.amount, 0);

    return {
      totalBookings: guestBookings.length,
      totalProperties: properties.length,
      totalReviews: 0, // TODO: Add review counting when Review entity exists
      averageRating: 0, // TODO: Add rating calculation when Review entity exists
      totalEarnings,
    };
  }

  /**
   * Get all users by role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.findByRole(role);
  }

  /**
   * Get verified hosts
   */
  async getVerifiedHosts(): Promise<User[]> {
    return await this.userRepository.findVerifiedHosts();
  }

  /**
   * Get inactive users
   */
  async getInactiveUsers(daysInactive: number = 90): Promise<User[]> {
    return await this.userRepository.findInactiveUsers(daysInactive);
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<User[]> {
    // Search by email
    const byEmail = await this.userRepository.searchByEmail(query);

    // Search by name
    const byName = await this.userRepository.searchByName(query);

    // Merge and deduplicate results
    const allUsers = [...byEmail, ...byName];
    const uniqueUsers = Array.from(
      new Map(allUsers.map(user => [user.id, user])).values()
    );

    return uniqueUsers;
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateLastLogin();

    return await this.userRepository.update(user);
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for active bookings as guest
    const guestBookings = await this.bookingRepository.findByGuestId(userId);
    const hasActiveGuestBookings = guestBookings.some(b => b.isActive());

    if (hasActiveGuestBookings) {
      throw new Error('Cannot delete user with active bookings as guest');
    }

    // Check for active bookings as host
    if (user.hasRole(UserRole.HOST)) {
      const hostBookings = await this.bookingRepository.findByHostId(userId);
      const hasActiveHostBookings = hostBookings.some(b => b.isActive());

      if (hasActiveHostBookings) {
        throw new Error('Cannot delete user with active bookings as host');
      }

      // Check for published properties
      const properties = await this.propertyRepository.findPublishedByHostId(userId);
      if (properties.length > 0) {
        throw new Error('Cannot delete user with published properties. Please unlist all properties first.');
      }
    }

    await this.userRepository.delete(userId);
  }

  /**
   * Get host dashboard data
   */
  async getHostDashboard(hostId: string): Promise<{
    user: User;
    properties: number;
    publishedProperties: number;
    totalBookings: number;
    pendingBookings: number;
    upcomingBookings: number;
    totalEarnings: number;
    averageRating: number;
  }> {
    const user = await this.userRepository.findById(hostId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.hasRole(UserRole.HOST)) {
      throw new Error('User is not a host');
    }

    // Get properties
    const allProperties = await this.propertyRepository.findByHostId(hostId);
    const publishedProperties = await this.propertyRepository.findPublishedByHostId(hostId);

    // Get bookings
    const bookings = await this.bookingRepository.findByHostId(hostId);
    const pendingBookings = bookings.filter(b => b.isPending()).length;
    const upcomingBookings = bookings.filter(b => b.isUpcoming()).length;

    // Calculate earnings
    const totalEarnings = bookings
      .filter(b => b.status === 'COMPLETED' as any)
      .reduce((sum, b) => sum + b.totalPrice.amount, 0);

    return {
      user,
      properties: allProperties.length,
      publishedProperties: publishedProperties.length,
      totalBookings: bookings.length,
      pendingBookings,
      upcomingBookings,
      totalEarnings,
      averageRating: 0, // TODO: Calculate from reviews when Review entity exists
    };
  }

  /**
   * Get guest dashboard data
   */
  async getGuestDashboard(guestId: string): Promise<{
    user: User;
    upcomingTrips: number;
    currentTrips: number;
    pastTrips: number;
    favoriteProperties: number;
  }> {
    const user = await this.userRepository.findById(guestId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get bookings
    const bookings = await this.bookingRepository.findByGuestId(guestId);
    const upcomingTrips = bookings.filter(b => b.isUpcoming()).length;
    const currentTrips = bookings.filter(b => b.isActive()).length;
    const pastTrips = bookings.filter(b => b.isCompleted()).length;

    // Get favorite properties count
    const favoriteProperties = await this.propertyRepository.countFavoritesByUserId(guestId);

    return {
      user,
      upcomingTrips,
      currentTrips,
      pastTrips,
      favoriteProperties,
    };
  }
}
