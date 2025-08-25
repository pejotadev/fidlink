import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Domain imports
import { ContractDomainService } from '../../../domain/contract/services/contract.domain.service';

// Repository tokens and interfaces
import { CONTRACT_REPOSITORY_TOKEN } from '../../../domain/contract/repositories/contract.repository.token';
import { ContractRepositoryInterface } from '../../../domain/contract/repositories/contract.repository.interface';
import { OFFER_REPOSITORY_TOKEN } from '../../../domain/simulation/repositories/offer.repository.token';
import { OfferRepositoryInterface } from '../../../domain/simulation/repositories/offer.repository.interface';
import { SIMULATION_REPOSITORY_TOKEN } from '../../../domain/simulation/repositories/simulation.repository.token';
import { SimulationRepositoryInterface } from '../../../domain/simulation/repositories/simulation.repository.interface';
import { FUND_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/fund.repository.token';
import { FundRepositoryInterface } from '../../../domain/fund/repositories/fund.repository.interface';

// DTOs
import { CreateContractDto } from '../dto/contract.request.dto';
import { ContractResponseDto } from '../dto/contract.response.dto';

@Injectable()
export class CreateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY_TOKEN)
    private readonly contractRepository: ContractRepositoryInterface,
    @Inject(OFFER_REPOSITORY_TOKEN)
    private readonly offerRepository: OfferRepositoryInterface,
    @Inject(SIMULATION_REPOSITORY_TOKEN)
    private readonly simulationRepository: SimulationRepositoryInterface,
    @Inject(FUND_REPOSITORY_TOKEN)
    private readonly fundRepository: FundRepositoryInterface,
    private readonly contractDomainService: ContractDomainService
  ) {}

  async execute(dto: CreateContractDto): Promise<ContractResponseDto> {
    // Buscar a oferta
    const offer = await this.offerRepository.findById(dto.offerId);
    if (!offer) {
      throw new NotFoundException('Oferta não encontrada');
    }

    // Validar se a oferta pode ser aceita
    const validationErrors = this.contractDomainService.validateContractCreation(offer);
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join(', '));
    }

    // Buscar a simulação para obter informações completas
    const simulation = await this.simulationRepository.findById(offer.simulationId);
    if (!simulation) {
      throw new NotFoundException('Simulação não encontrada');
    }

    // Buscar informações do fundo
    const fund = await this.fundRepository.findById(offer.fundId);
    if (!fund) {
      throw new NotFoundException('Fundo não encontrado');
    }

    // Criar o contrato
    const contract = this.contractDomainService.createContractFromOffer(
      uuidv4(),
      simulation.clientId,
      offer,
      simulation.purpose.toString(),
      simulation.firstPaymentDate
    );

    // Salvar o contrato
    const savedContract = await this.contractRepository.create(contract);

    // Marcar a oferta como aceita
    const acceptedOffer = offer.accept();
    await this.offerRepository.update(acceptedOffer);

    // Calcular resumo do contrato
    const summary = this.contractDomainService.calculateContractSummary(savedContract);

    return new ContractResponseDto({
      id: savedContract.id,
      contractNumber: savedContract.contractNumber,
      clientId: savedContract.clientId,
      fundId: savedContract.fundId,
      fundName: fund.name,
      loanAmount: savedContract.loanAmount,
      monthlyPayment: savedContract.monthlyPayment,
      numberOfInstallments: savedContract.numberOfInstallments,
      totalAmount: savedContract.totalAmount,
      interestRate: savedContract.interestRate,
      purpose: savedContract.purpose,
      firstPaymentDate: savedContract.firstPaymentDate,
      status: savedContract.status,
      summary,
      createdAt: savedContract.createdAt,
      updatedAt: savedContract.updatedAt
    });
  }
}
