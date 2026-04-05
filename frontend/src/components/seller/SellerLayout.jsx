import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WorkspaceShell from '../workspace/WorkspaceShell';

const sellerLinks = [
  { to: '/seller/dashboard', label: 'Dashboard' },
  { to: '/seller/store', label: 'Store Management' },
  { to: '/seller/products', label: 'Products' },
  { to: '/seller/orders', label: 'Orders' },
  { to: '/seller/finance', label: 'Finance' },
  { to: '/seller/settings', label: 'Settings' },
];

const sectionDetails = {
  dashboard: {
    kicker: 'Seller Panel',
    title: 'Dashboard',
    description: 'A cleaner overview of performance, fulfillment, inventory health, and your next actions.',
  },
  store: {
    kicker: 'Store Management',
    title: 'Store Identity',
    description: 'Keep store information, media, and contact details grouped under one focused workspace section.',
  },
  products: {
    kicker: 'Products',
    title: 'Catalog Management',
    description: 'Stay inside product-only navigation while you browse listings, add new products, or edit an existing item.',
  },
  orders: {
    kicker: 'Orders',
    title: 'Order Management',
    description: 'Track fulfillment and status changes without mixing catalog or finance controls into the same navigation bar.',
  },
  finance: {
    kicker: 'Finance',
    title: 'Finance',
    description: 'Review balances and withdrawal requests through finance-specific navigation only.',
  },
  settings: {
    kicker: 'Settings',
    title: 'Account Settings',
    description: 'Profile, password, and preferences now live in their own dedicated context.',
  },
};

function WorkspaceSecondaryLink({ item, pathname, hash }) {
  if (item.type === 'anchor') {
    const [targetPathname, targetHash = ''] = item.to.split('#');
    const nextHash = targetHash ? `#${targetHash}` : '';
    const isActive =
      pathname === targetPathname &&
      (hash === nextHash || (!hash && item.defaultWhenHashMissing));

    return (
      <Link
        to={item.to}
        className={`workspace-secondary-link ${isActive ? 'workspace-secondary-link-active' : ''}`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `workspace-secondary-link ${isActive ? 'workspace-secondary-link-active' : ''}`
      }
    >
      {item.label}
    </NavLink>
  );
}

function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspaceSearch, setWorkspaceSearch] = useState('');

  const sectionKey = useMemo(() => {
    if (location.pathname.startsWith('/seller/store')) {
      return 'store';
    }

    if (location.pathname.startsWith('/seller/products')) {
      return 'products';
    }

    if (location.pathname.startsWith('/seller/orders')) {
      return 'orders';
    }

    if (location.pathname.startsWith('/seller/finance')) {
      return 'finance';
    }

    if (location.pathname.startsWith('/seller/settings')) {
      return 'settings';
    }

    return 'dashboard';
  }, [location.pathname]);

  const detail = sectionDetails[sectionKey];
  const approvalLabel = user?.seller_status
    ? `${user.seller_status.charAt(0).toUpperCase()}${user.seller_status.slice(1)}`
    : 'Seller';

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = workspaceSearch.trim();
    navigate(query ? `/seller/products?query=${encodeURIComponent(query)}` : '/seller/products');
  };

  const secondaryItems = useMemo(() => {
    if (sectionKey === 'products') {
      const items = [
        { label: 'Manage Products', to: '/seller/products', end: true },
        { label: 'Add Product', to: '/seller/products/add' },
      ];

      if (/^\/seller\/products\/[^/]+\/edit$/.test(location.pathname)) {
        items.push({ label: 'Edit Product', to: location.pathname });
      }

      return items;
    }

    if (sectionKey === 'orders') {
      const items = [
        { label: 'Orders Management', to: '/seller/orders', end: true },
      ];

      if (/^\/seller\/orders\/[^/]+$/.test(location.pathname)) {
        items.push({ label: 'Order Details', to: location.pathname });
      }

      return items;
    }

    if (sectionKey === 'finance') {
      return [
        { label: 'Finance Overview', to: '/seller/finance', end: true },
        { label: 'Withdraw Funds', to: '/seller/finance/withdraw' },
      ];
    }

    if (sectionKey === 'store') {
      return [
        { label: 'General Info', to: '/seller/store#general', type: 'anchor', defaultWhenHashMissing: true },
        { label: 'Media', to: '/seller/store#media', type: 'anchor' },
        { label: 'Contact Details', to: '/seller/store#contact', type: 'anchor' },
      ];
    }

    if (sectionKey === 'settings') {
      return [
        { label: 'Profile', to: '/seller/settings#profile', type: 'anchor', defaultWhenHashMissing: true },
        { label: 'Password', to: '/seller/settings#password', type: 'anchor' },
        { label: 'Preferences', to: '/seller/settings#preferences', type: 'anchor' },
      ];
    }

    return [];
  }, [location.pathname, sectionKey]);

  const topbarActions = (
    <>
      {sectionKey === 'products' ? (
        <>
          <form onSubmit={handleSearchSubmit} className="workspace-search">
            <input
              type="search"
              value={workspaceSearch}
              onChange={(event) => setWorkspaceSearch(event.target.value)}
              placeholder="Search products"
              className="text-input"
            />
          </form>

          <button
            type="button"
            onClick={() => navigate('/seller/products/add')}
            className="btn-base btn-primary"
          >
            Add Product
          </button>
        </>
      ) : null}

      {sectionKey === 'finance' && location.pathname === '/seller/finance' ? (
        <button
          type="button"
          onClick={() => navigate('/seller/finance/withdraw')}
          className="btn-base btn-primary"
        >
          Withdraw Funds
        </button>
      ) : null}

      {sectionKey === 'store' && user?.store?.id ? (
        <button
          type="button"
          onClick={() => navigate(`/stores/${user.store.id}`)}
          className="btn-base btn-outline"
        >
          View Storefront
        </button>
      ) : null}

      {sectionKey === 'dashboard' ? (
        <>
          <button
            type="button"
            onClick={() => navigate('/seller/products/add')}
            className="btn-base btn-primary"
          >
            Add Product
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller/orders')}
            className="btn-base btn-outline"
          >
            View Orders
          </button>
        </>
      ) : null}
    </>
  );

  return (
    <WorkspaceShell
      workspaceLabel="Seller Workspace"
      workspaceTitle={user?.store?.store_name || 'Your Studio'}
      workspaceDescription="A real seller panel with stable primary navigation on the left and context-specific controls only inside the active section."
      accountName={user?.name || 'Seller'}
      accountEmail={user?.email || 'No email'}
      accountStatus={approvalLabel}
      primaryLinks={sellerLinks}
      footerContent={(
        <>
          {user?.store?.id ? (
            <button
              type="button"
              onClick={() => navigate(`/stores/${user.store.id}`)}
              className="btn-base btn-outline w-full"
            >
              View Storefront
            </button>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="btn-base btn-secondary w-full"
          >
            Logout
          </button>
        </>
      )}
      topbarKicker={detail.kicker}
      topbarTitle={detail.title}
      topbarDescription={detail.description}
      topbarActions={topbarActions}
      secondaryNav={secondaryItems.length > 0 ? (
        <>
          {secondaryItems.map((item) => (
            <WorkspaceSecondaryLink
              key={item.to}
              item={item}
              pathname={location.pathname}
              hash={location.hash}
            />
          ))}
        </>
      ) : null}
    >
      <Outlet />
    </WorkspaceShell>
  );
}

export default SellerLayout;
