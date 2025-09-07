import { PrismaClient } from '@prisma/client';
import process from 'process';

// Add global prisma client in development to prevent too many instances
const globalForPrisma = globalThis;

// Initialize Prisma Client
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

// Add prisma to the global object in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test the connection on startup
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma Client connected to database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
})();

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
