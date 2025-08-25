import { ClientEntity } from '../entities/client.entity';
import { CPF } from '../utils/cpf.utils';

export interface ClientRepositoryInterface {
  save(client: ClientEntity): Promise<ClientEntity>;
  findById(id: string): Promise<ClientEntity | null>;
  findByCpf(cpf: CPF): Promise<ClientEntity | null>;
  exists(cpf: CPF): Promise<boolean>;
}
