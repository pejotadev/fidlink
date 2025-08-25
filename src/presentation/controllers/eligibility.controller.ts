import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { CheckEligibilityUseCase } from '../../application/eligibility/use-cases/check-eligibility.use-case';
import { EligibilityRequestDto } from '../../application/eligibility/dto/eligibility.request.dto';
import { EligibilityResultDto } from '../../application/eligibility/dto/eligibility.response.dto';
import { CacheInterceptor } from '../../infrastructure/cache/cache.interceptor';
import { Cache } from '../../infrastructure/cache/cache.decorator';

@Controller('eligibility')
export class EligibilityController {
  constructor(
    private readonly checkEligibilityUseCase: CheckEligibilityUseCase
  ) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(CacheInterceptor)
  @Cache('eligibility:{clientId}:{requestedAmount}:{purpose}:{firstPaymentDate}', 300) // 5 minutes
  async checkEligibility(@Body() dto: EligibilityRequestDto): Promise<EligibilityResultDto> {
    return this.checkEligibilityUseCase.execute(dto);
  }
}
