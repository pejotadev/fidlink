import { EligibilityCriteria } from '../entities/eligibility-criteria.entity';

export interface EligibilityCriteriaRepositoryInterface {
  create(criteria: EligibilityCriteria): Promise<EligibilityCriteria>;
  findById(id: string): Promise<EligibilityCriteria | null>;
  findByFundId(fundId: string): Promise<EligibilityCriteria[]>;
  findActiveByCriteria(fundId: string): Promise<EligibilityCriteria[]>;
  update(criteria: EligibilityCriteria): Promise<EligibilityCriteria>;
  delete(id: string): Promise<void>;
}
