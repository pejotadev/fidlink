import { Injectable } from '@nestjs/common';
import { ClientEntity } from '../../client/entities/client.entity';
import { Fund } from '../../fund/entities/fund.entity';
import { EligibilityCriteria, CriteriaType, LoanPurpose } from '../../fund/entities/eligibility-criteria.entity';

// Interface for client compatibility
interface ClientForEligibility {
  id: string;
  dataNascimento: Date;
  rendaLiquidaMensal: number;
}

export interface EligibilityRequest {
  client: ClientForEligibility;
  requestedAmount: number;
  purpose: LoanPurpose;
  firstPaymentDate: Date;
}

export interface EligibilityResult {
  fund: Fund;
  isEligible: boolean;
  reasons: string[];
}

@Injectable()
export class EligibilityDomainService {
  evaluateEligibility(
    request: EligibilityRequest,
    fund: Fund,
    criteria: EligibilityCriteria[]
  ): EligibilityResult {
    const reasons: string[] = [];
    let isEligible = true;

    // Verificar cada critério
    for (const criterion of criteria) {
      if (!criterion.isActive) continue;

      switch (criterion.criteriaType) {
        case CriteriaType.MIN_AGE:
          if (!this.checkMinAge(request.client, criterion, reasons)) {
            isEligible = false;
          }
          break;

        case CriteriaType.MAX_INCOME_COMMITMENT_PERCENTAGE:
          if (!this.checkIncomeCommitment(request, criterion, reasons)) {
            isEligible = false;
          }
          break;

        case CriteriaType.MIN_LOAN_AMOUNT:
          if (!this.checkMinLoanAmount(request, criterion, reasons)) {
            isEligible = false;
          }
          break;

        case CriteriaType.EXCLUDED_PURPOSES:
          if (!this.checkExcludedPurposes(request, criterion, reasons)) {
            isEligible = false;
          }
          break;
      }
    }

    // Verificar se a primeira parcela não ultrapassa 45 dias
    if (!this.checkFirstPaymentDate(request, reasons)) {
      isEligible = false;
    }

    return {
      fund,
      isEligible,
      reasons
    };
  }

  private checkMinAge(client: ClientForEligibility, criterion: EligibilityCriteria, reasons: string[]): boolean {
    const minAge = criterion.getValue<number>();
    const age = this.calculateAge(client.dataNascimento);
    
    if (age < minAge) {
      reasons.push(`Client must be at least ${minAge} years old`);
      return false;
    }
    
    return true;
  }

  private checkIncomeCommitment(request: EligibilityRequest, criterion: EligibilityCriteria, reasons: string[]): boolean {
    const maxPercentage = criterion.getValue<number>();
    // Para calcular o comprometimento, precisamos estimar a parcela
    // Por enquanto, vamos usar uma estimativa conservadora
    const estimatedMonthlyPayment = request.requestedAmount * 0.05; // 5% do valor como estimativa
    const commitmentPercentage = (estimatedMonthlyPayment / request.client.rendaLiquidaMensal) * 100;
    
    if (commitmentPercentage > maxPercentage) {
      reasons.push(`Monthly payment would exceed ${maxPercentage}% of monthly income`);
      return false;
    }
    
    return true;
  }

  private checkMinLoanAmount(request: EligibilityRequest, criterion: EligibilityCriteria, reasons: string[]): boolean {
    const minAmount = criterion.getValue<number>();
    
    if (request.requestedAmount < minAmount) {
      reasons.push(`Minimum loan amount is R$ ${minAmount.toFixed(2)}`);
      return false;
    }
    
    return true;
  }

  private checkExcludedPurposes(request: EligibilityRequest, criterion: EligibilityCriteria, reasons: string[]): boolean {
    const excludedPurposes = criterion.getValue<string[]>();
    
    if (excludedPurposes.includes(request.purpose)) {
      reasons.push(`Loans for ${request.purpose} are not allowed by this fund`);
      return false;
    }
    
    return true;
  }

  private checkFirstPaymentDate(request: EligibilityRequest, reasons: string[]): boolean {
    const today = new Date();
    const diffTime = request.firstPaymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 45) {
      reasons.push('First payment date cannot be more than 45 days from today');
      return false;
    }
    
    if (diffDays <= 0) {
      reasons.push('First payment date must be in the future');
      return false;
    }
    
    return true;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
