import express from 'express';
import { 
  getAppointments, 
  createAppointment, 
  updateAppointment,
  cancelAppointment,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes - allow creating appointments without authentication
router.post('/', createAppointment);

// Protected routes (require authentication)
router.use(requireAuth);

// User routes - accessible to all authenticated users
router.get('/', getAppointments);
router.post('/:id/cancel', cancelAppointment); // Allow users to cancel their own appointments

// Admin routes - require ADMIN role
router.use(requireRole('ADMIN'));
router.get('/stats', getAppointmentStats);
router.put('/:id', updateAppointment);

export default router;
