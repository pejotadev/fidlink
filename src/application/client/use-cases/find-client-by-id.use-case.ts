import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientRepositoryInterface } from '../../../domain/client/repositories/client.repository.interface';
import { CLIENT_REPOSITORY_TOKEN } from '../../../domain/client/repositories/client.repository.token';
import { ClientResponseDto } from '../dto/client.response.dto';

@Injectable()
export class FindClientByIdUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: ClientRepositoryInterface,
  ) {}

  async execute(id: string): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return ClientResponseDto.fromDomain(client);
  }
}
