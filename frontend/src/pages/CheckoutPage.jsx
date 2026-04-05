import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import { canAccessBuyerFeatures } from '../utils/roles';

const steps = [
  { id: 1, title: 'Shipping', caption: 'Address details' },
  { id: 2, title: 'Delivery', caption: 'Method and timing' },
  { id: 3, title: 'Payment', caption: 'Finish checkout' },
];

const shippingOptions = [
  {
    value: 'home_delivery',
    label: 'Home Delivery',
    description: 'Delivered to your address with a calm, direct doorstep handoff.',
    cost: 300,
  },
  {
    value: 'office_pickup',
    label: 'Office Pickup',
    description: 'Collect your order from the pickup office at a lighter delivery cost.',
    cost: 150,
  },
];

const paymentOptions = [
  {
    value: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives. Simple, familiar, and flexible.',
  },
  {
    value: 'card',
    label: 'Card',
    description: 'Use a card for a faster confirmation flow. Card details stay frontend-only for now.',
  },
];

const initialFormData = {
  full_name: '',
  phone: '',
  country: '',
  state: '',
  municipality: '',
  neighborhood: '',
  street_address: '',
  notes: '',
  shipping_method: '',
  payment_method: '',
  cardholder_name: '',
  card_number: '',
  expiry_date: '',
  cvv: '',
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      setError('');

      try {
        const data = await cartService.getCart();
        setCart(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checkout details.');
      } finally {
        setCartLoading(false);
      }
    };

    if (!authLoading && canAccessBuyerFeatures(user)) {
      loadCart();
    }
  }, [authLoading, user]);

  const selectedShipping = useMemo(
    () => shippingOptions.find((option) => option.value === formData.shipping_method) ?? null,
    [formData.shipping_method]
  );

  const estimatedShipping = selectedShipping?.cost ?? 0;
  const subtotal = Number(cart?.total ?? 0);
  const estimatedTotal = subtotal + estimatedShipping;
  const itemCount = cart?.items?.length ?? 0;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleShippingSelect = (shippingMethod) => {
    setFormData((current) => ({
      ...current,
      shipping_method: shippingMethod,
    }));
  };

  const handlePaymentSelect = (paymentMethod) => {
    setFormData((current) => ({
      ...current,
      payment_method: paymentMethod,
      ...(paymentMethod === 'cash_on_delivery'
        ? {
            cardholder_name: '',
            card_number: '',
            expiry_date: '',
            cvv: '',
          }
        : {}),
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      const requiredFields = [
        ['full_name', 'Full name'],
        ['phone', 'Phone'],
        ['country', 'Country'],
        ['state', 'State'],
        ['municipality', 'Municipality'],
        ['neighborhood', 'Neighborhood'],
        ['street_address', 'Street address'],
      ];

      const missingField = requiredFields.find(
        ([field]) => !String(formData[field]).trim()
      );

      if (missingField) {
        return `${missingField[1]} is required before continuing.`;
      }
    }

    if (step === 2 && !formData.shipping_method) {
      return 'Select a delivery method to continue.';
    }

    if (step === 3) {
      if (!formData.payment_method) {
        return 'Select a payment method to place the order.';
      }

      if (formData.payment_method === 'card') {
        const cardFields = [
          ['cardholder_name', 'Cardholder name'],
          ['card_number', 'Card number'],
          ['expiry_date', 'Expiry date'],
          ['cvv', 'CVV'],
        ];

        const missingField = cardFields.find(
          ([field]) => !String(formData[field]).trim()
        );

        if (missingField) {
          return `${missingField[1]} is required for card payments.`;
        }
      }
    }

    return '';
  };

  const handleNext = () => {
    const validationError = validateStep();

    if (validationError) {
      setStepError(validationError);
      return;
    }

    setStepError('');
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleBack = () => {
    setStepError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateStep();

    if (validationError) {
      setStepError(validationError);
      return;
    }

    if (!cart || itemCount === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');
    setStepError('');

    try {
      const order = await orderService.checkout({
        full_name: formData.full_name,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        municipality: formData.municipality,
        neighborhood: formData.neighborhood,
        street_address: formData.street_address,
        notes: formData.notes,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
      });

      navigate('/checkout/success', {
        replace: true,
        state: {
          order,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="surface-card p-8 text-sm text-[rgba(2,2,2,0.62)]">
            Checking user...
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessBuyerFeatures(user)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(188,184,177,0.88)]">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/cart">Cart</Link>
              <span>/</span>
              <span className="text-[var(--color-secondary)]">Checkout</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/cart" className="btn-base btn-outline">
                Back to Cart
              </Link>
              <Link to="/orders" className="btn-base btn-outline">
                My Orders
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_22rem] lg:items-start">
            <div className="space-y-6">
              <div className="hero-card overflow-hidden px-6 py-8 sm:px-8">
                <span className="section-label">Checkout Journey</span>
                <h1 className="editorial-title mt-5 max-w-3xl">
                  A slower, clearer path to finishing your order beautifully.
                </h1>
                <p className="subtle-copy mt-4 max-w-2xl text-sm">
                  Move through shipping, delivery, and payment one step at a time.
                  Your details stay in place as you go, and only the final backend payload is sent when you confirm.
                </p>
              </div>

              <div className="surface-card-strong p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {steps.map((item) => {
                    const isActive = item.id === step;
                    const isComplete = item.id < step;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-[1.4rem] border p-4 ${
                          isActive
                            ? 'border-[rgba(224,175,160,0.58)] bg-[rgba(255,248,245,0.9)]'
                            : isComplete
                              ? 'border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.86)]'
                              : 'border-[rgba(138,129,124,0.12)] bg-[rgba(255,255,255,0.58)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.8)]">
                            Step {item.id}
                          </span>
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-[var(--color-primary)] text-white'
                                : isComplete
                                  ? 'bg-[rgba(2,2,2,0.08)] text-[var(--color-primary)]'
                                  : 'bg-[rgba(138,129,124,0.1)] text-[rgba(138,129,124,0.8)]'
                            }`}
                          >
                            {isComplete ? '✓' : item.id}
                          </span>
                        </div>
                        <p className="font-display mt-5 text-[2rem] leading-none text-[var(--color-primary)]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm text-[rgba(138,129,124,0.88)]">
                          {item.caption}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="status-message status-error mt-6">
                    {error}
                  </div>
                )}

                {stepError && (
                  <div className="status-message status-error mt-6">
                    {stepError}
                  </div>
                )}

                {cartLoading ? (
                  <div className="mt-8 rounded-[1.4rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-6 text-sm text-[rgba(2,2,2,0.62)]">
                    Loading checkout details...
                  </div>
                ) : !error && (!cart || itemCount === 0) ? (
                  <div className="mt-8 rounded-[1.4rem] border border-dashed border-[rgba(138,129,124,0.32)] bg-[rgba(255,253,249,0.72)] p-10 text-center">
                    <p className="font-display text-4xl leading-none text-[var(--color-primary)]">
                      Your cart is empty.
                    </p>
                    <p className="subtle-copy mt-4 text-sm">
                      Add a few products before moving through checkout.
                    </p>
                    <Link to="/products" className="btn-base btn-primary mt-6">
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8">
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <span className="section-label">Step 1</span>
                          <h2 className="section-title mt-4">Shipping Address</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            Tell us exactly where the order should arrive, with enough detail for a calm final delivery.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              Full Name
                            </label>
                            <input id="full_name" name="full_name" value={formData.full_name} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              Phone
                            </label>
                            <input id="phone" name="phone" value={formData.phone} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="country" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              Country
                            </label>
                            <input id="country" name="country" value={formData.country} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="state" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              State
                            </label>
                            <input id="state" name="state" value={formData.state} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="municipality" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              Municipality
                            </label>
                            <input id="municipality" name="municipality" value={formData.municipality} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="neighborhood" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                              Neighborhood
                            </label>
                            <input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleFieldChange} className="text-input" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="street_address" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                            Street Address
                          </label>
                          <textarea
                            id="street_address"
                            name="street_address"
                            rows="4"
                            value={formData.street_address}
                            onChange={handleFieldChange}
                            className="text-input"
                          />
                        </div>

                        <div>
                          <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                            Notes <span className="text-[rgba(138,129,124,0.82)]">(Optional)</span>
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleFieldChange}
                            className="text-input"
                            placeholder="Entrance notes, landmark hints, or delivery preferences."
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <span className="section-label">Step 2</span>
                          <h2 className="section-title mt-4">Delivery Method</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            Choose the pace and handoff style that feels best for this order.
                          </p>
                        </div>

                        <div className="grid gap-4">
                          {shippingOptions.map((option) => {
                            const isSelected = formData.shipping_method === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleShippingSelect(option.value)}
                                className={`w-full rounded-[1.5rem] border p-5 text-left ${
                                  isSelected
                                    ? 'border-[rgba(224,175,160,0.62)] bg-[rgba(255,248,245,0.92)]'
                                    : 'border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.82)]'
                                }`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <p className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                                      {option.label}
                                    </p>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(138,129,124,0.9)]">
                                      {option.description}
                                    </p>
                                  </div>
                                  <div className="rounded-full border border-[rgba(138,129,124,0.14)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                                    + {option.cost}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <div>
                          <span className="section-label">Step 3</span>
                          <h2 className="section-title mt-4">Payment Method</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            Choose how you want to complete payment. Card details are checked only in the browser and are never sent to the backend.
                          </p>
                        </div>

                        <div className="grid gap-4">
                          {paymentOptions.map((option) => {
                            const isSelected = formData.payment_method === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handlePaymentSelect(option.value)}
                                className={`w-full rounded-[1.5rem] border p-5 text-left ${
                                  isSelected
                                    ? 'border-[rgba(224,175,160,0.62)] bg-[rgba(255,248,245,0.92)]'
                                    : 'border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.82)]'
                                }`}
                              >
                                <p className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                                  {option.label}
                                </p>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(138,129,124,0.9)]">
                                  {option.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {formData.payment_method === 'card' && (
                          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.82)] p-5">
                            <div className="mb-5">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.82)]">
                                Frontend-only card validation
                              </p>
                              <p className="mt-2 text-sm text-[rgba(2,2,2,0.62)]">
                                These fields help complete the flow visually, but they are not included in the backend payload.
                              </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div className="md:col-span-2">
                                <label htmlFor="cardholder_name" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                                  Cardholder Name
                                </label>
                                <input id="cardholder_name" name="cardholder_name" value={formData.cardholder_name} onChange={handleFieldChange} className="text-input" />
                              </div>
                              <div className="md:col-span-2">
                                <label htmlFor="card_number" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                                  Card Number
                                </label>
                                <input id="card_number" name="card_number" value={formData.card_number} onChange={handleFieldChange} className="text-input" inputMode="numeric" />
                              </div>
                              <div>
                                <label htmlFor="expiry_date" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                                  Expiry Date
                                </label>
                                <input id="expiry_date" name="expiry_date" value={formData.expiry_date} onChange={handleFieldChange} className="text-input" placeholder="MM/YY" />
                              </div>
                              <div>
                                <label htmlFor="cvv" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                                  CVV
                                </label>
                                <input id="cvv" name="cvv" value={formData.cvv} onChange={handleFieldChange} className="text-input" inputMode="numeric" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(138,129,124,0.12)] pt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn-base btn-outline"
                        disabled={step === 1 || submitting}
                      >
                        Back
                      </button>

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn-base btn-primary"
                        >
                          Next Step
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-base btn-primary"
                        >
                          {submitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28">
              <div className="surface-card p-6">
                <div className="border-b border-[rgba(138,129,124,0.12)] pb-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.82)]">
                    Order Summary
                  </p>
                  <p className="font-display mt-3 text-[2.4rem] leading-none text-[var(--color-primary)]">
                    Review
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-[rgba(2,2,2,0.68)]">
                    <span>Items</span>
                    <span>{itemCount}</span>
                  </div>

                  <div className="space-y-3">
                    {(cart?.items ?? []).slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-[1.1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,255,255,0.6)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-primary)]">
                              {item.product?.name || 'Unnamed product'}
                            </p>
                            <p className="mt-1 text-xs text-[rgba(138,129,124,0.86)]">
                              Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm text-[rgba(2,2,2,0.72)]">${item.subtotal}</p>
                        </div>
                      </div>
                    ))}

                    {itemCount > 3 && (
                      <p className="text-xs uppercase tracking-[0.18em] text-[rgba(138,129,124,0.82)]">
                        + {itemCount - 3} more item{itemCount - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="rounded-[1.25rem] bg-[rgba(248,244,239,0.9)] p-4">
                    <div className="flex items-center justify-between text-sm text-[rgba(2,2,2,0.68)]">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[rgba(2,2,2,0.68)]">
                      <span>Shipping</span>
                      <span>
                        {selectedShipping ? `${estimatedShipping.toFixed(2)}` : 'Select delivery'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(138,129,124,0.12)] pt-4">
                      <span className="text-sm font-semibold text-[var(--color-primary)]">
                        Estimated Total
                      </span>
                      <span className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                        ${estimatedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.82)] p-4">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(138,129,124,0.82)]">
                      Current Selection
                    </p>
                    <p className="mt-3 text-sm text-[rgba(2,2,2,0.72)]">
                      Delivery: {selectedShipping?.label || 'Not selected yet'}
                    </p>
                    <p className="mt-2 text-sm text-[rgba(2,2,2,0.72)]">
                      Payment: {paymentOptions.find((option) => option.value === formData.payment_method)?.label || 'Not selected yet'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CheckoutPage;
