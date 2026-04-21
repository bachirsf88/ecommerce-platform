import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const sectionLinks = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/sellers', label: 'Sellers' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/withdrawals', label: 'Withdrawals' },
];

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metricCards = useMemo(() => {
    const metrics = dashboard?.metrics ?? {};

    return [
      { key: 'total_users', label: 'Total Users', value: metrics.total_users ?? 0 },
      { key: 'total_buyers', label: 'Total Buyers', value: metrics.total_buyers ?? 0 },
      { key: 'total_sellers', label: 'Total Sellers', value: metrics.total_sellers ?? 0 },
      { key: 'pending_sellers', label: 'Pending Sellers', value: metrics.pending_sellers ?? 0 },
      { key: 'approved_sellers', label: 'Approved Sellers', value: metrics.approved_sellers ?? 0 },
      { key: 'total_products', label: 'Total Products', value: metrics.total_products ?? 0 },
      { key: 'total_orders', label: 'Total Orders', value: metrics.total_orders ?? 0 },
      { key: 'delivered_orders', label: 'Delivered Orders', value: metrics.delivered_orders ?? 0 },
      { key: 'pending_orders', label: 'Pending Orders', value: metrics.pending_orders ?? 0 },
      { key: 'cancelled_orders', label: 'Cancelled Orders', value: metrics.cancelled_orders ?? 0 },
      { key: 'total_reviews', label: 'Total Reviews', value: metrics.total_reviews ?? 0 },
      { key: 'pending_withdrawal_requests', label: 'Pending Withdrawals', value: metrics.pending_withdrawal_requests ?? 0 },
    ];
  }, [dashboard]);

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="section-label">Admin Dashboard</span>
            <h1 className="section-title mt-5">Marketplace health overview</h1>
            <p className="subtle-copy mt-4 max-w-3xl text-sm">
              Keep the marketplace moving from one management-focused workspace. Review growth, moderation pressure, order flow, and payout queues before moving into the deeper admin sections.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sectionLinks.map((item) => (
              <Link key={item.to} to={item.to} className="btn-base btn-outline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading dashboard...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <article key={card.key} className="surface-card p-5">
                <span className="section-label">{card.label}</span>
                <p className="font-display mt-4 text-[2.4rem] leading-none text-[var(--color-text)]">
                  {card.value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="surface-card-strong p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="section-label">Seller Activity</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    Recent registrations
                  </h2>
                </div>
                <Link to="/admin/sellers" className="btn-base btn-outline">
                  Open
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_seller_registrations ?? []).length === 0 ? (
                  <div className="empty-state">Seller registrations will appear here.</div>
                ) : (
                  dashboard.recent_seller_registrations.map((seller) => (
                    <div key={seller.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">{seller.name}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{seller.email}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                            {seller.store?.store_name || 'Store pending details'}
                          </p>
                        </div>
                        <span className="status-pill">{seller.seller_status || 'N/A'}</span>
                      </div>
                      <p className="mt-3 text-xs text-[var(--color-text-faint)]">
                        Added {formatDateTime(seller.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="surface-card-strong p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="section-label">Order Activity</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    Recent orders
                  </h2>
                </div>
                <Link to="/admin/orders" className="btn-base btn-outline">
                  Open
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_orders ?? []).length === 0 ? (
                  <div className="empty-state">Orders will appear here as buyers start purchasing.</div>
                ) : (
                  dashboard.recent_orders.map((order) => (
                    <div key={order.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">Order #{order.id}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{order.buyer?.name || 'Unknown buyer'}</p>
                        </div>
                        <span className="status-pill">{order.status}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-soft)]">
                        <p>Total: {formatCurrency(order.total)}</p>
                        <p>Items: {order.item_count}</p>
                        <p>{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="surface-card-strong p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="section-label">Finance Activity</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    Recent withdrawals
                  </h2>
                </div>
                <Link to="/admin/withdrawals" className="btn-base btn-outline">
                  Open
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_withdrawal_requests ?? []).length === 0 ? (
                  <div className="empty-state">Withdrawal requests will appear here once sellers submit them.</div>
                ) : (
                  dashboard.recent_withdrawal_requests.map((withdrawal) => (
                    <div key={withdrawal.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">{withdrawal.seller?.name || 'Unknown seller'}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{withdrawal.seller?.store_name || 'Store not set'}</p>
                        </div>
                        <span className="status-pill">{withdrawal.status}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-soft)]">
                        <p>Amount: {formatCurrency(withdrawal.amount)}</p>
                        <p>Method: {withdrawal.payout_method}</p>
                        <p>{formatDateTime(withdrawal.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;
