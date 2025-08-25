import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientEntity } from '../../domain/client/entities/client.entity';
import { CPF } from '../../domain/client/utils/cpf.utils';
import { Money } from '../../domain/client/utils/money.utils';
import { ClientRepositoryInterface } from '../../domain/client/repositories/client.repository.interface';

@Injectable()
export class ClientRepository implements ClientRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(client: ClientEntity): Promise<ClientEntity> {
    const data = {
      nome: client.name,
      dataNascimento: client.birthDate,
      cpf: client.cpf.value,
      rendaLiquidaMensal: client.monthlyIncome.amount,
    };

    if (client.id) {
      // Update existing client
      const updated = await this.prisma.client.update({
        where: { id: client.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return this.toDomain(updated);
    } else {
      // Create new client
      const created = await this.prisma.client.create({
        data,
      });

      return this.toDomain(created);
    }
  }

  async findById(id: string): Promise<ClientEntity | null> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
      });

      return client ? this.toDomain(client) : null;
    } catch (error) {
      return null;
    }
  }

  async findByCpf(cpf: CPF): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({
      where: { cpf: cpf.value },
    });

    return client ? this.toDomain(client) : null;
  }

  async exists(cpf: CPF): Promise<boolean> {
    const count = await this.prisma.client.count({
      where: { cpf: cpf.value },
    });

    return count > 0;
  }

  private toDomain(prismaClient: any): ClientEntity {
    return ClientEntity.fromPersistence({
      id: prismaClient.id,
      name: prismaClient.nome,
      birthDate: prismaClient.dataNascimento,
      cpf: new CPF(prismaClient.cpf),
      monthlyIncome: new Money(prismaClient.rendaLiquidaMensal),
      createdAt: prismaClient.createdAt,
      updatedAt: prismaClient.updatedAt,
    });
  }
}
