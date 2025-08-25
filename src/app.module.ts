import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './modules/client.module';
import { EligibilityModule } from './modules/eligibility.module';
import { SimulationModule } from './modules/simulation.module';
import { ContractModule } from './modules/contract.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { HealthController } from './health/health.controller';
import { CacheController } from './presentation/controllers/cache.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CacheModule,
    ClientModule,
    EligibilityModule,
    SimulationModule,
    ContractModule,
  ],
  controllers: [HealthController, CacheController],
})
export class AppModule {}
