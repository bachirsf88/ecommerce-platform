import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';

function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCart();
    }
  }, [authLoading, user]);

  const handleUpdateItem = async (itemId, quantity) => {
    setActionLoading(true);
    setError('');

    try {
      const data = await cartService.updateCartItem(itemId, {
        quantity: Number(quantity),
      });

      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setActionLoading(true);
    setError('');

    try {
      const data = await cartService.removeCartItem(itemId);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove cart item.');
    } finally {
      setActionLoading(false);
    }
  };

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
                Buyer Cart
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Your Cart
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review your items, update quantities, or remove products before checkout.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/favorites" className="bg-gray-100 px-4 py-2 rounded-md">
                Favorites
              </Link>
              <Link to="/orders" className="bg-gray-100 px-4 py-2 rounded-md">
                Orders
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading cart...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (!cart || cart.items.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            Your cart is empty.
          </div>
        )}

        {!loading && !error && cart && cart.items.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onRemove={handleRemoveItem}
                  loading={actionLoading}
                />
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-base font-medium text-slate-700">Total</span>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    ${cart.total}
                  </p>
                </div>

                <Link
                  to="/checkout"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
