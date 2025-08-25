import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedFunds() {
  console.log('🌱 Starting fund seeding...');

  try {
    // Clean existing data
    await prisma.eligibilityCriteria.deleteMany({});
    await prisma.fund.deleteMany({});

    // Create Fund A
    const fundA = await prisma.fund.create({
      data: {
        id: uuidv4(),
        name: 'Fund A',
        baseInterestRate: 0.0275, // 2.75% a.m.
        isActive: true,
      },
    });

    // Fund A Criteria
    await prisma.eligibilityCriteria.createMany({
      data: [
        {
          id: uuidv4(),
          fundId: fundA.id,
          criteriaType: 'min_age',
          value: '21',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundA.id,
          criteriaType: 'max_income_commitment_percentage',
          value: '20',
          isActive: true,
        },
      ],
    });

    // Create Fund B
    const fundB = await prisma.fund.create({
      data: {
        id: uuidv4(),
        name: 'Fund B',
        baseInterestRate: 0.0210, // 2.10% a.m.
        isActive: true,
      },
    });

    // Fund B Criteria
    await prisma.eligibilityCriteria.createMany({
      data: [
        {
          id: uuidv4(),
          fundId: fundB.id,
          criteriaType: 'min_age',
          value: '30',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundB.id,
          criteriaType: 'max_income_commitment_percentage',
          value: '25',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundB.id,
          criteriaType: 'min_loan_amount',
          value: '20000',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundB.id,
          criteriaType: 'excluded_purposes',
          value: '["business_investment"]',
          isActive: true,
        },
      ],
    });

    // Create Fund C
    const fundC = await prisma.fund.create({
      data: {
        id: uuidv4(),
        name: 'Fund C',
        baseInterestRate: 0.0425, // 4.25% a.m.
        isActive: true,
      },
    });

    // Fund C Criteria
    await prisma.eligibilityCriteria.createMany({
      data: [
        {
          id: uuidv4(),
          fundId: fundC.id,
          criteriaType: 'min_age',
          value: '18',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundC.id,
          criteriaType: 'max_income_commitment_percentage',
          value: '32',
          isActive: true,
        },
        {
          id: uuidv4(),
          fundId: fundC.id,
          criteriaType: 'excluded_purposes',
          value: '["travel"]',
          isActive: true,
        },
      ],
    });

    console.log('✅ Fund seeding completed successfully!');
    console.log(`📊 Created funds:`);
    console.log(`   • Fund A: ${fundA.id} - 2.75% a.m.`);
    console.log(`   • Fund B: ${fundB.id} - 2.10% a.m.`);
    console.log(`   • Fund C: ${fundC.id} - 4.25% a.m.`);

  } catch (error) {
    console.error('❌ Error seeding funds:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedFunds();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default seedFunds;
