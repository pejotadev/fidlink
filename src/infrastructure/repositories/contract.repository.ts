import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Contract, ContractStatus } from '../../domain/contract/entities/contract.entity';
import { ContractRepositoryInterface } from '../../domain/contract/repositories/contract.repository.interface';

@Injectable()
export class ContractRepository implements ContractRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(contract: Contract): Promise<Contract> {
    const created = await this.prisma.contract.create({
      data: {
        id: contract.id,
        clientId: contract.clientId,
        fundId: contract.fundId,
        offerId: contract.offerId,
        contractNumber: contract.contractNumber,
        loanAmount: contract.loanAmount,
        monthlyPayment: contract.monthlyPayment,
        numberOfInstallments: contract.numberOfInstallments,
        totalAmount: contract.totalAmount,
        interestRate: contract.interestRate,
        purpose: contract.purpose,
        firstPaymentDate: contract.firstPaymentDate,
        status: contract.status,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      },
    });

    return Contract.create({
      id: created.id,
      clientId: created.clientId,
      fundId: created.fundId,
      offerId: created.offerId,
      contractNumber: created.contractNumber,
      loanAmount: created.loanAmount,
      monthlyPayment: created.monthlyPayment,
      numberOfInstallments: created.numberOfInstallments,
      totalAmount: created.totalAmount,
      interestRate: created.interestRate,
      purpose: created.purpose,
      firstPaymentDate: created.firstPaymentDate,
    });
  }

  async findById(id: string): Promise<Contract | null> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return null;
    }

    return this.mapToEntity(contract);
  }

  async findByClientId(clientId: string): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map(contract => this.mapToEntity(contract));
  }

  async findByContractNumber(contractNumber: string): Promise<Contract | null> {
    const contract = await this.prisma.contract.findUnique({
      where: { contractNumber },
    });

    if (!contract) {
      return null;
    }

    return this.mapToEntity(contract);
  }

  async findActiveByClientId(clientId: string): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({
      where: { 
        clientId,
        status: ContractStatus.ACTIVE 
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map(contract => this.mapToEntity(contract));
  }

  async update(contract: Contract): Promise<Contract> {
    const updated = await this.prisma.contract.update({
      where: { id: contract.id },
      data: {
        loanAmount: contract.loanAmount,
        monthlyPayment: contract.monthlyPayment,
        numberOfInstallments: contract.numberOfInstallments,
        totalAmount: contract.totalAmount,
        interestRate: contract.interestRate,
        purpose: contract.purpose,
        firstPaymentDate: contract.firstPaymentDate,
        status: contract.status,
        updatedAt: contract.updatedAt,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contract.delete({
      where: { id },
    });
  }

  private mapToEntity(prismaContract: any): Contract {
    return new Contract(
      prismaContract.id,
      prismaContract.clientId,
      prismaContract.fundId,
      prismaContract.offerId,
      prismaContract.contractNumber,
      prismaContract.loanAmount,
      prismaContract.monthlyPayment,
      prismaContract.numberOfInstallments,
      prismaContract.totalAmount,
      prismaContract.interestRate,
      prismaContract.purpose,
      prismaContract.firstPaymentDate,
      prismaContract.status as ContractStatus,
      prismaContract.createdAt,
      prismaContract.updatedAt
    );
  }
}
