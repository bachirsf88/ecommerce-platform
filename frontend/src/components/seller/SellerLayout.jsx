import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import WorkspaceShell from '../workspace/WorkspaceShell';

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
  const { t } = useTranslation();
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

  const detail = {
    kicker: t(`sellerLayout.sections.${sectionKey}.kicker`),
    title: t(`sellerLayout.sections.${sectionKey}.title`),
    description: t(`sellerLayout.sections.${sectionKey}.description`),
  };
  const approvalLabel = user?.seller_status
    ? t(`common.status.${user.seller_status}`)
    : t('common.roles.seller');
  const sellerLinks = [
    { to: '/seller/dashboard', label: t('sellerLayout.primaryLinks.dashboard') },
    { to: '/seller/store', label: t('sellerLayout.primaryLinks.store') },
    { to: '/seller/products', label: t('sellerLayout.primaryLinks.products') },
    { to: '/seller/orders', label: t('sellerLayout.primaryLinks.orders') },
    { to: '/seller/finance', label: t('sellerLayout.primaryLinks.finance') },
    { to: '/seller/settings', label: t('sellerLayout.primaryLinks.settings') },
  ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = workspaceSearch.trim();
    navigate(query ? `/seller/products?query=${encodeURIComponent(query)}` : '/seller/products');
  };

  const secondaryItems = useMemo(() => {
    if (sectionKey === 'products') {
      const items = [
        { label: t('sellerLayout.secondaryLinks.manageProducts'), to: '/seller/products', end: true },
        { label: t('sellerLayout.secondaryLinks.addProduct'), to: '/seller/products/add' },
      ];

      if (/^\/seller\/products\/[^/]+\/edit$/.test(location.pathname)) {
        items.push({ label: t('sellerLayout.secondaryLinks.editProduct'), to: location.pathname });
      }

      return items;
    }

    if (sectionKey === 'orders') {
      const items = [
        { label: t('sellerLayout.secondaryLinks.ordersManagement'), to: '/seller/orders', end: true },
      ];

      if (/^\/seller\/orders\/[^/]+$/.test(location.pathname)) {
        items.push({ label: t('sellerLayout.secondaryLinks.orderDetails'), to: location.pathname });
      }

      return items;
    }

    if (sectionKey === 'finance') {
      return [
        { label: t('sellerLayout.secondaryLinks.financeOverview'), to: '/seller/finance', end: true },
        { label: t('sellerLayout.secondaryLinks.withdrawFunds'), to: '/seller/finance/withdraw' },
      ];
    }

    if (sectionKey === 'store') {
      return [
        { label: t('sellerLayout.secondaryLinks.generalInfo'), to: '/seller/store#general', type: 'anchor', defaultWhenHashMissing: true },
        { label: t('sellerLayout.secondaryLinks.media'), to: '/seller/store#media', type: 'anchor' },
        { label: t('sellerLayout.secondaryLinks.contactDetails'), to: '/seller/store#contact', type: 'anchor' },
      ];
    }

    if (sectionKey === 'settings') {
      return [
        { label: t('sellerLayout.secondaryLinks.profile'), to: '/seller/settings#profile', type: 'anchor', defaultWhenHashMissing: true },
        { label: t('sellerLayout.secondaryLinks.password'), to: '/seller/settings#password', type: 'anchor' },
        { label: t('sellerLayout.secondaryLinks.preferences'), to: '/seller/settings#preferences', type: 'anchor' },
      ];
    }

    return [];
  }, [location.pathname, sectionKey, t]);

  const topbarActions = (
    <>
      {sectionKey === 'products' ? (
        <>
          <form onSubmit={handleSearchSubmit} className="workspace-search">
            <input
              type="search"
              value={workspaceSearch}
              onChange={(event) => setWorkspaceSearch(event.target.value)}
              placeholder={t('sellerLayout.searchPlaceholder')}
              className="text-input"
            />
          </form>

          <button
            type="button"
            onClick={() => navigate('/seller/products/add')}
            className="btn-base btn-primary"
          >
            {t('common.addProduct')}
          </button>
        </>
      ) : null}

      {sectionKey === 'finance' && location.pathname === '/seller/finance' ? (
        <button
          type="button"
          onClick={() => navigate('/seller/finance/withdraw')}
          className="btn-base btn-primary"
        >
          {t('sellerLayout.withdrawFunds')}
        </button>
      ) : null}

      {sectionKey === 'store' && user?.store?.id ? (
        <button
          type="button"
          onClick={() => navigate(`/stores/${user.store.id}`)}
          className="btn-base btn-outline"
        >
          {t('sellerLayout.viewStorefront')}
        </button>
      ) : null}

      {sectionKey === 'dashboard' ? (
        <>
          <button
            type="button"
            onClick={() => navigate('/seller/products/add')}
            className="btn-base btn-primary"
          >
            {t('common.addProduct')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller/orders')}
            className="btn-base btn-outline"
          >
            {t('common.viewOrders')}
          </button>
        </>
      ) : null}
    </>
  );

  return (
    <WorkspaceShell
      workspaceLabel={t('common.sellerWorkspace')}
      workspaceTitle={user?.store?.store_name || t('sellerLayout.workspaceTitleFallback')}
      workspaceDescription={t('sellerLayout.workspaceDescription')}
      accountName={user?.name || t('common.roles.seller')}
      accountEmail={user?.email || t('common.noEmail')}
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
              {t('sellerLayout.viewStorefront')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="btn-base btn-secondary w-full"
          >
            {t('common.logout')}
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
