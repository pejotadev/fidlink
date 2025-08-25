import { Injectable } from '@nestjs/common';
import { Fund } from '../../fund/entities/fund.entity';
import { EligibilityCriteria, CriteriaType } from '../../fund/entities/eligibility-criteria.entity';
import { Offer } from '../entities/offer.entity';
import { PMTCalculator } from '../utils/pmt.utils';

export interface SimulationInput {
  clientId: string;
  requestedAmount: number;
  clientMonthlyIncome: number;
  numberOfInstallments: number;
}

export interface FundWithCriteria {
  fund: Fund;
  criteria: EligibilityCriteria[];
}

@Injectable()
export class SimulationDomainService {
  generateOffer(
    simulationId: string,
    fundWithCriteria: FundWithCriteria,
    input: SimulationInput
  ): Offer | null {
    const { fund, criteria } = fundWithCriteria;
    
    // Verificar se o valor solicitado é viável para este fundo
    const maxCommitmentPercentage = this.getMaxCommitmentPercentage(criteria);
    if (!maxCommitmentPercentage) {
      return null;
    }

    // Calcular parcela usando PMT
    const monthlyPayment = PMTCalculator.calculateMonthlyPayment(
      input.requestedAmount,
      fund.baseInterestRate,
      input.numberOfInstallments
    );

    // Verificar se a parcela não excede o comprometimento permitido
    if (!PMTCalculator.validateIncomeCommitment(
      monthlyPayment,
      input.clientMonthlyIncome,
      maxCommitmentPercentage
    )) {
      return null;
    }

    // Calcular valor total
    const totalAmount = PMTCalculator.calculateTotalAmount(
      monthlyPayment,
      input.numberOfInstallments
    );

    // Criar oferta
    return Offer.create({
      id: this.generateOfferId(),
      simulationId,
      fundId: fund.id,
      loanAmount: input.requestedAmount,
      monthlyPayment,
      numberOfInstallments: input.numberOfInstallments,
      totalAmount,
      interestRate: fund.baseInterestRate
    });
  }

  generateOptimizedOffer(
    simulationId: string,
    fundWithCriteria: FundWithCriteria,
    input: SimulationInput
  ): Offer | null {
    const { fund, criteria } = fundWithCriteria;
    
    const maxCommitmentPercentage = this.getMaxCommitmentPercentage(criteria);
    if (!maxCommitmentPercentage) {
      return null;
    }

    // Calcular o valor máximo que o cliente pode pegar com base na renda
    const maxLoanAmount = PMTCalculator.calculateMaxLoanAmount(
      input.clientMonthlyIncome,
      maxCommitmentPercentage,
      fund.baseInterestRate,
      input.numberOfInstallments
    );

    // Usar o menor valor entre o solicitado e o máximo possível
    const finalLoanAmount = Math.min(input.requestedAmount, maxLoanAmount);

    // Verificar valor mínimo se existir
    const minLoanAmount = this.getMinLoanAmount(criteria);
    if (minLoanAmount && finalLoanAmount < minLoanAmount) {
      return null;
    }

    // Calcular parcela com o valor final
    const monthlyPayment = PMTCalculator.calculateMonthlyPayment(
      finalLoanAmount,
      fund.baseInterestRate,
      input.numberOfInstallments
    );

    const totalAmount = PMTCalculator.calculateTotalAmount(
      monthlyPayment,
      input.numberOfInstallments
    );

    return Offer.create({
      id: this.generateOfferId(),
      simulationId,
      fundId: fund.id,
      loanAmount: finalLoanAmount,
      monthlyPayment,
      numberOfInstallments: input.numberOfInstallments,
      totalAmount,
      interestRate: fund.baseInterestRate
    });
  }

  private getMaxCommitmentPercentage(criteria: EligibilityCriteria[]): number | null {
    const commitmentCriteria = criteria.find(
      c => c.criteriaType === CriteriaType.MAX_INCOME_COMMITMENT_PERCENTAGE
    );
    
    return commitmentCriteria ? commitmentCriteria.getValue<number>() : null;
  }

  private getMinLoanAmount(criteria: EligibilityCriteria[]): number | null {
    const minAmountCriteria = criteria.find(
      c => c.criteriaType === CriteriaType.MIN_LOAN_AMOUNT
    );
    
    return minAmountCriteria ? minAmountCriteria.getValue<number>() : null;
  }

  private generateOfferId(): string {
    return `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
