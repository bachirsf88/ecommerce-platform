import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.role === 'admin') {
      loadOrders();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <p className="mb-6">
          <Link to="/admin" className="bg-gray-100 px-4 py-2 rounded-md">
            Back to Admin Dashboard
          </Link>
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Orders</h1>
          <p className="text-sm text-gray-600">
            Review buyer orders and basic order information.
          </p>
        </div>

        {loading && <p className="mb-4">Loading orders...</p>}
        {error && <p className="mb-4">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className="border rounded bg-white p-4 shadow">No orders found.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-2">
            {orders.map((order) => (
              <div key={order.id} className="border rounded bg-white p-4 shadow">
                <p className="mb-4 font-bold">Order #{order.id}</p>
                <p className="mb-4">Buyer: {order.buyer?.name || 'Unknown buyer'}</p>
                <p className="mb-4">Status: {order.status || 'Unknown'}</p>
                <p className="mb-4">Payment Method: {order.payment_method || 'N/A'}</p>
                <p className="mb-4">Total: ${order.total ?? '0.00'}</p>
                <p>Items: {(order.items ?? []).length}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
