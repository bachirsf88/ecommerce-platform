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
      <div className="page-shell">
        <div className="page-container max-w-5xl surface-card p-8 text-sm text-[rgba(2,2,2,0.62)]">
          Checking user...
        </div>
      </div>
    );
  }

  if (user?.role !== 'buyer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-shell">
      <div className="page-container max-w-5xl">
        <div className="surface-card-strong mb-8 px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="section-label">My Orders</span>
              <h1 className="section-title mt-4">Your Orders</h1>
              <p className="subtle-copy mt-2 text-sm">
                Follow each order from pending through delivery and open any order to see full details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/favorites" className="btn-base btn-outline">
                Favorites
              </Link>
              <Link to="/cart" className="btn-base btn-outline">
                Cart
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">
            Loading orders...
          </div>
        )}

        {error && (
          <div className="status-message status-error mb-6">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">
            You do not have any orders yet.
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="data-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="font-display text-3xl leading-none text-[var(--color-primary)]">
                      Order #{order.id}
                    </h2>
                    <p className="text-sm text-[rgba(2,2,2,0.62)]">
                      Payment Method: {order.payment_method || 'N/A'}
                    </p>
                    <p className="text-sm text-[rgba(2,2,2,0.62)]">
                      Status: <span className="capitalize">{order.status || 'Unknown'}</span>
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-primary)]">
                      Total: ${order.total ?? '0.00'}
                    </p>
                  </div>

                  <Link to={`/orders/${order.id}`} className="btn-base btn-primary">
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
