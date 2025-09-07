import { prisma } from '../lib/prisma.js';

async function listByListingId(listingId) {
  if (!listingId) return [];
  return prisma.review.findMany({
    where: { listingId: Number(listingId) },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });
}

async function createReview({ listingId, userId, rating, comment }) {
  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment: comment || null,
      listing: { connect: { id: Number(listingId) } },
      ...(userId ? { user: { connect: { id: Number(userId) } } } : {}),
    },
    include: {
      user: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
  });
  return review;
}

async function removeById(id, userId, isAdmin = false) {
  // Allow owner or admin to delete; for now, allow admin-only or any authenticated
  if (!isAdmin && !userId) throw new Error('Unauthorized');
  return prisma.review.delete({ where: { id: Number(id) } });
}

// Export all functions as named exports
export { listByListingId, createReview, removeById };

// Also provide a default export with all functions for backward compatibility
export default {
  listByListingId,
  createReview,
  removeById
};
