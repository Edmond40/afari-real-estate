import express from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Input validation middleware (currently not used but kept for future use)
const _validatePagination = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  
  req.pagination = { page, limit };
  next();
};

// Validate agent ID parameter
const validateAgentId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid agent ID',
      fields: { id: 'Must be a valid number' }
    });
  }
  req.agentId = id;
  next();
};

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get paginated list of agents with optional search
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *         description: The number of items per page (max 50)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term to filter agents by name, email, or status
 *     responses:
 *       200:
 *         description: A paginated list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents: []
 *                     total: { type: integer }
 *                     currentPage: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get('/', async (req, res, next) => {
  try {
    // Simple query to get all agents with listing counts
    const agents = await prisma.agent.findMany({
      orderBy: { id: 'desc' },
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });

    // Format the response
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      address: agent.address || '',
      status: agent.status || 'ACTIVE',
      image: agent.image || null,
      description: agent.description || '',
      about: agent.description || '', // For backward compatibility
      specialization: agent.specialization || null,
      propertyCount: agent.propertyCount || agent._count?.listings || 0,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    }));

    res.json({
      data: {
        agents: formattedAgents,
        total: agents.length,
        currentPage: 1,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    if (typeof next === 'function') {
      next(error);
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Input validation for agent creation
const validateAgentData = (req, res, next) => {
  const { name, email, phone, address, description, status } = req.body || {};
  const errors = {};
  
  // Required fields
  if (!name?.trim()) errors.name = 'Name is required';
  if (!email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      fields: errors
    });
  }

  // Sanitize and prepare data
  req.agentData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    address: address?.trim() || null,
    description: description?.trim() || null,
    specialization: Array.isArray(req.body.specialization) 
      ? req.body.specialization.filter(s => typeof s === 'string')
      : [],
    image: req.body.image?.trim() || null,
    status: (status || 'ACTIVE').toUpperCase(),
    propertyCount: typeof req.body.propertyCount === 'number' 
      ? Math.max(0, req.body.propertyCount) 
      : 0
  };

  next();
};

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 100 }
 *               phone: { type: string, maxLength: 20, nullable: true }
 *               address: { type: string, maxLength: 255, nullable: true }
 *               description: { type: string, nullable: true }
 *               specialization: { type: array, items: { type: string } }
 *               image: { type: string, format: uri, nullable: true }
 *               status: { type: string, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
 *               propertyCount: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post('/', validateAgentData, async (req, res, next) => {
  try {
    // Check for existing email
    const existing = await prisma.agent.findUnique({ 
      where: { email: req.agentData.email } 
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Email already in use',
        fields: { email: 'This email is already registered' }
      });
    }

    // Create new agent
    const agent = await prisma.agent.create({
      data: req.agentData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        image: true,
        propertyCount: true,
        _count: { select: { listings: true } }
      }
    });

    // Return created agent with 201 status
    res.status(201).json({
      data: {
        ...agent,
        propertyCount: agent.propertyCount ?? agent._count?.listings ?? 0
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already in use',
          fields: { email: 'This email is already registered' }
        });
      }
    }
    console.error('Error creating agent:', error);
    next(error);
  }
});

// Input validation for agent update
const validateUpdateData = (req, res, next) => {
  const { name, email, phone, image, status, address, description, specialization, propertyCount } = req.body || {};
  const errors = {};
  const updateData = {};
  
  // Validate and sanitize each field
  if (name !== undefined) {
    if (typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    } else if (name !== undefined) {
      errors.name = 'Name must be a non-empty string';
    }
  }
  
  if (email !== undefined) {
    if (typeof email === 'string' && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        updateData.email = email.trim().toLowerCase();
      } else {
        errors.email = 'Invalid email format';
      }
    } else {
      errors.email = 'Email must be a non-empty string';
    }
  }
  
  if (phone !== undefined) updateData.phone = typeof phone === 'string' ? phone.trim() || null : null;
  if (image !== undefined) updateData.image = typeof image === 'string' ? image.trim() || null : null;
  
  if (status !== undefined) {
    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (typeof status === 'string' && status.trim()) {
      const statusValue = status.trim().toUpperCase();
      if (validStatuses.includes(statusValue)) {
        updateData.status = statusValue;
      } else {
        errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
      }
    } else {
      errors.status = 'Status must be a non-empty string';
    }
  }
  
  if (address !== undefined) updateData.address = typeof address === 'string' ? address.trim() || null : null;
  if (description !== undefined) updateData.description = typeof description === 'string' ? description.trim() || null : null;
  
  if (specialization !== undefined) {
    updateData.specialization = Array.isArray(specialization) 
      ? specialization.filter(s => typeof s === 'string')
      : [];
  }
  
  if (propertyCount !== undefined) {
    const count = Number(propertyCount);
    if (!isNaN(count) && count >= 0) {
      updateData.propertyCount = count;
    } else {
      errors.propertyCount = 'Property count must be a non-negative number';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      fields: errors
    });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'No valid fields to update',
      fields: {}
    });
  }

  req.updateData = updateData;
  next();
};

