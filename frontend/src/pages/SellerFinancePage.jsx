import { useEffect, useState } from 'react';
import sellerFinanceService from '../services/sellerFinanceService';
import { formatCurrency, formatShortDate } from '../utils/formatters';

function SellerFinancePage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await sellerFinanceService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load finance overview.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const summary = overview?.summary ?? {};
  const monthlyOverview = overview?.monthly_overview ?? [];
  const recentTransactions = overview?.recent_transactions ?? [];

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <span className="section-label">Finance Overview</span>
        <h1 className="section-title mt-5">Finance</h1>
        <p className="subtle-copy mt-4 max-w-2xl text-sm">
          Review available balance, delivered-order earnings, and withdrawal activity in one place.
        </p>
      </section>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading finance overview...</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="surface-card p-5">
              <p className="page-kicker text-[0.62rem]">
                Available Balance
              </p>
              <p className="mt-4 font-display text-[2.4rem] leading-none text-[var(--color-primary)]">
                {formatCurrency(summary.available_balance)}
              </p>
            </article>
            <article className="surface-card p-5">
              <p className="page-kicker text-[0.62rem]">
                Lifetime Earnings
              </p>
              <p className="mt-4 font-display text-[2.4rem] leading-none text-[var(--color-primary)]">
                {formatCurrency(summary.lifetime_earnings)}
              </p>
            </article>
            <article className="surface-card p-5">
              <p className="page-kicker text-[0.62rem]">
                Pending Withdrawals
              </p>
              <p className="mt-4 font-display text-[2.4rem] leading-none text-[var(--color-primary)]">
                {formatCurrency(summary.pending_withdrawals)}
              </p>
            </article>
            <article className="surface-card p-5">
              <p className="page-kicker text-[0.62rem]">
                Approved Withdrawals
              </p>
              <p className="mt-4 font-display text-[2.4rem] leading-none text-[var(--color-primary)]">
                {formatCurrency(summary.approved_withdrawals)}
              </p>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card p-6">
              <span className="section-label">Monthly View</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
                Earnings rhythm
              </h2>
              <div className="mt-6 space-y-4">
                {monthlyOverview.map((entry) => (
                  <div key={entry.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-soft)]">
                      <span>{entry.label}</span>
                      <span>{formatCurrency(entry.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(188,184,177,0.24)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#8a817c,#736b66)]"
                        style={{
                          width: `${Math.min(100, Number(entry.amount ?? 0) > 0 ? (Number(entry.amount) / Math.max(...monthlyOverview.map((item) => Number(item.amount ?? 0)), 1)) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <span className="section-label">Transactions</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
                Recent activity
              </h2>
              <div className="mt-6 space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="empty-state">Delivered orders and withdrawal requests will appear here.</div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <article key={transaction.id} className="soft-panel p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-primary)]">{transaction.title}</p>
                          <p className="page-kicker mt-1 text-[0.68rem]">
                            {formatShortDate(transaction.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${transaction.direction === 'credit' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-primary)]'}`}>
                            {transaction.direction === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="page-kicker mt-1 text-[0.68rem]">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    </article>
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

export default SellerFinancePage;
