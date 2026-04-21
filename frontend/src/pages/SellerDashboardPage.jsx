import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import sellerDashboardService from '../services/sellerDashboardService';
import { formatCurrency, formatShortDate } from '../utils/formatters';

const metricCards = [
  { key: 'total_products', label: 'Total Products' },
  { key: 'total_orders', label: 'Total Orders' },
  { key: 'low_stock_products', label: 'Low Stock Alerts' },
  { key: 'delivered_orders', label: 'Delivered Orders' },
  { key: 'pending_processing_orders', label: 'Pending / Processing' },
];

function SellerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await sellerDashboardService.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const overview = dashboard?.overview ?? {};
  const financialSummary = dashboard?.financial_summary ?? {};

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="section-label">Welcome</span>
            <h1 className="section-title mt-5">
              {dashboard?.store_name || 'Your seller studio'}
            </h1>
            <p className="subtle-copy mt-4 max-w-2xl text-sm">
              A calmer dashboard with a clearer reading order: overview first, metrics second, then recent activity and the few actions you actually need.
            </p>
          </div>

          <div className="surface-card p-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
              Quick Actions
            </p>
            <div className="mt-5 grid gap-3">
              <Link to="/seller/products/add" className="btn-base btn-primary w-full">
                Add Product
              </Link>
              <Link to="/seller/orders" className="btn-base btn-outline w-full">
                Review Orders
              </Link>
              <Link to="/seller/store" className="btn-base btn-outline w-full">
                Update Store Identity
              </Link>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading dashboard...</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metricCards.map((card) => (
              <article key={card.key} className="surface-card p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                  {card.label}
                </p>
                <p className="mt-4 font-display text-[2.6rem] leading-none text-[var(--color-text)]">
                  {overview[card.key] ?? 0}
                </p>
              </article>
            ))}
          </section>

          <section className="surface-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="section-label">Overview</span>
                <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                  Financial summary
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="metric-tile min-w-[13rem]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                    Delivered Revenue
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-[var(--color-text)]">
                    {formatCurrency(financialSummary.delivered_revenue)}
                  </p>
                </div>
                <div className="metric-tile min-w-[13rem]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                    Pending Revenue
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-[var(--color-text)]">
                    {formatCurrency(financialSummary.pending_revenue)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="surface-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="section-label">Recent Orders</span>
                  <h2 className="font-display mt-4 text-[2.2rem] leading-none text-[var(--color-text)]">
                    Latest activity
                  </h2>
                </div>
                <Link to="/seller/orders" className="btn-base btn-outline">
                  View Orders
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_orders ?? []).length === 0 ? (
                  <div className="empty-state">Recent orders will appear here once buyers start ordering your products.</div>
                ) : (
                  (dashboard?.recent_orders ?? []).map((order) => (
                    <article key={order.id} className="rounded-[1.35rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            Order #{order.id}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-faint)]">
                            {order.buyer_name || 'Unknown buyer'}
                          </p>
                        </div>
                        <span className="status-pill">{order.status}</span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-3">
                        <p>Total: {formatCurrency(order.seller_total)}</p>
                        <p>Items: {order.item_count ?? 0}</p>
                        <p>{formatShortDate(order.created_at)}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <section className="surface-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="section-label">Inventory Alerts</span>
                    <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                      Low stock
                    </h2>
                  </div>
                  <Link to="/seller/products" className="btn-base btn-outline">
                    Manage
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {(dashboard?.low_stock_alerts ?? []).length === 0 ? (
                    <div className="empty-state">No low-stock products need attention right now.</div>
                  ) : (
                    (dashboard?.low_stock_alerts ?? []).map((product) => (
                      <article key={product.id} className="rounded-[1.25rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{product.name}</p>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[var(--color-text-soft)]">
                          <span>{product.stock} left</span>
                          <span>{product.status}</span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="surface-card p-6">
                <span className="section-label">Insights</span>
                <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                  Small updates
                </h2>
                <div className="mt-5 space-y-3">
                  {(dashboard?.insights ?? []).map((insight) => (
                    <div key={insight} className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-sm leading-7 text-[var(--color-text-soft)]">
                      {insight}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default SellerDashboardPage;
