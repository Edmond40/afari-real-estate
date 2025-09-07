import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { sign } from '../lib/auth.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users?page=&limit=&search=
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const search = (req.query.search || '').trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { role: { equals: search.toUpperCase() } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) { next(e); }
});

// POST /api/users/signup -> public create user (same as /api/auth/signup)
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'User with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: (role || 'USER').toUpperCase() },
      select: { id: true, name: true, email: true, role: true },
    });
    const token = sign({ id: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
});

// PATCH /api/users/update-me -> authenticated user updates their own profile/preferences
router.patch('/update-me', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const { name, preferences } = req.body || {};
    const data = {};
    if (typeof name === 'string') data.name = name;
    if (typeof preferences !== 'undefined') data.preferences = preferences;
    if (!Object.keys(data).length) return res.status(400).json({ message: 'No fields to update' });

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, preferences: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
});

// PATCH /api/users/:id -> admin updates user (name, email, role)
router.patch('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body || {};
    const data = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (typeof email === 'string' && email.trim()) data.email = email.trim();
    if (typeof role === 'string' && role.trim()) data.role = role.trim().toUpperCase();

    if (!Object.keys(data).length) return res.status(400).json({ message: 'No fields to update' });

    // Handle unique email conflict
    if (data.email) {
      const exists = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
});

// DELETE /api/users/:id -> admin deletes user
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
