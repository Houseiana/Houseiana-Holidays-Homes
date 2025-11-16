/**
 * User Entity
 * Rich domain entity with role-based behavior and profile management
 * Demonstrates OOP principles: Encapsulation, Polymorphism, Role-based behavior
 */
import { BaseEntity } from './BaseEntity';
import { Email } from '../value-objects/Email';
import { PhoneNumber } from '../value-objects/PhoneNumber';

export enum UserRole {
  GUEST = 'GUEST',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  ID_VERIFIED = 'ID_VERIFIED',
  FULLY_VERIFIED = 'FULLY_VERIFIED',
}

interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  languages?: string[];
  occupation?: string;
  location?: string;
}

interface HostProfile {
  responseRate: number; // 0-100
  responseTime: number; // in hours
  isSuperhost: boolean;
  superhostSince?: Date;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
}

interface UserProps {
  id: string;
  email: Email;
  phoneNumber?: PhoneNumber;
  roles: UserRole[];
  status: UserStatus;
  verificationStatus: VerificationStatus;
  profile: UserProfile;
  hostProfile?: HostProfile;
  clerkId: string; // External auth system ID
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _email: Email;
  private _phoneNumber?: PhoneNumber;
  private _roles: Set<UserRole>;
  private _status: UserStatus;
  private _verificationStatus: VerificationStatus;
  private _profile: UserProfile;
  private _hostProfile?: HostProfile;
  private _clerkId: string;
  private _lastLoginAt?: Date;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._roles = new Set(props.roles);
    this._status = props.status;
    this._verificationStatus = props.verificationStatus;
    this._profile = props.profile;
    this._hostProfile = props.hostProfile;
    this._clerkId = props.clerkId;
    this._lastLoginAt = props.lastLoginAt;
  }

  public static create(props: Omit<UserProps, 'id' | 'status' | 'verificationStatus' | 'roles'>): User {
    const user = new User({
      ...props,
      id: crypto.randomUUID(),
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
      roles: [UserRole.GUEST], // All users start as guests
    });

    user.validate();
    return user;
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Getters
  public get email(): Email {
    return this._email;
  }

  public get phoneNumber(): PhoneNumber | undefined {
    return this._phoneNumber;
  }

  public get roles(): UserRole[] {
    return Array.from(this._roles);
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get verificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }

  public get profile(): UserProfile {
    return { ...this._profile };
  }

  public get hostProfile(): HostProfile | undefined {
    return this._hostProfile ? { ...this._hostProfile } : undefined;
  }

  public get clerkId(): string {
    return this._clerkId;
  }

  public get lastLoginAt(): Date | undefined {
    return this._lastLoginAt ? new Date(this._lastLoginAt) : undefined;
  }

  public get fullName(): string {
    return `${this._profile.firstName} ${this._profile.lastName}`;
  }

  // Business Logic Methods

  /**
   * Update user profile
   */
  public updateProfile(updates: Partial<UserProfile>): void {
    if (updates.firstName !== undefined) {
      if (!updates.firstName.trim()) {
        throw new Error('First name cannot be empty');
      }
      this._profile.firstName = updates.firstName.trim();
    }

    if (updates.lastName !== undefined) {
      if (!updates.lastName.trim()) {
        throw new Error('Last name cannot be empty');
      }
      this._profile.lastName = updates.lastName.trim();
    }

    if (updates.bio !== undefined) {
      if (updates.bio.length > 1000) {
        throw new Error('Bio cannot exceed 1000 characters');
      }
      this._profile.bio = updates.bio.trim();
    }

    if (updates.avatarUrl !== undefined) {
      this._profile.avatarUrl = updates.avatarUrl;
    }

    if (updates.dateOfBirth !== undefined) {
      this.validateAge(updates.dateOfBirth);
      this._profile.dateOfBirth = updates.dateOfBirth;
    }

    if (updates.languages !== undefined) {
      this._profile.languages = updates.languages;
    }

    if (updates.occupation !== undefined) {
      this._profile.occupation = updates.occupation;
    }

    if (updates.location !== undefined) {
      this._profile.location = updates.location;
    }

    this.touch();
  }

  /**
   * Validate user is at least 18 years old
   */
  private validateAge(dateOfBirth: Date): void {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    const dayDiff = today.getDate() - dateOfBirth.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    if (actualAge < 18) {
      throw new Error('User must be at least 18 years old');
    }
  }

  /**
   * Update phone number
   */
  public updatePhoneNumber(phoneNumber: PhoneNumber): void {
    this._phoneNumber = phoneNumber;
    // Reset phone verification when phone number changes
    if (
      this._verificationStatus === VerificationStatus.PHONE_VERIFIED ||
      this._verificationStatus === VerificationStatus.FULLY_VERIFIED
    ) {
      this._verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    }
    this.touch();
  }

  /**
   * Add role to user
   */
  public addRole(role: UserRole): void {
    if (this._roles.has(role)) {
      throw new Error(`User already has ${role} role`);
    }

    this._roles.add(role);

    // Initialize host profile when user becomes a host
    if (role === UserRole.HOST && !this._hostProfile) {
      this._hostProfile = {
        responseRate: 0,
        responseTime: 24,
        isSuperhost: false,
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
      };
    }

    this.touch();
  }

  /**
   * Remove role from user
   */
  public removeRole(role: UserRole): void {
    if (!this._roles.has(role)) {
      throw new Error(`User does not have ${role} role`);
    }

    // Cannot remove GUEST role if it's the only role
    if (role === UserRole.GUEST && this._roles.size === 1) {
      throw new Error('Cannot remove GUEST role if it is the only role');
    }

    // Cannot remove ADMIN role if user is the only admin (would need to check this in service layer)
    this._roles.delete(role);

    // Remove host profile when host role is removed
    if (role === UserRole.HOST) {
      this._hostProfile = undefined;
    }

    this.touch();
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: UserRole): boolean {
    return this._roles.has(role);
  }

  /**
   * Check if user is a host
   */
  public isHost(): boolean {
    return this._roles.has(UserRole.HOST);
  }

  /**
   * Check if user is an admin
   */
  public isAdmin(): boolean {
    return this._roles.has(UserRole.ADMIN);
  }

  /**
   * Check if user is a superhost
   */
  public isSuperhost(): boolean {
    return this._hostProfile?.isSuperhost || false;
  }

  /**
   * Verify email
   */
  public verifyEmail(): void {
    if (this._verificationStatus === VerificationStatus.UNVERIFIED) {
      this._verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    }
    this.touch();
  }

  /**
   * Verify phone
   */
  public verifyPhone(): void {
    if (!this._phoneNumber) {
      throw new Error('Phone number must be set before verification');
    }

    if (this._verificationStatus === VerificationStatus.EMAIL_VERIFIED) {
      this._verificationStatus = VerificationStatus.PHONE_VERIFIED;
    }
    this.touch();
  }

  /**
   * Verify ID (government-issued ID)
   */
  public verifyId(): void {
    if (this._verificationStatus === VerificationStatus.PHONE_VERIFIED) {
      this._verificationStatus = VerificationStatus.ID_VERIFIED;
    }
    this.touch();
  }

  /**
   * Mark as fully verified
   */
  public markFullyVerified(): void {
    this._verificationStatus = VerificationStatus.FULLY_VERIFIED;
    this.touch();
  }

  /**
   * Check if user is verified
   */
  public isVerified(): boolean {
    return (
      this._verificationStatus === VerificationStatus.FULLY_VERIFIED ||
      this._verificationStatus === VerificationStatus.ID_VERIFIED
    );
  }

  /**
   * Suspend user account
   */
  public suspend(reason: string): void {
    if (!reason?.trim()) {
      throw new Error('Suspension reason is required');
    }

    if (this._status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended');
    }

    this._status = UserStatus.SUSPENDED;
    this.touch();
  }

  /**
   * Ban user account
   */
  public ban(reason: string): void {
    if (!reason?.trim()) {
      throw new Error('Ban reason is required');
    }

    if (this._status === UserStatus.BANNED) {
      throw new Error('User is already banned');
    }

    this._status = UserStatus.BANNED;
    this.touch();
  }

  /**
   * Reactivate suspended/banned account
   */
  public reactivate(): void {
    if (this._status === UserStatus.ACTIVE) {
      throw new Error('User is already active');
    }

    this._status = UserStatus.ACTIVE;
    this.touch();
  }

  /**
   * Deactivate account (user-initiated)
   */
  public deactivate(): void {
    if (this._status === UserStatus.INACTIVE) {
      throw new Error('User is already inactive');
    }

    this._status = UserStatus.INACTIVE;
    this.touch();
  }

  /**
   * Check if user can perform actions
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * Check if user can book properties
   */
  public canBook(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * Check if user can list properties
   */
  public canListProperties(): boolean {
    return (
      this._status === UserStatus.ACTIVE &&
      this.isHost() &&
      this.isVerified()
    );
  }

  /**
   * Record user login
   */
  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this.touch();
  }

  /**
   * Update host metrics
   */
  public updateHostMetrics(updates: {
    responseRate?: number;
    responseTime?: number;
    totalListings?: number;
    totalBookings?: number;
    totalRevenue?: number;
  }): void {
    if (!this.isHost()) {
      throw new Error('User is not a host');
    }

    if (!this._hostProfile) {
      throw new Error('Host profile not initialized');
    }

    if (updates.responseRate !== undefined) {
      if (updates.responseRate < 0 || updates.responseRate > 100) {
        throw new Error('Response rate must be between 0 and 100');
      }
      this._hostProfile.responseRate = updates.responseRate;
    }

    if (updates.responseTime !== undefined) {
      if (updates.responseTime < 0) {
        throw new Error('Response time cannot be negative');
      }
      this._hostProfile.responseTime = updates.responseTime;
    }

    if (updates.totalListings !== undefined) {
      this._hostProfile.totalListings = updates.totalListings;
    }

    if (updates.totalBookings !== undefined) {
      this._hostProfile.totalBookings = updates.totalBookings;
    }

    if (updates.totalRevenue !== undefined) {
      this._hostProfile.totalRevenue = updates.totalRevenue;
    }

    // Check for superhost status
    this.evaluateSuperhostStatus();

    this.touch();
  }

  /**
   * Evaluate if user qualifies for superhost status
   * Criteria: Response rate > 90%, response time < 24h, 10+ bookings
   */
  private evaluateSuperhostStatus(): void {
    if (!this._hostProfile) return;

    const qualifies =
      this._hostProfile.responseRate > 90 &&
      this._hostProfile.responseTime < 24 &&
      this._hostProfile.totalBookings >= 10;

    if (qualifies && !this._hostProfile.isSuperhost) {
      this._hostProfile.isSuperhost = true;
      this._hostProfile.superhostSince = new Date();
    } else if (!qualifies && this._hostProfile.isSuperhost) {
      this._hostProfile.isSuperhost = false;
      this._hostProfile.superhostSince = undefined;
    }
  }

  /**
   * Validate user business rules
   */
  public validate(): void {
    if (!this._clerkId?.trim()) {
      throw new Error('Clerk ID is required');
    }

    if (!this._profile.firstName?.trim()) {
      throw new Error('First name is required');
    }

    if (!this._profile.lastName?.trim()) {
      throw new Error('Last name is required');
    }

    if (this._profile.firstName.length > 50) {
      throw new Error('First name cannot exceed 50 characters');
    }

    if (this._profile.lastName.length > 50) {
      throw new Error('Last name cannot exceed 50 characters');
    }

    if (this._profile.bio && this._profile.bio.length > 1000) {
      throw new Error('Bio cannot exceed 1000 characters');
    }

    if (this._profile.dateOfBirth) {
      this.validateAge(this._profile.dateOfBirth);
    }

    if (this._roles.size === 0) {
      throw new Error('User must have at least one role');
    }

    // Host-specific validation
    if (this.isHost() && !this._hostProfile) {
      throw new Error('Host profile is required for users with HOST role');
    }
  }

  /**
   * Get user summary
   */
  public getSummary(): string {
    const rolesText = Array.from(this._roles).join(', ');
    const superhostBadge = this.isSuperhost() ? ' (Superhost)' : '';
    return `${this.fullName}${superhostBadge} - ${rolesText}`;
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      email: this._email.toJSON(),
      phoneNumber: this._phoneNumber?.toJSON(),
      roles: Array.from(this._roles),
      status: this._status,
      verificationStatus: this._verificationStatus,
      profile: this._profile,
      hostProfile: this._hostProfile,
      clerkId: this._clerkId,
      lastLoginAt: this._lastLoginAt?.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
