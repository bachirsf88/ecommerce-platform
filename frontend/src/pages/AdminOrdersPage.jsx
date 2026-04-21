import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  status: '',
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getOrders(filters);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [filters]);

  const orderCounts = useMemo(() => ({
    pending: orders.filter((order) => order.status === 'pending').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  }), [orders]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Orders</span>
        <h1 className="section-title mt-4">Orders Management</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Monitor the marketplace order pipeline with business-oriented filters and order summaries, without borrowing seller fulfillment controls into the admin view.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Pending</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{orderCounts.pending}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Delivered</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{orderCounts.delivered}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Cancelled</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{orderCounts.cancelled}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div>
            <label htmlFor="order-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search orders
            </label>
            <input
              id="order-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by order, buyer, or seller"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="order-status" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Status
            </label>
            <select
              id="order-status"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
              className="text-input"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading orders...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        orders.length === 0 ? (
          <div className="empty-state">No orders match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {orders.map((order) => (
              <article key={order.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">Order #{order.id}</p>
                    <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                      Buyer: {order.buyer?.name || 'Unknown buyer'}
                    </p>
                  </div>
                  <span className="status-pill">{order.status || 'Unknown'}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                  <p>Total: {formatCurrency(order.total)}</p>
                  <p>Payment: {order.payment_method || 'N/A'}</p>
                  <p>Items: {order.item_count ?? 0}</p>
                  <p>Created: {formatDateTime(order.created_at)}</p>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4 text-sm text-[var(--color-text-soft)]">
                  <p>Shipping Address: {order.shipping_address || 'N/A'}</p>
                  <p className="mt-2">Seller Coverage: {(order.seller_names ?? []).join(', ') || 'No sellers attached'}</p>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminOrdersPage;
