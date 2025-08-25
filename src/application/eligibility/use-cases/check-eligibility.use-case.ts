import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY_TOKEN } from '../../../domain/client/repositories/client.repository.token';
import { ClientRepositoryInterface } from '../../../domain/client/repositories/client.repository.interface';
import { FUND_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/fund.repository.token';
import { FundRepositoryInterface } from '../../../domain/fund/repositories/fund.repository.interface';
import { ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/eligibility-criteria.repository.token';
import { EligibilityCriteriaRepositoryInterface } from '../../../domain/fund/repositories/eligibility-criteria.repository.interface';
import { EligibilityDomainService, EligibilityRequest } from '../../../domain/eligibility/services/eligibility.domain.service';
import { EligibilityRequestDto } from '../dto/eligibility.request.dto';
import { EligibilityResponseDto, EligibilityResultDto } from '../dto/eligibility.response.dto';

@Injectable()
export class CheckEligibilityUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
    @Inject(FUND_REPOSITORY_TOKEN)
    private readonly fundRepository: FundRepositoryInterface,
    @Inject(ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN)
    private readonly eligibilityCriteriaRepository: EligibilityCriteriaRepositoryInterface,
    private readonly eligibilityDomainService: EligibilityDomainService
  ) {}

  async execute(dto: EligibilityRequestDto): Promise<EligibilityResultDto> {
    // Buscar o cliente
    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Buscar todos os fundos ativos
    const funds = await this.fundRepository.findActiveOnly();
    if (funds.length === 0) {
      throw new NotFoundException('Nenhum fundo ativo encontrado');
    }

    const eligibleFunds: EligibilityResponseDto[] = [];
    const ineligibleFunds: EligibilityResponseDto[] = [];

    // Preparar request de elegibilidade
    const eligibilityRequest: EligibilityRequest = {
      client: {
        id: client.id!,
        dataNascimento: client.birthDate,
        rendaLiquidaMensal: client.monthlyIncome.amount
      },
      requestedAmount: dto.requestedAmount,
      purpose: dto.purpose,
      firstPaymentDate: new Date(dto.firstPaymentDate)
    };

    // Avaliar elegibilidade para cada fundo
    for (const fund of funds) {
      // Buscar critérios de elegibilidade do fundo
      const criteria = await this.eligibilityCriteriaRepository.findActiveByCriteria(fund.id);
      
      // Avaliar elegibilidade
      const result = this.eligibilityDomainService.evaluateEligibility(
        eligibilityRequest,
        fund,
        criteria
      );

      const responseDto = new EligibilityResponseDto({
        fundId: fund.id,
        fundName: fund.name,
        baseInterestRate: fund.baseInterestRate,
        isEligible: result.isEligible,
        reasons: result.reasons
      });

      if (result.isEligible) {
        eligibleFunds.push(responseDto);
      } else {
        ineligibleFunds.push(responseDto);
      }
    }

    return new EligibilityResultDto({
      eligibleFunds,
      ineligibleFunds
    });
  }
}
