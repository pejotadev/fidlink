import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ClientController E2E (Mock)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockClient = {
    id: 'clp123456789',
    nome: 'João Silva',
    dataNascimento: new Date('1990-01-15'),
    cpf: '123.456.789-00',
    rendaLiquidaMensal: 5000.50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('service', 'fidlink-api');
        });
    });
  });

  describe('/client (POST)', () => {
    const validClientData = {
      nome: 'João Silva',
      dataNascimento: '1990-01-15',
      cpf: '123.456.789-00',
      rendaLiquidaMensal: 5000.50,
    };

    it('should create a client with valid data', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.client.create.mockResolvedValue(mockClient);

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(validClientData)
        .expect(201);

      expect(response.body).toMatchObject({
        nome: validClientData.nome,
        cpf: validClientData.cpf,
        rendaLiquidaMensal: validClientData.rendaLiquidaMensal,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { cpf: validClientData.cpf },
      });
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          nome: validClientData.nome,
          dataNascimento: new Date(validClientData.dataNascimento),
          cpf: validClientData.cpf,
          rendaLiquidaMensal: validClientData.rendaLiquidaMensal,
        },
      });
    });

    it('should reject creation with duplicate CPF', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(validClientData)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'CPF já cadastrado');
      expect(mockPrismaService.client.create).not.toHaveBeenCalled();
    });

    it('should reject creation with invalid CPF format', async () => {
      const invalidCpfData = {
        ...validClientData,
        cpf: '12345678900', // Invalid format
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(invalidCpfData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('CPF deve estar no formato 000.000.000-00');
    });

    it('should reject creation with missing required fields', async () => {
      const incompleteData = {
        nome: 'João Silva',
        // Missing other required fields
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should reject creation with invalid date format', async () => {
      const invalidDateData = {
        ...validClientData,
        dataNascimento: '15/01/1990', // Invalid format
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(invalidDateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject creation with negative income', async () => {
      const negativeIncomeData = {
        ...validClientData,
        rendaLiquidaMensal: -1000,
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(negativeIncomeData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject creation with empty name', async () => {
      const emptyNameData = {
        ...validClientData,
        nome: '',
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(emptyNameData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject creation with extra fields', async () => {
      const dataWithExtraFields = {
        ...validClientData,
        extraField: 'should be rejected',
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(dataWithExtraFields)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should transform string number to number for rendaLiquidaMensal', async () => {
      const dataWithStringNumber = {
        ...validClientData,
        rendaLiquidaMensal: '5000.50', // String instead of number
      };

      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.client.create.mockResolvedValue({
        ...mockClient,
        rendaLiquidaMensal: 5000.50,
      });

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(dataWithStringNumber)
        .expect(201);

      expect(typeof response.body.rendaLiquidaMensal).toBe('number');
      expect(response.body.rendaLiquidaMensal).toBe(5000.50);

      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          rendaLiquidaMensal: 5000.50,
        }),
      });
    });
  });

  describe('/client/:id (GET)', () => {
    it('should return client when found by valid ID', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const response = await request(app.getHttpServer())
        .get(`/client/${mockClient.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockClient.id,
        nome: mockClient.nome,
        cpf: mockClient.cpf,
        rendaLiquidaMensal: mockClient.rendaLiquidaMensal,
      });
      expect(response.body).toHaveProperty('dataNascimento');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: mockClient.id },
      });
    });

    it('should return 404 when client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      const nonExistentId = 'clp123456789nonexistent';

      const response = await request(app.getHttpServer())
        .get(`/client/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Cliente não encontrado');
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });

    it('should handle malformed IDs gracefully', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      const malformedId = 'invalid-id-format';

      const response = await request(app.getHttpServer())
        .get(`/client/${malformedId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Cliente não encontrado');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete client lifecycle', async () => {
      const clientData = {
        nome: 'Integration Test User',
        dataNascimento: '1988-03-10',
        cpf: '123.456.789-00',
        rendaLiquidaMensal: 4500.25,
      };

      const createdClient = {
        ...mockClient,
        ...clientData,
        dataNascimento: new Date(clientData.dataNascimento),
      };

      // Mock creation
      mockPrismaService.client.findUnique.mockResolvedValueOnce(null); // CPF check
      mockPrismaService.client.create.mockResolvedValue(createdClient);

      // Create client
      const createResponse = await request(app.getHttpServer())
        .post('/client')
        .send(clientData)
        .expect(201);

      expect(createResponse.body.id).toBeDefined();

      // Mock retrieval
      mockPrismaService.client.findUnique.mockResolvedValueOnce(createdClient);

      // Retrieve client
      const getResponse = await request(app.getHttpServer())
        .get(`/client/${createResponse.body.id}`)
        .expect(200);

      // Verify data consistency
      expect(getResponse.body.nome).toBe(clientData.nome);
      expect(getResponse.body.cpf).toBe(clientData.cpf);
      expect(getResponse.body.rendaLiquidaMensal).toBe(clientData.rendaLiquidaMensal);
    });

    it('should validate business rules consistently', async () => {
      const scenarios = [
        {
          data: { nome: '', dataNascimento: '1990-01-01', cpf: '123.456.789-09', rendaLiquidaMensal: 1000 },
          expectedStatus: 400,
          description: 'empty name'
        },
        {
          data: { nome: 'Test', dataNascimento: 'invalid', cpf: '123.456.789-09', rendaLiquidaMensal: 1000 },
          expectedStatus: 400,
          description: 'invalid date'
        },
        {
          data: { nome: 'Test', dataNascimento: '1990-01-01', cpf: 'invalid', rendaLiquidaMensal: 1000 },
          expectedStatus: 400,
          description: 'invalid CPF'
        },
        {
          data: { nome: 'Test', dataNascimento: '1990-01-01', cpf: '123.456.789-09', rendaLiquidaMensal: -100 },
          expectedStatus: 400,
          description: 'negative income'
        },
      ];

      for (const scenario of scenarios) {
        const response = await request(app.getHttpServer())
          .post('/client')
          .send(scenario.data);

        expect(response.status).toBe(scenario.expectedStatus);
        expect(response.body).toHaveProperty('message');
      }
    });
  });
});
