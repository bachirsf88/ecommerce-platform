import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  status: '',
};

function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWithdrawals = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getWithdrawals(filters);
        setWithdrawals(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load withdrawal requests.');
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawals();
  }, [filters]);

  const statusCounts = useMemo(() => ({
    pending: withdrawals.filter((withdrawal) => withdrawal.status === 'pending').length,
    approved: withdrawals.filter((withdrawal) => withdrawal.status === 'approved').length,
    rejected: withdrawals.filter((withdrawal) => withdrawal.status === 'rejected').length,
  }), [withdrawals]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const handleStatusUpdate = async (withdrawalId, action) => {
    setActionLoadingId(String(withdrawalId));
    setError('');

    try {
      const updatedWithdrawal = action === 'approve'
        ? await adminService.approveWithdrawal(withdrawalId)
        : await adminService.rejectWithdrawal(withdrawalId);

      setWithdrawals((previousWithdrawals) =>
        previousWithdrawals.map((withdrawal) =>
          String(withdrawal.id) === String(withdrawalId) ? updatedWithdrawal : withdrawal
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update withdrawal status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Withdrawals</span>
        <h1 className="section-title mt-4">Withdrawal Requests Management</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Review seller payout requests, verify destination details, and approve or reject requests from a finance-first admin workflow.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Pending</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{statusCounts.pending}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Approved</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{statusCounts.approved}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Rejected</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{statusCounts.rejected}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div>
            <label htmlFor="withdrawal-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search requests
            </label>
            <input
              id="withdrawal-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by seller, email, or payout method"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="withdrawal-status" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Status
            </label>
            <select
              id="withdrawal-status"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
              className="text-input"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading withdrawal requests...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        withdrawals.length === 0 ? (
          <div className="empty-state">No withdrawal requests match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {withdrawals.map((withdrawal) => {
              const isBusy = actionLoadingId === String(withdrawal.id);

              return (
                <article key={withdrawal.id} className="data-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl leading-none">{withdrawal.seller?.name || 'Unknown seller'}</p>
                      <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                        {withdrawal.seller?.email || 'No email'} · {withdrawal.seller?.store_name || 'Store not set'}
                      </p>
                    </div>
                    <span className="status-pill">{withdrawal.status}</span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                    <p>Amount: {formatCurrency(withdrawal.amount)}</p>
                    <p>Payout Method: {withdrawal.payout_method}</p>
                    <p>Destination: {withdrawal.destination_account}</p>
                    <p>Requested: {formatDateTime(withdrawal.created_at)}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-soft)]">
                    Notes: {withdrawal.notes || 'No extra notes provided.'}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy || withdrawal.status === 'approved'}
                      onClick={() => handleStatusUpdate(withdrawal.id, 'approve')}
                      className={withdrawal.status === 'approved' ? 'btn-base btn-secondary' : 'btn-base btn-primary'}
                    >
                      {withdrawal.status === 'approved' ? 'Approved' : isBusy ? 'Updating...' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || withdrawal.status === 'rejected'}
                      onClick={() => handleStatusUpdate(withdrawal.id, 'reject')}
                      className={withdrawal.status === 'rejected' ? 'btn-base btn-secondary' : 'btn-base btn-outline'}
                    >
                      {withdrawal.status === 'rejected' ? 'Rejected' : isBusy ? 'Updating...' : 'Reject'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminWithdrawalsPage;
