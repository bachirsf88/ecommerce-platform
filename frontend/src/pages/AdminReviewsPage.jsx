import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  rating: '',
};

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getReviews(filters);
        setReviews(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [filters]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return '0.0';
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters({
      ...draftFilters,
      rating: draftFilters.rating ? Number(draftFilters.rating) : '',
    });
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const handleDeleteReview = async (reviewId) => {
    setActionLoadingId(String(reviewId));
    setError('');

    try {
      await adminService.deleteReview(reviewId);
      setReviews((previousReviews) =>
        previousReviews.filter((review) => String(review.id) !== String(reviewId))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Reviews</span>
        <h1 className="section-title mt-4">Reviews Management</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Moderate customer feedback, inspect the buyer and product context behind each review, and remove inappropriate submissions when needed.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Visible Reviews</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{reviews.length}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Average Rating</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{averageRating}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div>
            <label htmlFor="review-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search reviews
            </label>
            <input
              id="review-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by buyer, product, order, or comment"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="review-rating" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Rating
            </label>
            <select
              id="review-rating"
              value={draftFilters.rating}
              onChange={(event) => setDraftFilters((current) => ({ ...current, rating: event.target.value }))}
              className="text-input"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button type="submit" className="btn-base btn-primary">
              Apply Filters
            </button>
            <button type="button" onClick={handleReset} className="btn-base btn-outline">
              Reset
            </button>
          </div>
        </div>
      </form>

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading reviews...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        reviews.length === 0 ? (
          <div className="empty-state">No reviews match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <article key={review.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">{review.product?.name || 'Unknown product'}</p>
                    <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                      Buyer: {review.buyer?.name || 'Unknown buyer'}
                    </p>
                  </div>
                  <span className="status-pill">{review.rating}/5</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                  <p>Order: #{review.order?.id || review.order_id}</p>
                  <p>Buyer Email: {review.buyer?.email || 'N/A'}</p>
                  <p>Product Status: {review.product?.status || 'Unknown'}</p>
                  <p>Created: {formatDateTime(review.created_at)}</p>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4 text-sm leading-7 text-[var(--color-text-soft)]">
                  {review.comment || 'No written comment provided.'}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={actionLoadingId === String(review.id)}
                    className="btn-base btn-outline"
                  >
                    {actionLoadingId === String(review.id) ? 'Deleting...' : 'Delete Review'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminReviewsPage;
