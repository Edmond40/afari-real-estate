import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import AddAppointmentModal from './modals/AddAppointmentModal';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Form data for editing
  const [formData, setFormData] = useState({
    status: '',
    agentNotes: '',
    internalNotes: ''
  });

  // Fetch appointments with filters
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('=== ADMIN FETCH APPOINTMENTS DEBUG ===');
      console.log('User:', user);
      console.log('User role:', user.role);
      console.log('User ID:', user.id);
      
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDate) params.append('startDate', selectedDate);
      if (searchQuery) params.append('search', searchQuery);
      
      console.log('Fetching appointments with params:', params.toString());
      
      const [appointmentsRes, statsRes] = await Promise.all([
        api.get(`/appointments?${params.toString()}`),
        api.get('/appointments/stats')
      ]);
      
      console.log('Appointments response:', appointmentsRes.data);
      console.log('Stats response:', statsRes.data);
      
      if (appointmentsRes.data?.success) {
      setAppointments(appointmentsRes.data.data || []);
        console.log('Set appointments:', appointmentsRes.data.data);
      } else {
        console.error('Appointments response not successful:', appointmentsRes.data);
        throw new Error(appointmentsRes.data?.message || 'Failed to fetch appointments');
      }
      
      if (statsRes.data?.success) {
      setStats({
          total: statsRes.data.data.total || 0,
          scheduled: statsRes.data.data.byStatus?.SCHEDULED || 0,
          confirmed: statsRes.data.data.byStatus?.CONFIRMED || 0,
          completed: statsRes.data.data.byStatus?.COMPLETED || 0,
          cancelled: statsRes.data.data.byStatus?.CANCELLED || 0
        });
      }
    } catch (err) {
      console.error('=== ADMIN FETCH ERROR ===');
      console.error('Error fetching appointments:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      const errorMessage = err.response?.data?.message || 'Failed to load appointments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedDate, searchQuery, user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle appointment update
  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    if (!formData.status) {
      toast.error('Please select a status');
      return;
    }
    
    try {
      setLoading(true);
      await api.put(`/appointments/${editingAppointment.id}`, formData);
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      setFormData({ status: '', agentNotes: '', internalNotes: '' });
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update appointment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!cancellingId) return;
    
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (cancellationReason.length < 10) {
      toast.error('Please provide a more detailed reason (at least 10 characters)');
      return;
    }
    
    try {
      setLoading(true);
      await api.post(`/appointments/${cancellingId}/cancel`, { reason: cancellationReason });
      
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

  // Open edit modal
  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      status: appointment.status || '',
      agentNotes: appointment.agentNotes || '',
      internalNotes: appointment.internalNotes || ''
    });
    setShowEditModal(true);
  };

  // Open cancel modal
  const openCancelModal = (appointmentId) => {
    setCancellingId(appointmentId);
    setShowCancelModal(true);
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-yellow-100 text-yellow-800'
    };
    
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-gray-600">Manage all property viewing appointments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
    </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
        </select>
      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by property or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600 font-semibold mb-2">Error Loading Appointments</div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">No appointments match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.scheduledAt);
    return (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.listing?.title || 'Property Viewing'}
                      </h3>
                      <p className="text-gray-600">
                        {appointment.listing?.address || 'Address not available'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Client: {appointment.user?.name || 'Unknown'} ({appointment.user?.email || 'No email'})
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-gray-900">{date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time</p>
                      <p className="text-gray-900">{time}</p>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Client Notes</p>
                      <p className="text-gray-900">{appointment.notes}</p>
                    </div>
                  )}
                  
                  {appointment.agentNotes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Agent Notes</p>
                      <p className="text-gray-900">{appointment.agentNotes}</p>
                    </div>
                  )}
                  
                  {appointment.internalNotes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Internal Notes</p>
                      <p className="text-gray-900">{appointment.internalNotes}</p>
                  </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(appointment)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                    <button
                      onClick={() => openCancelModal(appointment.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Cancel
                    </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <AddAppointmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAppointments();
          }}
        />
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowEditModal(false)}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Appointment
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="NO_SHOW">No Show</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Notes</label>
                    <textarea
                      name="agentNotes"
                      rows="3"
                      value={formData.agentNotes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add agent notes..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                    <textarea
                      name="internalNotes"
                      rows="3"
                      value={formData.internalNotes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add internal notes..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpdateAppointment}
              disabled={loading}
            >
                  {loading ? 'Updating...' : 'Update Appointment'}
            </button>
            <button
              type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({ status: '', agentNotes: '', internalNotes: '' });
                  }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowCancelModal(false)}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Cancel Appointment
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation (required)</label>
                  <textarea
                    rows="3"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason for cancellation..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {cancellationReason.length}/500 characters
                  </p>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCancelAppointment}
                  disabled={loading || !cancellationReason.trim() || cancellationReason.length < 10}
            >
                  {loading ? 'Cancelling...' : 'Yes, cancel appointment'}
            </button>
            <button
              type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => {
                setShowCancelModal(false);
                setCancellationReason('');
                    setCancellingId(null);
              }}
            >
                  Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
};

export default Appointments;
