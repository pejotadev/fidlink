import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateSimulationUseCase } from '../../application/simulation/use-cases/create-simulation.use-case';
import { CreateSimulationDto } from '../../application/simulation/dto/simulation.request.dto';
import { SimulationResponseDto } from '../../application/simulation/dto/simulation.response.dto';

@Controller('simulation')
export class SimulationController {
  constructor(
    private readonly createSimulationUseCase: CreateSimulationUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSimulation(@Body() dto: CreateSimulationDto): Promise<SimulationResponseDto> {
    return this.createSimulationUseCase.execute(dto);
  }
}
