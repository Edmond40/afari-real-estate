import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { Calendar, Edit, Trash2, X, Search } from 'lucide-react';
import api from '../../lib/api';

// Status colors for badges
const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

const Appointments = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Modal states
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    status: '',
    agentNotes: '',
    internalNotes: '',
  });
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Fetch appointments data
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      if (searchQuery) params.append('search', searchQuery);
      
      const [appointmentsRes, statsRes] = await Promise.all([
        api.get(`/admin/appointments?${params.toString()}`),
        api.get('/admin/appointments/stats')
      ]);
      
      setAppointments(appointmentsRes.data.data || []);
      setStats({
        total: statsRes.data.total || 0,
        scheduled: statsRes.data.scheduled || 0,
        confirmed: statsRes.data.confirmed || 0,
        completed: statsRes.data.completed || 0,
        cancelled: statsRes.data.cancelled || 0,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedDate, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Event handlers
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      status: appointment.status,
      agentNotes: appointment.agentNotes || '',
      internalNotes: appointment.internalNotes || '',
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    try {
      setLoading(true);
      await api.put(`/admin/appointments/${editingAppointment.id}`, formData);
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update appointment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancellingId) return;
    
    try {
      setLoading(true);
      await api.post(`/admin/appointments/${cancellingId}/cancel`, { reason: cancellationReason });
      
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancellationReason('');
      setCancellingId(null);
      await fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const openCancelModal = (appointmentId) => {
    setCancellingId(appointmentId);
    setShowCancelModal(true);
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedStatus !== 'all' && appointment.status !== selectedStatus) {
      return false;
    }
    
    if (selectedDate) {
      const appointmentDate = format(parseISO(appointment.scheduledAt), 'yyyy-MM-dd');
      if (appointmentDate !== selectedDate) return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (appointment.user?.name?.toLowerCase().includes(searchLower)) ||
        (appointment.listing?.title?.toLowerCase().includes(searchLower)) ||
        (appointment.id?.toString().includes(searchQuery))
      );
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getTimeRemaining = (scheduledAt) => {
    try {
      if (!scheduledAt) return 'N/A';
      
      const now = new Date();
      const scheduled = new Date(scheduledAt);
      const diffInMinutes = Math.round((scheduled - now) / (1000 * 60));
      
      if (isNaN(diffInMinutes)) return 'Invalid date';
      
      if (diffInMinutes < 0) {
        return 'Past';
      } else if (diffInMinutes < 60) {
        return `In ${diffInMinutes} min`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        const days = Math.floor(diffInMinutes / (60 * 24));
        return `In ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 'Error';
    }
  };

  // Render functions
  const renderStats = () => (
    <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-5">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        </div>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="search"
            className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="w-full sm:w-48">
        <select
          id="status"
          className="block w-full py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedStatus}
          onChange={handleStatusChange}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-48">
        <input
          type="date"
          className="block w-full py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
    </div>
  );

  const renderAppointmentsTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-600 bg-red-100 rounded-md">
          {error}
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <p>No appointments found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                ID
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Client
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Property
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Date & Time
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Time Left
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6">
                  {appointment.id}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <img 
                        className="w-10 h-10 rounded-full" 
                        src={appointment.user?.image || '/default-avatar.png'} 
                        alt={appointment.user?.name || 'User'}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{appointment.user?.name || 'N/A'}</div>
                      <div className="text-gray-500">{appointment.user?.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{appointment.listing?.title || 'N/A'}</div>
                  <div className="text-gray-500">{appointment.listing?.address || ''}</div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="flex-shrink-0 mr-2 text-gray-400 w-4 h-4" />
                    {formatDate(appointment.scheduledAt)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                    {appointment.status?.toLowerCase().replace('_', ' ') || 'N/A'}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {getTimeRemaining(appointment.scheduledAt)}
                </td>
                <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(appointment)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-5 h-5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openCancelModal(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={appointment.status === 'CANCELLED'}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="sr-only">Cancel</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEditModal = () => (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Edit Appointment
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW'].map((status) => (
                        <option key={status} value={status}>
                          {status.toLowerCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="agentNotes" className="block text-sm font-medium text-gray-700">
                      Agent Notes
                    </label>
                    <textarea
                      id="agentNotes"
                      name="agentNotes"
                      rows={3}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.agentNotes}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700">
                      Internal Notes
                    </label>
                    <textarea
                      id="internalNotes"
                      name="internalNotes"
                      rows={3}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.internalNotes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleUpdateAppointment}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => setShowEditModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCancelModal = () => (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Cancel Appointment
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel this appointment? This action cannot be undone.
                  </p>
                </div>
                <div className="mt-4">
                  <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700">
                    Reason for cancellation
                  </label>
                  <textarea
                    id="cancellationReason"
                    rows={3}
                    className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCancelAppointment}
              disabled={loading || !cancellationReason.trim()}
            >
              {loading ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                setShowCancelModal(false);
                setCancellationReason('');
              }}
              disabled={loading}
            >
              Keep Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">Appointments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage property viewing appointments and update their status.
          </p>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      <div className="mt-8">
        {renderFilters()}
      </div>

      {/* Appointments Table */}
      <div className="mt-8">
        {renderAppointmentsTable()}
      </div>

      {/* Modals */}
      {showEditModal && renderEditModal()}
      {showCancelModal && renderCancelModal()}
    </div>
  );
};

export default Appointments;
