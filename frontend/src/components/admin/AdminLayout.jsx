import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import WorkspaceShell from '../workspace/WorkspaceShell';

function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const sectionKey = useMemo(() => {
    if (location.pathname.startsWith('/admin/categories')) {
      return 'categories';
    }

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

  const detail = {
    kicker: t(`adminLayout.sections.${sectionKey}.kicker`),
    title: t(`adminLayout.sections.${sectionKey}.title`),
    description: t(`adminLayout.sections.${sectionKey}.description`),
  };
  const adminLinks = [
    { to: '/admin', label: t('sellerLayout.primaryLinks.dashboard'), end: true },
    { to: '/admin/categories', label: t('common.categories') },
    { to: '/admin/users', label: t('adminLayout.sections.users.title') },
    { to: '/admin/sellers', label: t('adminLayout.sections.sellers.title') },
    { to: '/admin/products', label: t('common.products') },
    { to: '/admin/orders', label: t('common.orders') },
    { to: '/admin/reviews', label: t('common.reviews') },
    { to: '/admin/withdrawals', label: t('adminLayout.sections.withdrawals.title') },
  ];

  return (
    <WorkspaceShell
      workspaceLabel={t('common.adminWorkspace')}
      workspaceTitle={t('adminLayout.workspaceTitle')}
      workspaceDescription={t('adminLayout.workspaceDescription')}
      accountName={user?.name || t('common.roles.admin')}
      accountEmail={user?.email || t('common.noEmail')}
      accountStatus={t('common.roles.admin')}
      primaryLinks={adminLinks}
      footerContent={(
        <button
          type="button"
          onClick={logout}
          className="btn-base btn-secondary w-full"
        >
          {t('common.logout')}
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
