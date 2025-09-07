import { useState } from 'react';
import { useReviews } from '../lib/hooks/useReviews';

function Star({ filled }) {
  return (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.985 2.126c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
  );
}

function RatingStars({ value = 0 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= value} />
      ))}
    </div>
  );
}

function Avatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-gray-500"
        aria-hidden="true"
      >
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
      </svg>
    </div>
  );
}

export default function PropertiesDetailReviews({ listingId }) {
  const { reviews, loading, error, create, remove, canPost } = useReviews(listingId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await create({ rating, comment });
      setComment('');
      setRating(5);
    } catch (_) {
      // handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8" data-aos="fade-up">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>

      {!canPost && (
        <div className="mb-6 p-4 border rounded bg-gray-50 text-gray-700">
          <p className="mb-2">Sign in to post a review. Reviews are posted under the currently logged-in account.</p>
          <div className="flex gap-3">
            <a href="/login" className="text-blue-600 hover:underline">Login</a>
            <a href="/signup" className="text-blue-600 hover:underline">Create account</a>
          </div>
        </div>
      )}

      {canPost && (
        <form onSubmit={onSubmit} className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-gray-700">Your rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[5,4,3,2,1].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full border rounded px-3 py-2 mb-3"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post review'}
          </button>
        </form>
      )}

      {loading && <p className="text-gray-600">Loading reviews...</p>}
      {error && <p className="text-red-600">Failed to load reviews.</p>}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar />
                <div>
                  <p className="text-gray-900 text-sm font-medium">{r.user?.name || 'User'}</p>
                  <p className="text-gray-500 text-xs">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              <RatingStars value={r.rating} />
            </div>
            <p className="text-gray-800 whitespace-pre-line">{r.comment}</p>
            {canPost && !r._optimistic && (
              <div className="text-right mt-2">
                <button
                  onClick={() => remove(r.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && reviews.length === 0 && (
          <p className="text-gray-600">No reviews yet. Be the first to review.</p>
        )}
      </div>
    </div>
  );
}
