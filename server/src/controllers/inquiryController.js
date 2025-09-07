import { prisma } from '../lib/prisma.js';

// Get all inquiries with pagination and filtering
export const getInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true } },
          agent: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inquiry.count({ where })
    ]);

    res.json({
      data: inquiries,
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

// Create a new inquiry
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, listingId, agentId, userId } = req.body;
    
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        ...(listingId && { listingId: parseInt(listingId) }),
        ...(agentId && { agentId: parseInt(agentId) }),
        ...(userId && { userId: parseInt(userId) }),
      },
      include: {
        listing: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true } }
      }
    });

    // TODO: Send email notification to admin/agent

    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
};

// Update an inquiry
export const updateInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    const inquiry = await prisma.inquiry.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(reply && { reply }),
      },
      include: {
        listing: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // If reply is provided and user exists, create notification and appointment
    if (reply && inquiry.userId) {
      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: inquiry.userId,
          title: 'Inquiry Reply Received',
          body: `Admin replied to your inquiry: "${inquiry.subject}". Reply: ${reply.substring(0, 100)}...`,
          type: 'INQUIRY_REPLY'
        }
      });

      // Create appointment if listing exists
      if (inquiry.listingId) {
        // Schedule appointment for 3 days from now as default
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + 3);

        await prisma.appointment.create({
          data: {
            userId: inquiry.userId,
            listingId: inquiry.listingId,
            scheduledAt,
            notes: `Appointment created from inquiry reply: ${inquiry.subject}`,
            status: 'SCHEDULED'
          }
        });
      }
    }

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
};

// Delete an inquiry
export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.inquiry.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Get a single inquiry by ID
export const getInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: parseInt(id) },
      include: {
        listing: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
};
