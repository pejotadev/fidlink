import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EligibilityCriteria } from '../../domain/fund/entities/eligibility-criteria.entity';
import { EligibilityCriteriaRepositoryInterface } from '../../domain/fund/repositories/eligibility-criteria.repository.interface';

@Injectable()
export class EligibilityCriteriaRepository implements EligibilityCriteriaRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(criteria: EligibilityCriteria): Promise<EligibilityCriteria> {
    const created = await this.prisma.eligibilityCriteria.create({
      data: {
        id: criteria.id,
        fundId: criteria.fundId,
        criteriaType: criteria.criteriaType,
        value: criteria.value,
        isActive: criteria.isActive,
        createdAt: criteria.createdAt,
        updatedAt: criteria.updatedAt,
      },
    });

    return EligibilityCriteria.create({
      id: created.id,
      fundId: created.fundId,
      criteriaType: created.criteriaType as any,
      value: created.value,
      isActive: created.isActive,
    });
  }

  async findById(id: string): Promise<EligibilityCriteria | null> {
    const criteria = await this.prisma.eligibilityCriteria.findUnique({
      where: { id },
    });

    if (!criteria) {
      return null;
    }

    return EligibilityCriteria.create({
      id: criteria.id,
      fundId: criteria.fundId,
      criteriaType: criteria.criteriaType as any,
      value: criteria.value,
      isActive: criteria.isActive,
    });
  }

  async findByFundId(fundId: string): Promise<EligibilityCriteria[]> {
    const criterias = await this.prisma.eligibilityCriteria.findMany({
      where: { fundId },
    });

    return criterias.map(criteria =>
      EligibilityCriteria.create({
        id: criteria.id,
        fundId: criteria.fundId,
        criteriaType: criteria.criteriaType as any,
        value: criteria.value,
        isActive: criteria.isActive,
      })
    );
  }

  async findActiveByCriteria(fundId: string): Promise<EligibilityCriteria[]> {
    const criterias = await this.prisma.eligibilityCriteria.findMany({
      where: { 
        fundId,
        isActive: true 
      },
    });

    return criterias.map(criteria =>
      EligibilityCriteria.create({
        id: criteria.id,
        fundId: criteria.fundId,
        criteriaType: criteria.criteriaType as any,
        value: criteria.value,
        isActive: criteria.isActive,
      })
    );
  }

  async update(criteria: EligibilityCriteria): Promise<EligibilityCriteria> {
    const updated = await this.prisma.eligibilityCriteria.update({
      where: { id: criteria.id },
      data: {
        fundId: criteria.fundId,
        criteriaType: criteria.criteriaType,
        value: criteria.value,
        isActive: criteria.isActive,
        updatedAt: criteria.updatedAt,
      },
    });

    return EligibilityCriteria.create({
      id: updated.id,
      fundId: updated.fundId,
      criteriaType: updated.criteriaType as any,
      value: updated.value,
      isActive: updated.isActive,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eligibilityCriteria.delete({
      where: { id },
    });
  }
}
