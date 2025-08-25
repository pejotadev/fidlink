import { Simulation } from '../entities/simulation.entity';

export interface SimulationRepositoryInterface {
  create(simulation: Simulation): Promise<Simulation>;
  findById(id: string): Promise<Simulation | null>;
  findByClientId(clientId: string): Promise<Simulation[]>;
  update(simulation: Simulation): Promise<Simulation>;
  delete(id: string): Promise<void>;
}
