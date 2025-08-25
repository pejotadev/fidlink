import { Offer } from '../entities/offer.entity';

export interface OfferRepositoryInterface {
  create(offer: Offer): Promise<Offer>;
  createMany(offers: Offer[]): Promise<Offer[]>;
  findById(id: string): Promise<Offer | null>;
  findBySimulationId(simulationId: string): Promise<Offer[]>;
  findAcceptedBySimulationId(simulationId: string): Promise<Offer | null>;
  update(offer: Offer): Promise<Offer>;
  delete(id: string): Promise<void>;
}
