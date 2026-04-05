import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';

const isRenderableImageSrc = (value) =>
  typeof value === 'string' && /^(https?:\/\/|data:|\/)/i.test(value.trim());

function CartProductImage({ item }) {
  const imageValue = item.product?.image;

  if (isRenderableImageSrc(imageValue)) {
    return (
      <img
        src={imageValue}
        alt={item.product?.name || 'Cart product'}
        className="h-full w-full object-cover object-center"
      />
    );
  }

  if (imageValue) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(240,232,224,0.92),rgba(226,216,206,0.84))] p-4">
        <p className="break-all text-center text-[10px] leading-4 text-[rgba(2,2,2,0.5)]">
          {imageValue}
        </p>
      </div>
    );
  }

  return (
    <img
      src={heroImage}
      alt={item.product?.name || 'Cart product'}
      className="h-full w-full object-cover object-center"
    />
  );
}

function CartRow({ item, loading, onUpdate, onRemove }) {
  const handleDecrease = () => {
    if (Number(item.quantity) <= 1) {
      return;
    }

    onUpdate(item.id, Number(item.quantity) - 1);
  };

  const handleIncrease = () => {
    onUpdate(item.id, Number(item.quantity) + 1);
  };

  const handleRemove = () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this item from the cart?'
    );

    if (!confirmed) {
      return;
    }

    onRemove(item.id);
  };

  return (
    <article className="border-t border-[rgba(138,129,124,0.12)] pt-8 first:border-t-0 first:pt-0">
      <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-start">
        <div className="overflow-hidden rounded-[0.8rem] bg-[linear-gradient(160deg,rgba(239,231,223,0.84),rgba(226,215,205,0.76))]">
          <div className="aspect-[0.8] overflow-hidden">
            <CartProductImage item={item} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-[2rem] leading-[0.95] text-[var(--color-primary)]">
                {item.product?.name || 'Unnamed product'}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[rgba(138,129,124,0.88)]">
                {item.product?.category || 'Artisan collection'} · Handmade marketplace selection
              </p>
            </div>

            <p className="whitespace-nowrap text-[1rem] text-[rgba(2,2,2,0.72)]">
              ${item.unit_price}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(138,129,124,0.82)] hover:text-[var(--color-primary)]"
            >
              Remove Item
            </button>

            <div className="grid grid-cols-[2.3rem_2.8rem_2.3rem] overflow-hidden rounded-full border border-[rgba(138,129,124,0.18)]">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={loading || Number(item.quantity) <= 1}
                className="bg-[rgba(255,253,249,0.72)] text-sm text-[var(--color-primary)] disabled:opacity-40"
              >
                −
              </button>
              <div className="flex items-center justify-center bg-white text-sm text-[var(--color-primary)]">
                {item.quantity}
              </div>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={loading}
                className="bg-[rgba(255,253,249,0.72)] text-sm text-[var(--color-primary)]"
              >
                +
              </button>
            </div>

            <p className="text-sm text-[rgba(138,129,124,0.86)]">
              Subtotal <span className="ml-2 text-[var(--color-primary)]">${item.subtotal}</span>
            </p>
          </div>
        </div>

        <div className="hidden md:block" />
      </div>
    </article>
  );
}

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
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8 text-sm text-[rgba(2,2,2,0.62)]">
            Checking user...
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'buyer') {
    return <Navigate to="/" replace />;
  }

  const itemCount = cart?.items?.length ?? 0;

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(188,184,177,0.88)]">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-secondary)]">Your Cart</span>
          </div>

          <div className="mt-7">
            <h1 className="font-display text-[3.4rem] leading-[0.94] text-[var(--color-primary)] sm:text-[4.4rem]">
              Shopping Bag
            </h1>
          </div>
        </section>

        {loading && (
          <div className="mt-10 rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8 text-sm text-[rgba(2,2,2,0.62)]">
            Loading cart...
          </div>
        )}

        {error && (
          <div className="status-message status-error mt-8">
            {error}
          </div>
        )}

        {!loading && !error && (!cart || itemCount === 0) && (
          <div className="mt-10 rounded-[1.5rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.56)] p-10">
            <p className="text-lg text-[rgba(2,2,2,0.72)]">Your cart is empty.</p>
            <Link
              to="/products"
              className="mt-6 inline-block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {!loading && !error && cart && itemCount > 0 && (
          <section className="pt-10">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
              <div>
                <div className="space-y-8">
                  {cart.items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      onUpdate={handleUpdateItem}
                      onRemove={handleRemoveItem}
                      loading={actionLoading}
                    />
                  ))}
                </div>

                <div className="mt-12">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.84)] hover:text-[var(--color-primary)]"
                  >
                    <span className="text-base">←</span>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <aside className="rounded-[1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,251,247,0.66)] p-7 shadow-[0_14px_32px_rgba(2,2,2,0.04)]">
                  <h2 className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                    Order Summary
                  </h2>

                  <div className="mt-8 space-y-4 text-sm text-[rgba(138,129,124,0.86)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>
                      <span className="text-[var(--color-primary)]">${cart.total}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Estimated Shipping</span>
                      <span className="text-[rgba(138,129,124,0.72)]">Calculated later</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Tax</span>
                      <span className="text-[rgba(138,129,124,0.72)]">At checkout</span>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-[rgba(138,129,124,0.14)] pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-lg text-[var(--color-primary)]">Total</span>
                      <span className="font-display text-[2.2rem] leading-none text-[var(--color-primary)]">
                        ${cart.total}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[rgba(188,184,177,0.88)]">
                      Promotional Code
                    </p>
                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        className="border-0 bg-[rgba(255,255,255,0.82)] px-4 py-3 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--color-primary)] outline-none placeholder:text-[rgba(188,184,177,0.82)]"
                      />
                      <button
                        type="button"
                        className="bg-[rgba(241,235,229,0.92)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(138,129,124,0.92)]"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-base btn-primary mt-8 w-full rounded-[0.35rem]"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="mt-4 text-center text-[0.62rem] text-[rgba(138,129,124,0.78)]">
                    Secure encrypted checkout
                  </p>
                </aside>

                <div className="rounded-[1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,253,249,0.4)] p-6">
                  <p className="font-display text-[1.2rem] leading-7 text-[rgba(2,2,2,0.72)]">
                    “Thoughtful pieces deserve a checkout experience that feels calm, secure, and carefully considered.”
                  </p>
                  <div className="mt-5 inline-flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(138,129,124,0.2)] text-[10px]">
                      ✓
                    </span>
                    Trusted Handmade Marketplace
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="mt-20 bg-[linear-gradient(180deg,#151210,#0d0b0a)] pb-10 pt-16 text-[#f6f1eb]">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                GradShop
              </p>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[rgba(255,250,247,0.68)]">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Discover
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Home</Link>
                  <Link to="/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Products</Link>
                  <Link to="/favorites" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Favorites</Link>
                </div>
              </div>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Client Care
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/cart" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Cart</Link>
                  <Link to="/checkout" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Checkout</Link>
                  <Link to="/orders" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Orders</Link>
                </div>
              </div>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Assurance
                </p>
                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-6 text-[rgba(255,250,247,0.68)]">
                    Secure checkout and thoughtfully presented products from trusted marketplace sellers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CartPage;
