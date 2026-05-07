import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/marketplace-hero.jpg';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { getApiErrorMessage } from '../services/api';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { t, isRTL } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDefaultRouteByRole = (role) => {
    if (role === 'admin') {
      return '/admin';
    }

    if (role === 'seller') {
      return '/seller/products';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authData = await login(formData);
      const fallbackRoute = getDefaultRouteByRole(authData?.user?.role);
      const redirectTo = location.state?.from?.pathname || fallbackRoute;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
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
        <div className={`mx-auto flex max-w-[1220px] items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className="inline-block">
            <p className="font-display text-3xl leading-none text-[var(--color-text)] sm:text-4xl">
              FLORA
            </p>
          </Link>
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch lg:gap-10">
          <section className="relative overflow-hidden rounded-[1.9rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-lifted)]">
            <img
              src={heroImage}
              alt={t('login.imageAlt')}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,2,0.08)_0%,rgba(2,2,2,0.56)_100%)]" />

            <div className="relative z-10 flex min-h-[280px] flex-col justify-end p-6 sm:p-10 lg:min-h-[720px] lg:p-12">
              <div className="max-w-[22rem] rounded-[1.2rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                  {t('login.cardKicker')}
                </p>
                <p className="font-display mt-4 text-[1.95rem] leading-[1.02] text-white sm:text-[2.2rem]">
                  {t('login.cardQuote')}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full max-w-[29rem] lg:ml-auto lg:pl-8">
              <p className="page-kicker">
                {t('login.welcomeBack')}
              </p>
              <h1 className="font-display mt-5 text-[2.5rem] leading-[0.94] text-[var(--color-text)] sm:text-[3.8rem]">
                {t('login.title')}
              </h1>
              <p className="mt-4 max-w-[24rem] text-[0.98rem] leading-8 text-[var(--color-text-faint)]">
                {t('login.description')}
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                <div>
                  <label
                    htmlFor="email"
                    className="page-kicker text-[0.64rem]"
                  >
                    {t('common.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('login.emailPlaceholder')}
                    required
                    className="line-input mt-3 text-[0.98rem]"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="page-kicker text-[0.64rem]"
                    >
                      {t('login.password')}
                    </label>
                    <span className="rounded-full border border-[rgba(122,75,46,0.18)] bg-[rgba(122,75,46,0.08)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
                      {t('login.forgotPassword')}
                    </span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    className="line-input mt-3 text-[0.98rem]"
                  />
                </div>

                {error && (
                  <div className="status-message status-error">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-base btn-primary mt-2 w-full rounded-[0.85rem] border-[var(--color-brand)] bg-[var(--color-brand)]">
                  {loading ? t('login.submitting') : t('login.submit')}
                </button>
              </form>

              <div className="mt-10 border-t border-[var(--color-border-soft)] pt-6">
                <p className="text-sm leading-7 text-[var(--color-text-faint)]">
                  {t('login.newToFlora')}{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[var(--color-text)] underline decoration-[rgba(188,184,177,0.6)] underline-offset-4"
                  >
                    {t('login.createAccount')}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer px-4 pb-10 pt-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-display text-4xl leading-none text-white sm:text-5xl">
              FLORA
            </p>
            <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
              {t('login.footerDescription')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="site-footer-label">
                {t('login.explore')}
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/" className="site-footer-link text-sm">{t('common.home')}</Link>
                <Link to="/products" className="site-footer-link text-sm">{t('common.products')}</Link>
                <Link to="/register" className="site-footer-link text-sm">{t('common.register')}</Link>
              </div>
            </div>

            <div>
              <p className="site-footer-label">
                {t('common.account')}
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/login" className="site-footer-link text-sm">{t('common.login')}</Link>
                <Link to="/favorites" className="site-footer-link text-sm">{t('common.favorites')}</Link>
                <Link to="/cart" className="site-footer-link text-sm">{t('common.cart')}</Link>
              </div>
            </div>

            <div>
              <p className="site-footer-label">
                {t('login.marketplace')}
              </p>
              <div className="mt-4 space-y-3">
                <p className="site-footer-copy text-sm leading-6">
                  {t('login.marketplaceCopy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
