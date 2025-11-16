/**
 * Prisma User Repository
 * Concrete implementation of IUserRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, UserRole, UserStatus } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const prismaData = UserMapper.toPrisma(user);
    const created = await this.prisma.user.create({
      data: prismaData,
    });
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const prismaData = UserMapper.toPrisma(user);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: prismaData,
    });
    return UserMapper.toDomain(updated);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    // Using Prisma ID as Clerk ID for compatibility
    const user = await this.prisma.user.findUnique({
      where: { id: clerkId },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    let where: any = {};

    switch (role) {
      case UserRole.HOST:
        where = { isHost: true };
        break;
      case UserRole.ADMIN:
        where = { isAdmin: true };
        break;
      case UserRole.GUEST:
      default:
        where = { isHost: false, isAdmin: false };
        break;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainList(users);
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    let where: any = {};

    switch (status) {
      case UserStatus.SUSPENDED:
        where = {
          accountLockedUntil: {
            gt: new Date(),
          },
        };
        break;
      case UserStatus.ACTIVE:
      default:
        where = {
          OR: [
            { accountLockedUntil: null },
            { accountLockedUntil: { lte: new Date() } },
          ],
        };
        break;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainList(users);
  }

  async findHosts(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isHost: true },
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainList(users);
  }

  async findSuperhosts(): Promise<User[]> {
    // Simplified: In a real system, would query based on superhost criteria
    const users = await this.prisma.user.findMany({
      where: {
        isHost: true,
        // Additional superhost criteria would go here
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter in domain layer for superhost status
    const domainUsers = UserMapper.toDomainList(users);
    return domainUsers.filter(user => user.isSuperhost());
  }

  async findVerified(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        emailVerified: true,
        phoneVerified: true,
        kycCompleted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainList(users);
  }

  async findInactiveUsers(daysInactive: number): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { lastLoginAt: null },
          { lastLoginAt: { lt: cutoffDate } },
        ],
      },
      orderBy: { lastLoginAt: 'asc' },
    });

    return UserMapper.toDomainList(users);
  }

  async searchByName(query: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit results
    });

    return UserMapper.toDomainList(users);
  }

  async count(): Promise<number> {
    return await this.prisma.user.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    let where: any = {};

    switch (role) {
      case UserRole.HOST:
        where = { isHost: true };
        break;
      case UserRole.ADMIN:
        where = { isAdmin: true };
        break;
      case UserRole.GUEST:
      default:
        where = { isHost: false, isAdmin: false };
        break;
    }

    return await this.prisma.user.count({ where });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value },
    });
    return count > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });
    return count > 0;
  }
}
