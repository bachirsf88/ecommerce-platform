import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

function SellerOrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getSellerOrderById(id);
        setOrder(data);
        setStatus(data?.status || 'pending');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller order.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = await orderService.updateSellerOrderStatus(id, status);
      setOrder(data);
      setStatus(data?.status || status);
      setMessage('Order status updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading seller order details...</div>;
  }

  if (!order && !error) {
    return <div className="empty-state">Order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="section-label">Order Detail</span>
          <h1 className="section-title mt-4">Order #{order?.id}</h1>
        </div>
        <Link to="/seller/orders" className="btn-base btn-outline">
          Back to Orders
        </Link>
      </div>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {message ? <div className="status-message status-success">{message}</div> : null}

      {order ? (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-6">
            <div className="surface-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">Buyer</p>
                  <p className="mt-2 text-sm text-[var(--color-primary)]">{order.buyer?.name || 'Unknown buyer'}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">Order Date</p>
                  <p className="mt-2 text-sm text-[var(--color-primary)]">{formatDateTime(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">Payment Method</p>
                  <p className="mt-2 text-sm text-[var(--color-primary)]">{order.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">Seller Total</p>
                  <p className="mt-2 text-sm text-[var(--color-primary)]">{formatCurrency(order.seller_total)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">Shipping Address</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-primary)]">{order.shipping_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="section-label">Order Items</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">Relevant items</h2>
                </div>
                <span className="status-pill">{order.status}</span>
              </div>

              <div className="mt-6 space-y-4">
                {(order.items ?? []).map((item) => (
                  <article key={item.id} className="rounded-[1.35rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.62)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-primary)]">
                          {item.product?.name || 'Unnamed product'}
                        </p>
                        <p className="mt-1 text-sm text-[rgba(88,78,72,0.76)]">
                          Quantity: {item.quantity ?? 0}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-[rgba(56,48,43,0.76)]">
                      Unit price: {formatCurrency(item.unit_price)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <form onSubmit={handleStatusUpdate} className="surface-card-strong p-6">
              <span className="section-label">Status</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
                Update order
              </h2>
              <div className="mt-6">
                <label htmlFor="status" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                  Order Status
                </label>
                <select id="status" value={status} onChange={(event) => setStatus(event.target.value)} className="text-input">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-base btn-primary mt-6 w-full">
                {saving ? 'Updating...' : 'Save Status'}
              </button>
            </form>

            <div className="surface-card p-6">
              <span className="section-label">Customer</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
                Buyer details
              </h2>
              <div className="mt-5 space-y-3 text-sm text-[rgba(56,48,43,0.82)]">
                <p>Name: {order.buyer?.name || 'Unknown buyer'}</p>
                <p>Full name: {order.full_name || 'N/A'}</p>
                <p>Phone: {order.phone || 'N/A'}</p>
                <p>Country: {order.country || 'N/A'}</p>
                <p>State: {order.state || 'N/A'}</p>
                <p>Municipality: {order.municipality || 'N/A'}</p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default SellerOrderDetailsPage;
