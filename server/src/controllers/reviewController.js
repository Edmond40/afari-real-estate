import { prisma } from '../lib/prisma.js';

// Get all reviews with pagination and filtering
export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, listingId, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (listingId) where.listingId = parseInt(listingId);
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { listing: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true, address: true } },
          user: { select: { id: true, name: true, email: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      data: reviews,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new review
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment, listingId, userId } = req.body;
    
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        listingId: parseInt(listingId),
        userId: parseInt(userId)
      },
      include: {
        listing: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// Update a review (admin reply)
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        adminReply,
        updatedAt: new Date()
      },
      include: {
        listing: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Create notification for user about admin reply
    if (adminReply && review.userId) {
      await prisma.notification.create({
        data: {
          userId: review.userId,
          title: 'Review Reply Received',
          body: `Admin replied to your review on "${review.listing.title}". Reply: ${adminReply.substring(0, 100)}...`,
          type: 'REVIEW_REPLY'
        }
      });
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Get reviews for a specific listing
export const getListingReviews = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId: parseInt(listingId) },
        include: {
          user: { select: { id: true, name: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: { listingId: parseInt(listingId) } })
    ]);

    res.json({
      data: reviews,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
