import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  status: 'pending',
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getProducts(filters);
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const productCounts = useMemo(() => ({
    pending: products.filter((product) => product.status === 'pending').length,
    approved: products.filter((product) => product.status === 'approved').length,
    rejected: products.filter((product) => product.status === 'rejected').length,
    inactive: products.filter((product) => product.status === 'inactive').length,
  }), [products]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const handleModerationAction = async (productId, action) => {
    setActionLoadingId(String(productId));
    setError('');

    try {
      if (action === 'approve') {
        await adminService.approveProduct(productId);
      } else {
        await adminService.rejectProduct(productId);
      }

      const refreshedProducts = await adminService.getProducts(filters);
      setProducts(refreshedProducts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product moderation status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Products</span>
        <h1 className="section-title mt-4">Products Management</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Review newly submitted listings, approve products that are ready for public visibility, and reject products that should stay hidden until corrected.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Pending In View</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{productCounts.pending}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Approved In View</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{productCounts.approved}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Rejected In View</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{productCounts.rejected}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Inactive In View</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{productCounts.inactive}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div>
            <label htmlFor="product-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by product, seller, or category"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="product-status" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Status
            </label>
            <select
              id="product-status"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
              className="text-input"
            >
              <option value="">All moderation statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
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

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading products...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        products.length === 0 ? (
          <div className="empty-state">No products match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => {
              const isBusy = actionLoadingId === String(product.id);
              const canApprove = product.status !== 'approved';
              const canReject = product.status !== 'rejected';

              return (
                <article key={product.id} className="data-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl leading-none">{product.name || 'Unnamed product'}</p>
                      <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                        Seller: {product.seller?.name || 'Unknown seller'}
                      </p>
                    </div>
                    <span className="status-pill">{product.status || 'Unknown'}</span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                    <p>Category: {product.category || 'Uncategorized'}</p>
                    <p>Price: {formatCurrency(product.price)}</p>
                    <p>Stock: {product.stock ?? 0}</p>
                    <p>Created: {formatDateTime(product.created_at)}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-soft)]">
                    {product.description || 'No product description provided.'}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {canApprove ? (
                      <button
                        type="button"
                        onClick={() => handleModerationAction(product.id, 'approve')}
                        disabled={isBusy}
                        className="btn-base btn-primary"
                      >
                        {isBusy ? 'Updating...' : 'Approve Product'}
                      </button>
                    ) : null}
                    {canReject ? (
                      <button
                        type="button"
                        onClick={() => handleModerationAction(product.id, 'reject')}
                        disabled={isBusy}
                        className="btn-base btn-outline"
                      >
                        {isBusy ? 'Updating...' : 'Reject Product'}
                      </button>
                    ) : null}
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

export default AdminProductsPage;
