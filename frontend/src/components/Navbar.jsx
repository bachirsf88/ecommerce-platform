import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const getLinkClassName = ({ isActive }) =>
    `text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
      isActive
        ? 'text-[var(--color-primary)]'
        : 'text-[rgba(138,129,124,0.9)] hover:text-[var(--color-primary)]'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(138,129,124,0.14)] bg-[rgba(250,246,241,0.88)] backdrop-blur-xl">
      <div className="page-container px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" className="group">
              <div>
                <p className="font-display text-2xl leading-none text-[var(--color-primary)] sm:text-3xl">
                  GradShop
                </p>
                <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                  Artisan Marketplace
                </p>
              </div>
            </NavLink>

            {isAuthenticated && (
              <div className="hidden text-right lg:block">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                  Signed In
                </p>
                <p className="mt-1 text-sm text-[var(--color-primary)]">
                  {user?.name || 'Account'}
                </p>
              </div>
            )}
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center">
            <NavLink to="/" className={getLinkClassName}>
              Home
            </NavLink>
            <NavLink to="/products" className={getLinkClassName}>
              Products
            </NavLink>

            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={getLinkClassName}>
                  Login
                </NavLink>
                <NavLink to="/register" className={getLinkClassName}>
                  Register
                </NavLink>
              </>
            )}

            {user?.role === 'buyer' && (
              <>
                <NavLink to="/favorites" className={getLinkClassName}>
                  Favorites
                </NavLink>
                <NavLink to="/cart" className={getLinkClassName}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={getLinkClassName}>
                  Orders
                </NavLink>
              </>
            )}

            {user?.role === 'seller' && (
              <NavLink to="/seller/dashboard" className={getLinkClassName}>
                Seller Panel
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={getLinkClassName}>
                Admin Panel
              </NavLink>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[rgba(138,129,124,0.9)] transition-colors hover:text-[var(--color-primary)]"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
