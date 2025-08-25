import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { ClientEntity } from '../../../domain/client/entities/client.entity';
import { CPF } from '../../../domain/client/utils/cpf.utils';
import { Money } from '../../../domain/client/utils/money.utils';
import { ClientRepositoryInterface } from '../../../domain/client/repositories/client.repository.interface';
import { CLIENT_REPOSITORY_TOKEN } from '../../../domain/client/repositories/client.repository.token';
import { ClientDomainService } from '../../../domain/client/services/client.domain.service';
import { ClientCreateDto } from '../dto/client.create.dto';
import { ClientResponseDto } from '../dto/client.response.dto';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
    private readonly clientDomainService: ClientDomainService,
  ) {}

  async execute(dto: ClientCreateDto): Promise<ClientResponseDto> {
    try {
      const cpf = new CPF(dto.cpf);
      const money = new Money(dto.monthlyIncome || dto.rendaLiquidaMensal || 0);
      const birthDate = new Date(dto.birthDate || dto.dataNascimento || '');

      const client = ClientEntity.create({
        name: dto.name || dto.nome || '',
        birthDate,
        cpf,
        monthlyIncome: money,
      });

      await this.clientDomainService.canCreateClient(client);

      const savedClient = await this.clientRepository.save(client);

      return ClientResponseDto.fromDomain(savedClient);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'CPF já cadastrado') {
          throw new ConflictException(error.message);
        }
        throw error;
      }
      throw new Error('Erro interno do servidor');
    }
  }
}
