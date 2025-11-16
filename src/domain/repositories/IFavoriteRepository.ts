/**
 * Favorite Repository Interface
 * Defines contract for favorite/wishlist data access
 */
import { Favorite } from '../entities/Favorite';

export interface IFavoriteRepository {
  create(favorite: Favorite): Promise<Favorite>;
  findById(id: string): Promise<Favorite | null>;
  findByUserId(userId: string): Promise<Favorite[]>;
  findByUserIdAndPropertyId(userId: string, propertyId: string): Promise<Favorite | null>;
  update(favorite: Favorite): Promise<Favorite>;
  delete(id: string): Promise<void>;
  deleteByUserIdAndPropertyId(userId: string, propertyId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
  exists(userId: string, propertyId: string): Promise<boolean>;
}
