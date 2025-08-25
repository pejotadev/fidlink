export class ContractResponseDto {
  id: string;
  contractNumber: string;
  clientId: string;
  fundId: string;
  fundName?: string;
  loanAmount: number;
  monthlyPayment: number;
  numberOfInstallments: number;
  totalAmount: number;
  interestRate: number;
  purpose: string;
  firstPaymentDate: string;
  status: string;
  installmentDescription: string;
  summary: {
    totalInterest: number;
    effectiveRate: number;
    monthlyInterestAmount: number;
  };
  createdAt: string;
  updatedAt: string;

  constructor(data: {
    id: string;
    contractNumber: string;
    clientId: string;
    fundId: string;
    fundName?: string;
    loanAmount: number;
    monthlyPayment: number;
    numberOfInstallments: number;
    totalAmount: number;
    interestRate: number;
    purpose: string;
    firstPaymentDate: Date;
    status: string;
    summary: {
      totalInterest: number;
      effectiveRate: number;
      monthlyInterestAmount: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.contractNumber = data.contractNumber;
    this.clientId = data.clientId;
    this.fundId = data.fundId;
    this.fundName = data.fundName;
    this.loanAmount = data.loanAmount;
    this.monthlyPayment = data.monthlyPayment;
    this.numberOfInstallments = data.numberOfInstallments;
    this.totalAmount = data.totalAmount;
    this.interestRate = data.interestRate;
    this.purpose = data.purpose;
    this.firstPaymentDate = data.firstPaymentDate.toISOString().split('T')[0];
    this.status = data.status;
    this.installmentDescription = `${data.numberOfInstallments}x de R$ ${data.monthlyPayment.toFixed(2)}`;
    this.summary = data.summary;
    this.createdAt = data.createdAt.toISOString();
    this.updatedAt = data.updatedAt.toISOString();
  }
}

export class ContractListResponseDto {
  contracts: ContractResponseDto[];
  total: number;
  activeContracts: number;
  totalLoanAmount: number;
  totalMonthlyPayments: number;

  constructor(data: {
    contracts: ContractResponseDto[];
  }) {
    this.contracts = data.contracts;
    this.total = data.contracts.length;
    this.activeContracts = data.contracts.filter(c => c.status === 'active').length;
    this.totalLoanAmount = data.contracts.reduce((sum, c) => sum + c.loanAmount, 0);
    this.totalMonthlyPayments = data.contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.monthlyPayment, 0);
  }
}
