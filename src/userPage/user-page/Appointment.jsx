import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const getStatusBadge = (status) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function Appointment() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/appointments/user');
      // Sort appointments by date, newest first
      const sortedAppointments = (response.data.data || []).sort((a, b) => 
        new Date(b.scheduledAt) - new Date(a.scheduledAt)
      );
      setAppointments(sortedAppointments);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async (appointment) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancellingId(appointment.id);
      await api.delete(`/appointments/${appointment.id}`, {
        data: { reason: cancelReason }
      });
      
      // Update local state to reflect the cancellation
      setAppointments(prev => 
        prev.map(a => 
          a.id === appointment.id 
            ? { ...a, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
            : a
        )
      );
      
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = (appointment) => {
    // This would open a rescheduling modal or navigate to a reschedule page
    console.log('Reschedule appointment:', appointment.id);
    // For now, just show a toast
    toast.info('Reschedule functionality coming soon!');
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    appt => new Date(appt.scheduledAt) >= new Date() && appt.status !== 'CANCELLED'
  );

  const pastAppointments = appointments.filter(
    appt => new Date(appt.scheduledAt) < new Date() || appt.status === 'CANCELLED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your property viewing appointments
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-12">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Schedule a new appointment to view a property.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {appointment.listing?.title || 'Property Viewing'}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(appointment.status)}`}>
                          {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {format(new Date(appointment.scheduledAt), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {format(new Date(appointment.scheduledAt), 'h:mm a')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {appointment.listing?.address || 'Address not available'}
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleReschedule(appointment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCancellingId(appointment.id);
                          setShowCancelModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={appointment.status === 'CANCELLED'}
                      >
                        {appointment.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Past Appointments</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pastAppointments.map((appointment) => (
                <li key={`past-${appointment.id}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {appointment.listing?.title || 'Property Viewing'}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(appointment.status)}`}>
                          {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {format(new Date(appointment.scheduledAt), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {appointment.listing?.address || 'Address not available'}
                      </div>
                    </div>
                    {appointment.status === 'CANCELLED' && appointment.cancelledAt && (
                      <div className="mt-2 text-sm text-red-600">
                        Cancelled on {format(new Date(appointment.cancelledAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={() => {
                    const appointment = appointments.find(a => a.id === cancellingId);
                    if (appointment) {
                      handleCancelAppointment(appointment);
                    }
                  }}
                  disabled={cancellingId === null || !cancelReason.trim()}
                >
                  {cancellingId ? 'Cancelling...' : 'Yes, cancel appointment'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                >
                  Keep appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointment;