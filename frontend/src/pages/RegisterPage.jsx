import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();

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
    'text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(112,100,92,0.9)]';
  const sectionCopyClass =
    'text-[0.95rem] leading-7 text-[rgba(88,78,72,0.9)]';
  const fieldLabelClass =
    'text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[rgba(86,76,70,0.9)]';
  const fieldInputClass =
    'mt-2.5 w-full border-0 border-b border-[rgba(126,114,106,0.34)] bg-transparent px-0 pb-3.5 pt-1 text-[1rem] font-medium text-[rgba(26,21,18,0.96)] outline-none placeholder:text-[rgba(112,100,92,0.78)] focus:border-[rgba(78,67,61,0.56)]';
  const helperTextClass =
    'text-[0.76rem] leading-6 text-[rgba(102,92,86,0.78)]';

  const getDefaultRouteByRole = (role) => {
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
      setError('Store name, store address, and postal code are required for seller registration.');
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
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfaf7_0%,#f4ede6_100%)] text-[var(--color-primary)]">
      <header className="px-6 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.74)] text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[rgba(138,129,124,0.86)]">
              GS
            </span>
            <div>
              <p className="font-display text-3xl leading-none text-[var(--color-primary)] sm:text-4xl">
                GradShop
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[rgba(138,129,124,0.72)]">
                Thoughtful Marketplace
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.62)] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.9)] hover:bg-[rgba(255,253,249,0.9)] hover:text-[var(--color-primary)]"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="px-6 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(255,255,255,0.18)] bg-[#d9cec1] shadow-[0_24px_60px_rgba(2,2,2,0.1)]">
            <img
              src={heroImage}
              alt="GradShop artisan register"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,9,0.08)_0%,rgba(14,11,9,0.68)_100%)]" />

            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_70%)]" />

            <div className="relative z-10 flex min-h-[480px] flex-col justify-between p-8 sm:p-10 lg:min-h-[780px] lg:p-12">
              <div className="max-w-[26rem]">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-white/72">
                  Registration Experience
                </p>
                <h1 className="font-display mt-6 text-[3.2rem] leading-[0.9] text-white sm:text-[4rem] lg:text-[4.6rem]">
                  Build a place in the marketplace with more intention.
                </h1>
                <p className="mt-6 max-w-[23rem] text-[0.98rem] leading-8 text-white/80">
                  Buyers join to discover carefully presented pieces. Sellers join to begin shaping a storefront that feels considered, warm, and ready for approval.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Buyer Path
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/82">
                    Start with a lighter registration flow for browsing, favorites, cart, and checkout.
                  </p>
                </div>

                <div className="rounded-[1.3rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.12)] p-5 backdrop-blur-sm">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Seller Path
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/82">
                    Add essential store details so the backend can create your seller account and linked store record together.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full max-w-[31rem] lg:ml-auto">
              <div className="rounded-[2rem] border border-[rgba(138,129,124,0.16)] bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(248,244,239,0.84))] p-7 shadow-[0_18px_40px_rgba(2,2,2,0.05)] sm:p-8">
                <p className={sectionEyebrowClass}>
                  Create Account
                </p>
                <h2 className="font-display mt-5 text-[3rem] leading-[0.92] text-[var(--color-primary)] sm:text-[3.9rem]">
                  Register
                </h2>
                <p className={`mt-3 max-w-[24rem] ${sectionCopyClass}`}>
                  Choose your path and complete registration through the live marketplace flow.
                </p>

                <div className="mt-7 rounded-[1.25rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,252,248,0.7)] p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('buyer')}
                      className={`rounded-[1rem] px-4 py-4 text-left ${
                        !isSellerMode
                          ? 'bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgba(2,2,2,0.12)]'
                          : 'bg-transparent text-[rgba(96,86,80,0.92)]'
                      }`}
                    >
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em]">
                        Buyer
                      </span>
                      <span className="mt-2 block text-sm font-medium">
                        Shorter, lighter account setup
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('seller')}
                      className={`rounded-[1rem] px-4 py-4 text-left ${
                        isSellerMode
                          ? 'bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgba(2,2,2,0.12)]'
                          : 'bg-transparent text-[rgba(96,86,80,0.92)]'
                      }`}
                    >
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em]">
                        Seller
                      </span>
                      <span className="mt-2 block text-sm font-medium">
                        Includes store creation details
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
                        {isSellerMode ? 'Seller Name' : 'Full Name'}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={isSellerMode ? 'Enter your seller name' : 'Enter your name'}
                        required
                        className={fieldInputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={fieldLabelClass}
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
                        className={fieldInputClass}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="password"
                          className={fieldLabelClass}
                        >
                          Password
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          required
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="password_confirmation"
                          className={fieldLabelClass}
                        >
                          Confirm Password
                        </label>
                        <input
                          id="password_confirmation"
                          name="password_confirmation"
                          type="password"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          required
                          className={fieldInputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {isSellerMode && (
                    <div className="border-t border-[rgba(138,129,124,0.16)] pt-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className={sectionEyebrowClass}>
                            Store Information
                          </p>
                          <p className={`mt-1.5 max-w-[22rem] ${helperTextClass}`}>
                            Required to create your linked seller store.
                          </p>
                        </div>
                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(108,97,90,0.82)]">
                          Seller Only
                        </span>
                      </div>

                      <div className="mt-4 grid gap-x-5 gap-y-3.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                        <div>
                          <label
                            htmlFor="store_name"
                            className={fieldLabelClass}
                          >
                            Store Name
                          </label>
                          <input
                            id="store_name"
                            name="store_name"
                            type="text"
                            value={formData.store_name}
                            onChange={handleChange}
                            placeholder="Enter your store name"
                            required={isSellerMode}
                            className={fieldInputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="postal_code"
                            className={fieldLabelClass}
                          >
                            Postal Code
                          </label>
                          <input
                            id="postal_code"
                            name="postal_code"
                            type="text"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="Enter postal code"
                            required={isSellerMode}
                            className={fieldInputClass}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="store_address"
                            className={fieldLabelClass}
                          >
                            Store Address
                          </label>
                          <textarea
                            id="store_address"
                            name="store_address"
                            value={formData.store_address}
                            onChange={handleChange}
                            placeholder="Enter your store address"
                            required={isSellerMode}
                            rows="2"
                            className={fieldInputClass}
                          />
                          <p className={`mt-2 ${helperTextClass}`}>
                            Use the address your store should appear under.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[rgba(138,129,124,0.14)] pt-4">
                    <p className={sectionEyebrowClass}>
                      Registration Mode
                    </p>
                    <p className="mt-1.5 text-sm leading-7 text-[rgba(94,83,77,0.86)]">
                      {isSellerMode
                        ? 'Seller registration creates your seller account and the linked store record required by the backend approval flow.'
                        : 'Buyer registration stays intentionally lighter for browsing, favorites, cart, and ordering.'}
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
                      ? 'Creating account...'
                      : isSellerMode
                        ? 'Create Seller Account'
                        : 'Create Buyer Account'}
                  </button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[rgba(138,129,124,0.14)]" />
                  <span className={sectionEyebrowClass}>
                    Or continue with
                  </span>
                  <div className="h-px flex-1 bg-[rgba(138,129,124,0.14)]" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-[1rem] border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.72)] px-5 py-4 text-sm font-semibold text-[rgba(2,2,2,0.74)] hover:bg-white"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="rounded-[1rem] border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.72)] px-5 py-4 text-sm font-semibold text-[rgba(2,2,2,0.74)] hover:bg-white"
                  >
                    Apple
                  </button>
                </div>

                <div className="mt-8 border-t border-[rgba(138,129,124,0.16)] pt-6">
                  <p className="text-sm leading-7 text-[rgba(94,83,77,0.9)]">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-[var(--color-primary)] underline decoration-[rgba(138,129,124,0.38)] underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[rgba(138,129,124,0.12)] px-6 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-sm text-[rgba(138,129,124,0.82)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl leading-none text-[var(--color-primary)]">
              GradShop
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[rgba(138,129,124,0.7)]">
              Crafted registration flow
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <Link to="/products" className="hover:text-[var(--color-primary)]">Products</Link>
            <Link to="/login" className="hover:text-[var(--color-primary)]">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RegisterPage;
