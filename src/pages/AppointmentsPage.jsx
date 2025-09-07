import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../lib/api';
import AppointmentsList from '../components/AppointmentsList';
import AppointmentForm from '../components/AppointmentForm';
import { toast } from 'react-toastify';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  const isAdmin = user?.role === 'ADMIN';

  // Fetch appointments with current filters and pagination
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await appointmentService.getAppointments(params);
      // Handle different response structures
      const responseData = response.data || response;
      const meta = response.meta || response.pagination || {};
      
      setAppointments(Array.isArray(responseData) ? responseData : []);
      setPagination(prev => ({
        ...prev,
        totalItems: meta.total || meta.totalItems || 0,
        totalPages: meta.totalPages || Math.ceil((meta.total || 0) / pagination.pageSize) || 1
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handle appointment creation/update
  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment) {
        await appointmentService.updateAppointment(editingAppointment.id, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentService.createAppointment(appointmentData);
        toast.success('Appointment created successfully');
      }
      setShowForm(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to save appointment');
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Handle status change
  const handleStatusChange = async (id, data) => {
    try {
      await appointmentService.updateAppointment(id, data);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage property viewing appointments and schedules
          </p>
        </div>
        
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Appointment
          </button>
        )}
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              initialData={editingAppointment || {}}
              onSubmit={handleSaveAppointment}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
              }}
              loading={loading}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              id="startDate"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.startDate}
              onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              id="endDate"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.endDate}
              onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })}
              min={filters.startDate}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleFilterChange({ status: '', startDate: '', endDate: '' })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="mt-4">
        <AppointmentsList
          appointments={appointments}
          loading={loading}
          onEdit={(appointment) => {
            setEditingAppointment(appointment);
            setShowForm(true);
          }}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
          isAdmin={isAdmin}
          onPageChange={handlePageChange}
          pagination={pagination}
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
