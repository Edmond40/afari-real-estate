import express from 'express';
import { list, create, remove, getById, update } from '../services/listingService.js';
import reviewService from '../services/reviewService.js';
const { listByListingId, createReview } = reviewService;
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/listings?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await list({ page, limit });
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/listings
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    const created = await create(payload, req.user.id || 1);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await remove(req.params.id, req.user.id || 1);
    res.status(204).send();
  } catch (e) { next(e); }
});

// PATCH /api/listings/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const updated = await update(id, payload);
    res.json({ listing: updated });
  } catch (e) { next(e); }
});

// Reviews: place BEFORE /:id to avoid route conflicts
// GET /api/listings/:listingId/reviews
router.get('/:listingId/reviews', async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const reviews = await listByListingId(listingId);
    res.json({ reviews });
  } catch (e) { next(e); }
});

// POST /api/listings/:listingId/reviews
router.post('/:listingId/reviews', requireAuth, async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);
    const { rating, comment } = req.body || {};
    if (!rating || Number.isNaN(Number(rating))) {
      return res.status(400).json({ message: 'rating is required' });
    }
    const review = await createReview({ listingId, userId: req.user.id, rating: Number(rating), comment });
    res.status(201).json({ review });
  } catch (e) { next(e); }
});

// GET /api/listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await getById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ listing });
  } catch (e) { next(e); }
});

export default router;
