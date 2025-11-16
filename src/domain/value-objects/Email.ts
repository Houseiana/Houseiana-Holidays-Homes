/**
 * Email Value Object
 * Encapsulates email validation and formatting
 * Demonstrates Encapsulation and Validation
 */
export class Email {
  private readonly _value: string;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string) {
    this._value = value.toLowerCase().trim();
  }

  public static create(value: string): Email {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error('Email cannot be empty');
    }

    if (!this.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email format: ${trimmed}`);
    }

    if (trimmed.length > 254) {
      throw new Error('Email address is too long');
    }

    return new Email(trimmed);
  }

  public get value(): string {
    return this._value;
  }

  public get domain(): string {
    return this._value.split('@')[1];
  }

  public get localPart(): string {
    return this._value.split('@')[0];
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
