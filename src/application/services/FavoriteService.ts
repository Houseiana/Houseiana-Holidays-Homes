/**
 * Favorite Service
 * Business logic for favorite/wishlist functionality
 */
import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { IPropertyRepository } from '@/domain/repositories/IPropertyRepository';
import { Favorite } from '@/domain/entities/Favorite';

export class FavoriteService {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly propertyRepository: IPropertyRepository
  ) {}

  /**
   * Add property to user's wishlist
   */
  async addToWishlist(userId: string, propertyId: string, notes?: string): Promise<Favorite> {
    // Validate property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Check if already in wishlist
    const exists = await this.favoriteRepository.exists(userId, propertyId);
    if (exists) {
      throw new Error('Property is already in your wishlist');
    }

    // Create and save favorite
    const favorite = Favorite.create({
      userId,
      propertyId,
      notes,
    });

    favorite.validate();

    return await this.favoriteRepository.create(favorite);
  }

  /**
   * Remove property from user's wishlist
   */
  async removeFromWishlist(userId: string, propertyId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findByUserIdAndPropertyId(userId, propertyId);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    // Authorization check
    if (!favorite.belongsTo(userId)) {
      throw new Error('Unauthorized to remove this favorite');
    }

    await this.favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
  }

  /**
   * Get all favorites for a user with property details
   */
  async getUserWishlist(userId: string): Promise<Array<{
    favorite: Favorite;
    property: any;
  }>> {
    const favorites = await this.favoriteRepository.findByUserId(userId);

    // Fetch property details for each favorite
    const wishlistItems = await Promise.all(
      favorites.map(async (favorite) => {
        const property = await this.propertyRepository.findById(favorite.propertyId);
        return {
          favorite,
          property,
        };
      })
    );

    // Filter out favorites where property no longer exists
    return wishlistItems.filter(item => item.property !== null);
  }

  /**
   * Update notes on a favorite
   */
  async updateNotes(userId: string, favoriteId: string, notes: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findById(favoriteId);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    // Authorization check
    if (!favorite.belongsTo(userId)) {
      throw new Error('Unauthorized to update this favorite');
    }

    favorite.updateNotes(notes);
    return await this.favoriteRepository.update(favorite);
  }

  /**
   * Check if property is in user's wishlist
   */
  async isInWishlist(userId: string, propertyId: string): Promise<boolean> {
    return await this.favoriteRepository.exists(userId, propertyId);
  }

  /**
   * Get wishlist count for a user
   */
  async getWishlistCount(userId: string): Promise<number> {
    return await this.favoriteRepository.countByUserId(userId);
  }

  /**
   * Get favorite by ID (with authorization check)
   */
  async getFavoriteById(userId: string, favoriteId: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findById(favoriteId);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    // Authorization check
    if (!favorite.belongsTo(userId)) {
      throw new Error('Unauthorized to access this favorite');
    }

    return favorite;
  }

  /**
   * Remove favorite by ID
   */
  async removeFavoriteById(userId: string, favoriteId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findById(favoriteId);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    // Authorization check
    if (!favorite.belongsTo(userId)) {
      throw new Error('Unauthorized to remove this favorite');
    }

    await this.favoriteRepository.delete(favoriteId);
  }
}
