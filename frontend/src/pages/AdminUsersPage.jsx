import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
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

    if (!authLoading && user?.role === 'admin') {
      loadUsers();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="mb-6">
          <Link to="/admin" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium">
            Back to Admin Dashboard
          </Link>
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">All Users</h1>
          <p className="text-sm text-gray-600">
            Review all registered users and their current roles.
          </p>
        </div>

        {loading && <p className="mb-4">Loading users...</p>}
        {error && <p className="mb-4">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p className="border rounded bg-white p-4 shadow">No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="flex flex-col gap-2">
            {users.map((item) => (
              <div key={item.id} className="border rounded bg-white p-4 shadow">
                <p className="mb-4 font-bold">{item.name}</p>
                <p className="mb-4">Email: {item.email}</p>
                <p className="mb-4">Role: {item.role}</p>
                <p>Seller Status: {item.seller_status || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default AdminUsersPage;
