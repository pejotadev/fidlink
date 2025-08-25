# 🏦 FidLink API - Personal Credit System

Sistema completo de crédito pessoal com marketplace de fundos implementado em NestJS seguindo padrões DDD.

## 🚀 Quick Start

### 1. Setup do Banco de Dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular fundos iniciais
npm run db:seed
```

### 2. Iniciar o Servidor
```bash
npm run start:dev
```

Servidor rodará em: `http://localhost:3000`

## 📊 Fundos Disponíveis

| Fundo | Taxa | Idade Min | Comprometimento Max | Valor Min | Restrições |
|-------|------|-----------|---------------------|-----------|------------|
| **Fund A** | 2,75% a.m. | 21 anos | 20% da renda | - | - |
| **Fund B** | 2,10% a.m. | 30 anos | 25% da renda | R$ 20.000 | Não empresta para negócios |
| **Fund C** | 4,25% a.m. | 18 anos | 32% da renda | - | Não empresta para viagem |

## 🛤️ Fluxo Completo da API

### 1. 👤 Cadastrar Cliente
```http
POST /client
Content-Type: application/json

{
  "nome": "Maria da Silva",
  "dataNascimento": "1985-03-15",
  "cpf": "123.456.789-09",
  "rendaLiquidaMensal": 8000.00
}
```

**Resposta:**
```json
{
  "id": "clp_12345...",
  "nome": "Maria da Silva",
  "cpf": "123.456.789-09",
  "rendaLiquidaMensal": 8000,
  "dataNascimento": "1985-03-15T00:00:00.000Z",
  "createdAt": "2025-01-25T10:00:00.000Z",
  "updatedAt": "2025-01-25T10:00:00.000Z"
}
```

### 2. ✅ Verificar Elegibilidade
```http
POST /eligibility/check
Content-Type: application/json

{
  "clientId": "clp_12345...",
  "requestedAmount": 30000,
  "purpose": "shopping",
  "firstPaymentDate": "2025-10-15"
}
```

**Resposta:**
```json
{
  "eligibleFunds": [
    {
      "fundId": "fund_A_id",
      "fundName": "Fund A",
      "baseInterestRate": 0.0275,
      "isEligible": true,
      "reasons": []
    }
  ],
  "ineligibleFunds": [
    {
      "fundId": "fund_B_id",
      "fundName": "Fund B",
      "baseInterestRate": 0.021,
      "isEligible": false,
      "reasons": ["Minimum loan amount is R$ 20000.00"]
    }
  ],
  "totalFundsEvaluated": 3
}
```

### 3. 💰 Criar Simulação (Gerar Ofertas)
```http
POST /simulation
Content-Type: application/json

{
  "clientId": "clp_12345...",
  "requestedAmount": 30000,
  "purpose": "shopping",
  "firstPaymentDate": "2025-10-15",
  "numberOfInstallments": 24
}
```

**Resposta:**
```json
{
  "simulationId": "sim_67890...",
  "clientId": "clp_12345...",
  "requestedAmount": 30000,
  "purpose": "shopping",
  "firstPaymentDate": "2025-10-15",
  "numberOfInstallments": 24,
  "offers": [
    {
      "id": "offer_abc123...",
      "fundId": "fund_A_id",
      "fundName": "Fund A",
      "loanAmount": 30000,
      "monthlyPayment": 1547.85,
      "numberOfInstallments": 24,
      "totalAmount": 37148.40,
      "interestRate": 0.0275,
      "installmentDescription": "24x de R$ 1547.85"
    }
  ],
  "totalOffersGenerated": 1,
  "createdAt": "2025-01-25T10:05:00.000Z"
}
```

### 4. 📋 Fechar Contrato
```http
POST /contract
Content-Type: application/json

{
  "offerId": "offer_abc123..."
}
```

**Resposta:**
```json
{
  "id": "ctr_xyz789...",
  "contractNumber": "CTR-12345678-ABC123",
  "clientId": "clp_12345...",
  "fundId": "fund_A_id",
  "fundName": "Fund A",
  "loanAmount": 30000,
  "monthlyPayment": 1547.85,
  "numberOfInstallments": 24,
  "totalAmount": 37148.40,
  "interestRate": 0.0275,
  "purpose": "shopping",
  "firstPaymentDate": "2025-10-15",
  "status": "active",
  "installmentDescription": "24x de R$ 1547.85",
  "summary": {
    "totalInterest": 7148.40,
    "effectiveRate": 23.83,
    "monthlyInterestAmount": 297.85
  },
  "createdAt": "2025-01-25T10:10:00.000Z",
  "updatedAt": "2025-01-25T10:10:00.000Z"
}
```

### 5. 📄 Listar Contratos do Cliente
```http
GET /contract/client/clp_12345...
```

**Resposta:**
```json
{
  "contracts": [
    {
      "id": "ctr_xyz789...",
      "contractNumber": "CTR-12345678-ABC123",
      "fundName": "Fund A",
      "loanAmount": 30000,
      "monthlyPayment": 1547.85,
      "status": "active",
      "summary": {
        "totalInterest": 7148.40,
        "effectiveRate": 23.83,
        "monthlyInterestAmount": 297.85
      }
    }
  ],
  "total": 1,
  "activeContracts": 1,
  "totalLoanAmount": 30000,
  "totalMonthlyPayments": 1547.85
}
```

## 🎯 Propósitos de Empréstimo

- `business_investment` - Investimento em negócio
- `travel` - Viagem  
- `shopping` - Compras

## ⚡ Validações Automáticas

### Elegibilidade
- ✅ Idade mínima por fundo
- ✅ Comprometimento máximo da renda
- ✅ Valor mínimo de empréstimo
- ✅ Propósitos excluídos por fundo
- ✅ Data de vencimento (máximo 45 dias)

### Cálculos PMT
- ✅ Fórmula: `PMT = PV * i / (1 - (1 + i)^(-n))`
- ✅ Validação de comprometimento de renda
- ✅ Otimização automática do valor do empréstimo

## 🧪 Endpoints para Testes

### Health Check
```http
GET /health
```

### Cliente por ID
```http
GET /client/:id
```

## 📱 Exemplos de Uso

Veja exemplos completos em:
- `examples/complete-flow.http`
- `examples/eligibility-requests.http`

## 🏗️ Arquitetura DDD

```
src/
├── domain/           # Regras de negócio
│   ├── client/       # Entidades e serviços de cliente
│   ├── fund/         # Entidades e critérios de fundos
│   ├── eligibility/  # Serviços de elegibilidade
│   ├── simulation/   # Entidades e cálculos de simulação
│   └── contract/     # Entidades e serviços de contrato
├── application/      # Casos de uso
├── infrastructure/   # Repositórios e persistência
└── presentation/     # Controllers e DTOs
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Testes
npm run test:e2e:mock

# Database
npm run db:seed       # Popular fundos
npm run db:studio     # Visualizar dados
npm run db:reset      # Reset completo
```

## 📊 Cenários de Teste

1. **Cliente Jovem (25 anos)** - Elegível para Fund A e Fund C
2. **Cliente Experiente (35 anos)** - Elegível para todos os fundos
3. **Empréstimo para Negócio** - Fund B rejeita automaticamente
4. **Empréstimo para Viagem** - Fund C rejeita automaticamente
5. **Valor Alto (>R$ 20k)** - Necessário para Fund B

---

**🎉 Sistema completo implementado seguindo BDD, DDD e padrões enterprise!**
