/**
 * User Repository Interface
 * Defines contract for user data access (Repository Pattern)
 * Demonstrates: Dependency Inversion Principle, Interface Segregation
 */
import { User, UserRole, UserStatus } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  /**
   * Save a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find user by Clerk ID (external auth system)
   */
  findByClerkId(clerkId: string): Promise<User | null>;

  /**
   * Find users by role
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Find users by status
   */
  findByStatus(status: UserStatus): Promise<User[]>;

  /**
   * Find all hosts
   */
  findHosts(): Promise<User[]>;

  /**
   * Find all superhosts
   */
  findSuperhosts(): Promise<User[]>;

  /**
   * Find verified users
   */
  findVerified(): Promise<User[]>;

  /**
   * Find users who haven't logged in for X days
   */
  findInactiveUsers(daysInactive: number): Promise<User[]>;

  /**
   * Search users by name
   */
  searchByName(query: string): Promise<User[]>;

  /**
   * Count total users
   */
  count(): Promise<number>;

  /**
   * Count users by role
   */
  countByRole(role: UserRole): Promise<number>;

  /**
   * Delete a user (soft delete recommended)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if user exists by email
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Check if user exists by ID
   */
  exists(id: string): Promise<boolean>;
}
