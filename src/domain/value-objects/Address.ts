/**
 * Address Value Object
 * Encapsulates address validation and formatting
 */
export class Address {
  private readonly _street: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _country: string;
  private readonly _postalCode: string;
  private readonly _coordinates?: { lat: number; lng: number };

  private constructor(
    street: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    coordinates?: { lat: number; lng: number }
  ) {
    this._street = street;
    this._city = city;
    this._state = state;
    this._country = country;
    this._postalCode = postalCode;
    this._coordinates = coordinates;
  }

  public static create(params: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  }): Address {
    if (!params.street?.trim()) {
      throw new Error('Street address is required');
    }
    if (!params.city?.trim()) {
      throw new Error('City is required');
    }
    if (!params.country?.trim()) {
      throw new Error('Country is required');
    }

    if (params.coordinates) {
      const { lat, lng } = params.coordinates;
      if (lat < -90 || lat > 90) {
        throw new Error('Invalid latitude');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Invalid longitude');
      }
    }

    return new Address(
      params.street.trim(),
      params.city.trim(),
      params.state?.trim() || '',
      params.country.trim(),
      params.postalCode?.trim() || '',
      params.coordinates
    );
  }

  public get street(): string {
    return this._street;
  }

  public get city(): string {
    return this._city;
  }

  public get state(): string {
    return this._state;
  }

  public get country(): string {
    return this._country;
  }

  public get postalCode(): string {
    return this._postalCode;
  }

  public get coordinates(): { lat: number; lng: number } | undefined {
    return this._coordinates ? { ...this._coordinates } : undefined;
  }

  public format(style: 'full' | 'short' = 'full'): string {
    if (style === 'short') {
      return `${this._city}, ${this._country}`;
    }

    const parts = [this._street, this._city];
    if (this._state) parts.push(this._state);
    if (this._postalCode) parts.push(this._postalCode);
    parts.push(this._country);

    return parts.join(', ');
  }

  public equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._city === other._city &&
      this._state === other._state &&
      this._country === other._country &&
      this._postalCode === other._postalCode
    );
  }

  public toString(): string {
    return this.format('full');
  }

  public toJSON() {
    return {
      street: this._street,
      city: this._city,
      state: this._state,
      country: this._country,
      postalCode: this._postalCode,
      coordinates: this._coordinates,
    };
  }
}
