import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { formatDateTime } from '../utils/formatters';

const initialFilters = {
  search: '',
  role: '',
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getUsers(filters);
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [filters]);

  const roleCounts = useMemo(() => ({
    buyers: users.filter((user) => user.role === 'buyer').length,
    sellers: users.filter((user) => user.role === 'seller').length,
    admins: users.filter((user) => user.role === 'admin').length,
  }), [users]);

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
        <span className="section-label">Users</span>
        <h1 className="section-title mt-4">Users Management</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Review account coverage across the marketplace, search by name or email, and keep the user directory separate from seller moderation or storefront operations.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Buyers</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{roleCounts.buyers}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Sellers</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{roleCounts.sellers}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Admins</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{roleCounts.admins}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div>
            <label htmlFor="user-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Search users
            </label>
            <input
              id="user-search"
              type="search"
              value={draftFilters.search}
              onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by name or email"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="user-role" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              Role
            </label>
            <select
              id="user-role"
              value={draftFilters.role}
              onChange={(event) => setDraftFilters((current) => ({ ...current, role: event.target.value }))}
              className="text-input"
            >
              <option value="">All roles</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
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

      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading users...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        users.length === 0 ? (
          <div className="empty-state">No users match the current filters.</div>
        ) : (
          <div className="grid gap-3">
            {users.map((user) => (
              <article key={user.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">{user.name}</p>
                    <p className="mt-2 text-sm text-[var(--color-text-soft)]">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="status-pill">{user.role}</span>
                    {user.role === 'seller' ? <span className="status-pill">{user.seller_status || 'pending'}</span> : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                  <p>Phone: {user.phone_number || 'N/A'}</p>
                  <p>Created: {formatDateTime(user.created_at)}</p>
                  <p>Store: {user.store?.store_name || 'N/A'}</p>
                  <p>Store Contact: {user.store?.contact_email || 'N/A'}</p>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminUsersPage;
