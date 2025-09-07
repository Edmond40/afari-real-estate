import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';

function Reviews() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });
      const response = await api.get(`/reviews?${params}`);
      return response.data;
    }
  });

  const reviews = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1, limit: 20 };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setIsReplyModalOpen(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await api.patch(`/reviews/${selectedReview.id}`, { adminReply: replyText });
      toast.success('Reply sent successfully');
      queryClient.invalidateQueries(['reviews']);
      setIsReplyModalOpen(false);
      setSelectedReview(null);
      setReplyText('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    }
  };

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      await api.delete(`/reviews/${reviewToDelete}`);
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries(['reviews']);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setReviewToDelete(null);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  if (isLoading) return <div className="p-4">Loading reviews...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Reviews</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search reviews..."
            className="p-2 border rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
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
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {review.listing?.title || 'Unknown Property'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.listing?.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {review.user?.name || 'Anonymous'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {review.comment}
                  </div>
                  {review.adminReply && (
                    <div className="text-xs text-green-600 mt-1">✓ Replied</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleReply(review)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {review.adminReply ? 'Edit Reply' : 'Reply'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(review.id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reply to Review</h2>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Original Review</h3>
              <div className="flex items-center mb-2">
                {renderStars(selectedReview?.rating || 0)}
                <span className="ml-2 text-sm text-gray-600">
                  by {selectedReview?.user?.name || 'Anonymous'}
                </span>
              </div>
              <p><strong>Property:</strong> {selectedReview?.listing?.title}</p>
              <p><strong>Comment:</strong> {selectedReview?.comment}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your reply here..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
