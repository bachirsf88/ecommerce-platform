import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import { canAccessBuyerFeatures } from '../utils/roles';

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
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  const steps = [
    { id: 1, title: t('checkout.steps.shipping.title'), caption: t('checkout.steps.shipping.caption') },
    { id: 2, title: t('checkout.steps.delivery.title'), caption: t('checkout.steps.delivery.caption') },
    { id: 3, title: t('checkout.steps.payment.title'), caption: t('checkout.steps.payment.caption') },
  ];
  const shippingOptions = [
    {
      value: 'home_delivery',
      label: t('checkout.shippingOptions.home_delivery.label'),
      description: t('checkout.shippingOptions.home_delivery.description'),
      cost: 300,
    },
    {
      value: 'office_pickup',
      label: t('checkout.shippingOptions.office_pickup.label'),
      description: t('checkout.shippingOptions.office_pickup.description'),
      cost: 150,
    },
  ];
  const paymentOptions = [
    {
      value: 'cash_on_delivery',
      label: t('checkout.paymentOptions.cash_on_delivery.label'),
      description: t('checkout.paymentOptions.cash_on_delivery.description'),
    },
    {
      value: 'card',
      label: t('checkout.paymentOptions.card.label'),
      description: t('checkout.paymentOptions.card.description'),
    },
  ];

  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      setError('');

      try {
        const data = await cartService.getCart();
        setCart(data);
      } catch (err) {
        setError(err.response?.data?.message || t('checkout.loadFailed'));
      } finally {
        setCartLoading(false);
      }
    };

    if (!authLoading && canAccessBuyerFeatures(user)) {
      loadCart();
    }
  }, [authLoading, t, user]);

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
        ['full_name', t('checkout.fullName')],
        ['phone', t('checkout.phone')],
        ['country', t('checkout.country')],
        ['state', t('checkout.state')],
        ['municipality', t('checkout.municipality')],
        ['neighborhood', t('checkout.neighborhood')],
        ['street_address', t('checkout.streetAddress')],
      ];

      const missingField = requiredFields.find(
        ([field]) => !String(formData[field]).trim()
      );

      if (missingField) {
        return t('checkout.requiredBeforeContinuing', { field: missingField[1] });
      }
    }

    if (step === 2 && !formData.shipping_method) {
      return t('checkout.selectMethod');
    }

    if (step === 3) {
      if (!formData.payment_method) {
        return t('checkout.selectPayment');
      }

      if (formData.payment_method === 'card') {
        const cardFields = [
          ['cardholder_name', t('checkout.cardholderName')],
          ['card_number', t('checkout.cardNumber')],
          ['expiry_date', t('checkout.expiryDate')],
          ['cvv', 'CVV'],
        ];

        const missingField = cardFields.find(
          ([field]) => !String(formData[field]).trim()
        );

        if (missingField) {
          return t('checkout.requiredForCard', { field: missingField[1] });
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
      setError(t('checkout.cartEmpty'));
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
      setError(err.response?.data?.message || t('checkout.checkoutFailed'));
    } finally {
      setSubmitting(false);
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

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
              <Link to="/">{t('common.home')}</Link>
              <span>/</span>
              <Link to="/cart">{t('common.cart')}</Link>
              <span>/</span>
              <span className="text-[var(--color-brand)]">{t('checkout.title')}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/cart" className="btn-base btn-outline">
                {t('checkout.backToCart')}
              </Link>
              <Link to="/orders" className="btn-base btn-outline">
                {t('common.myOrders')}
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_22rem] lg:items-start">
            <div className="space-y-6">
              <div className="hero-card overflow-hidden px-6 py-8 sm:px-8">
                <span className="section-label">{t('checkout.journey')}</span>
                <h1 className="editorial-title mt-5 max-w-3xl">
                  {t('checkout.journeyTitle')}
                </h1>
                <p className="subtle-copy mt-4 max-w-2xl text-sm">
                  {t('checkout.journeyDescription')}
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
                            ? 'border-[var(--color-accent)] bg-[rgba(255,255,255,0.92)]'
                            : isComplete
                              ? 'border-[var(--color-border)] bg-[rgba(255,255,255,0.9)]'
                              : 'border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.68)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                            {t('checkout.stepLabel', { step: item.id })}
                          </span>
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-[var(--color-brand)] text-[var(--color-text)]'
                                : isComplete
                                  ? 'bg-[rgba(188,184,177,0.28)] text-[var(--color-text)]'
                                  : 'bg-[rgba(188,184,177,0.16)] text-[var(--color-text-faint)]'
                            }`}
                          >
                            {isComplete ? '✓' : item.id}
                          </span>
                        </div>
                        <p className="font-display mt-5 text-[2rem] leading-none text-[var(--color-text)]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-text-faint)]">
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
                    <div className="mt-8 rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] p-6 text-sm text-[var(--color-text-soft)]">
                      {t('checkout.loading')}
                    </div>
                ) : !error && (!cart || itemCount === 0) ? (
                  <div className="mt-8 rounded-[1.4rem] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,255,255,0.76)] p-10 text-center">
                    <p className="font-display text-4xl leading-none text-[var(--color-text)]">
                      {t('checkout.emptyTitle')}
                    </p>
                    <p className="subtle-copy mt-4 text-sm">
                      {t('checkout.emptyDescription')}
                    </p>
                    <Link to="/products" className="btn-base btn-primary mt-6">
                      {t('common.continueShopping')}
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8">
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <span className="section-label">{t('checkout.stepLabel', { step: 1 })}</span>
                          <h2 className="section-title mt-4">{t('checkout.shippingAddress')}</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            {t('checkout.shippingAddressDescription')}
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.fullName')}
                            </label>
                            <input id="full_name" name="full_name" value={formData.full_name} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.phone')}
                            </label>
                            <input id="phone" name="phone" value={formData.phone} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="country" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.country')}
                            </label>
                            <input id="country" name="country" value={formData.country} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="state" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.state')}
                            </label>
                            <input id="state" name="state" value={formData.state} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="municipality" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.municipality')}
                            </label>
                            <input id="municipality" name="municipality" value={formData.municipality} onChange={handleFieldChange} className="text-input" />
                          </div>
                          <div>
                            <label htmlFor="neighborhood" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                              {t('checkout.neighborhood')}
                            </label>
                            <input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleFieldChange} className="text-input" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="street_address" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                            {t('checkout.streetAddress')}
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
                          <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                            {t('checkout.notes')} <span className="text-[var(--color-text-faint)]">({t('checkout.optional')})</span>
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleFieldChange}
                            className="text-input"
                            placeholder={t('checkout.notesPlaceholder')}
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <span className="section-label">{t('checkout.stepLabel', { step: 2 })}</span>
                          <h2 className="section-title mt-4">{t('checkout.deliveryMethod')}</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            {t('checkout.deliveryDescription')}
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
                                    ? 'border-[var(--color-accent)] bg-[rgba(255,255,255,0.94)]'
                                    : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.82)]'
                                }`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <p className="font-display text-[2rem] leading-none text-[var(--color-text)]">
                                      {option.label}
                                    </p>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-faint)]">
                                      {option.description}
                                    </p>
                                  </div>
                                  <div className="rounded-full border border-[var(--color-border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]">
                                    + {formatCurrency(option.cost)}
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
                          <span className="section-label">{t('checkout.stepLabel', { step: 3 })}</span>
                          <h2 className="section-title mt-4">{t('checkout.paymentMethod')}</h2>
                          <p className="subtle-copy mt-3 text-sm">
                            {t('checkout.paymentDescription')}
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
                                    ? 'border-[var(--color-accent)] bg-[rgba(255,255,255,0.94)]'
                                    : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.82)]'
                                }`}
                              >
                                <p className="font-display text-[2rem] leading-none text-[var(--color-text)]">
                                  {option.label}
                                </p>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-faint)]">
                                  {option.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {formData.payment_method === 'card' && (
                          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] p-5">
                            <div className="mb-5">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                                {t('checkout.frontendOnlyValidation')}
                              </p>
                              <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                                {t('checkout.frontendOnlyValidationCopy')}
                              </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div className="md:col-span-2">
                                <label htmlFor="cardholder_name" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                                  {t('checkout.cardholderName')}
                                </label>
                                <input id="cardholder_name" name="cardholder_name" value={formData.cardholder_name} onChange={handleFieldChange} className="text-input" />
                              </div>
                              <div className="md:col-span-2">
                                <label htmlFor="card_number" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                                  {t('checkout.cardNumber')}
                                </label>
                                <input id="card_number" name="card_number" value={formData.card_number} onChange={handleFieldChange} className="text-input" inputMode="numeric" />
                              </div>
                              <div>
                                <label htmlFor="expiry_date" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                                  {t('checkout.expiryDate')}
                                </label>
                                <input id="expiry_date" name="expiry_date" value={formData.expiry_date} onChange={handleFieldChange} className="text-input" placeholder="MM/YY" />
                              </div>
                              <div>
                                <label htmlFor="cvv" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                                  CVV
                                </label>
                                <input id="cvv" name="cvv" value={formData.cvv} onChange={handleFieldChange} className="text-input" inputMode="numeric" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-soft)] pt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn-base btn-outline"
                        disabled={step === 1 || submitting}
                      >
                        {t('common.back')}
                      </button>

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn-base btn-primary"
                        >
                          {t('common.nextStep')}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-base btn-primary"
                        >
                          {submitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28">
              <div className="surface-card p-6">
                <div className="border-b border-[var(--color-border-soft)] pb-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                    {t('cart.orderSummary')}
                  </p>
                  <p className="font-display mt-3 text-[2.4rem] leading-none text-[var(--color-text)]">
                    {t('checkout.reviewTitle')}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-soft)]">
                    <span>{t('common.items')}</span>
                    <span>{itemCount}</span>
                  </div>

                  <div className="space-y-3">
                    {(cart?.items ?? []).slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-[1.1rem] border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.76)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {item.product?.name || t('cart.unnamedProduct')}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                              {t('checkout.qty', { count: item.quantity })}
                            </p>
                          </div>
                          <p className="text-sm text-[var(--color-text-soft)]">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}

                    {itemCount > 3 && (
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                        {t('checkout.moreItems', { count: itemCount - 3, suffix: itemCount - 3 > 1 ? 's' : '' })}
                      </p>
                    )}
                  </div>

                  <div className="rounded-[1.25rem] bg-[rgba(244,243,238,0.94)] p-4">
                    <div className="flex items-center justify-between text-sm text-[var(--color-text-soft)]">
                      <span>{t('common.subtotal')}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[var(--color-text-soft)]">
                      <span>{t('common.shipping')}</span>
                      <span>
                        {selectedShipping ? formatCurrency(estimatedShipping) : t('checkout.selectDelivery')}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-soft)] pt-4">
                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {t('checkout.estimatedTotal')}
                      </span>
                      <span className="font-display text-[2rem] leading-none text-[var(--color-text)]">
                        {formatCurrency(estimatedTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] p-4">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                      {t('checkout.currentSelection')}
                    </p>
                    <p className="mt-3 text-sm text-[var(--color-text-soft)]">
                      {t('checkout.deliverySelection', { value: selectedShipping?.label || t('common.notSelectedYet') })}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                      {t('checkout.paymentSelection', { value: paymentOptions.find((option) => option.value === formData.payment_method)?.label || t('common.notSelectedYet') })}
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
