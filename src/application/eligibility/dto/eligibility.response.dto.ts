export class EligibilityResponseDto {
  fundId: string;
  fundName: string;
  baseInterestRate: number;
  isEligible: boolean;
  reasons: string[];

  constructor(data: {
    fundId: string;
    fundName: string;
    baseInterestRate: number;
    isEligible: boolean;
    reasons: string[];
  }) {
    this.fundId = data.fundId;
    this.fundName = data.fundName;
    this.baseInterestRate = data.baseInterestRate;
    this.isEligible = data.isEligible;
    this.reasons = data.reasons;
  }
}

export class EligibilityResultDto {
  eligibleFunds: EligibilityResponseDto[];
  ineligibleFunds: EligibilityResponseDto[];
  totalFundsEvaluated: number;

  constructor(data: {
    eligibleFunds: EligibilityResponseDto[];
    ineligibleFunds: EligibilityResponseDto[];
  }) {
    this.eligibleFunds = data.eligibleFunds;
    this.ineligibleFunds = data.ineligibleFunds;
    this.totalFundsEvaluated = data.eligibleFunds.length + data.ineligibleFunds.length;
  }
}
