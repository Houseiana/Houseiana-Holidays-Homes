/**
 * Prisma Favorite Repository
 * Concrete implementation of IFavoriteRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { Favorite } from '@/domain/entities/Favorite';

export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(favorite: Favorite): Promise<Favorite> {
    const created = await this.prisma.favorite.create({
      data: {
        id: favorite.id,
        userId: favorite.userId,
        propertyId: favorite.propertyId,
        notes: favorite.notes,
      },
    });

    return Favorite.reconstitute({
      id: created.id,
      userId: created.userId,
      propertyId: created.propertyId,
      notes: created.notes || undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: string): Promise<Favorite | null> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) return null;

    return Favorite.reconstitute({
      id: favorite.id,
      userId: favorite.userId,
      propertyId: favorite.propertyId,
      notes: favorite.notes || undefined,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Favorite[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => Favorite.reconstitute({
      id: f.id,
      userId: f.userId,
      propertyId: f.propertyId,
      notes: f.notes || undefined,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }

  async findByUserIdAndPropertyId(userId: string, propertyId: string): Promise<Favorite | null> {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, propertyId },
    });

    if (!favorite) return null;

    return Favorite.reconstitute({
      id: favorite.id,
      userId: favorite.userId,
      propertyId: favorite.propertyId,
      notes: favorite.notes || undefined,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    });
  }

  async update(favorite: Favorite): Promise<Favorite> {
    const updated = await this.prisma.favorite.update({
      where: { id: favorite.id },
      data: {
        notes: favorite.notes,
        updatedAt: new Date(),
      },
    });

    return Favorite.reconstitute({
      id: updated.id,
      userId: updated.userId,
      propertyId: updated.propertyId,
      notes: updated.notes || undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.favorite.delete({
      where: { id },
    });
  }

  async deleteByUserIdAndPropertyId(userId: string, propertyId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.prisma.favorite.count({
      where: { userId },
    });
  }

  async exists(userId: string, propertyId: string): Promise<boolean> {
    const count = await this.prisma.favorite.count({
      where: { userId, propertyId },
    });
    return count > 0;
  }
}
