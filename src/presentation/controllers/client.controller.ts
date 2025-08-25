import { Controller, Post, Get, Body, Param, UseInterceptors } from '@nestjs/common';
import { CreateClientUseCase } from '../../application/client/use-cases/create-client.use-case';
import { FindClientByIdUseCase } from '../../application/client/use-cases/find-client-by-id.use-case';
import { ClientCreateDto } from '../../application/client/dto/client.create.dto';
import { ClientResponseDto } from '../../application/client/dto/client.response.dto';
import { CacheInterceptor } from '../../infrastructure/cache/cache.interceptor';
import { Cache } from '../../infrastructure/cache/cache.decorator';

@Controller('client')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly findClientByIdUseCase: FindClientByIdUseCase,
  ) {}

  @Post()
  async create(@Body() createClientDto: ClientCreateDto): Promise<ClientResponseDto> {
    return this.createClientUseCase.execute(createClientDto);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @Cache('client:{id}', 600) // 10 minutes - clients don't change often
  async findById(@Param('id') id: string): Promise<ClientResponseDto> {
    return this.findClientByIdUseCase.execute(id);
  }
}
