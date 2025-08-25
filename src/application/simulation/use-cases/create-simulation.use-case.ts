import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Domain imports
import { Simulation } from '../../../domain/simulation/entities/simulation.entity';
import { SimulationDomainService, SimulationInput, FundWithCriteria } from '../../../domain/simulation/services/simulation.domain.service';
import { EligibilityDomainService, EligibilityRequest } from '../../../domain/eligibility/services/eligibility.domain.service';

// Repository tokens and interfaces
import { CLIENT_REPOSITORY_TOKEN } from '../../../domain/client/repositories/client.repository.token';
import { ClientRepositoryInterface } from '../../../domain/client/repositories/client.repository.interface';
import { FUND_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/fund.repository.token';
import { FundRepositoryInterface } from '../../../domain/fund/repositories/fund.repository.interface';
import { ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/eligibility-criteria.repository.token';
import { EligibilityCriteriaRepositoryInterface } from '../../../domain/fund/repositories/eligibility-criteria.repository.interface';
import { SIMULATION_REPOSITORY_TOKEN } from '../../../domain/simulation/repositories/simulation.repository.token';
import { SimulationRepositoryInterface } from '../../../domain/simulation/repositories/simulation.repository.interface';
import { OFFER_REPOSITORY_TOKEN } from '../../../domain/simulation/repositories/offer.repository.token';
import { OfferRepositoryInterface } from '../../../domain/simulation/repositories/offer.repository.interface';

// DTOs
import { CreateSimulationDto } from '../dto/simulation.request.dto';
import { SimulationResponseDto, OfferResponseDto } from '../dto/simulation.response.dto';

@Injectable()
export class CreateSimulationUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
    @Inject(FUND_REPOSITORY_TOKEN)
    private readonly fundRepository: FundRepositoryInterface,
    @Inject(ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN)
    private readonly eligibilityCriteriaRepository: EligibilityCriteriaRepositoryInterface,
    @Inject(SIMULATION_REPOSITORY_TOKEN)
    private readonly simulationRepository: SimulationRepositoryInterface,
    @Inject(OFFER_REPOSITORY_TOKEN)
    private readonly offerRepository: OfferRepositoryInterface,
    private readonly eligibilityDomainService: EligibilityDomainService,
    private readonly simulationDomainService: SimulationDomainService
  ) {}

  async execute(dto: CreateSimulationDto): Promise<SimulationResponseDto> {
    // Buscar o cliente
    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Validar data de primeiro vencimento (máximo 45 dias)
    const firstPaymentDate = new Date(dto.firstPaymentDate);
    const today = new Date();
    const diffTime = firstPaymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 45 || diffDays <= 0) {
      throw new BadRequestException('Data do primeiro vencimento deve estar entre 1 e 45 dias a partir de hoje');
    }

    // Buscar fundos ativos
    const funds = await this.fundRepository.findActiveOnly();
    if (funds.length === 0) {
      throw new NotFoundException('Nenhum fundo ativo encontrado');
    }

    // Verificar elegibilidade primeiro
    const eligibilityRequest: EligibilityRequest = {
      client: {
        id: client.id!,
        dataNascimento: client.birthDate,
        rendaLiquidaMensal: client.monthlyIncome.amount
      },
      requestedAmount: dto.requestedAmount,
      purpose: dto.purpose,
      firstPaymentDate
    };

    // Filtrar apenas fundos elegíveis
    const eligibleFundsWithCriteria: FundWithCriteria[] = [];
    
    for (const fund of funds) {
      const criteria = await this.eligibilityCriteriaRepository.findActiveByCriteria(fund.id);
      const eligibilityResult = this.eligibilityDomainService.evaluateEligibility(
        eligibilityRequest,
        fund,
        criteria
      );
      
      if (eligibilityResult.isEligible) {
        eligibleFundsWithCriteria.push({ fund, criteria });
      }
    }

    if (eligibleFundsWithCriteria.length === 0) {
      throw new BadRequestException('Nenhum fundo aceita as condições solicitadas');
    }

    // Criar simulação
    const simulation = Simulation.create({
      id: uuidv4(),
      clientId: dto.clientId,
      requestedAmount: dto.requestedAmount,
      purpose: dto.purpose,
      firstPaymentDate
    });

    const savedSimulation = await this.simulationRepository.create(simulation);

    // Gerar ofertas para fundos elegíveis
    const simulationInput: SimulationInput = {
      clientId: dto.clientId,
      requestedAmount: dto.requestedAmount,
      clientMonthlyIncome: client.monthlyIncome.amount,
      numberOfInstallments: dto.numberOfInstallments
    };

    const offers = [];
    const offerResponses: OfferResponseDto[] = [];

    for (const fundWithCriteria of eligibleFundsWithCriteria) {
      const offer = this.simulationDomainService.generateOptimizedOffer(
        savedSimulation.id,
        fundWithCriteria,
        simulationInput
      );

      if (offer) {
        offers.push(offer);
        
        offerResponses.push(new OfferResponseDto({
          id: offer.id,
          fundId: offer.fundId,
          fundName: fundWithCriteria.fund.name,
          loanAmount: offer.loanAmount,
          monthlyPayment: offer.monthlyPayment,
          numberOfInstallments: offer.numberOfInstallments,
          totalAmount: offer.totalAmount,
          interestRate: offer.interestRate
        }));
      }
    }

    // Salvar ofertas
    if (offers.length > 0) {
      await this.offerRepository.createMany(offers);
    }

    // Ordenar ofertas por taxa de juros (menor para maior)
    offerResponses.sort((a, b) => a.interestRate - b.interestRate);

    return new SimulationResponseDto({
      simulationId: savedSimulation.id,
      clientId: savedSimulation.clientId,
      requestedAmount: savedSimulation.requestedAmount,
      purpose: savedSimulation.purpose.toString(),
      firstPaymentDate: savedSimulation.firstPaymentDate.toISOString().split('T')[0],
      numberOfInstallments: dto.numberOfInstallments,
      offers: offerResponses,
      createdAt: savedSimulation.createdAt
    });
  }
}
