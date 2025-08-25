import { Fund } from '../entities/fund.entity';

export interface FundRepositoryInterface {
  create(fund: Fund): Promise<Fund>;
  findById(id: string): Promise<Fund | null>;
  findAll(): Promise<Fund[]>;
  findActiveOnly(): Promise<Fund[]>;
  update(fund: Fund): Promise<Fund>;
  delete(id: string): Promise<void>;
}
