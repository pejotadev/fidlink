import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Offer } from '../../domain/simulation/entities/offer.entity';
import { OfferRepositoryInterface } from '../../domain/simulation/repositories/offer.repository.interface';

@Injectable()
export class OfferRepository implements OfferRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(offer: Offer): Promise<Offer> {
    const created = await this.prisma.offer.create({
      data: {
        id: offer.id,
        simulationId: offer.simulationId,
        fundId: offer.fundId,
        loanAmount: offer.loanAmount,
        monthlyPayment: offer.monthlyPayment,
        numberOfInstallments: offer.numberOfInstallments,
        totalAmount: offer.totalAmount,
        interestRate: offer.interestRate,
        isAccepted: offer.isAccepted,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      },
    });

    return Offer.create({
      id: created.id,
      simulationId: created.simulationId,
      fundId: created.fundId,
      loanAmount: created.loanAmount,
      monthlyPayment: created.monthlyPayment,
      numberOfInstallments: created.numberOfInstallments,
      totalAmount: created.totalAmount,
      interestRate: created.interestRate,
    });
  }

  async createMany(offers: Offer[]): Promise<Offer[]> {
    const data = offers.map(offer => ({
      id: offer.id,
      simulationId: offer.simulationId,
      fundId: offer.fundId,
      loanAmount: offer.loanAmount,
      monthlyPayment: offer.monthlyPayment,
      numberOfInstallments: offer.numberOfInstallments,
      totalAmount: offer.totalAmount,
      interestRate: offer.interestRate,
      isAccepted: offer.isAccepted,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    }));

    await this.prisma.offer.createMany({ data });

    // Return the created offers
    return offers;
  }

  async findById(id: string): Promise<Offer | null> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return null;
    }

    return Offer.create({
      id: offer.id,
      simulationId: offer.simulationId,
      fundId: offer.fundId,
      loanAmount: offer.loanAmount,
      monthlyPayment: offer.monthlyPayment,
      numberOfInstallments: offer.numberOfInstallments,
      totalAmount: offer.totalAmount,
      interestRate: offer.interestRate,
    });
  }

  async findBySimulationId(simulationId: string): Promise<Offer[]> {
    const offers = await this.prisma.offer.findMany({
      where: { simulationId },
      orderBy: { interestRate: 'asc' },
    });

    return offers.map(offer =>
      Offer.create({
        id: offer.id,
        simulationId: offer.simulationId,
        fundId: offer.fundId,
        loanAmount: offer.loanAmount,
        monthlyPayment: offer.monthlyPayment,
        numberOfInstallments: offer.numberOfInstallments,
        totalAmount: offer.totalAmount,
        interestRate: offer.interestRate,
      })
    );
  }

  async findAcceptedBySimulationId(simulationId: string): Promise<Offer | null> {
    const offer = await this.prisma.offer.findFirst({
      where: { 
        simulationId,
        isAccepted: true 
      },
    });

    if (!offer) {
      return null;
    }

    return Offer.create({
      id: offer.id,
      simulationId: offer.simulationId,
      fundId: offer.fundId,
      loanAmount: offer.loanAmount,
      monthlyPayment: offer.monthlyPayment,
      numberOfInstallments: offer.numberOfInstallments,
      totalAmount: offer.totalAmount,
      interestRate: offer.interestRate,
    });
  }

  async update(offer: Offer): Promise<Offer> {
    const updated = await this.prisma.offer.update({
      where: { id: offer.id },
      data: {
        loanAmount: offer.loanAmount,
        monthlyPayment: offer.monthlyPayment,
        numberOfInstallments: offer.numberOfInstallments,
        totalAmount: offer.totalAmount,
        interestRate: offer.interestRate,
        isAccepted: offer.isAccepted,
        updatedAt: offer.updatedAt,
      },
    });

    return Offer.create({
      id: updated.id,
      simulationId: updated.simulationId,
      fundId: updated.fundId,
      loanAmount: updated.loanAmount,
      monthlyPayment: updated.monthlyPayment,
      numberOfInstallments: updated.numberOfInstallments,
      totalAmount: updated.totalAmount,
      interestRate: updated.interestRate,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.offer.delete({
      where: { id },
    });
  }
}
