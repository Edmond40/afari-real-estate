const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPropertyCounts() {
  try {
    console.log('Checking property counts...');
    
    // Get agents with both stored count and actual count
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });
    
    console.log(`Found ${agents.length} agents:`);
    
    for (const agent of agents) {
      console.log(`\nAgent: ${agent.name}`);
      console.log(`  Stored propertyCount: ${agent.propertyCount}`);
      console.log(`  Actual listings count: ${agent._count.listings}`);
      
      // Check actual listings for this agent
      const listings = await prisma.listing.findMany({
        where: { agentId: agent.id },
        select: { id: true, title: true }
      });
      
      console.log(`  Direct query listings count: ${listings.length}`);
      if (listings.length > 0) {
        console.log(`  Sample listings:`);
        listings.slice(0, 3).forEach(listing => {
          console.log(`    - ${listing.title}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking property counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPropertyCounts();
