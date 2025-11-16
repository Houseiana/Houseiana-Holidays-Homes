/**
 * Money Value Object
 * Encapsulates monetary values with currency handling
 * Implements Encapsulation and Abstraction principles
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }

  /**
   * Factory method for creating Money instances
   * Ensures validation and proper initialization
   */
  public static create(amount: number, currency: string = 'QAR'): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid currency code');
    }
    return new Money(amount, currency.toUpperCase());
  }

  public static zero(currency: string = 'QAR'): Money {
    return new Money(0, currency);
  }

  // Getters (Encapsulation)
  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  // Business logic methods (Behavior, not just data!)
  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Resulting amount cannot be negative');
    }
    return new Money(result, this._currency);
  }

  public multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this._amount * multiplier, this._currency);
  }

  public divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor must be positive');
    }
    return new Money(this._amount / divisor, this._currency);
  }

  public isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  public isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount < other._amount;
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  public format(locale: string = 'en-QA'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  public toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  public toString(): string {
    return `${this._amount} ${this._currency}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this._currency} and ${other._currency}`
      );
    }
  }
}
