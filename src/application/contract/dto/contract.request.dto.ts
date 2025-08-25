import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContractDto {
  @IsString({ message: 'Offer ID must be a string' })
  @IsNotEmpty({ message: 'Offer ID is required' })
  offerId: string;
}
