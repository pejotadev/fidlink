export class Offer {
  constructor(
    public readonly id: string,
    public readonly simulationId: string,
    public readonly fundId: string,
    public readonly loanAmount: number,
    public readonly monthlyPayment: number,
    public readonly numberOfInstallments: number,
    public readonly totalAmount: number,
    public readonly interestRate: number,
    public readonly isAccepted: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    simulationId: string;
    fundId: string;
    loanAmount: number;
    monthlyPayment: number;
    numberOfInstallments: number;
    totalAmount: number;
    interestRate: number;
  }): Offer {
    return new Offer(
      data.id,
      data.simulationId,
      data.fundId,
      data.loanAmount,
      data.monthlyPayment,
      data.numberOfInstallments,
      data.totalAmount,
      data.interestRate
    );
  }

  accept(): Offer {
    return new Offer(
      this.id,
      this.simulationId,
      this.fundId,
      this.loanAmount,
      this.monthlyPayment,
      this.numberOfInstallments,
      this.totalAmount,
      this.interestRate,
      true,
      this.createdAt,
      new Date()
    );
  }

  getInstallmentDescription(): string {
    return `${this.numberOfInstallments}x de R$ ${this.monthlyPayment.toFixed(2)}`;
  }
}
