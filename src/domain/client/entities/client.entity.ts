import { CPF } from '../utils/cpf.utils';
import { Money } from '../utils/money.utils';

export interface ClientProps {
  id?: string;
  name: string;
  birthDate: Date;
  cpf: CPF;
  monthlyIncome: Money;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ClientEntity {
  private constructor(private readonly props: ClientProps) {
    this.validate();
  }

  static create(props: Omit<ClientProps, 'id' | 'createdAt' | 'updatedAt'>): ClientEntity {
    return new ClientEntity({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: ClientProps): ClientEntity {
    return new ClientEntity(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (this.props.name.trim().length > 255) {
      throw new Error('Nome não pode ter mais de 255 caracteres');
    }

    if (!this.props.birthDate) {
      throw new Error('Data de nascimento é obrigatória');
    }

    if (this.props.birthDate > new Date()) {
      throw new Error('Data de nascimento não pode ser no futuro');
    }

    // Check if person is at least 18 years old
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    
    if (this.props.birthDate > eighteenYearsAgo) {
      throw new Error('Cliente deve ter pelo menos 18 anos');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get birthDate(): Date {
    return this.props.birthDate;
  }

  get cpf(): CPF {
    return this.props.cpf;
  }

  get monthlyIncome(): Money {
    return this.props.monthlyIncome;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  updateIncome(newIncome: Money): void {
    this.props.monthlyIncome = newIncome;
    this.props.updatedAt = new Date();
  }

  equals(other: ClientEntity): boolean {
    return this.props.cpf.equals(other.props.cpf);
  }
}
