import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function SellerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSellerOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getSellerOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller orders.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadSellerOrders();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-2 items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-4">Seller Orders</h1>
            <p className="text-sm text-gray-600">View orders that include your products.</p>
          </div>
          <Link to="/seller/products" className="bg-gray-100 px-4 py-2 rounded-md">
            My Products
          </Link>
        </div>
      </div>

      {loading && <p className="mb-4">Loading seller orders...</p>}
      {error && <p className="mb-4">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="border rounded bg-white p-4 shadow">
          No orders found for your products yet.
        </p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div key={order.id} className="border rounded bg-white p-4 shadow">
              <h3 className="font-bold mb-4">Order #{order.id}</h3>
              <p className="mb-4">Buyer: {order.buyer?.name || 'Unknown buyer'}</p>
              <p className="mb-4">Status: {order.status || 'Unknown'}</p>
              <p className="mb-4">
                Payment Method: {order.payment_method || 'N/A'}
              </p>
              <p className="mb-4">My Total: ${order.seller_total ?? '0.00'}</p>
              <Link
                to={`/seller/orders/${order.id}`}
                className="bg-gray-100 px-4 py-2 rounded-md inline-block"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default SellerOrdersPage;
