import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Simulation } from '../../domain/simulation/entities/simulation.entity';
import { SimulationRepositoryInterface } from '../../domain/simulation/repositories/simulation.repository.interface';

@Injectable()
export class SimulationRepository implements SimulationRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(simulation: Simulation): Promise<Simulation> {
    const created = await this.prisma.simulation.create({
      data: {
        id: simulation.id,
        clientId: simulation.clientId,
        requestedAmount: simulation.requestedAmount,
        purpose: simulation.purpose.toString(),
        firstPaymentDate: simulation.firstPaymentDate,
        createdAt: simulation.createdAt,
        updatedAt: simulation.updatedAt,
      },
    });

    return Simulation.create({
      id: created.id,
      clientId: created.clientId,
      requestedAmount: created.requestedAmount,
      purpose: created.purpose as any,
      firstPaymentDate: created.firstPaymentDate,
    });
  }

  async findById(id: string): Promise<Simulation | null> {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
    });

    if (!simulation) {
      return null;
    }

    return Simulation.create({
      id: simulation.id,
      clientId: simulation.clientId,
      requestedAmount: simulation.requestedAmount,
      purpose: simulation.purpose as any,
      firstPaymentDate: simulation.firstPaymentDate,
    });
  }

  async findByClientId(clientId: string): Promise<Simulation[]> {
    const simulations = await this.prisma.simulation.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return simulations.map(simulation =>
      Simulation.create({
        id: simulation.id,
        clientId: simulation.clientId,
        requestedAmount: simulation.requestedAmount,
        purpose: simulation.purpose as any,
        firstPaymentDate: simulation.firstPaymentDate,
      })
    );
  }

  async update(simulation: Simulation): Promise<Simulation> {
    const updated = await this.prisma.simulation.update({
      where: { id: simulation.id },
      data: {
        requestedAmount: simulation.requestedAmount,
        purpose: simulation.purpose.toString(),
        firstPaymentDate: simulation.firstPaymentDate,
        updatedAt: simulation.updatedAt,
      },
    });

    return Simulation.create({
      id: updated.id,
      clientId: updated.clientId,
      requestedAmount: updated.requestedAmount,
      purpose: updated.purpose as any,
      firstPaymentDate: updated.firstPaymentDate,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.simulation.delete({
      where: { id },
    });
  }
}
