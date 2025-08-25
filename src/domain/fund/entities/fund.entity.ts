export class Fund {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseInterestRate: number, // Taxa base mensal
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    name: string;
    baseInterestRate: number;
    isActive?: boolean;
  }): Fund {
    return new Fund(
      data.id,
      data.name,
      data.baseInterestRate,
      data.isActive ?? true
    );
  }

  updateInterestRate(newRate: number): Fund {
    return new Fund(
      this.id,
      this.name,
      newRate,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): Fund {
    return new Fund(
      this.id,
      this.name,
      this.baseInterestRate,
      false,
      this.createdAt,
      new Date()
    );
  }
}
