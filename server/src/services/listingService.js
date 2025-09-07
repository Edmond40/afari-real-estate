import { prisma } from '../lib/prisma.js';
import { updatePropertyCount } from './agentService.js';

async function list({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.listing.findMany({ orderBy: { id: 'desc' }, skip, take: limit }),
    prisma.listing.count(),
  ]);
  return { items, total, page, limit };
}

async function create(data, userId) {
  // Sanitize payload to satisfy column limits (e.g., agentImage VARCHAR length)
  const sanitized = { ...data };
  // Ensure arrays/objects for json columns
  if (sanitized.images && !Array.isArray(sanitized.images)) {
    try { sanitized.images = JSON.parse(sanitized.images); } catch { /* keep as-is */ }
  }
  if (sanitized.features && typeof sanitized.features === 'string') {
    try { sanitized.features = JSON.parse(sanitized.features); } catch { /* keep as-is */ }
  }
  
  const listing = await prisma.listing.create({ data: { ...sanitized, userId } });
  
  // Update agent's property count if agentId is provided
  if (listing.agentId) {
    await updatePropertyCount(listing.agentId);
  }
  
  return listing;
}

async function remove(id, userId) {
  // First get the listing to check for agentId before deleting
  const listing = await prisma.listing.findUnique({ 
    where: { id: Number(id) },
    select: { agentId: true, userId: true }
  });
  
  // Check if the user is authorized to delete this listing
  if (listing.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own listings');
  }
  
  // Delete the listing
  const deletedListing = await prisma.listing.delete({ 
    where: { id: Number(id) } 
  });
  
  // Update agent's property count if the listing was associated with an agent
  if (listing?.agentId) {
    await updatePropertyCount(listing.agentId);
  }
  
  return deletedListing;
}

async function getById(id) {
  const listing = await prisma.listing.findUnique({ where: { id: Number(id) } });
  return listing;
}

async function update(id, data) {
  const sanitized = { ...data };
  
  // Get the current listing to check for agentId changes
  const currentListing = await prisma.listing.findUnique({
    where: { id: Number(id) },
    select: { agentId: true }
  });
  
  // Keep images/features JSON friendly
  if (sanitized.images && !Array.isArray(sanitized.images)) {
    try { sanitized.images = JSON.parse(sanitized.images); } catch { /* keep as-is */ }
  }
  if (sanitized.features && typeof sanitized.features === 'string') {
    try { sanitized.features = JSON.parse(sanitized.features); } catch { /* keep as-is */ }
  }
  
  // Update the listing
  const updatedListing = await prisma.listing.update({ 
    where: { id: Number(id) }, 
    data: sanitized 
  });
  
  // Update property counts if agentId was changed
  if (sanitized.agentId !== undefined && sanitized.agentId !== currentListing?.agentId) {
    // Update count for the new agent
    if (sanitized.agentId) {
      await updatePropertyCount(sanitized.agentId);
    }
    // Update count for the old agent if it existed
    if (currentListing?.agentId) {
      await updatePropertyCount(currentListing.agentId);
    }
  }
  
  return updatedListing;
}

export { list, create, remove, getById, update };
