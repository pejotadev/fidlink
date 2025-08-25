import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';


describe('ClientController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.client.deleteMany({});
  });

  describe('/client (POST)', () => {
    const validClientData = {
      name: 'João Silva',
      birthDate: '1990-01-15',
      cpf: '123.456.789-00',
      monthlyIncome: 5000.50,
    };

    it('should create a client with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/client')
        .send(validClientData)
        .expect(201);

      expect(response.body).toMatchObject({
        nome: validClientData.name,
        cpf: validClientData.cpf,
        rendaLiquidaMensal: validClientData.monthlyIncome,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(new Date(response.body.dataNascimento)).toEqual(new Date(validClientData.birthDate));
    });

    it('should reject creation with duplicate CPF', async () => {
      // Create first client
      await request(app.getHttpServer())
        .post('/client')
        .send(validClientData)
        .expect(201);

      // Try to create another client with same CPF
      const response = await request(app.getHttpServer())
        .post('/client')
        .send({
          ...validClientData,
          nome: 'Maria Santos',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message', 'CPF já cadastrado');
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

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(dataWithStringNumber)
        .expect(201);

      expect(typeof response.body.rendaLiquidaMensal).toBe('number');
      expect(response.body.rendaLiquidaMensal).toBe(5000.50);
    });
  });

  describe('/client/:id (GET)', () => {
    let createdClientId: string;

    beforeEach(async () => {
      // Create a client for testing
      const clientData = {
        name: 'João Silva',
        birthDate: '1990-01-15',
        cpf: '123.456.789-00',
        monthlyIncome: 5000.50,
      };

      const response = await request(app.getHttpServer())
        .post('/client')
        .send(clientData)
        .expect(201);

      createdClientId = response.body.id;
    });

    it('should return client when found by valid ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/client/${createdClientId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdClientId,
        nome: 'João Silva',
        cpf: '123.456.789-00',
        rendaLiquidaMensal: 5000.50,
      });
      expect(response.body).toHaveProperty('dataNascimento');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 when client not found', async () => {
      const nonExistentId = 'clp123456789nonexistent';

      const response = await request(app.getHttpServer())
        .get(`/client/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Cliente não encontrado');
    });

    it('should handle malformed IDs gracefully', async () => {
      const malformedId = 'invalid-id-format';

      const response = await request(app.getHttpServer())
        .get(`/client/${malformedId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Cliente não encontrado');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple clients creation and retrieval', async () => {
      const clients = [
        {
          nome: 'João Silva',
          dataNascimento: '1990-01-15',
          cpf: '123.456.789-00',
          rendaLiquidaMensal: 5000.50,
        },
        {
          nome: 'Maria Santos',
          dataNascimento: '1985-05-20',
          cpf: '987.654.321-00',
          rendaLiquidaMensal: 3500.75,
        },
        {
          nome: 'Pedro Oliveira',
          dataNascimento: '1992-12-03',
          cpf: '456.789.123-00',
          rendaLiquidaMensal: 7200.00,
        },
      ];

      const createdClients = [];

      // Create all clients
      for (const clientData of clients) {
        const response = await request(app.getHttpServer())
          .post('/client')
          .send(clientData)
          .expect(201);

        createdClients.push(response.body);
      }

      // Verify all clients were created
      expect(createdClients).toHaveLength(3);

      // Retrieve each client and verify data
      for (let i = 0; i < createdClients.length; i++) {
        const client = createdClients[i];
        const originalData = clients[i];

        const response = await request(app.getHttpServer())
          .get(`/client/${client.id}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: client.id,
          nome: originalData.nome,
          cpf: originalData.cpf,
          rendaLiquidaMensal: originalData.rendaLiquidaMensal,
        });
      }
    });

    it('should maintain data integrity across operations', async () => {
      const clientData = {
        nome: 'Test User',
        dataNascimento: '1988-03-10',
        cpf: '111.222.333-44',
        rendaLiquidaMensal: 4500.25,
      };

      // Create client
      const createResponse = await request(app.getHttpServer())
        .post('/client')
        .send(clientData)
        .expect(201);

      const clientId = createResponse.body.id;

      // Retrieve immediately
      const getResponse = await request(app.getHttpServer())
        .get(`/client/${clientId}`)
        .expect(200);

      // Verify data consistency
      expect(getResponse.body.id).toBe(createResponse.body.id);
      expect(getResponse.body.nome).toBe(createResponse.body.nome);
      expect(getResponse.body.cpf).toBe(createResponse.body.cpf);
      expect(getResponse.body.rendaLiquidaMensal).toBe(createResponse.body.rendaLiquidaMensal);
      expect(getResponse.body.dataNascimento).toBe(createResponse.body.dataNascimento);
      expect(getResponse.body.createdAt).toBe(createResponse.body.createdAt);
      expect(getResponse.body.updatedAt).toBe(createResponse.body.updatedAt);
    });
  });
});
