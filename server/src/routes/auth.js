import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import process from 'process';
import { prisma } from '../lib/prisma.js';
import { sign } from '../lib/auth.js';

const router = express.Router();

// GET /api/auth/me
// Returns current user info from req.user (using token in Authorization header)
router.get('/me', async (req, res, next) => {
  try {
    // naive token decode for now; in a real app we'd have auth middleware
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signup (public user signup)
// body: { name, email, password }
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        // Ensure role matches Prisma enum: ADMIN | AGENT | VIEWER
        role: 'VIEWER',
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = sign({ id: user.id, role: user.role });
    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/admin-signup
// body: { authCode, email, password, name? }
router.post('/admin-signup', async (req, res, next) => {
  try {
    const { authCode, email, password, name } = req.body || {};

    if (!authCode || !email || !password) {
      return res.status(400).json({ message: 'authCode, email, and password are required' });
    }

    if (authCode !== process.env.ADMIN_AUTH_CODE) {
      return res.status(403).json({ message: 'Invalid admin authorization code' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        password: hashed,
        role: 'ADMIN',
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = sign({ id: user.id, role: user.role });

    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = sign({ id: user.id, role: user.role });
    return res.json({ user: publicUser, token });
  } catch (err) {
    next(err);
  }
});

export default router;
