import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useInquiries } from '../../lib/hooks/useInquiries';
import ReplyInquiryModal from './modals/inquiriesModal/ReplyInquiryModal';
import ConfirmationModal from '../components/ConfirmationModal'; // Added import

// Animation components can be added later if needed

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

export default function InquiriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    inquiries = [],
    meta = { total: 0, page: 1, totalPages: 1, limit: 10 },
    loading,
    error,
    updateInquiryStatus,
    deleteInquiry,
    isUpdatingStatus,
    isDeleting
  } = useInquiries({
    page,
    search,
    status: statusFilter || undefined,
  });

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await updateInquiryStatus({ id: inquiryId, status: newStatus });
      toast.success('Inquiry status updated successfully');
      queryClient.invalidateQueries(['inquiries']);
    } catch (error) {
      toast.error(error.message || 'Failed to update inquiry status');
    }
  };

  const handleDeleteClick = (inquiryId) => {
    setInquiryToDelete(inquiryId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    
    try {
      await deleteInquiry(inquiryToDelete);
      toast.success('Inquiry deleted successfully');
      setInquiryToDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete inquiry');
    }
  };

  const handleReply = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsReplyModalOpen(true);
  };

  const handleReplySuccess = () => {
    queryClient.invalidateQueries(['inquiries']);
  };

  if (loading) return <div className="p-4">Loading inquiries...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search inquiries..."
            className="p-2 border rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map((inquiry) => {
              const status = statusOptions.find(s => s.value === inquiry.status) || statusOptions[0];
              return (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                    <div className="text-sm text-gray-500">{inquiry.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inquiry.subject}</div>
                    {inquiry.reply && (
                      <div className="text-xs text-green-600 mt-1">✓ Replied</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className={`${status.color} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                      disabled={isUpdatingStatus}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleReply(inquiry)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {inquiry.reply ? 'Edit Reply' : 'Reply'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(inquiry.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * meta.limit, meta.total)}
                </span>{' '}
                of <span className="font-medium">{meta.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  let pageNum;
                  if (meta.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= meta.totalPages - 2) {
                    pageNum = meta.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <ReplyInquiryModal
        inquiry={selectedInquiry}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSuccess={handleReplySuccess}
      />
    </div>
  );
}
