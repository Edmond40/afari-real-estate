import axios from 'axios';
import { TOKEN_KEY } from '../config/auth';

const api = axios.create({
  // In dev, use Vite proxy by default to avoid CORS
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Appointment API
export const appointmentService = {
  // Get appointments with optional filters
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  
  // Create a new appointment
  createAppointment: (data) => api.post('/appointments', data),
  
  // Update an existing appointment
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  
  // Get appointment statistics
  getAppointmentStats: () => api.get('/appointments/stats'),
  
  // Delete an appointment (soft delete by updating status to CANCELLED)
  deleteAppointment: (id) => api.put(`/appointments/${id}`, { status: 'CANCELLED' }),
};

export default api;
