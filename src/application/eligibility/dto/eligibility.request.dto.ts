import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { LoanPurpose } from '../../../domain/fund/entities/eligibility-criteria.entity';

export class EligibilityRequestDto {
  @IsString({ message: 'Client ID must be a string' })
  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber({}, { message: 'Requested amount must be a number' })
  @Min(1, { message: 'Requested amount must be greater than 0' })
  requestedAmount: number;

  @IsEnum(LoanPurpose, { message: 'Purpose must be one of: business_investment, travel, shopping' })
  purpose: LoanPurpose;

  @IsDateString({}, { message: 'First payment date must be a valid date in YYYY-MM-DD format' })
  firstPaymentDate: string;
}
