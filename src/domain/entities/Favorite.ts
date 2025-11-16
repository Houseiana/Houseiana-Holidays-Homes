/**
 * Favorite Entity
 * Represents a user's favorite/wishlist property
 * Demonstrates: Entity Pattern, Business Logic Encapsulation
 */
import { BaseEntity } from './BaseEntity';

export interface FavoriteProps {
  userId: string;
  propertyId: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Favorite extends BaseEntity {
  private _userId: string;
  private _propertyId: string;
  private _notes?: string;

  private constructor(id: string, props: FavoriteProps, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._propertyId = props.propertyId;
    this._notes = props.notes;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get propertyId(): string {
    return this._propertyId;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  /**
   * Factory method to create a new Favorite
   */
  static create(props: FavoriteProps): Favorite {
    const id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    return new Favorite(id, props, now, now);
  }

  /**
   * Factory method to reconstitute from database
   */
  static reconstitute(props: FavoriteProps & { id: string }): Favorite {
    return new Favorite(
      props.id,
      props,
      props.createdAt || new Date(),
      props.updatedAt || new Date()
    );
  }

  /**
   * Update notes
   */
  updateNotes(notes: string): void {
    this._notes = notes;
    this.touch();
  }

  /**
   * Business logic: Check if favorite belongs to user
   */
  belongsTo(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Validate favorite
   */
  validate(): void {
    if (!this._userId) {
      throw new Error('User ID is required');
    }

    if (!this._propertyId) {
      throw new Error('Property ID is required');
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      propertyId: this._propertyId,
      notes: this._notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
