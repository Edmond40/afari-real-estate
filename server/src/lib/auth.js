import jwt from 'jsonwebtoken';
import process from 'process';

export function sign(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d', ...options });
}
