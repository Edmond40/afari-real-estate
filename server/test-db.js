const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Connecting to the database...');
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Test query to list all tables
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Database tables:', tables);
    
    // Test agent count
    const agentCount = await prisma.agent.count();
    console.log(`Found ${agentCount} agents in the database`);
    
    // Test listing count
    const listingCount = await prisma.listing.count();
    console.log(`Found ${listingCount} listings in the database`);
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);
