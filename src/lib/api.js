import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
