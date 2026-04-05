import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { formatCurrency, formatShortDate } from '../utils/formatters';

function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getSellerOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        String(order.id).includes(normalizedQuery) ||
        order.buyer?.name?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <span className="section-label">Fulfillment</span>
        <h1 className="section-title mt-5">Orders</h1>
        <p className="subtle-copy mt-4 max-w-2xl text-sm">
          Track buyer orders connected to your catalog, review seller totals, and move fulfillment forward with clear status updates.
        </p>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <label htmlFor="order-search" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Search
            </label>
            <input id="order-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by order id or buyer" className="text-input" />
          </div>

          <div>
            <label htmlFor="order-status" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Status
            </label>
            <select id="order-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="text-input">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading seller orders...</div> : null}

      {!loading && !error ? (
        filteredOrders.length === 0 ? (
          <div className="empty-state">No seller orders match the current filters.</div>
        ) : (
          <section className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[rgba(241,235,229,0.65)] text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(112,100,92,0.82)]">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Buyer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Seller Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--color-border)] text-sm text-[rgba(56,48,43,0.82)]">
                      <td className="px-5 py-4 font-semibold text-[var(--color-primary)]">#{order.id}</td>
                      <td className="px-5 py-4">{order.buyer?.name || 'Unknown buyer'}</td>
                      <td className="px-5 py-4">{formatShortDate(order.created_at)}</td>
                      <td className="px-5 py-4">{formatCurrency(order.seller_total)}</td>
                      <td className="px-5 py-4">
                        <span className="status-pill">{order.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/seller/orders/${order.id}`} className="btn-base btn-outline">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      ) : null}
    </div>
  );
}

export default SellerOrdersPage;
