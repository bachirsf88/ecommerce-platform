import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { canAccessBuyerFeatures, isSeller } from '../utils/roles';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.75 10.5 12 4.75l7.25 5.75v8a1 1 0 0 1-1 1h-3.75v-5.5h-5v5.5H5.75a1 1 0 0 1-1-1v-8Z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.75" y="5.25" width="14.5" height="13.5" rx="2.2" />
      <path d="M8 9.25h8M8 12h8M8 14.75h5" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.4" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.25s-6.75-4.35-9-8.17C1.36 9.22 3.04 5.5 6.9 5.5c2.07 0 3.31 1.18 4.1 2.31.79-1.13 2.03-2.31 4.1-2.31 3.86 0 5.54 3.72 3.9 6.58-2.25 3.82-9 8.17-9 8.17Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.75 4.75h2.4l1.83 8.02a1 1 0 0 0 .98.78h8.37a1 1 0 0 0 .97-.74l1.47-5.43H6.16" />
      <circle cx="10.25" cy="18.25" r="1.4" />
      <circle cx="17.1" cy="18.25" r="1.4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19.5c1.74-3.05 4.04-4.58 6.5-4.58s4.76 1.53 6.5 4.58" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.75 9.25 6 5.25h12l1.25 4v1.5a2.25 2.25 0 0 1-4.18 1.16 2.25 2.25 0 0 1-3.07.67 2.25 2.25 0 0 1-3.06-.67 2.25 2.25 0 0 1-4.19-1.16v-1.5Z" />
      <path d="M6.75 12.75v6.5h10.5v-6.5M10 19.25v-3.75h4v3.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4.75 18.75 7v5.6c0 3.69-2.39 6.11-6.75 7.9-4.36-1.79-6.75-4.21-6.75-7.9V7L12 4.75Z" />
      <path d="m9.25 12.25 1.8 1.8 3.7-4.05" />
    </svg>
  );
}

function DesktopNavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
        active
          ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.16)]'
          : 'border-transparent text-[var(--color-brand)] hover:border-[var(--color-border)] hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, active, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={`flex min-h-[3.15rem] flex-col items-center justify-center rounded-[1.05rem] border px-2 ${
        active
          ? 'border-[var(--color-brand)] bg-[rgba(122,75,46,0.14)] text-[var(--color-brand)] shadow-[0_12px_24px_rgba(122,75,46,0.14)]'
          : 'border-transparent bg-transparent text-[var(--color-text-faint)]'
      }`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

function IconActionLink({ to, label, children, active = null }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const resolvedActive = active ?? isActive;

        return `flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
          resolvedActive
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.18)]'
            : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] text-[var(--color-brand)] hover:border-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]'
        }`;
      }}
      aria-label={label}
      title={label}
    >
      {children}
    </NavLink>
  );
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { t, isRTL } = useTranslation();
  const [accountOpen, setAccountOpen] = useState(false);
  const desktopAccountMenuRef = useRef(null);
  const mobileAccountMenuRef = useRef(null);
  const shoppingAccess = canAccessBuyerFeatures(user);
  const sellerUser = isSeller(user);
  const adminUser = user?.role === 'admin';
  const favoritesDestination = shoppingAccess ? '/favorites' : '/login';
  const accountDestination = isAuthenticated ? (adminUser ? '/admin' : '/account') : '/login';
  const cartDestination = '/cart';

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedDesktopMenu = desktopAccountMenuRef.current?.contains(event.target);
      const clickedMobileMenu = mobileAccountMenuRef.current?.contains(event.target);

      if (!clickedDesktopMenu && !clickedMobileMenu) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const isActive = (key) => {
    const { pathname, hash } = location;

    if (key === 'home') {
      return pathname === '/';
    }

    if (key === 'products') {
      return pathname.startsWith('/products') && hash !== '#category-filter-panel';
    }

    if (key === 'categories') {
      return pathname.startsWith('/categories') || (pathname === '/products' && hash === '#category-filter-panel');
    }

    if (key === 'favorites') {
      return pathname.startsWith('/favorites');
    }

    if (key === 'cart') {
      return pathname.startsWith('/cart') || pathname.startsWith('/checkout');
    }

    if (key === 'account') {
      return pathname.startsWith('/account') || pathname.startsWith('/orders');
    }

    if (key === 'seller') {
      return pathname.startsWith('/seller');
    }

    if (key === 'admin') {
      return pathname.startsWith('/admin');
    }

    if (key === 'login') {
      return pathname.startsWith('/login') || pathname.startsWith('/register');
    }

    return false;
  };

  const desktopLinks = useMemo(() => {
    const items = [
      { key: 'home', to: '/', label: t('common.home') },
      { key: 'products', to: '/products', label: t('common.products') },
      { key: 'categories', to: '/products#category-filter-panel', label: t('common.categories') },
    ];

    if (sellerUser) {
      items.push({ key: 'seller', to: '/seller/dashboard', label: t('common.sellerPanel') });
    }

    if (adminUser) {
      items.push({ key: 'admin', to: '/admin', label: t('common.adminPanel') });
    }

    return items;
  }, [adminUser, sellerUser, t]);

  const mobileLinks = useMemo(() => {
    return [
      { key: 'home', to: '/', label: t('common.home'), icon: <HomeIcon /> },
      { key: 'products', to: '/products', label: t('common.products'), icon: <ProductsIcon /> },
      { key: 'categories', to: '/products#category-filter-panel', label: t('common.categories'), icon: <CategoriesIcon /> },
      { key: 'cart', to: cartDestination, label: t('common.cart'), icon: <CartIcon /> },
    ];
  }, [cartDestination, t]);

  const renderAccountMenu = () => (
    <div className="rounded-[1.45rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_24px_40px_rgba(138,129,124,0.16)]">
      <div className="border-b border-[var(--color-border-soft)] px-3 pb-3">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {user?.name || t('common.account')}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-faint)]">
          {user?.email || t('common.noEmail')}
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
              {t('common.accountProfile')}
            </Link>
            <Link
              to="/orders"
              onClick={() => setAccountOpen(false)}
              className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
            >
              {t('common.myPurchases')}
            </Link>
          </>
        ) : null}

        {sellerUser ? (
          <Link
            to="/seller/dashboard"
            onClick={() => setAccountOpen(false)}
            className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
          >
            {t('common.sellerWorkspace')}
          </Link>
        ) : null}

        {adminUser ? (
          <Link
            to="/admin"
            onClick={() => setAccountOpen(false)}
            className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
          >
            {t('common.adminWorkspace')}
          </Link>
        ) : null}
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-1 pt-3">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-[1rem] px-3 py-2 text-left text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[rgba(122,75,46,0.08)] hover:text-[var(--color-brand)]"
        >
          {t('common.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[rgba(244,243,238,0.96)] shadow-[0_12px_24px_rgba(138,129,124,0.08)] backdrop-blur-xl">
        <div className="page-container px-4 py-3 sm:px-5 lg:px-4 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="group min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="FLORA logo"
                  className="h-8 w-8 shrink-0 rounded-full object-contain ring-1 ring-[var(--color-border)]"
                />
                <div className="min-w-0">
                  <p className="font-display truncate text-[1.8rem] leading-none text-[var(--color-text)] sm:text-[2rem] lg:text-3xl">
                    FLORA
                  </p>
                  <p className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-brand)] sm:block">
                    {t('navbar.brandTagline')}
                  </p>
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:justify-between lg:gap-6">
              <nav className="flex flex-wrap items-center gap-2 xl:gap-3">
                {desktopLinks.map((item) => (
                  <DesktopNavLink
                    key={item.key}
                    to={item.to}
                    label={item.label}
                    active={isActive(item.key)}
                  />
                ))}
              </nav>

              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <IconActionLink to={favoritesDestination} label={t('common.favorites')} active={isActive('favorites')}>
                    <HeartIcon />
                  </IconActionLink>
                  <IconActionLink to={cartDestination} label={t('common.cart')} active={isActive('cart')}>
                    <CartIcon />
                  </IconActionLink>
                  <IconActionLink to={accountDestination} label={t('common.login')} active={isActive('login')}>
                    <UserIcon />
                  </IconActionLink>
                  <Link to="/register" className="btn-base btn-primary">
                    {t('common.register')}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <IconActionLink to={favoritesDestination} label={t('common.favorites')} active={isActive('favorites')}>
                    <HeartIcon />
                  </IconActionLink>
                  <IconActionLink to={cartDestination} label={t('common.cart')} active={isActive('cart')}>
                    <CartIcon />
                  </IconActionLink>

                  <div className="relative" ref={desktopAccountMenuRef}>
                    <button
                      type="button"
                      onClick={() => setAccountOpen((previous) => !previous)}
                      className={`flex h-11 items-center gap-3 rounded-full border px-4 transition-colors ${
                        accountOpen
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)] shadow-[0_10px_22px_rgba(122,75,46,0.18)]'
                          : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] text-[var(--color-brand)] hover:border-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.08)]'
                      }`}
                      aria-label={t('navbar.accountMenu')}
                      aria-expanded={accountOpen}
                    >
                      <UserIcon />
                      <span className="max-w-[10rem] truncate text-[0.76rem] font-semibold uppercase tracking-[0.16em]">
                        {user?.name || t('common.account')}
                      </span>
                    </button>

                    {accountOpen ? (
                      <div className={`absolute top-[calc(100%+0.75rem)] w-[18rem] ${isRTL ? 'left-0' : 'right-0'}`}>
                        {renderAccountMenu()}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSwitcher compact />
              <IconActionLink to={favoritesDestination} label={t('common.favorites')} active={isActive('favorites')}>
                <HeartIcon />
              </IconActionLink>
              <IconActionLink to={cartDestination} label={t('common.cart')} active={isActive('cart')}>
                <CartIcon />
              </IconActionLink>

              {isAuthenticated ? (
                <div className="relative" ref={mobileAccountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((previous) => !previous)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                      accountOpen
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-background)]'
                        : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] text-[var(--color-brand)]'
                    }`}
                    aria-label={t('navbar.accountMenu')}
                    aria-expanded={accountOpen}
                    title={t('common.account')}
                  >
                    <UserIcon />
                  </button>

                  {accountOpen ? (
                    <div className={`absolute top-[calc(100%+0.65rem)] w-[16.5rem] ${isRTL ? 'left-0' : 'right-0'}`}>
                      {renderAccountMenu()}
                    </div>
                  ) : null}
                </div>
              ) : (
                <IconActionLink to={accountDestination} label={t('common.login')} active={isActive('login')}>
                  <UserIcon />
                </IconActionLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[rgba(244,243,238,0.97)] px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_28px_rgba(138,129,124,0.1)] backdrop-blur-xl lg:hidden">
        <div
          className="mx-auto grid max-w-[34rem] gap-2 rounded-[1.35rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] p-2 shadow-[0_18px_30px_rgba(138,129,124,0.08)]"
          style={{ gridTemplateColumns: `repeat(${mobileLinks.length}, minmax(0, 1fr))` }}
        >
          {mobileLinks.map((item) => (
            <MobileNavLink key={item.key} to={item.to} label={item.label} active={isActive(item.key)}>
              {item.icon}
            </MobileNavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
