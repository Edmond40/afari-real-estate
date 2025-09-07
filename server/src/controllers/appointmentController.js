import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../lib/email.js';

// Constants
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

// Helper function to validate appointment data
export const validateAppointmentData = (data) => {
  const errors = [];
  
  if (!data.userId) errors.push('User ID is required');
  if (!data.listingId) errors.push('Listing ID is required');
  if (!data.scheduledAt) errors.push('Scheduled time is required');
  
  if (data.status && !Object.values(APPOINTMENT_STATUS).includes(data.status)) {
    errors.push(`Status must be one of: ${Object.values(APPOINTMENT_STATUS).join(', ')}`);
  }
  
  return errors.length ? errors : null;
};

// Get all appointments with pagination and filtering
export const getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, listingId, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    const where = {};

    // Build where clause based on query params
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);
    if (listingId) where.listingId = parseInt(listingId);
    
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          listing: { 
            select: { 
              id: true, 
              title: true, 
              address: true, 
              city: true, 
              state: true, 
              price: true, 
              images: true 
            } 
          },
          cancelledBy: { select: { id: true, name: true, email: true } },
          completedBy: { select: { id: true, name: true, email: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { scheduledAt: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch appointments' 
    });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { userId, listingId, scheduledAt, notes, status = APPOINTMENT_STATUS.SCHEDULED } = req.body;

    // Validate input
    const validationErrors = validateAppointmentData({ userId, listingId, scheduledAt, status });
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        errors: validationErrors
      });
    }

    // Check for existing appointments at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        listingId: parseInt(listingId),
        scheduledAt: new Date(scheduledAt),
        status: { not: APPOINTMENT_STATUS.CANCELLED }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'APPOINTMENT_CONFLICT',
        message: 'An appointment already exists at this time'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: parseInt(userId),
        listingId: parseInt(listingId),
        scheduledAt: new Date(scheduledAt),
        status,
        notes
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, address: true } }
      }
    });

    // Send confirmation email
    await sendAppointmentConfirmation(appointment);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({ 
      success: false,
      error: error.code || 'BAD_REQUEST',
      message: error.message || 'Failed to create appointment' 
    });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, agentNotes, internalNotes } = req.body;
    const currentUser = req.user;

    // Validate appointment ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'A valid appointment ID is required'
      });
    }

    // Validate status if provided
    if (status && !Object.values(APPOINTMENT_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${Object.values(APPOINTMENT_STATUS).join(', ')}`
      });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Appointment not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (agentNotes) updateData.agentNotes = agentNotes;
    if (internalNotes) updateData.internalNotes = internalNotes;

    // Handle status changes
    if (status === APPOINTMENT_STATUS.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancelledById = currentUser?.id;
    } else if (status === APPOINTMENT_STATUS.COMPLETED) {
      updateData.completedAt = new Date();
      updateData.completedById = currentUser?.id;
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true } },
        cancelledBy: status === APPOINTMENT_STATUS.CANCELLED ? { select: { id: true, name: true } } : false,
        completedBy: status === APPOINTMENT_STATUS.COMPLETED ? { select: { id: true, name: true } } : false
      }
    });

    // Send status update email if status changed
    if (status) {
      await sendAppointmentUpdate(appointment);
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(400).json({ 
      success: false,
      error: error.code || 'BAD_REQUEST',
      message: error.message || 'Failed to update appointment' 
    });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const [total, scheduled, confirmed, completed, cancelled, noShow] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: APPOINTMENT_STATUS.SCHEDULED } }),
      prisma.appointment.count({ where: { status: APPOINTMENT_STATUS.CONFIRMED } }),
      prisma.appointment.count({ where: { status: APPOINTMENT_STATUS.COMPLETED } }),
      prisma.appointment.count({ where: { status: APPOINTMENT_STATUS.CANCELLED } }),
      prisma.appointment.count({ where: { status: APPOINTMENT_STATUS.NO_SHOW } })
    ]);

    // Get appointments by status for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await prisma.appointment.groupBy({
      by: ['status'],
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        status: {
          in: [
            APPOINTMENT_STATUS.SCHEDULED,
            APPOINTMENT_STATUS.CONFIRMED,
            APPOINTMENT_STATUS.COMPLETED,
            APPOINTMENT_STATUS.CANCELLED,
            APPOINTMENT_STATUS.NO_SHOW
          ]
        }
      },
      _count: true
    });

    const statusData = Object.values(APPOINTMENT_STATUS).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    recentAppointments.forEach(item => {
      statusData[item.status] = item._count;
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          [APPOINTMENT_STATUS.SCHEDULED]: scheduled,
          [APPOINTMENT_STATUS.CONFIRMED]: confirmed,
          [APPOINTMENT_STATUS.COMPLETED]: completed,
          [APPOINTMENT_STATUS.CANCELLED]: cancelled,
          [APPOINTMENT_STATUS.NO_SHOW]: noShow
        },
        recentStats: statusData
      }
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch appointment statistics'
    });
  }
};

// Cancel an appointment (admin only)
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }
    
    const adminId = req.user.id;

    // Validate appointment ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'A valid appointment ID is required'
      });
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, address: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Appointment not found'
      });
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
      return res.status(400).json({ 
        success: false,
        error: 'BAD_REQUEST',
        message: 'Appointment is already cancelled' 
      });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        status: APPOINTMENT_STATUS.CANCELLED,
        cancellationReason: reason || 'No reason provided',
        cancelledAt: new Date(),
        cancelledById: adminId
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, address: true } },
        cancelledBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: appointment.userId,
        title: 'Appointment Cancelled',
        body: `Your appointment for ${appointment.listing.title} has been cancelled.`,
        type: 'APPOINTMENT_CANCELLED',
        data: {
          appointmentId: appointment.id,
          status: APPOINTMENT_STATUS.CANCELLED,
          listingId: appointment.listingId,
          listingTitle: appointment.listing.title,
          reason: reason || 'No reason provided'
        }
      }
    });

    // Send email to user
    await sendEmail({
      to: appointment.user.email,
      subject: `Appointment Cancelled - ${appointment.listing.title}`,
      template: 'appointment-cancelled',
      context: {
        userName: appointment.user.name,
        listingTitle: appointment.listing.title,
        address: appointment.listing.address,
        date: appointment.scheduledAt.toLocaleDateString(),
        time: appointment.scheduledAt.toLocaleTimeString(),
        reason: reason || 'No reason provided',
        cancelledBy: req.user.name,
        contactEmail: req.user.email
      }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to cancel appointment' 
    });
  }
};

// Helper function to send appointment confirmation email
export const sendAppointmentConfirmation = async (appointment) => {
  try {
    const { user, listing } = appointment;
    
    await sendEmail({
      to: user.email,
      subject: `Appointment Confirmation - ${listing.title}`,
      template: 'appointment-confirmation',
      context: {
        userName: user.name,
        listingTitle: listing.title,
        address: listing.address,
        date: appointment.scheduledAt.toLocaleDateString(),
        time: appointment.scheduledAt.toLocaleTimeString(),
        notes: appointment.notes || 'No additional notes provided.'
      }
    });
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw new Error('Failed to send appointment confirmation email');
  }
};

// Helper function to send appointment update email
export const sendAppointmentUpdate = async (appointment) => {
  try {
    const { user, listing } = appointment;
    
    await sendEmail({
      to: user.email,
      subject: `Your Appointment Has Been Updated - ${listing.title}`,
      template: 'appointment-updated',
      context: {
        userName: user.name,
        listingTitle: listing.title,
        address: listing.address,
        status: appointment.status.toLowerCase(),
        date: appointment.scheduledAt.toLocaleDateString(),
        time: appointment.scheduledAt.toLocaleTimeString(),
        notes: appointment.notes || 'No additional notes provided.'
      }
    });
  } catch (error) {
    console.error('Error sending appointment update email:', error);
    throw new Error('Failed to send appointment update email');
  }
};
