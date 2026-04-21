import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessBuyerFeatures, isSeller } from '../utils/roles';

function IconButton({ to, label, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
          isActive
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.18)]'
            : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] text-[var(--color-brand)] hover:border-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]'
        }`
      }
      aria-label={label}
      title={label}
    >
      {children}
    </NavLink>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.25s-6.75-4.35-9-8.17C1.36 9.22 3.04 5.5 6.9 5.5c2.07 0 3.31 1.18 4.1 2.31.79-1.13 2.03-2.31 4.1-2.31 3.86 0 5.54 3.72 3.9 6.58-2.25 3.82-9 8.17-9 8.17Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.75 4.75h2.4l1.83 8.02a1 1 0 0 0 .98.78h8.37a1 1 0 0 0 .97-.74l1.47-5.43H6.16" />
      <circle cx="10.25" cy="18.25" r="1.4" />
      <circle cx="17.1" cy="18.25" r="1.4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19.5c1.74-3.05 4.04-4.58 6.5-4.58s4.76 1.53 6.5 4.58" />
    </svg>
  );
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const shoppingAccess = canAccessBuyerFeatures(user);
  const sellerUser = isSeller(user);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const getLinkClassName = ({ isActive }) =>
    `inline-flex items-center rounded-full border px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
      isActive
        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.16)]'
        : 'border-transparent text-[var(--color-brand)] hover:border-[var(--color-border)] hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[rgba(244,243,238,0.96)] shadow-[0_12px_24px_rgba(138,129,124,0.08)] backdrop-blur-xl">
      <div className="page-container px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" className="group">
              <div>
                <p className="font-display text-2xl leading-none text-[var(--color-text)] sm:text-3xl">
                  GradShop
                </p>
                <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">
                  Artisan Marketplace
                </p>
              </div>
            </NavLink>

            {isAuthenticated ? (
              <div className="hidden text-right lg:block">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-brand)]">
                  Signed In
                </p>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {user?.name || 'Account'}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <NavLink to="/" className={getLinkClassName}>
                Home
              </NavLink>
              <NavLink to="/products" className={getLinkClassName}>
                Products
              </NavLink>
              {sellerUser ? (
                <NavLink to="/seller/dashboard" className={getLinkClassName}>
                  Seller Panel
                </NavLink>
              ) : null}
              {user?.role === 'admin' ? (
                <NavLink to="/admin" className={getLinkClassName}>
                  Admin Panel
                </NavLink>
              ) : null}
            </nav>

            {!isAuthenticated ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/login" className="btn-base btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-base btn-primary">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 self-start lg:self-auto">
                {shoppingAccess ? (
                  <>
                    <IconButton to="/favorites" label="Favorites">
                      <HeartIcon />
                    </IconButton>
                    <IconButton to="/cart" label="Cart">
                      <CartIcon />
                    </IconButton>
                  </>
                ) : null}

                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((previous) => !previous)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                      accountOpen
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.18)]'
                        : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] text-[var(--color-brand)] hover:border-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]'
                    }`}
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                  >
                    <UserIcon />
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[17rem] rounded-[1.45rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_24px_40px_rgba(138,129,124,0.16)]">
                      <div className="border-b border-[var(--color-border-soft)] px-3 pb-3">
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {user?.name || 'Account'}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                          {user?.email || 'No email'}
                        </p>
                      </div>

                      <div className="grid gap-1 px-1 py-3">
                        {shoppingAccess ? (
                          <>
                            <Link
                              to="/account"
                              onClick={() => setAccountOpen(false)}
                              className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
                            >
                              Account / Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setAccountOpen(false)}
                              className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
                            >
                              My Purchases
                            </Link>
                            <Link
                              to="/account#password"
                              onClick={() => setAccountOpen(false)}
                              className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
                            >
                              Change Password
                            </Link>
                          </>
                        ) : null}

                        {sellerUser ? (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setAccountOpen(false)}
                            className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
                          >
                            Seller Workspace
                          </Link>
                        ) : null}
                      </div>

                      <div className="border-t border-[var(--color-border-soft)] px-1 pt-3">
                        <button
                          type="button"
                          onClick={logout}
                          className="w-full rounded-[1rem] px-3 py-2 text-left text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
