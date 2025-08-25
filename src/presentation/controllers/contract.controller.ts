import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateContractUseCase } from '../../application/contract/use-cases/create-contract.use-case';
import { ListContractsUseCase } from '../../application/contract/use-cases/list-contracts.use-case';
import { CreateContractDto } from '../../application/contract/dto/contract.request.dto';
import { ContractResponseDto, ContractListResponseDto } from '../../application/contract/dto/contract.response.dto';

@Controller('contract')
export class ContractController {
  constructor(
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly listContractsUseCase: ListContractsUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContract(@Body() dto: CreateContractDto): Promise<ContractResponseDto> {
    return this.createContractUseCase.execute(dto);
  }

  @Get('client/:clientId')
  @HttpCode(HttpStatus.OK)
  async listClientContracts(@Param('clientId') clientId: string): Promise<ContractListResponseDto> {
    return this.listContractsUseCase.execute(clientId);
  }
}
