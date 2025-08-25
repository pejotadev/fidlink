# 🏦 FidLink API - Personal Credit System

<div align="center">

[![Build Status](https://github.com/pejotadev/fidlink/actions/workflows/ci.yml/badge.svg)](https://github.com/pejotadev/fidlink/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/codecov/c/github/pejotadev/fidlink)](https://codecov.io/gh/pejotadev/fidlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-v10.0.0-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.0.0-blue)](https://www.typescriptlang.org/)

**🚀 Sistema completo de crédito pessoal implementado com Domain-Driven Design, cache híbrido e arquitetura enterprise.**

[📖 API Guide](API_GUIDE.md) • [🧪 Examples](examples/) • [🐛 Report Bug](https://github.com/pejotadev/fidlink/issues/new) • [✨ Request Feature](https://github.com/pejotadev/fidlink/issues/new)

</div>

---

## 📋 Visão Geral

O **FidLink** é uma API completa para gestão de sistema de crédito pessoal que conecta clientes a um marketplace de fundos de investimento. Implementado em **NestJS** seguindo princípios de **Domain-Driven Design (DDD)**, oferece um fluxo completo desde a elegibilidade até a contratação de empréstimos.

### ✨ Características Principais

- 🏗️ **Arquitetura DDD** - Domain, Application, Infrastructure e Presentation layers
- 🔍 **Sistema de Elegibilidade** - Avaliação automática baseada em critérios de fundos
- 💰 **Simulação de Ofertas** - Cálculo PMT com otimização automática
- 📋 **Gestão de Contratos** - Criação e acompanhamento de contratos
- ⚡ **Cache Híbrido** - Redis + In-Memory com decorators customizados
- 🧪 **Testes Abrangentes** - Unitários, E2E com mocks e banco real
- 🐳 **Docker Ready** - Configuração completa para desenvolvimento
- 🚀 **Deploy Vercel** - Pronto para produção

## 🚀 Quick Start

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/pejotadev/fidlink.git
cd fidlink

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 2. Banco de Dados

**Opção A - Docker (Recomendado):**
```bash
# Iniciar serviços
npm run docker:up

# Aplicar schema
npm run db:push

# Popular fundos iniciais
npm run db:seed
```

**Opção B - Local:**
```bash
# Configure sua instância MySQL/SQLite
# Atualize DATABASE_URL no .env

# Executar migrations
npm run db:migrate

# Popular fundos
npm run db:seed
```

### 3. Executar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3000`

## 🛠️ Tecnologias

- **Framework:** NestJS v10
- **Language:** TypeScript v5
- **Database:** SQLite/MySQL com Prisma ORM
- **Cache:** Redis + Cache Manager
- **Validation:** Class Validator & Class Transformer
- **Testing:** Jest + Supertest
- **Containerization:** Docker & Docker Compose
- **Deploy:** Vercel Ready

## 🌐 API Endpoints

### 👤 Cliente
- `POST /client` - Cadastrar novo cliente
- `GET /client/:id` - Buscar cliente por ID

### ✅ Elegibilidade  
- `POST /eligibility/check` - Verificar elegibilidade para fundos

### 💰 Simulação
- `POST /simulation` - Criar simulação e gerar ofertas

### 📋 Contrato
- `POST /contract` - Fechar contrato baseado em oferta
- `GET /contract/client/:clientId` - Listar contratos do cliente

### 🔧 Utilitários
- `GET /health` - Health check
- `POST /cache/clear` - Limpar cache (desenvolvimento)

> 📖 Para documentação completa dos endpoints, exemplos e fluxos, consulte o [API Guide](API_GUIDE.md).

## 🏗️ Arquitetura DDD

```
src/
├── domain/                 # 🧠 Regras de Negócio
│   ├── client/            # Entidades e serviços de cliente
│   ├── fund/              # Entidades e critérios de fundos  
│   ├── eligibility/       # Serviços de elegibilidade
│   ├── simulation/        # Entidades e cálculos de simulação
│   └── contract/          # Entidades e serviços de contrato
├── application/           # 🎯 Casos de Uso
│   ├── client/           # Use cases de cliente
│   ├── eligibility/      # Use cases de elegibilidade
│   ├── simulation/       # Use cases de simulação
│   └── contract/         # Use cases de contrato
├── infrastructure/        # 🔧 Persistência e Infra
│   ├── repositories/     # Implementações de repositórios
│   └── cache/            # Sistema de cache híbrido
├── presentation/          # 🌐 Controllers e DTOs
│   └── controllers/      # Endpoints REST
└── modules/              # 📦 Módulos NestJS
```

### 🎯 Principais Fluxos

1. **Cliente** → Cadastro com validações de CPF e dados
2. **Elegibilidade** → Avaliação automática baseada em critérios dos fundos
3. **Simulação** → Geração de ofertas com cálculo PMT otimizado
4. **Contrato** → Fechamento e gestão de contratos ativos

## 📊 Modelo de Dados

```mermaid
erDiagram
    Client ||--o{ Simulation : creates
    Client ||--o{ Contract : signs
    Fund ||--o{ EligibilityCriteria : has
    Fund ||--o{ Offer : generates
    Fund ||--o{ Contract : funds
    Simulation ||--o{ Offer : contains
    Offer ||--|| Contract : becomes
    
    Client {
        string id PK
        string nome
        datetime dataNascimento
        string cpf UK
        float rendaLiquidaMensal
    }
    
    Fund {
        string id PK
        string name
        float baseInterestRate
        boolean isActive
    }
    
    EligibilityCriteria {
        string id PK
        string fundId FK
        string criteriaType
        string value
    }
    
    Simulation {
        string id PK
        string clientId FK
        float requestedAmount
        string purpose
        datetime firstPaymentDate
    }
    
    Offer {
        string id PK
        string simulationId FK
        string fundId FK
        float loanAmount
        float monthlyPayment
        int numberOfInstallments
    }
    
    Contract {
        string id PK
        string clientId FK
        string fundId FK
        string offerId FK UK
        string contractNumber UK
        string status
    }
```

## 🧪 Testes

### Estratégia de Testes

- **Unitários:** Cobertura de services e domain logic
- **E2E com Mocks:** Testes rápidos sem dependências externas
- **E2E com Banco:** Testes de integração completos

### Comandos de Teste

```bash
# Testes unitários
npm test
npm run test:watch
npm run test:cov

# Testes E2E com mocks (rápido)
npm run test:e2e:mock
npm run test:e2e:mock:cov

# Testes E2E com banco real (completo)
npm run test:e2e:setup
npm run test:e2e:full

# Todos os testes
npm test && npm run test:e2e:mock
```

## 📁 Scripts Úteis

```bash
# 🏗️ Desenvolvimento
npm run start:dev      # Servidor em modo watch
npm run start:debug    # Servidor em modo debug

# 🧪 Qualidade
npm run lint           # ESLint
npm run format         # Prettier
npm run format:check   # Verificar formatação

# 🗄️ Banco de Dados  
npm run db:generate    # Gerar client Prisma
npm run db:migrate     # Executar migrations
npm run db:push        # Aplicar schema
npm run db:studio      # Interface visual
npm run db:reset       # Reset completo
npm run db:seed        # Popular fundos

# 🐳 Docker
npm run docker:up      # Iniciar serviços
npm run docker:down    # Parar serviços  
npm run docker:logs    # Visualizar logs

# 🚀 Produção
npm run build          # Build da aplicação
npm run start:prod     # Executar produção
npm run build:vercel   # Build otimizado para Vercel
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Configure as variáveis de ambiente:**
   ```
   DATABASE_URL=your_production_database_url
   NODE_ENV=production
   REDIS_URL=your_redis_url (opcional)
   ```

2. **Deploy automático:**
   - Conecte o repositório GitHub à Vercel
   - A configuração será detectada automaticamente via `vercel.json`

### Docker

```bash
# Build da imagem
docker build -t fidlink-api .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  fidlink-api
```

## 🔒 Validações e Regras de Negócio

### Validações de Cliente
- **Nome:** Obrigatório, string não vazia
- **CPF:** Formato válido e único no sistema
- **Data de Nascimento:** Formato ISO válido
- **Renda:** Valor numérico positivo

### Critérios de Elegibilidade
- **Idade Mínima:** Por fundo (ex: 18, 21, 30 anos)
- **Comprometimento de Renda:** Máximo por fundo (ex: 20%, 25%, 32%)
- **Valor Mínimo:** Threshold de empréstimo por fundo
- **Propósitos Excluídos:** Restrições por tipo de uso

### Cálculos Financeiros
- **Fórmula PMT:** `PMT = PV * i / (1 - (1 + i)^(-n))`
- **Otimização Automática:** Ajuste do valor para caber no comprometimento
- **Validação de Vencimento:** Primeira parcela em até 45 dias

## 📚 Exemplos de Uso

### Fluxo Completo via cURL

```bash
# 1. Criar cliente
curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "dataNascimento": "1985-03-15", 
    "cpf": "123.456.789-09",
    "rendaLiquidaMensal": 8000.00
  }'

# 2. Verificar elegibilidade  
curl -X POST http://localhost:3000/eligibility/check \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID_RETORNADO",
    "requestedAmount": 30000,
    "purpose": "shopping",
    "firstPaymentDate": "2025-10-15"
  }'

# 3. Criar simulação
curl -X POST http://localhost:3000/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID_RETORNADO", 
    "requestedAmount": 30000,
    "purpose": "shopping",
    "firstPaymentDate": "2025-10-15",
    "numberOfInstallments": 24
  }'

# 4. Fechar contrato
curl -X POST http://localhost:3000/contract \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "OFFER_ID_RETORNADO"
  }'
```

### Exemplos Adicionais

- **REST Client:** `examples/requests.http`
- **Postman Collection:** `postman/FidLink-API.postman_collection.json`
- **Demo Script:** `examples/demo.js`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Add nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**🎉 Sistema completo de crédito implementado com DDD e padrões enterprise!**

</div>