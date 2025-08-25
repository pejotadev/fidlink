# FidLink API

API NestJS modular para gestão de clientes com Prisma e MySQL.

## Funcionalidades

- ✅ Módulo Client com endpoints REST
- ✅ Validação de dados com class-validator
- ✅ Banco de dados MySQL com Prisma ORM
- ✅ Docker e Docker Compose para desenvolvimento
- ✅ Configuração para deploy na Vercel

## Endpoints

### POST /client
Cadastra um novo cliente.

**Body:**
```json
{
  "nome": "João Silva",
  "dataNascimento": "1990-01-15",
  "cpf": "123.456.789-00",
  "rendaLiquidaMensal": 5000.50
}
```

### GET /client/:id
Busca um cliente pelo ID.

**Response:**
```json
{
  "id": "clp...",
  "nome": "João Silva",
  "dataNascimento": "1990-01-15T00:00:00.000Z",
  "cpf": "123.456.789-00",
  "rendaLiquidaMensal": 5000.5,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

## Desenvolvimento

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+ (ou Docker)
- Docker e Docker Compose (opcional)

### Configuração Rápida

Execute o script de configuração:
```bash
npm run setup
```

Ou manualmente:

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Opção A - Usando Docker:**
```bash
# Inicie o Docker Desktop primeiro
docker compose up -d
```

4. **Opção B - MySQL local:**
```bash
# Configure sua instância MySQL local
# Atualize a DATABASE_URL no .env
```

5. **Execute as migrations:**
```bash
npm run db:migrate
```

6. **Inicie o servidor:**
```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

### Scripts Disponíveis

```bash
# Configuração
npm run setup          # Script de configuração automática

# Desenvolvimento
npm run start:dev      # Servidor em modo watch
npm run start:debug    # Servidor em modo debug

# Build e Produção
npm run build          # Build da aplicação
npm run start:prod     # Executa versão de produção

# Testes
npm test               # Executa testes unitários
npm run test:watch     # Testes em modo watch
npm run test:cov       # Testes com coverage

# Testes E2E
npm run test:e2e:mock      # E2E com mocks (sem banco)
npm run test:e2e:mock:cov  # E2E com coverage
npm run test:e2e:setup     # E2E com banco real

# Prisma
npm run db:generate    # Gera o client Prisma
npm run db:migrate     # Executa migrations
npm run db:push        # Aplica schema ao banco
npm run db:studio      # Interface visual do banco
npm run db:reset       # Reset completo do banco

# Docker
npm run docker:up      # Inicia serviços
npm run docker:down    # Para serviços
npm run docker:logs    # Visualiza logs

# Qualidade de Código
npm run lint           # ESLint
npm run format         # Prettier
```

## Deploy na Vercel

1. Configure as variáveis de ambiente no painel da Vercel
2. Conecte seu repositório GitHub
3. A Vercel detectará automaticamente a configuração do NestJS

### Variáveis de Ambiente (Vercel)

```
DATABASE_URL=mysql://usuario:senha@host:porta/database
NODE_ENV=production
```

## Validações

- **Nome**: Obrigatório, string não vazia
- **Data de Nascimento**: Formato ISO date string
- **CPF**: Formato 000.000.000-00, único no sistema
- **Renda Líquida Mensal**: Número positivo

## Testando a API

### Health Check
```bash
curl http://localhost:3000/health
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "dataNascimento": "1990-01-15",
    "cpf": "123.456.789-00",
    "rendaLiquidaMensal": 5000.50
  }'
```

### Buscar Cliente
```bash
# Substitua {id} pelo ID retornado na criação
curl http://localhost:3000/client/{id}
```

### Testando a API

**VS Code REST Client:**
O projeto inclui exemplos de requisições em `examples/requests.http` para uso com a extensão REST Client do VS Code.

**Comandos cURL:**
- `curl-commands.txt` - Comandos cURL prontos para uso
- Inclui casos de sucesso, erro e validações
- Pode ser importado diretamente no Postman

**Postman:**
- `postman/FidLink-API.postman_collection.json` - Coleção completa do Postman
- 11 requisições pré-configuradas com testes automatizados
- Variáveis de ambiente (`base_url`, `client_id`)
- Validações automáticas de resposta

### Testes Automatizados

**Testes Unitários:**
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:cov

# Testes em modo watch
npm run test:watch
```

**Testes End-to-End (E2E):**
```bash
# E2E com mocks (roda sem banco de dados)
npm run test:e2e:mock

# E2E com coverage
npm run test:e2e:mock:cov

# E2E em modo watch
npm run test:e2e:mock:watch

# E2E com banco real (requer MySQL rodando)
npm run test:e2e:setup
```

**Executar todos os testes:**
```bash
# Todos os testes (unitários + e2e mock)
npm test && npm run test:e2e:mock
```

## Estrutura do Projeto

```
src/
├── client/              # Módulo Client
│   ├── dto/            # Data Transfer Objects
│   │   ├── create-client.dto.ts
│   │   └── client-response.dto.ts
│   ├── client.controller.ts  # Endpoints REST
│   ├── client.service.ts     # Lógica de negócio
│   ├── client.service.spec.ts # Testes unitários
│   └── client.module.ts      # Configuração do módulo
├── prisma/             # Configuração Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── health/             # Health check
│   └── health.controller.ts
├── app.module.ts       # Módulo principal
└── main.ts            # Entry point

prisma/
├── schema.prisma       # Schema do banco
├── schema-test.prisma  # Schema para testes
└── migrations/         # Migrations SQL

test/
├── app.e2e-spec.ts         # Testes E2E básicos
├── client.e2e-spec.ts      # Testes E2E com banco real
├── client-mock.e2e-spec.ts # Testes E2E com mocks
├── setup-e2e.ts           # Setup para testes E2E
├── jest-e2e.json          # Config Jest E2E com banco
└── jest-e2e-mock.json     # Config Jest E2E com mocks

examples/
├── requests.http       # Exemplos de requisições REST Client
└── demo.js            # Script de demonstração da API

postman/
└── FidLink-API.postman_collection.json  # Coleção do Postman

curl-commands.txt       # Comandos cURL prontos para uso

scripts/
├── setup.sh           # Script de configuração inicial
└── test-e2e.sh        # Script para testes E2E com banco
```
