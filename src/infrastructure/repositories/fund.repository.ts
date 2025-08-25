import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Fund } from '../../domain/fund/entities/fund.entity';
import { FundRepositoryInterface } from '../../domain/fund/repositories/fund.repository.interface';

@Injectable()
export class FundRepository implements FundRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(fund: Fund): Promise<Fund> {
    const created = await this.prisma.fund.create({
      data: {
        id: fund.id,
        name: fund.name,
        baseInterestRate: fund.baseInterestRate,
        isActive: fund.isActive,
        createdAt: fund.createdAt,
        updatedAt: fund.updatedAt,
      },
    });

    return Fund.create({
      id: created.id,
      name: created.name,
      baseInterestRate: created.baseInterestRate,
      isActive: created.isActive,
    });
  }

  async findById(id: string): Promise<Fund | null> {
    const fund = await this.prisma.fund.findUnique({
      where: { id },
    });

    if (!fund) {
      return null;
    }

    return Fund.create({
      id: fund.id,
      name: fund.name,
      baseInterestRate: fund.baseInterestRate,
      isActive: fund.isActive,
    });
  }

  async findAll(): Promise<Fund[]> {
    const funds = await this.prisma.fund.findMany();

    return funds.map(fund =>
      Fund.create({
        id: fund.id,
        name: fund.name,
        baseInterestRate: fund.baseInterestRate,
        isActive: fund.isActive,
      })
    );
  }

  async findActiveOnly(): Promise<Fund[]> {
    const funds = await this.prisma.fund.findMany({
      where: { isActive: true },
    });

    return funds.map(fund =>
      Fund.create({
        id: fund.id,
        name: fund.name,
        baseInterestRate: fund.baseInterestRate,
        isActive: fund.isActive,
      })
    );
  }

  async update(fund: Fund): Promise<Fund> {
    const updated = await this.prisma.fund.update({
      where: { id: fund.id },
      data: {
        name: fund.name,
        baseInterestRate: fund.baseInterestRate,
        isActive: fund.isActive,
        updatedAt: fund.updatedAt,
      },
    });

    return Fund.create({
      id: updated.id,
      name: updated.name,
      baseInterestRate: updated.baseInterestRate,
      isActive: updated.isActive,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fund.delete({
      where: { id },
    });
  }
}
