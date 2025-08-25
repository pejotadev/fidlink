export enum CriteriaType {
  MIN_AGE = 'min_age',
  MAX_INCOME_COMMITMENT_PERCENTAGE = 'max_income_commitment_percentage',
  MIN_LOAN_AMOUNT = 'min_loan_amount',
  EXCLUDED_PURPOSES = 'excluded_purposes'
}

export enum LoanPurpose {
  BUSINESS_INVESTMENT = 'business_investment',
  TRAVEL = 'travel',
  SHOPPING = 'shopping'
}

export class EligibilityCriteria {
  constructor(
    public readonly id: string,
    public readonly fundId: string,
    public readonly criteriaType: CriteriaType,
    public readonly value: string, // JSON string for complex values
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    fundId: string;
    criteriaType: CriteriaType;
    value: string;
    isActive?: boolean;
  }): EligibilityCriteria {
    return new EligibilityCriteria(
      data.id,
      data.fundId,
      data.criteriaType,
      data.value,
      data.isActive ?? true
    );
  }

  getValue<T>(): T {
    try {
      return JSON.parse(this.value);
    } catch {
      return this.value as unknown as T;
    }
  }

  updateValue(newValue: string): EligibilityCriteria {
    return new EligibilityCriteria(
      this.id,
      this.fundId,
      this.criteriaType,
      newValue,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): EligibilityCriteria {
    return new EligibilityCriteria(
      this.id,
      this.fundId,
      this.criteriaType,
      this.value,
      false,
      this.createdAt,
      new Date()
    );
  }
}
