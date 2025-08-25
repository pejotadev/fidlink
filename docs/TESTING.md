# Guia de Testes - FidLink API

Este documento descreve a estratégia de testes implementada na API FidLink, incluindo testes unitários e end-to-end (E2E).

## Estrutura de Testes

### 📁 Organização dos Arquivos

```
test/
├── app.e2e-spec.ts         # Testes E2E básicos (health check)
├── client.e2e-spec.ts      # Testes E2E com banco real
├── client-mock.e2e-spec.ts # Testes E2E com mocks
├── setup-e2e.ts           # Configuração para testes E2E
├── jest-e2e.json          # Configuração Jest E2E com banco
└── jest-e2e-mock.json     # Configuração Jest E2E com mocks

src/
└── client/
    └── client.service.spec.ts # Testes unitários
```

## Tipos de Testes

### 🔧 Testes Unitários

**Localização:** `src/**/*.spec.ts`  
**Foco:** Lógica de negócio isolada  
**Dependências:** Mocks do Prisma

**Execução:**
```bash
npm test                    # Executa todos os testes unitários
npm run test:watch         # Modo watch
npm run test:cov           # Com coverage
```

**Cobertura:**
- ✅ Service methods (create, findOne)
- ✅ Business rules validation
- ✅ Error scenarios
- ✅ Edge cases

### 🌐 Testes End-to-End (E2E)

#### E2E com Mocks
**Arquivo:** `test/client-mock.e2e-spec.ts`  
**Foco:** API endpoints sem dependências externas  
**Banco:** Mock do PrismaService

**Vantagens:**
- ⚡ Execução rápida
- 🚀 Não requer configuração de banco
- 🔄 Ideal para CI/CD

**Execução:**
```bash
npm run test:e2e:mock      # Executa E2E com mocks
npm run test:e2e:mock:cov  # Com coverage
npm run test:e2e:mock:watch # Modo watch
```

#### E2E com Banco Real
**Arquivo:** `test/client.e2e-spec.ts`  
**Foco:** Integração completa com banco de dados  
**Banco:** SQLite ou MySQL

**Vantagens:**
- 🔍 Testes de integração reais
- 📊 Validação de schemas
- 🔒 Teste de constraints

**Execução:**
```bash
npm run test:e2e:setup     # Script completo com setup de banco
npm run test:e2e           # Só executa (requer banco configurado)
```

## Cenários de Teste

### ✅ Casos de Sucesso

1. **POST /client** - Criar cliente válido
2. **GET /client/:id** - Buscar cliente existente
3. **Transformação de dados** - String para number
4. **Múltiplos clientes** - Operações em lote

### ❌ Casos de Erro

1. **Validação de CPF:**
   - Formato inválido
   - CPF duplicado

2. **Validação de campos:**
   - Nome vazio
   - Data inválida
   - Renda negativa
   - Campos extras

3. **Recursos não encontrados:**
   - Cliente inexistente
   - IDs malformados

### 🔄 Cenários de Integração

1. **Ciclo completo:** Create → Read → Verify
2. **Consistência de dados** entre operações
3. **Regras de negócio** aplicadas consistentemente

## Configuração de Teste

### Variáveis de Ambiente

```bash
# Para testes E2E com banco real
DATABASE_URL="mysql://root:password@localhost:3306/fidlink_test"
NODE_ENV=test
```

### Setup Automático

O script `scripts/test-e2e.sh` automatiza:
- 🗄️ Criação do banco de teste
- 🚀 Execução das migrations
- 🧪 Execução dos testes
- 🧹 Limpeza pós-teste

## Métricas de Qualidade

### Coverage Targets
- **Unitários:** > 90%
- **E2E:** > 80%
- **Branches:** > 85%

### Performance
- **Testes unitários:** < 5s
- **E2E Mock:** < 10s
- **E2E Real:** < 30s

## Comandos Úteis

### Executar Testes Específicos
```bash
# Apenas testes unitários
npm test

# Apenas E2E mock
npm run test:e2e:mock

# Apenas health check
npm run test:e2e:mock -- --testNamePattern="health"

# Apenas validações
npm run test:e2e:mock -- --testNamePattern="validation"
```

### Debug
```bash
# Debug testes unitários
npm run test:debug

# Debug E2E
npm run test:e2e:mock -- --verbose
```

### Coverage Detalhado
```bash
# Coverage unitários
npm run test:cov

# Coverage E2E
npm run test:e2e:mock:cov

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

## CI/CD

### Pipeline Recomendado
1. **Lint & Format** - ESLint + Prettier
2. **Testes Unitários** - `npm test`
3. **Testes E2E Mock** - `npm run test:e2e:mock`
4. **Build** - `npm run build`
5. **Testes E2E Real** - `npm run test:e2e:setup` (opcional)

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    npm test
    npm run test:e2e:mock
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Boas Práticas

### ✅ Do's
- Sempre mockar dependências externas
- Testar casos de sucesso E erro
- Usar nomes descritivos para testes
- Manter testes independentes
- Limpar dados após cada teste

### ❌ Don'ts
- Depender de dados específicos
- Testes que dependem da ordem
- Hardcode de IDs ou timestamps
- Pular limpeza de dados
- Testes muito longos ou complexos

## Troubleshooting

### Problemas Comuns

**Erro de conexão com banco:**
```bash
# Verificar se MySQL está rodando
docker compose up -d mysql

# Ou usar testes mock
npm run test:e2e:mock
```

**Testes falhando aleatoriamente:**
```bash
# Executar sequencial
npm run test:e2e:mock -- --runInBand

# Limpar cache
npm test -- --clearCache
```

**Performance lenta:**
```bash
# Usar apenas mocks
npm run test:e2e:mock

# Executar teste específico
npm test -- --testNamePattern="create client"
```

## Exemplos de Uso

### Adicionar Novo Teste
```typescript
describe('New Feature', () => {
  it('should handle new scenario', async () => {
    // Arrange
    const testData = { /* test data */ };
    
    // Act
    const response = await request(app.getHttpServer())
      .post('/endpoint')
      .send(testData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(expected);
  });
});
```

### Mock Personalizados
```typescript
const mockPrismaService = {
  client: {
    create: jest.fn().mockResolvedValue(mockData),
    findUnique: jest.fn(),
  },
};
```

---

**📝 Nota:** Este documento é atualizado conforme novos testes são adicionados. Para sugestões de melhoria, abra uma issue no repositório.
