import { LoanPurpose } from '../../fund/entities/eligibility-criteria.entity';

export class Simulation {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly requestedAmount: number,
    public readonly purpose: LoanPurpose,
    public readonly firstPaymentDate: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    clientId: string;
    requestedAmount: number;
    purpose: LoanPurpose;
    firstPaymentDate: Date;
  }): Simulation {
    return new Simulation(
      data.id,
      data.clientId,
      data.requestedAmount,
      data.purpose,
      data.firstPaymentDate
    );
  }
}
