import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    SCHEDULED: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Scheduled'
    },
    CONFIRMED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Confirmed'
    },
    COMPLETED: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Completed'
    },
    CANCELLED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Cancelled'
    },
    NO_SHOW: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'No Show'
    }
  };

  const config = statusConfig[status] || statusConfig.SCHEDULED;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

const AppointmentsList = ({ 
  appointments = [], 
  onEdit, 
  onDelete, 
  onStatusChange,
  loading = false,
  isAdmin = false,
  onPageChange,
  pagination = {}
}) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'scheduledAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedAndFilteredAppointments = useMemo(() => {
    let result = [...appointments];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(appt => 
        (appt.user?.name?.toLowerCase().includes(term)) ||
        (appt.listing?.title?.toLowerCase().includes(term)) ||
        (appt.notes?.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(appt => appt.status === selectedStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [appointments, sortConfig, searchTerm, selectedStatus]);

  // Handle status change
  const handleStatusChange = async (id, status) => {
    try {
      await onStatusChange(id, { status });
      // No need to show success toast here as it's already handled in the parent component
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  // Handle delete confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        await onDelete(id);
        // No need to show success toast here as it's already handled in the parent component
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
      }
    }
  };

  // Handle row click
  const handleRowClick = (appointment) => {
    if (isAdmin) {
      onEdit(appointment);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Search and filter bar */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointments table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('user.name')}
              >
                <div className="flex items-center">
                  Client
                  {renderSortIndicator('user.name')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('listing.title')}
              >
                <div className="flex items-center">
                  Property
                  {renderSortIndicator('listing.title')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('scheduledAt')}
              >
                <div className="flex items-center">
                  Date & Time
                  {renderSortIndicator('scheduledAt')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredAppointments.map((appointment) => (
              <tr 
                key={appointment.id} 
                className={`${isAdmin ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                onClick={() => handleRowClick(appointment)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                      <span className="text-blue-600 font-medium">
                        {appointment.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.user?.email || ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {appointment.listing?.title || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.listing?.address || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {format(parseISO(appointment.scheduledAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      {format(parseISO(appointment.scheduledAt), 'h:mm a')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={appointment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(appointment);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(appointment.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {appointment.status !== 'CONFIRMED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(appointment.id, 'CONFIRMED');
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {appointment.status !== 'CANCELLED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(appointment.id, 'CANCELLED');
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    {!isAdmin && (
                      <button
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Calculate page numbers to show (with ellipsis)
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
