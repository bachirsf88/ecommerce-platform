import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WorkspaceShell from '../workspace/WorkspaceShell';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/sellers', label: 'Sellers' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/withdrawals', label: 'Withdrawals' },
];

const sectionDetails = {
  dashboard: {
    kicker: 'Administration',
    title: 'Dashboard',
    description: 'Track marketplace health, moderation queues, and recent operational signals from one business-focused control room.',
  },
  users: {
    kicker: 'Administration',
    title: 'Users Management',
    description: 'Review account growth, role distribution, and user-level details without mixing seller or order actions into the same section.',
  },
  sellers: {
    kicker: 'Moderation',
    title: 'Sellers Management',
    description: 'Handle approval decisions, inspect store details, and keep seller moderation in a dedicated workflow.',
  },
  products: {
    kicker: 'Catalog Control',
    title: 'Products Management',
    description: 'Monitor listing health, seller attribution, and activation status from one clean catalog workspace.',
  },
  orders: {
    kicker: 'Operations',
    title: 'Orders Management',
    description: 'Follow transaction volume, fulfillment states, and buyer activity without crossing into storefront editing flows.',
  },
  reviews: {
    kicker: 'Trust & Quality',
    title: 'Reviews Management',
    description: 'Moderate marketplace feedback and keep review oversight separate from product and order operations.',
  },
  withdrawals: {
    kicker: 'Finance Oversight',
    title: 'Withdrawal Requests',
    description: 'Review payout requests, approval decisions, and seller finance pressure points in one finance-focused section.',
  },
};

function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const sectionKey = useMemo(() => {
    if (location.pathname.startsWith('/admin/users')) {
      return 'users';
    }

    if (location.pathname.startsWith('/admin/sellers')) {
      return 'sellers';
    }

    if (location.pathname.startsWith('/admin/products')) {
      return 'products';
    }

    if (location.pathname.startsWith('/admin/orders')) {
      return 'orders';
    }

    if (location.pathname.startsWith('/admin/reviews')) {
      return 'reviews';
    }

    if (location.pathname.startsWith('/admin/withdrawals')) {
      return 'withdrawals';
    }

    return 'dashboard';
  }, [location.pathname]);

  const detail = sectionDetails[sectionKey];

  return (
    <WorkspaceShell
      workspaceLabel="Admin Workspace"
      workspaceTitle="Marketplace Control"
      workspaceDescription="A separate operational workspace for admin-only management, moderation, and reporting across the marketplace."
      accountName={user?.name || 'Admin'}
      accountEmail={user?.email || 'No email'}
      accountStatus="Admin"
      primaryLinks={adminLinks}
      footerContent={(
        <button
          type="button"
          onClick={logout}
          className="btn-base btn-secondary w-full"
        >
          Logout
        </button>
      )}
      topbarKicker={detail.kicker}
      topbarTitle={detail.title}
      topbarDescription={detail.description}
    >
      <Outlet />
    </WorkspaceShell>
  );
}

export default AdminLayout;
