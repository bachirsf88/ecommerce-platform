import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadOrders();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-8 text-sm text-slate-600 shadow-sm">
          Checking user...
        </div>
      </div>
    );
  }

  if (user?.role !== 'buyer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="flex gap-2 items-center justify-between flex-wrap">
            <div>
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                My Orders
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Your Orders
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review your completed checkouts and open an order to see full details.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/favorites" className="bg-gray-100 px-4 py-2 rounded-md">
                Favorites
              </Link>
              <Link to="/cart" className="bg-gray-100 px-4 py-2 rounded-md">
                Cart
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading orders...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            You do not have any orders yet.
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Order #{order.id}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Payment Method: {order.payment_method || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Status: <span className="capitalize">{order.status || 'Unknown'}</span>
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      Total: ${order.total ?? '0.00'}
                    </p>
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
