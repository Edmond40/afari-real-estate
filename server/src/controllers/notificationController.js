import { prisma } from '../lib/prisma.js';

// Get user notifications
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, read } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = { userId };
    if (read !== undefined) where.read = read === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      data: notifications,
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

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.update({
      where: { 
        id: parseInt(id),
        userId // Ensure user can only update their own notifications
      },
      data: {
        read: true
      }
    });

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: { 
        userId,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount };
