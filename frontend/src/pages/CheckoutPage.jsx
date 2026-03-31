import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    payment_method: '',
    shipping_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await orderService.checkout(formData);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-8 text-sm text-slate-600 shadow-sm">
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex gap-2 items-center justify-between flex-wrap">
          <Link
            to="/cart"
            className="bg-gray-100 px-4 py-2 rounded-md"
          >
            Back to Cart
          </Link>
          <div className="flex gap-2">
            <Link to="/favorites" className="bg-gray-100 px-4 py-2 rounded-md">
              Favorites
            </Link>
            <Link to="/orders" className="bg-gray-100 px-4 py-2 rounded-md">
              Orders
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Checkout
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Complete Your Order
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your payment method and shipping address to place the order.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="payment_method"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Payment Method
              </label>
              <input
                id="payment_method"
                name="payment_method"
                type="text"
                value={formData.payment_method}
                onChange={handleChange}
                placeholder="Cash on delivery"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="shipping_address"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Shipping Address
              </label>
              <textarea
                id="shipping_address"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                rows="4"
                placeholder="Enter your full shipping address"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
