const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAgents() {
  try {
    console.log('Checking agents in database...');
    
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });
    
    console.log(`Total agents found: ${agents.length}`);
    
    agents.forEach(agent => {
      console.log(`ID: ${agent.id}, Name: ${agent.name}, Email: ${agent.email}, Status: ${agent.status}, Listings: ${agent._count.listings}`);
    });
    
  } catch (error) {
    console.error('Error checking agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgents();
