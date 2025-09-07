const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAllAgentsPropertyCounts() {
  try {
    // Get all agents
    const agents = await prisma.agent.findMany({
      select: { id: true }
    });

    console.log(`Updating property counts for ${agents.length} agents...`);

    // Update property count for each agent
    for (const agent of agents) {
      const count = await prisma.listing.count({
        where: { agentId: agent.id }
      });

      await prisma.agent.update({
        where: { id: agent.id },
        data: { propertyCount: count }
      });

      console.log(`Agent ${agent.id}: Updated property count to ${count}`);
    }

    console.log('All agent property counts have been updated successfully!');
  } catch (error) {
    console.error('Error updating agent property counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateAllAgentsPropertyCounts();
