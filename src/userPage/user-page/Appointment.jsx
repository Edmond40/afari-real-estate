import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

const Appointment = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('=== USER FETCH APPOINTMENTS DEBUG ===');
      console.log('User:', user);
      console.log('User ID:', user.id);
      
      const response = await api.get('/appointments');
      
      console.log('User appointments response:', response.data);
      
      if (response.data?.success) {
        const appointmentsData = response.data.data || [];
        setAppointments(appointmentsData);
        console.log('Set user appointments:', appointmentsData);
      } else {
        console.error('User appointments response not successful:', response.data);
        throw new Error(response.data?.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('=== USER FETCH ERROR ===');
      console.error('Error fetching appointments:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      const errorMessage = err.response?.data?.message || 'Failed to load appointments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointment) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (cancelReason.length < 10) {
      toast.error('Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    try {
      setCancellingId(appointment.id);
      
      await api.post(`/appointments/${appointment.id}/cancel`, {
        reason: cancelReason
      });
      
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setCancellingId(null);
      
      // Refresh appointments
      await fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  // Clear all toast notifications
  const clearAllToasts = () => {
    toast.dismiss();
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

  // Filter appointments
  const upcomingAppointments = appointments.filter(apt => 
    apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && 
    new Date(apt.scheduledAt) > new Date()
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || 
    new Date(apt.scheduledAt) <= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Appointments</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your property viewing appointments</p>
        
        {/* Clear notifications button */}
        <div className="mt-4">
          <button
            onClick={clearAllToasts}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear Notifications
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.scheduledAt);
              return (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.listing?.title || 'Property Viewing'}
                      </h3>
                      <p className="text-gray-600">
                        {appointment.listing?.address || 'Address not available'}
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
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-gray-900">{appointment.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setCancellingId(appointment.id);
                        setShowCancelModal(true);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.scheduledAt);
              return (
                <div key={appointment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.listing?.title || 'Property Viewing'}
                      </h3>
                      <p className="text-gray-600">
                        {appointment.listing?.address || 'Address not available'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-gray-900">{appointment.notes}</p>
                    </div>
                  )}
                  
                  {appointment.cancellationReason && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Cancellation Reason</p>
                      <p className="text-gray-900">{appointment.cancellationReason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No appointments message */}
      {appointments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">You don't have any appointments scheduled yet.</p>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowCancelModal(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" tabIndex="-1">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 id="cancel-modal-title" className="text-lg leading-6 font-medium text-gray-900">
                    Cancel Appointment
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </p>
                    <div className="mt-4">
                      <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 text-left">
                        Reason for cancellation (required)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="cancel-reason"
                          rows="3"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                          placeholder="Please let us know why you're cancelling..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          required
                          aria-describedby="cancel-reason-help"
                          maxLength={500}
                        />
                        <p id="cancel-reason-help" className="mt-1 text-xs text-gray-500">
                          {cancelReason.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const appointment = appointments.find(a => a.id === cancellingId);
                    if (appointment) {
                      handleCancelAppointment(appointment);
                    }
                  }}
                  disabled={cancellingId === null || !cancelReason.trim() || cancelReason.length < 10}
                >
                  {cancellingId ? 'Cancelling...' : 'Yes, cancel appointment'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
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

export default Appointment;
