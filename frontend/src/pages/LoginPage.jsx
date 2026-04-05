import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';

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
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfaf7_0%,#f5efe8_100%)] text-[var(--color-primary)]">
      <header className="px-6 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <div className="mx-auto max-w-[1220px] text-center">
          <Link to="/" className="inline-block">
            <p className="font-display text-3xl leading-none text-[var(--color-primary)] sm:text-4xl">
              GradShop
            </p>
          </Link>
        </div>
      </header>

      <main className="px-6 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-[1.9rem] bg-[#ddd2c7] shadow-[0_18px_40px_rgba(2,2,2,0.08)]">
            <img
              src={heroImage}
              alt="GradShop artisan atmosphere"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,16,14,0.08)_0%,rgba(19,16,14,0.52)_100%)]" />

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
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.9)]">
                Welcome Back
              </p>
              <h1 className="font-display mt-5 text-[3rem] leading-[0.94] text-[var(--color-primary)] sm:text-[3.8rem]">
                Sign in
              </h1>
              <p className="mt-4 max-w-[24rem] text-[0.98rem] leading-8 text-[rgba(138,129,124,0.88)]">
                Access your account to continue browsing, manage orders, or return to your seller workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                <div>
                  <label
                    htmlFor="email"
                    className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[rgba(188,184,177,0.88)]"
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
                    className="mt-3 w-full border-0 border-b border-[rgba(138,129,124,0.22)] bg-transparent px-0 pb-4 pt-1 text-[0.98rem] text-[var(--color-primary)] outline-none placeholder:text-[rgba(138,129,124,0.56)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[rgba(188,184,177,0.88)]"
                    >
                      Password
                    </label>
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
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
                    className="mt-3 w-full border-0 border-b border-[rgba(138,129,124,0.22)] bg-transparent px-0 pb-4 pt-1 text-[0.98rem] text-[var(--color-primary)] outline-none placeholder:text-[rgba(138,129,124,0.56)]"
                  />
                </div>

                {error && (
                  <div className="status-message status-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-base btn-primary mt-2 w-full rounded-[0.35rem]"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-10 border-t border-[rgba(138,129,124,0.16)] pt-6">
                <p className="text-sm leading-7 text-[rgba(138,129,124,0.88)]">
                  New to GradShop?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[var(--color-primary)] underline decoration-[rgba(138,129,124,0.38)] underline-offset-4"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-[linear-gradient(180deg,#151210,#0d0b0a)] px-6 pb-10 pt-14 text-[#f6f1eb] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-display text-4xl leading-none text-white sm:text-5xl">
              GradShop
            </p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[rgba(255,250,247,0.68)]">
              A refined artisan marketplace for women-led home businesses, calm product discovery, and thoughtful everyday commerce.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                Explore
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Home</Link>
                <Link to="/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Products</Link>
                <Link to="/register" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Register</Link>
              </div>
            </div>

            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                Account
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/login" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Login</Link>
                <Link to="/favorites" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Favorites</Link>
                <Link to="/cart" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Cart</Link>
              </div>
            </div>

            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                Marketplace
              </p>
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-6 text-[rgba(255,250,247,0.68)]">
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
