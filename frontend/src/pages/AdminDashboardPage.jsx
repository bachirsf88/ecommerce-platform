import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n';
import adminService from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

function AdminDashboardPage() {
  const { t } = useTranslation();
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
        setError(err.response?.data?.message || t('adminDashboard.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [t]);

  const metricCards = useMemo(() => {
    const metrics = dashboard?.metrics ?? {};
    const sectionLinks = [
      { to: '/admin/users', label: t('common.users') },
      { to: '/admin/sellers', label: t('common.sellers') },
      { to: '/admin/products', label: t('common.products') },
      { to: '/admin/orders', label: t('common.orders') },
      { to: '/admin/reviews', label: t('common.reviews') },
      { to: '/admin/withdrawals', label: t('common.withdrawals') },
    ];

    return {
      sectionLinks,
      cards: [
        { key: 'total_users', label: t('adminDashboard.metrics.total_users'), value: metrics.total_users ?? 0 },
        { key: 'total_buyers', label: t('adminDashboard.metrics.total_buyers'), value: metrics.total_buyers ?? 0 },
        { key: 'total_sellers', label: t('adminDashboard.metrics.total_sellers'), value: metrics.total_sellers ?? 0 },
        { key: 'pending_sellers', label: t('adminDashboard.metrics.pending_sellers'), value: metrics.pending_sellers ?? 0 },
        { key: 'approved_sellers', label: t('adminDashboard.metrics.approved_sellers'), value: metrics.approved_sellers ?? 0 },
        { key: 'total_products', label: t('adminDashboard.metrics.total_products'), value: metrics.total_products ?? 0 },
        { key: 'total_orders', label: t('adminDashboard.metrics.total_orders'), value: metrics.total_orders ?? 0 },
        { key: 'delivered_orders', label: t('adminDashboard.metrics.delivered_orders'), value: metrics.delivered_orders ?? 0 },
        { key: 'pending_orders', label: t('adminDashboard.metrics.pending_orders'), value: metrics.pending_orders ?? 0 },
        { key: 'cancelled_orders', label: t('adminDashboard.metrics.cancelled_orders'), value: metrics.cancelled_orders ?? 0 },
        { key: 'total_reviews', label: t('adminDashboard.metrics.total_reviews'), value: metrics.total_reviews ?? 0 },
        { key: 'pending_withdrawal_requests', label: t('adminDashboard.metrics.pending_withdrawal_requests'), value: metrics.pending_withdrawal_requests ?? 0 },
      ],
    };
  }, [dashboard, t]);

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="section-label">{t('adminDashboard.sectionLabel')}</span>
            <h1 className="section-title mt-5">{t('adminDashboard.title')}</h1>
            <p className="subtle-copy mt-4 max-w-3xl text-sm">
              {t('adminDashboard.description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {metricCards.sectionLinks.map((item) => (
              <Link key={item.to} to={item.to} className="btn-base btn-outline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">{t('adminDashboard.loading')}</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.cards.map((card) => (
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
                  <span className="section-label">{t('adminDashboard.sellerActivity')}</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    {t('adminDashboard.recentRegistrations')}
                  </h2>
                </div>
                <Link to="/admin/sellers" className="btn-base btn-outline">
                  {t('common.open')}
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_seller_registrations ?? []).length === 0 ? (
                  <div className="empty-state">{t('adminDashboard.sellerEmpty')}</div>
                ) : (
                  dashboard.recent_seller_registrations.map((seller) => (
                    <div key={seller.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">{seller.name}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{seller.email}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                            {seller.store?.store_name || t('adminDashboard.storePending')}
                          </p>
                        </div>
                        <span className="status-pill">{seller.seller_status ? t(`common.status.${seller.seller_status}`) : t('adminDashboard.na')}</span>
                      </div>
                      <p className="mt-3 text-xs text-[var(--color-text-faint)]">
                        {t('adminDashboard.addedAt', { value: formatDateTime(seller.created_at) })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="surface-card-strong p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="section-label">{t('adminDashboard.orderActivity')}</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    {t('adminDashboard.recentOrders')}
                  </h2>
                </div>
                <Link to="/admin/orders" className="btn-base btn-outline">
                  {t('common.open')}
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_orders ?? []).length === 0 ? (
                  <div className="empty-state">{t('adminDashboard.ordersEmpty')}</div>
                ) : (
                  dashboard.recent_orders.map((order) => (
                    <div key={order.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">{t('adminDashboard.orderNumber', { id: order.id })}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{order.buyer?.name || t('common.unknownBuyer')}</p>
                        </div>
                        <span className="status-pill">{t(`common.status.${order.status}`)}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-soft)]">
                        <p>{t('adminDashboard.totalLabel', { value: formatCurrency(order.total) })}</p>
                        <p>{t('adminDashboard.itemsLabel', { count: order.item_count })}</p>
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
                  <span className="section-label">{t('adminDashboard.financeActivity')}</span>
                  <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                    {t('adminDashboard.recentWithdrawals')}
                  </h2>
                </div>
                <Link to="/admin/withdrawals" className="btn-base btn-outline">
                  {t('common.open')}
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {(dashboard?.recent_withdrawal_requests ?? []).length === 0 ? (
                  <div className="empty-state">{t('adminDashboard.withdrawalsEmpty')}</div>
                ) : (
                  dashboard.recent_withdrawal_requests.map((withdrawal) => (
                    <div key={withdrawal.id} className="data-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-text)]">{withdrawal.seller?.name || t('common.seller')}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-soft)]">{withdrawal.seller?.store_name || t('adminDashboard.storeNotSet')}</p>
                        </div>
                        <span className="status-pill">{t(`common.status.${withdrawal.status}`)}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-soft)]">
                        <p>{t('adminDashboard.amountLabel', { value: formatCurrency(withdrawal.amount) })}</p>
                        <p>{t('adminDashboard.methodLabel', { value: withdrawal.payout_method })}</p>
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