/**
 * @swagger
 * /api/agents/{id}:
 *   patch:
 *     summary: Update an existing agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID of the agent to update
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 100 }
 *               phone: { type: string, maxLength: 20, nullable: true }
 *               address: { type: string, maxLength: 255, nullable: true }
 *               description: { type: string, nullable: true }
 *               specialization: { type: array, items: { type: string } }
 *               image: { type: string, format: uri, nullable: true }
 *               status: { type: string, enum: ['ACTIVE', 'INACTIVE'] }
 *               propertyCount: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Validation error or no fields to update
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Agent not found
 *       409:
 *         description: Email already in use
 */
router.patch(
  '/:id', 
  validateAgentId, 
  requireAuth, 
  requireRole('ADMIN'), 
  validateUpdateData, 
  async (req, res, next) => {
    try {
      const id = req.agentId;
      const { updateData } = req;

      // Check for email conflict if email is being updated
      if (updateData.email) {
        const existing = await prisma.agent.findFirst({
          where: { 
            email: updateData.email, 
            NOT: { id } 
          }
        });
        
        if (existing) {
          return res.status(409).json({
            error: 'Conflict',
            message: 'Email already in use',
            fields: { email: 'This email is already registered to another agent' }
          });
        }
      }

      // Prepare listing updates if needed
      const listingUpdateData = {};
      if (updateData.name) listingUpdateData.agentName = updateData.name;
      if (updateData.address !== undefined) listingUpdateData.agentAddress = updateData.address;
      if (updateData.image !== undefined) listingUpdateData.agentImage = updateData.image;

      // Use transaction for atomic updates
      const [agent] = await prisma.$transaction([
        prisma.agent.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            specialization: true,
            image: true,
            status: true,
            propertyCount: true,
            _count: { select: { listings: true } }
          }
        }),
        // Only update listings if needed
        ...(Object.keys(listingUpdateData).length > 0 
          ? [prisma.listing.updateMany({
              where: { agentId: id },
              data: listingUpdateData
            })]
          : []
        )
      ]);

      res.json({
        data: {
          ...agent,
          propertyCount: 'propertyCount' in updateData 
            ? updateData.propertyCount 
            : agent._count?.listings ?? 0
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Agent not found',
            fields: { id: 'No agent found with the provided ID' }
          });
        }
        if (error.code === 'P2002') {
          return res.status(409).json({
            error: 'Conflict',
            message: 'Email already in use',
            fields: { email: 'This email is already registered to another agent' }
          });
        }
      }
      console.error('Error updating agent:', error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Delete an agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID of the agent to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Agent deleted successfully
 *       400:
 *         description: Invalid agent ID
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Agent not found
 *       409:
 *         description: Cannot delete agent with active listings
 */
router.delete(
  '/:id',
  validateAgentId,
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = req.agentId;

      // Check if agent has any listings
      const agent = await prisma.agent.findUnique({
        where: { id },
        include: { _count: { select: { listings: true } } }
      });

      if (!agent) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Agent not found',
          fields: { id: 'No agent found with the provided ID' }
        });
      }

      // Prevent deletion if agent has listings
      if (agent._count.listings > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Cannot delete agent with active listings',
          fields: { 
            id: 'Agent has active listings',
            listingCount: agent._count.listings
          }
        });
      }

      // Delete the agent
      await prisma.agent.delete({ 
        where: { id } 
      });

      res.status(204).end();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Agent not found',
            fields: { id: 'No agent found with the provided ID' }
          });
        }
      }
      console.error('Error deleting agent:', error);
      next(error);
    }
  }
);

export default router;
