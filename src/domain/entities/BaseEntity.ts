/**
 * Base Entity Class
 * Implements common entity behavior (Inheritance principle)
 * All domain entities extend this base class
 */
export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public equals(other: BaseEntity): boolean {
    if (!other || !(other instanceof BaseEntity)) {
      return false;
    }
    return this._id === other._id;
  }

  public abstract validate(): void;
  public abstract toJSON(): Record<string, any>;
}
