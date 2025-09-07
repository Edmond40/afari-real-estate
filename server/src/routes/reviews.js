import express from 'express';
import {
  getReviews,
  createReview as createReviewHandler,
  updateReview,
  deleteReview,
  getListingReviews
} from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews (admin only)
router.get('/', requireAuth, requireRole(['ADMIN']), getReviews);

// Create a new review (authenticated users)
router.post('/', requireAuth, createReviewHandler);

// Update review with admin reply (admin only)
router.patch('/:id', requireAuth, requireRole(['ADMIN']), updateReview);

// Delete a review (admin only)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), deleteReview);

// Get reviews for a specific listing (public)
router.get('/listing/:listingId', getListingReviews);

export default router;
