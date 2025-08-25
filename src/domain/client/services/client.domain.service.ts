import { Injectable, Inject } from '@nestjs/common';
import { ClientEntity } from '../entities/client.entity';
import { CPF } from '../utils/cpf.utils';
import { ClientRepositoryInterface } from '../repositories/client.repository.interface';
import { CLIENT_REPOSITORY_TOKEN } from '../repositories/client.repository.token';

@Injectable()
export class ClientDomainService {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
  ) {}

  async validateUniquenessCpf(cpf: CPF): Promise<void> {
    const existingClient = await this.clientRepository.findByCpf(cpf);
    if (existingClient) {
      throw new Error('CPF já cadastrado');
    }
  }

  async canCreateClient(client: ClientEntity): Promise<void> {
    await this.validateUniquenessCpf(client.cpf);
  }
}
