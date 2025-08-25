import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClientCreateDto {
  @ValidateIf(o => !o.nome)
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name?: string;

  @ValidateIf(o => !o.name)
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome?: string;

  @ValidateIf(o => !o.dataNascimento)
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  birthDate?: string;

  @ValidateIf(o => !o.birthDate)
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  dataNascimento?: string;

  @IsString({ message: 'CPF deve ser uma string' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { 
    message: 'CPF deve estar no formato 000.000.000-00' 
  })
  cpf: string;

  @ValidateIf(o => !o.rendaLiquidaMensal)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber({}, { message: 'Renda mensal deve ser um número' })
  @Min(0, { message: 'Renda mensal não pode ser negativa' })
  monthlyIncome?: number;

  @ValidateIf(o => !o.monthlyIncome)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber({}, { message: 'Renda mensal deve ser um número' })
  @Min(0, { message: 'Renda mensal não pode ser negativa' })
  rendaLiquidaMensal?: number;
}
