import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminOrdersPage() {
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

    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Orders</span>
        <h1 className="section-title mt-4">Marketplace Orders</h1>
        <p className="subtle-copy mt-3 text-sm">
          A dedicated order-management view with no unrelated product or user controls in the page header.
        </p>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading orders...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        orders.length === 0 ? (
          <div className="empty-state">No orders found.</div>
        ) : (
          <div className="grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">Order #{order.id}</p>
                    <p className="mt-2 text-sm text-[rgba(2,2,2,0.62)]">
                      Buyer: {order.buyer?.name || 'Unknown buyer'}
                    </p>
                  </div>
                  <span className="status-pill">{order.status || 'Unknown'}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[rgba(2,2,2,0.68)] sm:grid-cols-3">
                  <p>Payment Method: {order.payment_method || 'N/A'}</p>
                  <p>Total: ${order.total ?? '0.00'}</p>
                  <p>Items: {(order.items ?? []).length}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminOrdersPage;
