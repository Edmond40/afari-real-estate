import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user-interactions/likes - Get user's liked properties
router.get('/likes', requireAuth, async (req, res, next) => {
  try {
    const likes = await prisma.propertyLike.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            agent: true,
            _count: {
              select: { likes: true, views: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const likedProperties = likes.map(like => ({
      ...like.listing,
      likeCount: like.listing._count.likes,
      viewCount: like.listing._count.views,
      likedAt: like.createdAt
    }));

    res.json({ properties: likedProperties });
  } catch (e) { next(e); }
});

// POST /api/user-interactions/likes/:listingId - Like a property
router.post('/likes/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    const existingLike = await prisma.propertyLike.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existingLike) {
      return res.status(409).json({ message: 'Property already liked' });
    }

    const like = await prisma.propertyLike.create({
      data: { userId, listingId }
    });

    res.status(201).json({ like });
  } catch (e) { next(e); }
});

// DELETE /api/user-interactions/likes/:listingId - Unlike a property
router.delete('/likes/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    await prisma.propertyLike.delete({
      where: { userId_listingId: { userId, listingId } }
    });

    res.status(204).end();
  } catch (e) { next(e); }
});

// GET /api/user-interactions/saved - Get user's saved properties
router.get('/saved', requireAuth, async (req, res, next) => {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            agent: true,
            _count: {
              select: { likes: true, views: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const savedProperties = saved.map(save => ({
      ...save.listing,
      likeCount: save.listing._count.likes,
      viewCount: save.listing._count.views,
      savedAt: save.createdAt
    }));

    res.json({ properties: savedProperties });
  } catch (e) { next(e); }
});

// POST /api/user-interactions/saved/:listingId - Save a property
router.post('/saved/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    const existingSave = await prisma.savedProperty.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existingSave) {
      return res.status(409).json({ message: 'Property already saved' });
    }

    const save = await prisma.savedProperty.create({
      data: { userId, listingId }
    });

    res.status(201).json({ save });
  } catch (e) { next(e); }
});

// DELETE /api/user-interactions/saved/:listingId - Unsave a property
router.delete('/saved/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    await prisma.savedProperty.delete({
      where: { userId_listingId: { userId, listingId } }
    });

    res.status(204).end();
  } catch (e) { next(e); }
});

// GET /api/user-interactions/viewing-history - Get user's viewing history
router.get('/viewing-history', requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [views, total] = await Promise.all([
      prisma.viewingHistory.findMany({
        where: { userId: req.user.id },
        include: {
          listing: {
            include: {
              agent: true,
              _count: {
                select: { likes: true, views: true }
              }
            }
          }
        },
        orderBy: { viewedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.viewingHistory.count({ where: { userId: req.user.id } })
    ]);

    const viewedProperties = views.map(view => ({
      ...view.listing,
      likeCount: view.listing._count.likes,
      viewCount: view.listing._count.views,
      viewedAt: view.viewedAt
    }));

    res.json({ 
      properties: viewedProperties, 
      total, 
      currentPage: page, 
      totalPages: Math.max(1, Math.ceil(total / limit)) 
    });
  } catch (e) { next(e); }
});

// POST /api/user-interactions/views/:listingId - Record a property view
router.post('/views/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    // Check if user already viewed this property in the last hour to avoid spam
    const recentView = await prisma.viewingHistory.findFirst({
      where: {
        userId,
        listingId,
        viewedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    });

    if (!recentView) {
      await prisma.viewingHistory.create({
        data: { userId, listingId }
      });
    }

    res.status(201).json({ message: 'View recorded' });
  } catch (e) { next(e); }
});

// GET /api/user-interactions/stats - Get user interaction stats
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [likesCount, savedCount, viewsCount, appointmentsCount] = await Promise.all([
      prisma.propertyLike.count({ where: { userId } }),
      prisma.savedProperty.count({ where: { userId } }),
      prisma.viewingHistory.count({ where: { userId } }),
      prisma.appointment.count({ where: { userId } })
    ]);

    res.json({
      likes: likesCount,
      saved: savedCount,
      views: viewsCount,
      appointments: appointmentsCount
    });
  } catch (e) { next(e); }
});

// DELETE /api/user-interactions/viewing-history/:listingId - Remove from viewing history
router.delete('/viewing-history/:listingId', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const userId = req.user.id;

    // Find and delete the viewing history entry
    const deleted = await prisma.viewingHistory.deleteMany({
      where: { 
        userId,
        listingId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Viewing history entry not found' });
    }

    res.status(204).end();
  } catch (e) { 
    console.error('Error deleting from viewing history:', e);
    next(e); 
  }
});

export default router;
