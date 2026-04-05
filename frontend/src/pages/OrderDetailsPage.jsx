import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { canAccessBuyerFeatures } from '../utils/roles';

const REVIEW_ELIGIBLE_STATUSES = ['delivered'];

const getReviewKey = (orderId, productId) => `${orderId}:${productId}`;

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return amount.toFixed(2);
};

function RatingButton({ value, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
          : 'border-[rgba(138,129,124,0.22)] bg-[rgba(255,253,249,0.78)] text-[rgba(88,78,72,0.84)]'
      }`}
    >
      {value}
    </button>
  );
}

function OrderDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewedItems, setReviewedItems] = useState({});
  const [reviewStateLoading, setReviewStateLoading] = useState(false);
  const [activeReviewItemId, setActiveReviewItemId] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [reviewSubmittingKey, setReviewSubmittingKey] = useState('');
  const [reviewMessages, setReviewMessages] = useState({});

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadOrder();
    }
  }, [authLoading, id, user]);

  const isReviewEligibleOrder = useMemo(
    () => REVIEW_ELIGIBLE_STATUSES.includes(String(order?.status || '').toLowerCase()),
    [order?.status]
  );

  useEffect(() => {
    let isMounted = true;

    const loadExistingReviews = async () => {
      if (!order?.id || !user?.id || !isReviewEligibleOrder) {
        setReviewedItems({});
        return;
      }

      const uniqueProductIds = [...new Set(
        (order.items ?? [])
          .map((item) => item?.product_id ?? item?.product?.id)
          .filter(Boolean)
          .map(String)
      )];

      if (uniqueProductIds.length === 0) {
        setReviewedItems({});
        return;
      }

      setReviewStateLoading(true);

      try {
        const results = await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const reviewData = await productService.getProductReviews(productId);
              const alreadyReviewed = (reviewData?.reviews ?? []).some(
                (review) =>
                  String(review?.buyer_id) === String(user.id) &&
                  String(review?.order_id) === String(order.id)
              );

              return [getReviewKey(order.id, productId), alreadyReviewed];
            } catch {
              return [getReviewKey(order.id, productId), false];
            }
          })
        );

        if (isMounted) {
          setReviewedItems(Object.fromEntries(results));
        }
      } finally {
        if (isMounted) {
          setReviewStateLoading(false);
        }
      }
    };

    loadExistingReviews();

    return () => {
      isMounted = false;
    };
  }, [isReviewEligibleOrder, order, user?.id]);

  const handleReviewFieldChange = (itemId, field, value) => {
    setReviewForms((previous) => ({
      ...previous,
      [itemId]: {
        rating: previous[itemId]?.rating ?? 5,
        comment: previous[itemId]?.comment ?? '',
        [field]: value,
      },
    }));
  };

  const openReviewForm = (item) => {
    const itemId = String(item.id);

    setReviewMessages((previous) => ({
      ...previous,
      [itemId]: null,
    }));
    setReviewForms((previous) => ({
      ...previous,
      [itemId]: {
        rating: previous[itemId]?.rating ?? 5,
        comment: previous[itemId]?.comment ?? '',
      },
    }));
    setActiveReviewItemId(itemId);
  };

  const closeReviewForm = (itemId) => {
    setActiveReviewItemId(null);
    setReviewMessages((previous) => ({
      ...previous,
      [itemId]: null,
    }));
  };

  const handleReviewSubmit = async (item) => {
    const productId = String(item?.product_id ?? item?.product?.id ?? '');
    const reviewKey = getReviewKey(order.id, productId);
    const itemId = String(item.id);
    const form = reviewForms[itemId] ?? { rating: 5, comment: '' };

    if (!productId) {
      setReviewMessages((previous) => ({
        ...previous,
        [itemId]: {
          type: 'error',
          text: 'This item cannot be reviewed right now.',
        },
      }));
      return;
    }

    setReviewSubmittingKey(reviewKey);
    setReviewMessages((previous) => ({
      ...previous,
      [itemId]: null,
    }));

    try {
      await reviewService.createReview({
        product_id: productId,
        order_id: order.id,
        rating: form.rating,
        comment: form.comment,
      });

      setReviewedItems((previous) => ({
        ...previous,
        [reviewKey]: true,
      }));
      setReviewMessages((previous) => ({
        ...previous,
        [itemId]: {
          type: 'success',
          text: 'Thanks for your feedback. Your review has been submitted.',
        },
      }));
      setActiveReviewItemId(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setReviewedItems((previous) => ({
          ...previous,
          [reviewKey]: true,
        }));
        setReviewMessages((previous) => ({
          ...previous,
          [itemId]: {
            type: 'success',
            text: 'Review already submitted for this item.',
          },
        }));
        setActiveReviewItemId(null);
      } else {
        setReviewMessages((previous) => ({
          ...previous,
          [itemId]: {
            type: 'error',
            text: err.response?.data?.message || 'Unable to submit your review right now.',
          },
        }));
      }
    } finally {
      setReviewSubmittingKey('');
    }
  };

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-5xl surface-card p-8 text-sm text-[rgba(2,2,2,0.62)]">
          Checking user...
        </div>
      </div>
    );
  }

  if (!canAccessBuyerFeatures(user)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-shell">
      <div className="page-container max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <Link to="/orders" className="btn-base btn-outline">
            Back to My Orders
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to="/favorites" className="btn-base btn-outline">
              Favorites
            </Link>
            <Link to="/cart" className="btn-base btn-outline">
              Cart
            </Link>
          </div>
        </div>

        {loading && (
          <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">
            Loading order details...
          </div>
        )}

        {error && (
          <div className="status-message status-error">
            {error}
          </div>
        )}

        {!loading && !error && !order && (
          <div className="empty-state">
            Order not found.
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            <div className="surface-card-strong p-6 sm:p-8">
              <span className="section-label">Order Details</span>
              <h1 className="section-title mt-4">Order #{order.id}</h1>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="metric-tile">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold capitalize text-[var(--color-primary)]">
                    {order.status || 'Unknown'}
                  </p>
                </div>

                <div className="metric-tile">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Payment Method
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-primary)]">
                    {order.payment_method || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="metric-tile mt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                  Shipping Address
                </p>
                <p className="mt-2 text-sm leading-6 text-[rgba(2,2,2,0.68)]">
                  {order.shipping_address || 'No shipping address available.'}
                </p>
              </div>
            </div>

            <div className="surface-card p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-4xl leading-none text-[var(--color-primary)]">Order Items</h2>
                  <p className="subtle-copy mt-3 text-sm">
                    {isReviewEligibleOrder
                      ? 'Your order has been delivered. Share feedback for the pieces you received.'
                      : 'Review submission becomes available after the order is delivered.'}
                  </p>
                </div>

                {reviewStateLoading && isReviewEligibleOrder && (
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[rgba(138,129,124,0.76)]">
                    Checking review status...
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {(order.items ?? []).map((item) => {
                  const productId = String(item?.product_id ?? item?.product?.id ?? '');
                  const reviewKey = getReviewKey(order.id, productId);
                  const itemId = String(item.id);
                  const isReviewed = Boolean(reviewedItems[reviewKey]);
                  const isFormOpen = activeReviewItemId === itemId;
                  const form = reviewForms[itemId] ?? { rating: 5, comment: '' };
                  const message = reviewMessages[itemId];
                  const isSubmitting = reviewSubmittingKey === reviewKey;

                  return (
                    <div key={item.id} className="metric-tile">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-display text-3xl leading-none text-[var(--color-primary)]">
                            {item.product?.name || 'Unnamed product'}
                          </h3>
                          <div className="mt-3 space-y-1 text-sm text-[rgba(2,2,2,0.66)]">
                            <p>Quantity: {item.quantity ?? 0}</p>
                            <p>Unit Price: ${formatCurrency(item.unit_price)}</p>
                            <p>Subtotal: ${formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 lg:items-end">
                          {item.product?.id && (
                            <Link to={`/products/${item.product.id}`} className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                              View Product
                            </Link>
                          )}

                          {!reviewStateLoading && isReviewEligibleOrder && productId && !isReviewed && !isFormOpen && (
                            <button
                              type="button"
                              onClick={() => openReviewForm(item)}
                              className="btn-base btn-outline"
                            >
                              Leave Review
                            </button>
                          )}

                          {!reviewStateLoading && isReviewEligibleOrder && isReviewed && (
                            <span className="inline-flex items-center rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.78)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(94,84,78,0.86)]">
                              Review Submitted
                            </span>
                          )}
                        </div>
                      </div>

                      {!reviewStateLoading && isReviewEligibleOrder && !isReviewed && !isFormOpen && (
                        <p className="mt-5 text-sm leading-7 text-[rgba(88,78,72,0.78)]">
                          Tell us what you think about this product after receiving your order.
                        </p>
                      )}

                      {isFormOpen && !isReviewed && (
                        <div className="mt-6 rounded-[1.25rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.7)] p-5">
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.8)]">
                            Share Feedback
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[rgba(88,78,72,0.8)]">
                            Your order has been delivered. Share your feedback about this item.
                          </p>

                          <div className="mt-5">
                            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.8)]">
                              Rating
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <RatingButton
                                  key={value}
                                  value={value}
                                  selected={Number(form.rating) === value}
                                  onSelect={(nextValue) => handleReviewFieldChange(itemId, 'rating', nextValue)}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="mt-5">
                            <label
                              htmlFor={`review-comment-${itemId}`}
                              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.8)]"
                            >
                              Comment
                            </label>
                            <textarea
                              id={`review-comment-${itemId}`}
                              value={form.comment}
                              onChange={(event) => handleReviewFieldChange(itemId, 'comment', event.target.value)}
                              rows="4"
                              placeholder="Share a few words about the quality, craftsmanship, or your overall experience."
                              className="text-input mt-3 resize-none"
                            />
                          </div>

                          {message?.type === 'error' && (
                            <p className="status-message status-error mt-4">{message.text}</p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleReviewSubmit(item)}
                              disabled={isSubmitting}
                              className="btn-base btn-primary"
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                              type="button"
                              onClick={() => closeReviewForm(itemId)}
                              disabled={isSubmitting}
                              className="btn-base btn-outline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {message?.type === 'success' && (
                        <p className="status-message status-success mt-5">{message.text}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="metric-tile mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-[rgba(2,2,2,0.7)]">Total</span>
                  <span className="text-2xl font-semibold text-[var(--color-primary)]">
                    ${formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsPage;
