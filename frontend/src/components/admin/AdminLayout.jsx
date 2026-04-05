import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WorkspaceShell from '../workspace/WorkspaceShell';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/sellers', label: 'Sellers' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <WorkspaceShell
      workspaceLabel="Admin Workspace"
      workspaceTitle="Marketplace Control"
      workspaceDescription="A quieter control room for reviewing marketplace activity without spilling unrelated navigation into every page."
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
      topbarKicker="Administration"
      topbarTitle="Admin Panel"
      topbarDescription="Use the left navigation for the main areas. Each page now stays focused on its own operational context."
    >
      <Outlet />
    </WorkspaceShell>
  );
}

export default AdminLayout;
