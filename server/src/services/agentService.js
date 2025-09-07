import { prisma } from '../lib/prisma.js';

async function list({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.agent.findMany({ 
      orderBy: { id: 'desc' }, 
      skip, 
      take: limit,
      include: {
        _count: {
          select: { listings: true }
        }
      }
    }),
    prisma.agent.count(),
  ]);
  
  // Update propertyCount for each agent based on actual listings count
  const agentsWithCount = items.map(agent => ({
    ...agent,
    propertyCount: agent._count.listings
  }));
  
  return { items: agentsWithCount, total, page, limit };
}

async function create(data) {
  const sanitized = { ...data };
  
  // Ensure arrays/objects for json columns
  if (sanitized.specialization && !Array.isArray(sanitized.specialization)) {
    try {
      sanitized.specialization = JSON.parse(sanitized.specialization);
    } catch {
      sanitized.specialization = [sanitized.specialization];
    }
  }
  
  // Use provided propertyCount if it's a number, otherwise default to 0
  if (sanitized.propertyCount !== undefined && typeof sanitized.propertyCount !== 'number') {
    sanitized.propertyCount = 0;
  }
  
  const agent = await prisma.agent.create({
    data: sanitized,
    include: {
      _count: {
        select: { listings: true }
      }
    }
  });
  
  // Return agent with property count
  // If propertyCount was provided, use it; otherwise use the actual listings count
  return {
    ...agent,
    propertyCount: sanitized.propertyCount !== undefined ? sanitized.propertyCount : agent._count.listings
  };
}

async function remove(id) {
  return prisma.agent.delete({ where: { id: Number(id) } });
}

async function getById(id) {
  const agent = await prisma.agent.findUnique({ 
    where: { id: Number(id) },
    include: {
      _count: {
        select: { listings: true }
      },
      listings: {
        select: {
          id: true,
          title: true,
          price: true,
          status: true
        }
      }
    }
  });
  
  if (!agent) return null;
  
  return {
    ...agent,
    propertyCount: agent.propertyCount !== undefined ? agent.propertyCount : agent._count.listings
  };
}

async function update(id, data) {
  const sanitized = { ...data };
  
  // Keep specialization JSON friendly
  if (sanitized.specialization && !Array.isArray(sanitized.specialization)) {
    try {
      sanitized.specialization = JSON.parse(sanitized.specialization);
    } catch {
      sanitized.specialization = [sanitized.specialization];
    }
  }
  
  // Handle propertyCount if provided
  if (sanitized.propertyCount !== undefined) {
    sanitized.propertyCount = typeof sanitized.propertyCount === 'number' ? sanitized.propertyCount : 0;
  }
  
  const agent = await prisma.agent.update({
    where: { id: Number(id) },
    data: sanitized,
    include: {
      _count: {
        select: { listings: true }
      }
    }
  });
  
  return {
    ...agent,
    propertyCount: agent.propertyCount !== undefined ? agent.propertyCount : agent._count.listings
  };
}

// Update property count for an agent when listings change
// Only update if propertyCount is not manually set (i.e., is 0 or null)
async function updatePropertyCount(agentId) {
  const agent = await prisma.agent.findUnique({
    where: { id: Number(agentId) }
  });
  
  // If propertyCount is 0 or null, update it with the actual listings count
  if (!agent.propertyCount) {
    const count = await prisma.listing.count({
      where: { agentId: Number(agentId) }
    });
    
    await prisma.agent.update({
      where: { id: Number(agentId) },
      data: { propertyCount: count }
    });
    
    return count;
  }
  
  // If propertyCount is manually set, don't update it
  return agent.propertyCount;
}

export { list, create, remove, getById, update, updatePropertyCount };
