/**
 * PhoneNumber Value Object
 * Encapsulates phone number validation and formatting
 */
export class PhoneNumber {
  private readonly _value: string;
  private readonly _countryCode: string;

  private constructor(value: string, countryCode: string) {
    this._value = value;
    this._countryCode = countryCode;
  }

  public static create(value: string, countryCode: string = '+974'): PhoneNumber {
    const cleaned = value.replace(/\D/g, ''); // Remove non-digits

    if (!cleaned) {
      throw new Error('Phone number cannot be empty');
    }

    if (cleaned.length < 7 || cleaned.length > 15) {
      throw new Error('Invalid phone number length');
    }

    return new PhoneNumber(cleaned, countryCode);
  }

  public get value(): string {
    return this._value;
  }

  public get countryCode(): string {
    return this._countryCode;
  }

  public get fullNumber(): string {
    return `${this._countryCode}${this._value}`;
  }

  public format(style: 'international' | 'national' = 'international'): string {
    if (style === 'international') {
      return `${this._countryCode} ${this._value}`;
    }
    // Simple national format
    return this._value.replace(/(\d{3})(\d{4})/, '$1-$2');
  }

  public equals(other: PhoneNumber): boolean {
    return this._value === other._value && this._countryCode === other._countryCode;
  }

  public toString(): string {
    return this.fullNumber;
  }

  public toJSON(): { value: string; countryCode: string } {
    return {
      value: this._value,
      countryCode: this._countryCode,
    };
  }
}
