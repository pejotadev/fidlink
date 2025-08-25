export class OfferResponseDto {
  id: string;
  fundId: string;
  fundName: string;
  loanAmount: number;
  monthlyPayment: number;
  numberOfInstallments: number;
  totalAmount: number;
  interestRate: number;
  installmentDescription: string;

  constructor(data: {
    id: string;
    fundId: string;
    fundName: string;
    loanAmount: number;
    monthlyPayment: number;
    numberOfInstallments: number;
    totalAmount: number;
    interestRate: number;
  }) {
    this.id = data.id;
    this.fundId = data.fundId;
    this.fundName = data.fundName;
    this.loanAmount = data.loanAmount;
    this.monthlyPayment = data.monthlyPayment;
    this.numberOfInstallments = data.numberOfInstallments;
    this.totalAmount = data.totalAmount;
    this.interestRate = data.interestRate;
    this.installmentDescription = `${data.numberOfInstallments}x de R$ ${data.monthlyPayment.toFixed(2)}`;
  }
}

export class SimulationResponseDto {
  simulationId: string;
  clientId: string;
  requestedAmount: number;
  purpose: string;
  firstPaymentDate: string;
  numberOfInstallments: number;
  offers: OfferResponseDto[];
  totalOffersGenerated: number;
  createdAt: string;

  constructor(data: {
    simulationId: string;
    clientId: string;
    requestedAmount: number;
    purpose: string;
    firstPaymentDate: string;
    numberOfInstallments: number;
    offers: OfferResponseDto[];
    createdAt: Date;
  }) {
    this.simulationId = data.simulationId;
    this.clientId = data.clientId;
    this.requestedAmount = data.requestedAmount;
    this.purpose = data.purpose;
    this.firstPaymentDate = data.firstPaymentDate;
    this.numberOfInstallments = data.numberOfInstallments;
    this.offers = data.offers;
    this.totalOffersGenerated = data.offers.length;
    this.createdAt = data.createdAt.toISOString();
  }
}
