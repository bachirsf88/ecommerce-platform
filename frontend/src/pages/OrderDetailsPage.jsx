import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function OrderDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadOrder();
    }
  }, [authLoading, id, user]);

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
        <div className="mb-6 flex gap-2 items-center justify-between flex-wrap">
          <Link
            to="/orders"
            className="bg-gray-100 px-4 py-2 rounded-md"
          >
            Back to My Orders
          </Link>
          <div className="flex gap-2">
            <Link to="/favorites" className="bg-gray-100 px-4 py-2 rounded-md">
              Favorites
            </Link>
            <Link to="/cart" className="bg-gray-100 px-4 py-2 rounded-md">
              Cart
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading order details...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && !order && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            Order not found.
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Order Details
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Order #{order.id}
              </h1>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                    {order.status || 'Unknown'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Payment Method
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {order.payment_method || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Shipping Address
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {order.shipping_address || 'No shipping address available.'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900">Order Items</h2>

              <div className="mt-6 space-y-4">
                {(order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.product?.name || 'Unnamed product'}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>Quantity: {item.quantity ?? 0}</p>
                      <p>Unit Price: ${item.unit_price ?? '0.00'}</p>
                      <p>Subtotal: ${item.subtotal ?? '0.00'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-slate-700">Total</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    ${order.total ?? '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsPage;
