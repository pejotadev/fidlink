import { Module } from '@nestjs/common';
import { ClientController } from '../presentation/controllers/client.controller';
import { CreateClientUseCase } from '../application/client/use-cases/create-client.use-case';
import { FindClientByIdUseCase } from '../application/client/use-cases/find-client-by-id.use-case';
import { ClientDomainService } from '../domain/client/services/client.domain.service';
import { ClientRepository } from '../infrastructure/repositories/client.repository';
import { CLIENT_REPOSITORY_TOKEN } from '../domain/client/repositories/client.repository.token';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [
    CreateClientUseCase,
    FindClientByIdUseCase,
    ClientDomainService,
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepository,
    },
  ],
  exports: [
    CreateClientUseCase,
    FindClientByIdUseCase,
    ClientDomainService,
    CLIENT_REPOSITORY_TOKEN,
  ],
})
export class ClientModule {}
