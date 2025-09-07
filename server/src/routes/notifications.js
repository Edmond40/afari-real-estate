import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', requireAuth, getUserNotifications);

// Mark notification as read
router.patch('/:id', requireAuth, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', requireAuth, markAllAsRead);

// Get unread notification count
router.get('/unread-count', requireAuth, getUnreadCount);

export default router;
