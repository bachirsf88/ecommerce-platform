import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessBuyerFeatures } from '../utils/roles';

function CheckoutSuccessPage() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const order = location.state?.order ?? null;

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-4xl">
          <div className="surface-card p-8 text-sm text-[var(--color-text-soft)]">
            Checking user...
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessBuyerFeatures(user)) {
    return <Navigate to="/" replace />;
  }

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const shippingLabels = {
    home_delivery: 'Home Delivery',
    office_pickup: 'Office Pickup',
  };

  const paymentLabels = {
    cash_on_delivery: 'Cash on Delivery',
    card: 'Card',
  };

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-4xl">
        <section className="hero-card overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
          <span className="section-label">Order Confirmed</span>
          <h1 className="editorial-title mt-5 max-w-3xl">
            Your order is placed and everything is ready for the next step.
          </h1>
          <p className="subtle-copy mt-4 max-w-2xl text-sm">
            We saved your shipping and payment selections successfully. You can review the order details or continue browsing the collection.
          </p>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="surface-card-strong p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="metric-tile">
                <p className="page-kicker text-[0.62rem]">
                  Order ID
                </p>
                <p className="font-display mt-4 text-[2.4rem] leading-none text-[var(--color-primary)]">
                  #{order.id}
                </p>
              </div>

              <div className="metric-tile">
                <p className="page-kicker text-[0.62rem]">
                  Total
                </p>
                <p className="font-display mt-4 text-[2.4rem] leading-none text-[var(--color-primary)]">
                  ${Number(order.total ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="soft-panel p-5">
                <p className="page-kicker text-[0.62rem]">
                  Payment Method
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">
                  {paymentLabels[order.payment_method] || order.payment_method || 'N/A'}
                </p>
              </div>

              <div className="soft-panel p-5">
                <p className="page-kicker text-[0.62rem]">
                  Shipping Method
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">
                  {shippingLabels[order.shipping_method] || order.shipping_method || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <aside className="surface-card p-6">
            <p className="page-kicker text-[0.62rem]">
              Next Actions
            </p>
            <div className="mt-5 space-y-3">
              <Link to="/orders" className="btn-base btn-primary w-full">
                View My Orders
              </Link>
              <Link to="/products" className="btn-base btn-outline w-full">
                Continue Shopping
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;
