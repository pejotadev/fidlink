import { Injectable, Inject, NotFoundException } from '@nestjs/common';

// Domain imports
import { ContractDomainService } from '../../../domain/contract/services/contract.domain.service';

// Repository tokens and interfaces
import { CONTRACT_REPOSITORY_TOKEN } from '../../../domain/contract/repositories/contract.repository.token';
import { ContractRepositoryInterface } from '../../../domain/contract/repositories/contract.repository.interface';
import { CLIENT_REPOSITORY_TOKEN } from '../../../domain/client/repositories/client.repository.token';
import { ClientRepositoryInterface } from '../../../domain/client/repositories/client.repository.interface';
import { FUND_REPOSITORY_TOKEN } from '../../../domain/fund/repositories/fund.repository.token';
import { FundRepositoryInterface } from '../../../domain/fund/repositories/fund.repository.interface';

// DTOs
import { ContractResponseDto, ContractListResponseDto } from '../dto/contract.response.dto';

@Injectable()
export class ListContractsUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY_TOKEN)
    private readonly contractRepository: ContractRepositoryInterface,
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
    @Inject(FUND_REPOSITORY_TOKEN)
    private readonly fundRepository: FundRepositoryInterface,
    private readonly contractDomainService: ContractDomainService
  ) {}

  async execute(clientId: string): Promise<ContractListResponseDto> {
    // Verificar se o cliente existe
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Buscar contratos do cliente
    const contracts = await this.contractRepository.findByClientId(clientId);

    // Buscar informações dos fundos para cada contrato
    const contractResponses: ContractResponseDto[] = [];

    for (const contract of contracts) {
      const fund = await this.fundRepository.findById(contract.fundId);
      const summary = this.contractDomainService.calculateContractSummary(contract);

      contractResponses.push(new ContractResponseDto({
        id: contract.id,
        contractNumber: contract.contractNumber,
        clientId: contract.clientId,
        fundId: contract.fundId,
        fundName: fund?.name || 'Fundo não encontrado',
        loanAmount: contract.loanAmount,
        monthlyPayment: contract.monthlyPayment,
        numberOfInstallments: contract.numberOfInstallments,
        totalAmount: contract.totalAmount,
        interestRate: contract.interestRate,
        purpose: contract.purpose,
        firstPaymentDate: contract.firstPaymentDate,
        status: contract.status,
        summary,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt
      }));
    }

    // Ordenar por data de criação (mais recente primeiro)
    contractResponses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new ContractListResponseDto({
      contracts: contractResponses
    });
  }
}
