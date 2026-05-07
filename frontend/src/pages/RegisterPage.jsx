import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/login-page.jpg';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { getApiErrorMessage } from '../services/api';

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const { t, isRTL } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'buyer',
    store_name: '',
    store_address: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSellerMode = formData.role === 'seller';
  const sectionEyebrowClass =
    'page-kicker text-[0.62rem]';
  const sectionCopyClass =
    'text-[0.95rem] leading-7 text-[var(--color-text-soft)]';
  const fieldLabelClass =
    'text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]';
  const fieldInputClass =
    'line-input mt-2.5 w-full text-[1rem] font-medium';
  const helperTextClass =
    'text-[0.76rem] leading-6 text-[var(--color-text-faint)]';

  const getDefaultRouteByRole = (role) => {
    if (role === 'admin') {
      return '/admin';
    }

    if (role === 'seller') {
      return '/seller/dashboard';
    }

    return '/products';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setError('');
    setFormData((previous) => ({
      ...previous,
      role,
      ...(role === 'buyer'
        ? {
            store_name: '',
            store_address: '',
            postal_code: '',
          }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      isSellerMode &&
      (!formData.store_name.trim() ||
        !formData.store_address.trim() ||
        !formData.postal_code.trim())
    ) {
      setError(t('register.sellerFieldsRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = isSellerMode
        ? formData
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            role: formData.role,
          };

      const authData = await register(payload);
      const fallbackRoute = getDefaultRouteByRole(authData?.user?.role);
      const redirectTo = location.state?.from?.pathname || fallbackRoute;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-page)] text-[var(--color-text)]">
      <header className="px-4 pt-6 sm:px-8 lg:px-12 lg:pt-10">
        <div className={`mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 sm:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.8)] text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-brand)]">
              GS
            </span>
            <div>
              <p className="font-display text-3xl leading-none text-[var(--color-text)] sm:text-4xl">
                FLORA
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                {t('register.brandTagline')}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Link
              to="/login"
              className="rounded-full border border-[var(--color-brand)] bg-[rgba(122,75,46,0.08)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.14)] sm:px-5 sm:text-[0.72rem]"
            >
              {t('common.login')}
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-10">
          <section className="relative overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-lifted)]">
            <img
              src={heroImage}
              alt={t('register.imageAlt')}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,2,0.08)_0%,rgba(2,2,2,0.68)_100%)]" />

            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_70%)]" />

            <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 sm:p-10 lg:min-h-[780px] lg:p-12">
              <div className="max-w-[26rem]">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-white/72">
                  {t('register.heroKicker')}
                </p>
                <h1 className="font-display mt-6 text-[2.7rem] leading-[0.92] text-white sm:text-[4rem] lg:text-[4.6rem]">
                  {t('register.heroTitle')}
                </h1>
                <p className="mt-6 max-w-[23rem] text-[0.98rem] leading-8 text-white/80">
                  {t('register.heroDescription')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {t('register.buyerPath')}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/82">
                    {t('register.buyerPathDescription')}
                  </p>
                </div>

                <div className="rounded-[1.3rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {t('register.sellerPath')}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/82">
                    {t('register.sellerPathDescription')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full max-w-[31rem] lg:ml-auto">
              <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--gradient-soft-surface)] p-7 shadow-[var(--shadow-card)] sm:p-8">
                <p className={sectionEyebrowClass}>
                  {t('register.createAccount')}
                </p>
                <h2 className="font-display mt-5 text-[2.6rem] leading-[0.92] text-[var(--color-text)] sm:text-[3.9rem]">
                  {t('register.title')}
                </h2>
                <p className={`mt-3 max-w-[24rem] ${sectionCopyClass}`}>
                  {t('register.description')}
                </p>

                <div className="mt-7 rounded-[1.25rem] border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.7)] p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('buyer')}
                      className={`rounded-[1rem] px-4 py-4 text-left ${
                        !isSellerMode
                          ? 'bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_12px_24px_rgba(122,75,46,0.2)]'
                          : 'bg-transparent text-[var(--color-text-soft)]'
                      }`}
                    >
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em]">
                        {t('register.buyerTitle')}
                      </span>
                      <span className="mt-2 block text-sm font-medium">
                        {t('register.buyerDescription')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('seller')}
                      className={`rounded-[1rem] px-4 py-4 text-left ${
                        isSellerMode
                          ? 'bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_12px_24px_rgba(122,75,46,0.2)]'
                          : 'bg-transparent text-[var(--color-text-soft)]'
                      }`}
                    >
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em]">
                        {t('register.sellerTitle')}
                      </span>
                      <span className="mt-2 block text-sm font-medium">
                        {t('register.sellerDescription')}
                      </span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className={fieldLabelClass}
                      >
                        {isSellerMode ? t('register.sellerName') : t('register.fullName')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={isSellerMode ? t('register.sellerNamePlaceholder') : t('register.fullNamePlaceholder')}
                        required
                        className={fieldInputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={fieldLabelClass}
                      >
                        {t('common.email')}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('register.emailPlaceholder')}
                        required
                        className={fieldInputClass}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="password"
                        className={fieldLabelClass}
                      >
                        {t('common.password')}
                      </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={t('register.passwordPlaceholder')}
                          required
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="password_confirmation"
                        className={fieldLabelClass}
                      >
                        {t('register.confirmPassword')}
                      </label>
                        <input
                          id="password_confirmation"
                          name="password_confirmation"
                          type="password"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder={t('register.confirmPasswordPlaceholder')}
                          required
                          className={fieldInputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {isSellerMode && (
                    <div className="border-t border-[var(--color-border-soft)] pt-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className={sectionEyebrowClass}>
                            {t('register.storeInformation')}
                          </p>
                          <p className={`mt-1.5 max-w-[22rem] ${helperTextClass}`}>
                            {t('register.storeInformationHelp')}
                          </p>
                        </div>
                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                          {t('register.sellerOnly')}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-x-5 gap-y-3.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                        <div>
                          <label
                            htmlFor="store_name"
                            className={fieldLabelClass}
                          >
                            {t('register.storeName')}
                          </label>
                          <input
                            id="store_name"
                            name="store_name"
                            type="text"
                            value={formData.store_name}
                            onChange={handleChange}
                            placeholder={t('register.storeNamePlaceholder')}
                            required={isSellerMode}
                            className={fieldInputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="postal_code"
                            className={fieldLabelClass}
                          >
                            {t('register.postalCode')}
                          </label>
                          <input
                            id="postal_code"
                            name="postal_code"
                            type="text"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder={t('register.postalCodePlaceholder')}
                            required={isSellerMode}
                            className={fieldInputClass}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="store_address"
                            className={fieldLabelClass}
                          >
                            {t('register.storeAddress')}
                          </label>
                          <textarea
                            id="store_address"
                            name="store_address"
                            value={formData.store_address}
                            onChange={handleChange}
                            placeholder={t('register.storeAddressPlaceholder')}
                            required={isSellerMode}
                            rows="2"
                            className={fieldInputClass}
                          />
                          <p className={`mt-2 ${helperTextClass}`}>
                            {t('register.storeAddressHelp')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[var(--color-border-soft)] pt-4">
                    <p className={sectionEyebrowClass}>
                      {t('register.registrationMode')}
                    </p>
                    <p className="mt-1.5 text-sm leading-7 text-[var(--color-text-soft)]">
                      {isSellerMode
                        ? t('register.sellerModeDescription')
                        : t('register.buyerModeDescription')}
                    </p>
                  </div>

                  {error && (
                    <div className="status-message status-error">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-base btn-primary w-full rounded-[1rem] px-6 py-4 text-[0.94rem]"
                  >
                    {loading
                      ? t('register.submitting')
                      : isSellerMode
                        ? t('register.createSellerAccount')
                        : t('register.createBuyerAccount')}
                  </button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                  <span className={sectionEyebrowClass}>
                    {t('register.orContinueWith')}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] px-5 py-4 text-sm font-semibold text-[var(--color-text-soft)] hover:border-[var(--color-brand)] hover:bg-white"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] px-5 py-4 text-sm font-semibold text-[var(--color-text-soft)] hover:border-[var(--color-brand)] hover:bg-white"
                  >
                    Apple
                  </button>
                </div>

                <div className="mt-8 border-t border-[var(--color-border-soft)] pt-6">
                  <p className="text-sm leading-7 text-[var(--color-text-soft)]">
                    {t('register.alreadyHaveAccount')}{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-[var(--color-text)] underline decoration-[rgba(188,184,177,0.6)] underline-offset-4"
                    >
                      {t('register.signIn')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border-soft)] px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-sm text-[var(--color-text-faint)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl leading-none text-[var(--color-text)]">
              FLORA
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
              {t('register.footerTagline')}
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link to="/" className="hover:text-[var(--color-text)]">{t('common.home')}</Link>
            <Link to="/products" className="hover:text-[var(--color-text)]">{t('common.products')}</Link>
            <Link to="/login" className="hover:text-[var(--color-text)]">{t('common.login')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RegisterPage;
