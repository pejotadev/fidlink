import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EligibilityController } from '../presentation/controllers/eligibility.controller';
import { CheckEligibilityUseCase } from '../application/eligibility/use-cases/check-eligibility.use-case';
import { EligibilityDomainService } from '../domain/eligibility/services/eligibility.domain.service';

// Repository implementations
import { ClientRepository } from '../infrastructure/repositories/client.repository';
import { FundRepository } from '../infrastructure/repositories/fund.repository';
import { EligibilityCriteriaRepository } from '../infrastructure/repositories/eligibility-criteria.repository';

// Repository tokens
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client/repositories/client.repository.token';
import { FUND_REPOSITORY_TOKEN } from '../domain/fund/repositories/fund.repository.token';
import { ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN } from '../domain/fund/repositories/eligibility-criteria.repository.token';

@Module({
  imports: [PrismaModule],
  controllers: [EligibilityController],
  providers: [
    CheckEligibilityUseCase,
    EligibilityDomainService,
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepository,
    },
    {
      provide: FUND_REPOSITORY_TOKEN,
      useClass: FundRepository,
    },
    {
      provide: ELIGIBILITY_CRITERIA_REPOSITORY_TOKEN,
      useClass: EligibilityCriteriaRepository,
    },
  ],
  exports: [
    CheckEligibilityUseCase,
    EligibilityDomainService,
  ],
})
export class EligibilityModule {}
