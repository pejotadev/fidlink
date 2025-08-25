import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Use SQLite for tests
const testDbPath = path.join(__dirname, '..', 'test.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${testDbPath}`,
    },
  },
});

// Setup global test environment
beforeAll(async () => {
  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Generate test client
  try {
    execSync('npx prisma generate --schema=prisma/schema-test.prisma', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    console.warn('Warning: Could not generate test client:', error.message);
  }

  // Apply schema to test database
  try {
    execSync(`npx prisma db push --schema=prisma/schema-test.prisma`, {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    console.warn('Warning: Could not push schema to test database:', error.message);
  }

  // Connect to test database
  await prisma.$connect();
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test data
  try {
    await prisma.client.deleteMany({});
  } catch (error) {
    console.warn('Warning: Could not clean up test data:', error.message);
  }
});

// Teardown after all tests
afterAll(async () => {
  await prisma.$disconnect();
  
  // Remove test database file
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Make prisma available globally in tests
global.prisma = prisma;
