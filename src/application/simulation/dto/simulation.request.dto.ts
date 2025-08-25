import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsEnum, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { LoanPurpose } from '../../../domain/fund/entities/eligibility-criteria.entity';

export class CreateSimulationDto {
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
  @Min(1000, { message: 'Requested amount must be at least R$ 1,000' })
  requestedAmount: number;

  @IsEnum(LoanPurpose, { message: 'Purpose must be one of: business_investment, travel, shopping' })
  purpose: LoanPurpose;

  @IsDateString({}, { message: 'First payment date must be a valid date in YYYY-MM-DD format' })
  firstPaymentDate: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value);
    }
    return value;
  })
  @IsNumber({}, { message: 'Number of installments must be a number' })
  @Min(6, { message: 'Minimum 6 installments' })
  @Max(60, { message: 'Maximum 60 installments' })
  numberOfInstallments: number;
}
