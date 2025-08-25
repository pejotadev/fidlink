export enum ContractStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class Contract {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly fundId: string,
    public readonly offerId: string,
    public readonly contractNumber: string,
    public readonly loanAmount: number,
    public readonly monthlyPayment: number,
    public readonly numberOfInstallments: number,
    public readonly totalAmount: number,
    public readonly interestRate: number,
    public readonly purpose: string,
    public readonly firstPaymentDate: Date,
    public readonly status: ContractStatus = ContractStatus.ACTIVE,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    clientId: string;
    fundId: string;
    offerId: string;
    contractNumber: string;
    loanAmount: number;
    monthlyPayment: number;
    numberOfInstallments: number;
    totalAmount: number;
    interestRate: number;
    purpose: string;
    firstPaymentDate: Date;
  }): Contract {
    return new Contract(
      data.id,
      data.clientId,
      data.fundId,
      data.offerId,
      data.contractNumber,
      data.loanAmount,
      data.monthlyPayment,
      data.numberOfInstallments,
      data.totalAmount,
      data.interestRate,
      data.purpose,
      data.firstPaymentDate
    );
  }

  complete(): Contract {
    return new Contract(
      this.id,
      this.clientId,
      this.fundId,
      this.offerId,
      this.contractNumber,
      this.loanAmount,
      this.monthlyPayment,
      this.numberOfInstallments,
      this.totalAmount,
      this.interestRate,
      this.purpose,
      this.firstPaymentDate,
      ContractStatus.COMPLETED,
      this.createdAt,
      new Date()
    );
  }

  cancel(): Contract {
    return new Contract(
      this.id,
      this.clientId,
      this.fundId,
      this.offerId,
      this.contractNumber,
      this.loanAmount,
      this.monthlyPayment,
      this.numberOfInstallments,
      this.totalAmount,
      this.interestRate,
      this.purpose,
      this.firstPaymentDate,
      ContractStatus.CANCELLED,
      this.createdAt,
      new Date()
    );
  }

  getInstallmentDescription(): string {
    return `${this.numberOfInstallments}x de R$ ${this.monthlyPayment.toFixed(2)}`;
  }

  isActive(): boolean {
    return this.status === ContractStatus.ACTIVE;
  }
}
