import { Contract } from '../entities/contract.entity';

export interface ContractRepositoryInterface {
  create(contract: Contract): Promise<Contract>;
  findById(id: string): Promise<Contract | null>;
  findByClientId(clientId: string): Promise<Contract[]>;
  findByContractNumber(contractNumber: string): Promise<Contract | null>;
  findActiveByClientId(clientId: string): Promise<Contract[]>;
  update(contract: Contract): Promise<Contract>;
  delete(id: string): Promise<void>;
}
