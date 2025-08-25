export class ClientResponseDto {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  rendaLiquidaMensal: number;
  createdAt: string;
  updatedAt: string;

  static fromDomain(client: any): ClientResponseDto {
    return {
      id: client.id,
      nome: client.name,
      dataNascimento: client.birthDate.toISOString().split('T')[0],
      cpf: client.cpf.value,
      rendaLiquidaMensal: client.monthlyIncome.amount,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }
}
