import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContractController } from '../presentation/controllers/contract.controller';
import { CreateContractUseCase } from '../application/contract/use-cases/create-contract.use-case';
import { ListContractsUseCase } from '../application/contract/use-cases/list-contracts.use-case';
import { ContractDomainService } from '../domain/contract/services/contract.domain.service';

// Repository implementations
import { ContractRepository } from '../infrastructure/repositories/contract.repository';
import { OfferRepository } from '../infrastructure/repositories/offer.repository';
import { SimulationRepository } from '../infrastructure/repositories/simulation.repository';
import { FundRepository } from '../infrastructure/repositories/fund.repository';
import { ClientRepository } from '../infrastructure/repositories/client.repository';

// Repository tokens
import { CONTRACT_REPOSITORY_TOKEN } from '../domain/contract/repositories/contract.repository.token';
import { OFFER_REPOSITORY_TOKEN } from '../domain/simulation/repositories/offer.repository.token';
import { SIMULATION_REPOSITORY_TOKEN } from '../domain/simulation/repositories/simulation.repository.token';
import { FUND_REPOSITORY_TOKEN } from '../domain/fund/repositories/fund.repository.token';
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client/repositories/client.repository.token';

@Module({
  imports: [PrismaModule],
  controllers: [ContractController],
  providers: [
    CreateContractUseCase,
    ListContractsUseCase,
    ContractDomainService,
    {
      provide: CONTRACT_REPOSITORY_TOKEN,
      useClass: ContractRepository,
    },
    {
      provide: OFFER_REPOSITORY_TOKEN,
      useClass: OfferRepository,
    },
    {
      provide: SIMULATION_REPOSITORY_TOKEN,
      useClass: SimulationRepository,
    },
    {
      provide: FUND_REPOSITORY_TOKEN,
      useClass: FundRepository,
    },
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepository,
    },
  ],
  exports: [
    CreateContractUseCase,
    ListContractsUseCase,
    ContractDomainService,
  ],
})
export class ContractModule {}
