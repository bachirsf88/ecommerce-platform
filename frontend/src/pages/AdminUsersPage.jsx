import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Users</span>
        <h1 className="section-title mt-4">All Users</h1>
        <p className="subtle-copy mt-3 text-sm">
          A focused user-management view without seller, product, or order shortcuts mixed into the same header.
        </p>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading users...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <div className="grid gap-3">
            {users.map((item) => (
              <div key={item.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">{item.name}</p>
                    <p className="mt-2 text-sm text-[rgba(2,2,2,0.62)]">{item.email}</p>
                  </div>
                  <span className="status-pill">{item.role}</span>
                </div>
                <p className="mt-4 text-sm text-[rgba(2,2,2,0.68)]">
                  Seller Status: {item.seller_status || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminUsersPage;
