import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import fashionProductFallback from '../assets/fashion-product-fallback.jpg';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import cartService from '../services/cartService';
import { formatCurrency } from '../utils/formatters';
import { resolveProductPrimaryImage } from '../utils/media';
import { canAccessBuyerFeatures } from '../utils/roles';

function CartProductImage({ item }) {
  const imageSrc = resolveProductPrimaryImage(item.product, fashionProductFallback);

  return (
    <img
      src={imageSrc}
      alt={item.product?.name || 'Cart product'}
      className="h-full w-full object-cover object-center"
    />
  );
}

function CartRow({ item, loading, onUpdate, onRemove }) {
  const { t } = useTranslation();

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
    const confirmed = window.confirm(t('cart.removeConfirm'));

    if (!confirmed) {
      return;
    }

    onRemove(item.id);
  };

  return (
    <article className="border-t border-[var(--color-border-soft)] pt-8 first:border-t-0 first:pt-0">
      <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-start">
        <div className="overflow-hidden rounded-[0.8rem] bg-[linear-gradient(160deg,rgba(244,243,238,0.94),rgba(188,184,177,0.34))]">
          <div className="aspect-[0.8] overflow-hidden">
            <CartProductImage item={item} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-[2rem] leading-[0.95] text-[var(--color-primary)]">
                {item.product?.name || t('cart.unnamedProduct')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-faint)]">
                {item.product?.category || t('cart.artisanCollection')} · {t('cart.handmadeSelection')}
              </p>
            </div>

            <p className="whitespace-nowrap text-[1rem] text-[var(--color-text-soft)]">
              {formatCurrency(item.unit_price)}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] hover:text-[var(--color-primary)]"
            >
              {t('cart.removeItem')}
            </button>

            <div className="grid grid-cols-[2.3rem_2.8rem_2.3rem] overflow-hidden rounded-full border border-[var(--color-border)]">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={loading || Number(item.quantity) <= 1}
                className="bg-[rgba(244,243,238,0.92)] text-sm text-[var(--color-primary)] disabled:opacity-40"
              >
                −
              </button>
              <div className="flex items-center justify-center bg-[rgba(255,255,255,0.94)] text-sm text-[var(--color-primary)]">
                {item.quantity}
              </div>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={loading}
                className="bg-[rgba(244,243,238,0.92)] text-sm text-[var(--color-primary)]"
              >
                +
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-faint)]">
              {t('cart.subtotalLabel')} <span className="ml-2 text-[var(--color-primary)]">{formatCurrency(item.subtotal)}</span>
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
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('cart.loadFailed'));
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
      setError(err.response?.data?.message || t('cart.updateFailed'));
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
      setError(err.response?.data?.message || t('cart.removeFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="surface-card p-8 text-sm text-[var(--color-text-soft)]">
            {t('common.checkingUser')}
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessBuyerFeatures(user)) {
    return <Navigate to="/" replace />;
  }

  const itemCount = cart?.items?.length ?? 0;

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(188,184,177,0.88)]">
            <Link to="/">{t('common.home')}</Link>
            <span>/</span>
            <span className="text-[var(--color-secondary)]">{t('cart.breadcrumbCurrent')}</span>
          </div>

          <div className="mt-7">
            <h1 className="font-display text-[3.4rem] leading-[0.94] text-[var(--color-primary)] sm:text-[4.4rem]">
              {t('cart.title')}
            </h1>
          </div>
        </section>

        {loading && (
          <div className="surface-card mt-10 p-8 text-sm text-[var(--color-text-soft)]">
            {t('cart.loading')}
          </div>
        )}

        {error && (
          <div className="status-message status-error mt-8">
            {error}
          </div>
        )}

        {!loading && !error && (!cart || itemCount === 0) && (
          <div className="soft-panel-muted mt-10 p-10">
            <p className="text-lg text-[var(--color-text-soft)]">{t('cart.empty')}</p>
            <Link
              to="/products"
              className="mt-6 inline-block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]"
            >
              {t('common.continueShopping')}
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
                    className="inline-flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)] hover:text-[var(--color-primary)]"
                  >
                    <span className="text-base">←</span>
                    {t('common.continueShopping')}
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <aside className="surface-card p-7">
                  <h2 className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                    {t('cart.orderSummary')}
                  </h2>

                  <div className="mt-8 space-y-4 text-sm text-[var(--color-text-faint)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>{t('common.subtotal')}</span>
                      <span className="text-[var(--color-primary)]">{formatCurrency(cart.total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{t('cart.estimatedShipping')}</span>
                      <span className="text-[var(--color-text-faint)]">{t('cart.calculatedLater')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{t('cart.tax')}</span>
                      <span className="text-[var(--color-text-faint)]">{t('cart.atCheckout')}</span>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-[var(--color-border-soft)] pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-lg text-[var(--color-primary)]">{t('common.total')}</span>
                      <span className="font-display text-[2.2rem] leading-none text-[var(--color-primary)]">
                        {formatCurrency(cart.total)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="page-kicker text-[0.58rem]">
                      {t('cart.promotionalCode')}
                    </p>
                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
                      <input
                        type="text"
                        placeholder={t('cart.enterCode')}
                        className="rounded-[0.95rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 py-3 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--color-primary)] outline-none placeholder:text-[var(--color-text-faint)]"
                      />
                      <button
                        type="button"
                        className="rounded-[0.95rem] border border-[var(--color-border)] bg-[rgba(244,243,238,0.96)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]"
                      >
                        {t('common.apply')}
                      </button>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-base btn-primary mt-8 w-full rounded-[0.35rem]"
                  >
                    {t('cart.proceedToCheckout')}
                  </Link>

                  <p className="mt-4 text-center text-[0.62rem] text-[var(--color-text-faint)]">
                    {t('cart.secureCheckout')}
                  </p>
                </aside>

                <div className="soft-panel-muted p-6">
                  <p className="font-display text-[1.2rem] leading-7 text-[var(--color-text-soft)]">
                    {t('cart.quote')}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px]">
                      ✓
                    </span>
                    {t('cart.trustedMarketplace')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="site-footer mt-20 pb-10 pt-16">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                FLORA
              </p>
              <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
                {t('cart.footerDescription')}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="site-footer-label">
                  {t('cart.discover')}
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="site-footer-link text-sm">{t('common.home')}</Link>
                  <Link to="/products" className="site-footer-link text-sm">{t('common.products')}</Link>
                  <Link to="/favorites" className="site-footer-link text-sm">{t('common.favorites')}</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  {t('cart.clientCare')}
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/cart" className="site-footer-link text-sm">{t('common.cart')}</Link>
                  <Link to="/checkout" className="site-footer-link text-sm">{t('common.checkout')}</Link>
                  <Link to="/orders" className="site-footer-link text-sm">{t('common.orders')}</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  {t('cart.assurance')}
                </p>
                <div className="mt-4 space-y-3">
                  <p className="site-footer-copy text-sm leading-6">
                    {t('cart.assuranceCopy')}
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
