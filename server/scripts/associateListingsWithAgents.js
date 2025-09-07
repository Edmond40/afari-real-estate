const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function associateListingsWithAgents() {
  try {
    console.log('Starting to associate listings with agents...');

    // Get all agents
    const agents = await prisma.agent.findMany({
      select: { id: true, name: true }
    });

    if (agents.length === 0) {
      console.log('No agents found in database');
      return;
    }

    // Get all listings that don't have an agentId
    const listings = await prisma.listing.findMany({
      where: {
        agentId: null
      },
      select: { id: true, title: true }
    });

    if (listings.length === 0) {
      console.log('No unassigned listings found');
      return;
    }

    console.log(`Found ${agents.length} agents and ${listings.length} unassigned listings`);

    // Distribute listings among agents
    const updates = [];
    for (let i = 0; i < listings.length; i++) {
      const agentIndex = i % agents.length; // Round-robin assignment
      const listing = listings[i];
      const agent = agents[agentIndex];
      
      updates.push(
        prisma.listing.update({
          where: { id: listing.id },
          data: { agentId: agent.id }
        })
      );

      console.log(`Assigning listing "${listing.title}" to agent "${agent.name}"`);
    }

    // Execute all updates
    await Promise.all(updates);

    // Get updated counts
    const agentCounts = await Promise.all(
      agents.map(async (agent) => {
        const count = await prisma.listing.count({
          where: { agentId: agent.id }
        });
        return { agent: agent.name, count };
      })
    );

    console.log('\nFinal property counts:');
    agentCounts.forEach(({ agent, count }) => {
      console.log(`${agent}: ${count} properties`);
    });

    console.log('\nSuccessfully associated listings with agents!');
  } catch (error) {
    console.error('Error associating listings with agents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

associateListingsWithAgents();
