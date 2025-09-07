import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateInquiry = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').optional().trim(),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('listingId').optional().isInt().toInt(),
  body('agentId').optional().isInt().toInt(),
  body('userId').optional().isInt().toInt()
];

// GET /api/inquiries?page=&limit=&search=&status=
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const search = (req.query.search || '').trim();
    const { status } = req.query;

    const where = {};
    
    // Add status filter if provided
    if (status && ['PENDING', 'RESOLVED', 'CLOSED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // For authenticated non-admin users, only show their own inquiries
    if (req.user && req.user.role !== 'ADMIN') {
      where.OR = [
        { userId: req.user.id },
        { email: req.user.email }
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: { 
            select: { id: true, title: true } 
          },
          agent: { 
            select: { id: true, name: true, email: true } 
          },
          user: { 
            select: { id: true, name: true, email: true } 
          }
        }
      }).catch(() => []),
      prisma.inquiry.count({ where }).catch(() => 0)
    ]);

    res.json({
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.json({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    });
  }
});

// GET /api/inquiries/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Only allow access if user is admin, the inquiry owner, or the agent
    if (
      req.user.role !== 'ADMIN' && 
      inquiry.userId !== req.user.id && 
      inquiry.agentId !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to access this inquiry' });
    }

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
});

// POST /api/inquiries
router.post('/', [...validateInquiry], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, subject, message, listingId, agentId, userId } = req.body;
    
    const inquiryData = {
      name,
      email,
      phone: phone || null,
      subject: subject || 'General Inquiry',
      message,
      status: 'PENDING'
    };
    
    // Add optional relations only if provided
    if (listingId) inquiryData.listingId = parseInt(listingId);
    if (agentId) inquiryData.agentId = parseInt(agentId);
    if (userId) inquiryData.userId = parseInt(userId);
    
    const inquiry = await prisma.inquiry.create({
      data: inquiryData,
      include: {
        listing: listingId ? { select: { id: true, title: true } } : false,
        agent: agentId ? { select: { id: true, name: true, email: true } } : false,
        user: userId ? { select: { id: true, name: true, email: true } } : false
      }
    });

    // TODO: Send email notification to admin/agent

    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/inquiries/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes, reply } = req.body;

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({ 
      where: { id },
      include: { user: true } // Include user for notification
    });
    if (!existingInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Only allow admin or the assigned agent to update
    if (
      req.user.role !== 'ADMIN' && 
      (existingInquiry.agentId && existingInquiry.agentId !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this inquiry' });
    }

    const data = {};
    if (status && ['PENDING', 'RESOLVED', 'CLOSED'].includes(status.toUpperCase())) {
      data.status = status.toUpperCase();
    }
    if (notes !== undefined) {
      data.notes = notes;
    }
    if (reply !== undefined) {
      data.reply = reply;
      data.repliedAt = new Date();
      data.repliedBy = req.user.id;
      data.status = 'RESOLVED'; // Auto-update status when replying
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Handle reply notification
    if (reply && existingInquiry.userId) {
      await prisma.notification.create({
        data: {
          userId: existingInquiry.userId,
          type: 'INQUIRY_REPLY',
          message: `You have received a reply to your inquiry: ${existingInquiry.subject || 'No Subject'}`,
          data: { inquiryId: id }
        }
      });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data,
      include: {
        listing: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updatedInquiry);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inquiries/:id
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!existingInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await prisma.inquiry.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
