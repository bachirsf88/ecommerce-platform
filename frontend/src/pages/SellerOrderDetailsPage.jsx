import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function SellerOrderDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSellerOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await orderService.getSellerOrderById(id);
        setOrder(data);
        setStatus(data?.status || 'pending');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller order.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadSellerOrder();
    }
  }, [authLoading, id, user]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = await orderService.updateSellerOrderStatus(id, status);
      setOrder(data);
      setStatus(data?.status || status);
      setMessage('Order status updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex gap-2 items-center justify-between flex-wrap">
        <Link to="/seller/orders" className="bg-gray-100 px-4 py-2 rounded-md">
          Back to Seller Orders
        </Link>
        <Link to="/seller/products" className="bg-gray-100 px-4 py-2 rounded-md">
          My Products
        </Link>
      </div>

      {loading && <p className="mb-4">Loading seller order details...</p>}
      {error && <p className="mb-4">{error}</p>}

      {!loading && !error && !order && (
        <p className="border rounded bg-white p-4 shadow">Order not found.</p>
      )}

      {!loading && !error && order && (
        <div>
          <div className="border rounded bg-white p-6 shadow mb-6">
            <h1 className="text-lg font-bold mb-4">Order #{order.id}</h1>
            <p className="mb-4">Buyer: {order.buyer?.name || 'Unknown buyer'}</p>
            <p className="mb-4">
              Payment Method: {order.payment_method || 'N/A'}
            </p>
            <p className="mb-4">
              Shipping Address: {order.shipping_address || 'N/A'}
            </p>
            <p className="mb-4">Status: {order.status || 'Unknown'}</p>
            <p>My Total: ${order.seller_total ?? '0.00'}</p>
          </div>

          <form onSubmit={handleStatusUpdate} className="border rounded bg-white p-6 shadow mb-6">
            <div className="mb-4">
              <label htmlFor="status" className="mb-4 block">
                Update Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full border rounded p-4"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              {saving ? 'Updating...' : 'Update Status'}
            </button>
          </form>

          {message && <p className="mb-4">{message}</p>}

          <h2 className="text-lg font-bold mb-4">Relevant Order Items</h2>

          <div className="flex flex-col gap-2">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="border rounded bg-white p-4 shadow">
                <h3 className="font-bold mb-4">
                  {item.product?.name || 'Unnamed product'}
                </h3>
                <p className="mb-4">Quantity: {item.quantity ?? 0}</p>
                <p className="mb-4">Unit Price: ${item.unit_price ?? '0.00'}</p>
                <p>Subtotal: ${item.subtotal ?? '0.00'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default SellerOrderDetailsPage;
