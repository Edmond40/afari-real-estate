import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

function ReplyInquiryModal({ inquiry, isOpen, onClose, onSuccess }) {
  const [reply, setReply] = useState(inquiry?.reply || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/inquiries/${inquiry.id}`, { reply });
      toast.success('Reply sent successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-aos="fade-up">
        <div className="flex justify-between items-center mb-4" >
          <h2 className="text-xl font-bold">Reply to Inquiry</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Original Inquiry</h3>
          <p><strong>From:</strong> {inquiry?.name} ({inquiry?.email})</p>
          <p><strong>Subject:</strong> {inquiry?.subject}</p>
          <p><strong>Message:</strong> {inquiry?.message}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your reply here..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReplyInquiryModal;
