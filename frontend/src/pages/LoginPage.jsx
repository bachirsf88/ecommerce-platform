import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();

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
      <header className="px-6 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <div className="mx-auto max-w-[1220px] text-center">
          <Link to="/" className="inline-block">
            <p className="font-display text-3xl leading-none text-[var(--color-text)] sm:text-4xl">
              GradShop
            </p>
          </Link>
        </div>
      </header>

      <main className="px-6 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-[1.9rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-lifted)]">
            <img
              src={heroImage}
              alt="GradShop artisan atmosphere"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,2,0.08)_0%,rgba(2,2,2,0.56)_100%)]" />

            <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-8 sm:p-10 lg:min-h-[720px] lg:p-12">
              <div className="max-w-[22rem] rounded-[1.2rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                  Quiet Commerce
                </p>
                <p className="font-display mt-4 text-[1.95rem] leading-[1.02] text-white sm:text-[2.2rem]">
                  “A calm place to return to thoughtful products and careful sellers.”
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full max-w-[29rem] lg:ml-auto lg:pl-8">
              <p className="page-kicker">
                Welcome Back
              </p>
              <h1 className="font-display mt-5 text-[3rem] leading-[0.94] text-[var(--color-text)] sm:text-[3.8rem]">
                Sign in
              </h1>
              <p className="mt-4 max-w-[24rem] text-[0.98rem] leading-8 text-[var(--color-text-faint)]">
                Access your account to continue browsing, manage orders, or return to your seller workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                <div>
                  <label
                    htmlFor="email"
                    className="page-kicker text-[0.64rem]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="line-input mt-3 text-[0.98rem]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="page-kicker text-[0.64rem]"
                    >
                      Password
                    </label>
                    <span className="rounded-full border border-[rgba(122,75,46,0.18)] bg-[rgba(122,75,46,0.08)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
                      Forgot password
                    </span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-10 border-t border-[var(--color-border-soft)] pt-6">
                <p className="text-sm leading-7 text-[var(--color-text-faint)]">
                  New to GradShop?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[var(--color-text)] underline decoration-[rgba(188,184,177,0.6)] underline-offset-4"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer px-6 pb-10 pt-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-display text-4xl leading-none text-white sm:text-5xl">
              GradShop
            </p>
            <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
              A refined artisan marketplace for women-led home businesses, calm product discovery, and thoughtful everyday commerce.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="site-footer-label">
                Explore
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/" className="site-footer-link text-sm">Home</Link>
                <Link to="/products" className="site-footer-link text-sm">Products</Link>
                <Link to="/register" className="site-footer-link text-sm">Register</Link>
              </div>
            </div>

            <div>
              <p className="site-footer-label">
                Account
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/login" className="site-footer-link text-sm">Login</Link>
                <Link to="/favorites" className="site-footer-link text-sm">Favorites</Link>
                <Link to="/cart" className="site-footer-link text-sm">Cart</Link>
              </div>
            </div>

            <div>
              <p className="site-footer-label">
                Marketplace
              </p>
              <div className="mt-4 space-y-3">
                <p className="site-footer-copy text-sm leading-6">
                  Sign in to shop calmly, save favorites, and manage your marketplace activity.
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
