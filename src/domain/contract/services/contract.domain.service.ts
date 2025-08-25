import { Injectable } from '@nestjs/common';
import { Contract } from '../entities/contract.entity';
import { Offer } from '../../simulation/entities/offer.entity';

@Injectable()
export class ContractDomainService {
  generateContractNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CTR-${timestamp.slice(-8)}-${random}`;
  }

  createContractFromOffer(
    contractId: string,
    clientId: string,
    offer: Offer,
    purpose: string,
    firstPaymentDate: Date
  ): Contract {
    const contractNumber = this.generateContractNumber();

    return Contract.create({
      id: contractId,
      clientId,
      fundId: offer.fundId,
      offerId: offer.id,
      contractNumber,
      loanAmount: offer.loanAmount,
      monthlyPayment: offer.monthlyPayment,
      numberOfInstallments: offer.numberOfInstallments,
      totalAmount: offer.totalAmount,
      interestRate: offer.interestRate,
      purpose,
      firstPaymentDate
    });
  }

  validateContractCreation(offer: Offer): string[] {
    const errors: string[] = [];

    if (offer.isAccepted) {
      errors.push('Esta oferta já foi aceita e possui um contrato');
    }

    if (offer.loanAmount <= 0) {
      errors.push('Valor do empréstimo deve ser maior que zero');
    }

    if (offer.monthlyPayment <= 0) {
      errors.push('Valor da parcela deve ser maior que zero');
    }

    if (offer.numberOfInstallments <= 0) {
      errors.push('Número de parcelas deve ser maior que zero');
    }

    return errors;
  }

  calculateContractSummary(contract: Contract): {
    totalInterest: number;
    effectiveRate: number;
    monthlyInterestAmount: number;
  } {
    const totalInterest = contract.totalAmount - contract.loanAmount;
    const effectiveRate = (contract.totalAmount / contract.loanAmount - 1) * 100;
    const monthlyInterestAmount = totalInterest / contract.numberOfInstallments;

    return {
      totalInterest: Number(totalInterest.toFixed(2)),
      effectiveRate: Number(effectiveRate.toFixed(2)),
      monthlyInterestAmount: Number(monthlyInterestAmount.toFixed(2))
    };
  }

  isContractEligibleForCancellation(contract: Contract): boolean {
    // Regra de negócio: contratos podem ser cancelados apenas se estiverem ativos
    return contract.isActive();
  }

  calculateEarlyPayoffAmount(contract: Contract, payoffDate: Date): number {
    // Implementação simplificada: valor proporcional sem juros compostos
    // Em um cenário real, seria mais complexo considerando juros e multas
    const today = new Date();
    const daysPassed = Math.floor((payoffDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPassed <= 0) {
      return contract.totalAmount;
    }

    // Calcular quantas parcelas já foram pagas (estimativa)
    const monthsPassed = Math.floor(daysPassed / 30);
    const remainingInstallments = Math.max(0, contract.numberOfInstallments - monthsPassed);
    
    return Number((remainingInstallments * contract.monthlyPayment).toFixed(2));
  }
}
