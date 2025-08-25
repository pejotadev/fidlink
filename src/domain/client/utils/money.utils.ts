export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    this._amount = this.validate(amount);
  }

  get amount(): number {
    return this._amount;
  }

  private validate(amount: number): number {
    if (typeof amount !== 'number') {
      throw new Error('Valor monetário deve ser um número');
    }

    if (amount < 0) {
      throw new Error('Valor monetário não pode ser negativo');
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Valor monetário deve ser um número válido');
    }

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(amount * 100) / 100;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }

  toString(): string {
    return this._amount.toFixed(2);
  }

  toNumber(): number {
    return this._amount;
  }
}
