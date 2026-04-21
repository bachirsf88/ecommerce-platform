import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  status: '',
};

function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSellers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getSellers(filters);
        setSellers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sellers.');
      } finally {
        setLoading(false);
      }
    };

    loadSellers();
  }, [filters]);

  const statusCounts = useMemo(() => ({
    pending: sellers.filter((seller) => seller.seller_status === 'pending').length,
    approved: sellers.filter((seller) => seller.seller_status === 'approved').length,
    rejected: sellers.filter((seller) => seller.seller_status === 'rejected').length,
  }), [sellers]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const handleStatusUpdate = async (sellerId, action) => {
    setActionLoadingId(String(sellerId));
    setError('');

    try {
      const updatedSeller = action === 'approve'
        ? await adminService.approveSeller(sellerId)
        : await adminService.rejectSeller(sellerId);

      setSellers((previousSellers) =>
        previousSellers.map((seller) =>
          String(seller.id) === String(sellerId) ? updatedSeller : seller
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update seller status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Sellers</span>
        <h1 className="section-title mt-4">Seller Moderation</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Review seller registrations, inspect linked store information, and make clear approval or rejection decisions without leaving the admin workspace.
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
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_auto]">
          <div>
            <label htmlFor="seller-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search sellers
            </label>
            <input
              id="seller-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by seller, email, or store"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="seller-status" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Seller status
            </label>
            <select
              id="seller-status"
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

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading sellers...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        sellers.length === 0 ? (
          <div className="empty-state">No sellers match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {sellers.map((seller) => {
              const isBusy = actionLoadingId === String(seller.id);

              return (
                <article key={seller.id} className="data-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl leading-none">{seller.name}</p>
                      <p className="mt-2 text-sm text-[var(--color-text-soft)]">{seller.email}</p>
                    </div>
                    <span className="status-pill">{seller.seller_status || 'pending'}</span>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4 text-sm text-[var(--color-text-soft)]">
                      <p>Name: {seller.name}</p>
                      <p className="mt-2">Bio: {seller.bio || 'No bio provided.'}</p>
                      <p className="mt-2">Joined: {formatDateTime(seller.created_at)}</p>
                    </div>

                    <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4 text-sm text-[var(--color-text-soft)]">
                      <p>Store: {seller.store?.store_name || 'Store not set'}</p>
                      <p className="mt-2">Address: {seller.store?.store_address || 'N/A'}</p>
                      <p className="mt-2">Contact: {seller.store?.contact_email || seller.email}</p>
                      <p className="mt-2">Phone: {seller.store?.phone_number || seller.phone_number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy || seller.seller_status === 'approved'}
                      onClick={() => handleStatusUpdate(seller.id, 'approve')}
                      className={seller.seller_status === 'approved' ? 'btn-base btn-secondary' : 'btn-base btn-primary'}
                    >
                      {seller.seller_status === 'approved' ? 'Approved' : isBusy ? 'Updating...' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || seller.seller_status === 'rejected'}
                      onClick={() => handleStatusUpdate(seller.id, 'reject')}
                      className={seller.seller_status === 'rejected' ? 'btn-base btn-secondary' : 'btn-base btn-outline'}
                    >
                      {seller.seller_status === 'rejected' ? 'Rejected' : isBusy ? 'Updating...' : 'Reject'}
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

export default AdminSellersPage;
