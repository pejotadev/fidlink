/**
 * PMT Calculation Utility
 * 
 * Formula: PMT = PV * i / (1 - (1 + i)^(-n))
 * Where:
 * - PMT = valor da parcela (monthly payment)
 * - PV = valor do empréstimo (present value)
 * - i = taxa de juros do período (interest rate per period)
 * - n = número de parcelas (number of periods)
 */
export class PMTCalculator {
  /**
   * Calculate monthly payment using PMT formula
   * @param presentValue - Loan amount (PV)
   * @param monthlyInterestRate - Monthly interest rate as decimal (e.g., 0.0275 for 2.75%)
   * @param numberOfPayments - Number of monthly payments (n)
   * @returns Monthly payment amount
   */
  static calculateMonthlyPayment(
    presentValue: number,
    monthlyInterestRate: number,
    numberOfPayments: number
  ): number {
    if (presentValue <= 0) {
      throw new Error('Present value must be greater than 0');
    }
    
    if (numberOfPayments <= 0) {
      throw new Error('Number of payments must be greater than 0');
    }
    
    if (monthlyInterestRate <= 0) {
      throw new Error('Interest rate must be greater than 0');
    }

    // PMT = PV * i / (1 - (1 + i)^(-n))
    const denominator = 1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments);
    const monthlyPayment = (presentValue * monthlyInterestRate) / denominator;
    
    return Number(monthlyPayment.toFixed(2));
  }

  /**
   * Calculate total amount to be paid
   * @param monthlyPayment - Monthly payment amount
   * @param numberOfPayments - Number of payments
   * @returns Total amount to be paid
   */
  static calculateTotalAmount(monthlyPayment: number, numberOfPayments: number): number {
    return Number((monthlyPayment * numberOfPayments).toFixed(2));
  }

  /**
   * Calculate maximum loan amount based on monthly income and commitment percentage
   * @param monthlyIncome - Client's monthly income
   * @param maxCommitmentPercentage - Maximum percentage of income that can be committed (e.g., 20 for 20%)
   * @param monthlyInterestRate - Monthly interest rate as decimal
   * @param numberOfPayments - Number of payments
   * @returns Maximum loan amount
   */
  static calculateMaxLoanAmount(
    monthlyIncome: number,
    maxCommitmentPercentage: number,
    monthlyInterestRate: number,
    numberOfPayments: number
  ): number {
    const maxMonthlyPayment = (monthlyIncome * maxCommitmentPercentage) / 100;
    
    // Reverse PMT calculation: PV = PMT * (1 - (1 + i)^(-n)) / i
    const denominator = 1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments);
    const maxLoanAmount = (maxMonthlyPayment * denominator) / monthlyInterestRate;
    
    return Number(maxLoanAmount.toFixed(2));
  }

  /**
   * Validate if monthly payment fits within income commitment
   * @param monthlyPayment - Calculated monthly payment
   * @param monthlyIncome - Client's monthly income
   * @param maxCommitmentPercentage - Maximum allowed commitment percentage
   * @returns true if payment is within limits
   */
  static validateIncomeCommitment(
    monthlyPayment: number,
    monthlyIncome: number,
    maxCommitmentPercentage: number
  ): boolean {
    const commitmentPercentage = (monthlyPayment / monthlyIncome) * 100;
    return commitmentPercentage <= maxCommitmentPercentage;
  }

  /**
   * Calculate commitment percentage
   * @param monthlyPayment - Monthly payment amount
   * @param monthlyIncome - Client's monthly income
   * @returns Commitment percentage
   */
  static calculateCommitmentPercentage(
    monthlyPayment: number,
    monthlyIncome: number
  ): number {
    return Number(((monthlyPayment / monthlyIncome) * 100).toFixed(2));
  }
}
